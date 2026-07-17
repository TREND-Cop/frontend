/**
 * PrimaryButton — Reusable full-width action button used across all auth screens.
 *
 * Features:
 * - Full width, black background (or custom color)
 * - Disabled/greyed-out state when form is invalid
 * - Uses typography.button for consistent text styling
 *
 * Usage:
 *   <PrimaryButton
 *     title="Sign Up"
 *     onPress={handleSubmit}
 *     disabled={!formValid}
 *   />
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, View } from 'react-native';
import { colors, typography, radius, spacing, shadows } from '../constants/theme';

interface PrimaryButtonProps {
  /** Button label text */
  title: string;
  /** Called when the button is pressed */
  onPress: () => void;
  /** Whether the button is disabled (greyed out) */
  disabled?: boolean;
  /** Optional style overrides for the button container */
  style?: ViewStyle;
  /** If provided, renders a dashed progress indicator above the button */
  currentStep?: number;
  /** Total number of steps for the progress indicator (default: 4) */
  totalSteps?: number;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  style,
  currentStep,
  totalSteps = 4,
}) => {
  return (
    <View style={styles.container}>
      {/* ─── Progress Indicator (Optional) ────────────────────────────── */}
      {currentStep !== undefined && (
        <View style={styles.progressContainer}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDash,
                index < currentStep ? styles.progressDashActive : styles.progressDashInactive,
              ]}
            />
          ))}
        </View>
      )}

      {/* ─── Button ───────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[
          styles.button,
          disabled && styles.buttonDisabled,
          style,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 358,
    marginBottom: 24, // Space between progress line and button
  },
  progressDash: {
    width: 72,
    height: 4,
    borderRadius: 4,
  },
  progressDashActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  progressDashInactive: {
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  button: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)', // Exact match to Figma
    borderRadius: 24,
    height: 48,
    width: 358,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 56,
    // Emulate Figma box-shadows using React Native elevation/shadows
    shadowColor: '#858b94',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.95, // Barely noticeable opacity drop so it stays black, but interactions are still disabled
  },
  buttonText: {
    ...typography.button,
    color: colors.appBackground, // White text on dark button
  },
});
