import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export interface DommyLoaderProps {
  visible?: boolean;
  paddingTop?: number;
}

/**
 * 1:1 Figma Dommy Loader Screen Overlay
 *
 * Dimensions:
 * - Backdrop: full screen, rgba(0, 0, 0, 0.1)
 * - Container: width 124px, height 16px, gap 20px, paddingTop 429px
 * - 4 Dots (Ellipse 223–226): 16px x 16px, radius 8px, rgba(0, 8, 20, 0.96)
 */
export const DommyLoader: React.FC<DommyLoaderProps> = ({
  visible = true,
  paddingTop = 429,
}) => {
  const dot1 = useRef(new Animated.Value(0.4)).current;
  const dot2 = useRef(new Animated.Value(0.4)).current;
  const dot3 = useRef(new Animated.Value(0.4)).current;
  const dot4 = useRef(new Animated.Value(0.4)).current;

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
            toValue: 0.4,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.delay(Math.max(0, 600 - delay)),
        ])
      );
    };

    const anim1 = createPulseAnimation(dot1, 0);
    const anim2 = createPulseAnimation(dot2, 150);
    const anim3 = createPulseAnimation(dot3, 300);
    const anim4 = createPulseAnimation(dot4, 450);

    anim1.start();
    anim2.start();
    anim3.start();
    anim4.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
      anim4.stop();
    };
  }, [visible, dot1, dot2, dot3, dot4]);

  if (!visible) return null;

  return (
    <View
      style={[styles.dommyLoaderScreen, { paddingTop }]}
      pointerEvents="auto"
    >
      <View style={styles.dommyLoader}>
        {/* Ellipse 223 */}
        <Animated.View
          style={[
            styles.dot,
            {
              opacity: dot1,
              transform: [{ scale: dot1.interpolate({ inputRange: [0.4, 1], outputRange: [0.85, 1.1] }) }],
            },
          ]}
        />
        {/* Ellipse 224 */}
        <Animated.View
          style={[
            styles.dot,
            {
              opacity: dot2,
              transform: [{ scale: dot2.interpolate({ inputRange: [0.4, 1], outputRange: [0.85, 1.1] }) }],
            },
          ]}
        />
        {/* Ellipse 225 */}
        <Animated.View
          style={[
            styles.dot,
            {
              opacity: dot3,
              transform: [{ scale: dot3.interpolate({ inputRange: [0.4, 1], outputRange: [0.85, 1.1] }) }],
            },
          ]}
        />
        {/* Ellipse 226 */}
        <Animated.View
          style={[
            styles.dot,
            {
              opacity: dot4,
              transform: [{ scale: dot4.interpolate({ inputRange: [0.4, 1], outputRange: [0.85, 1.1] }) }],
            },
          ]}
        />
      </View>
    </View>
  );
};

export default DommyLoader;

const styles = StyleSheet.create({
  /* dommy loader screen */
  dommyLoaderScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    zIndex: 9999,
  },

  /* dommy loader */
  dommyLoader: {
    width: 124,
    height: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },

  /* Ellipse 223-226: 16px x 16px, radius 8px, barber app primary */
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
});
