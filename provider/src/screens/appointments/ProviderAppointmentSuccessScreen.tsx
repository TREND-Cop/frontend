import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';

const CONFETTI_IMAGE = require('../../../assets/images/appointments/booking_success_confetti.png');
const CHARACTERS_IMAGE = require('../../../assets/images/appointments/booking_success_characters.png');

// 1:1 Figma arrow-left-02 icon
const ArrowLeft02Icon = ({ size = 24, color = '#141B34' }: { size?: number; color?: string }) => (
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

export const ProviderAppointmentSuccessScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { height: screenHeight } = Dimensions.get('window');

  // ── Native 60fps Animation Drivers ──
  const confettiScale = useRef(new Animated.Value(0.4)).current;
  const confettiOpacity = useRef(new Animated.Value(0)).current;

  const charactersScale = useRef(new Animated.Value(0.4)).current;
  const charactersTranslateY = useRef(new Animated.Value(35)).current;
  const charactersOpacity = useRef(new Animated.Value(0)).current;

  const textTranslateY = useRef(new Animated.Value(20)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  const buttonTranslateY = useRef(new Animated.Value(30)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animation sequence
    Animated.parallel([
      // Confetti burst
      Animated.parallel([
        Animated.spring(confettiScale, {
          toValue: 1,
          friction: 6,
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
        Animated.delay(100),
        Animated.parallel([
          Animated.spring(charactersScale, {
            toValue: 1,
            friction: 5,
            tension: 50,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.spring(charactersTranslateY, {
            toValue: 0,
            friction: 5,
            tension: 50,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(charactersOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
      ]),

      // Explanatory Text fade & slide
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
      ]),

      // Action Button slide up
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
  }, [
    confettiScale,
    confettiOpacity,
    charactersScale,
    charactersTranslateY,
    charactersOpacity,
    textTranslateY,
    textOpacity,
    buttonTranslateY,
    buttonOpacity,
  ]);

  const params = useLocalSearchParams<{ id?: string }>();

  const handleBack = () => {
    router.replace('/appointments');
  };

  const handleCheckStatus = () => {
    router.replace({
      pathname: '/appointment/[id]' as any,
      params: {
        id: (params.id as string) || 'awaiting-1',
        status: 'awaiting',
      },
    });
  };

  const scale = screenHeight / 844;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* ── Back Button (Figma: width 48, height 48, radius 8, left 16, top 68) ── */}
      <TouchableOpacity
        style={[
          styles.backButton,
          { top: Platform.OS === 'ios' ? Math.max(insets.top + 20, 68) : Math.max(insets.top + 12, 48) },
        ]}
        activeOpacity={0.7}
        onPress={handleBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <ArrowLeft02Icon size={24} color="#141B34" />
      </TouchableOpacity>

      {/* ── Rectangle 297: Confetti (Figma: 466x308px, left: calc(50% - 466px/2 - 14px), top: 46px) ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.confettiFrame,
          {
            top: Math.round(46 * scale),
            opacity: confettiOpacity,
            transform: [{ scale: confettiScale }],
          },
        ]}
      >
        <Image
          source={CONFETTI_IMAGE}
          style={styles.confettiImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* ── Rectangle 296: Celebrating Characters (Figma: 213x153px, left: calc(50% - 213px/2 + 0.5px), top: 230px) ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.charactersFrame,
          {
            top: Math.round(230 * scale),
            opacity: charactersOpacity,
            transform: [
              { scale: charactersScale },
              { translateY: charactersTranslateY },
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

      {/* ── Instruction Subtitle (Figma: 358x40px, left: calc(50% - 358px/2), top: 517px) ── */}
      <Animated.View
        style={[
          styles.instructionContainer,
          {
            top: Math.round(517 * scale),
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        <Text style={styles.instructionText}>
          Go to <Text style={styles.instructionBold}>Category</Text> and select{' '}
          <Text style={styles.instructionBold}>Waiting for Client</Text> to view the
          appointment status.
        </Text>
      </Animated.View>

      {/* ── Filled Action Button (Figma: 358x48px, radius 24px, left: calc(50% - 358px/2), top: 698px) ── */}
      <Animated.View
        style={[
          styles.actionButtonContainer,
          {
            top: Math.round(698 * scale),
            opacity: buttonOpacity,
            transform: [{ translateY: buttonTranslateY }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.88}
          onPress={handleCheckStatus}
        >
          <Text style={styles.actionButtonText} numberOfLines={1}>
            Check Appointment Status
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ── Android Native System Dock Protector Barrier ── */}
      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </View>
  );
};

export default ProviderAppointmentSuccessScreen;

// ── 1:1 Stylesheet (Strict Line-by-Line Figma Conversion) ──────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },

  // ── Back Button (Figma: width 48, height 48, left 16, top 68, radius 8, padding 12, gap 10) ──
  backButton: {
    position: 'absolute',
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 8,
    padding: 12,
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },

  // ── Rectangle 297: Confetti (466x308px, left: calc(50% - 466px/2 - 14px), top: 46px) ──
  confettiFrame: {
    position: 'absolute',
    left: '50%',
    marginLeft: -247, // -(466/2) - 14 = -233 - 14
    width: 466,
    height: 308,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiImage: {
    width: 466,
    height: 308,
  },

  // ── Rectangle 296: Characters (213x153px, left: calc(50% - 213px/2 + 0.5px), top: 230px) ──
  charactersFrame: {
    position: 'absolute',
    left: '50%',
    marginLeft: -106, // -(213/2) + 0.5 = -106.5 + 0.5
    width: 213,
    height: 153,
    justifyContent: 'center',
    alignItems: 'center',
  },
  charactersImage: {
    width: 213,
    height: 153,
  },

  // ── Instruction Subtitle (358x40px, left: calc(50% - 358px/2), top: 517px) ──
  instructionContainer: {
    position: 'absolute',
    left: '50%',
    marginLeft: -179,
    width: 358,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    textAlign: 'center',
    color: '#000000',
    includeFontPadding: false,
  },
  instructionBold: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_700Bold',
    fontWeight: '700',
    color: '#000000',
  },

  // ── Filled Action Button (358x48px, radius 24, left: calc(50% - 358px/2), top: 698px) ──
  actionButtonContainer: {
    position: 'absolute',
    left: '50%',
    marginLeft: -179,
    width: 358,
    height: 48,
    alignItems: 'center',
    zIndex: 10,
  },
  actionButton: {
    width: 358,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 6,
  },
  actionButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
