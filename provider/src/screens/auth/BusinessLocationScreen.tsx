import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Path } from 'react-native-svg';
import { Country as CountryData, State as StateData } from 'country-state-city';
import { StepProgressHeader } from '../../components/StepProgressHeader';
import { SelectionSheet, SelectionOption } from '../../components/SelectionSheet';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { useProviderOnboarding } from '../../context/ProviderOnboardingContext';

// ── 1:1 Vector arrow-down-01 Icon (24x24 in Figma) ──
function ChevronDownIcon({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9l6 6 6-6"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── 1:1 Gender SVG Icons from Figma ──
function ManIcon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="16 114 24 24" fill="none">
      <Path
        d="M30 118C30 119.105 29.1046 120 28 120C26.8954 120 26 119.105 26 118C26 116.895 26.8954 116 28 116C29.1046 116 30 116.895 30 118Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M32 126.5C32 124.614 32 123.672 31.4142 123.086C30.8284 122.5 29.8856 122.5 28 122.5C26.1144 122.5 25.1716 122.5 24.5858 123.086C24 123.672 24 124.614 24 126.5V128C24 128.943 24 129.414 24.2929 129.707C24.5858 130 25.0572 130 26 130V134C26 134.943 26 135.414 26.2929 135.707C26.5858 136 27.0572 136 28 136C28.9428 136 29.4142 136 29.7071 135.707C30 135.414 30 134.943 30 134V130C30.9428 130 31.4142 130 31.7071 129.707C32 129.414 32 128.943 32 128V126.5Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function WomanIcon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="16 195 24 24" fill="none">
      <Path
        d="M30 199C30 200.105 29.1046 201 28 201C26.8954 201 26 200.105 26 199C26 197.895 26.8954 197 28 197C29.1046 197 30 197.895 30 199Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M26.0002 211V215C26.0002 215.943 26.0002 216.414 26.2931 216.707C26.586 217 27.0574 217 28.0002 217C28.943 217 29.4144 217 29.7073 216.707C30.0002 216.414 30.0002 215.943 30.0002 215V211L30.2603 211.001C31.8127 211 32.5889 211 32.8927 210.515C33.1965 210.03 32.8312 209.373 32.1007 208.059L30.3008 204.824C29.8476 204.009 28.9628 203.5 27.9996 203.5C27.0368 203.5 26.1525 204.009 25.6994 204.824L23.8993 208.059C23.1688 209.373 22.8035 210.029 23.1073 210.515C23.4111 211 24.1873 211 25.7397 211.001L26.0002 211Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function UnisexIcon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="16 276 24 24" fill="none">
      <Path
        d="M35.4995 296V292.5C36.5856 292.5 37.1991 292.5 37.4186 292.026C37.6381 291.551 37.3953 290.903 36.9095 289.606L35.6676 286.289C35.2571 285.193 34.4179 284.5 33.5 284.5C32.5821 284.5 31.7429 285.193 31.3324 286.289L30.0905 289.606C29.6047 290.903 29.3619 291.551 29.5814 292.026C29.8009 292.5 30.4133 292.5 31.4995 292.5V296C31.4995 296.943 31.4995 297.414 31.7924 297.707C32.0853 298 32.5567 298 33.4995 298C34.4423 298 34.9137 298 35.2066 297.707C35.4995 297.414 35.4995 296.943 35.4995 296Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <Path
        d="M24.5 280C24.5 281.105 23.6046 282 22.5 282C21.3954 282 20.5 281.105 20.5 280C20.5 278.895 21.3954 278 22.5 278C23.6046 278 24.5 278.895 24.5 280Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M35.5 280C35.5 281.105 34.6046 282 33.5 282C32.3954 282 31.5 281.105 31.5 280C31.5 278.895 32.3954 278 33.5 278C34.6046 278 35.5 278.895 35.5 280Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M26.5 288.5C26.5 286.614 26.5 285.672 25.9142 285.086C25.3284 284.5 24.3856 284.5 22.5 284.5C20.6144 284.5 19.6716 284.5 19.0858 285.086C18.5 285.672 18.5 286.614 18.5 288.5V290.5C18.5 291.443 18.5 291.914 18.7929 292.207C19.0858 292.5 19.5572 292.5 20.5 292.5V296C20.5 296.943 20.5 297.414 20.7929 297.707C21.0858 298 21.5572 298 22.5 298C23.4428 298 23.9142 298 24.2071 297.707C24.5 297.414 24.5 296.943 24.5 296V292.5C25.4428 292.5 25.9142 292.5 26.2071 292.207C26.5 291.914 26.5 291.443 26.5 290.5V288.5Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export const BusinessLocationScreen: React.FC = () => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { location, setLocation } = useProviderOnboarding();

  // Local form state initialized from context (empty string on first load to display placeholder)
  const [country, setCountry] = useState(location.country || '');
  const [countryCode, setCountryCode] = useState(location.countryCode || '+234');
  const [countryIso, setCountryIso] = useState('NG');

  const [stateName, setStateName] = useState(location.state || '');
  const [address, setAddress] = useState(location.address || '');
  const [gender, setGender] = useState(location.gender || '');

  // Validation errors
  const [errors, setErrors] = useState<{
    country?: string;
    state?: string;
    address?: string;
    gender?: string;
  }>({});

  // Bottom sheets visibility
  const [showCountrySheet, setShowCountrySheet] = useState(false);
  const [showStateSheet, setShowStateSheet] = useState(false);
  const [showGenderSheet, setShowGenderSheet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Keyboard and scroll handling so inputs/buttons are never obscured
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      if (e?.endCoordinates?.height) {
        setKeyboardHeight(e.endCoordinates.height);
      }
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ── Country Options (Nigeria +234 pinned first) ──
  const countryOptions: SelectionOption[] = useMemo(() => {
    try {
      const all = CountryData.getAllCountries().map((c) => ({
        id: c.isoCode,
        label: c.name,
        subLabel: `+${c.phonecode.replace(/^\++/, '')}`,
        flag: c.flag,
      }));

      const nigeria = all.find((c) => c.id === 'NG') || {
        id: 'NG',
        label: 'Nigeria',
        subLabel: '+234',
        flag: '🇳🇬',
      };
      const rest = all.filter((c) => c.id !== 'NG').sort((a, b) => a.label.localeCompare(b.label));

      return [nigeria, ...rest];
    } catch {
      return [
        { id: 'NG', label: 'Nigeria', subLabel: '+234', flag: '🇳🇬' },
        { id: 'US', label: 'United States', subLabel: '+1', flag: '🇺🇸' },
        { id: 'GB', label: 'United Kingdom', subLabel: '+44', flag: '🇬🇧' },
      ];
    }
  }, []);

  // ── State Options for the Selected Country ──
  const stateOptions: SelectionOption[] = useMemo(() => {
    try {
      const states = StateData.getStatesOfCountry(countryIso);
      if (states && states.length > 0) {
        return states.map((s) => ({
          id: s.isoCode,
          label: s.name.endsWith('State') || s.name.includes('Abuja') || s.name.includes('Territory')
            ? s.name
            : `${s.name} State`,
        }));
      }
    } catch {
      // fallback
    }
    // Default Nigerian states from Figma spec
    return [
      { id: 'FC', label: 'F. C.T Abuja' },
      { id: 'ED', label: 'Edo State' },
      { id: 'LA', label: 'Lagos State' },
      { id: 'KN', label: 'Kano State' },
      { id: 'BN', label: 'Benue State' },
      { id: 'KD', label: 'Kaduna state' },
      { id: 'GO', label: 'Gombe State' },
    ];
  }, [countryIso]);

  // ── Gender Options (Male only, Female only, Unisex) ──
  const genderOptions: SelectionOption[] = useMemo(
    () => [
      { id: 'male_only', label: 'Male only', icon: <ManIcon size={24} /> },
      { id: 'female_only', label: 'Female only', icon: <WomanIcon size={24} /> },
      { id: 'unisex', label: 'Unisex', icon: <UnisexIcon size={24} /> },
    ],
    []
  );

  const handleNextPress = () => {
    const newErrors: typeof errors = {};
    if (!country.trim()) newErrors.country = 'Required';
    if (!stateName.trim()) newErrors.state = 'Required';
    if (!address.trim()) newErrors.address = 'Required';
    if (!gender.trim()) newErrors.gender = 'Required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLocation({
      country,
      countryCode,
      state: stateName,
      address: address.trim(),
      gender,
    });

    // Frame 8 style LoadingOverlay with mock delay
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      safeRouter.push('/business-photos' as any);
    }, 1000);
  };

  const handleBackPress = () => {
    safeRouter.back();
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.flexOne}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top, 24),
              paddingBottom:
                keyboardHeight > 0
                  ? keyboardHeight + 80
                  : Math.max(insets.bottom, 24) + 16,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* ── Unified Step Progress Header (Step 3 of 4) ── */}
          <StepProgressHeader
            currentStep={3}
            totalSteps={4}
            onBack={handleBackPress}
            marginBottom={34}
          />

          {/* ── Header Title & Subtitle (sign up header: gap: 16px, marginBottom: 40px) ── */}
          <View style={styles.titleSection}>
            <Text style={styles.screenTitle}>Enter business location</Text>
            <Text style={styles.screenSubtitle}>
              Add your business location to help clients find you easily.
            </Text>
          </View>

          {/* ── Form Fields: gap: 40px, marginBottom: 44px ── */}
          <View style={styles.formContainer}>
            {/* 1. Country Dropdown (top: 277px, height: 88px, gap: 16px) */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Country</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.dropdownInput,
                  errors.country ? styles.inputBorderError : null,
                ]}
                onPress={() => setShowCountrySheet(true)}
              >
                <Text
                  style={[
                    styles.inputText,
                    !country ? styles.placeholderText : null,
                  ]}
                  numberOfLines={1}
                >
                  {country || 'Eg. Nigeria'}
                </Text>
                <ChevronDownIcon size={24} color="rgba(0, 8, 20, 0.96)" />
              </TouchableOpacity>
              {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}
            </View>

            {/* 2. Region / State Dropdown (top: 405px, height: 88px, gap: 16px) */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Region / State</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.dropdownInput,
                  errors.state ? styles.inputBorderError : null,
                ]}
                onPress={() => setShowStateSheet(true)}
              >
                <Text
                  style={[
                    styles.inputText,
                    !stateName ? styles.placeholderText : null,
                  ]}
                  numberOfLines={1}
                >
                  {stateName || 'Eg. Abuja'}
                </Text>
                <ChevronDownIcon size={24} color="rgba(0, 8, 20, 0.96)" />
              </TouchableOpacity>
              {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
            </View>

            {/* 3. Business Address Text Input (top: 533px, height: 88px, gap: 16px) */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Business Address</Text>
              <View
                style={[
                  styles.textInputField,
                  errors.address ? styles.inputBorderError : null,
                ]}
              >
                <TextInput
                  style={styles.addressInput}
                  placeholder="Eg. Off 1124 Adamu Cresent,Jahi Abuja."
                  placeholderTextColor="rgba(192, 192, 204, 0.96)"
                  value={address}
                  onChangeText={(val) => {
                    setAddress(val);
                    if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
                  }}
                  onFocus={() => {
                    // Smoothly scroll address and fields into view above virtual keyboard
                    setTimeout(() => {
                      scrollViewRef.current?.scrollTo({ y: 280, animated: true });
                    }, 120);
                  }}
                  autoCapitalize="words"
                />
              </View>
              {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
            </View>

            {/* 4. What gender can use your business? Input (top: 661px, height: 88px, gap: 16px, NO CHEVRON ARROW) */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>What gender can use your business?</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.dropdownInput,
                  errors.gender ? styles.inputBorderError : null,
                ]}
                onPress={() => setShowGenderSheet(true)}
              >
                <Text
                  style={[
                    styles.inputText,
                    !gender ? styles.placeholderText : null,
                  ]}
                  numberOfLines={1}
                >
                  {gender || 'Eg. Male only'}
                </Text>
              </TouchableOpacity>
              {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
            </View>
          </View>

          {/* ── Next Button (358px x 48px, radius 24px, 44px below gender field) ── */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.nextButton}
            onPress={handleNextPress}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Reusable SelectionSheet: Country ── */}
      <SelectionSheet
        visible={showCountrySheet}
        searchPlaceholder="Search country here.."
        options={countryOptions}
        selectedId={countryIso}
        onSelect={(opt) => {
          setCountry(opt.label);
          if (opt.subLabel) setCountryCode(opt.subLabel);
          setCountryIso(opt.id);
          setStateName(''); // Reset state when country changes
          if (errors.country) setErrors((prev) => ({ ...prev, country: undefined }));
        }}
        onClose={() => setShowCountrySheet(false)}
      />

      {/* ── Reusable SelectionSheet: Region / State ── */}
      <SelectionSheet
        visible={showStateSheet}
        searchPlaceholder="Search state here.."
        options={stateOptions}
        selectedId={stateName}
        onSelect={(opt) => {
          setStateName(opt.label);
          if (errors.state) setErrors((prev) => ({ ...prev, state: undefined }));
        }}
        onClose={() => setShowStateSheet(false)}
      />

      {/* ── Reusable SelectionSheet: Gender ── */}
      <SelectionSheet
        visible={showGenderSheet}
        title="What gender can use your business?"
        options={genderOptions}
        selectedId={genderOptions.find((g) => g.label === gender)?.id}
        onSelect={(opt) => {
          setGender(opt.label);
          if (errors.gender) setErrors((prev) => ({ ...prev, gender: undefined }));
        }}
        onClose={() => setShowGenderSheet(false)}
      />

      {/* ── LoadingOverlay (Frame 8 4-Dot Animation) ── */}
      <LoadingOverlay visible={isLoading} dotsCount={4} paddingTop={429} />

      {/* Android System Dock Barrier */}
      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </View>
  );
};

export default BusinessLocationScreen;

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

  /* Title Section: sign up header (top: 141px, height: 96px, gap: 16px, marginBottom: 40px) */
  titleSection: {
    width: '100%',
    maxWidth: 358,
    gap: 16,
    marginBottom: 40,
  },
  screenTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.1,
    color: '#141A33',
    includeFontPadding: false,
  },
  screenSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  /* Form Container: 4 fields with 40px gap between fields, 44px margin to Next button */
  formContainer: {
    width: '100%',
    maxWidth: 358,
    gap: 40,
    marginBottom: 44,
  },
  fieldBlock: {
    width: '100%',
    gap: 16,
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
  dropdownInput: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  textInputField: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addressInput: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
    width: '100%',
    includeFontPadding: false,
  },
  inputText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    flex: 1,
    includeFontPadding: false,
  },
  placeholderText: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  inputBorderError: {
    borderColor: '#CC2929',
  },
  errorText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    color: '#CC2929',
    marginTop: 4,
    paddingHorizontal: 4,
  },

  /* Next Button (Filled action Button: 358x48px, radius 24px, hard shadow) */
  nextButton: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.04)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  nextButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});
