import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { TactilePressable } from './ui/TactilePressable';
import { triggerLightHaptic } from '../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

// ── Chevrons (Figma 1:1 Vector: light blue #1A82FF) ──────────────────────────
function ChevronLeftBlueIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18l-6-6 6-6"
        stroke="#1A82FF"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronRightBlueIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18l6-6-6-6"
        stroke="#1A82FF"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Constants for Year range per prompt specifications
export const YEARS_FUTURE = 2;
export const YEARS_PAST = 10;
export const YEAR_ITEM_HEIGHT = 44;

export type FilterValue =
  | { type: 'day'; year: number; month: number; day: number }
  | { type: 'year'; year: number };

export interface DateFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilter: (filter: FilterValue) => void;
  currentFilter?: FilterValue | null;
  /**
   * TODO (Backend): Predicate to determine if a calendar date is disabled.
   * Default disables nothing.
   */
  isDateDisabled?: (day: number, month: number, year: number) => boolean;
}

export const DateFilterSheet: React.FC<DateFilterSheetProps> = ({
  visible,
  onClose,
  onApplyFilter,
  currentFilter,
  isDateDisabled = () => false,
}) => {
  const insets = useSafeAreaInsets();
  const today = useMemo(() => new Date(), []);

  // Compute descending years list based on current year: [currentYear + 2, ..., currentYear - 10]
  const yearsList = useMemo(() => {
    const currentDeviceYear = today.getFullYear();
    const maxYear = currentDeviceYear + YEARS_FUTURE;
    const minYear = currentDeviceYear - YEARS_PAST;
    const list: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      list.push(y);
    }
    return list;
  }, [today]);

  // Single Source of Truth for Sheet state
  const [tab, setTab] = useState<'month' | 'year'>('month');
  const [month, setMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [monthYear, setMonthYear] = useState<number>(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Year Tab selection state
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());

  const yearScrollRef = useRef<ScrollView>(null);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<any>(null);

  // Sync internal state with active filter when opened
  useEffect(() => {
    if (visible) {
      if (currentFilter) {
        if (currentFilter.type === 'day') {
          setTab('month');
          setMonth(currentFilter.month);
          setMonthYear(currentFilter.year);
          setSelectedDay(currentFilter.day);
          setSelectedYear(currentFilter.year);
        } else {
          setTab('year');
          setSelectedYear(currentFilter.year);
          setMonthYear(currentFilter.year);
        }
      } else {
        // Reset to today
        setMonth(today.getMonth());
        setMonthYear(today.getFullYear());
        setSelectedDay(null);
        setSelectedYear(today.getFullYear());
      }
    }
  }, [visible, currentFilter, today]);

  // Programmatic scroll helper for Year wheel
  const scrollToYearIndex = (year: number, animated = true) => {
    const idx = yearsList.indexOf(year);
    if (idx !== -1 && yearScrollRef.current) {
      isProgrammaticScrollRef.current = true;
      yearScrollRef.current.scrollTo({
        y: idx * YEAR_ITEM_HEIGHT,
        animated,
      });
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, animated ? 250 : 50);
    }
  };

  // Scroll year wheel on tab change to 'year'
  useEffect(() => {
    if (visible && tab === 'year') {
      const timer = setTimeout(() => {
        scrollToYearIndex(selectedYear, false);
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [visible, tab, selectedYear]);

  // Year wheel scroll handlers (Single source of truth)
  const handleYearScroll = (e: any) => {
    if (isProgrammaticScrollRef.current) return;
    const offsetY = e.nativeEvent.contentOffset.y;
    const rawIdx = Math.round(offsetY / YEAR_ITEM_HEIGHT);
    const clampedIdx = Math.max(0, Math.min(yearsList.length - 1, rawIdx));
    const targetYear = yearsList[clampedIdx];
    if (targetYear !== undefined && targetYear !== selectedYear) {
      setSelectedYear(targetYear);
    }
  };

  const handleYearScrollEnd = (e: any) => {
    if (isProgrammaticScrollRef.current) return;
    const offsetY = e.nativeEvent.contentOffset.y;
    const rawIdx = Math.round(offsetY / YEAR_ITEM_HEIGHT);
    const clampedIdx = Math.max(0, Math.min(yearsList.length - 1, rawIdx));
    const targetYear = yearsList[clampedIdx];
    if (targetYear !== undefined) {
      setSelectedYear(targetYear);
      scrollToYearIndex(targetYear, true);
    }
  };

  // Month navigation (across year boundaries)
  const handlePrevMonth = () => {
    triggerLightHaptic();
    if (month === 0) {
      setMonth(11);
      setMonthYear((prev) => prev - 1);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    triggerLightHaptic();
    if (month === 11) {
      setMonth(0);
      setMonthYear((prev) => prev + 1);
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  // Year navigation via chevrons (steps wheel and syncs)
  const handlePrevYearChevron = () => {
    const idx = yearsList.indexOf(selectedYear);
    if (idx < yearsList.length - 1) {
      triggerLightHaptic();
      const older = yearsList[idx + 1];
      setSelectedYear(older);
      scrollToYearIndex(older, true);
    }
  };

  const handleNextYearChevron = () => {
    const idx = yearsList.indexOf(selectedYear);
    if (idx > 0) {
      triggerLightHaptic();
      const newer = yearsList[idx - 1];
      setSelectedYear(newer);
      scrollToYearIndex(newer, true);
    }
  };

  // Month 7-column calendar grid calculation (Starts on Monday = 0)
  const calendarGrid = useMemo(() => {
    const firstDayDate = new Date(monthYear, month, 1);
    // Convert getDay() (Sunday=0, Monday=1) to Monday=0, Sunday=6
    const startDayIndex = (firstDayDate.getDay() + 6) % 7;
    const daysInMonth = new Date(monthYear, month + 1, 0).getDate();

    const cells: Array<{ day: number | null; disabled: boolean }> = [];
    // Leading blanks
    for (let i = 0; i < startDayIndex; i++) {
      cells.push({ day: null, disabled: false });
    }
    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const disabled = isDateDisabled(d, month, monthYear);
      cells.push({ day: d, disabled });
    }
    return cells;
  }, [monthYear, month, isDateDisabled]);

  // Search button press
  const handleSearch = () => {
    triggerLightHaptic();
    if (tab === 'month') {
      if (selectedDay !== null) {
        onApplyFilter({
          type: 'day',
          year: monthYear,
          month,
          day: selectedDay,
        });
        onClose();
      }
    } else {
      onApplyFilter({
        type: 'year',
        year: selectedYear,
      });
      onClose();
    }
  };

  const isSearchDisabled = tab === 'month' && selectedDay === null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Backdrop: tap to close without applying */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* ── Bottom Sheet (White, 24px top radius) ── */}
        <View
          style={[
            styles.sheetContainer,
            {
              paddingBottom:
                Platform.OS === 'android'
                  ? Math.max(insets.bottom, 56)
                  : Math.max(insets.bottom, 16),
            },
          ]}
        >
          {/* ── Segmented Pill Tabs ("Month" & "Year") ── */}
          <View style={styles.tabTrackWrapper}>
            <View style={styles.tabTrack}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.tabPill,
                  tab === 'month' && styles.tabPillActive,
                ]}
                onPress={() => {
                  triggerLightHaptic();
                  setTab('month');
                }}
              >
                <Text
                  style={[
                    styles.tabPillText,
                    tab === 'month' ? styles.tabPillTextActive : styles.tabPillTextInactive,
                  ]}
                >
                  Month
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.tabPill,
                  tab === 'year' && styles.tabPillActive,
                ]}
                onPress={() => {
                  triggerLightHaptic();
                  setTab('year');
                }}
              >
                <Text
                  style={[
                    styles.tabPillText,
                    tab === 'year' ? styles.tabPillTextActive : styles.tabPillTextInactive,
                  ]}
                >
                  Year
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Main View: Month Tab vs Year Tab ── */}
          {tab === 'month' ? (
            /* ── VIEW 1: MONTH CALENDAR ── */
            <View style={styles.contentBody}>
              <View style={styles.calendarCard}>
                {/* Month & Year Header with chevrons */}
                <View style={styles.headerRow}>
                  <Text style={styles.headerTitleText}>
                    {MONTH_NAMES[month]}, {monthYear}
                  </Text>

                  <View style={styles.chevronsRow}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.chevronButton}
                      onPress={handlePrevMonth}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel="Previous month"
                    >
                      <ChevronLeftBlueIcon size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.chevronButton}
                      onPress={handleNextMonth}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel="Next month"
                    >
                      <ChevronRightBlueIcon size={20} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Weekdays Row: Mon - Sun (Week starts on Monday) */}
                <View style={styles.weekdaysRow}>
                  {WEEKDAYS.map((wd) => (
                    <Text key={wd} style={styles.weekdayLabel}>
                      {wd}
                    </Text>
                  ))}
                </View>

                {/* 7-Column Day Grid (Height stable between 5 and 6 rows) */}
                <View style={styles.datesGridContainer}>
                  {calendarGrid.map((item, index) => {
                    if (item.day === null) {
                      return <View key={`blank-${index}`} style={styles.dayCellBlank} />;
                    }

                    const isSelected = selectedDay === item.day;
                    const isDisabled = item.disabled;

                    return (
                      <TouchableOpacity
                        key={`day-${item.day}`}
                        activeOpacity={isDisabled ? 1 : 0.75}
                        disabled={isDisabled}
                        onPress={() => {
                          triggerLightHaptic();
                          setSelectedDay(item.day);
                        }}
                        style={[
                          styles.dayCell,
                          isSelected && styles.dayCellSelected,
                          isDisabled && styles.dayCellDisabled,
                        ]}
                        accessibilityLabel={`Day ${item.day}`}
                      >
                        <Text
                          style={[
                            styles.dayCellText,
                            isSelected && styles.dayCellTextSelected,
                            isDisabled && styles.dayCellTextDisabled,
                          ]}
                        >
                          {item.day}
                        </Text>
                        {isDisabled && <View style={styles.strikethroughBar} />}
                      </TouchableOpacity>
                    );
                  })}
                  {/* Fillers to maintain layout consistency */}
                  {Array.from({ length: 7 }).map((_, i) => (
                    <View key={`filler-${i}`} style={styles.dayCellBlank} pointerEvents="none" />
                  ))}
                </View>
              </View>

              {/* ── Search Action Button ── */}
              <View style={styles.actionButtonSection}>
                <TactilePressable
                  disabled={isSearchDisabled}
                  style={[
                    styles.searchActionButton,
                    isSearchDisabled ? styles.searchButtonDisabled : styles.searchButtonEnabled,
                  ]}
                  onPress={handleSearch}
                >
                  <Text
                    style={[
                      styles.searchButtonText,
                      isSearchDisabled ? styles.searchButtonTextDisabled : styles.searchButtonTextEnabled,
                    ]}
                  >
                    Search
                  </Text>
                </TactilePressable>
              </View>
            </View>
          ) : (
            /* ── VIEW 2: YEAR WHEEL ── */
            <View style={styles.contentBody}>
              <View style={styles.yearCard}>
                {/* Year Header with chevrons */}
                <View style={styles.headerRow}>
                  <Text style={styles.headerTitleText}>{selectedYear}</Text>

                  <View style={styles.chevronsRow}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.chevronButton}
                      onPress={handlePrevYearChevron}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel="Previous year"
                    >
                      <ChevronLeftBlueIcon size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.chevronButton}
                      onPress={handleNextYearChevron}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel="Next year"
                    >
                      <ChevronRightBlueIcon size={20} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* ── Vertical Descending Year Wheel (Height: 276px) ── */}
                <View style={styles.yearWheelContainer}>
                  {/* Center Highlighted Pill */}
                  <View style={styles.yearCenterHighlightPill} pointerEvents="none" />

                  {/* Vertical Guidelines */}
                  <View style={styles.yearGuidelineLeft} pointerEvents="none" />
                  <View style={styles.yearGuidelineRight} pointerEvents="none" />

                  {/* Wheel ScrollView */}
                  <ScrollView
                    ref={yearScrollRef}
                    style={styles.yearScrollView}
                    contentContainerStyle={styles.yearScrollContent}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={YEAR_ITEM_HEIGHT}
                    snapToAlignment="center"
                    decelerationRate="fast"
                    scrollEventThrottle={16}
                    onScroll={handleYearScroll}
                    onMomentumScrollEnd={handleYearScrollEnd}
                    onScrollEndDrag={handleYearScrollEnd}
                  >
                    {yearsList.map((y) => {
                      const diff = Math.abs(y - selectedYear);
                      return (
                        <TouchableOpacity
                          key={y}
                          style={styles.yearWheelItem}
                          activeOpacity={0.7}
                          onPress={() => {
                            triggerLightHaptic();
                            setSelectedYear(y);
                            scrollToYearIndex(y, true);
                          }}
                        >
                          <Text
                            style={[
                              styles.yearTextBase,
                              diff === 0 && styles.yearTextSelected,
                              diff === 1 && styles.yearTextNeighbor1,
                              diff === 2 && styles.yearTextNeighbor2,
                              diff >= 3 && styles.yearTextNeighbor3,
                            ]}
                          >
                            {y}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>

              {/* ── Search Action Button (Enabled by default on Year tab) ── */}
              <View style={styles.actionButtonSection}>
                <TactilePressable
                  style={[styles.searchActionButton, styles.searchButtonEnabled]}
                  onPress={handleSearch}
                >
                  <Text style={[styles.searchButtonText, styles.searchButtonTextEnabled]}>
                    Search
                  </Text>
                </TactilePressable>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default DateFilterSheet;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 8, 20, 0.4)',
  },

  backdrop: {
    ...StyleSheet.absoluteFill,
  },

  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },

  /* ── Segmented Pill Tabs (358x48px, radius: 24px) ── */
  tabTrackWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  tabTrack: {
    width: Math.min(358, SCREEN_WIDTH - 32),
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },

  tabPill: {
    width: (Math.min(358, SCREEN_WIDTH - 32) - 8) / 2,
    height: 40,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabPillActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },

  tabPillText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
    includeFontPadding: false,
  },

  tabPillTextActive: {
    color: '#FFFFFF',
  },

  tabPillTextInactive: {
    color: 'rgba(96, 96, 102, 0.96)',
  },

  /* ── Main Body Card ── */
  contentBody: {
    width: '100%',
    alignItems: 'center',
  },

  calendarCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#EBEBF5',
    paddingTop: 16,
    paddingHorizontal: 16,
  },

  yearCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#EBEBF5',
    paddingTop: 16,
    paddingHorizontal: 16,
  },

  headerRow: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  headerTitleText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.3,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },

  chevronsRow: {
    flexDirection: 'row',
    gap: 16,
  },

  chevronButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Weekdays ── */
  weekdaysRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 12,
  },

  weekdayLabel: {
    width: 38,
    textAlign: 'center',
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },

  /* ── 7-Column Day Grid (Stable Height for 5/6 rows) ── */
  datesGridContainer: {
    width: '100%',
    minHeight: 278, // Exact Figma stable height (276.42px)
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    paddingBottom: 16,
  },

  dayCell: {
    width: (SCREEN_WIDTH - 32 - 10 * 6) / 7,
    maxWidth: 40,
    height: 36,
    borderWidth: 1,
    borderColor: '#EBEBF5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  dayCellSelected: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },

  dayCellDisabled: {
    borderColor: '#F2F2F7',
  },

  dayCellBlank: {
    width: (SCREEN_WIDTH - 32 - 10 * 6) / 7,
    maxWidth: 40,
    height: 36,
  },

  dayCellText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 22,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },

  dayCellTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },

  dayCellTextDisabled: {
    color: '#C0C0CC',
  },

  strikethroughBar: {
    position: 'absolute',
    width: 16,
    height: 1,
    backgroundColor: '#C0C0CC',
  },

  /* ── Year Wheel Picker (276px tall) ── */
  yearWheelContainer: {
    width: '100%',
    height: 276,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },

  yearCenterHighlightPill: {
    position: 'absolute',
    width: Math.min(326, SCREEN_WIDTH - 64),
    height: 40,
    backgroundColor: 'rgba(229, 229, 229, 0.8)',
    borderRadius: 24,
    top: (276 - 40) / 2,
    zIndex: 1,
  },

  yearGuidelineLeft: {
    position: 'absolute',
    left: (SCREEN_WIDTH - 326) / 2 - 8,
    width: 1,
    height: 88,
    backgroundColor: '#EBEBF5',
    top: 94,
    zIndex: 2,
  },

  yearGuidelineRight: {
    position: 'absolute',
    right: (SCREEN_WIDTH - 326) / 2 - 8,
    width: 1,
    height: 88,
    backgroundColor: '#EBEBF5',
    top: 94,
    zIndex: 2,
  },

  yearScrollView: {
    width: '100%',
    height: 276,
    zIndex: 3,
  },

  yearScrollContent: {
    paddingVertical: (276 - YEAR_ITEM_HEIGHT) / 2,
    alignItems: 'center',
  },

  yearWheelItem: {
    height: YEAR_ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },

  yearTextBase: {
    fontFamily: FONT_REGULAR,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  yearTextSelected: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    color: '#000000',
  },

  yearTextNeighbor1: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  yearTextNeighbor2: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.7)',
  },

  yearTextNeighbor3: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 10,
    lineHeight: 14,
    color: 'rgba(96, 96, 102, 0.4)',
  },

  /* ── Action Button Section ── */
  actionButtonSection: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },

  searchActionButton: {
    width: Math.min(358, SCREEN_WIDTH - 32),
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchButtonDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },

  searchButtonEnabled: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },

  searchButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    includeFontPadding: false,
  },

  searchButtonTextDisabled: {
    color: '#C0C0CC',
  },

  searchButtonTextEnabled: {
    color: '#FFFFFF',
  },
});
