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
import { useRouter } from 'expo-router';
import { useProviderOnboarding } from '../../context/ProviderOnboardingContext';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';

const CONFETTI_IMAGE = require('../../../assets/images/custom/booking_success_confetti.png');
const CHARACTERS_IMAGE = require('../../../assets/images/custom/booking_success_characters.png');

/**
 * 1:1 Figma Payouts Successful Screen
 * Frame: booking successful screen (width: 390px, height: 844px, background: #ffffff)
 */
export const PayoutSuccessScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setShowDashboardOverlayAfterPayout } = useProviderOnboarding();

  // Continuous celebration dancing animation values
  const characterBounce = useRef(new Animated.Value(0.8)).current;
  const characterOpacity = useRef(new Animated.Value(0)).current;
  const characterFloat = useRef(new Animated.Value(0)).current;
  const characterTilt = useRef(new Animated.Value(0)).current;
  const confettiSway = useRef(new Animated.Value(0)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;

  // Disable hardware back button and start continuous animations
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

      // Continuous action button pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(buttonPulse, {
            toValue: 1.035,
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

  const handleGoToDashboard = () => {
    // Show one-time 4-dot dimmed overlay on dashboard
    setShowDashboardOverlayAfterPayout(true);
    router.replace('/dashboard' as any);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        {/* ── Confetti Background with Continuous Floating Sway ── */}
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

        {/* ── Dancing Characters with Continuous Dance Bounce & Tilt ── */}
        <Animated.View
          style={[
            styles.charactersWrapper,
            {
              opacity: characterOpacity,
              transform: [
                { scale: characterBounce },
                { translateY: characterFloat },
                {
                  rotate: characterTilt.interpolate({
                    inputRange: [-1, 1],
                    outputRange: ['-3deg', '3deg'],
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

        {/* ── Congratulation Text (width: 358px, gap: 16px) ── */}
        <View style={styles.textContainer}>
          <Text style={styles.titleText}>Payouts Successful</Text>
          <Text style={styles.subtitleText}>
            You can now use Trend on your business
          </Text>
        </View>

        {/* ── Filled Action Button: "Go to dashboard" with Continuous Pulse ── */}
        <Animated.View style={{ transform: [{ scale: buttonPulse }] }}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.dashboardButton}
            onPress={handleGoToDashboard}
          >
            <Text style={styles.dashboardButtonText}>Go to dashboard</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Android System Navigation Dock Barrier */}
      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </SafeAreaView>
  );
};

export default PayoutSuccessScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 16,
  },
  confettiContainer: {
    position: 'absolute',
    top: 46,
    left: -38,
    width: 466,
    height: 308,
  },
  confettiImage: {
    width: '100%',
    height: '100%',
  },
  charactersWrapper: {
    width: 213,
    height: 153,
    marginTop: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  charactersImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    width: 358,
    gap: 16,
    alignItems: 'center',
    marginTop: 46,
  },
  titleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    color: '#000000',
    textAlign: 'center',
    includeFontPadding: false,
  },
  subtitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#606066',
    textAlign: 'center',
    includeFontPadding: false,
  },
  dashboardButton: {
    width: 358,
    height: 48,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 144,
  },
  dashboardButtonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#ffffff',
    includeFontPadding: false,
  },
});
