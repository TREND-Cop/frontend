import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Briefcase,
  Car,
  Handshake,
  MapPin,
  ShieldCheck,
  Star,
  Tv,
  User,
  UserCheck,
  Users,
  Wifi,
  Wind,
} from 'lucide-react-native';
import React, { useMemo } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { ShareIcon } from '../../components/ShareIcon';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';
import { SafeImage } from '../../components/ui/SafeImage';
import { previewStore } from '../../utils/previewStore';
import { shareStore } from '../../utils/shareStore';
import { MOCK_SALONS } from '../home/mockSalons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Verified Blue Shield Icon (Figma: width 20px / 40px, fill/stroke #1A82FF, white checkmark) ──
const VerifiedShieldIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L4 5V11C4 16.52 7.41 21.62 12 22.95C16.59 21.62 20 16.52 20 11V5L12 2Z"
      fill="rgba(26, 130, 255, 0.9)"
      stroke="rgba(26, 130, 255, 0.9)"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 12L11 14L15 10"
      stroke="#FFFFFF"
      strokeWidth={size >= 30 ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Office Building Icon (Figma: 16x16, border 1px solid rgba(192, 192, 204, 0.96)) ──
const OfficeBuildingIcon = ({ size = 16, color = 'rgba(192, 192, 204, 0.96)' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 9h1M9 13h1M9 17h1M14 9h1M14 13h1M14 17h1" />
  </Svg>
);

// ── White Play Triangle (Figma: Polygon 4, 32x32) ──
const PlayTriangleIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path d="M7 4V20L20 12L7 4Z" fill="#FFFFFF" />
  </Svg>
);

const PORTFOLIO_ITEMS = [
  {
    image: require('../../../assets/images/custom/gallery_luminous_lux_sign.jpg'),
    title: 'Luminous Lux Sign',
    price: '₦14,200',
    duration: '1hr',
    rating: '3.6',
    isVideo: false,
  },
  {
    image: require('../../../assets/images/custom/gallery_barber_haircut.png'),
    title: 'Classic Men Haircut',
    price: '₦8,500',
    duration: '45min',
    rating: '4.9',
    isVideo: false,
  },
  {
    image: require('../../../assets/images/custom/gallery_barber_shave.png'),
    title: 'Beard Trim & Shave',
    price: '₦5,000',
    duration: '30min',
    rating: '4.7',
    isVideo: false,
  },
  {
    image: require('../../../assets/images/custom/gallery_salon_chairs.png'),
    title: 'Salon Stations & Mirrors',
    price: '₦16,000',
    duration: '1hr 15min',
    rating: '4.6',
    isVideo: true,
  },
  {
    image: require('../../../assets/images/custom/gallery_barber_trim.jpg'),
    title: 'Gentleman Grooming',
    price: '₦12,000',
    duration: '50min',
    rating: '4.8',
    isVideo: false,
  },
  {
    image: require('../../../assets/images/custom/gallery_barber_facial.jpg'),
    title: 'Facial Treatment',
    price: '₦18,000',
    duration: '1hr',
    rating: '4.9',
    isVideo: false,
  },
];

const PORTFOLIO_IMAGES = PORTFOLIO_ITEMS.map((item) => item.image);

// ── Specific Full Address Formatter With Country for About Salon Screen ──
const getFullAddressWithCountry = (rawAddress?: string): string => {
  const raw = (rawAddress || '').trim();
  const lower = raw.toLowerCase();

  // If already includes Nigeria
  if (lower.includes('nigeria')) {
    return raw.endsWith('.') ? raw : `${raw}.`;
  }

  // Known areas/districts expanded to full street address with country
  if (lower === 'jabi, abuja' || lower === 'jabi' || lower.includes('jabi')) {
    return 'Plot 1265 Bala Sokoto Way, Jabi, Abuja, Nigeria.';
  }
  if (lower === 'wuse, abuja' || lower === 'wuse' || lower.includes('wuse')) {
    return '24 Adetokunbo Ademola Crescent, Wuse II, Abuja, Nigeria.';
  }
  if (lower === 'maitama, abuja' || lower === 'maitama' || lower.includes('maitama')) {
    return '12 Aguiyi Ironsi Street, Maitama, Abuja, Nigeria.';
  }
  if (lower === 'asokoro, abuja' || lower === 'asokoro' || lower.includes('asokoro')) {
    return '11 Gani Street, NNPC Tower Asokoro, Abuja, Nigeria.';
  }
  if (lower === 'kado, abuja' || lower === 'kado' || lower.includes('kado')) {
    return 'Plot 724 Bello Way, Kado, Abuja, Nigeria.';
  }
  if (lower === 'garki, abuja' || lower === 'garki' || lower.includes('garki')) {
    return 'Plot 45 Area 11, Garki, Abuja, Nigeria.';
  }

  // If already a long address (> 15 chars), append country cleanly
  if (raw.length > 15) {
    const cleaned = raw.replace(/[.,\s]+$/, '');
    return `${cleaned}, Nigeria.`;
  }

  // Default fallback for this page
  return 'Plot 1265 Bala Sokoto Way, Jabi, Abuja, Nigeria.';
};

export const SalonAboutScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const salonId = (params.salonId || params.id || 'salon2') as string;

  const salon = useMemo(() => {
    const found = MOCK_SALONS.find((s) => s.id === salonId);
    if (found) {
      return {
        ...found,
        location: (params.address as string) || (params.location as string) || found.location,
        time: (params.time as string) || (params.workTime as string) || found.workTime || found.time,
        workDays: (params.workDays as string) || found.workDays || 'Monday - Sunday',
      };
    }
    return {
      id: salonId,
      name: (params.name as string) || 'Luminous Lux',
      rating: 4.1,
      reviews: 321,
      location: (params.address as string) || (params.location as string) || '11 Gani Street, NNPC Tower Asokoro, Abuja.',
      time: (params.time as string) || (params.workTime as string) || '8am - 12am',
      workDays: (params.workDays as string) || 'Monday - Sunday',
      isOpen: true,
      isVerified: true,
      gender: 'unisex' as const,
    };
  }, [salonId, params]);

  const fullAddress = useMemo(() => {
    const rawAddress = (params.address as string) || (params.location as string) || salon.location;
    return getFullAddressWithCountry(rawAddress);
  }, [params.address, params.location, salon.location]);

  const handleNavigateToLocation = () => {
    router.push({
      pathname: '/salon/location',
      params: {
        salonId: salon.id,
        name: salon.name,
        address: fullAddress,
        price: 'priceFrom' in salon ? (salon as any).priceFrom : '₦27,000',
        rating: salon.rating,
      },
    } as any);
  };

  const handleShare = () => {
    shareStore.openShare({
      title: salon.name,
      status: salon.isOpen ? 'Available' : 'Closed',
      statusColor: salon.isOpen ? 'rgba(12, 121, 12, 0.96)' : 'rgba(204, 41, 41, 0.9)',
      url: `https://trend.app/salon/${salon.id}/about`,
      avatar: 'images' in salon && salon.images?.[0] ? { uri: salon.images[0] } : undefined,
    });
  };

  // ── Amenities (Figma: height 72px, radius 24px) ──
  const AMENITIES = [
    { label: 'Free Wi-fi', width: 150, icon: <Wifi size={20} color="rgba(0, 8, 20, 0.96)" /> },
    { label: 'Air Condition', width: 167, icon: <Wind size={24} color="#141B34" /> },
    { label: 'Television', width: 150, icon: <Tv size={24} color="#141B34" /> },
    { label: 'Parking Space', width: 167, icon: <Car size={20} color="rgba(0, 8, 20, 0.96)" /> },
  ];

  // ── Trust & Experience Stats (Figma: Frame 1000006340, height 40px each, gap 16px) ──
  const TRUST_STATS = [
    { id: '1', text: '5 Years experience', icon: <Briefcase size={24} color="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} /> },
    { id: '2', text: '2,000 Served clients', icon: <Users size={24} color="#141B34" strokeWidth={1.5} /> },
    { id: '3', text: '55 Repeat clients', icon: <UserCheck size={24} color="#141B34" strokeWidth={1.5} /> },
    { id: '4', text: 'Verified since 2020', icon: <ShieldCheck size={24} color="#141B34" strokeWidth={1.5} /> },
    { id: '5', text: 'User centered service 2021', icon: <Award size={24} color="#141B34" strokeWidth={1.5} /> },
  ];

  // ── Services Chips (Figma: Frame 1000006347, height 44px, background rgba(247, 247, 247, 0.96)) ──
  const SERVICES_LIST = [
    'Nail Art',
    'Manicure',
    'Pedicure',
    'Facials',
    'Massage',
    'Spa',
    'Hair Dressing',
  ];

  // ── Staffs (Figma: 358x104px, radius 24px, background rgba(248, 249, 250, 0.98)) ──
  const STAFFS = [
    {
      id: `about_st_${salon.id}_1`,
      name: 'Bisola Olarewaju',
      experience: '5years',
      salonName: salon.name || 'Luminous Lux',
      rating: '4.4',
      reviews: '101 Reviews',
      role: 'Nail Artist',
      image: require('../../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg'),
      available: true,
    },
    {
      id: `about_st_${salon.id}_2`,
      name: 'Essie Micheal',
      experience: '2years',
      salonName: salon.name || 'Luminous Lux',
      rating: '4.2',
      reviews: '98 Reviews',
      role: 'Massage Therapist',
      image: require('../../../assets/images/profile/30b9a5ab22324bd8357f666111d5584ad2e3c83e.jpg'),
      available: true,
    },
  ];

  // ── Based on customers review (Figma: user efficiency tag, height 44px, gap 24px) ──
  const REVIEW_TAGS = [
    { emoji: '💼', label: 'Professionalism', count: '22' },
    { emoji: '✨', label: 'Cleanness', count: '12' },
    { emoji: '🌟', label: 'Hospitality', count: '30' },
    { emoji: '💬', label: 'Communication', count: '25' },
    { emoji: '🏷️', label: 'Price Accuracy', count: '100' },
    { emoji: '🛋️', label: 'Comfort', count: '41' },
    { emoji: '🌿', label: 'Environment', count: '31' },
    { emoji: '📍', label: 'Location', count: '80' },
    { emoji: '⚡', label: 'Speed', count: '90' },
  ];

  // ── Reviews List (Figma: Frame 1000006348, width 316px, height 112px, vertical divider Line 129) ──
  const REVIEWS = [
    {
      id: 'rev_1',
      name: 'Samuel Obanuju',
      comment: 'The service was premium, love the good work guys keep it up.',
      date: '12/02/2026',
      time: '12:04:20',
      avatar: require('../../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg'),
    },
    {
      id: 'rev_2',
      name: 'Samuel Obanuju',
      comment: 'The service was premium, love the good work guys keep it up.',
      date: '12/02/2026',
      time: '12:04:20',
      avatar: require('../../../assets/images/profile/30b9a5ab22324bd8357f666111d5584ad2e3c83e.jpg'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Page Header (Figma: height: 64px, padding: 8px 16px, border-bottom: 1px solid rgba(235, 235, 245, 0.96)) ── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (router.canGoBack() ? router.back() : router.replace(`/salon/${salon.id}` as any))}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} />
        </TouchableOpacity>

        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle} numberOfLines={1} selectable={false}>
            About {salon.name ? salon.name.split(' ')[0] : 'Luminous'}
          </Text>
          <VerifiedShieldIcon size={20} />
        </View>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ShareIcon size={24} color="#141B34" />
        </TouchableOpacity>
      </View>

      {/* ── Main Scroll Content (Figma: 40px gap between major sections) ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 }]}
      >
        {/* ── 1. Salon Profile Card (Figma: width 358px, height 226px, padding 16px, gap 24px, radius 24px) ── */}
        <View style={styles.profileCard}>
          <View style={styles.profileCardTop}>
            {/* Left: Avatar Frame (104x104, radius 72px/circle) + Shield (40x40 at left: 74, top: 67) + Open text */}
            <View style={styles.profileFrame}>
              <View style={styles.avatarImageFrame}>
                <SafeImage
                  source={require('../../../assets/images/profile/14dcc3440340f9f140251ac160473457c89b198c.jpg')}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
                <View style={styles.avatarShieldContainer} pointerEvents="none">
                  <VerifiedShieldIcon size={40} />
                </View>
              </View>
              {/* Open: pure text, 14px SF Pro 500, line-height 20, text-align center, color rgba(12, 121, 12, 0.96) */}
              <Text style={styles.openText}>Open</Text>
            </View>

            {/* Line 168: Vertical Divider (height: 97px, border 1px solid rgba(235, 235, 245, 0.96)) */}
            <View style={styles.verticalDivider} />

            {/* Right: Content Information (width: 166px, height: 146px, gap: 8px) */}
            <View style={styles.contentInformation}>
              <Text style={styles.salonNameText} numberOfLines={1} adjustsFontSizeToFit={false}>
                {salon.name}
              </Text>
              <View style={styles.dateAndTimeCol}>
                <Text style={styles.metaLabelText}>{salon.time || '8am - 12am'}</Text>
                <View style={styles.ratingRow}>
                  <Star size={16} color="rgba(248, 155, 24, 0.96)" fill="rgba(248, 155, 24, 0.96)" />
                  <Text style={styles.metaLabelText}>
                    {salon.rating ? (typeof salon.rating === 'number' ? salon.rating.toFixed(1) : salon.rating) : '4.1'}
                  </Text>
                  <Text style={styles.metaLabelText}>({salon.reviews || 321})</Text>
                </View>
                <Text style={styles.metaLabelText}>{salon.workDays || 'Monday - Sunday'}</Text>
                <Text style={styles.metaLabelText}>
                  {salon.gender === 'female'
                    ? 'Women Only Salon'
                    : salon.gender === 'male'
                      ? 'Men Only Salon'
                      : 'Unisex Salon'}
                </Text>
              </View>
            </View>
          </View>

          {/* Address Pill (Figma: minHeight 24px, padding: 2px 8px, gap 4px, background rgba(248, 249, 250, 0.98), radius 16px) */}
          <TouchableOpacity
            style={styles.addressPill}
            activeOpacity={0.7}
            onPress={handleNavigateToLocation}
          >
            <MapPin size={16} color="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} />
            <Text style={styles.addressText} numberOfLines={2}>
              {fullAddress}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── 2. Amenities (Figma: height 72px, gap 16px, cards height 72px, radius 24px) ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.amenitiesScroll}
        >
          {AMENITIES.map((am, idx) => (
            <View key={idx} style={[styles.amenityCard, { width: am.width }]}>
              <Text style={styles.amenityText}>{am.label}</Text>
              {am.icon}
            </View>
          ))}
        </ScrollView>

        {/* ── 3. Trust & Experience Stats (Figma: Frame 1000006340, width 278px, gap 8px, each row 40px) ── */}
        <View style={styles.trustStatsSection}>
          {TRUST_STATS.map((item) => (
            <View key={item.id} style={styles.statRow}>
              {item.icon}
              <Text style={styles.statText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* ── 4. Portfolio (Figma: height 302.67px, header 40px, 3x2 grid, 103.33x103.33 images, radius 24px) ── */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Portfolio</Text>
            <TouchableOpacity
              style={styles.seeAllIconButton}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: '/salon/gallery',
                  params: { salonId: salon.id, name: salon.name },
                } as any)
              }
            >
              <ArrowRight size={20} color="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          <View style={styles.portfolioGrid}>
            {[PORTFOLIO_IMAGES.slice(0, 3), PORTFOLIO_IMAGES.slice(3, 6)].map((rowImages, rowIndex) => (
              <View key={rowIndex} style={styles.portfolioRow}>
                {rowImages.map((img, colIndex) => {
                  const idx = rowIndex * 3 + colIndex;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={styles.portfolioCell}
                      activeOpacity={0.88}
                      onPress={() => {
                        previewStore.setPreviewImages(
                          PORTFOLIO_IMAGES,
                          `${salon.name} Portfolio`,
                          PORTFOLIO_ITEMS,
                          idx
                        );
                        router.push({
                          pathname: '/professional/gallery-preview',
                          params: { index: idx, initialIndex: idx, source: 'salon', title: `${salon.name} Portfolio` },
                        } as any);
                      }}
                    >
                      <SafeImage source={img} style={styles.portfolioImage} resizeMode="cover" />
                      {idx === 3 && (
                        <View style={styles.playButtonOverlay}>
                          <PlayTriangleIcon />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {/* ── 5. Services (Figma: Frame 1000006347, chips height 44px, radius 24px, background rgba(247, 247, 247, 0.96)) ── */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Services</Text>
          </View>

          <View style={styles.servicesPillsContainer}>
            {SERVICES_LIST.map((srv, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.servicePillChip}
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname: '/salon/services',
                    params: {
                      salonId: salon.id,
                      name: salon.name,
                      serviceType: srv,
                    },
                  } as any)
                }
              >
                <Text style={styles.servicePillText}>{srv}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── 6. Staffs (Figma: height 304px, cards 358x104px, radius 24px, background rgba(248, 249, 250, 0.98)) ── */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Staffs</Text>
            <TouchableOpacity
              style={styles.seeAllIconButton}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: '/salon/staffs',
                  params: { salonId: salon.id, name: salon.name },
                } as any)
              }
            >
              <ArrowRight size={20} color="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          <View style={styles.staffsList}>
            {STAFFS.map((st) => (
              <TouchableOpacity
                key={st.id}
                style={styles.staffCard}
                activeOpacity={0.88}
                onPress={() =>
                  router.push({
                    pathname: `/professional/${st.id}`,
                    params: {
                      id: st.id,
                      name: st.name,
                      role: st.role,
                      salonName: salon.name,
                      workplace: salon.name,
                      experience: st.experience,
                      rating: st.rating,
                      reviewsCount: st.reviews,
                      status: 'available',
                    },
                  } as any)
                }
              >
                {/* 80x80 Avatar with bottom Available badge (94x24px, radius 16px, rgba(238, 248, 238, 0.8)) */}
                <View style={styles.staffImageWrapper}>
                  <SafeImage source={st.image} style={styles.staffImage} resizeMode="cover" />
                  <View style={styles.staffStatusTag} pointerEvents="none">
                    <Briefcase size={14} color="rgba(12, 121, 12, 0.96)" strokeWidth={1.5} />
                    <Text style={styles.staffStatusTagText}>Available</Text>
                  </View>
                </View>

                {/* Staff Details (230x80px, gap 8px) */}
                <View style={styles.staffInfoColumn}>
                  <Text style={styles.staffNameText} numberOfLines={1}>
                    {st.name}
                  </Text>

                  {/* Row 2: Briefcase + experience + dot + Office + salon name */}
                  <View style={styles.staffMetaRow}>
                    <Briefcase size={14} color="rgba(192, 192, 204, 0.96)" strokeWidth={1.5} />
                    <Text style={styles.staffMetaText}>{st.experience}</Text>
                    <View style={styles.metaDot} />
                    <OfficeBuildingIcon size={14} color="rgba(192, 192, 204, 0.96)" />
                    <Text style={styles.staffMetaText} numberOfLines={1}>
                      {st.salonName}
                    </Text>
                  </View>

                  {/* Row 3: Star + rating + User + role/reviews */}
                  <View style={styles.staffMetaRow}>
                    <Star size={16} color="rgba(248, 155, 24, 0.96)" fill="rgba(248, 155, 24, 0.96)" />
                    <Text style={styles.staffMetaText}>{st.rating}</Text>
                    <View style={styles.metaDot} />
                    <User size={14} color="rgba(192, 192, 204, 0.96)" strokeWidth={1.5} />
                    <Text style={styles.staffMetaText} numberOfLines={1}>
                      {st.role}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── 7. Based on Customers Review (Figma: height 44px, gap 24px between tags) ── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeaderTitle}>Based on customers review</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reviewTagsScroll}
          >
            {REVIEW_TAGS.map((tag, idx) => (
              <View key={idx} style={styles.reviewTagCard}>
                <Text style={styles.tagEmoji}>{tag.emoji}</Text>
                <Text style={styles.tagLabel}>{tag.label}</Text>
                <Text style={styles.tagCount}>{tag.count}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── 8. Review & Rating (Figma: Frame 1000006350, card 316x112px, vertical divider Line 129) ── */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Review & Rating</Text>
            <TouchableOpacity
              style={styles.seeAllIconButton}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: '/salon/reviews',
                  params: { salonId: salon.id, salonName: salon.name },
                } as any)
              }
            >
              <ArrowRight size={20} color="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reviewsScroll}
          >
            {REVIEWS.map((rev, idx) => (
              <React.Fragment key={rev.id}>
                <View style={styles.reviewItem}>
                  <SafeImage source={rev.avatar} style={styles.reviewerAvatar} />
                  <View style={styles.reviewContentCol}>
                    <View style={styles.reviewerHeaderRow}>
                      <Text style={styles.reviewerName}>{rev.name}</Text>
                      <View style={styles.metaDotSmall} />
                      <View style={styles.starsCluster}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={16}
                            color="rgba(248, 155, 24, 0.96)"
                            fill={s <= 4 ? 'rgba(248, 155, 24, 0.96)' : 'rgba(248, 155, 24, 0.96)'}
                          />
                        ))}
                      </View>
                    </View>

                    <Text style={styles.reviewComment}>{rev.comment}</Text>

                    <View style={styles.reviewDateRow}>
                      <Text style={styles.reviewDateText}>{rev.date}</Text>
                      <View style={styles.metaDotSmall} />
                      <Text style={styles.reviewDateText}>{rev.time}</Text>
                    </View>
                  </View>
                </View>
                {idx < REVIEWS.length - 1 && <View style={styles.reviewVerticalDivider} />}
              </React.Fragment>
            ))}
          </ScrollView>
        </View>

        {/* ── 9. Courtesy Footer (Figma: Coutesy, height 58px, gap 2px) ── */}
        <View style={styles.courtesyFooter}>
          <View style={styles.courtesyRow}>
            <Handshake size={20} color="rgba(96, 96, 102, 0.96)" strokeWidth={1.5} />
            <Text style={styles.courtesyJoinedText}>Joined since 2019</Text>
          </View>
          <Text style={styles.courtesyVerifiedText}>
            {salon.name} is verified by TREND
          </Text>
        </View>
      </ScrollView>
      <NativeDockSpacer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Page Header (Figma: height: 64px, padding: 8px 16px, borderBottom: 1px solid rgba(235, 235, 245, 0.96)) ──
  headerRow: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Main Scroll Content (Figma: 40px gap between all major sections) ──
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 40,
  },

  // ── 1. Salon Profile Card (Figma: width 358px, height 226px, padding 16px, gap 24px, radius 24px) ──
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 24,
    shadowColor: 'rgba(133, 139, 148, 0.16)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },
  profileCardTop: {
    height: 146,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileFrame: {
    width: 104,
    height: 132,
    alignItems: 'center',
    gap: 8,
  },
  avatarImageFrame: {
    width: 104,
    height: 104,
    borderRadius: 52,
    position: 'relative',
  },
  avatarImage: {
    width: 104,
    height: 104,
    borderRadius: 52,
  },
  avatarShieldContainer: {
    position: 'absolute',
    left: 74,
    top: 67,
    width: 40,
    height: 40,
  },
  openText: {
    width: 104,
    height: 20,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    textAlign: 'center',
    color: 'rgba(12, 121, 12, 0.96)',
  },
  verticalDivider: {
    width: 1,
    height: 97,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  contentInformation: {
    width: 166,
    height: 146,
    gap: 8,
    justifyContent: 'center',
  },
  salonNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  dateAndTimeCol: {
    gap: 8,
  },
  metaLabelText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressPill: {
    width: '100%',
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  addressText: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    textDecorationLine: 'underline',
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── 2. Amenities Scroll (Figma: height 72px, radius 24px, gap 16px) ──
  amenitiesScroll: {
    gap: 16,
  },
  amenityCard: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  amenityText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── 3. Trust Stats List (Figma: Frame 1000006340, width 278px, gap 8px, each row 40px) ──
  trustStatsSection: {
    width: 278,
    gap: 8,
  },
  statRow: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 8,
  },
  statText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Sections Universal ──
  sectionBlock: {
    gap: 16,
  },
  sectionHeaderRow: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
  },
  seeAllIconButton: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── 4. Portfolio Grid (Figma: width 358px, height 238.67px, 103.33x103.33, rowGap 32px, colGap 24px) ──
  portfolioGrid: {
    width: '100%',
    flexDirection: 'column',
    gap: 32,
  },
  portfolioRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  portfolioCell: {
    width: 103.33,
    height: 103.33,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  playButtonOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -16,
    marginLeft: -16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── 5. Services Pills (Figma: Frame 1000006347, height 44px, background rgba(247, 247, 247, 0.96), border rgba(192, 192, 204, 0.96), gap 12px, rowGap 16px) ──
  servicesPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    rowGap: 16,
  },
  servicePillChip: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  servicePillText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── 6. Staffs (Figma: height 104px, background rgba(248, 249, 250, 0.98), radius 24px, gap 16px) ──
  staffsList: {
    gap: 16,
  },
  staffCard: {
    height: 104,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
  },
  staffImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 16,
    position: 'relative',
    alignItems: 'center',
  },
  staffImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  staffStatusTag: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    width: 94,
    height: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  staffStatusTagText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(12, 121, 12, 0.96)',
  },
  staffInfoColumn: {
    flex: 1,
    height: 80,
    justifyContent: 'center',
    gap: 8,
  },
  staffNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  staffMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  staffMetaText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  metaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },

  // ── 7. Based on Customers Review (Figma: height 44px, gap 24px) ──
  reviewTagsScroll: {
    gap: 24,
  },
  reviewTagCard: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tagEmoji: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 18,
  },
  tagLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  tagCount: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── 8. Review & Rating (Figma: width 316px, height 112px, vertical divider Line 129) ──
  reviewsScroll: {
    gap: 20,
    alignItems: 'center',
  },
  reviewItem: {
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
  },
  reviewContentCol: {
    width: 260,
    height: 96,
    gap: 8,
  },
  reviewerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    height: 24,
  },
  reviewerName: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  metaDotSmall: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D9D9D9',
  },
  starsCluster: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    height: 40,
  },
  reviewDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 16,
  },
  reviewDateText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  reviewVerticalDivider: {
    width: 1,
    height: 100,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    alignSelf: 'center',
  },

  // ── 9. Courtesy Footer (Figma: Coutesy, height 58px, gap 2px) ──
  courtesyFooter: {
    height: 58,
    alignItems: 'center',
    gap: 2,
    marginTop: 8,
    marginBottom: 8,
  },
  courtesyRow: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 10,
  },
  courtesyJoinedText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  courtesyVerifiedText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
});

export default SalonAboutScreen;
