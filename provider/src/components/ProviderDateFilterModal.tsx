import React, { useState, useMemo } from 'react';
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

  // Year Selection State
  const [pickerYear, setPickerYear] = useState<number>(initialDate?.year ?? 2026);

  // Month navigation
  const handlePrevMonth = () => {
    if (activeTab === 'month') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((prev) => prev - 1);
      } else {
        setCurrentMonth((prev) => prev - 1);
      }
    } else {
      setPickerYear((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (activeTab === 'month') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((prev) => prev + 1);
      } else {
        setCurrentMonth((prev) => prev + 1);
      }
    } else {
      setPickerYear((prev) => prev + 1);
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
      const formatted = `${selectedDay} ${MONTH_NAMES[currentMonth].substring(0, 3)}, ${currentYear}`;
      onSelectDate(formatted);
      onClose();
    }
  };

  const handleSearchYear = () => {
    setCurrentYear(pickerYear);
    const formatted = `${MONTH_NAMES[currentMonth].substring(0, 3)}, ${pickerYear}`;
    onSelectDate(formatted);
    onClose();
  };

  const availableYears = [
    pickerYear + 2,
    pickerYear + 1,
    pickerYear,
    pickerYear - 1,
    pickerYear - 2,
    pickerYear - 3,
  ];

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
                </View>
              </View>

              {/* Action Button: Select */}
              <View style={[styles.bottomActionContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
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

                {/* 1:1 Figma Year Picker Wheel */}
                <View style={styles.yearWheelContainer}>
                  {/* Vertical Guide Lines */}
                  <View style={styles.yearGuideLineLeft} />
                  <View style={styles.yearGuideLineRight} />

                  {/* Top Years */}
                  <TouchableOpacity
                    onPress={() => setPickerYear(pickerYear + 2)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.yearTextTopMini}>{pickerYear + 2}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setPickerYear(pickerYear + 1)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.yearTextTopRegular}>{pickerYear + 1}</Text>
                  </TouchableOpacity>

                  {/* Centered Selected Year Pill (326x40px, radius: 24px) */}
                  <View style={styles.selectedYearPill}>
                    <Text style={styles.selectedYearPillText}>{pickerYear}</Text>
                  </View>

                  {/* Bottom Years */}
                  <TouchableOpacity
                    onPress={() => setPickerYear(pickerYear - 1)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.yearTextBottomRegular}>{pickerYear - 1}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setPickerYear(pickerYear - 2)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.yearTextBottomMedium}>{pickerYear - 2}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setPickerYear(pickerYear - 3)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.yearTextBottomMini}>{pickerYear - 3}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Action Button: Search date */}
              <View style={[styles.bottomActionContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
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

  /* ── Filter Bottom Sheet Container (Figma: width 390px, radius: 24px 24px 0 0) ── */
  bottomSheetContainer: {
    width: '100%',
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
    gap: 10,
  },

  yearGuideLineLeft: {
    position: 'absolute',
    left: '26%',
    top: 20,
    bottom: 20,
    width: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },

  yearGuideLineRight: {
    position: 'absolute',
    right: '26%',
    top: 20,
    bottom: 20,
    width: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },

  yearTextTopMini: {
    fontFamily: FONT_REGULAR,
    fontSize: 10,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.6)',
    textAlign: 'center',
    includeFontPadding: false,
  },

  yearTextTopRegular: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },

  selectedYearPill: {
    width: 326,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(229, 229, 229, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
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

  yearTextBottomRegular: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },

  yearTextBottomMedium: {
    fontFamily: FONT_REGULAR,
    fontSize: 13,
    lineHeight: 22,
    color: 'rgba(96, 96, 102, 0.8)',
    textAlign: 'center',
    includeFontPadding: false,
  },

  yearTextBottomMini: {
    fontFamily: FONT_REGULAR,
    fontSize: 10,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.6)',
    textAlign: 'center',
    includeFontPadding: false,
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
