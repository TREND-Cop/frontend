import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  Keyboard,
  BackHandler,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSafeRouter } from '../../utils/safeNavigation';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Circle } from 'react-native-svg';

import {
  useServiceDraft,
  ServicePackageItem,
  MIN_SERVICE_IMAGES,
} from '../../context/ServiceDraftContext';
import { WizardStepper } from '../../components/wizard/WizardStepper';
import { InfoBanner } from '../../components/wizard/InfoBanner';
import { ServiceCategorySheet } from '../../components/wizard/ServiceCategorySheet';
import { GenderSelectionSheet } from '../../components/wizard/GenderSelectionSheet';
import { ServiceTypeSelectionSheet } from '../../components/wizard/ServiceTypeSelectionSheet';
import { ServiceDurationSheet } from '../../components/wizard/ServiceDurationSheet';
import { ProviderPhotoUploadSheet } from '../../components/ProviderPhotoUploadSheet';
import { PackageBlockList } from '../../components/wizard/PackageBlockList';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { useNativeDock } from '../../utils/useNativeDock';
import { ServiceFormSkeleton } from '../../components/wizard/ServiceFormSkeleton';
import { DashedPhotoSlot } from '../../components/wizard/DashedPhotoSlot';
import { ImageUploadGrid } from '../../components/ImageUploadGrid';
import { triggerLightHaptic } from '../../utils/haptics';
import { getServicePricing, formatNaira } from '../../utils/servicePricing';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

// ── 1:1 Vector Icons ──────────────────────────────────────────────────────────

function ArrowLeft02Icon({ size = 24, color = '#000814' }: { size?: number; color?: string }) {
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

function AlertTriangleIcon({ size = 18, color = '#D97706' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L1 21h22L12 2z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 9v4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx="12" cy="17" r="1.2" fill={color} />
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

function CircleXToastIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={1.5} />
      <Path
        d="M9 9l6 6M15 9l-6 6"
        stroke="rgba(204, 41, 41, 0.9)"
        strokeWidth={1.8}
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

export const BusinessServicesWizardScreen: React.FC = () => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { hasDock } = useNativeDock();
  const params = useLocalSearchParams<{ skeleton?: string; returnTo?: string }>();
  const shouldReturnToDashboard =
    params.returnTo === 'dashboard' || params.skeleton === 'true';
  const scrollViewRef = useRef<ScrollView>(null);

  // One-time skeleton display when opened via "Add another service" from Congratulations screen
  const [isSkeletonVisible, setIsSkeletonVisible] = useState(params.skeleton === 'true');

  useEffect(() => {
    if (params.skeleton === 'true') {
      const timer = setTimeout(() => {
        setIsSkeletonVisible(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [params.skeleton]);

  const {
    draft,
    setDraftField,
    addImage,
    replaceImage,
    removeImage,
    addPackage,
    updatePackage,
    addPackageImage,
    replacePackageImage,
    removePackageImage,
    resetDraft,
    isStep1Valid,
    firstMissingField,
  } = useServiceDraft();

  // Field layout coordinates for measured auto-scroll
  const fieldOffsets = useRef<Record<string, number>>({});
  const fieldHeights = useRef<Record<string, number>>({});
  const activeFocusedFieldRef = useRef<string | null>(null);
  const currentScrollYRef = useRef<number>(0);
  const [scrollViewVisibleHeight, setScrollViewVisibleHeight] = useState(0);

  // Fallback anchor offsets (in px) calibrated to actual rendered vertical rhythm
  const FIELD_FALLBACK_OFFSETS: Record<string, number> = {
    image: 180,
    category: 480,
    name: 620,
    description: 760,
    discounts: 1020,
    gender: 1180,
    serviceType: 1300,
    priceDuration: 1420,
    package: 1580,
  };

  const setFieldLayout = (key: string) => (e: LayoutChangeEvent) => {
    fieldOffsets.current[key] = e.nativeEvent.layout.y;
    fieldHeights.current[key] = e.nativeEvent.layout.height;
  };

  const activeFieldOffsetRef = useRef<number | undefined>(undefined);

  const scrollToActiveField = useCallback((key?: string | null, customOffset?: number) => {
    const targetKey = key || activeFocusedFieldRef.current;
    if (!targetKey || !scrollViewRef.current) return;

    let targetY: number | undefined;

    if (targetKey === 'packagePrice') {
      const basePackageY = fieldOffsets.current['package'] !== undefined
        ? fieldOffsets.current['package']
        : FIELD_FALLBACK_OFFSETS['package'];
      targetY = (basePackageY || 1580) + (customOffset !== undefined ? customOffset : 440);
    } else if (targetKey === 'packageContents') {
      const basePackageY = fieldOffsets.current['package'] !== undefined
        ? fieldOffsets.current['package']
        : FIELD_FALLBACK_OFFSETS['package'];
      targetY = (basePackageY || 1580) + (customOffset !== undefined ? customOffset : 240);
    } else {
      const measuredY = fieldOffsets.current[targetKey];
      const fallbackY = FIELD_FALLBACK_OFFSETS[targetKey];
      targetY = measuredY !== undefined ? measuredY : fallbackY;
    }

    if (targetY === undefined) return;

    // Scroll so the focused field sits comfortably in the upper third of the viewport
    // (~20px below header), so the user sees the input and blinking cursor directly in front
    // of them without needing to scroll up or down.
    const desiredScrollY = Math.max(0, targetY - 20);

    scrollViewRef.current.scrollTo({
      y: desiredScrollY,
      animated: true,
    });
  }, []);

  // Keyboard height tracking for responsive bottom padding & smooth input scrolling
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const kbH = e?.endCoordinates?.height || 320;
      setKeyboardHeight(kbH);
      if (activeFocusedFieldRef.current) {
        scrollToActiveField(activeFocusedFieldRef.current, activeFieldOffsetRef.current);
        setTimeout(() => {
          scrollToActiveField(activeFocusedFieldRef.current, activeFieldOffsetRef.current);
        }, 50);
        setTimeout(() => {
          scrollToActiveField(activeFocusedFieldRef.current, activeFieldOffsetRef.current);
        }, 150);
        setTimeout(() => {
          scrollToActiveField(activeFocusedFieldRef.current, activeFieldOffsetRef.current);
        }, 300);
      }
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
      activeFocusedFieldRef.current = null;
      activeFieldOffsetRef.current = undefined;
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [scrollToActiveField]);

  const handleFocusField = useCallback((key: string, innerOffset?: number) => {
    activeFocusedFieldRef.current = key;
    activeFieldOffsetRef.current = innerOffset;
    // The very moment the user clicks on an input field, scroll immediately to place
    // the cursor and input in plain sight in front of the user
    scrollToActiveField(key, innerOffset);
    setTimeout(() => scrollToActiveField(key, innerOffset), 60);
    setTimeout(() => scrollToActiveField(key, innerOffset), 180);
    setTimeout(() => scrollToActiveField(key, innerOffset), 320);
  }, [scrollToActiveField]);

  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Active target for Photo Upload sheet
  // 'service' or { packageId: string, index?: number }
  const [photoUploadTarget, setPhotoUploadTarget] = useState<{
    type: 'service' | 'package';
    packageId?: string;
    slotIndex?: number;
  } | null>(null);

  // Sheet modals
  const [categorySheetVisible, setCategorySheetVisible] = useState(false);
  const [genderSheetVisible, setGenderSheetVisible] = useState(false);
  const [serviceTypeSheetVisible, setServiceTypeSheetVisible] = useState(false);

  // Duration sheet target: 'service' or packageId
  const [activeDurationTarget, setActiveDurationTarget] = useState<'service' | string | null>(null);

  // Price & Discount local display states (avoids caret jumping while typing)
  const [displayPrice, setDisplayPrice] = useState(draft.priceRaw ? formatWithCommas(draft.priceRaw) : '');
  const [displayDiscount, setDisplayDiscount] = useState(
    draft.discountRaw ? formatWithCommas(draft.discountRaw) : ''
  );

  useEffect(() => {
    if (draft.priceRaw && !displayPrice) {
      setDisplayPrice(formatWithCommas(draft.priceRaw));
    }
  }, [draft.priceRaw]);

  useEffect(() => {
    if (draft.discountRaw && !displayDiscount) {
      setDisplayDiscount(formatWithCommas(draft.discountRaw));
    }
  }, [draft.discountRaw]);

  // Back action: clears draft and returns to dashboard when coming from "Add another service"
  // (or when no prior non-wizard screen exists), otherwise pops back normally.
  const handleBack = useCallback(() => {
    triggerLightHaptic();
    resetDraft();
    if (shouldReturnToDashboard || !safeRouter.canGoBack()) {
      safeRouter.resetRoot('/dashboard' as any);
    } else {
      safeRouter.back();
    }
  }, [resetDraft, safeRouter, shouldReturnToDashboard]);

  // Intercept Android hardware back only while Step 1 is focused so Step 2/3/Guide back navigation works normally
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android' || !shouldReturnToDashboard) return undefined;
      const onBackPress = () => {
        handleBack();
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [handleBack, shouldReturnToDashboard])
  );

  // Header '?' tutorial guide
  const handleHeaderHelp = () => {
    triggerLightHaptic();
    safeRouter.push('/guide/general' as any);
  };

  // ⓘ Info buttons
  const handleOpenGuide = (topic: string) => {
    triggerLightHaptic();
    safeRouter.push(`/guide/${topic}` as any);
  };

  // ── Photo Upload Handlers ───────────────────────────────────────────────────
  const handleSlotPress = (type: 'service' | 'package', slotIndex: number, packageId?: string) => {
    triggerLightHaptic();
    setPhotoUploadTarget({ type, slotIndex, packageId });
  };

  const handleOpenCamera = async () => {
    const target = photoUploadTarget;
    setPhotoUploadTarget(null);
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
        const uri = result.assets[0].uri;
        if (target.type === 'service') {
          if (target.slotIndex !== undefined && target.slotIndex < draft.images.length) {
            replaceImage(target.slotIndex, uri);
          } else {
            addImage(uri);
          }
        } else if (target.type === 'package' && target.packageId) {
          const pkg = draft.packages.find((p) => p.id === target.packageId);
          if (pkg && target.slotIndex !== undefined && target.slotIndex < pkg.images.length) {
            replacePackageImage(target.packageId, target.slotIndex, uri);
          } else {
            addPackageImage(target.packageId, uri);
          }
        }
      }
    } catch (e) {
      console.warn('Error taking camera photo:', e);
    }
  };

  const handleChoosePhotos = async () => {
    const target = photoUploadTarget;
    setPhotoUploadTarget(null);
    if (!target) return;

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Photo library permission is required to select photos.');
        return;
      }

      if (target.type === 'service') {
        const isReplacing = target.slotIndex !== undefined && target.slotIndex < draft.images.length;
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'] as any,
          quality: 0.8,
          allowsMultipleSelection: !isReplacing,
          selectionLimit: isReplacing ? 1 : Math.max(1, 6 - draft.images.length),
        });

        if (!result.canceled && result.assets) {
          if (isReplacing && result.assets[0]) {
            replaceImage(target.slotIndex!, result.assets[0].uri);
          } else {
            result.assets.forEach((a) => addImage(a.uri));
          }
        }
      } else if (target.type === 'package' && target.packageId) {
        const pkg = draft.packages.find((p) => p.id === target.packageId);
        const isReplacing = pkg && target.slotIndex !== undefined && target.slotIndex < pkg.images.length;

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'] as any,
          quality: 0.8,
          allowsMultipleSelection: !isReplacing,
          selectionLimit: isReplacing ? 1 : Math.max(1, 6 - (pkg?.images.length || 0)),
        });

        if (!result.canceled && result.assets) {
          if (isReplacing && result.assets[0]) {
            replacePackageImage(target.packageId, target.slotIndex!, result.assets[0].uri);
          } else {
            result.assets.forEach((a) => addPackageImage(target.packageId!, a.uri));
          }
        }
      }
    } catch (e) {
      console.warn('Error choosing photos:', e);
    }
  };

  // ── Price Input Handlers ────────────────────────────────────────────────────
  const handlePriceChange = (text: string) => {
    let cleaned = text.replace(/[^0-9.]/g, '');
    const decimalCount = (cleaned.match(/\./g) || []).length;
    if (decimalCount > 1) {
      const parts = cleaned.split('.');
      cleaned = `${parts[0]}.${parts.slice(1).join('')}`;
    }

    setDisplayPrice(cleaned);
    setDraftField('priceRaw', cleaned);

    const num = parseFloat(cleaned);
    if (!isNaN(num) && num > 0) {
      setDraftField('price', num);
    } else {
      setDraftField('price', null);
    }
  };

  const handlePriceBlur = () => {
    setDisplayPrice((current) => (current ? formatWithCommas(current) : ''));
  };

  const handlePriceFocus = () => {
    setDisplayPrice((current) => (current ? current.replace(/,/g, '') : ''));
  };

  // ── Discount Amount Input Handlers ──────────────────────────────────────────
  const handleDiscountChange = (text: string) => {
    let cleaned = text.replace(/[^0-9.]/g, '');
    const decimalCount = (cleaned.match(/\./g) || []).length;
    if (decimalCount > 1) {
      const parts = cleaned.split('.');
      cleaned = `${parts[0]}.${parts.slice(1).join('')}`;
    }

    setDisplayDiscount(cleaned);
    setDraftField('discountRaw', cleaned);

    const num = parseFloat(cleaned);
    if (!isNaN(num) && num > 0) {
      setDraftField('discount', num);
    } else {
      setDraftField('discount', null);
    }
  };

  const handleDiscountBlur = () => {
    setDisplayDiscount((current) => (current ? formatWithCommas(current) : ''));
  };

  const handleDiscountFocus = () => {
    setDisplayDiscount((current) => (current ? current.replace(/,/g, '') : ''));
  };

  // Live discount preview calculation
  const discountPricing = useMemo(() => {
    if (!draft.discount || draft.discount <= 0) return null;
    return getServicePricing(draft.price, draft.discount);
  }, [draft.price, draft.discount]);

  const isDiscountExceeding = Boolean(
    draft.price && draft.price > 0 && draft.discount && draft.discount >= draft.price
  );

  const discountPreviewText = useMemo(() => {
    if (!draft.discount || draft.discount <= 0) return null;
    if (draft.price && draft.price > 0) {
      if (draft.discount >= draft.price) {
        return `⚠️ Discount (${formatNaira(draft.discount)}) cannot exceed service price (${formatNaira(draft.price)})`;
      }
      if (discountPricing?.hasDiscount) {
        return `🎉 ${formatNaira(draft.discount)} discount applied (${discountPricing.percentOff}% OFF) • Client pays ${discountPricing.displayPrice}`;
      }
    }
    return `🏷️ ${formatNaira(draft.discount)} discount will be applied to the service price`;
  }, [draft.discount, draft.price, discountPricing]);

  // ── Package Block Field Handlers ────────────────────────────────────────────
  const handlePackagePriceChange = (packageId: string, text: string) => {
    let cleaned = text.replace(/[^0-9.]/g, '');
    const decimalCount = (cleaned.match(/\./g) || []).length;
    if (decimalCount > 1) {
      const parts = cleaned.split('.');
      cleaned = `${parts[0]}.${parts.slice(1).join('')}`;
    }
    const num = parseFloat(cleaned);
    updatePackage(packageId, {
      priceRaw: cleaned,
      price: !isNaN(num) && num > 0 ? num : null,
    });
  };

  // ── Next Button & Measured Auto-Scroll ──────────────────────────────────────
  const filledServiceImagesCount = draft.images.filter(Boolean).length;

  const handlePressNext = () => {
    triggerLightHaptic();

    if (!isStep1Valid) {
      setHasAttemptedSubmit(true);

      // Identify first invalid field in strict form order
      let firstKey = '';
      if (filledServiceImagesCount < MIN_SERVICE_IMAGES) firstKey = 'image';
      else if (!draft.category || !draft.category.itemName) firstKey = 'category';
      else if (!draft.name.trim()) firstKey = 'name';
      else if (!draft.gender.trim()) firstKey = 'gender';
      else if (!draft.serviceType.trim()) firstKey = 'serviceType';
      else if (draft.price === null || draft.price <= 0) firstKey = 'priceDuration';
      else if (!draft.duration.trim()) firstKey = 'priceDuration';

      if (firstKey && fieldOffsets.current[firstKey] !== undefined) {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, fieldOffsets.current[firstKey] - 32),
          animated: true,
        });
      }
      return;
    }

    // Step 1 completed successfully -> Step 2
    safeRouter.push('/business-services-staff' as any);
  };

  // Error highlighting state flags
  const showImageError = hasAttemptedSubmit && filledServiceImagesCount < MIN_SERVICE_IMAGES;
  const showCategoryError = hasAttemptedSubmit && (!draft.category || !draft.category.itemName);
  const showNameError = hasAttemptedSubmit && !draft.name.trim();
  const showGenderError = hasAttemptedSubmit && !draft.gender.trim();
  const showTypeError = hasAttemptedSubmit && !draft.serviceType.trim();
  const showPriceError = hasAttemptedSubmit && (draft.price === null || draft.price <= 0);
  const showDurationError = hasAttemptedSubmit && !draft.duration.trim();

  if (isSkeletonVisible) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ServiceFormSkeleton />
      </SafeAreaView>
    );
  }

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
            accessibilityLabel="Back to service list"
          >
            <ArrowLeft02Icon size={24} color="rgba(0, 8, 20, 0.96)" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Add Services</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerIconButton}
            onPress={handleHeaderHelp}
            accessibilityLabel="General help guide"
          >
            <HelpCircleIcon size={24} color="#141B34" />
          </TouchableOpacity>
        </View>

        {/* ── Scrollable Form Body ── */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            setScrollViewVisibleHeight(h);
            if (activeFocusedFieldRef.current) {
              setTimeout(() => scrollToActiveField(), 60);
            }
          }}
          onScroll={(e) => {
            currentScrollYRef.current = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: (keyboardHeight > 0 ? keyboardHeight : 340) + 160,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'on-drag' : 'none'}
        >
          {/* ── 2. Stepper ── */}
          <View style={styles.stepperWrapper}>
            <WizardStepper currentStep={1} />
          </View>

          {/* ── 3. InfoBanner (Corrected typo: "you must first upload") ── */}
          <View style={styles.infoBannerWrapper}>
            <InfoBanner text="For clients to book an appointment in your salon, you must first upload a service." />
          </View>

          {/* ── 4. Service Images Warning Tag + 6 Slots ── */}
          <View style={styles.fieldSection} onLayout={setFieldLayout('image')}>
            <View
              style={[
                styles.warningBanner,
                showImageError ? styles.warningBannerError : null,
              ]}
            >
              <View style={styles.warningHeader}>
                <View style={styles.warningTitleRow}>
                  <AlertTriangleIcon
                    size={18}
                    color={showImageError ? '#DC2626' : '#D97706'}
                  />
                  <Text
                    style={[
                      styles.warningTitle,
                      showImageError ? styles.warningTitleError : null,
                    ]}
                    numberOfLines={1}
                  >
                    Service images
                  </Text>
                </View>
                <View
                  style={[
                    styles.warningBadge,
                    filledServiceImagesCount >= MIN_SERVICE_IMAGES
                      ? styles.warningBadgeSuccess
                      : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.warningBadgeText,
                      filledServiceImagesCount >= MIN_SERVICE_IMAGES
                        ? styles.warningBadgeTextSuccess
                        : null,
                    ]}
                  >
                    {filledServiceImagesCount >= MIN_SERVICE_IMAGES
                      ? `✓ ${filledServiceImagesCount} added`
                      : `${filledServiceImagesCount} / ${MIN_SERVICE_IMAGES} required`}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.warningBody,
                  showImageError ? styles.warningBodyError : null,
                ]}
              >
                Upload minimum of 3 images and a maximum of 6 images and different angles of the image you wish to upload.
              </Text>
            </View>

            <ImageUploadGrid
              images={draft.images}
              maxImages={6}
              columns={3}
              columnGap={24}
              rowGap={16}
              borderRadius={24}
              cameraSize={24}
              isError={showImageError}
              showRemoveBadge={true}
              onSlotPress={(index) => handleSlotPress('service', index)}
              onRemoveImage={(index) => removeImage(index)}
              accessibilityLabelPrefix="Service photo"
            />
          </View>

          {/* ── 5. Service Category ⓘ ── */}
          <View style={styles.fieldSection} onLayout={setFieldLayout('category')}>
            <View style={styles.labelWithInfoRow}>
              <Text style={styles.fieldLabel}>Service Category</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleOpenGuide('service-category')}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                accessibilityLabel="Learn about service category"
              >
                <InfoCircleIcon size={20} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.dropdownField,
                showCategoryError && styles.errorBorder,
              ]}
              onPress={() => {
                triggerLightHaptic();
                setCategorySheetVisible(true);
              }}
            >
              <Text
                style={[
                  styles.dropdownText,
                  draft.category?.itemName ? styles.filledText : styles.placeholderText,
                ]}
                numberOfLines={1}
              >
                {draft.category?.itemName || 'Hair cuts'}
              </Text>
              <ArrowDown01Icon size={24} color="rgba(0, 8, 20, 0.96)" />
            </TouchableOpacity>

            <Text style={styles.helperText}>Select what category your service belongs</Text>
          </View>

          {/* ── 6. Service Name ⓘ ── */}
          <View style={styles.fieldSection} onLayout={setFieldLayout('name')}>
            <View style={styles.labelWithInfoRow}>
              <Text style={styles.fieldLabel}>Service Name</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleOpenGuide('service-name')}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                accessibilityLabel="Learn about service name"
              >
                <InfoCircleIcon size={20} />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputField, showNameError && styles.errorBorder]}>
              <TextInput
                style={styles.textInput}
                placeholder="Tapper Fade"
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                value={draft.name}
                onChangeText={(text) => setDraftField('name', text)}
                onFocus={() => handleFocusField('name')}
                autoCapitalize="words"
              />
            </View>

            <Text style={[styles.helperText, showNameError && styles.helperTextError]}>
              This is the name of the service clients see before booking the service
            </Text>
          </View>

          {/* ── 7. Service Description ⓘ (Optional) ── */}
          <View style={styles.fieldSection} onLayout={setFieldLayout('description')}>
            <View style={styles.labelWithInfoRow}>
              <Text style={styles.fieldLabel}>Service Description</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleOpenGuide('service-description')}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                accessibilityLabel="Learn about service description"
              >
                <InfoCircleIcon size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.descriptionBox}>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Write about the service type eg. maintenance etc"
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                value={draft.description}
                onChangeText={(text) => setDraftField('description', text)}
                onFocus={() => handleFocusField('description')}
                multiline
                textAlignVertical="top"
              />
            </View>

            <Text style={styles.helperText}>
              Write about this service and everything a client needs to know about it.
            </Text>
          </View>

          {/* ── 8. Discounts ⓘ (Amount input per v2) ── */}
          <View style={styles.fieldSection} onLayout={setFieldLayout('discounts')}>
            <View style={styles.labelWithInfoRow}>
              <Text style={styles.fieldLabel}>Discounts</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleOpenGuide('discounts')}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                accessibilityLabel="Learn about discounts"
              >
                <InfoCircleIcon size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputField}>
              <TextInput
                style={styles.textInput}
                placeholder="Discount amount E.g ₦ 1,000"
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                value={displayDiscount}
                onChangeText={handleDiscountChange}
                onBlur={handleDiscountBlur}
                onFocus={() => {
                  handleDiscountFocus();
                  handleFocusField('discounts');
                }}
                keyboardType="numeric"
                multiline={false}
                numberOfLines={1}
                scrollEnabled={true}
              />
            </View>

            {/* Live Discount Calculation Feedback Pill */}
            {discountPreviewText ? (
              <View
                style={[
                  styles.discountFeedbackPill,
                  isDiscountExceeding
                    ? styles.discountFeedbackPillWarning
                    : styles.discountFeedbackPillSuccess,
                ]}
              >
                <Text
                  style={[
                    styles.discountFeedbackText,
                    isDiscountExceeding
                      ? styles.discountFeedbackTextWarning
                      : styles.discountFeedbackTextSuccess,
                  ]}
                  numberOfLines={2}
                >
                  {discountPreviewText}
                </Text>
              </View>
            ) : null}

            <Text style={styles.helperText}>
              Would you like to offer discounts to clients for booking this service? Enter discount amount below
            </Text>
          </View>

          {/* ── 9. Gender Type ── */}
          <View style={styles.fieldSection} onLayout={setFieldLayout('gender')}>
            <Text style={styles.sectionHeaderLabel}>Gender Type</Text>

            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.dropdownField, showGenderError && styles.errorBorder]}
              onPress={() => {
                triggerLightHaptic();
                setGenderSheetVisible(true);
              }}
            >
              <Text
                style={[
                  styles.dropdownText,
                  draft.gender ? styles.filledText : styles.placeholderText,
                ]}
              >
                {draft.gender || 'All Gender'}
              </Text>
              <ArrowDown01Icon size={24} color="rgba(0, 8, 20, 0.96)" />
            </TouchableOpacity>

            <Text style={styles.helperText}>What gender can use this service?</Text>
          </View>

          {/* ── 10. Service Type ── */}
          <View style={styles.fieldSection} onLayout={setFieldLayout('serviceType')}>
            <Text style={styles.sectionHeaderLabel}>Service Type</Text>

            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.dropdownField, showTypeError && styles.errorBorder]}
              onPress={() => {
                triggerLightHaptic();
                setServiceTypeSheetVisible(true);
              }}
            >
              <Text
                style={[
                  styles.dropdownText,
                  draft.serviceType ? styles.filledText : styles.placeholderText,
                ]}
              >
                {draft.serviceType || 'Home service'}
              </Text>
              <ArrowDown01Icon size={24} color="rgba(0, 8, 20, 0.96)" />
            </TouchableOpacity>

            <Text style={styles.helperText}>How can client receive the service?</Text>
          </View>

          {/* ── 11. Service Price & Duration (Two Columns) ── */}
          <View style={styles.fieldSection} onLayout={setFieldLayout('priceDuration')}>
            <Text style={styles.sectionHeaderLabel}>Service Price & Duration</Text>

            <View style={styles.twoColumnRow}>
              {/* Left Column: Price */}
              <View style={styles.columnItem}>
                <Text style={styles.subFieldLabel}>Price</Text>
                <View
                  style={[
                    styles.priceInputField,
                    showPriceError && styles.errorBorder,
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
                    value={displayPrice}
                    onChangeText={handlePriceChange}
                    onBlur={handlePriceBlur}
                    onFocus={() => {
                      handlePriceFocus();
                      handleFocusField('priceDuration');
                    }}
                    keyboardType="numeric"
                    multiline={false}
                    numberOfLines={1}
                    scrollEnabled={true}
                  />
                </View>
              </View>

              {/* Right Column: Duration */}
              <View style={styles.columnItem}>
                <Text style={styles.subFieldLabel}>Duration</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.dropdownField,
                    !draft.duration && styles.dropdownFieldInactive,
                    showDurationError && styles.errorBorder,
                  ]}
                  onPress={() => {
                    triggerLightHaptic();
                    setActiveDurationTarget('service');
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      draft.duration ? styles.filledText : styles.placeholderText,
                    ]}
                  >
                    {draft.duration || '1 hr'}
                  </Text>
                  <ArrowDown01Icon
                    size={24}
                    color={draft.duration ? 'rgba(0, 8, 20, 0.96)' : 'rgba(192, 192, 204, 0.96)'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ── 12. Service Package (Shared PackageBlockList in Create Mode) ── */}
          <View style={styles.fieldSection} onLayout={setFieldLayout('package')}>
            <PackageBlockList
              packages={draft.packages}
              mode="create"
              showSectionHeader={true}
              showSubtitle={true}
              showRemoveBadge={true}
              onAddPackage={addPackage}
              onUpdatePackage={updatePackage}
              onSlotPress={(pkgId, slotIdx) => handleSlotPress('package', slotIdx, pkgId)}
              onRemoveImage={(pkgId, slotIdx) => removePackageImage(pkgId, slotIdx)}
              onOpenGuide={handleOpenGuide}
              onDurationPress={(pkgId) => {
                triggerLightHaptic();
                setActiveDurationTarget(pkgId);
              }}
              onFocusContents={(pkgId, offset) => handleFocusField('packageContents', offset)}
              onFocusPrice={(pkgId, offset) => handleFocusField('packagePrice', offset)}
            />
          </View>
        </ScrollView>

        {/* ── 13. Sticky Footer & Toast Indicator ── */}
        <View
          style={[
            styles.stickyFooter,
            {
              paddingTop: 12,
              paddingBottom: hasDock ? 14 : Math.max(insets.bottom, 14),
            },
          ]}
        >
          {hasAttemptedSubmit && firstMissingField && (
            <View style={styles.toastContainer}>
              <View style={styles.toastPill}>
                <CircleXToastIcon size={24} />
                <Text style={styles.toastText} numberOfLines={1}>
                  {firstMissingField}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.nextButton,
              isStep1Valid ? styles.nextButtonEnabled : styles.nextButtonDisabled,
            ]}
            onPress={handlePressNext}
          >
            <Text
              style={[
                styles.nextButtonText,
                isStep1Valid ? styles.nextTextEnabled : styles.nextTextDisabled,
              ]}
            >
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ── Modals & Sheets ─────────────────────────────────────────────────── */}

      {/* 1. Photo Upload Sheet (with Open Camera, Choose from photos, Select from file) */}
      <ProviderPhotoUploadSheet
        visible={photoUploadTarget !== null}
        title="Photo Upload"
        onOpenCamera={handleOpenCamera}
        onChoosePhotos={handleChoosePhotos}
        onSelectFile={handleChoosePhotos}
        onClose={() => setPhotoUploadTarget(null)}
      />

      {/* 2. Service Category Sheet */}
      <ServiceCategorySheet
        visible={categorySheetVisible}
        selectedItemId={draft.category?.id}
        onSelectCategory={(cat) => setDraftField('category', cat)}
        onClose={() => setCategorySheetVisible(false)}
      />

      {/* 3. Gender Selection Sheet */}
      <GenderSelectionSheet
        visible={genderSheetVisible}
        selectedGender={draft.gender}
        onSelectGender={(val) => setDraftField('gender', val)}
        onClose={() => setGenderSheetVisible(false)}
      />

      {/* 4. Service Type Selection Sheet */}
      <ServiceTypeSelectionSheet
        visible={serviceTypeSheetVisible}
        selectedType={draft.serviceType}
        onSelectType={(val) => setDraftField('serviceType', val)}
        onClose={() => setServiceTypeSheetVisible(false)}
      />

      {/* 5. Service Duration Sheet (Preset + Custom Wheel Picker) */}
      <ServiceDurationSheet
        visible={activeDurationTarget !== null}
        selectedDuration={
          activeDurationTarget === 'service'
            ? draft.duration
            : draft.packages.find((p) => p.id === activeDurationTarget)?.duration
        }
        onSelectDuration={(display) => {
          if (activeDurationTarget === 'service') {
            setDraftField('duration', display);
          } else if (activeDurationTarget) {
            updatePackage(activeDurationTarget, { duration: display });
          }
          setActiveDurationTarget(null);
        }}
        onClose={() => setActiveDurationTarget(null)}
      />

      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </SafeAreaView>
  );
};

export default BusinessServicesWizardScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },

  /* Header: 64px height, padding 8px 16px */
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
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
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  stepperWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 36,
  },
  infoBannerWrapper: {
    width: '100%',
    marginBottom: 40,
  },

  fieldSection: {
    width: '100%',
    marginBottom: 40,
  },
  /* Service Images Warning Notice Banner (1:1 parity with BusinessPhotosScreen) */
  warningBanner: {
    width: '100%',
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 14,
    marginBottom: 20,
  },
  warningBannerError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  warningTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  warningTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    includeFontPadding: false,
  },
  warningTitleError: {
    color: '#991B1B',
  },
  warningBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  warningBadgeSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  warningBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 12,
    fontWeight: '500',
    color: '#B45309',
    includeFontPadding: false,
  },
  warningBadgeTextSuccess: {
    color: '#047857',
  },
  warningBody: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: '#78350F',
    includeFontPadding: false,
  },
  warningBodyError: {
    color: '#7F1D1D',
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
    includeFontPadding: false,
  },
  sectionHeaderLabel: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    marginBottom: 12,
    includeFontPadding: false,
  },
  fieldSubtitle: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    marginBottom: 20,
    includeFontPadding: false,
  },
  subFieldLabel: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    marginBottom: 10,
    includeFontPadding: false,
  },
  helperText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    marginTop: 10,
    includeFontPadding: false,
  },
  helperTextError: {
    color: 'rgba(204, 41, 41, 0.9)',
  },

  /* ── Image Grid (2 x 3) ── */
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  slotWrapper: {
    width: '31%',
    aspectRatio: 1,
    maxWidth: 104,
    maxHeight: 104,
    borderRadius: 24,
    overflow: 'hidden',
  },
  emptyImageSlot: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledImageSlot: {
    backgroundColor: '#F2F2F7',
  },
  errorImageSlot: {
    borderColor: 'rgba(204, 41, 41, 0.9)',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  /* ── Dropdown & Inputs ── */
  dropdownField: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  dropdownFieldInactive: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderColor: 'rgba(247, 247, 247, 0.96)',
  },
  dropdownText: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  placeholderText: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  filledText: {
    color: 'rgba(0, 8, 20, 0.96)',
  },

  inputField: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  textInput: {
    width: '100%',
    minWidth: 0,
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
    includeFontPadding: false,
  },

  descriptionBox: {
    width: '100%',
    height: 112,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    padding: 16,
  },
  descriptionInput: {
    width: '100%',
    height: '100%',
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },

  twoColumnRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  columnItem: {
    flex: 1,
    minWidth: 0,
  },

  priceInputField: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 6,
    overflow: 'hidden',
    minWidth: 0,
  },
  currencyPrefixContainer: {
    paddingRight: 6,
    flexShrink: 0,
  },
  currencyPrefixText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  priceDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginRight: 4,
    flexShrink: 0,
  },
  nairaSymbol: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
    flexShrink: 0,
  },
  priceTextInput: {
    flex: 1,
    minWidth: 0,
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
    includeFontPadding: false,
  },

  /* ── Package Section ── */
  packageCard: {
    width: '100%',
    height: 56,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  packageCardTitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
    includeFontPadding: false,
  },
  packagePlusButton: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedPackageBlock: {
    width: '100%',
    backgroundColor: 'rgba(247, 247, 247, 0.6)',
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
  },
  packageImagesLabel: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    marginBottom: 12,
  },

  errorBorder: {
    borderColor: 'rgba(204, 41, 41, 0.9)',
  },

  /* ── Sticky Footer ── */
  stickyFooter: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  toastContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  toastPill: {
    height: 44,
    borderRadius: 24,
    backgroundColor: 'rgba(204, 41, 41, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    alignSelf: 'center',
  },
  toastText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  nextButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  nextButtonEnabled: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  nextButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    includeFontPadding: false,
  },
  nextTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  nextTextEnabled: {
    color: '#FFFFFF',
  },
  discountFeedbackPill: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  discountFeedbackPillSuccess: {
    backgroundColor: 'rgba(12, 121, 12, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(12, 121, 12, 0.25)',
  },
  discountFeedbackPillWarning: {
    backgroundColor: 'rgba(204, 41, 41, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(204, 41, 41, 0.25)',
  },
  discountFeedbackText: {
    fontFamily: FONT_REGULAR,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  discountFeedbackTextSuccess: {
    color: '#0C790C',
  },
  discountFeedbackTextWarning: {
    color: '#CC2929',
  },
});
