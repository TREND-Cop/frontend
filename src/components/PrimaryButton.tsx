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
import { useSingleFlight, LOCK_SAFETY_TIMEOUT_MS } from '../utils/safeNavigation';

interface PrimaryButtonProps {
  /** Button label text */
  title: string;
  /** Called when the button is pressed */
  onPress: () => void;
  /** Whether the button is disabled (greyed out) */
  disabled?: boolean;
  /** Optional style overrides for the button container */
  style?: ViewStyle;
  /** Guards onPress with a synchronous ref lock so rapid double-taps run once (default: true) */
  singleFlight?: boolean;
  /** Lock duration in ms for synchronous handlers (default: 600ms) */
  lockMs?: number;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  style,
  singleFlight = true,
  lockMs = LOCK_SAFETY_TIMEOUT_MS,
}) => {
  const guardedOnPress = useSingleFlight(onPress, lockMs);
  const safeOnPress = singleFlight ? guardedOnPress : onPress;

  return (
    <View style={styles.container}>
      {/* ─── Button ───────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[
          styles.button,
          disabled && styles.buttonDisabled,
          style,
        ]}
        onPress={safeOnPress}
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
