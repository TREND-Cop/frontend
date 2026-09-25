import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSafeBottomPadding } from '../../utils/safeArea';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useFavoritesContext } from '../../store/FavoritesContext';
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Clock,
  Star,
  ChevronDown,
  Timer,
  Scissors,
  Users,
  Sparkles,
} from 'lucide-react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { ShareIcon } from '../../components/ShareIcon';
import { SafeImage } from '../../components/ui/SafeImage';
import { bookingStore } from '../../utils/bookingStore';
import { typography } from '../../constants/theme';
import { previewStore } from '../../utils/previewStore';
import { shareStore } from '../../utils/shareStore';
import { toastStore } from '../../utils/toastStore';
import { AppointmentTypeModal, AppointmentBookingType } from '../../components/AppointmentTypeModal';
import { BookmarkBottomSheetModal } from '../../components/BookmarkBottomSheetModal';
import { SuggestedAddOnsModal } from '../../components/SuggestedAddOnsModal';
import { useSkeletonCadence } from '../../hooks/useSkeletonCadence';
import { TextSkeleton } from '../../components/ui/TextSkeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Top 6 Salon Images Grid (3 cols x 2 rows, 112px x 112px, border-radius 16px) ──
const TOP_SALON_IMAGES = [
  require('../../../assets/images/profile/14dcc3440340f9f140251ac160473457c89b198c.jpg'),
  require('../../../assets/images/profile/30b9a5ab22324bd8357f666111d5584ad2e3c83e.jpg'),
  require('../../../assets/images/profile/eb3281d09659fdef5e45647cf5529f61e83190f1.jpg'),
  require('../../../assets/images/profile/b4bdda58fe4760cb04cb35cca583a63e04b99e77.jpg'),
  require('../../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg'),
  require('../../../assets/images/profile/ee549b1ea85771de4cd8695943af94f474fedf19.jpg'),
];

// ── Package 4 Grid Images (2x2, 148px x 140px, border-radius 16px) ──
const PACKAGE_IMAGES = [
  require('../../../assets/images/packages/stone_massage.png'),
  require('../../../assets/images/packages/clay_scrub_facial.png'),
  require('../../../assets/images/packages/back_massage.png'),
  require('../../../assets/images/packages/facial_sheet_mask.png'),
];

// ── Gallery 6 Images Grid (2 cols x 3 rows, 167px x 214px, border-radius 24px) ──
const GALLERY_IMAGES = [
  require('../../../assets/images/profile/b4bdda58fe4760cb04cb35cca583a63e04b99e77.jpg'),
  require('../../../assets/images/profile/14dcc3440340f9f140251ac160473457c89b198c.jpg'),
  require('../../../assets/images/profile/30b9a5ab22324bd8357f666111d5584ad2e3c83e.jpg'),
  require('../../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg'),
  require('../../../assets/images/profile/eb3281d09659fdef5e45647cf5529f61e83190f1.jpg'),
  require('../../../assets/images/profile/ee549b1ea85771de4cd8695943af94f474fedf19.jpg'),
];

// ── Reviews Data (Figma: user reviews with name, rating, timestamp, and comments) ──
const REVIEWS_DATA = [
  {
    id: 'r1',
    name: 'Samuel Obanuju',
    avatar: require('../../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg'),
    rating: 5,
    comment: 'The service was premium, love the good work guys keep it up.',
    time: '12:04:20',
    date: '12-02-2026',
  },
  {
    id: 'r2',
    name: 'Samuel Obanuju',
    avatar: require('../../../assets/images/profile/30b9a5ab22324bd8357f666111d5584ad2e3c83e.jpg'),
    rating: 3,
    comment: "The salon was too far and my appointment got rescheduled, that's why am giving a 3.",
    time: '12:04:20',
    date: '12-02-2026',
  },
  {
    id: 'r3',
    name: 'Samuel Obanuju',
    avatar: require('../../../assets/images/profile/14dcc3440340f9f140251ac160473457c89b198c.jpg'),
    rating: 4,
    comment: 'The service was premium, love the good work guys keep it up.',
    time: '12:04:20',
    date: '12-02-2026',
  },
];

import { getServiceByIdOrName } from '../../constants/serviceCatalog';

export default function SelectedStyleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { isSkeletonLoading } = useSkeletonCadence();
  const { isFavorite, toggleFavorite } = useFavoritesContext();
  const [activeTab, setActiveTab] = useState<'about' | 'package'>('about');
  const [activePackageDot, setActivePackageDot] = useState(0);
  const packageCarouselRef = React.useRef<ScrollView>(null);
  const [packageWidth, setPackageWidth] = useState<number>(0);
  const [isAppointmentTypeModalOpen, setIsAppointmentTypeModalOpen] = useState(false);
  const [selectedAppointmentType, setSelectedAppointmentType] = useState<AppointmentBookingType | null>(null);
  const [isAddOnsModalVisible, setIsAddOnsModalVisible] = useState(false);

  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const heartScale = React.useRef(new Animated.Value(1)).current;

  const paramId = (params.id as string) || (params.serviceId as string) || '';
  const paramName = (params.name as string) || (params.title as string) || (params.serviceName as string) || '';
  const matchedService = getServiceByIdOrName(paramId, paramName);

  const styleName = paramName || matchedService?.name || 'Straight-Back Cornrows';
  const stylePrice = (params.price as string) || matchedService?.price || '₦14,200';
  const originalPrice = (params.originalPrice as string) || matchedService?.originalPrice || '₦18,000';
  const rating = (params.rating as string) || matchedService?.rating || '4.8';
  const duration = (params.duration as string) || matchedService?.duration || '1hr 30min';
  const category = ((params.category as string) || matchedService?.category || '').trim();
  const salonName = (params.salonName as string) || (params.salon as string) || 'Luminous Lux';
  const salonId = (params.salonId as string) || 'salon2';
  const serviceId = paramId || matchedService?.id || 'mb1';

  // Dynamic gallery images matching the selected style/category
  const topSalonImages = useMemo(() => {
    const key = `${category} ${styleName}`.toLowerCase();
    if (key.includes('braid') || key.includes('hair') || key.includes('cut') || key.includes('men') || key.includes('fade')) {
      return [
        matchedService?.image || require('../../../assets/images/profile/men_braids.jpg'),
        require('../../../assets/images/services/men_haircut.png'),
        require('../../../assets/images/services/men_hair_colour.png'),
        require('../../../assets/images/620f39dda80fe7971b4af170c890481a63da61b0.jpg'),
        require('../../../assets/images/4218763aec656cbbdd9bfa7d3952a6234a3eefe6.jpg'),
        require('../../../assets/images/2994a594d66b1394572508c5f3985ee6209b360f.jpg'),
      ];
    }
    if (key.includes('facial') || key.includes('spa') || key.includes('massage') || key.includes('face')) {
      return [
        matchedService?.image || require('../../../assets/images/packages/clay_scrub_facial.png'),
        require('../../../assets/images/packages/facial_sheet_mask.png'),
        require('../../../assets/images/packages/stone_massage.png'),
        require('../../../assets/images/packages/back_massage.png'),
        require('../../../assets/images/services/men_facials.png'),
        require('../../../assets/images/services/men_massage.png'),
      ];
    }
    if (key.includes('pedicure') || key.includes('feet')) {
      return [
        matchedService?.image || require('../../../assets/images/profile/dry_wow_pedicure.jpg'),
        require('../../../assets/images/profile/14dcc3440340f9f140251ac160473457c89b198c.jpg'),
        require('../../../assets/images/profile/30b9a5ab22324bd8357f666111d5584ad2e3c83e.jpg'),
        require('../../../assets/images/profile/eb3281d09659fdef5e45647cf5529f61e83190f1.jpg'),
        require('../../../assets/images/profile/b4bdda58fe4760cb04cb35cca583a63e04b99e77.jpg'),
        require('../../../assets/images/profile/ee549b1ea85771de4cd8695943af94f474fedf19.jpg'),
      ];
    }
    // Default to Nail Art
    return [
      matchedService?.image || require('../../../assets/images/profile/14dcc3440340f9f140251ac160473457c89b198c.jpg'),
      require('../../../assets/images/profile/30b9a5ab22324bd8357f666111d5584ad2e3c83e.jpg'),
      require('../../../assets/images/profile/eb3281d09659fdef5e45647cf5529f61e83190f1.jpg'),
      require('../../../assets/images/profile/b4bdda58fe4760cb04cb35cca583a63e04b99e77.jpg'),
      require('../../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg'),
      require('../../../assets/images/profile/ee549b1ea85771de4cd8695943af94f474fedf19.jpg'),
    ];
  }, [category, styleName, matchedService]);

  const isSaved = isFavorite(serviceId);

  const handleToggleWishlist = async () => {
    const willSave = !isSaved;

    // Heart elastic spring animation
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.45,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1.0,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const extracted = topSalonImages.slice(0, 3);
    const numPrice = parseInt(stylePrice.replace(/[^0-9]/g, ''), 10) || matchedService?.numericPrice || 14200;

    if (willSave) {
      await toggleFavorite({
        id: serviceId,
        name: styleName,
        price: numPrice,
        rating: rating,
        location: (params.location as string) || 'Jabi, Abuja',
        category: category,
        imageUri: extracted[0],
        images: extracted,
      });

      // Slide up the 1:1 Figma Bookmark Bottom Sheet Modal
      setIsBookmarkModalOpen(true);
    } else {
      await toggleFavorite({
        id: serviceId,
        name: styleName,
        price: numPrice,
        rating: rating,
        location: (params.location as string) || 'Jabi, Abuja',
        category: category,
        imageUri: topSalonImages[0],
        images: extracted,
      });
      toastStore.showToast({
        message: 'Removed from wishlist',
        type: 'wishlist',
      });
    }
  };

  // Reset modals when screen regains focus (e.g. going back)
  useFocusEffect(
    React.useCallback(() => {
      setSelectedAppointmentType(null);
      setIsAppointmentTypeModalOpen(false);
      setIsAddOnsModalVisible(false);
    }, [])
  );

  const handleBookNow = () => {
    bookingStore.resetBookingSelections();
    const numPrice = parseInt(stylePrice.replace(/[^0-9]/g, ''), 10) || matchedService?.numericPrice || 14200;
    bookingStore.setBasePrice(numPrice);
    bookingStore.setServiceName(styleName);
    bookingStore.setServiceId(serviceId);
    bookingStore.setSalonName(salonName);
    bookingStore.setSalonId(salonId);
    bookingStore.setDuration(duration);
    bookingStore.setRating(rating);

    // Open Suggested Add-Ons bottom sheet modal first
    setIsAddOnsModalVisible(true);
  };

  const handleSuggestedAddOnsConfirm = (selectedIds: string[], totalPrice: number) => {
    bookingStore.setSelectedIds(selectedIds);
    setIsAddOnsModalVisible(false);

    // Proceed to appointment type selection
    setSelectedAppointmentType(null);
    setIsAppointmentTypeModalOpen(true);
  };

  const handleSelectAppointmentType = (type: AppointmentBookingType) => {
    setSelectedAppointmentType(type);
    bookingStore.setAppointmentType(type);
    setIsAppointmentTypeModalOpen(false);

    router.push({
      pathname: '/appointment-time',
      params: {
        serviceId: serviceId,
        serviceName: styleName,
        servicePrice: stylePrice,
        duration: duration,
        salonName: salonName,
        salonId: salonId,
        appointmentType: type,
      },
    } as any);
  };

  const renderStars = (ratingNum: number) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            color={star <= ratingNum ? '#F5950F' : 'rgba(217, 217, 217, 0.6)'}
            fill={star <= ratingNum ? '#F5950F' : 'none'}
            strokeWidth={star <= ratingNum ? 0 : 1.2}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ─── Top Header (Figma: page header with Back, Title, Verified Badge, Share) ─── */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => (router.canGoBack() ? router.back() : router.replace(`/salon/${salonId || 'salon2'}` as any))}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" strokeWidth={1.8} />
        </TouchableOpacity>

        {/* Title + Verified Badge */}
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitleText} numberOfLines={1}>{styleName || salonName}</Text>
          <View style={styles.verifiedShield}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2L3 6V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V6L12 2Z"
                fill="rgba(26, 130, 255, 0.9)"
              />
              <Path
                d="M9 12L11 14L15 10"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() =>
            shareStore.openShare({
              title: styleName,
              status: 'Available',
              statusColor: 'rgba(12, 121, 12, 0.96)',
              url: `https://trend.app/service/${serviceId}`,
              avatar: topSalonImages[0],
            })
          }
        >
          <ShareIcon size={24} color="#141B34" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="normal"
        nestedScrollEnabled={true}
        removeClippedSubviews={Platform.OS !== 'web'}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
      >
        {/* ─── 1. Salon Images Grid (6 items: 3 columns x 2 rows) ─── */}
        <View style={styles.salonGridContainer}>
          {topSalonImages.map((img: any, idx: number) => (
            <View key={idx} style={styles.salonGridImageWrapper}>
              <SafeImage source={img} style={styles.salonGridImage} resizeMode="cover" />
            </View>
          ))}
        </View>

        {/* ─── 2. Style Info Card (Figma: Frame 1000006204) ─── */}
        <View style={styles.styleInfoCard}>
          <View style={styles.styleInfoMain}>
            <View style={styles.styleTitleHeader}>
              <TextSkeleton loading={isSkeletonLoading} width={140} height={22} borderRadius={6}>
                <Text style={styles.styleTitleText}>{styleName}</Text>
              </TextSkeleton>
              <TouchableOpacity
                onPress={handleToggleWishlist}
                activeOpacity={0.7}
                style={styles.heartButton}
              >
                <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                  <Heart
                    size={20}
                    color={isSaved ? '#E11D48' : 'rgba(96, 96, 102, 0.96)'}
                    fill={isSaved ? '#E11D48' : 'none'}
                    strokeWidth={1.5}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>

            {/* Sub Row: Duration & Rating */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Clock size={14} color="rgba(96, 96, 102, 0.96)" strokeWidth={1.5} />
                <TextSkeleton loading={isSkeletonLoading} width={50} height={16} borderRadius={4}>
                  <Text style={styles.metaText}>{duration}</Text>
                </TextSkeleton>
              </View>

              <View style={styles.ratingMetaItem}>
                <Star size={14} color="#F5950F" fill="#F5950F" />
                <TextSkeleton loading={isSkeletonLoading} width={65} height={16} borderRadius={4}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.metaRatingScore}>{rating}</Text>
                    <Text style={styles.metaRatingCount}>(321)</Text>
                  </View>
                </TextSkeleton>
              </View>
            </View>

            {/* Price Row */}
            <View style={styles.priceRow}>
              <View style={styles.priceGroup}>
                <TextSkeleton loading={isSkeletonLoading} width={110} height={20} borderRadius={6}>
                  <Text style={styles.priceMainText}>{stylePrice}</Text>
                </TextSkeleton>
              </View>
            </View>
          </View>
        </View>

        {/* ─── 3. Segmented Tab Switcher (About Style vs Package) ─── */}
        <View style={styles.tabBarContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'about' && styles.tabButtonActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('about')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'about' && styles.tabButtonTextActive,
              ]}
            >
              About Style
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'package' && styles.tabButtonActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('package')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'package' && styles.tabButtonTextActive,
              ]}
            >
              Package
            </Text>
          </TouchableOpacity>
        </View>

        {/* ─── 4. Dynamic Tab View ─── */}
        {activeTab === 'package' ? (
          /* ── Package Tab View (Figma: service package container) ── */
          <View style={styles.packageContainer}>
            {/* 2x2 Image Grid with 2 Swipeable Pages */}
            <View
              style={{ width: '100%' }}
              onLayout={(e) => {
                const w = e.nativeEvent.layout.width;
                if (w > 0 && Math.abs(w - packageWidth) > 1) {
                  setPackageWidth(w);
                }
              }}
            >
              <ScrollView
                ref={packageCarouselRef}
                horizontal
                pagingEnabled
                snapToInterval={packageWidth > 0 ? packageWidth : undefined}
                snapToAlignment="start"
                decelerationRate="fast"
                disableIntervalMomentum={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                scrollEventThrottle={16}
                onScroll={(e) => {
                  const offsetX = e.nativeEvent.contentOffset.x;
                  const w = e.nativeEvent.layoutMeasurement?.width || packageWidth;
                  if (w > 0) {
                    const idx = Math.min(1, Math.max(0, Math.round(offsetX / w)));
                    if (idx !== activePackageDot) {
                      setActivePackageDot(idx);
                    }
                  }
                }}
              >
                {/* Page 1 */}
                <View style={[styles.packageImagesGrid, { width: packageWidth || (SCREEN_WIDTH - 64) }]}>
                  {PACKAGE_IMAGES.map((img, index) => (
                    <View key={`p1-${index}`} style={styles.packageImageCard}>
                      <SafeImage source={img} style={styles.packageImg} resizeMode="cover" />
                    </View>
                  ))}
                </View>

                {/* Page 2: Transformation & Styling Results */}
                <View style={[styles.packageImagesGrid, { width: packageWidth || (SCREEN_WIDTH - 64) }]}>
                  {GALLERY_IMAGES.slice(0, 4).map((img, index) => (
                    <View key={`p2-${index}`} style={styles.packageImageCard}>
                      <SafeImage source={img} style={styles.packageImg} resizeMode="cover" />
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Carousel 2-Dots Indicator */}
            <View style={styles.packageDotsContainer}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setActivePackageDot(0);
                  packageCarouselRef.current?.scrollTo({ x: 0, animated: true });
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <View
                  style={[
                    styles.packageDot,
                    activePackageDot === 0
                      ? styles.packageDotActive
                      : styles.packageDotInactive,
                  ]}
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  const w = packageWidth || (SCREEN_WIDTH - 64);
                  setActivePackageDot(1);
                  packageCarouselRef.current?.scrollTo({ x: w, animated: true });
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <View
                  style={[
                    styles.packageDot,
                    activePackageDot === 1
                      ? styles.packageDotActive
                      : styles.packageDotInactive,
                  ]}
                />
              </TouchableOpacity>
            </View>

            {/* Package Price */}
            <Text style={styles.packagePriceText}>₦12,500</Text>

            {/* Included Services List */}
            <View style={styles.packageServicesList}>
              {[
                'Hair Cut',
                'Conditioning & Wash',
                'Manicure',
                'Pedicure',
              ].map((serviceName, sIdx) => (
                <View key={sIdx} style={styles.packageServiceItem}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="10" fill="rgba(0, 8, 20, 0.96)" />
                    <Path
                      d="M8 12.5L10.5 15L16 9.5"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                  <Text style={styles.packageServiceName}>{serviceName}</Text>
                </View>
              ))}
            </View>

            {/* More Contents Row: "6+ Services" and "See All" */}
            <View style={styles.packageMoreRow}>
              <Text style={styles.packageMoreCount}>6+ Services</Text>
              <TouchableOpacity style={styles.packageSeeAllBtn} activeOpacity={0.7}>
                <Text style={styles.packageSeeAllText}>See All</Text>
                <ChevronDown size={18} color="rgba(26, 130, 255, 0.9)" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* ── About Style Tab View (Figma: description card with cut time, maintenance, audience, types) ── */
          <View style={styles.aboutContainer}>
            <TextSkeleton loading={isSkeletonLoading} width="96%" height={40} borderRadius={6} style={{ marginBottom: 12 }}>
              <Text style={styles.aboutDescriptionText}>
                {styleName} is a premium service treatment crafted with high precision and care at {salonName}.
              </Text>
            </TextSkeleton>

            {/* Cut Time */}
            <View style={styles.aboutSpecRow}>
              <View style={styles.aboutSpecIconCircle}>
                <Timer size={18} color="#141B34" strokeWidth={1.8} />
              </View>
              <View style={styles.aboutSpecTextCol}>
                <Text style={styles.aboutSpecTitle}>Cut time</Text>
                <TextSkeleton loading={isSkeletonLoading} width={160} height={52} borderRadius={4}>
                  <Text style={styles.aboutSpecDesc}>
                    1hr High ponytail{'\n'}1:30hr Loose loc fall{'\n'}3hr Patterned braid base
                  </Text>
                </TextSkeleton>
              </View>
            </View>

            {/* Maintenance */}
            <View style={styles.aboutSpecRow}>
              <View style={styles.aboutSpecIconCircle}>
                <Scissors size={18} color="#141B34" strokeWidth={1.8} />
              </View>
              <View style={styles.aboutSpecTextCol}>
                <Text style={styles.aboutSpecTitle}>Maintenance</Text>
                <TextSkeleton loading={isSkeletonLoading} width={150} height={18} borderRadius={4}>
                  <Text style={styles.aboutSpecDesc}>2-4 weeks before change</Text>
                </TextSkeleton>
              </View>
            </View>

            {/* Who is this style for? */}
            <View style={styles.aboutSpecRow}>
              <View style={styles.aboutSpecIconCircle}>
                <Users size={18} color="#141B34" strokeWidth={1.8} />
              </View>
              <View style={styles.aboutSpecTextCol}>
                <Text style={styles.aboutSpecTitle}>Who is this style for?</Text>
                <TextSkeleton loading={isSkeletonLoading} width={180} height={52} borderRadius={4}>
                  <Text style={styles.aboutSpecDesc}>
                    Male and Female Adult{'\n'}Male and Female Teenagers{'\n'}Male and Female Kids
                  </Text>
                </TextSkeleton>
              </View>
            </View>

            {/* Style Types */}
            <View style={styles.aboutSpecRow}>
              <View style={styles.aboutSpecIconCircle}>
                <Sparkles size={18} color="#141B34" strokeWidth={1.8} />
              </View>
              <View style={styles.aboutSpecTextCol}>
                <Text style={styles.aboutSpecTitle}>Style types</Text>
                <TextSkeleton loading={isSkeletonLoading} width={220} height={52} borderRadius={4}>
                  <Text style={styles.aboutSpecDesc}>
                    High ponytail (3 inches){'\n'}Loose loc fall (5 inches){'\n'}Patterned braid base - 7 inches (Premium)
                  </Text>
                </TextSkeleton>
              </View>
            </View>
          </View>
        )}

        {/* ─── 5. Gallery Section (Figma: 2 columns x 3 rows grid of cards) ─── */}
        <View style={styles.gallerySection}>
          <Text style={styles.sectionHeaderTitle}>Gallery</Text>
          <View style={styles.galleryGrid}>
            <View style={styles.galleryColumn}>
              {GALLERY_IMAGES.filter((_, i) => i % 2 === 0).map((img, idx) => (
                <TouchableOpacity
                  key={`left-${idx}`}
                  style={styles.galleryCard}
                  activeOpacity={0.88}
                  onPress={() => {
                    const originalIndex = GALLERY_IMAGES.indexOf(img);
                    const styleGalleryItems = [
                      { image: GALLERY_IMAGES[0], title: `${styleName} - Angle View`, price: stylePrice, duration: duration, rating: rating },
                      { image: GALLERY_IMAGES[1], title: `${styleName} - Close-up`, price: stylePrice, duration: duration, rating: rating },
                      { image: GALLERY_IMAGES[2], title: `${styleName} - Finished Result`, price: stylePrice, duration: duration, rating: rating },
                      { image: GALLERY_IMAGES[3], title: `${styleName} - Side Profile`, price: stylePrice, duration: duration, rating: rating },
                      { image: GALLERY_IMAGES[4], title: `${styleName} - Detailed Texture`, price: stylePrice, duration: duration, rating: rating },
                      { image: GALLERY_IMAGES[5], title: `${styleName} - Back View`, price: stylePrice, duration: duration, rating: rating },
                    ];
                    previewStore.setPreviewImages(GALLERY_IMAGES, `${styleName} Gallery`, styleGalleryItems, originalIndex);
                    router.push({
                      pathname: '/professional/gallery-preview',
                      params: { index: originalIndex, initialIndex: originalIndex, source: 'gallery', title: `${styleName} Gallery` },
                    } as any);
                  }}
                >
                  <SafeImage source={img} style={styles.galleryImage} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.galleryColumn}>
              {GALLERY_IMAGES.filter((_, i) => i % 2 === 1).map((img, idx) => (
                <TouchableOpacity
                  key={`right-${idx}`}
                  style={styles.galleryCard}
                  activeOpacity={0.88}
                  onPress={() => {
                    const originalIndex = GALLERY_IMAGES.indexOf(img);
                    const styleGalleryItems = [
                      { image: GALLERY_IMAGES[0], title: `${styleName} - Angle View`, price: stylePrice, duration: duration, rating: rating },
                      { image: GALLERY_IMAGES[1], title: `${styleName} - Close-up`, price: stylePrice, duration: duration, rating: rating },
                      { image: GALLERY_IMAGES[2], title: `${styleName} - Finished Result`, price: stylePrice, duration: duration, rating: rating },
                      { image: GALLERY_IMAGES[3], title: `${styleName} - Side Profile`, price: stylePrice, duration: duration, rating: rating },
                      { image: GALLERY_IMAGES[4], title: `${styleName} - Detailed Texture`, price: stylePrice, duration: duration, rating: rating },
                      { image: GALLERY_IMAGES[5], title: `${styleName} - Back View`, price: stylePrice, duration: duration, rating: rating },
                    ];
                    previewStore.setPreviewImages(GALLERY_IMAGES, `${styleName} Gallery`, styleGalleryItems, originalIndex);
                    router.push({
                      pathname: '/professional/gallery-preview',
                      params: { index: originalIndex, initialIndex: originalIndex, source: 'gallery', title: `${styleName} Gallery` },
                    } as any);
                  }}
                >
                  <SafeImage source={img} style={styles.galleryImage} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* ─── 6. Reviews Section (Figma: Reviews Header + Forward Arrow + 3 Review Cards) ─── */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Reviews</Text>
            <TouchableOpacity
              style={styles.reviewForwardCircle}
              activeOpacity={0.8}
              onPress={() => router.push('/professional/reviews' as any)}
            >
              <ArrowRight size={20} color="rgba(0, 8, 20, 0.96)" strokeWidth={1.8} />
            </TouchableOpacity>
          </View>

          <View style={styles.reviewsList}>
            {REVIEWS_DATA.map((rev) => (
              <View key={rev.id} style={styles.reviewCard}>
                <SafeImage source={rev.avatar} style={styles.reviewAvatar} resizeMode="cover" />
                <View style={styles.reviewBody}>
                  {/* Name + Dot + Stars */}
                  <View style={styles.reviewNameRow}>
                    <Text style={styles.reviewerName}>{rev.name}</Text>
                    <View style={styles.nameDot} />
                    {renderStars(rev.rating)}
                  </View>

                  {/* Comment */}
                  <Text style={styles.reviewCommentText}>{rev.comment}</Text>

                  {/* Time and Date */}
                  <View style={styles.reviewTimeRow}>
                    <Text style={styles.reviewTimeText}>{rev.time}</Text>
                    <View style={styles.timeDot} />
                    <Text style={styles.reviewTimeText}>{rev.date}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ─── 7. Sticky Bottom Action Bar (Figma: height 65px, padding: 8px 16px, gap: 32px) ─── */}
      <View style={[styles.bottomBar, { paddingBottom: getSafeBottomPadding(insets, 16, 8) }]}>
        <View style={styles.bottomPriceCol}>
          <TextSkeleton loading={isSkeletonLoading} width={100} height={20} borderRadius={4}>
            <Text style={styles.bottomPriceValue}>{stylePrice}</Text>
          </TextSkeleton>
          <Text style={styles.bottomSubtext}>Free Cancellation</Text>
        </View>

        <TouchableOpacity
          style={styles.bookNowButton}
          activeOpacity={0.85}
          onPress={handleBookNow}
        >
          <Text style={styles.bookNowButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>

      {/* ─── 1:1 Figma Suggested Add-Ons Bottom Sheet Modal ─── */}
      <SuggestedAddOnsModal
        visible={isAddOnsModalVisible}
        basePrice={parseInt(stylePrice.replace(/[^0-9]/g, ''), 10) || matchedService?.numericPrice || 14200}
        serviceId={serviceId}
        salonId={salonId}
        initialSelectedIds={bookingStore.getSelectedIds()}
        onClose={() => setIsAddOnsModalVisible(false)}
        onConfirm={handleSuggestedAddOnsConfirm}
      />

      {/* ─── Appointment Type Bottom Sheet Modal (Figma: In-Person / Home Service) ─── */}
      <AppointmentTypeModal
        visible={isAppointmentTypeModalOpen}
        selectedType={selectedAppointmentType}
        onSelectType={handleSelectAppointmentType}
        onClose={() => setIsAppointmentTypeModalOpen(false)}
      />

      {/* ─── 1:1 Figma Bookmark / Wishlist Bottom Sheet Modal ─── */}
      <BookmarkBottomSheetModal
        visible={isBookmarkModalOpen}
        onClose={() => setIsBookmarkModalOpen(false)}
        onOpenWishlist={() => {
          setIsBookmarkModalOpen(false);
          router.push('/wishlist' as any);
        }}
        serviceName={styleName}
        images={topSalonImages.slice(0, 3)}
      />
    </SafeAreaView>
  );
}

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
  headerTitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '500',
    color: 'rgba(0, 8, 20, 0.96)',
    letterSpacing: 0.2,
  },
  verifiedShield: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 24,
  },

  // 1. Salon Images Grid (3 x 2)
  salonGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 11,
    rowGap: 27,
    justifyContent: 'space-between',
  },
  salonGridImageWrapper: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(247, 247, 247, 0.98)',
  },
  salonGridImage: {
    width: '100%',
    height: '100%',
  },

  // 2. Style Info Card
  styleInfoCard: {
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderRadius: 24,
    padding: 16,
  },
  styleInfoMain: {
    gap: 8,
  },
  styleTitleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  styleTitleText: {
    fontFamily: Platform.select({
      ios: 'SF Pro',
      android: 'DMSans_500Medium',
    }),
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: 'rgba(0, 8, 20, 0.96)',
    letterSpacing: 0.4,
    flex: 1,
  },
  heartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
    letterSpacing: 0.3,
  },
  ratingMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaRatingScore: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
    fontWeight: '400',
  },
  metaRatingCount: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priceMainText: {
    fontFamily: Platform.select({
      ios: 'SF Pro',
      android: 'DMSans_400Regular',
      default: 'sans-serif',
    }),
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: 'rgba(96, 96, 102, 0.96)',
    letterSpacing: 0.5,
  },
  priceStrikethrough: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: 'rgba(96, 96, 102, 0.96)',
    letterSpacing: 0.5,
    textDecorationLine: 'line-through',
  },
  saveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
    backgroundColor: 'rgba(242, 233, 218, 0.96)',
    borderRadius: 16,
  },
  saveBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(245, 149, 15, 0.96)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  // 3. Tab Switcher
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 32,
    height: 56,
    padding: 4,
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  tabButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: 'rgba(96, 96, 102, 0.96)',
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    textTransform: 'capitalize',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },

  // 4. Package Tab View
  packageContainer: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 20,
  },
  packageImagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  packageImageCard: {
    width: '48%',
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  packageImg: {
    width: '100%',
    height: '100%',
  },
  packageDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  packageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  packageDotActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  packageDotInactive: {
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },
  packagePriceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '500',
    color: 'rgba(0, 8, 20, 0.96)',
    letterSpacing: 0.1,
  },
  packageServicesList: {
    gap: 12,
  },
  packageServiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  packageServiceName: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(96, 96, 102, 0.96)',
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
  },
  packageMoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
  },
  packageMoreCount: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(96, 96, 102, 0.96)',
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
  },
  packageSeeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  packageSeeAllText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(26, 130, 255, 0.9)',
    fontWeight: '500',
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
  },

  // 4b. About Style Tab View
  aboutContainer: {
    backgroundColor: '#F7F7F7',
    borderRadius: 24,
    padding: 16,
    gap: 20,
  },
  aboutDescriptionText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: 'rgba(96, 96, 102, 0.96)',
    letterSpacing: 0.5,
  },
  aboutSpecRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  aboutSpecIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  aboutSpecTextCol: {
    flex: 1,
    gap: 4,
  },
  aboutSpecTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
  },
  aboutSpecDesc: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: 'rgba(96, 96, 102, 0.96)',
    letterSpacing: 0.5,
  },

  // 5. Gallery
  gallerySection: {
    gap: 16,
  },
  sectionHeaderTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '500',
    color: 'rgba(0, 8, 20, 0.96)',
    letterSpacing: 0.3,
  },
  galleryGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  galleryColumn: {
    flex: 1,
    gap: 16,
  },
  galleryCard: {
    width: '100%',
    height: 214,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(247, 247, 247, 0.98)',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },

  // 6. Reviews
  reviewsSection: {
    gap: 16,
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewForwardCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewsList: {
    gap: 16,
  },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  reviewBody: {
    flex: 1,
    gap: 8,
  },
  reviewNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewerName: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: 'rgba(0, 8, 20, 0.96)',
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
  },
  nameDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D9D9D9',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  reviewCommentText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: 'rgba(96, 96, 102, 0.96)',
    letterSpacing: 0.5,
  },
  reviewTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewTimeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: 'rgba(96, 96, 102, 0.96)',
    letterSpacing: 0.5,
  },
  timeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D9D9D9',
  },

  // 7. Sticky Bottom Bar (Figma: height 65px, padding 8px 16px, gap 32px, shadow 0px -8px 20px rgba(133, 139, 148, 0.12))
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16, // Reduced from 32 to prevent overflow
    backgroundColor: '#FFFFFF',
    shadowColor: '#858B94',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  bottomPriceCol: {
    flex: 1, // Replaced fixed width 165
    height: 48,
    justifyContent: 'center',
    gap: 4,
  },
  bottomPriceValue: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: 0.2,
  },
  bottomSubtext: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: 'rgba(96, 96, 102, 0.96)',
    letterSpacing: 0.4,
  },
  bookNowButton: {
    flex: 1.2, // Replaced fixed width 193
    height: 48,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  bookNowButtonText: {
    ...typography.button,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
});
