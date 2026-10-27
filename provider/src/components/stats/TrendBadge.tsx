import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  TrendDirection,
  TrendPolarity,
  getTrendTone,
  TREND_COLORS,
} from '../../utils/trendUtils';
import { formatPercent } from '../../utils/statsFormatters';

export interface TrendBadgeProps {
  direction: TrendDirection;
  percent: number | string;
  polarity?: TrendPolarity;
  iconSize?: number;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

const FONT_LABEL = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_400Regular',
  default: 'DMSans_400Regular',
});

/**
 * 1:1 Vector trending-up icon
 */
function TrendingUpIcon({ size = 16, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M2 11.5L6 7.5L9 10.5L14 5.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.5 5.5H14V9"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Vector trending-down icon
 */
function TrendingDownIcon({ size = 16, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M2 4.5L6 8.5L9 5.5L14 10.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.5 10.5H14V7"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * TrendBadge: Renders an arrow icon and percent value ("5.2%") colored by tone.
 * Polarity rule:
 * - higherIsBetter (default): up -> green, down -> red
 * - lowerIsBetter (e.g. cancellations, reschedules): up -> red, down -> green
 */
export const TrendBadge: React.FC<TrendBadgeProps> = ({
  direction,
  percent,
  polarity = 'higherIsBetter',
  iconSize = 16,
  containerStyle,
  testID,
}) => {
  const tone = getTrendTone(direction, polarity);
  const color = tone === 'positive' ? TREND_COLORS.positive : TREND_COLORS.negative;
  const label = formatPercent(percent);

  return (
    <View
      style={[styles.container, containerStyle]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Trending ${direction}, ${label}`}
      testID={testID}
    >
      {direction === 'up' ? (
        <TrendingUpIcon size={iconSize} color={color} />
      ) : (
        <TrendingDownIcon size={iconSize} color={color} />
      )}
      <Text style={[styles.percentText, { color }]}>{label}</Text>
    </View>
  );
};

export default TrendBadge;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 20,
  },
  percentText: {
    fontFamily: FONT_LABEL,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
});
