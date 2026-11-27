import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  BackHandler,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { useProviderProfile } from '../../context/ProviderProfileContext';
import { useUnreadNotificationCount } from '../../context/NotificationsContext';
import { useProfileSkeleton } from '../../hooks/useProfileSkeleton';
import { ProfileSkeleton } from './ProfileSkeleton';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { SuccessToast } from '../../components/reviews/SuccessToast';
import { useBottomInset } from '../../utils/bottomInset';
import { useNativeBackExitGuard } from '../../utils/exitAppGuard';

// ── SVG Icons ──
function NotificationBellIcon({
  size = 24,
  color = 'rgba(192, 192, 204, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C8.686 2 6 4.686 6 8v4.27l-1.7 2.55A1 1 0 005.13 16h13.74a1 1 0 00.83-1.55L18 12.27V8c0-3.314-2.686-6-6-6z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.5 19a2.5 2.5 0 005 0"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Store02Icon({ size = 16, color = 'rgba(12, 121, 12, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M2.33 6.67h11.34v5.33a1.33 1.33 0 01-1.34 1.33H3.67A1.33 1.33 0 012.33 12V6.67z"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.33 12V9.33h5.34V12"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M1.33 2h13.34L13.33 6.67H2.67L1.33 2z"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronRightIcon({ size = 24 }: { size?: number }) {
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

function UserCircleIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke="rgba(192, 192, 204, 0.96)" strokeWidth="1.5" />
      <Circle cx="12" cy="9" r="3" stroke="rgba(192, 192, 204, 0.96)" strokeWidth="1.5" />
      <Path
        d="M6.5 18c1.5-2.5 3.5-3.5 5.5-3.5s4 1 5.5 3.5"
        stroke="rgba(192, 192, 204, 0.96)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function WalletIcon({ size = 24 }: { size?: number }) {
  const strokeColor = 'rgba(192, 192, 204, 0.96)';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 7.5C3 6.11929 4.11929 5 5.5 5H16.5C17.3284 5 18 4.32843 18 3.5C18 2.67157 17.3284 2 16.5 2H7C4.79086 2 3 3.79086 3 6V18.5C3 20.1569 4.34315 21.5 6 21.5H18C19.6569 21.5 21 20.1569 21 18.5V8.5C21 6.84315 19.6569 5.5 18 5.5H5.5"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 12.5H18C16.8954 12.5 16 13.3954 16 14.5C16 15.6046 16.8954 16.5 18 16.5H21"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TrashIcon({ size = 24, color = 'rgba(204, 41, 41, 0.9)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M9.5 16.5V10.5M14.5 16.5V10.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function LockPasswordIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="4"
        y="9"
        width="16"
        height="12"
        rx="3"
        stroke="rgba(192, 192, 204, 0.96)"
        strokeWidth="1.5"
      />
      <Path
        d="M7.5 9V6.5a4.5 4.5 0 019 0V9"
        stroke="rgba(192, 192, 204, 0.96)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Circle cx="12" cy="15" r="1.5" fill="rgba(192, 192, 204, 0.96)" />
    </Svg>
  );
}

function PhoneLockIcon({ size = 24, color = 'rgba(192, 192, 204, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Phone Body */}
      <Rect
        x="3"
        y="2.5"
        width="11"
        height="19"
        rx="2.5"
        stroke={color}
        strokeWidth="1.5"
      />
      {/* Home bar */}
      <Path
        d="M7.5 18h2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Lock Shackle */}
      <Path
        d="M15 10V7.5a2 2 0 014 0V10"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Lock Body */}
      <Rect
        x="13.5"
        y="10"
        width="7"
        height="6.5"
        rx="1.5"
        stroke={color}
        strokeWidth="1.2"
      />
    </Svg>
  );
}

function MailSecureIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 5h14a2 2 0 012 2v10a2 2 0 01-2 2H2a2 2 0 01-2-2V7a2 2 0 012-2z"
        stroke="rgba(192, 192, 204, 0.96)"
        strokeWidth="1.5"
      />
      <Path
        d="M2 7l7 4.5L16 7"
        stroke="rgba(192, 192, 204, 0.96)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PolicyDocumentIcon({ size = 24 }: { size?: number }) {
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

function DashboardNavIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7.5" height="7.5" rx="2" stroke="rgba(192, 192, 204, 0.96)" strokeWidth="1.5" />
      <Rect x="13.5" y="3" width="7.5" height="7.5" rx="2" stroke="rgba(192, 192, 204, 0.96)" strokeWidth="1.5" />
      <Rect x="3" y="13.5" width="7.5" height="7.5" rx="2" stroke="rgba(192, 192, 204, 0.96)" strokeWidth="1.5" />
      <Rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" stroke="rgba(192, 192, 204, 0.96)" strokeWidth="1.5" />
    </Svg>
  );
}

function ChattingNavIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12C2 7.029 6.029 3 11 3h2c4.971 0 9 4.029 9 9 0 4.971-4.029 9-9 9H8l-4.5 1.5L5 18C3.12 16.32 2 14.28 2 12z"
        stroke="rgba(192, 192, 204, 0.96)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ProfileNavIcon({ size = 24, active = true }: { size?: number; active?: boolean }) {
  const strokeColor = active ? 'rgba(0, 8, 20, 0.96)' : 'rgba(192, 192, 204, 0.96)';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={strokeColor} strokeWidth="1.5" />
      <Circle cx="12" cy="9" r="3" stroke={strokeColor} strokeWidth="1.5" fill={active ? 'rgba(0, 8, 20, 0.96)' : 'none'} />
      <Path
        d="M6.5 18c1.5-2.5 3.5-3.5 5.5-3.5s4 1 5.5 3.5"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ProviderProfileScreen() {
  const insets = useSafeAreaInsets();
  const safeRouter = useSafeRouter();
  const params = useLocalSearchParams<{ toast?: string }>();
  const { ownerName, ownerPhone, ownerPhoto } = useProviderProfile();
  const unreadNotificationsCount = useUnreadNotificationCount();
  const { isLoading } = useProfileSkeleton(1100);

  const [toastMessage, setToastMessage] = React.useState<string>(params.toast || '');
  const [toastVisible, setToastVisible] = React.useState<boolean>(Boolean(params.toast));

  React.useEffect(() => {
    if (params.toast) {
      setToastMessage(params.toast);
      setToastVisible(true);
    }
  }, [params.toast]);

  // Navigation handlers
  const handleNotificationPress = () => safeRouter.push('/notifications' as any);
  const handleProfileUpdatePress = () => safeRouter.push('/profile-settings' as any);
  const handlePayoutsPress = () => safeRouter.push('/payout-option' as any);
  const handleNotificationSettingsPress = () => safeRouter.push('/notification-settings' as any);
  const handleTermsPolicyPress = () => safeRouter.push('/terms-policy' as any);
  const handleLogoutPress = () => safeRouter.push('/logout' as any);
  const handleDeleteAccountPress = () => safeRouter.push('/delete-account' as any);
  const handleDashboardPress = () => safeRouter.replace('/dashboard' as any);
  const handleMessagesPress = () => safeRouter.replace('/messages' as any);

  // Android Native Back Button Guard:
  // - Prompts user with in-built Exit Confirmation Dialog; NEVER pops to login/auth!
  useNativeBackExitGuard();

  // Bottom navigation offset & sizing via centralized useBottomInset
  const { tabBottomOffset, tabScrollPadding, bottomFadeHeight } = useBottomInset();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {isLoading ? (
        <ProfileSkeleton />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: tabScrollPadding },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Top Header (width: 358px, height: 48px, top: 68px in Figma) ── */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>

            {/* Notification Bell Circle (48x48px, radius 24px) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleNotificationPress}
              style={styles.notificationButton}
            >
              <NotificationBellIcon size={24} color="#141B34" />
              {unreadNotificationsCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadNotificationsCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Profile Card (Frame 1000006524: 358x238px, radius 24px) ── */}
          <View style={styles.profileCard}>
            {/* Ellipse 1 (109x109px Avatar) */}
            <View style={styles.avatarContainer}>
              {ownerPhoto ? (
                <Image
                  source={typeof ownerPhoto === 'string' ? { uri: ownerPhoto } : ownerPhoto}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require('../../../assets/images/profile/cont1.jpg')}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              )}
            </View>

            {/* James Kalba (16px Med, line height 24px, letterSpacing 0.5px) */}
            <Text style={styles.ownerNameText} numberOfLines={1}>
              {ownerName}
            </Text>

            {/* Frame 1: Business Owner Pill + Divider + Phone */}
            <View style={styles.badgePhoneRow}>
              {/* Frame 2: Business Owner Pill */}
              <View style={styles.ownerPill}>
                <Store02Icon size={16} />
                <Text style={styles.ownerPillText}>Business Owner</Text>
              </View>

              {/* Line 1: Vertical Divider */}
              <View style={styles.verticalDivider} />

              {/* +234 90 786 850 68 */}
              <Text style={styles.phoneText} numberOfLines={1}>
                {ownerPhone}
              </Text>
            </View>
          </View>

          {/* ── Account Information Section ── */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Account information</Text>
            <View style={styles.cardGroup}>
              {/* Row 1: Profile Update */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleProfileUpdatePress}
                style={styles.menuRow}
              >
                <View style={styles.menuRowLeft}>
                  <UserCircleIcon size={24} />
                  <Text style={styles.menuRowLabel}>Profile Update</Text>
                </View>
                <ChevronRightIcon size={24} />
              </TouchableOpacity>

              <View style={styles.cardDivider} />

              {/* Row 2: Payout Wallet */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handlePayoutsPress}
                style={styles.menuRow}
              >
                <View style={styles.menuRowLeft}>
                  <WalletIcon size={24} />
                  <Text style={styles.menuRowLabel}>Payout Wallet</Text>
                </View>
                <ChevronRightIcon size={24} />
              </TouchableOpacity>

              <View style={styles.cardDivider} />

              {/* Row 3: Notification Settings */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleNotificationSettingsPress}
                style={styles.menuRow}
              >
                <View style={styles.menuRowLeft}>
                  <NotificationBellIcon size={24} />
                  <Text style={styles.menuRowLabel}>Notification Settings</Text>
                </View>
                <ChevronRightIcon size={24} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Account Settings Section ── */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Account settings</Text>
            <View style={styles.cardGroup}>
              {/* Row 1: Password Settings */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => safeRouter.push('/password-change' as any)}
                style={styles.menuRow}
              >
                <View style={styles.menuRowLeft}>
                  <LockPasswordIcon size={24} />
                  <Text style={styles.menuRowLabel}>Password Settings</Text>
                </View>
                <ChevronRightIcon size={24} />
              </TouchableOpacity>

              <View style={styles.cardDivider} />

              {/* Row 2: Phone Number Change */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => safeRouter.push('/phone-number-change' as any)}
                style={styles.menuRow}
              >
                <View style={styles.menuRowLeft}>
                  <PhoneLockIcon size={24} />
                  <Text style={styles.menuRowLabel}>Phone Number Change</Text>
                </View>
                <ChevronRightIcon size={24} />
              </TouchableOpacity>

              <View style={styles.cardDivider} />

              {/* Row 3: Gmail Update */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => safeRouter.push('/gmail-security' as any)}
                style={styles.menuRow}
              >
                <View style={styles.menuRowLeft}>
                  <MailSecureIcon size={24} />
                  <Text style={styles.menuRowLabel}>Gmail Update</Text>
                </View>
                <ChevronRightIcon size={24} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Terms of Service + Logout Card Group (Figma: top 985, 358x135px, radius 24px) ── */}
          <View style={styles.cardGroup}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleTermsPolicyPress}
              style={styles.menuRow}
            >
              <View style={styles.menuRowLeft}>
                <PolicyDocumentIcon size={24} />
                <Text style={styles.menuRowLabel}>Terms of Service</Text>
              </View>
              <ChevronRightIcon size={24} />
            </TouchableOpacity>

            <View style={styles.cardDivider} />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleLogoutPress}
              style={styles.menuRow}
            >
              <View style={styles.menuRowLeft}>
                <LogoutSquareIcon size={24} />
                <Text style={styles.logoutText}>Logout</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* ── Delete Account Row (Figma: top 1160 => 40px below cardGroup, 358x56px, padding 8px, gap 16px) ── */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleDeleteAccountPress}
            style={styles.deleteAccountButton}
          >
            <TrashIcon size={24} />
            <Text style={styles.deleteAccountText}>Delete Account</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ── Fixed Bottom Navigation Container (Stationary Floating Island) ── */}
      <View pointerEvents="box-none" style={styles.bottomFixedContainer}>
        {/* Backdrop Fade Shield */}
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

        {/* Floating Bottom Nav Island (300x80px, radius 40px) */}
        <View
          pointerEvents="box-none"
          style={[
            styles.bottomNavContainer,
            { bottom: tabBottomOffset },
          ]}
        >
          <View style={styles.bottomNavBar}>
            {/* Tab 1: Dashboard */}
            <TouchableOpacity
              style={styles.navTabItem}
              activeOpacity={0.8}
              onPress={handleDashboardPress}
            >
              <View style={styles.navTabContent}>
                <DashboardNavIcon size={24} />
                <Text style={styles.navTabTextInactive}>Dashboard</Text>
              </View>
            </TouchableOpacity>

            {/* Tab 2: Messages */}
            <TouchableOpacity
              style={styles.navTabItem}
              activeOpacity={0.8}
              onPress={handleMessagesPress}
            >
              <View style={styles.navTabContent}>
                <ChattingNavIcon size={24} />
                <Text style={styles.navTabTextInactive}>Messages</Text>
              </View>
            </TouchableOpacity>

            {/* Tab 3: Profile (Active) */}
            <TouchableOpacity
              style={styles.navTabItem}
              activeOpacity={0.8}
            >
              <View style={styles.navTabContent}>
                <ProfileNavIcon size={24} active={true} />
                <Text style={styles.navTabTextActive}>Profile</Text>
              </View>
              {/* Rectangle 299: Active indicator bar (41x5px, radius 8px) */}
              <View style={styles.activeTabIndicator} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <SuccessToast
        visible={toastVisible}
        message={toastMessage}
        onDismiss={() => setToastVisible(false)}
      />

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
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // ── Header (height: 48px) ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    marginBottom: 28,
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.2,
    color: '#000000',
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  notificationBadge: {
    position: 'absolute',
    top: 3,
    left: 23,
    width: 18,
    height: 18,
    borderRadius: 16,
    backgroundColor: '#CC2929',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // ── Profile Card (Frame 1000006524: 358x254px) ──
  profileCard: {
    width: '100%',
    minHeight: 254,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 109,
    height: 109,
    borderRadius: 55,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    marginBottom: 20,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  ownerNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
  },
  badgePhoneRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    height: 28,
  },
  ownerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 8,
    height: 28,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    borderRadius: 16,
  },
  ownerPillText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(12, 121, 12, 0.96)',
  },
  verticalDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  phoneText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Section Container ──
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
    marginBottom: 20,
  },
  cardGroup: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuRowLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    width: '100%',
  },

  // ── Logout & Delete Account ──
  logoutText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(204, 41, 41, 0.9)',
  },
  deleteAccountButton: {
    width: '100%',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 16,
    marginTop: 40,
    marginBottom: 32,
  },
  deleteAccountText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(204, 41, 41, 0.9)',
  },

  // ── Bottom Fixed Floating Bar ──
  bottomFixedContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
    ...Platform.select({
      android: {
        elevation: 10,
      },
    }),
  },
  bottomBackdropShield: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  backdropGradient: {
    height: 36,
    width: '100%',
  },
  backdropSolidWhite: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  bottomNavContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
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
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(133, 139, 148, 0.12)',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: {
        elevation: 10,
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
  },
  navTabItem: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  navTabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navTabTextInactive: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  navTabTextActive: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 41,
    height: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
});
