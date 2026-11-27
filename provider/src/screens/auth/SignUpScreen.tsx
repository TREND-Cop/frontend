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
  Dimensions,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Path, Rect } from 'react-native-svg';
import { Eye, EyeOff, ChevronDown } from 'lucide-react-native';
import { ProviderCountryPickerSheet, CountryItem } from '../../components/ProviderCountryPickerSheet';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { PayoutTermsNotice } from '../../components/payout/PayoutTermsNotice';
import { isPhoneValid, isPasswordValid, checkPhoneExists } from '../../constants/validation';
import { saveToStorage, removeFromStorage, STORAGE_KEYS } from '../../utils/providerStorage';
import { HAS_SEEN_TUTORIAL_KEY } from '../../context/ProviderOnboardingContext';
import { setPendingProviderAuthDraft, trendApi } from '../../api/trendApi';
import {
  signInProviderWithGoogle,
  consumeProviderGoogleRedirectResult,
} from '../../api/firebaseAuth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── 1:1 Vector Checkmark Circle (Component 5 / checkmark-circle-02) ──
function CheckmarkCircleIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
        fill="#0C790C"
      />
      <Path
        d="M8 12l2.83 2.83L16.5 9.17"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── 1:1 Official 4-Color Google Vector Icon (devicon:google 24x24) ──
function GoogleIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </Svg>
  );
}

// ── 1:1 Vector Apple Icon (si:apple-fill 24x24 #000000) ──
function AppleIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="#000000">
      <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.35-.57.66-1.07 1.72-.94 2.74 1.01.08 2.04-.49 2.66-1.24z" />
    </Svg>
  );
}

export interface SignUpScreenProps {
  onSuccess?: (accountData: { phone: string; countryCode: string }) => void;
  onNavigateLogin?: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onSuccess,
  onNavigateLogin,
}) => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();

  // Hardware back press on SignUpScreen returns cleanly to root onboarding screen
  useEffect(() => {
    const onBackPress = () => {
      safeRouter.replace('/' as any);
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [safeRouter]);

  // ── Form State ──
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordMasked, setIsPasswordMasked] = useState(true);

  // ── Country Selection State (Default: Nigeria +234) ──
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>({
    name: 'Nigeria',
    code: '+234',
    flag: '🇳🇬',
    isoCode: 'NG',
  });
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // ── Validation & Error State ──
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Keyboard awareness
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Live validity checks
  const isPhoneFormatValid = isPhoneValid(phone);
  const isPhoneTaken = checkPhoneExists(phone);
  const isPassValid = isPasswordValid(password);

  // Show green checkmark when phone is valid and not taken
  const showPhoneSuccess = isPhoneFormatValid && !phoneError;
  // Show green checkmark when password is valid and not error
  const showPasswordSuccess = isPassValid && !passwordError;

  // ── Backend Stubs ──
  // TODO (Backend): Wire with actual Supabase / backend authentication once phone auth is configured.
  // Note: Provider accounts will require role metadata to distinguish from customer accounts.
  const onCreateAccount = useCallback(async (payload: { phone: string; password: string }) => {
    setPendingProviderAuthDraft({
      phone: payload.phone,
      password: payload.password,
    });
  }, []);

  // ── Submission Handler (Validate on press, as specified) ──
  const handleCreateAccountPress = useCallback(async () => {
    setHasAttemptedSubmit(true);
    let hasError = false;

    // Validate phone
    if (!isPhoneValid(phone)) {
      setPhoneError('Please enter a valid phone number');
      hasError = true;
    } else if (checkPhoneExists(phone)) {
      // Figma Frame 5: "Number already exist"
      setPhoneError('Number already exist');
      hasError = true;
    } else {
      setPhoneError(null);
    }

    // Validate password
    if (!isPasswordValid(password)) {
      // Figma Frame 5: "Incorrect password input"
      setPasswordError('Incorrect password input');
      hasError = true;
    } else {
      setPasswordError(null);
    }

    if (hasError) {
      return;
    }

    // Reset any previous tutorial state for this new registration
    try {
      await saveToStorage(STORAGE_KEYS.PROVIDER_HAS_COMPLETED_TUTORIAL, false);
      await removeFromStorage(STORAGE_KEYS.PROVIDER_HAS_COMPLETED_TUTORIAL);
      await removeFromStorage(STORAGE_KEYS.PROVIDER_TUTORIAL_COMPLETED_AT);
      await removeFromStorage(STORAGE_KEYS.PROVIDER_PAYOUT_MODAL_DISMISSED);
      await removeFromStorage(HAS_SEEN_TUTORIAL_KEY);
    } catch {}

    // Call backend registration draft store (strip leading 0 so E.164 matches login)
    await onCreateAccount({
      phone: `${selectedCountry.code}${phone.replace(/^0+/, '')}`,
      password,
    });

    if (onSuccess) {
      onSuccess({ phone, countryCode: selectedCountry.code });
    } else {
      safeRouter.push({
        pathname: '/business-owner-profile' as any,
        params: { phone, countryCode: selectedCountry.code },
      });
    }
  }, [phone, password, selectedCountry, onCreateAccount, onSuccess, safeRouter]);

  const handleLoginPress = () => {
    if (onNavigateLogin) {
      onNavigateLogin();
    } else {
      safeRouter.push('/login-business-owner' as any);
    }
  };

  const finishProviderGoogleSignUp = useCallback(
    async (res: Awaited<ReturnType<typeof signInProviderWithGoogle>>) => {
      if (!res.ok) {
        if (!res.cancelled && !res.redirecting && res.error) {
          setPhoneError(res.error);
        }
        return;
      }

      let hasBusiness = false;
      try {
        const bizRes = await trendApi.business.getMe('business');
        if (bizRes.ok && bizRes.data) {
          hasBusiness = true;
        }
      } catch {}

      if (hasBusiness && !res.created) {
        safeRouter.resetRoot('/dashboard' as any);
      } else {
        safeRouter.push('/business-owner-profile' as any);
      }
    },
    [safeRouter]
  );

  useEffect(() => {
    consumeProviderGoogleRedirectResult().then(async (res) => {
      if (res) {
        setIsGoogleLoading(true);
        try {
          await finishProviderGoogleSignUp(res);
        } finally {
          setIsGoogleLoading(false);
        }
      }
    });
  }, [finishProviderGoogleSignUp]);

  const handleGoogleSignUp = useCallback(async () => {
    if (isGoogleLoading) return;
    setPhoneError(null);
    setPasswordError(null);
    setIsGoogleLoading(true);
    let redirecting = false;
    try {
      const res = await signInProviderWithGoogle();
      redirecting = !!res.redirecting;
      await finishProviderGoogleSignUp(res);
    } finally {
      if (!redirecting) {
        setIsGoogleLoading(false);
      }
    }
  }, [isGoogleLoading, finishProviderGoogleSignUp]);

  const handleTermsPress = () => {
    setShowTermsModal(true);
  };

  const handleCountrySelect = (country: CountryItem) => {
    setSelectedCountry(country);
    setPhone('');
    setPhoneError(null);
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flexOne}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top + 39, 83),
              paddingBottom: Math.max(insets.bottom + 20, 34),
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* ── Header Frame (358px x 96px, gap: 16px) ── */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Trend Business</Text>
            <Text style={styles.headerSubtitle}>
              Manage your beauty business with ease on Trend Business
            </Text>
          </View>

          {/* ── Form Inputs Container ── */}
          <View style={styles.formContainer}>
            {/* ── Phone Number Field (358px) ── */}
            <View style={styles.inputFieldBlock}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <View
                style={[
                  styles.inputFieldFrame,
                  phoneError ? styles.inputBorderError : null,
                ]}
              >
                {/* Country Flag & Code Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.countryPickerButton}
                  onPress={() => setShowCountryPicker(true)}
                >
                  <Text style={styles.flagEmoji}>{selectedCountry.flag}</Text>
                  <Text
                    style={[
                      styles.countryCodeText,
                      phone.length === 0 ? styles.countryCodePlaceholder : styles.countryCodeFilled,
                    ]}
                  >
                    {selectedCountry.code}
                  </Text>
                </TouchableOpacity>

                {/* Phone Text Input */}
                <TextInput
                  style={styles.phoneTextInput}
                  placeholder="08110783610"
                  placeholderTextColor="rgba(192, 192, 204, 0.96)"
                  value={phone}
                  onChangeText={(val) => {
                    setPhone(val);
                    if (phoneError) setPhoneError(null);
                  }}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />

                {/* Right Status Icon (Checkmark when valid) */}
                {showPhoneSuccess && (
                  <View style={styles.rightIconContainer}>
                    <CheckmarkCircleIcon size={20} />
                  </View>
                )}
              </View>

              {/* Number Error Helper Text ("Number already exist") */}
              {phoneError && (
                <Text style={styles.errorHelperText}>{phoneError}</Text>
              )}
            </View>

            {/* ── Create Password Field (358px) ── */}
            <View style={styles.inputFieldBlock}>
              <Text style={styles.fieldLabel}>Create Password</Text>
              <View
                style={[
                  styles.inputFieldFrame,
                  passwordError ? styles.inputBorderError : null,
                ]}
              >
                <TextInput
                  style={styles.passwordTextInput}
                  placeholder="John1983"
                  placeholderTextColor="rgba(192, 192, 204, 0.96)"
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (passwordError) setPasswordError(null);
                  }}
                  secureTextEntry={isPasswordMasked}
                  autoCapitalize="none"
                />

                {/* Right Icon: Exactly ONE icon in the box (Checkmark when valid & unmasked, Eye Toggle otherwise) */}
                {showPasswordSuccess && !isPasswordMasked ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.eyeToggleButton}
                    onPress={() => setIsPasswordMasked(true)}
                  >
                    <CheckmarkCircleIcon size={20} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.eyeToggleButton}
                    onPress={() => setIsPasswordMasked(!isPasswordMasked)}
                  >
                    {isPasswordMasked ? (
                      <EyeOff
                        size={20}
                        color={password.length > 0 ? '#000814' : 'rgba(96, 96, 102, 0.96)'}
                        strokeWidth={1.5}
                      />
                    ) : (
                      <Eye
                        size={20}
                        color={password.length > 0 ? '#000814' : 'rgba(96, 96, 102, 0.96)'}
                        strokeWidth={1.5}
                      />
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Password Error Helper Text ("Incorrect password input") */}
              {passwordError && (
                <Text style={styles.errorHelperText}>{passwordError}</Text>
              )}
            </View>
          </View>

          {/* ── Create account Action Button (358px x 48px, radius 24px) ── */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.createAccountButton}
            onPress={handleCreateAccountPress}
          >
            <Text style={styles.createAccountButtonText}>Create account</Text>
          </TouchableOpacity>

          {/* ── "Sign up with" Divider Row (312px x 20px, gap: 16px) ── */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Sign up with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ── Social Auth Options (192px x 56px, gap: 80px) ── */}
          <View style={styles.socialButtonsContainer}>
            {/* Google OAuth Button */}
            <TouchableOpacity
              activeOpacity={0.75}
              disabled={isGoogleLoading}
              style={[styles.socialButton, isGoogleLoading && { opacity: 0.78 }]}
              onPress={handleGoogleSignUp}
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
              accessibilityState={{ busy: isGoogleLoading }}
            >
              {isGoogleLoading ? (
                <ActivityIndicator size="small" color="rgba(0, 8, 20, 0.96)" />
              ) : (
                <GoogleIcon size={24} />
              )}
            </TouchableOpacity>

            {/* Apple OAuth Button */}
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.socialButton}
              onPress={() => {
                // Stub OAuth
              }}
            >
              <AppleIcon size={24} />
            </TouchableOpacity>
          </View>

          {/* ── Already have an account? Login Footer (249px x 48px) ── */}
          <View style={styles.loginRow}>
            <Text style={styles.alreadyHaveText}>I already have an account</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.loginButton}
              onPress={handleLoginPress}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>

          {/* ── Application Terms and condition Footer (194px x 16px) ── */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.termsButton}
            onPress={handleTermsPress}
          >
            <Text style={styles.termsText}>Application Terms and condition</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── 1:1 Country Picker Modal ── */}
      <ProviderCountryPickerSheet
        visible={showCountryPicker}
        selectedCode={selectedCountry.code}
        onSelect={handleCountrySelect}
        onClose={() => setShowCountryPicker(false)}
      />

      {/* ── 1:1 Terms and Conditions Modal ── */}
      <PayoutTermsNotice
        visible={showTermsModal}
        onAgree={() => setShowTermsModal(false)}
        onDecline={() => setShowTermsModal(false)}
      />

      {/* Android System Dock Barrier */}
      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </View>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flexOne: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },

  /* ── header (width: 358px, gap: 16px, center aligned) ── */
  header: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 40,
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.1,
    color: '#000000',
    textAlign: 'center',
    alignSelf: 'stretch',
    includeFontPadding: false,
  },
  headerSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    alignSelf: 'stretch',
    includeFontPadding: false,
  },

  /* ── Form Inputs Container ── */
  formContainer: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    gap: 40,
    marginBottom: 40,
  },
  inputFieldBlock: {
    width: '100%',
    gap: 16,
    alignItems: 'flex-start',
    alignSelf: 'stretch',
  },
  fieldLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'left',
    includeFontPadding: false,
  },
  inputFieldFrame: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    overflow: 'hidden',
  },
  inputBorderError: {
    borderColor: '#CC2929',
  },

  /* Country Code Button inside phone field with border-right divider */
  countryPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 10,
    height: 32,
    gap: 6,
    borderRightWidth: 1,
    borderRightColor: 'rgba(192, 192, 204, 0.96)',
  },
  flagEmoji: {
    fontSize: 20,
    lineHeight: 24,
  },
  countryCodeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    includeFontPadding: false,
  },
  countryCodeFilled: {
    color: 'rgba(0, 8, 20, 0.96)',
  },
  countryCodePlaceholder: {
    color: 'rgba(192, 192, 204, 0.96)',
  },

  phoneTextInput: {
    flex: 1,
    minWidth: 0,
    height: 36,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
    paddingHorizontal: 4,
    backgroundColor: 'transparent',
    includeFontPadding: false,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
          borderWidth: 0,
          boxShadow: 'none',
          backgroundColor: 'transparent',
        } as any)
      : {}),
  },
  passwordTextInput: {
    flex: 1,
    minWidth: 0,
    height: 36,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
    paddingHorizontal: 4,
    backgroundColor: 'transparent',
    includeFontPadding: false,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
          borderWidth: 0,
          boxShadow: 'none',
          backgroundColor: 'transparent',
        } as any)
      : {}),
  },
  passwordRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightIconContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeToggleButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorHelperText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#CC2929',
    includeFontPadding: false,
    paddingHorizontal: 4,
  },

  /* ── Action Button ("Create account") ── */
  createAccountButton: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  createAccountButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    includeFontPadding: false,
  },

  /* ── Sign up with Divider ── */
  dividerRow: {
    width: '100%',
    maxWidth: 312,
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EBEBF5',
  },
  dividerText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  /* ── Social Buttons (width: 192px, gap: 80px) ── */
  socialButtonsContainer: {
    width: 192,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C0C0CC',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  /* ── Login Switch Row ── */
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  alreadyHaveText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#141A33',
    includeFontPadding: false,
  },
  loginButton: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  loginButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#1A82FF',
    includeFontPadding: false,
  },

  /* ── Terms and condition Footer ── */
  termsButton: {
    paddingVertical: 4,
  },
  termsText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
