import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { COMMENT_TOAST_MS } from '../../constants/reviews.config';

const FONT_REGULAR = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_400Regular',
  default: 'DMSans_400Regular',
});

/**
 * 24x24 Circular Checkmark Icon matching Figma checkmark-circle-02
 * Solid green background (#0C790C / rgba(12, 121, 12, 0.96)) with white stroke checkmark
 */
export function CheckmarkCircleIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill="rgba(12, 121, 12, 0.96)" />
      <Path
        d="M8.5 12l2.5 2.5 5-5"
        stroke="#FFFFFF"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export interface SuccessToastProps {
  visible: boolean;
  message?: string;
  duration?: number;
  onDismiss?: () => void;
  variant?: 'success' | 'default';
  topOffset?: number;
}

/**
 * In-app Action taken indicator ("Comment posted")
 * Exact Figma Frame L4 specification:
 * - 44px pill height, 24px radius
 * - Background: rgba(0, 8, 20, 0.96)
 * - Green checkmark circle (24x24)
 * - 16px 400 font, letterSpacing 0.4px, #FFFFFF
 * - Non-blocking pointerEvents="none"
 * - Auto-dismiss after COMMENT_TOAST_MS (2500ms)
 * - Accessible screen-reader polite announcement
 */
export const SuccessToast: React.FC<SuccessToastProps> = ({
  visible,
  message = 'Comment posted',
  duration = COMMENT_TOAST_MS,
  onDismiss,
  variant = 'success',
  topOffset = 76,
}) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-10)).current;
  const isShowingRef = useRef(false);
  const lastShownMessageRef = useRef('');

  useEffect(() => {
    let dismissTimer: NodeJS.Timeout | null = null;

    if (visible) {
      // Idempotent toast guard: do not re-trigger entrance animation if already showing same message
      if (!isShowingRef.current || lastShownMessageRef.current !== message) {
        isShowingRef.current = true;
        lastShownMessageRef.current = message;
        // Screen reader announcement on iOS & Android
        AccessibilityInfo.announceForAccessibility(message);

        // Fade & slide in
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
        ]).start();
      }

      // Auto dismiss timer
      dismissTimer = setTimeout(() => {
        isShowingRef.current = false;
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: -10,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onDismiss?.();
        });
      }, duration);
    } else {
      isShowingRef.current = false;
      opacityAnim.setValue(0);
      translateYAnim.setValue(-10);
    }

    return () => {
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, [visible, message, duration, onDismiss, opacityAnim, translateYAnim]);

  if (!visible) return null;

  return (
    <View
      pointerEvents="none"
      style={[styles.overlayContainer, { top: topOffset }]}
      accessibilityLiveRegion="polite"
    >
      <Animated.View
        style={[
          styles.toastPill,
          {
            opacity: opacityAnim,
            transform: [{ translateY: translateYAnim }],
          },
        ]}
      >
        {variant === 'success' && <CheckmarkCircleIcon size={24} />}
        <Text style={styles.toastText} numberOfLines={1}>
          {message}
        </Text>
      </Animated.View>
    </View>
  );
};

export default SuccessToast;

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toastPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 16,
    height: 44,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    // Figma Hard Shadow
    shadowColor: 'rgba(133, 139, 148, 0.16)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
  },
  toastText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});
