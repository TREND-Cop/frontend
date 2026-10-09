import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

interface BusinessStatusSwitchProps {
  isOpen: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

function SquareLock02Icon({
  isOpen = false,
  size = 16,
  color,
}: {
  isOpen?: boolean;
  size?: number;
  color?: string;
}) {
  const iconColor = color || (isOpen ? 'rgba(12, 121, 12, 0.96)' : 'rgba(204, 41, 41, 0.95)');
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Rect x="2.67" y="6" width="10.66" height="8" rx="2" stroke={iconColor} strokeWidth="1.5" />
      {isOpen ? (
        <Path d="M5 6V3.833a3 3 0 016 0V3.5" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" />
      ) : (
        <Path d="M5 6V3.833a3 3 0 016 0V6" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" />
      )}
      <Path d="M8 9.67v1.66" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export const BusinessStatusSwitch: React.FC<BusinessStatusSwitchProps> = ({
  isOpen,
  onToggle,
  disabled = false,
}) => {
  // Animated value: 0 = Closed (Left thumb, Red track), 1 = Open (Right thumb, Green track)
  const animValue = useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animValue, {
      toValue: isOpen ? 1 : 0,
      bounciness: 4,
      speed: 14,
      useNativeDriver: false,
    }).start();
  }, [isOpen, animValue]);

  // Track Background Color: Red for Closed, Green for Open
  const trackBgColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(204, 41, 41, 0.95)', 'rgba(12, 121, 12, 0.96)'],
  });

  // Thumb slides from x=0 (Closed, at left: 8px) to x=64 (Open, at left: 72px)
  const thumbTranslateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 64],
  });

  // Crossfade between Closed lock (Red) and Open lock (Green) inside the thumb
  const closedIconOpacity = animValue.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [1, 0, 0],
  });

  const openIconOpacity = animValue.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [0, 0, 1],
  });

  // Crossfade labels:
  // "Open" label is on the LEFT side (x: 8..66) when thumb is at right
  const openLabelOpacity = animValue.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0, 1],
  });

  // "Closed" label is on the RIGHT side (x: 38..96) when thumb is at left
  const closedLabelOpacity = animValue.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [1, 0, 0],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onToggle}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: isOpen }}
      accessibilityLabel={`Business status is currently ${isOpen ? 'Open' : 'Closed'}. Tap to toggle.`}
      style={styles.touchable}
    >
      <Animated.View style={[styles.track, { backgroundColor: trackBgColor }]}>
        {/* Left Label ("Open" - visible when Open) */}
        <Animated.View
          pointerEvents="none"
          style={[styles.labelContainer, styles.labelLeft, { opacity: openLabelOpacity }]}
        >
          <Text style={styles.labelText}>Open</Text>
        </Animated.View>

        {/* Right Label ("Closed" - visible when Closed) */}
        <Animated.View
          pointerEvents="none"
          style={[styles.labelContainer, styles.labelRight, { opacity: closedLabelOpacity }]}
        >
          <Text style={styles.labelText}>Closed</Text>
        </Animated.View>

        {/* Sliding Thumb (24x24 White Circular Pill) */}
        <Animated.View
          style={[
            styles.thumb,
            {
              transform: [{ translateX: thumbTranslateX }],
            },
          ]}
        >
          {/* Closed Lock Icon */}
          <Animated.View style={[styles.iconWrapper, { opacity: closedIconOpacity }]}>
            <SquareLock02Icon isOpen={false} size={16} color="rgba(204, 41, 41, 0.95)" />
          </Animated.View>

          {/* Open Lock Icon */}
          <Animated.View style={[styles.iconWrapper, { opacity: openIconOpacity }]}>
            <SquareLock02Icon isOpen={true} size={16} color="rgba(12, 121, 12, 0.96)" />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    width: 104,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  track: {
    width: 104,
    height: 40,
    borderRadius: 20,
    position: 'relative',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    top: 8,
    width: 58,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelLeft: {
    left: 8,
  },
  labelRight: {
    right: 8,
  },
  labelText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(255, 255, 255, 0.98)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  thumb: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  iconWrapper: {
    position: 'absolute',
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
