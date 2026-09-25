/**
 * SignUpSuccessScreen — Lively 60fps Native Animated Celebration Screen
 * Features:
 * - Dynamic celebratory dancing characters (vertical bounce + joyful side-to-side tilt + squash & stretch)
 * - Confetti burst with continuous gentle rotation sway and drift
 * - 12 festive radial explosion particles with continuous twinkling and floating
 * - Pop-in staggered cascade entrance for Congratulations title and subtitle
 * - Bottom mini loader with rotating green arc spinner and dynamic welcome messages
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { SafeImage } from '../../components/ui/SafeImage';
import { useUserContext } from '../../store/UserContext';

const CONFETTI_IMAGE = require('../../../assets/images/custom/booking_success_confetti.png');
const CHARACTERS_IMAGE = require('../../../assets/images/custom/booking_success_characters.png');

// ── Exact Green Mini Loader Spinner matching Figma ──
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
      <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
        <Path
          d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10"
          stroke="#0C790C"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
};

export const SignUpSuccessScreen = ({ navigation }: { navigation?: any }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { name, username, mode } = useLocalSearchParams<{
    name?: string;
    username?: string;
    mode?: 'sign-in' | 'sign-up';
  }>();
  const { profileData } = useUserContext();
  const [messageIndex, setMessageIndex] = useState(0);

  const isSignIn = mode === 'sign-in';
  const displayName = username || name || profileData?.username || profileData?.fullName || '';

  const loadingMessages = useMemo(
    () => [
      'Loading your screen',
      'Please a moment',
      'Processing your information',
      displayName
        ? isSignIn
          ? `Welcome back to TREND ${displayName}`
          : `Welcome to TREND ${displayName}`
        : isSignIn
        ? 'Welcome back to TREND'
        : 'Welcome to TREND',
    ],
    [displayName, isSignIn]
  );

  // ── Native 60fps Animation Drivers ──
  const confettiScale = useRef(new Animated.Value(0.3)).current;
  const confettiOpacity = useRef(new Animated.Value(0)).current;
  const confettiSway = useRef(new Animated.Value(0)).current;

  // Characters Entrance
  const charactersScale = useRef(new Animated.Value(0.4)).current;
  const charactersTranslateY = useRef(new Animated.Value(45)).current;
  const charactersOpacity = useRef(new Animated.Value(0)).current;

  // Characters Continuous Celebration Dance (Bounce + Tilt + Squash/Stretch)
  const charactersFloat = useRef(new Animated.Value(0)).current;
  const charactersTilt = useRef(new Animated.Value(0)).current;
  const charactersBounceScale = useRef(new Animated.Value(1)).current;

  // Text Entrance
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const textScale = useRef(new Animated.Value(0.85)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  const loaderOpacity = useRef(new Animated.Value(0)).current;

  // 12 animated radial explosion particles with continuous twinkle
  const particleAnims = useRef(
    Array.from({ length: 12 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(0),
      rotate: new Animated.Value(0),
      scale: new Animated.Value(0),
      twinkle: new Animated.Value(0),
    }))
  ).current;

  const particleColors = [
    '#F59E0B',
    '#EC4899',
    '#3B82F6',
    '#10B981',
    '#8B5CF6',
    '#EF4444',
    '#06B6D4',
    '#F97316',
    '#F43F5E',
    '#84CC16',
    '#6366F1',
    '#EAB308',
  ];

  useEffect(() => {
    // ── 1. Main Entrance Sequence ──
    Animated.parallel([
      // Confetti burst
      Animated.parallel([
        Animated.spring(confettiScale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(confettiOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),

      // Characters celebration bounce entrance
      Animated.sequence([
        Animated.delay(80),
        Animated.parallel([
          Animated.spring(charactersScale, {
            toValue: 1,
            friction: 4.5,
            tension: 50,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.spring(charactersTranslateY, {
            toValue: 0,
            friction: 5,
            tension: 55,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(charactersOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
      ]),

      // Congratulations Text Slide Up & Pop
      Animated.sequence([
        Animated.delay(220),
        Animated.parallel([
          Animated.spring(textTranslateY, {
            toValue: 0,
            friction: 6,
            tension: 45,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.spring(textScale, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
      ]),

      // Loader Fade In
      Animated.sequence([
        Animated.delay(450),
        Animated.timing(loaderOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    ]).start(() => {
      // ── 2. Lively Continuous Celebration Dance Loop ──
      // Vertical dance bounce
      Animated.loop(
        Animated.sequence([
          Animated.timing(charactersFloat, {
            toValue: -14, // Noticeable lively upward bounce!
            duration: 900,
            easing: Easing.out(Easing.quad),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(charactersFloat, {
            toValue: 2, // Slight compression upon landing
            duration: 800,
            easing: Easing.in(Easing.quad),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(charactersFloat, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.sin),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      ).start();

      // Joyful side-to-side dance tilt
      Animated.loop(
        Animated.sequence([
          Animated.timing(charactersTilt, {
            toValue: 1, // +4deg
            duration: 950,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(charactersTilt, {
            toValue: -1, // -4deg
            duration: 1100,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(charactersTilt, {
            toValue: 0,
            duration: 950,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      ).start();

      // Subtle celebratory squash & stretch
      Animated.loop(
        Animated.sequence([
          Animated.timing(charactersBounceScale, {
            toValue: 1.05, // Stretch at peak of jump
            duration: 900,
            easing: Easing.out(Easing.quad),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(charactersBounceScale, {
            toValue: 0.96, // Squash on landing
            duration: 800,
            easing: Easing.in(Easing.quad),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(charactersBounceScale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      ).start();

      // Confetti sway & drift loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(confettiSway, {
            toValue: 1,
            duration: 1600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(confettiSway, {
            toValue: -1,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(confettiSway, {
            toValue: 0,
            duration: 1600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      ).start();
    });

    // ── 3. Radial Particle Burst + Continuous Floating Twinkle ──
    particleAnims.forEach((anim, i) => {
      const angle = (i / 12) * 2 * Math.PI;
      const distance = 75 + (i % 4) * 25;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance - 25;

      Animated.sequence([
        Animated.delay(100 + i * 25),
        Animated.parallel([
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.spring(anim.scale, {
            toValue: 1.2,
            friction: 3.5,
            tension: 50,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(anim.translateX, {
            toValue: targetX,
            duration: 650,
            easing: Easing.out(Easing.quad),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(anim.translateY, {
            toValue: targetY,
            duration: 650,
            easing: Easing.out(Easing.quad),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(anim.rotate, {
            toValue: 1,
            duration: 750,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
        Animated.timing(anim.scale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start(() => {
        // Continuous subtle twinkle & drift
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 120),
            Animated.timing(anim.twinkle, {
              toValue: 1,
              duration: 1000 + (i % 3) * 300,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(anim.twinkle, {
              toValue: 0,
              duration: 1000 + (i % 3) * 300,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: Platform.OS !== 'web',
            }),
          ])
        ).start();
      });
    });

    // Cycle through messages every 1.2s
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev < loadingMessages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);

    // After 5.2s, transition to /home
    const navTimeout = setTimeout(() => {
      router.replace('/home');
    }, 5200);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(navTimeout);
    };
  }, [router, loadingMessages]);

  const confettiRotation = confettiSway.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-3.5deg', '0deg', '3.5deg'],
  });

  const confettiDriftY = confettiSway.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-6, 0, 8],
  });

  const characterTiltAngle = charactersTilt.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-3.5deg', '0deg', '3.5deg'],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── Layer 1: Confetti Graphic Background with Sway Animation ── */}
      <Animated.View
        style={[
          styles.confettiContainer,
          {
            opacity: confettiOpacity,
            transform: [
              { scale: confettiScale },
              { rotate: confettiRotation },
              { translateY: confettiDriftY },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <SafeImage
          source={CONFETTI_IMAGE}
          style={styles.confettiImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* ── Center Content: Illustration + Floating Particles + Heading Group ── */}
      <View style={styles.centerContent}>
        {/* Dynamic Floating Particles Overlay with Continuous Twinkle */}
        <View style={styles.particlesContainer} pointerEvents="none">
          {particleAnims.map((anim, idx) => {
            const rot = anim.rotate.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', `${(idx % 2 === 0 ? 1 : -1) * 360}deg`],
            });
            const particleDriftY = anim.twinkle.interpolate({
              inputRange: [0, 1],
              outputRange: [0, idx % 2 === 0 ? -8 : 8],
            });
            const particleTwinkleScale = anim.twinkle.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.25],
            });
            const particleTwinkleOpacity = anim.twinkle.interpolate({
              inputRange: [0, 1],
              outputRange: [0.75, 1],
            });

            return (
              <Animated.View
                key={idx}
                style={[
                  styles.particleShape,
                  {
                    backgroundColor: particleColors[idx % particleColors.length],
                    borderRadius: idx % 2 === 0 ? 3 : 6,
                    width: idx % 3 === 0 ? 10 : 7,
                    height: idx % 3 === 0 ? 6 : 7,
                    opacity: Animated.multiply(anim.opacity, particleTwinkleOpacity),
                    transform: [
                      { translateX: anim.translateX },
                      { translateY: Animated.add(anim.translateY, particleDriftY) },
                      { scale: Animated.multiply(anim.scale, particleTwinkleScale) },
                      { rotate: rot },
                    ],
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Lively Dancing Characters Illustration (Bounce + Tilt + Squash/Stretch) */}
        <Animated.View
          style={[
            styles.charactersWrapper,
            {
              opacity: charactersOpacity,
              transform: [
                { scale: Animated.multiply(charactersScale, charactersBounceScale) },
                { translateY: Animated.add(charactersTranslateY, charactersFloat) },
                { rotate: characterTiltAngle },
              ],
            },
          ]}
        >
          <SafeImage
            source={CHARACTERS_IMAGE}
            style={styles.charactersImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Text Group (Figma: Congratulations & Subtitle with Pop Entrance) */}
        <Animated.View
          style={[
            styles.textGroup,
            {
              opacity: textOpacity,
              transform: [
                { translateY: textTranslateY },
                { scale: textScale },
              ],
            },
          ]}
        >
          <Text style={styles.title}>Congratulations</Text>
          <Text style={styles.subtitle}>
            {isSignIn ? 'Your sign in was successful' : 'Your sign up was successful'}
          </Text>
        </Animated.View>
      </View>

      {/* ── Bottom Mini Loader (Figma: mini loader) ── */}
      <Animated.View
        style={[
          styles.bottomLoaderContainer,
          {
            paddingBottom: Math.max(insets.bottom, 24) + 16,
            opacity: loaderOpacity,
          },
        ]}
      >
        <MiniLoaderSpinner />
        <Text style={styles.loadingMessageText}>
          {messageIndex === 3 ? `👋  ${loadingMessages[messageIndex]}` : loadingMessages[messageIndex]}
        </Text>
      </Animated.View>
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

  // ── Confetti Background ──
  confettiContainer: {
    position: 'absolute',
    top: 50,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  confettiImage: {
    width: 390,
    height: 310,
  },

  // ── Center Content ──
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
    marginTop: -20,
    zIndex: 1,
    position: 'relative',
  },

  // ── Floating Particles ──
  particlesContainer: {
    position: 'absolute',
    width: 280,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  particleShape: {
    position: 'absolute',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },

  // ── Characters Illustration ──
  charactersWrapper: {
    width: 250,
    height: 195,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    zIndex: 3,
  },
  charactersImage: {
    width: 250,
    height: 195,
  },

  // ── Text Group ──
  textGroup: {
    alignItems: 'center',
    gap: 8,
    zIndex: 3,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    letterSpacing: 0.4,
    color: '#141A33',
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

  // ── Bottom Mini Loader ──
  bottomLoaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 3,
  },
  loadingMessageText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
});
