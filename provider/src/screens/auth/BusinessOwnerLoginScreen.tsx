import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Modal,
  FlatList,
  Pressable,
  Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Search, X, Check, Eye, EyeOff } from 'lucide-react-native';
import { Country as CountryData } from 'country-state-city';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { DommyLoader } from '../../components/DommyLoader';

// ── Google SVG Icon (24x24 Official Colors) ──
const GoogleIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
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

// ── Apple SVG Icon (24x24 Black) ──
const AppleIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="#000000">
    <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.35-.57.66-1.07 1.72-.94 2.74 1.01.08 2.04-.49 2.66-1.24z" />
  </Svg>
);

export interface BusinessOwnerLoginScreenProps {
  onNavigateSignUp?: () => void;
}

export const BusinessOwnerLoginScreen: React.FC<BusinessOwnerLoginScreenProps> = ({
  onNavigateSignUp,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ── Form State ──
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ── Validation & Touched ──
  const [identifierTouched, setIdentifierTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // ── Country Picker State ──
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState({
    code: '+234',
    flag: '🇳🇬',
    name: 'Nigeria',
    isoCode: 'NG',
  });

  // Country list from country-state-city
  const countries = useMemo(() => {
    return CountryData.getAllCountries().map((c) => ({
      name: c.name,
      code: `+${c.phonecode.replace(/^\++/, '')}`,
      flag: c.flag,
      isoCode: c.isoCode,
    }));
  }, []);

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return countries;
    const query = countrySearch.toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.code.includes(query)
    );
  }, [countries, countrySearch]);

  // Validation rules
  const isIdentifierValid = identifier.trim().length >= 3;
  const isPasswordValid = password.length >= 4;

  const handleIdentifierBlur = () => {
    setIdentifierTouched(true);
    if (!isIdentifierValid && identifier.length > 0) {
      setIdentifierError('Incorrect business name or number');
    } else {
      setIdentifierError(null);
    }
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    if (!isPasswordValid && password.length > 0) {
      setPasswordError('Incorrect password input');
    } else {
      setPasswordError(null);
    }
  };

  const handleLogin = () => {
    setIdentifierTouched(true);
    setPasswordTouched(true);

    if (!isIdentifierValid) {
      setIdentifierError('Incorrect business name or number');
      return;
    }
    if (!isPasswordValid) {
      setPasswordError('Incorrect password input');
      return;
    }

    // Trigger 1:1 Figma Dommy Loader Screen Overlay
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/dashboard' as any);
    }, 2000);
  };

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setIsKeyboardVisible(true);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
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
              paddingBottom: Math.max(insets.bottom + 16, 32) + (isKeyboardVisible ? keyboardHeight : 0),
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        >
          {/* ── Header (width: 358px, gap: 16px, text-align: center) ── */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Trend Business</Text>
            <Text style={styles.headerSubtitle}>
              Welcome back Ann Nwachukwu, your business awaits you.
            </Text>
          </View>

          {/* ── Business Name or Phone Number Field ── */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Business Name or Phone Number</Text>
            <View
              style={[
                styles.inputContainer,
                identifierError ? styles.inputErrorBorder : null,
              ]}
            >
              <TextInput
                style={styles.textInput}
                placeholder="Lomo care, +000 948 938 430"
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                value={identifier}
                onChangeText={(text) => {
                  setIdentifier(text);
                  if (identifierError) setIdentifierError(null);
                }}
                onBlur={handleIdentifierBlur}
                autoCapitalize="none"
              />

              {/* Status Indicator (Checkmark if valid, clear if error) */}
              {isIdentifierValid && (
                <View style={styles.checkmarkCircle}>
                  <Check size={12} color="#FFFFFF" strokeWidth={2.5} />
                </View>
              )}

              {identifierError && (
                <TouchableOpacity
                  onPress={() => {
                    setIdentifier('');
                    setIdentifierError(null);
                  }}
                >
                  <View style={styles.errorCircle}>
                    <X size={12} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {identifierError && (
              <Text style={styles.errorHelperText}>{identifierError}</Text>
            )}
          </View>

          {/* ── Create Password Field ── */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Create Password</Text>
            <View
              style={[
                styles.inputContainer,
                passwordError ? styles.inputErrorBorder : null,
              ]}
            >
              <TextInput
                style={styles.textInput}
                placeholder="John1983"
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError(null);
                }}
                onBlur={handlePasswordBlur}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />

              {/* Right: Exactly ONE icon (Checkmark when valid & unmasked, Eye Toggle otherwise) */}
              {isPasswordValid && !passwordError && showPassword ? (
                <TouchableOpacity
                  onPress={() => setShowPassword(false)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <View style={styles.checkmarkCircle}>
                    <Check size={12} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <Eye size={20} color="rgba(96, 96, 102, 0.96)" strokeWidth={1.5} />
                  ) : (
                    <EyeOff size={20} color="rgba(96, 96, 102, 0.96)" strokeWidth={1.5} />
                  )}
                </TouchableOpacity>
              )}
            </View>

            {passwordError && (
              <Text style={styles.errorHelperText}>{passwordError}</Text>
            )}
          </View>

          {/* ── Forgotten Password Link ── */}
          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => console.log('Forgotten Password')}
            >
              <Text style={styles.forgotPasswordText}>Forgotten password?</Text>
            </TouchableOpacity>
          </View>

          {/* ── Login Action Button ── */}
          <TouchableOpacity
            style={styles.loginButton}
            activeOpacity={0.85}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          {/* ── Sign In With Divider (Line 97px + Label 81px + Line 97px) ── */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Sign In with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ── Social Sign In Options: Google & Apple (56x56 buttons, gap 80px) ── */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={styles.socialButton}
              activeOpacity={0.8}
              onPress={() => console.log('Google Sign In')}
            >
              <GoogleIcon size={24} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              activeOpacity={0.8}
              onPress={() => console.log('Apple Sign In')}
            >
              <AppleIcon size={24} />
            </TouchableOpacity>
          </View>

          {/* ── I don't have an account / Create Account ── */}
          <View style={styles.footerRow}>
            <Text style={styles.noAccountText}>I don’t have an account</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (onNavigateSignUp) {
                  onNavigateSignUp();
                } else {
                  router.push('/sign-up-business-owner' as any);
                }
              }}
            >
              <Text style={styles.createAccountLink}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* ── Application Terms & Condition ── */}
          <View style={styles.termsRow}>
            <Text style={styles.termsBaseText}>Application </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => console.log('View Terms')}
            >
              <Text style={styles.termsBlueText}>Terms</Text>
            </TouchableOpacity>
            <Text style={styles.termsBaseText}> and </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => console.log('View Condition')}
            >
              <Text style={styles.termsBlueText}>condition</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Country Picker Bottom Sheet Modal ── */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowCountryPicker(false)}
        >
          <Pressable
            style={[
              styles.countryBottomSheet,
              { paddingBottom: Math.max(insets.bottom, 24) },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Sheet Drag Pill */}
            <View style={styles.sheetHandle} />

            {/* Country Search Bar */}
            <View style={styles.countrySearchBox}>
              <Search size={18} color="rgba(96, 96, 102, 0.96)" />
              <TextInput
                style={styles.countrySearchInput}
                placeholder="Search country here..."
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                value={countrySearch}
                onChangeText={setCountrySearch}
                autoCapitalize="none"
              />
              {countrySearch.length > 0 && (
                <TouchableOpacity onPress={() => setCountrySearch('')}>
                  <X size={16} color="rgba(96, 96, 102, 0.96)" />
                </TouchableOpacity>
              )}
            </View>

            {/* Countries List */}
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => `${item.isoCode}-${item.code}`}
              style={styles.countriesList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItemRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedCountry(item);
                    setShowCountryPicker(false);
                  }}
                >
                  <View style={styles.countryItemLeft}>
                    <Text style={styles.countryFlagText}>{item.flag}</Text>
                    <Text style={styles.countryNameText}>{item.name}</Text>
                  </View>
                  <Text style={styles.countryCodeText}>{item.code}</Text>
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── 1:1 Figma Dommy Loader Screen Overlay (4-dot loader) ── */}
      <DommyLoader visible={isLoading} />

      {/* Android System Dock Barrier */}
      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </View>
  );
};

export default BusinessOwnerLoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  flexOne: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  /* ── Header ── */
  header: {
    width: 358,
    height: 96,
    alignItems: 'center',
    gap: 16,
    marginBottom: 40,
  },

  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    letterSpacing: 0.1,
    color: '#000000',
    includeFontPadding: false,
  },

  headerSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  /* ── Input Fields ── */
  fieldWrapper: {
    width: 358,
    gap: 16,
    marginBottom: 24,
  },

  fieldLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },

  inputContainer: {
    width: 358,
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  inputErrorBorder: {
    borderColor: '#CC2929',
  },

  textInput: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
    paddingVertical: 0,
    backgroundColor: 'transparent',
    includeFontPadding: false,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
          borderWidth: 0,
          boxShadow: 'none',
        } as any)
      : {}),
  },

  checkmarkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0C790C',
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#CC2929',
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorHelperText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
    color: '#CC2929',
    marginTop: -8,
    paddingHorizontal: 16,
    includeFontPadding: false,
  },

  /* ── Forgotten Password Link (Aligned Right) ── */
  forgotPasswordContainer: {
    width: 358,
    alignItems: 'flex-end',
    height: 32,
    justifyContent: 'center',
    marginBottom: 32,
  },

  forgotPasswordText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    textDecorationLine: 'underline',
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },

  /* ── Login Action Button ── */
  loginButton: {
    width: 358,
    height: 48,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },

  loginButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
  },

  /* ── Sign In With Divider ── */
  dividerRow: {
    width: 307,
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
  },

  dividerLine: {
    width: 97,
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },

  dividerText: {
    width: 81,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },

  /* ── Social Buttons ── */
  socialRow: {
    width: 192,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  socialButton: {
    width: 56,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Footer Row ── */
  footerRow: {
    width: 313,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },

  noAccountText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: '#141A33',
    includeFontPadding: false,
  },

  createAccountLink: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    textDecorationLine: 'underline',
    color: 'rgba(26, 130, 255, 0.9)',
    includeFontPadding: false,
  },

  /* ── Terms Row ── */
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 16,
    marginBottom: 16,
  },

  termsBaseText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: '#000000',
    includeFontPadding: false,
  },

  termsBlueText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(26, 130, 255, 0.9)',
    textDecorationLine: 'underline',
    includeFontPadding: false,
  },

  /* ── Modal & Country Picker Sheet ── */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 8, 20, 0.4)',
    justifyContent: 'flex-end',
  },

  countryBottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    maxHeight: '65%',
  },

  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(192, 192, 204, 0.6)',
    alignSelf: 'center',
    marginBottom: 16,
  },

  countrySearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 16,
  },

  countrySearchInput: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 15,
    color: '#000000',
    backgroundColor: 'transparent',
    includeFontPadding: false,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
          borderWidth: 0,
          boxShadow: 'none',
        } as any)
      : {}),
  },

  countriesList: {
    flexGrow: 0,
  },

  countryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.8)',
  },

  countryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  countryFlagText: {
    fontSize: 20,
  },

  countryNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    color: '#000814',
    includeFontPadding: false,
  },

  countryCodeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 15,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
});
