import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { useBottomInset } from '../../utils/bottomInset';

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

export const StaffMessagesSkeleton: React.FC = () => {
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
    <ScrollView
      style={styles.contentScrollView}
      contentContainerStyle={[
        styles.scrollContentContainer,
        { paddingBottom: tabScrollPadding },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.conversationsList}>
        {skeletonRows.map((item) => (
          <View key={item.id} style={styles.conversationRow}>
            {/* Avatar Placeholder: 48x48 */}
            <SkeletonItem width={48} height={48} borderRadius={24} />

            <View style={styles.conversationContent}>
              <View style={styles.leftCol}>
                <View style={styles.nameAndTagRow}>
                  <SkeletonItem width={item.nameWidth} height={16} borderRadius={4} />
                  <View style={styles.verticalDivider} />
                  <SkeletonItem width={38} height={16} borderRadius={4} />
                </View>
                <SkeletonItem width={item.msgWidth} height={14} borderRadius={4} style={{ marginTop: 6 }} />
              </View>

              <View style={styles.rightCol}>
                <SkeletonItem width={36} height={12} borderRadius={4} />
                {item.hasBadge ? (
                  <SkeletonItem width={20} height={20} borderRadius={10} style={{ marginTop: 8 }} />
                ) : (
                  <View style={styles.badgeSpacer} />
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default StaffMessagesSkeleton;

const styles = StyleSheet.create({
  contentScrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  conversationsList: {
    gap: 16,
  },
  conversationRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  conversationContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftCol: {
    flex: 1,
    justifyContent: 'center',
  },
  nameAndTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verticalDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
  },
  badgeSpacer: {
    height: 20,
    marginTop: 8,
  },
});
