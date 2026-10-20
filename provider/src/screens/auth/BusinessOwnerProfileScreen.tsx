import React, { useState, useCallback } from 'react';
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { StepProgressHeader } from '../../components/StepProgressHeader';
import { ProviderPhotoUploadSheet } from '../../components/ProviderPhotoUploadSheet';
import { DommyLoader } from '../../components/DommyLoader';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { useProviderOnboarding } from '../../context/ProviderOnboardingContext';

/**
 * Requirement from prompt:
 * Profile photo required or optional is not specified in Figma.
 * Put it behind a single constant PROFILE_PHOTO_REQUIRED = false.
 */
export const PROFILE_PHOTO_REQUIRED = false;

// ── 1:1 Vector camera-01 Icon inside Camera Badge ──
function CameraBadgeIcon({ size = 16, color = '#000814' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 7a2 2 0 012-2h2.5l1.5-2h8l1.5 2H20a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V7z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 17a4 4 0 100-8 4 4 0 000 8z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── 1:1 Vector user Placeholder Icon (88x88, stroke 1.5px #c0c0cc) ──
function UserPlaceholderIcon({ size = 72, color = '#C0C0CC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 88 88" fill="none">
      {/* Head */}
      <Path
        d="M44 48c10.1 0 18.3-8.2 18.3-18.3S54.1 11.4 44 11.4 25.7 19.6 25.7 29.7 33.9 48 44 48z"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Shoulders */}
      <Path
        d="M18.3 75.2c0-12.8 11.5-23.2 25.7-23.2s25.7 10.4 25.7 23.2"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export interface BusinessOwnerProfileScreenProps {
  onNext?: (profileData: { fullName: string; photoUri: string | null }) => void;
  onBack?: () => void;
}

export const BusinessOwnerProfileScreen: React.FC<BusinessOwnerProfileScreenProps> = ({
  onNext,
  onBack,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ phone?: string; countryCode?: string }>();
  const { setOwnerProfile } = useProviderOnboarding();

  // ── Form State ──
  const [fullName, setFullName] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [fullNameError, setFullNameError] = useState<string | null>(null);

  // ── Bottom Sheet & Loading State (Frame 8) ──
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ── Backend Profile Save Stub ──
  // TODO (Backend): Persist business owner profile info to provider backend/database.
  const onSaveBusinessProfile = useCallback(
    async (payload: { fullName: string; photoUri: string | null; phone?: string }) => {
      // Stubbed backend submission
    },
    []
  );

  // ── Image Picker Handler ──
  const handleChoosePhotos = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      // Handled gracefully
    } finally {
      setShowPhotoSheet(false);
    }
  };

  const handleOpenCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      // Handled gracefully
    } finally {
      setShowPhotoSheet(false);
    }
  };

  const handleSelectFile = () => {
    // TODO: Select from file document picker
    setShowPhotoSheet(false);
  };

  // ── Submit / Next Handler ──
  const handleNextPress = useCallback(async () => {
    const trimmedName = fullName.trim();

    if (!trimmedName) {
      setFullNameError('Please enter your full name');
      return;
    }

    if (PROFILE_PHOTO_REQUIRED && !photoUri) {
      setFullNameError('Please upload a profile photo');
      return;
    }

    setFullNameError(null);

    // Trigger Frame 8 Dimmed Loading State
    setIsLoading(true);

    try {
      await onSaveBusinessProfile({
        fullName: trimmedName,
        photoUri,
        phone: params.phone,
      });

      if (onNext) {
        onNext({ fullName: trimmedName, photoUri });
      } else {
        setOwnerProfile({
          fullName: trimmedName,
          photoUri,
          phone: params.phone,
          countryCode: params.countryCode,
        });
        setTimeout(() => {
          setIsLoading(false);
          router.push('/business-name' as any);
        }, 1000);
      }
    } catch {
      setIsLoading(false);
    }
  }, [fullName, photoUri, params.phone, params.countryCode, onSaveBusinessProfile, onNext, setOwnerProfile, router]);

  const handleBackPress = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
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
              paddingTop: Math.max(insets.top + 8, 20),
              paddingBottom: Math.max(insets.bottom + 16, 24),
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topContent}>
            {/* ── Unified Step Progress Header (Step 1 of 4) ── */}
            <StepProgressHeader
              currentStep={1}
              totalSteps={4}
              onBack={handleBackPress}
              marginBottom={40}
            />

            {/* ── Title and Subtitle (358px x 96px, gap: 16px) ── */}
            <View style={styles.titleSection}>
              <Text style={styles.screenTitle}>Business owner profile</Text>
              <Text style={styles.screenSubtitle}>
                Just a few details so we can recognize you as the official owner of your business.
              </Text>
            </View>

            {/* ── Circular Profile Avatar Area ── */}
            <View style={styles.avatarSection}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.avatarTouchArea}
                onPress={() => setShowPhotoSheet(true)}
              >
                {/* Dashed circular frame (124px x 124px) */}
                <View style={styles.avatarDashedCircle}>
                  {photoUri ? (
                    <Image source={{ uri: photoUri }} style={styles.avatarImage} />
                  ) : (
                    <UserPlaceholderIcon size={72} color="#C0C0CC" />
                  )}
                </View>

                {/* Camera Badge (32px x 32px, bottom: 8px, right: 8px) */}
                <View style={styles.cameraBadge}>
                  <CameraBadgeIcon size={16} color="#000814" />
                </View>
              </TouchableOpacity>

              {/* Subtitle text below avatar */}
              <Text style={styles.tapCircleHint}>Tap the Circle to add profile image</Text>
            </View>

            {/* ── Full Name Input Field (358px x 48px, gap: 20px) ── */}
            <View style={styles.fullNameSection}>
              <TextInput
                style={styles.fullNameInput}
                placeholder="Full Name"
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  if (fullNameError) setFullNameError(null);
                }}
                autoCapitalize="words"
              />
              {/* Underline: Line 64 (1px solid #ebebf5) */}
              <View style={styles.inputUnderline} />

              {/* Helper Text: According to ID Card / NIN */}
              <Text style={styles.ninHelperText}>According to ID Card / NIN</Text>

              {fullNameError && (
                <Text style={styles.fullNameErrorText}>{fullNameError}</Text>
              )}
            </View>
          </View>

          {/* ── Next Button (358px x 48px, radius 24px) ── */}
          <View style={styles.bottomContent}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.nextButton}
              onPress={handleNextPress}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Photo Upload Bottom Sheet ── */}
      <ProviderPhotoUploadSheet
        visible={showPhotoSheet}
        title="Photo Upload"
        onOpenCamera={handleOpenCamera}
        onChoosePhotos={handleChoosePhotos}
        onSelectFile={handleSelectFile}
        onClose={() => setShowPhotoSheet(false)}
      />

      {/* ── Frame 8 Dimmed Loading State (4 Dots DommyLoader) ── */}
      <DommyLoader visible={isLoading} paddingTop={429} />

      {/* Android System Dock Barrier */}
      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </View>
  );
};

export default BusinessOwnerProfileScreen;

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
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  topContent: {
    width: '100%',
    maxWidth: 358,
    alignItems: 'center',
  },
  bottomContent: {
    width: '100%',
    maxWidth: 358,
    paddingTop: 16,
  },

  /* ── Title and Subtitle Section (gap: 16px, marginBottom: 56px - Marked Area 1) ── */
  titleSection: {
    width: '100%',
    maxWidth: 358,
    gap: 16,
    marginBottom: 56,
  },
  screenTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 32,
    color: '#141A33',
    includeFontPadding: false,
  },
  screenSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  /* ── Circular Profile Avatar Section (marginBottom: 64px - Marked Area 2) ── */
  avatarSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 64,
  },
  avatarTouchArea: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarDashedCircle: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 1.2,
    borderColor: '#606066',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 124,
    height: 124,
    borderRadius: 62,
  },
  cameraBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 32,
    height: 32,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: '#EBEBF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapCircleHint: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },

  /* ── Full Name Section (width: 358px) ── */
  fullNameSection: {
    width: '100%',
    maxWidth: 358,
    alignItems: 'center',
    marginBottom: 24,
  },
  fullNameInput: {
    width: '100%',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    color: '#000814',
    textAlign: 'center',
    paddingVertical: 8,
    includeFontPadding: false,
  },
  inputUnderline: {
    width: '100%',
    height: 1,
    backgroundColor: '#EBEBF5',
    marginTop: 8,
    marginBottom: 12,
  },
  ninHelperText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(192, 192, 204, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  fullNameErrorText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    color: '#CC2929',
    marginTop: 8,
    textAlign: 'center',
  },

  /* ── Next Button (358px x 48px, radius 24px) ── */
  nextButton: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});
