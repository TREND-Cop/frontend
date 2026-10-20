import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';

export interface StepProgressBarProps {
  totalSteps?: number;
  currentStep?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Reusable StepProgressBar matching 1:1 Figma Progress Header spec:
 * - Progress indicator line: width 299px, height 6px, gap 14px
 * - Segments: flex: 1, height 6px, borderRadius 6px
 * - Active: rgba(0, 8, 20, 0.96) (#000814)
 * - Inactive: rgba(235, 235, 245, 0.96) (#ebebf5)
 */
export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  totalSteps = 4,
  currentStep = 1,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index < currentStep;
        return (
          <View
            key={index}
            style={[
              styles.segment,
              isActive ? styles.segmentActive : styles.segmentInactive,
            ]}
          />
        );
      })}
    </View>
  );
};

export default StepProgressBar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: 6,
  },
  segmentActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  segmentInactive: {
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
});

