import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SkeletonBox } from '../ProviderDashboardSkeleton';

/**
 * ServiceFormSkeleton
 *
 * Displays a pulsating shimmer skeleton mirroring Step 1 ("Add service") layout:
 * - Stepper bar
 * - Info banner
 * - 6 image slots (2x3 grid)
 * - Category dropdown skeleton
 * - Name input skeleton
 * - Description box skeleton
 * - Two-column Price & Duration skeleton
 * - Package row card skeleton
 * - Sticky footer button skeleton
 */
export const ServiceFormSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header skeleton */}
      <View style={styles.header}>
        <SkeletonBox width={40} height={40} borderRadius={20} />
        <SkeletonBox width={120} height={24} borderRadius={12} />
        <SkeletonBox width={40} height={40} borderRadius={8} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stepper bar skeleton */}
        <View style={styles.stepperWrapper}>
          <SkeletonBox width="100%" height={44} borderRadius={16} />
        </View>

        {/* Info Banner skeleton */}
        <View style={styles.bannerWrapper}>
          <SkeletonBox width="100%" height={48} borderRadius={24} />
        </View>

        {/* Image slots section skeleton (2x3 grid) */}
        <View style={styles.section}>
          <SkeletonBox width={140} height={20} borderRadius={6} />
          <SkeletonBox width="90%" height={16} borderRadius={4} />

          <View style={styles.grid2x3}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBox key={i} width="31%" height={104} borderRadius={24} />
            ))}
          </View>
        </View>

        {/* Category skeleton */}
        <View style={styles.section}>
          <SkeletonBox width={150} height={20} borderRadius={6} />
          <SkeletonBox width="100%" height={48} borderRadius={24} />
          <SkeletonBox width="70%" height={14} borderRadius={4} />
        </View>

        {/* Name skeleton */}
        <View style={styles.section}>
          <SkeletonBox width={130} height={20} borderRadius={6} />
          <SkeletonBox width="100%" height={48} borderRadius={24} />
          <SkeletonBox width="80%" height={14} borderRadius={4} />
        </View>

        {/* Description skeleton */}
        <View style={styles.section}>
          <SkeletonBox width={160} height={20} borderRadius={6} />
          <SkeletonBox width="100%" height={112} borderRadius={24} />
        </View>

        {/* Price & Duration skeleton */}
        <View style={styles.section}>
          <SkeletonBox width={180} height={20} borderRadius={6} />
          <View style={styles.twoColumnRow}>
            <View style={{ flex: 1 }}>
              <SkeletonBox width="100%" height={48} borderRadius={24} />
            </View>
            <View style={{ flex: 1 }}>
              <SkeletonBox width="100%" height={48} borderRadius={24} />
            </View>
          </View>
        </View>

        {/* Package row skeleton */}
        <View style={styles.section}>
          <SkeletonBox width="100%" height={56} borderRadius={24} />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky footer skeleton */}
      <View style={styles.footer}>
        <SkeletonBox width="100%" height={48} borderRadius={24} />
      </View>
    </View>
  );
};

export default ServiceFormSkeleton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 64,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 24,
  },
  stepperWrapper: {
    width: '100%',
  },
  bannerWrapper: {
    width: '100%',
  },
  section: {
    gap: 12,
  },
  grid2x3: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 16,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.6)',
  },
});
