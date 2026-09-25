import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { toastStore } from '../../utils/toastStore';
import {
  ArrowLeft,
  Headphones,
  FileText,
  Calendar,
  Handshake,
} from 'lucide-react-native';
import { SafeImage } from '../../components/ui/SafeImage';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';
import { useUserContext } from '../../store/UserContext';
import { useBookingContext } from '../../store/BookingContext';
import { typography } from '../../constants/theme';
import {
  ProfileUserIcon,
  ProfileLocationIcon,
  ProfileNotificationIcon,
  ProfileLockIcon,
  ProfilePhoneChangeIcon,
  ProfileGmailSecurityIcon,
  ProfileShieldLockIcon,
  ProfileBiometricIcon,
  ProfileLogoutIcon,
  ProfileChevronRight,
  VerifiedCheckmarkBadge,
  StatHandshakeIcon,
  StatCalendarIcon,
} from '../../components/profile/ProfileIcons';
import { ProfilePromoBanner } from '../../components/profile/ProfilePromoBanner';

// ── Nigeria Flag Icon ──
const NigeriaFlagIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={(size * 2) / 3} viewBox="0 0 24 16" fill="none">
    <Rect width="8" height="16" fill="#008751" rx="1.5" />
    <Rect x="7.5" width="9" height="16" fill="#FFFFFF" />
    <Rect x="16" width="8" height="16" fill="#008751" rx="1.5" />
  </Svg>
);

export const ProfileScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ toast?: string; message?: string }>();
  const insets = useSafeAreaInsets();
  const { profileData } = useUserContext();
  const { appointments } = useBookingContext();

  React.useEffect(() => {
    if (params?.toast === 'password_reset' || params?.message === 'password_reset') {
      toastStore.showToast({
        message: 'Password reset successfully',
        type: 'success',
      });
    } else if (params?.message) {
      toastStore.showToast({
        message: params.message,
        type: 'success',
      });
    }
  }, [params?.toast, params?.message]);

  const username = profileData.username || 'fabulous_nails';
  const location = profileData.location || 'Jabi, Lake Mall, Abuja';
  const phoneNumber = profileData.phone || '+234 8019238946';

  const joinedText = React.useMemo(() => {
    const joinedTimestamp = profileData.joinedAt || (Date.now() - 86400000);
    const diffMs = Date.now() - joinedTimestamp;
    const diffDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    return diffDays === 1 ? '1 Day Ago' : `${diffDays} Days Ago`;
  }, [profileData.joinedAt]);

  const appointmentsCount = appointments.length > 0 ? appointments.length : 0;

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)' as any);
    }
  };

  const handleLogOut = () => {
    router.push('/logout' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Page Header (Figma: height 64px, borderBottom 1px) ── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Profile</Text>

        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* ── Main Scroll View Content ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 24 },
        ]}
      >
        {/* ══════════════════════════════════════════════════════════
            1. USER PROFILE CARD (Figma: 358x256, radius 24px, bg #FFF)
        ══════════════════════════════════════════════════════════ */}
        <View style={styles.userProfileCard}>
          {/* Top Row: Avatar + Details */}
          <View style={styles.userDetailsRow}>
            {/* Avatar Frame 80x80 with verified badge */}
            <TouchableOpacity activeOpacity={0.8} style={styles.avatarWrapper} onPress={() => router.push('/change-profile-photo')}>
              <SafeImage
                source={
                  profileData.avatarUri
                    ? { uri: profileData.avatarUri }
                    : require('../../../assets/images/profile/05fc2d4379598a2d970225e7fdac24e129516033.jpg')
                }
                style={styles.avatarImage}
                resizeMode="cover"
              />
              <View style={styles.verifiedBadgeAnchor}>
                <VerifiedCheckmarkBadge size={24} />
              </View>
            </TouchableOpacity>

            {/* User Info Column */}
            <View style={styles.userInfoCol}>
              <Text style={styles.userNameText} numberOfLines={1}>
                {username}
              </Text>

              {/* Location Row */}
              <View style={styles.userMetaRow}>
                <ProfileLocationIcon size={16} color="rgba(96, 96, 102, 0.96)" />
                <Text style={styles.userMetaText} numberOfLines={1}>
                  {location}
                </Text>
              </View>

              {/* Phone Row */}
              <View style={styles.userMetaRow}>
                <NigeriaFlagIcon size={18} />
                <Text style={styles.userPhoneText} numberOfLines={1}>
                  {phoneNumber}
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom Row: 2 Activity Stat Cards (Joined, Appointments) */}
          <View style={styles.activitiesRow}>
            {/* Stat 1: Joined */}
            <View style={styles.activityStatCard}>
              <View style={styles.statIconCircle}>
                <StatHandshakeIcon size={20} color="#141B34" />
              </View>
              <View style={styles.statTextCol}>
                <Text style={styles.statCaption}>Joined</Text>
                <Text style={styles.statValue}>{joinedText}</Text>
              </View>
            </View>

            {/* Stat 2: Appointments */}
            <TouchableOpacity
              style={styles.activityStatCard}
              activeOpacity={0.8}
              onPress={() => router.push('/home/bookings' as any)}
            >
              <View style={styles.statIconCircle}>
                <StatCalendarIcon size={20} color="#141B34" />
              </View>
              <View style={styles.statTextCol}>
                <Text style={styles.statCaption}>Appointments</Text>
                <Text style={styles.statValue}>{appointmentsCount}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════
            2. PREMIUM BANNER (Figma: height 88px, blue gradient)
        ══════════════════════════════════════════════════════════ */}
        <ProfilePromoBanner />

        {/* ══════════════════════════════════════════════════════════
            3. SECTION: Account Settings
        ══════════════════════════════════════════════════════════ */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <View style={styles.menuCardContainer}>
            {/* Profile Settings */}
            <TouchableOpacity
              style={styles.menuItemRow}
              activeOpacity={0.7}
              onPress={() => router.push('/profile-settings' as any)}
            >
              <View style={styles.menuItemLeft}>
                <ProfileUserIcon size={24} color="rgba(192, 192, 204, 0.96)" />
                <Text style={styles.menuItemLabel}>Profile Settings</Text>
              </View>
              <ProfileChevronRight size={24} color="#141B34" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* Location Change */}
            <TouchableOpacity
              style={styles.menuItemRow}
              activeOpacity={0.7}
              onPress={() => router.push('/change-location' as any)}
            >
              <View style={styles.menuItemLeft}>
                <ProfileLocationIcon size={24} color="rgba(192, 192, 204, 0.96)" />
                <Text style={styles.menuItemLabel}>Location Change</Text>
              </View>
              <ProfileChevronRight size={24} color="#141B34" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* Notifications */}
            <TouchableOpacity
              style={styles.menuItemRow}
              activeOpacity={0.7}
              onPress={() => router.push('/notification-settings' as any)}
            >
              <View style={styles.menuItemLeft}>
                <ProfileNotificationIcon size={24} color="rgba(192, 192, 204, 0.96)" />
                <Text style={styles.menuItemLabel}>Notifications</Text>
              </View>
              <ProfileChevronRight size={24} color="#141B34" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════
            4. SECTION: Security Settings
        ══════════════════════════════════════════════════════════ */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Security Settings</Text>

          <View style={styles.menuCardContainer}>
            {/* Reset Password */}
            <TouchableOpacity
              style={styles.menuItemRow}
              activeOpacity={0.7}
              onPress={() => router.push('/reset-password' as any)}
            >
              <View style={styles.menuItemLeft}>
                <ProfileLockIcon size={24} color="rgba(192, 192, 204, 0.96)" />
                <Text style={styles.menuItemLabel}>Reset Password</Text>
              </View>
              <ProfileChevronRight size={24} color="#141B34" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* Phone Number Change */}
            <TouchableOpacity
              style={styles.menuItemRow}
              activeOpacity={0.7}
              onPress={() => router.push('/change-phone-number' as any)}
            >
              <View style={styles.menuItemLeft}>
                 <ProfilePhoneChangeIcon size={24} color="rgba(192, 192, 204, 0.96)" />
                <Text style={styles.menuItemLabel}>Phone Number Change</Text>
              </View>
              <ProfileChevronRight size={24} color="#141B34" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* Gmail Security */}
            <TouchableOpacity
              style={styles.menuItemRow}
              activeOpacity={0.7}
              onPress={() => router.push('/gmail-security' as any)}
            >
              <View style={styles.menuItemLeft}>
                <ProfileGmailSecurityIcon size={24} color="rgba(192, 192, 204, 0.96)" />
                <Text style={styles.menuItemLabel}>Gmail Security</Text>
              </View>
              <ProfileChevronRight size={24} color="#141B34" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* Two Step Verification */}
            <TouchableOpacity
              style={styles.menuItemRow}
              activeOpacity={0.7}
              onPress={() => router.push('/two-step-verification' as any)}
            >
              <View style={styles.menuItemLeft}>
                <ProfileShieldLockIcon size={24} color="rgba(192, 192, 204, 0.96)" />
                <Text style={styles.menuItemLabel}>Two Step Verification</Text>
              </View>
              <ProfileChevronRight size={24} color="#141B34" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* Biometric Login */}
            <TouchableOpacity
              style={styles.menuItemRow}
              activeOpacity={0.7}
              onPress={() => router.push('/biometrics' as any)}
            >
              <View style={styles.menuItemLeft}>
                <ProfileBiometricIcon size={24} color="rgba(192, 192, 204, 0.96)" />
                <Text style={styles.menuItemLabel}>Biometric Login</Text>
              </View>
              <ProfileChevronRight size={24} color="#141B34" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════
            5. SECTION: System
        ══════════════════════════════════════════════════════════ */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>System</Text>

          {/* Contact Support Card */}
          <View style={styles.singleCardContainer}>
            <TouchableOpacity
              style={styles.menuItemRow}
              activeOpacity={0.7}
              onPress={() => router.push('/contact-support' as any)}
            >
              <View style={styles.menuItemLeft}>
                <Headphones size={24} color="rgba(192, 192, 204, 0.96)" />
                <Text style={styles.menuItemLabel}>Contact Support</Text>
              </View>
              <ProfileChevronRight size={24} color="#141B34" />
            </TouchableOpacity>
          </View>

          {/* Privacy & Terms Card */}
          <View style={[styles.singleCardContainer, { marginTop: 12 }]}>
            <TouchableOpacity
              style={styles.menuItemRow}
              activeOpacity={0.7}
              onPress={() => router.push('/terms-policy' as any)}
            >
              <View style={styles.menuItemLeft}>
                <FileText size={24} color="rgba(192, 192, 204, 0.96)" />
                <Text style={styles.menuItemLabel}>Privacy & Terms</Text>
              </View>
              <ProfileChevronRight size={24} color="#141B34" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════
            7. LOG OUT BUTTON
        ══════════════════════════════════════════════════════════ */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.7}
          onPress={handleLogOut}
        >
          <ProfileLogoutIcon size={24} color="rgba(204, 41, 41, 0.9)" />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
      <NativeDockSpacer backgroundColor="rgba(248, 249, 250, 0.98)" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
  },

  // ── Header (Figma: height 64px, borderBottom) ──
  headerRow: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.pageHeader,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  headerRightPlaceholder: {
    width: 48,
    height: 48,
  },

  // ── Scroll Content ──
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 24,
  },

  // ── 1. User Profile Card (Figma: 358x256, padding 16px, gap 24px, radius 24px, bg #FFFFFF) ──
  userProfileCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    gap: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  userDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 37,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'relative',
    backgroundColor: '#F0F0F5',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  verifiedBadgeAnchor: {
    position: 'absolute',
    right: -2,
    bottom: -2,
  },
  userInfoCol: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
  },
  userNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  userMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 4,
  },
  userMetaText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  userPhoneText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // Activities Row (3 Stat Cards: Figma gap 5px)
  activitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    width: '100%',
  },
  activityStatCard: {
    flex: 1,
    height: 104,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 8,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTextCol: {
    gap: 8,
  },
  statCaption: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  statValue: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(0, 8, 20, 0.96)',
  },




  // ── Section Common (Figma: gap 24px) ──
  sectionBlock: {
    gap: 24,
    width: '100%',
  },
  sectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.6,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  // Account/Security Settings Menu Card (Figma: padding 8px 16px, gap 16px, radius 24px)
  menuCardContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  // Subscription / System 1-item Card (Figma: padding 16px, radius 16px, height 56px)
  singleCardContainer: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 0,
    gap: 10,
    height: 44,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  menuItemLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    width: '100%',
  },

  // ── 7. Logout Button (Figma: padding 8px, gap 16px, height 44px) ──
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 8,
    height: 44,
    marginTop: 8,
    marginBottom: 24,
  },
  logoutButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(204, 41, 41, 0.9)',
  },
});
