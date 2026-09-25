import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Platform,
  Linking,
  Animated,
  PanResponder,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Star,
  Plus,
  Minus,
  LocateFixed,
} from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { ShareIcon } from '../../components/ShareIcon';
import { SafeImage } from '../../components/ui/SafeImage';
import { MOCK_SALONS } from '../home/mockSalons';
import { previewStore } from '../../utils/previewStore';
import { shareStore } from '../../utils/shareStore';
import { toastStore } from '../../utils/toastStore';
import { useFavoritesContext } from '../../store/FavoritesContext';
import { bookmarkStore } from '../../utils/bookmarkStore';

const { width, height } = Dimensions.get('window');

// ── Verified Blue Shield Check Badge (1:1 Figma: 20x20) ──
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
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Show Direction Arrow Icon (1:1 Figma SVG from founder) ──
const ShowDirectionArrowIcon = ({ size = 20, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="68 56 20 20" fill="none">
    <Path
      d="M75.1585 61.1499L71.8842 68.6171C70.3313 72.1585 69.5549 73.9292 70.2651 74.64C70.3556 74.7306 70.4577 74.8098 70.5688 74.8756C71.4402 75.3918 73.058 74.2738 76.2936 72.0379C77.0739 71.4987 77.464 71.2291 77.9067 71.2031C77.9689 71.1995 78.0313 71.1995 78.0935 71.2031C78.5362 71.2291 78.9263 71.4987 79.7066 72.0379C82.9421 74.2738 84.5598 75.3917 85.4312 74.8755C85.5424 74.8097 85.6444 74.7305 85.735 74.6399C86.4451 73.9291 85.6687 72.1584 84.1158 68.6172L80.8415 61.15C79.6283 58.3833 79.0217 57 78 57C76.9783 57 76.3717 58.3833 75.1585 61.1499Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  </Svg>
);


// ── Bookmark Heart Icon (1:1 Figma: favourite) ──
const BookmarkHeartIcon = ({ isBookmarked, size = 24 }: { isBookmarked: boolean; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill={isBookmarked ? '#E11D48' : 'rgba(0, 0, 0, 0.2)'}
      stroke={isBookmarked ? '#E11D48' : '#FFFFFF'}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);


// ── Play Video Triangle Icon (1:1 Figma: Polygon 4, 32x32) ──
const PlayTriangleIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path d="M8 5V19L19 12L8 5Z" fill="#FFFFFF" />
  </Svg>
);

// ── Review Tags with Emojis & Counts (1:1 Figma: Frame 1000006449) ──
const REVIEW_TAGS = [
  { id: '1', emoji: '💼', name: 'Professionalism', count: 22 },
  { id: '2', emoji: '✨', name: 'Cleanness', count: 12 },
  { id: '3', emoji: '🤝', name: 'Hospitality', count: 30 },
  { id: '4', emoji: '💬', name: 'Communication', count: 25 },
  { id: '5', emoji: '🏷️', name: 'Price Accuracy', count: 100 },
  { id: '6', emoji: '🛋️', name: 'Comfort', count: 41 },
  { id: '7', emoji: '🌿', name: 'Environment', count: 31 },
  { id: '8', emoji: '📍', name: 'Location', count: 80 },
  { id: '9', emoji: '⚡', name: 'Speed', count: 90 },
];

// ── 6 Portfolio Gallery Images (1:1 Figma: portfolio images) ──
const GALLERY_ITEMS = [
  {
    id: 'g1',
    image: require('../../../assets/images/packages/back_massage.png'),
    title: 'Back Massage',
    price: '₦14,200',
    duration: '1hr',
    rating: '4.8',
    isVideo: false,
  },
  {
    id: 'g2',
    image: require('../../../assets/images/packages/stone_massage.png'),
    title: 'Hot Stone Therapy',
    price: '₦18,500',
    duration: '1hr 15min',
    rating: '4.9',
    isVideo: false,
  },
  {
    id: 'g3',
    image: require('../../../assets/images/packages/shampoo_wash.png'),
    title: 'Hair Wash & Scalp Detox',
    price: '₦7,500',
    duration: '30min',
    rating: '4.7',
    isVideo: false,
  },
  {
    id: 'g4',
    image: require('../../../assets/images/custom/body_therapy_video.jpg'),
    title: 'Prenatal Pampering Treatment',
    price: '₦22,000',
    duration: '1hr 30min',
    rating: '4.9',
    isVideo: true,
  },
  {
    id: 'g5',
    image: require('../../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg'),
    title: 'Facial Glow Session',
    price: '₦15,000',
    duration: '50min',
    rating: '4.8',
    isVideo: false,
  },
  {
    id: 'g6',
    image: require('../../../assets/images/profile/dry_wow_pedicure.jpg'),
    title: 'Deluxe Pedicure & Polish',
    price: '₦12,000',
    duration: '45min',
    rating: '5.0',
    isVideo: false,
  },
];

// ── Customer Reviews List (1:1 Figma: Frame 1000006348) ──
const CUSTOMER_REVIEWS = [
  {
    id: 'rev1',
    author: 'Samuel Obanuju',
    avatar: require('../../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg'),
    rating: 4.5,
    comment: 'The service was premium, love the good work guys keep it up.',
    date: '12/02/2026',
    time: '12:04:20',
  },
  {
    id: 'rev2',
    author: 'Samuel Obanuju',
    avatar: require('../../../assets/images/profile/30b9a5ab22324bd8357f666111d5584ad2e3c83e.jpg'),
    rating: 4.5,
    comment: 'The service was premium, love the good work guys keep it up.',
    date: '12/02/2026',
    time: '12:04:20',
  },
  {
    id: 'rev3',
    author: 'Daniel Adewale',
    avatar: require('../../../assets/images/profile/14dcc3440340f9f140251ac160473457c89b198c.jpg'),
    rating: 5.0,
    comment: 'Best salon in Asokoro, very clean environment and skilled barbers!',
    date: '14/02/2026',
    time: '14:30:10',
  },
];

const FULL_DEFAULT_ADDRESS = '11 Gani Street, NNPC Tower Asokoro, Abuja.';

export const SalonLocationScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { isFavorite, toggleFavorite, removeFavorite } = useFavoritesContext();

  const [activeDot, setActiveDot] = useState(0);

  const salonId = (params.salonId as string) || (params.id as string) || 'salon2';
  const isBookmarked = isFavorite(salonId);

  const salon = useMemo(() => {
    const found = MOCK_SALONS.find((s) => s.id === salonId);
    if (found) return found;
    return {
      id: salonId,
      name: (params.name as string) || 'Luminious Lux',
      rating: 4.5,
      reviews: 102,
      location: (params.address as string) || FULL_DEFAULT_ADDRESS,
      priceFrom: (params.price as string) || '₦27,000',
      priceTo: '₦41,00',
      isOpen: true,
      isVerified: true,
      images: [] as any[],
    };
  }, [salonId, params]);

  // Safe rating string to avoid any .toFixed crash when params.rating is string
  const formattedRating = useMemo(() => {
    const r: any = salon.rating;
    if (typeof r === 'number') return r.toFixed(1);
    if (typeof r === 'string' && r.length > 0 && !isNaN(Number(r))) return Number(r).toFixed(1);
    return '4.5';
  }, [salon.rating]);

  const salonAddress = useMemo(() => {
    const raw = (params.address as string) || salon.location;
    if (!raw || raw.trim() === 'Jabi, Abuja' || raw.trim() === 'Jabi' || raw.length < 15) {
      return FULL_DEFAULT_ADDRESS;
    }
    return raw;
  }, [params.address, salon.location]);

  // Open native navigation/directions (Google Maps / Apple Maps turn-by-turn directions)
  const handleShowDirections = async () => {
    const encoded = encodeURIComponent(salonAddress);
    const googleDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encoded}&travelmode=driving`;
    const googleNavUrl = `google.navigation:q=${encoded}&mode=d`;
    const geoUrl = `geo:0,0?q=${encoded}`;
    const appleMapsUrl = `maps://?daddr=${encoded}&dirflg=d`;

    if (Platform.OS === 'android') {
      try {
        await Linking.openURL(googleNavUrl);
        return;
      } catch {
        try {
          await Linking.openURL(geoUrl);
          return;
        } catch {
          await Linking.openURL(googleDirectionsUrl);
          return;
        }
      }
    } else if (Platform.OS === 'ios') {
      try {
        if (await Linking.canOpenURL(appleMapsUrl)) {
          await Linking.openURL(appleMapsUrl);
          return;
        }
      } catch {}
      Linking.openURL(googleDirectionsUrl);
    } else {
      Linking.openURL(googleDirectionsUrl);
    }
  };

  const serviceHeroImage = useMemo(() => {
    if (salon.id === 'salon2' || !salon.images || salon.images.length === 0) {
      return require('../../../assets/images/custom/salon_pilatius_hero.png');
    }
    return typeof salon.images[0] === 'string' ? { uri: salon.images[0] } : salon.images[0];
  }, [salon]);

  const handleToggleWishlist = async () => {
    const heroImage = serviceHeroImage;
    const galleryImages = GALLERY_ITEMS.map((g) => g.image);
    const numPrice = parseInt((salon.priceFrom || '27000').replace(/[^0-9]/g, ''), 10) || 27000;

    if (!isBookmarked) {
      await toggleFavorite({
        id: salon.id,
        name: salon.name || 'Luminious Lux',
        price: numPrice,
        rating: String(salon.rating || '4.5'),
        location: salonAddress,
        category: 'Salon',
        imageUri: heroImage,
        images: [heroImage, ...galleryImages],
      });
      bookmarkStore.openBookmark({
        serviceName: salon.name || 'Luminious Lux',
        images: [heroImage, galleryImages[0], galleryImages[1]],
      });
    } else {
      await removeFavorite(salon.id);
      toastStore.showToast({
        message: 'Removed from wishlist',
        type: 'wishlist',
      });
    }
  };

  const handleShare = () => {
    shareStore.openShare({
      title: salon.name,
      status: salon.isOpen ? 'Available' : 'Closed',
      statusColor: salon.isOpen ? 'rgba(12, 121, 12, 0.96)' : 'rgba(204, 41, 41, 0.9)',
      url: `https://trend.app/salon/${salon.id}/location`,
      avatar: 'images' in salon && salon.images?.[0] ? { uri: salon.images[0] } : undefined,
    });
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(`/salon/${salonId}` as any);
    }
  };

  // ── Zoom & Pan state for Map Layer (Matching Explore Screen) ──
  const mapScale = useRef(new Animated.Value(1)).current;
  const mapTranslateX = useRef(new Animated.Value(0)).current;
  const mapTranslateY = useRef(new Animated.Value(0)).current;

  const currentScale = useRef(1);
  const currentTranslateX = useRef(0);
  const currentTranslateY = useRef(0);

  const initialDistance = useRef(0);
  const initialScale = useRef(1);
  const startPanX = useRef(0);
  const startPanY = useRef(0);

  useEffect(() => {
    const idS = mapScale.addListener((val: any) => { currentScale.current = typeof val === 'number' ? val : (val?.value ?? 1); });
    const idX = mapTranslateX.addListener((val: any) => { currentTranslateX.current = typeof val === 'number' ? val : (val?.value ?? 0); });
    const idY = mapTranslateY.addListener((val: any) => { currentTranslateY.current = typeof val === 'number' ? val : (val?.value ?? 0); });
    return () => {
      try {
        if (typeof (mapScale as any).removeListener === 'function') {
          mapScale.removeListener(idS);
          mapTranslateX.removeListener(idX);
          mapTranslateY.removeListener(idY);
        }
      } catch {}
    };
  }, [mapScale, mapTranslateX, mapTranslateY]);

  // PanResponder strictly on the map area
  const mapPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 3 || Math.abs(gesture.dy) > 3 || gesture.numberActiveTouches > 1;
      },
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches && touches.length >= 2) {
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          initialDistance.current = Math.hypot(dx, dy);
          initialScale.current = currentScale.current;
        } else {
          startPanX.current = currentTranslateX.current;
          startPanY.current = currentTranslateY.current;
        }
      },
      onPanResponderMove: (evt, gesture) => {
        const touches = evt.nativeEvent.touches;
        if (touches && touches.length >= 2) {
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          const distance = Math.hypot(dx, dy);
          if (initialDistance.current > 0) {
            const newScale = Math.min(Math.max(initialScale.current * (distance / initialDistance.current), 0.85), 3.5);
            mapScale.setValue(newScale);
          }
        } else if (touches && touches.length === 1) {
          const sWidth = typeof windowWidth === 'number' && windowWidth > 0 ? windowWidth : (Dimensions.get('window').width || 390);
          const sHeight = typeof windowHeight === 'number' && windowHeight > 0 ? windowHeight : (Dimensions.get('window').height || 800);
          const maxPanX = (sWidth * 0.5) * currentScale.current;
          const maxPanY = (sHeight * 0.4) * currentScale.current;
          const newX = Math.min(Math.max(startPanX.current + gesture.dx, -maxPanX), maxPanX);
          const newY = Math.min(Math.max(startPanY.current + gesture.dy, -maxPanY), maxPanY);
          mapTranslateX.setValue(newX);
          mapTranslateY.setValue(newY);
        }
      },
      onPanResponderRelease: () => {
        if (currentScale.current < 1.0) {
          Animated.parallel([
            Animated.spring(mapScale, { toValue: 1.0, useNativeDriver: false, friction: 7 }),
            Animated.spring(mapTranslateX, { toValue: 0, useNativeDriver: false, friction: 7 }),
            Animated.spring(mapTranslateY, { toValue: 0, useNativeDriver: false, friction: 7 }),
          ]).start();
        }
      },
    })
  ).current;

  const handleZoomIn = () => {
    const nextScale = Math.min(currentScale.current + 0.5, 3.5);
    Animated.spring(mapScale, {
      toValue: nextScale,
      useNativeDriver: false,
      friction: 7,
    }).start();
  };

  const handleZoomOut = () => {
    const nextScale = Math.max(currentScale.current - 0.5, 1.0);
    Animated.parallel([
      Animated.spring(mapScale, {
        toValue: nextScale,
        useNativeDriver: false,
        friction: 7,
      }),
      ...(nextScale === 1.0
        ? [
            Animated.spring(mapTranslateX, { toValue: 0, useNativeDriver: false }),
            Animated.spring(mapTranslateY, { toValue: 0, useNativeDriver: false }),
          ]
        : []),
    ]).start();
  };

  const handleRecenter = () => {
    Animated.parallel([
      Animated.spring(mapScale, { toValue: 1.0, useNativeDriver: false, friction: 7 }),
      Animated.spring(mapTranslateX, { toValue: 0, useNativeDriver: false, friction: 7 }),
      Animated.spring(mapTranslateY, { toValue: 0, useNativeDriver: false, friction: 7 }),
    ]).start();
  };

  // ── Animated Draggable Bottom Sheet (Half-screen draggable matching Explore) ──
  const safeTop = typeof insets?.top === 'number' && !isNaN(insets.top) ? insets.top : 0;
  const safeBottom = typeof insets?.bottom === 'number' && !isNaN(insets.bottom) ? insets.bottom : 0;
  const winWidth = typeof windowWidth === 'number' && windowWidth > 0 ? windowWidth : (Dimensions.get('window').width || 390);
  const winHeight = typeof windowHeight === 'number' && windowHeight > 0 ? windowHeight : (Dimensions.get('window').height || 800);

  const screenH = winHeight;
  const HEADER_TOTAL_HEIGHT = Math.max(safeTop, 14) + 64;
  // Leave room for header + floating buttons (64px + 16px gap) so buttons don't collide with header at full expansion
  const EXPANDED_TOP = HEADER_TOTAL_HEIGHT + 68;
  const EXPANDED_HEIGHT = Math.max(screenH - EXPANDED_TOP, 300);
  const DEFAULT_HEIGHT = Math.round(screenH * 0.52); // Default half-screen
  const COLLAPSED_HEIGHT = 160;

  const SNAP_EXPANDED = 0;
  const SNAP_HALF = Math.max(0, EXPANDED_HEIGHT - DEFAULT_HEIGHT);
  const SNAP_COLLAPSED = Math.max(0, EXPANDED_HEIGHT - COLLAPSED_HEIGHT);

  const panY = useRef(new Animated.Value(SNAP_HALF)).current;
  const currentPanY = useRef(SNAP_HALF);
  const startDragY = useRef(SNAP_HALF);

  useEffect(() => {
    const id = panY.addListener((val: any) => {
      currentPanY.current = typeof val === 'number' ? val : (val?.value ?? SNAP_HALF);
    });
    return () => {
      try {
        if (typeof (panY as any).removeListener === 'function') {
          panY.removeListener(id);
        } else if (typeof (panY as any).removeAllListeners === 'function') {
          panY.removeAllListeners();
        }
      } catch {}
    };
  }, [panY, SNAP_HALF]);

  const animateToSnap = (toValue: number) => {
    Animated.spring(panY, {
      toValue,
      useNativeDriver: false,
      friction: 8,
      tension: 65,
    }).start();
  };

  const cycleSnapState = () => {
    const current = currentPanY.current;
    const isNearCollapsed = Math.abs(current - SNAP_COLLAPSED) < 40;
    const isNearExpanded = Math.abs(current - SNAP_EXPANDED) < 40;

    if (isNearCollapsed) {
      animateToSnap(SNAP_HALF);
    } else if (isNearExpanded) {
      animateToSnap(SNAP_HALF);
    } else {
      animateToSnap(SNAP_EXPANDED);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 4,
      onMoveShouldSetPanResponderCapture: (_, gestureState) =>
        Math.abs(gestureState.dy) > 4,
      onPanResponderGrant: () => {
        panY.stopAnimation((val) => {
          startDragY.current = val;
        });
      },
      onPanResponderMove: (_, gestureState) => {
        let newY = startDragY.current + gestureState.dy;
        if (newY < -10) newY = -10;
        if (newY > SNAP_COLLAPSED + 10) {
          newY = SNAP_COLLAPSED + 10;
        }
        panY.setValue(newY);
      },
      onPanResponderRelease: (_, gestureState) => {
        const current = currentPanY.current;
        const projected = current + gestureState.vy * 80;

        let targetSnap = SNAP_HALF;
        if (gestureState.vy > 0.6) {
          targetSnap = current < SNAP_HALF ? SNAP_HALF : SNAP_COLLAPSED;
        } else if (gestureState.vy < -0.6) {
          targetSnap = current > SNAP_HALF ? SNAP_HALF : SNAP_EXPANDED;
        } else {
          const distToExpanded = Math.abs(projected - SNAP_EXPANDED);
          const distToHalf = Math.abs(projected - SNAP_HALF);
          const distToCollapsed = Math.abs(projected - SNAP_COLLAPSED);

          if (distToCollapsed <= distToHalf && distToCollapsed <= distToExpanded) {
            targetSnap = SNAP_COLLAPSED;
          } else if (distToExpanded <= distToHalf && distToExpanded <= distToCollapsed) {
            targetSnap = SNAP_EXPANDED;
          } else {
            targetSnap = SNAP_HALF;
          }
        }

        animateToSnap(targetSnap);
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* ─── 1. Fixed Top Header (1:1 Figma: page header) ─── */}
      <View style={[styles.pageHeader, { paddingTop: safeTop > 0 ? safeTop : 14 }]}>
        <View style={styles.headerContent}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={handleGoBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} />
          </TouchableOpacity>

          {/* Header Title */}
          <Text style={styles.headerTitle}>Location</Text>

          {/* Share Button */}
          <TouchableOpacity
            style={styles.shareButton}
            activeOpacity={0.7}
            onPress={handleShare}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ShareIcon size={24} color="#141B34" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── 2. Zoomable & Pannable Map View Area (Matching Explore Screen) ─── */}
      <View style={styles.mapViewport} {...mapPanResponder.panHandlers}>
        <Animated.View
          style={[
            styles.mapCanvas,
            {
              width: winWidth * 1.6,
              height: winHeight * 1.3,
              left: -(winWidth * 0.3),
              top: -(winHeight * 0.1),
              transform: [
                { translateX: mapTranslateX },
                { translateY: mapTranslateY },
                { scale: mapScale },
              ],
            },
          ]}
        >
          <Image
            source={require('../../../assets/images/salon_map_google.jpg')}
            style={styles.mapImage}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Floating Zoom & Recenter Controls on Map (Top Right beneath header) */}
        <View style={[styles.zoomControlsContainer, { top: Math.max(safeTop, 14) + 72 }]}>
          <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn} activeOpacity={0.8}>
            <Plus size={18} color="#000814" strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.zoomDivider} />
          <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut} activeOpacity={0.8}>
            <Minus size={18} color="#000814" strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.zoomDivider} />
          <TouchableOpacity style={styles.zoomButton} onPress={handleRecenter} activeOpacity={0.8}>
            <LocateFixed size={18} color="#000814" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── 3. Draggable Bottom Sheet (1:1 Figma: salon information) ─── */}
      <Animated.View
        style={[
          styles.bottomSheetContainer,
          {
            height: EXPANDED_HEIGHT + 64,
            transform: [{ translateY: panY }],
          },
        ]}
      >
        {/* Floating Action Buttons over Map (Positioned inside container bounds, moves with sheet, 100% touchable on Android) */}
        <View
          style={styles.floatingButtonsWrapper}
          {...panResponder.panHandlers}
        >
          {/* Filled action Button: Show Direction (Centered horizontally) */}
          <TouchableOpacity
            style={styles.filledActionButton}
            activeOpacity={0.85}
            onPress={handleShowDirections}
          >
            <ShowDirectionArrowIcon size={20} color="#FFFFFF" />
            <Text style={styles.filledActionButtonText}>Show Direction</Text>
          </TouchableOpacity>
        </View>

        {/* White Rounded Sheet Card Body */}
        <View style={styles.sheetCard}>
          {/* Drag Touch Area Header */}
          <TouchableOpacity
            style={styles.dragArea}
            activeOpacity={0.9}
            onPress={cycleSnapState}
            {...panResponder.panHandlers}
          >
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>
          </TouchableOpacity>

          {/* Scrollable Sheet Content (1:1 Figma: Frame 1000006524) */}
          <ScrollView
            style={styles.sheetScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.sheetContentContainer,
              { paddingBottom: 60 + safeBottom },
            ]}
          >
          {/* ──────── SECTION 1: Service Center Banner & Details ──────── */}
          <View style={styles.serviceCenterSection}>
            {/* Banner Image Frame */}
            <View style={styles.imageFrame}>
              <SafeImage
                source={serviceHeroImage}
                style={styles.bannerImage}
                resizeMode="cover"
              />

              {/* Bookmark Button (Top Right 1:1 Figma) */}
              <TouchableOpacity
                style={styles.bookmarkButton}
                activeOpacity={0.8}
                onPress={handleToggleWishlist}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <BookmarkHeartIcon isBookmarked={isBookmarked} size={24} />
              </TouchableOpacity>

              {/* "Open" Status Tag (Bottom Left) */}
              <View style={styles.openStatusBadge}>
                <Text style={styles.openStatusText}>Open</Text>
              </View>

              {/* Carousel Indicator Dots (Bottom Center) */}
              <View style={styles.carouselIndicator}>
                <View style={[styles.carouselDot, styles.carouselDotActive]} />
                <View style={styles.carouselDot} />
                <View style={styles.carouselDot} />
                <View style={styles.carouselDot} />
              </View>
            </View>

            {/* Service Center Details */}
            <View style={styles.serviceCenterDetails}>
              {/* Name and Rating Row */}
              <View style={styles.nameAndRateRow}>
                <View style={styles.verifiedSalonRow}>
                  <Text style={styles.salonNameText} numberOfLines={1}>
                    {salon.name || 'Luminious Lux'}
                  </Text>
                  <VerifiedShieldIcon size={20} />
                </View>

                <View style={styles.ratesRow}>
                  <Star size={24} color="rgba(248, 155, 24, 0.96)" fill="rgba(248, 155, 24, 0.96)" />
                  <Text style={styles.ratingText}>
                    {formattedRating} ({salon.reviews || 102})
                  </Text>
                </View>
              </View>

              {/* Price and Location Container */}
              <View style={styles.priceAndLocationContainer}>
                {/* Price Row */}
                <View style={styles.priceRow}>
                  <View style={styles.priceGroup}>
                    <Text style={styles.primaryPriceText}>{salon.priceFrom || '₦27,000'}</Text>
                    {salon.priceTo ? (
                      <View style={styles.discountPriceContainer}>
                        <Text style={styles.discountPriceText}>{salon.priceTo}</Text>
                        <View style={styles.strikethroughLine} />
                      </View>
                    ) : null}
                  </View>
                </View>

                {/* Location and Status Row */}
                <TouchableOpacity
                  style={styles.locationRow}
                  activeOpacity={0.7}
                  onPress={handleShowDirections}
                >
                  <MapPin size={20} color="rgba(192, 192, 204, 0.96)" strokeWidth={1.5} />
                  <Text style={styles.addressText} numberOfLines={1}>
                    {salonAddress}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ──────── SECTION 2: Salon Portfolio (Gallery) ──────── */}
          <View style={styles.gallerySection}>
            {/* Gallery Header */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.galleryHeading}>Gallery</Text>
              <TouchableOpacity
                style={styles.seeAllCircleBtn}
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

            {/* 6 Portfolio Images Grid (3 per row x 2 rows, 1:1 Figma: 103.33x103.33, gap: 32px row, 24px col) */}
            <View style={styles.portfolioGrid}>
              <View style={styles.portfolioRow}>
                {GALLERY_ITEMS.slice(0, 3).map((item, idx) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.portfolioCell}
                    activeOpacity={0.88}
                    onPress={() => {
                      previewStore.setPreviewImages(
                        GALLERY_ITEMS.map((g) => g.image),
                        `${salon.name} Portfolio`,
                        GALLERY_ITEMS.map((g) => ({
                          image: g.image,
                          title: g.title,
                          price: g.price,
                          duration: g.duration,
                          rating: g.rating,
                        })),
                        idx
                      );
                      router.push({
                        pathname: '/professional/gallery-preview',
                        params: {
                          index: idx,
                          initialIndex: idx,
                          source: 'salon',
                          title: `${salon.name} Portfolio`,
                        },
                      } as any);
                    }}
                  >
                    <SafeImage source={item.image} style={styles.portfolioImage} resizeMode="cover" />
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.portfolioRow}>
                {GALLERY_ITEMS.slice(3, 6).map((item, idx) => {
                  const actualIdx = idx + 3;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.portfolioCell}
                      activeOpacity={0.88}
                      onPress={() => {
                        previewStore.setPreviewImages(
                          GALLERY_ITEMS.map((g) => g.image),
                          `${salon.name} Portfolio`,
                          GALLERY_ITEMS.map((g) => ({
                            image: g.image,
                            title: g.title,
                            price: g.price,
                            duration: g.duration,
                            rating: g.rating,
                          })),
                          actualIdx
                        );
                        router.push({
                          pathname: '/professional/gallery-preview',
                          params: {
                            index: actualIdx,
                            initialIndex: actualIdx,
                            source: 'salon',
                            title: `${salon.name} Portfolio`,
                          },
                        } as any);
                      }}
                    >
                      <SafeImage source={item.image} style={styles.portfolioImage} resizeMode="cover" />
                      {/* Centered White Play Triangle on 4th image (1:1 Figma: Polygon 4) */}
                      {actualIdx === 3 && (
                        <View style={styles.playButtonOverlay} pointerEvents="none">
                          <PlayTriangleIcon />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* ──────── SECTION 3: Reviews ──────── */}
          <View style={styles.reviewsSection}>
            {/* Sub-section A: Efficiency Tags */}
            <View style={styles.efficiencyTagsContainer}>
              <Text style={styles.efficiencyHeading}>Based on customers review</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.reviewTagsScrollContent}
              >
                {REVIEW_TAGS.map((tag) => (
                  <View key={tag.id} style={styles.reviewTagPill}>
                    <Text style={styles.tagEmoji}>{tag.emoji}</Text>
                    <Text style={styles.tagNameText}>{tag.name}</Text>
                    <Text style={styles.tagCountText}>{tag.count}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Sub-section B: Customer Review Cards */}
            <View style={styles.reviewCardsSection}>
              {/* Header */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.reviewsHeading}>Reviews</Text>
                <TouchableOpacity
                  style={styles.seeAllCircleBtn}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: '/salon/reviews',
                      params: { salonId: salon.id, name: salon.name },
                    } as any)
                  }
                >
                  <ArrowRight size={20} color="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} />
                </TouchableOpacity>
              </View>

              {/* Horizontal Scroll of Review Cards */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.reviewCardsScrollContent}
              >
                {CUSTOMER_REVIEWS.map((rev, index) => (
                  <React.Fragment key={rev.id}>
                    <View style={styles.userReviewCard}>
                      <Image source={rev.avatar} style={styles.userAvatar} />

                      <View style={styles.reviewTextCol}>
                        {/* Username and Star Rating */}
                        <View style={styles.userNameAndRateRow}>
                          <Text style={styles.userNameText} numberOfLines={1}>
                            {rev.author}
                          </Text>
                          <View style={styles.dotDivider} />
                          <View style={styles.fiveStarsRow}>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                color="rgba(248, 155, 24, 0.96)"
                                fill="rgba(248, 155, 24, 0.96)"
                              />
                            ))}
                          </View>
                        </View>

                        {/* Review Comment */}
                        <Text style={styles.reviewCommentText} numberOfLines={2}>
                          {rev.comment}
                        </Text>

                        {/* Date and Time */}
                        <View style={styles.dateTimeRow}>
                          <Text style={styles.dateTimeText}>{rev.date}</Text>
                          <View style={styles.dotDividerSmall} />
                          <Text style={styles.dateTimeText}>{rev.time}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Vertical Divider line between review cards */}
                    {index < CUSTOMER_REVIEWS.length - 1 && (
                      <View style={styles.cardVerticalDivider} />
                    )}
                  </React.Fragment>
                ))}
              </ScrollView>
            </View>
          </View>
        </ScrollView>
      </View>
    </Animated.View>
  </View>
);
};

// ── 1:1 React Native Stylesheet Passed Through Figma CSS Converter Rules ──
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },

  // ── 1. Page Header (Figma: page header, height: 64px) ──
  pageHeader: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    zIndex: 100,
  },
  headerContent: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
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
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── 2. Map Area (Zoomable matching Explore) ──
  mapViewport: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 1,
  },
  mapCanvas: {
    position: 'absolute',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  zoomControlsContainer: {
    position: 'absolute',
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.4)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
    zIndex: 45,
  },
  zoomButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    width: '100%',
  },
  floatingButtonsWrapper: {
    width: '100%',
    height: 48,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 60,
  },
  filledActionButton: {
    width: 184,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 20,
    shadowColor: 'rgba(133, 139, 148, 0.04)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 18,
  },
  filledActionButtonText: {
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },

  // ── 3. Draggable Bottom Sheet (Figma: salon information) ──
  bottomSheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    overflow: 'visible',
    zIndex: 50,
  },
  sheetCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 16,
    overflow: 'hidden',
  },
  dragArea: {
    width: '100%',
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragHandleContainer: {
    paddingVertical: 4,
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },
  sheetScroll: {
    flex: 1,
  },
  sheetContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 40,
  },

  // ── Section 1: Service Center (Figma: service center, gap: 24px) ──
  serviceCenterSection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 24,
    width: '100%',
  },
  imageFrame: {
    width: '100%',
    height: 176,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(247, 247, 247, 0.98)',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 9,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bookmarkButton: {
    position: 'absolute',
    right: 16,
    top: 8,
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  openStatusBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    width: 64,
    height: 28,
    borderRadius: 16,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  openStatusText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
    color: 'rgba(12, 121, 12, 0.96)',
  },
  carouselIndicator: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  carouselDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },
  carouselDotActive: {
    backgroundColor: '#FFFFFF',
  },

  serviceCenterDetails: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    width: '100%',
  },
  nameAndRateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 28,
  },
  verifiedSalonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  salonNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  ratesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  priceAndLocationContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    width: '100%',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 24,
  },
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  primaryPriceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  discountPriceContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountPriceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  strikethroughLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(96, 96, 102, 0.96)',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    height: 32,
  },
  addressText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
    textDecorationLine: 'underline',
    color: 'rgba(96, 96, 102, 0.96)',
    flex: 1,
  },

  // ── Section 2: Salon Portfolio / Gallery (Figma: salon protfolio, gap: 24px) ──
  gallerySection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 24,
    width: '100%',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 40,
  },
  galleryHeading: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
  },
  seeAllCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
  },
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

  // ── Section 3: Reviews (Figma: reviews, gap: 40px) ──
  reviewsSection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 40,
    width: '100%',
  },
  efficiencyTagsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
    width: '100%',
  },
  efficiencyHeading: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
  },
  reviewTagsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingRight: 16,
  },
  reviewTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
    height: 44,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderRadius: 24,
  },
  tagEmoji: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
  },
  tagNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  tagCountText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  reviewCardsSection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 24,
    width: '100%',
  },
  reviewsHeading: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
  },
  reviewCardsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingRight: 16,
  },
  userReviewCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 8,
    gap: 8,
    width: 316,
    height: 112,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  reviewTextCol: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 6,
  },
  userNameAndRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  userNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    maxWidth: 120,
  },
  dotDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D9D9D9',
  },
  fiveStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  reviewCommentText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dotDividerSmall: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D9D9D9',
  },
  dateTimeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  cardVerticalDivider: {
    width: 1,
    height: 100,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
});

export default SalonLocationScreen;
