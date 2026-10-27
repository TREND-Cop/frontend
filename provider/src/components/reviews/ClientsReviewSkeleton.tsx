import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SkeletonBox } from '../ProviderDashboardSkeleton';

export interface ClientsReviewSkeletonProps {
  count?: number;
}

/**
 * ClientsReviewSkeleton
 * Built from real ReviewItem dimensions per Figma "Skeleton Loader" note:
 * - 32x32 Avatar circle
 * - Name bar (126x16) and verification badge (20x20)
 * - Review text placeholders (2 lines)
 * - Footer with timestamp (100x12) and Reply pill (71x32, 24px radius)
 * - 1px divider between review rows
 */
export const ClientsReviewSkeleton: React.FC<ClientsReviewSkeletonProps> = ({
  count = 4,
}) => {
  const rows = Array.from({ length: count }, (_, i) => i);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    >
      {rows.map((idx) => (
        <View key={`skeleton-review-${idx}`} style={styles.itemWrapper}>
          <View style={styles.reviewRow}>
            {/* 32x32 Avatar Circle */}
            <SkeletonBox width={32} height={32} borderRadius={16} />

            {/* Information Column */}
            <View style={styles.infoColumn}>
              {/* Name & Badge Row */}
              <View style={styles.nameRow}>
                <SkeletonBox width={idx % 2 === 0 ? 126 : 140} height={16} borderRadius={4} />
                <SkeletonBox width={20} height={20} borderRadius={10} />
              </View>

              {/* Review Text: 2 lines */}
              <View style={styles.textLines}>
                <SkeletonBox width="90%" height={14} borderRadius={4} />
                <SkeletonBox width={idx % 2 === 0 ? '60%' : '75%'} height={14} borderRadius={4} />
              </View>

              {/* Footer Row: Timestamp left, Reply Pill right */}
              <View style={styles.footerRow}>
                <SkeletonBox width={110} height={12} borderRadius={4} />
                <SkeletonBox width={71} height={32} borderRadius={24} />
              </View>
            </View>
          </View>

          {/* 1px Divider Line */}
          {idx < count - 1 && <View style={styles.divider} />}
        </View>
      ))}
    </ScrollView>
  );
};

export default ClientsReviewSkeleton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  itemWrapper: {
    width: '100%',
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingVertical: 12,
  },
  infoColumn: {
    flex: 1,
    gap: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 24,
  },
  textLines: {
    gap: 6,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 32,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    width: '100%',
    marginVertical: 4,
  },
});
