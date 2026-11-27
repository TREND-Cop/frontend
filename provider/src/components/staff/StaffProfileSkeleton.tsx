import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const SkeletonItem: React.FC<{
  width: number | `${number}%` | '100%';
  height: number;
  borderRadius?: number;
  style?: any;
}> = ({ width, height, borderRadius = 8, style }) => {
  const shimmerAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: '#EBEBF5',
          opacity: shimmerAnim,
        },
        style,
      ]}
    />
  );
};

export const StaffProfileSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Title Placeholder */}
      <View style={styles.titleRow}>
        <SkeletonItem width={92} height={32} borderRadius={6} />
      </View>

      {/* Profile Card Placeholder (Frame 1000006524: 358x230) */}
      <View style={styles.profileCard}>
        {/* Top-right Staff chip placeholder */}
        <View style={styles.chipWrapper}>
          <SkeletonItem width={74} height={28} borderRadius={16} />
        </View>

        {/* Avatar Circle (109x109) */}
        <SkeletonItem width={109} height={109} borderRadius={55} style={{ marginBottom: 19 }} />

        {/* Name and login code */}
        <SkeletonItem width={160} height={20} borderRadius={6} style={{ marginBottom: 12 }} />
        <SkeletonItem width={120} height={16} borderRadius={6} />
      </View>

      {/* Segmented Control Placeholder (358x48) */}
      <View style={styles.segmentedControl}>
        <SkeletonItem width="100%" height={48} borderRadius={24} />
      </View>

      {/* Account Info Heading Placeholder */}
      <View style={styles.headingWrapper}>
        <SkeletonItem width={140} height={20} borderRadius={6} />
      </View>

      {/* Account Info Card Placeholder (358x133) */}
      <View style={styles.accountCard}>
        <View style={styles.cardRow}>
          <SkeletonItem width={24} height={24} borderRadius={12} />
          <SkeletonItem width={120} height={18} borderRadius={6} style={{ marginLeft: 12 }} />
        </View>
        <View style={styles.divider} />
        <View style={styles.cardRow}>
          <SkeletonItem width={24} height={24} borderRadius={12} />
          <SkeletonItem width={140} height={18} borderRadius={6} style={{ marginLeft: 12 }} />
        </View>
      </View>

      {/* Log out row placeholder */}
      <View style={styles.logoutRow}>
        <SkeletonItem width={24} height={24} borderRadius={6} />
        <SkeletonItem width={80} height={18} borderRadius={6} style={{ marginLeft: 16 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  titleRow: {
    marginBottom: 24,
  },
  profileCard: {
    width: '100%',
    height: 230,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    alignItems: 'center',
    padding: 16,
    position: 'relative',
    marginBottom: 20,
  },
  chipWrapper: {
    position: 'absolute',
    top: 17,
    right: 16,
  },
  segmentedControl: {
    width: '100%',
    height: 48,
    marginBottom: 24,
  },
  headingWrapper: {
    marginBottom: 16,
  },
  accountCard: {
    width: '100%',
    height: 133,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
});

