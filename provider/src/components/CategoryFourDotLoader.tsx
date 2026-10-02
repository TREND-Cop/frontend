import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Modal, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

export interface CategoryFourDotLoaderProps {
  visible?: boolean;
  backgroundColor?: string;
}

/**
 * 1:1 Figma Category Four-Dot Loader Screen Overlay
 *
 * Requirements:
 * - Annotation: "before opening any of the category scrren, the loader screen most first appear"
 * - User instruction: "this loader in the second image should be an overlay, like displaying over the screen not a new page"
 * - Implementation: React Native transparent Modal with animated fade transition so it displays OVER the screen,
 *   with a frosted/dimmed backdrop (rgba(63, 63, 63, 0.72) / blur) revealing the screen underneath, and 4 centered pulsing dots.
 */
export const CategoryFourDotLoader: React.FC<CategoryFourDotLoaderProps> = ({
  visible = true,
  backgroundColor = 'rgba(63, 63, 63, 0.72)',
}) => {
  const dot1 = useRef(new Animated.Value(0.35)).current;
  const dot2 = useRef(new Animated.Value(0.35)).current;
  const dot3 = useRef(new Animated.Value(0.35)).current;
  const dot4 = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    if (!visible) return;

    const createPulseAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0.35,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.delay(200),
        ])
      );
    };

    const a1 = createPulseAnimation(dot1, 0);
    const a2 = createPulseAnimation(dot2, 120);
    const a3 = createPulseAnimation(dot3, 240);
    const a4 = createPulseAnimation(dot4, 360);

    a1.start();
    a2.start();
    a3.start();
    a4.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
      a4.stop();
    };
  }, [visible, dot1, dot2, dot3, dot4]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={[styles.loadingOverlay, { backgroundColor }]} pointerEvents="auto">
        {Platform.OS === 'ios' && (
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        )}
        <View style={styles.loaderRow}>
          <Animated.View style={[styles.loaderDot, { opacity: dot1 }]} />
          <Animated.View style={[styles.loaderDot, { opacity: dot2 }]} />
          <Animated.View style={[styles.loaderDot, { opacity: dot3 }]} />
          <Animated.View style={[styles.loaderDot, { opacity: dot4 }]} />
        </View>
      </View>
    </Modal>
  );
};

export default CategoryFourDotLoader;

const styles = StyleSheet.create({
  loadingOverlay: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderRow: {
    width: 112,
    height: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loaderDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
});
