import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  Easing,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Reusable Shimmer Skeleton Box ───────────────────────────────────────────
export interface SkeletonBoxProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width,
  height,
  borderRadius = 8,
  style,
}) => {
  const [layoutWidth, setLayoutWidth] = useState<number>(() => {
    return typeof width === 'number' ? width : (typeof SCREEN_WIDTH === 'number' ? SCREEN_WIDTH : 300);
  });
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;

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

    return () => {
      isMounted = false;
      shimmerAnim.stopAnimation();
      pulseAnim.stopAnimation();
    };
  }, [shimmerAnim, pulseAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-layoutWidth * 1.5, layoutWidth * 1.5],
  });

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 1],
  });

  return (
    <Animated.View
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0 && w !== layoutWidth) {
          setLayoutWidth(w);
        }
      }}
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: '#EBEBF5',
          overflow: 'hidden',
          position: 'relative',
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
};

// ── Provider Dashboard Skeleton Screen (1:1 with Figma Dashboard Scaffold) ──
export const ProviderDashboardSkeleton: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 16, 56),
            paddingBottom:
              160 +
              (Platform.OS === 'android'
                ? Math.max(insets.bottom, 56)
                : Math.max(insets.bottom, 16)),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Business Header (358x52) */}
        <View style={styles.businessHeader}>
          <View style={styles.businessInfoColumn}>
            <SkeletonBox width={149} height={28} borderRadius={6} />
            <SkeletonBox width={190} height={16} borderRadius={4} style={{ marginTop: 8 }} />
          </View>
          <SkeletonBox width={104} height={40} borderRadius={20} />
        </View>

        {/* Section 1: Appointment Dashboard */}
        <View style={styles.sectionContainer}>
          <SkeletonBox width={210} height={24} borderRadius={6} style={{ marginBottom: 16 }} />

          {/* 2x2 Grid of Cards (167x120 each, radius 24) */}
          <View style={styles.cardsGrid}>
            <SkeletonBox width={167} height={120} borderRadius={24} />
            <SkeletonBox width={167} height={120} borderRadius={24} />
            <SkeletonBox width={167} height={120} borderRadius={24} />
            <SkeletonBox width={167} height={120} borderRadius={24} />
          </View>
        </View>

        {/* Ads Banner Frame (358x116, radius 24) */}
        <SkeletonBox width={358} height={116} borderRadius={24} style={{ alignSelf: 'center', marginVertical: 32 }} />

        {/* Section 2: Business Dashboard */}
        <View style={styles.sectionContainer}>
          <SkeletonBox width={180} height={24} borderRadius={6} style={{ marginBottom: 16 }} />

          {/* 3x2 Grid of Cards (167x136 each, radius 24) */}
          <View style={styles.cardsGrid}>
            <SkeletonBox width={167} height={136} borderRadius={24} />
            <SkeletonBox width={167} height={136} borderRadius={24} />
            <SkeletonBox width={167} height={136} borderRadius={24} />
            <SkeletonBox width={167} height={136} borderRadius={24} />
            <SkeletonBox width={167} height={136} borderRadius={24} />
            <SkeletonBox width={167} height={136} borderRadius={24} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProviderDashboardSkeleton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  businessHeader: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  businessInfoColumn: {
    flex: 1,
  },
  sectionContainer: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 24,
  },
});
