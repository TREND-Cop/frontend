/**
 * UserProfileScreen — Step 2 of the profile setup wizard.
 *
 * Flow: UserLocationScreen → UserProfileScreen → UserGenderScreen
 *
 * Features:
 * - Circular avatar placeholder with camera icon overlay
 * - "Tap the Circle to add image" instruction text
 * - Tapping the avatar opens a PhotoUploadSheet with two options
 * - "Choose from photos" uses expo-image-picker to open the photo library
 * - "Select from file" is stubbed as a TODO (document picker not in scope)
 * - "Next" button is always enabled (photo is optional)
 *
 * Uses shared components: ProfileSetupHeader, PhotoUploadSheet, PrimaryButton
 *
 * TODO (Backend): Upload the selected image URI to your server/CDN
 * and save the resulting URL to the user's profile.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, radius, spacing } from '../../constants/theme';
import { ProfileSetupHeader } from '../../components/ProfileSetupHeader';
import { PhotoUploadSheet } from '../../components/PhotoUploadSheet';
import { PrimaryButton } from '../../components/PrimaryButton';

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE PICKER HELPER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Attempts to use expo-image-picker to open the photo library.
 * Falls back to a console warning if the library isn't installed.
 *
 * TODO (Setup): Make sure `expo-image-picker` is installed:
 *   npx expo install expo-image-picker
 */
const launchImageLibrary = async (): Promise<string | null> => {
  try {
    const ImagePicker = require('expo-image-picker');

    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission required',
        'Please grant photo library access to upload a profile photo.'
      );
      return null;
    }

    // Launch the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1], // Square crop for avatar
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      return result.assets[0].uri;
    }
    return null;
  } catch {
    console.warn(
      'expo-image-picker not available. Run: npx expo install expo-image-picker'
    );
    Alert.alert(
      'Image picker not available',
      'Please install expo-image-picker to use this feature.'
    );
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const UserProfileScreen = ({ navigation }: { navigation?: any }) => {
  // ── State ───────────────────────────────────────────────────────────────
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────

  /**
   * Opens the device photo library via expo-image-picker.
   */
  const handleChoosePhoto = async () => {
    const uri = await launchImageLibrary();
    if (uri) {
      setProfileImageUri(uri);
    }
  };

  /**
   * Opens a file/document picker.
   * TODO (Feature): Implement document picker if needed in scope.
   * Could use `expo-document-picker` for this.
   */
  const handleSelectFile = () => {
    console.log('Select from file — TODO: implement document picker');
    Alert.alert('Coming soon', 'File selection is not yet implemented.');
  };

  /**
   * Navigate to the next step (UserGenderScreen).
   * Photo is optional, so this button is always enabled.
   */
  const handleNext = () => {
    if (navigation) {
      navigation.navigate('UserGender');
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
        title="Create a profile"
        subtitle="Add some style to your account"
        currentStep={2}
        totalSteps={4}
      />

      {/* ─── Avatar Section ───────────────────────────────────────── */}
      <View style={styles.avatarSection}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => setShowPhotoSheet(true)}
          activeOpacity={0.8}
        >
          {profileImageUri ? (
            // Show selected image
            <Image
              source={{ uri: profileImageUri }}
              style={styles.avatarImage}
            />
          ) : (
            // Show placeholder
            <View style={styles.avatarPlaceholder}>
              <Feather name="user" size={48} color="rgba(192, 192, 204, 0.96)" />
            </View>
          )}

          {/* Camera/Plus icon overlay (bottom-right of the circle) */}
          <View style={styles.cameraOverlay}>
            <Feather name="camera" size={16} color="rgba(0, 8, 20, 0.96)" />
          </View>
        </TouchableOpacity>

        {/* Instruction text */}
        <Text style={styles.tapText}>Tap the Circle to add image</Text>
      </View>

      {/* ─── Spacer to push button down ───────────────────────────── */}
      <View style={styles.spacer} />

      {/* ─── Next Button ──────────────────────────────────────────── */}
      <PrimaryButton
        title="Next"
        onPress={handleNext}
        disabled={false} // Photo is optional — button is always enabled
        currentStep={2}
      />

      {/* ─── Photo Upload Bottom Sheet ────────────────────────────── */}
      <PhotoUploadSheet
        visible={showPhotoSheet}
        onChoosePhoto={handleChoosePhoto}
        onSelectFile={handleSelectFile}
        onClose={() => setShowPhotoSheet(false)}
      />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const AVATAR_SIZE = 140;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
    paddingHorizontal: spacing.buttonPadding,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // ── Avatar Section ──────────────────────────────────────────────────────
  avatarSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatarContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  avatarImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  avatarPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(96, 96, 102, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraOverlay: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(247, 247, 247, 0.98)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapText: {
    ...typography.bodyRegular,
    color: colors.primarySupportText,
    textAlign: 'center',
  },

  // ── Spacer ──────────────────────────────────────────────────────────────
  spacer: {
    flex: 1,
  },
});
