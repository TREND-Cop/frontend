/**
 * ForgotPasswordScreen — Allows users to create a new password.
 *
 * Flow: SignInScreen → ForgotPasswordScreen → EmailVerificationScreen → SignInScreen
 *
 * Uses shared components: FormInput, PrimaryButton
 * Uses shared validation: PASSWORD_RULES, isPasswordValid (from validation.ts)
 *
 * The password format rules are imported from the same constant used by SignUpScreen,
 * ensuring consistency — they are NOT redefined separately here.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';
import { PASSWORD_RULES, isPasswordValid } from '../../constants/validation';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const ForgotPasswordScreen = ({ navigation }: { navigation?: any }) => {
  // ── Form State ──────────────────────────────────────────────────────────
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ── Validation State ────────────────────────────────────────────────────
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  const newPasswordValid = isPasswordValid(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const formValid = newPasswordValid && passwordsMatch;

  // ── Handlers ────────────────────────────────────────────────────────────

  /**
   * Called when the "Create Password" field loses focus.
   * Validates against the shared PASSWORD_RULES constant.
   */
  const handleNewPasswordBlur = useCallback(() => {
    setNewPasswordTouched(true);
    if (!isPasswordValid(newPassword)) {
      setNewPasswordError('Incorrect password input');
    } else {
      setNewPasswordError(null);
    }
  }, [newPassword]);

  const handleConfirmPasswordBlur = useCallback(() => {
    setConfirmPasswordTouched(true);
    if (confirmPassword !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError(null);
    }
  }, [newPassword, confirmPassword]);

  /**
   * Handles the "Confirm" button press.
   * 
   * TODO (Backend): 
   * 1. This screen actually requires the user's phone/email first!
   *    If the app flow doesn't have an email input screen yet, build one to collect it.
   * 2. POST request to `/api/auth/reset-password-request`
   *    Payload: { "emailOrPhone": stubEmail }
   * 3. On Success (200 OK):
   *    - The backend will send an OTP to that email.
   *    - Navigate to EmailVerification.
   * 4. Once verified, POST to `/api/auth/reset-password-confirm`
   *    Payload: { "email": stubEmail, "otp": code, "newPassword": newPassword }
   */
  const handleConfirm = useCallback(() => {
    // If not valid, mark touched so errors appear
    if (!formValid) {
      setNewPasswordTouched(true);
      setConfirmPasswordTouched(true);
      
      if (!isPasswordValid(newPassword)) {
        setNewPasswordError('Incorrect password input');
      }
      if (confirmPassword !== newPassword || !confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
      }
      return;
    }

    // Stub email — replace with actual user email from account/context
    const stubEmail = 'user@example.com';

    if (navigation) {
      navigation.navigate('EmailVerification', { email: stubEmail });
    }
  }, [formValid, navigation]);

  /**
   * Back button handler — returns to the previous screen (SignInScreen).
   */
  const handleGoBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header with Back Arrow + Lock Icon ─────────────────────── */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Centered Lock Icon ─────────────────────────────────────── */}
        <View style={styles.iconContainer}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>

        {/* ─── Title & Subtitle ───────────────────────────────────────── */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Forgotten password</Text>
          <Text style={styles.subtitle}>
            Forgot your password? Not a problem, fill in the required information.
          </Text>
        </View>

        {/* ─── Enter Password Field ──────────────────────────────────── */}
        <FormInput
          label="Enter Password"
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            if (newPasswordError) setNewPasswordError(null);
            // Re-validate confirm password if it's already touched
            if (confirmPasswordTouched && text !== confirmPassword) {
              setConfirmPasswordError('Passwords do not match');
            } else if (confirmPasswordTouched && text === confirmPassword) {
              setConfirmPasswordError(null);
            }
          }}
          placeholder="Enter password"
          secureTextEntry
          showPasswordToggle
          error={newPasswordError}
          isValid={newPasswordValid}
          touched={newPasswordTouched}
          onBlur={handleNewPasswordBlur}
        />

        {/* ─── Confirm Password Field ────────────────────────────────── */}
        <FormInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (confirmPasswordError) setConfirmPasswordError(null);
          }}
          placeholder="Confirm password"
          secureTextEntry
          showPasswordToggle
          error={confirmPasswordError}
          isValid={passwordsMatch}
          touched={confirmPasswordTouched}
          onBlur={handleConfirmPasswordBlur}
        />

        {/* ─── Confirm Button ─────────────────────────────────────────── */}
        <PrimaryButton
          title="Confirm"
          onPress={handleConfirm}
          disabled={false}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  scrollContent: {
    paddingHorizontal: spacing.buttonPadding,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // ── Header Row (Back Arrow) ─────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backArrow: {
    fontSize: 24,
    color: '#000000',
  },

  // ── Centered Lock Icon ──────────────────────────────────────────────────
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.98)',
    alignSelf: 'center',
    marginBottom: 24,
  },
  lockIcon: {
    fontSize: 24,
  },

  // ── Title & Subtitle ───────────────────────────────────────────────────
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    ...typography.h1,
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyRegular,
    color: colors.primarySupportText,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
