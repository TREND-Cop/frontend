import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Image,
  Alert,
  KeyboardAvoidingView,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Circle } from 'react-native-svg';

import {
  useServiceDraft,
  ServicePackageItem,
  SelectedCategory,
} from '../../../context/ServiceDraftContext';
import { isSliceDirty } from '../../../utils/isDirty';
import { triggerLightHaptic } from '../../../utils/haptics';
import { EditHeader } from '../../../components/wizard/EditHeader';
import { EditFooter } from '../../../components/wizard/EditFooter';
import { PackageBlockList } from '../../../components/wizard/PackageBlockList';
import { ServiceCategorySheet } from '../../../components/wizard/ServiceCategorySheet';
import { GenderSelectionSheet } from '../../../components/wizard/GenderSelectionSheet';
import { ServiceDurationSheet } from '../../../components/wizard/ServiceDurationSheet';
import { ProviderPhotoUploadSheet } from '../../../components/ProviderPhotoUploadSheet';
import { DashedPhotoSlot } from '../../../components/wizard/DashedPhotoSlot';
import { NativeDockSpacer } from '../../../components/NativeDockSpacer';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

// ── Icons ─────────────────────────────────────────────────────────────────────

function InfoCircleIcon({ size = 20, color = 'rgba(192, 192, 204, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.5} />
      <Path
        d="M9.5 9.5C9.5 8.12 10.62 7 12 7C13.38 7 14.5 8.12 14.5 9.5C14.5 11 12.5 11.75 12.5 13.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Circle cx="12.5" cy="16.5" r="0.75" fill={color} />
    </Svg>
  );
}

function ArrowDown01Icon({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9l6 6 6-6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CameraIcon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 8a2 2 0 012-2h2.5l1.5-2h6l1.5 2H19a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 16.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="17.5" cy="9.5" r="0.75" fill={color} />
    </Svg>
  );
}

// ── Comma Formatter ───────────────────────────────────────────────────────────
function formatWithCommas(value: string): string {
  if (!value) return '';
  const clean = value.replace(/[^0-9.]/g, '');
  const parts = clean.split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (parts.length > 1) {
    return `${integerPart}.${parts[1]}`;
  }
  return integerPart;
}

interface ServiceFormSlice {
  images: string[];
  category: SelectedCategory | null;
  name: string;
  description: string;
  discount: number | null;
  discountRaw: string;
  gender: string;
  price: number | null;
  priceRaw: string;
  duration: string;
  packages: ServicePackageItem[];
}

/**
 * 1:1 Figma Edit Service Screen (Frame E1 - "Edit Men Brade")
 *
 * Implements:
 * - Working copy initialized from draft on mount
 * - Sections in exact order:
 *   1. Add service image (6 slots, no subtitle, NO ✕ badge)
 *   2. Service Category ⓘ
 *   3. Service Name ⓘ (helper: "This is what customers will see before booking")
 *   4. Service Description ⓘ
 *   5. Discounts ⓘ (helper: "Not compulsory")
 *   6. Gender Type (subtitle: "Select what gender this service is for")
 *   7. Service Price & Duration
 *   8. Service Package (with red ✕ badges on filled package images, Add Package row)
 * - Service Type is omitted per Figma frame E1
 * - Save changes button in sticky footer:
 *   - Not dirty -> grey disabled
 *   - Dirty -> dark navy
 *   - Invalid on submit -> red border, red toast pill, scrolls to first error
 * - Back button -> discards working copy, returns to Review
 */
export const EditServiceScreen: React.FC = () => {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const { draft, commitWorkingCopy } = useServiceDraft();

  // Committed slice of draft
  const committedSlice: ServiceFormSlice = useMemo(
    () => ({
      images: draft.images,
      category: draft.category,
      name: draft.name,
      description: draft.description,
      discount: draft.discount,
      discountRaw: draft.discountRaw,
      gender: draft.gender,
      price: draft.price,
      priceRaw: draft.priceRaw,
      duration: draft.duration,
      packages: draft.packages,
    }),
    [draft]
  );

  // Working copy state
  const [workingCopy, setWorkingCopy] = useState<ServiceFormSlice>(() =>
    JSON.parse(JSON.stringify(committedSlice))
  );

  // Dirty state calculation
  const isDirty = useMemo(
    () => isSliceDirty(workingCopy, committedSlice),
    [workingCopy, committedSlice]
  );

  // Validation & Error states
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);

  // Sheet states
  const [isCategorySheetVisible, setIsCategorySheetVisible] = useState(false);
  const [isGenderSheetVisible, setIsGenderSheetVisible] = useState(false);
  const [isDurationSheetVisible, setIsDurationSheetVisible] = useState(false);
  const [activeDurationTarget, setActiveDurationTarget] = useState<'service' | string | null>(null);

  // Photo upload target: 'service' (index) or 'package' (pkgId + index)
  const [photoTarget, setPhotoTarget] = useState<
    | { type: 'service'; index: number }
    | { type: 'package'; packageId: string; index: number }
    | null
  >(null);

  // Field layout coordinates for smooth error auto-scroll
  const fieldYCoordinates = useRef<Record<string, number>>({});
  const setFieldLayout = (fieldKey: string) => (event: LayoutChangeEvent) => {
    fieldYCoordinates.current[fieldKey] = event.nativeEvent.layout.y;
  };

  // Validation rules (excluding serviceType per E1)
  const missingFieldList = useMemo(() => {
    const missing: { key: string; label: string }[] = [];

    if (workingCopy.images.length === 0) {
      missing.push({ key: 'image', label: 'Service image not added' });
    }
    if (!workingCopy.category || !workingCopy.category.itemName) {
      missing.push({ key: 'category', label: 'Service category not added' });
    }
    if (!workingCopy.name.trim()) {
      missing.push({ key: 'name', label: 'Service name not added' });
    }
    if (!workingCopy.gender.trim()) {
      missing.push({ key: 'gender', label: 'Service gender not added' });
    }
    if (workingCopy.price === null || workingCopy.price <= 0) {
      missing.push({ key: 'price', label: 'Service price not added' });
    }
    if (!workingCopy.duration.trim()) {
      missing.push({ key: 'duration', label: 'Service duration not added' });
    }

    return missing;
  }, [workingCopy]);

  const isValid = missingFieldList.length === 0;
  const firstMissingField = missingFieldList.length > 0 ? missingFieldList[0].label : null;

  // Handlers for working copy changes
  const handleUpdateField = <K extends keyof ServiceFormSlice>(
    key: K,
    value: ServiceFormSlice[K]
  ) => {
    setWorkingCopy((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePriceChange = (text: string) => {
    const numericOnly = text.replace(/[^0-9]/g, '');
    const num = numericOnly ? parseInt(numericOnly, 10) : null;
    setWorkingCopy((prev) => ({
      ...prev,
      price: num,
      priceRaw: numericOnly,
    }));
  };

  const handleDiscountChange = (text: string) => {
    const numericOnly = text.replace(/[^0-9]/g, '');
    const num = numericOnly ? parseInt(numericOnly, 10) : null;
    setWorkingCopy((prev) => ({
      ...prev,
      discount: num,
      discountRaw: numericOnly,
    }));
  };

  // Service image slot press
  const handleServiceSlotPress = (index: number) => {
    triggerLightHaptic();
    setPhotoTarget({ type: 'service', index });
  };

  // Package handlers
  const handleAddPackage = () => {
    setWorkingCopy((prev) => ({
      ...prev,
      packages: [
        ...prev.packages,
        {
          id: `pkg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          images: [],
          contents: '',
          price: null,
          priceRaw: '',
          duration: '',
        },
      ],
    }));
  };

  const handleUpdatePackage = (pkgId: string, updates: Partial<ServicePackageItem>) => {
    setWorkingCopy((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg) =>
        pkg.id === pkgId ? { ...pkg, ...updates } : pkg
      ),
    }));
  };

  const handlePackageSlotPress = (packageId: string, index: number) => {
    triggerLightHaptic();
    setPhotoTarget({ type: 'package', packageId, index });
  };

  const handleRemovePackageImage = (packageId: string, index: number) => {
    setWorkingCopy((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg) => {
        if (pkg.id === packageId) {
          const nextImages = pkg.images.filter((_, idx) => idx !== index);
          return { ...pkg, images: nextImages };
        }
        return pkg;
      }),
    }));
  };

  // Photo upload callbacks
  const handleImageUploaded = (
    uri: string,
    target: { type: 'service'; index: number } | { type: 'package'; packageId: string; index: number }
  ) => {
    if (target.type === 'service') {
      const nextImages = [...workingCopy.images];
      if (target.index < nextImages.length) {
        nextImages[target.index] = uri;
      } else if (nextImages.length < 6) {
        nextImages.push(uri);
      }
      setWorkingCopy((prev) => ({ ...prev, images: nextImages }));
    } else if (target.type === 'package') {
      setWorkingCopy((prev) => ({
        ...prev,
        packages: prev.packages.map((pkg) => {
          if (pkg.id === target.packageId) {
            const nextPkgImages = [...pkg.images];
            if (target.index < nextPkgImages.length) {
              nextPkgImages[target.index] = uri;
            } else if (nextPkgImages.length < 6) {
              nextPkgImages.push(uri);
            }
            return { ...pkg, images: nextPkgImages };
          }
          return pkg;
        }),
      }));
    }
  };

  const handleOpenCamera = async () => {
    const target = photoTarget;
    setPhotoTarget(null);
    if (!target) return;

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to capture photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'] as any,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        handleImageUploaded(result.assets[0].uri, target);
      }
    } catch (e) {
      console.warn('Error taking camera photo:', e);
    }
  };

  const handleChoosePhotos = async () => {
    const target = photoTarget;
    setPhotoTarget(null);
    if (!target) return;

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Photo library permission is required to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'] as any,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        handleImageUploaded(result.assets[0].uri, target);
      }
    } catch (e) {
      console.warn('Error choosing photos:', e);
    }
  };

  // Save changes handler
  const handleSave = () => {
    if (!isValid) {
      setHasAttemptedSave(true);
      const firstKey = missingFieldList[0]?.key;
      if (firstKey && fieldYCoordinates.current[firstKey] !== undefined) {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, fieldYCoordinates.current[firstKey] - 20),
          animated: true,
        });
      }
      return;
    }

    // Commit changes into shared draft context
    commitWorkingCopy(workingCopy);
    // Return to Review
    router.back();
  };

  const headerTitle = `Edit ${workingCopy.name.trim() || draft.name.trim() || 'Service'}`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header: "Edit {service name}" */}
        <EditHeader
          title={headerTitle}
          onBack={() => router.back()}
          onHelp={() => router.push('/guide/general' as any)}
        />

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* ── 1. Add service image (6 slots, no subtitle, NO ✕ badge) ── */}
          <View
            style={styles.fieldSection}
            onLayout={setFieldLayout('image')}
          >
            <Text style={styles.sectionHeaderLabel}>Add service image</Text>

            <View style={styles.imageGrid}>
              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const imgUri = workingCopy.images[idx];

                return (
                  <DashedPhotoSlot
                    key={idx}
                    imageUri={imgUri}
                    isError={hasAttemptedSave && workingCopy.images.length === 0}
                    onPress={() => handleServiceSlotPress(idx)}
                    accessibilityLabel={
                      imgUri
                        ? `Replace service photo ${idx + 1}`
                        : `Add service photo slot ${idx + 1}`
                    }
                  />
                );
              })}
            </View>
          </View>

          {/* ── 2. Service Category ⓘ ── */}
          <View
            style={styles.fieldSection}
            onLayout={setFieldLayout('category')}
          >
            <View style={styles.labelWithInfoRow}>
              <Text style={styles.fieldLabel}>Service Category</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/guide/general' as any)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                accessibilityLabel="Learn about service categories"
              >
                <InfoCircleIcon size={20} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.dropdownField,
                hasAttemptedSave && !workingCopy.category?.itemName && styles.inputErrorBorder,
              ]}
              onPress={() => {
                triggerLightHaptic();
                setIsCategorySheetVisible(true);
              }}
              accessibilityLabel="Select service category"
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.dropdownText,
                  workingCopy.category?.itemName ? styles.filledText : styles.placeholderText,
                ]}
              >
                {workingCopy.category?.itemName || 'Hair cut'}
              </Text>
              <ArrowDown01Icon size={24} />
            </TouchableOpacity>
          </View>

          {/* ── 3. Service Name ⓘ ── */}
          <View
            style={styles.fieldSection}
            onLayout={setFieldLayout('name')}
          >
            <View style={styles.labelWithInfoRow}>
              <Text style={styles.fieldLabel}>Service Name</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/guide/general' as any)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                accessibilityLabel="Learn about service name"
              >
                <InfoCircleIcon size={20} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.textInputField,
                hasAttemptedSave && !workingCopy.name.trim() && styles.inputErrorBorder,
              ]}
              placeholder="Low fade tapper cut"
              placeholderTextColor="rgba(192, 192, 204, 0.96)"
              value={workingCopy.name}
              onChangeText={(text) => handleUpdateField('name', text)}
              accessibilityLabel="Service name"
            />
            {/* 1:1 Helper below input per E1 */}
            <Text style={styles.helperText}>
              This is what customers will see before booking
            </Text>
          </View>

          {/* ── 4. Service Description ⓘ ── */}
          <View
            style={styles.fieldSection}
            onLayout={setFieldLayout('description')}
          >
            <View style={styles.labelWithInfoRow}>
              <Text style={styles.fieldLabel}>Service Description</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/guide/general' as any)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                accessibilityLabel="Learn about service description"
              >
                <InfoCircleIcon size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.descriptionBox}>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Straight-Back Cornrow is a clean low fade with braided locs pulled into a back ponytail."
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                value={workingCopy.description}
                onChangeText={(text) => handleUpdateField('description', text)}
                multiline
                textAlignVertical="top"
                accessibilityLabel="Service description"
              />
            </View>
          </View>

          {/* ── 5. Discounts ⓘ ── */}
          <View style={styles.fieldSection}>
            <View style={styles.labelWithInfoRow}>
              <Text style={styles.fieldLabel}>Discounts</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/guide/general' as any)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                accessibilityLabel="Learn about discounts"
              >
                <InfoCircleIcon size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.discountInputField}>
              <Text style={styles.nairaSymbol}>₦</Text>
              <TextInput
                style={styles.discountTextInput}
                placeholder="1,750"
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                value={workingCopy.discountRaw ? formatWithCommas(workingCopy.discountRaw) : ''}
                onChangeText={handleDiscountChange}
                keyboardType="numeric"
                accessibilityLabel="Discount amount in Naira"
              />
            </View>
            {/* 1:1 Helper per E1 */}
            <Text style={styles.discountHelperText}>Not compulsory</Text>
          </View>

          {/* ── 6. Gender Type ── */}
          <View
            style={styles.fieldSection}
            onLayout={setFieldLayout('gender')}
          >
            <Text style={styles.sectionHeaderLabel}>Gender Type</Text>
            {/* 1:1 Subtitle above field per E1 */}
            <Text style={styles.genderSubtitle}>Select what gender this service is for</Text>

            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.dropdownField,
                hasAttemptedSave && !workingCopy.gender.trim() && styles.inputErrorBorder,
              ]}
              onPress={() => {
                triggerLightHaptic();
                setIsGenderSheetVisible(true);
              }}
              accessibilityLabel="Select gender type"
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.dropdownText,
                  workingCopy.gender ? styles.filledText : styles.placeholderText,
                ]}
              >
                {workingCopy.gender || 'Male only'}
              </Text>
              <ArrowDown01Icon size={24} />
            </TouchableOpacity>
          </View>

          {/* ── 7. Service Price & Duration ── */}
          <View
            style={styles.fieldSection}
            onLayout={setFieldLayout('price')}
          >
            <Text style={styles.sectionHeaderLabel}>Service Price & Duration</Text>

            <View style={styles.twoColumnRow}>
              {/* Left: Price */}
              <View style={styles.columnItem}>
                <Text style={styles.subFieldLabel}>Price</Text>
                <View
                  style={[
                    styles.priceInputField,
                    hasAttemptedSave &&
                      (workingCopy.price === null || workingCopy.price <= 0) &&
                      styles.inputErrorBorder,
                  ]}
                >
                  <View style={styles.currencyPrefixContainer}>
                    <Text style={styles.currencyPrefixText}>NGN</Text>
                  </View>
                  <View style={styles.priceDivider} />
                  <Text style={styles.nairaSymbol}>₦</Text>
                  <TextInput
                    style={styles.priceTextInput}
                    placeholder="0.00"
                    placeholderTextColor="rgba(192, 192, 204, 0.96)"
                    value={workingCopy.priceRaw ? formatWithCommas(workingCopy.priceRaw) : ''}
                    onChangeText={handlePriceChange}
                    keyboardType="numeric"
                    accessibilityLabel="Service price in Naira"
                  />
                </View>
              </View>

              {/* Right: Duration */}
              <View style={styles.columnItem} onLayout={setFieldLayout('duration')}>
                <Text style={styles.subFieldLabel}>Service Duration</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.dropdownField,
                    hasAttemptedSave && !workingCopy.duration.trim() && styles.inputErrorBorder,
                  ]}
                  onPress={() => {
                    triggerLightHaptic();
                    setActiveDurationTarget('service');
                    setIsDurationSheetVisible(true);
                  }}
                  accessibilityLabel="Select service duration"
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      workingCopy.duration ? styles.filledText : styles.placeholderText,
                    ]}
                  >
                    {workingCopy.duration || '1:30 hr'}
                  </Text>
                  <ArrowDown01Icon size={24} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ── 8. Service Package (Reused PackageBlockList) ── */}
          <View style={styles.fieldSection}>
            <PackageBlockList
              packages={workingCopy.packages}
              mode="edit"
              showSectionHeader={true}
              showSubtitle={false}
              showRemoveBadge={true}
              onAddPackage={handleAddPackage}
              onUpdatePackage={handleUpdatePackage}
              onSlotPress={handlePackageSlotPress}
              onRemoveImage={handleRemovePackageImage}
              onOpenGuide={() => router.push('/guide/general' as any)}
              onDurationPress={(pkgId) => {
                setActiveDurationTarget(pkgId);
                setIsDurationSheetVisible(true);
              }}
            />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* ── Sticky Save changes Footer ── */}
        <EditFooter
          isDirty={isDirty}
          onSave={handleSave}
          errorText={firstMissingField}
          showErrorToast={hasAttemptedSave && !isValid}
          saveLabel="Save changes"
        />

        <NativeDockSpacer />

        {/* ── Modal Sheets ── */}
        <ServiceCategorySheet
          visible={isCategorySheetVisible}
          selectedItemId={workingCopy.category?.id}
          onSelectCategory={(cat) => handleUpdateField('category', cat)}
          onClose={() => setIsCategorySheetVisible(false)}
        />

        <GenderSelectionSheet
          visible={isGenderSheetVisible}
          selectedGender={workingCopy.gender}
          onSelectGender={(gender) => handleUpdateField('gender', gender)}
          onClose={() => setIsGenderSheetVisible(false)}
        />

        <ServiceDurationSheet
          visible={isDurationSheetVisible}
          selectedDuration={
            activeDurationTarget === 'service'
              ? workingCopy.duration
              : workingCopy.packages.find((p) => p.id === activeDurationTarget)?.duration || ''
          }
          onSelectDuration={(display) => {
            if (activeDurationTarget === 'service') {
              handleUpdateField('duration', display);
            } else if (activeDurationTarget) {
              handleUpdatePackage(activeDurationTarget, { duration: display });
            }
            setIsDurationSheetVisible(false);
            setActiveDurationTarget(null);
          }}
          onClose={() => {
            setIsDurationSheetVisible(false);
            setActiveDurationTarget(null);
          }}
        />

        <ProviderPhotoUploadSheet
          visible={photoTarget !== null}
          title="Photo Upload"
          onOpenCamera={handleOpenCamera}
          onChoosePhotos={handleChoosePhotos}
          onSelectFile={handleChoosePhotos}
          onClose={() => setPhotoTarget(null)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  fieldSection: {
    width: '100%',
    marginBottom: 32,
  },
  sectionHeaderLabel: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    marginBottom: 16,
  },
  labelWithInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  fieldLabel: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  helperText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    marginTop: 8,
  },
  genderSubtitle: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    marginBottom: 12,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  slotWrapper: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 24,
  },
  imageSlotFilled: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    resizeMode: 'cover',
  },
  imageSlotEmpty: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  dropdownField: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  dropdownText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
  },
  filledText: {
    color: 'rgba(0, 8, 20, 0.96)',
  },
  placeholderText: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  textInputField: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    paddingHorizontal: 16,
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  descriptionBox: {
    minHeight: 140,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    padding: 16,
  },
  descriptionInput: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    minHeight: 100,
  },
  discountInputField: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  discountTextInput: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
  },
  discountHelperText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    marginTop: 8,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 16,
  },
  columnItem: {
    flex: 1,
  },
  subFieldLabel: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    marginBottom: 8,
  },
  priceInputField: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  currencyPrefixContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 6,
  },
  currencyPrefixText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  priceDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginHorizontal: 4,
  },
  nairaSymbol: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    marginRight: 2,
  },
  priceTextInput: {
    flex: 1,
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
  },
  inputErrorBorder: {
    borderColor: 'rgba(204, 41, 41, 0.9)',
    borderWidth: 1.5,
  },
});

export default EditServiceScreen;
