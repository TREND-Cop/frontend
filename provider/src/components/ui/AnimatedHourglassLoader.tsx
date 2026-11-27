import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';

const HOURGLASS_IMAGE = require('../../../assets/images/appointments/verifying_hourglass.png');

// Source PNG intrinsic dimensions (176x200, hourglass centered at 88, 100)
const SRC_W = 176;
const SRC_H = 200;

const SAND_COLORS = ['#F4C430', '#20A4A6', '#EB5E55', '#47B869'];
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

interface AnimatedHourglassLoaderProps {
  width: number;
  height: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Active Loading Hourglass Illustration
 * - Continuous lively 180° -> 360° overturn animation cycle (1.8s loop)
 * - Tactile spring scale lift during flips
 * - Cascading colorful sand grains through the glass neck
 * - Clean white background matching Figma canvas (0 artificial halo circle)
 */
export function AnimatedHourglassLoader({
  width,
  height,
  style,
}: AnimatedHourglassLoaderProps) {
  const rotateProgress = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const sandVisibility = useRef(new Animated.Value(1)).current;

  // 4 staggered falling sand beads
  const grain0 = useRef(new Animated.Value(0)).current;
  const grain1 = useRef(new Animated.Value(0)).current;
  const grain2 = useRef(new Animated.Value(0)).current;
  const grain3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Lively Continuous Loading Flip Cycle:
    //    Trickle upright (400ms) -> Flip 180° (500ms) -> Trickle inverted (400ms) -> Flip 360° (500ms)
    const flipCycle = Animated.loop(
      Animated.sequence([
        // Phase A: Upright sand trickling (400ms)
        Animated.parallel([
          Animated.timing(sandVisibility, {
            toValue: 1,
            duration: 100,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(rotateProgress, {
            toValue: 0,
            duration: 400,
            easing: Easing.linear,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),

        // Phase B: Smooth 180° overturn flip + spring scale lift (500ms)
        Animated.parallel([
          Animated.timing(rotateProgress, {
            toValue: 0.5,
            duration: 500,
            easing: Easing.inOut(Easing.back(1.15)),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.08,
              duration: 250,
              easing: Easing.out(Easing.quad),
              useNativeDriver: USE_NATIVE_DRIVER,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 250,
              easing: Easing.in(Easing.quad),
              useNativeDriver: USE_NATIVE_DRIVER,
            }),
          ]),
        ]),

        // Phase C: Inverted sand trickling (400ms)
        Animated.parallel([
          Animated.timing(sandVisibility, {
            toValue: 1,
            duration: 100,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(rotateProgress, {
            toValue: 0.5,
            duration: 400,
            easing: Easing.linear,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),

        // Phase D: Smooth 360° overturn flip back to upright + spring scale lift (500ms)
        Animated.parallel([
          Animated.timing(rotateProgress, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.back(1.15)),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.08,
              duration: 250,
              easing: Easing.out(Easing.quad),
              useNativeDriver: USE_NATIVE_DRIVER,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 250,
              easing: Easing.in(Easing.quad),
              useNativeDriver: USE_NATIVE_DRIVER,
            }),
          ]),
        ]),
      ])
    );

    // 2. Staggered falling sand grains through the hourglass neck
    const grains = [grain0, grain1, grain2, grain3];
    const grainTimers: ReturnType<typeof setTimeout>[] = [];
    const grainLoops: Animated.CompositeAnimation[] = [];

    grains.forEach((g, idx) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(g, {
            toValue: 1,
            duration: 440,
            easing: Easing.in(Easing.quad),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(g, {
            toValue: 0,
            duration: 0,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ])
      );
      grainLoops.push(loop);
      const t = setTimeout(() => {
        loop.start();
      }, idx * 110);
      grainTimers.push(t);
    });

    flipCycle.start();

    return () => {
      flipCycle.stop();
      grainTimers.forEach(clearTimeout);
      grainLoops.forEach((l) => l.stop());
    };
  }, [rotateProgress, scaleAnim, sandVisibility, grain0, grain1, grain2, grain3]);

  // Compute exact pixel geometry relative to contained 176x200 image
  const imgScale = Math.min(width / SRC_W, height / SRC_H);
  const grainSize = Math.max(3, 5.2 * imgScale);
  const dropDistance = 44 * imgScale;
  const neckStartY = height / 2 - 2 * imgScale;

  const rotate = rotateProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '180deg', '360deg'],
  });

  const grains = [grain0, grain1, grain2, grain3];

  return (
    <View style={[styles.container, { width, height }, style]}>
      {/* Rotating + Lifting Hourglass Illustration */}
      <Animated.View
        style={[
          styles.imageHolder,
          {
            width,
            height,
            transform: [{ rotate }, { scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={HOURGLASS_IMAGE}
          style={{ width, height }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Active Cascading Sand Stream inside the Glass Neck */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: sandVisibility,
          },
        ]}
      >
        {grains.map((grainAnim, idx) => {
          const translateY = grainAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, dropDistance],
          });
          const grainOpacity = grainAnim.interpolate({
            inputRange: [0, 0.15, 0.85, 1],
            outputRange: [0, 1, 1, 0],
          });
          // Slight horizontal jitter (-1px / +1px) for natural sand stream
          const xOffset = (idx % 2 === 0 ? -0.8 : 0.8) * imgScale;

          return (
            <Animated.View
              key={idx}
              style={{
                position: 'absolute',
                top: neckStartY,
                left: width / 2 - grainSize / 2 + xOffset,
                width: grainSize,
                height: grainSize,
                borderRadius: grainSize / 2,
                backgroundColor: SAND_COLORS[idx % SAND_COLORS.length],
                opacity: grainOpacity,
                transform: [{ translateY }],
              }}
            />
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  imageHolder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AnimatedHourglassLoader;
