import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';

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

export const ProfileSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Top Header Placeholder */}
      <View style={styles.headerRow}>
        <SkeletonItem width={100} height={32} borderRadius={6} />
        <SkeletonItem width={48} height={48} borderRadius={24} />
      </View>

      {/* Profile Card Placeholder (Frame 1000006524: 358x238) */}
      <View style={styles.profileCard}>
        {/* Avatar Circle (109x109) */}
        <SkeletonItem width={109} height={109} borderRadius={55} style={{ marginBottom: 16 }} />
        {/* Name (James Kalba: 160x20) */}
        <SkeletonItem width={160} height={20} borderRadius={6} style={{ marginBottom: 12 }} />
        {/* Pill + Phone Row */}
        <View style={styles.badgeRow}>
          <SkeletonItem width={120} height={28} borderRadius={14} />
          <SkeletonItem width={130} height={20} borderRadius={6} />
        </View>
      </View>

      {/* Account Information Section Header */}
      <View style={styles.sectionHeader}>
        <SkeletonItem width={160} height={18} borderRadius={4} />
      </View>

      {/* Account Information Card (358x200) */}
      <View style={styles.cardGroup}>
        <View style={styles.rowPlaceholder}>
          <SkeletonItem width={24} height={24} borderRadius={6} />
          <SkeletonItem width={120} height={18} borderRadius={4} />
          <View style={{ flex: 1 }} />
          <SkeletonItem width={16} height={16} borderRadius={4} />
        </View>
        <View style={styles.rowDivider} />
        <View style={styles.rowPlaceholder}>
          <SkeletonItem width={24} height={24} borderRadius={6} />
          <SkeletonItem width={90} height={18} borderRadius={4} />
          <View style={{ flex: 1 }} />
          <SkeletonItem width={16} height={16} borderRadius={4} />
        </View>
        <View style={styles.rowDivider} />
        <View style={styles.rowPlaceholder}>
          <SkeletonItem width={24} height={24} borderRadius={6} />
          <SkeletonItem width={150} height={18} borderRadius={4} />
          <View style={{ flex: 1 }} />
          <SkeletonItem width={16} height={16} borderRadius={4} />
        </View>
      </View>

      {/* Account Settings Section Header */}
      <View style={styles.sectionHeader}>
        <SkeletonItem width={140} height={18} borderRadius={4} />
      </View>

      {/* Account Settings Card (358x200) */}
      <View style={styles.cardGroup}>
        <View style={styles.rowPlaceholder}>
          <SkeletonItem width={24} height={24} borderRadius={6} />
          <SkeletonItem width={140} height={18} borderRadius={4} />
          <View style={{ flex: 1 }} />
          <SkeletonItem width={16} height={16} borderRadius={4} />
        </View>
        <View style={styles.rowDivider} />
        <View style={styles.rowPlaceholder}>
          <SkeletonItem width={24} height={24} borderRadius={6} />
          <SkeletonItem width={160} height={18} borderRadius={4} />
          <View style={{ flex: 1 }} />
          <SkeletonItem width={16} height={16} borderRadius={4} />
        </View>
        <View style={styles.rowDivider} />
        <View style={styles.rowPlaceholder}>
          <SkeletonItem width={24} height={24} borderRadius={6} />
          <SkeletonItem width={110} height={18} borderRadius={4} />
          <View style={{ flex: 1 }} />
          <SkeletonItem width={16} height={16} borderRadius={4} />
        </View>
      </View>

      {/* Privacy & Terms Container (358x56) */}
      <View style={styles.singleCard}>
        <SkeletonItem width={24} height={24} borderRadius={6} />
        <SkeletonItem width={130} height={18} borderRadius={4} />
        <View style={{ flex: 1 }} />
        <SkeletonItem width={16} height={16} borderRadius={4} />
      </View>

      {/* Log Out Container (358x56) */}
      <View style={styles.singleCard}>
        <SkeletonItem width={24} height={24} borderRadius={6} />
        <SkeletonItem width={80} height={18} borderRadius={4} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 140,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    marginBottom: 24,
  },
  profileCard: {
    width: '100%',
    height: 238,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    alignItems: 'center',
    padding: 16,
    marginBottom: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionHeader: {
    marginBottom: 12,
    paddingLeft: 4,
  },
  cardGroup: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  singleCard: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  rowPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    gap: 12,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    width: '100%',
  },
});
