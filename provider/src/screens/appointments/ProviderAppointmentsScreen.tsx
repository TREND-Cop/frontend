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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { DommyLoader } from '../../components/DommyLoader';
import {
  ProviderAppointmentFilterModal,
  ProviderFilterState,
  PRICE_STEPS,
  matchAppointment,
} from '../../components/ProviderAppointmentFilterModal';
import { useAppointments } from '../../store/appointmentStore';

// ── 1:1 Vector Icons ──────────────────────────────────────────────────────────

function ArrowLeft02Icon({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.57 5.93L3.5 12m0 0l6.07 6.07M3.5 12h17"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SearchIcon({ size = 24, color = '#000000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.5" />
      <Path d="M20 20l-4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function FilterFunnelIcon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 5h16c.55 0 .83.67.44 1.06L14 12.5v5.5a1 1 0 01-.55.89l-2 1A1 1 0 0110 19v-6.5L3.56 6.06A.75.75 0 014 5z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Time04Icon({ size = 18, color = 'rgba(96, 96, 102, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Circle cx="9" cy="9" r="7.5" stroke={color} strokeWidth="1.2" />
      <Path d="M9 5.25v3.75l2.25 1.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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

function ArrowRight02Icon({ size = 16, color = 'rgba(248, 155, 24, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M6.62 3.95L10.67 8l-4.05 4.05M2.67 8h8"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Types & Data ─────────────────────────────────────────────────────────────

interface AppointmentItem {
  id: string;
  title: string;
  duration: string;
  rating: string;
  price: string;
  numericPrice?: number;
  countdown: string;
  statusText: string;
  image: any;
  staff?: string;
  customerType?: 'verified' | 'non-verified';
  paymentMethod?: 'cash' | 'transfer';
  appointmentType?: 'in-person' | 'home-service';
  bookedPackage?: 'basic' | 'premium' | 'exclusive';
}

export const ProviderAppointmentsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { appointments, resetAppointments } = useAppointments();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<ProviderFilterState | undefined>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    resetAppointments();
    setAppliedFilters(undefined);
    setSearchQuery('');
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  // Calculate active filter count dynamically
  const activeFilterCount = useMemo(() => {
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

  // Filtered appointments list
  const filteredAppointments = useMemo(() => {
    let result = appointments;

    // Search query filter
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) =>
        item.title.toLowerCase().includes(q)
      );
    }

    // Applied filter modal options (using canonical matchAppointment)
    if (appliedFilters) {
      result = result.filter((item) => matchAppointment(item, appliedFilters));
    }

    return result;
  }, [appointments, searchQuery, appliedFilters]);

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="dark" />

      {/* ── Fixed Page Header (height: 64px, border-bottom 1px solid rgba(235, 235, 245, 0.96)) ── */}
      <View style={[styles.pageHeader, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.7}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft02Icon size={24} color="rgba(0, 8, 20, 0.96)" />
          </TouchableOpacity>

          {/* Screen Title: Appointment */}
          <Text style={styles.headerTitle}>Appointment</Text>

          {/* Invisible Right Dummy Icon to balance the flex layout */}
          <View style={styles.headerDummyButton} pointerEvents="none" />
        </View>
      </View>

      {/* ── Scrollable Body ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              (Platform.OS === 'android'
                ? Math.max(insets.bottom, 56)
                : Math.max(insets.bottom, 24)) + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            tintColor="transparent"
            colors={['transparent']}
          />
        }
      >
        {/* ── Search Bar & Filter Button Section (height: 72px) ── */}
        <View style={styles.searchSection}>
          {/* Search Input Box */}
          <View style={styles.searchBar}>
            <SearchIcon size={24} color="#000000" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search here.."
              placeholderTextColor="rgba(96, 96, 102, 0.96)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.75}
            onPress={() => setIsFilterModalVisible(true)}
          >
            <FilterFunnelIcon size={24} color="#141B34" />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Count Label & Reset Action ── */}
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            {`${filteredAppointments.length} Appointments`}
          </Text>
          {activeFilterCount > 0 && (
            <TouchableOpacity
              onPress={() => setAppliedFilters(undefined)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.resetFilterText}>Reset filter</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Appointment Cards List ── */}
        <View style={styles.appointmentsList}>
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.cardContainer}
                activeOpacity={0.92}
                onPress={() => {
                  router.push({
                    pathname: '/appointment/[id]',
                    params: {
                      id: item.id,
                      title: 'Ayobami Isaac',
                      clientName: item.id === '1' ? 'Jude Fabulous' : (item.clientName || 'Jude Fabulous'),
                      serviceTitle: item.id === '1' ? 'All Back Dreadlock' : item.title,
                      clientStatus: item.clientStatus || 'Non Client',
                      gender: item.gender || 'Male',
                      membership: item.membership || '5 Days ago',
                      price: item.id === '1' ? '₦14,200' : item.price,
                      duration: item.id === '1' ? '1hr' : item.duration,
                      rating: item.id === '1' ? '3.6' : item.rating,
                      staff: item.staff || 'Bisola Olarewaju',
                      specialist: item.staff || 'Bisola Olarewaju',
                      specialistRole: item.specialistRole || 'Nail Artist',
                      date: item.date || 'Nov 19, 2026',
                      time: item.time || '9:30am',
                      appointmentType: item.appointmentType === 'home-service' ? 'Home Service' : (item.appointmentType === 'in-person' ? 'In-Person' : 'Home Service'),
                      type: item.appointmentType === 'home-service' ? 'Home Service' : (item.appointmentType === 'in-person' ? 'In-Person' : 'Home Service'),
                      status: 'request',
                      statusText: item.statusText || 'Waiting for you to Accept',
                      paymentType: item.paymentType || (item.paymentMethod === 'cash' ? 'Cash Payment' : 'Opay (Transfer)'),
                    },
                  });
                }}
              >
                {/* Part B: Bottom Orange/Peach Status Banner (Frame 1000006401) */}
                <View style={styles.bannerFrame}>
                  <View style={styles.bannerContentRow}>
                    <Text style={styles.bannerCountdownText}>{item.countdown}</Text>
                    <Text style={styles.bannerStatusText}>{item.statusText}</Text>
                    <ArrowRight02Icon size={16} color="rgba(248, 155, 24, 0.96)" />
                  </View>
                </View>

                {/* Part A: Top White Card (booked customer: 358x112px) */}
                <View style={styles.whiteCard}>
                  {/* 80x80px Image Container with 72x72px inner image */}
                  <View style={styles.imagePlaceholder}>
                    <Image
                      source={item.image}
                      style={styles.thumbnailImage}
                      resizeMode="cover"
                    />
                  </View>

                  {/* Right Info Section */}
                  <View style={styles.bookedInformation}>
                    {/* Service Title */}
                    <Text style={styles.serviceTitleText}>{item.title}</Text>

                    {/* Duration & Star Rating Row */}
                    <View style={styles.metaRow}>
                      {/* Duration */}
                      <View style={styles.durationRow}>
                        <Time04Icon size={18} color="rgba(96, 96, 102, 0.96)" />
                        <Text style={styles.metaText}>{item.duration}</Text>
                      </View>

                      {/* Dot Divider: Ellipse 197 (5x5) */}
                      <View style={styles.dotDivider} />

                      {/* Star Rating */}
                      <View style={styles.ratingRow}>
                        <StarGoldIcon size={18} color="rgba(248, 155, 24, 0.96)" />
                        <Text style={styles.metaText}>{item.rating}</Text>
                      </View>
                    </View>

                    {/* Price */}
                    <Text style={styles.priceText}>{item.price}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              {/* Rectangle 304 / 305 (150x150) */}
              <Image
                source={require('../../../assets/images/appointments/appointment_empty_calendar.png')}
                style={styles.emptyIllustration}
                resizeMode="contain"
              />

              {/* No appointment found */}
              <Text style={styles.emptyTitle}>No appointment found</Text>

              {/* Refresh Button */}
              <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.88}
                onPress={handleRefresh}
              >
                <Text style={styles.actionButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Android System Navigation Dock Barrier */}
      <NativeDockSpacer backgroundColor="#FFFFFF" />

      {/* ── Filter Bottom Sheet Modal ── */}
      <ProviderAppointmentFilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        items={appointments}
        onApply={(f) => {
          setAppliedFilters(f);
        }}
        onClear={() => {
          setAppliedFilters(undefined);
        }}
        currentFilters={appliedFilters}
      />

      {/* ── 1:1 Figma Refreshed Empty State Dommy Loader Screen Overlay ── */}
      <DommyLoader visible={isRefreshing} />
    </View>
  );
};

export default ProviderAppointmentsScreen;

const styles = StyleSheet.create({
  /* ── Screen Container ── */
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* ── Fixed Page Header ── */
  pageHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    zIndex: 10,
  },

  headerContent: {
    width: '100%',
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  headerIconButton: {
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
    includeFontPadding: false,
  },

  headerDummyButton: {
    width: 48,
    height: 48,
    opacity: 0,
  },

  /* ── ScrollView ── */
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    alignItems: 'center',
  },

  /* ── Search Bar & Filter Section ── */
  searchSection: {
    width: 358,
    height: 48,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  searchBar: {
    width: 288,
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
    height: 48,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
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
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#CC2929',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    paddingHorizontal: 3,
  },

  filterBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 14,
    color: '#FFFFFF',
    includeFontPadding: false,
    textAlign: 'center',
  },

  /* ── Count Row ── */
  countRow: {
    width: 358,
    marginTop: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  countText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  resetFilterText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 13,
    color: '#CC2929',
  },

  /* ── Appointments List ── */
  appointmentsList: {
    width: 358,
    alignItems: 'center',
  },

  /* ── Appointment Card (157px total: 112px card + 45px exposed banner) ── */
  cardContainer: {
    width: 358,
    height: 157,
    position: 'relative',
    marginBottom: 40,
  },

  /* Frame 1000006401 (Status Banner) */
  bannerFrame: {
    position: 'absolute',
    width: 358,
    height: 66,
    left: 0,
    top: 91,
    backgroundColor: 'rgba(246, 240, 230, 0.96)',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    zIndex: 0,
  },

  bannerContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    position: 'absolute',
    width: 241,
    height: 20,
    left: (358 - 241) / 2,
    top: 35,
    justifyContent: 'center',
  },

  bannerCountdownText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(248, 155, 24, 0.96)',
    includeFontPadding: false,
  },

  bannerStatusText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(248, 155, 24, 0.96)',
    includeFontPadding: false,
  },

  /* booked customer (White Card) */
  whiteCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 358,
    height: 112,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },

  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 3,
  },

  thumbnailImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },

  bookedInformation: {
    marginLeft: 16,
    height: 80,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  serviceTitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    height: 20,
  },

  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  dotDivider: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },

  metaText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  priceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  /* ── Empty State matching Figma Specs ── */
  emptyContainer: {
    width: 358,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingBottom: 40,
  },

  /* Rectangle 304 */
  emptyIllustration: {
    width: 150,
    height: 150,
  },

  /* No appointment found */
  emptyTitle: {
    marginTop: 16,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    textAlign: 'center',
    includeFontPadding: false,
  },

  /* Filled action Button */
  actionButton: {
    marginTop: 42,
    width: 233,
    height: 48,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#858B94',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },

  /* Refresh Button Text */
  actionButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
    textAlign: 'center',
  },
});
