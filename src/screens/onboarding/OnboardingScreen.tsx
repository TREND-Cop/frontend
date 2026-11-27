import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Animated,
  useWindowDimensions,
  BackHandler,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../utils/safeNavigation';
import { useUserContext } from '../../store/UserContext';
import { OnboardingHeroVideo } from '../../components/OnboardingHeroVideo';
import { WebMobileViewport } from '../../components/WebMobileViewport';

// ── Animated TREND Title ──
const AnimatedTrendTitle = ({ isWebLanding }: { isWebLanding: boolean }) => {
  const fadeAnim = useRef(new Animated.Value(isWebLanding ? 1 : 0)).current;
  const translateYAnim = useRef(new Animated.Value(isWebLanding ? 0 : 8)).current;

  useEffect(() => {
    if (isWebLanding) return;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateYAnim, isWebLanding]);

  return (
    <Animated.View
      style={[
        styles.brandTitleContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
    >
      <Text style={isWebLanding ? styles.brandTitleWeb : styles.brandTitle}>TREND</Text>
    </Animated.View>
  );
};

export const OnboardingScreen = ({
  onSignUp,
  onSignIn,
  onDismiss,
  onGetStarted,
}: {
  onSignUp?: () => void;
  onSignIn?: () => void;
  onDismiss?: () => void;
  onGetStarted?: () => void;
  navigation?: any;
}) => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const screenHeight = windowHeight > 0 ? windowHeight : 844;
  const isWebLanding = Platform.OS === 'web';

  // Lock Android hardware back at the customer root onboarding screen so it exits/minimizes app
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const onBackPress = () => {
      BackHandler.exitApp();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, []);

  const handleSignUp = () => {
    if (onSignUp) {
      onSignUp();
    } else {
      safeRouter.push('/sign-up' as any);
    }
  };

  const handleSignIn = () => {
    if (onSignIn) {
      onSignIn();
    } else {
      safeRouter.push('/sign-in' as any);
    }
  };

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      safeRouter.push('/role-selection' as any);
    }
  };

  const { updateProfile } = useUserContext();

  const handleDismiss = () => {
    try {
      updateProfile({ isLoggedIn: false });
    } catch {}
    if (onDismiss) {
      onDismiss();
    } else {
      safeRouter.replace('/home' as any);
    }
  };

  return (
    <WebMobileViewport>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* ── Top Hero Video Frame (Figma: width 391px, height 514px, top 0) ── */}
        <OnboardingHeroVideo height={Math.min(screenHeight * 0.609, 514)}>
          {!isWebLanding && (
            <TouchableOpacity
              style={[styles.skipButton, { top: Math.max(insets.top + 8, 53) }]}
              onPress={handleDismiss}
              activeOpacity={0.75}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          )}
        </OnboardingHeroVideo>

        {/* ── Bottom Content & CTA Section ── */}
        <SafeAreaView style={styles.bottomSection} edges={['bottom']}>
          <View style={isWebLanding ? styles.contentWrapperWeb : styles.contentWrapper}>
            {/* ── Brand Info Group (Figma Frame 1000006445: gap 24px, width 358px) ── */}
            <View style={isWebLanding ? styles.textBlockWeb : styles.textBlock}>
              <AnimatedTrendTitle isWebLanding={isWebLanding} />
              <Text style={isWebLanding ? styles.brandDescriptionWeb : styles.brandDescription}>
                {isWebLanding
                  ? 'Your one stop beauty platform, discover services and manage your business online with ease.'
                  : 'Your one-stop beauty platform, discover beauty services and book them in seconds.'}
              </Text>
            </View>

            {/* ── Action CTA Area ── */}
            {isWebLanding ? (
              <View style={styles.webCtaWrapper}>
                <TouchableOpacity
                  style={styles.getStartedButton}
                  onPress={handleGetStarted}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Get started"
                >
                  <Text style={styles.getStartedText}>Get started</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.signUpButton}
                  onPress={handleSignUp}
                  activeOpacity={0.85}
                >
                  <Text style={styles.signUpText}>Sign Up</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.signInButton}
                  onPress={handleSignIn}
                  activeOpacity={0.85}
                >
                  <Text style={styles.signInText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>
    </WebMobileViewport>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  skipButton: {
    position: 'absolute',
    top: 53,
    right: 16,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 8, 20, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  skipButtonText: {
    fontFamily: Platform.select({
      ios: 'SF Pro',
      android: 'DMSans_500Medium',
      web: 'DMSans_500Medium, sans-serif',
      default: 'DMSans_500Medium',
    }),
    ...(Platform.OS === 'web' ? { fontWeight: '400' as const } : { fontWeight: '500' as const }),
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
    color: '#FFFFFF',
    includeFontPadding: false,
  },

  bottomSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },

  contentWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 32,
    justifyContent: 'space-between',
  },
  contentWrapperWeb: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 45,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  textBlock: {
    gap: 16,
    paddingTop: 4,
  },
  textBlockWeb: {
    width: '100%',
    maxWidth: 358,
    gap: 24,
  },

  brandTitleContainer: {
    alignSelf: 'flex-start',
  },
  brandTitle: {
    color: 'rgba(0, 8, 20, 0.96)',
    fontFamily: Platform.select({
      ios: 'DMSans_700Bold',
      android: 'DMSans_700Bold',
      web: 'DMSans_700Bold, sans-serif',
      default: 'DMSans_700Bold',
    }),
    ...(Platform.OS === 'ios' ? { fontWeight: '700' as const } : {}),
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: 0.3,
    includeFontPadding: false,
  },
  // Figma CSS Screen 1: font-weight 590 -> 600, 32px, line-height 32px, letter-spacing 0.6px
  brandTitleWeb: {
    color: 'rgba(0, 8, 20, 0.96)',
    fontFamily: 'DMSans_600SemiBold, sans-serif',
    fontWeight: '400',
    fontSize: 32,
    lineHeight: 32,
    letterSpacing: 0.6,
    includeFontPadding: false,
  },

  brandDescription: {
    fontFamily: Platform.select({
      ios: 'SF Pro',
      android: 'DMSans_400Regular',
      web: 'DMSans_400Regular, sans-serif',
      default: 'DMSans_400Regular',
    }),
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  // Figma CSS Screen 1: Body text Regular, 16px, line-height 24px, letter-spacing 0.4px
  brandDescriptionWeb: {
    fontFamily: 'DMSans_400Regular, sans-serif',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  webCtaWrapper: {
    width: '100%',
    maxWidth: 358,
    paddingTop: 16,
  },
  getStartedButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },
  getStartedText: {
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
  },

  buttonsContainer: {
    gap: 32,
  },

  signUpButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },

  signUpText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    textTransform: 'capitalize',
    color: '#FFFFFF',
  },

  signInButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },

  signInText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    textTransform: 'capitalize',
    color: 'rgba(0, 8, 20, 0.96)',
  },
});

export default OnboardingScreen;
