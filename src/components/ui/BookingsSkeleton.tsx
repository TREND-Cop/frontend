import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkeletonBox } from './HomeSkeleton';

export const BookingsSkeleton = () => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 100 },
        ]}
      >
        {/* ── Top Header (Bookings) ── */}
        <View style={styles.headerContainer}>
          <SkeletonBox width={130} height={28} borderRadius={6} />
        </View>

        {/* ── Menu List (5 rows) ── */}
        <View style={styles.menuListContainer}>
          {[1, 2, 3, 4, 5].map((item, index) => (
            <React.Fragment key={item}>
              <View style={styles.menuRowItem}>
                <View style={styles.menuRowLeft}>
                  {/* Icon Square */}
                  <SkeletonBox width={48} height={48} borderRadius={12} />
                  <View style={styles.menuTextCol}>
                    <SkeletonBox width={140} height={16} borderRadius={4} />
                    <SkeletonBox width={90} height={12} borderRadius={4} style={{ marginTop: 6 }} />
                  </View>
                </View>
                {/* Chevron */}
                <SkeletonBox width={20} height={20} borderRadius={10} />
              </View>
              {index < 4 && <View style={styles.dividerLine} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Popular Right Now Section ── */}
        <View style={styles.sectionHeaderRow}>
          <SkeletonBox width={160} height={20} borderRadius={4} />
          <SkeletonBox width={60} height={16} borderRadius={4} />
        </View>

        {/* Popular Cards */}
        <View style={styles.popularCardsList}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.popularCard}>
              <SkeletonBox width={80} height={80} borderRadius={16} />
              <View style={styles.cardDetails}>
                <SkeletonBox width={140} height={16} borderRadius={4} />
                <SkeletonBox width={100} height={14} borderRadius={4} style={{ marginTop: 6 }} />
                <View style={styles.cardMetaRow}>
                  <SkeletonBox width={70} height={14} borderRadius={4} />
                  <SkeletonBox width={50} height={14} borderRadius={4} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerContainer: {
    marginBottom: 20,
    marginTop: 8,
  },
  menuListContainer: {
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 28,
  },
  menuRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuTextCol: {
    justifyContent: 'center',
  },
  dividerLine: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginHorizontal: -16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  popularCardsList: {
    gap: 16,
  },
  popularCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    gap: 14,
  },
  cardDetails: {
    flex: 1,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});

export default BookingsSkeleton;
