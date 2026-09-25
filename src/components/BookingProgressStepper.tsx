import React from 'react';
import { View, Text, StyleSheet, Platform, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export interface BookingProgressStepperProps {
  currentStep: 1 | 2 | 3; // 1: Day / Time, 2: Specialist, 3: Review
  style?: StyleProp<ViewStyle>;
}

const STEPS = [
  { step: 1, label: 'Day / Time' },
  { step: 2, label: 'Specialist' },
  { step: 3, label: 'Review' },
];

export const BookingProgressStepper: React.FC<BookingProgressStepperProps> = ({
  currentStep,
  style,
}) => {
  return (
    <View style={[styles.progressContainer, style]}>
      {STEPS.map((item) => {
        const isCompletedOrActive = item.step <= currentStep;

        return (
          <View key={item.step} style={styles.stepItem}>
            {/* Indicators row: 20px circle + 4px horizontal progress bar (Rectangle 277) */}
            <View style={styles.stepIndicatorRow}>
              {isCompletedOrActive ? (
                <View style={styles.stepCircleActive}>
                  <Svg width={11} height={9} viewBox="0 0 11 9" fill="none">
                    <Path
                      d="M1.5 4.5L4.2 7.2L9.5 1.5"
                      stroke="#FFFFFF"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
              ) : (
                <View style={styles.stepCircleInactive} />
              )}

              {/* Connecting progress line (Rectangle 277: width 63.5px, height 4px, radius 4px) */}
              <View
                style={[
                  styles.stepLine,
                  isCompletedOrActive && styles.stepLineActive,
                ]}
              />
            </View>

            {/* Label (Figma: SF Pro 14px, lineHeight 20px, letterSpacing 0.3px) */}
            <Text
              style={[
                styles.stepLabel,
                isCompletedOrActive && styles.stepLabelActive,
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  // Figma: width 358px, height 48px, gap 8px
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
    height: 48,
  },
  // Figma: Frame 1000006425 - width 83.5px, height 48px, gap 8px, flex-grow: 1
  stepItem: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 8,
    height: 48,
  },
  // Figma: indicators - width 83.5px, height 20px, flex-direction: row, align-items: center
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 20,
  },
  // Figma: checkmark-circle-02 - 20px x 20px, bg rgba(0, 8, 20, 0.96)
  stepCircleActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Figma: checkmark-circle-02 inactive - 20px x 20px, border 1.5px solid rgba(192, 192, 204, 0.96)
  stepCircleInactive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Figma: Rectangle 277 - height 4px, border-radius 4px, flex-grow: 1, bg rgba(192, 192, 204, 0.96)
  stepLine: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    marginLeft: 4,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },
  stepLineActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  // Figma: Label - SF Pro 14px, lineHeight 20px, letterSpacing 0.3px
  stepLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(192, 192, 204, 0.96)',
  },
  stepLabelActive: {
    color: 'rgba(0, 8, 20, 0.96)',
  },
});
