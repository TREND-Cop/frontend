import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Platform,
  BackHandler,
  AppState,
  AppStateStatus,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useSafeRouter } from '../../utils/safeNavigation';

import { POST_WORK_SUCCESS_REDIRECT_MS } from '../../constants/postWork.config';
import { STAFF_ROUTES } from '../../constants/staffRoutes';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

// Official high-res celebratory illustration assets used across all celebration screens
const CONFETTI_IMAGE = require('../../../assets/images/appointments/booking_success_confetti.png');
const CHARACTERS_IMAGE = require('../../../assets/images/appointments/booking_success_characters.png');

// ── 4 Pulsing Dots Loader matching standard LoadingOverlay (16px size, 20px gap) ──
function FourDotsLoader() {
  const dot1 = useRef(new Animated.Value(0.35)).current;
  const dot2 = useRef(new Animated.Value(0.35)).current;
  const dot3 = useRef(new Animated.Value(0.35)).current;
  const dot4 = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const dots = [dot1, dot2, dot3, dot4];
    const createPulse = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 320,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(anim, {
            toValue: 0.35,
            duration: 320,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.delay(Math.max(0, 600 - delay)),
        ])
      );
    };

    const anims = dots.map((d, i) => createPulse(d, i * 140));
    anims.forEach((a) => a.start());

    return () => {
      anims.forEach((a) => a.stop());
    };
  }, [dot1, dot2, dot3, dot4]);

  return (
    <View style={styles.dotsRow}>
      {[dot1, dot2, dot3, dot4].map((anim, idx) => (
        <Animated.View
          key={idx}
          style={[
            styles.dot,
            {
              opacity: anim,
              transform: [
                {
                  scale: anim.interpolate({
                    inputRange: [0.35, 1],
                    outputRange: [0.85, 1.15],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

/**
 * 1:1 Figma Post Work Successful Screen (Frame U5)
 * - Pure white background matching all congratulation screens
 * - Full 1:1 celebratory confetti (466x308) and celebration characters (234x168)
 * - 60fps Native-driven animations (confetti burst + sway, character celebration bounce + dancing float)
 * - 4 horizontal pulsing loading dots below celebration illustration with standard 16px/20px measurements
 * - Title: "Successful"
 * - Subtitle: "You have successfully posted your work on your business dashboard for clients to see."
 * - Hardware back and swipe back disabled
 * - Auto-redirects after 3 seconds (POST_WORK_SUCCESS_REDIRECT_MS)
 * - Native dock protection
 */
export interface PostWorkSuccessScreenProps {
  isStaff?: boolean;
}

export const PostWorkSuccessScreen: React.FC<PostWorkSuccessScreenProps> = ({ isStaff = false }) => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = Dimensions.get('window');
  const scale = screenHeight < 700 ? 0.88 : screenHeight < 800 ? 0.94 : 1.0;

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Native 60fps Animation Drivers ──
  const confettiScale = useRef(new Animated.Value(0.4)).current;
  const confettiOpacity = useRef(new Animated.Value(0)).current;
  const confettiSway = useRef(new Animated.Value(0)).current;

  const charactersScale = useRef(new Animated.Value(0.4)).current;
  const charactersTranslateY = useRef(new Animated.Value(35)).current;
  const charactersOpacity = useRef(new Animated.Value(0)).current;
  const charactersFloat = useRef(new Animated.Value(0)).current;

  const textTranslateY = useRef(new Animated.Value(20)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  // Disable hardware back button on Android
  useEffect(() => {
    const onBackPress = () => true;
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, []);

  // Entrance animations + continuous celebratory loops
  useEffect(() => {
    // 1. Staggered entrance animation sequence
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

      // Dots & Text fade & slide
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
    ]).start();

    // 2. Continuous characters gentle dancing float loop
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(charactersFloat, {
          toValue: -8,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(charactersFloat, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    floatLoop.start();

    // 3. Continuous confetti sway loop
    const swayLoop = Animated.loop(
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
    swayLoop.start();

    return () => {
      floatLoop.stop();
      swayLoop.stop();
    };
  }, []);

  // Timer and backgrounding handling
  useEffect(() => {
    startTimeRef.current = Date.now();

    const triggerRedirect = () => {
      if (isStaff) {
        safeRouter.replace(STAFF_ROUTES.POST_WORK as any);
      } else {
        safeRouter.replace('/post-work' as any);
      }
    };

    timerRef.current = setTimeout(() => {
      triggerRedirect();
    }, POST_WORK_SUCCESS_REDIRECT_MS);

    // AppState listener: if app was backgrounded and returned after 3s, redirect immediately
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        const elapsed = Date.now() - startTimeRef.current;
        if (elapsed >= POST_WORK_SUCCESS_REDIRECT_MS) {
          if (timerRef.current) clearTimeout(timerRef.current);
          triggerRedirect();
        }
      }
    };

    const appStateSub = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      appStateSub.remove();
    };
  }, [isStaff, safeRouter]);

  const confettiRotation = confettiSway.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-3deg', '3deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* ── Confetti (466x308px, top: -4px) ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.confettiFrame,
          {
            top: Math.round(-4 * scale),
            opacity: confettiOpacity,
            transform: [
              { scale: confettiScale },
              { rotate: confettiRotation },
            ],
          },
        ]}
      >
        <Image
          source={CONFETTI_IMAGE}
          style={styles.confettiImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* ── Celebrating Characters (234x168px, top: 177px) ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.charactersFrame,
          {
            top: Math.round(177 * scale),
            opacity: charactersOpacity,
            transform: [
              { scale: charactersScale },
              { translateY: Animated.add(charactersTranslateY, charactersFloat) },
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

      {/* ── 4 Pulsing Dots Loader (16px size, 20px gap, top: 375px) ── */}
      <Animated.View
        style={[
          styles.dotsContainer,
          {
            top: Math.round(375 * scale),
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        <FourDotsLoader />
      </Animated.View>

      {/* ── Title "Successful" (top: 425px) ── */}
      <Animated.View
        style={[
          styles.titleContainer,
          {
            top: Math.round(425 * scale),
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        <Text style={styles.title}>Successful</Text>
      </Animated.View>

      {/* ── Subtitle (top: 468px) ── */}
      <Animated.View
        style={[
          styles.subtitleContainer,
          {
            top: Math.round(468 * scale),
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        <Text style={styles.subtitle}>
          You have successfully posted your work on your business dashboard for clients to see.
        </Text>
      </Animated.View>

      {/* ── Android Native System Dock Protector Barrier ── */}
      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </View>
  );
};

export default PostWorkSuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },

  // ── Confetti (466x308px, centered horizontally) ──
  confettiFrame: {
    position: 'absolute',
    left: '50%',
    marginLeft: -233,
    width: 466,
    height: 308,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiImage: {
    width: 466,
    height: 308,
  },

  // ── Characters (234x168px, centered horizontally) ──
  charactersFrame: {
    position: 'absolute',
    left: '50%',
    marginLeft: -117,
    width: 234,
    height: 168,
    justifyContent: 'center',
    alignItems: 'center',
  },
  charactersImage: {
    width: 234,
    height: 168,
  },

  // ── 4 Pulsing Dots (Standard 16px size, 20px gap) ──
  dotsContainer: {
    position: 'absolute',
    left: '50%',
    marginLeft: -62, // (4 * 16 + 3 * 20) / 2 = 124 / 2 = 62
    width: 124,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Text Elements ──
  titleContainer: {
    position: 'absolute',
    left: '50%',
    marginLeft: -179,
    width: 358,
    alignItems: 'center',
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
  subtitleContainer: {
    position: 'absolute',
    left: '50%',
    marginLeft: -175,
    width: 350,
    alignItems: 'center',
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
});
