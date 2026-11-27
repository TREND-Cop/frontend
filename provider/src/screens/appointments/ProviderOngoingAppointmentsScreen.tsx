import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { DommyLoader } from '../../components/DommyLoader';
import {
  ProviderAppointmentFilterModal,
  ProviderFilterState,
  matchAppointment,
} from '../../components/ProviderAppointmentFilterModal';
import {
  useOngoingAppointments,
  OngoingAppointmentItem,
} from '../../store/appointmentStore';

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

function Share03Icon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3v12m0-12l4 4m-4-4L8 7"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 11v8a2 2 0 002 2h12a2 2 0 002-2v-8"
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

function ArrowRight02Icon({ size = 16, color = '#606066' }: { size?: number; color?: string }) {
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

// ── Spinning In-Progress Vector Icon ──────────────────────────────────────────

function SpinningProgressIcon({ size = 16, color = '#0C790C' }: { size?: number; color?: string }) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinAnim = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spinAnim.start();
    return () => spinAnim.stop();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ width: size, height: size, transform: [{ rotate: spin }] }}>
      <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <Circle cx="8" cy="8" r="6.67" stroke={color} strokeWidth="1" strokeDasharray="8 4" />
      </Svg>
    </Animated.View>
  );
}

// ── Barber Chair Illustration (1:1 Figma Rectangle 304, 150x150px) ───────────

function BarberChairIllustration({ size = 150 }: { size?: number }) {
  return (
    <View style={styles.chairIllustrationWrap}>
      <Svg width={size} height={size} viewBox="0 0 150 150" fill="none">
        {/* Soft rounded polygon backdrop badge */}
        <Rect
          x="15"
          y="15"
          width="120"
          height="120"
          rx="28"
          fill="#F5F6FA"
          stroke="#E5E7EB"
          strokeWidth="1.5"
        />

        {/* Chair Headrest */}
        <Rect x="64" y="38" width="22" height="10" rx="4" fill="#C2C7D6" />

        {/* Chair Backrest */}
        <Rect x="54" y="52" width="42" height="34" rx="6" fill="#A4ABC0" />
        <Rect x="58" y="56" width="34" height="26" rx="4" fill="#8F97AE" />

        {/* Armrests */}
        <Rect x="46" y="66" width="8" height="22" rx="3" fill="#6B7280" />
        <Rect x="96" y="66" width="8" height="22" rx="3" fill="#6B7280" />

        {/* Seat Cushion */}
        <Rect x="50" y="86" width="50" height="12" rx="5" fill="#4B5563" />

        {/* Hydraulic Stem */}
        <Rect x="71" y="98" width="8" height="16" fill="#9CA3AF" />

        {/* Footrest Arm & Pedal */}
        <Path d="M68 104H52V110H68" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" />

        {/* Circular Base */}
        <Path
          d="M50 114C50 112 100 112 100 114L96 118H54L50 114Z"
          fill="#374151"
        />
      </Svg>
    </View>
  );
}

// ── Main Screen Component ───────────────────────────────────────────────────

export function ProviderOngoingAppointmentsScreen() {

  const insets = useSafeAreaInsets();
  const safeRouter = useSafeRouter();

  const {
    ongoingAppointments,
    refreshOngoingAppointments,
  } = useOngoingAppointments();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<ProviderFilterState | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active filter count calculation
  const activeFilterCount = useMemo(() => {
    if (!appliedFilters) return 0;
    let count = 0;
    if (appliedFilters.minPrice > 27550 || appliedFilters.maxPrice < 935550 || appliedFilters.customAmount) count += 1;
    if (appliedFilters.selectedServices && appliedFilters.selectedServices.length > 0) count += appliedFilters.selectedServices.length;
    if (appliedFilters.selectedStaff && appliedFilters.selectedStaff.length > 0) count += appliedFilters.selectedStaff.length;
    if (appliedFilters.customerType) count += 1;
    if (appliedFilters.paymentMethod) count += 1;
    if (appliedFilters.appointmentType) count += 1;
    if (appliedFilters.bookedPackage) count += 1;
    return count;
  }, [appliedFilters]);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    let result = ongoingAppointments;

    // Search filter
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.clientName.toLowerCase().includes(q) ||
          item.specialist.toLowerCase().includes(q)
      );
    }

    // Applied modal filters
    if (appliedFilters) {
      result = result.filter((item) => matchAppointment(item, appliedFilters));
    }

    return result;
  }, [ongoingAppointments, searchQuery, appliedFilters]);

  // Handle Refresh Action (Empty state refresh -> restore original services)
  const handleRefresh = () => {
    setIsRefreshing(true);
    setSearchQuery('');
    setAppliedFilters(null);
    refreshOngoingAppointments();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const isEmpty = filteredAppointments.length === 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* ── Page Header (64px) ──────────────────────────────────────────────── */}
      <View style={styles.pageHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.7}
            onPress={() => safeRouter.back()}
          >
            <ArrowLeft02Icon />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {isEmpty ? 'Appointment' : 'Ongoing Appointments'}
          </Text>

          {isEmpty ? (
            <View style={styles.headerIconButton} />
          ) : (
            <TouchableOpacity
              style={styles.headerShareButton}
              activeOpacity={0.7}
              onPress={() => {}}
            >
              <Share03Icon />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Search Bar & Filter Button (72px) ───────────────────────────────── */}
      <View style={styles.searchSection}>
        <View style={styles.searchBarContainer}>
          <View style={styles.searchInner}>
            <SearchIcon size={20} color="#000000" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search here.."
              placeholderTextColor="rgba(96, 96, 102, 0.96)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilterCount > 0 && styles.filterButtonActive,
          ]}
          activeOpacity={0.7}
          onPress={() => setFilterModalVisible(true)}
        >
          <FilterFunnelIcon
            size={20}
            color={activeFilterCount > 0 ? '#0C790C' : '#141B34'}
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Main Content Area ───────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {isEmpty ? (
          /* ── Screen 1 & 2: Empty State (1:1 Figma & Mockup) ── */
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyCounterText}>0 Ongoing appointments</Text>

            <View style={styles.illustrationWrapper}>
              <Image
                source={require('../../../assets/images/appointments/ongoing_empty_chair.png')}
                style={styles.emptyIllustrationImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.emptyTitleText}>No appointment found</Text>

            {/* Refresh Button */}
            <TouchableOpacity
              style={styles.refreshButton}
              activeOpacity={0.88}
              onPress={handleRefresh}
            >
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ── Screen 3: Populated Ongoing Appointments ── */
          <View style={styles.populatedContainer}>
            <View style={styles.counterRow}>
              <Text style={styles.counterText}>
                {filteredAppointments.length} Ongoing appointment
              </Text>
            </View>

            {/* 3 Ongoing Service Cards */}
            <View style={styles.cardsList}>
              {filteredAppointments.map((item) => (
                <View key={item.id} style={styles.compoundCardWrapper}>
                  {/* Bottom Mint Status Flap (Frame 1000006401) */}
                  <View style={styles.statusFlap}>
                    <View style={styles.statusRow}>
                      <SpinningProgressIcon size={16} color="#0C790C" />
                      <Text style={styles.statusText}>{item.statusText}</Text>
                    </View>
                  </View>

                  {/* Top White Booked Customer Card */}
                  <TouchableOpacity
                    style={styles.topCard}
                    activeOpacity={0.85}
                    onPress={() => {
                      safeRouter.push({
                        pathname: '/ongoing-appointment/[id]',
                        params: {
                          id: item.id,
                          title: item.title,
                          clientName: item.clientName,
                          clientStatus: item.clientStatus,
                          gender: item.gender || 'Male',
                          membership: item.membership || 'Joined 2 wks ago',
                          specialist: item.specialist,
                          specialistRole: item.specialistRole,
                          date: item.appointmentDate,
                          time: item.appointmentTime,
                          note: item.note,
                          elapsedTime: item.elapsedTime,
                          price: item.price,
                          duration: item.duration,
                          rating: item.rating,
                        },
                      });
                    }}
                  >
                    <View style={styles.cardContent}>
                      {/* 80x80 Thumbnail Container */}
                      <View style={styles.thumbnailContainer}>
                        <Image source={item.image} style={styles.thumbnailImage} resizeMode="cover" />
                      </View>

                      {/* Information Column */}
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {item.title}
                        </Text>

                        {/* Meta row: duration & star rating */}
                        <View style={styles.metaRow}>
                          <View style={styles.durationGroup}>
                            <Time04Icon size={16} color="rgba(96, 96, 102, 0.96)" />
                            <Text style={styles.metaText}>{item.duration}</Text>
                          </View>

                          <View style={styles.ratingGroup}>
                            <StarGoldIcon size={16} color="rgba(248, 155, 24, 0.96)" />
                            <Text style={styles.metaText}>{item.rating}</Text>
                          </View>
                        </View>

                        {/* Price */}
                        <Text style={styles.priceText}>{item.price}</Text>
                      </View>

                      {/* Right Chevron */}
                      <View style={styles.chevronWrap}>
                        <ArrowRight02Icon size={16} color="rgba(0, 8, 20, 0.6)" />
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Native Dock Protection Barrier ──────────────────────────────────── */}
      <NativeDockSpacer backgroundColor="#FFFFFF" />

      {/* ── Screen 2: 4-Dot Refreshed Loader ─────────────────────────────────── */}
      <DommyLoader visible={isRefreshing} paddingTop={429} />

      {/* ── Screen 4 & 5: Filter Modal ───────────────────────────────────────── */}
      <ProviderAppointmentFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        items={ongoingAppointments}
        onApply={(filters) => {
          setAppliedFilters(filters);
          setFilterModalVisible(false);
        }}
        onClear={() => {
          setAppliedFilters(null);
        }}
        currentFilters={appliedFilters || undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header (64px, gap: 10px, padding: 8px 16px) ───────────────────────────
  pageHeader: {
    width: '100%',
    height: 64,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.5)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
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
    color: '#000814',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  headerShareButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Search & Filter (72px, padding: 16px 16px 8px 16px) ───────────────────
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  searchBarContainer: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: '#C0C0CC',
    borderRadius: 24,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#000814',
    padding: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: '#C0C0CC',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    borderColor: '#0C790C',
    backgroundColor: '#EEF8EE',
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0C790C',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // ── Scroll Content ────────────────────────────────────────────────────────
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // ── Empty State (Screen 1 & 2) ────────────────────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  emptyCounterText: {
    alignSelf: 'flex-start',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
    marginBottom: 48,
  },
  illustrationWrapper: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIllustrationImage: {
    width: 150,
    height: 150,
  },
  chairIllustrationWrap: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 42,
  },
  refreshButton: {
    width: 233,
    height: 48,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#858B94',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },
  refreshButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
    textAlign: 'center',
  },
  // ── Populated State (Screen 3) ────────────────────────────────────────────
  populatedContainer: {
    paddingTop: 16,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  counterText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Cards List (gap: 40px between cards) ──────────────────────────────────
  cardsList: {
    gap: 40,
  },
  compoundCardWrapper: {
    width: '100%',
    maxWidth: 358,
    height: 157,
    alignSelf: 'center',
    position: 'relative',
  },

  // ── Bottom Status Flap (Frame 1000006401: 358x66px at top: 91px) ─────────
  statusFlap: {
    position: 'absolute',
    top: 91,
    left: 0,
    right: 0,
    height: 66,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    justifyContent: 'flex-end',
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statusText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#0C790C',
  },

  // ── Top White Booked Customer Card (358x112px) ────────────────────────────
  topCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 112,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBEBF5',
    borderRadius: 24,
    padding: 16,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  thumbnailContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#EBEBF5',
  },
  thumbnailImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  cardInfo: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  durationGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  priceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  chevronWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
  },
});

export default ProviderOngoingAppointmentsScreen;

