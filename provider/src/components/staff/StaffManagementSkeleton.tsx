import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import { AdminRow } from './AdminRow';
import { StaffCard } from './StaffCard';

/**
 * 1:1 Figma Staff Management Skeleton Loader
 *
 * Implements:
 * - Admin row skeleton (using real card sizes via skeleton prop)
 * - "Staff" header row skeleton
 * - 3 staff card placeholders (using real card sizes via skeleton prop)
 * - Subtle opacity pulse loop (native animated driver, no external library)
 * - Respects reduced motion settings
 */
export const StaffManagementSkeleton: React.FC = () => {
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
    <View
      style={styles.container}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading staff"
    >
      {/* ── 1. Admin Section Placeholder ── */}
      <AdminRow skeleton pulseOpacity={pulseAnim} />

      {/* ── 2. Staff Header Row Placeholder ── */}
      <View style={styles.staffHeaderRow}>
        <Animated.View style={[styles.staffTitleSkeleton, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.staffButtonSkeleton, { opacity: pulseAnim }]} />
      </View>

      {/* ── 3. Staff Cards Placeholders (3 real card size instances) ── */}
      <View style={styles.cardsStack}>
        <StaffCard skeleton pulseOpacity={pulseAnim} />
        <StaffCard skeleton pulseOpacity={pulseAnim} />
        <StaffCard skeleton pulseOpacity={pulseAnim} />
      </View>
    </View>
  );
};

export default StaffManagementSkeleton;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 24,
    gap: 32,
  },
  staffHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 40,
  },
  staffTitleSkeleton: {
    width: 60,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#E4E7EC',
  },
  staffButtonSkeleton: {
    width: 138,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#E4E7EC',
  },
  cardsStack: {
    width: '100%',
    gap: 16,
  },
});
