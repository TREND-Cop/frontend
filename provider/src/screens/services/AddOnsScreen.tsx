import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Image,
  KeyboardAvoidingView,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Circle } from 'react-native-svg';

import { useServiceDraft, AddOnItem, createEmptyAddOn } from '../../context/ServiceDraftContext';
import { WizardStepper } from '../../components/wizard/WizardStepper';
import { ServiceDurationSheet } from '../../components/wizard/ServiceDurationSheet';
import { ProviderPhotoUploadSheet } from '../../components/ProviderPhotoUploadSheet';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { triggerLightHaptic } from '../../utils/haptics';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

// ── 1:1 Vector Icons ──────────────────────────────────────────────────────────

function ArrowLeft02Icon({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.57 5.93L3.5 12L9.57 18.07"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.5 12H3.67"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function HelpCircleIcon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
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

function PlusIcon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5v14M5 12h14"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

// ── Red ✕ Badge Icon for Image Removal (24x24 inside 40x40 touch area) ────────
function CircleXBadgeIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill="rgba(204, 41, 41, 0.9)" stroke="rgba(204, 41, 41, 0.9)" strokeWidth={1.5} />
      <Path
        d="M9 9l6 6M15 9l-6 6"
        stroke="#FFFFFF"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ── Number Formatting Helper ──────────────────────────────────────────────────
function formatWithCommas(value: string): string {
  if (!value) return '';
  const clean = value.replace(/,/g, '');
  const parts = clean.split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (parts.length > 1) {
    return `${integerPart}.${parts[1]}`;
  }
  return integerPart;
}

/**
 * 1:1 Figma AddOnsScreen (Step 3 of 4-step Business Services Wizard)
 *
 * Implements:
 * - F1: Empty form (Next greyed)
 * - F2: Filled form (Next dark, image with red ✕ badge)
 * - F3: Extra add-on blocks stacked below "Add more add-ons"
 * - F4: Dimmed LoadingOverlay (4 dots)
 * - Skip button: clears addOns and navigates to Review without overlay
 * - Next button: active only when block 1 is complete and all started blocks are complete
 */
export const AddOnsScreen: React.FC = () => {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    draft,
    setAddOns,
    updateAddOn,
    addAddOnBlock,
    removeAddOnImage,
    isStep3Valid,
  } = useServiceDraft();

  // Ensure there is at least 1 add-on block on mount
  useEffect(() => {
    if (draft.addOns.length === 0) {
      setAddOns([createEmptyAddOn('initial')]);
    }
  }, [draft.addOns.length, setAddOns]);

  // Loading overlay state
  const [isLoading, setIsLoading] = useState(false);

  // Photo upload sheet target: addOnId
  const [photoUploadTargetId, setPhotoUploadTargetId] = useState<string | null>(null);

  // Duration sheet target: addOnId
  const [activeDurationTargetId, setActiveDurationTargetId] = useState<string | null>(null);

  // Store layout y-positions of blocks for auto-scroll
  const blockOffsets = useRef<Record<string, number>>({});
  const setBlockLayout = (id: string) => (e: LayoutChangeEvent) => {
    blockOffsets.current[id] = e.nativeEvent.layout.y;
  };

  // Back button returns to Step 2 with draft intact
  const handleBack = () => {
    triggerLightHaptic();
    router.back();
  };

  // Header "?" tutorial guide
  const handleHeaderHelp = () => {
    triggerLightHaptic();
    router.push('/guide/general' as any);
  };

  // ── Photo Upload Handlers ───────────────────────────────────────────────────
  const handleOpenCamera = async () => {
    const targetId = photoUploadTargetId;
    setPhotoUploadTargetId(null);
    if (!targetId) return;

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true,
        aspect: [360, 221],
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        updateAddOn(targetId, { imageUri: result.assets[0].uri });
      }
    } catch (e) {
      console.warn('Error launching camera:', e);
    }
  };

  const handleChoosePhotos = async () => {
    const targetId = photoUploadTargetId;
    setPhotoUploadTargetId(null);
    if (!targetId) return;

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'] as any,
        quality: 0.8,
        allowsEditing: true,
        aspect: [360, 221],
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        updateAddOn(targetId, { imageUri: result.assets[0].uri });
      }
    } catch (e) {
      console.warn('Error choosing photos:', e);
    }
  };

  // ── Price Input Handlers ────────────────────────────────────────────────────
  const handlePriceChange = (id: string, text: string) => {
    let cleaned = text.replace(/[^0-9.]/g, '');
    const decimalCount = (cleaned.match(/\./g) || []).length;
    if (decimalCount > 1) {
      const parts = cleaned.split('.');
      cleaned = `${parts[0]}.${parts.slice(1).join('')}`;
    }

    const num = parseFloat(cleaned);
    updateAddOn(id, {
      priceRaw: cleaned,
      price: !isNaN(num) && num > 0 ? num : null,
    });
  };

  // ── Add More Add-ons Handler ────────────────────────────────────────────────
  const handleAddMoreBlock = () => {
    triggerLightHaptic();
    const newBlock = createEmptyAddOn();
    setAddOns([...draft.addOns, newBlock]);

    // Automatically scroll to reveal the newly added block
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  // ── Skip Button Handler ─────────────────────────────────────────────────────
  const handlePressSkip = () => {
    triggerLightHaptic();
    // Skip means "no add-ons": clear draft's addOns
    setAddOns([]);
    // Directly navigate to Review placeholder with NO loading overlay
    router.push('/business-services-review' as any);
  };

  // ── Next Button Handler ─────────────────────────────────────────────────────
  const handlePressNext = () => {
    if (!isStep3Valid) {
      // Incomplete -> does nothing
      return;
    }

    triggerLightHaptic();

    // Drop any completely blank extra blocks
    const cleanedAddOns = draft.addOns.filter((item, index) => {
      if (index === 0) return true; // Block 1 is already verified complete
      const isBlank =
        !item.imageUri &&
        !item.name.trim() &&
        !item.description.trim() &&
        !item.priceRaw.trim() &&
        !item.duration.trim();
      return !isBlank;
    });

    setAddOns(cleanedAddOns);
    setIsLoading(true);

    // Mock loading delay (800-1200ms) per Figma note
    // TODO (Backend): Replace with real API dispatch
    setTimeout(() => {
      setIsLoading(false);
      router.push('/business-services-review' as any);
    }, 1000);
  };

  const addOnsList = draft.addOns.length > 0 ? draft.addOns : [createEmptyAddOn('initial')];
  const firstBlock = addOnsList[0];
  const extraBlocks = addOnsList.slice(1);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── 1. Page Header (64px, "Add Services", help "?" button) ── */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerIconButton}
            onPress={handleBack}
            accessibilityLabel="Back to step 2"
          >
            <ArrowLeft02Icon size={24} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Add Services</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerIconButton}
            onPress={handleHeaderHelp}
            accessibilityLabel="Service tutorial guide"
          >
            <HelpCircleIcon size={24} />
          </TouchableOpacity>
        </View>

        {/* ── 2. Wizard Stepper (Step 3 active: 4 steps, width 358px, height 48px) ── */}
        <View style={styles.stepperContainer}>
          <WizardStepper currentStep={3} />
        </View>

        {/* ── 3. Scrollable Add-ons Form ── */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Section Heading & Intro */}
          <Text style={styles.screenHeading}>Add-ons</Text>
          <Text style={styles.introText}>
            Add-ons are optional services customers can include with their service, e.g. anti-dandruff treatment.
          </Text>

          {/* ── First Add-on Block ── */}
          <View style={styles.blockContainer} onLayout={setBlockLayout(firstBlock.id)}>
            {/* 1. Add Image Slot */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabelMed}>Add image</Text>

              {firstBlock.imageUri ? (
                // Filled Image Box (360x221px, cover, red ✕ badge at bottom right)
                <View style={styles.filledImageBox}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.imageTouchable}
                    onPress={() => setPhotoUploadTargetId(firstBlock.id)}
                    accessibilityLabel="Replace photo"
                  >
                    <Image
                      source={{ uri: firstBlock.imageUri }}
                      style={styles.filledImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>

                  {/* Red ✕ Badge (40x40px touch area) */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.removeBadgeButton}
                    onPress={() => {
                      triggerLightHaptic();
                      removeAddOnImage(firstBlock.id);
                    }}
                    accessibilityLabel="Remove photo"
                  >
                    <CircleXBadgeIcon size={24} />
                  </TouchableOpacity>
                </View>
              ) : (
                // Empty Dashed Box (360x221px, radius 24px)
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.emptyImageBox}
                  onPress={() => {
                    triggerLightHaptic();
                    setPhotoUploadTargetId(firstBlock.id);
                  }}
                  accessibilityLabel="Add add-on photo"
                >
                  <CameraIcon size={24} color="#141B34" />
                </TouchableOpacity>
              )}
            </View>

            {/* 2. Add-ons Name */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabelMed}>Add-ons Name</Text>
              <TextInput
                style={styles.inputField}
                placeholder="E.g. Anti Dandruff"
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                value={firstBlock.name}
                onChangeText={(text) => updateAddOn(firstBlock.id, { name: text })}
                accessibilityLabel="Add-ons Name"
              />
            </View>

            {/* 3. Description (max 50 chars, countdown counter) */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabelRegular}>Description</Text>
              <View style={styles.descriptionBox}>
                <TextInput
                  style={styles.descriptionInput}
                  placeholder="Write about the add-ons eg. Anti Dandruff"
                  placeholderTextColor="rgba(192, 192, 204, 0.96)"
                  value={firstBlock.description}
                  onChangeText={(text) => updateAddOn(firstBlock.id, { description: text.slice(0, 50) })}
                  maxLength={50}
                  multiline
                  textAlignVertical="top"
                  accessibilityLabel="Add-on Description"
                />
                <Text style={styles.charCounter}>
                  {50 - (firstBlock.description ? firstBlock.description.length : 0)}
                </Text>
              </View>
              <Text style={styles.helperText}>Write a few words about this Add-ons</Text>
            </View>

            {/* 4. Price and Duration (Two Columns) */}
            <View style={styles.fieldSection}>
              <Text style={styles.subHeadingMed}>Price and duration</Text>
              <View style={styles.twoColumnRow}>
                {/* Left: Price */}
                <View style={styles.columnItem}>
                  <Text style={styles.fieldLabelMedGrey}>Price</Text>
                  <View style={styles.priceInputField}>
                    <View style={styles.currencyPrefixContainer}>
                      <Text style={styles.currencyPrefixText}>NGN</Text>
                    </View>
                    <View style={styles.priceDivider} />
                    <Text style={styles.nairaSymbol}>₦</Text>
                    <TextInput
                      style={styles.priceTextInput}
                      placeholder="0.00"
                      placeholderTextColor="rgba(192, 192, 204, 0.96)"
                      value={firstBlock.priceRaw ? formatWithCommas(firstBlock.priceRaw) : ''}
                      onChangeText={(t) => handlePriceChange(firstBlock.id, t)}
                      keyboardType="numeric"
                      accessibilityLabel="Add-on Price"
                    />
                  </View>
                </View>

                {/* Right: Duration */}
                <View style={styles.columnItem}>
                  <Text style={styles.fieldLabelMedGrey}>Service Duration</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.dropdownField}
                    onPress={() => {
                      triggerLightHaptic();
                      setActiveDurationTargetId(firstBlock.id);
                    }}
                    accessibilityLabel="Add-on Duration"
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        firstBlock.duration ? styles.filledText : styles.placeholderText,
                      ]}
                    >
                      {firstBlock.duration || '1 hr'}
                    </Text>
                    <ArrowDown01Icon size={24} color="rgba(0, 8, 20, 0.96)" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* ── 4. "Add more add-ons" Section Row ── */}
          <View style={styles.addMoreSection}>
            <Text style={styles.subHeadingMed}>Add more add-ons</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.addMoreCard}
              onPress={handleAddMoreBlock}
              accessibilityRole="button"
              accessibilityLabel="Add more add-ons"
            >
              <Text style={styles.addMoreCardLabel}>Add-ons</Text>
              <View style={styles.addMorePlusButton}>
                <PlusIcon size={24} color="#141B34" />
              </View>
            </TouchableOpacity>
          </View>

          {/* ── 5. Extra Add-on Blocks Stacked Below ── */}
          {extraBlocks.map((block, index) => (
            <View
              key={block.id}
              style={[styles.blockContainer, { marginTop: 24 }]}
              onLayout={setBlockLayout(block.id)}
            >
              {/* Add Image Slot */}
              <View style={styles.fieldSection}>
                <Text style={styles.fieldLabelMed}>Add image</Text>

                {block.imageUri ? (
                  <View style={styles.filledImageBox}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.imageTouchable}
                      onPress={() => setPhotoUploadTargetId(block.id)}
                      accessibilityLabel="Replace photo"
                    >
                      <Image
                        source={{ uri: block.imageUri }}
                        style={styles.filledImage}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.removeBadgeButton}
                      onPress={() => {
                        triggerLightHaptic();
                        removeAddOnImage(block.id);
                      }}
                      accessibilityLabel="Remove photo"
                    >
                      <CircleXBadgeIcon size={24} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.emptyImageBox}
                    onPress={() => {
                      triggerLightHaptic();
                      setPhotoUploadTargetId(block.id);
                    }}
                    accessibilityLabel="Add extra add-on photo"
                  >
                    <CameraIcon size={24} color="#141B34" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Add-ons Name (Extra Block Placeholder: "E.g. Hot towel massage") */}
              <View style={styles.fieldSection}>
                <Text style={styles.fieldLabelMed}>Add-ons Name</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="E.g. Hot towel massage"
                  placeholderTextColor="rgba(192, 192, 204, 0.96)"
                  value={block.name}
                  onChangeText={(text) => updateAddOn(block.id, { name: text })}
                  accessibilityLabel="Add-ons Name"
                />
              </View>

              {/* Description (Extra Block Placeholder: "Write about the add-ons eg. After shave hot towel") */}
              <View style={styles.fieldSection}>
                <Text style={styles.fieldLabelRegular}>Description</Text>
                <View style={styles.descriptionBox}>
                  <TextInput
                    style={styles.descriptionInput}
                    placeholder="Write about the add-ons eg. After shave hot towel"
                    placeholderTextColor="rgba(192, 192, 204, 0.96)"
                    value={block.description}
                    onChangeText={(text) => updateAddOn(block.id, { description: text.slice(0, 50) })}
                    maxLength={50}
                    multiline
                    textAlignVertical="top"
                    accessibilityLabel="Add-on Description"
                  />
                  <Text style={styles.charCounter}>
                    {50 - (block.description ? block.description.length : 0)}
                  </Text>
                </View>
                <Text style={styles.helperText}>Write a few words about this Add-ons</Text>
              </View>

              {/* Price and Duration */}
              <View style={styles.fieldSection}>
                <Text style={styles.subHeadingMed}>Price and duration</Text>
                <View style={styles.twoColumnRow}>
                  {/* Left: Price */}
                  <View style={styles.columnItem}>
                    <Text style={styles.fieldLabelMedGrey}>Price</Text>
                    <View style={styles.priceInputField}>
                      <View style={styles.currencyPrefixContainer}>
                        <Text style={styles.currencyPrefixText}>NGN</Text>
                      </View>
                      <View style={styles.priceDivider} />
                      <Text style={styles.nairaSymbol}>₦</Text>
                      <TextInput
                        style={styles.priceTextInput}
                        placeholder="0.00"
                        placeholderTextColor="rgba(192, 192, 204, 0.96)"
                        value={block.priceRaw ? formatWithCommas(block.priceRaw) : ''}
                        onChangeText={(t) => handlePriceChange(block.id, t)}
                        keyboardType="numeric"
                        accessibilityLabel="Add-on Price"
                      />
                    </View>
                  </View>

                  {/* Right: Duration */}
                  <View style={styles.columnItem}>
                    <Text style={styles.fieldLabelMedGrey}>Service Duration</Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.dropdownField}
                      onPress={() => {
                        triggerLightHaptic();
                        setActiveDurationTargetId(block.id);
                      }}
                      accessibilityLabel="Add-on Duration"
                    >
                      <Text
                        style={[
                          styles.dropdownText,
                          block.duration ? styles.filledText : styles.placeholderText,
                        ]}
                      >
                        {block.duration || '1 hr'}
                      </Text>
                      <ArrowDown01Icon size={24} color="rgba(0, 8, 20, 0.96)" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}

          {/* Bottom spacer before sticky footer */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* ── 6. Sticky Footer (Skip + Next) ── */}
        <View style={styles.stickyFooter}>
          {/* Skip Button (112x48px, light grey pill) */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.skipButton}
            onPress={handlePressSkip}
            accessibilityRole="button"
            accessibilityLabel="Skip add-ons"
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>

          {/* Next Button (230x48px, wide pill) */}
          <TouchableOpacity
            activeOpacity={isStep3Valid ? 0.85 : 1}
            style={[
              styles.nextButton,
              isStep3Valid ? styles.nextButtonEnabled : styles.nextButtonDisabled,
            ]}
            onPress={handlePressNext}
            accessibilityRole="button"
            accessibilityLabel="Next to review step"
          >
            <Text
              style={[
                styles.nextButtonText,
                isStep3Valid ? styles.nextTextEnabled : styles.nextTextDisabled,
              ]}
            >
              Next
            </Text>
          </TouchableOpacity>
        </View>

        <NativeDockSpacer backgroundColor="#FFFFFF" />
      </KeyboardAvoidingView>

      {/* ── 7. Modals Reused From Step 1 ── */}

      {/* Photo Upload Sheet */}
      <ProviderPhotoUploadSheet
        visible={photoUploadTargetId !== null}
        title="Photo Upload"
        onOpenCamera={handleOpenCamera}
        onChoosePhotos={handleChoosePhotos}
        onSelectFile={handleChoosePhotos}
        onClose={() => setPhotoUploadTargetId(null)}
      />

      {/* Service Duration Sheet (Presets + Custom Wheel Picker) */}
      <ServiceDurationSheet
        visible={activeDurationTargetId !== null}
        selectedDuration={
          activeDurationTargetId
            ? addOnsList.find((b) => b.id === activeDurationTargetId)?.duration || ''
            : ''
        }
        onSelectDuration={(formattedDisplay) => {
          if (activeDurationTargetId) {
            updateAddOn(activeDurationTargetId, { duration: formattedDisplay });
          }
          setActiveDurationTargetId(null);
        }}
        onClose={() => setActiveDurationTargetId(null)}
      />

      {/* Dimmed Loading Overlay (F4: 4 dots, blocks touches) */}
      <LoadingOverlay
        visible={isLoading}
        dotsCount={4}
        dotSize={10}
        dotGap={12}
        overlayOpacity={0.1}
        dotColor="rgba(0, 8, 20, 0.96)"
      />
    </SafeAreaView>
  );
};

export default AddOnsScreen;

// ── Styles (1:1 Figma Measurements from CSS Spec) ─────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },

  // 1. Header (64px, padding: 8px 16px)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 64,
    backgroundColor: '#FFFFFF',
  },
  headerIconButton: {
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

  // 2. Stepper Container
  stepperContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
    alignItems: 'center',
  },

  // Scroll Area
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },

  // Heading & Intro (F2-F4 Copy)
  screenHeading: {
    fontFamily: FONT_MEDIUM,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    marginBottom: 8,
  },
  introText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    marginBottom: 24,
  },

  // Add-on Block Container
  blockContainer: {
    gap: 24,
  },
  fieldSection: {
    gap: 8,
  },
  fieldLabelMed: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
  },
  fieldLabelMedGrey: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  fieldLabelRegular: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  subHeadingMed: {
    fontFamily: FONT_MEDIUM,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
  },

  // 1. Add Image Box (360x221px, radius 24px)
  emptyImageBox: {
    width: '100%',
    height: 221,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filledImageBox: {
    width: '100%',
    height: 221,
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  imageTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  filledImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  removeBadgeButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 2. Add-ons Name Input (360x48px, radius 24px)
  inputField: {
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // 3. Description Box (360x147px, radius 24px)
  descriptionBox: {
    height: 147,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    padding: 16,
    position: 'relative',
  },
  descriptionInput: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingTop: 0,
    paddingBottom: 24,
  },
  charCounter: {
    position: 'absolute',
    right: 16,
    bottom: 12,
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  helperText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // 4. Two Columns: Price & Duration
  twoColumnRow: {
    flexDirection: 'row',
    gap: 16,
  },
  columnItem: {
    flex: 1,
    gap: 8,
  },
  priceInputField: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
    gap: 8,
  },
  currencyPrefixContainer: {
    justifyContent: 'center',
  },
  currencyPrefixText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  priceDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  nairaSymbol: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  priceTextInput: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
  },

  dropdownField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  dropdownText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
  },
  filledText: {
    color: 'rgba(0, 8, 20, 0.96)',
  },
  placeholderText: {
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // 5. "Add more add-ons" Section (height: 56px, background #F7F7F7)
  addMoreSection: {
    marginTop: 32,
    gap: 16,
  },
  addMoreCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  addMoreCardLabel: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  addMorePlusButton: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 6. Sticky Footer (Skip: 112px, Next: 230px, height: 80px, shadow)
  stickyFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.6)',
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
    gap: 16,
  },
  skipButton: {
    width: 112,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  nextButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonEnabled: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  nextButtonText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  nextTextEnabled: {
    color: '#FFFFFF',
  },
  nextTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
});
