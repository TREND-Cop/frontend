/**
 * DeleteAccountScreen — 1:1 Figma Screen for Delete Account flow (iOS Guideline 5.1.1(v) Compliance)
 * Figma Frame: /* Delete account * /
 * Frame dimensions: 390 x 844
 *
 * Exact Converter Coordinates (relative to 390x844 canvas with 44px status bar):
 * - Rectangle 296: 150x150px 3D yellow warning icon, top: 162px (118px below 44px status bar)
 * - congratulation text: width 358px, gap 16px, top: 345px (33px below icon)
 *   - "Want to delete your account?" (20px, SF Pro / DMSans_500Medium, 500, lineHeight 28px, letterSpacing 0.2px, #000000)
 *   - "You will lose all your booking history, saved salons and styles. This action cant be undone."
 *     (16px, SF Pro / DMSans_400Regular, 400, lineHeight 24px, letterSpacing 0.4px, rgba(96, 96, 102, 0.96))
 * - Primary Button ("Keep Account"): 335x48px, radius 24px, rgba(0, 8, 20, 0.96), top: 531px (70px below text block)
 * - Destructive Button ("Delete Account"): 261x48px, radius 24px, rgba(247, 247, 247, 0.96), top: 619px (40px below Keep Account)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../utils/safeNavigation';
import { SafeImage } from '../../components/ui/SafeImage';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';
import { useUserContext } from '../../store/UserContext';
import { toastStore } from '../../utils/toastStore';
import { trendApi, getAuthToken } from '../../api/trendApi';

const WARNING_ICON = require('../../../assets/images/custom/warning_yellow_3d.png');

export const DeleteAccountScreen: React.FC = () => {
  const safeRouter = useSafeRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { logout } = useUserContext();
  const [isDeleting, setIsDeleting] = useState(false);

  // Scale vertical spacing gently only on compact screens (< 800px) so elements never collide,
  // while preserving 100% 1:1 Figma coordinates (162, 345, 531, 619) on standard 844px+ screens.
  const vScale = windowHeight < 800 ? Math.max(0.72, windowHeight / 844) : 1;

  const handleGoBackHome = () => {
    if (safeRouter.canGoBack()) {
      safeRouter.back();
    } else {
      safeRouter.replace('/home' as any);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const token = await getAuthToken();
      if (token) {
        const res = await trendApi.auth.deleteAccount();
        if (!res.ok) {
          toastStore.showToast({
            message: res.error || 'Could not delete account right now. Please try again.',
            type: 'error',
          });
          setIsDeleting(false);
          return;
        }
      }
      await logout();
      await Promise.all([
        AsyncStorage.removeItem('@trend_favorites'),
        AsyncStorage.removeItem('@trend_appointments_v3'),
        AsyncStorage.removeItem('@trend_conversations_v2'),
        AsyncStorage.removeItem('@trend_messages_v2'),
      ]).catch(() => {});
      toastStore.showToast({
        message: 'Your account has been deleted',
        type: 'success',
      });
      safeRouter.resetRoot('/sign-in');
    } catch (e) {
      console.warn('Error during account deletion:', e);
      toastStore.showToast({
        message: 'Unable to delete account right now.',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const contentWidth = Math.min(358, windowWidth - 32);
  const keepBtnWidth = Math.min(335, windowWidth - 32);
  const deleteBtnWidth = Math.min(261, windowWidth - 32);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.contentContainer}>
        {/* ── Rectangle 296: 150x150 3D Warning Icon (Figma top: 162px => 118px below 44px status bar) ── */}
        <View style={[styles.iconWrapper, { marginTop: Math.round(118 * vScale) }]}>
          <SafeImage
            source={WARNING_ICON}
            style={styles.warningImage}
            resizeMode="contain"
          />
        </View>

        {/* ── congratulation text (Figma top: 345px => 33px below 150px icon, width: 358px, gap: 16px) ── */}
        <View
          style={[
            styles.textBlock,
            {
              width: contentWidth,
              marginTop: Math.round(33 * vScale),
            },
          ]}
        >
          <Text style={styles.titleText}>Want to delete your account?</Text>
          <Text style={styles.subtitleText}>
            You will lose all your booking history, saved salons and styles. This action can't be undone.
          </Text>
        </View>

        {/* ── Primary Action Button: "Go back home" (Figma top: 531px => 70px below textBlock, 335x48px) ── */}
        <TouchableOpacity
          style={[
            styles.keepButton,
            {
              width: keepBtnWidth,
              marginTop: Math.round(70 * vScale),
            },
          ]}
          activeOpacity={0.85}
          onPress={handleGoBackHome}
          disabled={isDeleting}
        >
          <Text style={styles.keepButtonText}>Go back home</Text>
        </TouchableOpacity>

        {/* ── Destructive Action Button: "Delete account" (Figma top: 619px => 40px below Go back home, 261x48px) ── */}
        <TouchableOpacity
          style={[
            styles.deleteButton,
            {
              width: deleteBtnWidth,
              marginTop: Math.round(40 * vScale),
            },
          ]}
          activeOpacity={0.8}
          onPress={handleConfirmDeleteAccount}
          disabled={isDeleting}
        >
          <Text style={styles.deleteButtonText}>Delete account</Text>
        </TouchableOpacity>
      </View>

      <NativeDockSpacer backgroundColor="#FFFFFF" />
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
    alignItems: 'center',
  },

  // ── Rectangle 296: 150 x 150 ──
  iconWrapper: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningImage: {
    width: 150,
    height: 150,
  },

  // ── congratulation text: 358px width, gap 16px ──
  textBlock: {
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
    width: '100%',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  // ── Keep Account Button: 335 x 48, radius 24px, rgba(0, 8, 20, 0.96) ──
  keepButton: {
    height: 48,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: 'rgba(133, 139, 148, 0.2)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  keepButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
  },

  // ── Delete Account Button: 261 x 48, radius 24px, rgba(247, 247, 247, 0.96) ──
  deleteButton: {
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  deleteButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(204, 41, 41, 0.9)',
    includeFontPadding: false,
  },
});

export default DeleteAccountScreen;

