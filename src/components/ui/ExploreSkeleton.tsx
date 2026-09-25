import React from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkeletonBox } from './HomeSkeleton';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ExploreSkeleton = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* ── Top Floating Header (Search Bar + Filter Button) ── */}
      <View style={[styles.topHeader, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
        <View style={styles.searchRow}>
          <SkeletonBox width={SCREEN_WIDTH - 32 - 56} height={48} borderRadius={24} />
          <SkeletonBox width={48} height={48} borderRadius={24} />
        </View>

        {/* ── Filter Pills Row ── */}
        <View style={styles.filterPillsRow}>
          <SkeletonBox width={85} height={36} borderRadius={18} />
          <SkeletonBox width={95} height={36} borderRadius={18} />
          <SkeletonBox width={80} height={36} borderRadius={18} />
          <SkeletonBox width={100} height={36} borderRadius={18} />
        </View>
      </View>

      {/* ── Map Simulated Background with Price Pins ── */}
      <View style={styles.mapArea}>
        {/* Floating Price Pins */}
        <View style={[styles.pinWrapper, { top: 180, left: 60 }]}>
          <SkeletonBox width={72} height={26} borderRadius={13} />
        </View>
        <View style={[styles.pinWrapper, { top: 230, right: 70 }]}>
          <SkeletonBox width={84} height={26} borderRadius={13} />
        </View>
        <View style={[styles.pinWrapper, { top: 290, left: 140 }]}>
          <SkeletonBox width={78} height={26} borderRadius={13} />
        </View>
      </View>

      {/* ── Bottom Half-Screen Sheet (Cards List) ── */}
      <View style={styles.bottomSheet}>
        {/* Drag handle */}
        <View style={styles.dragHandle} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetContent}
        >
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.placeCard}>
              {/* Place Image */}
              <SkeletonBox width="100%" height={144} borderRadius={16} />

              {/* Title & Rating */}
              <View style={styles.cardInfoRow}>
                <SkeletonBox width={160} height={18} borderRadius={4} />
                <SkeletonBox width={65} height={16} borderRadius={4} />
              </View>

              {/* Price */}
              <SkeletonBox width={90} height={16} borderRadius={4} />

              {/* Location */}
              <View style={styles.locationRow}>
                <SkeletonBox width={16} height={16} borderRadius={8} />
                <SkeletonBox width={180} height={14} borderRadius={4} />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  topHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    gap: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  filterPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapArea: {
    flex: 1,
    backgroundColor: '#E8ECF2',
  },
  pinWrapper: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Math.round(SCREEN_HEIGHT * 0.52),
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    paddingTop: 12,
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
    gap: 20,
  },
  placeCard: {
    gap: 8,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

export default ExploreSkeleton;
