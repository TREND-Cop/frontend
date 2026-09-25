/**
 * LogoutScreen — 1:1 Figma Screen for Logout flow
 * Figma Frame: /* logout * /
 * Frame dimensions: 390 x 844
 * 
 * Features:
 * - Rectangle 296: 213x153px crying characters illustration
 *   (Characters_crying_with_watery_eyes_2K_20260917093229.png)
 * - Text Block:
 *   - "Don’t leave" (20px, SF Pro / DMSans_500Medium, 500, line-height 28px, letter-spacing 0.2px, #000000)
 *   - "We have something waiting for you." (16px, SF Pro / DMSans_400Regular, 400, line-height 24px, letter-spacing 0.4px, rgba(96, 96, 102, 0.96))
 * - Action 1: "Explore" button (358x48px, radius 24px, rgba(0, 8, 20, 0.96), 16px Inter 500 white text)
 *   Takes the user to the Explore tab screen with refreshed discoveries
 * - Action 2: "Logout" button (220x48px, radius 24px, rgba(247, 247, 247, 0.96), 16px Inter 500 red text rgba(204, 41, 41, 0.9))
 *   Logs user out via UserContext and redirects to /sign-in
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SafeImage } from '../../components/ui/SafeImage';
import { useUserContext } from '../../store/UserContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// Proportional scale factor based on Figma 844px canvas height
const scaleY = SCREEN_HEIGHT / 844;

export const LogoutScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout } = useUserContext();

  const handleExplore = () => {
    // Navigate to explore screen
    router.replace('/home/explore' as any);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.warn('Error during logout:', e);
    }
    router.replace('/sign-in' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.contentContainer}>
        {/* ── Rectangle 296: Crying Characters Image ── */}
        <View style={[styles.imageWrapper, { top: Math.round(168 * scaleY) }]}>
          <SafeImage
            source={require('../../../assets/images/custom/Characters_crying_with_watery_eyes_2K_20260917093229.png')}
            style={styles.cryingImage}
            resizeMode="contain"
          />
        </View>

        {/* ── Text Block: "Don't leave" & Subtitle ── */}
        <View style={[styles.textBlock, { top: Math.round(415 * scaleY) }]}>
          <Text style={styles.titleText}>Don’t leave</Text>
          <Text style={styles.subtitleText}>
            We have something waiting for you.
          </Text>
        </View>

        {/* ── Primary Action Button: "Explore" ── */}
        <TouchableOpacity
          style={[styles.exploreButton, { top: Math.round(616 * scaleY) }]}
          activeOpacity={0.85}
          onPress={handleExplore}
        >
          <Text style={styles.exploreButtonText}>Explore</Text>
        </TouchableOpacity>

        {/* ── Secondary Action Button: "Logout" ── */}
        <TouchableOpacity
          style={[styles.logoutButton, { top: Math.round(704 * scaleY) }]}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* ── Home Indicator (shown on devices without home indicator insets) ── */}
        {insets.bottom === 0 && (
          <View style={styles.homeIndicator} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  contentContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },

  // ── Rectangle 296: 213 x 153, centered horizontally ──
  imageWrapper: {
    position: 'absolute',
    width: 213,
    height: 153,
    left: (SCREEN_WIDTH - 213) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cryingImage: {
    width: 213,
    height: 153,
  },

  // ── congratulation text: 358 width, gap 16px, centered horizontally ──
  textBlock: {
    position: 'absolute',
    width: 358,
    left: (SCREEN_WIDTH - 358) / 2,
    alignItems: 'center',
    gap: 16,
  },
  titleText: {
    width: '100%',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    textAlign: 'center',
    letterSpacing: 0.2,
    color: '#000000',
    includeFontPadding: false,
  },
  subtitleText: {
    width: 290,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  // ── Explore Button: 358 x 48, radius 24px, dark background ──
  exploreButton: {
    position: 'absolute',
    width: 358,
    height: 48,
    left: (SCREEN_WIDTH - 358) / 2,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: 'rgba(133, 139, 148, 0.2)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  exploreButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
  },

  // ── Logout Button: 220 x 48, radius 24px, light grey background, red text ──
  logoutButton: {
    position: 'absolute',
    width: 220,
    height: 48,
    left: (SCREEN_WIDTH - 220) / 2,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  logoutButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(204, 41, 41, 0.9)',
    includeFontPadding: false,
  },

  // ── Home Indicator (Figma: 134 x 5, bottom 8px) ──
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: (SCREEN_WIDTH - 134) / 2,
    width: 134,
    height: 5,
    backgroundColor: '#000000',
    borderRadius: 100,
  },
});

export default LogoutScreen;
