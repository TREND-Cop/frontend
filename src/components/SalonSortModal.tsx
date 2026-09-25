import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  PanResponder,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { X, Star } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 23 Histogram Bar Heights matching Figma specifications exactly (heights 5px to 58px)
const HISTOGRAM_BARS = [
  5, 5, 5, 10, 5, 15, 24, 10, 20, 32, 20, 32, 53, 45, 32, 40, 58, 45, 24, 10, 5, 5, 10,
];

// 23 Realistic Price Steps matching real salon service costs and histogram bars
export const SALON_SORT_PRICE_STEPS = [
  3000, 5000, 7500, 10000, 12500, 15000, 17500, 20000, 25000, 30000,
  35000, 40000, 45000, 50000, 55000, 60000, 70000, 80000, 90000, 100000,
  120000, 140000, 160000,
];

const THUMB_SIZE = 40;

export interface SalonSortFilterState {
  rating: number;
  minPrice: number;
  maxPrice: number;
  gender: 'all' | 'men' | 'female';
  duration: string;
}

const parseDurationToMinutes = (durStr: string): number => {
  if (!durStr) return 0;
  let mins = 0;
  const norm = durStr.toLowerCase().trim();
  const hrMatch = norm.match(/(\d+)\s*h/i);
  const minMatch = norm.match(/(\d+)\s*m/i);
  if (hrMatch) mins += parseInt(hrMatch[1], 10) * 60;
  if (minMatch && !norm.includes('hr min')) mins += parseInt(minMatch[1], 10);
  if (mins === 0) {
    const num = parseInt(norm.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num)) mins = num;
  }
  return mins;
};

export interface RecentFilterItem {
  id: string;
  type: 'price' | 'rating' | 'gender' | 'duration';
  label: string;
  isStar?: boolean;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  gender?: 'all' | 'men' | 'female';
  duration?: string;
}

// Global cache for applied filter chips across modal sessions
let globalRecentFilters: RecentFilterItem[] = [];

interface SalonSortModalProps {
  visible: boolean;
  onClose: () => void;
  onApply?: (filters: SalonSortFilterState) => void;
  currentFilters?: Partial<SalonSortFilterState>;
  totalCount?: number;
  availableItems?: Array<{
    numericPrice?: number;
    rating?: string | number;
    duration?: string;
    gender?: string;
    category?: string;
  }>;
}

export const SalonSortModal: React.FC<SalonSortModalProps> = ({
  visible,
  onClose,
  onApply,
  currentFilters,
  totalCount,
  availableItems,
}) => {
  const insets = useSafeAreaInsets();

  // Filters always default to empty unless explicitly clicked/passed
  const [rating, setRating] = useState<number>(currentFilters?.rating ?? 0);
  const [minBarIndex, setMinBarIndex] = useState<number>(() => {
    if (currentFilters?.minPrice !== undefined && currentFilters.minPrice > 0) {
      const idx = SALON_SORT_PRICE_STEPS.findIndex((p) => p >= currentFilters.minPrice!);
      return idx !== -1 ? idx : 0;
    }
    return 0;
  });
  const [maxBarIndex, setMaxBarIndex] = useState<number>(() => {
    if (currentFilters?.maxPrice !== undefined && currentFilters.maxPrice < 1000000) {
      const idx = SALON_SORT_PRICE_STEPS.findIndex((p) => p >= currentFilters.maxPrice!);
      return idx !== -1 ? idx : 22;
    }
    return 22;
  });
  const [customAmount, setCustomAmount] = useState<string>('');
  const [gender, setGender] = useState<'all' | 'men' | 'female'>(currentFilters?.gender || 'all');
  const [duration, setDuration] = useState<string>(currentFilters?.duration || '');
  const [sliderWidth, setSliderWidth] = useState<number>(SCREEN_WIDTH - 32);
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);

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

  const minPrice = SALON_SORT_PRICE_STEPS[minBarIndex];
  const maxPrice = SALON_SORT_PRICE_STEPS[maxBarIndex];
  const effectiveMaxPrice = customAmount
    ? (parseInt(customAmount.replace(/[^0-9]/g, ''), 10) || maxPrice)
    : maxPrice;

  // Dynamic matching items count calculation
  const matchingCount = useMemo(() => {
    if (availableItems && availableItems.length > 0) {
      return availableItems.filter((item) => {
        if (gender !== 'all') {
          if (item.gender) {
            if (item.gender.toLowerCase() !== gender.toLowerCase()) return false;
          } else {
            const name = ((item as any).name || '').toLowerCase();
            if (gender === 'men' && (name.includes('female') || name.includes('women') || name.includes('lady'))) return false;
            if (gender === 'female' && name.includes('men') && !name.includes('women')) return false;
          }
        }
        if (rating > 0) {
          const itemRating =
            typeof item.rating === 'number'
              ? item.rating
              : parseFloat(String(item.rating || '0'));
          if (itemRating < rating) return false;
        }
        if (item.numericPrice !== undefined) {
          if (minBarIndex > 0 && item.numericPrice < minPrice) return false;
          if ((maxBarIndex < 22 || customAmount) && item.numericPrice > effectiveMaxPrice) return false;
        }
        if (duration) {
          const filterMinutes = parseDurationToMinutes(duration);
          const itemMinutes = item.duration ? parseDurationToMinutes(item.duration) : 0;
          if (filterMinutes > 0 && itemMinutes > 0 && itemMinutes > filterMinutes + 15) return false;
        }
        return true;
      }).length;
    }

    let count = totalCount !== undefined ? totalCount : 24;
    if (gender !== 'all') count = Math.max(1, Math.round(count * 0.45));
    if (rating >= 4.5) count = Math.max(1, Math.round(count * 0.4));
    else if (rating >= 4) count = Math.max(1, Math.round(count * 0.7));
    if (minBarIndex > 0 || maxBarIndex < 22) count = Math.max(1, Math.round(count * 0.5));
    if (duration) count = Math.max(1, Math.round(count * 0.75));
    return count;
  }, [availableItems, totalCount, rating, minBarIndex, maxBarIndex, minPrice, effectiveMaxPrice, customAmount, gender, duration]);

  const matchingCountText = matchingCount >= 20 ? `${matchingCount}+` : `${matchingCount}`;

  // Recent applied filters list (does NOT update immediately while dragging/drafting, only upon Apply)
  const [recentFilterList, setRecentFilterList] = useState<RecentFilterItem[]>(() => globalRecentFilters);

  const handleSelectRecentChip = (chip: RecentFilterItem) => {
    if (chip.type === 'price') {
      if (chip.minPrice !== undefined && chip.minPrice > 0) {
        const minIdx = SALON_SORT_PRICE_STEPS.findIndex((p) => p >= chip.minPrice!);
        setMinBarIndex(minIdx !== -1 ? minIdx : 0);
      } else {
        setMinBarIndex(0);
      }
      if (chip.maxPrice !== undefined && chip.maxPrice < 1000000) {
        const maxIdx = SALON_SORT_PRICE_STEPS.findIndex((p) => p >= chip.maxPrice!);
        setMaxBarIndex(maxIdx !== -1 ? maxIdx : 22);
      } else {
        setMaxBarIndex(22);
      }
      setCustomAmount('');
    } else if (chip.type === 'rating') {
      setRating(chip.rating ?? 0);
    } else if (chip.type === 'gender') {
      setGender(chip.gender || 'all');
    } else if (chip.type === 'duration') {
      setDuration(chip.duration || '');
    }
  };

  const handleRemoveRecentChip = (id: string) => {
    setRecentFilterList((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      globalRecentFilters = updated;
      return updated;
    });
  };

  const handleClearAll = () => {
    setRating(0);
    setMinBarIndex(0);
    setMaxBarIndex(22);
    setGender('all');
    setDuration('');
    setCustomAmount('');
  };

  // Sync state when modal opens
  useEffect(() => {
    if (visible) {
      setRating(currentFilters?.rating ?? 0);
      if (currentFilters?.minPrice !== undefined && currentFilters.minPrice > 0) {
        const idx = SALON_SORT_PRICE_STEPS.findIndex((p) => p >= currentFilters.minPrice!);
        setMinBarIndex(idx !== -1 ? idx : 0);
      } else {
        setMinBarIndex(0);
      }
      if (currentFilters?.maxPrice !== undefined && currentFilters.maxPrice < 1000000) {
        const idx = SALON_SORT_PRICE_STEPS.findIndex((p) => p >= currentFilters.maxPrice!);
        setMaxBarIndex(idx !== -1 ? idx : 22);
      } else {
        setMaxBarIndex(22);
      }
      setGender(currentFilters?.gender || 'all');
      setDuration(currentFilters?.duration || '');
      setCustomAmount('');
      setScrollEnabled(true);
      setRecentFilterList([...globalRecentFilters]);
    }
  }, [visible, currentFilters]);

  // Duration options in 2 rows x 3 columns matching Figma
  const DURATION_ROWS = [
    ['1 hrs', '1h:30m', '4 hrs'],
    ['6 hrs', '2 hrs', '3 hrs'],
  ];

  // Usable track width accounting for thumb size
  const trackWidth = Math.max(sliderWidth - THUMB_SIZE, 100);

  // Position offsets in px (0 to 22 steps)
  const leftThumbPos = (minBarIndex / 22) * trackWidth;
  const rightThumbPos = (maxBarIndex / 22) * trackWidth;

  const minBarIndexRef = useRef(minBarIndex);
  const maxBarIndexRef = useRef(maxBarIndex);
  const trackWidthRef = useRef(trackWidth);
  const startDragMinPosRef = useRef(0);
  const startDragMaxPosRef = useRef(0);

  useEffect(() => {
    minBarIndexRef.current = minBarIndex;
  }, [minBarIndex]);

  useEffect(() => {
    maxBarIndexRef.current = maxBarIndex;
  }, [maxBarIndex]);

  useEffect(() => {
    trackWidthRef.current = trackWidth;
  }, [trackWidth]);

  // PanResponder for Left (Minimum) Slider Thumb
  const minPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        setScrollEnabled(false);
        const ratio = minBarIndexRef.current / 22;
        startDragMinPosRef.current = ratio * trackWidthRef.current;
      },
      onPanResponderMove: (_, gestureState) => {
        const tw = trackWidthRef.current;
        const maxPos = (maxBarIndexRef.current / 22) * tw;
        const newPos = Math.max(0, Math.min(maxPos, startDragMinPosRef.current + gestureState.dx));
        const newRatio = newPos / tw;
        const newIndex = Math.round(newRatio * 22);
        setMinBarIndex(Math.max(0, Math.min(maxBarIndexRef.current, newIndex)));
      },
      onPanResponderRelease: () => {
        setScrollEnabled(true);
      },
      onPanResponderTerminate: () => {
        setScrollEnabled(true);
      },
    })
  ).current;

  // PanResponder for Right (Maximum) Slider Thumb
  const maxPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        setScrollEnabled(false);
        const ratio = maxBarIndexRef.current / 22;
        startDragMaxPosRef.current = ratio * trackWidthRef.current;
      },
      onPanResponderMove: (_, gestureState) => {
        const tw = trackWidthRef.current;
        const minPos = (minBarIndexRef.current / 22) * tw;
        const newPos = Math.max(minPos, Math.min(tw, startDragMaxPosRef.current + gestureState.dx));
        const newRatio = newPos / tw;
        const newIndex = Math.round(newRatio * 22);
        setMaxBarIndex(Math.max(minBarIndexRef.current, Math.min(22, newIndex)));
      },
      onPanResponderRelease: () => {
        setScrollEnabled(true);
      },
      onPanResponderTerminate: () => {
        setScrollEnabled(true);
      },
    })
  ).current;

  const handleApply = () => {
    const appliedMin = minBarIndex > 0 ? minPrice : 0;
    const appliedMax = (maxBarIndex < 22 || customAmount) ? effectiveMaxPrice : 1000000;

    const newChips: RecentFilterItem[] = [];
    if (minBarIndex > 0 || maxBarIndex < 22 || customAmount) {
      newChips.push({
        id: `price-${appliedMin}-${appliedMax}`,
        type: 'price',
        label: `₦${minPrice.toLocaleString()} - ₦${effectiveMaxPrice.toLocaleString()}`,
        minPrice: appliedMin,
        maxPrice: appliedMax,
      });
    }
    if (rating > 0) {
      newChips.push({
        id: `rating-${rating}`,
        type: 'rating',
        label: rating.toFixed(1),
        isStar: true,
        rating,
      });
    }
    if (gender !== 'all') {
      newChips.push({
        id: `gender-${gender}`,
        type: 'gender',
        label: gender === 'men' ? 'Men' : 'Female',
        gender,
      });
    }
    if (duration) {
      newChips.push({
        id: `duration-${duration}`,
        type: 'duration',
        label: duration,
        duration,
      });
    }

    if (newChips.length > 0) {
      const merged = [
        ...newChips,
        ...globalRecentFilters.filter((c) => !newChips.some((nc) => nc.id === c.id)),
      ].slice(0, 5);
      globalRecentFilters = merged;
      setRecentFilterList(merged);
    }

    if (onApply) {
      onApply({
        rating,
        minPrice: appliedMin,
        maxPrice: appliedMax,
        gender,
        duration,
      });
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.sheetContainer}>
          {/* Header (Figma: Filter title + Close button, height 40px) */}
          <View style={styles.headerRow}>
            <View style={{ width: 40 }} />
            <Text style={styles.headerTitle}>Filter</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color="#141B34" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            scrollEnabled={scrollEnabled}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: isKeyboardVisible ? 240 : 16 },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {/* ── Dynamic Recent Filtered Section (Figma: recent filters) ─────── */}
            {recentFilterList.length > 0 && (
              <View style={styles.recentSection}>
                <Text style={styles.recentHeaderTitle}>Recent filtered</Text>
                <View style={styles.chipsContainer}>
                  {recentFilterList.map((chip) => (
                    <TouchableOpacity
                      key={chip.id}
                      style={styles.recentChip}
                      activeOpacity={0.8}
                      onPress={() => handleSelectRecentChip(chip)}
                    >
                      {chip.isStar ? (
                        <View style={styles.chipRatesRow}>
                          <Star
                            size={20}
                            fill="rgba(248, 155, 24, 0.96)"
                            color="rgba(248, 155, 24, 0.96)"
                          />
                          <Text style={styles.chipText}>{chip.label}</Text>
                        </View>
                      ) : (
                        <Text style={styles.chipText}>{chip.label}</Text>
                      )}
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleRemoveRecentChip(chip.id);
                        }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.chipCancelBtn}
                        activeOpacity={0.7}
                      >
                        <X size={16} color="#141B34" strokeWidth={1.5} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.moreChoicesTitle}>More Choices</Text>
              </View>
            )}

            {/* ── Section 1: Price Range (Figma: user price range, order 0) ───── */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Price Range</Text>

              {/* Price Chart Indicator (Histogram + Draggable Thumbs with Drag label below) */}
              <View
                style={styles.histogramContainer}
                onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
              >
                {/* 23 Histogram Bars */}
                <View style={styles.histogramBarsRow}>
                  {HISTOGRAM_BARS.map((height, idx) => {
                    const isInRange = idx >= minBarIndex && idx <= maxBarIndex;
                    return (
                      <TouchableOpacity
                        key={idx}
                        activeOpacity={0.8}
                        onPress={() => {
                          const distToMin = Math.abs(idx - minBarIndex);
                          const distToMax = Math.abs(idx - maxBarIndex);
                          if (distToMin < distToMax) {
                            setMinBarIndex(Math.min(maxBarIndex, idx));
                          } else {
                            setMaxBarIndex(Math.max(minBarIndex, idx));
                          }
                        }}
                        style={[
                          styles.histogramBar,
                          {
                            height,
                            backgroundColor: isInRange
                              ? 'rgba(204, 41, 41, 0.9)'
                              : 'rgba(192, 192, 204, 0.96)',
                          },
                        ]}
                      />
                    );
                  })}
                </View>

                {/* Red Baseline (Line 115) */}
                <View style={styles.histogramBaseLine} />

                {/* Left (Minimum) Draggable Slider Thumb */}
                <View
                  style={[styles.thumbWrapper, { left: leftThumbPos }]}
                  {...minPanResponder.panHandlers}
                >
                  <View style={styles.sliderThumb} />
                  <Text style={styles.dragLabel}>Drag</Text>
                </View>

                {/* Right (Maximum) Draggable Slider Thumb */}
                <View
                  style={[styles.thumbWrapper, { left: rightThumbPos }]}
                  {...maxPanResponder.panHandlers}
                >
                  <View style={styles.sliderThumb} />
                  <Text style={styles.dragLabel}>Drag</Text>
                </View>
              </View>

              {/* Editable Min/Max Price Buttons (132x76 each) */}
              <View style={styles.minMaxPricesRow}>
                <View style={styles.priceColumn}>
                  <Text style={styles.priceLabel}>Minimum</Text>
                  <TouchableOpacity
                    style={styles.pricePillButton}
                    activeOpacity={0.8}
                    onPress={() => setMinBarIndex(0)}
                  >
                    <Text style={styles.pricePillText}>₦{minPrice.toLocaleString()}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.priceColumn}>
                  <Text style={styles.priceLabel}>Maximum</Text>
                  <TouchableOpacity
                    style={styles.pricePillButton}
                    activeOpacity={0.8}
                    onPress={() => {
                      setMaxBarIndex(22);
                      setCustomAmount('');
                    }}
                  >
                    <Text style={styles.pricePillText}>
                      ₦{maxBarIndex >= 22 && !customAmount ? `${SALON_SORT_PRICE_STEPS[22].toLocaleString()} +` : `${effectiveMaxPrice.toLocaleString()} +`}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Custom Amount Input Box (Figma: Enter Amount eg. ₦1,000, 390x48) */}
              <View style={styles.amountInputContainer}>
                <TextInput
                  style={[styles.amountTextInput, { outlineStyle: 'none' } as any]}
                  placeholder="Enter Amount eg. ₦1,000"
                  placeholderTextColor="rgba(96, 96, 102, 0.96)"
                  keyboardType="numeric"
                  value={customAmount}
                  onChangeText={(val) => {
                    setCustomAmount(val);
                    const parsed = parseInt(val.replace(/[^0-9]/g, ''), 10);
                    if (!isNaN(parsed) && parsed > 0) {
                      const idx = SALON_SORT_PRICE_STEPS.findIndex((p) => p >= parsed);
                      setMaxBarIndex(idx !== -1 ? idx : 22);
                    }
                  }}
                />
                <View style={styles.amountInputUnderline} />
              </View>
            </View>

            {/* Line 109 Divider Line (338px width) */}
            <View style={styles.dividerLine} />

            {/* ── Section 2: Rate (Figma: star rate, gap: 32px) ─────── */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Rate</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((starIndex) => {
                  const isFilled = starIndex <= rating;
                  return (
                    <TouchableOpacity
                      key={starIndex}
                      activeOpacity={0.7}
                      onPress={() => setRating(starIndex === rating ? 0 : starIndex)}
                      style={styles.starTouchArea}
                    >
                      <Star
                        size={32}
                        color={isFilled ? 'rgba(248, 155, 24, 0.96)' : 'rgba(192, 192, 204, 0.96)'}
                        fill={isFilled ? 'rgba(248, 155, 24, 0.96)' : 'transparent'}
                        strokeWidth={1.5}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Line Divider */}
            <View style={styles.dividerLine} />

            {/* ── Section 3: Gender (Figma: service duration / Gender 174x48) ─ */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Gender</Text>
              <View style={styles.genderRow}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === 'men' && styles.genderButtonActive,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setGender(gender === 'men' ? 'all' : 'men')}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      gender === 'men' && styles.genderButtonTextActive,
                    ]}
                  >
                    Men Only
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === 'female' && styles.genderButtonActive,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setGender(gender === 'female' ? 'all' : 'female')}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      gender === 'female' && styles.genderButtonTextActive,
                    ]}
                  >
                    Female Only
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Section 4: Duration (Figma: service duration 112.67x48) ─ */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Duration</Text>
              <View style={styles.durationGrid}>
                {DURATION_ROWS.map((row, rIdx) => (
                  <View key={rIdx} style={styles.durationRow}>
                    {row.map((opt) => {
                      const isSelected = duration === opt;
                      return (
                        <TouchableOpacity
                          key={opt}
                          style={[
                            styles.durationButton,
                            isSelected && styles.durationButtonActive,
                          ]}
                          activeOpacity={0.7}
                          onPress={() => setDuration(isSelected ? '' : opt)}
                        >
                          <Text
                            style={[
                              styles.durationButtonText,
                              isSelected && styles.durationButtonTextActive,
                            ]}
                          >
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>

          </ScrollView>

          {/* ── Sticky Bottom Footer (Figma: height 80, Clear All 115x48, Show 20+ related 200x48) ── */}
          <View style={[styles.footer, { paddingBottom: Math.max(16, insets.bottom) }]}>
            <TouchableOpacity
              style={styles.clearAllButton}
              activeOpacity={0.7}
              onPress={handleClearAll}
            >
              <Text style={styles.clearAllButtonText}>Clear All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.showRelatedButton}
              activeOpacity={0.85}
              onPress={handleApply}
            >
              <Text style={styles.showRelatedButtonText}>
                Show {matchingCountText} related
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 8, 20, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: 588,
    maxHeight: 588,
    overflow: 'hidden',
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  scrollView: {
    flex: 1,
  },

  // ── Header (Figma: height 40px, padding: 8px 16px, borderBottom) ──
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
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

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 32,
  },

  // ── Dynamic Recent Filtered Section (Figma: recent filters) ──
  recentSection: {
    gap: 20,
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
    letterSpacing: 0.02,
    color: 'rgba(0, 8, 20, 0.96)',
    marginTop: 8,
  },

  sectionBlock: {
    gap: 24,
  },
  sectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.02,
    color: '#000000',
  },

  // ── Star Rate Row (Figma: 32x32 stars, gap: 32px) ──
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  starTouchArea: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dividerLine: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },

  // ── Price Range Histogram Chart (Figma: height 58px bars, 40px thumb, 72px total height) ──
  histogramContainer: {
    height: 130,
    position: 'relative',
    paddingHorizontal: 8,
  },
  histogramBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 3,
    height: 58,
    paddingHorizontal: 4,
  },
  histogramBar: {
    flex: 1,
    borderRadius: 2,
  },
  histogramBaseLine: {
    height: 2,
    backgroundColor: 'rgba(204, 41, 41, 0.9)',
    marginTop: 0,
  },

  // ── Draggable Thumb with Clean Non-overlapping Drag Label Below ──
  thumbWrapper: {
    position: 'absolute',
    top: 39,
    width: THUMB_SIZE,
    alignItems: 'center',
    zIndex: 10,
  },
  sliderThumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    shadowColor: 'rgba(133, 139, 148, 0.35)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  dragLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    marginTop: 8,
  },

  // ── Editable Min / Max Price Buttons (132x76) ──
  minMaxPricesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginTop: 0,
  },
  priceColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  priceLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  pricePillButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  pricePillText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Amount Input Box (Figma: Enter Amount eg. ₦1,000) ──
  amountInputContainer: {
    marginTop: 4,
    gap: 8,
  },
  amountTextInput: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 6,
    paddingHorizontal: 0,
  },
  amountInputUnderline: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },

  // ── Gender Row (Figma: 174px x 48px buttons, gap: 10px) ──
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  genderButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  genderButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  genderButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },

  // ── Duration Grid (2 rows x 3 columns, 112.67x48 buttons) ──
  durationGrid: {
    gap: 16,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  durationButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  durationButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  durationButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  durationButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },

  // ── Bottom Action Sticky Footer (Figma: height 80, Clear All 115x48, Show 20+ related 200x48) ──
  footer: {
    minHeight: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 17,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  clearAllButton: {
    width: 115,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearAllButtonText: {
    ...typography.button,
    color: 'rgba(0, 8, 20, 0.96)',
    textTransform: 'capitalize',
  },
  showRelatedButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  showRelatedButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});

export default SalonSortModal;
