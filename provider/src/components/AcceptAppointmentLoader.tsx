import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export interface AcceptAppointmentLoaderProps {
  visible?: boolean;
}

/**
 * 1:1 Figma Accept Appointment Loader Overlay
 *
 * CSS Specs:
 * - Loader: width: 112px, height: 16px, gap: 16px, centered at 50% / 50%
 * - Ellipse 218-221: width: 16px, height: 16px, borderRadius: 8px, background: rgba(0, 8, 20, 0.96)
 * - Backdrop: full screen overlay, rgba(0, 8, 20, 0.2)
 */
export const AcceptAppointmentLoader: React.FC<AcceptAppointmentLoaderProps> = ({
  visible = true,
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
            duration: 320,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0.35,
            duration: 320,
            useNativeDriver: true,
          }),
          Animated.delay(Math.max(0, 560 - delay)),
        ])
      );
    };

    const anim1 = createPulseAnimation(dot1, 0);
    const anim2 = createPulseAnimation(dot2, 140);
    const anim3 = createPulseAnimation(dot3, 280);
    const anim4 = createPulseAnimation(dot4, 420);

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
    <View style={styles.overlay} pointerEvents="auto">
      {/* 1:1 Figma Loader Container (112x16px, gap: 16px) */}
      <View style={styles.loaderContainer}>
        {/* Ellipse 218 */}
        <Animated.View
          style={[
            styles.dot,
            {
              opacity: dot1,
              transform: [
                {
                  scale: dot1.interpolate({
                    inputRange: [0.35, 1],
                    outputRange: [0.85, 1.15],
                  }),
                },
              ],
            },
          ]}
        />
        {/* Ellipse 219 */}
        <Animated.View
          style={[
            styles.dot,
            {
              opacity: dot2,
              transform: [
                {
                  scale: dot2.interpolate({
                    inputRange: [0.35, 1],
                    outputRange: [0.85, 1.15],
                  }),
                },
              ],
            },
          ]}
        />
        {/* Ellipse 220 */}
        <Animated.View
          style={[
            styles.dot,
            {
              opacity: dot3,
              transform: [
                {
                  scale: dot3.interpolate({
                    inputRange: [0.35, 1],
                    outputRange: [0.85, 1.15],
                  }),
                },
              ],
            },
          ]}
        />
        {/* Ellipse 221 */}
        <Animated.View
          style={[
            styles.dot,
            {
              opacity: dot4,
              transform: [
                {
                  scale: dot4.interpolate({
                    inputRange: [0.35, 1],
                    outputRange: [0.85, 1.15],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
};

export default AcceptAppointmentLoader;

const styles = StyleSheet.create({
  /* Full screen backdrop: rgba(0, 8, 20, 0.2) */
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 8, 20, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },

  /* loader: width 112px, height 16px, gap 16px, center 50% 50% */
  loaderContainer: {
    width: 112,
    height: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },

  /* Ellipse 218-221: 16px x 16px, borderRadius 8px, rgba(0, 8, 20, 0.96) */
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
});
