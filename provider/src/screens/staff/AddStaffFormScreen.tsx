import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Platform,
  BackHandler,
  LayoutAnimation,
  UIManager,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { useStaffStore, StaffMember } from '../../context/StaffContext';
import { triggerLightHaptic } from '../../utils/haptics';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { TimeSegmentInput, TimeSegmentValue } from '../../components/TimeSegmentInput';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { ProviderPhotoUploadSheet } from '../../components/ProviderPhotoUploadSheet';
import { InfoBanner } from '../../components/wizard/InfoBanner';

import { ArrowLeft02Icon } from '../../components/staff/StaffIcons';
import {
  User02Icon,
  Briefcase06Icon,
  AiBrain01Icon,
  WorkHistoryIcon,
  Dish01Icon,
  CalendarClockIcon,
  Camera01Icon,
  ArrowDown01Icon,
} from '../../components/staff/StaffFormIcons';

import { StaffRoleSheet } from '../../components/staff/sheets/StaffRoleSheet';
import { ExperienceSheet } from '../../components/staff/sheets/ExperienceSheet';
import { WorkDaysSheet, formatWorkDays } from '../../components/staff/sheets/WorkDaysSheet';
import { StaffRoleItem } from '../../constants/staffRoles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

function formatTimeSegment(val: TimeSegmentValue | null): string {
  if (!val || val.hour === null) return '';
  const m = val.minute === null ? '00' : (val.minute < 10 ? `0${val.minute}` : `${val.minute}`);
  const p = val.period || 'am';
  return `${val.hour}:${m} ${p}`;
}

/**
 * 1:1 Figma AddStaffFormScreen (Frames A1, A2, A3)
 *
 * Implements:
 * - Photo box with dashed outline, camera upload sheet, and filled badge
 * - Staff Full Name input
 * - Dynamic Staff Role slots (1 to 3 slots sliding in smoothly on selection)
 * - Staff Experience dropdown & sheet (chips + custom number)
 * - Work Hours (Resumption & Closing Time via TimeSegmentInput)
 * - Break Time (Optional, Break Start & Break End via TimeSegmentInput)
 * - Work Days multi-select dropdown & sheet (Monday-Sunday + Everyday)
 * - Sticky footer button (grey disabled until complete, dark active when complete)
 * - Loading overlay during submission
 * - Saves into shared StaffContext store and routes to Successful screen
 */
export const AddStaffFormScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addStaff } = useStaffStore();

  // ── Form State ──
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [roles, setRoles] = useState<string[]>(['']);
  const [experienceYears, setExperienceYears] = useState<number | null>(null);
  const [resumptionTime, setResumptionTime] = useState<TimeSegmentValue | null>(null);
  const [closingTime, setClosingTime] = useState<TimeSegmentValue | null>(null);
  const [breakStartTime, setBreakStartTime] = useState<TimeSegmentValue | null>(null);
  const [breakEndTime, setBreakEndTime] = useState<TimeSegmentValue | null>(null);
  const [workDays, setWorkDays] = useState<string[]>([]);

  // ── Submission & Overlay State ──
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // ── Sheets State ──
  const [showPhotoSheet, setShowPhotoSheet] = useState<boolean>(false);
  const [showRoleSheet, setShowRoleSheet] = useState<boolean>(false);
  const [activeRoleSlotIndex, setActiveRoleSlotIndex] = useState<number>(0);
  const [showExperienceSheet, setShowExperienceSheet] = useState<boolean>(false);
  const [showWorkDaysSheet, setShowWorkDaysSheet] = useState<boolean>(false);

  // Back button handler
  const handleBack = useCallback(() => {
    if (isSubmitting) return; // Ignore back while submitting
    triggerLightHaptic();
    router.back();
  }, [isSubmitting, router]);

  // Android hardware back listener
  React.useEffect(() => {
    const onBackPress = () => {
      handleBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [handleBack]);

  // ── Photo Upload Handlers ──
  const handleOpenPhotoSheet = () => {
    triggerLightHaptic();
    setShowPhotoSheet(true);
  };

  const handleOpenCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) return;

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (e) {
      // Safe fallback
    } finally {
      setShowPhotoSheet(false);
    }
  };

  const handleChoosePhotos = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.85,
        mediaTypes: ['images'],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (e) {
      // Safe fallback
    } finally {
      setShowPhotoSheet(false);
    }
  };

  const handleSelectFile = () => {
    // TODO (Backend / FilePicker): stub
    setShowPhotoSheet(false);
  };

  // ── Role Slots Handlers ──
  const handleOpenRoleSlot = (index: number) => {
    triggerLightHaptic();
    setActiveRoleSlotIndex(index);
    setShowRoleSheet(true);
  };

  const handleSelectRole = (roleItem: StaffRoleItem) => {
    setRoles((prev) => {
      const updated = [...prev];
      updated[activeRoleSlotIndex] = roleItem.name;

      // If user filled this slot and total slots < 3 and this was the last slot, slide in next empty slot
      if (updated.length < 3 && activeRoleSlotIndex === updated.length - 1) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        updated.push('');
      }

      return updated;
    });
  };

  // ── Form Completeness Validation ──
  const isFormComplete = useMemo(() => {
    const hasPhoto = Boolean(photoUri);
    const hasName = name.trim().length > 0;
    const validRoles = roles.filter((r) => r.trim().length > 0);
    const hasRoles = validRoles.length > 0;
    const hasExperience = typeof experienceYears === 'number' && experienceYears > 0;
    const hasResumption = resumptionTime !== null && typeof resumptionTime.hour === 'number';
    const hasClosing = closingTime !== null && typeof closingTime.hour === 'number';
    const hasWorkDays = workDays.length > 0;

    // Break time is optional: if one is set, both must be set
    const hasBreakStart = breakStartTime !== null && typeof breakStartTime.hour === 'number';
    const hasBreakEnd = breakEndTime !== null && typeof breakEndTime.hour === 'number';
    const isBreakValid = (!hasBreakStart && !hasBreakEnd) || (hasBreakStart && hasBreakEnd);

    return (
      hasPhoto &&
      hasName &&
      hasRoles &&
      hasExperience &&
      hasResumption &&
      hasClosing &&
      hasWorkDays &&
      isBreakValid
    );
  }, [
    photoUri,
    name,
    roles,
    experienceYears,
    resumptionTime,
    closingTime,
    workDays,
    breakStartTime,
    breakEndTime,
  ]);

  // ── Submit Action ──
  const handleSubmit = () => {
    if (!isFormComplete || isSubmitting) return;

    triggerLightHaptic();
    setIsSubmitting(true);

    // Short mock delay (1000-1500ms) representing backend createStaff call
    // TODO (Backend): Connect to backend API when available
    setTimeout(() => {
      const validRoles = roles.filter((r) => r.trim().length > 0);
      const generatedLoginCode = String(Math.floor(1000 + Math.random() * 9000)); // MOCK 4-digit code

      const newStaffMember: StaffMember = {
        id: `staff_${Date.now()}`,
        name: name.trim(),
        photoUri,
        avatarUri: photoUri,
        roles: validRoles,
        role: validRoles[0] || 'Staff',
        experienceYears: experienceYears || 1,
        yearsExperience: experienceYears || 1,
        workHours: {
          start: formatTimeSegment(resumptionTime),
          end: formatTimeSegment(closingTime),
        },
        breakHours:
          breakStartTime?.hour !== null && breakEndTime?.hour !== null
            ? {
                start: formatTimeSegment(breakStartTime),
                end: formatTimeSegment(breakEndTime),
              }
            : null,
        workDays,
        loginCode: generatedLoginCode,
        isVerified: false,
      };

      addStaff(newStaffMember);
      setIsSubmitting(false);

      // Navigate to Successful screen, replacing current route
      router.replace({
        pathname: '/staff/success',
        params: { id: newStaffMember.id },
      } as any);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── 1. Page Header (64px, centered title, no help button) ── */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerButton}
            onPress={handleBack}
            disabled={isSubmitting}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Back to staff management"
          >
            <ArrowLeft02Icon size={24} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Add Staff</Text>

          {/* 48x48 spacer */}
          <View style={styles.headerButton} />
        </View>

        {/* ── 2. Scrollable Form Content ── */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 80 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Orange Warning Banner */}
          <InfoBanner
            variant="orange"
            text="Upload real photos of each staff member. AI-generated images and unrelated profile pictures are not allowed."
          />

          {/* ── Field 1: Photo Upload Box (134x134) ── */}
          <View style={styles.photoSection}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.photoBox,
                photoUri ? styles.photoBoxFilled : styles.photoBoxEmpty,
              ]}
              onPress={handleOpenPhotoSheet}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Upload staff profile photo"
            >
              {photoUri ? (
                <>
                  <Image source={{ uri: photoUri }} style={styles.uploadedImage} />
                  {/* Round camera badge at bottom-right corner */}
                  <View style={styles.cameraBadge}>
                    <Camera01Icon size={18} color="#141B34" />
                  </View>
                </>
              ) : (
                <View style={styles.emptyCameraIconWrapper}>
                  <Camera01Icon size={24} color="#141B34" />
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.photoCaption}>Tap the camera to upload image</Text>
          </View>

          {/* ── Field 2: Staff Full Name ── */}
          <View style={styles.fieldBlock}>
            <View style={styles.labelRow}>
              <User02Icon size={20} />
              <Text style={styles.fieldLabel}>Staff Full Name</Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Jon Dolly"
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                value={name}
                onChangeText={setName}
                autoCorrect={false}
                accessible
                accessibilityLabel="Staff full name"
              />
            </View>
          </View>

          {/* ── Field 3: Staff Role (Dynamic Slots 1-3) ── */}
          <View style={styles.fieldBlock}>
            <View style={styles.labelRow}>
              <Briefcase06Icon size={20} />
              <Text style={styles.fieldLabel}>Staff Role</Text>
            </View>

            <View style={styles.rolesStack}>
              {roles.map((roleValue, idx) => {
                const isFirst = idx === 0;
                const hasValue = roleValue.trim().length > 0;
                const placeholder = isFirst ? 'Barber' : 'Add another';

                return (
                  <TouchableOpacity
                    key={`role_slot_${idx}`}
                    activeOpacity={0.8}
                    style={styles.dropdownField}
                    onPress={() => handleOpenRoleSlot(idx)}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={
                      hasValue ? `Role slot ${idx + 1}: ${roleValue}` : `Select role slot ${idx + 1}`
                    }
                  >
                    <Text
                      style={[
                        styles.dropdownValueText,
                        !hasValue && styles.dropdownPlaceholderText,
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {hasValue ? roleValue : placeholder}
                    </Text>
                    <ArrowDown01Icon size={24} color="rgba(0, 8, 20, 0.96)" />
                  </TouchableOpacity>
                );
              })}

              <Text style={styles.helperText}>
                Enter the job of this staff in your business
              </Text>
            </View>
          </View>

          {/* ── Field 4: Staff Experience ── */}
          <View style={styles.fieldBlock}>
            <View style={styles.labelRow}>
              <AiBrain01Icon size={20} />
              <Text style={styles.fieldLabel}>Staff Experience</Text>
            </View>

            <View style={styles.fieldInputGroup}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.dropdownField}
                onPress={() => {
                  triggerLightHaptic();
                  setShowExperienceSheet(true);
                }}
                accessible
                accessibilityRole="button"
                accessibilityLabel={
                  experienceYears
                    ? `Experience: ${experienceYears} ${experienceYears === 1 ? 'Year' : 'Years'}`
                    : 'Select experience level'
                }
              >
                <Text
                  style={[
                    styles.dropdownValueText,
                    experienceYears === null && styles.dropdownPlaceholderText,
                  ]}
                >
                  {experienceYears !== null
                    ? `${experienceYears} ${experienceYears === 1 ? 'Year' : 'Years'}`
                    : '1 Year'}
                </Text>
                <ArrowDown01Icon size={24} color="rgba(0, 8, 20, 0.96)" />
              </TouchableOpacity>

              <Text style={styles.helperText}>
                What level of experience does this staff have?
              </Text>
            </View>
          </View>

          {/* ── Field 5: Work Hours (Side-by-side TimeSegmentInputs) ── */}
          <View style={styles.fieldBlock}>
            <View style={styles.labelRow}>
              <WorkHistoryIcon size={20} />
              <Text style={styles.fieldLabel}>Work Hours</Text>
            </View>

            <View style={styles.fieldInputGroup}>
              <View style={styles.sideBySideRow}>
                <View style={styles.sideColumn}>
                  <Text style={styles.timeLabel}>Resumption Time</Text>
                  <TimeSegmentInput
                    label="Resumption Time"
                    placeholder="8:00 am"
                    value={resumptionTime}
                    onChange={setResumptionTime}
                  />
                </View>

                <View style={styles.sideColumn}>
                  <Text style={styles.timeLabel}>Closing Time</Text>
                  <TimeSegmentInput
                    label="Closing Time"
                    placeholder="8:00 pm"
                    value={closingTime}
                    onChange={setClosingTime}
                  />
                </View>
              </View>

              <Text style={styles.helperText}>
                What time does this staff resume and close from work
              </Text>
            </View>
          </View>

          {/* ── Field 6: Break Time (Side-by-side TimeSegmentInputs, Optional) ── */}
          <View style={styles.fieldBlock}>
            <View style={styles.labelRow}>
              <Dish01Icon size={20} />
              <Text style={styles.fieldLabel}>Break Time</Text>
            </View>

            <View style={styles.fieldInputGroup}>
              <View style={styles.sideBySideRow}>
                <View style={styles.sideColumn}>
                  <Text style={styles.timeLabel}>Break Start</Text>
                  <TimeSegmentInput
                    label="Break Start"
                    placeholder="8:00 am"
                    value={breakStartTime}
                    onChange={setBreakStartTime}
                  />
                </View>

                <View style={styles.sideColumn}>
                  <Text style={styles.timeLabel}>Break End</Text>
                  <TimeSegmentInput
                    label="Break End"
                    placeholder="8:00 pm"
                    value={breakEndTime}
                    onChange={setBreakEndTime}
                  />
                </View>
              </View>

              <Text style={styles.helperText}>
                What time does this staff go for break and return?
              </Text>
            </View>
          </View>

          {/* ── Field 7: Work Days (Dropdown & Sheet) ── */}
          <View style={styles.fieldBlock}>
            <View style={styles.labelRow}>
              <CalendarClockIcon size={20} />
              <Text style={styles.fieldLabel}>Work Days</Text>
            </View>

            <View style={styles.fieldInputGroup}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.dropdownField}
                onPress={() => {
                  triggerLightHaptic();
                  setShowWorkDaysSheet(true);
                }}
                accessible
                accessibilityRole="button"
                accessibilityLabel={
                  workDays.length > 0 ? `Work days: ${formatWorkDays(workDays)}` : 'Select work days'
                }
              >
                <Text
                  style={[
                    styles.dropdownValueText,
                    workDays.length === 0 && styles.dropdownPlaceholderText,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {workDays.length > 0 ? formatWorkDays(workDays) : 'Monday, Wednesday, Sunday'}
                </Text>
                <ArrowDown01Icon size={24} color="rgba(0, 8, 20, 0.96)" />
              </TouchableOpacity>

              <Text style={styles.helperText}>
                What day of the week will the staff be working?
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* ── Sticky Footer Button: "Add staff" ── */}
        <View style={[styles.footerContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.submitButton,
              isFormComplete ? styles.submitButtonActive : styles.submitButtonDisabled,
            ]}
            disabled={!isFormComplete || isSubmitting}
            onPress={handleSubmit}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Add staff"
            accessibilityState={{ disabled: !isFormComplete }}
          >
            <Text
              style={[
                styles.submitButtonText,
                isFormComplete ? styles.submitTextActive : styles.submitTextDisabled,
              ]}
            >
              Add staff
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── 3. Bottom Sheets ── */}
        {/* Photo Upload Sheet */}
        <ProviderPhotoUploadSheet
          visible={showPhotoSheet}
          title="Photo Upload"
          onOpenCamera={handleOpenCamera}
          onChoosePhotos={handleChoosePhotos}
          onSelectFile={handleSelectFile}
          onClose={() => setShowPhotoSheet(false)}
        />

        {/* Staff Role Sheet */}
        <StaffRoleSheet
          visible={showRoleSheet}
          selectedRoleName={roles[activeRoleSlotIndex]}
          disabledRoleNames={roles.filter((_, idx) => idx !== activeRoleSlotIndex && Boolean(_))}
          onSelectRole={handleSelectRole}
          onClose={() => setShowRoleSheet(false)}
        />

        {/* Experience Sheet */}
        <ExperienceSheet
          visible={showExperienceSheet}
          currentYears={experienceYears}
          onConfirm={(val) => setExperienceYears(val)}
          onClose={() => setShowExperienceSheet(false)}
        />

        {/* Work Days Sheet */}
        <WorkDaysSheet
          visible={showWorkDaysSheet}
          selectedDays={workDays}
          onConfirm={(days) => setWorkDays(days)}
          onClose={() => setShowWorkDaysSheet(false)}
        />

        {/* ── 4. Dimmed 4-Dot Loading Overlay (A3) ── */}
        <LoadingOverlay
          visible={isSubmitting}
          dotsCount={4}
          paddingTop={429}
          dotSize={16}
          dotGap={20}
        />

        <NativeDockSpacer backgroundColor="#FFFFFF" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddStaffFormScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  scrollArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 32,
  },
  // ── Photo Upload ──
  photoSection: {
    alignItems: 'center',
    gap: 16,
    paddingTop: 8,
  },
  photoBox: {
    width: 134,
    height: 134,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  photoBoxEmpty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(192, 192, 204, 0.96)',
  },
  photoBoxFilled: {
    borderWidth: 0,
  },
  emptyCameraIconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadedImage: {
    width: 134,
    height: 134,
    borderRadius: 24,
  },
  cameraBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#858B94',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  photoCaption: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  // ── Field Block ──
  fieldBlock: {
    width: '100%',
    gap: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldLabel: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  inputContainer: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  textInput: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
    paddingVertical: 0,
  },
  // ── Dropdowns ──
  fieldInputGroup: {
    gap: 8,
  },
  rolesStack: {
    gap: 8,
  },
  dropdownField: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  dropdownValueText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    flex: 1,
    marginRight: 8,
  },
  dropdownPlaceholderText: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  helperText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  // ── Side-by-side Time Segment Layout ──
  sideBySideRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  sideColumn: {
    flex: 1,
    gap: 8,
  },
  timeLabel: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  // ── Sticky Footer ──
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  submitButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    shadowColor: '#858B94',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  submitButtonText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  submitTextActive: {
    color: '#FFFFFF',
  },
  submitTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
});
