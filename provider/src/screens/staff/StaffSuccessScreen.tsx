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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams } from 'expo-router';
import { useSafeRouter } from '../../utils/safeNavigation';
import { useStaffStore } from '../../context/StaffContext';
import { triggerLightHaptic } from '../../utils/haptics';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

const CONFETTI_ASSET = require('../../../assets/images/appointments/booking_success_confetti.png');
const CHARACTERS_ASSET = require('../../../assets/images/appointments/booking_success_characters.png');

/**
 * 1:1 Figma Animated Staff Celebration Screen ("booking successful screen" — Frame 6174:81276)
 *
 * Implements:
 * - 60fps Native-driven celebratory animations matching all TREND congratulation screens:
 *   - Confetti burst entrance + continuous gentle swaying & drift loop (Rectangle 297: 466x308px, top: 66px)
 *   - Joyful dancing characters with elastic spring bounce (0.4 -> 1.0) + continuous dance float, tilt & squash/stretch (Rectangle 296: 213x153px, top: 230px)
 *   - 20 radial festive twinkling explosion particles drifting outward
 *   - Staggered cascade entrance for title, subtitle, and action buttons
 * - Heading "Successful" (20px Medium, lineHeight 28px, letterSpacing 0.2px, #000000)
 * - Subtitle "You have Successfully added a staff to your business." (16px Regular, lineHeight 24px, letterSpacing 0.4px, rgba(96, 96, 102, 0.96))
 * - Dark pill "Get staff login code" (358x48px, top: 621px, routes directly to Staff Profile / Login Code screen)
 * - Light outlined pill "Go to staff management" (358x48px, top: 709px, 40px below primary button, clears back stack -> /staffs)
 * - Hardware and gesture back are disabled
 */
export const StaffSuccessScreen: React.FC = () => {
  const safeRouter = useSafeRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { staff } = useStaffStore();
  const { height: screenHeight } = Dimensions.get('window');
  const scale = Math.min(Math.max(screenHeight / 844, 0.85), 1.08);

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
  const textTranslateY = useRef(new Animated.Value(25)).current;
  const textScale = useRef(new Animated.Value(0.88)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  // Action Buttons Entrance
  const actionsTranslateY = useRef(new Animated.Value(28)).current;
  const actionsOpacity = useRef(new Animated.Value(0)).current;

  // 20 animated radial festive explosion particles with continuous floating & twinkling
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

  // Disable hardware back button on Android
  useEffect(() => {
    const onBackPress = () => true;
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, []);

  // ── Start Celebratory 60fps Animations ──
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

    // 4. Staggered entrance for action buttons
    Animated.sequence([
      Animated.delay(350),
      Animated.parallel([
        Animated.spring(actionsTranslateY, {
          toValue: 0,
          friction: 6,
          tension: 45,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(actionsOpacity, {
          toValue: 1,
          duration: 320,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    ]).start();

    // 5. Lively Continuous Celebration Dance Loops
    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(charactersFloat, {
          toValue: -14,
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
    );
    tiltLoop.start();

    const squashLoop = Animated.loop(
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
    );
    squashLoop.start();

    const confettiSwayLoop = Animated.loop(
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
    );
    confettiSwayLoop.start();

    // 6. Radial Particle Burst + Continuous Floating Twinkle
    particleAnims.forEach((anim, i) => {
      const angle = (i / particleAnims.length) * 2 * Math.PI;
      const distance = 75 + (i % 4) * 25;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance - 20;

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

    return () => {
      bounceLoop.stop();
      tiltLoop.stop();
      squashLoop.stop();
      confettiSwayLoop.stop();
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
    actionsTranslateY,
    actionsOpacity,
    particleAnims,
  ]);

  const handleGoToStaffManagement = () => {
    triggerLightHaptic();
    // Replace stack so neither AddStaffForm nor SuccessScreen remain in back stack
    safeRouter.replace('/staffs' as any);
  };

  const handleGetLoginCode = () => {
    triggerLightHaptic();
    const targetId = id || (staff.length > 0 ? staff[0].id : '');
    if (targetId) {
      // Per Figma prototype (Frame 6174:81276 -> Frame 6595:29695):
      // "Get staff login code" goes directly to the Staff Profile screen where Login Code is displayed
      safeRouter.replace({
        pathname: '/staff/[id]',
        params: { id: targetId },
      } as any);
    } else {
      safeRouter.replace('/staffs' as any);
    }
  };

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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.container}>
        {/* ── Rectangle 297: Confetti (466x308px, left: calc(50% - 466px/2 - 14px), top: 66px) ── */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.confettiFrame,
            {
              top: Math.round(22 * scale),
              opacity: confettiOpacity,
              transform: [
                { scale: confettiScale },
                { rotate: confettiRotation },
                { translateY: confettiDriftY },
              ],
            },
          ]}
        >
          <Image
            source={CONFETTI_ASSET}
            style={styles.confettiImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* ── Rectangle 296: Celebrating Characters + Radial Particles (213x153px, top: 230px) ── */}
        <View
          pointerEvents="none"
          style={[
            styles.charactersStage,
            {
              top: Math.round(186 * scale),
            },
          ]}
        >
          {/* Dynamic Floating Particles Overlay with Continuous Twinkle */}
          <View style={styles.particlesContainer}>
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
              source={CHARACTERS_ASSET}
              style={styles.charactersImage}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* ── congratulation text (358x92px, gap: 16px, top: 429px) ── */}
        <Animated.View
          style={[
            styles.copyBox,
            {
              top: Math.round(385 * scale),
              opacity: textOpacity,
              transform: [
                { translateY: textTranslateY },
                { scale: textScale },
              ],
            },
          ]}
        >
          <Text style={styles.title}>Successful</Text>
          <Text style={styles.subtitle}>
            You have Successfully added a staff to your business.
          </Text>
        </Animated.View>

        {/* ── Action Buttons (top: 621px & top: 709px -> 40px gap between buttons) ── */}
        <Animated.View
          style={[
            styles.actionsBox,
            {
              top: Math.round(577 * scale),
              opacity: actionsOpacity,
              transform: [{ translateY: actionsTranslateY }],
            },
          ]}
        >
          {/* Dark Pill: Get staff login code */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.darkButton}
            onPress={handleGetLoginCode}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Get staff login code"
          >
            <Text style={styles.darkButtonText}>Get staff login code</Text>
          </TouchableOpacity>

          {/* Light Outlined Pill: Go to staff management */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.lightButton}
            onPress={handleGoToStaffManagement}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Go to staff management"
          >
            <Text style={styles.lightButtonText}>Go to staff management</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </SafeAreaView>
  );
};

export default StaffSuccessScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    alignItems: 'center',
  },

  // ── Rectangle 297: Confetti (466x308px, left: calc(50% - 466px/2 - 14px), top: 66px) ──
  confettiFrame: {
    position: 'absolute',
    left: '50%',
    marginLeft: -247,
    width: 466,
    height: 308,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  confettiImage: {
    width: 466,
    height: 308,
  },

  // ── Rectangle 296: Celebrating Characters (213x153px, top: 230px) ──
  charactersStage: {
    position: 'absolute',
    width: 280,
    height: 153,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
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
  charactersWrapper: {
    width: 213,
    height: 153,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  charactersImage: {
    width: 213,
    height: 153,
  },

  // ── congratulation text (358x92px, gap: 16px, top: 429px) ──
  copyBox: {
    position: 'absolute',
    width: '100%',
    maxWidth: 358,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 16,
    zIndex: 3,
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

  // ── Filled action Buttons (top: 621px & top: 709px -> gap: 40px) ──
  actionsBox: {
    position: 'absolute',
    width: '100%',
    maxWidth: 390,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 40,
    zIndex: 4,
  },
  darkButton: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#858B94',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  darkButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  lightButton: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
});
