import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Platform,
  RefreshControl,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { DommyLoader } from '../../components/DommyLoader';
import {
  ProviderAppointmentFilterModal,
  ProviderFilterState,
  PRICE_STEPS,
  matchAppointment,
} from '../../components/ProviderAppointmentFilterModal';
import { ProviderDateFilterModal } from '../../components/ProviderDateFilterModal';
import { NoRecordedAppointmentsEmptyState } from '../../components/NoRecordedAppointmentsEmptyState';

// ── Master Typography Standards ───────────────────────────────────────────────
const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

// ── 1:1 Vector Icons (Matching Figma Converter Output) ─────────────────────────

function ArrowLeft02Icon({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.57 5.93L3.5 12m0 0l6.07 6.07M3.5 12h17"
        stroke={color}
        strokeWidth={1.5}
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

function Calendar03Icon({ size = 16, color = 'rgba(96, 96, 102, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M5.33 1.33v2.67M10.67 1.33v2.67"
        stroke={color}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect
        x="2"
        y="2.67"
        width="12"
        height="12"
        rx="2"
        stroke={color}
        strokeWidth={1}
      />
      <Path
        d="M2 6.67h12"
        stroke={color}
        strokeWidth={1}
      />
      <Path
        d="M4.83 9.17h.01M8 9.17h.01M11.17 9.17h.01M4.83 11.5h.01M8 11.5h.01M11.17 11.5h.01"
        stroke={color}
        strokeWidth={1.2}
        strokeLinecap="round"
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

// ── Sample Upfront/Upcoming Appointments Data (1:1 Figma & Converter) ───────────

export interface UpcomingAppointmentItem {
  id: string;
  title: string;
  serviceTitle: string;
  duration: string;
  rating: string;
  price: string;
  beginsDate: string;
  appointmentDate: string;
  image: any;
  clientName: string;
  clientStatus: string;
  gender: string;
  membership: string;
  specialist: string;
  specialistRole: string;
  type: string;
  paymentType: string;
  packagePrice: string;
  total: string;
}

const UPCOMING_APPOINTMENTS_DATA: UpcomingAppointmentItem[] = [
  {
    id: 'up-101',
    title: 'Crystal Nail Art',
    serviceTitle: 'Crystal Nail Art',
    duration: '1hr',
    rating: '3.5',
    price: '₦22,700',
    beginsDate: 'Oct 1',
    appointmentDate: '9 May, 2024',
    image: require('../../../assets/images/appointments/nail_art.png'),
    clientName: 'Samuel Akunne',
    clientStatus: 'Subscriber Client',
    gender: 'Male',
    membership: '5 Days ago',
    specialist: 'Bisola Olarewaju',
    specialistRole: 'Nail Artist',
    type: 'Home Service',
    paymentType: 'Inter - Bank Transfer',
    packagePrice: '₦4,500',
    total: '₦50,000',
  },
  {
    id: 'up-102',
    title: 'Crystal Nail Art',
    serviceTitle: 'Crystal Nail Art',
    duration: '1hr',
    rating: '3.5',
    price: '₦22,700',
    beginsDate: 'Oct 1',
    appointmentDate: '9 May, 2024',
    image: require('../../../assets/images/appointments/nail_art.png'),
    clientName: 'Samuel Akunne',
    clientStatus: 'Verified Client',
    gender: 'Male',
    membership: '5 Days ago',
    specialist: 'Amina Moham..',
    specialistRole: 'Nail Artist',
    type: 'In-Person',
    paymentType: 'Cash Payment',
    packagePrice: '₦4,500',
    total: '₦50,000',
  },
  {
    id: 'up-103',
    title: 'Hair wash',
    serviceTitle: 'Hair wash',
    duration: '1hr',
    rating: '3.5',
    price: '₦22,700',
    beginsDate: 'Oct 1',
    appointmentDate: '9 May, 2024',
    image: require('../../../assets/images/appointments/hair_cut.jpg'),
    clientName: 'Samuel Akunne',
    clientStatus: 'Returning Client',
    gender: 'Male',
    membership: '5 Days ago',
    specialist: 'Tunde Adebayo',
    specialistRole: 'Hair Specialist',
    type: 'Home Service',
    paymentType: 'Card Payment',
    packagePrice: '₦4,500',
    total: '₦50,000',
  },
  {
    id: 'up-104',
    title: 'Men Brade',
    serviceTitle: 'Men Brade',
    duration: '1hr',
    rating: '3.6',
    price: '₦14,200',
    beginsDate: 'Oct 1',
    appointmentDate: '9 May, 2024',
    image: require('../../../assets/images/appointments/men_braids.jpg'),
    clientName: 'Samuel Akunne',
    clientStatus: 'Returning Client',
    gender: 'Male',
    membership: '5 Days ago',
    specialist: 'Bisola Olarewaju',
    specialistRole: 'Nail Artist',
    type: 'Home Service',
    paymentType: 'Inter - Bank Transfer',
    packagePrice: '₦10,500',
    total: '₦60,000',
  },
];

export default function ProviderUpcomingAppointmentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ title?: string }>();
  const screenTitle = params.title || 'Upfront Appointments';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [dateFilterModalVisible, setDateFilterModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('8 June, 2026');
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const parsedInitialDate = useMemo(() => {
    const yrMatch = selectedDate.match(/\b(19\d\d|20\d\d)\b/);
    const yr = yrMatch ? parseInt(yrMatch[0], 10) : 2024;

    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const sLower = selectedDate.toLowerCase();
    const moIdx = months.findIndex((m) => sLower.includes(m));
    const mo = moIdx !== -1 ? moIdx : 4; // May is index 4

    const dayMatch = selectedDate.match(/\b([1-9]|[12]\d|3[01])\b/);
    const dy = dayMatch ? parseInt(dayMatch[0], 10) : 9;

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
    let result = UPCOMING_APPOINTMENTS_DATA;

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

    return result;
  }, [searchQuery, appliedFilters]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Upfront Appointments — ${selectedDate} (${filteredAppointments.length} Appointments)`,
      });
    } catch {
      // Ignored
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screenContainer}>
      <StatusBar style="dark" />

      {/* ── Page Header (width: 390px, height: 64px, 1:1 Figma) ─────────── */}
      <View style={styles.pageHeader}>
        <View style={styles.headerContent}>
          {/* Back Button (48x48px circle, radius: 24px) */}
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => {
              if (isNavigatingBack) return;
              setIsNavigatingBack(true);
              router.back();
            }}
          >
            <ArrowLeft02Icon size={24} color="rgba(0, 8, 20, 0.96)" />
          </TouchableOpacity>

          {/* Screen Title: 17px DM Sans Medium, letterSpacing 0.2px */}
          <Text style={styles.headerTitleText} numberOfLines={1}>
            {screenTitle}
          </Text>

          {/* Header Share Button (48x48px, radius: 8px) */}
          <TouchableOpacity
            style={styles.shareIconButton}
            activeOpacity={0.7}
            onPress={handleShare}
          >
            <Download02Icon size={24} color="#141B34" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Search & Date Header Section (Frame 1000006531, height: 134px) ── */}
      <View style={styles.searchSection}>
        {/* Search Row: Search input (288x48px) + Filter button (48x48px) */}
        <View style={styles.searchButtonRow}>
          <View style={styles.searchBar}>
            <View style={styles.searchBarInner}>
              <SearchIcon size={24} color="#000000" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search here.."
                placeholderTextColor="rgba(96, 96, 102, 0.96)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Filter button (48x48px, layer bg, border radius: 24px) */}
          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.8}
            onPress={() => setFilterModalVisible(true)}
          >
            <FilterFunnelIcon size={24} color="#141B34" />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Date Row (Frame 1000006427: date picker + appointment count) */}
        <View style={styles.datePickerSection}>
          <TouchableOpacity
            style={styles.datePickerRow}
            activeOpacity={0.7}
            onPress={() => setDateFilterModalVisible(true)}
          >
            <Text style={styles.dateText}>{selectedDate}</Text>
            <ArrowDown01Icon size={20} color="#141B34" />
          </TouchableOpacity>

          <Text style={styles.appointmentCountText}>
            {appliedFilters || searchQuery ? `${filteredAppointments.length} Appointments` : '20 Appointments'}
          </Text>
        </View>
      </View>

      {/* ── Content Area: 1:1 Empty State vs Scrollable Cards List ──────── */}
      {filteredAppointments.length === 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.emptyScrollContent,
            { paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 56) + 24 : Math.max(insets.bottom, 16) + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#000814"
            />
          }
        >
          <NoRecordedAppointmentsEmptyState
            message="No appointment found"
            onRefresh={handleRefresh}
            showRefreshButton={true}
          />
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 56) + 24 : Math.max(insets.bottom, 16) + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#000814"
            />
          }
        >
          {filteredAppointments.map((item) => (
            <View key={item.id} style={styles.cardWrapper}>
              {/* Bottom Decorative Flap (Frame 1000006401, height: 66px, top: 91px) */}
              <View style={styles.bottomFlap}>
                <View style={styles.bottomFlapRow}>
                  <Calendar03Icon size={16} color="rgba(96, 96, 102, 0.96)" />
                  <Text style={styles.bottomFlapText}>
                    Appointment Begins {item.beginsDate || 'Oct 1'}
                  </Text>
                </View>
              </View>

              {/* Top White Booked Customer Card (booked customer: 358x112px, radius: 24px) */}
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
                      price: item.price,
                      duration: item.duration,
                      rating: item.rating,
                      specialist: item.specialist,
                      specialistRole: item.specialistRole,
                      date: item.appointmentDate,
                      type: item.type,
                      status: 'upfront',
                      isUpfront: 'true',
                      paymentType: item.paymentType,
                      packagePrice: item.packagePrice,
                      total: item.total,
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
                      <View style={styles.durationGroup}>
                        <Time04Icon size={18} color="rgba(96, 96, 102, 0.96)" />
                        <Text style={styles.metaText}>{item.duration}</Text>
                      </View>

                      {/* 5x5 Dot Separator (Ellipse 197) */}
                      <View style={styles.metaDot} />

                      {/* Star Rating Group */}
                      <View style={styles.ratingGroup}>
                        <StarIcon size={18} color="rgba(248, 155, 24, 0.96)" />
                        <Text style={styles.metaText}>{item.rating}</Text>
                      </View>
                    </View>

                    {/* Price Tag: 14px Regular, color: rgba(96, 96, 102, 0.96) */}
                    <Text style={styles.priceText}>{item.price}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Native Dock Spacer strictly protects Android 3-button dock */}
      <NativeDockSpacer />

      {/* ── Filter Sheet Modal ── */}
      <ProviderAppointmentFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        items={UPCOMING_APPOINTMENTS_DATA}
        onApply={(newFilters) => {
          setAppliedFilters(newFilters);
          setFilterModalVisible(false);
        }}
        onClear={() => {
          setAppliedFilters(undefined);
          setFilterModalVisible(false);
        }}
        currentFilters={appliedFilters}
      />

      {/* ── Date Picker Sheet Modal ── */}
      <ProviderDateFilterModal
        visible={dateFilterModalVisible}
        onClose={() => setDateFilterModalVisible(false)}
        onSelectDate={(newDate) => {
          setSelectedDate(newDate);
          setDateFilterModalVisible(false);
        }}
        initialDate={parsedInitialDate}
      />
    </SafeAreaView>
  );
}

// ── 1:1 Converter Precise StyleSheet ──────────────────────────────────────────

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Page Header (64px, padding 8px 16px, gap 10px, 1:1 Figma) ───────────────
  pageHeader: {
    width: '100%',
    height: 64,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 48,
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitleText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    flex: 1,
  },

  shareIconButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Search & Filter Section (Frame 1000006531, height: 134px, gap: 24px) ───
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 48,
    gap: 22,
  },

  searchBar: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },

  searchBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '100%',
    height: 24,
  },

  searchInput: {
    flex: 1,
    height: 24,
    padding: 0,
    margin: 0,
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#000814',
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterBadgeText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 10,
    color: '#FFFFFF',
    lineHeight: 12,
  },

  // Date picker + Count Section (Frame 1000006427, height: 45px, gap: 5px)
  datePickerSection: {
    width: '100%',
    gap: 5,
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

  // ── Scroll Content ──────────────────────────────────────────────────────────
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },

  // ── Appointment Card with 1:1 Figma Geometry ─────────────────────────────────
  // Total card height: 157px (112px top card + 66px flap with 21px overlap)
  cardWrapper: {
    width: '100%',
    height: 157,
    position: 'relative',
    marginBottom: 24,
  },

  // Frame 1000006401: 358x66px bottom flap with 24px bottom radius
  bottomFlap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 91,
    height: 66,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    justifyContent: 'flex-end',
    paddingBottom: 11,
    paddingHorizontal: 16,
  },

  // Frame 1000006402: 206x20px row centered with calendar icon
  bottomFlapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 20,
  },

  bottomFlapText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // Booked Customer Top Card: 358x112px, border 1px solid rgba(235, 235, 245, 0.96)
  topCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 112,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    zIndex: 1,
  },

  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 80,
    gap: 16,
  },

  thumbnailContainer: {
    width: 80,
    height: 80,
    padding: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: 'rgba(133, 139, 148, 0.04)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  thumbnailImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },

  cardInfo: {
    flex: 1,
    height: 80,
    justifyContent: 'flex-start',
    gap: 8,
  },

  serviceTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    height: 20,
  },

  durationGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  metaDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },

  ratingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  metaText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  priceText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  emptyScrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },

  emptyContainer: {
    paddingTop: 80,
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  emptyTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 18,
    lineHeight: 26,
    color: 'rgba(0, 8, 20, 0.96)',
    marginBottom: 8,
    textAlign: 'center',
  },

  emptySubtitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
});
