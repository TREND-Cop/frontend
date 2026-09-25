import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { useToastStore, ToastType } from '../../utils/toastStore';

// ── Icons for different toast states ──

// Heart icon indicating removal / wishlist status
const WishlistToastIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="rgba(204, 41, 41, 0.25)"
      stroke="rgba(204, 41, 41, 0.95)"
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  </Svg>
);

// Figma Component 5 Green Checkmark circle badge
const SuccessToastIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Circle cx={10} cy={10} r={10} fill="#0C790C" />
    <Path
      d="M6 10.2L8.7 13L14 7.5"
      stroke="#FFFFFF"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Info circle badge
const InfoToastIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Circle cx={10} cy={10} r={10} fill="rgba(26, 130, 255, 0.96)" />
    <Path
      d="M10 6.5V7M10 9.5V13.5"
      stroke="#FFFFFF"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

// Error circle badge
const ErrorToastIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Circle cx={10} cy={10} r={10} fill="rgba(204, 41, 41, 0.95)" />
    <Path
      d="M7 7L13 13M13 7L7 13"
      stroke="#FFFFFF"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const getToastIcon = (type: ToastType = 'info') => {
  switch (type) {
    case 'wishlist':
      return <WishlistToastIcon />;
    case 'success':
      return <SuccessToastIcon />;
    case 'error':
      return <ErrorToastIcon />;
    case 'info':
    default:
      return <InfoToastIcon />;
  }
};

export const GlobalTopToast: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { isVisible, options, hideToast } = useToastStore();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const topInset = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 24) + 8;

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (isVisible) {
      // Animate slide down and fade in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: topInset,
          friction: 8,
          tension: 60,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();

      // Auto-dismiss after duration
      const duration = options?.duration || 2800;
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, duration);
    } else {
      handleDismissAnimation();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isVisible, topInset, options?.duration]);

  const handleDismissAnimation = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  };

  const handleDismiss = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      hideToast();
    });
  };

  return (
    <View
      pointerEvents={isVisible ? 'box-none' : 'none'}
      style={[
        styles.overlayContainer,
        { pointerEvents: isVisible ? 'box-none' : 'none' } as any,
      ]}
    >
      <Animated.View
        style={[
          styles.animatedWrapper,
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.toastCard}
          activeOpacity={0.88}
          onPress={handleDismiss}
        >
          <View style={styles.iconContainer}>
            {getToastIcon(options.type)}
          </View>
          <Text style={styles.messageText} numberOfLines={2}>
            {options.message}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999,
  },
  animatedWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 8, 20, 0.94)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 10,
    maxWidth: 360,
    minHeight: 46,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.2,
    color: '#FFFFFF',
    flexShrink: 1,
  },
});
