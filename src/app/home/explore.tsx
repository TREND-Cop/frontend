import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import {
  Accessibility,
  Bus,
  Filter,
  Flame,
  LocateFixed,
  MapPin as MapPinIcon,
  Minus,
  Plus,
  Search,
  Star,
  TrendingUp,
  Waves,
  Wifi,
} from 'lucide-react-native';
import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeImage } from '../../components/ui/SafeImage';
import { ExploreSkeleton } from '../../components/ui/ExploreSkeleton';
import { useTabSkeleton } from '../../utils/tabSkeletonStore';
import { FilterModal, FilterState, PRICE_STEPS } from '../../components/FilterModal';
import { MOCK_SALONS } from '../../screens/home/mockSalons';
import { typography } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

// ── Custom Dog Icon Matching Figma lucide:dog ──
const DogIcon = ({ color = 'rgba(0, 8, 20, 0.96)', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M10 5.172C10 3.791 8.88 2 7.5 2S5 3.791 5 5.172c0 .878.47 1.674 1.22 2.083l-2.028 4.056A3.003 3.003 0 004 12.656V19a3 3 0 003 3h10a3 3 0 003-3v-6.344c0-.462-.07-.922-.208-1.345l-2.028-4.056C18.53 6.846 19 6.05 19 5.172 19 3.791 17.88 2 16.5 2S14 3.791 14 5.172c0 .666.27 1.282.72 1.734L12 8.5 9.28 6.906c.45-.452.72-1.068.72-1.734z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M9 14h.01M15 14h.01" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path d="M12 16.5c-.75 0-1.5-.5-1.5-1h3c0 .5-.75 1-1.5 1z" fill={color} />
  </Svg>
);

// ── Custom Parking Icon (Figma: car-parking-01 - garage shelter over car) ──
const CarParkingIcon = ({ color = 'rgba(0, 8, 20, 0.96)', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 4H21" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    <Path d="M4 4V19" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    <Path d="M7 14L8.5 9.5H16.5L18 14" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M6 14H19C19.5523 14 20 14.4477 20 15V17.5C20 18.0523 19.5523 18.5 19 18.5H6C5.44772 18.5 5 18.0523 5 17.5V15C5 14.4477 5.44772 14 6 14Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    <Path d="M8 18.5V20.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M17 18.5V20.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M8 16H9" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    <Path d="M16 16H17" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
  </Svg>
);

// ── Custom Filter Pill Matching Figma & Screenshot ──
const FilterPill = ({
  label,
  icon,
  isSelected,
  onPress,
}: {
  label: string;
  icon?: (color: string) => React.ReactNode;
  isSelected?: boolean;
  onPress?: () => void;
}) => {
  const activeColor = isSelected ? '#FFFFFF' : 'rgba(0, 8, 20, 0.96)';
  return (
    <TouchableOpacity
      style={[styles.filterPill, isSelected && styles.filterPillSelected]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Text style={[styles.filterPillText, isSelected && styles.filterPillTextSelected]}>
        {label}
      </Text>
      {icon ? icon(activeColor) : null}
    </TouchableOpacity>
  );
};

// ── Price Pin on Map (Figma: height 21.89px, radius 16px, background rgba(255,255,255,0.96)) ──
const PricePin = ({
  price,
  top,
  left,
  right,
  isSelected,
  onPress,
}: {
  price: string;
  top: number;
  left?: number;
  right?: number;
  isSelected?: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    style={[styles.pricePinContainer, { top, left, right }]}
    activeOpacity={0.8}
    onPress={onPress}
  >
    <View style={[styles.pricePinBubble, isSelected && styles.pricePinBubbleSelected]}>
      <Text style={[styles.pricePinText, isSelected && styles.pricePinTextSelected]}>{price}</Text>
    </View>
    <View style={[styles.pricePinTriangle, isSelected && styles.pricePinTriangleSelected]} />
  </TouchableOpacity>
);

// ── Verified Blue Badge (Figma: checkmark-badge-02, 16x16, accent background with white check) ──
const VerifiedBadge = () => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <Path
      d="M8 0.5C3.85786 0.5 0.5 3.85786 0.5 8C0.5 12.1421 3.85786 15.5 8 15.5C12.1421 15.5 15.5 12.1421 15.5 8C15.5 3.85786 12.1421 0.5 8 0.5Z"
      fill="rgba(26, 130, 255, 0.9)"
    />
    <Path
      d="M5.2 8.2L7.1 10L10.8 6.2"
      stroke="#FFFFFF"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Place Card Item Matching 1:1 Figma & Screenshot ──
const PlaceCard = ({
  image,
  title,
  isVerified,
  rating,
  reviews,
  currentPrice,
  location,
  hasBookingTag,
  status,
  hasDots,
  imageHeight = 144,
  imageBorderRadius = 16,
  titleSize = 17,
  onPress,
}: {
  image: any;
  title: string;
  isVerified?: boolean;
  rating: string;
  reviews: string;
  currentPrice: string;
  location: string;
  hasBookingTag?: boolean;
  status?: 'Open' | 'Closed';
  hasDots?: boolean;
  imageHeight?: number;
  imageBorderRadius?: number;
  titleSize?: number;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity
      style={styles.placeCard}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {/* Image Container */}
      <View style={[styles.placeImageContainer, { height: imageHeight, borderRadius: imageBorderRadius }]}>
        <SafeImage source={image} style={styles.placeImage} resizeMode="cover" />

        {/* Optional "Bookings" Tag */}
        {hasBookingTag && (
          <View style={styles.bookingTag}>
            <Text style={styles.bookingTagText}>Bookings</Text>
          </View>
        )}

        {/* Carousel Indicator Dots */}
        {hasDots && (
          <View style={styles.carouselIndicator}>
            <View style={[styles.carouselDot, styles.carouselDotActive]} />
            <View style={styles.carouselDot} />
            <View style={styles.carouselDot} />
            <View style={styles.carouselDot} />
          </View>
        )}
      </View>

      {/* Place Details */}
      <View style={styles.placeInfo}>
        {/* Name & Rates Row */}
        <View style={styles.nameAndRateRow}>
          <View style={styles.verifiedSalonRow}>
            <Text style={[styles.placeTitle, { fontSize: titleSize }]} numberOfLines={1}>
              {title}
            </Text>
            {isVerified && <VerifiedBadge />}
          </View>
          <View style={styles.ratesRow}>
            <Star size={18} color="rgba(248, 155, 24, 0.96)" fill="rgba(248, 155, 24, 0.96)" />
            <Text style={styles.ratingText}>
              {rating} ({reviews})
            </Text>
          </View>
        </View>

        {/* Price Row (Only the real price, cleanly spaced) */}
        <View style={styles.priceRow}>
          <Text style={styles.currentPrice}>{currentPrice}</Text>
        </View>

        {/* Location & Status Row */}
        <View style={styles.locationAndStatusRow}>
          <View style={styles.locationRow}>
            <MapPinIcon size={18} color="rgba(192, 192, 204, 0.96)" strokeWidth={1.5} />
            <Text style={styles.locationText}>{location}</Text>
          </View>
          {status === 'Open' ? (
            <View style={styles.openBadge}>
              <Text style={styles.openBadgeText}>Open</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface ExplorePlace {
  id: string;
  title: string;
  isVerified?: boolean;
  rating: string;
  reviews: string;
  currentPrice: string;
  oldPrice?: string;
  location: string;
  status?: 'Open' | 'Closed';
  hasDots?: boolean;
  hasBookingTag?: boolean;
  image: any;
  imageHeight?: number;
  imageBorderRadius?: number;
  titleSize?: number;
  amenities: string[];
  pinPrice: string;
  mapCoord: { top: number; left?: number; right?: number };
}

const EXPLORE_PLACES: ExplorePlace[] = [
  {
    id: 'salon2',
    title: 'Luminious Lux',
    isVerified: true,
    rating: '4.5',
    reviews: '102',
    currentPrice: '₦27,000',
    oldPrice: '₦41,000',
    location: 'Asokoro, Abuja. (5km)',
    status: 'Open',
    hasDots: true,
    image: require('../../../assets/images/map1.jpg'),
    imageHeight: 144,
    imageBorderRadius: 16,
    titleSize: 17,
    amenities: ['Wifi', 'Sauna'],
    pinPrice: '₦27,000',
    mapCoord: { top: 340, left: 340 },
  },
  {
    id: 'green_vail',
    title: 'Green Vail Clinic',
    isVerified: false,
    rating: '4.0',
    reviews: '91',
    currentPrice: '₦32,000',
    oldPrice: '₦41,000',
    location: 'Asokoro, Abuja.',
    hasBookingTag: true,
    image: require('../../../assets/images/map2.jpg'),
    imageHeight: 144,
    imageBorderRadius: 16,
    titleSize: 16,
    amenities: ['Parking Space'],
    pinPrice: '₦3,750.00',
    mapCoord: { top: 295, left: 190 },
  },
  {
    id: 'aesthetic_flow',
    title: 'Aesthetic Flow',
    isVerified: true,
    rating: '4.4',
    reviews: '70',
    currentPrice: '₦82,000',
    oldPrice: '₦41,000',
    location: 'Maitama, Abuja.',
    hasBookingTag: true,
    image: require('../../../assets/images/map3.jpg'),
    imageHeight: 144,
    imageBorderRadius: 16,
    titleSize: 16,
    amenities: ['Pool', 'Wheel Chair Accessible'],
    pinPrice: '₦78,900.00',
    mapCoord: { top: 430, left: 420 },
  },
  {
    id: 'glamour_glow',
    title: 'Glamour & Glow Studio',
    isVerified: true,
    rating: '4.8',
    reviews: '115',
    currentPrice: '₦18,500',
    oldPrice: '₦25,000',
    location: 'Wuse II, Abuja.',
    status: 'Open',
    image: require('../../../assets/images/search_salon1.png'),
    imageHeight: 144,
    imageBorderRadius: 16,
    titleSize: 17,
    amenities: ['Wifi', 'Public Transport'],
    pinPrice: '₦18,500',
    mapCoord: { top: 310, left: 270 },
  },
  {
    id: 'velvet_chair',
    title: 'The Velvet Chair Lounge',
    isVerified: true,
    rating: '4.9',
    reviews: '142',
    currentPrice: '₦35,000',
    oldPrice: '₦45,000',
    location: 'Maitama, Abuja.',
    status: 'Open',
    image: require('../../../assets/images/custom/gallery_salon_chairs.png'),
    imageHeight: 144,
    imageBorderRadius: 16,
    titleSize: 17,
    amenities: ['Wifi', 'Parking Space', 'Sauna'],
    pinPrice: '₦35,000',
    mapCoord: { top: 460, left: 300 },
  },
  {
    id: 'urban_waves',
    title: 'Urban Waves Barbers',
    isVerified: false,
    rating: '4.6',
    reviews: '88',
    currentPrice: '₦15,000',
    oldPrice: '₦20,000',
    location: 'Gwarinpa, Abuja.',
    status: 'Open',
    image: require('../../../assets/images/custom/gallery_barber_haircut.png'),
    imageHeight: 144,
    imageBorderRadius: 16,
    titleSize: 17,
    amenities: ['Wifi', 'Public Transport'],
    pinPrice: '₦15,000',
    mapCoord: { top: 260, left: 380 },
  },
  {
    id: 'luxe_haven',
    title: 'Luxe Haven Spa & Salon',
    isVerified: true,
    rating: '4.7',
    reviews: '96',
    currentPrice: '₦22,000',
    oldPrice: '₦30,000',
    location: 'Maitama, Abuja.',
    status: 'Open',
    image: require('../../../assets/images/packages/stone_massage.png'),
    imageHeight: 144,
    imageBorderRadius: 16,
    titleSize: 17,
    amenities: ['Parking Space', 'Sauna'],
    pinPrice: '₦22,000',
    mapCoord: { top: 410, left: 210 },
  },
  {
    id: 'metro_style',
    title: 'Metro Style Lounge',
    isVerified: false,
    rating: '4.3',
    reviews: '64',
    currentPrice: '₦14,000',
    oldPrice: '₦18,000',
    location: 'Wuse Zone 4, Abuja.',
    status: 'Open',
    image: require('../../../assets/images/search_salon2.png'),
    imageHeight: 144,
    imageBorderRadius: 16,
    titleSize: 17,
    amenities: ['Public Transport', 'Wheel Chair Accessible'],
    pinPrice: '₦14,000',
    mapCoord: { top: 370, left: 240 },
  },
  {
    id: 'serene_oasis',
    title: 'Serene Oasis Wellness',
    isVerified: true,
    rating: '4.9',
    reviews: '120',
    currentPrice: '₦65,000',
    oldPrice: '₦85,000',
    location: 'Asokoro, Abuja.',
    status: 'Open',
    image: require('../../../assets/images/custom/salon_pilatius_hero.png'),
    imageHeight: 144,
    imageBorderRadius: 16,
    titleSize: 17,
    amenities: ['Pool', 'Sauna', 'Parking Space'],
    pinPrice: '₦65,000',
    mapCoord: { top: 350, left: 410 },
  },
  {
    id: 'paws_posh',
    title: 'Paws & Posh Grooming & Salon',
    isVerified: false,
    rating: '4.7',
    reviews: '52',
    currentPrice: '₦16,000',
    oldPrice: '₦22,000',
    location: 'Guzape, Abuja.',
    status: 'Open',
    image: require('../../../assets/images/map1.jpg'),
    imageHeight: 144,
    imageBorderRadius: 16,
    titleSize: 17,
    amenities: ['Pets', 'Parking Space'],
    pinPrice: '₦16,000',
    mapCoord: { top: 470, left: 370 },
  },
  {
    id: 'friendly_snip',
    title: 'Friendly Snip & Spa',
    isVerified: true,
    rating: '4.5',
    reviews: '47',
    currentPrice: '₦24,500',
    oldPrice: '₦32,000',
    location: 'Wuse II, Abuja.',
    status: 'Open',
    image: require('../../../assets/images/packages/back_massage.png'),
    imageHeight: 144,
    imageBorderRadius: 16,
    titleSize: 17,
    amenities: ['Pets', 'Wifi'],
    pinPrice: '₦24,500',
    mapCoord: { top: 280, left: 320 },
  },
  {
    id: 'inclusive_care',
    title: 'Inclusive Care Wellness',
    isVerified: true,
    rating: '4.8',
    reviews: '83',
    currentPrice: '₦30,000',
    oldPrice: '₦40,000',
    location: 'Jabi, Abuja.',
    status: 'Open',
    image: require('../../../assets/images/custom/gallery_barber_facial.jpg'),
    imageHeight: 144,
    imageBorderRadius: 16,
    titleSize: 17,
    amenities: ['Wheel Chair Accessible', 'Parking Space'],
    pinPrice: '₦30,000',
    mapCoord: { top: 390, left: 160 },
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const isLoading = useTabSkeleton('explore', 1100);
  const params = useLocalSearchParams<{ filter?: string; q?: string }>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);

  // Active single-amenity filter and active map price pin filter
  const [activeAmenity, setActiveAmenity] = useState<string | null>(null);
  const [activePricePin, setActivePricePin] = useState<string | null>(null);
  const [recentFilters, setRecentFilters] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Filter mode from navigation params (e.g. 'trending' | 'popular' | 'near_you' | null)
  const [filterMode, setFilterMode] = useState<'trending' | 'popular' | 'near_you' | null>(
    params.filter === 'trending'
      ? 'trending'
      : params.filter === 'popular'
      ? 'popular'
      : params.filter === 'near_you'
      ? 'near_you'
      : null
  );

  React.useEffect(() => {
    if (params.filter === 'trending') {
      setFilterMode('trending');
    } else if (params.filter === 'popular') {
      setFilterMode('popular');
    } else if (params.filter === 'near_you') {
      setFilterMode('near_you');
    }
  }, [params.filter]);

  // Track how many times user has clicked a filter (increments on each filter click/apply)
  const [filterTimes, setFilterTimes] = useState<number>(0);

  // ── Zoom & Pan state for Map Layer (ONLY the map zooms) ──
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

  React.useEffect(() => {
    const idS = mapScale.addListener(({ value }) => { currentScale.current = value; });
    const idX = mapTranslateX.addListener(({ value }) => { currentTranslateX.current = value; });
    const idY = mapTranslateY.addListener(({ value }) => { currentTranslateY.current = value; });
    return () => {
      mapScale.removeListener(idS);
      mapTranslateX.removeListener(idX);
      mapTranslateY.removeListener(idY);
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
          const maxPanX = (width * 0.5) * currentScale.current;
          const maxPanY = (height * 0.4) * currentScale.current;
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

  const [filterState, setFilterState] = useState<FilterState>({
    recentFilters: [],
    amenities: [],
    verification: 'all',
    openingTime: '',
    closingTime: '',
    minPrice: PRICE_STEPS[0],
    maxPrice: PRICE_STEPS[22],
    distance: 'all',
    gender: 'all',
    rating: 0,
  });

  const handleAmenityFilter = (amenity: string) => {
    setFilterTimes((prev) => prev + 1);
    if (activeAmenity === amenity || selectedFilters.includes(amenity)) {
      // Toggle off
      setActiveAmenity(null);
      setSelectedFilters((prev) => prev.filter((item) => item !== amenity));
      setActivePricePin(null);
      setSelectedSalonId(null);
    } else {
      setActiveAmenity(amenity);
      setActivePricePin(null);
      setSelectedSalonId(null);
      setSelectedFilters([amenity]);
      // Add to recent filters so it appears in FilterModal
      setRecentFilters((prev) => [amenity, ...prev.filter((item) => item !== amenity)]);
      animateToHeight(DEFAULT_HEIGHT);
    }
  };

  const handlePricePinPress = (salonId: string, price: string) => {
    setFilterTimes((prev) => prev + 1);
    if (activePricePin === price && selectedSalonId === salonId) {
      // Toggle off
      setActivePricePin(null);
      setSelectedSalonId(null);
    } else {
      setActivePricePin(price);
      setSelectedSalonId(salonId);
      // Add to recent filters so it appears in FilterModal
      setRecentFilters((prev) => [price, ...prev.filter((item) => item !== price)]);
      animateToHeight(DEFAULT_HEIGHT);
    }
  };

  const handleResetFilters = () => {
    setActiveAmenity(null);
    setActivePricePin(null);
    setSelectedSalonId(null);
    setFilterTimes(0);
    setFilterUsageCount(0);
    setHasAppliedFilters(false);
    setSelectedFilters([]);
    setFilterMode(null);
    setFilterState({
      recentFilters,
      amenities: [],
      verification: 'all',
      openingTime: '',
      closingTime: '',
      minPrice: PRICE_STEPS[0],
      maxPrice: PRICE_STEPS[22],
      distance: 'all',
      gender: 'all',
      rating: 0,
    });
  };

  // Track how many times user has used the filter page for filtering
  const [filterUsageCount, setFilterUsageCount] = useState<number>(0);
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);

  // Dynamic filtered places based on active amenity filters, price pin, or filterMode (trending/popular)
  const filteredPlaces = useMemo(() => {
    let list = [...EXPLORE_PLACES];

    if (activeAmenity) {
      list = list.filter((place) => place.amenities.includes(activeAmenity));
    }
    if (activePricePin) {
      list = list.filter((place) => place.pinPrice === activePricePin);
    }
    if (selectedFilters.length > 0) {
      list = list.filter((place) =>
        selectedFilters.every((filter) => place.amenities.includes(filter))
      );
    }

    if (filterMode === 'trending') {
      // Sort by rating descending (highest rated first, e.g. 4.9, 4.8, 4.7...)
      list.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    } else if (filterMode === 'popular') {
      // Sort by popularity (reviews count parsed as int descending)
      list.sort((a, b) => parseInt(b.reviews, 10) - parseInt(a.reviews, 10));
    }

    return list;
  }, [activeAmenity, activePricePin, selectedFilters, filterMode]);

  // Dynamic pins on the map: changes when user filters or selects amenity
  const displayedPins = useMemo(() => {
    if (activeAmenity) {
      return EXPLORE_PLACES.filter((place) => place.amenities.includes(activeAmenity));
    }
    if (selectedFilters.length > 0) {
      return EXPLORE_PLACES.filter((place) =>
        selectedFilters.some((filter) => place.amenities.includes(filter))
      );
    }
    if (activePricePin) {
      return EXPLORE_PLACES.filter((place) => place.pinPrice === activePricePin);
    }
    if (filterMode === 'trending') {
      return [...EXPLORE_PLACES]
        .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
        .slice(0, 5);
    }
    if (filterMode === 'popular') {
      return [...EXPLORE_PLACES]
        .sort((a, b) => parseInt(b.reviews, 10) - parseInt(a.reviews, 10))
        .slice(0, 5);
    }
    // Default view: show core places
    return [
      EXPLORE_PLACES[0], // Luminious Lux
      EXPLORE_PLACES[1], // Green Vail
      EXPLORE_PLACES[2], // Aesthetic Flow
    ];
  }, [activeAmenity, selectedFilters, activePricePin, filterMode]);

  // Check if any filter is active
  const hasActiveFilter = Boolean(activeAmenity || activePricePin || selectedFilters.length > 0 || hasAppliedFilters || filterMode);

  // The number in red on the filter button will always show when any filter is active
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeAmenity) count++;
    if (activePricePin) count++;
    if (selectedFilters.length > 0 && !activeAmenity) count += selectedFilters.length;
    if (hasAppliedFilters && filterUsageCount > 0) count = Math.max(count, filterUsageCount);
    if (filterMode) count++;
    return Math.max(count, hasActiveFilter ? 1 : 0);
  }, [activeAmenity, activePricePin, selectedFilters, hasAppliedFilters, filterUsageCount, hasActiveFilter, filterMode]);

  // Safe bottom padding for sheet accounting for bottom navigation bar
  const tabBarHeight = Platform.OS === 'ios' ? 100 : 74;
  const bottomNavHeight = insets.bottom + tabBarHeight;

  const EXPANDED_TOP = Math.max(insets.top, 14) + 136;
  const EXPANDED_HEIGHT = height - EXPANDED_TOP;
  // Half-screen state: calibrated to 58% of screen height (min 490px, leaving ample map visible above)
  const DEFAULT_HEIGHT = Math.min(EXPANDED_HEIGHT - 30, Math.max(490, Math.round(height * 0.58)));
  // COLLAPSED_HEIGHT: Sheet rests safely at bottom with drag handle accessible above tab bar
  const COLLAPSED_HEIGHT = bottomNavHeight + 72;

  const sheetHeight = useRef(new Animated.Value(DEFAULT_HEIGHT)).current;
  const currentHeight = useRef(DEFAULT_HEIGHT);
  const startDragHeight = useRef(DEFAULT_HEIGHT);

  React.useEffect(() => {
    const id = sheetHeight.addListener((value) => {
      currentHeight.current = value.value;
    });
    return () => sheetHeight.removeListener(id);
  }, [sheetHeight]);

  const animateToHeight = (toValue: number) => {
    Animated.spring(sheetHeight, {
      toValue,
      useNativeDriver: false,
      friction: 8,
      tension: 65,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 4,
      onPanResponderGrant: () => {
        sheetHeight.stopAnimation((val) => {
          startDragHeight.current = typeof val === 'number' ? val : currentHeight.current;
        });
      },
      onPanResponderMove: (_, gestureState) => {
        // Dragging up (dy < 0) increases height; dragging down (dy > 0) decreases height
        let newH = startDragHeight.current - gestureState.dy;
        const minH = COLLAPSED_HEIGHT - 20;
        const maxH = EXPANDED_HEIGHT + 20;
        if (newH < minH) newH = minH;
        if (newH > maxH) newH = maxH;
        sheetHeight.setValue(newH);
      },
      onPanResponderRelease: (_, gestureState) => {
        // Tap gesture: cycle states (collapsed -> half -> expanded -> half)
        if (Math.abs(gestureState.dy) < 8 && Math.abs(gestureState.dx) < 8) {
          const current = currentHeight.current;
          const isNearCollapsed = Math.abs(current - COLLAPSED_HEIGHT) < 40;
          const isNearExpanded = Math.abs(current - EXPANDED_HEIGHT) < 40;

          if (isNearCollapsed) {
            animateToHeight(DEFAULT_HEIGHT);
          } else if (isNearExpanded) {
            animateToHeight(DEFAULT_HEIGHT);
          } else {
            animateToHeight(EXPANDED_HEIGHT);
          }
          return;
        }

        const current = currentHeight.current;
        // Invert velocity: upward flick (vy < 0) increases height
        const projected = current - gestureState.vy * 80;

        let targetHeight = DEFAULT_HEIGHT;
        if (gestureState.vy < -0.6) {
          // Upward flick -> expand
          targetHeight = current < DEFAULT_HEIGHT ? DEFAULT_HEIGHT : EXPANDED_HEIGHT;
        } else if (gestureState.vy > 0.6) {
          // Downward flick -> collapse
          targetHeight = current > DEFAULT_HEIGHT ? DEFAULT_HEIGHT : COLLAPSED_HEIGHT;
        } else {
          // Snap to closest anchor
          const distToExpanded = Math.abs(projected - EXPANDED_HEIGHT);
          const distToHalf = Math.abs(projected - DEFAULT_HEIGHT);
          const distToCollapsed = Math.abs(projected - COLLAPSED_HEIGHT);

          if (distToCollapsed <= distToHalf && distToCollapsed <= distToExpanded) {
            targetHeight = COLLAPSED_HEIGHT;
          } else if (distToExpanded <= distToHalf && distToExpanded <= distToCollapsed) {
            targetHeight = EXPANDED_HEIGHT;
          } else {
            targetHeight = DEFAULT_HEIGHT;
          }
        }

        animateToHeight(targetHeight);
      },
    })
  ).current;

  if (isLoading) {
    return <ExploreSkeleton />;
  }

  return (
    <View style={styles.container}>
      {/* ─── Zoomable & Pannable Map Viewport (ONLY the map zooms) ─── */}
      <View style={styles.mapViewport} {...mapPanResponder.panHandlers}>
        <Animated.View
          style={[
            styles.mapCanvas,
            {
              transform: [
                { translateX: mapTranslateX },
                { translateY: mapTranslateY },
                { scale: mapScale },
              ],
            },
          ]}
        >
          {/* Map Background Image */}
          <Image
            source={require('../../../assets/images/map_bg.png')}
            style={styles.mapBackground}
            resizeMode="cover"
          />

          {/* User Location Pin ("You" Marker from Figma) */}
          <View style={[styles.userPinContainer, { top: 380, left: (width * 1.6) * 0.48 - 20 }]}>
            <View style={styles.userAddressBox}>
              <Text style={styles.userAddressText}>You</Text>
            </View>
            <View style={styles.userAddressArrow} />
            <View style={styles.userMarkerOuterRing}>
              <View style={styles.userMarkerCircle}>
                <View style={styles.userMarkerDot} />
              </View>
            </View>
          </View>

          {/* Scattered Interactive Map Price Pins (Dynamic based on active filter) */}
          {displayedPins.map((place) => (
            <PricePin
              key={place.id}
              price={place.pinPrice}
              top={place.mapCoord.top}
              left={place.mapCoord.left}
              right={place.mapCoord.right}
              isSelected={activePricePin === place.pinPrice || selectedSalonId === place.id}
              onPress={() => handlePricePinPress(place.id, place.pinPrice)}
            />
          ))}

          {/* Peripheral discovery pins when not filtering */}
          {!activeAmenity && selectedFilters.length === 0 && (
            <>
              <PricePin
                price="0.00"
                top={330}
                left={70}
                onPress={() => handlePricePinPress('green_vail', '₦3,750.00')}
              />
              <PricePin
                price="₦..."
                top={250}
                left={530}
                onPress={() => handlePricePinPress('aesthetic_flow', '₦78,900.00')}
              />
            </>
          )}
        </Animated.View>

        {/* Floating Zoom & Recenter Controls on Map */}
        <View style={[styles.zoomControlsContainer, { top: Math.max(insets.top, 14) + 144 }]}>
          <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn} activeOpacity={0.8}>
            <Plus size={18} color="#000814" strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.zoomDivider} />
          <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut} activeOpacity={0.8}>
            <Minus size={18} color="#000814" strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.zoomDivider} />
          <TouchableOpacity style={styles.zoomButton} onPress={handleRecenter} activeOpacity={0.8}>
            <LocateFixed size={18} color="#1A82FF" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Map Search Bar & Filter Header (Figma: Map search bar and sort, 136px height) ─── */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 14) + 6 }]}>
        {/* Search Bar & Independent Filter Button Row */}
        <View style={styles.searchRow}>
          {/* Search Bar (flex-expanded) */}
          <TouchableOpacity
            style={styles.searchBar}
            activeOpacity={0.8}
            onPress={() => router.push('/search')}
          >
            <Search size={22} color="#000000" strokeWidth={1.5} />
            <Text style={styles.searchPlaceholder}>
              {filterMode === 'trending'
                ? 'Trending Near You'
                : filterMode === 'popular'
                ? 'Popular places'
                : filterMode === 'near_you'
                ? 'Near You'
                : 'Search here..'}
            </Text>
          </TouchableOpacity>

          {/* Filter Button (48x48px circle with Funnel Icon) - Red badge shows number of filter times */}
          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.7}
            onPress={() => setIsFilterModalOpen(true)}
          >
            <Filter size={22} color="#141B34" strokeWidth={1.5} />
            {(filterTimes > 0 || activeFilterCount > 0) && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {filterTimes > 0 ? (filterTimes > 99 ? '99+' : filterTimes) : activeFilterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Filter Option Horizontal Scroll (height: 40px) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          {filterMode === 'trending' && (
            <FilterPill
              label="Trending Near You"
              icon={(color) => <TrendingUp size={18} color={color} strokeWidth={1.8} />}
              isSelected={true}
              onPress={() => setFilterMode(null)}
            />
          )}
          {filterMode === 'popular' && (
            <FilterPill
              label="Popular"
              icon={(color) => <Star size={18} color={color} strokeWidth={1.8} />}
              isSelected={true}
              onPress={() => setFilterMode(null)}
            />
          )}
          {filterMode === 'near_you' && (
            <FilterPill
              label="Near You"
              icon={(color) => <MapPinIcon size={18} color={color} strokeWidth={1.8} />}
              isSelected={true}
              onPress={() => setFilterMode(null)}
            />
          )}
          <FilterPill
            label="Parking Space"
            icon={(color) => <CarParkingIcon color={color} size={20} />}
            isSelected={activeAmenity === 'Parking Space' || selectedFilters.includes('Parking Space')}
            onPress={() => handleAmenityFilter('Parking Space')}
          />
          <FilterPill
            label="Wifi"
            icon={(color) => <Wifi size={20} color={color} strokeWidth={1.8} />}
            isSelected={activeAmenity === 'Wifi' || selectedFilters.includes('Wifi')}
            onPress={() => handleAmenityFilter('Wifi')}
          />
          <FilterPill
            label="Public Transport"
            icon={(color) => <Bus size={20} color={color} strokeWidth={1.8} />}
            isSelected={activeAmenity === 'Public Transport' || selectedFilters.includes('Public Transport')}
            onPress={() => handleAmenityFilter('Public Transport')}
          />
          <FilterPill
            label="Pool"
            icon={(color) => <Waves size={20} color={color} strokeWidth={1.8} />}
            isSelected={activeAmenity === 'Pool' || selectedFilters.includes('Pool')}
            onPress={() => handleAmenityFilter('Pool')}
          />
          <FilterPill
            label="Sauna"
            icon={(color) => <Flame size={20} color={color} strokeWidth={1.8} />}
            isSelected={activeAmenity === 'Sauna' || selectedFilters.includes('Sauna')}
            onPress={() => handleAmenityFilter('Sauna')}
          />
          <FilterPill
            label="Pets"
            icon={(color) => <DogIcon color={color} size={20} />}
            isSelected={activeAmenity === 'Pets' || selectedFilters.includes('Pets')}
            onPress={() => handleAmenityFilter('Pets')}
          />
          <FilterPill
            label="Wheel Chair Accessible"
            icon={(color) => <Accessibility size={20} color={color} strokeWidth={1.8} />}
            isSelected={activeAmenity === 'Wheel Chair Accessible' || selectedFilters.includes('Wheel Chair Accessible')}
            onPress={() => handleAmenityFilter('Wheel Chair Accessible')}
          />
        </ScrollView>
      </View>

      {/* ─── Bottom Sheet / Hover Cards (Figma: hover, height 520px) ── */}
      <Animated.View
        style={[
          styles.bottomSheetContainer,
          {
            height: sheetHeight,
          },
        ]}
      >
        <View style={styles.dragArea} {...panResponder.panHandlers}>
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>
          <Text style={styles.dragHeaderText}>
            {hasActiveFilter
              ? `${filteredPlaces.length} Popular ${filteredPlaces.length === 1 ? 'Place' : 'Places'} according filtered option`
              : '3 Popular Places Near You'}
          </Text>
        </View>

        <ScrollView
          style={styles.placesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bottomNavHeight + 40, gap: 10 }}
        >
          {filteredPlaces.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Search size={28} color="rgba(96, 96, 102, 0.7)" strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>Filtered option is not available</Text>
              <Text style={styles.emptySubtitle}>
                There are no salons or places near you matching {activeAmenity || selectedFilters.join(', ')} at this time.
              </Text>
              <TouchableOpacity
                style={styles.clearFilterButton}
                activeOpacity={0.8}
                onPress={handleResetFilters}
              >
                <Text style={styles.clearFilterButtonText}>Clear Filter</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                image={place.image}
                title={place.title}
                isVerified={place.isVerified}
                rating={place.rating}
                reviews={place.reviews}
                currentPrice={place.currentPrice}
                location={place.location}
                status={place.status}
                hasDots={place.hasDots}
                hasBookingTag={place.hasBookingTag}
                imageHeight={place.imageHeight}
                imageBorderRadius={place.imageBorderRadius}
                titleSize={place.titleSize}
                onPress={() =>
                  router.push({
                    pathname: '/salon/[id]',
                    params: { id: place.id, name: place.title },
                  } as any)
                }
              />
            ))
          )}
        </ScrollView>
      </Animated.View>

      {/* ── Filter Modal Bottom Sheet ── */}
      <FilterModal
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(appliedFilters) => {
          setFilterState(appliedFilters);
          setHasAppliedFilters(true);
          setSelectedFilters(appliedFilters.amenities || []);
          if (appliedFilters.amenities && appliedFilters.amenities.length > 0) {
            setActiveAmenity(appliedFilters.amenities[0]);
          } else {
            setActiveAmenity(null);
          }
          setIsFilterModalOpen(false);
          animateToHeight(DEFAULT_HEIGHT);

          const hasFilters =
            (appliedFilters.amenities && appliedFilters.amenities.length > 0) ||
            appliedFilters.verification !== 'all' ||
            appliedFilters.distance !== 'all' ||
            appliedFilters.gender !== 'all' ||
            appliedFilters.rating > 0 ||
            appliedFilters.minPrice > PRICE_STEPS[0] ||
            appliedFilters.maxPrice < PRICE_STEPS[22];

          setFilterTimes((prev) => prev + 1);
          if (hasFilters) {
            setFilterUsageCount((prev) => prev + 1);
          } else {
            setFilterUsageCount(0);
          }

          if (appliedFilters.recentFilters && appliedFilters.recentFilters.length > 0) {
            setRecentFilters(appliedFilters.recentFilters);
          }
        }}
        currentFilters={{
          ...filterState,
          recentFilters,
          amenities: activeAmenity ? [activeAmenity] : filterState.amenities,
        }}
        hasAppliedFilters={hasAppliedFilters || hasActiveFilter}
        onReset={handleResetFilters}
        items={MOCK_SALONS}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapViewport: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    zIndex: 1,
  },
  mapCanvas: {
    width: width * 1.6,
    height: height * 1.3,
    left: -(width * 0.3),
    top: -(height * 0.1),
    position: 'absolute',
  },
  mapBackground: {
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

  // ── Floating Search & Filter Header (Figma: Map search bar and sort, 136px height) ──
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(133, 139, 148, 1)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    zIndex: 100,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 48,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  searchPlaceholder: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
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
  },
  filterBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 14,
  },

  // ── Filter Options Scroll (height: 40px, gap: 12px) ──
  filtersScroll: {
    maxHeight: 40,
  },
  filtersContent: {
    gap: 12,
    paddingRight: 16,
  },
  filterPill: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
  },
  filterPillSelected: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  filterPillText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  filterPillTextSelected: {
    color: '#FFFFFF',
  },

  // ── User Pin Location ──
  userPinContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  userAddressBox: {
    width: 40,
    height: 25,
    backgroundColor: 'rgba(26, 130, 255, 0.9)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAddressText: {
    fontFamily: typography.button.fontFamily,
    fontWeight: '500',
    fontSize: 11,
    lineHeight: 13,
    color: '#FFFFFF',
  },
  userAddressArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(26, 130, 255, 0.9)',
    marginBottom: 2,
  },
  userMarkerOuterRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(26, 130, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1A82FF',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(26, 130, 255, 0.9)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  userMarkerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },

  // ── Map Price Pin ──
  pricePinContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 40,
  },
  pricePinBubble: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 16,
    shadowColor: 'rgba(133, 139, 148, 1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  pricePinText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  pricePinTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(255, 255, 255, 0.96)',
    marginTop: -1,
  },
  pricePinBubbleSelected: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  pricePinTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  pricePinTriangleSelected: {
    borderTopColor: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Bottom Sheet Container (Figma: hover, radius: 24px 24px 0 0) ──
  bottomSheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: 'rgba(110, 109, 109, 1)',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 16,
    zIndex: 200,
  },
  dragArea: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 6,
  },
  dragHandleContainer: {
    width: 72,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragHandle: {
    width: 56,
    height: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },
  dragHeaderText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    marginTop: 4,
  },
  placesList: {
    paddingHorizontal: 16,
    flex: 1,
  },

  // ── Place Card Item ──
  placeCard: {
    width: '100%',
    gap: 8,
    marginBottom: 16,
  },
  placeImageContainer: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E5E5E5',
    shadowColor: 'rgba(133, 139, 148, 1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  placeImage: {
    width: '100%',
    height: '100%',
  },
  bookingTag: {
    position: 'absolute',
    left: 8,
    top: 12,
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(229, 229, 229, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(248, 249, 250, 0.98)',
    borderRadius: 16,
  },
  bookingTagText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  carouselIndicator: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  carouselDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  carouselDotActive: {
    backgroundColor: '#FFFFFF',
  },

  // ── Place Info Section ──
  placeInfo: {
    width: '100%',
    gap: 6,
    paddingTop: 2,
  },
  nameAndRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 24,
  },
  verifiedSalonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  placeTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  ratesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // Price Row
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 22,
    marginVertical: 1,
  },
  currentPrice: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // Location & Status
  locationAndStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  locationText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  openBadge: {
    height: 22,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  openBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.3,
    color: 'rgba(12, 121, 12, 0.96)',
  },

  // ── Empty State Styles ──
  emptyContainer: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(247, 247, 248, 1)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    maxWidth: 290,
  },
  clearFilterButton: {
    height: 44,
    paddingHorizontal: 24,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  clearFilterButtonText: {
    ...typography.button,
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
  },
});

