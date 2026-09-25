/**
 * ForgotPasswordScreen — 1:1 Figma Screen for Forgotten Password
 * Matches the 3 visual states: Empty, Error, and Valid with Green Checkmark
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { typography } from '../../constants/theme';

// ── Back Arrow Icon (24x24 matching Figma arrow-left-02) ──
const ArrowLeftIcon = ({
  size = 24,
  color = 'rgba(0, 8, 20, 0.96)',
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M5 12L12 19M5 12L12 5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Lock Keyhole Icon (24x24 matching Figma Frame 1000005729) ──
const LockKeyholeIcon = ({
  size = 24,
  color = '#000000',
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="15.5" r="1.2" fill={color} />
    <Path d="M12 16.7V18" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
  </Svg>
);

// ── Custom Eye Open Icon (Figma Spec) ──
const EyeOpenIcon = ({
  size = 24,
  color = 'rgba(0, 8, 20, 0.96)',
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 12C3.6 7.6 7.8 4.5 12 4.5C16.2 4.5 20.4 7.6 22 12C20.4 16.4 16.2 19.5 12 19.5C7.8 19.5 3.6 16.4 2 12Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.5} />
  </Svg>
);

// ── Custom Eye Closed with Eyelashes Icon (Figma Spec) ──
const EyeClosedIcon = ({
  size = 24,
  color = 'rgba(0, 8, 20, 0.96)',
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 10.5C5.8 14.5 8.7 16.2 12 16.2C15.3 16.2 18.2 14.5 21 10.5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path d="M6 13.5L4 16.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M10 15.5L9 19" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M14 15.5L15 19" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M18 13.5L20 16.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

// ── Green Circular Checkmark Badge (Figma Component 5) ──
const GreenCheckmarkBadge = ({ size = 24 }: { size?: number }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: 'rgba(12, 121, 12, 0.96)',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Svg width={size * 0.55} height={size * 0.55} viewBox="0 0 12 10" fill="none">
      <Path
        d="M1.5 5.2L4.2 8L10.5 1.8"
        stroke="#FFFFFF"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

export const ForgotPasswordScreen = ({ navigation }: { navigation?: any }) => {
  const router = useRouter();

  // ── Form State ──
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── Touched & Error States ──
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
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

  // Password validity: minimum 4 characters (not less than 4)
  const isNewPasswordValid = newPassword.length >= 4;
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length >= 4;
  const formValid = isNewPasswordValid && passwordsMatch;

  // ── Validation Handlers ──
  const handleNewPasswordChange = (text: string) => {
    setNewPassword(text);
    if (text.length >= 4) {
      // Valid — always clear error immediately so green badge shows cleanly
      setNewPasswordError(null);
    } else if (newPasswordTouched) {
      if (text.length > 0) {
        setNewPasswordError('Incorrect password input');
      } else {
        setNewPasswordError(null);
      }
    }
    // Cross-validate confirm password if already touched
    if (confirmPasswordTouched && confirmPassword.length > 0) {
      if (confirmPassword !== text) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError(null);
      }
    }
  };

  const handleNewPasswordBlur = () => {
    setNewPasswordTouched(true);
    if (newPassword.length > 0 && newPassword.length < 4) {
      setNewPasswordError('Incorrect password input');
    } else {
      setNewPasswordError(null);
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (confirmPasswordTouched) {
      if (text.length > 0 && text !== newPassword) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError(null);
      }
    }
  };

  const handleConfirmPasswordBlur = () => {
    setConfirmPasswordTouched(true);
    if (confirmPassword.length > 0 && confirmPassword !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError(null);
    }
  };

  const handleGoBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    } else {
      router.back();
    }
  };

  const handleConfirm = useCallback(() => {
    setNewPasswordTouched(true);
    setConfirmPasswordTouched(true);

    if (!isNewPasswordValid) {
      setNewPasswordError('Incorrect password input');
      return;
    }
    if (!passwordsMatch) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    // Navigate to Account Verification method selection screen
    if (navigation?.navigate) {
      navigation.navigate('VerificationMethod');
    } else {
      router.push('/verification-method');
    }
  }, [isNewPasswordValid, passwordsMatch, navigation, router]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: isKeyboardVisible ? 320 : 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Top Bar: Back Button ── */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleGoBack}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ArrowLeftIcon size={24} color="rgba(0, 8, 20, 0.96)" />
            </TouchableOpacity>
          </View>

          {/* ── Centered Lock Badge (Frame 1000005729) ── */}
          <View style={styles.lockBadge}>
            <LockKeyholeIcon size={24} color="#000000" />
          </View>

          {/* ── Heading Group ── */}
          <View style={styles.headingGroup}>
            <Text style={styles.title}>Forgotten password</Text>
            <Text style={styles.subtitle}>
              Forgot your password? Not a problem, fill in the required information.
            </Text>
          </View>

          {/* ── Form Fields ── */}
          <View style={styles.formContainer}>
            {/* Field 1: Create New Password */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>Create New Password</Text>
              <View
                style={[
                  styles.inputField,
                  newPasswordTouched && !!newPasswordError && styles.inputFieldError,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder="JohnDoe1234"
                  placeholderTextColor="rgba(192, 192, 204, 0.96)"
                  value={newPassword}
                  onChangeText={handleNewPasswordChange}
                  onBlur={handleNewPasswordBlur}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {isNewPasswordValid && !newPasswordError ? (
                  <GreenCheckmarkBadge size={24} />
                ) : (
                  <TouchableOpacity
                    onPress={() => setShowNewPassword((prev) => !prev)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {showNewPassword ? (
                      <EyeClosedIcon size={24} color="rgba(0, 8, 20, 0.96)" />
                    ) : (
                      <EyeOpenIcon size={24} color="rgba(0, 8, 20, 0.96)" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
              {newPasswordTouched && !!newPasswordError && (
                <Text style={styles.errorText}>{newPasswordError}</Text>
              )}
            </View>

            {/* Field 2: Confirm New Password */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>Confirm New Password</Text>
              <View
                style={[
                  styles.inputField,
                  confirmPasswordTouched && !!confirmPasswordError && styles.inputFieldError,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder="JohnDoe1234"
                  placeholderTextColor="rgba(192, 192, 204, 0.96)"
                  value={confirmPassword}
                  onChangeText={handleConfirmPasswordChange}
                  onBlur={handleConfirmPasswordBlur}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {showConfirmPassword ? (
                    <EyeClosedIcon size={24} color="rgba(0, 8, 20, 0.96)" />
                  ) : (
                    <EyeOpenIcon size={24} color="rgba(0, 8, 20, 0.96)" />
                  )}
                </TouchableOpacity>
              </View>
              {confirmPasswordTouched && !!confirmPasswordError && (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              )}
            </View>

            {/* ── Filled Action Button (Confirm) ── */}
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !formValid && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!formValid}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ── Exact Styles matching Figma 1:1 ──
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 34,
  },

  // ── Top Bar ──
  topBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Centered Lock Badge (Frame 1000005729) ──
  lockBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },

  // ── Heading Group (sign up header) ──
  headingGroup: {
    marginTop: 24,
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    letterSpacing: 0.4,
    color: '#141A33',
  },
  subtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    paddingHorizontal: 8,
  },

  // ── Form Container ──
  formContainer: {
    marginTop: 48,
    gap: 24,
  },
  fieldWrapper: {
    gap: 8,
  },
  fieldLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  inputField: {
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  inputFieldError: {
    borderColor: '#CC2929',
  },
  textInput: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.2 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
    marginRight: 8,
  },
  errorText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: '#CC2929',
    marginTop: 2,
    marginLeft: 4,
  },

  // ── Filled Action Button (Confirm) ──
  confirmButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    ...typography.button,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
});
