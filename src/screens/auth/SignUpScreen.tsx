import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Keyboard,
  BackHandler,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../utils/safeNavigation';
import { Check, ChevronDown, X, Eye, EyeOff } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { SearchablePicker } from '../../components/SearchablePicker';
import { setPendingAuthDraft } from '../../api/trendApi';
import { signInWithGoogle, consumeGoogleRedirectResult } from '../../api/firebaseAuth';
import { isPhoneValid, isPasswordValid } from '../../constants/validation';
import { useUserContext } from '../../store/UserContext';
import { typography } from '../../constants/theme';
import { GoogleIcon } from '../../components/GoogleIcon';
import { WebMobileViewport } from '../../components/WebMobileViewport';

// ── Country Data ──
let CountryData: any;
try {
  const csc = require('country-state-city');
  CountryData = csc.Country;
} catch {
  CountryData = {
    getAllCountries: () => [
      { name: 'Nigeria', isoCode: 'NG', flag: '🇳🇬', phonecode: '234' },
      { name: 'United States', isoCode: 'US', flag: '🇺🇸', phonecode: '1' },
      { name: 'United Kingdom', isoCode: 'GB', flag: '🇬🇧', phonecode: '44' },
      { name: 'India', isoCode: 'IN', flag: '🇮🇳', phonecode: '91' },
      { name: 'Germany', isoCode: 'DE', flag: '🇩🇪', phonecode: '49' },
      { name: 'France', isoCode: 'FR', flag: '🇫🇷', phonecode: '33' },
      { name: 'Canada', isoCode: 'CA', flag: '🇨🇦', phonecode: '1' },
      { name: 'Australia', isoCode: 'AU', flag: '🇦🇺', phonecode: '61' },
    ],
  };
}

export const SignUpScreen = ({ navigation }: { navigation?: any }) => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();

  // Ensures skip (X) button never collides with status bar / dynamic island
  const skipButtonTop = useMemo(() => {
    const safeTop = Math.max(
      insets.top,
      Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0,
      36
    );
    return safeTop + 16;
  }, [insets.top]);

  // Hardware back press returns cleanly to role selection on web or root onboarding on native
  useEffect(() => {
    const onBackPress = () => {
      safeRouter.replace((Platform.OS === 'web' ? '/role-selection' : '/onboarding') as any);
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [safeRouter]);

  // ── Form State ──
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({
    code: '+234',
    flag: '🇳🇬',
    country: 'Nigeria',
    isoCode: 'NG',
  });
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // ── Validation State ──
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

  const phoneValid = isPhoneValid(phone);
  const passwordValid = isPasswordValid(password);
  const formValid = phoneValid && passwordValid && !phoneError;

  const countryItems = useMemo(() => {
    return CountryData.getAllCountries().map((c: any) => {
      const cleanPhone = (c.phonecode || '').replace(/^\++/, '');
      return {
        label: `+${cleanPhone} ${c.name}`,
        value: c.isoCode,
        icon: c.flag,
      };
    });
  }, []);

  const handlePhoneBlur = useCallback(() => {
    setPhoneTouched(true);
    if (!isPhoneValid(phone)) {
      setPhoneError('Enter a valid phone number');
    } else {
      setPhoneError(null);
    }
  }, [phone]);

  const handlePasswordBlur = useCallback(() => {
    setPasswordTouched(true);
    if (!isPasswordValid(password)) {
      setPasswordError('Min 8 chars, 1 number');
    } else {
      setPasswordError(null);
    }
  }, [password]);

  const { updateProfile } = useUserContext();

  const handleSignUp = useCallback(async () => {
    if (!formValid) return;

    const formattedPhone = `${selectedCountry.code} ${phone}`;
    setPhoneError(null);
    setPasswordError(null);

    setPendingAuthDraft({
      phone: `${selectedCountry.code}${phone}`,
      password,
    });

    await updateProfile({ phone: formattedPhone, signupMethod: 'phone' });

    safeRouter.push('/user-location');
  }, [formValid, selectedCountry, phone, password, updateProfile, safeRouter]);

  const handleSkip = useCallback(async () => {
    try {
      await updateProfile({ isLoggedIn: false });
    } catch {}
    safeRouter.replace('/home');
  }, [safeRouter, updateProfile]);

  const finishGoogleSignUp = useCallback(
    async (res: Awaited<ReturnType<typeof signInWithGoogle>>) => {
      if (!res.ok) {
        if (!res.cancelled && !res.redirecting && res.error) {
          setPhoneTouched(true);
          setPhoneError(res.error);
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
        safeRouter.push('/user-location');
      } else {
        safeRouter.replace({ pathname: '/sign-in-success', params: { mode: 'sign-in' } } as any);
      }
    },
    [safeRouter, updateProfile]
  );

  useEffect(() => {
    consumeGoogleRedirectResult('client').then(async (res) => {
      if (res) {
        setIsGoogleLoading(true);
        try {
          await finishGoogleSignUp(res);
        } finally {
          setIsGoogleLoading(false);
        }
      }
    });
  }, [finishGoogleSignUp]);

  const handleGoogleSignUp = useCallback(async () => {
    if (isGoogleLoading) return;
    setPhoneError(null);
    setPasswordError(null);
    setIsGoogleLoading(true);
    let redirecting = false;
    try {
      const res = await signInWithGoogle('client');
      redirecting = !!res.redirecting;
      await finishGoogleSignUp(res);
    } finally {
      if (!redirecting) {
        setIsGoogleLoading(false);
      }
    }
  }, [isGoogleLoading, finishGoogleSignUp]);

  const isWeb = Platform.OS === 'web';

  return (
    <WebMobileViewport>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* ── Top-Right Skip / X Button (hidden on web where Guest button handles guest mode) ── */}
        {!isWeb && (
          <TouchableOpacity
            style={[styles.skipButton, { top: skipButtonTop }]}
            onPress={handleSkip}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Skip Sign Up"
            accessibilityRole="button"
          >
            <X size={20} color="#141A33" strokeWidth={1.8} />
          </TouchableOpacity>
        )}

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: isWeb ? 32 : 83,
              paddingBottom: isKeyboardVisible ? 320 : 40,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Sign Up Header (Figma: width 278px, height 64px, gap 8px) ── */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>{isWeb ? 'Sign up' : 'Sign Up'}</Text>
            <Text style={styles.headerSubtitle}>
              Hello, welcome to <Text style={styles.brandBold}>TREND.</Text>
            </Text>
          </View>

          {/* ── Input 1: Phone Number (Figma: width 358px, height 80px, gap 8px) ── */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View
              style={[
                styles.inputBox,
                phoneTouched && phoneError ? styles.inputBoxError : null,
                phoneTouched && phoneValid && !phoneError ? styles.inputBoxSuccess : null,
              ]}
            >
              {/* Country flag and code container with dropdown indicator */}
              <TouchableOpacity
                style={styles.countryCodeContainer}
                activeOpacity={0.7}
                onPress={() => setShowCountryPicker(true)}
              >
                <Text style={styles.countryFlagText}>{selectedCountry.flag}</Text>
                <Text style={styles.countryCodeText}>{selectedCountry.code}</Text>
                <ChevronDown size={14} color="rgba(0, 8, 20, 0.7)" strokeWidth={2} />
              </TouchableOpacity>

              {/* Phone Input Field */}
              <TextInput
                style={[styles.textInputField, { paddingLeft: 12 }]}
                value={phone}
                onChangeText={(text) => {
                  const digitsOnly = text.replace(/[^0-9]/g, '');
                  setPhone(digitsOnly);
                  if (phoneError) setPhoneError(null);
                }}
                onBlur={handlePhoneBlur}
                placeholder="Enter phone number"
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                keyboardType="number-pad"
                inputMode="numeric"
              />

              {phoneTouched && phoneValid && !phoneError && (
                <View style={styles.checkmarkIcon}>
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
              )}
            </View>
            {phoneTouched && phoneError && (
              <Text style={styles.errorText}>{phoneError}</Text>
            )}
          </View>

          {/* ── Input 2: Create Password (Figma: width 358px, height 80px, gap 8px, placeholder John1983) ── */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Create Password</Text>
            <View
              style={[
                styles.inputBox,
                passwordTouched && passwordError ? styles.inputBoxError : null,
                passwordTouched && passwordValid && !passwordError ? styles.inputBoxSuccess : null,
              ]}
            >
              <TextInput
                style={styles.textInputField}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError(null);
                }}
                onBlur={handlePasswordBlur}
                placeholder="John1983"
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                secureTextEntry={!showPassword}
              />

              {passwordTouched && passwordValid && !passwordError && (
                <View style={[styles.checkmarkIcon, { marginRight: 8 }]}>
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
              )}

              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOff size={20} color="rgba(192, 192, 204, 0.96)" strokeWidth={1.8} />
                ) : (
                  <Eye size={20} color="rgba(192, 192, 204, 0.96)" strokeWidth={1.8} />
                )}
              </TouchableOpacity>
            </View>
            {passwordTouched && passwordError && (
              <Text style={styles.errorText}>{passwordError}</Text>
            )}
          </View>

          {/* ── Filled Action Button: Sign Up (Figma: 358x48px, radius 24px, bg rgba(0, 8, 20, 0.96)) ── */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              isWeb ? styles.actionButtonWebSpacing : null,
              !formValid ? styles.actionButtonDisabled : null,
            ]}
            onPress={handleSignUp}
            activeOpacity={0.85}
            disabled={!formValid}
          >
            <Text
              style={[
                styles.actionButtonText,
                isWeb ? styles.actionButtonTextWeb : null,
                !formValid ? styles.actionButtonTextDisabled : null,
              ]}
            >
              {isWeb ? 'Sign up' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          {/* ── Guest Button (Figma: 360x48px, top 499px, radius 24px, rgba(247, 247, 247, 0.96)) ── */}
          {isWeb && (
            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleSkip}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Sign in as Guest"
            >
              <Text style={styles.guestButtonText}>Sign in as Guest</Text>
            </TouchableOpacity>
          )}

          {/* ── Divider: Sign up with (Figma: width 311px, gap 16px) ── */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Sign up with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ── Sign Up Option: Centered Google Pill Button ── */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={[styles.googleButton, isGoogleLoading && styles.googleButtonLoading]}
              activeOpacity={0.75}
              disabled={isGoogleLoading}
              onPress={handleGoogleSignUp}
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
              accessibilityState={{ busy: isGoogleLoading }}
            >
              <GoogleIcon size={22} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
              {isGoogleLoading && (
                <ActivityIndicator
                  size="small"
                  color="rgba(0, 8, 20, 0.96)"
                  style={styles.googleLoader}
                />
              )}
            </TouchableOpacity>
          </View>

          {/* ── Footer 1: Already have an account? Sign In (Figma: 265x48px, gap 8px) ── */}
          <View style={styles.switchRow}>
            <Text style={styles.switchPromptText}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => {
                if (navigation?.navigate) {
                  navigation.navigate('SignInScreen');
                } else {
                  safeRouter.push('/sign-in');
                }
              }}
              activeOpacity={0.7}
              style={styles.switchLinkBtn}
            >
              <Text style={styles.switchLinkText}>Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* ── Footer 2: Application Terms and condition (Figma: 194x16px, 12px SF Pro) ── */}
          <View style={styles.termsRow}>
            <Text style={styles.termsBaseText}>Application </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => safeRouter.push('/terms-policy')}
            >
              <Text style={styles.termsLinkText}>Terms</Text>
            </TouchableOpacity>
            <Text style={styles.termsBaseText}> and </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => safeRouter.push('/terms-policy')}
            >
              <Text style={styles.termsLinkText}>condition</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Picker Bottom Sheet */}
      <SearchablePicker
        visible={showCountryPicker}
        title="Select Country"
        items={countryItems}
        selectedValue={selectedCountry.isoCode}
        onSelect={(value, label) => {
          const matched = CountryData.getAllCountries().find((c: any) => c.isoCode === value);
          const cleanPhone = matched?.phonecode ? matched.phonecode.replace(/^\++/, '') : '234';
          const newCode = `+${cleanPhone}`;
          const isDifferent = !selectedCountry.isoCode || selectedCountry.isoCode !== value || selectedCountry.code !== newCode;

          // Automatically clear the phone number and reset validation if country is switched
          if (isDifferent && phone.length > 0) {
            setPhone('');
            setPhoneError(null);
            setPhoneTouched(false);
          }

          setSelectedCountry({
            code: newCode,
            flag: matched ? matched.flag : '🇳🇬',
            country: label,
            isoCode: value,
          });
          setShowCountryPicker(false);
        }}
        onClose={() => setShowCountryPicker(false)}
      />
    </SafeAreaView>
    </WebMobileViewport>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  skipButton: {
    position: 'absolute',
    top: 56,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 83,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // ── Header (Figma: 278x64, gap 8px) ──
  headerContainer: {
    width: 278,
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    letterSpacing: 0.4,
    color: '#141A33',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  brandBold: {
    fontWeight: '700',
    color: '#000000',
  },

  // ── Inputs (Figma: width 358px, height 80px, gap 8px) ──
  inputGroup: {
    width: '100%',
    maxWidth: 358,
    gap: 8,
    marginBottom: 40,
  },
  inputLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  inputBox: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  inputBoxError: {
    borderColor: 'rgba(204, 41, 41, 0.9)',
  },
  inputBoxSuccess: {
    borderColor: '#0C790C',
  },

  // Country code selector inside phone field
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    height: 32,
    gap: 6,
    borderRightWidth: 1,
    borderRightColor: 'rgba(235, 235, 245, 0.96)',
  },
  countryFlagText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 18,
  },
  countryCodeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.3,
    color: '#141A33',
  },

  textInputField: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  checkmarkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0C790C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeButton: {
    paddingLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(204, 41, 41, 0.9)',
    paddingHorizontal: 4,
  },

  // ── Action Button (Figma: 358x48px, radius 24px, bg rgba(0, 8, 20, 0.96)) ──
  actionButton: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 56,
    shadowColor: 'rgba(133, 139, 148, 1)',
    shadowOffset: { width: 8, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  actionButtonDisabled: {
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    shadowOpacity: 0,
    elevation: 0,
  },
  actionButtonText: {
    ...typography.button,
    textTransform: 'capitalize',
    color: '#FFFFFF',
  },
  actionButtonWebSpacing: {
    marginBottom: 32,
  },
  actionButtonTextWeb: {
    textTransform: 'none',
  },
  actionButtonTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  guestButton: {
    width: '100%',
    maxWidth: 360,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginBottom: 24,
  },
  guestButtonText: {
    ...typography.button,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Divider Row (Figma: width 311px, height 20px, gap 16px) ──
  dividerRow: {
    width: '100%',
    maxWidth: 311,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  dividerText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Centered Google Auth Row ──
  socialRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  googleButton: {
    width: '100%',
    maxWidth: 360,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  googleButtonLoading: {
    opacity: 0.78,
  },
  googleLoader: {
    marginLeft: 2,
  },
  googleButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },

  // ── Already have an account row (Figma: width 265px, height 48px, gap 8px) ──
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  switchPromptText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    letterSpacing: 0.3,
    color: '#141A33',
  },
  switchLinkBtn: {
    paddingVertical: 4,
  },
  switchLinkText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: Platform.OS === 'ios' ? 0.15 : 0.2,
    textDecorationLine: 'underline',
    textTransform: 'capitalize',
    color: 'rgba(26, 130, 255, 0.9)',
  },

  // ── Application Terms and condition (Figma: width 194px, height 16px, 12px SF Pro) ──
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  termsBaseText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: '#000000',
  },
  termsLinkText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(26, 130, 255, 0.9)',
    textDecorationLine: 'underline',
  },
});

export default SignUpScreen;
