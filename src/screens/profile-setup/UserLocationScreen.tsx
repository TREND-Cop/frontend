/**
 * UserLocationScreen — Step 1 of the profile setup wizard.
 *
 * Flow: SignUpScreen → UserLocationScreen → UserProfileScreen
 *
 * Features:
 * - Country picker (modal/bottom-sheet with search)
 * - State picker (depends on selected country)
 * - Residential address text input
 * - "Next" button disabled until all fields are filled
 *
 * Uses shared components: ProfileSetupHeader, SearchablePicker, FormInput, PrimaryButton
 *
 * NOTE: Country and state data is imported from the `country-state-city` package.
 * If that package isn't installed yet, run: npm install country-state-city
 * The data is tree-shakeable and provides ISO codes, names, and phone codes.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, typography, radius, spacing } from '../../constants/theme';
import { ProfileSetupHeader } from '../../components/ProfileSetupHeader';
import { SearchablePicker, PickerItem } from '../../components/SearchablePicker';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';

// ─────────────────────────────────────────────────────────────────────────────
// COUNTRY & STATE DATA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Try to import from the `country-state-city` package for real data.
 * If the package isn't installed, we fall back to a minimal stub dataset
 * so the screen still renders during development.
 *
 * TODO (Setup): Run `npm install country-state-city` to get the full dataset.
 */
let CountryData: any;
let StateData: any;

try {
  // Dynamic require — this will work once the package is installed
  const csc = require('country-state-city');
  CountryData = csc.Country;
  StateData = csc.State;
} catch {
  // Fallback stub data for development before the package is installed
  CountryData = {
    getAllCountries: () => [
      { name: 'Nigeria', isoCode: 'NG', flag: '🇳🇬' },
      { name: 'United States', isoCode: 'US', flag: '🇺🇸' },
      { name: 'United Kingdom', isoCode: 'GB', flag: '🇬🇧' },
      { name: 'India', isoCode: 'IN', flag: '🇮🇳' },
      { name: 'Germany', isoCode: 'DE', flag: '🇩🇪' },
      { name: 'France', isoCode: 'FR', flag: '🇫🇷' },
      { name: 'Canada', isoCode: 'CA', flag: '🇨🇦' },
      { name: 'Australia', isoCode: 'AU', flag: '🇦🇺' },
    ],
  };
  StateData = {
    getStatesOfCountry: (countryCode: string) => {
      // Minimal stub states for Nigeria
      if (countryCode === 'NG') {
        return [
          { name: 'Lagos', isoCode: 'LA' },
          { name: 'Abuja', isoCode: 'FC' },
          { name: 'Rivers', isoCode: 'RI' },
          { name: 'Oyo', isoCode: 'OY' },
        ];
      }
      return [{ name: 'State 1', isoCode: 'S1' }];
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const UserLocationScreen = ({ navigation }: { navigation?: any }) => {
  // ── Form State ──────────────────────────────────────────────────────────
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [selectedCountryName, setSelectedCountryName] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState('');
  const [selectedStateName, setSelectedStateName] = useState('');
  const [address, setAddress] = useState('');

  // ── Picker Visibility ───────────────────────────────────────────────────
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);

  // ── Validation State ────────────────────────────────────────────────────
  const [showErrors, setShowErrors] = useState(false);

  // ── Derived Data ────────────────────────────────────────────────────────

  /** Convert country data into PickerItem format for the SearchablePicker */
  const countryItems: PickerItem[] = useMemo(() => {
    return CountryData.getAllCountries().map((c: any) => ({
      label: c.name,
      value: c.isoCode,
      icon: c.flag || '🏳️',
    }));
  }, []);

  /** Convert state data (based on selected country) into PickerItem format */
  const stateItems: PickerItem[] = useMemo(() => {
    if (!selectedCountryCode) return [];
    return StateData.getStatesOfCountry(selectedCountryCode).map((s: any) => ({
      label: s.name,
      value: s.isoCode,
    }));
  }, [selectedCountryCode]);

  // All three fields must be filled to enable the "Next" button
  const formValid =
    selectedCountryCode.length > 0 &&
    selectedStateCode.length > 0 &&
    address.trim().length > 0;

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleCountrySelect = (value: string, label: string) => {
    setSelectedCountryCode(value);
    setSelectedCountryName(label);
    // Reset state when country changes (states depend on country)
    setSelectedStateCode('');
    setSelectedStateName('');
    setShowCountryPicker(false);
    if (showErrors && address.trim().length > 0 && selectedStateCode.length > 0) {
      // Opt-in: you could reset showErrors if they fix it, but standard forms usually let it live until submit
    }
  };

  const handleStateSelect = (value: string, label: string) => {
    setSelectedStateCode(value);
    setSelectedStateName(label);
    setShowStatePicker(false);
  };

  const handleNext = () => {
    if (!formValid) {
      setShowErrors(true);
      return;
    }
    if (navigation) {
      navigation.navigate('UserProfile');
    }
  };

  const handleBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

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
        <ProfileSetupHeader
          onBack={handleBack}
          title="Enter Your Location"
          subtitle="Your location will enable us connect you with places near you."
          currentStep={1}
          totalSteps={4}
        />

        {/* ─── Country Field (tappable, opens picker) ─────────────────── */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Country</Text>
          <TouchableOpacity
            style={[
              styles.pickerButton,
              showErrors && !selectedCountryCode && styles.pickerError
            ]}
            onPress={() => setShowCountryPicker(true)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.pickerText,
                !selectedCountryName && styles.pickerPlaceholder,
              ]}
            >
              {selectedCountryName || 'Select your country'}
            </Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
          {showErrors && !selectedCountryCode && (
            <Text style={styles.errorText}>Country is required</Text>
          )}
        </View>

        {/* ─── State Field (tappable, opens picker) ───────────────────── */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>State of Resident</Text>
          <TouchableOpacity
            style={[
              styles.pickerButton,
              !selectedCountryCode && styles.pickerDisabled,
              showErrors && !selectedStateCode && styles.pickerError
            ]}
            onPress={() => {
              if (selectedCountryCode) setShowStatePicker(true);
            }}
            activeOpacity={selectedCountryCode ? 0.7 : 1}
            disabled={!selectedCountryCode}
          >
            <Text
              style={[
                styles.pickerText,
                !selectedStateName && styles.pickerPlaceholder,
              ]}
            >
              {selectedStateName || (selectedCountryCode
                ? 'Select your state'
                : 'Select a country first')}
            </Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
          {showErrors && !selectedStateCode && (
            <Text style={styles.errorText}>State is required</Text>
          )}
        </View>

        {/* ─── Residential Address Field ──────────────────────────────── */}
        <FormInput
          label="Residential Address"
          value={address}
          onChangeText={setAddress}
          placeholder="Enter your residential address"
          error={!address.trim() ? 'Residential Address is required' : undefined}
          touched={showErrors}
        />

        {/* ─── Next Button (Pinned to bottom) ─────────────────────── */}
        <View style={{ marginTop: 'auto' }}>
          <PrimaryButton
            title="Next"
            onPress={handleNext}
            disabled={false}
            currentStep={1}
          />
        </View>
      </ScrollView>

      {/* ─── Country Picker Modal ───────────────────────────────────────── */}
      <SearchablePicker
        visible={showCountryPicker}
        title="Select Country"
        items={countryItems}
        selectedValue={selectedCountryCode}
        onSelect={handleCountrySelect}
        onClose={() => setShowCountryPicker(false)}
      />

      {/* ─── State Picker Modal ─────────────────────────────────────────── */}
      <SearchablePicker
        visible={showStatePicker}
        title="Select State"
        items={stateItems}
        selectedValue={selectedStateCode}
        onSelect={handleStateSelect}
        onClose={() => setShowStatePicker(false)}
      />
    </KeyboardAvoidingView>
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
    flexGrow: 1,
    paddingHorizontal: spacing.buttonPadding,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // ── Picker Fields ───────────────────────────────────────────────────────
  fieldContainer: {
    marginBottom: 40,
  },
  fieldLabel: {
    ...typography.labelMed,
    color: '#000000',
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.outlineBorders,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
  },
  pickerDisabled: {
    backgroundColor: 'rgba(235, 235, 245, 0.4)',
  },
  pickerError: {
    borderColor: colors.dangerVibrant,
  },
  pickerText: {
    ...typography.bodyRegular,
    color: '#000000',
  },
  pickerPlaceholder: {
    color: colors.iconInactive,
  },
  pickerArrow: {
    fontSize: 12,
    color: colors.primarySupportText,
  },
  errorText: {
    ...typography.caption,
    color: colors.dangerVibrant,
    marginTop: 6,
  },
});
