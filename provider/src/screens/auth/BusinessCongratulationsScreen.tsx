import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  BackHandler,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { useProviderOnboarding } from '../../context/ProviderOnboardingContext';
import { CONGRATS_DURATION_MS } from '../../constants/onboarding.config';

// Typography matching Golden Rules & Provider Platform Typography Mandate
const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_SEMIBOLD = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

// Existing verified celebration assets
const CONFETTI_IMAGE = require('../../../assets/images/custom/booking_success_confetti.png');
const CHARACTERS_IMAGE = require('../../../assets/images/custom/booking_success_characters.png');

/**
 * 1:1 Rotating Green Mini Loader Spinner matching Figma (32x32)
 */
const MiniLoaderSpinner: React.FC = () => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      })
    );
    loop.start();
    return () => loop.stop();
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

export const BusinessCongratulationsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { businessName, setHasSeenFirstTime, setJustSignedUp } = useProviderOnboarding();

  const [messageIndex, setMessageIndex] = useState(0);

  // Cycling loader messages matching Figma "loader support words" spec
  const loadingMessages = useMemo(
    () => [
      'Creating Dashboard',
      'Please a moment',
      'We are almost there',
      'Might be slow network',
      businessName ? `Welcome to TREND ${businessName}` : 'Welcome to TREND Business',
    ],
    [businessName]
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

  // Loader Entrance
  const loaderOpacity = useRef(new Animated.Value(0)).current;

  // 20 animated radial festive explosion particles with continuous floating and twinkling
  const particleAnims = useRef(
    Array.from({ length: 20 }, () => ({
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
    '#E02475',
    '#00C2CB',
    '#FF6B8B',
    '#1A82FF',
    '#FFD700',
    '#0C790C',
    '#A855F7',
    '#FB923C',
  ];

  useEffect(() => {
    // ── 1. Main Entrance Animations ──
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
    ]).start();

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
    ]).start();

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
    ]).start();

    // Loader Fade In
    Animated.sequence([
      Animated.delay(450),
      Animated.timing(loaderOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    // ── 2. Lively Continuous Celebration Dance Loops ──
    // Vertical joyful dance bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(charactersFloat, {
          toValue: -14, // Lively upward dance jump
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(charactersFloat, {
          toValue: 2, // Landing bounce
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
          toValue: 1,
          duration: 950,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(charactersTilt, {
          toValue: -1,
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

    // Celebratory squash & stretch
    Animated.loop(
      Animated.sequence([
        Animated.timing(charactersBounceScale, {
          toValue: 1.05,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(charactersBounceScale, {
          toValue: 0.98,
          duration: 800,
          easing: Easing.in(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(charactersBounceScale, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();

    // Confetti gentle floating sway
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

    // ── 3. Radial Particle Burst + Continuous Floating Twinkle ──
    particleAnims.forEach((anim, i) => {
      const angle = (i / particleAnims.length) * 2 * Math.PI;
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
      ]).start(() => {
        // Continuous floating & twinkling loop
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim.twinkle, {
              toValue: 1,
              duration: 800 + (i % 5) * 200,
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

    // Disable Android hardware back button so provider cannot return to OTP / onboarding
    const backSubscription = BackHandler.addEventListener('hardwareBackPress', () => true);

    // Cycle through support messages every 1.3s
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1300);

    // Auto-redirect to Dashboard after CONGRATS_DURATION_MS (5.2 seconds)
    // Marks first-time sign-up so the dashboard triggers the tutorial ONLY on this arrival.
    const redirectTimer = setTimeout(() => {
      setHasSeenFirstTime(false);
      setJustSignedUp(true);
      router.replace({
        pathname: '/dashboard',
        params: { fromSignup: 'true' },
      } as any);
    }, CONGRATS_DURATION_MS);

    return () => {
      backSubscription.remove();
      clearInterval(messageInterval);
      clearTimeout(redirectTimer);
      charactersFloat.stopAnimation();
      charactersTilt.stopAnimation();
      charactersBounceScale.stopAnimation();
      confettiSway.stopAnimation();
    };
  }, [
    confettiScale,
    confettiOpacity,
    confettiSway,
    charactersScale,
    charactersTranslateY,
    charactersOpacity,
    charactersFloat,
    charactersTilt,
    charactersBounceScale,
    textTranslateY,
    textScale,
    textOpacity,
    loaderOpacity,
    particleAnims,
    loadingMessages.length,
    router,
    setHasSeenFirstTime,
    setJustSignedUp,
  ]);

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
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* ── Confetti Background Burst with Sway & Drift ── */}
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
        <Image
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

            const color = particleColors[idx % particleColors.length];
            const size = 6 + (idx % 4) * 2;
            const isStar = idx % 3 === 0;
            const isDiamond = idx % 3 === 1;

            return (
              <Animated.View
                key={`particle-${idx}`}
                style={[
                  styles.particleShape,
                  {
                    width: size,
                    height: size,
                    borderRadius: isStar ? 2 : isDiamond ? 3 : size / 2,
                    backgroundColor: color,
                    opacity: Animated.multiply(anim.opacity, particleTwinkleOpacity),
                    transform: [
                      { translateX: anim.translateX },
                      { translateY: Animated.add(anim.translateY, particleDriftY) },
                      { rotate: rot },
                      { scale: Animated.multiply(anim.scale, particleTwinkleScale) },
                    ],
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Celebratory Dancing Characters (Vertical Bounce + Tilt + Squash & Stretch) */}
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
          <Image
            source={CHARACTERS_IMAGE}
            style={styles.charactersImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Text Block with Spring Pop Entrance */}
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
            Application successful, welcome to Trend Business
          </Text>
        </Animated.View>
      </View>

      {/* ── Bottom Mini Loader with Rotating Green Arc Spinner & Dynamic Messages ── */}
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
        <Text style={styles.loaderText} numberOfLines={1}>
          {loadingMessages[messageIndex]}
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
};

export default BusinessCongratulationsScreen;

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

  // ── Center Content: Perfectly Centered ──
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
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    zIndex: 3,
  },
  charactersImage: {
    width: 250,
    height: 180,
  },

  // ── Text Group ──
  textGroup: {
    width: 316,
    alignItems: 'center',
    gap: 12,
    zIndex: 3,
  },
  title: {
    fontFamily: FONT_SEMIBOLD,
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 32,
    color: '#141A33',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  subtitle: {
    width: 316,
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    letterSpacing: 0.4,
  },

  // ── Bottom Mini Loader ──
  bottomLoaderContainer: {
    width: 330,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    zIndex: 3,
  },
  loaderText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
});
