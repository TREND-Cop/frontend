import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Platform,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * 1:1 Vector Store-02 Icon from Figma
 */
function Store02Icon({ size = 20, color = 'rgba(96, 96, 102, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9l1-6h16l1 6v1a3 3 0 01-3 3 3 3 0 01-3-3 3 3 0 01-3 3 3 3 0 01-3-3 3 3 0 01-3 3 3 3 0 01-3-3V9z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 12v8a1 1 0 001 1h14a1 1 0 001-1v-8M9 21v-6a1 1 0 011-1h4a1 1 0 011 1v6"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Vector Users-Round Icon from Figma
 */
function UsersRoundIcon({ size = 20, color = 'rgba(96, 96, 102, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 11a4 4 0 100-8 4 4 0 000 8z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22 21v-2a4 4 0 00-3-3.87"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 3.13a4 4 0 010 7.75"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export interface ProviderOnboardingScreenProps {
  onSelectRole?: (role: 'business_owner' | 'staff', mode: 'login' | 'create_account') => void;
}

export const ProviderOnboardingScreen: React.FC<ProviderOnboardingScreenProps> = ({
  onSelectRole,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'login' | 'create_account'>('login');

  const handleRolePress = (role: 'business_owner' | 'staff') => {
    if (onSelectRole) {
      onSelectRole(role, activeTab);
    }
  };

  return (
    <View style={styles.onbarding}>
      <StatusBar style="light" />

      {/* ── Background: Word Trend in cursive text ── */}
      <ImageBackground
        source={require('../../../assets/images/Word_Trend_in_cursive_text.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Dark overlay backdrop to ensure seamless background fill */}
        <View style={styles.topBackdropOverlay} />
      </ImageBackground>

      {/* ── Entry Bottom Sheet (390px x 379px, 24px radius top) ── */}
      <View style={[styles.entryBottomSheet, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {/* Welcome to Trend For Business */}
        <Text style={styles.welcomeToTrendForBusiness}>
          Welcome to Trend For Business
        </Text>

        {/* ── Button Frame (358px x 56px, 32px radius, segmented) ── */}
        <View style={styles.buttonFrame}>
          {/* Active Tab Highlight Pill */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.tabPill,
              activeTab === 'login' ? styles.tabPillActive : styles.tabPillInactive,
            ]}
            onPress={() => setActiveTab('login')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'login' ? styles.tabTextActive : styles.tabTextInactive,
              ]}
            >
              Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.tabPill,
              activeTab === 'create_account' ? styles.tabPillActive : styles.tabPillInactive,
            ]}
            onPress={() => setActiveTab('create_account')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'create_account' ? styles.tabTextActive : styles.tabTextInactive,
              ]}
            >
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Buttons Row (358px x 112px, 24px gap) ── */}
        <View style={styles.buttons}>
          {/* ── Business Owner Button (167px x 112px) ── */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.businessOwnerButton}
            onPress={() => handleRolePress('business_owner')}
          >
            {/* Frame 1000006400 */}
            <View style={styles.roleHeaderRow}>
              {/* Frame 1000006399: 32x32 circle */}
              <View style={styles.iconCircle}>
                <Store02Icon size={20} color="rgba(96, 96, 102, 0.96)" />
              </View>
              {/* Login as */}
              <Text style={styles.loginAsText}>
                {activeTab === 'login' ? 'Login as' : 'Sign up as'}
              </Text>
            </View>

            {/* Business Owner Title */}
            <Text style={styles.roleTitle} numberOfLines={1} adjustsFontSizeToFit>
              Business Owner
            </Text>
          </TouchableOpacity>

          {/* ── Staff Button (167px x 112px) ── */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.staffButton}
            onPress={() => handleRolePress('staff')}
          >
            {/* Frame 1000006400 */}
            <View style={styles.roleHeaderRow}>
              {/* Frame 1000006399: 32x32 circle */}
              <View style={styles.iconCircle}>
                <UsersRoundIcon size={20} color="rgba(96, 96, 102, 0.96)" />
              </View>
              {/* Login as */}
              <Text style={styles.loginAsText}>
                {activeTab === 'login' ? 'Login as' : 'Sign up as'}
              </Text>
            </View>

            {/* Staff Title */}
            <Text style={[styles.roleTitle, styles.staffRoleTitle]} numberOfLines={1}>
              Staff
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Home Indicator (134px x 5px, 8px bottom) ── */}
        <View style={styles.homeIndicatorWrapper} pointerEvents="none">
          <View style={styles.homeIndicator} />
        </View>
      </View>

      {/* Android System Dock Barrier */}
      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </View>
  );
};

export default ProviderOnboardingScreen;

const styles = StyleSheet.create({
  /* onbarding */
  onbarding: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#212226',
    justifyContent: 'flex-end',
  },

  backgroundImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },

  topBackdropOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },

  /* entry bottom sheet */
  entryBottomSheet: {
    position: 'absolute',
    width: '100%',
    height: 379,
    left: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  /* Welcome to Trend For Business */
  welcomeToTrendForBusiness: {
    position: 'absolute',
    width: 257,
    height: 24,
    left: '50%',
    marginLeft: -128.5,
    top: 16,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.5,
    color: '#000000',
    includeFontPadding: false,
  },

  /* button frame */
  buttonFrame: {
    position: 'absolute',
    width: 358,
    height: 56,
    left: '50%',
    marginLeft: -179,
    top: 80,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 32,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  /* Segmented Tab Pill */
  tabPill: {
    height: 40,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabPillActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    paddingHorizontal: 28,
  },

  tabPillInactive: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
  },

  /* Segmented Tab Text */
  tabText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    includeFontPadding: false,
  },

  tabTextActive: {
    color: '#FFFFFF',
  },

  tabTextInactive: {
    color: 'rgba(96, 96, 102, 0.96)',
  },

  /* buttons (action row) */
  buttons: {
    position: 'absolute',
    width: 358,
    height: 112,
    left: '50%',
    marginLeft: -179,
    top: 192,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 24,
  },

  /* business owner button */
  businessOwnerButton: {
    width: 167,
    height: 112,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderStyle: 'solid',
    borderRadius: 24,
    padding: 16,
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* staff button */
  staffButton: {
    width: 167,
    height: 112,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderStyle: 'solid',
    borderRadius: 24,
    padding: 16,
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Frame 1000006400 */
  roleHeaderRow: {
    width: 96,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  /* Frame 1000006399 */
  iconCircle: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Login as */
  loginAsText: {
    width: 58,
    height: 20,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  /* Business Owner & Staff Role Titles */
  roleTitle: {
    width: 133,
    height: 24,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    textAlign: 'center',
    includeFontPadding: false,
  },

  staffRoleTitle: {
    textAlign: 'center',
  },

  /* Home Indicator Container */
  homeIndicatorWrapper: {
    position: 'absolute',
    height: 34,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  /* Home Indicator Pill */
  homeIndicator: {
    width: 134,
    height: 5,
    bottom: 8,
    backgroundColor: '#000000',
    borderRadius: 100,
  },
});
