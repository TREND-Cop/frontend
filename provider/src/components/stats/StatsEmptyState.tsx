import React from 'react';
import { View, Text, StyleSheet, Platform, StyleProp, ViewStyle } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';

export interface StatsEmptyStateProps {
  title?: string;
  subtitle?: string;
  message?: string;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

const FONT_MEDIUM = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_500Medium',
  default: 'DMSans_500Medium',
});

const FONT_REGULAR = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_400Regular',
  default: 'DMSans_400Regular',
});

function EmptyChartIcon({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Rect width="48" height="48" rx="24" fill="rgba(247, 247, 247, 0.96)" />
      <Path
        d="M16 32V26M24 32V20M32 32V16"
        stroke="rgba(192, 192, 204, 0.96)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * StatsEmptyState: Theme-based fallback block displayed when no data is available
 * for the chosen period.
 */
export const StatsEmptyState: React.FC<StatsEmptyStateProps> = ({
  title,
  subtitle,
  message,
  containerStyle,
  testID,
}) => {
  const displayTitle = title || message || 'No data for this period';
  const displaySubtitle =
    subtitle || 'Try selecting a different date range or checking back later.';

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      <EmptyChartIcon size={56} />
      <Text style={styles.titleText}>{displayTitle}</Text>
      <Text style={styles.subtitleText}>{displaySubtitle}</Text>
    </View>
  );
};

export default StatsEmptyState;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
  },
  titleText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    marginTop: 8,
    includeFontPadding: false,
  },
  subtitleText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    maxWidth: 260,
    includeFontPadding: false,
  },
});
