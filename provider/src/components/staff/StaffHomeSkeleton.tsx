import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkeletonBox } from '../ProviderDashboardSkeleton';

/**
 * Staff Home Skeleton Screen
 *
 * NOTE: Not in the Figma design.
 * Mirrored directly from the Staff Home Screen layout using existing
 * SkeletonBox shimmer primitives for return transitions.
 */
export const StaffHomeSkeleton: React.FC = () => {
  const insets = useSafeAreaInsets();

  const lockedBottomOffset =
    Platform.OS === 'android'
      ? Math.max(insets.bottom, 56) + 16
      : Math.max(insets.bottom, 20);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 16, 56),
            paddingBottom: lockedBottomOffset + 80 + 36,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Header (Business Name, Address, Avatar) ── */}
        <View style={styles.header}>
          <View style={styles.headerTextGroup}>
            <SkeletonBox width={149} height={28} borderRadius={6} />
            <SkeletonBox width={180} height={16} borderRadius={4} style={{ marginTop: 8 }} />
          </View>
          <SkeletonBox width={40} height={40} borderRadius={20} />
        </View>

        {/* ── 2. Work Dashboard Section (2x2 Cards: 167x120) ── */}
        <View style={styles.sectionContainer}>
          <SkeletonBox width={160} height={24} borderRadius={6} style={{ marginBottom: 16 }} />
          <View style={styles.cardsGrid}>
            <SkeletonBox width={167} height={120} borderRadius={24} />
            <SkeletonBox width={167} height={120} borderRadius={24} />
            <SkeletonBox width={167} height={120} borderRadius={24} />
            <SkeletonBox width={167} height={120} borderRadius={24} />
          </View>
        </View>

        {/* ── 3. Personal Data Section (358x196 Card with Overlapping Chip) ── */}
        <View style={[styles.sectionContainer, { marginTop: 28 }]}>
          <View style={styles.personalDataHeader}>
            <SkeletonBox width={130} height={24} borderRadius={6} />
            <SkeletonBox width={120} height={16} borderRadius={4} style={{ marginTop: 4 }} />
          </View>

          <View style={styles.personalDataCardWrapper}>
            <SkeletonBox width={358} height={196} borderRadius={24} />
            {/* Overlapping Floating Chip Skeleton */}
            <View style={styles.floatingChipSkeletonWrapper}>
              <SkeletonBox width={175} height={72} borderRadius={16} />
            </View>
          </View>
        </View>

        {/* ── 4. Personal Dashboard Section (3 Cards: 167x136) ── */}
        <View style={[styles.sectionContainer, { marginTop: 28 }]}>
          <SkeletonBox width={180} height={24} borderRadius={6} style={{ marginBottom: 16 }} />
          <View style={styles.cardsGrid}>
            <SkeletonBox width={167} height={136} borderRadius={24} />
            <SkeletonBox width={167} height={136} borderRadius={24} />
            <SkeletonBox width={167} height={136} borderRadius={24} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default StaffHomeSkeleton;

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
  header: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  headerTextGroup: {
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
    rowGap: 20,
  },
  personalDataHeader: {
    marginBottom: 16,
  },
  personalDataCardWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: 358,
  },
  floatingChipSkeletonWrapper: {
    position: 'absolute',
    top: -18,
    right: 0,
    zIndex: 10,
  },
});
