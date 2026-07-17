/**
 * UsernameScreen — Step 4 (final step) of the profile setup wizard.
 *
 * Flow: UserGenderScreen → UsernameScreen → Home
 *
 * This is the last screen in the signup flow. After creating a username,
 * the user's account setup is complete and they are navigated to the Home screen.
 *
 * Features:
 * - Username text input with green checkmark when valid/available
 * - Error state for duplicate usernames (backend check stubbed)
 * - "Create Account" button disabled until username is valid
 *
 * Uses shared components: ProfileSetupHeader, FormInput, PrimaryButton
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../../constants/theme';
import { ProfileSetupHeader } from '../../components/ProfileSetupHeader';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** Minimum username length */
const USERNAME_MIN_LENGTH = 3;

/** Maximum username length */
const USERNAME_MAX_LENGTH = 20;

/**
 * Regex for valid usernames: alphanumeric + underscores, no spaces.
 * Customize this pattern based on your backend's username rules.
 */
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

// ─────────────────────────────────────────────────────────────────────────────
// STUB FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Checks whether the given username is already taken.
 * 
 * TODO (Backend):
 * 1. GET request to `/api/users/check-username?username=_username`
 * 2. Return `true` if the username is taken (e.g. 409 Conflict, or { available: false })
 * 3. Return `false` if the username is available (e.g. 200 OK, or { available: true })
 *
 * @param _username - The username to check
 * @returns true if the username already exists, false if it's available
 */
const checkUsernameExists = async (_username: string): Promise<boolean> => {
  // Simulated network delay for testing UI states
  // await new Promise(resolve => setTimeout(resolve, 500));
  return false; // Mock: always returns false (username is available)
};

/**
 * Handles the account creation submission.
 * 
 * TODO (Backend): 
 * 1. This is the final step of the onboarding flow. You should gather all data
 *    collected so far (gender, location, photo, username) and save the profile.
 * 2. POST request to `/api/users/profile` (with Bearer Token from signup)
 *    Payload: { "username": _username, "gender": ..., "location": ... }
 * 3. Return `true` on success to navigate to Home.
 */
const onCreateAccount = async (_username: string): Promise<boolean> => {
  console.log('onCreateAccount called — wire up your API here');
  return true; // Mock: always succeeds
};

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates the username format locally (before the backend availability check).
 * Returns null if valid, or an error message string if invalid.
 */
const validateUsernameFormat = (username: string): string | null => {
  if (username.length < USERNAME_MIN_LENGTH) {
    return `Username must be at least ${USERNAME_MIN_LENGTH} characters`;
  }
  if (username.length > USERNAME_MAX_LENGTH) {
    return `Username must be at most ${USERNAME_MAX_LENGTH} characters`;
  }
  if (!USERNAME_PATTERN.test(username)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const UsernameScreen = ({ navigation }: { navigation?: any }) => {
  // ── State ───────────────────────────────────────────────────────────────
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameTouched, setUsernameTouched] = useState(false);

  // Local format validation (doesn't include backend check)
  const formatError = validateUsernameFormat(username);
  const usernameFormatValid = formatError === null;

  // Overall validity: format is good AND no backend error
  const usernameValid = usernameFormatValid && !usernameError;

  // ── Handlers ────────────────────────────────────────────────────────────

  /**
   * Called when the username field loses focus.
   * Performs local format validation, then checks backend availability.
   */
  const handleUsernameBlur = useCallback(async () => {
    setUsernameTouched(true);

    // First check local format
    const error = validateUsernameFormat(username);
    if (error) {
      setUsernameError(error);
      return;
    }

    // Then check backend availability
    const exists = await checkUsernameExists(username);
    if (exists) {
      setUsernameError('Username already exist, kindly pick another username');
    } else {
      setUsernameError(null);
    }
  }, [username]);

  /**
   * Handles the "Create Account" button press.
   * Calls the stubbed onCreateAccount function and navigates to Home on success.
   */
  const handleCreateAccount = useCallback(async () => {
    if (!usernameValid) return;

    const success = await onCreateAccount(username);

    if (success) {
      if (navigation) {
        navigation.navigate('Home');
      }
    }
  }, [usernameValid, username, navigation]);

  const handleBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <ProfileSetupHeader
        onBack={handleBack}
        title="Add Username"
        subtitle="Create a unique username to complete your profile."
        currentStep={4}
        totalSteps={4}
      />

      {/* ─── Username Field ───────────────────────────────────────── */}
      <FormInput
        label="Username"
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          // Clear error as user re-types
          if (usernameError) setUsernameError(null);
        }}
        placeholder="Enter your username"
        autoCapitalize="none"
        autoCorrect={false}
        error={usernameError}
        isValid={usernameFormatValid && usernameTouched && !usernameError}
        touched={usernameTouched}
        onBlur={handleUsernameBlur}
        hint={`${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} characters, letters, numbers, underscores`}
      />

      {/* ─── Spacer to push button down ───────────────────────────── */}
      <View style={styles.spacer} />

      {/* ─── Create Account Button ────────────────────────────────── */}
      <PrimaryButton
        title="Create Account"
        onPress={handleCreateAccount}
        disabled={!usernameValid}
        currentStep={4}
      />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
    paddingHorizontal: spacing.buttonPadding,
    paddingTop: 60,
    paddingBottom: 40,
  },
  spacer: {
    flex: 1,
  },
});
