import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

export interface WizardStepperProps {
  currentStep?: number; // 1: Add service, 2: Add Staff, 3: Add-ons, 4: Review
}

interface StepItem {
  id: number;
  label: string;
}

const STEPS: StepItem[] = [
  { id: 1, label: 'Add service' },
  { id: 2, label: 'Add Staff' },
  { id: 3, label: 'Add-ons' },
  { id: 4, label: 'Review' },
];

const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

// ── 1:1 Checkmark Icon for Active / Completed Step (20x20) ────────────────────
function ActiveCheckIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="10" fill="rgba(0, 8, 20, 0.96)" />
      <Path
        d="M6.5 10.5L8.8 12.8L13.5 8"
        stroke="#FFFFFF"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Inactive Circle Icon (20x20, border 1.5px rgba(192, 192, 204, 0.96)) ─────
function InactiveCircleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="9.25" stroke="rgba(192, 192, 204, 0.96)" strokeWidth={1.5} />
    </Svg>
  );
}

/**
 * 1:1 Figma Reusable WizardStepper for 4-step Business Services wizard.
 *
 * Measurements from CSS:
 * - Total container: width 358px, height 48px, gap: 8px
 * - Each item: width: 83.5px, height: 44px, gap: 4px
 * - Top row: 20x20 circle + 63.5x4px connector bar
 * - Label: 14px SF Pro / DM Sans 400, line-height 20px, letter-spacing 0.4px
 */
export const WizardStepper: React.FC<WizardStepperProps> = ({ currentStep = 1 }) => {
  return (
    <View style={styles.container}>
      {STEPS.map((step) => {
        const isActive = step.id <= currentStep;
        const isCurrent = step.id === currentStep;

        // Label color: Active is dark, Step 2 is dark grey, Steps 3-4 are light grey per CSS
        let labelColor = 'rgba(192, 192, 204, 0.96)';
        if (isActive) {
          labelColor = 'rgba(0, 8, 20, 0.96)';
        } else if (step.id === 2) {
          labelColor = 'rgba(96, 96, 102, 0.96)';
        }

        return (
          <View key={step.id} style={styles.stepColumn}>
            {/* Indicators Row */}
            <View style={styles.indicatorsRow}>
              {isActive ? <ActiveCheckIcon size={20} /> : <InactiveCircleIcon size={20} />}

              {/* Connector line (Rectangle 277: 63.5x4px, radius 4px) */}
              <View
                style={[
                  styles.connectorLine,
                  isActive ? styles.connectorActive : styles.connectorInactive,
                ]}
              />
            </View>

            {/* Step Label */}
            <Text
              style={[
                styles.stepLabel,
                { color: labelColor },
                isCurrent && styles.stepLabelCurrent,
              ]}
              numberOfLines={1}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default WizardStepper;

const styles = StyleSheet.create({
  /* service progress indicator: width 358px, height 48px, gap 8px */
  container: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
  },
  /* time indica: width 83.5px, height 44px, gap 4px */
  stepColumn: {
    flex: 1,
    height: 44,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  /* indicators: width 83.5px, height 20px */
  indicatorsRow: {
    width: '100%',
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  /* Rectangle 277: width 63.5px, height 4px, border-radius 4px */
  connectorLine: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    marginLeft: 4,
  },
  connectorActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  connectorInactive: {
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  /* Label: 14px, line-height 20px, letter-spacing 0.4px */
  stepLabel: {
    width: '100%',
    height: 20,
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  stepLabelCurrent: {
    fontWeight: '500',
  },
});
