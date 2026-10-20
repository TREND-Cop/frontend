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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { POST_WORK_SUCCESS_REDIRECT_MS } from '../../constants/postWork.config';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

const CONFETTI_ASSET = require('../../../assets/images/dashboard/tutorial_confetti.png');
const CHARACTERS_ASSET = require('../../../assets/images/dashboard/tutorial_celebration_characters.png');

// ── 4 Pulsing Dots Loader matching Figma Frame U5 ──
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
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.35,
            duration: 320,
            useNativeDriver: true,
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
 * - Dimmed grey background matching preview frame tone
 * - Confetti and celebration characters illustration
 * - 4 horizontal pulsing loading dots below illustration
 * - Title: "Successful"
 * - Subtitle: "You have successfully posted your work on your business dashboard for clients to see."
 * - Hardware back and swipe back disabled
 * - Auto-redirects to /post-work after 3 seconds (POST_WORK_SUCCESS_REDIRECT_MS)
 * - AppState handling: redirects immediately if app was backgrounded and returns after 3s
 */
export const PostWorkSuccessScreen: React.FC = () => {
  const router = useRouter();
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Disable hardware back button on Android
  useEffect(() => {
    const onBackPress = () => true;
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, []);

  // Timer and backgrounding handling
  useEffect(() => {
    startTimeRef.current = Date.now();

    const triggerRedirect = () => {
      router.replace('/post-work' as any);
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
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.contentContainer}>
        {/* ── Illustration Area ── */}
        <View style={styles.illustrationWrapper}>
          <Image
            source={CONFETTI_ASSET}
            style={styles.confettiImage}
            resizeMode="contain"
          />
          <Image
            source={CHARACTERS_ASSET}
            style={styles.charactersImage}
            resizeMode="contain"
          />
        </View>

        {/* ── 4 Pulsing Dots (below celebration illustration per U5) ── */}
        <FourDotsLoader />

        {/* ── Text Container ── */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Successful</Text>
          <Text style={styles.subtitle}>
            You have successfully posted your work on your business dashboard for clients to see.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PostWorkSuccessScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#D9D9D9',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  illustrationWrapper: {
    width: 280,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  confettiImage: {
    position: 'absolute',
    width: 280,
    height: 220,
  },
  charactersImage: {
    width: 220,
    height: 140,
    marginTop: 40,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  title: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000814',
    textAlign: 'center',
    includeFontPadding: false,
  },
  subtitle: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
