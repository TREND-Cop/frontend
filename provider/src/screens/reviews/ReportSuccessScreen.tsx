import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  BackHandler,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../utils/safeNavigation';
import { useProviderOnboarding } from '../../context/ProviderOnboardingContext';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';

const CONFETTI_IMAGE = require('../../../assets/images/custom/booking_success_confetti.png');
const CHARACTERS_IMAGE = require('../../../assets/images/custom/booking_success_characters.png');

const FONT_MEDIUM = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_500Medium',
  default: 'DMSans_500Medium',
});

const FONT_REGULAR = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_400Regular',
  default: 'DMSans_400Regular',
});

/**
 * ReportSuccessScreen (Figma Frame P7)
 *
 * Requirements:
 * - Confetti illustration & cheerful dancing characters
 * - "Successful" heading (20px SF Pro 510, #000000)
 * - Subtitle: "Report successfully sent, the team will respond to you as soon as possible."
 * - "Back to dashboard" dark action button
 * - Hardware back & swipe back disabled
 * - Tapping "Back to dashboard" triggers the 4-dot normal loader on dashboard
 *   (REPORT_RETURN_LOADER_MS) per Figma note.
 */
export const ReportSuccessScreen: React.FC = () => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { setShowDashboardOverlayAfterReport } = useProviderOnboarding();

  // Animation values
  const characterBounce = useRef(new Animated.Value(0.8)).current;
  const characterOpacity = useRef(new Animated.Value(0)).current;
  const characterFloat = useRef(new Animated.Value(0)).current;
  const characterTilt = useRef(new Animated.Value(0)).current;
  const confettiSway = useRef(new Animated.Value(0)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;

  // Disable hardware back button
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);

    // Entrance animation
    Animated.parallel([
      Animated.timing(characterOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(characterBounce, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Continuous joyful dancing bounce
      Animated.loop(
        Animated.sequence([
          Animated.timing(characterFloat, {
            toValue: -14,
            duration: 850,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(characterFloat, {
            toValue: 2,
            duration: 750,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Continuous character tilt sway
      Animated.loop(
        Animated.sequence([
          Animated.timing(characterTilt, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(characterTilt, {
            toValue: -1,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Continuous floating confetti sway
      Animated.loop(
        Animated.sequence([
          Animated.timing(confettiSway, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(confettiSway, {
            toValue: -1,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Action button pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(buttonPulse, {
            toValue: 1.03,
            duration: 850,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(buttonPulse, {
            toValue: 0.985,
            duration: 750,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(buttonPulse, {
            toValue: 1,
            duration: 350,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    return () => {
      sub.remove();
      characterFloat.stopAnimation();
      characterTilt.stopAnimation();
      confettiSway.stopAnimation();
      buttonPulse.stopAnimation();
    };
  }, [characterBounce, characterOpacity, characterFloat, characterTilt, confettiSway, buttonPulse]);

  const handleBackToDashboard = () => {
    // Show 4-dot dimmed overlay on dashboard per Figma note
    setShowDashboardOverlayAfterReport(true);
    safeRouter.replace('/dashboard' as any);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        {/* ── Confetti Background (Floating Sway) ── */}
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
        >
          <Image
            source={CONFETTI_IMAGE}
            style={styles.confettiImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* ── Dancing Characters Illustration ── */}
        <Animated.View
          style={[
            styles.charactersContainer,
            {
              opacity: characterOpacity,
              transform: [
                { scale: characterBounce },
                { translateY: characterFloat },
                {
                  rotate: characterTilt.interpolate({
                    inputRange: [-1, 1],
                    outputRange: ['-2.5deg', '2.5deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Image
            source={CHARACTERS_IMAGE}
            style={styles.charactersImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* ── Success Text Section ── */}
        <View style={styles.textContainer}>
          <Text style={styles.title} accessibilityRole="header">
            Successful
          </Text>
          <Text style={styles.subtitle}>
            Report successfully sent, the team will respond to you as soon as possible.
          </Text>
        </View>

        {/* ── Back to Dashboard Button ── */}
        <Animated.View
          style={[
            styles.buttonWrapper,
            {
              paddingBottom: Math.max(insets.bottom, 24),
              transform: [{ scale: buttonPulse }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.85}
            onPress={handleBackToDashboard}
            accessibilityRole="button"
            accessibilityLabel="Back to dashboard"
          >
            <Text style={styles.buttonText}>Back to dashboard</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <NativeDockSpacer />
    </SafeAreaView>
  );
};

export default ReportSuccessScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  confettiContainer: {
    position: 'absolute',
    top: 36,
    width: 466,
    height: 308,
    alignItems: 'center',
  },
  confettiImage: {
    width: '100%',
    height: '100%',
  },
  charactersContainer: {
    width: 213,
    height: 153,
    marginTop: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  charactersImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    marginTop: -40,
  },
  title: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
    includeFontPadding: false,
  },
  subtitle: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  buttonWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  actionButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.16)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  buttonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
