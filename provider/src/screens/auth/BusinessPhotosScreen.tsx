import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { StepProgressHeader } from '../../components/StepProgressHeader';
import { OperatingDaysBottomSheet } from '../../components/OperatingDaysBottomSheet';
import { TimeSegmentInput, TimeSegmentValue } from '../../components/TimeSegmentInput';
import { ProviderPhotoUploadSheet } from '../../components/ProviderPhotoUploadSheet';
import { AmenitiesBottomSheet } from '../../components/AmenitiesBottomSheet';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { DashedPhotoSlot } from '../../components/wizard/DashedPhotoSlot';
import { useProviderOnboarding } from '../../context/ProviderOnboardingContext';
import { businessStore } from '../../store/businessStore';

const ALL_WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

function parseDaysStringToList(daysStr: string): string[] {
  if (!daysStr) return [];
  if (daysStr === 'Mondays & Sundays' || daysStr === 'Everyday') {
    return [...ALL_WEEKDAYS];
  }
  if (daysStr.includes(' - ')) {
    const [start, end] = daysStr.split(' - ').map((s) => s.trim());
    const startIndex = ALL_WEEKDAYS.indexOf(start);
    const endIndex = ALL_WEEKDAYS.indexOf(end);
    if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex) {
      return ALL_WEEKDAYS.slice(startIndex, endIndex + 1);
    }
  }
  return daysStr
    .split(',')
    .map((s) => s.trim())
    .filter((s) => ALL_WEEKDAYS.includes(s));
}

/**
 * Minimum salon photos required for onboarding.
 * Subtitle states: "You can add more photos anytime after creating your account."
 */
export const MIN_SALON_PHOTOS = 0;

export interface OperatingPreset {
  id: string;
  label: string;
}

// Presets from Figma
export const OPERATING_DAYS_PRESETS: OperatingPreset[] = [
  { id: 'mon_sun', label: 'Mondays & Sundays' },
  { id: 'mon_sat', label: 'Monday - Saturday' },
  { id: 'mon_fri', label: 'Monday - Friday' },
  { id: 'mon_wed', label: 'Monday - Wednesday' },
  { id: 'tue_fri', label: 'Tuesday - Friday' },
];


// ── 1:1 Vector Delete Badge Icon ──
function DeleteBadgeIcon({ size = 10 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <Path
        d="M2 2l8 8M10 2L2 10"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ── 1:1 Vector arrow-down-01 Icon (24x24) ──
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

// ── 1:1 Vector camera-01 Icon inside photo slots (24x24) ──
function CameraSlotIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 7a2 2 0 012-2h2.5l1.5-2h8l1.5 2H20a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V7z"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 17a4 4 0 100-8 4 4 0 000 8z"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.75 9.25h.01"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export const BusinessPhotosScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { salonDetails, setSalonDetails, ownerProfile, businessName, location } = useProviderOnboarding();

  // Photo slots state (up to 6 slots)
  const [photos, setPhotos] = useState<(string | null)[]>([
    salonDetails.photos[0] || null,
    salonDetails.photos[1] || null,
    salonDetails.photos[2] || null,
    salonDetails.photos[3] || null,
    salonDetails.photos[4] || null,
    salonDetails.photos[5] || null,
  ]);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);

  // Form fields
  const [operatingDays, setOperatingDays] = useState(salonDetails.operatingDays || '');
  const [operatingDaysList, setOperatingDaysList] = useState<string[]>(() =>
    parseDaysStringToList(salonDetails.operatingDays || '')
  );
  const [openingTime, setOpeningTime] = useState<TimeSegmentValue | null>(
    salonDetails.openingTime || null
  );
  const [closingTime, setClosingTime] = useState<TimeSegmentValue | null>(
    salonDetails.closingTime || null
  );
  const [amenities, setAmenities] = useState(salonDetails.amenities || '');

  // Validation
  const [errors, setErrors] = useState<{
    photos?: string;
    operatingDays?: string;
    openingHours?: string;
    closingHours?: string;
  }>({});

  // Sheets
  const [showPhotoUploadSheet, setShowPhotoUploadSheet] = useState(false);
  const [showOperatingDaysSheet, setShowOperatingDaysSheet] = useState(false);
  const [showAmenitiesSheet, setShowAmenitiesSheet] = useState(false);

  // ── Photo Selection Handlers ──
  const handleSlotPress = (index: number) => {
    setActiveSlotIndex(index);
    setShowPhotoUploadSheet(true);
  };

  const handleChoosePhotos = async () => {
    if (activeSlotIndex === null) return;
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
        const selectedUri = result.assets[0].uri;
        const updated = [...photos];
        updated[activeSlotIndex] = selectedUri;
        setPhotos(updated);

        // Update context
        const nonNullPhotos = updated.filter(Boolean) as string[];
        setSalonDetails({ photos: nonNullPhotos });
      }
    } catch (e) {
      // Handled safely
    } finally {
      setShowPhotoUploadSheet(false);
    }
  };

  const handleOpenCamera = async () => {
    if (activeSlotIndex === null) return;
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
        const selectedUri = result.assets[0].uri;
        const updated = [...photos];
        updated[activeSlotIndex] = selectedUri;
        setPhotos(updated);

        // Update context
        const nonNullPhotos = updated.filter(Boolean) as string[];
        setSalonDetails({ photos: nonNullPhotos });
      }
    } catch (e) {
      // Handled safely
    } finally {
      setShowPhotoUploadSheet(false);
    }
  };

  const handleSelectFile = () => {
    setShowPhotoUploadSheet(false);
  };

  const handleRemovePhoto = (index: number) => {
    const updated = [...photos];
    updated[index] = null;
    setPhotos(updated);
    const nonNullPhotos = updated.filter(Boolean) as string[];
    setSalonDetails({ photos: nonNullPhotos });
  };

  const formatTimeSegment = (t: TimeSegmentValue | null, fallback: string): string => {
    if (!t || t.hour === null) return fallback;
    const h = t.hour;
    const m = String(t.minute ?? 0).padStart(2, '0');
    const p = t.period ?? (fallback.includes('pm') ? 'pm' : 'am');
    return `${h}:${m} ${p}`;
  };

  // ── Submit / Next Handler ──
  const handleNextPress = async () => {
    const newErrors: typeof errors = {};
    const filledPhotos = photos.filter(Boolean) as string[];

    if (filledPhotos.length < MIN_SALON_PHOTOS) {
      newErrors.photos = `Please upload at least ${MIN_SALON_PHOTOS} photo`;
    }

    // Validation on Next: both times must be set (an hour entered)
    if (!openingTime || openingTime.hour === null) {
      newErrors.openingHours = 'Required';
    }

    if (!closingTime || closingTime.hour === null) {
      newErrors.closingHours = 'Required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const finalDays = operatingDays || 'Mondays & Sundays';
    const finalOpen = formatTimeSegment(openingTime, '0:00 am');
    const finalClose = formatTimeSegment(closingTime, '0:00 pm');
    const finalHours = `${finalOpen} - ${finalClose}`;

    setErrors({});
    setSalonDetails({
      photos: filledPhotos,
      operatingDays: finalDays,
      operatingHours: finalHours,
      openingTime,
      closingTime,
      amenities,
    });

    // Hydrate business store with onboarding data (matching the customer salon profile flow)
    businessStore.updateProfile({
      name: businessName || 'Luminous Lux',
      address: location.address || 'Street 11, off okiki road abuja.',
      photos: filledPhotos,
      photosCount: filledPhotos.length > 0 ? filledPhotos.length : 24,
      operatingDays: finalDays,
      operatingHours: finalHours,
      gender: location.gender || 'Unisex',
    });

    // Navigate to Number Verification (OTP)
    router.push('/business-otp' as any);
  };

  const handleBackPress = () => {
    router.back();
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
              paddingTop: Math.max(insets.top + 8, 43),
              paddingBottom: Math.max(insets.bottom + 24, 40),
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Unified Step Progress Header (Step 4 of 4) ── */}
          <StepProgressHeader
            currentStep={4}
            totalSteps={4}
            onBack={handleBackPress}
            marginBottom={34}
          />

          {/* ── Title & Subtitle Section (top: 141px, width: 358px, gap: 16px) ── */}
          <View style={styles.titleSection}>
            <Text style={styles.screenTitle}>Upload photos of Salon</Text>
            <Text style={styles.screenSubtitle}>
              Upload photos of your salon’s interior and exterior. You can add more photos anytime after creating your account.
            </Text>
          </View>

          {/* ── Photo Slots Grid (top: 301px, 358px x 224px, 103.33px cells, colGap: 24px, rowGap: 16.67px) ── */}
          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              {[0, 1, 2].map((slotIdx) => {
                const uri = photos[slotIdx];
                return (
                  <DashedPhotoSlot
                    key={slotIdx}
                    imageUri={uri}
                    showRemoveBadge={true}
                    onPress={() => handleSlotPress(slotIdx)}
                    onRemove={() => handleRemovePhoto(slotIdx)}
                    accessibilityLabel={uri ? `Replace photo ${slotIdx + 1}` : `Upload photo slot ${slotIdx + 1}`}
                  />
                );
              })}
            </View>

            <View style={styles.gridRow}>
              {[3, 4, 5].map((slotIdx) => {
                const uri = photos[slotIdx];
                return (
                  <DashedPhotoSlot
                    key={slotIdx}
                    imageUri={uri}
                    showRemoveBadge={true}
                    onPress={() => handleSlotPress(slotIdx)}
                    onRemove={() => handleRemovePhoto(slotIdx)}
                    accessibilityLabel={uri ? `Replace photo ${slotIdx + 1}` : `Upload photo slot ${slotIdx + 1}`}
                  />
                );
              })}
            </View>
          </View>
          {errors.photos && <Text style={styles.errorText}>{errors.photos}</Text>}

          {/* ── Frame 1000006621: Form Inputs Container (top: 566px, width: 358px, gap: 40px) ── */}
          <View style={styles.formContainer}>
            {/* 1. Business Operating Days (height: 139px, gap: 24px) */}
            <View style={styles.fieldBlock}>
              <View style={styles.fieldHeader}>
                <Text style={styles.fieldTitle}>Business Operating Days</Text>
                <Text style={styles.fieldSubtitle}>
                  What day of the week do you open and close your business
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.dropdownInput,
                  errors.operatingDays ? styles.inputBorderError : null,
                ]}
                onPress={() => setShowOperatingDaysSheet(true)}
              >
                <Text
                  style={[
                    styles.inputText,
                    !operatingDays ? styles.placeholderText : null,
                  ]}
                  numberOfLines={1}
                >
                  {operatingDays || 'Mondays & Sundays'}
                </Text>
                <ChevronDownIcon size={24} />
              </TouchableOpacity>
              {errors.operatingDays && (
                <Text style={styles.errorText}>{errors.operatingDays}</Text>
              )}
            </View>

            {/* 2. Business Operating Hours (height: 153.25px, gap: 24px) */}
            <View style={styles.fieldBlock}>
              <View style={styles.fieldHeader}>
                <Text style={styles.fieldTitle}>Business Operating Hours</Text>
                <Text style={styles.fieldSubtitle}>
                  What time do you open and close your business
                </Text>
              </View>

              {/* Work Hours: Two Columns (Opening Hours & Closing Hours) */}
              <View style={styles.hoursRow}>
                {/* Left Column: Opening Hours */}
                <View style={styles.hourColumn}>
                  <Text style={styles.hourLabel}>Opening Hours</Text>
                  <TimeSegmentInput
                    value={openingTime}
                    onChange={(val) => {
                      setOpeningTime(val);
                      if (errors.openingHours) {
                        setErrors((prev) => ({ ...prev, openingHours: undefined }));
                      }
                    }}
                    placeholder="0:00 am"
                    label="Opening Hours"
                    error={errors.openingHours}
                    hourAccessibilityLabel="Opening hour"
                    minuteAccessibilityLabel="Opening minutes"
                    periodAccessibilityLabel="Opening am or pm"
                  />
                </View>

                {/* Right Column: Closing Hours */}
                <View style={styles.hourColumn}>
                  <Text style={styles.hourLabel}>Closing Hours</Text>
                  <TimeSegmentInput
                    value={closingTime}
                    onChange={(val) => {
                      setClosingTime(val);
                      if (errors.closingHours) {
                        setErrors((prev) => ({ ...prev, closingHours: undefined }));
                      }
                    }}
                    placeholder="0:00 pm"
                    label="Closing Hours"
                    error={errors.closingHours}
                    hourAccessibilityLabel="Closing hour"
                    minuteAccessibilityLabel="Closing minutes"
                    periodAccessibilityLabel="Closing am or pm"
                  />
                </View>
              </View>
            </View>

            {/* 3. Building Amenities (height: 88px, gap: 16px) */}
            <View style={styles.fieldBlockAmenities}>
              <Text style={styles.fieldTitle}>Building Amenities</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.dropdownInput}
                onPress={() => setShowAmenitiesSheet(true)}
              >
                <Text
                  style={[
                    styles.inputText,
                    !amenities ? styles.placeholderText : null,
                  ]}
                  numberOfLines={1}
                >
                  {amenities || 'E.g. Air Condition'}
                </Text>
                <ChevronDownIcon size={24} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Next Button (358px x 48px, radius 24px) ── */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.nextButton}
            onPress={handleNextPress}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Photo Upload Bottom Sheet ── */}
      <ProviderPhotoUploadSheet
        visible={showPhotoUploadSheet}
        onOpenCamera={handleOpenCamera}
        onChoosePhotos={handleChoosePhotos}
        onSelectFile={handleSelectFile}
        onClose={() => setShowPhotoUploadSheet(false)}
      />

      {/* ── Business Operating Days Bottom Sheet (1:1 Figma) ── */}
      <OperatingDaysBottomSheet
        visible={showOperatingDaysSheet}
        selectedDays={operatingDaysList}
        onConfirm={(formattedDays, daysList) => {
          setOperatingDays(formattedDays);
          setOperatingDaysList(daysList);
          if (errors.operatingDays) {
            setErrors((prev) => ({ ...prev, operatingDays: undefined }));
          }
        }}
        onClose={() => setShowOperatingDaysSheet(false)}
      />


      {/* ── Amenities Bottom Sheet ── */}
      <AmenitiesBottomSheet
        visible={showAmenitiesSheet}
        selectedAmenities={
          amenities
            ? amenities
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : []
        }
        onConfirm={(selected, custom) => {
          const all = [...selected];
          if (custom && !all.includes(custom)) {
            all.push(custom);
          }
          const val = all.join(', ');
          setAmenities(val);
          setSalonDetails({ amenities: val });
        }}
        onClose={() => setShowAmenitiesSheet(false)}
      />

      {/* Android System Dock Barrier */}
      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </View>
  );
};

export default BusinessPhotosScreen;

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

  /* Title Section (sign up header: width: 358, height: 120, gap: 16, marginBottom: 40) */
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

  /* Photo Slots Grid (image frames: 358x224, 103.33px cells, colGap: 24, rowGap: 16.67, marginBottom: 41) */
  gridContainer: {
    width: '100%',
    maxWidth: 358,
    gap: 16.67,
    marginBottom: 41,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
  },
  photoSlot: {
    width: 103.33,
    height: 103.33,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  slotImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  removePhotoBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 8, 20, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  /* Form Container (Frame 1000006621: width: 358, gap: 40, marginBottom: 40) */
  formContainer: {
    width: '100%',
    maxWidth: 358,
    gap: 40,
    marginBottom: 40,
  },

  /* Field Block: header + input (gap: 24px) */
  fieldBlock: {
    width: '100%',
    gap: 24,
  },
  fieldBlockAmenities: {
    width: '100%',
    gap: 16,
  },
  fieldHeader: {
    width: '100%',
    gap: 8,
  },
  fieldTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    includeFontPadding: false,
  },
  fieldSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  /* Dropdown input (Login and Signup input field: 358x48, radius 24, padding 8x16, gap 10) */
  dropdownInput: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 10,
  },
  inputText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000814',
    flex: 1,
    marginRight: 8,
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

  /* Work Hours: Two Columns (width: 358, height: 76.25, gap: 24) */
  hoursRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
  },
  hourColumn: {
    flex: 1,
    gap: 8,
  },
  hourLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: '#000000',
    includeFontPadding: false,
  },
  hourInput: {
    width: '100%',
    height: 48.25,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#000814',
    includeFontPadding: false,
  },

  /* Filled Action Button (358x48, radius 24, padding 16) */
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
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 4,
    marginBottom: 40,
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
