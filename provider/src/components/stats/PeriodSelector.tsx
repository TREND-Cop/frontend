import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useStatsPeriod, StatsPeriod } from '../../context/StatsContext';
import { formatPeriodLabel } from '../../utils/statsFormatters';

export interface PeriodSelectorProps {
  sectionId: string;
  period?: StatsPeriod;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

const FONT_LABEL = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_400Regular',
  default: 'DMSans_400Regular',
});

/**
 * 1:1 Figma Vector arrow-down-01 Chevron Icon (24x24)
 */
function ChevronDownIcon({
  size = 24,
  color = '#141B34',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9l6 6 6-6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * PeriodSelector: Renders date label and dropdown chevron matching Figma S2
 * - day: "Monday 17 May, 2026"
 * - year: "2026"
 * Tapping triggers date sheet for this sectionId.
 */
export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  sectionId,
  period: periodProp,
  onPress,
  containerStyle,
  testID,
}) => {
  const { period: contextPeriod, openDateSheet } = useStatsPeriod(sectionId);
  const activePeriod = periodProp ?? contextPeriod;
  const label = formatPeriodLabel(activePeriod);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      openDateSheet();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={[styles.container, containerStyle]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Select date, ${label}`}
      testID={testID}
    >
      <Text style={styles.labelText} numberOfLines={1}>
        {label}
      </Text>
      <ChevronDownIcon size={24} color="#141B34" />
    </TouchableOpacity>
  );
};

export default PeriodSelector;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 24,
  },
  labelText: {
    fontFamily: FONT_LABEL,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
});
