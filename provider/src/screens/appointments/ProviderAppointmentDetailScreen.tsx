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
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { AcceptAppointmentLoader } from '../../components/AcceptAppointmentLoader';
import { CancelAppointmentWarningModal } from '../../components/CancelAppointmentWarningModal';
import { appointmentStore } from '../../store/appointmentStore';

// ── 1:1 Vector Icons ──────────────────────────────────────────────────────────

function ArrowLeft02Icon({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="28 64 24 24" fill="none">
      <Path
        d="M33.5 76.002H47"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M38.9999 82.002C38.9999 82.002 33 77.583 33 76.0019C33 74.4208 39 70.002 39 70.002"
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
    <Svg width={size} height={size} viewBox="144 528 18 18" fill="none">
      <Path
        d="M153 544.5C157.142 544.5 160.5 541.142 160.5 537C160.5 532.858 157.142 529.5 153 529.5C148.858 529.5 145.5 532.858 145.5 537C145.5 541.142 148.858 544.5 153 544.5Z"
        stroke={color}
        strokeWidth="1.2"
      />
      <Path
        d="M151.125 535.125L153.75 537.75M156 534L152.25 537.75"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function StarGoldIcon({ size = 16, color = 'rgba(248, 155, 24, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="215 529 16 16" fill="none">
      <Path
        d="M224.152 531.296L225.325 533.662C225.485 533.991 225.912 534.307 226.272 534.368L228.398 534.724C229.758 534.953 230.078 535.947 229.098 536.928L227.445 538.595C227.165 538.878 227.012 539.422 227.098 539.812L227.572 541.875C227.945 543.508 227.085 544.14 225.652 543.287L223.659 542.097C223.299 541.882 222.705 541.882 222.339 542.097L220.346 543.287C218.919 544.14 218.053 543.502 218.426 541.875L218.899 539.812C218.986 539.422 218.833 538.878 218.553 538.595L216.899 536.928C215.926 535.947 216.239 534.953 217.599 534.724L219.726 534.368C220.079 534.307 220.506 533.991 220.666 533.662L221.839 531.296C222.479 530.013 223.519 530.013 224.152 531.296Z"
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

function CheckmarkBadgeBlueIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M13.707 16.22C14.366 16.22 15.307 16.348 15.826 15.834C16.349 15.315 16.22 14.371 16.22 13.707C16.22 12.868 16.403 12.482 17.001 11.885C17.889 10.997 18.334 10.552 18.334 10C18.334 9.448 17.889 9.004 17.001 8.115C16.404 7.518 16.22 7.132 16.22 6.294C16.22 5.63 16.349 4.686 15.826 4.167C15.307 3.652 14.366 3.781 13.707 3.781C12.947 3.781 12.418 3.533 11.885 3C10.997 2.111 10.552 1.667 10 1.667C9.448 1.667 9.004 2.111 8.116 3L8.115 3C7.582 3.533 7.054 3.781 6.294 3.781C5.63 3.781 4.686 3.652 4.167 4.175C3.652 4.694 3.781 5.634 3.781 6.294C3.781 7.054 3.533 7.582 3 8.115L3 8.116C2.111 9.004 1.667 9.448 1.667 10C1.667 10.552 2.111 10.997 3 11.885C3.597 12.482 3.781 12.868 3.781 13.707C3.781 14.371 3.652 15.315 4.175 15.834C4.694 16.348 5.634 16.22 6.294 16.22C7.103 16.22 7.493 16.378 8.071 16.956C8.563 17.448 9.222 18.334 10 18.334C10.778 18.334 11.438 17.448 11.93 16.956C12.508 16.378 12.897 16.22 13.707 16.22Z"
        fill="#1A82FF"
        fillOpacity={0.9}
        stroke="#1A82FF"
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

function Calendar03Icon({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="40 885 24 24" fill="none">
      <Path
        d="M56 887V891M48 887V891"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M53 889H51C47.2288 889 45.3431 889 44.1716 890.172C43 891.343 43 893.229 43 897V899C43 902.771 43 904.657 44.1716 905.828C45.3431 907 47.2288 907 51 907H53C56.7712 907 58.6569 907 59.8284 905.828C61 904.657 61 902.771 61 899V897C61 893.229 61 891.343 59.8284 890.172C58.6569 889 56.7712 889 53 889Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M43 895H61"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M52.1258 899H52.0008M52.1258 903H52.0008M47.625 899H47.5M47.625 903H47.5M56.625 899H56.5M52.2508 899C52.2508 899.138 52.1389 899.25 52.0008 899.25C51.8628 899.25 51.7508 899.138 51.7508 899C51.7508 898.862 51.8628 898.75 52.0008 898.75C52.1389 898.75 52.2508 898.862 52.2508 899ZM52.2508 903C52.2508 903.138 52.1389 903.25 52.0008 903.25C51.8628 903.25 51.7508 903.138 51.7508 903C51.7508 902.862 51.8628 902.75 52.0008 902.75C52.1389 902.75 52.2508 902.862 52.2508 903ZM47.75 899C47.75 899.138 47.6381 899.25 47.5 899.25C47.3619 899.25 47.25 899.138 47.25 899C47.25 898.862 47.3619 898.75 47.5 898.75C47.6381 898.75 47.75 898.862 47.75 899ZM47.75 903C47.75 903.138 47.6381 903.25 47.5 903.25C47.3619 903.25 47.25 903.138 47.25 903C47.25 902.862 47.3619 902.75 47.5 902.75C47.6381 902.75 47.75 902.862 47.75 903ZM56.75 899C56.75 899.138 56.6381 899.25 56.5 899.25C56.3619 899.25 56.25 899.138 56.25 899C56.25 898.862 56.3619 898.75 56.5 898.75C56.6381 898.75 56.75 898.862 56.75 899Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Clock3Icon({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="40 989 24 24" fill="none">
      <Path
        d="M52 1011C57.5228 1011 62 1006.52 62 1001C62 995.477 57.5228 991 52 991C46.4772 991 42 995.477 42 1001C42 1006.52 46.4772 1011 52 1011Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M52 995V1001H56"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Home11Icon({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="40 1093 24 24" fill="none">
      <Path
        d="M62 1103.5L52.8825 1095.82C52.6355 1095.61 52.3229 1095.5 52 1095.5C51.6771 1095.5 51.3645 1095.61 51.1175 1095.82L42 1103.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M60.5 1098V1108.5C60.5 1111.33 60.5 1112.74 59.6213 1113.62C58.7426 1114.5 57.3284 1114.5 54.5 1114.5H49.5C46.6716 1114.5 45.2574 1114.5 44.3787 1113.62C43.5 1112.74 43.5 1111.33 43.5 1108.5V1102.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M55 1114.5V1109.5C55 1108.09 55 1107.38 54.5607 1106.94C54.1213 1106.5 53.4142 1106.5 52 1106.5C50.5858 1106.5 49.8787 1106.5 49.4393 1106.94C49 1107.38 49 1108.09 49 1109.5V1114.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckmarkCircle02Icon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="9" fill="rgba(0, 8, 20, 0.96)" />
      <Path d="M6.5 10l2.5 2.5 5-5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Default Mock / Figma Data ────────────────────────────────────────────────

const DEFAULT_APPOINTMENT_DATA = {
  headerTitle: 'Ayobami Isaac',
  client: {
    name: 'Jude Fabulous',
    badge: 'New Client',
    avatar: require('../../../assets/images/appointments/jude_fabulous.png'),
    gender: 'Male',
    badgeStatus: 'Non',
    membership: '5 Days ago',
  },
  service: {
    title: 'All Back Dreadlock',
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
    title: 'Dry Wow Sham..',
    price: '₦22,700',
    duration: '24min',
    rating: '5.1',
    image: require('../../../assets/images/appointments/nail_art.png'),
    specialists: [
      {
        id: 'spec_1',
        name: 'Bisola Olarewaju',
        role: 'Nail Artist',
        rating: '5.1',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      },
      {
        id: 'spec_2',
        name: 'Femi Johnson',
        role: 'Nail Artist',
        rating: '5.1',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      },
    ],
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
    ticketNumber: '#3654376',
    total: '₦50,000',
  },
};

// ── Screen Component ─────────────────────────────────────────────────────────

export const ProviderAppointmentDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    price?: string;
    serviceTitle?: string;
    duration?: string;
    rating?: string;
    staff?: string;
  }>();

  const appointment = params.id ? appointmentStore.getAppointmentById(params.id) : undefined;

  // Use dynamic overrides if supplied through params or store
  const headerTitle = params.title || appointment?.clientName || DEFAULT_APPOINTMENT_DATA.headerTitle;
  const clientName = appointment?.clientName || DEFAULT_APPOINTMENT_DATA.client.name;
  const clientStatus = appointment?.clientStatus || DEFAULT_APPOINTMENT_DATA.client.badge;
  const serviceName = params.serviceTitle || appointment?.title || DEFAULT_APPOINTMENT_DATA.service.title;
  const appointmentPrice = params.price || appointment?.price || DEFAULT_APPOINTMENT_DATA.service.price;
  const appointmentDuration = params.duration || appointment?.duration || DEFAULT_APPOINTMENT_DATA.service.duration;
  const appointmentRating = params.rating || appointment?.rating || DEFAULT_APPOINTMENT_DATA.service.rating;
  const serviceImage = appointment?.image || DEFAULT_APPOINTMENT_DATA.service.image;
  const specialistName = params.staff || DEFAULT_APPOINTMENT_DATA.service.specialist.name;

  const [isLoading, setIsLoading] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [noteText, setNoteText] = useState(DEFAULT_APPOINTMENT_DATA.note.text);
  const noteInputRef = useRef<TextInput>(null);

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    setIsCancelling(true);
    if (params.id) {
      appointmentStore.cancelAppointment(params.id);
    }
    setTimeout(() => {
      setIsCancelling(false);
      router.back();
    }, 1400);
  };

  const handleAccept = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsAccepted(true);
      router.push('/appointment-success');
    }, 1800);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* ── Fixed Page Header (64px, 1:1 Figma) ── */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          {/* Back button (48x48) */}
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.7}
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft02Icon size={24} color="rgba(0, 8, 20, 0.96)" />
          </TouchableOpacity>

          {/* Centered Title */}
          <Text style={styles.headerTitleText} numberOfLines={1}>
            {headerTitle}
          </Text>

          {/* Right dummy spacer (48x48) to keep title strictly centered */}
          <View style={styles.headerRightSpacer} />
        </View>
      </View>

      {/* ── Scrollable Body Content (358px wide, 40px gap between sections) ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 96 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Section 1: User Profile Card (358x224px, 1:1 Figma) ── */}
        <LinearGradient
          colors={['#E9F4D9', '#F0F8E4', '#F6FBF0', '#FFFFFF']}
          locations={[0, 0.25, 0.5, 0.82]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.userProfileCard}
        >
          {/* Top Row: User Details (326x64px, gap: 24px) */}
          <View style={styles.userDetailsRow}>
            {/* Image frame (64x64px, radius 56px, border 1px solid #FFFFFF) */}
            <View style={styles.avatarFrame}>
              <Image
                source={
                  typeof DEFAULT_APPOINTMENT_DATA.client.avatar === 'string'
                    ? { uri: DEFAULT_APPOINTMENT_DATA.client.avatar }
                    : DEFAULT_APPOINTMENT_DATA.client.avatar
                }
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>

            {/* Staff name and profession (238x60px, gap: 8px) */}
            <View style={styles.clientInfoBlock}>
              <Text style={styles.clientNameText}>{DEFAULT_APPOINTMENT_DATA.client.name}</Text>
              <View style={styles.clientBadgeRow}>
                <AddMaleIcon size={20} color="rgba(10, 95, 10, 0.8)" />
                <Text style={styles.clientBadgeText}>{DEFAULT_APPOINTMENT_DATA.client.badge}</Text>
              </View>
            </View>
          </View>

          {/* Bottom Activities Row (326x104px, 3 stat columns, gap: 5px) */}
          <View style={styles.activitiesRow}>
            {/* Col 1: Gender (sign up duration: 80x104px, padding: 8px 10px, gap: 8px) */}
            <View style={styles.activityColumnCol1}>
              <View style={styles.activityIconCircle}>
                <VenusAndMarsIcon size={20} color="#141B34" />
              </View>
              <View style={styles.activityTextGroupCol1}>
                <Text style={styles.activityLabel}>Gender</Text>
                <Text style={styles.activityValueGender}>{DEFAULT_APPOINTMENT_DATA.client.gender}</Text>
              </View>
            </View>

            {/* Vertical Divider: Line 183 (56px) */}
            <View style={styles.verticalDivider} />

            {/* Col 2: Badge (Total points: 58x104px, padding: 8px 10px, gap: 8px) */}
            <View style={styles.activityColumnCol2}>
              <View style={styles.activityIconCircle}>
                <CheckmarkBadgeBlueIcon size={20} />
              </View>
              <View style={styles.activityTextGroupCol2}>
                <Text style={styles.activityLabel}>Badge</Text>
                <Text style={styles.activityValueBadge}>{DEFAULT_APPOINTMENT_DATA.client.badgeStatus}</Text>
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
                <Text style={styles.activityValueMembership}>{DEFAULT_APPOINTMENT_DATA.client.membership}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* ── Section 2: Service (358x332px) ── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Service</Text>
          <View style={styles.serviceSectionCard}>
            {/* Main Service Item */}
            <View style={styles.serviceItemRow}>
              {/* Image holder (88x88 white with shadow, 80x80 inner image) */}
              <View style={styles.serviceImageHolder}>
                <Image
                  source={serviceImage}
                  style={styles.serviceThumbnail}
                  resizeMode="cover"
                />
              </View>

              {/* Service Info */}
              <View style={styles.serviceInfoGroup}>
                <Text style={styles.serviceItemTitle}>{serviceName}</Text>
                <Text style={styles.serviceItemPrice}>{appointmentPrice}</Text>
                <View style={styles.serviceMetaRow}>
                  <View style={styles.metaBadge}>
                    <Time04Icon size={18} color="rgba(96, 96, 102, 0.96)" />
                    <Text style={styles.metaBadgeText}>{appointmentDuration}</Text>
                  </View>
                  <View style={styles.metaBadge}>
                    <StarGoldIcon size={16} color="rgba(248, 155, 24, 0.96)" />
                    <Text style={styles.metaBadgeText}>{appointmentRating}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Sub-header & Specialist: Spaced out paragraph block */}
            <View style={styles.specialistSectionWrapper}>
              <Text style={styles.specialistSubHeading}>Specialist</Text>

              {/* Specialist Row */}
              <View style={styles.specialistRow}>
                <Image
                  source={{ uri: DEFAULT_APPOINTMENT_DATA.service.specialist.avatar }}
                  style={styles.specialistAvatar}
                  resizeMode="cover"
                />
                <View style={styles.specialistInfoGroup}>
                  <Text style={styles.specialistNameText}>
                    {specialistName}
                  </Text>
                  <Text style={styles.specialistRoleText}>
                    {DEFAULT_APPOINTMENT_DATA.service.specialist.role}
                  </Text>
                  <View style={styles.specialistRatingRow}>
                    <StarGoldIcon size={16} color="rgba(248, 155, 24, 0.96)" />
                    <Text style={styles.metaBadgeText}>
                      {DEFAULT_APPOINTMENT_DATA.service.specialist.rating}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── Section 3: Appointment Information (358x372px) ── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Appointment Information</Text>
          <View style={styles.appointmentInfoCard}>
            {/* Row 1: Appointment Date */}
            <View style={styles.infoFieldBlock}>
              <Text style={styles.infoFieldLabel}>Appointment Date</Text>
              <View style={styles.infoFieldValueRow}>
                <View style={styles.infoIconCircle}>
                  <Calendar03Icon size={24} color="rgba(0, 8, 20, 0.96)" />
                </View>
                <Text style={styles.infoFieldValueText}>
                  {DEFAULT_APPOINTMENT_DATA.appointmentInfo.date}
                </Text>
              </View>
            </View>

            {/* Row 2: Appointment Time */}
            <View style={styles.infoFieldBlock}>
              <Text style={styles.infoFieldLabel}>Appointment Time</Text>
              <View style={styles.infoFieldValueRow}>
                <View style={styles.infoIconCircle}>
                  <Clock3Icon size={24} color="rgba(0, 8, 20, 0.96)" />
                </View>
                <Text style={styles.infoFieldValueText}>
                  {DEFAULT_APPOINTMENT_DATA.appointmentInfo.time}
                </Text>
              </View>
            </View>

            {/* Row 3: Appointment Type */}
            <View style={styles.infoFieldBlock}>
              <Text style={styles.infoFieldLabel}>Appointment Type</Text>
              <View style={styles.infoFieldValueRow}>
                <View style={styles.infoIconCircle}>
                  <Home11Icon size={24} color="rgba(0, 8, 20, 0.96)" />
                </View>
                <Text style={styles.infoFieldValueText}>
                  {DEFAULT_APPOINTMENT_DATA.appointmentInfo.type}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Section 4: Add-One (358x476px, 1:1 Figma) ── */}
        <View style={styles.addOneSectionBlock}>
          <Text style={styles.sectionHeadingDark}>Add-One</Text>
          <View style={styles.addOnsContentCard}>
            {/* Top item: add one package (358x116px, radius 24px, #F8F9FA, padding 16px) */}
            <View style={styles.addOnPackageCard}>
              <Image
                source={DEFAULT_APPOINTMENT_DATA.addOn.image}
                style={styles.addOnImage}
                resizeMode="cover"
              />
              <View style={styles.serviceInfoGroup}>
                <Text style={styles.serviceItemTitle}>{DEFAULT_APPOINTMENT_DATA.addOn.title}</Text>
                <Text style={styles.serviceItemPrice}>{DEFAULT_APPOINTMENT_DATA.addOn.price}</Text>
                <View style={styles.serviceMetaRow}>
                  <View style={styles.metaBadge}>
                    <Time04Icon size={18} color="rgba(96, 96, 102, 0.96)" />
                    <Text style={styles.metaBadgeText}>{DEFAULT_APPOINTMENT_DATA.addOn.duration}</Text>
                  </View>
                  <View style={styles.metaBadge}>
                    <StarGoldIcon size={16} color="rgba(248, 155, 24, 0.96)" />
                    <Text style={styles.metaBadgeText}>{DEFAULT_APPOINTMENT_DATA.addOn.rating}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Specialist sub-section inside Add-One */}
            <View style={styles.addOnSpecialistsContainer}>
              <Text style={styles.specialistSubHeading}>Specialist</Text>

              {/* Specialists List spaced out in between */}
              <View style={styles.specialistsListContainer}>
                {/* Specialist 1 */}
                <View style={styles.specialistRow}>
                  <Image
                    source={{ uri: DEFAULT_APPOINTMENT_DATA.addOn.specialists[0].avatar }}
                    style={styles.specialistAvatar}
                    resizeMode="cover"
                  />
                  <View style={styles.specialistInfoGroup}>
                    <Text style={styles.specialistNameText}>
                      {DEFAULT_APPOINTMENT_DATA.addOn.specialists[0].name}
                    </Text>
                    <Text style={styles.specialistRoleText}>
                      {DEFAULT_APPOINTMENT_DATA.addOn.specialists[0].role}
                    </Text>
                    <View style={styles.specialistRatingRow}>
                      <StarGoldIcon size={16} color="rgba(248, 155, 24, 0.96)" />
                      <Text style={styles.metaBadgeText}>
                        {DEFAULT_APPOINTMENT_DATA.addOn.specialists[0].rating}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Specialist 2 */}
                <View style={styles.specialistRow}>
                  <Image
                    source={{ uri: DEFAULT_APPOINTMENT_DATA.addOn.specialists[1].avatar }}
                    style={styles.specialistAvatar}
                    resizeMode="cover"
                  />
                  <View style={styles.specialistInfoGroup}>
                    <Text style={styles.specialistNameText}>
                      {DEFAULT_APPOINTMENT_DATA.addOn.specialists[1].name}
                    </Text>
                    <Text style={styles.specialistRoleText}>
                      {DEFAULT_APPOINTMENT_DATA.addOn.specialists[1].role}
                    </Text>
                    <View style={styles.specialistRatingRow}>
                      <StarGoldIcon size={16} color="rgba(248, 155, 24, 0.96)" />
                      <Text style={styles.metaBadgeText}>
                        {DEFAULT_APPOINTMENT_DATA.addOn.specialists[1].rating}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── Section 5: Note (358x108px) ── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Note</Text>
          <TouchableOpacity
            style={styles.noteBox}
            activeOpacity={1}
            onPress={() => noteInputRef.current?.focus()}
          >
            <TextInput
              ref={noteInputRef}
              style={styles.noteInput}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Leave a note..."
              placeholderTextColor="rgba(96, 96, 102, 0.6)"
              multiline
              maxLength={120}
              textAlignVertical="top"
              scrollEnabled={false}
            />
            <View style={styles.noteCounterRow}>
              <Text style={styles.noteCounterText}>{`${noteText.length}/120`}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Section 6: Package (358x586px) ── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeadingDark}>Package</Text>
          <View style={styles.sectionCard}>
            {/* Images Grid (3 images, 140x140 each, radius 16px) */}
            <View style={styles.packageImagesGrid}>
              <View style={styles.packageImageRow}>
                <Image
                  source={DEFAULT_APPOINTMENT_DATA.package.images[0]}
                  style={styles.packageGridImage}
                  resizeMode="cover"
                />
                <Image
                  source={DEFAULT_APPOINTMENT_DATA.package.images[1]}
                  style={styles.packageGridImage}
                  resizeMode="cover"
                />
              </View>
              <Image
                source={DEFAULT_APPOINTMENT_DATA.package.images[2]}
                style={styles.packageGridImage}
                resizeMode="cover"
              />
            </View>

            {/* Package Price (24px 500) */}
            <Text style={styles.packagePriceText}>{DEFAULT_APPOINTMENT_DATA.package.price}</Text>

            {/* Checklist items */}
            <View style={styles.packageChecklist}>
              {DEFAULT_APPOINTMENT_DATA.package.items.map((item, idx) => (
                <View key={idx} style={styles.checklistItemRow}>
                  <CheckmarkCircle02Icon size={20} />
                  <Text style={styles.checklistItemText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Section 7: Summary (358x236px) ── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeadingDark}>Summary</Text>
          <View style={styles.summaryCard}>
            {/* Appointment cost */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Appointment cost</Text>
              <Text style={styles.summaryValueBlack}>
                {DEFAULT_APPOINTMENT_DATA.summary.appointmentCost}
              </Text>
            </View>

            {/* Trend points */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Trend points</Text>
              <Text style={styles.summaryValueOrange}>
                {DEFAULT_APPOINTMENT_DATA.summary.trendPoints}
              </Text>
            </View>

            {/* Payment type */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment type</Text>
              <View style={styles.paymentTypeRow}>
                <Image
                  source={require('../../../assets/images/payment/opay.png')}
                  style={styles.opayIcon}
                  resizeMode="contain"
                />
                <Text style={styles.paymentTypeText}>
                  {DEFAULT_APPOINTMENT_DATA.summary.paymentType}
                </Text>
              </View>
            </View>

            {/* Appointment Ticket */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Appointment Ticket</Text>
              <Text style={styles.ticketNumberText}>
                {DEFAULT_APPOINTMENT_DATA.summary.ticketNumber}
              </Text>
            </View>

            {/* Total */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.summaryValueBlack}>
                {DEFAULT_APPOINTMENT_DATA.summary.total}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Fixed Bottom Action Bar (80px, 1:1 Figma) ── */}
      <View
        style={[
          styles.bottomActionBar,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <TouchableOpacity
          style={styles.cancelButton}
          activeOpacity={0.8}
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.acceptButton}
          activeOpacity={0.88}
          onPress={handleAccept}
        >
          <Text style={styles.acceptButtonText}>Accept Appointment</Text>
        </TouchableOpacity>
      </View>

      {/* ── Android Native System Dock Protector Barrier ── */}
      <NativeDockSpacer backgroundColor="#FFFFFF" />

      {/* ── 1:1 Figma 4-Dot Animated Loader (Accept or Cancel transition) ── */}
      <AcceptAppointmentLoader visible={isLoading || isCancelling} />

      {/* ── 1:1 Figma Delete Warning Popup (358x218px) ── */}
      <CancelAppointmentWarningModal
        visible={showCancelModal}
        onDiscard={() => setShowCancelModal(false)}
        onConfirmCancel={handleConfirmCancel}
      />
    </View>
  );
};

export default ProviderAppointmentDetailScreen;

// ── 1:1 Stylesheet (Strict Line-by-Line Figma Conversion) ──────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header (height: 64px, border-bottom: 1px) ──
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
  headerRightSpacer: {
    width: 48,
    height: 48,
    opacity: 0,
  },

  // ── Scrollable Body (40px gap between sections, 1:1 Figma) ──
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 25,
    paddingBottom: 120,
    gap: 40,
  },

  // ── User Profile Card (358x224px, radius 24px, border 0.5px #CBE6A4) ──
  userProfileCard: {
    width: '100%',
    height: 224,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: '#CBE6A4',
    padding: 16,
    gap: 24,
    overflow: 'hidden',
  },
  userDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    width: 326,
    height: 64,
  },
  avatarFrame: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  clientInfoBlock: {
    width: 238,
    height: 60,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 8,
  },
  clientNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    height: 24,
  },
  clientBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 28,
    paddingVertical: 4,
  },
  clientBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(10, 95, 10, 0.8)',
    height: 20,
  },

  // Activities (3 stat columns: sign up duration, Total points, Total appointments)
  activitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 326,
    height: 104,
  },
  activityColumnCol1: {
    width: 80,
    height: 104,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 8,
    borderRadius: 16,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginRight: 23,
  },
  verticalDivider: {
    width: 1,
    height: 56,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    alignSelf: 'center',
  },
  activityColumnCol2: {
    width: 58,
    height: 104,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 8,
    borderRadius: 16,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: 23,
    marginRight: 23,
  },
  activityColumnCol3: {
    width: 97,
    height: 104,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 8,
    borderRadius: 16,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: 23,
  },
  activityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTextGroupCol1: {
    width: 44,
    height: 44,
    gap: 8,
    alignItems: 'flex-start',
  },
  activityTextGroupCol2: {
    width: 38,
    height: 44,
    gap: 8,
    alignItems: 'flex-start',
  },
  activityTextGroupCol3: {
    width: 77,
    height: 44,
    gap: 8,
    alignItems: 'flex-start',
  },
  activityLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    height: 16,
  },
  activityValueGender: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: '#000000',
    height: 20,
  },
  activityValueBadge: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    height: 20,
  },
  activityValueMembership: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    height: 20,
  },

  // ── Universal Section Block ──
  sectionBlock: {
    width: '100%',
    gap: 16,
  },
  sectionHeading: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
  },
  sectionHeadingDark: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  sectionCard: {
    width: '100%',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 16,
  },
  serviceSectionCard: {
    width: '100%',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 24,
  },

  // ── Service Item ──
  serviceItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  serviceImageHolder: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(133, 139, 148, 0.1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  serviceThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  serviceInfoGroup: {
    flex: 1,
    gap: 8,
  },
  serviceItemTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  serviceItemPrice: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  serviceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // Specialist sub-block
  specialistSectionWrapper: {
    gap: 14,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.8)',
  },
  specialistSubHeading: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  subHeadingText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  specialistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  specialistAvatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  specialistInfoGroup: {
    flex: 1,
    gap: 8,
  },
  specialistNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  specialistRoleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  specialistRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // ── Appointment Information (Spacious Paragraph Spacing) ──
  appointmentInfoCard: {
    width: '100%',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 20,
    gap: 28,
  },
  infoFieldBlock: {
    gap: 12,
  },
  infoFieldLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  infoFieldValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoFieldValueText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Add-One (358x476px, 1:1 Figma) ──
  addOneSectionBlock: {
    width: '100%',
    gap: 16,
  },
  addOnsContentCard: {
    width: '100%',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    gap: 20,
    overflow: 'hidden',
  },
  addOnPackageCard: {
    width: '100%',
    height: 116,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  addOnSpecialistsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 16,
  },
  specialistsListContainer: {
    gap: 24,
  },
  addOnImage: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },

  // ── Note (108px high, border 1px) ──
  noteBox: {
    width: '100%',
    minHeight: 108,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    padding: 16,
    justifyContent: 'space-between',
  },
  noteInput: {
    width: '100%',
    minHeight: 52,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlignVertical: 'top',
    padding: 0,
    margin: 0,
    includeFontPadding: false,
  },
  noteCounterRow: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  noteCounterText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },

  // ── Package ──
  packageImagesGrid: {
    gap: 16,
  },
  packageImageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 40,
  },
  packageGridImage: {
    width: 140,
    height: 140,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  packagePriceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.1,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  packageChecklist: {
    gap: 8,
  },
  checklistItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checklistItemText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Summary ──
  summaryCard: {
    width: '100%',
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 24,
  },
  summaryLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  summaryValueBlack: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  summaryValueOrange: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: 'rgba(248, 155, 24, 0.96)',
  },
  paymentTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  opayIcon: {
    width: 24,
    height: 24,
  },
  paymentTypeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: '#000000',
  },
  ticketNumberText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: '#000000',
  },

  // ── Fixed Bottom Action Bar (height: 80px) ──
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 80,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 24,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(133, 139, 148, 0.12)',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 1,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cancelButton: {
    width: 115,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(204, 41, 41, 0.9)',
  },
  acceptButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },
});
