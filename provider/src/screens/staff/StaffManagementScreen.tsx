import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  BackHandler,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useStaffStore, useStaffLoading, StaffMember } from '../../context/StaffContext';
import { useProviderOnboarding } from '../../context/ProviderOnboardingContext';
import { useServiceDraft } from '../../context/ServiceDraftContext';
import { STAFF_SKELETON_MS } from '../../constants/staff.config';
import { triggerLightHaptic } from '../../utils/haptics';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';

import { ArrowLeft02Icon, UserGroup03Icon } from '../../components/staff/StaffIcons';
import { AdminRow } from '../../components/staff/AdminRow';
import { StaffCard } from '../../components/staff/StaffCard';
import { StaffManagementSkeleton } from '../../components/staff/StaffManagementSkeleton';
import { NoStaffIllustration } from '../../components/staff/NoStaffIllustration';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

/**
 * StaffManagementScreen
 *
 * Implements the 1:1 Figma Staff Management flow across 4 states:
 * 1. Loading: Shimmer skeleton placeholder (Admin row + 3 staff cards)
 * 2. M1: Empty state (owner hasn't selected "I don't have staff")
 * 3. M2: Empty list with "Add staff" pill (owner chose "I don't have staff")
 * 4. M3: Staff members list with "Add staff" pill and interactive cards
 */
export const StaffManagementScreen: React.FC = () => {
  const router = useRouter();

  // Shared app-level stores
  const { staff, ownerIsProvider, setOwnerIsProvider } = useStaffStore();
  const { ownerProfile } = useProviderOnboarding();
  const { resetDraft } = useServiceDraft();
  const isBackendLoading = useStaffLoading();

  // Skeleton display state (initial load delay to eliminate real-content flash)
  const [isSkeletonVisible, setIsSkeletonVisible] = useState<boolean>(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const mockTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Mock network loading delay (800-1200ms, defined in staff.config.ts)
    mockTimerRef.current = setTimeout(() => {
      setIsSkeletonVisible(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }, STAFF_SKELETON_MS);

    return () => {
      if (mockTimerRef.current) {
        clearTimeout(mockTimerRef.current);
      }
    };
  }, [fadeAnim]);

  // Back button handler: Always returns to dashboard and restarts wizard draft
  const handleBack = useCallback(() => {
    triggerLightHaptic();
    // Restart wizard draft if active
    resetDraft();
    // TODO (Skeleton): Route through global dashboard-entry mechanism when skeleton prompt is implemented
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/dashboard' as any);
    }
  }, [resetDraft, router]);

  // Android hardware back button handler
  useEffect(() => {
    const onBackPress = () => {
      handleBack();
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [handleBack]);

  // "Add staff" handler (navigates to Prompt 2 placeholder)
  const handleAddStaffPress = () => {
    triggerLightHaptic();
    router.push('/staff/add' as any);
  };

  // "I don't have staff" handler (sets ownerIsProvider = true, transitioning M1 -> M2)
  const handleNoStaffPress = () => {
    triggerLightHaptic();
    setOwnerIsProvider(true);
  };

  // Staff card tap handler (navigates to Prompt 3 placeholder)
  const handleStaffCardPress = (staffMember: StaffMember) => {
    triggerLightHaptic();
    router.push({
      pathname: '/staff/[id]',
      params: { id: staffMember.id },
    } as any);
  };

  const isLoading = isSkeletonVisible || isBackendLoading;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ── 1. Page Header (64px, 1:1 Figma Frame) ── */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.headerButton}
          onPress={handleBack}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Back to dashboard"
        >
          <ArrowLeft02Icon size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Staff Management</Text>

        {/* 48x48 balance spacer */}
        <View style={styles.headerButton} />
      </View>

      {/* ── 2. Screen Content ── */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <StaffManagementSkeleton />
        ) : (
          <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
            {/* ── Admin Section ── */}
            <AdminRow
              fullName={ownerProfile?.fullName}
              photoUri={ownerProfile?.photoUri}
            />

            {/* ── Staff Section ── */}
            {staff.length === 0 && !ownerIsProvider ? (
              /* ── State M1: No staff & owner hasn't chosen "I don't have staff" ── */
              <View style={styles.emptyStateSection}>
                <Text style={styles.staffLabelSmall}>Staff</Text>

                <View style={styles.emptyStateBody}>
                  {/* 150x150 Illustration */}
                  <View style={styles.illustrationWrapper}>
                    <NoStaffIllustration size={150} />
                  </View>

                  {/* Copy */}
                  <View style={styles.emptyCopyBox}>
                    <Text style={styles.emptyTitle}>No Staff Found</Text>
                    <Text style={styles.emptySubtitle}>
                      Add staffs who will provide your services to clients.
                    </Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.emptyActionButtons}>
                    {/* Dark Pill: Add staff */}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.darkActionButton}
                      onPress={handleAddStaffPress}
                      accessible
                      accessibilityRole="button"
                      accessibilityLabel="Add staff"
                    >
                      <Text style={styles.darkActionText}>Add staff</Text>
                    </TouchableOpacity>

                    {/* Light Pill: I dont have staffs */}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.lightActionButton}
                      onPress={handleNoStaffPress}
                      accessible
                      accessibilityRole="button"
                      accessibilityLabel="I dont have staffs"
                    >
                      <Text style={styles.lightActionText}>I dont have staffs</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              /* ── State M2 (ownerIsProvider=true, 0 staff) & M3 (staff exist) ── */
              <View style={styles.listSection}>
                {/* Header row: "Staff" (20px) + "Add staff" pill (138x40) */}
                <View style={styles.staffHeaderRow}>
                  <Text style={styles.staffHeaderTitle}>Staff</Text>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.addStaffPillButton}
                    onPress={handleAddStaffPress}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel="Add staff"
                  >
                    <Text style={styles.addStaffPillText}>Add staff</Text>
                    <UserGroup03Icon size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {/* Staff Cards Stack (M3) or Empty (M2) */}
                {staff.length > 0 && (
                  <View style={styles.staffCardsStack}>
                    {staff.map((member) => (
                      <StaffCard
                        key={member.id}
                        staff={member}
                        onPress={() => handleStaffCardPress(member)}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>

      {/* Android 3-Button Native Dock Protection Spacer */}
      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </SafeAreaView>
  );
};

export default StaffManagementScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  scrollArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },
  mainContent: {
    width: '100%',
    gap: 40,
  },
  // ── M1 Empty State ──
  emptyStateSection: {
    width: '100%',
    gap: 24,
  },
  staffLabelSmall: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  emptyStateBody: {
    alignItems: 'center',
    paddingTop: 24,
    gap: 32,
  },
  illustrationWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCopyBox: {
    width: '100%',
    maxWidth: 338,
    alignItems: 'center',
    gap: 16,
  },
  emptyTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: '#000000',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  emptyActionButtons: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    paddingTop: 16,
  },
  darkActionButton: {
    width: '100%',
    maxWidth: 319,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#858B94',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  darkActionText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },
  lightActionButton: {
    width: '100%',
    maxWidth: 319,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightActionText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  // ── M2 & M3 List State ──
  listSection: {
    width: '100%',
    gap: 24,
  },
  staffHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 40,
  },
  staffHeaderTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  addStaffPillButton: {
    width: 138,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    shadowColor: '#858B94',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  addStaffPillText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },
  staffCardsStack: {
    width: '100%',
    gap: 16,
  },
});
