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

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing } from '../../constants/theme';
import { ProfileSetupHeader } from '../../components/ProfileSetupHeader';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useUserContext } from '../../store/UserContext';

// ─────────────────────────────────────────────────────────────────────────────
// DUPLICATE USERNAME CHECK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Known taken usernames for duplicate validation.
 * Users can pick ANY username of their choice with ZERO character or length limitations,
 * except if the username already exists.
 */
const TAKEN_USERNAMES = ['fabulous_nails', 'admin', 'trend', '99_ghosts', 'johndoe', 'jude_fabulous'];

/**
 * Checks whether the username is already taken.
 */
const checkUsernameExists = async (_username: string): Promise<boolean> => {
  const normalized = _username.trim().toLowerCase();
  return TAKEN_USERNAMES.includes(normalized);
};

/**
 * Handles the account creation submission.
 */
const onCreateAccount = async (_username: string): Promise<boolean> => {
  console.log('onCreateAccount called for username:', _username);
  return true; // Mock: always succeeds
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const UsernameScreen = ({ navigation }: { navigation?: any }) => {
  // ── State ───────────────────────────────────────────────────────────────
  const router = useRouter();
  const { setUsername: setContextUsername, profileData } = useUserContext();
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Any username of user's choice is allowed — only requirement is non-empty & non-duplicate
  const hasContent = username.trim().length > 0;
  const usernameValid = hasContent && !usernameError;

  // ── Handlers ────────────────────────────────────────────────────────────

  /**
   * Called when the username field loses focus.
   * Checks backend availability for duplicates.
   */
  const handleUsernameBlur = useCallback(async () => {
    setUsernameTouched(true);
    const trimmed = username.trim();
    if (!trimmed) {
      setUsernameError('Please enter a username');
      return;
    }

    const exists = await checkUsernameExists(trimmed);
    if (exists) {
      setUsernameError('Username already exist, kindly pick another username');
    } else {
      setUsernameError(null);
    }
  }, [username]);

  /**
   * Handles the "Create Account" button press.
   * Navigates to Phone Verification upon success.
   */
  const handleCreateAccount = useCallback(async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setUsernameError('Please enter a username');
      return;
    }

    const exists = await checkUsernameExists(trimmed);
    if (exists) {
      setUsernameError('Username already exist, kindly pick another username');
      return;
    }

    const success = await onCreateAccount(trimmed);

    if (success) {
      setContextUsername(trimmed);
      router.push({
        pathname: '/phone-verification',
        params: { phone: profileData?.phone || '+234 8136567398' },
      } as any);
    }
  }, [username, setContextUsername, profileData, router]);

  const handleBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    } else {
      router.back();
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: isKeyboardVisible ? 320 : 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
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
            isValid={hasContent && usernameTouched && !usernameError}
            touched={usernameTouched}
            onBlur={handleUsernameBlur}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.buttonPadding,
    paddingTop: 60,
  },
  spacer: {
    flex: 1,
    minHeight: 24,
  },
});
