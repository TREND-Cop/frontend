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
  RefreshControl,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import {
  ProviderAppointmentFilterModal,
  ProviderFilterState,
  PRICE_STEPS,
  matchAppointment,
} from '../../components/ProviderAppointmentFilterModal';
import { NoPendingAppointmentsEmptyState } from '../../components/NoPendingAppointmentsEmptyState';
import {
  useAwaitingAppointments,
  AwaitingAppointmentItem,
} from '../../store/appointmentStore';

// ── Master Typography Standards ───────────────────────────────────────────────
const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

// ── 1:1 Vector Icons ──────────────────────────────────────────────────────────

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
        d="M4 5h16c.55 0 .83.67.44 1.06L14 12.5v5.5a1 1 0 01-.55.89l-2 1A1 1 0 0110 19v-6.5L3.56 6.06A.75.75 0 014 5z"
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
      <Path d="M9 5.25v3.75l2.25 1.5" stroke={color} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function StarGoldIcon({ size = 18, color = 'rgba(248, 155, 24, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path
        d="M9 2.5l2.09 4.24 4.68.68-3.39 3.3 0.8 4.66L9 13.18l-4.18 2.2.8-4.66-3.39-3.3 4.68-.68L9 2.5z"
        fill={color}
      />
    </Svg>
  );
}

// 1:1 Walking Vector Icon (Figma 16x16, Light Brown)
function WalkingPersonIcon({ size = 16, color = 'rgba(248, 155, 24, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="4" r="2" stroke={color} strokeWidth={1.5} />
      <Path
        d="M10 20.5V16L8.5 13L10.5 8.5C10.8 7.9 11.4 7.5 12 7.5C12.6 7.5 13.2 7.9 13.5 8.5L15.5 11.5H18"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.5 12.5L6.5 14.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M13.5 16L15.5 20.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function ProviderAwaitingClientScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { awaitingAppointments, refreshAwaitingAppointments } = useAwaitingAppointments();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<ProviderFilterState | null>(null);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    if (!appliedFilters) return 0;
    let count = 0;
    if (appliedFilters.selectedServices && appliedFilters.selectedServices.length > 0) count++;
    if (appliedFilters.selectedStaff && appliedFilters.selectedStaff.length > 0) count++;
    if (appliedFilters.customerType) count++;
    if (appliedFilters.paymentMethod) count++;
    if (appliedFilters.appointmentType) count++;
    if (appliedFilters.bookedPackage) count++;
    if (appliedFilters.minPrice > 0 || appliedFilters.maxPrice < PRICE_STEPS[PRICE_STEPS.length - 1] || appliedFilters.customAmount) count++;
    return count;
  }, [appliedFilters]);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    let result = [...awaitingAppointments];

    // Search query filter
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.clientName && item.clientName.toLowerCase().includes(q)) ||
          (item.staff && item.staff.toLowerCase().includes(q))
      );
    }

    // Modal filters
    if (appliedFilters) {
      result = result.filter((item) => matchAppointment(item, appliedFilters));
    }

    return result;
  }, [awaitingAppointments, searchQuery, appliedFilters]);

  // Pull-to-refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshAwaitingAppointments();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const countSubtitle = `${filteredAppointments.length} Appointment${filteredAppointments.length === 1 ? '' : 's'} awaiting client`;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* ── Fixed Page Header (64px, padding: 8px 16px, 1:1 Figma) ─────────── */}
      <View style={styles.pageHeader}>
        <View style={styles.headerContent}>
          {/* Back button (48x48px circle) */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft02Icon size={24} color="rgba(0, 8, 20, 0.96)" />
          </TouchableOpacity>

          {/* Centered Title (17px DM Sans Medium, letterSpacing: 0.2px) */}
          <Text style={styles.headerTitleText} numberOfLines={1}>
            Awaiting Client Arrival
          </Text>

          {/* Right Header Spacer (48x48px, opacity: 0 in Figma) */}
          <View style={styles.headerSpacer} />
        </View>
      </View>

      {/* ── Search Bar & Filter Button (Height: 72px, padding: 16px 16px 8px) ─ */}
      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          {/* Search Input Bar (288x48px, radius: 24px) */}
          <View style={styles.searchBar}>
            <SearchIcon size={24} color="#000000" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search here.."
              placeholderTextColor="rgba(96, 96, 102, 0.96)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
          </View>

          {/* Filter Button (48x48px, radius: 24px) */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.filterButton,
              activeFiltersCount > 0 && styles.filterButtonActive,
            ]}
            onPress={() => setIsFilterModalVisible(true)}
          >
            <FilterFunnelIcon
              size={24}
              color={activeFiltersCount > 0 ? '#FFFFFF' : '#141B34'}
            />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Appointment Count Subtitle (14px Regular, color: rgba(96, 96, 102, 0.96)) ── */}
      {filteredAppointments.length > 0 && (
        <View style={styles.countContainer}>
          <Text style={styles.countText}>{countSubtitle}</Text>
        </View>
      )}

      {/* ── Scrollable Body ───────────────────────────────────────────────── */}
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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#000814"
          />
        }
      >
        {filteredAppointments.length === 0 ? (
          <NoPendingAppointmentsEmptyState />
        ) : (
          filteredAppointments.map((item) => (
            <View key={item.id} style={styles.cardWrapper}>
              {/* Underlay Flap (Frame 1000006401: 358x66px, top: 91px, Lightest Brown) */}
              <View style={styles.underlayFlap}>
                <View style={styles.underlayRow}>
                  <WalkingPersonIcon size={16} color="rgba(248, 155, 24, 0.96)" />
                  <Text style={styles.underlayText}>
                    {item.statusText || 'Awaiting client arrival'}
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
                      time: item.appointmentTime,
                      status: 'awaiting',
                      statusText: item.statusText || 'Awaiting client arrival',
                      paymentMethod: item.paymentMethod,
                      customerType: item.customerType,
                    },
                  } as any);
                }}
              >
                {/* 80x80px Image Placeholder with 4px padding & Shadow */}
                <View style={styles.thumbnailContainer}>
                  <Image
                    source={item.image}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </View>

                {/* Booked Information (width: 132px / flex: 1, gap: 8px) */}
                <View style={styles.infoContainer}>
                  {/* Service Title: 16px Medium (500) */}
                  <Text style={styles.serviceTitle} numberOfLines={1}>
                    {item.title}
                  </Text>

                  {/* Duration and Rate row */}
                  <View style={styles.durationRateRow}>
                    {/* Duration: Clock + 1hr */}
                    <View style={styles.durationGroup}>
                      <Time04Icon size={18} color="rgba(96, 96, 102, 0.96)" />
                      <Text style={styles.durationText}>{item.duration}</Text>
                    </View>

                    {/* Separator Dot: 5x5px */}
                    <View style={styles.separatorDot} />

                    {/* Rate: Star + 3.5 */}
                    <View style={styles.rateGroup}>
                      <StarGoldIcon size={18} color="rgba(248, 155, 24, 0.96)" />
                      <Text style={styles.rateText}>{item.rating}</Text>
                    </View>
                  </View>

                  {/* Price Tag: 14px Regular */}
                  <Text style={styles.priceText}>{item.price}</Text>
                </View>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* ── Golden Rule 7: Native Dock Spacer ─────────────────────────────── */}
      <NativeDockSpacer />

      {/* ── Filter Modal ──────────────────────────────────────────────────── */}
      <ProviderAppointmentFilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        onApply={(filters) => {
          setIsFilterModalVisible(false);
          setAppliedFilters(filters);
        }}
        onClear={() => setAppliedFilters(null)}
        currentFilters={appliedFilters || undefined}
        items={awaitingAppointments}
      />
    </SafeAreaView>
  );
}

// ── 1:1 Precise Figma Stylesheet ──────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Fixed Page Header (64px, padding: 8px 16px) ─────────────────────────────
  pageHeader: {
    width: '100%',
    height: 64,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  headerContent: {
    width: '100%',
    height: 48,
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
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    flex: 1,
    includeFontPadding: false,
  },
  headerSpacer: {
    width: 48,
    height: 48,
  },

  // ── Search & Filter Section (72px, padding: 16px 16px 8px) ──────────────────
  searchSection: {
    width: '100%',
    height: 72,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    justifyContent: 'center',
  },
  searchRow: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  searchBar: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#000814',
    borderColor: '#000814',
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0C790C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontFamily: FONT_BUTTON,
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // ── Count Subtitle (14px Regular, color: rgba(96, 96, 102, 0.96)) ──────────
  countContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  countText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  // ── Scrollable Body ─────────────────────────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // ── Appointment Card Wrapper (1:1 Figma Layout) ─────────────────────────────
  // Total height: 112px (top card) + 45px (exposed bottom tab) = 157px
  cardWrapper: {
    width: '100%',
    maxWidth: 358,
    height: 157,
    alignSelf: 'center',
    marginBottom: 16,
    position: 'relative',
  },

  // ── Underlay Flap (Frame 1000006401: 358x66px, top: 91px) ───────────────────
  underlayFlap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 91,
    height: 66,
    backgroundColor: 'rgba(246, 240, 230, 0.96)',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    zIndex: 1,
  },
  underlayRow: {
    position: 'absolute',
    top: 35,
    left: 0,
    right: 0,
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  underlayText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(248, 155, 24, 0.96)',
    includeFontPadding: false,
  },

  // ── Top Card (booked customer: 358x112px, border-radius: 24px) ──────────────
  topCard: {
    width: '100%',
    height: 112,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    zIndex: 2,
  },

  // ── Image Place Holder (80x80px with Hard Shadow) ───────────────────────────
  thumbnailContainer: {
    width: 80,
    height: 80,
    padding: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: 'rgba(133, 139, 148, 0.08)',
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

  // ── Booked Information (gap: 8px) ───────────────────────────────────────────
  infoContainer: {
    flex: 1,
    height: 80,
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
    includeFontPadding: false,
  },
  durationRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  durationGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  separatorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },
  rateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rateText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  priceText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
});
