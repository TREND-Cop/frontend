import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSafeBottomPadding } from '../../utils/safeArea';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
} from 'lucide-react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { bookingStore } from '../../utils/bookingStore';
import { BookingProgressStepper } from '../../components/BookingProgressStepper';
import { MonthFilterModal } from '../../components/MonthFilterModal';
import { theme } from '../../constants/theme';

// ── Types ──
export interface DayCardItem {
  id: string;
  dayName: string;
  dayNum: number;
  month: string;
  year: number;
  isBooked?: boolean;
}

export interface TimeSlotOption {
  id: string;
  time: string;
  isBooked?: boolean;
}

// ── Month & Weekday Constants ──
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];

// Pre-generated 90-day sequence starting from today's dynamic date
export const generateDynamic90Days = (startDate: Date = new Date()): DayCardItem[] => {
  return Array.from({ length: 90 }, (_, index) => {
    const date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + index);
    const dayNum = date.getDate();
    const month = MONTH_NAMES[date.getMonth()];
    const year = date.getFullYear();
    const dayName = WEEKDAY_NAMES[date.getDay()];

    // Realistic booked pattern matching Figma screenshot (index 1 is booked like the 2nd card in screenshot, plus select days)
    // Index 0 (today) is never booked!
    const isBooked = [1, 6, 11, 15, 23, 27, 35, 42, 55, 68, 80].includes(index);

    return {
      id: `day_${year}_${date.getMonth()}_${dayNum}`,
      dayName,
      dayNum,
      month,
      year,
      isBooked,
    };
  });
};

// Figma Time Slots (3 columns x 3 rows = 8 slots)
const TIME_SLOTS_DATA: TimeSlotOption[] = [
  { id: 't1', time: '8:00am', isBooked: true },
  { id: 't2', time: '9:00am' },
  { id: 't3', time: '10:00am' },
  { id: 't4', time: '11:00am' },
  { id: 't5', time: '8:00am' },
  { id: 't6', time: '12:00am' },
  { id: 't7', time: '1:00pm' },
  { id: 't8', time: '2:00pm' },
];

// Disabled calendar days in June 2026 matching Figma Line 128
const DISABLED_CALENDAR_DAYS = [2, 6, 10, 11, 12, 14, 23, 24, 26];

// ── 4-Dot Animated Loader Component (Figma: 4 dots, 16px diameter, gap 16px, color #000814) ──
const FigmaFourDotLoader = () => {
  const dotAnim1 = useRef(new Animated.Value(0.3)).current;
  const dotAnim2 = useRef(new Animated.Value(0.3)).current;
  const dotAnim3 = useRef(new Animated.Value(0.3)).current;
  const dotAnim4 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const createPulse = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.delay(200),
        ])
      );
    };

    const anim1 = createPulse(dotAnim1, 0);
    const anim2 = createPulse(dotAnim2, 120);
    const anim3 = createPulse(dotAnim3, 240);
    const anim4 = createPulse(dotAnim4, 360);

    anim1.start();
    anim2.start();
    anim3.start();
    anim4.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
      anim4.stop();
    };
  }, [dotAnim1, dotAnim2, dotAnim3, dotAnim4]);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.loadingOverlay}>
        <View style={styles.loaderRow}>
          <View style={[styles.loaderDot, { opacity: 0.8 }]} />
          <View style={[styles.loaderDot, { opacity: 1 }]} />
          <View style={[styles.loaderDot, { opacity: 0.8 }]} />
          <View style={[styles.loaderDot, { opacity: 0.5 }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.loadingOverlay}>
      <View style={styles.loaderRow}>
        <Animated.View
          style={[
            styles.loaderDot,
            {
              opacity: dotAnim1,
              transform: [
                {
                  scale: dotAnim1.interpolate({
                    inputRange: [0.3, 1],
                    outputRange: [0.75, 1.0],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.loaderDot,
            {
              opacity: dotAnim2,
              transform: [
                {
                  scale: dotAnim2.interpolate({
                    inputRange: [0.3, 1],
                    outputRange: [0.75, 1.0],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.loaderDot,
            {
              opacity: dotAnim3,
              transform: [
                {
                  scale: dotAnim3.interpolate({
                    inputRange: [0.3, 1],
                    outputRange: [0.75, 1.0],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.loaderDot,
            {
              opacity: dotAnim4,
              transform: [
                {
                  scale: dotAnim4.interpolate({
                    inputRange: [0.3, 1],
                    outputRange: [0.75, 1.0],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
};

export const AppointmentTimeScreen = ({ navigation }: { navigation?: any }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const today = useMemo(() => new Date(), []);
  const dynamic90Days = useMemo(() => generateDynamic90Days(today), [today]);
  const [carouselDays, setCarouselDays] = useState<DayCardItem[]>(() => generateDynamic90Days(today));

  // Selected Day & Time - strictly start unselected (null)
  const [selectedDay, setSelectedDay] = useState<DayCardItem | null>(null);
  const [selectedTimeId, setSelectedTimeId] = useState<string | null>(null);

  // Pagination Dot Tracking (5 dots representing the 90 days span)
  const [activeDotIndex, setActiveDotIndex] = useState<number>(0);

  // Loading indicator state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const loadingTimerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  // Calendar Modal State
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [calendarMonthIndex, setCalendarMonthIndex] = useState<number>(today.getMonth());
  const [calendarYear, setCalendarYear] = useState<number>(today.getFullYear());
  const [calendarTab, setCalendarTab] = useState<'Month' | 'Year'>('Month');

  // Reset selection on focus if coming fresh
  useFocusEffect(
    React.useCallback(() => {
      if (!bookingStore.getAppointmentDate()) {
        setSelectedDay(null);
      }
      if (!bookingStore.getAppointmentTime()) {
        setSelectedTimeId(null);
      }
    }, [])
  );

  // Sync to bookingStore
  useEffect(() => {
    if (selectedDay) {
      bookingStore.setAppointmentDate(`${selectedDay.month} ${selectedDay.dayNum}, ${selectedDay.year}`);
    } else {
      bookingStore.setAppointmentDate('');
    }
  }, [selectedDay]);

  // Handle back navigation safely - resets selection so returning is clean
  const handleGoBack = () => {
    setSelectedDay(null);
    setSelectedTimeId(null);
    bookingStore.setAppointmentDate('');
    bookingStore.setAppointmentTime('');
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/home' as any);
    }
  };

  // Select day card
  const handleSelectDay = (day: DayCardItem) => {
    if (day.isBooked) return;
    if (selectedDay?.id === day.id) {
      setSelectedDay(null);
      bookingStore.setAppointmentDate('');
    } else {
      setSelectedDay(day);
      bookingStore.setAppointmentDate(`${day.month} ${day.dayNum}, ${day.year}`);
    }
  };

  // Select time slot
  const handleSelectTime = (slot: TimeSlotOption) => {
    if (slot.isBooked) return;
    if (selectedTimeId === slot.id) {
      setSelectedTimeId(null);
      bookingStore.setAppointmentTime('');
    } else {
      setSelectedTimeId(slot.id);
      bookingStore.setAppointmentTime(slot.time);
    }
  };

  // Next Button - shows 4-dot animated loader while navigating to next page
  const handleNext = () => {
    if (!selectedDay || !selectedTimeId) return;
    const chosenTime = TIME_SLOTS_DATA.find((t) => t.id === selectedTimeId)?.time || '';
    bookingStore.setAppointmentDate(`${selectedDay.month} ${selectedDay.dayNum}, ${selectedDay.year}`);
    bookingStore.setAppointmentTime(chosenTime);

    // Show loading indicator overlay when moving to next page
    setIsLoading(true);
    loadingTimerRef.current = setTimeout(() => {
      setIsLoading(false);
      router.push('/appointment-specialist');
    }, 650);
  };

  // Calendar modal month switch
  const handleMonthPrev = () => {
    if (calendarMonthIndex > 0) {
      setCalendarMonthIndex(calendarMonthIndex - 1);
    } else {
      setCalendarMonthIndex(11);
      setCalendarYear((y) => y - 1);
    }
  };

  const handleMonthNext = () => {
    if (calendarMonthIndex < 11) {
      setCalendarMonthIndex(calendarMonthIndex + 1);
    } else {
      setCalendarMonthIndex(0);
      setCalendarYear((y) => y + 1);
    }
  };

  // Calendar Day Picker
  const calendarDaysCount = new Date(calendarYear, calendarMonthIndex + 1, 0).getDate();
  const calendarDaysList = Array.from({ length: calendarDaysCount }, (_, i) => i + 1);

  const isCalendarDayDisabled = (dayNum: number, mIndex: number = calendarMonthIndex, yr: number = calendarYear) => {
    const curNow = new Date();
    const curYr = curNow.getFullYear();
    const curMo = curNow.getMonth();
    const curDy = curNow.getDate();

    if (yr < curYr) return true;
    if (yr === curYr && mIndex < curMo) return true;
    if (yr === curYr && mIndex === curMo && dayNum < curDy) return true;
    return false;
  };

  const handleCalendarDaySelect = (dayNum: number, mIndex: number = calendarMonthIndex, yr: number = calendarYear) => {
    if (isCalendarDayDisabled(dayNum, mIndex, yr)) return;

    const monthName = MONTH_NAMES[mIndex];
    const dateObj = new Date(yr, mIndex, dayNum);
    const dayName = WEEKDAY_NAMES[dateObj.getDay()];

    const foundDay = dynamic90Days.find(
      (d) => d.dayNum === dayNum && d.month === monthName && d.year === yr
    );

    const matchedDay: DayCardItem = foundDay
      ? { ...foundDay, isBooked: false }
      : {
          id: `day_${yr}_${mIndex}_${dayNum}`,
          dayName,
          dayNum,
          month: monthName,
          year: yr,
          isBooked: false,
        };

    setSelectedDay(matchedDay);
    setCalendarMonthIndex(mIndex);
    setCalendarYear(yr);
    bookingStore.setAppointmentDate(`${monthName} ${dayNum}, ${yr}`);
    setIsCalendarOpen(false);

    // Make sure matchedDay is in carouselDays and unbooked
    let nextIndex = -1;
    setCarouselDays((prev) => {
      const idx = prev.findIndex((d) => d.dayNum === dayNum && d.month === monthName && d.year === yr);
      if (idx >= 0) {
        nextIndex = idx;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], isBooked: false };
        return updated;
      }
      const updated = [...prev, matchedDay].sort((a, b) => {
        const dateA = new Date(a.year, MONTH_NAMES.indexOf(a.month), a.dayNum).getTime();
        const dateB = new Date(b.year, MONTH_NAMES.indexOf(b.month), b.dayNum).getTime();
        return dateA - dateB;
      });
      nextIndex = updated.findIndex((d) => d.dayNum === dayNum && d.month === monthName && d.year === yr);
      return updated;
    });

    // Scroll horizontal carousel to this day so it is directly in view
    setTimeout(() => {
      const idx = carouselDays.findIndex(
        (d) => d.dayNum === dayNum && d.month === monthName && d.year === yr
      );
      const scrollIdx = idx >= 0 ? idx : nextIndex;
      if (scrollIdx >= 0 && scrollRef.current) {
        const itemWidth = 108; // 96px minWidth + 12px gap
        scrollRef.current?.scrollTo({ x: Math.max(0, scrollIdx * itemWidth), animated: true });
      }
    }, 150);
  };

  const isNextActive = !!selectedDay && !!selectedTimeId;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ─── Top Header (Figma: height 56px, padding 8px, gap 72px, borderBottom #ebebf5) ─── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft size={24} color="#000814" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Appointment Time</Text>

        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 110 + insets.bottom },
        ]}
      >
        {/* ─── 3-Step Progress Stepper: Day / Time -> Specialist -> Review ─── */}
        <BookingProgressStepper currentStep={1} style={{ paddingHorizontal: 16 }} />

        {/* ─── Section 1: Appointment Day (Figma: width 358px, gap 16px) ─── */}
        <View style={styles.bookingDaySection}>
          {/* Header Row: "Appointment Day" + Month dropdown button */}
          <View style={styles.bookingDayHeaderRow}>
            <Text style={styles.sectionHeading}>Appointment Day</Text>

            <TouchableOpacity
              style={styles.calendarActionButton}
              activeOpacity={0.8}
              onPress={() => {
                if (selectedDay) {
                  const mIdx = MONTH_NAMES.indexOf(selectedDay.month);
                  if (mIdx >= 0) setCalendarMonthIndex(mIdx);
                  setCalendarYear(selectedDay.year);
                } else {
                  setCalendarMonthIndex(today.getMonth());
                  setCalendarYear(today.getFullYear());
                }
                setIsCalendarOpen(true);
              }}
            >
              <Text style={styles.calendarActionButtonText}>
                {selectedDay?.month || MONTH_NAMES[calendarMonthIndex] || MONTH_NAMES[today.getMonth()]}
              </Text>
              <ChevronDown size={18} color="#1A82FF" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Horizontal Scrollable Days Cards (64px x 96px, radius 16px, gap 16px) */}
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysScrollContent}
          >
            {carouselDays.map((day) => {
              const isSelected =
                !day.isBooked &&
                selectedDay?.dayNum === day.dayNum &&
                selectedDay?.month === day.month &&
                selectedDay?.year === day.year;

              if (day.isBooked) {
                return (
                  <View key={day.id} style={[styles.dayCard, styles.dayCardBooked]}>
                    <Text style={styles.dayBookedText} numberOfLines={1}>Booked</Text>
                  </View>
                );
              }

              return (
                <TouchableOpacity
                  key={day.id}
                  style={[
                    styles.dayCard,
                    isSelected && styles.dayCardSelected,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => handleSelectDay(day)}
                >
                  <Text style={[styles.dayNameText, isSelected && styles.textWhite]} numberOfLines={1}>
                    {day.dayName}
                  </Text>
                  <Text style={[styles.dayNumText, isSelected && styles.textWhite]} numberOfLines={1}>
                    {day.dayNum}
                  </Text>
                  <Text style={[styles.dayMonthText, isSelected && styles.textWhite]} numberOfLines={1}>
                    {day.month}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Booking limit subtitle */}
          <View style={styles.bookingLimitSection}>
            <Text style={styles.subNoticeText}>
              Booking limit can reach a maximum of 1-90 days
            </Text>
          </View>
        </View>

        {/* ─── Section 2: Appointment Time (Figma: width 358px, gap 24px) ─── */}
        <View style={styles.bookingTimeSection}>
          {/* Header Row: "Appointment Time" */}
          <View style={styles.bookingTimeHeaderRow}>
            <Text style={styles.sectionHeading}>Appointment Time</Text>
          </View>

          {/* Time Slot Grid (3 columns, button width ~108.67px, height 48px, radius 24px) */}
          <View style={styles.timeGrid}>
            {TIME_SLOTS_DATA.map((slot) => {
              const isSelected = !slot.isBooked && selectedTimeId === slot.id;

              if (slot.isBooked) {
                return (
                  <View key={slot.id} style={[styles.timeSlotCard, styles.timeSlotCardBooked]}>
                    <Text style={styles.timeSlotBookedText}>Booked</Text>
                  </View>
                );
              }

              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.timeSlotCard,
                    isSelected && styles.timeSlotCardSelected,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => handleSelectTime(slot)}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      isSelected && styles.textWhite,
                    ]}
                  >
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* ─── Pinned Bottom Action Button (Figma: height 64px, 358x48 radius 24px) ─── */}
      <View style={[styles.bottomBar, { paddingBottom: getSafeBottomPadding(insets, 16, 8) }]}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            !isNextActive && styles.actionButtonDisabled,
          ]}
          disabled={!isNextActive}
          activeOpacity={0.85}
          onPress={handleNext}
        >
          <Text
            style={[
              styles.actionButtonText,
              !isNextActive && styles.actionButtonTextDisabled,
            ]}
          >
            Next
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── Interactive Calendar Bottom Sheet (Figma: 390x483, radius 24px top) ─── */}
      {/* ─── 1:1 Figma Month & Year Filter Modal (390x587, radius 24px top) ─── */}
      <MonthFilterModal
        visible={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        initialMonthIndex={calendarMonthIndex}
        initialYear={calendarYear}
        selectedDate={
          selectedDay
            ? {
                year: selectedDay.year,
                monthIndex: MONTH_NAMES.indexOf(selectedDay.month),
                dayNum: selectedDay.dayNum,
              }
            : null
        }
        isDayDisabled={isCalendarDayDisabled}
        onSelect={({ year, monthIndex, dayNum }) => {
          handleCalendarDaySelect(dayNum, monthIndex, year);
        }}
      />

      {/* ─── 4-Dot Animated Loader State Overlay ─────────────────────────── */}
      {isLoading && <FigmaFourDotLoader />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Top Header (Figma: height 56px, borderBottom 1px solid #ebebf5) ──
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBF5',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    ...theme.typography.pageHeader,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
    height: 40,
  },

  scrollContent: {
    paddingTop: 24,
    gap: 24,
  },

  // ── 3-Step Progress Stepper (Figma: width 358px, height 48px, gap 8px) ──
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 8,
  },
  stepItem: {
    flex: 1,
    gap: 6,
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircleActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleInactive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C0C0CC',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  stepLineActive: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 4,
  },
  stepLineInactive: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 4,
  },
  stepLabelActive: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  stepLabelInactive: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(192, 192, 204, 0.96)',
  },

  // ── Section 1: Appointment Day ──
  bookingDaySection: {
    gap: 16,
  },
  bookingDayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  sectionHeading: {
    ...theme.typography.h3,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  calendarActionButton: {
    height: 40,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1A82FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  calendarActionButtonText: {
    ...theme.typography.button,
    color: '#1A82FF',
  },
  clockActionButton: {
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  clockActionButtonText: {
    ...theme.typography.button,
    color: '#1A82FF',
  },

  // Day Cards Scroll
  daysScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
    paddingVertical: 8,
  },
  dayCard: {
    minWidth: 96,
    height: 108,
    borderRadius: 16,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: '#EBEBF5',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dayCardSelected: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  dayCardBooked: {
    minWidth: 96,
    height: 108,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderColor: '#EBEBF5',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dayNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  dayNumText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  dayMonthText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  dayBookedText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  textWhite: {
    color: '#FFFFFF',
  },

  // Booking Limit Note
  bookingLimitSection: {
    paddingHorizontal: 16,
  },
  subNoticeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  bookingTimeSection: {
    paddingHorizontal: 16,
    gap: 20,
    marginTop: 16, // scrollContent gap (24) + 16 = 40px clean spacing max
  },
  bookingTimeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    rowGap: 16,
    justifyContent: 'flex-start',
    width: '100%',
  },
  timeSlotCard: {
    width: '31%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: '#EBEBF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeSlotCardSelected: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  timeSlotCardBooked: {
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderColor: '#EBEBF5',
  },
  timeSlotText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  timeSlotBookedText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Bottom Action Button (Figma: 358x48, radius 24px) ──
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EBEBF5',
  },
  actionButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
  },
  actionButtonText: {
    ...theme.typography.button,
    color: '#FFFFFF',
  },
  actionButtonTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },

  // ── Calendar Bottom Sheet Modal (Figma: 390x483, padding 16px, gap 24px) ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalBackdropTouch: {
    flex: 1,
  },
  calendarModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 24,
    shadowColor: '#858B94',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
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

  // Segmented Tab (358x48, radius 24px, pill 105x40)
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

  // ── 4-Dot Loader State (Figma: 112px x 16px, 4 dots 16x16 gap 16px) ──
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(65, 63, 63, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loaderRow: {
    width: 112,
    height: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loaderDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
});

export default AppointmentTimeScreen;
