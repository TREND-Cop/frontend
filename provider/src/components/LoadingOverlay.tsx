import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export interface LoadingOverlayProps {
  visible?: boolean;
  dotsCount?: number;
  paddingTop?: number;
  dotSize?: number;
  dotGap?: number;
  overlayOpacity?: number;
  dotColor?: string;
  centered?: boolean;
}

/**
 * Reusable LoadingOverlay matching 1:1 Figma Dimmed Frame 8 & F5 Spec:
 * - Backdrop: full screen, default rgba(0, 0, 0, 0.1), customizable
 * - Container: customizable height & gap
 * - Dots: customizable size & color
 * - Blocks touches while visible.
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible = true,
  dotsCount = 4,
  paddingTop = 429,
  dotSize = 16,
  dotGap = 20,
  overlayOpacity = 0.1,
  dotColor = 'rgba(0, 8, 20, 0.96)',
  centered = false,
}) => {
  const dot1 = useRef(new Animated.Value(0.35)).current;
  const dot2 = useRef(new Animated.Value(0.35)).current;
  const dot3 = useRef(new Animated.Value(0.35)).current;
  const dot4 = useRef(new Animated.Value(0.35)).current;

  const dots = [dot1, dot2, dot3, dot4].slice(0, dotsCount);

  useEffect(() => {
    if (!visible) return;

    const createPulse = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 320,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.35,
            duration: 320,
            useNativeDriver: true,
          }),
          Animated.delay(Math.max(0, 600 - delay)),
        ])
      );
    };

    const anims = dots.map((d, i) => createPulse(d, i * 140));
    anims.forEach((a) => a.start());

    return () => {
      anims.forEach((a) => a.stop());
    };
  }, [visible, dotsCount]);

  if (!visible) return null;

  return (
    <View
      style={[
        styles.overlay,
        {
          paddingTop: centered ? undefined : paddingTop,
          justifyContent: centered ? 'center' : undefined,
          backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
        },
      ]}
      pointerEvents="auto"
    >
      <View style={[styles.dotsRow, { height: dotSize, gap: dotGap }]}>
        {dots.map((dotAnim, idx) => (
          <Animated.View
            key={idx}
            style={[
              styles.dot,
              {
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: dotColor,
                opacity: dotAnim,
                transform: [
                  {
                    scale: dotAnim.interpolate({
                      inputRange: [0.35, 1],
                      outputRange: [0.85, 1.15],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default LoadingOverlay;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    zIndex: 99999,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
});
