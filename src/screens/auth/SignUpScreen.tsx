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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check, ChevronDown } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { SearchablePicker } from '../../components/SearchablePicker';
import { supabase } from '../../lib/supabase';
import { isPhoneValid, isPasswordValid } from '../../constants/validation';
import { useUserContext } from '../../store/UserContext';
import { typography } from '../../constants/theme';

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

// ── Google Gmail SVG Icon (Figma: logos:google-gmail 31.84x24) ──
const GoogleGmailIcon = () => (
  <Svg width={32} height={24} viewBox="0 0 32 24" fill="none">
    <Path
      d="M0.003 6.156V23.883C0.003 23.948 0.056 24 0.121 24H7.269V11.666L0.003 6.156Z"
      fill="#4285F4"
    />
    <Path
      d="M24.731 11.666V24H31.879C31.944 24 31.997 23.948 31.997 23.883V6.156L24.731 11.666Z"
      fill="#34A853"
    />
    <Path
      d="M24.731 11.666L32 6.156L27.604 2.822C25.86 1.499 23.411 2.378 22.84 4.451L24.731 11.666Z"
      fill="#FBBC04"
    />
    <Path
      d="M7.269 11.666L0 6.156L4.396 2.822C6.14 1.499 8.589 2.378 9.16 4.451L7.269 11.666Z"
      fill="#C5221F"
    />
    <Path
      d="M7.269 11.666V4.451C7.269 2.176 9.584 0.655 11.657 1.638L16 3.693L20.343 1.638C22.416 0.655 24.731 2.176 24.731 4.451V11.666L16 18.286L7.269 11.666Z"
      fill="#EA4335"
    />
  </Svg>
);

// ── Apple SVG Icon (Figma: si:apple-fill 32x32) ──
const AppleIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="#000000">
    <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.35-.57.66-1.07 1.72-.94 2.74 1.01.08 2.04-.49 2.66-1.24z" />
  </Svg>
);

export const SignUpScreen = ({ navigation }: { navigation?: any }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ── Form State ──
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
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

    try {
      await supabase.auth.signUp({
        phone: `${selectedCountry.code}${phone}`,
        password: password,
      });
    } catch (e) {
      console.log('Signup info:', e);
    }

    await updateProfile({ phone: formattedPhone, signupMethod: 'phone' });

    router.push('/user-location');
  }, [formValid, selectedCountry, phone, password, updateProfile, router]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top, 24),
              paddingBottom: isKeyboardVisible ? 320 : 40,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Sign Up Header (Figma: width 278px, height 64px, gap 8px) ── */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Sign up</Text>
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
                secureTextEntry
              />

              {passwordTouched && passwordValid && !passwordError && (
                <View style={styles.checkmarkIcon}>
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
              )}
            </View>
            {passwordTouched && passwordError && (
              <Text style={styles.errorText}>{passwordError}</Text>
            )}
          </View>

          {/* ── Filled Action Button: Sign Up (Figma: 358x48px, radius 24px, bg rgba(0, 8, 20, 0.96)) ── */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              !formValid ? styles.actionButtonDisabled : null,
            ]}
            onPress={handleSignUp}
            activeOpacity={0.85}
            disabled={!formValid}
          >
            <Text
              style={[
                styles.actionButtonText,
                !formValid ? styles.actionButtonTextDisabled : null,
              ]}
            >
              Sign Up
            </Text>
          </TouchableOpacity>

          {/* ── Divider: Sign up with (Figma: width 311px, gap 16px) ── */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Sign up with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ── Sign Up Options: Google & Apple (Figma: width 192px, height 56px, gap 80px) ── */}
          <View style={styles.socialRow}>
            {/* Google Gmail Button */}
            <TouchableOpacity
              style={styles.socialButton}
              activeOpacity={0.7}
              onPress={() => console.log('Google Sign Up')}
            >
              <GoogleGmailIcon />
            </TouchableOpacity>

            {/* Apple Button */}
            <TouchableOpacity
              style={styles.socialButton}
              activeOpacity={0.7}
              onPress={() => console.log('Apple Sign Up')}
            >
              <AppleIcon />
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
                  router.push('/sign-in');
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
              onPress={() => router.push('/terms-policy')}
            >
              <Text style={styles.termsLinkText}>Terms</Text>
            </TouchableOpacity>
            <Text style={styles.termsBaseText}> and </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/terms-policy')}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // ── Header (Figma: 278x64, gap 8px) ──
  headerContainer: {
    width: 278,
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    letterSpacing: 0.4,
    color: '#141A33',
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
  actionButtonTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },

  // ── Divider Row (Figma: width 311px, height 20px, gap 16px) ──
  dividerRow: {
    width: '100%',
    maxWidth: 311,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
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

  // ── Social Row (Figma: width 192px, height 56px, gap 80px) ──
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 80,
    marginBottom: 32,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
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
