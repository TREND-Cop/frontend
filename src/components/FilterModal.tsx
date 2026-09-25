import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Platform,
  PanResponder,
  KeyboardAvoidingView,
  Keyboard,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import {
  X,
  Star,
  ShieldCheck,
  Check,
} from 'lucide-react-native';

import { MOCK_SALONS, SalonItem } from '../screens/home/mockSalons';
import { typography } from '../constants/theme';

export interface FilterState {
  recentFilters: string[];
  amenities: string[];
  verification: 'all' | 'verified' | 'non-verified';
  openingTime: string;
  closingTime: string;
  minPrice: number;
  maxPrice: number;
  distance: 'all' | 'nearby' | 'more';
  gender: 'all' | 'unisex' | 'female' | 'male';
  rating: number;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  currentFilters?: Partial<FilterState>;
  hasAppliedFilters?: boolean;
  onReset?: () => void;
  totalFilteredCount?: number | string;
  items?: SalonItem[];
  countMatcher?: (filters: FilterState) => number;
}

// Exact realistic price steps for the 23 histogram bars matching real salon prices
export const PRICE_STEPS = [
  5000, 7500, 10000, 12500, 15000, 17500, 20000, 22500, 25000, 30000,
  35000, 40000, 45000, 50000, 60000, 70000, 80000, 90000, 100000, 120000,
  140000, 160000, 200000,
];

// Histogram bar heights matching Figma specs (Rectangle 253 to 275)
const HISTOGRAM_BARS = [
  5, 5, 5, 10, 5, 15, 24, 10, 20, 32, 20, 32, 53, 45, 32, 40, 58, 45, 24, 10, 5, 5, 10,
];

// ── Custom SVG Icons for Amenities ──
const BusIcon = ({ color }: { color: string }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 17h2l.64-2.54a6 6 0 0 0 .36-2.06V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v5.4a6 6 0 0 0 .36 2.06L3 17h2" />
    <Path d="M16 17H8" />
    <Path d="M4 11h16" />
    <Circle cx="6.5" cy="17.5" r="2.5" />
    <Circle cx="16.5" cy="17.5" r="2.5" />
  </Svg>
);

const WifiIcon = ({ color }: { color: string }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <Path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <Path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <Circle cx="12" cy="20" r="1" fill={color} />
  </Svg>
);

const PoolIcon = ({ color }: { color: string }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M2 19c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1" />
    <Path d="M2 22c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1" />
    <Path d="M16 3a3 3 0 0 0-3 3v8" />
    <Path d="M8 3a3 3 0 0 0-3 3v8" />
    <Path d="M8 7h8" />
    <Path d="M8 11h8" />
  </Svg>
);

const SaunaIcon = ({ color }: { color: string }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 10h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10Z" />
    <Path d="M7 10V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" />
    <Path d="M12 4v6" />
    <Path d="M8 15h.01" />
    <Path d="M12 15h.01" />
    <Path d="M16 15h.01" />
  </Svg>
);

const DogIcon = ({ color }: { color: string }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M10 5.172a2 2 0 0 0-3.414 1.414l.016 4.828" />
    <Path d="M14 5.172a2 2 0 0 1 3.414 1.414l-.016 4.828" />
    <Path d="M8.5 14h7" />
    <Path d="M12 17v-2" />
    <Path d="M4 11.5A3.5 3.5 0 0 1 7.5 8h9a3.5 3.5 0 0 1 3.5 3.5v3a4.5 4.5 0 0 1-4.5 4.5h-7A4.5 4.5 0 0 1 4 14.5v-3Z" />
  </Svg>
);

const AirVentIcon = ({ color }: { color: string }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 12H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <Path d="M6 8h12" />
    <Path d="M18.3 17.7a2.5 2.5 0 0 1-3.16 3.83l-.2-.17a2.5 2.5 0 0 1-.34-3.32" />
    <Path d="M14.5 14.5a2.5 2.5 0 0 1-3.16 3.83l-.2-.17a2.5 2.5 0 0 1-.34-3.32" />
  </Svg>
);

const ParkingIcon = ({ color }: { color: string }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <Rect width="18" height="18" x="3" y="3" rx="2" />
    <Path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
  </Svg>
);

const WheelchairIcon = ({ color }: { color: string }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="4" r="2" />
    <Path d="M10 10l3 3h4" />
    <Path d="M10 10v7a4 4 0 0 0 4 4h2" />
    <Path d="M8 15a5 5 0 1 1 0-10" />
  </Svg>
);

const RateAmenityIcon = ({ color }: { color: string }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

// ── Verified Blue Badge (Figma: 16x16, accent background with white check) ──
const VerifiedBadge = () => (
  <View style={styles.verifiedBadge}>
    <Check size={10} color="#FFFFFF" strokeWidth={3} />
  </View>
);

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  currentFilters,
  hasAppliedFilters = false,
  onReset,
  totalFilteredCount,
  items,
  countMatcher,
}) => {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android' ? Math.max(insets.bottom, 56) : Math.max(insets.bottom, 16);
  const screenHeight = Dimensions.get('window').height;
  const sheetHeight = Math.min(588 + (bottomInset - 16), screenHeight * 0.9);

  // ── Recent Filter Chips State (defaults to empty unless provided in currentFilters) ──
  const [recentFilters, setRecentFilters] = useState<string[]>(
    currentFilters?.recentFilters || []
  );

  // ── Filter State ──
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    currentFilters?.amenities || []
  );
  const [verification, setVerification] = useState<'all' | 'verified' | 'non-verified'>(
    currentFilters?.verification || 'all'
  );
  const [openingTime, setOpeningTime] = useState<string>(currentFilters?.openingTime || '');
  const [closingTime, setClosingTime] = useState<string>(currentFilters?.closingTime || '');
  const [distance, setDistance] = useState<'all' | 'nearby' | 'more'>(
    currentFilters?.distance || 'all'
  );
  const [gender, setGender] = useState<'all' | 'unisex' | 'female' | 'male'>(
    currentFilters?.gender || 'all'
  );
  const [rating, setRating] = useState<number>(currentFilters?.rating || 0);

  // ── Histogram Range Indices (0 to 22) ──
  const [minBarIndex, setMinBarIndex] = useState<number>(() => {
    if (currentFilters?.minPrice !== undefined) {
      const idx = PRICE_STEPS.findIndex((p) => p >= currentFilters.minPrice!);
      return idx !== -1 ? idx : 0;
    }
    return 0;
  });
  const [maxBarIndex, setMaxBarIndex] = useState<number>(() => {
    if (currentFilters?.maxPrice !== undefined) {
      const idx = PRICE_STEPS.findIndex((p) => p >= currentFilters.maxPrice!);
      return idx !== -1 ? idx : 22;
    }
    return 22;
  });
  const [customAmount, setCustomAmount] = useState<string>('');

  // Derived price numbers
  const minPrice = PRICE_STEPS[minBarIndex];
  const maxPrice = PRICE_STEPS[maxBarIndex];

  // Sync with currentFilters when opened
  useEffect(() => {
    if (visible) {
      setRecentFilters(currentFilters?.recentFilters || []);
      setDistance(currentFilters?.distance || 'all');
      setVerification(currentFilters?.verification || 'all');
      setSelectedAmenities(currentFilters?.amenities || []);
      setOpeningTime(currentFilters?.openingTime || '');
      setClosingTime(currentFilters?.closingTime || '');
      setGender(currentFilters?.gender || 'all');
      setRating(currentFilters?.rating || 0);

      if (currentFilters?.minPrice !== undefined) {
        const minIdx = PRICE_STEPS.findIndex((p) => p >= currentFilters.minPrice!);
        setMinBarIndex(minIdx !== -1 ? minIdx : 0);
      } else {
        setMinBarIndex(0);
      }
      if (currentFilters?.maxPrice !== undefined) {
        const maxIdx = PRICE_STEPS.findIndex((p) => p >= currentFilters.maxPrice!);
        setMaxBarIndex(maxIdx !== -1 ? maxIdx : 22);
      } else {
        setMaxBarIndex(22);
      }
    }
  }, [visible, currentFilters]);

  // Toggle amenity helper
  const toggleAmenity = (name: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  // Remove single recent filter chip dynamically
  const removeRecentFilter = (chip: string) => {
    setRecentFilters((prev) => prev.filter((c) => c !== chip));
    if (chip.includes('₦')) {
      setMinBarIndex(0);
      setMaxBarIndex(22);
    } else if (chip.includes('⭐') || chip === '1.0' || (!isNaN(parseFloat(chip)) && !chip.includes('am') && !chip.includes('pm'))) {
      setRating(0);
    } else if (chip.includes('Verified')) {
      setVerification('all');
    } else if (chip.includes('am') || chip.includes('pm')) {
      if (['6:00am', '8:00am', '10:00am'].includes(chip)) {
        setOpeningTime('');
      } else {
        setClosingTime('');
      }
    } else if (chip === 'Nearby' || chip === 'More Places') {
      setDistance('all');
    } else if (chip === 'Unisex' || chip === 'Female' || chip === 'Male') {
      setGender('all');
    } else {
      setSelectedAmenities((prev) => prev.filter((a) => a !== chip));
    }
  };

  // Clear all recent filters and reset all active filter states
  const clearAllRecentFilters = () => {
    setRecentFilters([]);
    setSelectedAmenities([]);
    setVerification('all');
    setOpeningTime('');
    setClosingTime('');
    setMinBarIndex(0);
    setMaxBarIndex(22);
    setCustomAmount('');
    setDistance('all');
    setGender('all');
    setRating(0);
  };

  // Reset all filters to default
  const handleReset = () => {
    setSelectedAmenities([]);
    setVerification('all');
    setOpeningTime('');
    setClosingTime('');
    setMinBarIndex(0);
    setMaxBarIndex(22);
    setCustomAmount('');
    setDistance('all');
    setGender('all');
    setRating(0);
    setRecentFilters([]);
    onReset?.();
  };

  // Apply filters dynamically
  const handleApply = () => {
    const effectiveMaxPrice = customAmount
      ? (parseInt(customAmount.replace(/[^0-9]/g, ''), 10) || maxPrice)
      : maxPrice;

    const newRecents: string[] = [];
    if (minBarIndex > 0 || maxBarIndex < 22 || customAmount) {
      newRecents.push(`₦${minPrice.toLocaleString()} - ₦${effectiveMaxPrice.toLocaleString()}`);
    }
    if (rating > 0) {
      newRecents.push(`${rating.toFixed(1)}`);
    }
    if (verification === 'verified') {
      newRecents.push('Verified Salons');
    } else if (verification === 'non-verified') {
      newRecents.push('Non Verified Salons');
    }
    if (openingTime) {
      newRecents.push(openingTime);
    }
    if (gender !== 'all') {
      newRecents.push(gender.charAt(0).toUpperCase() + gender.slice(1));
    }
    if (distance === 'nearby') {
      newRecents.push('Nearby');
    } else if (distance === 'more') {
      newRecents.push('More Places');
    }
    selectedAmenities.forEach((a) => newRecents.push(a));

    const finalRecents = Array.from(new Set(newRecents)).slice(0, 6);
    setRecentFilters(finalRecents);

    onApply({
      recentFilters: finalRecents,
      amenities: selectedAmenities,
      verification,
      openingTime,
      closingTime,
      minPrice,
      maxPrice: effectiveMaxPrice,
      distance,
      gender,
      rating,
    });
    onClose();
  };

  // Handle bar click to adjust range interactively
  const handleBarTap = (index: number) => {
    const distToMin = Math.abs(index - minBarIndex);
    const distToMax = Math.abs(index - maxBarIndex);

    if (distToMin < distToMax) {
      if (index <= maxBarIndex) {
        setMinBarIndex(index);
      } else {
        setMinBarIndex(maxBarIndex);
      }
    } else {
      if (index >= minBarIndex) {
        setMaxBarIndex(index);
      } else {
        setMaxBarIndex(minBarIndex);
      }
    }
  };

  // ── Price Slider Geometry & Gesture Handling ──
  const THUMB_SIZE = 40;
  const BAR_WIDTH = 7;
  const [sliderWidth, setSliderWidth] = useState<number>(330);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);

  const minBarIndexRef = useRef(minBarIndex);
  minBarIndexRef.current = minBarIndex;
  const maxBarIndexRef = useRef(maxBarIndex);
  maxBarIndexRef.current = maxBarIndex;
  const sliderWidthRef = useRef(sliderWidth);
  sliderWidthRef.current = sliderWidth;

  const dragStartMinRef = useRef(0);
  const dragStartMaxRef = useRef(22);

  const usableWidth = Math.max(1, sliderWidth - THUMB_SIZE);
  const minThumbLeft = (minBarIndex / 22) * usableWidth;
  const maxThumbLeft = (maxBarIndex / 22) * usableWidth;

  const minPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 1 || Math.abs(gestureState.dy) > 1,
        onPanResponderGrant: () => {
          setIsDragging(true);
          setActiveThumb('min');
          dragStartMinRef.current = minBarIndexRef.current;
        },
        onPanResponderMove: (_, gestureState) => {
          const width = Math.max(1, sliderWidthRef.current - THUMB_SIZE);
          const stepPx = width / 22;
          const indexDelta = Math.round(gestureState.dx / stepPx);
          const targetIndex = dragStartMinRef.current + indexDelta;
          const clamped = Math.max(0, Math.min(maxBarIndexRef.current, targetIndex));
          if (clamped !== minBarIndexRef.current) {
            minBarIndexRef.current = clamped;
            setMinBarIndex(clamped);
          }
        },
        onPanResponderRelease: () => {
          setIsDragging(false);
          setActiveThumb(null);
        },
        onPanResponderTerminate: () => {
          setIsDragging(false);
          setActiveThumb(null);
        },
        onPanResponderTerminationRequest: () => false,
      }),
    []
  );

  const maxPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 1 || Math.abs(gestureState.dy) > 1,
        onPanResponderGrant: () => {
          setIsDragging(true);
          setActiveThumb('max');
          dragStartMaxRef.current = maxBarIndexRef.current;
        },
        onPanResponderMove: (_, gestureState) => {
          const width = Math.max(1, sliderWidthRef.current - THUMB_SIZE);
          const stepPx = width / 22;
          const indexDelta = Math.round(gestureState.dx / stepPx);
          const targetIndex = dragStartMaxRef.current + indexDelta;
          const clamped = Math.max(minBarIndexRef.current, Math.min(22, targetIndex));
          if (clamped !== maxBarIndexRef.current) {
            maxBarIndexRef.current = clamped;
            setMaxBarIndex(clamped);
          }
        },
        onPanResponderRelease: () => {
          setIsDragging(false);
          setActiveThumb(null);
        },
        onPanResponderTerminate: () => {
          setIsDragging(false);
          setActiveThumb(null);
        },
        onPanResponderTerminationRequest: () => false,
      }),
    []
  );

  // Dynamic matching results count calculation as user selects filters
  const matchingCount = useMemo(() => {
    const effectiveMaxPrice = customAmount
      ? (parseInt(customAmount.replace(/[^0-9]/g, ''), 10) || maxPrice)
      : maxPrice;

    if (countMatcher) {
      return countMatcher({
        recentFilters,
        amenities: selectedAmenities,
        verification,
        openingTime,
        closingTime,
        minPrice,
        maxPrice: effectiveMaxPrice,
        distance,
        gender,
        rating,
      });
    }

    const targetSalons = items && items.length > 0 ? items : MOCK_SALONS;
    return targetSalons.filter((salon) => {
      // Price range check
      if (minBarIndex > 0 && salon.numericMaxPrice < minPrice) return false;
      if ((maxBarIndex < 22 || customAmount) && salon.numericMinPrice > effectiveMaxPrice) return false;

      // Verification check
      if (verification === 'verified' && !salon.isVerified) return false;
      if (verification === 'non-verified' && salon.isVerified) return false;

      // Distance check
      if (distance === 'nearby' && salon.numericDistance > 5) return false;
      if (distance === 'more' && salon.numericDistance <= 5) return false;

      // Rating check
      if (rating > 0 && salon.rating < rating) return false;

      // Gender check
      if (gender !== 'all') {
        const sGender = salon.gender || 'unisex';
        if (gender === 'male' && sGender === 'female') return false;
        if (gender === 'female' && sGender === 'male') return false;
      }

      // Amenities check (must have all selected amenities)
      if (selectedAmenities.length > 0) {
        const sAmenities = salon.amenities || [];
        if (!selectedAmenities.every((a) => sAmenities.includes(a))) return false;
      }

      // Opening time check
      if (openingTime && salon.openingTime) {
        if (openingTime === '6:00am' && salon.openingTime !== '6:00am') return false;
        if (openingTime === '8:00am' && (salon.openingTime === '9:00am' || salon.openingTime === '10:00am')) return false;
        if (openingTime === '10:00am' && salon.openingTime !== '10:00am' && salon.openingTime !== '9:00am' && salon.openingTime !== '8:00am') return false;
      }

      // Closing time check
      if (closingTime && salon.closingTime) {
        if (closingTime === '12:00am' && salon.closingTime !== '12:00am') return false;
        if (closingTime === '11:00pm' && salon.closingTime === '10:00pm') return false;
      }

      return true;
    }).length;
  }, [
    countMatcher,
    items,
    minBarIndex,
    maxBarIndex,
    minPrice,
    maxPrice,
    customAmount,
    verification,
    distance,
    rating,
    gender,
    selectedAmenities,
    openingTime,
    closingTime,
    recentFilters,
  ]);

  // Dynamic total filtered count display (e.g. '28+', '13', '8')
  const relatedCountText = useMemo(() => {
    return matchingCount >= 20 ? `${matchingCount}+` : `${matchingCount}`;
  }, [matchingCount]);

  const hasRecentFilters = recentFilters.length > 0;
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const [modalRendered, setModalRendered] = useState(visible);
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(800)).current;

  useEffect(() => {
    if (visible) {
      setModalRendered(true);
      backdropAnim.setValue(0);
      sheetTranslateY.setValue(800);
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (modalRendered) {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 800,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalRendered(false);
      });
    }
  }, [visible]);

  const handleAnimatedClose = () => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 800,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalRendered(false);
      onClose();
    });
  };

  return (
    <Modal visible={modalRendered} animationType="none" transparent={true} onRequestClose={handleAnimatedClose}>
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <TouchableOpacity style={styles.backdropPressable} activeOpacity={1} onPress={handleAnimatedClose} />
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <Animated.View
            style={[
              styles.modalSheet,
              {
                height: sheetHeight,
                maxHeight: '92%',
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
            {/* Top Drag Handle Indicator */}
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            {/* ── Header (Figma: height 40px, top 16px, borderBottom at 72px) ── */}
            <View style={styles.header}>
              <View style={styles.headerPlaceholder} />
              <Text style={styles.headerTitle}>Filter</Text>
              <TouchableOpacity style={styles.closeButton} activeOpacity={0.7} onPress={handleAnimatedClose}>
                <X size={20} color="#141B34" />
              </TouchableOpacity>
            </View>

          {/* ── Scrollable Filter Content (Figma: sort content, gap: 40px) ── */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: isKeyboardVisible ? 240 : 48 },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            scrollEnabled={!isDragging}
          >
            {/* ── Dynamic Recent Filtered Section ── */}
            {hasRecentFilters && (
              <View style={styles.recentSection}>
                <View style={styles.recentHeaderRow}>
                  <Text style={styles.recentHeaderTitle}>Recent filtered</Text>
                </View>

                {/* Chips Grid (Figma: searched items) */}
                <View style={styles.chipsContainer}>
                  {recentFilters.map((chip, index) => {
                    const isVerified = chip.includes('Verified');
                    const isStar = chip.includes('⭐') || chip === '1.0' || (!isNaN(parseFloat(chip)) && !chip.includes('₦') && !chip.includes('am') && !chip.includes('pm'));
                    return (
                      <View key={index} style={styles.recentChip}>
                        {isVerified && (
                          <ShieldCheck
                            size={20}
                            color="#1A82FF"
                            fill="#E6F2FF"
                          />
                        )}
                        {isStar ? (
                          <View style={styles.chipRatesRow}>
                            <Star
                              size={20}
                              fill="rgba(248, 155, 24, 0.96)"
                              color="rgba(248, 155, 24, 0.96)"
                            />
                            <Text style={styles.chipText}>{chip.replace('⭐ ', '')}</Text>
                          </View>
                        ) : (
                          <Text style={styles.chipText}>{chip.replace('⭐ ', '')}</Text>
                        )}
                        <TouchableOpacity
                          onPress={() => removeRecentFilter(chip)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          style={styles.chipCancelBtn}
                          activeOpacity={0.7}
                        >
                          <X size={16} color="#141B34" strokeWidth={1.5} />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>

                {/* More Choices Divider Title */}
                <Text style={styles.moreChoicesTitle}>More Choices</Text>
              </View>
            )}

            {/* ── 1. Amenities Section (Figma: Frame 1000006288) ── */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesContainer}>
                {/* Row 1: Public Transport & Wifi */}
                <View style={styles.amenitiesRow}>
                  <TouchableOpacity
                    style={[
                      styles.amenityPill,
                      { flex: 1.1 },
                      selectedAmenities.includes('Public Transport') &&
                        styles.amenityPillActive,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => toggleAmenity('Public Transport')}
                  >
                    <Text
                      style={[
                        styles.amenityText,
                        selectedAmenities.includes('Public Transport') &&
                          styles.amenityTextActive,
                      ]}
                    >
                      Public Transport
                    </Text>
                    <BusIcon
                      color={
                        selectedAmenities.includes('Public Transport')
                          ? '#FFFFFF'
                          : 'rgba(0, 8, 20, 0.96)'
                      }
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.amenityPill,
                      { flex: 0.9 },
                      selectedAmenities.includes('Wifi') && styles.amenityPillActive,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => toggleAmenity('Wifi')}
                  >
                    <Text
                      style={[
                        styles.amenityText,
                        selectedAmenities.includes('Wifi') && styles.amenityTextActive,
                      ]}
                    >
                      Wifi
                    </Text>
                    <WifiIcon
                      color={
                        selectedAmenities.includes('Wifi')
                          ? '#FFFFFF'
                          : 'rgba(0, 8, 20, 0.96)'
                      }
                    />
                  </TouchableOpacity>
                </View>

                {/* Row 2: Pool, Sauna, Pets */}
                <View style={styles.amenitiesRow}>
                  <TouchableOpacity
                    style={[
                      styles.amenityPill,
                      { flex: 1 },
                      selectedAmenities.includes('Pool') && styles.amenityPillActive,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => toggleAmenity('Pool')}
                  >
                    <Text
                      style={[
                        styles.amenityText,
                        selectedAmenities.includes('Pool') && styles.amenityTextActive,
                      ]}
                    >
                      Pool
                    </Text>
                    <PoolIcon
                      color={
                        selectedAmenities.includes('Pool')
                          ? '#FFFFFF'
                          : 'rgba(0, 8, 20, 0.96)'
                      }
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.amenityPill,
                      { flex: 1 },
                      selectedAmenities.includes('Sauna') && styles.amenityPillActive,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => toggleAmenity('Sauna')}
                  >
                    <Text
                      style={[
                        styles.amenityText,
                        selectedAmenities.includes('Sauna') && styles.amenityTextActive,
                      ]}
                    >
                      Sauna
                    </Text>
                    <SaunaIcon
                      color={
                        selectedAmenities.includes('Sauna')
                          ? '#FFFFFF'
                          : 'rgba(0, 8, 20, 0.96)'
                      }
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.amenityPill,
                      { flex: 1 },
                      selectedAmenities.includes('Pets') && styles.amenityPillActive,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => toggleAmenity('Pets')}
                  >
                    <Text
                      style={[
                        styles.amenityText,
                        selectedAmenities.includes('Pets') && styles.amenityTextActive,
                      ]}
                    >
                      Pets
                    </Text>
                    <DogIcon
                      color={
                        selectedAmenities.includes('Pets')
                          ? '#FFFFFF'
                          : 'rgba(0, 8, 20, 0.96)'
                      }
                    />
                  </TouchableOpacity>
                </View>

                {/* Row 3: Air Conditioning & Parking Space */}
                <View style={styles.amenitiesRow}>
                  <TouchableOpacity
                    style={[
                      styles.amenityPill,
                      { flex: 1.2 },
                      selectedAmenities.includes('Air Conditioning') &&
                        styles.amenityPillActive,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => toggleAmenity('Air Conditioning')}
                  >
                    <Text
                      style={[
                        styles.amenityText,
                        selectedAmenities.includes('Air Conditioning') &&
                          styles.amenityTextActive,
                      ]}
                    >
                      Air Conditioning
                    </Text>
                    <AirVentIcon
                      color={
                        selectedAmenities.includes('Air Conditioning')
                          ? '#FFFFFF'
                          : 'rgba(0, 8, 20, 0.96)'
                      }
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.amenityPill,
                      { flex: 1 },
                      selectedAmenities.includes('Parking Space') &&
                        styles.amenityPillActive,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => toggleAmenity('Parking Space')}
                  >
                    <Text
                      style={[
                        styles.amenityText,
                        selectedAmenities.includes('Parking Space') &&
                          styles.amenityTextActive,
                      ]}
                    >
                      Parking Space
                    </Text>
                    <ParkingIcon
                      color={
                        selectedAmenities.includes('Parking Space')
                          ? '#FFFFFF'
                          : 'rgba(0, 8, 20, 0.96)'
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* ── 2. Verification Section (Figma: filter by standard) ── */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Verification</Text>
              <View style={[styles.optionsList, { gap: 16 }]}>
                {/* Verified Location */}
                <TouchableOpacity
                  style={styles.optionRow}
                  activeOpacity={0.7}
                  onPress={() =>
                    setVerification(verification === 'verified' ? 'all' : 'verified')
                  }
                >
                  <View style={styles.optionLabelRow}>
                    <Text style={styles.optionLabel}>Verified Location</Text>
                    <VerifiedBadge />
                  </View>
                  <View
                    style={[
                      styles.radioCircle,
                      verification === 'verified' && styles.radioCircleSelected,
                    ]}
                  >
                    {verification === 'verified' && (
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Non Verified Location */}
                <TouchableOpacity
                  style={styles.optionRow}
                  activeOpacity={0.7}
                  onPress={() =>
                    setVerification(
                      verification === 'non-verified' ? 'all' : 'non-verified'
                    )
                  }
                >
                  <Text style={styles.optionLabel}>Non Verified Location</Text>
                  <View
                    style={[
                      styles.radioCircle,
                      verification === 'non-verified' && styles.radioCircleSelected,
                    ]}
                  >
                    {verification === 'non-verified' && (
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* ── 3. Business Time Section (Opening & Closing Time, gap: 24px) ── */}
            <View style={[styles.sectionContainer, { gap: 24 }]}>
              {/* Opening Time */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Opening Time</Text>
                <View style={styles.timeButtonsRow}>
                  {['6:00am', '8:00am', '10:00am'].map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timePill,
                        openingTime === time && styles.timePillActive,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => setOpeningTime(time)}
                    >
                      <Text
                        style={[
                          styles.timePillText,
                          openingTime === time && styles.timePillTextActive,
                        ]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Closing Time */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Closing Time</Text>
                <View style={styles.timeButtonsRow}>
                  {['11:00pm', '12:00am', '10:00pm'].map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timePill,
                        closingTime === time && styles.timePillActive,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => setClosingTime(time)}
                    >
                      <Text
                        style={[
                          styles.timePillText,
                          closingTime === time && styles.timePillTextActive,
                        ]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* ── 4. Price Range Section (Figma: user price range and indicator) ── */}
            <View style={styles.priceRangeSection}>
              <Text style={styles.sectionTitle}>Price Range</Text>

              {/* Price Chart and Indicator */}
              <View
                style={styles.priceChartContainer}
                onLayout={(e) => {
                  const w = e.nativeEvent.layout.width;
                  if (w > 0 && Math.abs(w - sliderWidth) > 2) {
                    setSliderWidth(w);
                  }
                }}
              >
                {/* Histogram Bars Indicator */}
                <View style={styles.histogramBarsContainer}>
                  {HISTOGRAM_BARS.map((height, i) => {
                    const barCenter = THUMB_SIZE / 2 + (i / 22) * usableWidth;
                    const barLeft = barCenter - BAR_WIDTH / 2;
                    const isBarActive = i >= minBarIndex && i <= maxBarIndex;
                    return (
                      <TouchableOpacity
                        key={i}
                        activeOpacity={0.8}
                        onPress={() => handleBarTap(i)}
                        style={[
                          styles.barTouchWrapper,
                          {
                            left: barLeft - 4,
                            width: BAR_WIDTH + 8,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.singleBar,
                            {
                              height,
                              width: BAR_WIDTH,
                              backgroundColor: isBarActive
                                ? 'rgba(204, 41, 41, 0.9)'
                                : 'rgba(192, 192, 204, 0.96)',
                            },
                          ]}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Base Track Line with Drag Handles */}
                <View style={styles.sliderBaseLineContainer}>
                  {/* Underlying grey track line across full width */}
                  <View style={styles.sliderBaseLineGrey} />

                  {/* Active Red Track Line between the two thumbs */}
                  <View
                    style={[
                      styles.sliderActiveSegment,
                      {
                        left: minThumbLeft + THUMB_SIZE / 2,
                        width: Math.max(0, maxThumbLeft - minThumbLeft),
                      },
                    ]}
                  />

                  {/* Min Handle with Drag Text */}
                  <View
                    {...minPanResponder.panHandlers}
                    style={[
                      styles.dragHandleWrapper,
                      {
                        left: minThumbLeft,
                        zIndex: activeThumb === 'min' ? 12 : 6,
                      },
                    ]}
                  >
                    <View style={styles.sliderHandle} />
                    <Text style={styles.dragLabel}>Drag</Text>
                  </View>

                  {/* Max Handle with Drag Text */}
                  <View
                    {...maxPanResponder.panHandlers}
                    style={[
                      styles.dragHandleWrapper,
                      {
                        left: maxThumbLeft,
                        zIndex: activeThumb === 'max' ? 12 : 7,
                      },
                    ]}
                  >
                    <View style={styles.sliderHandle} />
                    <Text style={styles.dragLabel}>Drag</Text>
                  </View>
                </View>

                {/* Price Range Input Display Boxes (Figma: 132x76px, padding 8x16) */}
                <View style={styles.priceBoxesRow}>
                  {/* Minimum Box */}
                  <View style={styles.priceBoxCol}>
                    <Text style={styles.priceBoxLabel}>Minimum</Text>
                    <View style={styles.priceBoxPill}>
                      <Text style={styles.priceBoxVal}>₦{minPrice.toLocaleString()}</Text>
                    </View>
                  </View>

                  {/* Maximum Box */}
                  <View style={styles.priceBoxCol}>
                    <Text style={styles.priceBoxLabel}>Maximum</Text>
                    <View style={styles.priceBoxPill}>
                      <Text style={styles.priceBoxVal}>₦{maxPrice.toLocaleString()} +</Text>
                    </View>
                  </View>
                </View>

                {/* Custom Amount Input Box (Figma: Enter Amount eg. ₦1,000) */}
                <View style={styles.amountInputContainer}>
                  <View style={styles.amountInputRow}>
                    <TextInput
                      style={[styles.amountTextInput, { outlineStyle: 'none' } as any]}
                      placeholder="Enter Amount eg. ₦1,000"
                      placeholderTextColor="rgba(96, 96, 102, 0.96)"
                      keyboardType="numeric"
                      value={customAmount}
                      onChangeText={(val) => {
                        const rawDigits = val.replace(/[^0-9]/g, '');
                        if (!rawDigits) {
                          setCustomAmount('');
                          return;
                        }
                        const parsed = parseInt(rawDigits, 10);
                        setCustomAmount(parsed.toLocaleString('en-US'));
                        if (parsed > 0) {
                          const foundIdx = PRICE_STEPS.findIndex((p) => p >= parsed);
                          if (foundIdx !== -1) {
                            setMaxBarIndex(foundIdx);
                          } else {
                            setMaxBarIndex(22);
                          }
                        }
                      }}
                    />
                    {customAmount.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setCustomAmount('')}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <X size={16} color="rgba(96, 96, 102, 0.96)" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.amountInputUnderline} />
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* ── 5. Distance Section (Figma: distance sort, gap: 8px) ── */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Distance</Text>
              <View style={[styles.optionsList, { gap: 8 }]}>
                {/* Nearby */}
                <TouchableOpacity
                  style={styles.optionRow}
                  activeOpacity={0.7}
                  onPress={() => setDistance(distance === 'nearby' ? 'all' : 'nearby')}
                >
                  <Text style={styles.optionLabel}>Nearby</Text>
                  <View
                    style={[
                      styles.radioCircle,
                      distance === 'nearby' && styles.radioCircleSelected,
                    ]}
                  >
                    {distance === 'nearby' && (
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    )}
                  </View>
                </TouchableOpacity>

                {/* More Places */}
                <TouchableOpacity
                  style={styles.optionRow}
                  activeOpacity={0.7}
                  onPress={() => setDistance(distance === 'more' ? 'all' : 'more')}
                >
                  <Text style={styles.optionLabel}>More Places</Text>
                  <View
                    style={[
                      styles.radioCircle,
                      distance === 'more' && styles.radioCircleSelected,
                    ]}
                  >
                    {distance === 'more' && (
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* ── 6. Gender Section (Figma: gender, 104x48px pills, gap: 16px) ── */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Gender</Text>
              <View style={styles.genderButtonsRow}>
                {[
                  { id: 'unisex', label: 'Unisex' },
                  { id: 'female', label: 'Female' },
                  { id: 'male', label: 'Male' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.genderPill,
                      gender === item.id && styles.genderPillActive,
                    ]}
                    activeOpacity={0.7}
                    onPress={() =>
                      setGender(gender === item.id ? 'all' : (item.id as any))
                    }
                  >
                    <Text
                      style={[
                        styles.genderPillText,
                        gender === item.id && styles.genderPillTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* ── Bottom Sticky Action Buttons (Figma 1:1: Clear All & Show 16+ related) ── */}
          <View
            style={[
              styles.footer,
              {
                paddingBottom: bottomInset,
                height: 48 + 16 + bottomInset,
              },
            ]}
          >
            {/* Clear All Button (115x48px) */}
            <TouchableOpacity
              style={styles.clearAllFooterBtn}
              activeOpacity={0.7}
              onPress={handleReset}
            >
              <Text style={styles.clearAllFooterBtnText}>Clear All</Text>
            </TouchableOpacity>

            {/* Show Related Button (200x48px / flex 1) */}
            <TouchableOpacity
              style={styles.showRelatedBtn}
              activeOpacity={0.85}
              onPress={handleApply}
            >
              <Text style={styles.showRelatedBtnText}>
                Show {relatedCountText} related
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backdropPressable: {
    flex: 1,
  },
  keyboardAvoid: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#858B94',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 2,
  },
  dragHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(217, 217, 217, 0.9)',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  headerPlaceholder: {
    width: 40,
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Scroll Content (Figma: gap 40px) ──
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 32,
  },

  // ── Dynamic Recent Filtered Section (Figma: recent filters) ──
  recentSection: {
    gap: 20,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentHeaderTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.02,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    gap: 16,
  },
  chipRatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipText: {
    ...typography.button,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  chipCancelBtn: {
    width: 32,
    height: 32,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreChoicesTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    marginTop: 8,
  },

  // ── Headings & Sections ──
  sectionContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.02,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    width: '100%',
  },

  // ── 1. Price Range Section ──
  priceRangeSection: {
    gap: 24,
  },
  priceChartContainer: {
    gap: 20,
    width: '100%',
  },
  histogramBarsContainer: {
    height: 60,
    width: '100%',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  barTouchWrapper: {
    position: 'absolute',
    bottom: 0,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  singleBar: {
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  sliderBaseLineContainer: {
    width: '100%',
    height: 68,
    position: 'relative',
    justifyContent: 'flex-start',
  },
  sliderBaseLineGrey: {
    position: 'absolute',
    top: 19,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 1,
  },
  sliderActiveSegment: {
    position: 'absolute',
    top: 19,
    height: 2,
    backgroundColor: 'rgba(204, 41, 41, 0.9)',
    borderRadius: 1,
  },
  dragHandleWrapper: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    gap: 4,
    width: 40,
  },
  sliderHandle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    shadowColor: '#858B94',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  dragLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  priceBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  priceBoxCol: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  priceBoxLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  priceBoxPill: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  priceBoxVal: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  amountInputContainer: {
    marginTop: 8,
    gap: 8,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountTextInput: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  amountInputUnderline: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },

  // ── Options List (Distance & Verification) ──
  optionsList: {
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    height: 48,
  },
  optionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(26, 130, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Gender Buttons (Figma: 104x48, gap 16) ──
  genderButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  genderPill: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  genderPillActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  genderPillText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  genderPillTextActive: {
    color: '#FFFFFF',
  },

  // ── Business Time (Opening & Closing) ──
  timeButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  timePill: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePillActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  timePillText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  timePillTextActive: {
    color: '#FFFFFF',
  },

  // ── Amenities Container & Rows ──
  amenitiesContainer: {
    gap: 16,
  },
  amenitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  amenityPill: {
    height: 44,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  amenityPillActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  amenityText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  amenityTextActive: {
    color: '#FFFFFF',
  },

  // ── Footer Actions (Dynamic height with bottomInset) ──
  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 17,
    backgroundColor: '#FFFFFF',
    shadowColor: '#858B94',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
  },
  clearAllFooterBtn: {
    width: 115,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  clearAllFooterBtnText: {
    ...typography.button,
    textTransform: 'capitalize',
    color: 'rgba(0, 8, 20, 0.96)',
  },
  showRelatedBtn: {
    flex: 1,
    minWidth: 200,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#858B94',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  showRelatedBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default FilterModal;
