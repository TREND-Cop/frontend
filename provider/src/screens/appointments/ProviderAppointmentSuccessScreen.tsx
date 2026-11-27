import { useLocalSearchParams } from 'expo-router';
import { useSafeRouter } from '../../utils/safeNavigation';
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
import { NativeDockSpacer } from '../../components/NativeDockSpacer';

const CONFETTI_IMAGE = require('../../../assets/images/appointments/booking_success_confetti.png');
const CHARACTERS_IMAGE = require('../../../assets/images/appointments/booking_success_characters.png');

export const ProviderAppointmentSuccessScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const safeRouter = useSafeRouter();
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

      // Action Buttons slide up
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

  const handleCheckStatus = () => {
    safeRouter.replace({
      pathname: '/appointment/[id]' as any,
      params: {
        id: (params.id as string) || 'awaiting-1',
        status: 'awaiting',
      },
    });
  };

  const handleSeeMore = () => {
    safeRouter.replace('/appointments');
  };

  const scale = screenHeight / 844;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* ── Rectangle 297: Confetti (Figma: 466x308px, left: calc(50% - 466px/2), top: -4px) ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.confettiFrame,
          {
            top: Math.round(-4 * scale),
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

      {/* ── Rectangle 296: Celebrating Characters (Figma: 234x168px, left: calc(50% - 234px/2), top: 177px) ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.charactersFrame,
          {
            top: Math.round(177 * scale),
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

      {/* ── Appointment Accepted Title (Figma: 358x28px, left: calc(50% - 358px/2), top: 401px) ── */}
      <Animated.View
        style={[
          styles.titleContainer,
          {
            top: Math.round(401 * scale),
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        <Text style={styles.congratulationTitle}>Appointment accepted</Text>
      </Animated.View>

      {/* ── Subtitle (Figma: 350x48px, left: calc(50% - 350px/2), top: 453px) ── */}
      <Animated.View
        style={[
          styles.subtitleContainer,
          {
            top: Math.round(453 * scale),
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        <Text style={styles.congratulationSubtitle}>
          Your staff will be notified on the accepted appointment
        </Text>
      </Animated.View>

      {/* ── Primary Action Button: Check appointment status (Figma: 358x48px, left: calc(50% - 358px/2), top: 598px) ── */}
      <Animated.View
        style={[
          styles.primaryButtonContainer,
          {
            top: Math.round(598 * scale),
            opacity: buttonOpacity,
            transform: [{ translateY: buttonTranslateY }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.88}
          onPress={handleCheckStatus}
        >
          <Text style={styles.primaryButtonText} numberOfLines={1}>
            Check appointment status
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ── Secondary Action Button: See more appointments (Figma: 358x48px, left: calc(50% - 358px/2), top: 686px) ── */}
      <Animated.View
        style={[
          styles.secondaryButtonContainer,
          {
            top: Math.round(686 * scale),
            opacity: buttonOpacity,
            transform: [{ translateY: buttonTranslateY }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.88}
          onPress={handleSeeMore}
        >
          <Text style={styles.secondaryButtonText} numberOfLines={1}>
            See more appointments
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

  // ── Rectangle 297: Confetti (466x308px, left: calc(50% - 466px/2), top: -4px) ──
  confettiFrame: {
    position: 'absolute',
    left: '50%',
    marginLeft: -233, // -(466/2)
    width: 466,
    height: 308,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiImage: {
    width: 466,
    height: 308,
  },

  // ── Rectangle 296: Characters (234x168px, left: calc(50% - 234px/2), top: 177px) ──
  charactersFrame: {
    position: 'absolute',
    left: '50%',
    marginLeft: -117, // -(234/2)
    width: 234,
    height: 168,
    justifyContent: 'center',
    alignItems: 'center',
  },
  charactersImage: {
    width: 234,
    height: 168,
  },

  // ── Title Container (358x28px, left: calc(50% - 358px/2), top: 401px) ──
  titleContainer: {
    position: 'absolute',
    left: '50%',
    marginLeft: -179,
    width: 358,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  congratulationTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    textAlign: 'center',
    color: '#000000',
    includeFontPadding: false,
  },

  // ── Subtitle Container (350x48px, left: calc(50% - 350px/2), top: 453px) ──
  subtitleContainer: {
    position: 'absolute',
    left: '50%',
    marginLeft: -175,
    width: 350,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  congratulationSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    textAlign: 'center',
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  // ── Primary Action Button (358x48px, radius 24, left: calc(50% - 358px/2), top: 598px) ──
  primaryButtonContainer: {
    position: 'absolute',
    left: '50%',
    marginLeft: -179,
    width: 358,
    height: 48,
    alignItems: 'center',
    zIndex: 10,
  },
  primaryButton: {
    width: 358,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: 'rgba(133, 139, 148, 0.04)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  primaryButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    textAlign: 'center',
    includeFontPadding: false,
  },

  // ── Secondary Action Button (358x48px, radius 24, left: calc(50% - 358px/2), top: 686px) ──
  secondaryButtonContainer: {
    position: 'absolute',
    left: '50%',
    marginLeft: -179,
    width: 358,
    height: 48,
    alignItems: 'center',
    zIndex: 10,
  },
  secondaryButton: {
    width: 358,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
