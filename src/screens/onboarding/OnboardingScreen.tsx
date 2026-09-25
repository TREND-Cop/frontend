import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { X } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Video source from assets/videos/
const VIDEO_SOURCE = require('../../../assets/videos/lv_0_20260903090731.mp4');

// ── Animated TREND Title ──
const AnimatedTrendTitle = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [fadeAnim, translateYAnim]);

  return (
    <View style={styles.brandTitleContainer}>
      <Animated.Text
        style={[
          styles.brandTitle,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
          },
        ]}
      >
        TREND
      </Animated.Text>
    </View>
  );
};

export const OnboardingScreen = ({
  onSignUp,
  onSignIn,
  onDismiss,
  navigation,
}: {
  onSignUp?: () => void;
  onSignIn?: () => void;
  onDismiss?: () => void;
  navigation?: any;
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;

  // Resolve video URI safely for web & native without calling Image.resolveAssetSource blindly
  const videoUri = useMemo(() => {
    if (typeof VIDEO_SOURCE === 'string') return VIDEO_SOURCE;
    if (VIDEO_SOURCE && typeof VIDEO_SOURCE === 'object') {
      if ((VIDEO_SOURCE as any).uri) return (VIDEO_SOURCE as any).uri;
      if ((VIDEO_SOURCE as any).default) {
        return typeof (VIDEO_SOURCE as any).default === 'string'
          ? (VIDEO_SOURCE as any).default
          : (VIDEO_SOURCE as any).default?.uri || '/assets/assets/videos/lv_0_20260903090731.mp4';
      }
    }
    return '/assets/assets/videos/lv_0_20260903090731.mp4';
  }, []);

  // Safe native source calculation to prevent null pointer exceptions in release builds
  const safeNativeSource = useMemo(() => {
    if (Platform.OS === 'web') return null;
    try {
      if (typeof VIDEO_SOURCE === 'number') {
        const resolved = Image.resolveAssetSource(VIDEO_SOURCE);
        if (resolved && resolved.uri) {
          return { uri: resolved.uri };
        }
      }
      return VIDEO_SOURCE;
    } catch {
      return null;
    }
  }, []);

  // Web video DOM ref for direct autoplay handling
  const webVideoRef = useRef<any>(null);

  // Native player initialization with safe fallback
  const player = useVideoPlayer(safeNativeSource, (p) => {
    try {
      p.loop = true;
      p.muted = true;
      p.play();
    } catch (e) {
      console.warn('Video player init callback error:', e);
    }
  });

  // Ensure playback starts on both platforms
  useEffect(() => {
    if (Platform.OS === 'web' && webVideoRef.current) {
      webVideoRef.current.muted = true;
      webVideoRef.current.defaultMuted = true;
      webVideoRef.current.loop = true;
      webVideoRef.current.playsInline = true;
      webVideoRef.current.play?.().catch(() => {
        // Retry on interaction if needed
      });
    } else if (player) {
      try {
        player.muted = true;
        player.loop = true;
        player.play();
      } catch (e) {
        console.warn('Video player playback error:', e);
      }
    }
  }, [player]);

  const handleSignUp = () => {
    if (onSignUp) {
      onSignUp();
    } else {
      router.push('/sign-up' as any);
    }
  };

  const handleSignIn = () => {
    if (onSignIn) {
      onSignIn();
    } else {
      router.push('/sign-in' as any);
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    } else {
      router.push('/sign-up' as any);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Top Hero Video Frame (Figma: width 391px, height 514px, top 0) ── */}
      <View style={[styles.heroFrame, { height: Math.min(screenHeight * 0.6, 514) }]}>
        {Platform.OS === 'web' ? (
          React.createElement('video', {
            ref: webVideoRef,
            src: videoUri,
            autoPlay: true,
            loop: true,
            muted: true,
            playsInline: true,
            style: {
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0,
              border: 0,
              backgroundColor: '#000000',
            },
          })
        ) : player && safeNativeSource ? (
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            nativeControls={false}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000814' }]} />
        )}

        {/* ── Gradient Overlay Blend (Figma Frame 1000006447: height 110px, top 427px) ── */}
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0)',
            'rgba(255, 255, 255, 0.45)',
            'rgba(255, 255, 255, 0.88)',
            '#FFFFFF',
          ]}
          locations={[0, 0.35, 0.72, 1]}
          style={styles.gradient}
          pointerEvents="none"
        />

        {/* ── Cancel / X Button (Figma: 40x40, padding 8px, top 53px, right 15px) ── */}
        <TouchableOpacity
          style={[styles.cancelButton, { top: Math.max(insets.top + 6, 53) }]}
          onPress={handleDismiss}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <X size={24} color="#FFFFFF" strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      {/* ── Bottom Content & CTA Section ── */}
      <SafeAreaView style={styles.bottomSection} edges={['bottom']}>
        <View style={styles.contentWrapper}>
          {/* ── Brand Info Group (Figma Frame 1000006445: gap 24px) ── */}
          <View style={styles.textBlock}>
            <AnimatedTrendTitle />
            <Text style={styles.brandDescription}>
              Your one-stop beauty platform, discover beauty services and book them in seconds.
            </Text>
          </View>

          {/* ── Action Buttons (Figma: buttons, left 16px, height 128px, gap 32px / responsive 16px) ── */}
          <View style={styles.buttonsContainer}>
            {/* Sign Up Button (Figma: Filled action Button, 358x48, radius 24px, background rgba(0, 8, 20, 0.96)) */}
            <TouchableOpacity
              style={styles.signUpButton}
              onPress={handleSignUp}
              activeOpacity={0.85}
            >
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>

            {/* Sign In Button (Figma: Filled action Button, 358x48, radius 24px, background rgba(247, 247, 247, 0.96), border 1px solid rgba(192, 192, 204, 0.96)) */}
            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleSignIn}
              activeOpacity={0.85}
            >
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Hero Video Frame (Figma: width 391px, height 514px, top 0) ──
  heroFrame: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#000000',
  },

  // ── Gradient Overlay Blend (Figma: Frame 1000006447, height 110px) ──
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 110,
  },

  // ── Cancel Button (Figma: 40x40, padding 8px, top 53px, right 15px, vector 24x24 1.5px solid #FFFFFF) ──
  cancelButton: {
    position: 'absolute',
    top: 53,
    right: 15,
    width: 40,
    height: 40,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },

  // ── Bottom Section ──
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

  // ── Text Block (Figma Frame 1000006445: gap 24px, width 358px) ──
  textBlock: {
    gap: 16,
    paddingTop: 4,
  },

  // ── Brand Title ──
  brandTitleContainer: {
    alignSelf: 'flex-start',
  },
  brandTitle: {
    color: 'rgba(0, 8, 20, 0.96)',
    fontFamily: Platform.select({
      ios: 'DMSans_700Bold',
      android: 'DMSans_700Bold',
      default: 'DMSans_700Bold',
    }),
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: 0.3,
  },

  // ── Subtitle (16px, line-height 24px, letter-spacing 0.2px, weight 400) ──
  brandDescription: {
    fontFamily: Platform.select({
      ios: 'SF Pro',
      android: 'DMSans_400Regular',
      default: 'DMSans_400Regular',
    }),
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Action Buttons Container (Increased for comfortable touch targets) ──
  buttonsContainer: {
    gap: 32,
  },

  // ── Sign Up Button (Figma: Filled action Button, 358x48, radius 24px, background rgba(0, 8, 20, 0.96)) ──
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

  // ── Sign In Button (Figma: Filled action Button, 358x48, radius 24px, background rgba(247, 247, 247, 0.96), border 1px solid rgba(192, 192, 204, 0.96)) ──
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
