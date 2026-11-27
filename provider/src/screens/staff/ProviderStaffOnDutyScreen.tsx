import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { useStaffStore, StaffMember } from '../../context/StaffContext';
import { useBusinessStore } from '../../store/businessStore';
import {
  deriveStaffStatus,
  DEV_STAFF_ONGOING_APPOINTMENTS,
  StaffFilterOption,
} from '../../constants/staffStatus.config';
import { StaffStatusFilterModal } from '../../components/staff/StaffStatusFilterModal';
import { NoStaffIllustration } from '../../components/staff/NoStaffIllustration';
import { triggerLightHaptic } from '../../utils/haptics';

// ── Typography Mandate (AGENTS.md & Figma CSS) ──────────────────────────────
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

// ── 1:1 Vector Icons from Figma Export ──────────────────────────────────────

function ArrowLeft02Icon({
  size = 24,
  color = 'rgba(0, 8, 20, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
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

function ArrowRight02Icon({
  size = 24,
  color = 'rgba(0, 8, 20, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14.43 5.93L20.5 12L14.43 18.07"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3.5 12H20.33"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
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

function FilterFunnelIcon({
  size = 24,
  color = '#141B34',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Seat Selector (Barber Chair) Vector from Figma
 */
function SeatSelectorIcon({
  size = 20,
  strokeWidth = 1.25,
  color = 'rgba(12, 121, 12, 0.96)',
}: {
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M6.5 8V4.5C6.5 3.12 7.62 2 9 2h2c1.38 0 2.5 1.12 2.5 2.5V8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M4 8.5v3a1 1 0 001 1h1.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 8.5v3a1 1 0 01-1 1h-1.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6 12.5h8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M10 12.5V17"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M6.5 17h7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma briefcase-06 Vector Icon
 */
function Briefcase06Icon({
  size = 16,
  color = 'rgba(12, 121, 12, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M5.66 4.33V3c0-.55.45-1 1-1h2.68c.55 0 1 .45 1 1v1.33"
        stroke={color}
        strokeWidth={1}
        strokeLinecap="round"
      />
      <Rect
        x="1.33"
        y="4.33"
        width="13.34"
        height="9.67"
        rx="2"
        stroke={color}
        strokeWidth={1}
      />
      <Path
        d="M1.33 8h13.34"
        stroke={color}
        strokeWidth={1}
        strokeLinecap="round"
      />
      <Path
        d="M7 8v1.33h2V8"
        stroke={color}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function StarGoldIcon({
  size = 18,
  color = 'rgba(248, 155, 24, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path
        d="M9 2.5l2.09 4.24 4.68.68-3.39 3.3 0.8 4.66L9 13.18l-4.18 2.2.8-4.66-3.39-3.3 4.68-.68L9 2.5z"
        fill={color}
      />
    </Svg>
  );
}

function Time04Icon({
  size = 18,
  color = 'rgba(96, 96, 102, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Circle cx="9" cy="9" r="7.5" stroke={color} strokeWidth={1} />
      <Path
        d="M9 5.25v3.75l2.25 1.5"
        stroke={color}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function FastFoodOutlineIcon({
  size = 16,
  color = 'rgba(248, 155, 24, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 11c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M2.5 13.5h14"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M3.5 16.5c0 1.5 2.5 2.5 6 2.5s6-1 6-2.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M17 9l1.5 10.5a1 1 0 001 .9h1a1 1 0 001-.9L23 9H17z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20 9V4.5l-1.5-1.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function Home03Icon({
  size = 16,
  color = 'rgba(96, 96, 102, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 21V12h6v9"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const NO_STAFF_IMAGE = require('../../../assets/images/staff/no_staff_illustration.png');
const DEFAULT_AVATARS = [
  require('../../../assets/images/profile/1007604716.jpg'),
  require('../../../assets/images/profile/1007643877.jpg'),
  require('../../../assets/images/profile/1007604717.jpg'),
  require('../../../assets/images/profile/gavin_nwosis_avatar.png'),
  require('../../../assets/images/profile/1007618600.jpg'),
  require('../../../assets/images/profile/1007655253.jpg'),
];

function getStaffPhotoSource(member: StaffMember, index: number) {
  const photo = member.photoUri ?? member.avatarUri;
  if (!photo) {
    return DEFAULT_AVATARS[index % DEFAULT_AVATARS.length];
  }
  if (typeof photo === 'number') {
    return photo;
  }
  if (typeof photo === 'string' && photo.trim().length > 0) {
    return { uri: photo };
  }
  if (typeof photo === 'object' && photo !== null && 'uri' in photo) {
    return photo;
  }
  return DEFAULT_AVATARS[index % DEFAULT_AVATARS.length];
}

// ── Screen Component ────────────────────────────────────────────────────────

interface ProviderStaffOnDutyScreenProps {
  initialFilter?: StaffFilterOption;
  hideHeader?: boolean;
}

export function ProviderStaffOnDutyScreen({}: ProviderStaffOnDutyScreenProps = {}) {
  const safeRouter = useSafeRouter();
  const { business } = useBusinessStore();

  // 1. Data source: from existing StaffProvider (zero duplication)
  const { staff: providerStaff } = useStaffStore();

  // 2. Derive status for each staff member in real-time
  // TODO (Backend: realtime status)
  const staffWithStatus = useMemo(() => {
    return providerStaff.map((member, index) => {
      const derived = deriveStaffStatus(
        member,
        DEV_STAFF_ONGOING_APPOINTMENTS,
        new Date(),
        business.isOpen
      );
      const photo = getStaffPhotoSource(member, index);
      const roleText = member.role || (member.roles && member.roles[0]) || 'Barber';
      const hoursText = member.workHours
        ? `${member.workHours.start} - ${member.workHours.end}`
        : '8am - 10pm';

      return {
        member,
        index,
        photo,
        roleText,
        hoursText,
        derived,
      };
    });
  }, [providerStaff, business.isOpen]);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<StaffFilterOption>('all');
  const [recentFilter, setRecentFilter] = useState<StaffFilterOption | null>(null);

  // Summary counts
  const { availableCount, busyCount, breakCount, closedCount } = useMemo(() => {
    let available = 0;
    let busy = 0;
    let onBreak = 0;
    let closed = 0;
    staffWithStatus.forEach((item) => {
      if (item.derived.status === 'busy') busy++;
      else if (item.derived.status === 'available') available++;
      else if (item.derived.status === 'on_break') onBreak++;
      else if (item.derived.status === 'closed') closed++;
    });
    return {
      availableCount: available,
      busyCount: busy,
      breakCount: onBreak,
      closedCount: closed,
    };
  }, [staffWithStatus]);

  // On-duty staff: available, busy, or on break
  const onDutyStaff = useMemo(() => {
    return staffWithStatus.filter(
      (item) => item.derived.status !== 'closed'
    );
  }, [staffWithStatus]);

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    if (activeFilter === 'busy') {
      return staffWithStatus.filter((item) => item.derived.status === 'busy');
    }
    if (activeFilter === 'break') {
      return staffWithStatus.filter((item) => item.derived.status === 'on_break');
    }
    if (activeFilter === 'closed') {
      return staffWithStatus.filter((item) => item.derived.status === 'closed');
    }
    if (activeFilter === 'available') {
      return staffWithStatus.filter((item) => item.derived.status === 'available');
    }
    // 'all': on this "Staff Status" screen, show on-duty staff, or all registered staff if business is open
    return onDutyStaff.length > 0 ? onDutyStaff : staffWithStatus;
  }, [staffWithStatus, activeFilter, onDutyStaff]);

  const isEmpty = filteredStaff.length === 0;

  // Dynamic summary text based on active filter
  const summaryText = useMemo(() => {
    if (isEmpty || providerStaff.length === 0) return '0 Staff';
    switch (activeFilter) {
      case 'busy':
        return `${busyCount} Busy staff`;
      case 'break':
        return `${breakCount} Staff on break`;
      case 'closed':
        return `${closedCount} Closed staff`;
      case 'available':
        return `${availableCount} Available staff`;
      case 'all':
      default:
        return `${availableCount} Available staff, ${busyCount} busy staff`;
    }
  }, [isEmpty, providerStaff.length, activeFilter, busyCount, breakCount, closedCount, availableCount]);

  const handleApplyFilter = (filter: StaffFilterOption) => {
    setActiveFilter(filter);
    if (filter !== 'all') {
      setRecentFilter(filter);
    }
  };

  const handleClearFilter = () => {
    setActiveFilter('all');
  };

  const handleRemoveRecentFilter = () => {
    setRecentFilter(null);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Fixed Page Header (64px) ── */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Back Button (48x48) */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={() => safeRouter.back()}
            accessibilityLabel="Go back"
          >
            <ArrowLeft02Icon size={24} color="rgba(0, 8, 20, 0.96)" />
          </TouchableOpacity>

          {/* Title: 'Staff Status' (DM Sans 500 / SF Pro 500 17px/24px) */}
          <Text style={styles.headerTitle} numberOfLines={1}>
            Staff Status
          </Text>

          {/* Invisible Right Slot Spacer (48x48, opacity 0) */}
          <View style={styles.headerSpacer} pointerEvents="none" />
        </View>
      </View>

      {/* ── Main Scroll View ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Search Field + Filter Button Row (358x48px) ── */}
        <View style={styles.searchRow}>
          {/* Search field: pressable field, navigates to /staff-search */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.searchField}
            onPress={() => {
              triggerLightHaptic();
              safeRouter.push('/staff-search');
            }}
            accessibilityLabel="Search here"
          >
            <SearchIcon size={24} color="#000000" />
            <Text style={styles.searchPlaceholder}>Search here..</Text>
          </TouchableOpacity>

          {/* Filter button: opens filter sheet */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.filterButton}
            onPress={() => {
              triggerLightHaptic();
              setFilterModalVisible(true);
            }}
            accessibilityLabel="Filter staff"
          >
            <FilterFunnelIcon size={24} color="#141B34" />
            {activeFilter !== 'all' && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>1</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Summary / Count Line (14px/20px) ── */}
        <View style={styles.summaryLineContainer}>
          <Text
            style={[
              styles.summaryText,
              activeFilter !== 'all' && styles.summaryTextFiltered,
            ]}
          >
            {summaryText}
          </Text>
        </View>

        {/* ── State Switcher: Empty State vs Populated Staff Cards ── */}
        {isEmpty ? (
          /* ── 1:1 Figma Empty State ('no job state') ── */
          <View style={styles.emptyContainer}>
            {/* Rectangle 283: 130x130 Illustration */}
            <View style={styles.emptyIllustrationWrapper}>
              <NoStaffIllustration size={130} style={styles.emptyIllustration} />
            </View>

            {/* Frame 1000006541: Title & Description */}
            <View style={styles.emptyTextBlock}>
              <Text style={styles.emptyTitle}>No Staff Found</Text>
              <Text style={styles.emptySubtitle}>
                Add staff members who will provide your services to clients.
              </Text>
            </View>

            {/* Filled action Button: 'Add staff' (319x48px, radius 24px) */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.addStaffButton}
              onPress={() => {
                triggerLightHaptic();
                safeRouter.push('/staff-add');
              }}
              accessibilityLabel="Add staff"
            >
              <Text style={styles.addStaffButtonText}>Add staff</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ── Populated Staff Cards List (40px gap between cards) ── */
          <View style={styles.cardsList}>
            {filteredStaff.map((item) => {
              const { member, photo, roleText, hoursText, derived } = item;

              // ── 1. BUSY CARD (Large 358×208) ──
              if (derived.status === 'busy') {
                const serviceInfo = derived.ongoingService || {
                  title: 'Hair wash',
                  photo: require('../../../assets/images/appointments/hair_cut.jpg'),
                  rating: '3.5',
                  duration: '1hr',
                  price: '₦22,700',
                };

                const handleBusyPress = () => {
                  triggerLightHaptic();
                  safeRouter.push({
                    pathname: '/staff-in-progress/[id]' as any,
                    params: { id: member.id },
                  });
                };

                return (
                  <TouchableOpacity
                    key={member.id}
                    style={styles.busyCard}
                    activeOpacity={0.88}
                    onPress={handleBusyPress}
                  >
                    {/* Header Row: User Tag (326x42) */}
                    <View style={styles.busyHeaderRow}>
                      <View style={styles.busyUserInfo}>
                        <Image source={photo} style={styles.busyAvatar} />
                        <View style={styles.busyUserText}>
                          <Text style={styles.busyUserName} numberOfLines={1}>
                            {member.name}
                          </Text>
                          <Text style={styles.busyUserRole} numberOfLines={1}>
                            {roleText}
                          </Text>
                        </View>
                      </View>

                      {/* Chip 'Busy' (78x28) */}
                      <View style={styles.busyChip}>
                        <SeatSelectorIcon
                          size={20}
                          strokeWidth={1.25}
                          color="rgba(12, 121, 12, 0.96)"
                        />
                        <Text style={styles.busyChipText}>Busy</Text>
                      </View>
                    </View>

                    {/* Line 169 Divider (326x1) */}
                    <View style={styles.busyDivider} />

                    {/* Current Service Row (326x84) */}
                    <View style={styles.busyServiceRow}>
                      <View style={styles.busyBookedItem}>
                        {/* Photo frame 80x80 with shadow & 72x72 inner image */}
                        <View style={styles.busyPhotoFrame}>
                          <Image
                            source={serviceInfo.photo}
                            style={styles.busyServiceImage}
                            resizeMode="cover"
                          />
                        </View>

                        {/* Service details column */}
                        <View style={styles.busyServiceInfo}>
                          <Text style={styles.busyServiceTitle} numberOfLines={1}>
                            {serviceInfo.title}
                          </Text>

                          <View style={styles.busyMetaRow}>
                            {/* Rating */}
                            <View style={styles.busyMetaItem}>
                              <StarGoldIcon size={18} color="rgba(248, 155, 24, 0.96)" />
                              <Text style={styles.busyMetaText}>
                                {serviceInfo.rating}
                              </Text>
                            </View>

                            {/* Duration */}
                            <View style={styles.busyMetaItem}>
                              <Time04Icon size={18} color="rgba(96, 96, 102, 0.96)" />
                              <Text style={styles.busyMetaText}>
                                {serviceInfo.duration}
                              </Text>
                            </View>
                          </View>

                          {/* Price */}
                          <Text style={styles.busyPriceText}>
                            {serviceInfo.price}
                          </Text>
                        </View>
                      </View>

                      {/* Right Arrow Button (40x40) */}
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.busyArrowButton}
                        onPress={handleBusyPress}
                        accessibilityLabel="View staff detail"
                      >
                        <ArrowRight02Icon size={24} color="rgba(0, 8, 20, 0.96)" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              }

              // ── 2. COMPACT CARD (358×116) ──
              const handleCompactPress = () => {
                // Opens existing staff profile (Messages prompt 3)
                safeRouter.push({
                  pathname: '/staff-profile',
                  params: {
                    id: member.id,
                    staffId: member.id,
                    name: member.name,
                    staffName: member.name,
                    role: roleText,
                    staffRole: roleText,
                    status: derived.chipLabel,
                    staffStatus: derived.chipLabel,
                    statusCode: derived.status,
                    hours: hoursText,
                    staffHours: hoursText,
                    experience: `${member.experienceYears || 1} Years`,
                    rating: '4.1',
                  },
                });
              };

              return (
                <TouchableOpacity
                  key={member.id}
                  style={styles.compactCard}
                  activeOpacity={0.88}
                  onPress={handleCompactPress}
                >
                  {/* Photo 80x80 radius 16 */}
                  <Image source={photo} style={styles.compactPhoto} resizeMode="cover" />

                  {/* Information column (width 230, height 84) */}
                  <View style={styles.compactInfoCol}>
                    {/* Name row */}
                    <Text style={styles.compactName} numberOfLines={1}>
                      {member.name}
                    </Text>

                    {/* Field & Time row */}
                    <View style={styles.compactFieldTimeRow}>
                      <Text style={styles.compactRole} numberOfLines={1}>
                        {roleText}
                      </Text>
                      <View style={styles.compactDot} />
                      <Text style={styles.compactHours} numberOfLines={1}>
                        {hoursText}
                      </Text>
                    </View>

                    {/* Tag & Rate row */}
                    <View style={styles.compactTagRateRow}>
                      {/* Status Chip Variants */}
                      {derived.status === 'available' && (
                        <View style={styles.availableChip}>
                          <Briefcase06Icon
                            size={16}
                            color="rgba(12, 121, 12, 0.96)"
                          />
                          <Text style={styles.availableChipText}>
                            Available For work
                          </Text>
                        </View>
                      )}

                      {derived.status === 'on_break' && (
                        <View style={styles.lunchBreakChip}>
                          <FastFoodOutlineIcon
                            size={16}
                            color="rgba(248, 155, 24, 0.96)"
                          />
                          <Text style={styles.lunchBreakChipText}>
                            Lunch Break
                          </Text>
                        </View>
                      )}

                      {derived.status === 'closed' && (
                        <View style={styles.closedChip}>
                          <Home03Icon
                            size={16}
                            color="rgba(96, 96, 102, 0.96)"
                          />
                          <Text style={styles.closedChipText}>
                            Closed
                          </Text>
                        </View>
                      )}

                      {derived.status === 'attending' && (
                        <View style={styles.attendingChip}>
                          <SeatSelectorIcon
                            size={16}
                            strokeWidth={1}
                            color="rgba(12, 121, 12, 0.96)"
                          />
                          <Text style={styles.attendingChipText}>
                            Attending to client
                          </Text>
                        </View>
                      )}

                      {/* Rating (16x16 star + 4.1) */}
                      <View style={styles.compactRatingRow}>
                        <StarGoldIcon size={16} color="rgba(248, 155, 24, 0.96)" />
                        <Text style={styles.compactRatingText}>4.1</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── Native Dock Protection Spacer (enforces safe system bar boundary) ── */}
      <NativeDockSpacer />

      {/* ── Filter Bottom Sheet Modal ── */}
      <StaffStatusFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        activeFilter={activeFilter}
        recentFilter={recentFilter}
        onApplyFilter={handleApplyFilter}
        onClearFilter={handleClearFilter}
        onRemoveRecentFilter={handleRemoveRecentFilter}
      />
    </SafeAreaView>
  );
}

// ── 1:1 Converted Figma Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* ── Header (64px high, border-bottom 1px) ── */
  header: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  headerContent: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  headerSpacer: {
    width: 48,
    height: 48,
    opacity: 0,
  },

  /* ── Main Scroll View ── */
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },

  /* ── Search & Filter Row (358x48) ── */
  searchRow: {
    width: 358,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchField: {
    width: 288,
    height: 48,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  searchPlaceholder: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
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
  },
  filterBadge: {
    position: 'absolute',
    width: 20,
    height: 20,
    left: 35,
    top: -2,
    backgroundColor: 'rgba(204, 41, 41, 0.9)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  filterBadgeText: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  /* ── Summary Line (height 20, top: 220 in Figma) ── */
  summaryLineContainer: {
    width: 358,
    height: 20,
    marginTop: 40,
    justifyContent: 'center',
  },
  summaryText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  summaryTextFiltered: {
    color: '#000000',
  },

  /* ── Empty State ('no job state') ── */
  emptyContainer: {
    width: 358,
    alignItems: 'center',
    marginTop: 42,
  },
  emptyIllustrationWrapper: {
    width: 130,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIllustration: {
    width: 130,
    height: 130,
  },
  emptyTextBlock: {
    width: 338,
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
  },
  emptyTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    textAlign: 'center',
    includeFontPadding: false,
  },
  emptySubtitle: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  addStaffButton: {
    width: 319,
    height: 48,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 34,
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  addStaffButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
  },

  /* ── Cards List (40px gap between cards) ── */
  cardsList: {
    width: 358,
    marginTop: 40,
    gap: 40,
  },

  /* ── Busy Card (358x208) ── */
  busyCard: {
    width: 358,
    height: 208,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
  },
  busyHeaderRow: {
    width: 326,
    height: 42,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  busyUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  busyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
  },
  busyUserText: {
    gap: 2,
    width: 200,
  },
  busyUserName: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  busyUserRole: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  busyChip: {
    width: 78,
    height: 28,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  busyChipText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(12, 121, 12, 0.96)',
  },
  busyDivider: {
    width: 326,
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  busyServiceRow: {
    width: 326,
    height: 84,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  busyBookedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  busyPhotoFrame: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.16)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 3,
  },
  busyServiceImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  busyServiceInfo: {
    height: 84,
    justifyContent: 'center',
    gap: 8,
  },
  busyServiceTitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  busyMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    height: 20,
  },
  busyMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  busyMetaText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  busyPriceText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  busyArrowButton: {
    width: 40,
    height: 40,
    borderRadius: 24,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Compact Card (358x116) ── */
  compactCard: {
    width: 358,
    height: 116,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  compactPhoto: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  compactInfoCol: {
    flex: 1,
    height: 84,
    justifyContent: 'center',
    gap: 8,
  },
  compactName: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  compactFieldTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 20,
  },
  compactRole: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  compactDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },
  compactHours: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  compactTagRateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 24,
  },

  /* Chip: Available For work (width 150, height 24) */
  availableChip: {
    width: 150,
    height: 24,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  availableChipText: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(12, 121, 12, 0.96)',
  },

  /* Chip: Lunch Break (width 115, height 24) */
  lunchBreakChip: {
    width: 115,
    height: 24,
    backgroundColor: 'rgba(246, 240, 230, 0.96)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lunchBreakChipText: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(248, 155, 24, 0.96)',
  },

  /* Chip: Closed (width 82, height 24) */
  closedChip: {
    width: 82,
    height: 24,
    backgroundColor: 'rgba(229, 229, 229, 0.8)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  closedChipText: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  /* Chip: Attending to client (width 152, height 24) */
  attendingChip: {
    width: 152,
    height: 24,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attendingChipText: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(12, 121, 12, 0.96)',
  },

  /* Rating */
  compactRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 20,
  },
  compactRatingText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },
});

export default ProviderStaffOnDutyScreen;
