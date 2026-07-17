/**
 * UserGenderScreen — Step 3 of the profile setup wizard.
 *
 * Flow: UserProfileScreen → UserGenderScreen → UsernameScreen
 *
 * Features:
 * - Two radio-style options: "Male" and "Female" (single select)
 * - "Next" button disabled until one is selected
 * - Clean, minimal layout matching the Figma design
 *
 * Uses shared components: ProfileSetupHeader, PrimaryButton
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, radius, spacing } from '../../constants/theme';
import { ProfileSetupHeader } from '../../components/ProfileSetupHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';

// ─────────────────────────────────────────────────────────────────────────────
// GENDER OPTIONS
// TODO (Product): If you need to add more gender options in the future,
// simply add entries to this array — the UI will adapt automatically.
// ─────────────────────────────────────────────────────────────────────────────

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male', icon: 'male' },
  { value: 'female', label: 'Female', icon: 'female' },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const UserGenderScreen = ({ navigation }: { navigation?: any }) => {
  // ── State ───────────────────────────────────────────────────────────────
  const [selectedGender, setSelectedGender] = useState<string | null>(null);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (!selectedGender) return;
    if (navigation) {
      navigation.navigate('Username');
    }
  };

  const handleBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <ProfileSetupHeader
        onBack={handleBack}
        title="Add Your Gender"
        subtitle="This helps us make recommendations for you."
        currentStep={3}
        totalSteps={4}
      />

      {/* ─── Gender Radio Options ─────────────────────────────────── */}
      <View style={styles.optionsContainer}>
        {GENDER_OPTIONS.map((option) => {
          const isSelected = selectedGender === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionRow,
                isSelected && styles.optionRowSelected,
              ]}
              onPress={() => setSelectedGender(option.value)}
              activeOpacity={0.7}
            >
              {/* Left Side: Icon + Label */}
              <View style={styles.optionLeft}>
                <Ionicons 
                  name={option.icon as any} 
                  size={16} 
                  color="rgba(96, 96, 102, 0.96)" 
                  style={styles.genderIcon} 
                />
                <Text
                  style={[
                    styles.optionLabel,
                    isSelected && styles.optionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </View>

              {/* Right Side: Radio Circle / Checkmark */}
              {isSelected ? (
                <Ionicons name="checkmark-circle" size={24} color="rgba(0, 8, 20, 0.96)" />
              ) : (
                <View style={styles.radioOuter} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ─── Spacer to push button down ───────────────────────────── */}
      <View style={styles.spacer} />

      {/* ─── Next Button ──────────────────────────────────────────── */}
      <PrimaryButton
        title="Next"
        onPress={handleNext}
        disabled={!selectedGender}
        currentStep={3}
      />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
    paddingHorizontal: spacing.buttonPadding,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // ── Options ─────────────────────────────────────────────────────────────
  optionsContainer: {
    gap: 32,
    marginTop: 24, // Add some top margin to separate from the header
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 72,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },
  optionRowSelected: {
    borderColor: 'rgba(0, 8, 20, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  genderIcon: {
    marginRight: 4,
  },

  // ── Radio Button ────────────────────────────────────────────────────────
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 192, 204, 0.96)',
  },

  // ── Labels ──────────────────────────────────────────────────────────────
  optionLabel: {
    ...typography.bodyRegular,
    color: '#000000',
  },
  optionLabelSelected: {
    ...typography.bodyRegular, // Removing bold for selected, as Figma uses body regular for both
    color: '#000000',
  },

  // ── Spacer ──────────────────────────────────────────────────────────────
  spacer: {
    flex: 1,
  },
});
