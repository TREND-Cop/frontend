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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { triggerLightHaptic } from '../../utils/haptics';
import { STAFF_ROUTES } from '../../constants/staffRoutes';
import { markStaffSubScreenNavigation } from '../../hooks/useStaffDashboardSkeleton';

const CONFETTI_IMAGE = require('../../../assets/images/custom/booking_success_confetti.png');
const SUCCESS_BADGE_IMAGE = require('../../../assets/images/appointments/glossy_green_success_badge.png');

/**
 * 1:1 Figma Appointment Successful Screen (Completion Flow)
 * Frame: App Successful Screen (second instance: 390x844)
 */
export function StaffCompletionSuccessScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Animations: entrance bounce, breathing pulse, and confetti sway
  const badgeBounce = useRef(new Animated.Value(0.6)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const badgeFloat = useRef(new Animated.Value(0)).current;
  const confettiSway = useRef(new Animated.Value(0)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Hardware back disabled (cannot navigate back into completion flow)
    const backSub = BackHandler.addEventListener('hardwareBackPress', () => true);

    // Badge entrance spring
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
            toValue: -8,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(badgeFloat, {
            toValue: 4,
            duration: 1000,
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
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(confettiSway, {
            toValue: -1,
            duration: 2000,
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
    // Trigger staff skeleton-on-return mechanism
    markStaffSubScreenNavigation();
    // Replace stack so user cannot return to completion flow
    router.replace(STAFF_ROUTES.HOME as any);
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="dark" />

      {/* ── Top Confetti Layer with Sway ── */}
      <Animated.View
        style={[
          styles.confettiContainer,
          {
            transform: [
              {
                translateY: confettiSway.interpolate({
                  inputRange: [-1, 1],
                  outputRange: [-6, 6],
                }),
              },
              {
                scale: confettiSway.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: [1.02, 1, 1.02],
                }),
              },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <Image
          source={CONFETTI_IMAGE}
          style={styles.confettiImage}
          resizeMode="cover"
        />
      </Animated.View>

      {/* ── Center Content ── */}
      <View style={styles.contentContainer}>
        {/* Glossy Green Success Badge: 213x153px */}
        <Animated.View
          style={[
            styles.badgeWrapper,
            {
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

        {/* Text Block (Frame 1000006442 in CSS) */}
        <View style={styles.textBlock}>
          <Text style={styles.titleText}>Successful</Text>
          <Text style={styles.subtitleText}>
            Appointment successfully completed
          </Text>
        </View>
      </View>

      {/* ── Bottom Action Button: "Go back to home" ── */}
      <View
        style={[
          styles.bottomButtonContainer,
          { paddingBottom: Math.max(insets.bottom, 16) + 16 },
        ]}
      >
        <TouchableOpacity
          style={styles.homeActionButton}
          activeOpacity={0.88}
          onPress={handleGoBackToHome}
        >
          <Text style={styles.homeActionButtonText}>Go back to home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Confetti across top
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    overflow: 'hidden',
    zIndex: 1,
  },
  confettiImage: {
    width: '100%',
    height: '100%',
  },

  // Center content
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  badgeWrapper: {
    width: 213,
    height: 153,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  badgeImage: {
    width: 213,
    height: 153,
  },

  textBlock: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    gap: 16,
  },
  titleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
  },
  subtitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },

  // Bottom Button Container
  bottomButtonContainer: {
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    zIndex: 2,
  },
  homeActionButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(133, 139, 148, 0.08)',
        shadowOffset: { width: 4, height: 10 },
        shadowOpacity: 1,
        shadowRadius: 16,
      },
      android: {
        elevation: 3,
      },
    }),
  },
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
