import React, { useRef } from 'react';
import {
  Pressable,
  Animated,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
  Platform,
} from 'react-native';
import { triggerLightHaptic } from '../../utils/haptics';
import { useSingleFlight, LOCK_SAFETY_TIMEOUT_MS } from '../../utils/safeNavigation';

export interface TactilePressableProps {
  onPress?: () => void;
  onPressIn?: (e: GestureResponderEvent) => void;
  onPressOut?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  enableHaptic?: boolean;
  pressScale?: number;
  pressTranslateY?: number;
  children?: React.ReactNode;
  hitSlop?: any;
  accessibilityLabel?: string;
  accessibilityRole?: any;
  /** Guards onPress with a synchronous ref lock so rapid double-taps run once (default: true) */
  singleFlight?: boolean;
  /** Lock duration in ms for synchronous handlers (default: 600ms) */
  lockMs?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * TactilePressable — Keyboard-style shadow-press micro-animation with mindful haptics.
 * When touched:
 * - Fires a subtle haptic click (matching iPhone/Android keyboard actuation)
 * - Compresses down with scale 0.978 and translateY +1.5px
 * - Springs back on release with elastic liveliness
 * - Works as a seamless 1:1 drop-in replacement for TouchableOpacity
 */
export const TactilePressable: React.FC<TactilePressableProps> = ({
  onPress,
  onPressIn,
  onPressOut,
  disabled = false,
  style,
  enableHaptic = true,
  pressScale = 0.978,
  pressTranslateY = 1.5,
  children,
  hitSlop,
  accessibilityLabel,
  accessibilityRole,
  singleFlight = true,
  lockMs = LOCK_SAFETY_TIMEOUT_MS,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const guardedPress = useSingleFlight(onPress, lockMs);
  const effectiveOnPress = singleFlight ? guardedPress : onPress;

  const handlePressIn = (e: GestureResponderEvent) => {
    if (disabled) return;

    if (enableHaptic) {
      triggerLightHaptic();
    }

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: pressScale,
        friction: 8,
        tension: 180,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(translateYAnim, {
        toValue: pressTranslateY,
        friction: 8,
        tension: 180,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    if (disabled) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 130,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        friction: 6,
        tension: 130,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    onPressOut?.(e);
  };

  return (
    <AnimatedPressable
      onPress={effectiveOnPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      style={[
        style,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim },
          ],
        },
      ]}
    >
      {children}
    </AnimatedPressable>
  );
};

export default TactilePressable;
