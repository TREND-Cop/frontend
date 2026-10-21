import React, { useEffect, useRef, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { CELEBRATION_CONFIG } from '../../constants/celebration.config';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConfettiBurstProps {
  visible: boolean;
  leftOrigin?: { x: number; y: number };
  rightOrigin?: { x: number; y: number };
  onAnimationEnd?: () => void;
  isExiting?: boolean;
}

type ConfettiShape = 'rect' | 'circle' | 'ribbon' | 'sparkle';

interface TrajectorySample {
  timeProgress: number; // 0 to 1
  x: number;
  y: number;
}

interface ParticleModel {
  id: number;
  cannon: 'left' | 'right' | 'top';
  fireDelay: number;
  color: string;
  shape: ConfettiShape;
  size: number;
  lifetime: number;
  inputRanges: number[];
  xOutputRanges: number[];
  yOutputRanges: number[];
  opacityInputRanges: number[];
  opacityOutputRanges: number[];
  rotateOutputRanges: string[];
  scaleYOutputRanges: number[];
  animProgress: Animated.Value;
}

/**
 * Precomputes a physically realistic ballistic trajectory for cannon blast:
 * - Launch from bottom cannon up and inward across the full page
 * - Horizontal drag deceleration so particles bloom across the width
 * - Air drag deceleration during ascent
 * - Peak apex pause / float
 * - Gentle terminal velocity descent (floating paper rather than heavy rock drop)
 * - Sinusoidal air drift sway
 */
function precomputeTrajectory(
  originX: number,
  originY: number,
  angleDeg: number,
  initialSpeed: number,
  lifetimeSec: number,
  swayAmp: number,
  swayFreq: number,
  swayPhase: number
) {
  const steps = 10;
  const inputRanges: number[] = [];
  const xOutputRanges: number[] = [];
  const yOutputRanges: number[] = [];
  const rotateOutputRanges: string[] = [];
  const scaleYOutputRanges: number[] = [];

  const rad = (angleDeg * Math.PI) / 180;
  // Upward is negative Y in screen coordinates
  let vx = initialSpeed * Math.cos(rad);
  let vy = -initialSpeed * Math.sin(rad);

  let currentX = originX;
  let currentY = originY;

  const dt = lifetimeSec / steps;
  const gravity = CELEBRATION_CONFIG.gravity;
  const vDragPerSec = CELEBRATION_CONFIG.airDragCoefficient;
  const hDragPerSec = CELEBRATION_CONFIG.horizontalDragCoefficient;
  const terminalV = CELEBRATION_CONFIG.terminalVelocity;

  for (let s = 0; s <= steps; s++) {
    const t = s * dt;
    const progress = s / steps;
    inputRanges.push(progress);

    if (s > 0) {
      // Horizontal drag decelerates lateral spread so particles stay within screen and don't bunch at borders
      vx *= Math.pow(hDragPerSec, dt);

      // Upward phase decelerates with air drag + gravity;
      // Downward phase approaches gentle terminal velocity (floating paper)
      if (vy < 0) {
        vy *= Math.pow(vDragPerSec, dt);
        vy += gravity * dt;
      } else {
        vy = Math.min(terminalV, vy + gravity * dt * 0.15);
      }

      currentX += vx * dt;
      currentY += vy * dt;
    }

    // Add gentle lateral air drift sway
    const sway = Math.sin(2 * Math.PI * swayFreq * t + swayPhase) * swayAmp * (s / steps);
    const clampedX = Math.max(8, Math.min(SCREEN_WIDTH - 8, currentX + sway));

    xOutputRanges.push(clampedX);
    yOutputRanges.push(currentY);

    // Z Rotation
    rotateOutputRanges.push(`${(s * 140 + swayPhase * 60).toFixed(0)}deg`);

    // 3D paper tumbling flip (scaleY oscillation)
    const flip = 0.2 + 0.8 * Math.abs(Math.cos(s * Math.PI * 1.5));
    scaleYOutputRanges.push(Number(flip.toFixed(2)));
  }

  // Opacity: fade in quickly over first 6%, stay opaque, then fade out smoothly over the last 25% of life
  const opacityInputRanges = [0, 0.06, 0.75, 1];
  const opacityOutputRanges = [0, 0.95, 0.95, 0];

  return {
    inputRanges,
    xOutputRanges,
    yOutputRanges,
    opacityInputRanges,
    opacityOutputRanges,
    rotateOutputRanges,
    scaleYOutputRanges,
  };
}

/**
 * Precomputes a gentle downward drift for small confetti falling from the top of the screen
 * - Spawns above viewport (Y = -20)
 * - Drifts down with soft lateral fluttering sway
 * - Fades in cleanly upon entering, floats down, and fades out
 */
function precomputeTopDriftTrajectory(
  startX: number,
  startY: number,
  fallSpeed: number,
  lifetimeSec: number,
  swayAmp: number,
  swayFreq: number,
  swayPhase: number
) {
  const steps = 10;
  const inputRanges: number[] = [];
  const xOutputRanges: number[] = [];
  const yOutputRanges: number[] = [];
  const rotateOutputRanges: string[] = [];
  const scaleYOutputRanges: number[] = [];

  const dt = lifetimeSec / steps;
  let currentY = startY;

  for (let s = 0; s <= steps; s++) {
    const t = s * dt;
    const progress = s / steps;
    inputRanges.push(progress);

    if (s > 0) {
      currentY += fallSpeed * dt;
    }

    // Soft fluttering sway across the screen
    const sway = Math.sin(2 * Math.PI * swayFreq * t + swayPhase) * swayAmp;
    const clampedX = Math.max(12, Math.min(SCREEN_WIDTH - 12, startX + sway));

    xOutputRanges.push(clampedX);
    yOutputRanges.push(currentY);

    // Continuous tumbling rotation
    rotateOutputRanges.push(`${(s * 120 + swayPhase * 50).toFixed(0)}deg`);

    // 3D paper tumbling flip
    const flip = 0.25 + 0.75 * Math.abs(Math.cos(s * Math.PI * 1.6));
    scaleYOutputRanges.push(Number(flip.toFixed(2)));
  }

  // Opacity: fade in smoothly as it enters from top, stay visible, fade out softly at the end
  const opacityInputRanges = [0, 0.12, 0.75, 1];
  const opacityOutputRanges = [0, 0.9, 0.9, 0];

  return {
    inputRanges,
    xOutputRanges,
    yOutputRanges,
    opacityInputRanges,
    opacityOutputRanges,
    rotateOutputRanges,
    scaleYOutputRanges,
  };
}

export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({
  visible,
  leftOrigin,
  rightOrigin,
  onAnimationEnd,
  isExiting = false,
}) => {
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const isMountedRef = useRef(true);
  const onAnimationEndRef = useRef(onAnimationEnd);
  onAnimationEndRef.current = onAnimationEnd;

  // Compute canonical cannon origins if not supplied (anchored at tab bar ends)
  const leftX = leftOrigin?.x ?? Math.max(28, (SCREEN_WIDTH - 300) / 2 + 16);
  const leftY = leftOrigin?.y ?? SCREEN_HEIGHT - 60;
  const rightX = rightOrigin?.x ?? Math.min(SCREEN_WIDTH - 28, (SCREEN_WIDTH + 300) / 2 - 16);
  const rightY = rightOrigin?.y ?? SCREEN_HEIGHT - 60;

  // Precompute all particles (72 cannon burst + 16 post-burst top drift) with deterministic physics
  const particles = useMemo<ParticleModel[]>(() => {
    const list: ParticleModel[] = [];
    const shapes: ConfettiShape[] = ['rect', 'circle', 'ribbon', 'sparkle'];
    const palette = CELEBRATION_CONFIG.palette;
    const totalBurst = CELEBRATION_CONFIG.particleCount;

    // 1. Full-screen Cannon Burst particles (shoots from bottom poppers across the entire page behind card)
    for (let i = 0; i < totalBurst; i++) {
      const isLeft = i % 2 === 0;
      const cannon = isLeft ? 'left' : 'right';
      const originX = isLeft ? leftX : rightX;
      const originY = isLeft ? leftY : rightY;

      // Base angle with spread:
      // Left cannon: 76° ± 16°
      // Right cannon: 104° ± 16°
      const baseAngle = isLeft
        ? CELEBRATION_CONFIG.leftCannonAngleDeg
        : CELEBRATION_CONFIG.rightCannonAngleDeg;
      const spread = ((((i * 17) % 32) - 16) * CELEBRATION_CONFIG.angleSpreadDeg) / 16;
      const angle = baseAngle + spread;

      // Initial speed (1.15 to 1.55 screen heights per second)
      const speedMult =
        CELEBRATION_CONFIG.minVelocityMult +
        ((i % 7) / 6) *
          (CELEBRATION_CONFIG.maxVelocityMult - CELEBRATION_CONFIG.minVelocityMult);
      const initialSpeed = SCREEN_HEIGHT * speedMult;

      // Lifetime (2.6s to 3.5s)
      const lifetime =
        CELEBRATION_CONFIG.minLifetime +
        ((i % 5) / 4) *
          (CELEBRATION_CONFIG.maxLifetime - CELEBRATION_CONFIG.minLifetime);
      const lifetimeSec = lifetime / 1000;

      // Horizontal sway
      const swayAmp =
        CELEBRATION_CONFIG.minSwayAmp +
        ((i % 6) / 5) *
          (CELEBRATION_CONFIG.maxSwayAmp - CELEBRATION_CONFIG.minSwayAmp);
      const swayFreq =
        CELEBRATION_CONFIG.minSwayFreq +
        ((i % 4) / 3) *
          (CELEBRATION_CONFIG.maxSwayFreq - CELEBRATION_CONFIG.minSwayFreq);
      const swayPhase = (i * 0.7) % (2 * Math.PI);

      const trajectory = precomputeTrajectory(
        originX,
        originY,
        angle,
        initialSpeed,
        lifetimeSec,
        swayAmp,
        swayFreq,
        swayPhase
      );

      const color = palette[i % palette.length];
      const shape = shapes[i % shapes.length];
      const size = 7 + (i % 5) * 1.5; // 7px to 13px

      // Cannon fire stagger: left at 150ms, right at 270ms
      const cannonBaseTime = isLeft
        ? CELEBRATION_CONFIG.leftPopperTime
        : CELEBRATION_CONFIG.rightPopperTime;
      // Micro-spread across burst blast (0 to 60ms)
      const fireDelay = cannonBaseTime + ((i * 3) % 60);

      list.push({
        id: i,
        cannon,
        fireDelay,
        color,
        shape,
        size,
        lifetime,
        inputRanges: trajectory.inputRanges,
        xOutputRanges: trajectory.xOutputRanges,
        yOutputRanges: trajectory.yOutputRanges,
        opacityInputRanges: trajectory.opacityInputRanges,
        opacityOutputRanges: trajectory.opacityOutputRanges,
        rotateOutputRanges: trajectory.rotateOutputRanges,
        scaleYOutputRanges: trajectory.scaleYOutputRanges,
        animProgress: new Animated.Value(0),
      });
    }

    // 2. Post-Burst Top Drift (a little bit of small confetti gently falling from the top)
    const topCount = CELEBRATION_CONFIG.topDriftCount;
    for (let k = 0; k < topCount; k++) {
      // Disperse across the top width: 10% to 90% of screen width with slight pseudo-random jitter
      const normalizedX = 0.10 + (k / (topCount - 1 || 1)) * 0.80;
      const jitter = ((k * 13) % 20) - 10;
      const startX = Math.max(16, Math.min(SCREEN_WIDTH - 16, normalizedX * SCREEN_WIDTH + jitter));
      const startY = -20;

      const fallSpeed =
        CELEBRATION_CONFIG.topDriftMinSpeed +
        ((k % 5) / 4) *
          (CELEBRATION_CONFIG.topDriftMaxSpeed - CELEBRATION_CONFIG.topDriftMinSpeed);

      const lifetime =
        CELEBRATION_CONFIG.topDriftMinLifetime +
        ((k % 4) / 3) *
          (CELEBRATION_CONFIG.topDriftMaxLifetime - CELEBRATION_CONFIG.topDriftMinLifetime);
      const lifetimeSec = lifetime / 1000;

      const swayAmp = 12 + ((k * 7) % 12); // 12px to 23px
      const swayFreq = 1.4 + ((k * 3) % 8) * 0.15; // 1.4Hz to 2.45Hz
      const swayPhase = (k * 1.1) % (2 * Math.PI);

      const trajectory = precomputeTopDriftTrajectory(
        startX,
        startY,
        fallSpeed,
        lifetimeSec,
        swayAmp,
        swayFreq,
        swayPhase
      );

      const color = palette[(k + 3) % palette.length];
      const shape = shapes[k % shapes.length];
      // Small size: 4.5px to 6.5px ("a little bit of small confetti")
      const size =
        CELEBRATION_CONFIG.topDriftMinSize +
        ((k % 4) / 3) *
          (CELEBRATION_CONFIG.topDriftMaxSize - CELEBRATION_CONFIG.topDriftMinSize);

      // Staggered arrival after the burst: start at topDriftStartTime (1100ms) + stagger
      const fireDelay = CELEBRATION_CONFIG.topDriftStartTime + k * 45;

      list.push({
        id: 1000 + k,
        cannon: 'top',
        fireDelay,
        color,
        shape,
        size,
        lifetime,
        inputRanges: trajectory.inputRanges,
        xOutputRanges: trajectory.xOutputRanges,
        yOutputRanges: trajectory.yOutputRanges,
        opacityInputRanges: trajectory.opacityInputRanges,
        opacityOutputRanges: trajectory.opacityOutputRanges,
        rotateOutputRanges: trajectory.rotateOutputRanges,
        scaleYOutputRanges: trajectory.scaleYOutputRanges,
        animProgress: new Animated.Value(0),
      });
    }

    return list;
  }, [leftX, leftY, rightX, rightY]);

  // Orchestrated Single-Pass Execution: No loops, no respawns
  useEffect(() => {
    if (!visible) return;
    isMountedRef.current = true;
    exitOpacity.setValue(1);

    const activeTimers: NodeJS.Timeout[] = [];
    const activeAnimations: Animated.CompositeAnimation[] = [];

    particles.forEach((p) => {
      p.animProgress.setValue(0);
      const timer = setTimeout(() => {
        if (!isMountedRef.current) return;
        const anim = Animated.timing(p.animProgress, {
          toValue: 1,
          duration: p.lifetime,
          easing: Easing.linear,
          useNativeDriver: Platform.OS !== 'web',
        });
        activeAnimations.push(anim);
        anim.start();
      }, p.fireDelay);
      activeTimers.push(timer);
    });

    // Sequence end timer: triggers cleanup when the last particle has landed
    const maxEnd = Math.max(
      ...particles.map((p) => p.fireDelay + p.lifetime)
    );
    const endTimer = setTimeout(() => {
      if (isMountedRef.current) {
        onAnimationEndRef.current?.();
      }
    }, maxEnd + 100);
    activeTimers.push(endTimer);

    return () => {
      isMountedRef.current = false;
      activeTimers.forEach(clearTimeout);
      activeAnimations.forEach((a) => a.stop());
    };
  }, [visible, particles, exitOpacity]);

  // Exit trigger when user taps 'Get started'
  useEffect(() => {
    if (isExiting) {
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: CELEBRATION_CONFIG.confettiExitDuration,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  }, [isExiting, exitOpacity]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, { opacity: exitOpacity }]}
    >
      {particles.map((p) => {
        const translateX = p.animProgress.interpolate({
          inputRange: p.inputRanges,
          outputRange: p.xOutputRanges,
        });

        const translateY = p.animProgress.interpolate({
          inputRange: p.inputRanges,
          outputRange: p.yOutputRanges,
        });

        const rotate = p.animProgress.interpolate({
          inputRange: p.inputRanges,
          outputRange: p.rotateOutputRanges,
        });

        const scaleY = p.animProgress.interpolate({
          inputRange: p.inputRanges,
          outputRange: p.scaleYOutputRanges,
        });

        const opacity = p.animProgress.interpolate({
          inputRange: p.opacityInputRanges,
          outputRange: p.opacityOutputRanges,
        });

        return (
          <Animated.View
            key={`confetti-${p.cannon}-${p.id}`}
            style={[
              styles.particleWrapper,
              {
                opacity,
                transform: [
                  { translateX },
                  { translateY },
                  { rotate },
                  { scaleY },
                ],
              },
            ]}
          >
            {p.shape === 'circle' ? (
              <View
                style={{
                  width: p.size,
                  height: p.size,
                  borderRadius: p.size / 2,
                  backgroundColor: p.color,
                }}
              />
            ) : p.shape === 'ribbon' ? (
              <View
                style={{
                  width: p.size * 2.2,
                  height: p.size * 0.45,
                  borderRadius: 2,
                  backgroundColor: p.color,
                }}
              />
            ) : p.shape === 'sparkle' ? (
              <View
                style={{
                  width: p.size * 1.1,
                  height: p.size * 1.1,
                  transform: [{ rotate: '45deg' }],
                  backgroundColor: p.color,
                  borderRadius: 1,
                }}
              />
            ) : (
              <View
                style={{
                  width: p.size,
                  height: p.size * 1.3,
                  borderRadius: 1.5,
                  backgroundColor: p.color,
                }}
              />
            )}
          </Animated.View>
        );
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 9995,
    elevation: 35,
  },
  particleWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default ConfettiBurst;
