import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  BackHandler,
  Platform,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../utils/safeNavigation';

import { triggerLightHaptic } from '../../utils/haptics';
import { STAFF_ROUTES } from '../../constants/staffRoutes';
import { markStaffSubScreenNavigation } from '../../hooks/useStaffDashboardSkeleton';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';

const CONFETTI_IMAGE = require('../../../assets/images/appointments/booking_success_confetti.png');
const SUCCESS_BADGE_IMAGE = require('../../../assets/images/appointments/glossy_green_success_badge.png');

/**
 * 1:1 Figma Appointment Successful Screen (Completion Flow)
 * Figma Frame: App Successful Screen (top: 79px, left: 1809px, width: 390px, height: 844px)
 * Measurements:
 * - Confetti: Rectangle 297, 466x308px, top: -64px, left: calc(50% - 466px/2 - 14px)
 * - Badge: Rectangle 296, 213x153px, top: 177px, centered
 * - Text Block: Frame 1000006442, 340x68px, top: 414px, gap: 16px
 * - Title: 20px 500, line height 28px, letter spacing 0.2px, #000000
 * - Subtitle: 16px 400, line height 24px, letter spacing 0.4px, rgba(96, 96, 102, 0.96)
 * - Action Button: attending to client button, 390x80px, bottom: 182px, padding: 16px
 *   - Filled action button: 358x48px, borderRadius: 24px, rgba(0, 8, 20, 0.96)
 *   - Button text: 16px Inter 500, line height 24px, letter spacing 0.15px, #FFFFFF
 */
export function StaffCompletionSuccessScreen({ buttonText = 'Go back to home' }: { buttonText?: string }) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const safeRouter = useSafeRouter();

  // Animations: entrance spring, gentle breathing float, and confetti sway
  const badgeBounce = useRef(new Animated.Value(0.6)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const badgeFloat = useRef(new Animated.Value(0)).current;
  const confettiSway = useRef(new Animated.Value(0)).current;

  // Responsive layout scaling relative to 844px Figma canvas
  const canvasHeight = Math.max(windowHeight, 700);
  const scaleY = canvasHeight / 844;
  const badgeMarginTop = Math.max(20, Math.round(177 * scaleY - insets.top));
  const badgeToTextGap = Math.max(32, Math.round((414 - (177 + 153)) * scaleY));

  // Button positioned at Figma bottom: 182px with collision-safe floor
  const maxBottom = canvasHeight - (badgeMarginTop + insets.top + 153 + badgeToTextGap + 68 + 40 + 80);
  const buttonBottomOffset = Math.max(
    Math.max(insets.bottom + 16, 24),
    Math.min(Math.round(182 * scaleY), maxBottom > 0 ? maxBottom : 40)
  );

  useEffect(() => {
    // 1. Hardware back disabled (cannot navigate back into completion flow)
    const backSub = BackHandler.addEventListener('hardwareBackPress', () => true);

    // 2. Badge entrance spring
    Animated.parallel([
      Animated.timing(badgeOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(badgeBounce, {
        toValue: 1,
        friction: 6,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Continuous gentle breathing float on badge
      Animated.loop(
        Animated.sequence([
          Animated.timing(badgeFloat, {
            toValue: -6,
            duration: 1200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(badgeFloat, {
            toValue: 4,
            duration: 1200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Confetti sway loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(confettiSway, {
            toValue: 1,
            duration: 2200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(confettiSway, {
            toValue: -1,
            duration: 2200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    return () => {
      backSub.remove();
      badgeFloat.stopAnimation();
      confettiSway.stopAnimation();
    };
  }, [badgeBounce, badgeOpacity, badgeFloat, confettiSway]);

  // "Go back to home" handler
  const handleGoBackToHome = () => {
    triggerLightHaptic();
    markStaffSubScreenNavigation();
    safeRouter.replace(STAFF_ROUTES.HOME as any);
  };

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* ── Top Confetti Layer ── */}
      <Image
        source={CONFETTI_IMAGE}
        style={styles.confettiImage}
        resizeMode="contain"
      />

      {/* ── Center Content: Badge & Texts ── */}
      <View style={styles.mainContent}>
        {/* Glossy Green Success Badge: 213x153px (Rectangle 296, top: 177px) */}
        <Animated.View
          style={[
            styles.badgeWrapper,
            {
              marginTop: badgeMarginTop,
              marginBottom: badgeToTextGap,
              opacity: badgeOpacity,
              transform: [
                { scale: badgeBounce },
                { translateY: badgeFloat },
              ],
            },
          ]}
        >
          <Image
            source={SUCCESS_BADGE_IMAGE}
            style={styles.badgeImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Text Block: Frame 1000006442 (340x68px, gap: 16px, top: 414px) */}
        <View style={styles.textBlock}>
          <Text style={styles.titleText}>Successful</Text>
          <Text style={styles.subtitleText}>
            Appointment successfully completed
          </Text>
        </View>
      </View>

      {/* ── Bottom Action Button: attending to client button (390x80px, bottom: 182px, padding: 16px) ── */}
      <View style={[styles.bottomButtonContainer, { paddingBottom: buttonBottomOffset }]}>
        <TouchableOpacity
          style={styles.homeActionButton}
          activeOpacity={0.88}
          onPress={handleGoBackToHome}
        >
          <Text style={styles.homeActionButtonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>

      <NativeDockSpacer />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },

  // Confetti across top: 466x308px, top: -64px
  confettiImage: {
    position: 'absolute',
    top: 27,
    width: 466,
    height: 308,
    alignSelf: 'center',
    zIndex: 1,
  },

  // Main content group
  mainContent: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 2,
  },

  // Rectangle 296: Glossy Green Success Badge 213x153px
  badgeWrapper: {
    width: 213,
    height: 153,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeImage: {
    width: 213,
    height: 153,
  },

  // Frame 1000006442: Text Block (width: 340px, height: 68px, gap: 16px)
  textBlock: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    gap: 16,
  },
  // Successful (106x28px)
  titleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
  },
  // Appointment successfully completed (340x24px)
  subtitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },

  // attending to client button: width: 100% (max 390px), height: 80px, padding: 16px
  bottomButtonContainer: {
    width: '100%',
    maxWidth: 390,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    zIndex: 2,
  },
  // Filled action button: width: 358px, height: 48px, borderRadius: 24px
  homeActionButton: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(133, 139, 148, 0.08)',
        shadowOffset: { width: 4, height: 10 },
        shadowOpacity: 1,
        shadowRadius: 24,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  // Book Now slot (132x24px, Inter 500, 16px)
  homeActionButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },
});

export default StaffCompletionSuccessScreen;
