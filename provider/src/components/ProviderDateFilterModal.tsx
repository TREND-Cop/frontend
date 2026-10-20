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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

// ── Master Typography Standards ───────────────────────────────────────────────
const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

// ── 1:1 Vector Chevrons for Month Change ─────────────────────────────────────
function ChevronLeftBlueIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18l-6-6 6-6"
        stroke="rgba(26, 130, 255, 0.9)"
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
        stroke="rgba(26, 130, 255, 0.9)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Crossed-out unavailable dates from Figma demonstration
const DEFAULT_CROSSED_OUT_DAYS = [2, 6, 10, 11, 12, 14, 23, 24, 26];

// Years range matching Figma (2028, 2027 visible above 2026)
const MAX_YEAR = 2030;
const MIN_YEAR = 2000;
const YEARS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MAX_YEAR - i);
const YEAR_ITEM_HEIGHT = 44;

interface ProviderDateFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (formattedDate: string) => void;
  initialDate?: { day?: number; month: number; year: number };
}

export const ProviderDateFilterModal: React.FC<ProviderDateFilterModalProps> = ({
  visible,
  onClose,
  onSelectDate,
  initialDate,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'month' | 'year'>('month');

  // Calendar State
  const [currentYear, setCurrentYear] = useState<number>(initialDate?.year ?? 2026);
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate?.month ?? 5); // 0-indexed, 5 = June
  const [selectedDay, setSelectedDay] = useState<number | null>(initialDate?.day ?? null);

  // Year Selection State (capped at MAX_YEAR 2026)
  const [pickerYear, setPickerYear] = useState<number>(
    Math.min(MAX_YEAR, Math.max(MIN_YEAR, initialDate?.year ?? 2026))
  );

  const yearScrollRef = useRef<ScrollView>(null);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<any>(null);

  const scrollToYear = (year: number, animated = true) => {
    const idx = YEARS.indexOf(year);
    if (idx !== -1 && yearScrollRef.current) {
      isProgrammaticScrollRef.current = true;
      yearScrollRef.current.scrollTo({
        y: idx * YEAR_ITEM_HEIGHT,
        animated,
      });
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, animated ? 300 : 50);
    }
  };

  // Sync state when modal becomes visible or initialDate changes
  useEffect(() => {
    if (visible) {
      if (initialDate?.year) {
        const y = Math.min(MAX_YEAR, Math.max(MIN_YEAR, initialDate.year));
        setPickerYear(y);
        setCurrentYear(y);
      }
      if (initialDate?.month !== undefined) {
        setCurrentMonth(initialDate.month);
      }
      if (initialDate?.day !== undefined) {
        setSelectedDay(initialDate.day);
      }
    }
  }, [visible, initialDate]);

  useEffect(() => {
    if (visible && activeTab === 'year') {
      const timer = setTimeout(() => {
        scrollToYear(pickerYear, false);
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [visible, activeTab]);

  // Real-time wheel scroll handler keeping header and active year in sync
  const handleYearScroll = (e: any) => {
    if (isProgrammaticScrollRef.current) return;
    const offsetY = e.nativeEvent.contentOffset.y;
    const rawIdx = Math.round(offsetY / YEAR_ITEM_HEIGHT);
    const clampedIdx = Math.max(0, Math.min(YEARS.length - 1, rawIdx));
    const targetYear = YEARS[clampedIdx];
    if (targetYear !== undefined && targetYear !== pickerYear) {
      setPickerYear(targetYear);
    }
  };

  const handleScrollEnd = (e: any) => {
    if (isProgrammaticScrollRef.current) return;
    const offsetY = e.nativeEvent.contentOffset.y;
    const rawIdx = Math.round(offsetY / YEAR_ITEM_HEIGHT);
    const clampedIdx = Math.max(0, Math.min(YEARS.length - 1, rawIdx));
    const targetYear = YEARS[clampedIdx];
    if (targetYear !== undefined) {
      setPickerYear(targetYear);
      scrollToYear(targetYear, true);
    }
  };

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Year navigation via chevrons
  const handlePrevYear = () => {
    const idx = YEARS.indexOf(pickerYear);
    if (idx < YEARS.length - 1) {
      const older = YEARS[idx + 1];
      setPickerYear(older);
      scrollToYear(older, true);
    }
  };

  const handleNextYear = () => {
    const idx = YEARS.indexOf(pickerYear);
    if (idx > 0) {
      const newer = YEARS[idx - 1];
      setPickerYear(newer);
      scrollToYear(newer, true);
    }
  };

  // Month Grid Calculation (Monday = 0, Sunday = 6)
  const calendarDays = useMemo(() => {
    const firstDayDate = new Date(currentYear, currentMonth, 1);
    const dayOfWeek = (firstDayDate.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const grid: Array<{ day: number | null; isCrossed: boolean }> = [];
    // Leading blanks
    for (let i = 0; i < dayOfWeek; i++) {
      grid.push({ day: null, isCrossed: false });
    }
    // Month days
    for (let d = 1; d <= daysInMonth; d++) {
      const isCrossed = DEFAULT_CROSSED_OUT_DAYS.includes(d);
      grid.push({ day: d, isCrossed });
    }
    return grid;
  }, [currentYear, currentMonth]);

  // Confirm selection
  const handleSelectDay = () => {
    if (selectedDay !== null) {
      const formatted = `${selectedDay} ${MONTH_NAMES[currentMonth]}, ${currentYear}`;
      onSelectDate(formatted);
      onClose();
    }
  };

  const handleSearchYear = () => {
    setCurrentYear(pickerYear);
    onSelectDate(`${pickerYear}`);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* ── Filter Bottom Sheet Container ── */}
        <View style={styles.bottomSheetContainer}>
          {/* ── Top Calender Tab Bar (358x48px, radius: 24px) ── */}
          <View style={styles.tabBarWrapper}>
            <View style={styles.tabBarTrack}>
              {/* Month Tab */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.tabButton,
                  activeTab === 'month' && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab('month')}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === 'month'
                      ? styles.tabButtonTextActive
                      : styles.tabButtonTextInactive,
                  ]}
                >
                  Month
                </Text>
              </TouchableOpacity>

              {/* Year Tab */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.tabButton,
                  activeTab === 'year' && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab('year')}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === 'year'
                      ? styles.tabButtonTextActive
                      : styles.tabButtonTextInactive,
                  ]}
                >
                  Year
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Main Tab Content ── */}
          {activeTab === 'month' ? (
            /* ── VIEW 1: MONTH FILTER ── */
            <View style={styles.monthContentWrapper}>
              <View style={styles.calendarCard}>
                {/* Month Header: Date/Year + Nav Chevrons (358x48px) */}
                <View style={styles.monthHeaderRow}>
                  <Text style={styles.monthHeaderTitle}>
                    {MONTH_NAMES[currentMonth]}, {currentYear}
                  </Text>

                  <View style={styles.navButtonsRow}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.navCircleButton}
                      onPress={handlePrevMonth}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <ChevronLeftBlueIcon size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.navCircleButton}
                      onPress={handleNextMonth}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <ChevronRightBlueIcon size={20} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Weekdays Row (Mon - Sun) */}
                <View style={styles.weekdaysRow}>
                  {WEEKDAYS.map((wd) => (
                    <Text key={wd} style={styles.weekdayLabel}>
                      {wd}
                    </Text>
                  ))}
                </View>

                {/* Calendar Days Grid */}
                <View style={styles.datesGrid}>
                  {calendarDays.map((item, index) => {
                    if (item.day === null) {
                      return <View key={`empty-${index}`} style={styles.dayCellInvisible} />;
                    }

                    const isSelected = selectedDay === item.day;
                    const isCrossed = item.isCrossed;

                    return (
                      <TouchableOpacity
                        key={`day-${item.day}`}
                        activeOpacity={isCrossed ? 1 : 0.75}
                        disabled={isCrossed}
                        onPress={() => setSelectedDay(item.day)}
                        style={[
                          styles.dayCell,
                          isSelected && styles.dayCellSelected,
                          !isCrossed && !isSelected && styles.dayCellAvailable,
                          isCrossed && styles.dayCellCrossed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayCellText,
                            isSelected && styles.dayCellTextSelected,
                            isCrossed && styles.dayCellTextCrossed,
                            !isCrossed && !isSelected && styles.dayCellTextAvailable,
                          ]}
                        >
                          {item.day}
                        </Text>

                        {/* Strikethrough Line for unavailable dates */}
                        {isCrossed && <View style={styles.strikethroughLine} />}
                      </TouchableOpacity>
                    );
                  })}
                  {/* Dummy filler elements to prevent incomplete bottom row from spreading out wide */}
                  {Array.from({ length: 9 }).map((_, i) => (
                    <View key={`dummy-${i}`} style={styles.dayCellDummy} pointerEvents="none" />
                  ))}
                </View>
              </View>

              {/* Action Button: Select */}
              <View
                style={[
                  styles.bottomActionContainer,
                  {
                    paddingBottom:
                      Platform.OS === 'android'
                        ? Math.max(insets.bottom, 56)
                        : Math.max(insets.bottom, 16),
                  },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={selectedDay === null}
                  style={[
                    styles.selectActionButton,
                    selectedDay !== null && styles.selectActionButtonActive,
                  ]}
                  onPress={handleSelectDay}
                >
                  <Text
                    style={[
                      styles.selectActionButtonText,
                      selectedDay !== null && styles.selectActionButtonTextActive,
                    ]}
                  >
                    Select
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* ── VIEW 2: YEAR FILTER ── */
            <View style={styles.yearContentWrapper}>
              <View style={styles.yearCard}>
                {/* Year Header: Year Title + Nav Chevrons (358x48px) */}
                <View style={styles.monthHeaderRow}>
                  <Text style={styles.monthHeaderTitle}>{pickerYear}</Text>

                  <View style={styles.navButtonsRow}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      disabled={pickerYear <= MIN_YEAR}
                      style={[
                        styles.navCircleButton,
                        pickerYear <= MIN_YEAR && { opacity: 0.3 },
                      ]}
                      onPress={handlePrevYear}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <ChevronLeftBlueIcon size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      disabled={pickerYear >= MAX_YEAR}
                      style={[
                        styles.navCircleButton,
                        pickerYear >= MAX_YEAR && { opacity: 0.3 },
                      ]}
                      onPress={handleNextYear}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <ChevronRightBlueIcon size={20} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 1:1 Figma Year Picker Wheel (Scrollable, capped at 2026) */}
                <View style={styles.yearWheelContainer}>
                  {/* Selected Year Pill Background */}
                  <View style={styles.selectedYearPillBackground} pointerEvents="none" />

                  {/* Vertical Guide Lines */}
                  <View style={styles.yearGuideLineLeft} pointerEvents="none" />
                  <View style={styles.yearGuideLineRight} pointerEvents="none" />

                  {/* Scrollable Year Wheel */}
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
                    onMomentumScrollEnd={handleScrollEnd}
                    onScrollEndDrag={handleScrollEnd}
                  >
                    {YEARS.map((y) => {
                      const diff = Math.abs(y - pickerYear);
                      return (
                        <TouchableOpacity
                          key={y}
                          style={styles.yearScrollItem}
                          activeOpacity={0.7}
                          onPress={() => {
                            setPickerYear(y);
                            scrollToYear(y, true);
                          }}
                        >
                          <Text
                            style={[
                              styles.yearItemTextBase,
                              diff === 0 && styles.selectedYearPillText,
                              diff === 1 && styles.yearTextRegular,
                              diff === 2 && styles.yearTextMedium,
                              diff >= 3 && styles.yearTextMini,
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

              {/* Action Button: Search date */}
              <View
                style={[
                  styles.bottomActionContainer,
                  {
                    paddingBottom:
                      Platform.OS === 'android'
                        ? Math.max(insets.bottom, 56)
                        : Math.max(insets.bottom, 16),
                  },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.searchDateActionButton}
                  onPress={handleSearchYear}
                >
                  <Text style={styles.searchDateActionButtonText}>Search date</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ProviderDateFilterModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },

  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  /* ── Filter Bottom Sheet Container (Figma: width 390px, height: 575px, radius: 24px 24px 0 0) ── */
  bottomSheetContainer: {
    width: '100%',
    height: 575,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },

  /* ── Calender Tab Bar (358x48px, radius: 24px) ── */
  tabBarWrapper: {
    width: 358,
    height: 48,
    marginBottom: 24,
  },

  tabBarTrack: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 4,
  },

  tabButton: {
    flex: 1,
    height: 40,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },

  tabButtonText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    textAlign: 'center',
    includeFontPadding: false,
  },

  tabButtonTextActive: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    color: '#FFFFFF',
  },

  tabButtonTextInactive: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    color: 'rgba(96, 96, 102, 0.96)',
  },

  /* ── View 1: Month Layout (height: 577px) ── */
  monthContentWrapper: {
    width: '100%',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },

  calendarCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 24,
  },

  monthHeaderRow: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  monthHeaderTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },

  navButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  navCircleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Weekday Headers Row ── */
  weekdaysRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },

  weekdayLabel: {
    width: 38,
    textAlign: 'center',
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },

  /* ── Calendar Dates Grid ── */
  datesGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },

  dayCellInvisible: {
    width: 38,
    height: 36,
  },

  dayCellDummy: {
    width: 38,
    height: 0,
  },

  dayCell: {
    width: 38,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  dayCellAvailable: {
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },

  dayCellSelected: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },

  dayCellCrossed: {
    backgroundColor: 'transparent',
  },

  dayCellText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    textAlign: 'center',
    includeFontPadding: false,
  },

  dayCellTextAvailable: {
    color: 'rgba(0, 8, 20, 0.96)',
  },

  dayCellTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },

  dayCellTextCrossed: {
    color: 'rgba(192, 192, 204, 0.96)',
  },

  strikethroughLine: {
    position: 'absolute',
    width: 16,
    height: 1,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },

  /* ── View 2: Year Layout (height: 499px) ── */
  yearContentWrapper: {
    width: '100%',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },

  yearCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 20,
  },

  yearWheelContainer: {
    width: '100%',
    height: 276,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  selectedYearPillBackground: {
    position: 'absolute',
    top: 118,
    width: 326,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(229, 229, 229, 0.8)',
    alignSelf: 'center',
    zIndex: 1,
  },

  yearScrollView: {
    width: '100%',
    height: 276,
    zIndex: 2,
  },

  yearScrollContent: {
    paddingTop: 116,
    paddingBottom: 116,
    alignItems: 'center',
  },

  yearScrollItem: {
    width: '100%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  yearItemTextBase: {
    textAlign: 'center',
    includeFontPadding: false,
  },

  yearGuideLineLeft: {
    position: 'absolute',
    left: '26%',
    top: 20,
    bottom: 20,
    width: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    zIndex: 1,
  },

  yearGuideLineRight: {
    position: 'absolute',
    right: '26%',
    top: 20,
    bottom: 20,
    width: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    zIndex: 1,
  },

  selectedYearPillText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
    includeFontPadding: false,
  },

  yearTextRegular: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  yearTextMedium: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 22,
    letterSpacing: 0.2,
    color: 'rgba(96, 96, 102, 0.8)',
  },

  yearTextMini: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 10,
    lineHeight: 20,
    letterSpacing: 0.2,
    color: 'rgba(96, 96, 102, 0.6)',
  },

  /* ── Bottom Action Button Container ── */
  bottomActionContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    alignItems: 'center',
  },

  selectActionButton: {
    width: 358,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectActionButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },

  selectActionButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(192, 192, 204, 0.96)',
    includeFontPadding: false,
  },

  selectActionButtonTextActive: {
    color: '#FFFFFF',
  },

  searchDateActionButton: {
    width: 358,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 4,
  },

  searchDateActionButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});
