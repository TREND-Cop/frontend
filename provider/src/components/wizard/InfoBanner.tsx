import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';

export interface InfoBannerProps {
  text?: string;
  variant?: 'green' | 'orange';
  testID?: string;
}

export interface BinocularsIconProps {
  size?: number;
  showBackground?: boolean;
}

function AlertWarningIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="7.5" stroke="rgba(248, 155, 24, 0.96)" strokeWidth={1.5} />
      <Path
        d="M10 6.5v4"
        stroke="rgba(248, 155, 24, 0.96)"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Circle cx="10" cy="13.5" r="0.8" fill="rgba(248, 155, 24, 0.96)" />
    </Svg>
  );
}

/**
 * Exact 1:1 Figma Binoculars Icon
 * Generated directly from user SVG:
 * - viewBox: 0 0 40 40
 * - rect: 40x40 rx=20 fill="#EEF8EE" fillOpacity=0.8
 * - path 1: Right lens & eyepiece
 * - path 2: Bridge connectors (18 16H22 and 17 24H23)
 * - path 3: Left lens & eyepiece
 * - stroke: "#0A5F0A", strokeOpacity: 0.8, strokeWidth: 1.5, strokeLinecap: round, strokeLinejoin: round
 */
export function BinocularsIcon({
  size = 40,
  showBackground = true,
}: BinocularsIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      {showBackground && (
        <Rect width={40} height={40} rx={20} fill="#EEF8EE" fillOpacity={0.8} />
      )}
      <Path
        d="M29.8551 23.5L26.9298 13.6067C26.6485 12.6546 25.7646 12 24.7601 12C23.475 12 22.4485 13.0566 22.502 14.3244L23 24M30 24.5C30 26.433 28.433 28 26.5 28C24.567 28 23 26.433 23 24.5C23 22.567 24.567 21 26.5 21C28.433 21 30 22.567 30 24.5Z"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#0A5F0A"
        strokeOpacity={0.8}
      />
      <Path
        d="M18 16H22M17 24H23"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#0A5F0A"
        strokeOpacity={0.8}
      />
      <Path
        d="M10.1449 23.5L10.1451 23.4994M10.1451 23.4994L13.0707 13.6067C13.3519 12.6546 14.2359 12 15.2403 12C16.5255 12 17.5519 13.0566 17.4984 14.3244L17.0004 24M10.1451 23.4994C10.0507 23.8164 10 24.1523 10 24.5C10 26.433 11.567 28 13.5 28C15.433 28 17 26.433 17 24.5C17 22.567 15.433 21 13.5 21C11.9147 21 10.5756 22.054 10.1451 23.4994Z"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#0A5F0A"
        strokeOpacity={0.8}
      />
    </Svg>
  );
}

const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

/**
 * 1:1 Figma InfoBanner
 * Supports green (services default) and orange (Add Staff warning) variants.
 */
export const InfoBanner: React.FC<InfoBannerProps> = ({
  text = 'Add your services for clients to view and book.',
  variant = 'green',
  testID,
}) => {
  const isOrange = variant === 'orange';

  return (
    <View style={[styles.container, isOrange && styles.containerOrange]} testID={testID}>
      {/* Icon Circle */}
      <View style={[styles.tagCircle, isOrange && styles.tagCircleOrange]}>
        {isOrange ? (
          <AlertWarningIcon size={20} />
        ) : (
          <BinocularsIcon size={40} showBackground={true} />
        )}
      </View>

      {/* Banner Text */}
      <Text style={[styles.text, isOrange && styles.textOrange]}>{text}</Text>
    </View>
  );
};

export default InfoBanner;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 358,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    alignSelf: 'center',
  },
  containerOrange: {
    backgroundColor: 'rgba(246, 240, 230, 0.96)',
    borderRadius: 16,
    padding: 8,
    minHeight: 76,
  },
  tagCircle: {
    width: 40,
    height: 40,
    flexShrink: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagCircleOrange: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  text: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  textOrange: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(248, 155, 24, 0.96)',
  },
});
