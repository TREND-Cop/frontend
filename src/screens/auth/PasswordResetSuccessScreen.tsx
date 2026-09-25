/**
 * PasswordResetSuccessScreen — Exact 1:1 Figma Screen for Password Reset Successful Screen
 * Figma: /* sign up Successful Screen * /
 * Features:
 * - Centered 72x72 Star 3 spinning loader (Golden Rule #4)
 * - Heading: "Well done 👏" (20px SF Pro 510/500, #000000)
 * - Subtitle: "Password reset successful" (16px SF Pro 400, rgba(96, 96, 102, 0.96))
 * - Bottom mini loader with spinning green arc spinner
 * - 5 cycling support words:
 *   1. Loading your screen
 *   2. Please a moment
 *   3. We are almost there
 *   4. Might be slow network
 *   5. Welcome to TREND [Username / 99 Ghosts]
 * - Auto transitions to /sign-in upon completion
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';

// ── Golden Rule #4: Star 3 Rotating Loader Component ──
const STAR_3_PATH =
  'M36 6L44.5 25.5L66 27.5L50 42L54.5 63.5L36 53L17.5 63.5L22 42L6 27.5L27.5 25.5L36 6Z';

const Star3Loader = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      })
    ).start();
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.starWrapper, { transform: [{ rotate: spin }] }]}>
      <Svg width={72} height={72} viewBox="0 0 72 72" fill="none">
        <Path d={STAR_3_PATH} fill="rgba(0, 8, 20, 0.96)" />
      </Svg>
    </Animated.View>
  );
};

// ── Exact Green Mini Loader Spinner matching Figma (32x32) ──
const MiniLoaderSpinner = () => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
        <Circle
          cx="16"
          cy="16"
          r="12"
          stroke="rgba(235, 235, 245, 0.96)"
          strokeWidth="3"
        />
        <Path
          d="M16 4C22.6274 4 28 9.37258 28 16"
          stroke="#0C790C"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
};

export const PasswordResetSuccessScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [messageIndex, setMessageIndex] = useState(0);

  // Exactly the 2 requested support messages
  const loadingMessages = useMemo(
    () => [
      'Loading your screen',
      'Please a moment',
    ],
    []
  );

  useEffect(() => {
    // Switch to second message after 1.4s
    const messageTimeout = setTimeout(() => {
      setMessageIndex(1);
    }, 1400);

    // After 3.0s, cleanly navigate to /sign-in
    const navTimeout = setTimeout(() => {
      router.replace('/sign-in');
    }, 3000);

    return () => {
      clearTimeout(messageTimeout);
      clearTimeout(navTimeout);
    };
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── Center Content: Star 3 Loader + Texts ── */}
      <View style={styles.centerContent}>
        {/* Star 3 Loader Container (Figma: width 170px, height 170px, top 187px) */}
        <View style={styles.loaderArea}>
          <Star3Loader />
        </View>

        {/* Text Group (Figma: Frame 1000006442: width 242px, height 60px, top 397px, gap 8px) */}
        <View style={styles.textGroup}>
          <Text style={styles.title}>Well done 👏</Text>
          <Text style={styles.subtitle}>Password reset successful</Text>
        </View>
      </View>

      {/* ── Bottom Mini Loader (Figma: mini loader, width 330px, height 79px, top 675px, gap 16px) ── */}
      <View
        style={[
          styles.bottomLoaderContainer,
          { paddingBottom: Math.max(insets.bottom, 24) + 16 },
        ]}
      >
        <MiniLoaderSpinner />
        <Text style={styles.loadingMessageText}>
          {loadingMessages[messageIndex]}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },

  // ── Center Content ──
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
    marginTop: -40, // Visual center offset matching Figma
  },

  // ── Star 3 Loader Area (Figma: 170x170px) ──
  loaderArea: {
    width: 170,
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  starWrapper: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Text Group (Figma: Frame 1000006442, gap 8px) ──
  textGroup: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500', // Figma: 510
    fontSize: 20,
    lineHeight: 28,
    textAlign: 'center',
    letterSpacing: 0.2,
    color: '#000000',
  },
  subtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Bottom Mini Loader (Figma: mini loader, gap 16px) ──
  bottomLoaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    width: 330,
  },
  loadingMessageText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
});

export default PasswordResetSuccessScreen;
