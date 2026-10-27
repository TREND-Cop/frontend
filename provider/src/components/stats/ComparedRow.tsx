import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import { TREND_COLORS } from '../../utils/trendUtils';

export interface ComparedRowProps {
  label?: string;
  value: string;
  valueTone?: 'positive' | 'negative' | 'neutral';
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

const FONT_LABEL = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_400Regular',
  default: 'DMSans_400Regular',
});

/**
 * ComparedRow: "Compared to last month" in grey and a value in tone color.
 * Follows Figma S2 spec:
 * - Label: 14px 400, color rgba(96, 96, 102, 0.96)
 * - Value: 14px 400, color rgba(12, 121, 12, 0.96) when positive
 */
export const ComparedRow: React.FC<ComparedRowProps> = ({
  label = 'Compared to last month',
  value,
  valueTone = 'positive',
  containerStyle,
  testID,
}) => {
  let valueColor = 'rgba(0, 8, 20, 0.96)';
  if (valueTone === 'positive') {
    valueColor = TREND_COLORS.positive;
  } else if (valueTone === 'negative') {
    valueColor = TREND_COLORS.negative;
  }

  return (
    <View
      style={[styles.container, containerStyle]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${value}`}
      testID={testID}
    >
      <Text style={styles.labelText}>{label}</Text>
      <Text style={[styles.valueText, { color: valueColor }]}>{value}</Text>
    </View>
  );
};

export default ComparedRow;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 20,
  },
  labelText: {
    fontFamily: FONT_LABEL,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  valueText: {
    fontFamily: FONT_LABEL,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
});
