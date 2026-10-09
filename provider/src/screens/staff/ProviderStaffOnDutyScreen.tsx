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
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import {
  ProviderStaffFilterModal,
  StaffStatusFilter,
} from '../../components/ProviderStaffFilterModal';

// ── Typography Mandate (AGENTS.md) ──────────────────────────────────────────
const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BOLD = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_700Bold';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

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

function ArrowRight02Icon({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) {
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

function FilterFunnelIcon({ size = 20, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) {
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
function SeatSelectorIcon({ size = 20, color = 'rgba(12, 121, 12, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M6.5 8V4.5C6.5 3.12 7.62 2 9 2h2c1.38 0 2.5 1.12 2.5 2.5V8"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      <Path
        d="M4 8.5v3a1 1 0 001 1h1.5"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 8.5v3a1 1 0 01-1 1h-1.5"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6 12.5h8"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      <Path
        d="M10 12.5V17"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      <Path
        d="M6.5 17h7"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
      />
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

function Time04Icon({ size = 18, color = 'rgba(96, 96, 102, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Circle cx="9" cy="9" r="7.5" stroke={color} strokeWidth={1.2} />
      <Path d="M9 5.25v3.75l2.25 1.5" stroke={color} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function FastFoodOutlineIcon({ size = 16, color = '#F89B18' }: { size?: number; color?: string }) {
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

function Home03Icon({ size = 16, color = 'rgba(96, 96, 102, 0.96)' }: { size?: number; color?: string }) {
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

/**
 * 1:1 Figma Rectangle 283: Specialist Empty State Illustration (150x150)
 * Stacked translucent identification cards with specialist silhouette
 */
function StaffEmptyIllustration({ size = 150 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 150 150" fill="none">
      {/* Background circular halo */}
      <Circle cx="75" cy="75" r="54" fill="#F0F2F5" opacity={0.7} />

      {/* Layer 1: Left back tilted card */}
      <Rect
        x="36"
        y="38"
        width="66"
        height="82"
        rx="16"
        fill="#E5E8EC"
        opacity={0.85}
        transform="rotate(-12 70 79)"
      />

      {/* Layer 2: Main center specialist badge card */}
      <Rect
        x="45"
        y="35"
        width="60"
        height="78"
        rx="16"
        fill="#D5D9DF"
      />

      {/* User profile silhouette */}
      {/* Head */}
      <Circle cx="75" cy="63" r="13" fill="#FFFFFF" />

      {/* Torso / Shoulders */}
      <Path
        d="M58 97c0-7.73 6.27-14 14-14h6c7.73 0 14 6.27 14 14v4H58v-4z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

// ── Types & Initial Data ────────────────────────────────────────────────────

interface StaffDutyItem {
  id: string;
  name: string;
  role: string;
  status: string;
  statusCode: StaffStatusFilter;
  hours?: string;
  avatar: any;
  service: {
    title: string;
    rating: string;
    duration: string;
    price: string;
    image: any;
  };
}

const INITIAL_STAFF_MEMBERS: StaffDutyItem[] = [
  {
    id: 'staff-1',
    name: 'Ibrahim Musa',
    role: 'Barber',
    status: 'Attending to client',
    statusCode: 'attending',
    avatar: require('../../../assets/images/profile/1007604716.jpg'),
    service: {
      title: 'Hair wash',
      rating: '2.5',
      duration: '1hr',
      price: '₦22,700',
      image: require('../../../assets/images/appointments/hair_cut.jpg'),
    },
  },
  {
    id: 'staff-2',
    name: 'Ayobami Isaac',
    role: 'Barber',
    status: 'Attending to client',
    statusCode: 'attending',
    avatar: require('../../../assets/images/profile/1007643877.jpg'),
    service: {
      title: 'Hair wash',
      rating: '3.5',
      duration: '1hr',
      price: '₦22,700',
      image: require('../../../assets/images/appointments/hair_cut.jpg'),
    },
  },
  {
    id: 'staff-3',
    name: 'Godwill Thomas',
    role: 'Nail Artist',
    hours: '8am - 10pm',
    status: 'Available for work',
    statusCode: 'available',
    avatar: require('../../../assets/images/profile/1007604717.jpg'),
    service: {
      title: 'Crystal Nail Art',
      rating: '4.1',
      duration: '45min',
      price: '₦18,500',
      image: require('../../../assets/images/appointments/nail_art.png'),
    },
  },
  {
    id: 'staff-4',
    name: 'Gavin Nwosi',
    role: 'Nail Artist',
    hours: '8am - 10pm',
    status: 'Lunch Break',
    statusCode: 'on_break',
    avatar: require('../../../assets/images/profile/gavin_nwosis_avatar.png'),
    service: {
      title: 'Nail Repair',
      rating: '4.1',
      duration: '24min',
      price: '₦15,000',
      image: require('../../../assets/images/appointments/nail_art.png'),
    },
  },
  {
    id: 'staff-5',
    name: 'Emmanuel Kalu',
    role: 'Nail Artist',
    hours: '8am - 10pm',
    status: 'Closed',
    statusCode: 'closed',
    avatar: require('../../../assets/images/profile/1007618600.jpg'),
    service: {
      title: 'Pedicure Care',
      rating: '4.1',
      duration: '30min',
      price: '₦12,000',
      image: require('../../../assets/images/appointments/nail_art.png'),
    },
  },
];

import {
  useStaffStore,
  StaffMember,
  StaffStatusCode,
} from '../../store/staffStore';

export function ProviderStaffOnDutyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<StaffStatusFilter[]>([]);
  const [recentFilters, setRecentFilters] = useState<StaffStatusFilter[]>([]);

  useEffect(() => {
    if (selectedFilters.length > 0) {
      setRecentFilters((prev) => Array.from(new Set([...selectedFilters, ...prev])));
    }
  }, [selectedFilters]);
  const { staffList, addStaffMember } = useStaffStore();

  const filteredStaff = useMemo(() => {
    let result = staffList;
    if (selectedFilters.length > 0) {
      result = result.filter((s) => selectedFilters.includes(s.statusCode));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.role.toLowerCase().includes(q) ||
          s.service.title.toLowerCase().includes(q)
      );
    }
    return result;
  }, [staffList, searchQuery, selectedFilters]);

  const handleAddStaffPress = () => {
    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: 'Blessing Udoh',
      role: 'Hair Stylist',
      status: 'Attending to client',
      statusCode: 'attending',
      hours: '8am - 10pm',
      avatar: require('../../../assets/images/profile/1007655253.jpg'),
      client: {
        name: 'Jessica Amadi',
        badge: 'New Client',
        avatar: require('../../../assets/images/appointments/jude_fabulous.png'),
        gender: 'Female',
        badgeStatus: 'Non',
        membership: '1 Day ago',
      },
      service: {
        title: 'Full Hair Grooming',
        rating: '5.0',
        duration: '1hr 30min',
        price: '₦30,000',
        image: require('../../../assets/images/appointments/hair_cut.jpg'),
      },
      appointmentInfo: {
        date: 'Today',
        time: '11:30am',
        type: 'In-Shop Service',
      },
      addOn: {
        title: 'Hair Treatment',
        price: '₦10,000',
        duration: '30min',
        rating: '5.0',
        image: require('../../../assets/images/appointments/nail_art.png'),
      },
      note: {
        text: '',
        count: '0/120',
      },
      package: {
        price: '₦5,500',
        images: [
          require('../../../assets/images/packages/shampoo_wash.png'),
          require('../../../assets/images/packages/facial_sheet_mask.png'),
        ],
        items: ['Full Grooming', 'Scalp Wash', 'Conditioning'],
      },
      summary: {
        appointmentCost: '₦40,000',
        trendPoints: '-₦2,000',
        paymentType: 'Opay (Transfer)',
        total: '₦38,000',
      },
    };
    addStaffMember(newStaff);
    setSelectedFilters([]);
    setSearchQuery('');
  };

  const isNoJobState = filteredStaff.length === 0;

  const getCountLabel = () => {
    if (isNoJobState) {
      return '3 Available staff';
    }
    if (selectedFilters.length === 1) {
      const f = selectedFilters[0];
      if (f === 'available') return `${filteredStaff.length} Available staff`;
      if (f === 'on_break') return `${filteredStaff.length} Staff on break`;
      if (f === 'closed') return `${filteredStaff.length} Closed staff`;
      if (f === 'attending') return `${filteredStaff.length} In-service staff`;
    }
    return `${filteredStaff.length} Staff on duty`;
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Fixed Page Header (64px) ── */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          {/* Back button 48x48 */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.headerIconButton}
            onPress={() => router.back()}
          >
            <ArrowLeft02Icon size={24} color="rgba(0, 8, 20, 0.96)" />
          </TouchableOpacity>

          {/* Centered Top Header: My Staffs */}
          <Text style={styles.headerTitleText}>My Staffs</Text>

          {/* Dummy Right Spacer (48x48, opacity 0) */}
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
        {/* ── Search & Filter Bar (358x48px, top: 132px in Figma) ── */}
        <View style={styles.searchRow}>
          {/* Search Input Bar (288x48px) */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.searchInputContainer}
            onPress={() => router.push('/staff-search')}
          >
            <SearchIcon size={24} color="#000000" />
            <Text style={styles.searchPlaceholderText}>
              {searchQuery.trim() ? searchQuery : 'Search here..'}
            </Text>
          </TouchableOpacity>

          {/* Filter Button (48x48px) */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.filterButton}
            onPress={() => setIsFilterModalOpen(true)}
          >
            <FilterFunnelIcon
              size={20}
              color="rgba(0, 8, 20, 0.96)"
            />
            {selectedFilters.length > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{selectedFilters.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Staff Subheader Label (top: 196px / 220px in Figma) ── */}
        <View style={styles.countLabelContainer}>
          <Text style={isNoJobState ? styles.countLabelTextBold : styles.countLabelText}>
            {getCountLabel()}
          </Text>
        </View>

        {/* ── State Switcher: No Job State vs Populated Staff Cards ── */}
        {isNoJobState ? (
          /* ── 1:1 Figma No Job State ── */
          <View style={styles.noJobStateContainer}>
            {/* Rectangle 283: Specialist Empty Graphic (150x150, top: 332px) */}
            <View style={styles.emptyGraphicContainer}>
              <StaffEmptyIllustration size={150} />
            </View>

            {/* Frame 1000006541: Title & Description (338x92px, top: 490px) */}
            <View style={styles.specialistTextContainer}>
              <Text style={styles.specialistTitleText}>Specialist</Text>
              <Text style={styles.specialistSubtitleText}>
                Add staff members who will provide your services to clients.
              </Text>
            </View>

            {/* Filled action Button: Add staff (319x48px, top: 630px) */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.addStaffButton}
              onPress={handleAddStaffPress}
            >
              <Text style={styles.addStaffButtonText}>Add staff</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ── Populated Staff Duty Cards List (358x208px, 44px gap) ── */
          <View style={styles.staffCardsList}>
            {filteredStaff.map((staff) => {
              const handleStaffPress = () => {
                if (staff.statusCode === 'attending') {
                  router.push({
                    pathname: '/staff/[id]',
                    params: {
                      id: staff.id,
                      name: staff.name,
                      role: staff.role,
                      status: staff.status,
                      statusCode: staff.statusCode,
                      hours: staff.hours || '8am - 10pm',
                      gender: staff.gender || 'Male',
                      badge: staff.badge || staff.role,
                      experience: staff.experience || '2 Years',
                      serviceTitle: staff.service.title,
                      servicePrice: staff.service.price,
                      serviceDuration: staff.service.duration,
                      serviceRating: staff.service.rating,
                      clientName: staff.client.name,
                      clientBadge: staff.client.badge,
                      clientGender: staff.client.gender,
                      clientMembership: staff.client.membership,
                      appointmentDate: staff.appointmentInfo.date,
                      appointmentTime: staff.appointmentInfo.time,
                      appointmentType: staff.appointmentInfo.type,
                      addOnTitle: staff.addOn.title,
                      addOnPrice: staff.addOn.price,
                      totalCost: staff.summary.total,
                    },
                  });
                } else {
                  // Staff not attending to client: route to staff profile with status clearly showing
                  router.push({
                    pathname: '/staff-profile',
                    params: {
                      id: staff.id,
                      name: staff.name,
                      staffName: staff.name,
                      role: staff.role,
                      staffRole: staff.role,
                      status: staff.status,
                      staffStatus: staff.status,
                      statusCode: staff.statusCode,
                      hours: staff.hours || '8am - 10pm',
                      staffHours: staff.hours || '8am - 10pm',
                      gender: staff.gender || 'Male',
                      badge: staff.badge || staff.role,
                      experience: staff.experience || '2 Years',
                      rating: staff.service.rating || '4.1',
                    },
                  });
                }
              };

              // ── 1:1 Figma Compact Status Card for Available, On Break & Closed ──
              if (
                staff.statusCode === 'available' ||
                staff.statusCode === 'on_break' ||
                staff.statusCode === 'closed'
              ) {
                return (
                  <TouchableOpacity
                    key={staff.id}
                    style={styles.compactStaffCard}
                    activeOpacity={0.88}
                    onPress={handleStaffPress}
                  >
                    <View style={styles.compactLeftGroup}>
                      <Image source={staff.avatar} style={styles.compactAvatar} />
                      <View style={styles.compactInfoCol}>
                        <Text style={styles.compactNameText} numberOfLines={1}>
                          {staff.name}
                        </Text>
                        <Text style={styles.compactHoursText} numberOfLines={1}>
                          {staff.role} • {staff.hours || '8am - 10pm'}
                        </Text>

                        {staff.statusCode === 'available' && (
                          <View style={styles.availableBadge}>
                            <SeatSelectorIcon size={14} color="rgba(12, 121, 12, 0.96)" />
                            <Text style={styles.availableBadgeText}>Available for work</Text>
                          </View>
                        )}

                        {staff.statusCode === 'on_break' && (
                          <View style={styles.breakBadge}>
                            <FastFoodOutlineIcon size={14} color="#F89B18" />
                            <Text style={styles.breakBadgeText}>Lunch Break</Text>
                          </View>
                        )}

                        {staff.statusCode === 'closed' && (
                          <View style={styles.closedBadge}>
                            <Home03Icon size={14} color="rgba(96, 96, 102, 0.96)" />
                            <Text style={styles.closedBadgeText}>Closed</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.compactRatingRow}>
                      <StarGoldIcon size={16} color="rgba(248, 155, 24, 0.96)" />
                      <Text style={styles.compactRatingText}>{staff.service.rating || '4.1'}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }

              // ── 1:1 Figma Detailed In-Service / Ongoing Card ──
              return (
                <TouchableOpacity
                  key={staff.id}
                  style={styles.staffCard}
                  activeOpacity={0.88}
                  onPress={handleStaffPress}
                >
                  {/* ── User Tag (326x42px) ── */}
                  <View style={styles.userTagRow}>
                    {/* Left: Avatar + Name + Role */}
                    <View style={styles.userInfoGroup}>
                      <Image source={staff.avatar} style={styles.userAvatar} />
                      <View style={styles.userNameColumn}>
                        <Text style={styles.userNameText} numberOfLines={1}>
                          {staff.name}
                        </Text>
                        <Text style={styles.userRoleText} numberOfLines={1}>
                          {staff.role}
                        </Text>
                      </View>
                    </View>

                    {/* Right: Attending to client Status Tag */}
                    <View style={styles.statusTag}>
                      <SeatSelectorIcon size={20} color="rgba(12, 121, 12, 0.96)" />
                      <Text style={styles.statusTagText}>
                        {staff.status}
                      </Text>
                    </View>
                  </View>

                  {/* ── Line 169 Divider (326x1px) ── */}
                  <View style={styles.cardDivider} />

                  {/* ── Service with Next Button (326x84px) ── */}
                  <View style={styles.serviceRow}>
                    {/* Left: Booked Item */}
                    <View style={styles.bookedItemGroup}>
                      {/* Image Placeholder (80x80px with shadow) */}
                      <View style={styles.imagePlaceholder}>
                        <Image
                          source={staff.service.image}
                          style={styles.serviceThumbnail}
                          resizeMode="cover"
                        />
                      </View>

                      {/* Booked Information (84px high) */}
                      <View style={styles.bookedInfoColumn}>
                        <Text style={styles.serviceTitleText} numberOfLines={1}>
                          {staff.service.title}
                        </Text>

                        {/* Duration & Rating Row */}
                        <View style={styles.metaRow}>
                          {/* Rating */}
                          <View style={styles.metaSubGroup}>
                            <StarGoldIcon size={18} color="rgba(248, 155, 24, 0.96)" />
                            <Text style={styles.metaText}>{staff.service.rating}</Text>
                          </View>

                          {/* Duration */}
                          <View style={styles.metaSubGroup}>
                            <Time04Icon size={18} color="rgba(96, 96, 102, 0.96)" />
                            <Text style={styles.metaText}>{staff.service.duration}</Text>
                          </View>
                        </View>

                        {/* Price (16px Med 510) */}
                        <Text style={styles.priceText}>{staff.service.price}</Text>
                      </View>
                    </View>

                    {/* Right: Next / Forward Button (40x40px) */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.nextButton}
                      onPress={handleStaffPress}
                    >
                      <ArrowRight02Icon size={24} color="rgba(0, 8, 20, 0.96)" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── Filter Bottom Sheet Modal (1:1 Figma) ── */}
      <ProviderStaffFilterModal
        visible={isFilterModalOpen}
        selectedFilters={selectedFilters}
        recentFilters={recentFilters}
        onRemoveRecentFilter={(filter) => {
          setRecentFilters((prev) => prev.filter((f) => f !== filter));
          setSelectedFilters((prev) => prev.filter((f) => f !== filter));
        }}
        staffList={staffList}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(filters) => {
          const applied = Array.isArray(filters) ? filters : (filters === 'all' ? [] : [filters]);
          setSelectedFilters(applied);
          if (applied.length > 0) {
            setRecentFilters((prev) => Array.from(new Set([...applied, ...prev])));
          }
          setIsFilterModalOpen(false);
        }}
        onClear={() => {
          setSelectedFilters([]);
          setIsFilterModalOpen(false);
        }}
      />

      {/* ── Android Native System Dock Barrier ── */}
      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </SafeAreaView>
  );
}

export default ProviderStaffOnDutyScreen;

// ── 1:1 Converter Output Stylesheet ─────────────────────────────────────────

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* ── Page Header (64px height, top: 44px) ── */
  headerContainer: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  headerContent: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerIconButton: {
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
  },
  headerSpacer: {
    width: 48,
    height: 48,
    opacity: 0,
  },

  /* ── Scroll View ── */
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },

  /* ── Search & Filter Row (358x48px, top: 132px) ── */
  searchRow: {
    width: 358,
    height: 48,
    alignSelf: 'center',
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchInputContainer: {
    width: 288,
    height: 48,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: '#000000',
    paddingVertical: 0,
  },
  searchPlaceholderText: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
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
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#CC2929',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    zIndex: 2,
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

  /* ── Staff Subheader Label (14px, top: 196px / 220px) ── */
  countLabelContainer: {
    width: 358,
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  countLabelText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  countLabelTextBold: {
    fontFamily: FONT_BOLD,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  /* ── Populated Staff Cards List ── */
  staffCardsList: {
    width: 358,
    alignSelf: 'center',
    gap: 44, // 1:1 Figma spacing: 520px - (268px + 208px) = 44px
  },

  /* ── 1:1 Figma Compact Status Card for Available, On Break & Closed ── */
  compactStaffCard: {
    width: 358,
    minHeight: 88,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  compactAvatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
  },
  compactInfoCol: {
    flex: 1,
    gap: 4,
  },
  compactNameText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 22,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  compactHoursText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  availableBadgeText: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(12, 121, 12, 0.96)',
  },
  breakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 246, 235, 0.96)',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  breakBadgeText: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    color: '#F89B18',
  },
  closedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(240, 241, 245, 0.96)',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  closedBadgeText: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  compactRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactRatingText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  /* ── Staff Card (358x208px) ── */
  staffCard: {
    width: 358,
    height: 208,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 24,
  },

  /* ── User Tag Row (326x42px) ── */
  userTagRow: {
    width: 326,
    height: 42,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
  },
  userNameColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    maxWidth: 110,
  },
  userNameText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  userRoleText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  /* ── Attending to client Status Tag ── */
  statusTag: {
    height: 28,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statusTagText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(12, 121, 12, 0.96)',
    textAlign: 'center',
  },

  /* ── Line 169 Divider (326x1px) ── */
  cardDivider: {
    width: 326,
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },

  /* ── Service Row (326x84px) ── */
  serviceRow: {
    width: 326,
    height: 84,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookedItemGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
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
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  serviceThumbnail: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  bookedInfoColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
  },
  serviceTitleText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    height: 20,
  },
  metaSubGroup: {
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
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  nextButton: {
    width: 40,
    height: 40,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── 1:1 Figma No Job State (390x844px) ── */
  noJobStateContainer: {
    width: '100%',
    alignItems: 'center',
  },
  emptyGraphicContainer: {
    width: 150,
    height: 150,
    marginTop: 48, // Coordinates matching top: 332px
    justifyContent: 'center',
    alignItems: 'center',
  },
  specialistTextContainer: {
    width: 338,
    marginTop: 28, // Coordinates matching top: 490px
    alignItems: 'center',
    gap: 16,
  },
  specialistTitleText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
  },
  specialistSubtitleText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  addStaffButton: {
    width: 319,
    height: 48,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    marginTop: 48, // Coordinates matching top: 630px
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  addStaffButtonText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },
});
