import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { SafeImage } from '../../components/ui/SafeImage';
import {
  RateFeedbackBottomSheet,
  shouldShowPostBookingRatePrompt,
} from '../../components/RateFeedbackBottomSheet';
import { bookingStore } from '../../utils/bookingStore';
import { typography } from '../../constants/theme';

const CONFETTI_IMAGE = require('../../../assets/images/custom/booking_success_confetti.png');
const CHARACTERS_IMAGE = require('../../../assets/images/custom/booking_success_characters.png');

// Exact Figma arrow-left-02 icon
const ArrowLeftIcon = ({ size = 24, color = '#141B34' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4.5 12H19.5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 18C10 18 4.5 13.58 4.5 12C4.5 10.42 10 6 10 6"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BookingSuccessScreen = ({ navigation }: { navigation?: any }) => {
  const router = useRouter();
  const params = useLocalSearchParams<{ appointmentId?: string }>();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = Dimensions.get('window');
  const [showRateModal, setShowRateModal] = useState(false);

  // ── Native 60fps Animation Drivers ──
  const confettiScale = useRef(new Animated.Value(0.3)).current;
  const confettiOpacity = useRef(new Animated.Value(0)).current;
  const confettiSway = useRef(new Animated.Value(0)).current;

  // Characters Entrance & Continuous Dance
  const charactersScale = useRef(new Animated.Value(0.4)).current;
  const charactersTranslateY = useRef(new Animated.Value(45)).current;
  const charactersOpacity = useRef(new Animated.Value(0)).current;
  const charactersFloat = useRef(new Animated.Value(0)).current;
  const charactersTilt = useRef(new Animated.Value(0)).current;
  const charactersBounceScale = useRef(new Animated.Value(1)).current;

  // Staggered Cascade Elements
  const textTranslateY = useRef(new Animated.Value(25)).current;
  const textScale = useRef(new Animated.Value(0.85)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  const buttonTranslateY = useRef(new Animated.Value(45)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // ── 1. Main Entrance Staggered Sequence ──
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

      // Characters celebration bounce
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

      // Action Button Slide Up
      Animated.sequence([
        Animated.delay(350),
        Animated.parallel([
          Animated.spring(buttonTranslateY, {
            toValue: 0,
            friction: 6,
            tension: 45,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
      ]),
    ]).start();

    // ── 2. Continuous Dance Loops for Characters ──
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(charactersFloat, {
          toValue: -8,
          duration: 900,
          easing: Easing.out(Easing.sin),
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
    floatLoop.start();

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

    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(charactersBounceScale, {
          toValue: 1.05,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(charactersBounceScale, {
          toValue: 0.96,
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
    );
    bounceLoop.start();

    const swayLoop = Animated.loop(
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
    swayLoop.start();

    // Show rate modal after a short delay post-booking
    const checkRatePrompt = async () => {
      const shouldShow = await shouldShowPostBookingRatePrompt();
      if (shouldShow) {
        setTimeout(() => setShowRateModal(true), 2500);
      }
    };
    checkRatePrompt();

    return () => {
      floatLoop.stop();
      tiltLoop.stop();
      bounceLoop.stop();
      swayLoop.stop();
    };
  }, []);

  const handleGoBack = () => {
    bookingStore.resetBookingSelections();
    router.replace('/home');
  };

  const handleViewAppointment = () => {
    bookingStore.resetBookingSelections();
    if (params.appointmentId) {
      router.push({
        pathname: '/appointment',
        params: { id: params.appointmentId },
      } as any);
    } else {
      router.push('/appointment' as any);
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

  const actionBtnBottom = Math.max(insets.bottom, 24) + 120;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Layer 1: Confetti Graphic Background with Sway Animation (Figma Rectangle 297: 466x308, top -54px) ── */}
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

      {/* ── Back Button (Figma: 48x48, radius 8px, left 16px, top 68px) ── */}
      <TouchableOpacity
        onPress={handleGoBack}
        style={styles.backButton}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <ArrowLeftIcon size={24} color="#141B34" />
      </TouchableOpacity>

      {/* ── Layer 2: Characters High-Five Illustration (Figma Rectangle 296: 213x153, top 130px) ── */}
      <Animated.View
        style={[
          styles.charactersContainer,
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

      {/* ── Congratulation Text (Figma: top 355px, gap 16px) with Pop Slide-Up ── */}
      <Animated.View
        style={[
          styles.congratulationContainer,
          {
            opacity: textOpacity,
            transform: [
              { translateY: textTranslateY },
              { scale: textScale },
            ],
          },
        ]}
      >
        <Text style={styles.congratulationTitle}>Congratulations</Text>
        <Text style={styles.congratulationSubtitle}>
          Successfully booked an appointment
        </Text>
      </Animated.View>

      {/* ── Filled Action Button (Figma: 358x48, radius 24px) ── */}
      <Animated.View
        style={[
          styles.actionBtnContainer,
          {
            bottom: actionBtnBottom,
            opacity: buttonOpacity,
            transform: [{ translateY: buttonTranslateY }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.85}
          onPress={handleViewAppointment}
        >
          <Text style={styles.actionBtnText}>View Appointment</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ── Rate / Feedback Bottom Sheet ── */}
      <RateFeedbackBottomSheet
        visible={showRateModal}
        onClose={() => setShowRateModal(false)}
        onSubmit={(rating, feedback) => {
          console.log('Rating submitted:', { rating, feedback });
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },

  // ── Confetti Background (Rectangle 297: 466x308, left calc(50% - 466px/2 - 14px), top -54px) ──
  confettiContainer: {
    position: 'absolute',
    top: -54,
    left: '50%',
    marginLeft: -247,
    width: 466,
    height: 308,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  confettiImage: {
    width: 466,
    height: 308,
  },

  // ── Back Button (top 68px, left 16px, 48x48px, radius 8px, padding 12px) ──
  backButton: {
    position: 'absolute',
    top: 68,
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  // ── Characters High-Five Illustration (Rectangle 296: 213x153, left calc(50% - 213px/2 + 0.5px), top 130px) ──
  charactersContainer: {
    position: 'absolute',
    top: 130,
    left: '50%',
    marginLeft: -106,
    width: 213,
    height: 153,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  charactersImage: {
    width: 213,
    height: 153,
  },

  // ── Congratulation Text (width 292, height 68, top 355px, gap 16px) ──
  congratulationContainer: {
    position: 'absolute',
    top: 355,
    left: '50%',
    marginLeft: -146,
    width: 292,
    height: 68,
    alignItems: 'center',
    gap: 16,
    zIndex: 3,
  },
  congratulationTitle: {
    width: 292,
    height: 28,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: Platform.OS === 'ios' ? 0.2 : 0.2,
    color: '#000000',
    textAlign: 'center',
  },
  congratulationSubtitle: {
    width: 292,
    height: 24,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },

  // ── Filled Action Button (responsive width, radius 24px) ──
  actionBtnContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 48,
    zIndex: 10,
  },
  actionBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  actionBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
});
