import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Platform, StyleProp, ViewStyle, StyleSheet, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface TextSkeletonProps {
  loading?: boolean;
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * TextSkeleton
 *
 * Implements the founder's requested behavior:
 * Images, gallery grids, and container elements remain visible immediately,
 * while textual information is masked by an animated moving shimmer line
 * for the hydration window (~1.4s), then smoothly reveals the content.
 */
export const TextSkeleton: React.FC<TextSkeletonProps> = ({
  loading = false,
  width = '100%',
  height = 16,
  borderRadius = 6,
  style,
  children,
}) => {
  const [layoutWidth, setLayoutWidth] = useState<number>(
    typeof width === 'number' ? width : 200
  );
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const contentFadeAnim = useRef(new Animated.Value(loading ? 0 : 1)).current;

  useEffect(() => {
    let isMounted = true;

    if (loading) {
      contentFadeAnim.setValue(0);

      // 1. Shimmer sweep loop
      const runShimmer = () => {
        if (!isMounted) return;
        shimmerAnim.setValue(0);
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }).start(({ finished }) => {
          if (finished && isMounted) {
            runShimmer();
          }
        });
      };

      // 2. Breathing pulse loop
      const runPulse = () => {
        if (!isMounted) return;
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 650,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 650,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]).start(({ finished }) => {
          if (finished && isMounted) {
            runPulse();
          }
        });
      };

      runShimmer();
      runPulse();
    } else {
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }

    return () => {
      isMounted = false;
      shimmerAnim.stopAnimation();
      pulseAnim.stopAnimation();
    };
  }, [loading]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-layoutWidth * 1.5, layoutWidth * 1.5],
  });

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 1],
  });

  if (loading) {
    return (
      <Animated.View
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0 && w !== layoutWidth) {
            setLayoutWidth(w);
          }
        }}
        style={[
          styles.placeholderWrapper,
          {
            width: width as any,
            height,
            borderRadius,
            backgroundColor: '#DFE2E6',
            overflow: 'hidden',
            opacity,
          },
          style,
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              width: layoutWidth * 1.6,
              transform: [{ translateX }],
            },
          ]}
        >
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0)',
              'rgba(255, 255, 255, 0.45)',
              'rgba(255, 255, 255, 0.95)',
              'rgba(255, 255, 255, 0.45)',
              'rgba(255, 255, 255, 0)',
            ]}
            locations={[0, 0.3, 0.5, 0.7, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ opacity: contentFadeAnim }, style]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  placeholderWrapper: {
    justifyContent: 'center',
    position: 'relative',
  },
});
