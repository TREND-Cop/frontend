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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
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

const FONT_BUTTON = Platform.select({
  ios: 'Inter',
  android: 'Inter_500Medium',
  default: 'Inter_500Medium',
});

/**
 * ProfileSavedScreen (Figma Frame E6)
 *
 * Requirements:
 * - Confetti illustration & cheerful dancing characters
 * - "Successful" heading (20px SF Pro 510/500, line-height 28px, letter-spacing 0.2px, #000000)
 * - Subtitle: "Business information updated" (16px SF Pro 400, line-height 24px, letter-spacing 0.4px, rgba(96, 96, 102, 0.96))
 * - "Go back home" light outlined button (358x48px, radius 24px, background rgba(247, 247, 247, 0.96), border rgba(235, 235, 245, 0.96))
 * - Hardware back & swipe back disabled
 * - Tapping "Go back home" replaces route to /dashboard with skeleton loading.
 */
export const ProfileSavedScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Animation values
  const characterBounce = useRef(new Animated.Value(0.8)).current;
  const characterOpacity = useRef(new Animated.Value(0)).current;
  const characterFloat = useRef(new Animated.Value(0)).current;
  const confettiSway = useRef(new Animated.Value(0)).current;

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
            toValue: -12,
            duration: 1100,
            useNativeDriver: true,
          }),
          Animated.timing(characterFloat, {
            toValue: 0,
            duration: 1100,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Confetti sway
      Animated.loop(
        Animated.sequence([
          Animated.timing(confettiSway, {
            toValue: 6,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(confettiSway, {
            toValue: -6,
            duration: 1400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    return () => sub.remove();
  }, [characterBounce, characterOpacity, characterFloat, confettiSway]);

  const handleGoBackHome = () => {
    router.replace('/dashboard' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.contentContainer}>
        {/* ── Top Illustration Container ── */}
        <View style={styles.illustrationContainer}>
          {/* Confetti Background Layer */}
          <Animated.Image
            source={CONFETTI_IMAGE}
            style={[
              styles.confettiImage,
              {
                transform: [{ translateY: confettiSway }],
              },
            ]}
            resizeMode="contain"
          />

          {/* Dancing Characters Hero */}
          <Animated.Image
            source={CHARACTERS_IMAGE}
            style={[
              styles.charactersImage,
              {
                opacity: characterOpacity,
                transform: [
                  { scale: characterBounce },
                  { translateY: characterFloat },
                ],
              },
            ]}
            resizeMode="contain"
          />
        </View>

        {/* ── Text Section ── */}
        <View style={styles.textSection}>
          <Text style={styles.titleText}>Successful</Text>
          <Text style={styles.subtitleText}>Business information updated</Text>
        </View>

        {/* ── Bottom Action Button: Go back home ── */}
        <View style={[styles.bottomButtonContainer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.goBackHomeButton}
            onPress={handleGoBackHome}
            accessibilityRole="button"
            accessibilityLabel="Go back home"
          >
            <Text style={styles.goBackHomeButtonText}>Go back home</Text>
          </TouchableOpacity>
        </View>
      </View>

      <NativeDockSpacer />
    </SafeAreaView>
  );
};

export default ProfileSavedScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  illustrationContainer: {
    width: '100%',
    height: 380,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    position: 'relative',
  },
  confettiImage: {
    position: 'absolute',
    width: 360,
    height: 320,
    top: 10,
  },
  charactersImage: {
    width: 220,
    height: 180,
    marginTop: 70,
  },
  textSection: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  titleText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
    includeFontPadding: false,
  },
  subtitleText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  bottomButtonContainer: {
    width: '100%',
    paddingHorizontal: 0,
    paddingTop: 16,
  },
  goBackHomeButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goBackHomeButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
});
