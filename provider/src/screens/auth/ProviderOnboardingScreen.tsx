import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { TactilePressable } from '../../components/ui/TactilePressable';
import { triggerLightHaptic } from '../../utils/haptics';

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
  initialTab?: 'login' | 'create_account';
  businessOwnerOnly?: boolean;
  onSelectRole?: (role: 'business_owner' | 'staff', mode: 'login' | 'create_account') => void;
}

export const ProviderOnboardingScreen: React.FC<ProviderOnboardingScreenProps> = ({
  initialTab = 'login',
  businessOwnerOnly = false,
  onSelectRole,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'login' | 'create_account'>(initialTab);
  const pillAnim = useRef(new Animated.Value(initialTab === 'login' ? 0 : 162)).current;

  useEffect(() => {
    setActiveTab(initialTab);
    pillAnim.setValue(initialTab === 'login' ? 0 : 162);
  }, [initialTab]);

  const handleTabChange = (tab: 'login' | 'create_account') => {
    if (tab === activeTab) return;
    triggerLightHaptic();
    setActiveTab(tab);
    Animated.spring(pillAnim, {
      toValue: tab === 'login' ? 0 : 162,
      friction: 8,
      tension: 140,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handleRolePress = (role: 'business_owner' | 'staff') => {
    if (onSelectRole) {
      onSelectRole(role, activeTab);
    }
  };

  return (
    <View style={styles.webViewportOuter}>
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
      <View
        style={[
          styles.entryBottomSheet,
          {
            height: 379 + insets.bottom,
            paddingBottom: insets.bottom + 12,
          },
        ]}
      >
        {/* Welcome to Trend For Business (top: 24px) */}
        <Text style={styles.welcomeToTrendForBusiness}>
          Welcome to Trend For Business
        </Text>

        {/* ── Button Frame (358px x 56px, 32px radius, top: 80px) ── */}
        <View style={styles.buttonFrame}>
          {/* Animated Active Highlight Pill (164px x 40px, 24px radius, top: 8px) */}
          <Animated.View
            style={[
              styles.activeTabPill,
              {
                transform: [{ translateX: pillAnim }],
              },
            ]}
          />

          {/* Login Tab Button (164px x 40px, left: 16px) */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.tabButtonLeft}
            onPress={() => handleTabChange('login')}
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

          {/* Create Account Tab Button (164px x 40px, left: 178px) */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.tabButtonRight}
            onPress={() => handleTabChange('create_account')}
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

        {/* ── Role Selection Area (top: 192px) ── */}
        {activeTab === 'create_account' || businessOwnerOnly ? (
          /* Single Business Owner Card (358px x 112px) */
          <TactilePressable
            style={[
              styles.businessOwnerButtonFull,
              activeTab === 'create_account' && styles.businessOwnerButtonCreateSurface,
            ]}
            onPress={() => handleRolePress('business_owner')}
          >
            <View
              style={
                activeTab === 'create_account'
                  ? styles.roleHeaderRowFull
                  : styles.roleHeaderRowHalf
              }
            >
              <View style={styles.iconCircle}>
                <Store02Icon size={20} color="rgba(96, 96, 102, 0.96)" />
              </View>
              <Text
                style={
                  activeTab === 'create_account'
                    ? styles.createAccountAsText
                    : styles.loginAsText
                }
              >
                {activeTab === 'create_account' ? 'Create an account as a' : 'Login as'}
              </Text>
            </View>

            <Text style={styles.roleTitleFull} numberOfLines={1}>
              Business Owner
            </Text>
          </TactilePressable>
        ) : (
          /* ── Native Login Mode: Business Owner & Staff Side-by-Side (358px x 112px, gap: 24px) ── */
          <View style={styles.buttonsRow}>
            {/* Business Owner Button (167px x 112px) */}
            <TactilePressable
              style={styles.businessOwnerButtonHalf}
              onPress={() => handleRolePress('business_owner')}
            >
              <View style={styles.roleHeaderRowHalf}>
                <View style={styles.iconCircle}>
                  <Store02Icon size={20} color="rgba(96, 96, 102, 0.96)" />
                </View>
                <Text style={styles.loginAsText}>
                  Login as
                </Text>
              </View>

              <Text style={styles.roleTitleHalf} numberOfLines={1} adjustsFontSizeToFit>
                Business Owner
              </Text>
            </TactilePressable>

            {/* Staff Button (167px x 112px) */}
            <TactilePressable
              style={styles.staffButtonHalf}
              onPress={() => handleRolePress('staff')}
            >
              <View style={styles.roleHeaderRowHalf}>
                <View style={styles.iconCircle}>
                  <UsersRoundIcon size={20} color="rgba(96, 96, 102, 0.96)" />
                </View>
                <Text style={styles.loginAsText}>
                  Login as
                </Text>
              </View>

              <Text style={[styles.roleTitleHalf, styles.staffRoleTitle]} numberOfLines={1}>
                Staff
              </Text>
            </TactilePressable>
          </View>
        )}
      </View>

        {/* Android System Dock Barrier */}
        <NativeDockSpacer backgroundColor="#FFFFFF" />
      </View>
    </View>
  );
};

export default ProviderOnboardingScreen;

const styles = StyleSheet.create({
  webViewportOuter: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  /* onbarding */
  onbarding: {
    position: 'relative',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 420 : undefined,
    height: '100%',
    backgroundColor: '#212226',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },

  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: Platform.OS === 'web' ? 400 : 0,
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
    top: 24,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.5,
    color: '#000000',
    includeFontPadding: false,
  },

  /* button frame (358px x 56px, 32px radius, top: 80px) */
  buttonFrame: {
    position: 'absolute',
    width: 358,
    height: 56,
    left: '50%',
    marginLeft: -179,
    top: 80,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 32,
  },

  /* Active Highlight Pill (164px x 40px, 24px radius, top: 8px) */
  activeTabPill: {
    position: 'absolute',
    width: 164,
    height: 40,
    left: 16,
    top: 8,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
  },

  /* Left button touchable (Login) */
  tabButtonLeft: {
    position: 'absolute',
    left: 16,
    top: 8,
    width: 164,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Right button touchable (Create Account) */
  tabButtonRight: {
    position: 'absolute',
    left: 178,
    top: 8,
    width: 164,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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

  /* ── CREATE ACCOUNT MODE: Full-width Business Owner button (358px x 112px) ── */
  businessOwnerButtonFull: {
    position: 'absolute',
    width: 358,
    height: 112,
    left: '50%',
    marginLeft: -179,
    top: 192,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderStyle: 'solid',
    borderRadius: 24,
    padding: 16,
    gap: 8,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  businessOwnerButtonCreateSurface: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    shadowOpacity: 0,
    elevation: 0,
  },

  /* Frame 1000006400 (198px x 32px, gap: 6px) */
  roleHeaderRowFull: {
    width: 198,
    height: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    gap: 6,
  },

  /* Create an account as a (160px x 20px, 14px 400, line-height: 20px) */
  createAccountAsText: {
    width: 160,
    height: 20,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  /* Business Owner Title (324px x 24px, 16px 500, line-height: 24px) */
  roleTitleFull: {
    width: 324,
    height: 24,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    textAlign: 'center',
    color: '#000000',
    includeFontPadding: false,
  },

  /* ── LOGIN MODE: Side-by-side buttons row (358px x 112px, gap: 24px) ── */
  buttonsRow: {
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

  businessOwnerButtonHalf: {
    width: 167,
    height: 112,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderStyle: 'solid',
    borderRadius: 24,
    padding: 16,
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },

  staffButtonHalf: {
    width: 167,
    height: 112,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderStyle: 'solid',
    borderRadius: 24,
    padding: 16,
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },

  roleHeaderRowHalf: {
    width: 96,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  /* Frame 1000006399 (32px x 32px, radius: 24px) */
  iconCircle: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },

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

  roleTitleHalf: {
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
});
