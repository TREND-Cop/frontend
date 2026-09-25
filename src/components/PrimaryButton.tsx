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
        <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>{title}</Text>
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
    width: '100%',
    gap: 8,
    marginBottom: 40,
  },
  progressDash: {
    flex: 1,
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
    backgroundColor: '#0F1626', // Updated to match Navy
    borderRadius: 28, // More rounded as in screenshot
    height: 56, // Taller button
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24, // Reduced to fit layout better
  },
  buttonDisabled: {
    backgroundColor: '#F7F7F9',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    ...typography.button,
    color: colors.appBackground,
  },
  buttonTextDisabled: {
    color: '#D0D5DD', // Light gray text for disabled state
  },
});
