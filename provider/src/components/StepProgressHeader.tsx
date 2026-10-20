import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { StepProgressBar } from './StepProgressBar';

export interface StepProgressHeaderProps {
  currentStep: number;
  totalSteps?: number;
  onBack: () => void;
  style?: StyleProp<ViewStyle>;
  marginBottom?: number;
}

function ArrowLeftIcon({ size = 24, color = '#000814' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.57 5.93L3.5 12L9.57 18.07"
        stroke={color}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.5 12H3.67"
        stroke={color}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * StepProgressHeader
 * 1:1 Unified Reusable Onboarding Header for all 4 Provider Onboarding Steps:
 * - Back button: 48x48 touch target, hitSlop, 24x24 ArrowLeftIcon (#000814)
 * - Gap: 11px
 * - StepProgressBar: 299px flexible 4-dash indicator, 6px thickness with rounded ends
 * - Total width: 358px, height: 48px
 */
export const StepProgressHeader: React.FC<StepProgressHeaderProps> = ({
  currentStep,
  totalSteps = 4,
  onBack,
  style,
  marginBottom = 34,
}) => {
  return (
    <View style={[styles.container, { marginBottom }, style]}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.backButton}
        onPress={onBack}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <ArrowLeftIcon size={24} color="#000814" />
      </TouchableOpacity>

      <StepProgressBar totalSteps={totalSteps} currentStep={currentStep} />
    </View>
  );
};

export default StepProgressHeader;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    alignSelf: 'center',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
