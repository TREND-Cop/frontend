/**
 * SignInScreen — Allows returning users to sign in to the "Trend" app.
 *
 * Flow: SignInScreen → Home (on success)
 *       SignInScreen → ForgotPasswordScreen (via "Forgotten password?" link)
 *       SignInScreen → SignUpScreen (via "Don't have an account? Sign Up")
 *
 * Uses shared components: FormInput, PrimaryButton, SocialAuthSection, AuthFooter
 *
 * NOTE: The Figma design had "Already have an account? Sign Up" on this screen,
 * which is a copy-paste typo from SignUpScreen — it doesn't make sense on the
 * Sign In screen. This has been corrected to "Don't have an account? Sign Up".
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SocialAuthSection } from '../../components/SocialAuthSection';
import { AuthFooter } from '../../components/AuthFooter';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─────────────────────────────────────────────────────────────────────────────
// STUB FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Handles the sign-in submission.
 * 
 * TODO (Backend):
 * 1. POST request to `/api/auth/login`
 *    Payload: { "usernameOrPhone": _usernameOrPhone, "password": _password }
 * 2. On Success (200 OK):
 *    - Store the returned JWT access token in SecureStore/AsyncStorage
 *    - If a refresh token is provided, store it securely
 *    - Return { success: true } to navigate to the Home screen
 * 3. On Error (401 Unauthorized, 404 Not Found):
 *    - Determine if the error is due to "user not found" or "invalid password"
 *    - Return { success: false, error: 'username' } or { success: false, error: 'password' }
 *      to highlight the specific field that failed validation on the UI.
 * 
 * @param _usernameOrPhone - Username or phone number entered by the user
 * @param _password - Password entered by the user
 * @returns Object with `success` flag and optional `error` ('username' | 'password')
 */
const onSignIn = async (
  _usernameOrPhone: string,
  _password: string
): Promise<{ success: boolean; error?: 'username' | 'password' }> => {
  console.log('onSignIn called — wire up your API here');
  return { success: true }; // Mock: always succeeds
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const SignInScreen = ({ navigation }: { navigation?: any }) => {
  const router = useRouter();

  // ── Form State ──────────────────────────────────────────────────────────
  const [usernameOrPhone, setUsernameOrPhone] = useState('');
  const [password, setPassword] = useState('');

  // ── Validation State ────────────────────────────────────────────────────
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
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

  // Simple check: both fields must have content to enable the button
  const formValid = usernameOrPhone.trim().length > 0 && password.length > 0;

  // ── Handlers ────────────────────────────────────────────────────────────

  /**
   * Called when the username/phone field loses focus.
   * Basic presence check — the real "incorrect username" error
   * comes from the server after a sign-in attempt.
   */
  const handleUsernameBlur = useCallback(() => {
    setUsernameTouched(true);
    if (usernameOrPhone.trim().length === 0) {
      setUsernameError('Please enter your username or phone number');
    } else {
      setUsernameError(null);
    }
  }, [usernameOrPhone]);

  /**
   * Called when the password field loses focus.
   * Basic presence check — the real "incorrect password" error
   * comes from the server after a sign-in attempt.
   */
  const handlePasswordBlur = useCallback(() => {
    setPasswordTouched(true);
    if (password.length === 0) {
      setPasswordError('Please enter your password');
    } else {
      setPasswordError(null);
    }
  }, [password]);

  /**
   * Handles the "Sign In" button press via Supabase Auth.
   */
  const handleSignIn = useCallback(async () => {
    if (!formValid) return;

    // Reset previous errors
    setUsernameError(null);
    setPasswordError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      phone: usernameOrPhone,
      password: password,
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (
        msg.includes('user') ||
        msg.includes('phone') ||
        msg.includes('not found') ||
        msg.includes('invalid credentials')
      ) {
        setUsernameTouched(true);
        setUsernameError('Username or Phone Number is incorrect');
      } else if (msg.includes('password')) {
        setPasswordTouched(true);
        setPasswordError('Incorrect password');
      } else {
        setUsernameTouched(true);
        setUsernameError(error.message || 'Username or Phone Number is incorrect');
      }
      return;
    }

    if (data?.session || data?.user) {
      if (navigation?.navigate) {
        navigation.navigate('SignInSuccess');
      } else {
        router.replace({ pathname: '/sign-in-success', params: { mode: 'sign-in' } } as any);
      }
    }
  }, [formValid, usernameOrPhone, password, navigation, router]);

  /**
   * Navigates to the Forgot Password screen.
   */
  const handleForgotPassword = () => {
    if (navigation) {
      navigation.navigate('ForgotPassword');
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: isKeyboardVisible ? 320 : 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* ─── Header ─────────────────────────────────────────────────── */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Sign In</Text>
            <Text style={styles.headerSubtext}>
              Hello again, welcome back to <Text style={{ fontWeight: 'bold', color: '#000000' }}>TREND.</Text>
            </Text>
          </View>

          {/* ─── Username or Phone Number Field ─────────────────────────── */}
          <FormInput
            label="Username or Phone Number"
            value={usernameOrPhone}
            onChangeText={(text) => {
              setUsernameOrPhone(text);
              if (usernameError) setUsernameError(null);
            }}
            placeholder="Enter username or phone number"
            autoCapitalize="none"
            error={usernameError}
            isValid={usernameOrPhone.trim().length > 0}
            touched={usernameTouched}
            onBlur={handleUsernameBlur}
          />

          {/* ─── Password Field ─────────────────────────────────────────── */}
          <FormInput
            label="Enter Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError(null);
            }}
            placeholder="Enter password"
            secureTextEntry
            showPasswordToggle
            error={passwordError}
            isValid={password.length > 0}
            touched={passwordTouched}
            onBlur={handlePasswordBlur}
          />

          {/* ─── Forgotten Password Link (right-aligned, below password) ── */}
          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>Forgotten password?</Text>
          </TouchableOpacity>

          {/* ─── Sign In Button ─────────────────────────────────────────── */}
          <PrimaryButton
            title="Sign In"
            onPress={handleSignIn}
            disabled={!formValid}
          />

          {/* ─── Social Login ───────────────────────────────────────────── */}
          <SocialAuthSection
            dividerText="Sign in with"
            onGooglePress={() => console.log('Google Sign In — implement OAuth')}
            onApplePress={() => console.log('Apple Sign In — implement Apple Sign In')}
          />

          {/* ─── Footer ─────────────────────────────────────────────────── */}
          {/*
            TYPO FIX: The Figma design had "Already have an account? Sign Up"
            which is a copy-paste error from SignUpScreen. Corrected to:
            "Don't have an account? Sign Up"
          */}
          <AuthFooter
            promptText="Don't have an account? "
            linkText="Sign Up"
            onLinkPress={() => {
              navigation?.navigate('SignUpScreen');
            }}
            onTermsPress={() => {
              // TODO (Navigation): Navigate to TermsScreen or open a web URL
              // navigation?.navigate('TermsScreen');
              console.log('Navigate to TermsScreen');
            }}
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
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  scrollContent: {
    paddingHorizontal: spacing.buttonPadding,
    paddingTop: 83,
    paddingBottom: 40,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h1,
    color: '#141A33',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtext: {
    ...typography.bodyRegular,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },

  // ── Forgotten Password Link ─────────────────────────────────────────────
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: -16, // Pull up closer to the password field
    marginBottom: 28,
  },
  forgotPasswordText: {
    ...typography.label,
    color: colors.primary,
  },
});
