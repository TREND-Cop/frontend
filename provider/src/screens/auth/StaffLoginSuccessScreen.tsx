import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Platform,
  BackHandler,
  Animated,
  Easing,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { STAFF_ROUTES } from '../../constants/staffRoutes';

const CONFETTI_IMAGE = require('../../../assets/images/custom/booking_success_confetti.png');
const CHARACTERS_IMAGE = require('../../../assets/images/custom/booking_success_characters.png');

/**
 * 1:1 Figma Green Arc Mini Loader Spinner (Ellipse 206 / 207)
 */
function MiniLoaderSpinner() {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
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
}

export function StaffLoginSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [messageIndex, setMessageIndex] = useState(0);

  // Cycling support messages including "Creating Dashboard" and design support lines
  const supportMessages = useMemo(
    () => [
      'Creating Dashboard',
      'Loading your screen',
      'Please wait a moment',
      'We are almost there',
      'Might be slow network',
    ],
    []
  );

  // Character celebration animations
  const characterBounce = useRef(new Animated.Value(0.85)).current;
  const characterOpacity = useRef(new Animated.Value(0)).current;
  const characterFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Disable hardware back button so staff cannot return to login form
    const backSub = BackHandler.addEventListener('hardwareBackPress', () => true);

    // Entrance celebration animation
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
      // Continuous float loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(characterFloat, {
            toValue: -10,
            duration: 900,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(characterFloat, {
            toValue: 2,
            duration: 800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // Cycle support messages smoothly
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % supportMessages.length);
    }, 1800);

    // Short, clearly marked mock delay then replaces stack with staff home
    const navigationTimer = setTimeout(() => {
      router.replace(STAFF_ROUTES.HOME as any);
    }, 2200);

    return () => {
      backSub.remove();
      clearInterval(interval);
      clearTimeout(navigationTimer);
    };
  }, [supportMessages.length, router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Confetti across top */}
      <View style={styles.confettiWrapper} pointerEvents="none">
        <Image
          source={CONFETTI_IMAGE}
          style={styles.confettiImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.centerSection}>
        {/* Animated Dancing / High-five Characters */}
        <Animated.View
          style={[
            styles.characterContainer,
            {
              opacity: characterOpacity,
              transform: [
                { scale: characterBounce },
                { translateY: characterFloat },
              ],
            },
          ]}
        >
          <Image
            source={CHARACTERS_IMAGE}
            style={styles.characterImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Title & Subtitle */}
        <View style={styles.textGroup}>
          <Text style={styles.successTitle}>Successful</Text>
          <Text style={styles.successSubtitle}>
            Welcome to Trend for staff.
          </Text>
        </View>
      </View>

      {/* Bottom Mini Loader & Support Message */}
      <View
        style={[
          styles.bottomLoaderContainer,
          { paddingBottom: Math.max(insets.bottom, 24) + 24 },
        ]}
      >
        <MiniLoaderSpinner />
        <Text style={styles.supportMessageText}>
          {supportMessages[messageIndex]}
        </Text>
      </View>
    </View>
  );
}

// ── 1:1 Figma Converted Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  confettiWrapper: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    height: 320,
  },
  confettiImage: {
    width: '100%',
    height: 320,
  },

  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: 40,
  },

  // ── Frame: Rectangle 296 (213px x 153px) ──
  characterContainer: {
    width: 213,
    height: 153,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  characterImage: {
    width: 213,
    height: 153,
  },

  // ── Text Group (Frame 1000006442: width 316, height 68, gap 16) ──
  textGroup: {
    width: 316,
    alignItems: 'center',
    gap: 16,
  },
  successTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
    includeFontPadding: false,
  },
  successSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },

  // ── Bottom Mini Loader (Frame: mini loader, width 330, height 79, gap 16) ──
  bottomLoaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    width: 330,
  },
  supportMessageText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
