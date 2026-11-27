import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Platform,
  AccessibilityInfo,
} from 'react-native';

export interface StaffDetailSkeletonProps {
  isVerified?: boolean;
}

/**
 * 1:1 Figma Staff Detail Skeleton Loader (from the note card)
 *
 * Implements:
 * - Profile card skeleton (avatar 96x96, name, 2 columns with divider)
 * - Banner skeleton (shown when unverified)
 * - Tabs segmented control skeleton (358x48)
 * - 5 Bio rows skeleton (40x40 icon circle, label and value bars, right chevron)
 * - Remove button skeleton
 * - Subtle opacity pulse loop using native driver
 * - Reduced motion accessibility awareness
 */
export const StaffDetailSkeleton: React.FC<StaffDetailSkeletonProps> = ({
  isVerified = false,
}) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const animLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((reducedMotion) => {
      if (!isMounted) return;
      if (reducedMotion) {
        pulseAnim.setValue(0.7);
        return;
      }

      animLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.95,
            duration: 750,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 750,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      );

      animLoopRef.current.start();
    });

    return () => {
      isMounted = false;
      if (animLoopRef.current) {
        animLoopRef.current.stop();
      }
    };
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      {/* ── 1. Profile Card Skeleton (358x290, radius 24) ── */}
      <View style={styles.profileCard}>
        {/* Avatar circle 96x96 */}
        <Animated.View style={[styles.avatarCircle, { opacity: pulseAnim }]} />

        {/* Staff name */}
        <Animated.View style={[styles.nameBar, { opacity: pulseAnim }]} />

        {/* Two columns tag row */}
        <View style={styles.tagsRow}>
          <View style={styles.tagCol}>
            <Animated.View style={[styles.colLabel, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.colValue, { opacity: pulseAnim }]} />
          </View>

          <View style={styles.colDivider} />

          <View style={styles.tagCol}>
            <Animated.View style={[styles.colLabel, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.colValue, { opacity: pulseAnim }]} />
          </View>
        </View>
      </View>

      {/* ── 2. Verification Banner Skeleton (only when not verified, 358x149) ── */}
      {!isVerified && (
        <Animated.View style={[styles.bannerSkeleton, { opacity: pulseAnim }]} />
      )}

      {/* ── 3. Tabs Segmented Control Skeleton (358x48) ── */}
      <Animated.View style={[styles.tabsSkeleton, { opacity: pulseAnim }]} />

      {/* ── 4. Five Bio Rows Skeleton ── */}
      <View style={styles.rowsContainer}>
        {[0, 1, 2, 3, 4].map((idx) => (
          <View key={idx} style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <Animated.View style={[styles.iconCircle, { opacity: pulseAnim }]} />
              <View style={styles.rowTextCol}>
                <Animated.View style={[styles.rowLabel, { opacity: pulseAnim }]} />
                <Animated.View style={[styles.rowValue, { opacity: pulseAnim }]} />
              </View>
            </View>
            <Animated.View style={[styles.chevronBox, { opacity: pulseAnim }]} />
          </View>
        ))}
      </View>

      {/* ── 5. Remove Button Skeleton ── */}
      <Animated.View style={[styles.removeButtonSkeleton, { opacity: pulseAnim }]} />
    </View>
  );
};

export default StaffDetailSkeleton;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 26,
  },
  profileCard: {
    width: '100%',
    height: 290,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E4E7EC',
    marginTop: 8,
  },
  nameBar: {
    width: 140,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#E4E7EC',
  },
  tagsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  tagCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  colLabel: {
    width: 68,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E4E7EC',
  },
  colValue: {
    width: 80,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#E4E7EC',
  },
  colDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginHorizontal: 16,
  },
  bannerSkeleton: {
    width: '100%',
    height: 149,
    borderRadius: 24,
    backgroundColor: '#EAECF0',
    marginBottom: 40,
  },
  tabsSkeleton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    marginBottom: 40,
  },
  rowsContainer: {
    width: '100%',
    gap: 24,
    marginBottom: 34,
  },
  rowItem: {
    width: '100%',
    height: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  rowTextCol: {
    gap: 6,
  },
  rowLabel: {
    width: 80,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E4E7EC',
  },
  rowValue: {
    width: 150,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#E4E7EC',
  },
  chevronBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#E4E7EC',
  },
  removeButtonSkeleton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    marginBottom: 24,
  },
});
