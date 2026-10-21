import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  Animated,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import {
  useStaffMember,
  useStaffStore,
  deleteStaffPhotos,
} from '../../context/StaffContext';
import { STAFF_DETAIL_SKELETON_MS } from '../../constants/staff.config';
import { triggerLightHaptic } from '../../utils/haptics';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';

import { ArrowLeft02Icon } from '../../components/staff/StaffIcons';
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  ClockHour3Icon,
  Briefcase06Icon,
  AiBrain01Icon,
  CalendarDaysIcon,
  Dish01Icon,
  ShieldCheckOutlineIcon,
  BlueVerifiedBadgeIcon,
} from '../../components/staff/StaffFormIcons';

import { StaffDetailSkeleton } from '../../components/staff/StaffDetailSkeleton';
import { ReadOnlyStaffRoleSheet } from '../../components/staff/ReadOnlyStaffRoleSheet';
import { RemoveStaffDialog } from '../../components/staff/RemoveStaffDialog';

import { StaffWorkHoursSheet } from '../../components/staff/sheets/StaffWorkHoursSheet';
import { StaffRoleSheet } from '../../components/staff/sheets/StaffRoleSheet';
import { ExperienceSheet } from '../../components/staff/sheets/ExperienceSheet';
import { WorkDaysSheet } from '../../components/staff/sheets/WorkDaysSheet';
import { StaffBreakHoursSheet } from '../../components/staff/sheets/StaffBreakHoursSheet';

import { StaffPortfolioPanel } from '../../components/staff/StaffPortfolioPanel';
import { DeletePostDialog } from '../../components/DeletePostDialog';
import { LoadingOverlay } from '../../components/LoadingOverlay';

import {
  formatTimeRange,
  formatExperience,
  formatWorkDays,
  formatRoles,
} from '../../utils/staffFormatters';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

export const StaffDetailScreen: React.FC = () => {
  const router = useRouter();
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>();

  // Single source of truth: Staff store via useStaffMember hook
  const staffMember = useStaffMember(id || '');
  const { updateStaff, removeStaff, removePortfolioPhotos } = useStaffStore();

  // Tab state: "Bio" | "Portfolio" (defaults to query param if provided, e.g. returning from viewer)
  const [activeTab, setActiveTab] = useState<'bio' | 'portfolio'>(
    tab === 'portfolio' ? 'portfolio' : 'bio'
  );

  // Portfolio tab state lifted to screen level (single source of truth for header and actions)
  const [portfolioMode, setPortfolioMode] = useState<'view' | 'select'>('view');
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [isDeletePostDialogOpen, setIsDeletePostDialogOpen] = useState(false);
  const [isDeletingOverlayVisible, setIsDeletingOverlayVisible] = useState(false);

  // Skeleton loading lifecycle:
  // If returning from photo viewer (tab === 'portfolio'), skip skeleton to avoid flashing stale content
  const shouldSkipSkeleton = tab === 'portfolio';
  const [isSkeletonVisible, setIsSkeletonVisible] = useState<boolean>(!shouldSkipSkeleton);
  const fadeAnim = useRef(new Animated.Value(shouldSkipSkeleton ? 1 : 0)).current;
  const mockTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (shouldSkipSkeleton) return;

    mockTimerRef.current = setTimeout(() => {
      setIsSkeletonVisible(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }, STAFF_DETAIL_SKELETON_MS);

    return () => {
      if (mockTimerRef.current) {
        clearTimeout(mockTimerRef.current);
      }
    };
  }, [fadeAnim, shouldSkipSkeleton]);

  // Android hardware back handler:
  // If in select mode, exits select mode first before popping the screen
  useEffect(() => {
    const onBackPress = () => {
      if (activeTab === 'portfolio' && portfolioMode === 'select') {
        setPortfolioMode('view');
        setSelectedPhotoIds([]);
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [activeTab, portfolioMode]);

  // Sheet & Dialog visibility states
  const [isReadOnlyRoleSheetVisible, setIsReadOnlyRoleSheetVisible] = useState(false);
  const [isWorkHoursSheetVisible, setIsWorkHoursSheetVisible] = useState(false);
  const [isStaffRoleSheetVisible, setIsStaffRoleSheetVisible] = useState(false);
  const [isExperienceSheetVisible, setIsExperienceSheetVisible] = useState(false);
  const [isWorkDaysSheetVisible, setIsWorkDaysSheetVisible] = useState(false);
  const [isBreakHoursSheetVisible, setIsBreakHoursSheetVisible] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  // Navigation handlers
  const handleBack = useCallback(() => {
    triggerLightHaptic();
    router.back();
  }, [router]);

  const handleCancelSelectMode = useCallback(() => {
    triggerLightHaptic();
    setPortfolioMode('view');
    setSelectedPhotoIds([]);
  }, []);

  const handleVerifyNowPress = () => {
    triggerLightHaptic();
    // Opens placeholder route ("Verify staff — not designed") passing only the id
    router.push({
      pathname: '/staff/verify/[id]',
      params: { id: staffMember?.id || id || '' },
    } as any);
  };

  // Remove staff action handler (stub with mock delay, calls removeStaff, replaces route to list)
  const handleConfirmRemove = () => {
    if (!staffMember) return;
    triggerLightHaptic();

    // Mock network delay before removal
    // TODO (Backend): Replace with real API dispatch when connected
    setTimeout(() => {
      removeStaff(staffMember.id);
      setIsRemoveDialogOpen(false);
      // router.replace ensures this screen is not left in the stack
      router.replace('/staffs' as any);
    }, 400);
  };

  // Confirm delete photos action (P5 -> P6 -> P7)
  const handleConfirmDeletePhotos = async () => {
    if (!staffMember || selectedPhotoIds.length === 0) return;
    triggerLightHaptic();
    setIsDeletePostDialogOpen(false);
    setIsDeletingOverlayVisible(true);

    try {
      // Mock network delay (800-1200ms)
      // TODO (Backend): Replace with real API dispatch
      await deleteStaffPhotos(staffMember.id, selectedPhotoIds);
      removePortfolioPhotos(staffMember.id, selectedPhotoIds);
    } catch (_err) {
      // TODO (Backend): handle failure
    } finally {
      setIsDeletingOverlayVisible(false);
      setPortfolioMode('view');
      setSelectedPhotoIds([]);
    }
  };

  // Initial loading state: Render StaffDetailSkeleton
  if (isSkeletonVisible) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerButton}
            onPress={handleBack}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Back to staff management"
          >
            <ArrowLeft02Icon size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {staffMember?.name || 'Staff Member'}
          </Text>
          <View style={styles.headerButton} />
        </View>

        <StaffDetailSkeleton />
        <NativeDockSpacer backgroundColor="#FFFFFF" />
      </SafeAreaView>
    );
  }

  // Not found fallback (unknown ID or after removal)
  if (!staffMember) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerButton}
            onPress={handleBack}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Back to staff management"
          >
            <ArrowLeft02Icon size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Staff Detail</Text>
          <View style={styles.headerButton} />
        </View>

        <View style={styles.notFoundContent}>
          <Text style={styles.notFoundTitle}>Staff not found</Text>
          <Text style={styles.notFoundSubtitle}>
            This staff member does not exist or has been removed from your business.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.returnButton}
            onPress={() => router.replace('/staffs' as any)}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Return to Staff Management"
          >
            <Text style={styles.returnButtonText}>Return to Staff Management</Text>
          </TouchableOpacity>
        </View>

        <NativeDockSpacer backgroundColor="#FFFFFF" />
      </SafeAreaView>
    );
  }

  const staffRoles = staffMember.roles || (staffMember.role ? [staffMember.role] : []);
  const primaryRole = staffRoles[0] || 'Staff';
  const loginCodeDisplay = staffMember.loginCode || '1234';
  const staffAvatar = staffMember.photoUri || staffMember.avatarUri;
  const staffExperience = staffMember.experienceYears ?? staffMember.yearsExperience ?? 0;
  const isBreakTimeSet = Boolean(staffMember.breakHours?.start && staffMember.breakHours?.end);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── 1. Page Header (64px, back arrow, staff name title, Cancel or balance spacer) ── */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.headerButton}
          onPress={handleBack}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Back to staff management"
        >
          <ArrowLeft02Icon size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {staffMember.name}
        </Text>

        {/* Right Action: "Cancel" when in select mode on Portfolio tab (P4), else balance spacer */}
        {activeTab === 'portfolio' && portfolioMode === 'select' ? (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerCancelButton}
            onPress={handleCancelSelectMode}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Cancel photo selection mode"
          >
            <Text style={styles.headerCancelText}>Cancel</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButton} />
        )}
      </View>

      {/* ── 2. Scrollable Body Content ── */}
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Profile Card (358x290px, border radius 24px) ── */}
          <View style={styles.profileCard}>
            <View style={styles.profileCardInner}>
              {/* Avatar + Name */}
              <View style={styles.avatarSection}>
                <View style={styles.avatarCircle}>
                  {staffAvatar ? (
                    <Image
                      source={typeof staffAvatar === 'string' ? { uri: staffAvatar } : staffAvatar}
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    // TODO (Asset): Replace with exported staff headshot asset
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarPlaceholderInitial}>
                        {staffMember.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Name + Verified Badge (D2) */}
                <View style={styles.nameRow}>
                  <Text style={styles.staffNameText} numberOfLines={1}>
                    {staffMember.name}
                  </Text>
                  {staffMember.isVerified && (
                    <View
                      style={styles.verifiedBadgeWrapper}
                      accessible
                      accessibilityLabel="Verified staff"
                    >
                      <BlueVerifiedBadgeIcon size={20} />
                    </View>
                  )}
                </View>
              </View>

              {/* Two Columns: Staff Role & Login Code */}
              <View style={styles.cardColumnsRow}>
                {/* Left Column: Staff Role + Arrow Down */}
                <View style={styles.cardColumn}>
                  <Text style={styles.columnLabel}>Staff Role</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.roleValueButton}
                    onPress={() => {
                      triggerLightHaptic();
                      setIsReadOnlyRoleSheetVisible(true);
                    }}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel="Show roles"
                  >
                    <Text style={styles.columnValueText} numberOfLines={1}>
                      {primaryRole}
                    </Text>
                    <ArrowDown01Icon size={20} color="rgba(0, 8, 20, 0.96)" />
                  </TouchableOpacity>
                </View>

                {/* Vertical Divider Line */}
                <View style={styles.columnDivider} />

                {/* Right Column: Login Code */}
                <View style={styles.cardColumn}>
                  <Text style={styles.columnLabel}>Login Code</Text>
                  <Text style={styles.columnValueText}>{loginCodeDisplay}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ── Verification Banner (Only shown when !isVerified) ── */}
          {!staffMember.isVerified && (
            <LinearGradient
              colors={['rgba(236, 240, 246, 0.96)', 'rgba(255, 255, 255, 0.96)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0.8 }}
              style={styles.verificationBanner}
            >
              <View style={styles.bannerLeftContent}>
                <Text style={styles.bannerHeading}>
                  Win customer trust by verifying your staff
                </Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.verifyNowButton}
                  onPress={handleVerifyNowPress}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Verify now"
                >
                  <Text style={styles.verifyNowButtonText}>Verify now</Text>
                </TouchableOpacity>
              </View>

              {/* Banner Right Avatar with Blue Shield Badge Overlay */}
              <View style={styles.bannerRightGraphic}>
                <View style={styles.bannerAvatarCircle}>
                  {staffAvatar ? (
                    <Image
                      source={typeof staffAvatar === 'string' ? { uri: staffAvatar } : staffAvatar}
                      style={styles.bannerAvatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    // TODO (Asset): Replace with exported verification illustration
                    <View style={styles.bannerAvatarPlaceholder}>
                      <Text style={styles.bannerAvatarInitial}>
                        {staffMember.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.bannerBadgeOverlay}>
                    <BlueVerifiedBadgeIcon size={22} />
                  </View>
                </View>
              </View>
            </LinearGradient>
          )}

          {/* ── Segmented Control Tabs ("Bio" | "Portfolio") ── */}
          <View style={styles.segmentedContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.segmentTab,
                activeTab === 'bio' && styles.segmentTabActive,
              ]}
              onPress={() => {
                triggerLightHaptic();
                // Switching to Bio tab exits select mode per prompt specs
                if (portfolioMode === 'select') {
                  setPortfolioMode('view');
                  setSelectedPhotoIds([]);
                }
                setActiveTab('bio');
              }}
              accessible
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'bio' }}
              accessibilityLabel="Bio tab"
            >
              <Text
                style={[
                  styles.segmentTabText,
                  activeTab === 'bio'
                    ? styles.segmentTabTextActive
                    : styles.segmentTabTextInactive,
                ]}
              >
                Bio
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.segmentTab,
                activeTab === 'portfolio' && styles.segmentTabActive,
              ]}
              onPress={() => {
                triggerLightHaptic();
                setActiveTab('portfolio');
              }}
              accessible
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'portfolio' }}
              accessibilityLabel="Portfolio tab"
            >
              <Text
                style={[
                  styles.segmentTabText,
                  activeTab === 'portfolio'
                    ? styles.segmentTabTextActive
                    : styles.segmentTabTextInactive,
                ]}
              >
                Portfolio
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Content below tabs ── */}
          {activeTab === 'bio' ? (
            <View style={styles.bioContainer}>
              {/* Row 1: Work Hours */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.bioRow}
                onPress={() => {
                  triggerLightHaptic();
                  setIsWorkHoursSheetVisible(true);
                }}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Work hours, ${formatTimeRange(
                  staffMember.workHours
                )}, edit`}
              >
                <View style={styles.bioRowLeft}>
                  <View style={styles.iconCircle}>
                    <ClockHour3Icon size={24} />
                  </View>
                  <View style={styles.bioRowTextGroup}>
                    <Text style={styles.bioRowLabel}>Work Hours</Text>
                    <Text style={styles.bioRowValue}>
                      {formatTimeRange(staffMember.workHours)}
                    </Text>
                  </View>
                </View>
                <ArrowRight01Icon size={24} />
              </TouchableOpacity>

              {/* Row 2: Staff Role */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.bioRow}
                onPress={() => {
                  triggerLightHaptic();
                  setIsStaffRoleSheetVisible(true);
                }}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Staff role, ${formatRoles(
                  staffRoles
                )}, edit`}
              >
                <View style={styles.bioRowLeft}>
                  <View style={styles.iconCircle}>
                    <Briefcase06Icon size={24} color="#141B34" />
                  </View>
                  <View style={styles.bioRowTextGroup}>
                    <Text style={styles.bioRowLabel}>Staff Role</Text>
                    <Text style={styles.bioRowValue} numberOfLines={1}>
                      {formatRoles(staffRoles)}
                    </Text>
                  </View>
                </View>
                <ArrowRight01Icon size={24} />
              </TouchableOpacity>

              {/* Row 3: Experience */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.bioRow}
                onPress={() => {
                  triggerLightHaptic();
                  setIsExperienceSheetVisible(true);
                }}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Experience, ${formatExperience(
                  staffExperience
                )}, edit`}
              >
                <View style={styles.bioRowLeft}>
                  <View style={styles.iconCircle}>
                    <AiBrain01Icon size={24} color="#141B34" />
                  </View>
                  <View style={styles.bioRowTextGroup}>
                    <Text style={styles.bioRowLabel}>Experience</Text>
                    <Text style={styles.bioRowValue}>
                      {formatExperience(staffExperience)}
                    </Text>
                  </View>
                </View>
                <ArrowRight01Icon size={24} />
              </TouchableOpacity>

              {/* Row 4: Work Days */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.bioRow}
                onPress={() => {
                  triggerLightHaptic();
                  setIsWorkDaysSheetVisible(true);
                }}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Work days, ${formatWorkDays(
                  staffMember.workDays
                )}, edit`}
              >
                <View style={styles.bioRowLeft}>
                  <View style={styles.iconCircle}>
                    <CalendarDaysIcon size={24} color="#141B34" />
                  </View>
                  <View style={styles.bioRowTextGroup}>
                    <Text style={styles.bioRowLabel}>Work Days</Text>
                    <Text style={styles.bioRowValue} numberOfLines={1}>
                      {formatWorkDays(staffMember.workDays)}
                    </Text>
                  </View>
                </View>
                <ArrowRight01Icon size={24} />
              </TouchableOpacity>

              {/* Row 5: Break Time */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.bioRow}
                onPress={() => {
                  triggerLightHaptic();
                  setIsBreakHoursSheetVisible(true);
                }}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Break time, ${isBreakTimeSet ? formatTimeRange(staffMember.breakHours) : 'Not set'
                  }, edit`}
              >
                <View style={styles.bioRowLeft}>
                  <View style={styles.iconCircle}>
                    <Dish01Icon size={24} color="#141B34" />
                  </View>
                  <View style={styles.bioRowTextGroup}>
                    <Text style={styles.bioRowLabel}>Break Time</Text>
                    <Text
                      style={[
                        styles.bioRowValue,
                        !isBreakTimeSet && styles.bioRowValueUnset,
                      ]}
                    >
                      {formatTimeRange(staffMember.breakHours)}
                    </Text>
                  </View>
                </View>
                <ArrowRight01Icon size={24} />
              </TouchableOpacity>

              {/* Row 6: Verification Status (Non-tappable) */}
              <View style={styles.statusRow}>
                <View style={styles.bioRowLeft}>
                  <View style={styles.iconCircle}>
                    <ShieldCheckOutlineIcon size={24} color="#141B34" />
                  </View>
                  <Text style={styles.statusText}>
                    {staffMember.isVerified ? 'Verified' : 'Not Verified'}
                  </Text>
                </View>
              </View>

              {/* ── Remove Staff Button (Outlined pill with red text) ── */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.removeStaffButton}
                onPress={() => {
                  triggerLightHaptic();
                  setIsRemoveDialogOpen(true);
                }}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Remove staff member"
              >
                <Text style={styles.removeStaffButtonText}>Remove staff</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // ── Portfolio Tab Content (Prompt 4: P1-P4) ──
            <StaffPortfolioPanel
              staffMember={staffMember}
              mode={portfolioMode}
              selectedIds={selectedPhotoIds}
              onToggleSelect={(photoId) => {
                triggerLightHaptic();
                setSelectedPhotoIds((prev) =>
                  prev.includes(photoId)
                    ? prev.filter((id) => id !== photoId)
                    : [...prev, photoId]
                );
              }}
              onEnterSelectMode={() => {
                setPortfolioMode('select');
                setSelectedPhotoIds([]);
              }}
              onDeletePress={() => {
                setIsDeletePostDialogOpen(true);
              }}
              onPhotoPress={(photoIndex) => {
                router.push({
                  pathname: '/staff/[id]/photo/[index]',
                  params: { id: staffMember.id, index: photoIndex.toString() },
                } as any);
              }}
            />
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>

      {/* ── 3. Sheets & Modals ── */}

      {/* Read-only Staff Role Sheet (D3) */}
      <ReadOnlyStaffRoleSheet
        visible={isReadOnlyRoleSheetVisible}
        roles={staffRoles}
        onClose={() => setIsReadOnlyRoleSheetVisible(false)}
      />

      {/* Edit Work Hours Sheet (E1) */}
      <StaffWorkHoursSheet
        visible={isWorkHoursSheetVisible}
        currentWorkHours={staffMember.workHours}
        onClose={() => setIsWorkHoursSheetVisible(false)}
        onApply={(workHours) => {
          updateStaff(staffMember.id, { workHours });
          setIsWorkHoursSheetVisible(false);
        }}
      />

      {/* Edit Staff Role Sheet (E2) */}
      <StaffRoleSheet
        visible={isStaffRoleSheetVisible}
        mode="edit"
        currentRoles={staffRoles}
        onClose={() => setIsStaffRoleSheetVisible(false)}
        onConfirmRoles={(roles) => {
          updateStaff(staffMember.id, { roles });
          setIsStaffRoleSheetVisible(false);
        }}
      />

      {/* Edit Experience Sheet (E3) */}
      <ExperienceSheet
        visible={isExperienceSheetVisible}
        mode="edit"
        currentYears={staffExperience}
        onClose={() => setIsExperienceSheetVisible(false)}
        onConfirm={(years) => {
          updateStaff(staffMember.id, {
            experienceYears: years,
            yearsExperience: years,
          });
          setIsExperienceSheetVisible(false);
        }}
      />

      {/* Edit Work Days Sheet (E4) */}
      <WorkDaysSheet
        visible={isWorkDaysSheetVisible}
        mode="edit"
        selectedDays={staffMember.workDays || []}
        onClose={() => setIsWorkDaysSheetVisible(false)}
        onConfirm={(days) => {
          updateStaff(staffMember.id, { workDays: days });
          setIsWorkDaysSheetVisible(false);
        }}
      />

      {/* Edit Break Hours Sheet (E5) */}
      <StaffBreakHoursSheet
        visible={isBreakHoursSheetVisible}
        currentBreakHours={staffMember.breakHours}
        onClose={() => setIsBreakHoursSheetVisible(false)}
        onApply={(breakHours) => {
          updateStaff(staffMember.id, { breakHours });
          setIsBreakHoursSheetVisible(false);
        }}
      />

      {/* Confirmation Dialog: Remove Staff */}
      <RemoveStaffDialog
        visible={isRemoveDialogOpen}
        staffName={staffMember.name}
        onConfirm={handleConfirmRemove}
        onCancel={() => setIsRemoveDialogOpen(false)}
      />

      {/* 1:1 Figma Confirmation Dialog: Delete Post? (P5) */}
      <DeletePostDialog
        visible={isDeletePostDialogOpen}
        title="Delete Post?"
        description="This post will be deleted from your staff profile and it can not be undone."
        confirmText="Yes, Delete"
        cancelText="No, Cancel."
        onCancel={() => {
          // Per Figma connection (P5 -> P2): Cancel exits select mode
          setIsDeletePostDialogOpen(false);
          setPortfolioMode('view');
          setSelectedPhotoIds([]);
        }}
        onConfirm={handleConfirmDeletePhotos}
      />

      {/* 1:1 Figma Deleting Loader Screen (P6: 4 dots pulsing overlay) */}
      <LoadingOverlay
        visible={isDeletingOverlayVisible}
        dotsCount={4}
        paddingTop={429}
        dotSize={16}
        dotGap={20}
        overlayOpacity={0.1}
      />

      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </SafeAreaView>
  );
};

export default StaffDetailScreen;

const styles = StyleSheet.create({
  container: {
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
  headerCancelButton: {
    height: 48,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCancelText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  headerTitle: {
    flex: 1,
    fontFamily: FONT_MEDIUM,
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  animatedContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },

  /* Profile Card */
  profileCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    padding: 16,
  },
  profileCardInner: {
    alignItems: 'center',
    gap: 32,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 96,
    height: 96,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(236, 240, 246, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderInitial: {
    fontFamily: FONT_MEDIUM,
    fontSize: 32,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  staffNameText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  verifiedBadgeWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Profile Columns */
  cardColumnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  cardColumn: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 8,
  },
  columnLabel: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  roleValueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  columnValueText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  columnDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginHorizontal: 16,
  },

  /* Verification Banner */
  verificationBanner: {
    width: '100%',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 149,
    overflow: 'hidden',
  },
  bannerLeftContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: 12,
    gap: 16,
  },
  bannerHeading: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(248, 155, 24, 0.96)',
  },
  verifyNowButton: {
    width: 115,
    height: 32,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyNowButtonText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },
  bannerRightGraphic: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerAvatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    position: 'relative',
  },
  bannerAvatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  bannerAvatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerAvatarInitial: {
    fontFamily: FONT_MEDIUM,
    fontSize: 32,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  bannerBadgeOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 2,
  },

  /* Segmented Control */
  segmentedContainer: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  segmentTab: {
    flex: 1,
    height: 40,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentTabActive: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#858B94',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  segmentTabText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  segmentTabTextActive: {
    color: '#000000',
    fontWeight: '500',
  },
  segmentTabTextInactive: {
    color: 'rgba(96, 96, 102, 0.96)',
    fontWeight: '500',
  },

  /* Bio Content */
  bioContainer: {
    width: '100%',
    gap: 20,
    paddingTop: 8,
  },
  bioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
  },
  bioRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
    paddingRight: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bioRowTextGroup: {
    flex: 1,
    gap: 4,
  },
  bioRowLabel: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  bioRowValue: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  bioRowValueUnset: {
    color: 'rgba(96, 96, 102, 0.96)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
  },
  statusText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },

  /* Remove Staff Button */
  removeStaffButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  removeStaffButtonText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(204, 41, 41, 0.9)',
  },

  /* Not Found */
  notFoundContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  notFoundTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 20,
    lineHeight: 28,
    color: '#000814',
    textAlign: 'center',
  },
  notFoundSubtitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  returnButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  returnButtonText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
