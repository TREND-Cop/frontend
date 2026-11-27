import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkeletonBox } from './ProviderDashboardSkeleton';
import { useBottomInset } from '../utils/bottomInset';

export const ProviderMessagesSkeleton: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { tabScrollPadding } = useBottomInset();

  const skeletonRows = [
    { id: 1, nameWidth: 140, msgWidth: 210, hasBadge: true },
    { id: 2, nameWidth: 110, msgWidth: 180, hasBadge: false },
    { id: 3, nameWidth: 155, msgWidth: 225, hasBadge: false },
    { id: 4, nameWidth: 125, msgWidth: 195, hasBadge: false },
    { id: 5, nameWidth: 135, msgWidth: 170, hasBadge: false },
    { id: 6, nameWidth: 115, msgWidth: 205, hasBadge: false },
  ];

  return (
    <View style={styles.container}>
      {/* ── Top Header Skeleton: Message + Search bar ── */}
      <View style={styles.headerContainer}>
        <SkeletonBox width={120} height={28} borderRadius={6} />
        <SkeletonBox width="100%" height={48} borderRadius={24} />
      </View>

      {/* ── Line 135: Top Divider ── */}
      <View style={styles.topDivider} />

      {/* ── Scrollable Messages List Skeleton ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: tabScrollPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {skeletonRows.map((item, index) => (
          <View key={item.id} style={styles.messageRowWrapper}>
            <View style={styles.messageRow}>
              {/* Ellipse 194: Avatar (48x48px, radius 24px) */}
              <SkeletonBox width={48} height={48} borderRadius={24} />

              {/* Message Content & Indicators */}
              <View style={styles.messageContentBlock}>
                {/* Text Column (Name & Snippet) */}
                <View style={styles.textColumn}>
                  <SkeletonBox width={item.nameWidth} height={16} borderRadius={4} />
                  <SkeletonBox width={item.msgWidth} height={14} borderRadius={4} style={{ marginTop: 4 }} />
                </View>

                {/* Meta Column (Time & Badge) */}
                <View style={styles.metaColumn}>
                  <SkeletonBox width={36} height={12} borderRadius={4} />
                  {item.hasBadge ? (
                    <SkeletonBox width={20} height={20} borderRadius={10} style={{ marginTop: 8 }} />
                  ) : (
                    <View style={styles.badgeSpacer} />
                  )}
                </View>
              </View>
            </View>

            {/* Inset Divider: Line 136 / Line 137 */}
            {index < skeletonRows.length - 1 && <View style={styles.itemDivider} />}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default ProviderMessagesSkeleton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    gap: 16,
  },
  topDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  messageRowWrapper: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 16,
    width: '100%',
    height: 64,
  },
  messageContentBlock: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textColumn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  metaColumn: {
    width: 56,
    height: 44,
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    gap: 8,
    flexShrink: 0,
  },
  badgeSpacer: {
    width: 20,
    height: 20,
  },
  itemDivider: {
    width: 302,
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 8,
  },
});
