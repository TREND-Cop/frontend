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
  const contentFadeAnim = useRef(new Animated.Value(loading ? 0 : 1)).current;

  useEffect(() => {
    let animLoop: Animated.CompositeAnimation | null = null;
    if (loading) {
      contentFadeAnim.setValue(0);
      shimmerAnim.setValue(0);
      animLoop = Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1300,
          easing: Easing.linear,
          useNativeDriver: Platform.OS !== 'web',
        })
      );
      animLoop.start();
    } else {
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }

    return () => {
      if (animLoop) animLoop.stop();
    };
  }, [loading]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-layoutWidth, layoutWidth * 1.5],
  });

  if (loading) {
    return (
      <View
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
            backgroundColor: '#EAECEF',
            overflow: 'hidden',
          },
          style,
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              width: layoutWidth * 1.2,
              transform: [{ translateX }],
            },
          ]}
        >
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0)',
              'rgba(255, 255, 255, 0.75)',
              'rgba(255, 255, 255, 0)',
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
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
