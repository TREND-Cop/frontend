import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

import { useStaffProfile } from '../../context/StaffProfileContext';
import { useStaffUnreadNotificationCount } from '../../hooks/useStaffUnreadNotificationCount';
import {
  useStaffProfileSkeleton,
  markStaffProfileChildNavigation,
} from '../../hooks/useStaffProfileSkeleton';
import { StaffProfileSkeleton } from '../../components/staff/StaffProfileSkeleton';
import { typography, colors } from '../../constants/theme';
import { STAFF_ROUTES } from '../../constants/staffRoutes';
import { triggerLightHaptic } from '../../utils/haptics';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { useBottomInset } from '../../utils/bottomInset';
import { useNativeBackExitGuard } from '../../utils/exitAppGuard';
import {
  ClockHour3Icon,
  Briefcase06Icon,
  AiBrain01Icon,
  CalendarDaysIcon,
  Dish01Icon,
  ShieldCheckOutlineIcon,
} from '../../components/staff/StaffFormIcons';

// ── 1:1 Vector Icons ──────────────────────────────────────────────────────────

function StaffBadgeIcon({ size = 16, color = 'rgba(12, 121, 12, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Rect x="1.5" y="2.5" width="13" height="11" rx="2" stroke={color} strokeWidth="1" />
      <Circle cx="5.5" cy="6.5" r="1.75" stroke={color} strokeWidth="1" />
      <Path d="M3 11.5c0-1.5 1.25-2.25 2.5-2.25s2.5.75 2.5 2.25" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <Path d="M9.5 6.5h3.5M9.5 9.5h2.5" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </Svg>
  );
}

function NotificationRowBellIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C8.686 2 6 4.686 6 8v4.27l-1.7 2.55A1 1 0 005.13 16h13.74a1 1 0 00.83-1.55L18 12.27V8c0-3.314-2.686-6-6-6z"
        stroke="rgba(192, 192, 204, 0.96)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.5 19a2.5 2.5 0 005 0"
        stroke="rgba(192, 192, 204, 0.96)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PolicyRowIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 4v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6a2 2 0 00-2 2z"
        stroke="rgba(192, 192, 204, 0.96)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14 2v6h6M8 13h8M8 17h5"
        stroke="rgba(192, 192, 204, 0.96)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function RowChevronIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18l6-6-6-6"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LogoutSquareIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
        stroke="rgba(204, 41, 41, 0.9)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 17l5-5-5-5M21 12H9"
        stroke="rgba(204, 41, 41, 0.9)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Tab Bar Nav Icons ──

function DashboardNavIcon({ size = 24, active = false }: { size?: number; active?: boolean }) {
  const color = active ? 'rgba(0, 8, 20, 0.96)' : 'rgba(96, 96, 102, 0.96)';
  const strokeColor = active ? color : 'rgba(192, 192, 204, 0.96)';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7.5" height="7.5" rx="2" fill={active ? color : 'none'} stroke={strokeColor} strokeWidth="1.5" />
      <Rect x="13.5" y="3" width="7.5" height="7.5" rx="2" fill={active ? color : 'none'} stroke={strokeColor} strokeWidth="1.5" />
      <Rect x="3" y="13.5" width="7.5" height="7.5" rx="2" fill={active ? color : 'none'} stroke={strokeColor} strokeWidth="1.5" />
      <Rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" fill={active ? color : 'none'} stroke={strokeColor} strokeWidth="1.5" />
    </Svg>
  );
}

function ChattingNavIcon({ size = 24, active = false }: { size?: number; active?: boolean }) {
  const color = active ? 'rgba(0, 8, 20, 0.96)' : 'rgba(96, 96, 102, 0.96)';
  const strokeColor = active ? color : 'rgba(192, 192, 204, 0.96)';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12C2 7.029 6.029 3 11 3h2c4.971 0 9 4.029 9 9 0 4.971-4.029 9-9 9H8l-4.5 1.5L5 18C3.12 16.32 2 14.28 2 12z"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M8 10h8M8 14h5" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function ProfileActiveNavIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Filled circle with white inner strokes per spec */}
      <Circle cx="12" cy="12" r="10" fill="rgba(0, 8, 20, 0.96)" />
      <Circle cx="12" cy="9" r="3" stroke="#FFFFFF" strokeWidth="1.5" />
      <Path
        d="M6.5 18c1.5-2.5 3.5-3.5 5.5-3.5s4 1 5.5 3.5"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function StaffProfileScreen() {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { fullName, loginCode, bio } = useStaffProfile();
  const unreadCount = useStaffUnreadNotificationCount();
  const { isLoading } = useStaffProfileSkeleton();

  // State-driven switch between 'profile' and 'bio'
  const [activeSegment, setActiveSegment] = useState<'profile' | 'bio'>('profile');

  // Bottom navigation offset & sizing via centralized useBottomInset
  const { tabBottomOffset, tabScrollPadding, bottomFadeHeight } = useBottomInset();

  const handleNotificationPress = () => {
    triggerLightHaptic();
    markStaffProfileChildNavigation();
    safeRouter.push(STAFF_ROUTES.NOTIFICATIONS as any);
  };

  const handlePrivacyTermsPress = () => {
    triggerLightHaptic();
    markStaffProfileChildNavigation();
    safeRouter.push(STAFF_ROUTES.TERMS_POLICY as any);
  };

  const handleLogoutPress = () => {
    triggerLightHaptic();
    markStaffProfileChildNavigation();
    safeRouter.push(STAFF_ROUTES.LOGOUT as any);
  };

  // Android Native Back Button Guard:
  // - Prompts user with in-built Exit Confirmation Dialog; directing them to use in-app back buttons.
  useNativeBackExitGuard();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabScrollPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <StaffProfileSkeleton />
        ) : (
          <View style={styles.content}>
            {/* ── 1. Page Title ("Profile" / "Staff Bio") ── */}
            <View style={styles.titleRow}>
              <Text style={styles.pageTitle}>
                {activeSegment === 'profile' ? 'Profile' : 'Staff Bio'}
              </Text>
            </View>

            {/* ── 2. Profile Card (Frame 1000006524: 358x230) ── */}
            <View style={styles.profileCard}>
              {/* Green "Staff" Chip (top-right: 74x28) */}
              <View style={styles.staffChip}>
                <StaffBadgeIcon size={16} color="rgba(12, 121, 12, 0.96)" />
                <Text style={styles.staffChipText}>Staff</Text>
              </View>

              {/* Avatar Circle (109x109) */}
              <View style={styles.avatarWrapper}>
                {bio.avatar ? (
                  <Image
                    source={bio.avatar}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarPlaceholderText}>
                      {fullName ? fullName.charAt(0).toUpperCase() : 'S'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Name & Login Code Block */}
              <View style={styles.profileTextBlock}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {fullName}
                </Text>
                <View style={styles.loginCodeRow}>
                  <Text style={styles.loginCodeText}>
                    Login code: {loginCode}
                  </Text>
                </View>
              </View>
            </View>

            {/* ── 3. Segmented Control (Frame 1000006418: 358x48) ── */}
            <View style={styles.segmentedControl}>
              {/* Profile Segment Option */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  triggerLightHaptic();
                  setActiveSegment('profile');
                }}
                style={[
                  styles.segmentOption,
                  activeSegment === 'profile' && styles.segmentOptionActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentOptionText,
                    activeSegment === 'profile'
                      ? styles.segmentOptionTextActive
                      : styles.segmentOptionTextInactive,
                  ]}
                >
                  Profile
                </Text>
              </TouchableOpacity>

              {/* Staff Bio Segment Option */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  triggerLightHaptic();
                  setActiveSegment('bio');
                }}
                style={[
                  styles.segmentOption,
                  activeSegment === 'bio' && styles.segmentOptionActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentOptionText,
                    activeSegment === 'bio'
                      ? styles.segmentOptionTextActive
                      : styles.segmentOptionTextInactive,
                  ]}
                >
                  Staff Bio
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── 4. State-Driven Body Content ── */}
            {activeSegment === 'profile' ? (
              /* SCREEN 1: Profile Segment Content */
              <View style={styles.accountInfoSection}>
                <Text style={styles.accountInfoHeader}>Account information</Text>

                {/* Account Settings List Card (358x133) */}
                <View style={styles.listCard}>
                  {/* Row 1: Notification */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleNotificationPress}
                    style={styles.listRow}
                  >
                    <View style={styles.listRowLeft}>
                      <NotificationRowBellIcon size={24} />
                      <Text style={styles.listRowLabel}>Notification</Text>
                    </View>

                    <View style={styles.listRowRight}>
                      {unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadBadgeText}>
                            {unreadCount}
                          </Text>
                        </View>
                      )}
                      <RowChevronIcon size={24} />
                    </View>
                  </TouchableOpacity>

                  {/* Divider Line */}
                  <View style={styles.listCardDivider} />

                  {/* Row 2: Terms of Service */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handlePrivacyTermsPress}
                    style={styles.listRow}
                  >
                    <View style={styles.listRowLeft}>
                      <PolicyRowIcon size={24} />
                      <Text style={styles.listRowLabel}>Terms of Service</Text>
                    </View>

                    <View style={styles.listRowRight}>
                      <RowChevronIcon size={24} />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Red Logout Row (358x56) */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleLogoutPress}
                  style={styles.logoutRow}
                >
                  <LogoutSquareIcon size={24} />
                  <Text style={styles.logoutRowText}>Logout</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* SCREEN 2: Staff Bio Segment Content (6 rows) */
              <View style={styles.bioListSection}>
                {/* Row 1: Work Hours */}
                <View style={styles.bioRow}>
                  <View style={styles.bioIconTile}>
                    <ClockHour3Icon size={24} color="#141B34" />
                  </View>
                  <View style={styles.bioTextCol}>
                    <Text style={styles.bioLabel}>Work Hours</Text>
                    <Text style={styles.bioValue}>{bio.workHours || '8:30am - 8:30pm'}</Text>
                  </View>
                </View>

                {/* Row 2: Staff Role */}
                <View style={styles.bioRow}>
                  <View style={styles.bioIconTile}>
                    <Briefcase06Icon size={24} color="#141B34" />
                  </View>
                  <View style={styles.bioTextCol}>
                    <Text style={styles.bioLabel}>Staff Role</Text>
                    <Text style={styles.bioValue}>{bio.staffRole || 'Nail Artist & Barber'}</Text>
                  </View>
                </View>

                {/* Row 3: Experience */}
                <View style={styles.bioRow}>
                  <View style={styles.bioIconTile}>
                    <AiBrain01Icon size={24} color="#141B34" />
                  </View>
                  <View style={styles.bioTextCol}>
                    <Text style={styles.bioLabel}>Experience</Text>
                    <Text style={styles.bioValue}>{bio.experience || '5 Years experience'}</Text>
                  </View>
                </View>

                {/* Row 4: Work Days */}
                <View style={styles.bioRow}>
                  <View style={styles.bioIconTile}>
                    <CalendarDaysIcon size={24} color="#141B34" />
                  </View>
                  <View style={styles.bioTextCol}>
                    <Text style={styles.bioLabel}>Work Days</Text>
                    <Text style={styles.bioValue}>{bio.workDays || 'Monday, Wednesday, Sunday'}</Text>
                  </View>
                </View>

                {/* Row 5: Break Time */}
                <View style={styles.bioRow}>
                  <View style={styles.bioIconTile}>
                    <Dish01Icon size={24} color="#141B34" />
                  </View>
                  <View style={styles.bioTextCol}>
                    <Text style={styles.bioLabel}>Break Time</Text>
                    <Text style={styles.bioValue}>{bio.breakTime || '12:00:00pm'}</Text>
                  </View>
                </View>

                {/* Row 6: Verification Status (Shield check, no label, not tappable) */}
                <View style={styles.bioRow}>
                  <View style={styles.bioIconTile}>
                    <ShieldCheckOutlineIcon size={24} color="#141B34" />
                  </View>
                  <View style={styles.bioTextCol}>
                    <Text style={styles.bioVerificationValue}>
                      {bio.isVerified ? 'Verified' : 'Not Verified'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* ── Stationary Floating Bottom Tab Bar (Profile ACTIVE) ── */}
      <View style={styles.bottomFixedContainer} pointerEvents="box-none">
        {/* Backdrop Fade & Solid White Shield to mask scrolling content */}
        <View
          style={[
            styles.bottomBackdropShield,
            { height: bottomFadeHeight },
          ]}
          pointerEvents="none"
        >
          {Platform.OS === 'ios' && (
            <BlurView intensity={25} tint="light" style={StyleSheet.absoluteFill} />
          )}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.85)', '#FFFFFF']}
            locations={[0, 0.4, 1.0]}
            style={styles.backdropGradient}
          />
          <View style={styles.backdropSolidWhite} />
        </View>

        {/* Tab Bar Frame (width: 300px, height: 80px, radius: 40px) */}
        <View style={[styles.bottomNavContainer, { bottom: tabBottomOffset }]} pointerEvents="box-none">
          <View style={styles.bottomNavBar}>
            {/* Tab 1: Dashboard */}
            <TouchableOpacity
              style={styles.navTabItem}
              activeOpacity={0.8}
              onPress={() => {
                triggerLightHaptic();
                safeRouter.replace(STAFF_ROUTES.HOME as any);
              }}
            >
              <View style={styles.navTabContent}>
                <DashboardNavIcon size={24} active={false} />
                <Text style={[styles.navTabText, styles.navTabTextInactive]}>
                  Dashboard
                </Text>
              </View>
            </TouchableOpacity>

            {/* Tab 2: Messages */}
            <TouchableOpacity
              style={styles.navTabItem}
              activeOpacity={0.8}
              onPress={() => {
                triggerLightHaptic();
                safeRouter.replace(STAFF_ROUTES.MESSAGES as any);
              }}
            >
              <View style={styles.navTabContent}>
                <ChattingNavIcon size={24} active={false} />
                <Text style={[styles.navTabText, styles.navTabTextInactive]}>
                  Messages
                </Text>
              </View>
            </TouchableOpacity>

            {/* Tab 3: Profile (ACTIVE) */}
            <TouchableOpacity
              style={styles.navTabItem}
              activeOpacity={0.8}
              onPress={() => {
                triggerLightHaptic();
              }}
            >
              <View style={styles.navTabContent}>
                <ProfileActiveNavIcon size={24} />
                <Text style={[styles.navTabText, styles.navTabTextActive]}>
                  Profile
                </Text>
              </View>

              {/* Active Indicator Bar: Rectangle 299 (width: 41px, height: 5px, radius: 8px) */}
              <View style={styles.activeTabIndicator} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <NativeDockSpacer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    alignItems: 'center',
  },
  titleRow: {
    width: '100%',
    maxWidth: 358,
    height: 32,
    marginBottom: 24,
    justifyContent: 'center',
  },
  pageTitle: {
    ...typography.h1Med,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.1,
    color: '#000000',
  },
  profileCard: {
    width: '100%',
    maxWidth: 358,
    height: 230,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
    marginBottom: 24,
  },
  staffChip: {
    position: 'absolute',
    top: 17,
    right: 16,
    width: 74,
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 8,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    borderRadius: 16,
  },
  staffChipText: {
    ...typography.label,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(12, 121, 12, 0.96)',
  },
  avatarWrapper: {
    width: 109,
    height: 109,
    borderRadius: 55,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 19,
  },
  avatarImage: {
    width: 109,
    height: 109,
    borderRadius: 55,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    ...typography.h1Med,
    fontSize: 36,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  profileTextBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    ...typography.bodyMed,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    textAlign: 'center',
  },
  loginCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginCodeText: {
    ...typography.label,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  segmentedControl: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    marginBottom: 32,
  },
  segmentOption: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  segmentOptionActive: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(133, 139, 148, 0.16)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  segmentOptionText: {
    ...typography.button,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  segmentOptionTextActive: {
    color: '#000000',
    fontWeight: '500',
  },
  segmentOptionTextInactive: {
    color: 'rgba(96, 96, 102, 0.96)',
    fontWeight: '400',
  },
  accountInfoSection: {
    width: '100%',
    maxWidth: 358,
    gap: 16,
  },
  accountInfoHeader: {
    ...typography.bodyMed,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  listCard: {
    width: '100%',
    height: 133,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  listRow: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listRowLabel: {
    ...typography.bodyRegular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  listRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadBadge: {
    width: 18,
    height: 18,
    borderRadius: 16,
    backgroundColor: '#CC2929',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  listCardDivider: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  logoutRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  logoutRowText: {
    ...typography.bodyRegular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(204, 41, 41, 0.9)',
  },
  bioListSection: {
    width: '100%',
    maxWidth: 358,
    gap: 24,
  },
  bioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    height: 52,
  },
  bioIconTile: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bioTextCol: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  bioLabel: {
    ...typography.label,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  bioValue: {
    ...typography.bodyRegular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  bioVerificationValue: {
    ...typography.bodyRegular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  bottomFixedContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  bottomBackdropShield: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  backdropGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 36,
  },
  backdropSolidWhite: {
    position: 'absolute',
    top: 36,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
  },
  bottomNavContainer: {
    position: 'absolute',
    width: 300,
    height: 80,
    alignSelf: 'center',
    zIndex: 100,
  },
  bottomNavBar: {
    width: 300,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
  },
  navTabItem: {
    width: 72,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  navTabContent: {
    alignItems: 'center',
    gap: 4,
  },
  navTabText: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  navTabTextActive: {
    color: 'rgba(0, 8, 20, 0.96)',
  },
  navTabTextInactive: {
    color: 'rgba(96, 96, 102, 0.96)',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 41, // 41px per Figma CSS for Profile frame (vs 65px on messages)
    height: 5,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 8,
  },
});

