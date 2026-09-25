import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Animated,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { typography } from '../constants/theme';

const ITEM_HEIGHT = 40;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export interface CalendarSelectedDate {
  year: number;
  monthIndex: number;
  dayNum: number;
}

export interface MonthFilterModalProps {
  visible: boolean;
  onClose: () => void;
  initialMonthIndex?: number;
  initialYear?: number;
  selectedDate?: CalendarSelectedDate | null;
  selectedDayNum?: number | null;
  onSelect: (result: { year: number; monthIndex: number; dayNum: number }) => void;
  isDayDisabled?: (dayNum: number, monthIndex: number, year: number) => boolean;
}

export const MonthFilterModal: React.FC<MonthFilterModalProps> = ({
  visible,
  onClose,
  initialMonthIndex = new Date().getMonth(),
  initialYear = new Date().getFullYear(),
  selectedDate = null,
  selectedDayNum = null,
  onSelect,
  isDayDisabled,
}) => {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android' ? Math.max(insets.bottom, 56) : Math.max(16, insets.bottom);

  // Dynamic real device date calculation
  const today = useMemo(() => new Date(), [visible]);
  const CURRENT_YEAR = today.getFullYear();
  const CURRENT_MONTH = today.getMonth(); // 0-11
  const CURRENT_DAY = today.getDate();

  // Forward booking range: current year + 10 (e.g. 2026 through 2036)
  const YEARS_AHEAD = 10;
  const MIN_YEAR = CURRENT_YEAR;
  const MAX_YEAR = CURRENT_YEAR + YEARS_AHEAD;

  // Year items for wheel picker:
  // Render current year - 1 for scroll context (grayed out, disabled, non-selectable).
  // Current year through max year are the valid selectable range.
  const YEAR_ITEMS = useMemo(() => {
    const list: { year: number; isPast: boolean }[] = [
      { year: CURRENT_YEAR - 1, isPast: true },
    ];
    for (let y = CURRENT_YEAR; y <= MAX_YEAR; y++) {
      list.push({ year: y, isPast: false });
    }
    return list;
  }, [CURRENT_YEAR, MAX_YEAR]);

  const MIN_SELECTABLE_INDEX = 1; // Index of CURRENT_YEAR
  const MAX_SELECTABLE_INDEX = YEAR_ITEMS.length - 1;

  // Normalized initial year within the valid range
  const normalizedInitialYear = Math.max(MIN_YEAR, Math.min(MAX_YEAR, initialYear));
  const normalizedInitialMonth =
    normalizedInitialYear === CURRENT_YEAR
      ? Math.max(CURRENT_MONTH, initialMonthIndex)
      : initialMonthIndex;

  const [calendarTab, setCalendarTab] = useState<'Month' | 'Year'>('Month');
  const [activeMonthIndex, setActiveMonthIndex] = useState<number>(normalizedInitialMonth);
  // Single source of truth for selected year across both header and wheel
  const [activeYear, setActiveYear] = useState<number>(normalizedInitialYear);
  const [pickedDate, setPickedDate] = useState<CalendarSelectedDate | null>(() => {
    if (selectedDate) return selectedDate;
    if (selectedDayNum !== null && selectedDayNum !== undefined) {
      return { year: normalizedInitialYear, monthIndex: normalizedInitialMonth, dayNum: selectedDayNum };
    }
    return null;
  });

  const yearScrollRef = useRef<ScrollView>(null);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const programmaticScrollTimerRef = useRef<any>(null);

  // Animated pill position for Tab (Month: 24, Year: 229)
  const tabPillAnim = useRef(new Animated.Value(calendarTab === 'Month' ? 24 : 229)).current;

  // Sync state when modal opens
  useEffect(() => {
    if (visible) {
      const initYr = Math.max(MIN_YEAR, Math.min(MAX_YEAR, initialYear));
      const initMo = initYr === CURRENT_YEAR ? Math.max(CURRENT_MONTH, initialMonthIndex) : initialMonthIndex;
      setActiveMonthIndex(initMo);
      setActiveYear(initYr);
      if (selectedDate) {
        setPickedDate(selectedDate);
      } else if (selectedDayNum !== null && selectedDayNum !== undefined) {
        setPickedDate({ year: initYr, monthIndex: initMo, dayNum: selectedDayNum });
      } else {
        setPickedDate(null);
      }
      setCalendarTab('Month');
      tabPillAnim.setValue(24);
    }
  }, [visible, initialMonthIndex, initialYear, selectedDate, selectedDayNum, MIN_YEAR, MAX_YEAR, CURRENT_MONTH]);

  // Sync scroll position whenever switching to Year tab
  const scrollToActiveYear = (animated = false) => {
    const idx = YEAR_ITEMS.findIndex((item) => item.year === activeYear);
    if (idx >= 0) {
      isProgrammaticScrollRef.current = true;
      yearScrollRef.current?.scrollTo({
        y: idx * ITEM_HEIGHT,
        animated,
      });
      if (programmaticScrollTimerRef.current) clearTimeout(programmaticScrollTimerRef.current);
      programmaticScrollTimerRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, animated ? 300 : 50);
    }
  };

  useEffect(() => {
    if (visible && calendarTab === 'Year') {
      const timer = setTimeout(() => {
        scrollToActiveYear(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [visible, calendarTab, activeYear]);

  const switchTab = (tab: 'Month' | 'Year') => {
    setCalendarTab(tab);
    Animated.spring(tabPillAnim, {
      toValue: tab === 'Month' ? 24 : 229,
      useNativeDriver: false,
      friction: 8,
      tension: 50,
    }).start();

    if (tab === 'Year') {
      setTimeout(() => {
        scrollToActiveYear(false);
      }, 50);
    }
  };

  // Bounds checks for chevron arrows
  const canGoPrev =
    calendarTab === 'Year'
      ? activeYear > MIN_YEAR
      : !(activeYear === MIN_YEAR && activeMonthIndex <= CURRENT_MONTH);

  const canGoNext =
    calendarTab === 'Year'
      ? activeYear < MAX_YEAR
      : !(activeYear >= MAX_YEAR && activeMonthIndex >= 11);

  // Chevron navigation for Month and Year (Bug 3)
  const handlePrev = () => {
    if (!canGoPrev) return;

    if (calendarTab === 'Month') {
      if (activeMonthIndex > 0) {
        setActiveMonthIndex((m) => m - 1);
      } else if (activeYear > MIN_YEAR) {
        setActiveMonthIndex(11);
        setActiveYear((y) => y - 1);
      }
    } else {
      const newYear = activeYear - 1;
      if (newYear >= MIN_YEAR) {
        setActiveYear(newYear);
        const idx = YEAR_ITEMS.findIndex((item) => item.year === newYear);
        if (idx >= 0) {
          isProgrammaticScrollRef.current = true;
          yearScrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: true });
          if (programmaticScrollTimerRef.current) clearTimeout(programmaticScrollTimerRef.current);
          programmaticScrollTimerRef.current = setTimeout(() => {
            isProgrammaticScrollRef.current = false;
          }, 300);
        }
      }
    }
  };

  const handleNext = () => {
    if (!canGoNext) return;

    if (calendarTab === 'Month') {
      if (activeMonthIndex < 11) {
        setActiveMonthIndex((m) => m + 1);
      } else if (activeYear < MAX_YEAR) {
        setActiveMonthIndex(0);
        setActiveYear((y) => y + 1);
      }
    } else {
      const newYear = activeYear + 1;
      if (newYear <= MAX_YEAR) {
        setActiveYear(newYear);
        const idx = YEAR_ITEMS.findIndex((item) => item.year === newYear);
        if (idx >= 0) {
          isProgrammaticScrollRef.current = true;
          yearScrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: true });
          if (programmaticScrollTimerRef.current) clearTimeout(programmaticScrollTimerRef.current);
          programmaticScrollTimerRef.current = setTimeout(() => {
            isProgrammaticScrollRef.current = false;
          }, 300);
        }
      }
    }
  };

  // Real-time wheel scroll handler keeping header in sync live (Bug 1 & Bug 2)
  const handleYearScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isProgrammaticScrollRef.current) return;
    const offsetY = e.nativeEvent.contentOffset.y;
    const rawIndex = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(MIN_SELECTABLE_INDEX, Math.min(MAX_SELECTABLE_INDEX, rawIndex));
    const yrItem = YEAR_ITEMS[clampedIndex];
    if (yrItem && !yrItem.isPast && yrItem.year !== activeYear) {
      setActiveYear(yrItem.year);
    }
  };

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isProgrammaticScrollRef.current) return;
    const offsetY = e.nativeEvent.contentOffset.y;
    const rawIndex = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(MIN_SELECTABLE_INDEX, Math.min(MAX_SELECTABLE_INDEX, rawIndex));
    const yrItem = YEAR_ITEMS[clampedIndex];
    if (yrItem && !yrItem.isPast) {
      setActiveYear(yrItem.year);
      yearScrollRef.current?.scrollTo({
        y: clampedIndex * ITEM_HEIGHT,
        animated: true,
      });
    }
  };

  // 7-day grid weeks calculation for the active month & year
  const firstDayOfWeek = new Date(activeYear, activeMonthIndex, 1).getDay(); // 0 = Sun .. 6 = Sat
  const daysInMonth = new Date(activeYear, activeMonthIndex + 1, 0).getDate();

  const calendarWeeks = useMemo(() => {
    const weeks: (number | null)[][] = [];
    let currentWeek: (number | null)[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      currentWeek.push(d);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [activeYear, activeMonthIndex, firstDayOfWeek, daysInMonth]);

  const handleSelectDay = (dayNum: number, disabled: boolean) => {
    if (disabled) return;
    if (
      pickedDate &&
      pickedDate.year === activeYear &&
      pickedDate.monthIndex === activeMonthIndex &&
      pickedDate.dayNum === dayNum
    ) {
      setPickedDate(null);
    } else {
      setPickedDate({
        year: activeYear,
        monthIndex: activeMonthIndex,
        dayNum,
      });
    }
  };

  const handleConfirmSelect = () => {
    const selectedYr = activeYear;
    const selectedMo = pickedDate?.monthIndex ?? activeMonthIndex;
    const selectedDy =
      pickedDate?.dayNum ??
      (selectedYr === CURRENT_YEAR && selectedMo === CURRENT_MONTH ? CURRENT_DAY : 1);

    onSelect({
      year: selectedYr,
      monthIndex: selectedMo,
      dayNum: selectedDy,
    });
    onClose();
  };

  const activeYearIndex = YEAR_ITEMS.findIndex((item) => item.year === activeYear);
  const initialContentOffsetY = Math.max(MIN_SELECTABLE_INDEX, activeYearIndex >= 0 ? activeYearIndex : MIN_SELECTABLE_INDEX) * ITEM_HEIGHT;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdropTouch}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* ─── month filter container (Figma: 390x587, radius 24px top, padding 16px 0 0, gap 24px) ─── */}
        <View style={[styles.monthFilterContainer, { paddingBottom: bottomInset }]}>
          {/* ─── calender tab (Figma: 358x48, radius 24px, bg rgba(247, 247, 247, 0.96)) ─── */}
          <View style={styles.calenderTab}>
            {/* Animated active pill (Figma: width 105, height 40, top 4, left 229 for Year, 24 for Month) */}
            <Animated.View
              style={[
                styles.tabActivePill,
                {
                  left: tabPillAnim,
                },
              ]}
            />

            {/* Month label (Figma: 52x24, left 55, top 12) */}
            <Text
              style={[
                styles.tabTextMonth,
                calendarTab === 'Month' ? styles.tabTextActive : styles.tabTextInactive,
              ]}
            >
              Month
            </Text>

            {/* Year label (Figma: 36x24, left 263, top 12) */}
            <Text
              style={[
                styles.tabTextYear,
                calendarTab === 'Year' ? styles.tabTextActive : styles.tabTextInactive,
              ]}
            >
              Year
            </Text>

            {/* Touch areas */}
            <TouchableOpacity
              style={styles.tabTouchLeft}
              activeOpacity={0.85}
              onPress={() => switchTab('Month')}
            />
            <TouchableOpacity
              style={styles.tabTouchRight}
              activeOpacity={0.85}
              onPress={() => switchTab('Year')}
            />
          </View>

          {/* ─── month wrapper (Figma: width 390, height 499, radius 24px, bg rgba(247, 247, 247, 0.96)) ─── */}
          <View style={styles.monthWrapper}>
            {/* ─── calender (Figma: 390x395, radius 24px top, border-top 1px solid #EBEBF5, bg #FFFFFF, padding 16px, gap 24px) ─── */}
            <View style={styles.calenderCard}>
              {/* month header (Figma: 358x48, justify-content space-between) */}
              <View style={styles.monthHeader}>
                {/* date and year title (Single Source of Truth: always mirrors activeYear live) */}
                <View style={styles.dateAndYearContainer}>
                  <Text style={styles.headerTitleText}>
                    {calendarTab === 'Month'
                      ? `${MONTH_NAMES[activeMonthIndex]}, ${activeYear}`
                      : `${activeYear}`}
                  </Text>
                </View>

                {/* calender month change buttons */}
                <View style={styles.navButtonsRow}>
                  {/* backwards button */}
                  <TouchableOpacity
                    style={[
                      styles.navCircleButton,
                      !canGoPrev && styles.navCircleButtonDisabled,
                    ]}
                    disabled={!canGoPrev}
                    activeOpacity={0.7}
                    onPress={handlePrev}
                  >
                    <ChevronLeft
                      size={24}
                      color={canGoPrev ? 'rgba(26, 130, 255, 0.9)' : 'rgba(192, 192, 204, 0.6)'}
                      strokeWidth={1.5}
                    />
                  </TouchableOpacity>

                  {/* forwards button */}
                  <TouchableOpacity
                    style={[
                      styles.navCircleButton,
                      !canGoNext && styles.navCircleButtonDisabled,
                    ]}
                    disabled={!canGoNext}
                    activeOpacity={0.7}
                    onPress={handleNext}
                  >
                    <ChevronRight
                      size={24}
                      color={canGoNext ? 'rgba(26, 130, 255, 0.9)' : 'rgba(192, 192, 204, 0.6)'}
                      strokeWidth={1.5}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Body: Month View (7-Day Weekday Calendar Grid) vs Year View (Wheel Picker) */}
              {calendarTab === 'Month' ? (
                <View style={styles.calendarMonthView}>
                  {/* Weekday Abbreviation Header Row: Sun Mon Tue Wed Thu Fri Sat */}
                  <View style={styles.weekdayRow}>
                    {WEEKDAYS.map((w, idx) => (
                      <View key={idx} style={styles.weekdayCell}>
                        <Text style={styles.weekdayText}>{w}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Calendar Weeks Grid (Spaced out, 7 columns across) */}
                  <View style={styles.calendarWeeksContainer}>
                    {calendarWeeks.map((week, weekIdx) => (
                      <View key={`week_${weekIdx}`} style={styles.calendarWeekRow}>
                        {week.map((dayNum, colIdx) => {
                          if (dayNum === null) {
                            return (
                              <View
                                key={`blank_${weekIdx}_${colIdx}`}
                                style={styles.calendarDayCellEmpty}
                              />
                            );
                          }

                          // Past days verification (Bug 2 & Bug 4)
                          const isPastDay =
                            activeYear < CURRENT_YEAR ||
                            (activeYear === CURRENT_YEAR && activeMonthIndex < CURRENT_MONTH) ||
                            (activeYear === CURRENT_YEAR && activeMonthIndex === CURRENT_MONTH && dayNum < CURRENT_DAY);

                          const isDisabled =
                            isPastDay ||
                            (isDayDisabled ? isDayDisabled(dayNum, activeMonthIndex, activeYear) : false);

                          const isSelected =
                            pickedDate !== null &&
                            pickedDate.year === activeYear &&
                            pickedDate.monthIndex === activeMonthIndex &&
                            pickedDate.dayNum === dayNum;

                          return (
                            <TouchableOpacity
                              key={`day_${dayNum}`}
                              style={[
                                styles.calendarDayCell,
                                isSelected && styles.calendarDayCellSelected,
                                isDisabled && styles.calendarDayCellDisabled,
                              ]}
                              disabled={isDisabled}
                              activeOpacity={0.7}
                              onPress={() => handleSelectDay(dayNum, isDisabled)}
                            >
                              <Text
                                style={[
                                  styles.calendarDayText,
                                  isSelected && styles.calendarDayTextSelected,
                                  isDisabled && styles.calendarDayTextDisabled,
                                ]}
                              >
                                {dayNum}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                /* order type (Year View: 358x276, radius 24px top, bg #FFFFFF) */
                <View style={styles.orderTypeContainer}>
                  {/* Selector bar (Figma: 326x40, left 16, top 118, bg rgba(229, 229, 229, 0.8), radius 24px) */}
                  <View style={styles.yearSelectorBar} pointerEvents="none" />

                  {/* Top vertical guide lines */}
                  <View style={styles.topVerticalDividerLeft} pointerEvents="none" />
                  <View style={styles.topVerticalDividerRight} pointerEvents="none" />

                  {/* Bottom vertical guide lines */}
                  <View style={styles.bottomVerticalDividerLeft} pointerEvents="none" />
                  <View style={styles.bottomVerticalDividerRight} pointerEvents="none" />

                  {/* Swipeable / Scrollable Years Wheel */}
                  <ScrollView
                    ref={yearScrollRef}
                    style={styles.yearScrollView}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    nestedScrollEnabled={true}
                    scrollEventThrottle={16}
                    contentOffset={{ x: 0, y: initialContentOffsetY }}
                    contentContainerStyle={styles.yearScrollContent}
                    onLayout={() => {
                      scrollToActiveYear(false);
                    }}
                    onScroll={handleYearScroll}
                    onScrollEndDrag={handleScrollEnd}
                    onMomentumScrollEnd={handleScrollEnd}
                  >
                    {YEAR_ITEMS.map((yrItem, idx) => {
                      const yr = yrItem.year;
                      const isPast = yrItem.isPast;
                      const isSelected = !isPast && yr === activeYear;
                      const diff = Math.abs(yr - activeYear);

                      return (
                        <TouchableOpacity
                          key={yr}
                          style={styles.yearScrollItem}
                          activeOpacity={isPast ? 1 : 0.7}
                          disabled={isPast}
                          onPress={() => {
                            if (isPast) return;
                            setActiveYear(yr);
                            isProgrammaticScrollRef.current = true;
                            yearScrollRef.current?.scrollTo({
                              y: idx * ITEM_HEIGHT,
                              animated: true,
                            });
                            if (programmaticScrollTimerRef.current) clearTimeout(programmaticScrollTimerRef.current);
                            programmaticScrollTimerRef.current = setTimeout(() => {
                              isProgrammaticScrollRef.current = false;
                            }, 300);
                          }}
                        >
                          <Text
                            style={[
                              styles.yearItemText,
                              isPast && styles.yearItemTextDisabled,
                              !isPast && isSelected && styles.yearItemTextSelected,
                              !isPast && !isSelected && diff === 1 && styles.yearItemTextDiff1,
                              !isPast && !isSelected && diff === 2 && styles.yearItemTextDiff2,
                              !isPast && !isSelected && diff >= 3 && styles.yearItemTextDiff3,
                            ]}
                          >
                            {yr}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {/* Top gradient fade (height 43px) */}
                  <View style={styles.topGradientFade} pointerEvents="none">
                    <LinearGradient
                      colors={['#FFFFFF', 'rgba(255, 255, 255, 0)']}
                      style={StyleSheet.absoluteFill}
                    />
                  </View>

                  {/* Bottom gradient fade (height 43px) */}
                  <View style={styles.bottomGradientFade} pointerEvents="none">
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0)', '#FFFFFF']}
                      style={StyleSheet.absoluteFill}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* ─── action button (Figma: 390x80, padding 16px, bg #FFFFFF, radius 0 0 24 24) ─── */}
            <View style={styles.actionButtonContainer}>
              <TouchableOpacity
                style={styles.filledActionButton}
                activeOpacity={0.85}
                onPress={handleConfirmSelect}
              >
                <Text style={styles.actionButtonText}>Select</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalBackdropTouch: {
    flex: 1,
  },

  // ─── month filter (Figma: 390x587, padding 16px 0 0, gap 24px, radius 24 24 0 0, bg #FFFFFF) ───
  monthFilterContainer: {
    width: '100%',
    maxWidth: 390,
    alignSelf: 'center',
    height: 587,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 0,
    alignItems: 'center',
    gap: 24,
    shadowColor: '#858B94',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },

  // ─── calender tab (Figma: 358x48, radius 24px, bg rgba(247, 247, 247, 0.96)) ───
  calenderTab: {
    width: 358,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    position: 'relative',
    alignSelf: 'center',
  },
  tabActivePill: {
    position: 'absolute',
    width: 105,
    height: 40,
    top: 4,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  tabTextMonth: {
    position: 'absolute',
    width: 52,
    height: 24,
    left: 55,
    top: 12,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.6,
  },
  tabTextYear: {
    position: 'absolute',
    width: 36,
    height: 24,
    left: 263,
    top: 12,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.6,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabTextInactive: {
    color: 'rgba(96, 96, 102, 0.96)',
  },
  tabTouchLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 179,
    height: 48,
  },
  tabTouchRight: {
    position: 'absolute',
    left: 179,
    top: 0,
    width: 179,
    height: 48,
  },

  // ─── month (Figma: width 390, height 499, radius 24px, bg rgba(247, 247, 247, 0.96)) ───
  monthWrapper: {
    width: '100%',
    maxWidth: 390,
    height: 499,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    overflow: 'hidden',
    alignSelf: 'center',
  },

  // ─── calender (Figma: 390x395, radius 24px top, borderTop 1px solid #EBEBF5, bg #FFFFFF, padding 16px, gap 16px) ───
  calenderCard: {
    width: '100%',
    minHeight: 395,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    gap: 16,
    alignItems: 'center',
  },

  // ─── month header (Figma: 358x48, justify-content space-between) ───
  monthHeader: {
    width: 358,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateAndYearContainer: {
    width: 170,
    height: 28,
    justifyContent: 'center',
  },
  headerTitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  navButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 40,
    height: 48,
  },
  navCircleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navCircleButtonDisabled: {
    opacity: 0.35,
  },

  // ─── Calendar Month View (7-Column Weekday Grid) ───
  calendarMonthView: {
    width: 358,
    alignSelf: 'center',
    gap: 12,
  },
  weekdayRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  weekdayCell: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  calendarWeeksContainer: {
    width: '100%',
    gap: 8,
  },
  calendarWeekRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarDayCell: {
    width: 44,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  calendarDayCellSelected: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  calendarDayCellDisabled: {
    opacity: 0.3,
  },
  calendarDayCellEmpty: {
    width: 44,
    height: 38,
  },
  calendarDayText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  calendarDayTextDisabled: {
    color: 'rgba(192, 192, 204, 0.8)',
    fontWeight: '400',
  },

  // ─── order type (Year View: 358x276, radius 24px top, bg #FFFFFF) ───
  orderTypeContainer: {
    width: 358,
    height: 276,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: 'relative',
    alignSelf: 'center',
  },

  // Selector bar (Figma: 326x40, left 16, top 118, radius 24px, bg rgba(229, 229, 229, 0.8))
  yearSelectorBar: {
    position: 'absolute',
    width: 326,
    height: 40,
    left: 16,
    top: 118,
    backgroundColor: 'rgba(229, 229, 229, 0.8)',
    borderRadius: 24,
    zIndex: 1,
  },

  // Top & Bottom Vertical Divider Guide Lines
  topVerticalDividerLeft: {
    position: 'absolute',
    width: 1,
    height: 98,
    left: 103,
    top: 8,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    zIndex: 2,
  },
  topVerticalDividerRight: {
    position: 'absolute',
    width: 1,
    height: 98,
    left: 254,
    top: 8,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    zIndex: 2,
  },
  bottomVerticalDividerLeft: {
    position: 'absolute',
    width: 1,
    height: 98,
    left: 103,
    top: 170,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    zIndex: 2,
  },
  bottomVerticalDividerRight: {
    position: 'absolute',
    width: 1,
    height: 98,
    left: 254,
    top: 170,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    zIndex: 2,
  },

  // ScrollView wheel picker
  yearScrollView: {
    width: '100%',
    height: 276,
    zIndex: 3,
  },
  yearScrollContent: {
    paddingTop: 118,
    paddingBottom: 118,
  },
  yearScrollItem: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearItemText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  yearItemTextSelected: {
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
  },
  yearItemTextDiff1: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  yearItemTextDiff2: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(128, 128, 136, 0.96)',
  },
  yearItemTextDiff3: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 10,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(192, 192, 204, 0.8)',
  },
  yearItemTextDisabled: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(192, 192, 204, 0.6)',
    opacity: 0.35,
  },

  // Top & Bottom gradient fades
  topGradientFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 43,
    zIndex: 4,
  },
  bottomGradientFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 43,
    zIndex: 4,
  },

  // ─── action button (Figma: 390x80, padding 16px, bg #FFFFFF, radius 0 0 24 24) ───
  actionButtonContainer: {
    width: '100%',
    height: 80,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filledActionButton: {
    width: 358,
    height: 48,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.16)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  actionButtonText: {
    ...typography.button,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
