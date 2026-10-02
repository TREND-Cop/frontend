import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { OngoingServiceIndicator } from '../../components/OngoingServiceIndicator';

// ── Master Typography Constants ──────────────────────────────────────────────
const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

// ── 1:1 Vector Icons from Figma Specs ────────────────────────────────────────

function ArrowLeft02Icon({ size = 24, color = '#000814' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 6L5 12M5 12L11 18M5 12H19"
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
        d="M12 3V15M12 3L16 7M12 3L8 7"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 11V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V11"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Time04Icon({ size = 18, color = '#606066' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Circle cx="9" cy="9" r="7.5" stroke={color} strokeWidth="1.2" />
      <Path d="M9 5.25V9L11.5 10.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function StarGoldIcon({ size = 16, color = '#F89B18' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 2.2L9.85 5.95L14 6.55L11 9.47L11.71 13.6L8 11.65L4.29 13.6L5 9.47L2 6.55L6.15 5.95L8 2.2Z"
        fill={color}
      />
    </Svg>
  );
}

function AddMaleIcon({ size = 20, color = 'rgba(10, 95, 10, 0.8)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M11.75 13.8337V12.2189C13.234 11.0574 14.25 9.667 14.25 6.681C14.25 4.748 13.898 3 11.782 3C11.782 3 11.036 2.167 9.244 2.167C6.713 2.167 5.084 3.6895 5.084 6.681C5.084 9.667 6.1 11.0575 7.584 12.2189V13.8337L4.487 14.7652C3.331 15.119 2.472 16.0465 2.187 17.1754C2.074 17.6217 2.46 18 2.922 18H11.412"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.917 18.8333V13M13 15.9167H18.833"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function VenusAndMarsIcon({ size = 20, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M11.25 9.166C11.25 11.007 9.757 12.5 7.916 12.5C6.075 12.5 4.583 11.007 4.583 9.166C4.583 7.325 6.075 5.833 7.916 5.833C9.757 5.833 11.25 7.325 11.25 9.166Z"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.417 6.666L15 2.083"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      <Path
        d="M7.916 12.5V18.333M5.833 16.25H9.999"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.667 1.874C11.667 1.874 14.743 1.408 15.21 1.874C15.676 2.341 15.21 5.417 15.21 5.417"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckmarkBadge02Icon({ size = 20, color = '#1A82FF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M13.707 16.22C14.366 16.22 15.307 16.348 15.826 15.834C16.349 15.315 16.22 14.371 16.22 13.707C16.22 12.868 16.403 12.482 17.001 11.885C17.889 10.997 18.334 10.552 18.334 10C18.334 9.448 17.889 9.004 17.001 8.115C16.404 7.518 16.22 7.132 16.22 6.294C16.22 5.63 16.349 4.686 15.826 4.167C15.307 3.652 14.366 3.781 13.707 3.781C12.947 3.781 12.418 3.533 11.885 3C10.997 2.111 10.552 1.667 10 1.667C9.448 1.667 9.004 2.111 8.116 3L8.115 3C7.582 3.533 7.054 3.781 6.294 3.781C5.63 3.781 4.686 3.652 4.167 4.175C3.652 4.694 3.781 5.634 3.781 6.294C3.781 7.054 3.533 7.582 3 8.115L3 8.116C2.111 9.004 1.667 9.448 1.667 10C1.667 10.552 2.111 10.997 3 11.885C3.597 12.482 3.781 12.868 3.781 13.707C3.781 14.371 3.652 15.315 4.175 15.834C4.694 16.348 5.634 16.22 6.294 16.22C7.103 16.22 7.493 16.378 8.071 16.956C8.563 17.448 9.222 18.334 10 18.334C10.778 18.334 11.438 17.448 11.93 16.956C12.508 16.378 12.897 16.22 13.707 16.22Z"
        fill={color}
        fillOpacity={0.9}
        stroke={color}
        strokeOpacity={0.9}
        strokeWidth={1.25}
      />
      <Path
        d="M7.5 10.744L9 12.084L12.5 7.917"
        stroke="#FFFFFF"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function User03Icon({ size = 20, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M16.666 17.5C16.666 15.611 16.666 14.666 16.327 13.925C15.97 13.146 15.357 12.512 14.589 12.13C13.858 11.767 12.916 11.667 11.022 11.671L8.977 11.667C7.083 11.667 6.162 11.756 5.441 12.107C4.648 12.492 4.022 13.138 3.661 13.941C3.333 14.672 3.333 15.615 3.333 17.5"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.334 5.833C13.334 7.674 11.841 9.167 10 9.167C8.159 9.167 6.667 7.674 6.667 5.833C6.667 3.992 8.159 2.5 10 2.5C11.841 2.5 13.334 3.992 13.334 5.833Z"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Calendar03Icon({ size = 24, color = '#000814' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="17" rx="3" stroke={color} strokeWidth="1.5" />
      <Path d="M3 9.5H21" stroke={color} strokeWidth="1.5" />
      <Path d="M8 2V5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M16 2V5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="8" cy="14" r="1" fill={color} />
      <Circle cx="12" cy="14" r="1" fill={color} />
      <Circle cx="16" cy="14" r="1" fill={color} />
    </Svg>
  );
}

function Clock3Icon({ size = 24, color = '#000814' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
      <Path d="M12 7V12H15.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function Home11Icon({ size = 24, color = '#000814' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 9.5L12.88 2.82C12.38 2.41 11.62 2.41 11.12 2.82L3 9.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M19.5 7V19C19.5 20.1 18.6 21 17.5 21H6.5C5.4 21 4.5 20.1 4.5 19V7"
        stroke={color}
        strokeWidth="1.5"
      />
    </Svg>
  );
}

function AddCircleIcon({ size = 20, color = '#1A82FF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="8.33" stroke={color} strokeWidth="1.5" />
      <Path d="M10 6.67V13.33M6.67 10H13.33" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function CheckmarkCircle02Icon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="9" fill="#000814" />
      <Path d="M6.5 10L9 12.5L13.5 7.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function OpayIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="7.5" stroke="#11A866" strokeWidth="2.5" />
      <Path
        d="M10 2.5A7.5 7.5 0 0 1 17.5 10"
        stroke="#00BA92"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ── Default Mock / Figma Data ────────────────────────────────────────────────

const DEFAULT_STAFF_DETAIL = {
  staffName: 'Ayobami Isaac',
  client: {
    name: 'Jude Fabulous',
    badge: 'New Client',
    avatar: require('../../../assets/images/appointments/jude_fabulous.png'),
    gender: 'Male',
    badgeStatus: 'Non',
    membership: '5 Days ago',
  },
  service: {
    title: 'Men Brade',
    price: '₦14,200',
    duration: '1hr',
    rating: '3.6',
    image: require('../../../assets/images/appointments/men_braids.jpg'),
    specialist: {
      name: 'Bisola Olarewaju',
      role: 'Nail Artist',
      rating: '5.1',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    },
  },
  appointmentInfo: {
    date: 'Nov 19, 2026',
    time: '9:30am',
    type: 'Home Service',
  },
  addOn: {
    title: 'Nail Repair',
    price: '₦22,700',
    duration: '24min',
    rating: '5.1',
    image: require('../../../assets/images/appointments/nail_art.png'),
    specialist: {
      name: 'Bisola Olarewaju',
      role: 'Nail Artist',
      duration: '24min',
      rating: '5.1',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    },
  },
  note: {
    text: 'i would love for you to go gentle on my scalp',
    count: '1/120',
  },
  package: {
    price: '₦4,500',
    images: [
      require('../../../assets/images/packages/shampoo_wash.png'),
      require('../../../assets/images/packages/men_manicure.png'),
      require('../../../assets/images/packages/facial_sheet_mask.png'),
    ],
    items: ['Hair Washing', 'Conditioning & Wash', 'Manicure'],
  },
  summary: {
    appointmentCost: '₦52,700',
    trendPoints: '-₦2,700',
    paymentType: 'Opay (Transfer)',
    total: '₦50,000',
  },
};

// ── Screen Component ─────────────────────────────────────────────────────────

export function ProviderStaffDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    role?: string;
    serviceTitle?: string;
    servicePrice?: string;
    serviceDuration?: string;
    serviceRating?: string;
  }>();

  const headerTitle = params.name || DEFAULT_STAFF_DETAIL.staffName;
  const serviceName = params.serviceTitle || DEFAULT_STAFF_DETAIL.service.title;
  const servicePrice = params.servicePrice || DEFAULT_STAFF_DETAIL.service.price;
  const serviceDuration = params.serviceDuration || DEFAULT_STAFF_DETAIL.service.duration;
  const serviceRating = params.serviceRating || DEFAULT_STAFF_DETAIL.service.rating;

  const [noteText, setNoteText] = useState(DEFAULT_STAFF_DETAIL.note.text);
  const noteInputRef = useRef<TextInput>(null);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* ── Fixed Page Header (64px, 1:1 Figma) ──────────────────────────────── */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          {/* Back button (48x48) */}
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <ArrowLeft02Icon />
          </TouchableOpacity>

          {/* Centered Staff Name */}
          <Text style={styles.headerTitle} numberOfLines={1}>
            {headerTitle}
          </Text>

          {/* Share button placeholder (48x48, opacity: 0 in Figma) */}
          <View style={styles.headerSharePlaceholder}>
            <Share03Icon />
          </View>
        </View>
      </View>

      {/* ── Scrollable Body (358px wide content, 1:1 Figma spacing) ─────────── */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero: Ongoing Service Indicator (358x86px, top: 131px in Figma) ─── */}
        <View style={styles.indicatorWrapper}>
          <OngoingServiceIndicator
            initialTime="1:25:30"
            title="Ongoing Appointment"
            subtitle="This appointment is currently in progress"
          />
        </View>

        {/* ── User Profile Card (358x224px, 1:1 Figma gradient & border) ──────── */}
        <LinearGradient
          colors={['rgba(203, 230, 164, 0.9216)', 'rgba(255, 255, 255, 0.96)']}
          locations={[0, 0.82]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.profileCard}
        >
          {/* Top user details (326x64px, gap: 24px) */}
          <View style={styles.profileTopRow}>
            {/* Image frame (64x64px, radius 56px, border 1px solid #FFFFFF) */}
            <View style={styles.avatarContainer}>
              <Image
                source={DEFAULT_STAFF_DETAIL.client.avatar}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>

            {/* Staff name and profession (238x60px, gap: 8px) */}
            <View style={styles.profileInfoCol}>
              <Text style={styles.clientNameText}>
                {DEFAULT_STAFF_DETAIL.client.name}
              </Text>
              <View style={styles.newClientBadge}>
                <AddMaleIcon size={20} color="rgba(10, 95, 10, 0.8)" />
                <Text style={styles.newClientBadgeText}>
                  {DEFAULT_STAFF_DETAIL.client.badge}
                </Text>
              </View>
            </View>
          </View>

          {/* Activities (326x104px, 3 stat columns, gap: 5px) */}
          <View style={styles.activitiesRow}>
            {/* Col 1: Gender (sign up duration: 80x104px, padding: 8px 10px, gap: 8px) */}
            <View style={styles.activityColumnCol1}>
              <View style={styles.activityIconCircle}>
                <VenusAndMarsIcon size={20} color="#141B34" />
              </View>
              <View style={styles.activityTextGroupCol1}>
                <Text style={styles.activityLabel}>Gender</Text>
                <Text style={styles.activityValueGender}>{DEFAULT_STAFF_DETAIL.client.gender}</Text>
              </View>
            </View>

            {/* Vertical Divider: Line 183 (56px) */}
            <View style={styles.verticalDivider} />

            {/* Col 2: Badge (Total points: 58x104px, padding: 8px 10px, gap: 8px) */}
            <View style={styles.activityColumnCol2}>
              <View style={styles.activityIconCircle}>
                <CheckmarkBadge02Icon size={20} color="rgba(26, 130, 255, 0.9)" />
              </View>
              <View style={styles.activityTextGroupCol2}>
                <Text style={styles.activityLabel}>Badge</Text>
                <Text style={styles.activityValueBadge}>{DEFAULT_STAFF_DETAIL.client.badgeStatus}</Text>
              </View>
            </View>

            {/* Vertical Divider: Line 182 (56px) */}
            <View style={styles.verticalDivider} />

            {/* Col 3: Membership (Total appointments: 97x104px, padding: 8px 10px, gap: 8px) */}
            <View style={styles.activityColumnCol3}>
              <View style={styles.activityIconCircle}>
                <User03Icon size={20} color="#141B34" />
              </View>
              <View style={styles.activityTextGroupCol3}>
                <Text style={styles.activityLabel}>Membership</Text>
                <Text style={styles.activityValueMembership}>{DEFAULT_STAFF_DETAIL.client.membership}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* ── Section: Service ──────────────────────────────────────────────── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Service</Text>

          {/* Single #F7F7F7 Card Container */}
          <View style={styles.cardContainer}>
            {/* Top item: Men Brade */}
            <View style={styles.cardItemRow}>
              <View style={styles.serviceImageFrame}>
                <Image
                  source={DEFAULT_STAFF_DETAIL.service.image}
                  style={styles.cardItemThumb16}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.cardItemInfoCol}>
                <Text style={styles.cardItemTitle}>{serviceName}</Text>
                <Text style={styles.cardItemPrice}>{servicePrice}</Text>
                <View style={styles.cardItemMetaRow}>
                  <View style={styles.metaItem}>
                    <Time04Icon size={18} color="#606066" />
                    <Text style={styles.metaText}>{serviceDuration}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <StarGoldIcon size={16} color="#F89B18" />
                    <Text style={styles.metaText}>{serviceRating}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Subheading: Specialist */}
            <Text style={styles.cardSubHeading}>Specialist</Text>

            {/* Specialist item */}
            <View style={styles.cardItemRow}>
              <Image
                source={{ uri: DEFAULT_STAFF_DETAIL.service.specialist.avatar }}
                style={styles.cardItemThumb24}
                resizeMode="cover"
              />
              <View style={styles.cardItemInfoCol}>
                <Text style={styles.cardItemTitle}>{DEFAULT_STAFF_DETAIL.service.specialist.name}</Text>
                <Text style={styles.cardItemRole}>{DEFAULT_STAFF_DETAIL.service.specialist.role}</Text>
                <View style={styles.cardItemMetaRow}>
                  <View style={styles.metaItem}>
                    <StarGoldIcon size={16} color="#F89B18" />
                    <Text style={styles.metaText}>{DEFAULT_STAFF_DETAIL.service.specialist.rating}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── Section: Appointment Information ───────────────────────────────── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Appointment Information</Text>

          {/* Single #F7F7F7 Card Container */}
          <View style={styles.appointmentInfoCard}>
            {/* Date */}
            <View style={styles.appointmentInfoItem}>
              <Text style={styles.appointmentInfoLabel}>Appointment Date</Text>
              <View style={styles.appointmentInfoRow}>
                <View style={styles.appointmentIconCircle}>
                  <Calendar03Icon size={24} color="#000814" />
                </View>
                <Text style={styles.appointmentInfoValue}>
                  {DEFAULT_STAFF_DETAIL.appointmentInfo.date}
                </Text>
              </View>
            </View>

            {/* Time */}
            <View style={styles.appointmentInfoItem}>
              <Text style={styles.appointmentInfoLabel}>Appointment Time</Text>
              <View style={styles.appointmentInfoRow}>
                <View style={styles.appointmentIconCircle}>
                  <Clock3Icon size={24} color="#000814" />
                </View>
                <Text style={styles.appointmentInfoValue}>
                  {DEFAULT_STAFF_DETAIL.appointmentInfo.time}
                </Text>
              </View>
            </View>

            {/* Type */}
            <View style={styles.appointmentInfoItem}>
              <Text style={styles.appointmentInfoLabel}>Appointment Type</Text>
              <View style={styles.appointmentInfoRow}>
                <View style={styles.appointmentIconCircle}>
                  <Home11Icon size={24} color="#000814" />
                </View>
                <Text style={styles.appointmentInfoValue}>
                  {DEFAULT_STAFF_DETAIL.appointmentInfo.type}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Section: Add-One ──────────────────────────────────────────────── */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Add-One</Text>
            <TouchableOpacity style={styles.addOnHeaderButton} activeOpacity={0.7}>
              <Text style={styles.addOnHeaderButtonText}>Add Ones</Text>
              <AddCircleIcon size={20} color="#1A82FF" />
            </TouchableOpacity>
          </View>

          {/* Single #F7F7F7 Card Container */}
          <View style={styles.cardContainer}>
            {/* Top item: Nail Repair */}
            <View style={styles.cardItemRow}>
              <Image
                source={DEFAULT_STAFF_DETAIL.addOn.image}
                style={styles.cardItemThumb24}
                resizeMode="cover"
              />
              <View style={styles.cardItemInfoCol}>
                <Text style={styles.cardItemTitle}>{DEFAULT_STAFF_DETAIL.addOn.title}</Text>
                <Text style={styles.cardItemPrice}>{DEFAULT_STAFF_DETAIL.addOn.price}</Text>
                <View style={styles.cardItemMetaRow}>
                  <View style={styles.metaItem}>
                    <Time04Icon size={18} color="#606066" />
                    <Text style={styles.metaText}>{DEFAULT_STAFF_DETAIL.addOn.duration}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <StarGoldIcon size={16} color="#F89B18" />
                    <Text style={styles.metaText}>{DEFAULT_STAFF_DETAIL.addOn.rating}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Subheading: Specialist */}
            <Text style={styles.cardSubHeading}>Specialist</Text>

            {/* Specialist item */}
            <View style={styles.cardItemRow}>
              <Image
                source={{ uri: DEFAULT_STAFF_DETAIL.addOn.specialist.avatar }}
                style={styles.cardItemThumb24}
                resizeMode="cover"
              />
              <View style={styles.cardItemInfoCol}>
                <Text style={styles.cardItemTitle}>{DEFAULT_STAFF_DETAIL.addOn.specialist.name}</Text>
                <Text style={styles.cardItemRole}>{DEFAULT_STAFF_DETAIL.addOn.specialist.role}</Text>
                <View style={styles.cardItemMetaRow}>
                  <View style={styles.metaItem}>
                    <Time04Icon size={18} color="#606066" />
                    <Text style={styles.metaText}>{DEFAULT_STAFF_DETAIL.addOn.specialist.duration}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <StarGoldIcon size={16} color="#F89B18" />
                    <Text style={styles.metaText}>{DEFAULT_STAFF_DETAIL.addOn.specialist.rating}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── Section: Note ─────────────────────────────────────────────────── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Note</Text>

          <View style={styles.noteBox}>
            <TextInput
              ref={noteInputRef}
              style={styles.noteTextInput}
              multiline
              maxLength={120}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Enter note here.."
              placeholderTextColor="rgba(96, 96, 102, 0.6)"
            />
            <Text style={styles.noteCharCount}>
              {noteText.length}/120
            </Text>
          </View>
        </View>

        {/* ── Section: Package ──────────────────────────────────────────────── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Package</Text>

          <View style={styles.packageCard}>
            {/* 3 Photos Grid (2x2 layout, 140x140 each, borderRadius 16) */}
            <View style={styles.packageImagesGrid}>
              <View style={styles.packageImageRow}>
                <Image
                  source={DEFAULT_STAFF_DETAIL.package.images[0]}
                  style={styles.packageGridImage}
                  resizeMode="cover"
                />
                <Image
                  source={DEFAULT_STAFF_DETAIL.package.images[1]}
                  style={styles.packageGridImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.packageImageRow}>
                <Image
                  source={DEFAULT_STAFF_DETAIL.package.images[2]}
                  style={styles.packageGridImage}
                  resizeMode="cover"
                />
                <View style={styles.packageGridPlaceholder} />
              </View>
            </View>

            {/* Price Tag */}
            <Text style={styles.packagePriceText}>
              {DEFAULT_STAFF_DETAIL.package.price}
            </Text>

            {/* Package Checklist Items */}
            <View style={styles.packageItemsList}>
              {DEFAULT_STAFF_DETAIL.package.items.map((item, idx) => (
                <View key={idx} style={styles.packageItemRow}>
                  <CheckmarkCircle02Icon size={20} />
                  <Text style={styles.packageItemText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Section: Booking Summary ───────────────────────────────────────── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Summary</Text>

          <View style={styles.summaryContainer}>
            {/* Row 1: Appointment cost */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Appointment cost</Text>
              <Text style={styles.summaryValue}>
                {DEFAULT_STAFF_DETAIL.summary.appointmentCost}
              </Text>
            </View>

            {/* Row 2: Trend points */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Trend points</Text>
              <Text style={styles.summaryPointsValue}>
                {DEFAULT_STAFF_DETAIL.summary.trendPoints}
              </Text>
            </View>

            {/* Row 3: Payment type */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment type</Text>
              <View style={styles.paymentTypeGroup}>
                <OpayIcon size={20} />
                <Text style={styles.paymentTypeText}>
                  {DEFAULT_STAFF_DETAIL.summary.paymentType}
                </Text>
              </View>
            </View>

            {/* Row 4: Total */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>
                {DEFAULT_STAFF_DETAIL.summary.total}
              </Text>
            </View>
          </View>
        </View>

        {/* Extra breathing space at bottom */}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── Native Dock Spacer (Android Navigation Bar Protection) ─────────── */}
      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </View>
  );
}

// ── 1:1 Converted Figma Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header (64px high, top: 44px) ──
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    zIndex: 10,
  },
  headerContent: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  headerSharePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
  },

  // ── Scroll Content ──
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
  },

  // ── Hero Ongoing Indicator ──
  indicatorWrapper: {
    width: 358,
    marginBottom: 24,
  },

  // ── User Profile Card (358x224px, 1:1 Figma) ──
  profileCard: {
    width: 358,
    height: 224,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: '#CBE6A4',
    padding: 16,
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    width: 326,
    height: 64,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 56,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 56,
  },
  profileInfoCol: {
    flex: 1,
    gap: 8,
  },
  clientNameText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  newClientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  newClientBadgeText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(10, 95, 10, 0.8)',
  },

  // ── Activities (3 stat columns, 326x104px) ──
  activitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 326,
    height: 104,
  },
  activityColumnCol1: {
    width: 80,
    height: 104,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 8,
  },
  activityColumnCol2: {
    width: 58,
    height: 104,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  activityColumnCol3: {
    width: 97,
    height: 104,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 8,
  },
  activityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTextGroupCol1: {
    alignItems: 'flex-start',
    gap: 8,
  },
  activityTextGroupCol2: {
    alignItems: 'center',
    gap: 8,
  },
  activityTextGroupCol3: {
    alignItems: 'flex-start',
    gap: 8,
  },
  activityLabel: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  activityValueGender: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: '#000000',
  },
  activityValueBadge: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  activityValueMembership: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  verticalDivider: {
    width: 1,
    height: 56,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },

  // ── Section Container (358px wide, gap: 40px between sections) ──
  sectionBlock: {
    width: 358,
    marginBottom: 40,
    gap: 24,
  },
  sectionHeading: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addOnHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addOnHeaderButtonText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(26, 130, 255, 0.9)',
  },

  // ── Unified Card Container (#F7F7F7, 358px wide, radius: 24px) ──
  cardContainer: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 16,
  },
  cardItemRow: {
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  serviceImageFrame: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#858B94',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  cardItemThumb16: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  cardItemThumb24: {
    width: 80,
    height: 80,
    borderRadius: 24,
  },
  cardItemInfoCol: {
    flex: 1,
    gap: 8,
  },
  cardItemTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  cardItemPrice: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  cardItemRole: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  cardItemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  metaItem: {
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
  cardSubHeading: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    marginTop: 4,
    marginBottom: 4,
    paddingHorizontal: 4,
  },

  // ── Appointment Information Card (#F7F7F7, 358x320px) ──
  appointmentInfoCard: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 24,
  },
  appointmentInfoItem: {
    gap: 16,
  },
  appointmentInfoLabel: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  appointmentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  appointmentIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentInfoValue: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Note Box (358x108px) ──
  noteBox: {
    width: 358,
    minHeight: 108,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    position: 'relative',
  },
  noteTextInput: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlignVertical: 'top',
    paddingBottom: 24,
  },
  noteCharCount: {
    position: 'absolute',
    right: 16,
    bottom: 12,
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Package Card (358x530px) ──
  packageCard: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 24,
  },
  packageImagesGrid: {
    gap: 24,
  },
  packageImageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  packageGridImage: {
    width: 140,
    height: 140,
    borderRadius: 16,
  },
  packageGridPlaceholder: {
    width: 140,
    height: 140,
  },
  packagePriceText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.1,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  packageItemsList: {
    gap: 12,
  },
  packageItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  packageItemText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Booking Summary (358x126px) ──
  summaryContainer: {
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 24,
  },
  summaryLabel: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  summaryValue: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  summaryPointsValue: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(248, 155, 24, 0.96)',
  },
  paymentTypeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentTypeText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
  },
  summaryTotalValue: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
});

export default ProviderStaffDetailScreen;
