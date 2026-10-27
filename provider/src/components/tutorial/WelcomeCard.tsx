import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  Dimensions,
  AccessibilityInfo,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { ConfettiBurst } from './ConfettiBurst';
import { PartyPoppers } from './PartyPopper';
import { CELEBRATION_CONFIG } from '../../constants/celebration.config';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUNTING_IMAGE = require('../../../../provider/assets/images/dashboard/welcome_bunting.png');

function CloseXIcon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 6L18 18M18 6L6 18"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export interface WelcomeCardProps {
  visible: boolean;
  onGetStarted?: () => void;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
  hideActionButton?: boolean;
  cardHeight?: number;
  transparentBackdrop?: boolean;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({
  visible,
  onGetStarted,
  title,
  subtitle,
  buttonText,
  showCloseButton = false,
  onClose,
  hideActionButton = false,
  cardHeight,
  transparentBackdrop = false,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isConfettiActive, setIsConfettiActive] = useState(true);

  // ── Entrance & Exit Animation Values ──
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(CELEBRATION_CONFIG.cardInitialScale)).current;
  const cardTranslateY = useRef(new Animated.Value(CELEBRATION_CONFIG.cardInitialTranslateY)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  // ── Content Stagger Animation Values ──
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(CELEBRATION_CONFIG.contentTranslateY)).current;

  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(CELEBRATION_CONFIG.contentTranslateY)).current;

  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(CELEBRATION_CONFIG.contentTranslateY)).current;

  // Derive canonical popper cannon coordinates anchored at bottom floating tab bar ends
  // Tab bar width is 300px, centered horizontally, 80px high
  const tabLeftX = Math.max(28, (SCREEN_WIDTH - 300) / 2 + 16);
  const tabRightX = Math.min(SCREEN_WIDTH - 28, (SCREEN_WIDTH + 300) / 2 - 16);
  // Bottom tab bar center Y
  const tabY = SCREEN_HEIGHT - 64;

  const leftOrigin = useMemo(() => ({ x: tabLeftX, y: tabY }), [tabLeftX, tabY]);
  const rightOrigin = useMemo(() => ({ x: tabRightX, y: tabY }), [tabRightX, tabY]);

  const handleConfettiEnd = useCallback(() => {
    setIsConfettiActive(false);
  }, []);

  // Orchestrated Entrance Timeline
  useEffect(() => {
    if (!visible) {
      backdropOpacity.setValue(0);
      cardScale.setValue(CELEBRATION_CONFIG.cardInitialScale);
      cardTranslateY.setValue(CELEBRATION_CONFIG.cardInitialTranslateY);
      cardOpacity.setValue(0);
      titleOpacity.setValue(0);
      subtitleOpacity.setValue(0);
      buttonOpacity.setValue(0);
      setIsExiting(false);
      setIsConfettiActive(true);
      return;
    }

    const timers: NodeJS.Timeout[] = [];

    // 1. Backdrop Dim: 0–250ms (Easing.out(cubic))
    Animated.timing(backdropOpacity, {
      toValue: 1,
      duration: CELEBRATION_CONFIG.backdropFadeInDuration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // 2. Card Entrance: begins at cardEnterStartTime (350ms)
    // Scale 0.92 -> 1, translateY 24 -> 0, opacity 0 -> 1 with ~4% overshoot spring
    const cardTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: CELEBRATION_CONFIG.cardEnterDuration * 0.75,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1.0,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.spring(cardTranslateY, {
          toValue: 0,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start();
    }, CELEBRATION_CONFIG.cardEnterStartTime);
    timers.push(cardTimer);

    // 3. Content Stagger: Title at 750ms
    const titleTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: CELEBRATION_CONFIG.contentFadeDuration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: CELEBRATION_CONFIG.contentFadeDuration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }, CELEBRATION_CONFIG.titleStaggerDelay);
    timers.push(titleTimer);

    // 4. Content Stagger: Subtitle at 820ms (70ms after title)
    const subTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: CELEBRATION_CONFIG.contentFadeDuration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(subtitleTranslateY, {
          toValue: 0,
          duration: CELEBRATION_CONFIG.contentFadeDuration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }, CELEBRATION_CONFIG.subtitleStaggerDelay);
    timers.push(subTimer);

    // 5. Content Stagger: Button at 890ms (70ms after subtitle)
    const btnTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: CELEBRATION_CONFIG.contentFadeDuration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(buttonTranslateY, {
          toValue: 0,
          duration: CELEBRATION_CONFIG.contentFadeDuration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }, CELEBRATION_CONFIG.buttonStaggerDelay);
    timers.push(btnTimer);

    // 6. Sequence Complete: unmounts confetti after 3500ms
    const endTimer = setTimeout(() => {
      setIsConfettiActive(false);
    }, CELEBRATION_CONFIG.sequenceTotalDuration);
    timers.push(endTimer);

    return () => {
      timers.forEach(clearTimeout);
      cardScale.stopAnimation();
      cardTranslateY.stopAnimation();
      cardOpacity.stopAnimation();
      titleOpacity.stopAnimation();
      subtitleOpacity.stopAnimation();
      buttonOpacity.stopAnimation();
    };
  }, [
    visible,
    backdropOpacity,
    cardScale,
    cardTranslateY,
    cardOpacity,
    titleOpacity,
    titleTranslateY,
    subtitleOpacity,
    subtitleTranslateY,
    buttonOpacity,
    buttonTranslateY,
  ]);

  // Handle Clean Exit on 'Get started' Tap
  const handlePress = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);

    // Card exit: scale 1 -> 0.96, opacity 1 -> 0 over 180ms (Easing.in(cubic))
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: CELEBRATION_CONFIG.cardExitDuration,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 0.96,
        duration: CELEBRATION_CONFIG.cardExitDuration,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Seamless hand-off: backdrop stays dimmed, spotlight cutout smoothly takes over
      onGetStarted?.();
    });
  }, [isExiting, cardOpacity, cardScale, onGetStarted]);

  const handleClose = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: CELEBRATION_CONFIG.cardExitDuration,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 0.96,
        duration: CELEBRATION_CONFIG.cardExitDuration,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  }, [isExiting, cardOpacity, cardScale, onClose]);

  if (!visible) return null;

  return (
    <View style={styles.rootWrapper} pointerEvents="box-none">
      {/* ── Dimmed Backdrop (Layer 1: Shared with SpotlightOverlay) ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.backdropOverlay,
          transparentBackdrop ? { backgroundColor: 'transparent' } : null,
          { opacity: backdropOpacity },
        ]}
      />

      {/* ── Party Poppers / Cannons at Tab Bar Ends ── */}
      {isConfettiActive && !isExiting && (
        <PartyPoppers
          visible={visible}
          leftOrigin={leftOrigin}
          rightOrigin={rightOrigin}
        />
      )}

      {/* ── Pop-Up Card Container (Layer 2) ── */}
      <View style={styles.cardCenterContainer} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.cardContainer,
            cardHeight ? { height: cardHeight } : null,
            {
              opacity: cardOpacity,
              transform: [
                { scale: cardScale },
                { translateY: cardTranslateY },
              ],
            },
          ]}
        >
          {/* ── Close Button (Top Right for Completion Card) ── */}
          {showCloseButton && (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.cardCloseButton}
              onPress={handleClose}
              accessibilityLabel="Close"
            >
              <CloseXIcon size={24} color="#141B34" />
            </TouchableOpacity>
          )}

          {/* ── Bunting Header (Clean Cover, Transparent Background, Soft Gradient Blend) ── */}
          <View style={styles.buntingContainer}>
            <Image
              source={BUNTING_IMAGE}
              style={styles.buntingImage}
              resizeMode="cover"
            />
            {/* Soft gradient bottom blend so flags seamlessly flow into white card with 0 hard edge */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0)', '#FFFFFF']}
              style={styles.buntingBottomBlend}
              pointerEvents="none"
            />
          </View>

          {/* ── Content with Smooth Staggered Cascade ── */}
          <View style={styles.contentContainer}>
            {/* Title */}
            <Animated.View
              style={{
                opacity: titleOpacity,
                transform: [{ translateY: titleTranslateY }],
              }}
            >
              <Text
                style={showCloseButton ? styles.completionTitleText : styles.titleText}
              >
                {title ?? CELEBRATION_CONFIG.titleCopy}
              </Text>
            </Animated.View>

            {/* Subtitle */}
            <Animated.View
              style={{
                opacity: subtitleOpacity,
                transform: [{ translateY: subtitleTranslateY }],
              }}
            >
              <Text
                style={
                  showCloseButton
                    ? styles.completionSubtitleText
                    : styles.subtitleText
                }
              >
                {subtitle ?? CELEBRATION_CONFIG.subtitleCopy}
              </Text>
            </Animated.View>

            {/* Action Button: 'Get started' */}
            {!hideActionButton && (
              <Animated.View
                style={{
                  opacity: buttonOpacity,
                  transform: [{ translateY: buttonTranslateY }],
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.getStartedButton}
                  onPress={handlePress}
                >
                  <Text style={styles.getStartedText}>
                    {buttonText ?? CELEBRATION_CONFIG.buttonCopy}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </Animated.View>
      </View>

      {/* ── Confetti Burst (Layer 3: Renders over the card across full screen) ── */}
      {isConfettiActive && (
        <ConfettiBurst
          visible={visible}
          leftOrigin={leftOrigin}
          rightOrigin={rightOrigin}
          isExiting={isExiting}
          onAnimationEnd={handleConfettiEnd}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  rootWrapper: {
    ...StyleSheet.absoluteFill,
    zIndex: 9990,
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: CELEBRATION_CONFIG.backdropColor,
    zIndex: 1,
    elevation: 1,
  },
  cardCenterContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
    elevation: 20,
  },
  cardContainer: {
    width: 358,
    height: 397,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 25,
    overflow: 'hidden',
    position: 'relative',
    zIndex: 11,
  },
  cardCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  buntingContainer: {
    width: 358,
    height: 149,
    backgroundColor: 'transparent',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  buntingImage: {
    width: '100%',
    height: '100%',
  },
  buntingBottomBlend: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 28,
  },
  contentContainer: {
    width: '100%',
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingTop: 18,
  },
  titleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_700Bold',
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.3,
    color: '#000814',
    textAlign: 'center',
    marginBottom: 10,
    includeFontPadding: false,
  },
  subtitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#606066',
    textAlign: 'center',
    marginBottom: 40,
    includeFontPadding: false,
  },
  completionTitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 16,
    includeFontPadding: false,
  },
  completionSubtitleText: {
    width: 262,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    marginBottom: 0,
    includeFontPadding: false,
  },
  getStartedButton: {
    width: 247,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000814',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000814',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },
  getStartedText: {
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

export default WelcomeCard;
