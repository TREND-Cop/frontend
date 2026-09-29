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

// ── Reusable Moving Shimmer Skeleton Block ──
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

    // 1. High-speed continuous shimmer sweep
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

    // 2. Continuous breathing pulse animation
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
          backgroundColor: '#DFE2E6',
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

export const HomeSkeleton = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 12 },
        ]}
      >
        {/* ── 1. Top Header Area (Avatar + Greeting + Bell) ── */}
        <View style={styles.headerRow}>
          <View style={styles.userSection}>
            {/* Avatar Circle */}
            <SkeletonBox width={48} height={48} borderRadius={24} />
            <View style={styles.userTextCol}>
              <SkeletonBox width={120} height={16} borderRadius={4} />
              <SkeletonBox width={160} height={12} borderRadius={4} />
            </View>
          </View>

          {/* Bell Icon Circle */}
          <SkeletonBox width={40} height={40} borderRadius={20} />
        </View>

        {/* ── 2. Search Bar ── */}
        <View style={styles.searchRow}>
          <SkeletonBox width={SCREEN_WIDTH - 32} height={48} borderRadius={24} />
        </View>

        {/* ── 3. Hero Promo Banner ── */}
        <View style={styles.bannerContainer}>
          <SkeletonBox width="100%" height={165} borderRadius={20} />
        </View>

        {/* ── 4. Category Switcher (Men / Women Pills) ── */}
        <View style={styles.categoryPillsRow}>
          <SkeletonBox width={95} height={36} borderRadius={18} />
          <SkeletonBox width={95} height={36} borderRadius={18} />
        </View>

        {/* ── 5. Service Grid Icons (4 circular icons) ── */}
        <View style={styles.gridRow}>
          {[1, 2, 3, 4].map((item) => (
            <View key={item} style={styles.gridItem}>
              <SkeletonBox width={58} height={58} borderRadius={29} />
              <SkeletonBox width={50} height={10} borderRadius={4} />
            </View>
          ))}
        </View>

        {/* ── 6. Section 1: "Now Trending" Cards ── */}
        <View style={styles.sectionHeaderRow}>
          <SkeletonBox width={140} height={20} borderRadius={4} />
          <SkeletonBox width={60} height={14} borderRadius={4} />
        </View>

        <View style={styles.cardsCarouselRow}>
          {[1, 2, 3].map((card) => (
            <View key={card} style={styles.serviceCard}>
              <SkeletonBox width={170} height={115} borderRadius={16} />
              <SkeletonBox width={130} height={14} borderRadius={4} style={{ marginTop: 8 }} />
              <SkeletonBox width={80} height={12} borderRadius={4} style={{ marginTop: 4 }} />
            </View>
          ))}
        </View>

        {/* ── 7. Section 2: "Popular Amongst Men" Cards ── */}
        <View style={styles.sectionHeaderRow}>
          <SkeletonBox width={170} height={20} borderRadius={4} />
          <SkeletonBox width={60} height={14} borderRadius={4} />
        </View>

        <View style={styles.cardsCarouselRow}>
          {[1, 2, 3].map((card) => (
            <View key={card} style={styles.serviceCard}>
              <SkeletonBox width={170} height={115} borderRadius={16} />
              <SkeletonBox width={130} height={14} borderRadius={4} style={{ marginTop: 8 }} />
              <SkeletonBox width={80} height={12} borderRadius={4} style={{ marginTop: 4 }} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 20,
  },

  // Header Row
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userTextCol: {
    gap: 6,
  },

  // Search Row
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  // Banner
  bannerContainer: {
    width: '100%',
  },

  // Category Pills
  categoryPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  // Grid Row
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  gridItem: {
    alignItems: 'center',
    gap: 8,
  },

  // Section Header
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  // Cards Row
  cardsCarouselRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  serviceCard: {
    width: 170,
  },
});

export default HomeSkeleton;
