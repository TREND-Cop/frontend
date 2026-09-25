import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, BadgeCheck, ArrowRight, Star } from 'lucide-react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { ShareIcon } from '../../components/ShareIcon';
import { shareStore } from '../../utils/shareStore';
import { previewStore } from '../../utils/previewStore';
import { getSafeBottomPadding } from '../../utils/safeArea';
import { typography } from '../../constants/theme';

// ── Custom Figma-matching spec icons ──
const WorkBagIcon = ({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 3.5C14 2.67157 13.3284 2 12.5 2H11.5C10.6716 2 10 2.67157 10 3.5V5H14V3.5Z" stroke={color} strokeWidth={1.5} />
    <Rect x="3" y="5" width="18" height="14" rx="3" stroke={color} strokeWidth={1.5} />
    <Path d="M3 10H21" stroke={color} strokeWidth={1.5} />
    <Path d="M10 10V12.5C10 12.7761 10.2239 13 10.5 13H13.5C13.7761 13 14 12.7761 14 12.5V10" stroke={color} strokeWidth={1.5} />
  </Svg>
);

const ServedClientsIcon = ({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="7" r="3" stroke={color} strokeWidth={1.5} />
    <Path d="M3 19C3 15.6863 5.68629 13 9 13C12.3137 13 15 15.6863 15 19" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Circle cx="17" cy="8" r="2.5" stroke={color} strokeWidth={1.5} />
    <Path d="M17 13.5C19.4853 13.5 21.5 15.5147 21.5 18" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

const RecommendIcon = ({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 21H6C4.89543 21 4 20.1046 4 19V14C4 12.8954 4.89543 12 6 12H8V21Z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    <Path d="M8 12L10.4382 4.56108C10.7878 3.51447 11.7765 2.82611 12.879 2.89064L13 2.89777C13.5523 2.93011 14 3.38 14 3.93272V8H18.5C19.6046 8 20.5 8.89543 20.5 10V10.4877C20.5 10.6593 20.4768 10.8301 20.4312 10.9954L18.6532 17.4431C18.353 18.5324 17.3646 19.2877 16.2356 19.2877L10 19.2877C8.89543 19.2877 8 18.3923 8 17.2877V12Z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    <Circle cx="18.5" cy="3.5" r="2.5" stroke={color} strokeWidth={1.2} />
  </Svg>
);

const VerifiedBadgeIcon = ({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L14.09 4.26L17 3.64L17.18 6.57L19.8 8.06L18.46 10.66L19.8 13.26L17.18 14.75L17 17.68L14.09 17.06L12 19.32L9.91 17.06L7 17.68L6.82 14.75L4.2 13.26L5.54 10.66L4.2 8.06L6.82 6.57L7 3.64L9.91 4.26L12 2Z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    <Path d="M9 11L11 13L15 9" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export type WorkStatus = 'available' | 'in_service' | 'closed' | 'unavailable';

const STATUS_CONFIG: Record<
  WorkStatus,
  {
    label: string;
    bg: string;
    color: string;
  }
> = {
  available: {
    label: 'Available for work',
    bg: 'rgba(207, 237, 207, 0.8)',
    color: 'rgba(12, 121, 12, 0.96)',
  },
  in_service: {
    label: 'In Service',
    bg: 'rgba(242, 233, 218, 0.96)',
    color: 'rgba(245, 149, 15, 0.96)',
  },
  closed: {
    label: 'Unavailable',
    bg: 'rgba(254, 242, 242, 0.96)',
    color: 'rgba(204, 41, 41, 0.96)',
  },
  unavailable: {
    label: 'Unavailable',
    bg: 'rgba(254, 242, 242, 0.96)',
    color: 'rgba(204, 41, 41, 0.96)',
  },
};

const nailPortfolioItems = [
  { image: require('../../../assets/images/profile/14dcc3440340f9f140251ac160473457c89b198c.jpg'), title: 'Glossy French Manicure', price: '₦12,500', duration: '45min', rating: '4.9' },
  { image: require('../../../assets/images/profile/30b9a5ab22324bd8357f666111d5584ad2e3c83e.jpg'), title: 'Abstract Marble Nails', price: '₦14,200', duration: '1hr', rating: '4.8' },
  { image: require('../../../assets/images/profile/eb3281d09659fdef5e45647cf5529f61e83190f1.jpg'), title: 'Chrome Finish Acrylics', price: '₦16,000', duration: '1hr 15min', rating: '5.0' },
  { image: require('../../../assets/images/profile/dry_wow_pedicure.jpg'), title: 'Dry Wow French Pedicure', price: '₦14,000', duration: '50min', rating: '4.9' },
  { image: require('../../../assets/images/profile/ee549b1ea85771de4cd8695943af94f474fedf19.jpg'), title: 'Feet & Fingers Combo Art', price: '₦22,000', duration: '2hr', rating: '5.0' },
  { image: require('../../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg'), title: 'Chocolate Brown Acrylic Nails', price: '₦16,000', duration: '1hr 15min', rating: '4.8' },
];

const barberPortfolioItems = [
  { image: require('../../../assets/images/services/men_haircut.png'), title: 'Low Skin Fade & Lineup', price: '₦8,500', duration: '40min', rating: '4.9' },
  { image: require('../../../assets/images/profile/men_braids.jpg'), title: 'Corn Row Braids', price: '₦15,000', duration: '1hr 30min', rating: '4.8' },
  { image: require('../../../assets/images/trending/trend_1.png'), title: 'Textured Taper Fade', price: '₦9,000', duration: '45min', rating: '4.9' },
  { image: require('../../../assets/images/trending/trend_2.png'), title: 'Barrel Roll Locs Styling', price: '₦16,000', duration: '1hr 15min', rating: '4.7' },
  { image: require('../../../assets/images/trending/trend_3.png'), title: 'Classic Beard Sculpting', price: '₦6,500', duration: '30min', rating: '4.8' },
  { image: require('../../../assets/images/popular/pop_men_haircut.png'), title: 'Buzz Cut & Razor Line', price: '₦7,500', duration: '35min', rating: '4.9' },
];

const skincarePortfolioItems = [
  { image: require('../../../assets/images/profile/1007674598.jpg'), title: 'Deep Pore Cleansing Facial', price: '₦18,000', duration: '1hr', rating: '4.9' },
  { image: require('../../../assets/images/profile/1007653036.jpg'), title: 'Hydra Glow Therapy', price: '₦25,000', duration: '1hr 15min', rating: '5.0' },
  { image: require('../../../assets/images/profile/1007653038.jpg'), title: 'Dermaplaning & Exfoliation', price: '₦20,000', duration: '50min', rating: '4.8' },
  { image: require('../../../assets/images/profile/cont2.jpg'), title: 'Organic Skin Rejuvenation', price: '₦22,500', duration: '1hr', rating: '4.9' },
  { image: require('../../../assets/images/profile/cont3.jpg'), title: 'Acne Defense Treatment', price: '₦19,000', duration: '45min', rating: '4.7' },
  { image: require('../../../assets/images/profile/1007664887.jpg'), title: 'Collagen Boost Session', price: '₦28,000', duration: '1hr 30min', rating: '4.9' },
];

const PROFILES: Record<string, any> = {
  p1: {
    id: 'p1',
    name: 'Bisola Andrew',
    title: 'Nail Art Specialist',
    avatar: { uri: 'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?w=400&q=80' },
    workHours: '7:30am - 9:30pm',
    clientsServed: '101',
    rating: '4.4',
    reviewCount: '101',
    workDays: 'Mon & Sun',
    experience: '5 Years',
    recommendations: '55',
    verifiedBy: 'GoodCare Spa',
    portfolioType: 'nails',
  },
  '1': {
    id: 'p1',
    name: 'Bisola Andrew',
    title: 'Nail Art Specialist',
    avatar: { uri: 'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?w=400&q=80' },
    workHours: '7:30am - 9:30pm',
    clientsServed: '101',
    rating: '4.4',
    reviewCount: '101',
    workDays: 'Mon & Sun',
    experience: '5 Years',
    recommendations: '55',
    verifiedBy: 'GoodCare Spa',
    portfolioType: 'nails',
  },
  p2: {
    id: 'p2',
    name: 'Samuel Dare',
    title: 'Barber & Stylist',
    avatar: { uri: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&q=80' },
    workHours: '8:00am - 8:00pm',
    clientsServed: '99',
    rating: '4.0',
    reviewCount: '99',
    workDays: 'Tue & Sat',
    experience: '3 Years',
    recommendations: '42',
    verifiedBy: 'Imperial Care',
    portfolioType: 'barber',
  },
  '2': {
    id: 'p2',
    name: 'Samuel Dare',
    title: 'Barber & Stylist',
    avatar: { uri: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&q=80' },
    workHours: '8:00am - 8:00pm',
    clientsServed: '99',
    rating: '4.0',
    reviewCount: '99',
    workDays: 'Tue & Sat',
    experience: '3 Years',
    recommendations: '42',
    verifiedBy: 'Imperial Care',
    portfolioType: 'barber',
  },
  p3: {
    id: 'p3',
    name: 'Zainab Ahmed',
    title: 'Aesthetician & Skincare',
    avatar: { uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80' },
    workHours: '9:00am - 6:00pm',
    clientsServed: '142',
    rating: '4.8',
    reviewCount: '142',
    workDays: 'Wed & Fri',
    experience: '4 Years',
    recommendations: '68',
    verifiedBy: 'Luxe Aesthetics',
    portfolioType: 'skincare',
  },
  '3': {
    id: 'p3',
    name: 'Zainab Ahmed',
    title: 'Aesthetician & Skincare',
    avatar: { uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80' },
    workHours: '9:00am - 6:00pm',
    clientsServed: '142',
    rating: '4.8',
    reviewCount: '142',
    workDays: 'Wed & Fri',
    experience: '4 Years',
    recommendations: '68',
    verifiedBy: 'Luxe Aesthetics',
    portfolioType: 'skincare',
  },
  p4: {
    id: 'p4',
    name: 'David Adeleke',
    title: 'Master Barber & Stylist',
    avatar: { uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
    workHours: '8:30am - 7:30pm',
    clientsServed: '210',
    rating: '4.9',
    reviewCount: '210',
    workDays: 'Mon - Sat',
    experience: '6 Years',
    recommendations: '89',
    verifiedBy: 'Signature Cuts',
    portfolioType: 'barber',
  },
  '4': {
    id: 'p4',
    name: 'David Adeleke',
    title: 'Master Barber & Stylist',
    avatar: { uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
    workHours: '8:30am - 7:30pm',
    clientsServed: '210',
    rating: '4.9',
    reviewCount: '210',
    workDays: 'Mon - Sat',
    experience: '6 Years',
    recommendations: '89',
    verifiedBy: 'Signature Cuts',
    portfolioType: 'barber',
  },
  p5: {
    id: 'p5',
    name: 'Chioma Okafor',
    title: 'Cosmetologist & Lash Expert',
    avatar: { uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80' },
    workHours: '9:00am - 7:00pm',
    clientsServed: '87',
    rating: '4.6',
    reviewCount: '87',
    workDays: 'Tue - Sun',
    experience: '4 Years',
    recommendations: '34',
    verifiedBy: 'Glow Beauty Lounge',
    portfolioType: 'nails',
  },
  '5': {
    id: 'p5',
    name: 'Chioma Okafor',
    title: 'Cosmetologist & Lash Expert',
    avatar: { uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80' },
    workHours: '9:00am - 7:00pm',
    clientsServed: '87',
    rating: '4.6',
    reviewCount: '87',
    workDays: 'Tue - Sun',
    experience: '4 Years',
    recommendations: '34',
    verifiedBy: 'Glow Beauty Lounge',
    portfolioType: 'nails',
  },
  p6: {
    id: 'p6',
    name: 'Emeka Nwosu',
    title: 'Dreadlocks & Braids Specialist',
    avatar: { uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80' },
    workHours: '8:00am - 9:00pm',
    clientsServed: '175',
    rating: '4.7',
    reviewCount: '175',
    workDays: 'Mon - Fri',
    experience: '7 Years',
    recommendations: '76',
    verifiedBy: 'The Royal Treatment',
    portfolioType: 'barber',
  },
  '6': {
    id: 'p6',
    name: 'Emeka Nwosu',
    title: 'Dreadlocks & Braids Specialist',
    avatar: { uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80' },
    workHours: '8:00am - 9:00pm',
    clientsServed: '175',
    rating: '4.7',
    reviewCount: '175',
    workDays: 'Mon - Fri',
    experience: '7 Years',
    recommendations: '76',
    verifiedBy: 'The Royal Treatment',
    portfolioType: 'barber',
  },
  // Staff profiles
  staff_1: {
    id: 'staff_1',
    name: 'Bisola Andrew',
    title: 'Nail Art Specialist',
    avatar: require('../../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg'),
    workHours: '8:00am - 8:00pm',
    clientsServed: '142',
    rating: '4.8',
    reviewCount: '142',
    workDays: 'Mon & Sun',
    experience: '5 Years',
    recommendations: '60',
    verifiedBy: 'Luminous Lux',
    portfolioType: 'nails',
  },
  staff_2: {
    id: 'staff_2',
    name: 'Essie Micheal',
    title: 'Massage Therapist',
    avatar: require('../../../assets/images/profile/30b9a5ab22324bd8357f666111d5584ad2e3c83e.jpg'),
    workHours: '9:00am - 7:00pm',
    clientsServed: '98',
    rating: '4.7',
    reviewCount: '98',
    workDays: 'Tue - Fri',
    experience: '4 Years',
    recommendations: '45',
    verifiedBy: 'Luminous Lux',
    portfolioType: 'skincare',
  },
  staff_3: {
    id: 'staff_3',
    name: 'Tunde Adeleke',
    title: 'Senior Barber',
    avatar: require('../../../assets/images/profile/cont1.jpg'),
    workHours: '8:00am - 9:00pm',
    clientsServed: '215',
    rating: '4.9',
    reviewCount: '215',
    workDays: 'Mon - Sat',
    experience: '6 Years',
    recommendations: '92',
    verifiedBy: 'Luminous Lux',
    portfolioType: 'barber',
  },
  staff_4: {
    id: 'staff_4',
    name: 'Chidinma Okonkwo',
    title: 'Facial & Skin Specialist',
    avatar: require('../../../assets/images/profile/cont2.jpg'),
    workHours: '9:30am - 6:30pm',
    clientsServed: '76',
    rating: '4.6',
    reviewCount: '76',
    workDays: 'Wed - Sun',
    experience: '3 Years',
    recommendations: '38',
    verifiedBy: 'Luminous Lux',
    portfolioType: 'skincare',
  },
};

const getProfessionalById = (id?: string | string[], params?: any) => {
  const targetId = (Array.isArray(id) ? id[0] : id) || 'p1';
  
  // Normalize staff ID if prefixed like staff_salon2_1 -> staff_1
  let lookupId = targetId;
  if (targetId.startsWith('staff_') && targetId.includes('_')) {
    const parts = targetId.split('_');
    const lastNum = parts[parts.length - 1];
    if (PROFILES[`staff_${lastNum}`]) {
      lookupId = `staff_${lastNum}`;
    }
  }

  const base = PROFILES[lookupId];
  if (base) {
    return {
      ...base,
      id: targetId,
      name: (params?.name as string) || base.name,
      title: (params?.title as string) || (params?.role as string) || base.title,
      verifiedBy: (params?.workplace as string) || (params?.salonName as string) || base.verifiedBy,
      experience: (params?.experience as string) || base.experience,
      rating: params?.rating ? Number(params.rating).toFixed(1) : base.rating,
      reviewCount: (params?.reviewsCount ? params.reviewsCount.replace(/\D/g, '') : params?.reviewCount) || base.reviewCount,
    };
  }

  // Dynamic fallback synthesis for any unknown specialist ID
  const isBarber = (params?.role || params?.title || '').toLowerCase().includes('barber') ||
                   (params?.role || params?.title || '').toLowerCase().includes('hair');
  const isSkin = (params?.role || params?.title || '').toLowerCase().includes('skin') ||
                 (params?.role || params?.title || '').toLowerCase().includes('facial') ||
                 (params?.role || params?.title || '').toLowerCase().includes('massage');

  const portfolioType = isBarber ? 'barber' : isSkin ? 'skincare' : 'nails';

  return {
    id: targetId,
    name: (params?.name as string) || (params?.providerName as string) || 'Specialist Professional',
    title: (params?.title as string) || (params?.role as string) || 'Beauty & Wellness Specialist',
    avatar: params?.avatar || params?.image || { uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80' },
    workHours: (params?.workHours as string) || '8:00am - 8:00pm',
    clientsServed: (params?.clientsServed as string) || (params?.reviewsCount ? params.reviewsCount.replace(/\D/g, '') : '85') || '85',
    rating: params?.rating ? Number(params.rating).toFixed(1) : '4.8',
    reviewCount: (params?.reviewsCount ? params.reviewsCount.replace(/\D/g, '') : params?.reviewCount) || '95',
    workDays: (params?.workDays as string) || 'Mon - Sat',
    experience: (params?.experience as string) || '4 Years',
    recommendations: (params?.recommendations as string) || '48',
    verifiedBy: (params?.workplace as string) || (params?.salonName as string) || 'TREND Verified Partner',
    portfolioType,
  };
};

export default function ProfessionalProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // Dynamic profile lookup based on route parameter and incoming params
  const profile = getProfessionalById(params.id, params);
  const profileName = (params.name as string) || profile.name;

  const initialStatus: WorkStatus = (params.status as WorkStatus) || (profile.status as WorkStatus) || 'available';
  const [currentStatus, setCurrentStatus] = useState<WorkStatus>(initialStatus);

  const cycleStatus = () => {
    if (currentStatus === 'available') setCurrentStatus('in_service');
    else if (currentStatus === 'in_service') setCurrentStatus('unavailable');
    else setCurrentStatus('available');
  };

  const portfolioItems =
    profile.portfolioType === 'barber'
      ? barberPortfolioItems
      : profile.portfolioType === 'skincare'
      ? skincarePortfolioItems
      : nailPortfolioItems;
  const portfolioImages = portfolioItems.map((item) => item.image);

  const reviewTags = [
    { label: 'Professionalism', count: 22, emoji: '💼' },
    { label: 'Cleanness', count: 12, emoji: '✨' },
    { label: 'Hospitality', count: 30, emoji: '🤝' },
    { label: 'Communication', count: 25, emoji: '🗣' },
    { label: 'Price Accuracy', count: 100, emoji: '💰' },
    { label: 'Comfort', count: 41, emoji: '🛋' },
    { label: 'Environment', count: 31, emoji: '🌿' },
    { label: 'Location', count: 80, emoji: '📍' },
    { label: 'Speed', count: 90, emoji: '⚡' },
  ];

  const avatarSource = typeof profile.avatar === 'string' ? { uri: profile.avatar } : profile.avatar;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)' as any)} 
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>{profileName.split(' ')[0]} Profile</Text>
          
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={() =>
              shareStore.openShare({
                title: `${profileName} Profile`,
                status: currentStatus === 'available' ? 'Available' : 'Unavailable',
                statusColor: STATUS_CONFIG[currentStatus].color,
                url: `https://trend.app/professional/${profile.id}`,
                avatar: avatarSource,
              })
            }
          >
            <ShareIcon size={24} color="#141B34" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Profile Card Container with Bottom Status Tag */}
          <View style={styles.profileCardContainer}>
            <View style={styles.profileCard}>
              {/* Left Side: Avatar and Info */}
              <View style={styles.profileCardLeft}>
                <View style={styles.avatarContainer}>
                  <Image source={avatarSource} style={styles.avatar} resizeMode="cover" />
                  <View style={styles.badgeContainer}>
                    <BadgeCheck size={18} color="#FFFFFF" fill="rgba(26, 130, 255, 0.9)" />
                  </View>
                </View>
                <View style={styles.nameContainer}>
                  <Text style={styles.profileName}>{profileName}</Text>
                  <Text style={styles.profileTitle}>{profile.title}</Text>
                  <Text style={styles.workHours}>{profile.workHours}</Text>
                </View>
              </View>

              {/* Vertical Divider */}
              <View style={styles.verticalDivider} />

              {/* Right Side: Stats */}
              <View style={styles.profileCardRight}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{profile.clientsServed}</Text>
                  <Text style={styles.statLabel}>Client served</Text>
                </View>

                <View style={styles.statItem}>
                  <View style={styles.ratingRow}>
                    <Star size={16} color="rgba(245, 149, 15, 0.96)" fill="rgba(245, 149, 15, 0.96)" />
                    <Text style={styles.statValue}>{profile.rating}</Text>
                    <Text style={styles.statValueLight}>({profile.reviewCount})</Text>
                  </View>
                  <Text style={styles.statLabel}>Rate & Review</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{profile.workDays}</Text>
                  <Text style={styles.statLabel}>Work Days</Text>
                </View>
              </View>
            </View>

            {/* Status Tag Below Profile */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={cycleStatus}
              style={[
                styles.statusTag,
                { backgroundColor: STATUS_CONFIG[currentStatus].bg },
              ]}
            >
              <Text
                style={[
                  styles.statusTagText,
                  { color: STATUS_CONFIG[currentStatus].color },
                ]}
              >
                {STATUS_CONFIG[currentStatus].label}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Specs List */}
          <View style={styles.specsContainer}>
            <View style={styles.specRow}>
              <WorkBagIcon size={24} />
              <Text style={styles.specText}>{profile.experience} experience</Text>
            </View>
            <View style={styles.specRow}>
              <ServedClientsIcon size={24} />
              <Text style={styles.specText}>{profile.clientsServed} Served clients</Text>
            </View>
            <View style={styles.specRow}>
              <RecommendIcon size={24} />
              <Text style={styles.specText}>{profile.recommendations} Recommendation</Text>
            </View>
            <View style={styles.specRow}>
              <VerifiedBadgeIcon size={24} />
              <Text style={styles.specText}>Verified by {profile.verifiedBy}</Text>
            </View>
          </View>

          {/* ── Portfolio Section (Figma: 3x2 Grid, gap: 24px, rowGap: 32px) ── */}
          <View style={styles.portfolioSectionContainer}>
            <TouchableOpacity 
              style={styles.portfolioHeader}
              activeOpacity={0.7}
              onPress={() => {
                previewStore.setPreviewImages(
                  portfolioImages,
                  `${profile.name} Portfolio`,
                  portfolioItems
                );
                router.push({
                  pathname: '/professional/portfolio',
                  params: {
                    id: profile.id,
                    name: profile.name,
                    title: `${profile.name} Portfolio`,
                  },
                } as any);
              }}
            >
              <Text style={styles.portfolioTitle}>Portfolio</Text>
              <View style={styles.circularButton}>
                <ArrowRight size={20} color="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} />
              </View>
            </TouchableOpacity>

            <View style={styles.portfolioGrid}>
              {/* Row 1 (3 items) */}
              <View style={styles.portfolioRow}>
                {portfolioImages.slice(0, 3).map((img, index) => (
                  <TouchableOpacity 
                    key={index} 
                    activeOpacity={0.8}
                    style={styles.portfolioImageWrapper}
                    onPress={() => {
                      previewStore.setPreviewImages(
                        portfolioImages,
                        `${profile.name} Portfolio`,
                        portfolioItems,
                        index
                      );
                      router.push({ pathname: '/professional/gallery-preview', params: { index, initialIndex: index, source: 'portfolio', title: `${profile.name} Portfolio` } });
                    }}
                  >
                    <Image source={img} style={styles.portfolioImage} resizeMode="cover" />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Row 2 (3 items) */}
              <View style={styles.portfolioRow}>
                {portfolioImages.slice(3, 6).map((img, index) => (
                  <TouchableOpacity 
                    key={index + 3} 
                    activeOpacity={0.8}
                    style={styles.portfolioImageWrapper}
                    onPress={() => {
                      previewStore.setPreviewImages(
                        portfolioImages,
                        `${profile.name} Portfolio`,
                        portfolioItems,
                        index + 3
                      );
                      router.push({ pathname: '/professional/gallery-preview', params: { index: index + 3, initialIndex: index + 3, source: 'portfolio', title: `${profile.name} Portfolio` } });
                    }}
                  >
                    <Image source={img} style={styles.portfolioImage} resizeMode="cover" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Customer Reviews Tags Section */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Based on customers review</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.horizontalScroll}
              contentContainerStyle={styles.tagsScrollContent}
            >
              {reviewTags.map((tag, index) => (
                <View key={index} style={styles.reviewTag}>
                  <Text style={styles.tagEmoji}>{tag.emoji}</Text>
                  <Text style={styles.tagLabel}>{tag.label}</Text>
                  <Text style={styles.tagCount}>{tag.count}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Reviews & Ratings Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Review & Rating</Text>
              <TouchableOpacity 
                style={styles.circularButton} 
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: '/professional/reviews',
                    params: {
                      id: profile.id,
                      name: profile.name,
                      title: `${profile.name} Reviews`,
                    },
                  } as any)
                }
              >
                <ArrowRight size={24} color="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.horizontalScroll}
              contentContainerStyle={styles.reviewsScrollContent}
            >
              
              {/* Single Review Card */}
              <TouchableOpacity 
                style={styles.reviewCard} 
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname: '/professional/reviews',
                    params: {
                      id: profile.id,
                      name: profile.name,
                      title: `${profile.name} Reviews`,
                    },
                  } as any)
                }
              >
                <Image source={require('../../../assets/images/profile/eb3281d09659fdef5e45647cf5529f61e83190f1.jpg')} style={styles.reviewerAvatar} resizeMode="cover" />
                <View style={styles.reviewDetails}>
                  <View style={styles.reviewHeaderRow}>
                    <Text style={styles.reviewerName}>Samuel Obanuju</Text>
                    <View style={styles.metaDot} />
                    <View style={styles.starsRow}>
                      <Star size={12} color="rgba(245, 149, 15, 0.96)" fill="rgba(245, 149, 15, 0.96)" />
                      <Star size={12} color="rgba(245, 149, 15, 0.96)" fill="rgba(245, 149, 15, 0.96)" />
                      <Star size={12} color="rgba(245, 149, 15, 0.96)" fill="rgba(245, 149, 15, 0.96)" />
                      <Star size={12} color="rgba(245, 149, 15, 0.96)" fill="rgba(245, 149, 15, 0.96)" />
                      <Star size={12} color="rgba(245, 149, 15, 0.96)" fill="rgba(245, 149, 15, 0.96)" />
                    </View>
                  </View>
                  <Text style={styles.reviewText}>The service was premium, love the good work guys keep it up.</Text>
                  <View style={styles.reviewDateRow}>
                    <Text style={styles.reviewDate}>12/02/2026</Text>
                    <View style={styles.metaDot} />
                    <Text style={styles.reviewDate}>12:04:20</Text>
                  </View>
                </View>
                <View style={styles.verticalDividerThin} />
              </TouchableOpacity>

              {/* Duplicate for demo scrolling */}
              <TouchableOpacity 
                style={styles.reviewCard} 
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname: '/professional/reviews',
                    params: {
                      id: profile.id,
                      name: profile.name,
                      title: `${profile.name} Reviews`,
                    },
                  } as any)
                }
              >
                <Image source={require('../../../assets/images/profile/d3cd9e95ed9478ab3ee7c457e48471054dd65223.jpg')} style={styles.reviewerAvatar} resizeMode="cover" />
                <View style={styles.reviewDetails}>
                  <View style={styles.reviewHeaderRow}>
                    <Text style={styles.reviewerName}>Amina Bello</Text>
                    <View style={styles.metaDot} />
                    <View style={styles.starsRow}>
                      <Star size={12} color="rgba(245, 149, 15, 0.96)" fill="rgba(245, 149, 15, 0.96)" />
                      <Star size={12} color="rgba(245, 149, 15, 0.96)" fill="rgba(245, 149, 15, 0.96)" />
                      <Star size={12} color="rgba(245, 149, 15, 0.96)" fill="rgba(245, 149, 15, 0.96)" />
                      <Star size={12} color="rgba(245, 149, 15, 0.96)" fill="rgba(245, 149, 15, 0.96)" />
                      <Star size={12} color="rgba(245, 149, 15, 0.96)" fill="rgba(245, 149, 15, 0.96)" />
                    </View>
                  </View>
                  <Text style={styles.reviewText}>Amazing nail art! She was super polite and finished right on time.</Text>
                  <View style={styles.reviewDateRow}>
                    <Text style={styles.reviewDate}>10/02/2026</Text>
                    <View style={styles.metaDot} />
                    <Text style={styles.reviewDate}>15:22:10</Text>
                  </View>
                </View>
              </TouchableOpacity>

            </ScrollView>
          </View>

        </ScrollView>

        {/* Fixed Bottom Action Bar */}
        <View style={[styles.bottomBar, { paddingBottom: getSafeBottomPadding(insets, 16, 8) }]}>
          <TouchableOpacity 
            style={styles.bookButton} 
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: '/professional/services',
                params: {
                  providerId: profile.id,
                  name: profile.name,
                  providerName: profile.name,
                  salonName: profile.verifiedBy || 'GoodCare Spa',
                },
              } as any)
            }
          >
            <Text style={styles.bookButtonText}>Book {profileName}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 17,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 110,
  },
  
  // Profile Card & Status Tag Container
  profileCardContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(247, 247, 247, 0.98)',
    shadowColor: '#858B94',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    zIndex: 2,
  },
  statusTag: {
    width: '100%',
    height: 48,
    marginTop: -26,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 5,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    zIndex: 1,
  },
  statusTagText: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  profileCardLeft: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  avatarContainer: {
    width: 104,
    height: 104,
    marginBottom: 8,
    position: 'relative',
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
  },
  badgeContainer: {
    position: 'absolute',
    right: 0,
    bottom: 2,
  },
  nameContainer: {
    alignItems: 'center',
    gap: 4,
  },
  profileName: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  profileTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  workHours: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  verticalDivider: {
    width: 1,
    height: 160,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginHorizontal: 16,
  },
  profileCardRight: {
    alignItems: 'center',
    flex: 1,
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.3 : 0.2,
    color: '#000000',
  },
  statValueLight: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.3 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  statLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  // Specs Section
  specsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    height: 40,
  },
  specText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: '#000000',
  },

  // Sections Common
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 20,
    color: '#000000',
  },
  horizontalScroll: {
    marginHorizontal: -16,
  },
  circularButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(247, 247, 247, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Portfolio (3 cols x 2 rows) ──
  portfolioSectionContainer: {
    gap: 16,
    marginBottom: 24,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 40,
  },
  portfolioTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
  },
  portfolioGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  portfolioRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  portfolioImageWrapper: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },

  // Reviews Tags
  tagsScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  reviewTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(247, 247, 247, 0.98)',
    borderRadius: 24,
    gap: 8,
  },
  tagEmoji: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 18,
  },
  tagLabel: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  tagCount: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // Reviews List
  reviewsScrollContent: {
    paddingHorizontal: 16,
    gap: 20,
  },
  reviewCard: {
    flexDirection: 'row',
    width: 320,
    gap: 12,
  },
  reviewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  reviewDetails: {
    flex: 1,
    gap: 8,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewerName: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D9D9D9',
  },
  reviewText: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  reviewDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewDate: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 12,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  verticalDividerThin: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginHorizontal: 4,
  },

  // Bottom Fixed Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 42 : 24, // 8px padding + safe area
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(133, 139, 148, 1)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  bookButton: {
    height: 44,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: 'rgba(133, 139, 148, 1)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  bookButtonText: {
    ...typography.button,
    textTransform: 'capitalize',
    color: '#FFFFFF',
  },

  // Modal Bottom Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 8, 20, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    gap: 20,
  },
  modalHandle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 20,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  bookingOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },
  bookingOptionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(247, 247, 247, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingOptionTextCol: {
    flex: 1,
    gap: 4,
  },
  bookingOptionTitle: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  bookingOptionSubtitle: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  homeServiceWrapper: {
    position: 'relative',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    right: 16,
    backgroundColor: 'rgba(245, 235, 220, 0.96)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    zIndex: 2,
  },
  recommendedBadgeText: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 12,
    color: 'rgba(245, 149, 15, 0.96)',
  },
  homeServiceTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  homeServicePrice: {
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    color: '#000000',
  },
});
