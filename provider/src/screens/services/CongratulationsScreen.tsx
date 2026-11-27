import React, { useState, useEffect, useRef } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../utils/safeNavigation';

import { useServiceDraft } from '../../context/ServiceDraftContext';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { triggerLightHaptic } from '../../utils/haptics';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

const CONFETTI_ASSET = require('../../../assets/images/dashboard/tutorial_confetti.png');
const CHARACTERS_ASSET = require('../../../assets/images/dashboard/tutorial_celebration_characters.png');

/**
 * 1:1 Figma Animated Celebration Screen for Service Wizard Completion (Frame F5)
 *
 * Implements:
 * - 60fps Native-driven celebratory animations matching the app's master celebration standard:
 *   - Confetti burst entrance + continuous gentle swaying loop
 *   - Joyful dancing characters with elastic spring bounce (0.4 -> 1.0) + continuous lively dance float
 *   - 16 radial festive twinkling explosion particles drifting outward
 *   - Staggered cascade entrance for title, subtitle, and action buttons
 * - Title: "Congratulations" (20px Medium, center)
 * - Subtitle: "You have successfully added a service to Trend, now clients can book them."
 * - Standard 16px/20px gap LoadingOverlay on "Add another service" action
 * - Button 1: "Add another service" (Dark Pill, responsive width)
 * - Button 2: "Back to dashboard" (Text Button)
 */
export const CongratulationsScreen: React.FC = () => {
  const safeRouter = useSafeRouter();
  const { resetDraft } = useServiceDraft();

  const [isLoading, setIsLoading] = useState(false);

  // ── Native 60fps Animation Drivers ──
  const confettiScale = useRef(new Animated.Value(0.3)).current;
  const confettiOpacity = useRef(new Animated.Value(0)).current;
  const confettiSway = useRef(new Animated.Value(0)).current;

  // Characters Entrance
  const charactersScale = useRef(new Animated.Value(0.4)).current;
  const charactersTranslateY = useRef(new Animated.Value(45)).current;
  const charactersOpacity = useRef(new Animated.Value(0)).current;

  // Continuous Celebration Dance Loops
  const charactersFloat = useRef(new Animated.Value(0)).current;
  const charactersTilt = useRef(new Animated.Value(0)).current;

  // Text Entrance
  const textTranslateY = useRef(new Animated.Value(25)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  // Actions Entrance
  const actionsTranslateY = useRef(new Animated.Value(25)).current;
  const actionsOpacity = useRef(new Animated.Value(0)).current;

  // 16 animated festive explosion particles
  const particleAnims = useRef(
    Array.from({ length: 16 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(0),
      rotate: new Animated.Value(0),
      scale: new Animated.Value(0),
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
    '#1A82FF',
    '#FFD700',
    '#0C790C',
    '#FB923C',
  ];

  // Disable hardware back button on Android
  useEffect(() => {
    const onBackPress = () => true;
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, []);

  // ── Start Celebratory Animations ──
  useEffect(() => {
    // 1. Confetti burst & fade in
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

    // 2. Characters spring entrance
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

    // 3. Staggered cascade entrance for title & subtitle
    Animated.sequence([
      Animated.delay(220),
      Animated.parallel([
        Animated.spring(textTranslateY, {
          toValue: 0,
          friction: 6,
          tension: 45,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    ]).start();

    // 4. Staggered entrance for action buttons
    Animated.sequence([
      Animated.delay(360),
      Animated.parallel([
        Animated.spring(actionsTranslateY, {
          toValue: 0,
          friction: 6,
          tension: 45,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(actionsOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    ]).start();

    // 5. Continuous dancing loops (gentle vertical bounce + slight joyful sway)
    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(charactersFloat, {
          toValue: -12,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(charactersFloat, {
          toValue: 2,
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
    );
    bounceLoop.start();

    const tiltLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(charactersTilt, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(charactersTilt, {
          toValue: -1,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(charactersTilt, {
          toValue: 0,
          duration: 450,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    tiltLoop.start();

    const confettiSwayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(confettiSway, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(confettiSway, {
          toValue: -1,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    confettiSwayLoop.start();

    // 6. Festive explosion particles
    particleAnims.forEach((anim, i) => {
      const angle = (i / particleAnims.length) * 2 * Math.PI;
      const radius = 60 + (i % 4) * 22;
      const targetX = Math.cos(angle) * radius;
      const targetY = Math.sin(angle) * radius - 15;

      Animated.sequence([
        Animated.delay(120 + (i % 6) * 45),
        Animated.parallel([
          Animated.timing(anim.opacity, {
            toValue: 0.9,
            duration: 280,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.spring(anim.translateX, {
            toValue: targetX,
            friction: 5,
            tension: 40,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.spring(anim.translateY, {
            toValue: targetY,
            friction: 5,
            tension: 40,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(anim.scale, {
            toValue: 1,
            duration: 350,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(anim.rotate, {
            toValue: (i % 2 === 0 ? 1 : -1) * 360,
            duration: 900,
            easing: Easing.out(Easing.quad),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
      ]).start();
    });

    return () => {
      bounceLoop.stop();
      tiltLoop.stop();
      confettiSwayLoop.stop();
    };
  }, []);

  // "Add another service" action:
  // Shows loading overlay (16px standard dots) -> clears draft & stale wizard stack -> Step 1 with skeleton loader
  const handleAddAnotherService = () => {
    triggerLightHaptic();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      resetDraft();
      safeRouter.resetRoot({
        pathname: '/business-services-wizard',
        params: { skeleton: 'true', returnTo: 'dashboard' },
      } as any);
    }, 800);
  };

  // "Back to dashboard" action:
  // Clears draft & stale wizard stack -> returns to main dashboard
  const handleBackToDashboard = () => {
    triggerLightHaptic();
    resetDraft();
    safeRouter.resetRoot('/dashboard' as any);
  };

  const confettiRotation = confettiSway.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-3.5deg', '3.5deg'],
  });

  const characterTiltDeg = charactersTilt.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-3deg', '3deg'],
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.contentContainer}>
        {/* ── 1. Illustration Area with Full 60fps Animation Drivers ── */}
        <View style={styles.illustrationWrapper}>
          {/* Festive Radial Explosion Particles */}
          {particleAnims.map((anim, idx) => {
            const rot = anim.rotate.interpolate({
              inputRange: [-360, 360],
              outputRange: ['-360deg', '360deg'],
            });
            const size = idx % 3 === 0 ? 9 : idx % 2 === 0 ? 7 : 5;
            const isStar = idx % 2 === 0;

            return (
              <Animated.View
                key={`particle_${idx}`}
                pointerEvents="none"
                style={[
                  styles.particle,
                  {
                    width: size,
                    height: size,
                    borderRadius: isStar ? 2 : size / 2,
                    backgroundColor: particleColors[idx % particleColors.length],
                    opacity: anim.opacity,
                    transform: [
                      { translateX: anim.translateX },
                      { translateY: anim.translateY },
                      { scale: anim.scale },
                      { rotate: rot },
                    ],
                  },
                ]}
              />
            );
          })}

          {/* Swaying & Bursting Confetti */}
          <Animated.Image
            source={CONFETTI_ASSET}
            style={[
              styles.confettiImage,
              {
                opacity: confettiOpacity,
                transform: [
                  { scale: confettiScale },
                  { rotate: confettiRotation },
                ],
              },
            ]}
            resizeMode="contain"
          />

          {/* Bouncing & Dancing Celebration Characters */}
          <Animated.View
            style={[
              styles.charactersWrapper,
              {
                opacity: charactersOpacity,
                transform: [
                  { translateY: Animated.add(charactersTranslateY, charactersFloat) },
                  { scale: charactersScale },
                  { rotate: characterTiltDeg },
                ],
              },
            ]}
          >
            <Image
              source={CHARACTERS_ASSET}
              style={styles.charactersImage}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* ── 2. Text Container (Clean, no misplaced dots) ── */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={styles.title}>Congratulations</Text>
          <Text style={styles.subtitle}>
            You have successfully added a service to Trend, now clients can book them.
          </Text>
        </Animated.View>

        {/* ── 3. Actions (Cascading Entrance, Responsive) ── */}
        <Animated.View
          style={[
            styles.actionsContainer,
            {
              opacity: actionsOpacity,
              transform: [{ translateY: actionsTranslateY }],
            },
          ]}
        >
          {/* Add another service (Dark Pill Button) */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.addAnotherButton}
            onPress={handleAddAnotherService}
            accessibilityRole="button"
            accessibilityLabel="Add another service"
          >
            <Text style={styles.addAnotherButtonText}>Add another service</Text>
          </TouchableOpacity>

          {/* Back to dashboard (Text Button) */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backDashboardButton}
            onPress={handleBackToDashboard}
            accessibilityRole="button"
            accessibilityLabel="Back to dashboard"
          >
            <Text style={styles.backDashboardButtonText}>Back to dashboard</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <NativeDockSpacer backgroundColor="#FFFFFF" />

      {/* ── 4. Dimmed Processing Overlay (Standard 4 Dots, 16px size, 20px gap, Centered) ── */}
      <LoadingOverlay
        visible={isLoading}
        dotsCount={4}
        dotSize={16}
        dotGap={20}
        overlayOpacity={0.1}
        dotColor="rgba(0, 8, 20, 0.96)"
        centered={true}
      />
    </SafeAreaView>
  );
};

export default CongratulationsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  // 1. Illustration Area (top: 76px, confetti 466x308, characters 213x153)
  illustrationWrapper: {
    width: '100%',
    maxWidth: 358,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 32,
  },
  confettiImage: {
    position: 'absolute',
    width: '100%',
    maxWidth: 358,
    height: 260,
  },
  charactersWrapper: {
    width: 213,
    height: 153,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  charactersImage: {
    width: 213,
    height: 153,
  },
  particle: {
    position: 'absolute',
    zIndex: 2,
  },

  // 2. Text Container (358x92px, centered)
  textContainer: {
    width: '100%',
    maxWidth: 358,
    alignItems: 'center',
    gap: 12,
    marginBottom: 48,
  },
  title: {
    fontFamily: FONT_MEDIUM,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
    includeFontPadding: false,
  },
  subtitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },

  // 3. Actions Container (Responsive)
  actionsContainer: {
    width: '100%',
    maxWidth: 358,
    alignItems: 'center',
    gap: 16,
  },
  addAnotherButton: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  addAnotherButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  backDashboardButton: {
    width: '100%',
    maxWidth: 262,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backDashboardButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
