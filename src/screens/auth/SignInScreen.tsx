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
  BackHandler,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SocialAuthSection } from '../../components/SocialAuthSection';
import { AuthFooter } from '../../components/AuthFooter';
import { trendApi } from '../../api/trendApi';
import { signInWithGoogle, consumeGoogleRedirectResult } from '../../api/firebaseAuth';
import { useSafeRouter } from '../../utils/safeNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserContext } from '../../store/UserContext';

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
  const safeRouter = useSafeRouter();
  const { updateProfile } = useUserContext();

  // Hardware back press on SignInScreen returns cleanly to root onboarding screen
  useEffect(() => {
    const onBackPress = () => {
      safeRouter.replace('/onboarding' as any);
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [safeRouter]);

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
   * Handles the "Sign In" button press via live Trend REST API.
   */
  const handleSignIn = useCallback(async () => {
    if (!formValid) return;

    // Reset previous errors
    setUsernameError(null);
    setPasswordError(null);

    const identifier = usernameOrPhone.trim();
    const res = await trendApi.auth.login({
      identifier,
      password,
    });

    if (!res.ok) {
      const msg = (res.error || '').toLowerCase();
      if (msg.includes('password') && !msg.includes('credentials')) {
        setPasswordTouched(true);
        setPasswordError(res.error || 'Incorrect password');
      } else if (
        res.status === 401 ||
        res.status === 404 ||
        msg.includes('wrong credentials') ||
        msg.includes('user') ||
        msg.includes('phone') ||
        msg.includes('not found') ||
        msg.includes('invalid')
      ) {
        setUsernameTouched(true);
        setUsernameError(res.error || 'Username or Phone Number is incorrect');
      } else {
        setUsernameTouched(true);
        setUsernameError(res.error || 'Unable to sign in right now. Please try again.');
      }
      return;
    }

    const user = res.data?.user || res.data || {};
    await updateProfile({
      isLoggedIn: true,
      phone: user.phone || (identifier.includes('@') ? null : identifier),
      email: user.email || (identifier.includes('@') ? identifier : null),
      fullName: user.name || null,
      username: user.username || user.name || identifier,
      avatarUri: user.image || null,
    });

    if (navigation?.navigate) {
      navigation.navigate('SignInSuccess');
    } else {
      safeRouter.replace({ pathname: '/sign-in-success', params: { mode: 'sign-in' } } as any);
    }
  }, [formValid, usernameOrPhone, password, navigation, safeRouter, updateProfile]);

  const finishGoogleAuth = useCallback(
    async (res: Awaited<ReturnType<typeof signInWithGoogle>>) => {
      if (!res.ok) {
        if (!res.cancelled && !res.redirecting && res.error) {
          setUsernameTouched(true);
          setUsernameError(res.error);
        }
        return;
      }
      const user = res.user || {};
      await updateProfile({
        isLoggedIn: true,
        email: user.email || null,
        fullName: user.name || null,
        username: user.name || user.email?.split('@')[0] || 'User',
        avatarUri: user.image || null,
        signupMethod: 'email',
      });
      if (res.created) {
        safeRouter.push('/user-location' as any);
      } else if (navigation?.navigate) {
        navigation.navigate('SignInSuccess');
      } else {
        safeRouter.replace({ pathname: '/sign-in-success', params: { mode: 'sign-in' } } as any);
      }
    },
    [navigation, safeRouter, updateProfile]
  );

  useEffect(() => {
    consumeGoogleRedirectResult('client').then((res) => {
      if (res) finishGoogleAuth(res);
    });
  }, [finishGoogleAuth]);

  const handleGoogleSignIn = useCallback(async () => {
    setUsernameError(null);
    setPasswordError(null);
    const res = await signInWithGoogle('client');
    await finishGoogleAuth(res);
  }, [finishGoogleAuth]);

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
            onGooglePress={handleGoogleSignIn}
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
