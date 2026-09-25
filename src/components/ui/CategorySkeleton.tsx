import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkeletonBox } from './HomeSkeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const CategorySkeleton = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <SkeletonBox width={40} height={40} borderRadius={20} />
        <SkeletonBox width={100} height={20} borderRadius={6} />
        <View style={{ width: 40 }} />
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchContainer}>
        <SkeletonBox width="100%" height={48} borderRadius={24} />
      </View>

      {/* ── Tabs Row ── */}
      <View style={styles.tabsContainer}>
        <View style={styles.servicesTabWrapper}>
          <SkeletonBox width={65} height={16} borderRadius={4} />
        </View>
        <View style={styles.menWomenWrapper}>
          <SkeletonBox width={70} height={28} borderRadius={14} />
          <SkeletonBox width={80} height={28} borderRadius={14} />
        </View>
      </View>

      {/* ── Main Content Area ── */}
      <View style={styles.contentArea}>
        {/* Left Sidebar */}
        <View style={styles.sidebar}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={styles.sidebarItem}>
              <SkeletonBox width={54} height={54} borderRadius={12} style={{ marginBottom: 6 }} />
              <SkeletonBox width={50} height={10} borderRadius={4} />
            </View>
          ))}
        </View>

        {/* Right Content Grid */}
        <View style={styles.mainGridArea}>
          <View style={styles.gridContainer}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <View key={i} style={styles.serviceCard}>
                <SkeletonBox width="100%" height={92} borderRadius={16} style={{ marginBottom: 8 }} />
                <SkeletonBox width="85%" height={12} borderRadius={4} style={{ marginBottom: 4 }} />
                <SkeletonBox width="55%" height={10} borderRadius={4} />
              </View>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  servicesTabWrapper: {
    width: 110,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(235, 235, 245, 0.96)',
    height: '100%',
  },
  menWomenWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  contentArea: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 110,
    borderRightWidth: 1,
    borderRightColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    paddingVertical: 12,
    alignItems: 'center',
  },
  sidebarItem: {
    alignItems: 'center',
    marginBottom: 16,
  },
  mainGridArea: {
    flex: 1,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  serviceCard: {
    width: '47%',
    marginBottom: 12,
  },
});

export default CategorySkeleton;
