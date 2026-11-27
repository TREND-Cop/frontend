import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { TutorialTarget } from './tutorial/TutorialTarget';
import { StaffTutorialTarget } from './staff/tutorial/StaffTutorialTarget';
import { TactilePressable } from './ui/TactilePressable';

export interface DashboardCardProps {
  targetId?: string;
  staffTargetId?: string;
  title: string;
  cardHeight?: 120 | 136;
  count?: number | string | null;
  label?: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  customMetric?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: 'white' | 'grey';
  titleNumberOfLines?: number;
}

/**
 * Shared Dashboard Card Component (120px & 136px Figma variants)
 * Guarantees:
 * 1. Number never shrinks (flexShrink: 0)
 * 2. Icon has a fixed size and never shrinks/overflows (flexShrink: 0)
 * 3. Label takes remaining space (flexShrink: 1), adjustsFontSizeToFit down to 0.85, and truncates
 * 4. Stays strictly inside card's 16px padding with minimum gap: 8px to icon
 * 5. Uses crisp white background with soft shadow and mindful tactile press feeling
 */
export const DashboardCard: React.FC<DashboardCardProps> = ({
  targetId,
  staffTargetId,
  title,
  cardHeight = 136,
  count,
  label,
  icon,
  badge,
  customMetric,
  onPress,
  disabled = false,
  style,
  variant = 'white',
  titleNumberOfLines = 2,
}) => {
  const is120 = cardHeight === 120;

  const cardContent = (
    <TactilePressable
      style={[
        is120 ? styles.card120 : styles.card136,
        variant === 'grey' && styles.cardGrey,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {/* ── Top Row: Card Title ── */}
      <View style={is120 ? styles.cardHeaderRow : styles.cardHeaderRowMultiLine}>
        <Text
          style={is120 ? styles.cardTitleText : styles.cardTitleTextMultiLine}
          numberOfLines={titleNumberOfLines}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {title}
        </Text>
      </View>

      {/* ── Bottom Row: Metric (Number + Label) & Icon ── */}
      <View style={styles.cardFooterRow}>
        {customMetric ? (
          <View style={styles.customMetricWrapper}>
            {customMetric}
          </View>
        ) : (
          <View style={styles.statTagRow}>
            {count !== undefined && count !== null ? (
              <Text style={styles.statNumberText}>{count}</Text>
            ) : null}
            {label ? (
              <Text
                style={styles.statLabelText}
                numberOfLines={1}
                ellipsizeMode="tail"
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {label}
              </Text>
            ) : null}
          </View>
        )}

        <View style={styles.iconContainer}>
          {icon}
        </View>
      </View>

      {/* Optional Badge (e.g. notification badge) */}
      {badge}
    </TactilePressable>
  );

  if (staffTargetId) {
    return (
      <StaffTutorialTarget
        id={staffTargetId}
        borderRadius={24}
        style={is120 ? styles.cardWrapper120 : styles.cardWrapper136}
      >
        {cardContent}
      </StaffTutorialTarget>
    );
  }

  if (targetId) {
    return (
      <TutorialTarget
        id={targetId}
        borderRadius={24}
        style={is120 ? styles.cardWrapper120 : styles.cardWrapper136}
      >
        {cardContent}
      </TutorialTarget>
    );
  }

  return (
    <View style={is120 ? styles.cardWrapper120 : styles.cardWrapper136}>
      {cardContent}
    </View>
  );
};

export default DashboardCard;

const styles = StyleSheet.create({
  cardWrapper120: {
    position: 'relative',
    width: '48%',
    height: 120,
  },
  cardWrapper136: {
    position: 'relative',
    width: '48%',
    height: 136,
  },
  card120: {
    position: 'relative',
    width: '100%',
    height: 120,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: 'rgba(133, 139, 148, 0.10)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  card136: {
    width: '100%',
    height: 136,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: 'rgba(133, 139, 148, 0.10)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardGrey: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderColor: 'rgba(192, 192, 204, 0.96)',
  },
  cardHeaderRow: {
    width: '100%',
    minHeight: 24,
    maxHeight: 48,
    justifyContent: 'flex-start',
  },
  cardHeaderRowMultiLine: {
    width: '100%',
    minHeight: 48,
    justifyContent: 'flex-start',
  },
  cardTitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  cardTitleTextMultiLine: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  cardFooterRow: {
    width: '100%',
    minHeight: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 8,
  },
  customMetricWrapper: {
    flex: 1,
    flexShrink: 1,
  },
  statTagRow: {
    flex: 1,
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  statNumberText: {
    flexShrink: 0,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  statLabelText: {
    flex: 1,
    flexShrink: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  iconContainer: {
    flexShrink: 0,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
});
