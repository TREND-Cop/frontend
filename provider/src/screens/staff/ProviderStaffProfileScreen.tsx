import React, { useState } from 'react';
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
import { useLocalSearchParams } from 'expo-router';
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { getStaffById, StaffStatusCode } from '../../store/staffStore';
import { useSkeletonCadence } from '../../hooks/useSkeletonCadence';
import { TextSkeleton } from '../../components/TextSkeleton';
import { previewStore } from '../../utils/previewStore';
import { shareStore } from '../../utils/shareStore';
import { getSpecialistPortfolio } from '../../data/specialistPortfolioData';

// ── Typography Mandate (AGENTS.md & Figma) ───────────────────────────────────
const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

// ── 1:1 Vector Icons from Figma Specs ────────────────────────────────────────

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

function Share03Icon({
  size = 24,
  color = '#141B34',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3V15M12 3L16 7M12 3L8 7"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 11V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V11"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SeatSelectorIcon({ size = 16, color = '#0C790C' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 18v3M20 18v3M4 11h16a2 2 0 012 2v5H2v-5a2 2 0 012-2z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6 11V6a3 3 0 013-3h6a3 3 0 013 3v5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function FastFoodOutlineIcon({ size = 16, color = '#F89B18' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 11h18M5 11c0-4 3-7 7-7s7 3 7 7M4 15h16a2 2 0 012 2v1a2 2 0 01-2 2H4a2 2 0 01-2-2v-1a2 2 0 012-2z"
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
 * 1:1 Figma briefcase-01 Vector Icon
 */
function Briefcase01Icon({
  size = 24,
  color = 'rgba(0, 8, 20, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="2"
        y="7"
        width="20"
        height="14"
        rx="3"
        stroke={color}
        strokeWidth={1.5}
      />
      <Path
        d="M8.5 7V4.5C8.5 3.67 9.17 3 10 3H14C14.83 3 15.5 3.67 15.5 4.5V7"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path d="M2 11.5H22" stroke={color} strokeWidth={1.5} />
      <Path d="M10 11.5V13.5H14V11.5" stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

/**
 * 1:1 Figma user-group Vector Icon
 */
function UserGroupIcon({
  size = 24,
  color = '#141B34',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="8" r="3.5" stroke={color} strokeWidth={1.5} />
      <Path
        d="M2.5 19C2.5 15.96 5.41 13.5 9 13.5C12.59 13.5 15.5 15.96 15.5 19"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M15.5 5.5C16.88 5.5 18 6.62 18 8C18 9.38 16.88 10.5 15.5 10.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M18.5 14C20.25 14.85 21.5 16.5 21.5 18.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma id-verified Vector Icon
 */
function IdVerifiedIcon({
  size = 24,
  color = '#141B34',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="3"
        stroke={color}
        strokeWidth={1.5}
      />
      <Circle cx="8.5" cy="10" r="2.5" stroke={color} strokeWidth={1.5} />
      <Path
        d="M5 16C5 14.5 6.5 13.5 8.5 13.5C10.5 13.5 12 14.5 12 16"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M14.5 9.5H18M14.5 13.5H18"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma checkmark-badge-02 Vector Icon
 */
function CheckmarkBadge02Icon({
  size = 24,
  color = '#141B34',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16.45 19.46C17.24 19.46 18.37 19.62 18.99 19C19.62 18.38 19.46 17.25 19.46 16.45C19.46 15.44 19.68 14.98 20.4 14.26C21.47 13.2 22 12.66 22 12C22 11.34 21.47 10.81 20.4 9.74C19.68 9.02 19.46 8.56 19.46 7.55C19.46 6.76 19.62 5.62 18.99 5C18.37 4.38 17.24 4.54 16.45 4.54C15.54 4.54 14.9 4.24 14.26 3.6C13.2 2.53 12.66 2 12 2C11.34 2 10.81 2.53 9.74 3.6C9.1 4.24 8.46 4.54 7.55 4.54C6.76 4.54 5.62 4.38 5 5C4.38 5.63 4.54 6.76 4.54 7.55C4.54 8.46 4.24 9.1 3.6 9.74C2.53 10.81 2 11.34 2 12C2 12.66 2.53 13.2 3.6 14.26C4.32 14.98 4.54 15.44 4.54 16.45C4.54 17.25 4.38 18.38 5 19.01C5.63 19.63 6.76 19.47 7.55 19.47C8.52 19.47 8.99 19.66 9.68 20.35C10.27 20.94 11.07 22 12 22C12.93 22 13.72 20.94 14.32 20.35C15.01 19.66 15.48 19.46 16.45 19.46Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 12.89L10.8 14.5L15 9.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma Blue Shield Check Badge over Avatar
 * Strict geometric path and viewBox from founder's SVG spec
 */
function ShieldCheckBadge({ size = 32 }: { size?: number }) {
  const height = (size * 36) / 32;
  return (
    <Svg width={size} height={height} viewBox="88 76 34 38" fill="none">
      <Path
        d="M119.987 93.6388V88.8004C119.987 86.0671 119.987 84.7004 119.314 83.8087C118.64 82.9171 117.117 82.4842 114.072 81.6184C111.991 81.0269 110.156 80.3143 108.691 79.6637C106.693 78.7768 105.694 78.3333 104.987 78.3333C104.28 78.3333 103.281 78.7768 101.283 79.6637C99.8177 80.3143 97.9834 81.0269 95.9026 81.6184C92.8569 82.4842 91.3341 82.9171 90.6606 83.8087C89.9871 84.7004 89.9871 86.0671 89.9871 88.8004V93.6388C89.9871 103.014 98.425 108.639 102.644 110.866C103.655 111.4 104.161 111.667 104.987 111.667C105.813 111.667 106.319 111.4 107.33 110.866C111.549 108.639 119.987 103.014 119.987 93.6388Z"
        fill="#1A82FF"
        fillOpacity={0.9}
        stroke="#1A82FF"
        strokeOpacity={0.9}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <Path
        d="M99.1536 94.7222C99.1536 94.7222 100.612 94.7222 102.07 97.5001C102.07 97.5001 106.703 90.5556 110.82 89.1667"
        stroke="#FFFFFF"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function StarGoldIcon({
  size = 20,
  color = '#F89B18',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 2.5L12.3 7.2L17.5 7.9L13.7 11.5L14.6 16.7L10 14.2L5.4 16.7L6.3 11.5L2.5 7.9L7.7 7.2L10 2.5Z"
        fill={color}
      />
    </Svg>
  );
}

function StarHalfGoldIcon({
  size = 16,
  color = '#F89B18',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 2.2L9.85 5.95L14 6.55L11 9.47L11.71 13.6L8 11.65V2.2Z"
        fill={color}
      />
      <Path
        d="M8 2.2L6.15 5.95L2 6.55L5 9.47L4.29 13.6L8 11.65V2.2Z"
        fill="rgba(192, 192, 204, 0.4)"
      />
    </Svg>
  );
}

function MessageMultiple02Icon({
  size = 24,
  color = '#FFFFFF',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 19V17H4C2.9 17 2 16.1 2 15V5C2 3.9 2.9 3 4 3H16C17.1 3 18 3.9 18 5V9"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 21L13.5 17.5H20C21.1 17.5 22 16.6 22 15.5V10C22 8.9 21.1 8 20 8H10C8.9 8 8 8.9 8 10V18C8 19.1 8.9 20 10 20V21Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Customer Review Efficiency Tags ──────────────────────────────────────────
const EFFICIENCY_TAGS = [
  { emoji: '💼', label: 'Professionalism', count: 22 },
  { emoji: '✨', label: 'Cleanness', count: 12 },
  { emoji: '🤝', label: 'Hospitality', count: 30 },
  { emoji: '💬', label: 'Communication', count: 25 },
  { emoji: '🏷️', label: 'Price Accuracy', count: 100 },
  { emoji: '🛋️', label: 'Comfort', count: 41 },
  { emoji: '🌿', label: 'Environment', count: 31 },
  { emoji: '📍', label: 'Location', count: 80 },
  { emoji: '⚡', label: 'Speed', count: 90 },
];

export function ProviderStaffProfileScreen() {
  const safeRouter = useSafeRouter();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    staffName?: string;
    role?: string;
    staffRole?: string;
    status?: string;
    staffStatus?: string;
    statusCode?: string;
    hours?: string;
    staffHours?: string;
    gender?: string;
    badge?: string;
    experience?: string;
    rating?: string;
    avatar?: any;
  }>();

  const storeStaff = params.id ? getStaffById(params.id) : undefined;

  const staffName = (params as any).name || params.staffName || storeStaff?.name || 'Godwill Thomas';
  const staffRole = (params as any).role || params.staffRole || storeStaff?.role || 'Nail Artist';
  const staffHours = (params as any).hours || params.staffHours || storeStaff?.hours || '8am - 10pm';
  const staffStatus = (params as any).status || params.staffStatus || storeStaff?.status || 'Available for work';
  const staffStatusCode = ((params as any).statusCode || storeStaff?.statusCode || (
    staffStatus.toLowerCase().includes('break') || staffStatus.toLowerCase().includes('lunch')
      ? 'on_break'
      : staffStatus.toLowerCase().includes('closed')
      ? 'closed'
      : 'available'
  )) as StaffStatusCode;

  const staffExperience = (params as any).experience || storeStaff?.experience || '2 Years';
  const staffRating = (params as any).rating || storeStaff?.service?.rating || '4.4';

  const avatarSource =
    (params as any).avatar ||
    storeStaff?.avatar ||
    require('../../../assets/images/profile/1007604717.jpg');

  const isLunchBreak =
    staffStatusCode === 'on_break' ||
    staffStatus.toLowerCase().includes('lunch') ||
    staffStatus.toLowerCase().includes('break');
  const isClosed =
    staffStatusCode === 'closed' ||
    staffStatus.toLowerCase().includes('closed');

  const statusBg = isLunchBreak
    ? 'rgba(255, 246, 235, 0.96)'
    : isClosed
    ? 'rgba(240, 241, 245, 0.96)'
    : 'rgba(238, 248, 238, 0.8)';

  const statusTextColor = isLunchBreak
    ? '#F89B18'
    : isClosed
    ? 'rgba(96, 96, 102, 0.96)'
    : 'rgba(12, 121, 12, 0.96)';

  // First name for header title: e.g. "Godwin" -> "Godwin Profile"
  const firstName = staffName.split(' ')[0] || 'Godwill';

  // Dynamic specialist portfolio (reflects exact portfolio items, first 6 previewed)
  const specialistPortfolio = getSpecialistPortfolio(staffName);
  const portfolioPreviewItems = specialistPortfolio.slice(0, 6);

  const { isSkeletonLoading } = useSkeletonCadence(1200);

  const handlePortfolioThumbPress = (index: number) => {
    previewStore.setPreviewImages(
      portfolioPreviewItems.map((p) => p.image),
      `${firstName} Portfolio`,
      portfolioPreviewItems.map((p) => ({
        image: p.image,
        title: p.title,
        price: p.price,
        duration: p.duration,
        rating: p.rating,
      })),
      index
    );
    safeRouter.push({
      pathname: '/gallery-preview' as any,
      params: { index, initialIndex: index, title: `${firstName} Portfolio` },
    });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── 1:1 Figma Page Header (64px, top: 46px) ── */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          {/* Back button (48x48px, radius 24px) */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.backButton}
            onPress={() => safeRouter.back()}
          >
            <ArrowLeft02Icon size={24} color="rgba(0, 8, 20, 0.96)" />
          </TouchableOpacity>

          {/* Title: Godwin Profile (17px DM Sans Medium) */}
          <Text style={styles.headerTitle}>{firstName} Profile</Text>

          {/* Share button (48x48px) */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.sharePlaceholder}
            onPress={() =>
              shareStore.openShare({
                title: `${firstName} Profile`,
                status: staffStatus,
                statusColor: statusTextColor,
                url: `https://trend.app/provider/staff/${params.id || 'godwin'}`,
              })
            }
          >
            <Share03Icon size={24} color="#141B34" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Main Scrollable Canvas (height: 1583px) ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1:1 Figma Hero Staff Card Frame (Frame 1000006530, top: 134px) ── */}
        <View style={styles.heroCardContainer}>
          {/* Status Tab (extends 36px beneath white card to top: 200px) */}
          <View style={[styles.statusTagUnderlay, { backgroundColor: statusBg }]}>
            <View style={styles.statusUnderlayRow}>
              {isLunchBreak ? (
                <FastFoodOutlineIcon size={16} color={statusTextColor} />
              ) : isClosed ? (
                <Home03Icon size={16} color={statusTextColor} />
              ) : (
                <SeatSelectorIcon size={16} color={statusTextColor} />
              )}
              <Text style={[styles.statusTagText, { color: statusTextColor }]}>{staffStatus}</Text>
            </View>
          </View>

          {/* Elevated White Card (358x220px, radius 24px) */}
          <View style={styles.elevatedCard}>
            {/* Left Column: Avatar & Name/Profession (132x192px) */}
            <View style={styles.staffLeftCol}>
              {/* 104x104px Avatar Frame with Shield Check Badge */}
              <View style={styles.avatarWrap}>
                <Image
                  source={avatarSource}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
                <View style={styles.shieldBadgeWrap}>
                  <ShieldCheckBadge size={32} />
                </View>
              </View>

              {/* Name & Profession (132x80px) */}
              <View style={styles.staffInfoWrap}>
                <TextSkeleton loading={isSkeletonLoading} width={120} height={20} borderRadius={4}>
                  <Text style={styles.staffNameText} numberOfLines={1}>
                    {staffName}
                  </Text>
                </TextSkeleton>
                <TextSkeleton loading={isSkeletonLoading} width={80} height={16} borderRadius={4} style={{ marginTop: 2 }}>
                  <Text style={styles.staffRoleText}>{staffRole}</Text>
                </TextSkeleton>
                <TextSkeleton loading={isSkeletonLoading} width={90} height={16} borderRadius={4} style={{ marginTop: 2 }}>
                  <Text style={styles.staffHoursText}>{staffHours}</Text>
                </TextSkeleton>
              </View>
            </View>

            {/* Vertical Divider: Line 169 (height: 96px) */}
            <View style={styles.cardVerticalDivider} />

            {/* Right Column: Stats (135x204px) */}
            <View style={styles.staffStatsCol}>
              {/* Stat 1: Clients Served */}
              <View style={styles.statBlock}>
                <TextSkeleton loading={isSkeletonLoading} width={30} height={20} borderRadius={4}>
                  <Text style={styles.statNumber}>43</Text>
                </TextSkeleton>
                <Text style={styles.statLabel}>Client served</Text>
              </View>

              {/* Stat 2: Rating & Reviews */}
              <View style={styles.statBlock}>
                <TextSkeleton loading={isSkeletonLoading} width={80} height={20} borderRadius={4}>
                  <View style={styles.ratingNumberRow}>
                    <StarGoldIcon size={20} color="#F89B18" />
                    <Text style={styles.ratingBold}>{staffRating}</Text>
                    <Text style={styles.ratingCount}>(321)</Text>
                  </View>
                </TextSkeleton>
                <Text style={styles.statLabel}>Rate & Review</Text>
              </View>

              {/* Stat 3: Work Days */}
              <View style={styles.statBlock}>
                <TextSkeleton loading={isSkeletonLoading} width={75} height={20} borderRadius={4}>
                  <Text style={styles.statNumber}>Mon & Sun</Text>
                </TextSkeleton>
                <Text style={styles.statLabel}>Work Days</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── 1:1 Figma Experience & Trust Specs (bisola specs, top: 430px) ── */}
        <View style={styles.specsContainer}>
          {/* Row 1: 5 Years experience */}
          <View style={styles.specRow}>
            <Briefcase01Icon size={24} color="rgba(0, 8, 20, 0.96)" />
            <TextSkeleton loading={isSkeletonLoading} width={140} height={16} borderRadius={4}>
              <Text style={styles.specTextPrimary}>
                {staffExperience.toLowerCase().includes('year') ? staffExperience : `${staffExperience} experience`}
              </Text>
            </TextSkeleton>
          </View>

          {/* Row 2: 43 Served clients */}
          <View style={styles.specRow}>
            <UserGroupIcon size={24} color="#141B34" />
            <TextSkeleton loading={isSkeletonLoading} width={120} height={16} borderRadius={4}>
              <Text style={styles.specTextDark}>43 Served clients</Text>
            </TextSkeleton>
          </View>

          {/* Row 3: 55 Recommendation */}
          <View style={styles.specRow}>
            <IdVerifiedIcon size={24} color="#141B34" />
            <TextSkeleton loading={isSkeletonLoading} width={135} height={16} borderRadius={4}>
              <Text style={styles.specTextDark}>55 Recommendation</Text>
            </TextSkeleton>
          </View>

          {/* Row 4: Verified by luminous Lux */}
          <View style={styles.specRow}>
            <CheckmarkBadge02Icon size={24} color="#141B34" />
            <TextSkeleton loading={isSkeletonLoading} width={170} height={16} borderRadius={4}>
              <Text style={styles.specTextDark}>Verified by luminous Lux</Text>
            </TextSkeleton>
          </View>
        </View>

        {/* ── 1:1 Figma Portfolio Section (salon protfolio, top: 654px) ── */}
        <View style={styles.portfolioSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Portfolio</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.seeAllCircleButton}
              onPress={() =>
                safeRouter.push({
                  pathname: '/staff-portfolio' as any,
                  params: { name: staffName, id: params.id },
                })
              }
            >
              <ArrowRight02Icon size={24} color="rgba(0, 8, 20, 0.96)" />
            </TouchableOpacity>
          </View>

          {/* 3x2 Grid of 103.33 x 103.33px images (total 358 x 238.67px) */}
          <View style={styles.portfolioGrid}>
            <View style={styles.portfolioRow}>
              {portfolioPreviewItems.slice(0, 3).map((item, index) => (
                <TouchableOpacity
                  key={item.id || index}
                  activeOpacity={0.85}
                  onPress={() => handlePortfolioThumbPress(index)}
                  style={styles.portfolioCell}
                >
                  <Image
                    source={item.image}
                    style={styles.portfolioThumb}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.portfolioRow}>
              {portfolioPreviewItems.slice(3, 6).map((item, index) => (
                <TouchableOpacity
                  key={item.id || index + 3}
                  activeOpacity={0.85}
                  onPress={() => handlePortfolioThumbPress(index + 3)}
                  style={styles.portfolioCell}
                >
                  <Image
                    source={item.image}
                    style={styles.portfolioThumb}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* ── 1:1 Figma Customer Review Tags (user efficiency tag, top: 997px) ── */}
        <View style={styles.efficiencySection}>
          <Text style={styles.sectionTitle}>Based on customers review</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.efficiencyScroll}
          >
            {EFFICIENCY_TAGS.map((tag, idx) => (
              <View key={idx} style={styles.efficiencyPill}>
                <Text style={styles.efficiencyEmoji}>{tag.emoji}</Text>
                <Text style={styles.efficiencyLabel}>{tag.label}</Text>
                <Text style={styles.efficiencyCount}>{tag.count}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── 1:1 Figma Reviews & Rating (bisola review and rate, top: 1125px) ── */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Review & Rating</Text>

          {/* Horizontal Swipeable Review Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reviewsScroll}
          >
            {/* Review Card 1 */}
            <View style={styles.reviewCard}>
              <Image
                source={require('../../../assets/images/profile/samuel_obanuju_avatar.png')}
                style={styles.reviewerAvatar}
              />

              <View style={styles.reviewContent}>
                {/* Username & Star Rating */}
                <View style={styles.reviewerTopRow}>
                  <Text style={styles.reviewerName}>Samuel Obanuju</Text>
                  <View style={styles.reviewDot} />
                  <View style={styles.starsRow}>
                    <StarGoldIcon size={16} />
                    <StarGoldIcon size={16} />
                    <StarGoldIcon size={16} />
                    <StarGoldIcon size={16} />
                    <StarHalfGoldIcon size={16} />
                  </View>
                </View>

                {/* Comment */}
                <TextSkeleton loading={isSkeletonLoading} width={220} height={16} borderRadius={4}>
                  <Text style={styles.reviewComment}>
                    The service was premium, love the good work guys keep it up.
                  </Text>
                </TextSkeleton>

                {/* Date & Time */}
                <View style={styles.reviewDateRow}>
                  <Text style={styles.reviewDateText}>12/02/2026</Text>
                  <View style={styles.reviewDot} />
                  <Text style={styles.reviewDateText}>12:04:20</Text>
                </View>
              </View>
            </View>

            {/* Vertical Divider */}
            <View style={styles.reviewDivider} />

            {/* Review Card 2 */}
            <View style={styles.reviewCard}>
              <Image
                source={require('../../../assets/images/profile/samuel_obanuju_avatar.png')}
                style={styles.reviewerAvatar}
              />

              <View style={styles.reviewContent}>
                <View style={styles.reviewerTopRow}>
                  <Text style={styles.reviewerName}>Jessica Amadi</Text>
                  <View style={styles.reviewDot} />
                  <View style={styles.starsRow}>
                    <StarGoldIcon size={16} />
                    <StarGoldIcon size={16} />
                    <StarGoldIcon size={16} />
                    <StarGoldIcon size={16} />
                    <StarGoldIcon size={16} />
                  </View>
                </View>

                <TextSkeleton loading={isSkeletonLoading} width={220} height={16} borderRadius={4}>
                  <Text style={styles.reviewComment}>
                    Very patient and clean nail extensions. Highly recommend!
                  </Text>
                </TextSkeleton>

                <View style={styles.reviewDateRow}>
                  <Text style={styles.reviewDateText}>10/02/2026</Text>
                  <View style={styles.reviewDot} />
                  <Text style={styles.reviewDateText}>15:20:10</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── 1:1 Figma Sticky Bottom Action Bar (terminate staff button, top: 1469px) ── */}
      <View style={styles.bottomBarContainer}>
        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.messageButton}
          onPress={() => {
            const staffId = params.id || storeStaff?.id || staffName.toLowerCase().replace(/\s+/g, '-');
            safeRouter.push({
              pathname: '/chat' as any,
              params: {
                id: staffId,
                recipientId: staffId,
                name: staffName,
                recipientName: staffName,
                role: staffRole,
              },
            });
          }}
        >
          <MessageMultiple02Icon size={24} color="#FFFFFF" />
          <Text style={styles.messageButtonText}>Message {staffName}</Text>
        </TouchableOpacity>
      </View>

      <NativeDockSpacer />
    </SafeAreaView>
  );
}

export default ProviderStaffProfileScreen;

// ── 1:1 Figma Converted Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* ── Header ── */
  headerContainer: {
    height: 64,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
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
  headerTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  sharePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },

  /* ── ScrollView ── */
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },

  /* ── Hero Staff Card (358x256px total with bottom underlay) ── */
  heroCardContainer: {
    width: 358,
    height: 256,
    position: 'relative',
    marginBottom: 40,
  },
  statusTagUnderlay: {
    position: 'absolute',
    width: 358,
    height: 56,
    left: 0,
    top: 200,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingVertical: 4,
    paddingHorizontal: 8,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
    zIndex: 0,
  },
  statusTagText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(12, 121, 12, 0.96)',
    textAlign: 'center',
  },
  statusUnderlayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  elevatedCard: {
    width: 358,
    height: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    zIndex: 1,
  },
  staffLeftCol: {
    width: 132,
    height: 192,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  avatarWrap: {
    width: 104,
    height: 104,
    borderRadius: 56,
    position: 'relative',
  },
  avatarImage: {
    width: 104,
    height: 104,
    borderRadius: 56,
    backgroundColor: '#EAEAEA',
  },
  shieldBadgeWrap: {
    position: 'absolute',
    left: 74,
    top: 74,
  },
  staffInfoWrap: {
    width: 132,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  staffNameText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  staffRoleText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  staffHoursText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  cardVerticalDivider: {
    width: 1,
    height: 96,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  staffStatsCol: {
    width: 135,
    height: 204,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  statBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statNumber: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
    textAlign: 'center',
  },
  statLabel: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  ratingNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingBold: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  ratingCount: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  /* ── Experience & Trust Specs (278x184px, left: 16px) ── */
  specsContainer: {
    width: 358,
    gap: 8,
    marginBottom: 40,
    alignSelf: 'center',
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 16,
  },
  specTextPrimary: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  specTextDark: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },

  /* ── Portfolio Section (358x302.67px) ── */
  portfolioSection: {
    width: 358,
    gap: 24,
    marginBottom: 40,
    alignSelf: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 358,
    height: 40,
  },
  sectionTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
  },
  seeAllCircleButton: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  portfolioGrid: {
    width: 358,
    height: 238.67,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  portfolioRow: {
    width: 358,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  portfolioCell: {
    width: 103.33,
    height: 103.33,
    borderRadius: 24,
    overflow: 'hidden',
  },
  portfolioThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
  },

  /* ── Customer Review Efficiency Tags (358x88px) ── */
  efficiencySection: {
    width: 358,
    gap: 16,
    marginBottom: 40,
    alignSelf: 'center',
  },
  efficiencyScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingRight: 16,
  },
  efficiencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    gap: 8,
  },
  efficiencyEmoji: {
    fontSize: 18,
  },
  efficiencyLabel: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  efficiencyCount: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  /* ── Review & Rating Section (360x176px) ── */
  reviewsSection: {
    width: 358,
    gap: 24,
    marginBottom: 40,
    alignSelf: 'center',
  },
  reviewsScroll: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingRight: 16,
  },
  reviewCard: {
    width: 316,
    height: 112,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 8,
    gap: 8,
  },
  reviewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAEAEA',
  },
  reviewContent: {
    flex: 1,
    height: 96,
    gap: 8,
  },
  reviewerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 24,
  },
  reviewerName: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  reviewDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D9D9D9',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewComment: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  reviewDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 16,
  },
  reviewDateText: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  reviewDivider: {
    width: 1,
    height: 100,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },

  /* ── Sticky Bottom Bar (390x80px, top: 1469px) ── */
  bottomBarContainer: {
    height: 80,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageButton: {
    width: 358,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  messageButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },
});
