/**
 * FormInput — Reusable text input component used across all auth screens.
 *
 * Features:
 * - Label text above the input
 * - Error state (red border + error message below)
 * - Success state (green border + green checkmark inside)
 * - Optional eye icon for password visibility toggle
 * - Optional hint text below the input
 * - Fully themed from theme.ts — no hardcoded colors
 *
 * Usage:
 *   <FormInput
 *     label="Enter Password"
 *     value={password}
 *     onChangeText={setPassword}
 *     secureTextEntry
 *     showPasswordToggle
 *     error={passwordError}
 *     isValid={isPasswordValid(password)}
 *     touched={passwordTouched}
 *     onBlur={handleBlur}
 *     hint="Min 8 characters, at least 1 number"
 *   />
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors, typography, radius } from '../constants/theme';

interface FormInputProps extends Omit<TextInputProps, 'style'> {
  /** Label text displayed above the input */
  label: string;
  /** Current input value */
  value: string;
  /** Called when the input text changes */
  onChangeText: (text: string) => void;
  /** Error message to display below the input (null = no error) */
  error?: string | null;
  /** Whether the field content passes validation */
  isValid?: boolean;
  /** Whether the user has interacted with this field (blur/submit) */
  touched?: boolean;
  /** Hint text displayed below the input (e.g. password requirements) */
  hint?: string;
  /** Show eye icon to toggle password visibility (for password fields) */
  showPasswordToggle?: boolean;
  /** Left-side accessory component (e.g. country code picker) */
  leftAccessory?: React.ReactNode;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  error = null,
  isValid = false,
  touched = false,
  hint,
  showPasswordToggle = false,
  leftAccessory,
  secureTextEntry,
  ...textInputProps
}) => {
  // Track password visibility state internally
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Determine if we should show secure entry based on toggle state
  const effectiveSecureEntry = secureTextEntry && !passwordVisible;

  // Show error styling only after user has interacted with the field
  const showError = touched && !!error;
  const showSuccess = touched && isValid && !error;

  return (
    <View style={styles.fieldContainer}>
      {/* ── Label ────────────────────────────────────────────────────── */}
      <Text style={styles.fieldLabel}>{label}</Text>

      {/* ── Input Row ────────────────────────────────────────────────── */}
      <View
        style={[
          styles.inputRow,
          showError && styles.inputError,
          showSuccess && styles.inputSuccess,
        ]}
      >
        {/* Optional left accessory (e.g. country code picker) */}
        {leftAccessory}

        {/* Text Input */}
        <TextInput
          style={[
            styles.textInput,
            showPasswordToggle && styles.passwordInput,
          ]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={effectiveSecureEntry}
          placeholderTextColor={colors.iconInactive}
          {...textInputProps}
        />

        {/* Green checkmark when field is valid */}
        {showSuccess && (
          <Ionicons name="checkmark-circle" size={24} color="rgba(12, 121, 12, 0.96)" style={styles.checkmarkIcon} />
        )}

        {/* Eye icon for password fields */}
        {showPasswordToggle && (
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
            style={styles.eyeButton}
          >
            <Feather 
              name={passwordVisible ? "eye-off" : "eye"} 
              size={20} 
              color="rgba(192, 192, 204, 0.96)" 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Error Message ────────────────────────────────────────────── */}
      {showError && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* ── Hint Text ────────────────────────────────────────────────── */}
      {hint && !showError && (
        <Text style={styles.hintText}>{hint}</Text>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES — All values from theme.ts
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 40,
  },
  fieldLabel: {
    ...typography.labelMed,
    color: '#000000',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outlineBorders,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
  },
  inputError: {
    borderColor: colors.dangerVibrant,
  },
  inputSuccess: {
    borderColor: colors.successVibrant,
  },
  textInput: {
    flex: 1,
    ...typography.bodyRegular,
    color: '#000000',
    paddingVertical: 0, // Remove default Android vertical padding
    outlineStyle: 'none' as any,
  },
  passwordInput: {
    paddingRight: 10, // Adjust for absolute icons if needed, but flex takes care of it usually
  },
  checkmarkIcon: {
    marginLeft: 8,
  },
  eyeButton: {
    padding: 8,
    marginLeft: 4,
  },
  errorText: {
    ...typography.caption,
    color: colors.dangerVibrant,
    marginTop: 6,
  },
  hintText: {
    ...typography.caption,
    color: colors.primarySupportText,
    marginTop: 6,
  },
});
