import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkeletonBox } from './HomeSkeleton';

export const MessagesSkeleton = () => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Top Screen Header ── */}
      <View style={styles.headerContainer}>
        <SkeletonBox width={120} height={28} borderRadius={6} />
      </View>

      {/* Top Divider */}
      <View style={styles.topDivider} />

      {/* ── Messages List ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Platform.OS === 'ios' ? 120 : 90 + insets.bottom },
        ]}
      >
        {[1, 2, 3, 4, 5, 6].map((item, index) => (
          <View key={item} style={styles.itemWrapper}>
            <View style={styles.messageRow}>
              {/* Avatar (48x48 circle) */}
              <SkeletonBox width={48} height={48} borderRadius={24} />

              {/* Message Content & Indicators */}
              <View style={styles.messageCenterGroup}>
                {/* Left: Name & Snippet */}
                <View style={styles.textContent}>
                  <SkeletonBox width={150} height={16} borderRadius={4} />
                  <SkeletonBox width={210} height={13} borderRadius={4} style={{ marginTop: 6 }} />
                </View>

                {/* Right: Time & Badge */}
                <View style={styles.metaGroup}>
                  <SkeletonBox width={40} height={12} borderRadius={4} />
                  <SkeletonBox width={18} height={18} borderRadius={9} style={{ marginTop: 6 }} />
                </View>
              </View>
            </View>

            {/* Inset Divider Line */}
            {index < 5 && <View style={styles.itemDivider} />}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  topDivider: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  listContent: {
    paddingTop: 8,
  },
  itemWrapper: {
    paddingHorizontal: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  messageCenterGroup: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContent: {
    flex: 1,
    paddingRight: 12,
  },
  metaGroup: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  itemDivider: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginLeft: 62,
  },
});

export default MessagesSkeleton;
