import React, { useEffect, useMemo, useRef } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

export interface ConfettiBurstProps {
  visible: boolean;
  durationMs?: number;
  onAnimationEnd?: () => void;
}

type ParticleShape = 'rect' | 'ribbon' | 'circle' | 'diamond';

interface ParticleSpec {
  id: number;
  color: string;
  shape: ParticleShape;
  width: number;
  height: number;
  delay: number;
  lifetime: number;
  originX: number;
  originY: number;
  inputRange: number[];
  xOutput: number[];
  yOutput: number[];
  rotateOutput: string[];
  scaleYOutput: number[];
}

const CONFETTI_PALETTE = [
  '#FF6B8B',
  '#E02475',
  '#00C2CB',
  '#1A82FF',
  '#FFD700',
  '#F89B18',
  '#8B5CF6',
  '#0C790C',
] as const;

const PARTICLE_COUNT = 48;
const KEYFRAME_COUNT = 16;
const DEFAULT_DURATION_MS = 2000;
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function getDimensionsForShape(shape: ParticleShape, scale: number): { width: number; height: number } {
  switch (shape) {
    case 'ribbon':
      return { width: Math.round(5 * scale), height: Math.round(14 * scale) };
    case 'circle':
      return { width: Math.round(8 * scale), height: Math.round(8 * scale) };
    case 'diamond':
      return { width: Math.round(8 * scale), height: Math.round(8 * scale) };
    case 'rect':
    default:
      return { width: Math.round(9 * scale), height: Math.round(6 * scale) };
  }
}

function buildParticles(width: number, height: number, durationMs: number): ParticleSpec[] {
  const rand = createSeededRandom(20261114);
  const shapes: ParticleShape[] = ['rect', 'ribbon', 'circle', 'diamond'];
  const effectiveHeight = Math.max(height, 640);
  const horizScale = Math.min(Math.max(width / 390, 0.85), 1.35);

  const inputRange: number[] = [];
  for (let s = 0; s <= KEYFRAME_COUNT; s++) {
    inputRange.push(s / KEYFRAME_COUNT);
  }

  const gravity = 760;
  const dragX = 2.65;
  const dragY = 1.85;
  const terminalVelocity = 140;
  const durationBudget = Math.max(durationMs - 140, 900);

  const particles: ParticleSpec[] = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const shape = shapes[i % shapes.length];
    const isLeftCannon = i % 2 === 0;
    const baseAngleDeg = isLeftCannon ? 72 : 108;
    const angleDeg = baseAngleDeg + (rand() - 0.5) * 36;
    const angleRad = (angleDeg * Math.PI) / 180;

    const speed = effectiveHeight * (1.75 + rand() * 0.85);
    let vx = Math.cos(angleRad) * speed * horizScale;
    let vy = -Math.sin(angleRad) * speed;

    const originX = isLeftCannon ? width * (0.04 + rand() * 0.06) : width * (0.9 + rand() * 0.06);
    const originY = height * (0.8 + rand() * 0.07);

    const delay = isLeftCannon ? Math.round(rand() * 45) : Math.round(60 + rand() * 60);
    const minLife = Math.round(durationBudget * 0.76);
    const maxLife = Math.max(minLife + 120, durationMs - delay - 30);
    const lifetime = Math.round(minLife + rand() * (maxLife - minLife));
    const lifetimeSec = lifetime / 1000;

    const swayAmp = 10 + rand() * 14;
    const swayFreq = 1.4 + rand() * 1.4;
    const swayPhase = rand() * Math.PI * 2;

    const startRot = Math.round((rand() - 0.5) * 90) + (shape === 'diamond' ? 45 : 0);
    const spinDelta = Math.round((rand() > 0.5 ? 1 : -1) * (360 + rand() * 380));
    const flutterCycles = 2 + Math.floor(rand() * 2);

    const subSteps = KEYFRAME_COUNT * 2;
    const dt = lifetimeSec / subSteps;

    let px = originX;
    let py = originY;

    const xOutput: number[] = [];
    const yOutput: number[] = [];
    const rotateOutput: string[] = [];
    const scaleYOutput: number[] = [];

    for (let step = 0; step <= subSteps; step++) {
      if (step % 2 === 0) {
        const u = step / subSteps;
        const tSec = u * lifetimeSec;
        const swayOffset = swayAmp * Math.sin(swayPhase + tSec * swayFreq * Math.PI * 2) * u;
        xOutput.push(Math.round((px + swayOffset) * 10) / 10);
        yOutput.push(Math.round(py * 10) / 10);
        rotateOutput.push(`${Math.round(startRot + spinDelta * u)}deg`);
        const flutter = 0.22 + 0.78 * Math.abs(Math.cos((u * flutterCycles + swayPhase * 0.15) * Math.PI));
        scaleYOutput.push(Math.round(flutter * 100) / 100);
      }

      if (step < subSteps) {
        vx *= Math.exp(-dragX * dt);
        vy = vy * Math.exp(-dragY * dt) + gravity * dt;
        if (vy > terminalVelocity) {
          vy = terminalVelocity;
        }
        px += vx * dt;
        py += vy * dt;
      }
    }

    const sizeScale = 0.85 + rand() * 0.45;
    const dims = getDimensionsForShape(shape, sizeScale);

    particles.push({
      id: i,
      color: CONFETTI_PALETTE[i % CONFETTI_PALETTE.length],
      shape,
      width: dims.width,
      height: dims.height,
      delay,
      lifetime,
      originX,
      originY,
      inputRange,
      xOutput,
      yOutput,
      rotateOutput,
      scaleYOutput,
    });
  }

  return particles;
}

/**
 * Lightweight, non-blocking confetti burst overlay for quick celebratory arrivals (~2s).
 */
export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({
  visible,
  durationMs = DEFAULT_DURATION_MS,
  onAnimationEnd,
}) => {
  const { width, height } = useWindowDimensions();

  const particles = useMemo(
    () => buildParticles(width, height, durationMs),
    [width, height, durationMs]
  );

  const progressValues = useMemo(
    () => particles.map(() => new Animated.Value(0)),
    [particles]
  );

  const onEndRef = useRef(onAnimationEnd);
  onEndRef.current = onAnimationEnd;

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;
    let activeComposite: Animated.CompositeAnimation | null = null;
    const timers: Array<ReturnType<typeof setTimeout>> = [];

    const startBurst = async () => {
      try {
        const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
        if (cancelled) return;
        if (reduceMotion) {
          const skipTimer = setTimeout(() => {
            if (!cancelled) onEndRef.current?.();
          }, 50);
          timers.push(skipTimer);
          return;
        }
      } catch {
        // Proceed if accessibility query is unavailable.
      }

      if (cancelled) return;

      progressValues.forEach((val) => val.setValue(0));

      const animations = particles.map((p, idx) =>
        Animated.timing(progressValues[idx], {
          toValue: 1,
          duration: p.lifetime,
          delay: p.delay,
          easing: Easing.linear,
          useNativeDriver: USE_NATIVE_DRIVER,
        })
      );

      activeComposite = Animated.parallel(animations);
      activeComposite.start();

      const endTimer = setTimeout(() => {
        if (!cancelled) {
          onEndRef.current?.();
        }
      }, durationMs);
      timers.push(endTimer);
    };

    startBurst();

    return () => {
      cancelled = true;
      activeComposite?.stop();
      timers.forEach((t) => clearTimeout(t));
    };
  }, [visible, durationMs, particles, progressValues]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="none">
      {particles.map((particle, index) => {
        const progress = progressValues[index];

        const translateX = progress.interpolate({
          inputRange: particle.inputRange,
          outputRange: particle.xOutput,
        });
        const translateY = progress.interpolate({
          inputRange: particle.inputRange,
          outputRange: particle.yOutput,
        });
        const rotate = progress.interpolate({
          inputRange: particle.inputRange,
          outputRange: particle.rotateOutput,
        });
        const scaleY = progress.interpolate({
          inputRange: particle.inputRange,
          outputRange: particle.scaleYOutput,
        });
        const opacity = progress.interpolate({
          inputRange: [0, 0.03, 0.68, 0.85, 1],
          outputRange: [0, 1, 1, 0.65, 0],
        });

        const borderRadius =
          particle.shape === 'circle'
            ? particle.width / 2
            : particle.shape === 'diamond'
              ? 1.5
              : 2;

        return (
          <Animated.View
            key={particle.id}
            style={[
              styles.particle,
              {
                width: particle.width,
                height: particle.height,
                backgroundColor: particle.color,
                borderRadius,
                opacity,
                transform: [
                  { translateX },
                  { translateY },
                  { rotate },
                  { scaleY },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    zIndex: 9995,
    elevation: 35,
  },
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default ConfettiBurst;
