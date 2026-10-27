import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { Country as CountryData, State as StateData } from 'country-state-city';
import { useEditProfileDraft } from '../../context/EditProfileDraftContext';
import { SelectionSheet, SelectionOption } from '../../components/SelectionSheet';
import { ProviderCountryPickerSheet, CountryItem } from '../../components/ProviderCountryPickerSheet';
import { OperatingDaysBottomSheet } from '../../components/OperatingDaysBottomSheet';
import { OperatingHoursWheelSheet } from '../../components/OperatingHoursWheelSheet';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { PREVIEW_PLACEHOLDER_ROUTE } from '../../constants/editProfile.config';

// ── Typography constants conforming to Master Typography Mandate ──
const FONT_MEDIUM = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_500Medium',
  default: 'DMSans_500Medium',
});

const FONT_REGULAR = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_400Regular',
  default: 'DMSans_400Regular',
});

const FONT_BUTTON = Platform.select({
  ios: 'Inter',
  android: 'Inter_500Medium',
  default: 'Inter_500Medium',
});

// ── Vector Icons ──
function ArrowLeftIcon({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.57 5.93L3.5 12l6.07 6.07M20.5 12H3.67"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function AlertIcon({ size = 20, color = 'rgba(248, 155, 24, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
      <Path d="M12 7.5v6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="12" cy="16.5" r="0.75" fill={color} stroke={color} strokeWidth="0.5" />
    </Svg>
  );
}

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
        d="M24.5 280C24.5 281.105 23.6046 282 22.5 282C21.3954 282 20.5 281.105 20.5 280C20.5 278.895 21.3954 278 22.5 278C23.6046 278 24.5 278.895 24.5 280Z"
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
      <Path
        d="M35.5 280C35.5 281.105 34.6046 282 33.5 282C32.3954 282 31.5 281.105 31.5 280C31.5 278.895 32.3954 278 33.5 278C34.6046 278 35.5 278.895 35.5 280Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M35.4995 296V292.5C36.5856 292.5 37.1991 292.5 37.4186 292.026C37.6381 291.551 37.3953 290.903 36.9095 289.606L35.6676 286.289C35.2571 285.193 34.4179 284.5 33.5 284.5C32.5821 284.5 31.7429 285.193 31.3324 286.289L30.0905 289.606C29.6047 290.903 29.3619 291.551 29.5814 292.026C29.8009 292.5 30.4133 292.5 31.4995 292.5V296C31.4995 296.943 31.4995 297.414 31.7924 297.707C32.0853 298 32.5567 298 33.4995 298C34.4423 298 34.9137 298 35.2066 297.707C35.4995 297.414 35.4995 296.943 35.4995 296Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Operating Days Presets (Frame E4)
const OPERATING_DAYS_PRESETS: SelectionOption[] = [
  { id: 'mon_wed', label: 'Monday - Wednesday' },
  { id: 'tue_fri', label: 'Tuesday - Friday' },
  { id: 'mon_sun_thu', label: 'Monday - Sunday - Thursday' },
];

// Operating Hours Presets (Frame E4)
const OPERATING_HOURS_PRESETS: SelectionOption[] = [
  { id: '8am_11pm', label: '8:00am - 11:00pm' },
  { id: '8am_830pm', label: '8:00am - 8:30pm' },
  { id: '930am_1130am', label: '9:30am - 11:30am' },
];

// Gender Options (Frame E4)
const GENDER_OPTIONS: SelectionOption[] = [
  { id: 'male_only', label: 'Male only', icon: <ManIcon size={24} /> },
  { id: 'female_only', label: 'Female only', icon: <WomanIcon size={24} /> },
  { id: 'unisex', label: 'Unisex', icon: <UnisexIcon size={24} /> },
];

export const EditBusinessProfileScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    workingCopy,
    updateField,
    setWorkingCopy,
    isDirty,
    isValid,
    isNameLocked,
    nameLockDaysRemaining,
    isSaving,
    saveDraft,
  } = useEditProfileDraft();

  // Bottom sheets state
  const [showDaysSheet, setShowDaysSheet] = useState(false);
  const [showCustomDaysSheet, setShowCustomDaysSheet] = useState(false);
  const [showHoursSheet, setShowHoursSheet] = useState(false);
  const [showHoursWheelSheet, setShowHoursWheelSheet] = useState(false);
  const [showCountrySheet, setShowCountrySheet] = useState(false);
  const [showStateSheet, setShowStateSheet] = useState(false);
  const [showGenderSheet, setShowGenderSheet] = useState(false);

  // Android hardware back handler: discards working copy and returns to dashboard
  useEffect(() => {
    const onBackPress = () => {
      router.back();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [router]);

  // Handle back button press
  const handleBack = () => {
    router.back();
  };

  // State options derived from country selection
  const stateOptions: SelectionOption[] = useMemo(() => {
    try {
      // Find ISO code for selected country
      const allCountries = CountryData.getAllCountries();
      const match = allCountries.find(
        (c) => c.name.toLowerCase() === (workingCopy.country || 'Nigeria').toLowerCase()
      );
      const iso = match ? match.isoCode : 'NG';
      const states = StateData.getStatesOfCountry(iso);
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

    return [
      { id: 'FC', label: 'F.C.T Abuja' },
      { id: 'ED', label: 'Edo State' },
      { id: 'LA', label: 'Lagos State' },
      { id: 'KN', label: 'Kano State' },
      { id: 'BN', label: 'Benue State' },
      { id: 'KD', label: 'Kaduna state' },
      { id: 'GO', label: 'Gombe State' },
    ];
  }, [workingCopy.country]);

  // Country select handler (clears state per requirement)
  const handleSelectCountry = (countryItem: CountryItem) => {
    setWorkingCopy((prev) => ({
      ...prev,
      country: countryItem.name,
      countryCode: countryItem.code,
      state: '',
    }));
    setShowCountrySheet(false);
  };

  // State select handler
  const handleSelectState = (opt: SelectionOption) => {
    updateField('state', opt.label);
    setShowStateSheet(false);
  };

  // Gender select handler
  const handleSelectGender = (opt: SelectionOption) => {
    updateField('gender', opt.label);
    setShowGenderSheet(false);
  };

  // Days preset select handler
  const handleSelectDaysPreset = (opt: SelectionOption) => {
    updateField('operatingDays', opt.label);
    setShowDaysSheet(false);
  };

  // Days wheel / multi-day picker confirm handler
  const handleCustomDaysConfirm = (formatted: string) => {
    updateField('operatingDays', formatted);
    setShowCustomDaysSheet(false);
  };

  // Hours preset select handler
  const handleSelectHoursPreset = (opt: SelectionOption) => {
    updateField('operatingHours', opt.label);
    setShowHoursSheet(false);
  };

  // Hours custom wheel confirm handler
  const handleHoursWheelConfirm = (rangeFormatted: string) => {
    updateField('operatingHours', rangeFormatted);
    setShowHoursWheelSheet(false);
  };

  // Save changes handler
  const handleSavePress = () => {
    if (!isDirty || !isValid || isSaving) return;
    saveDraft();
  };

  // Preview changes handler (navigates to preview route without saving)
  const handlePreviewPress = () => {
    if (!isDirty) return;
    router.push(PREVIEW_PLACEHOLDER_ROUTE as any);
  };

  // Selected operating days parsed to array for the custom days sheet
  const selectedDaysArray = useMemo(() => {
    if (!workingCopy.operatingDays) return [];
    return workingCopy.operatingDays
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [workingCopy.operatingDays]);

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="dark" />

      {/* ── Fixed Page Header (height: 64px, padding: 8px 16px) ── */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back to dashboard"
          >
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            Edit Business Profile
          </Text>

          <View style={styles.headerRightSpacer} />
        </View>
      </View>

      {/* ── Scrollable Body Content ── */}
      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: Math.max(insets.bottom, 24) + 40,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Intro Text ── */}
          <Text style={styles.introText}>
            Business Profile controls the information about your business that clients see on Trend, e.g. your business name.
          </Text>

          {/* ── Section 1: Business information ── */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Business information</Text>
              <Text style={styles.sectionSubtitle}>
                Edit information about your business, but note your business name can only be changed once in 6 months.
              </Text>
            </View>

            {/* Field 1: Business Name */}
            <View style={styles.inputFieldContainer}>
              <TextInput
                style={[
                  styles.textInput,
                  isNameLocked && styles.textInputDisabled,
                  !workingCopy.businessName && styles.textInputPlaceholder,
                ]}
                value={workingCopy.businessName}
                onChangeText={(val) => updateField('businessName', val)}
                placeholder="Business name"
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                editable={!isNameLocked}
                accessibilityLabel={
                  isNameLocked
                    ? `Business name, ${workingCopy.businessName || 'Business name'}, locked from editing`
                    : `Business name, ${workingCopy.businessName || 'Business name'}`
                }
                accessibilityState={{ disabled: isNameLocked }}
              />
              <View style={styles.underline} />
            </View>

            {/* Field 2: Operating Hours */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.inputFieldContainer}
              onPress={() => setShowHoursSheet(true)}
              accessibilityRole="button"
              accessibilityLabel={`Operating hours, ${workingCopy.operatingHours || 'Operating hours'}`}
            >
              <Text
                style={[
                  styles.readOnlyText,
                  !workingCopy.operatingHours && styles.readOnlyPlaceholder,
                ]}
                numberOfLines={1}
              >
                {workingCopy.operatingHours || 'Operating hours'}
              </Text>
              <View style={styles.underline} />
            </TouchableOpacity>

            {/* Field 3: Operating Days */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.inputFieldContainer}
              onPress={() => setShowDaysSheet(true)}
              accessibilityRole="button"
              accessibilityLabel={`Operating days, ${workingCopy.operatingDays || 'Operating days'}`}
            >
              <Text
                style={[
                  styles.readOnlyText,
                  !workingCopy.operatingDays && styles.readOnlyPlaceholder,
                ]}
                numberOfLines={1}
              >
                {workingCopy.operatingDays || 'Operating days'}
              </Text>
              <View style={styles.underline} />
            </TouchableOpacity>
          </View>

          {/* ── Section 2: Location ── */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Location</Text>
              <Text style={styles.sectionSubtitle}>
                Location. This section shows your business address and how clients can find you.
              </Text>
            </View>

            {/* Field 4: Business Address */}
            <View style={[styles.inputFieldContainer, styles.addressFieldContainer]}>
              <TextInput
                style={[
                  styles.textInput,
                  styles.multilineTextInput,
                  !workingCopy.address && styles.textInputPlaceholder,
                ]}
                value={workingCopy.address}
                onChangeText={(val) => updateField('address', val)}
                placeholder="Business address"
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                multiline
                numberOfLines={2}
                accessibilityLabel={`Business address, ${workingCopy.address || 'Business address'}`}
              />
              <View style={styles.underline} />
            </View>

            {/* Field 5: Country */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.inputFieldContainer}
              onPress={() => setShowCountrySheet(true)}
              accessibilityRole="button"
              accessibilityLabel={`Country, ${workingCopy.country || 'Country'}`}
            >
              <Text
                style={[
                  styles.readOnlyText,
                  !workingCopy.country && styles.readOnlyPlaceholder,
                ]}
                numberOfLines={1}
              >
                {workingCopy.country || 'Country'}
              </Text>
              <View style={styles.underline} />
            </TouchableOpacity>

            {/* Field 6: Region / State */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.inputFieldContainer}
              onPress={() => setShowStateSheet(true)}
              accessibilityRole="button"
              accessibilityLabel={`Region or State, ${workingCopy.state || 'Region / State'}`}
            >
              <Text
                style={[
                  styles.readOnlyText,
                  !workingCopy.state && styles.readOnlyPlaceholder,
                ]}
                numberOfLines={1}
              >
                {workingCopy.state || 'Region / State'}
              </Text>
              <View style={styles.underline} />
            </TouchableOpacity>

            {/* Field 7: What gender can use your business? */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.inputFieldContainer}
              onPress={() => setShowGenderSheet(true)}
              accessibilityRole="button"
              accessibilityLabel={`What gender can use your business?, ${workingCopy.gender || 'What gender can use your business?'}`}
            >
              <Text
                style={[
                  styles.readOnlyText,
                  !workingCopy.gender && styles.readOnlyPlaceholder,
                ]}
                numberOfLines={1}
              >
                {workingCopy.gender || 'What gender can use your business?'}
              </Text>
              <View style={styles.underline} />
            </TouchableOpacity>
          </View>

          {/* ── Business Name Lock Notice (Frame E3) ── */}
          {isNameLocked && (
            <View
              style={styles.nameLockBanner}
              accessibilityRole="alert"
              accessibilityLabel={`Notice: You can change your business name again in ${nameLockDaysRemaining} days.`}
            >
              <View style={styles.alertIconCircle}>
                <AlertIcon size={20} />
              </View>
              <Text style={styles.nameLockBannerText}>
                You can change your business name again in {nameLockDaysRemaining} days.
              </Text>
            </View>
          )}

          {/* ── Action Buttons (at the end of scroll content per note) ── */}
          <View style={styles.actionButtonsContainer}>
            {/* Save changes button */}
            <TouchableOpacity
              activeOpacity={isDirty && isValid ? 0.85 : 1}
              style={[
                styles.actionButton,
                isDirty && isValid ? styles.saveButtonActive : styles.actionButtonDisabled,
              ]}
              onPress={handleSavePress}
              disabled={!isDirty || !isValid || isSaving}
              accessibilityRole="button"
              accessibilityState={{ disabled: !isDirty || !isValid }}
              accessibilityLabel="Save changes"
            >
              <Text
                style={[
                  styles.actionButtonText,
                  isDirty && isValid
                    ? styles.saveButtonTextActive
                    : styles.actionButtonTextDisabled,
                ]}
              >
                Save changes
              </Text>
            </TouchableOpacity>

            {/* Preview changes button */}
            <TouchableOpacity
              activeOpacity={isDirty ? 0.85 : 1}
              style={[
                styles.actionButton,
                isDirty ? styles.previewButtonActive : styles.actionButtonDisabled,
              ]}
              onPress={handlePreviewPress}
              disabled={!isDirty}
              accessibilityRole="button"
              accessibilityState={{ disabled: !isDirty }}
              accessibilityLabel="Preview changes"
            >
              <Text
                style={[
                  styles.actionButtonText,
                  isDirty
                    ? styles.previewButtonTextActive
                    : styles.actionButtonTextDisabled,
                ]}
              >
                Preview changes
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <NativeDockSpacer />

      {/* ── Frame E5 Dimmed Saving Overlay (4 dots) ── */}
      <LoadingOverlay
        visible={isSaving}
        dotsCount={4}
        dotSize={16}
        dotGap={20}
        paddingTop={429}
        overlayOpacity={0.1}
      />

      {/* ── Sheet 1: Country Picker Sheet ── */}
      <ProviderCountryPickerSheet
        visible={showCountrySheet}
        selectedCode={workingCopy.countryCode || '+234'}
        onSelect={handleSelectCountry}
        onClose={() => setShowCountrySheet(false)}
      />

      {/* ── Sheet 2: Region / State Picker Sheet ── */}
      <SelectionSheet
        visible={showStateSheet}
        title="State of Resident"
        searchPlaceholder="Search state here..."
        options={stateOptions}
        selectedId={stateOptions.find((s) => s.label.toLowerCase() === workingCopy.state.toLowerCase())?.id}
        onSelect={handleSelectState}
        onClose={() => setShowStateSheet(false)}
      />

      {/* ── Sheet 3: Gender Sheet ── */}
      <SelectionSheet
        visible={showGenderSheet}
        title="What gender can use your business?"
        options={GENDER_OPTIONS}
        selectedId={GENDER_OPTIONS.find((g) => g.label.toLowerCase() === workingCopy.gender.toLowerCase())?.id}
        onSelect={handleSelectGender}
        onClose={() => setShowGenderSheet(false)}
      />

      {/* ── Sheet 4: Business Operating Days (Presets + Custom Action) ── */}
      <SelectionSheet
        visible={showDaysSheet}
        title="Business Operating Days"
        options={OPERATING_DAYS_PRESETS}
        selectedId={OPERATING_DAYS_PRESETS.find((d) => d.label === workingCopy.operatingDays)?.id}
        onSelect={handleSelectDaysPreset}
        onClose={() => setShowDaysSheet(false)}
        showConfirmButton={true}
        confirmButtonLabel="Confirm"
        onConfirm={(opt) => {
          if (opt) updateField('operatingDays', opt.label);
        }}
        customActionLabel="Enter custom operating days"
        onCustomActionPress={() => {
          setShowDaysSheet(false);
          setShowCustomDaysSheet(true);
        }}
      />

      {/* ── Sheet 4b: Custom Operating Days Sheet (Reused multi-day sheet) ── */}
      <OperatingDaysBottomSheet
        visible={showCustomDaysSheet}
        selectedDays={selectedDaysArray}
        onConfirm={handleCustomDaysConfirm}
        onClose={() => setShowCustomDaysSheet(false)}
      />

      {/* ── Sheet 5: Business Operating Hours (Presets + Wheel Action) ── */}
      <SelectionSheet
        visible={showHoursSheet}
        title="Business Operating Hours"
        options={OPERATING_HOURS_PRESETS}
        selectedId={OPERATING_HOURS_PRESETS.find((h) => h.label === workingCopy.operatingHours)?.id}
        onSelect={handleSelectHoursPreset}
        onClose={() => setShowHoursSheet(false)}
        showConfirmButton={true}
        confirmButtonLabel="Confirm"
        onConfirm={(opt) => {
          if (opt) updateField('operatingHours', opt.label);
        }}
        customActionLabel="Enter custom operating hours"
        onCustomActionPress={() => {
          setShowHoursSheet(false);
          setShowHoursWheelSheet(true);
        }}
      />

      {/* ── Sheet 5b: Operating Hours Wheel Sheet (Reused time-wheel) ── */}
      <OperatingHoursWheelSheet
        visible={showHoursWheelSheet}
        onConfirm={handleHoursWheelConfirm}
        onClose={() => setShowHoursWheelSheet(false)}
      />
    </View>
  );
};

export default EditBusinessProfileScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flexOne: {
    flex: 1,
  },
  /* ── Header: height 64px, padding: 8px 16px ── */
  headerContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
  },
  headerContent: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  headerRightSpacer: {
    width: 48,
    height: 48,
    opacity: 0,
  },
  /* ── Scroll Area ── */
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 40,
  },
  /* ── Intro Text: 14px SF Pro 400, line-height 20px, letter-spacing 0.4px ── */
  introText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  /* ── Section Block ── */
  sectionBlock: {
    width: '100%',
    gap: 40,
  },
  sectionHeader: {
    gap: 8,
  },
  /* H2 Med: 20px 500, line-height 28px, letter-spacing 0.2px, #000000 */
  sectionTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    includeFontPadding: false,
  },
  /* Label: 14px 400, line-height 20px, letter-spacing 0.4px */
  sectionSubtitle: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  /* ── Underline Input Field ── */
  inputFieldContainer: {
    width: '100%',
    gap: 16,
  },
  addressFieldContainer: {
    minHeight: 64,
  },
  textInput: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    padding: 0,
    margin: 0,
    includeFontPadding: false,
  },
  multilineTextInput: {
    minHeight: 48,
    textAlignVertical: 'top',
  },
  textInputPlaceholder: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  textInputDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  readOnlyText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  readOnlyPlaceholder: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  underline: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },
  /* ── Name Lock Banner (Frame E3) ── */
  nameLockBanner: {
    width: '100%',
    minHeight: 80,
    backgroundColor: 'rgba(246, 240, 230, 0.96)',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(133, 139, 148, 0.1)',
        shadowOffset: { width: 4, height: 10 },
        shadowOpacity: 1,
        shadowRadius: 24,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '4px 10px 24px rgba(133, 139, 148, 0.08)',
      },
    }),
  },
  alertIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameLockBannerText: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(248, 155, 24, 0.96)',
    includeFontPadding: false,
  },
  /* ── Bottom Action Buttons ── */
  actionButtonsContainer: {
    width: '100%',
    gap: 16,
    paddingTop: 16,
  },
  actionButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  saveButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(133, 139, 148, 0.16)',
        shadowOffset: { width: 4, height: 10 },
        shadowOpacity: 1,
        shadowRadius: 24,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '4px 10px 24px rgba(133, 139, 148, 0.12)',
      },
    }),
  },
  previewButtonActive: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
  },
  actionButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    includeFontPadding: false,
  },
  actionButtonTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  saveButtonTextActive: {
    color: '#FFFFFF',
  },
  previewButtonTextActive: {
    color: 'rgba(0, 8, 20, 0.96)',
  },
});
