import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import {
  ProviderAppointmentFilterModal,
  ProviderFilterState,
  PRICE_STEPS,
  matchAppointment,
} from '../../components/ProviderAppointmentFilterModal';
import { ProviderDateFilterModal } from '../../components/ProviderDateFilterModal';
import { CategoryFourDotLoader } from '../../components/CategoryFourDotLoader';
import { NoRecordedAppointmentsEmptyState } from '../../components/NoRecordedAppointmentsEmptyState';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

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

function Download02Icon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3v10m0 0l-3.5-3.5M12 13l3.5-3.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SearchIcon({ size = 24, color = '#000000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={1.5} />
      <Path d="M20 20l-4-4" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function FilterFunnelIcon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 4H3L10.2 12.5V19L13.8 21V12.5L21 4Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ArrowDown01Icon({ size = 20, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M5 7.5l5 5 5-5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Time04Icon({ size = 18, color = 'rgba(96, 96, 102, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Circle cx="9" cy="9" r="7.5" stroke={color} strokeWidth={1.2} />
      <Path d="M9 4.5v4.5l3 1.5" stroke={color} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function StarIcon({ size = 18, color = 'rgba(248, 155, 24, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path
        d="M9 2.5l2.09 4.24 4.68.68-3.39 3.3 0.8 4.66L9 13.18l-4.18 2.2.8-4.66-3.39-3.3 4.68-.68L9 2.5z"
        fill={color}
      />
    </Svg>
  );
}

function CancelCircleIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Circle cx="8" cy="8" r="7" fill="rgba(204, 41, 41, 0.9)" />
      <Path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Sample Cancelled Appointments Data (Matching Figma & Real Provider DB) ──
const CANCELLED_APPOINTMENTS_DATA = [
  {
    id: 'canc-201',
    title: 'Full Men Grooming Package',
    duration: '1hr 30m',
    rating: '4.2',
    price: '₦35,000',
    image: require('../../../assets/images/appointments/hair_cut.jpg'),
    cancelledDate: '9 May, 2024',
    time: '11:00 AM',
    clientName: 'Ibrahim Danjuma',
    clientStatus: 'New Client',
    gender: 'Male',
    membership: 'Joined 2 wks ago',
    specialist: 'Tunde Adebayo',
    specialistRole: 'Master Barber',
    type: 'In-Person',
    paymentType: 'Inter - Bank Transfer',
  },
  {
    id: 'canc-202',
    title: 'Deluxe Pedicure & Foot Scrub',
    duration: '50m',
    rating: '3.8',
    price: '₦25,000',
    image: require('../../../assets/images/appointments/nail_art.png'),
    cancelledDate: '9 May, 2024',
    time: '01:30 PM',
    clientName: 'Zainab Aliyu',
    clientStatus: 'Non Subscriber',
    gender: 'Female',
    membership: 'Joined 1 mo ago',
    specialist: 'Adaeze Nwosu',
    specialistRole: 'Pedicurist',
    type: 'Home Service',
    paymentType: 'Cash Payment',
  },
  {
    id: 'canc-203',
    title: 'Men Braids & Styling',
    duration: '2hrs',
    rating: '4.6',
    price: '₦32,000',
    image: require('../../../assets/images/appointments/men_braids.jpg'),
    cancelledDate: '9 May, 2024',
    time: '04:00 PM',
    clientName: 'Kelechi Amadi',
    clientStatus: 'Subscriber Client',
    gender: 'Male',
    membership: 'Joined 4 mos ago',
    specialist: 'Aisha Bello',
    specialistRole: 'Braider',
    type: 'In-Person',
    paymentType: 'Card Payment',
  },
];

export default function ProviderCancelledAppointmentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [dateFilterModalVisible, setDateFilterModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('9 May, 2024');
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);

  const parsedInitialDate = useMemo(() => {
    const yrMatch = selectedDate.match(/\b(19\d\d|20\d\d)\b/);
    const yr = yrMatch ? parseInt(yrMatch[0], 10) : 2024;

    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const sLower = selectedDate.toLowerCase();
    const moIdx = months.findIndex((m) => sLower.includes(m));
    const mo = moIdx !== -1 ? moIdx : 4; // default May (4)

    const dayMatch = selectedDate.match(/\b([1-9]|[12]\d|3[01])\b/);
    const dy = dayMatch && !selectedDate.startsWith(dayMatch[0] + '9') ? parseInt(dayMatch[0], 10) : 9;

    return { day: dy, month: mo, year: yr };
  }, [selectedDate]);

  const [appliedFilters, setAppliedFilters] = useState<ProviderFilterState | undefined>();

  const activeFiltersCount = useMemo(() => {
    if (!appliedFilters) return 0;
    let count = 0;
    if (
      appliedFilters.minPrice > PRICE_STEPS[0] ||
      appliedFilters.maxPrice < PRICE_STEPS[17] ||
      (appliedFilters.customAmount && appliedFilters.customAmount.trim().length > 0)
    ) {
      count++;
    }
    if (appliedFilters.selectedServices && appliedFilters.selectedServices.length > 0) {
      count += appliedFilters.selectedServices.length;
    }
    if (appliedFilters.selectedStaff && appliedFilters.selectedStaff.length > 0) {
      count += appliedFilters.selectedStaff.length;
    }
    if (appliedFilters.customerType) count++;
    if (appliedFilters.paymentMethod) count++;
    if (appliedFilters.appointmentType) count++;
    if (appliedFilters.bookedPackage) count++;
    return count;
  }, [appliedFilters]);

  const filteredAppointments = useMemo(() => {
    let result = CANCELLED_APPOINTMENTS_DATA;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.clientName.toLowerCase().includes(q) ||
          item.price.toLowerCase().includes(q) ||
          item.specialist?.toLowerCase().includes(q)
      );
    }

    if (appliedFilters) {
      result = result.filter((item) => matchAppointment(item, appliedFilters));
    }

    // Dynamic filtering by selectedDate (e.g. "9 May, 2024", or "2024")
    if (selectedDate && selectedDate.trim().length > 0) {
      const normSelected = selectedDate.toLowerCase().replace(/,/g, '').trim();
      result = result.filter((item) => {
        const itemDate = (item.cancelledDate || '').toLowerCase().replace(/,/g, '').trim();
        // Exact or substring match (e.g. "9 may 2024" matches "9 may 2024")
        if (itemDate.includes(normSelected) || normSelected.includes(itemDate)) {
          return true;
        }

        // Year only match (e.g. user selected "2024")
        if (/^\d{4}$/.test(normSelected)) {
          return itemDate.includes(normSelected);
        }

        // Match month and year if formatted as "May 2024"
        const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const matchedMonth = months.find((m) => normSelected.includes(m));
        const matchedYear = normSelected.match(/\b(19\d\d|20\d\d)\b/)?.[0];
        if (matchedMonth && matchedYear) {
          return itemDate.includes(matchedMonth) && itemDate.includes(matchedYear);
        }

        return false;
      });
    }

    return result;
  }, [searchQuery, appliedFilters, selectedDate]);

  const appointmentCountText =
    filteredAppointments.length === 0
      ? '0 Appointment'
      : `${filteredAppointments.length} Appointments`;

  const handleBackPress = () => {
    setIsNavigatingBack(true);
    setTimeout(() => {
      router.back();
      setTimeout(() => {
        setIsNavigatingBack(false);
      }, 350);
    }, 850);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Fixed Page Header (64px, padding: 8px 16px, 1:1 Figma) ─────────── */}
      <View style={styles.pageHeader}>
        <View style={styles.headerContent}>
          {/* Back button (48x48px circle) */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <ArrowLeft02Icon size={24} color="rgba(0, 8, 20, 0.96)" />
          </TouchableOpacity>

          {/* Centered Title */}
          <Text style={styles.headerTitleText}>Cancelled Appointments</Text>

          {/* Download button (48x48px, radius 8px) */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.downloadButton}
            onPress={() => {}}
          >
            <Download02Icon size={24} color="#141B34" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Search & Filter Section (Frame 1000006531: height: 134px, padding: 8px 16px, gap: 24px) ── */}
      <View style={styles.searchSection}>
        {/* Search Input Row (width: 358px, height: 48px) */}
        <View style={styles.searchButtonRow}>
          {/* Search Input Bar (288x48px, radius: 24px) */}
          <View style={styles.searchBar}>
            <SearchIcon size={24} color="#000000" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search here.."
              placeholderTextColor="rgba(96, 96, 102, 0.96)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter Button (48x48px, radius: 24px) */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.filterButton,
              activeFiltersCount > 0 && styles.filterButtonActive,
            ]}
            onPress={() => setFilterModalVisible(true)}
          >
            <FilterFunnelIcon size={24} color={activeFiltersCount > 0 ? '#FFFFFF' : '#141B34'} />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Date Picker & Appointment Count (Frame 1000006427: height: 45px, gap: 5px) */}
        <View style={styles.datePickerSection}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.datePickerRow}
            onPress={() => setDateFilterModalVisible(true)}
          >
            <Text style={styles.dateText}>{selectedDate}</Text>
            <ArrowDown01Icon size={20} color="#141B34" />
          </TouchableOpacity>

          <Text style={styles.appointmentCountText}>{appointmentCountText}</Text>
        </View>
      </View>

      {/* ── Content Area: 1:1 Empty State vs Scrollable Cards List ──────── */}
      {filteredAppointments.length === 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.emptyScrollContent,
            {
              paddingBottom:
                (Platform.OS === 'android'
                  ? Math.max(insets.bottom, 56)
                  : Math.max(insets.bottom, 24)) + 40,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <NoRecordedAppointmentsEmptyState />
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom:
                (Platform.OS === 'android'
                  ? Math.max(insets.bottom, 56)
                  : Math.max(insets.bottom, 24)) + 40,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.cardsList}>
            {filteredAppointments.map((item) => (
            <View key={item.id} style={styles.compoundCardWrapper}>
              {/* Bottom Red Status Flap (Frame 1000006401: 358x66px at top: 91px) */}
              <View style={styles.bottomStatusFlap}>
                <View style={styles.statusRow}>
                  <CancelCircleIcon size={16} />
                  <Text style={styles.statusText}>Cancelled Appointment</Text>
                </View>
              </View>

              {/* Top White Booked Customer Card (358x112px, radius: 24px) */}
              <TouchableOpacity
                style={styles.topCard}
                activeOpacity={0.85}
                onPress={() => {
                  router.push({
                    pathname: '/appointment/[id]',
                    params: {
                      id: item.id,
                      title: item.title,
                      serviceTitle: item.title,
                      clientName: item.clientName,
                      clientStatus: item.clientStatus,
                      gender: item.gender,
                      membership: item.membership,
                      specialist: item.specialist,
                      specialistRole: item.specialistRole,
                      date: item.cancelledDate,
                      time: item.time,
                      type: item.type,
                      price: item.price,
                      duration: item.duration,
                      rating: item.rating,
                      status: 'cancelled',
                      paymentType: item.paymentType || 'Inter - Bank Transfer',
                    },
                  } as any);
                }}
              >
                <View style={styles.cardContent}>
                  {/* 80x80px Image Placeholder with 4px padding & Shadow */}
                  <View style={styles.thumbnailContainer}>
                    <Image source={item.image} style={styles.thumbnailImage} resizeMode="cover" />
                  </View>

                  {/* Information Column (132x80px, gap: 8px) */}
                  <View style={styles.cardInfo}>
                    {/* Title: 16px Medium, lineHeight 24px, letterSpacing 0.5px */}
                    <Text style={styles.serviceTitle} numberOfLines={1}>
                      {item.title}
                    </Text>

                    {/* Meta Row: Duration + Dot + Rating */}
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Time04Icon size={18} color="rgba(96, 96, 102, 0.96)" />
                        <Text style={styles.metaText}>{item.duration}</Text>
                      </View>

                      {/* Ellipse 197 (5x5 dot divider) */}
                      <View style={styles.dotDivider} />

                      <View style={styles.metaItem}>
                        <StarIcon size={18} color="rgba(248, 155, 24, 0.96)" />
                        <Text style={styles.metaText}>{item.rating}</Text>
                      </View>
                    </View>

                    {/* Price Tag: 14px Regular, lineHeight 20px, letterSpacing 0.4px */}
                    <Text style={styles.priceText}>{item.price}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
      )}

      {/* Android System Dock Barrier */}
      <NativeDockSpacer backgroundColor="#FFFFFF" />

      {/* Filter Modal */}
      <ProviderAppointmentFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        items={CANCELLED_APPOINTMENTS_DATA}
        currentFilters={appliedFilters}
        onApply={(f) => {
          setAppliedFilters(f);
          setFilterModalVisible(false);
        }}
        onClear={() => {
          setAppliedFilters(undefined);
          setFilterModalVisible(false);
        }}
      />

      {/* Date Filter Bottom Sheet Modal (1:1 Figma Month/Year Filter) */}
      <ProviderDateFilterModal
        visible={dateFilterModalVisible}
        onClose={() => setDateFilterModalVisible(false)}
        onSelectDate={(newDate) => setSelectedDate(newDate)}
        initialDate={parsedInitialDate}
      />

      {/* Back Button Transition Four-Dot Loader Overlay */}
      <CategoryFourDotLoader visible={isNavigatingBack} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Page Header (64px, padding: 8px 16px) ─────────────────────────────────
  pageHeader: {
    width: '100%',
    height: 64,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    justifyContent: 'center',
  },
  headerContent: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  downloadButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Search & Filter Section (Frame 1000006531: height: 134px, gap: 24px) ───
  searchSection: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  searchButtonRow: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchBar: {
    width: 288,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: '#000000',
    padding: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#000814',
    borderColor: '#000814',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#CC2929',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Date picker & Appointments count (Frame 1000006427: height: 45px, gap: 5px)
  datePickerSection: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 5,
    height: 45,
  },
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 24,
  },
  dateText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  appointmentCountText: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Scrollable Body & Cards List ──────────────────────────────────────────
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  emptyScrollContent: {
    flexGrow: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  cardsList: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    flexDirection: 'column',
    gap: 40, // 40px universal gap between cards
  },

  // ── Compound Card (Total Height: 157px, top: 0 to 91+66=157) ──────────────
  compoundCardWrapper: {
    width: '100%',
    maxWidth: 358,
    height: 157,
    alignSelf: 'center',
    position: 'relative',
  },

  // Bottom Red Status Flap (Frame 1000006401: 358x66px at top: 91px)
  bottomStatusFlap: {
    position: 'absolute',
    top: 91,
    left: 0,
    right: 0,
    height: 66,
    backgroundColor: 'rgba(248, 239, 239, 0.96)',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    justifyContent: 'flex-end',
    paddingBottom: 13,
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 20,
  },
  statusText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(204, 41, 41, 0.9)',
  },

  // Top White Card (358x112px, radius: 24px, padding: 16px)
  topCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 112,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    zIndex: 1,
  },
  cardContent: {
    width: '100%',
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  // Image Placeholder (80x80px with 4px padding)
  thumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    padding: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(133, 139, 148, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },

  // Booked Information (132x80px, gap: 8px)
  cardInfo: {
    flex: 1,
    height: 80,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 8,
  },
  serviceTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  dotDivider: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },
  priceText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
});
