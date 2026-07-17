/**
 * SignUpScreen — First auth screen after onboarding.
 *
 * Flow: OnboardingScreen → SignUpScreen → UserLocationScreen
 *
 * Uses shared components: FormInput, PrimaryButton, SocialAuthSection, AuthFooter
 * Uses shared validation: PASSWORD_RULES, isPasswordValid, isPhoneValid, COUNTRY_CODES
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
import { colors, typography, radius, spacing, shadows } from '../../constants/theme';
import {
  PASSWORD_RULES,
  isPasswordValid,
  isPhoneValid,
  COUNTRY_CODES,
} from '../../constants/validation';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SocialAuthSection } from '../../components/SocialAuthSection';
import { AuthFooter } from '../../components/AuthFooter';

// ─────────────────────────────────────────────────────────────────────────────
// STUB FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Checks whether the given phone number is already registered.
 * 
 * TODO (Backend): 
 * 1. GET or POST request to `/api/auth/check-phone`
 *    Payload: { "phone": _phone }
 * 2. Return `true` if the number already exists (e.g. 409 Conflict, or { exists: true })
 * 3. Return `false` if the number is available.
 */
const checkPhoneExists = async (_phone: string): Promise<boolean> => {
  return false; // Mock: always returns false (number doesn't exist)
};

/**
 * Handles the sign-up submission.
 * 
 * TODO (Backend):
 * 1. POST request to `/api/auth/register`
 *    Payload: { "phone": _phone, "password": _password }
 * 2. On Success (201 Created):
 *    - The backend should either log the user in immediately (return a JWT token to store)
 *      or expect an OTP verification step next.
 *    - Return { success: true }
 * 3. On Error (e.g. validation error or phone already registered race-condition):
 *    - Return { success: false, error: '...' } so the UI can alert the user.
 */
const onSignUp = async (_phone: string, _password: string): Promise<boolean> => {
  console.log('onSignUp called — wire up your API here');
  return true; // Mock: always succeeds
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const SignUpScreen = ({ navigation }: { navigation?: any }) => {
  // ── Form State ──────────────────────────────────────────────────────────
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // ── Validation State ────────────────────────────────────────────────────
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Derived validity (used for checkmarks and button state)
  const phoneValid = isPhoneValid(phone);
  const passwordValid = isPasswordValid(password);
  const formValid = phoneValid && passwordValid && !phoneError;

  // ── Handlers ────────────────────────────────────────────────────────────

  /**
   * Called when the phone input loses focus.
   * Performs local format validation, then checks if number already exists.
   */
  const handlePhoneBlur = useCallback(async () => {
    setPhoneTouched(true);
    if (!isPhoneValid(phone)) {
      setPhoneError('Enter a valid phone number');
      return;
    }
    // Check against backend for duplicate numbers
    const exists = await checkPhoneExists(`${selectedCountry.code}${phone}`);
    if (exists) {
      setPhoneError('Number already exist');
    } else {
      setPhoneError(null);
    }
  }, [phone, selectedCountry]);

  /**
   * Called when the password input loses focus.
   * Validates against the shared PASSWORD_RULES constant.
   */
  const handlePasswordBlur = useCallback(() => {
    setPasswordTouched(true);
    if (!isPasswordValid(password)) {
      setPasswordError('Incorrect password format');
    } else {
      setPasswordError(null);
    }
  }, [password]);

  /**
   * Handles the "Sign Up" button press.
   * Calls the stubbed onSignUp function and navigates on success.
   */
  const handleSignUp = useCallback(async () => {
    if (!formValid) return;

    const fullPhone = `${selectedCountry.code}${phone}`;
    const success = await onSignUp(fullPhone, password);

    if (success && navigation) {
      navigation.navigate('PhoneVerification', { phone: fullPhone });
    }
  }, [formValid, selectedCountry, phone, password, navigation]);

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
        {/* ─── Header ─────────────────────────────────────────────────── */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Sign up</Text>
          <Text style={styles.headerSubtext}>
            Hello, welcome to <Text style={{ fontWeight: 'bold', color: '#000000' }}>Trend</Text>
          </Text>
        </View>

        {/* ─── Phone Number Field ─────────────────────────────────────── */}
        <FormInput
          label="Phone Number"
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            if (phoneError) setPhoneError(null);
          }}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          error={phoneError}
          isValid={phoneValid}
          touched={phoneTouched}
          onBlur={handlePhoneBlur}
          leftAccessory={
            <>
              {/* Country Code Picker Toggle */}
              <TouchableOpacity
                style={styles.countryCodeButton}
                onPress={() => setShowCountryPicker(!showCountryPicker)}
              >
                <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                <Text style={styles.countryCode}>{selectedCountry.code}</Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>

              {/* Divider between country picker and phone input */}
              <View style={styles.inputDivider} />
            </>
          }
        />

        {/* ─── Country Code Dropdown (conditional) ────────────────────── */}
        {showCountryPicker && (
          <View style={styles.countryDropdown}>
            {COUNTRY_CODES.map((country) => (
              <TouchableOpacity
                key={country.code}
                style={styles.countryOption}
                onPress={() => {
                  setSelectedCountry(country);
                  setShowCountryPicker(false);
                }}
              >
                <Text style={styles.countryOptionText}>
                  {country.flag}  {country.code}  {country.country}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

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
          isValid={passwordValid}
          touched={passwordTouched}
          onBlur={handlePasswordBlur}
          hint={`Min ${PASSWORD_RULES.minLength} characters${PASSWORD_RULES.requiresNumber ? ', at least 1 number' : ''}`}
        />

        {/* ─── Sign Up Button ─────────────────────────────────────────── */}
        <PrimaryButton
          title="Sign Up"
          onPress={handleSignUp}
          disabled={!formValid}
        />

        {/* ─── Social Login ───────────────────────────────────────────── */}
        <SocialAuthSection
          dividerText="Sign up with"
          onGooglePress={() => console.log('Google Sign Up — implement OAuth')}
          onApplePress={() => console.log('Apple Sign Up — implement Apple Sign In')}
        />

        {/* ─── Footer ─────────────────────────────────────────────────── */}
        <AuthFooter
          promptText="Already have an account? "
          linkText="Sign In"
          onLinkPress={() => {
            navigation?.navigate('SignInScreen');
          }}
          onTermsPress={() => {
            // TODO (Navigation): Navigate to TermsScreen or open a web URL
            // navigation?.navigate('TermsScreen');
            console.log('Navigate to TermsScreen');
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES — Only screen-specific styles remain here.
// Common input/button/social/footer styles have been moved to shared components.
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

  // ── Phone Field Specific ────────────────────────────────────────────────
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 4,
  },
  countryCode: {
    ...typography.bodyRegular,
    color: '#000000',
    marginRight: 4,
  },
  dropdownArrow: {
    fontSize: 10,
    color: colors.primarySupportText,
  },
  inputDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.outlineBorders,
    marginRight: 10,
  },

  // ── Country Dropdown ────────────────────────────────────────────────────
  countryDropdown: {
    borderWidth: 1,
    borderColor: colors.outlineBorders,
    borderRadius: radius.medium,
    marginBottom: 16,
    marginTop: -16,
    backgroundColor: colors.appBackground,
    ...shadows.card1,
  },
  countryOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.inactive,
  },
  countryOptionText: {
    ...typography.bodyRegular,
    color: '#000000',
  },
});
