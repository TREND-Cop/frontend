import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSafeBottomPadding } from '../../utils/safeArea';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ChevronLeft, ChevronRight, Check, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { bookingStore } from '../../utils/bookingStore';
import { typography } from '../../constants/theme';

// ── Day Options (6 days in 3 rows x 2 columns matching Figma) ──
const DAY_OPTIONS = [
  { id: 'mon', key: 'Monday', label: 'Monday', col: 0, row: 0 },
  { id: 'tue', key: 'Tuesday', label: 'Tuesday', col: 1, row: 0 },
  { id: 'wed', key: 'Wednesday', label: 'Wednesday', col: 0, row: 1 },
  { id: 'thu', key: 'Thursday', label: 'Thursday', col: 1, row: 1 },
  { id: 'fri', key: 'Friday', label: 'Friday', col: 0, row: 2 },
  { id: 'sat', key: 'Saturday', label: 'Saturday', col: 1, row: 2 },
];

// Calculate calendar days
const getWeekdayDatesForMonth = (year: number, monthIndex: number) => {
  const map: Record<string, number[]> = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  const dayNameKeys = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  for (let d = 1; d <= totalDays; d++) {
    const dayOfWeek = new Date(year, monthIndex, d).getDay();
    const name = dayNameKeys[dayOfWeek];
    if (map[name]) {
      map[name].push(d);
    }
  }
  return map;
};

// Booked / Disabled calendar days
const DISABLED_CALENDAR_DAYS = [2, 6, 10, 11, 12, 14, 23, 24, 26];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ── 1:1 Figma Year Picker Wheel Constants (Dynamic from device date) ──
const ITEM_HEIGHT = 40;
const todayNow = new Date();
const CURRENT_YEAR = todayNow.getFullYear();
const CURRENT_MONTH = todayNow.getMonth();
const CURRENT_DAY = todayNow.getDate();
const YEARS_AHEAD = 20; // 20 years forward
const MIN_YEAR = CURRENT_YEAR;
const MAX_YEAR = CURRENT_YEAR + YEARS_AHEAD;

// Year items for wheel: 2 past years (disabled context) + valid years range
const PAST_YEARS = [
  { year: CURRENT_YEAR - 2, isPast: true },
  { year: CURRENT_YEAR - 1, isPast: true },
];
const YEAR_ITEMS = [
  ...PAST_YEARS,
  ...Array.from({ length: YEARS_AHEAD + 1 }, (_, i) => ({
    year: CURRENT_YEAR + i,
    isPast: false,
  })),
];
const MIN_SELECTABLE_INDEX = PAST_YEARS.length;
const MAX_SELECTABLE_INDEX = YEAR_ITEMS.length - 1;

export const AppointmentDayScreen = ({ navigation }: { navigation?: any }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const initialDateObj = (() => {
    const stored = bookingStore.getAppointmentDate();
    if (stored) {
      const parsed = new Date(stored);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  })();

  const dayNameKeys = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<string | null>(null);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);
  const [calendarMonthIndex, setCalendarMonthIndex] = useState<number>(
    initialDateObj.getFullYear() === CURRENT_YEAR
      ? Math.max(CURRENT_MONTH, initialDateObj.getMonth())
      : initialDateObj.getMonth()
  );
  // Single source of truth for year
  const [calendarYear, setCalendarYear] = useState<number>(
    Math.max(MIN_YEAR, Math.min(MAX_YEAR, initialDateObj.getFullYear()))
  );
  const [calendarTab, setCalendarTab] = useState<'Month' | 'Year'>('Month');
  const yearScrollRef = useRef<ScrollView>(null);

  // Sync scroll position once when switching to Year tab
  useEffect(() => {
    if (calendarTab === 'Year') {
      const idx = YEAR_ITEMS.findIndex((item) => item.year === calendarYear);
      if (idx >= 0) {
        const timer = setTimeout(() => {
          yearScrollRef.current?.scrollTo({
            y: idx * ITEM_HEIGHT,
            animated: false,
          });
        }, 30);
        return () => clearTimeout(timer);
      }
    }
  }, [calendarTab]);

  const weekdayDatesMap = useMemo(
    () => getWeekdayDatesForMonth(calendarYear, calendarMonthIndex),
    [calendarYear, calendarMonthIndex]
  );

  // Real-time wheel scroll handler (Single Source of Truth - updates live)
  const handleYearScroll = (e: any) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const rawIndex = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(MIN_SELECTABLE_INDEX, Math.min(MAX_SELECTABLE_INDEX, rawIndex));
    const yrItem = YEAR_ITEMS[clampedIndex];

    if (yrItem && !yrItem.isPast && yrItem.year !== calendarYear) {
      setCalendarYear(yrItem.year);
    }
  };

  const handleScrollEndDrag = (e: any) => {
    const velocityY = e.nativeEvent.velocity?.y ?? 0;
    if (Math.abs(velocityY) < 0.1) {
      handleScrollEnd(e);
    }
  };

  const handleScrollEnd = (e: any) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const rawIndex = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(MIN_SELECTABLE_INDEX, Math.min(MAX_SELECTABLE_INDEX, rawIndex));
    const yrItem = YEAR_ITEMS[clampedIndex];
    if (yrItem && !yrItem.isPast) {
      if (yrItem.year !== calendarYear) {
        setCalendarYear(yrItem.year);
      }
      const targetY = clampedIndex * ITEM_HEIGHT;
      if (Math.abs(offsetY - targetY) > 1) {
        yearScrollRef.current?.scrollTo({
          y: targetY,
          animated: true,
        });
      }
    } else if (yrItem && yrItem.isPast) {
      const firstValidIdx = MIN_SELECTABLE_INDEX;
      const validYear = YEAR_ITEMS[firstValidIdx].year;
      setCalendarYear(validYear);
      yearScrollRef.current?.scrollTo({
        y: firstValidIdx * ITEM_HEIGHT,
        animated: true,
      });
    }
  };

  const canGoPrev =
    calendarTab === 'Year'
      ? calendarYear > MIN_YEAR
      : !(calendarYear === MIN_YEAR && calendarMonthIndex <= CURRENT_MONTH);

  const canGoNext =
    calendarTab === 'Year'
      ? calendarYear < MAX_YEAR
      : !(calendarYear >= MAX_YEAR && calendarMonthIndex >= 11);

  // Month / Year navigation handlers
  const handleMonthPrev = () => {
    if (!canGoPrev) return;

    if (calendarTab === 'Year') {
      const newYear = calendarYear - 1;
      setCalendarYear(newYear);
      const idx = YEAR_ITEMS.findIndex((item) => item.year === newYear);
      if (idx >= 0) {
        yearScrollRef.current?.scrollTo({
          y: idx * ITEM_HEIGHT,
          animated: true,
        });
      }
      return;
    }
    if (calendarMonthIndex > 0) {
      setCalendarMonthIndex((m) => m - 1);
    } else if (calendarYear > MIN_YEAR) {
      setCalendarMonthIndex(11);
      setCalendarYear((y) => y - 1);
    }
  };

  const handleMonthNext = () => {
    if (!canGoNext) return;

    if (calendarTab === 'Year') {
      const newYear = calendarYear + 1;
      setCalendarYear(newYear);
      const idx = YEAR_ITEMS.findIndex((item) => item.year === newYear);
      if (idx >= 0) {
        yearScrollRef.current?.scrollTo({
          y: idx * ITEM_HEIGHT,
          animated: true,
        });
      }
      return;
    }
    if (calendarMonthIndex < 11) {
      setCalendarMonthIndex((m) => m + 1);
    } else if (calendarYear < MAX_YEAR) {
      setCalendarMonthIndex(0);
      setCalendarYear((y) => y + 1);
    }
  };

  const handleGoBack = () => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/booking-review' as any);
    }
  };

  // Day of the week selection -> dynamically filters calendar
  const handleSelectDayOfWeek = (dayKey: string) => {
    if (selectedDayOfWeek === dayKey) {
      setSelectedDayOfWeek(null);
      setSelectedCalendarDay(null);
      return;
    }
    setSelectedDayOfWeek(dayKey);

    // Pick first available matching date for this weekday
    const matchingDates = weekdayDatesMap[dayKey] || [];
    const firstAvailable = matchingDates.find(
      (d) => !DISABLED_CALENDAR_DAYS.includes(d)
    );
    if (firstAvailable) {
      setSelectedCalendarDay(firstAvailable);
    } else if (matchingDates.length > 0) {
      setSelectedCalendarDay(matchingDates[0]);
    }
  };

  const handleSelectCalendarDay = (dayNum: number, isAvailable: boolean) => {
    if (!isAvailable) return;
    if (selectedCalendarDay === dayNum) {
      setSelectedCalendarDay(null);
      setSelectedDayOfWeek(null);
      return;
    }
    setSelectedCalendarDay(dayNum);
    const dayOfWeekIdx = new Date(calendarYear, calendarMonthIndex, dayNum).getDay();
    setSelectedDayOfWeek(dayNameKeys[dayOfWeekIdx] || null);
  };

  const params = useLocalSearchParams();
  const fromReview = params.from === 'review';

  const handleApply = () => {
    if (!selectedCalendarDay) return;
    const day = selectedCalendarDay;
    const month = MONTH_NAMES[calendarMonthIndex];
    bookingStore.setAppointmentDate(`${month} ${day}, ${calendarYear}`);

    if (fromReview) {
      if (navigation?.canGoBack && navigation.canGoBack()) {
        navigation.goBack();
      } else if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/booking-review' as any);
      }
    } else {
      router.push('/appointment-time' as any);
    }
  };

  // Calendar dates list for currently displayed month
  const calendarDaysCount = new Date(calendarYear, calendarMonthIndex + 1, 0).getDate();
  const calendarDaysList = Array.from({ length: calendarDaysCount }, (_, i) => i + 1);

  // Active dates for the selected weekday
  const activeWeekdayDates = selectedDayOfWeek ? (weekdayDatesMap[selectedDayOfWeek] || []) : [];

  return (
    <View style={styles.modalRoot}>
      {/* Dimmed backdrop covering the page behind */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleGoBack}
      />

      <View style={[styles.sheetContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {/* Top Drag Handle Indicator */}
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        {/* ─── Header (Figma: height 64px, borderBottom) ─── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.backButton}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Appointment Day</Text>

          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.closeButton}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={22} color="rgba(0, 8, 20, 0.96)" />
          </TouchableOpacity>
        </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEnabled={calendarTab !== 'Year'}
        nestedScrollEnabled={true}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 110 + insets.bottom },
        ]}
      >
        {/* ─── Section 1: Day of the week ─── */}
        <View style={styles.dayOfWeekSection}>
          <Text style={styles.sectionHeading}>Day of the week</Text>

          {/* 3 rows x 2 columns grid */}
          <View style={styles.dayGridContainer}>
            {/* Row 1: Monday, Tuesday */}
            <View style={styles.dayGridRow}>
              {DAY_OPTIONS.slice(0, 2).map((item) => {
                const isSelected = selectedDayOfWeek === item.key;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.dayButton,
                      isSelected && styles.dayButtonSelected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleSelectDayOfWeek(item.key)}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        isSelected && styles.dayButtonTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>

                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                      ]}
                    >
                      {isSelected && (
                        <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Row 2: Wednesday, Thursday */}
            <View style={styles.dayGridRow}>
              {DAY_OPTIONS.slice(2, 4).map((item) => {
                const isSelected = selectedDayOfWeek === item.key;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.dayButton,
                      isSelected && styles.dayButtonSelected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleSelectDayOfWeek(item.key)}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        isSelected && styles.dayButtonTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>

                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                      ]}
                    >
                      {isSelected && (
                        <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Row 3: Friday, Saturday */}
            <View style={styles.dayGridRow}>
              {DAY_OPTIONS.slice(4, 6).map((item) => {
                const isSelected = selectedDayOfWeek === item.key;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.dayButton,
                      isSelected && styles.dayButtonSelected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleSelectDayOfWeek(item.key)}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        isSelected && styles.dayButtonTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>

                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                      ]}
                    >
                      {isSelected && (
                        <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* ─── Section 2: Interactive Dynamic Calendar ─── */}
        <View style={styles.calendarCardContainer}>
          {/* Header: Month, Year + Circular Back / Forward Buttons */}
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalMonthTitle}>
              {calendarTab === 'Month'
                ? `${MONTH_NAMES[calendarMonthIndex]}, ${calendarYear}`
                : `${calendarYear}`}
            </Text>

            <View style={styles.modalNavButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.modalNavCircleButton,
                  !canGoPrev && styles.modalNavCircleButtonDisabled,
                ]}
                disabled={!canGoPrev}
                activeOpacity={0.7}
                onPress={handleMonthPrev}
              >
                <ChevronLeft
                  size={20}
                  color={canGoPrev ? "#1A82FF" : "rgba(192, 192, 204, 0.6)"}
                  strokeWidth={2}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalNavCircleButton,
                  !canGoNext && styles.modalNavCircleButtonDisabled,
                ]}
                disabled={!canGoNext}
                activeOpacity={0.7}
                onPress={handleMonthNext}
              >
                <ChevronRight
                  size={20}
                  color={canGoNext ? "#1A82FF" : "rgba(192, 192, 204, 0.6)"}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Segmented Month / Year Tab (358x48, radius 24px, pill 105x40) */}
          <View style={styles.calendarTabTrack}>
            <TouchableOpacity
              style={[
                styles.calendarTabPill,
                calendarTab === 'Month' && styles.calendarTabPillActive,
              ]}
              activeOpacity={0.8}
              onPress={() => setCalendarTab('Month')}
            >
              <Text
                style={[
                  styles.calendarTabText,
                  calendarTab === 'Month' && styles.calendarTabTextActive,
                ]}
              >
                Month
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.calendarTabPill,
                calendarTab === 'Year' && styles.calendarTabPillActive,
              ]}
              activeOpacity={0.8}
              onPress={() => setCalendarTab('Year')}
            >
              <Text
                style={[
                  styles.calendarTabText,
                  calendarTab === 'Year' && styles.calendarTabTextActive,
                ]}
              >
                Year
              </Text>
            </TouchableOpacity>
          </View>

          {/* Calendar Grid (Month View) vs Year Wheel Picker (Year View) */}
          {calendarTab === 'Month' ? (
            <View style={styles.calendarGrid}>
              {calendarDaysList.map((dayNum) => {
                const isPastDay =
                  calendarYear < CURRENT_YEAR ||
                  (calendarYear === CURRENT_YEAR && calendarMonthIndex < CURRENT_MONTH) ||
                  (calendarYear === CURRENT_YEAR && calendarMonthIndex === CURRENT_MONTH && dayNum < CURRENT_DAY);

                const isAvailable = !isPastDay && !DISABLED_CALENDAR_DAYS.includes(dayNum);
                const isSelected = selectedCalendarDay === dayNum;

                return (
                  <TouchableOpacity
                    key={dayNum}
                    style={[
                      styles.calendarDayCell,
                      isSelected && styles.calendarDayCellSelected,
                      !isAvailable && styles.calendarDayCellDisabled,
                    ]}
                    disabled={!isAvailable}
                    activeOpacity={0.7}
                    onPress={() => handleSelectCalendarDay(dayNum, isAvailable)}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        isSelected && styles.textWhite,
                        !isAvailable && styles.calendarDayTextDisabled,
                      ]}
                    >
                      {dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              {/* Dummy filler elements to prevent incomplete bottom row from spreading out wide */}
              {Array.from({ length: 8 }).map((_, i) => (
                <View key={`dummy_${i}`} style={styles.calendarDayCellDummy} pointerEvents="none" />
              ))}
            </View>
          ) : (
            <View style={styles.orderTypeContainer}>
              {/* Selector bar (Figma: 326x40, left 16, top 118, bg rgba(229, 229, 229, 0.8), radius 24px) */}
              <View style={styles.yearSelectorBar} pointerEvents="none" />

              {/* Top vertical guide lines (flanking years above selector bar) */}
              <View style={styles.topVerticalDividerLeft} pointerEvents="none" />
              <View style={styles.topVerticalDividerRight} pointerEvents="none" />

              {/* Bottom vertical guide lines (flanking years below selector bar) */}
              <View style={styles.bottomVerticalDividerLeft} pointerEvents="none" />
              <View style={styles.bottomVerticalDividerRight} pointerEvents="none" />

              {/* Swipeable / Scrollable Years Wheel */}
              <ScrollView
                ref={yearScrollRef}
                style={styles.yearScrollView}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                snapToAlignment="center"
                decelerationRate="fast"
                nestedScrollEnabled={true}
                scrollEventThrottle={16}
                overScrollMode="never"
                bounces={true}
                contentContainerStyle={styles.yearScrollContent}
                onScroll={handleYearScroll}
                onScrollEndDrag={handleScrollEndDrag}
                onMomentumScrollEnd={handleScrollEnd}
              >
                {YEAR_ITEMS.map((yrItem, idx) => {
                  const yr = yrItem.year;
                  const isPast = yrItem.isPast;
                  const isSelected = !isPast && yr === calendarYear;
                  const diff = Math.abs(yr - calendarYear);
                  return (
                    <TouchableOpacity
                      key={yr}
                      style={styles.yearScrollItem}
                      activeOpacity={isPast ? 1 : 0.7}
                      disabled={isPast}
                      onPress={() => {
                        if (isPast) return;
                        setCalendarYear(yr);
                        yearScrollRef.current?.scrollTo({
                          y: idx * ITEM_HEIGHT,
                          animated: true,
                        });
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

              <LinearGradient
                colors={['#FFFFFF', 'rgba(255, 255, 255, 0)']}
                style={[styles.topGradientFade, { pointerEvents: 'none' } as any]}
                pointerEvents="none"
              />

              <LinearGradient
                colors={['rgba(255, 255, 255, 0)', '#FFFFFF']}
                style={[styles.bottomGradientFade, { pointerEvents: 'none' } as any]}
                pointerEvents="none"
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* ─── Bottom Fixed Action Bar: Apply Button (Figma: height 48px, radius 24px) ─── */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: getSafeBottomPadding(insets, 16, 8) },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.applyBtn,
            !selectedCalendarDay && styles.applyBtnDisabled,
          ]}
          disabled={!selectedCalendarDay}
          activeOpacity={0.85}
          onPress={handleApply}
        >
          <Text
            style={[
              styles.applyBtnText,
              !selectedCalendarDay && styles.applyBtnTextDisabled,
            ]}
          >
            Apply
          </Text>
        </TouchableOpacity>
      </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: 'transparent',
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
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    width: '100%',
    shadowColor: '#858B94',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
    overflow: 'hidden',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
    backgroundColor: '#FFFFFF',
  },
  dragHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(217, 217, 217, 0.9)',
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header (Figma: height 64px, padding 8px 16px, borderBottom) ──
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerPlaceholder: {
    width: 48,
    height: 48,
  },

  // ── Scroll Content ──
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 32,
  },

  // ── Section: Day of the week ──
  dayOfWeekSection: {
    gap: 16,
  },
  sectionHeading: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.1,
    color: '#000000',
  },

  // ── Day of the week 3x2 Grid ──
  dayGridContainer: {
    gap: 16,
  },
  dayGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dayButton: {
    flex: 1,
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
  dayButtonSelected: {
    borderColor: 'rgba(0, 8, 20, 0.96)',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  dayButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: '#000000',
  },
  dayButtonTextSelected: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    color: '#000000',
    fontWeight: '500',
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
    borderColor: 'rgba(0, 8, 20, 0.96)',
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Calendar Card Component (Figma: 390x483, radius 24px top, gap 24px) ──
  calendarCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    padding: 16,
    gap: 24,
    shadowColor: '#858B94',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
  },
  modalMonthTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  modalNavButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 40,
  },
  modalNavCircleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalNavCircleButtonDisabled: {
    opacity: 0.35,
  },

  // Segmented Tab
  calendarTabTrack: {
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  calendarTabPill: {
    width: 105,
    height: 40,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarTabPillActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  calendarTabText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  calendarTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '400',
  },

  // Calendar Grid (7 columns x 5 rows, cell 37.43px x 36.08px)
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 24,
    width: '100%',
  },
  calendarDayCell: {
    width: 37.43,
    height: 36.08,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  calendarDayCellSelected: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  calendarDayCellDisabled: {
    width: 37.43,
    height: 36.08,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  calendarDayText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  calendarDayTextDisabled: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(192, 192, 204, 0.96)',
    textAlign: 'center',
  },
  disabledStrikeLine: {
    position: 'absolute',
    width: 16,
    height: 1,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
    top: 17.5,
  },
  textWhite: {
    color: '#FFFFFF',
  },

  // ─── Year View Wheel Picker (Figma: 358x276, radius 24px top, bg #FFFFFF) ───
  orderTypeContainer: {
    width: 358,
    height: 276,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: 'relative',
    alignSelf: 'center',
    overflow: 'hidden',
  },
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
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
  },
  yearItemTextDiff1: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  yearItemTextDiff2: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(128, 128, 136, 0.96)',
  },
  yearItemTextDiff3: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 10,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(192, 192, 204, 0.8)',
  },
  yearItemTextDisabled: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(192, 192, 204, 0.6)',
    opacity: 0.35,
  },
  topGradientFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 43,
  },
  bottomGradientFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 33,
  },

  // ── Bottom Fixed Action Bar: Apply Button ──
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    shadowColor: '#858B94',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  applyBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#858B94',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  applyBtnDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    elevation: 0,
    shadowOpacity: 0,
  },
  applyBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  applyBtnTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  calendarDayCellDummy: {
    width: 37.43,
    height: 0,
  },
});

export default AppointmentDayScreen;
