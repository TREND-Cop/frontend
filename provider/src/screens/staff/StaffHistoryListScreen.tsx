import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeRouter } from '../../utils/safeNavigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { useStaffAppointments } from '../../context/StaffAppointmentsContext';
import { StaffAppointment, StaffAppointmentType } from '../../types/staffAppointments';
import { STAFF_ROUTES } from '../../constants/staffRoutes';
import { triggerLightHaptic } from '../../utils/haptics';
import {
  formatNaira,
  formatHistoryDate,
} from '../../utils/staffAppointmentFormatters';
import { DateFilterSheet, FilterValue } from '../../components/DateFilterSheet';
import { StaffFilterSheet, StaffFilterState } from '../../components/staff/StaffFilterSheet';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

// ── Icons ────────────────────────────────────────────────────────────────────

function ArrowLeftIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M12 19l-7-7 7-7"
        stroke="rgba(0, 8, 20, 0.96)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PlaySquareIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="4"
        stroke="#141B34"
        strokeWidth="1.5"
      />
      <Path
        d="M10 8.5l6 3.5-6 3.5V8.5z"
        fill="#141B34"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SearchIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z"
        stroke="#000000"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function FunnelFilterIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 4h18l-7 8v8l-4-2v-6L3 4z"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronDownSmallIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9l6 6 6-6"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SmallClockIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
        stroke="rgba(96, 96, 102, 0.96)"
        strokeWidth="1.5"
      />
      <Path
        d="M12 6v6l4 2"
        stroke="rgba(96, 96, 102, 0.96)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function StarIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill="rgba(248, 155, 24, 0.96)"
      />
    </Svg>
  );
}

function CheckmarkCircleSmallIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
        fill="rgba(12, 121, 12, 0.96)"
        stroke="rgba(12, 121, 12, 0.96)"
        strokeWidth="1.5"
      />
      <Path
        d="M8 12l3 3 5-5"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CancelCircleSmallIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
        fill="rgba(204, 41, 41, 0.9)"
        stroke="rgba(204, 41, 41, 0.9)"
        strokeWidth="1.5"
      />
      <Path
        d="M15 9l-6 6M9 9l6 6"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Screen Component ─────────────────────────────────────────────────────────

export interface StaffHistoryListScreenProps {
  kind: 'completed' | 'cancelled';
}

export function StaffHistoryListScreen({ kind }: StaffHistoryListScreenProps) {
  const insets = useSafeAreaInsets();
  const safeRouter = useSafeRouter();
  const { appointments } = useStaffAppointments();

  const isCompleted = kind === 'completed';
  const screenTitle = isCompleted ? 'Completed Appointments' : 'Cancelled Appointments';

  // State: Search text
  const [searchQuery, setSearchQuery] = useState('');

  // State: Filter sheet visibility & applied filters
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<StaffFilterState>({
    services: [],
    appointmentTypes: [],
  });

  // State: Date filter sheet visibility & active date filter (Default: Today)
  const today = useMemo(() => new Date(), []);
  const [dateSheetVisible, setDateSheetVisible] = useState(false);
  const [dateFilter, setDateFilter] = useState<FilterValue>({
    type: 'day',
    year: today.getFullYear(),
    month: today.getMonth(),
    day: today.getDate(),
  });

  // Label shown in the date row: e.g. "8 June, 2026 ▾" or "2026 ▾"
  const dateRowLabel = useMemo(() => {
    if (dateFilter.type === 'day') {
      const d = new Date(dateFilter.year, dateFilter.month, dateFilter.day);
      return formatHistoryDate(d);
    }
    return `${dateFilter.year}`;
  }, [dateFilter]);

  // Appointments strictly of this kind ('completed' or 'cancelled')
  const kindAppointments = useMemo(() => {
    return appointments.filter((apt) => apt.status === kind);
  }, [appointments, kind]);

  // Check if a calendar day in Month tab has appointments of this kind
  const isDateDisabled = useCallback(
    (day: number, month: number, year: number) => {
      // Return true (disabled + struck-through) if NO appointment matches this exact day
      const hasAppointment = kindAppointments.some((apt) => {
        const d = new Date(apt.startTime);
        return (
          d.getDate() === day &&
          d.getMonth() === month &&
          d.getFullYear() === year
        );
      });
      return !hasAppointment;
    },
    [kindAppointments]
  );

  // Helper to filter appointments against a given filter state, search query, and date
  const filterAppointmentsList = useCallback(
    (
      sourceList: StaffAppointment[],
      query: string,
      filters: StaffFilterState,
      dFilter: FilterValue
    ) => {
      return sourceList.filter((apt) => {
        // 1. Date match
        const aptDate = new Date(apt.startTime);
        if (dFilter.type === 'day') {
          if (
            aptDate.getDate() !== dFilter.day ||
            aptDate.getMonth() !== dFilter.month ||
            aptDate.getFullYear() !== dFilter.year
          ) {
            return false;
          }
        } else {
          if (aptDate.getFullYear() !== dFilter.year) {
            return false;
          }
        }

        // 2. Search match: case-insensitive contains on category, serviceName, and client name
        if (query.trim()) {
          const q = query.trim().toLowerCase();
          const matchCategory = apt.service.category.toLowerCase().includes(q);
          const matchService = apt.service.serviceName.toLowerCase().includes(q);
          const matchClient = apt.client.name.toLowerCase().includes(q);
          if (!matchCategory && !matchService && !matchClient) {
            return false;
          }
        }

        // 3. Services chip filter
        if (filters.services.length > 0) {
          const matchSelectedService = filters.services.some(
            (s) =>
              apt.service.serviceName.toLowerCase() === s.toLowerCase() ||
              apt.service.category.toLowerCase() === s.toLowerCase()
          );
          if (!matchSelectedService) return false;
        }

        // 4. Appointment Type chip filter
        if (filters.appointmentTypes.length > 0) {
          if (!filters.appointmentTypes.includes(apt.type)) {
            return false;
          }
        }

        return true;
      });
    },
    []
  );

  // Filtered visible appointments list
  const filteredAppointments = useMemo(() => {
    return filterAppointmentsList(
      kindAppointments,
      searchQuery,
      appliedFilters,
      dateFilter
    );
  }, [kindAppointments, searchQuery, appliedFilters, dateFilter, filterAppointmentsList]);

  // Live match calculator for the filter bottom sheet "Show N related" button
  const calculateMatchCount = useCallback(
    (draftFilters: StaffFilterState) => {
      return filterAppointmentsList(
        kindAppointments,
        searchQuery,
        draftFilters,
        dateFilter
      ).length;
    },
    [kindAppointments, searchQuery, dateFilter, filterAppointmentsList]
  );

  // Navigate to history detail screen
  const handleCardPress = (item: StaffAppointment) => {
    triggerLightHaptic();
    safeRouter.push({
      pathname: STAFF_ROUTES.HISTORY_DETAIL as any,
      params: { id: item.id, kind },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* ── 1. Page Header ── */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.headerContentRow}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => {
              triggerLightHaptic();
              safeRouter.back();
            }}
            accessibilityLabel="Back to Staff Home"
          >
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {screenTitle}
          </Text>

          <TouchableOpacity
            style={styles.playButton}
            activeOpacity={0.7}
            onPress={() => {
              triggerLightHaptic();
              safeRouter.push({
                pathname: STAFF_ROUTES.TUTORIAL_VIDEO as any,
                params: {
                  step: isCompleted ? '4' : '3',
                  title: isCompleted ? 'Completed Appointments' : 'Cancelled Appointments',
                },
              });
            }}
            accessibilityLabel="Tutorial Video"
          >
            <PlaySquareIcon size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 2. Top Controls: Search Bar & Funnel Filter Button ── */}
      <View style={styles.controlsSection}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <SearchIcon size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search here..."
              placeholderTextColor="rgba(96, 96, 102, 0.96)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.75}
            onPress={() => {
              triggerLightHaptic();
              setFilterSheetVisible(true);
            }}
            accessibilityLabel="Open Filters"
          >
            <FunnelFilterIcon size={22} />
          </TouchableOpacity>
        </View>

        {/* ── 3. Date Row: Selected Date + Appointments Count Line ── */}
        <View style={styles.dateInfoContainer}>
          <TouchableOpacity
            style={styles.datePickerPressable}
            activeOpacity={0.7}
            onPress={() => {
              triggerLightHaptic();
              setDateSheetVisible(true);
            }}
            accessibilityLabel="Open Date Filter"
          >
            <Text style={styles.datePickerText}>{dateRowLabel}</Text>
            <ChevronDownSmallIcon size={20} />
          </TouchableOpacity>

          <Text style={styles.countLineText}>
            {`${filteredAppointments.length} Appointments`}
          </Text>
        </View>
      </View>

      {/* ── 4. Main Scrollable List or Empty State ── */}
      {filteredAppointments.length === 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.emptyScrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../../assets/images/appointments/no_recorded_appointments_illustration.png')}
              style={styles.emptyIllustration}
              resizeMode="contain"
            />
            <Text style={styles.emptyTitle}>No Recorded Appointments</Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {filteredAppointments.map((item) => {
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.cardWrapper}
                activeOpacity={0.88}
                onPress={() => handleCardPress(item)}
              >
                {/* ── Top White Card (358x112px) ── */}
                <View style={styles.cardBody}>
                  {/* Image with white frame & shadow */}
                  <View style={styles.imageBox}>
                    <Image
                      source={item.service.image || require('../../../assets/images/profile/cont1.jpg')}
                      style={styles.serviceImage}
                      resizeMode="cover"
                    />
                  </View>

                  {/* Information Column */}
                  <View style={styles.infoCol}>
                    <Text style={styles.serviceCategoryText} numberOfLines={1}>
                      {item.service.category}
                    </Text>

                    {/* Duration & Star Rating */}
                    <View style={styles.metaRow}>
                      <View style={styles.durationRow}>
                        <SmallClockIcon size={16} />
                        <Text style={styles.metaLabelText}>{item.service.duration}</Text>
                      </View>

                      <View style={styles.dotSeparator} />

                      <View style={styles.ratingRow}>
                        <StarIcon size={16} />
                        <Text style={styles.metaLabelText}>{item.service.rating}</Text>
                      </View>
                    </View>

                    {/* Price */}
                    <Text style={styles.priceText}>{formatNaira(item.service.price)}</Text>
                  </View>
                </View>

                {/* ── Attached Bottom Banner Strip ── */}
                <View
                  style={[
                    styles.bannerStrip,
                    isCompleted ? styles.bannerStripGreen : styles.bannerStripRed,
                  ]}
                >
                  {isCompleted ? (
                    <>
                      <CheckmarkCircleSmallIcon size={16} />
                      <Text style={styles.bannerTextGreen}>Appointment Completed</Text>
                    </>
                  ) : (
                    <>
                      <CancelCircleSmallIcon size={16} />
                      <Text style={styles.bannerTextRed}>Cancelled Appointment</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Android 3-button system dock protection */}
      <NativeDockSpacer />

      {/* ── Filter Bottom Sheet ── */}
      <StaffFilterSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        appliedFilters={appliedFilters}
        onApplyFilters={setAppliedFilters}
        calculateMatchCount={calculateMatchCount}
      />

      {/* ── Month / Year Date Filter Bottom Sheet ── */}
      <DateFilterSheet
        visible={dateSheetVisible}
        onClose={() => setDateSheetVisible(false)}
        currentFilter={dateFilter}
        onApplyFilter={setDateFilter}
        confirmLabels={{
          month: 'Select',
          year: 'Search date',
        }}
        isDateDisabled={isDateDisabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
  },
  headerContentRow: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Controls Section ──
  controlsSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    gap: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Date Info Row ──
  dateInfoContainer: {
    gap: 4,
  },
  datePickerPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  datePickerText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  countLineText: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Scrollable List ──
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 20,
  },

  // ── Appointment Card ──
  cardWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  cardBody: {
    width: '100%',
    minHeight: 112,
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
  imageBox: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 4,
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  infoCol: {
    flex: 1,
    gap: 6,
  },
  serviceCategoryText: {
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
    gap: 12,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dotSeparator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },
  metaLabelText: {
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

  // ── Bottom Banner Strip ──
  bannerStrip: {
    width: '100%',
    height: 48,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginTop: -16,
    paddingTop: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    zIndex: 1,
  },
  bannerStripGreen: {
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
  },
  bannerStripRed: {
    backgroundColor: 'rgba(248, 239, 239, 0.96)',
  },
  bannerTextGreen: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(10, 95, 10, 0.8)',
  },
  bannerTextRed: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(204, 41, 41, 0.9)',
  },

  // ── Empty State ──
  emptyScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 48,
  },
  emptyIllustration: {
    width: 150,
    height: 150,
  },
  emptyTitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
    textAlign: 'center',
  },
});
