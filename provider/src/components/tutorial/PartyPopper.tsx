import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path, Polygon, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { CELEBRATION_CONFIG } from '../../constants/celebration.config';

interface PartyPoppersProps {
  leftOrigin: { x: number; y: number };
  rightOrigin: { x: number; y: number };
  visible: boolean;
}

/**
 * 1:1 Vector Festive Party Popper Cone
 */
function PopperCone({ angle }: { angle: number }) {
  return (
    <View style={{ transform: [{ rotate: `${angle}deg` }] }}>
      <Svg width={46} height={46} viewBox="0 0 46 46" fill="none">
        <Defs>
          <LinearGradient id="coneGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FFD700" />
            <Stop offset="100%" stopColor="#F89B18" />
          </LinearGradient>
          <LinearGradient id="stripeGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FF6B8B" />
            <Stop offset="100%" stopColor="#E02475" />
          </LinearGradient>
        </Defs>

        {/* ── Golden Party Popper Horn Cone ── */}
        <Polygon points="8,40 38,10 44,16 14,44" fill="url(#coneGrad)" />

        {/* ── Festive Rose Stripes ── */}
        <Polygon points="16,32 24,24 28,28 20,36" fill="url(#stripeGrad)" />
        <Polygon points="28,20 34,14 37,17 31,23" fill="#00C2CB" />

        {/* ── Horn Mouth Opening Oval ── */}
        <Path
          d="M36 8 C42 2, 48 8, 42 18 C36 12, 38 8, 36 8 Z"
          fill="#E02475"
        />

        {/* ── Little celebratory sparkle bursts at horn mouth ── */}
        <Circle cx="40" cy="8" r="2" fill="#FFD700" />
        <Circle cx="44" cy="14" r="1.5" fill="#00C2CB" />
        <Path d="M42 4 L44 0 L46 4 L44 8 Z" fill="#FF6B8B" />
      </Svg>
    </View>
  );
}

export const PartyPoppers: React.FC<PartyPoppersProps> = ({
  leftOrigin,
  rightOrigin,
  visible,
}) => {
  // Left popper anims
  const leftScale = useRef(new Animated.Value(0)).current;
  const leftOpacity = useRef(new Animated.Value(0)).current;

  // Right popper anims
  const rightScale = useRef(new Animated.Value(0)).current;
  const rightOpacity = useRef(new Animated.Value(0)).current;

  // Master fade out
  const masterOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) {
      leftScale.setValue(0);
      rightScale.setValue(0);
      leftOpacity.setValue(0);
      rightOpacity.setValue(0);
      masterOpacity.setValue(1);
      return;
    }

    // 1. Left Popper entrance: appears at leftPopperTime (150ms)
    // Scale 0.6 -> 1 with snappy recoil punch (1.15 -> 1)
    const leftTimer = setTimeout(() => {
      leftOpacity.setValue(1);
      Animated.sequence([
        Animated.timing(leftScale, {
          toValue: 1.18,
          duration: CELEBRATION_CONFIG.poppersRecoilDuration * 0.5,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.spring(leftScale, {
          toValue: 1.0,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }, CELEBRATION_CONFIG.leftPopperTime);

    // 2. Right Popper entrance: appears at rightPopperTime (270ms, 120ms stagger)
    const rightTimer = setTimeout(() => {
      rightOpacity.setValue(1);
      Animated.sequence([
        Animated.timing(rightScale, {
          toValue: 1.18,
          duration: CELEBRATION_CONFIG.poppersRecoilDuration * 0.5,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.spring(rightScale, {
          toValue: 1.0,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }, CELEBRATION_CONFIG.rightPopperTime);

    // 3. Poppers fade out at ~1300ms over 200ms
    const fadeTimer = setTimeout(() => {
      Animated.timing(masterOpacity, {
        toValue: 0,
        duration: CELEBRATION_CONFIG.poppersFadeDuration,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, CELEBRATION_CONFIG.poppersFadeStartTime);

    return () => {
      clearTimeout(leftTimer);
      clearTimeout(rightTimer);
      clearTimeout(fadeTimer);
      leftScale.stopAnimation();
      rightScale.stopAnimation();
      masterOpacity.stopAnimation();
    };
  }, [visible, leftScale, leftOpacity, rightScale, rightOpacity, masterOpacity]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { opacity: masterOpacity }]}
    >
      {/* ── Left Party Popper (Aimed Up and Inward at ~66°) ── */}
      <Animated.View
        style={[
          styles.popperWrapper,
          {
            left: leftOrigin.x - 24,
            top: leftOrigin.y - 24,
            opacity: leftOpacity,
            transform: [{ scale: leftScale }],
          },
        ]}
      >
        <PopperCone angle={-15} />
      </Animated.View>

      {/* ── Right Party Popper (Aimed Up and Inward at ~114°) ── */}
      <Animated.View
        style={[
          styles.popperWrapper,
          {
            left: rightOrigin.x - 22,
            top: rightOrigin.y - 24,
            opacity: rightOpacity,
            transform: [{ scale: rightScale }, { scaleX: -1 }],
          },
        ]}
      >
        <PopperCone angle={-15} />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  popperWrapper: {
    position: 'absolute',
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9996,
  },
});

export default PartyPoppers;
