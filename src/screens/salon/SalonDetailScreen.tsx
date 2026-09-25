import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Share,
  Platform,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Clock,
  Star,
  MapPin,
  DoorOpen,
  X,
  FileText,
  Navigation,
  MessageCircle,
} from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { ShareIcon } from '../../components/ShareIcon';
import { SafeImage } from '../../components/ui/SafeImage';
import { MOCK_SALONS, SalonItem } from '../home/mockSalons';
import { typography } from '../../constants/theme';
import { SalonSortModal, SalonSortFilterState } from '../../components/SalonSortModal';
import { previewStore } from '../../utils/previewStore';
import { bookingStore } from '../../utils/bookingStore';
import { shareStore } from '../../utils/shareStore';
import { useSkeletonCadence } from '../../hooks/useSkeletonCadence';
import { TextSkeleton } from '../../components/ui/TextSkeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Custom Verified Blue Shield Check Icon ──
const VerifiedShieldIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L4 5V11C4 16.52 7.41 21.62 12 22.95C16.59 21.62 20 16.52 20 11V5L12 2Z"
      fill="#1A82FF"
      stroke="#1A82FF"
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

// ── Route Icon for Distance ──
const RouteIcon = ({ size = 18, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 19C5.65685 19 7 17.6569 7 16C7 14.3431 5.65685 13 4 13C2.34315 13 1 14.3431 1 16C1 17.6569 2.34315 19 4 19Z"
      stroke={color}
      strokeWidth="1.5"
    />
    <Path
      d="M20 11C21.6569 11 23 9.65685 23 8C23 6.34315 21.6569 5 20 5C18.3431 5 17 6.34315 17 8C17 9.65685 18.3431 11 20 11Z"
      stroke={color}
      strokeWidth="1.5"
    />
    <Path
      d="M7 16H11C13.2091 16 15 14.2091 15 12C15 9.79086 16.7909 8 19 8H20"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Exact Figma About Icon ──
const AboutIcon = ({ size = 20, color = '#141B34' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 7.5C15 7.5 15.5 8 16 9C16 9 17.5 6.5 19 6"
      stroke={color}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 2.5C7.9 2.4 6.3 2.6 6.3 2.6C5.3 2.7 3.3 3.3 3.3 6.6C3.3 9.9 3.3 14 3.3 15.6C3.3 16.6 3.9 18.9 6 19C8.6 19.1 13.2 19.1 15.3 19C15.9 19 17.8 18.5 18 16.5C18.2 14.4 18.2 12.9 18.2 12.5"
      stroke={color}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 7.5C22 9.8 20.1 11.7 17.8 11.7C15.5 11.7 13.6 9.8 13.6 7.5C13.6 5.2 15.5 3.3 17.8 3.3C20.1 3.3 22 5.2 22 7.5Z"
      stroke={color}
      strokeWidth={1.4}
      strokeLinecap="round"
    />
    <Path d="M7.5 11.5H11" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    <Path d="M7.5 15H14.5" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
  </Svg>
);

// ── Exact Figma Location Pin Icon ──
const LocationIcon = ({ size = 20, color = '#141B34' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.5 18.5C18.7 18.9 19.5 19.4 19.5 20C19.5 21.3 16.1 22.3 12 22.3C7.9 22.3 4.5 21.3 4.5 20C4.5 19.4 5.3 18.9 6.5 18.5"
      stroke={color}
      strokeWidth={1.4}
      strokeLinecap="round"
    />
    <Path
      d="M14.8 10.5C14.8 12 13.6 13.3 12 13.3C10.4 13.3 9.2 12 9.2 10.5C9.2 8.9 10.4 7.7 12 7.7C13.6 7.7 14.8 8.9 14.8 10.5Z"
      stroke={color}
      strokeWidth={1.4}
    />
    <Path
      d="M12 2.5C15.9 2.5 19 5.6 19 9.5C19 13.5 15.7 16.3 12.7 18.2C12.5 18.3 12.3 18.4 12 18.4C11.7 18.4 11.5 18.3 11.3 18.2C8.3 16.3 5 13.5 5 9.5C5 5.6 8.1 2.5 12 2.5Z"
      stroke={color}
      strokeWidth={1.4}
    />
  </Svg>
);

// ── Exact Figma Contact Chat Icon ──
const ContactIcon = ({ size = 20, color = '#141B34' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7.4 17.8C7.1 17.7 6.9 17.6 6.8 17.7C6.7 17.7 6.5 17.8 6.2 18C5.7 18.4 5 18.7 4 18.7C3.5 18.7 3.2 18.7 3.1 18.5C3 18.3 3.1 18 3.4 17.5C3.8 16.8 4 15.9 3.6 15.3C3 14.3 2.4 13.2 2.3 12C2.3 11.3 2.3 10.6 2.3 10C2.5 6.6 5.2 4 8.5 3.7C9.6 3.6 10.8 3.6 11.9 3.7C15.2 3.9 17.8 6.5 18 9.8"
      stroke={color}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14.2 21C12.1 20.9 10.5 19.3 10.3 17.2C10.3 16.8 10.3 16.4 10.3 16C10.5 14 12.1 12.3 14.2 12.2C14.9 12.2 15.7 12.2 16.4 12.2C18.5 12.3 20.2 14 20.3 16C20.3 16.4 20.3 16.8 20.3 17.2C20.3 18 19.9 18.7 19.5 19.2C19.3 19.7 19.4 20.2 19.7 20.6C19.9 20.9 20 21.1 19.9 21.2C19.8 21.3 19.6 21.3 19.3 21.3C18.7 21.3 18.3 21.2 18 20.9C17.8 20.8 17.7 20.7 17.6 20.7C17.5 20.7 17.4 20.8 17.2 20.9C16.9 21 16.7 21 16.4 21C15.7 21 14.9 21 14.2 21Z"
      stroke={color}
      strokeWidth={1.4}
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Exact Figma Filter Funnel Icon ──
const FilterFunnelIcon = ({ size = 20, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) => (
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

export const SALON_CATEGORIES = ['Hair Cut', 'Pedicure', 'Manicure', 'Facial'] as const;
export type SalonCategory = (typeof SALON_CATEGORIES)[number];

export interface SalonServiceItem {
  id: string;
  name: string;
  category: SalonCategory;
  price: string;
  numericPrice: number;
  originalPrice: string;
  duration: string;
  rating: string;
  discountBadge?: string;
  discountTimer?: string;
  image: any;
}

const DEFAULT_SALON_SERVICES: Record<string, SalonServiceItem[]> = {
  salon2: [
    // ── Hair Cut ─────────────────────────────────────────────────────────────
    {
      id: 'h1',
      name: 'Spiky',
      category: 'Hair Cut',
      price: '₦13,750.00',
      numericPrice: 13750,
      originalPrice: '₦41,00',
      duration: '10 min',
      rating: '2.3',
      discountBadge: '10% OFF',
      discountTimer: '12:39:01',
      image: require('../../../assets/images/profile/men_braids.jpg'),
    },
    {
      id: 'h2',
      name: 'Short Back And Sides',
      category: 'Hair Cut',
      price: '₦27,800.00',
      numericPrice: 27800,
      originalPrice: '₦41,00',
      duration: '1hr min',
      rating: '1.5',
      discountBadge: '10% OFF',
      discountTimer: '12:39:01',
      image: require('../../../assets/images/profile/men_braids.jpg'),
    },
    {
      id: 'h3',
      name: 'Military Haircut',
      category: 'Hair Cut',
      price: '₦33,900.00',
      numericPrice: 33900,
      originalPrice: '₦41,00',
      duration: '34 min',
      rating: '4.5',
      discountBadge: '10% OFF',
      discountTimer: '12:39:01',
      image: require('../../../assets/images/profile/men_braids.jpg'),
    },
    {
      id: 'h4',
      name: 'Crew Cut',
      category: 'Hair Cut',
      price: '₦4,200.00',
      numericPrice: 4200,
      originalPrice: '₦41,00',
      duration: '40 min',
      rating: '5.0',
      discountBadge: '10% OFF',
      discountTimer: '12:39:01',
      image: require('../../../assets/images/profile/men_braids.jpg'),
    },
    {
      id: 'h5',
      name: 'Side Part',
      category: 'Hair Cut',
      price: '₦76,700.00',
      numericPrice: 76700,
      originalPrice: '₦41,00',
      duration: '45 min',
      rating: '3.2',
      discountBadge: '10% OFF',
      discountTimer: '12:39:01',
      image: require('../../../assets/images/profile/men_braids.jpg'),
    },
    {
      id: 'h6',
      name: 'Man Braid',
      category: 'Hair Cut',
      price: '₦81,700.00',
      numericPrice: 81700,
      originalPrice: '₦41,00',
      duration: '1hr',
      rating: '3.9',
      discountBadge: '10% OFF',
      discountTimer: '12:39:01',
      image: require('../../../assets/images/profile/men_braids.jpg'),
    },

    // ── Pedicure (Figma Spec) ────────────────────────────────────────────────
    {
      id: 'p1',
      name: 'Spiky',
      category: 'Pedicure',
      price: '₦13,750.00',
      numericPrice: 13750,
      originalPrice: '₦41,00',
      duration: '10 min',
      rating: '2.3',
      discountBadge: '10% OFF',
      discountTimer: '12:39:01',
      image: require('../../../assets/images/profile/dry_wow_pedicure.jpg'),
    },
    {
      id: 'p2',
      name: 'Nail Trimming & Shaping',
      category: 'Pedicure',
      price: '₦27,800.00',
      numericPrice: 27800,
      originalPrice: '₦41,00',
      duration: '1hr min',
      rating: '1.5',
      discountBadge: '10% OFF',
      discountTimer: '12:39:01',
      image: require('../../../assets/images/profile/dry_wow_pedicure.jpg'),
    },
    {
      id: 'p3',
      name: 'Callus Remover',
      category: 'Pedicure',
      price: '₦33,900.00',
      numericPrice: 33900,
      originalPrice: '₦41,00',
      duration: '34 min',
      rating: '4.5',
      discountBadge: '10% OFF',
      discountTimer: '12:39:01',
      image: require('../../../assets/images/profile/dry_wow_pedicure.jpg'),
    },
    {
      id: 'p4',
      name: 'Cutiecle Care',
      category: 'Pedicure',
      price: '₦4,200.00',
      numericPrice: 4200,
      originalPrice: '₦41,00',
      duration: '40 min',
      rating: '5.0',
      discountBadge: '10% OFF',
      discountTimer: '12:39:01',
      image: require('../../../assets/images/profile/dry_wow_pedicure.jpg'),
    },
    {
      id: 'p5',
      name: 'Side Part',
      category: 'Pedicure',
      price: '₦76,700.00',
      numericPrice: 76700,
      originalPrice: '₦41,00',
      duration: '45 min',
      rating: '3.2',
      discountBadge: '10% OFF',
      discountTimer: '12:39:01',
      image: require('../../../assets/images/profile/dry_wow_pedicure.jpg'),
    },
    {
      id: 'p6',
      name: 'Man Braid',
      category: 'Pedicure',
      price: '₦81,700.00',
      numericPrice: 81700,
      originalPrice: '₦41,00',
      duration: '1hr',
      rating: '3.9',
      discountBadge: '10% OFF',
      discountTimer: '12:39:01',
      image: require('../../../assets/images/profile/dry_wow_pedicure.jpg'),
    },

    // ── Facial (Figma Spec) ──────────────────────────────────────────────────
    {
      id: 'f1',
      name: 'General Cleaning',
      category: 'Facial',
      price: '₦13,750.00',
      numericPrice: 13750,
      originalPrice: '₦41,00',
      duration: '10 min',
      rating: '2.3',
      discountBadge: '10% OFF',
      discountTimer: '12:39:01',
      image: require('../../../assets/images/profile/1007604716.jpg'),
    },
    {
      id: 'f2',
      name: 'Deep Facial Cleaning',
      category: 'Facial',
      price: '₦27,800.00',
      numericPrice: 27800,
      originalPrice: '₦41,00',
      duration: '1hr min',
      rating: '1.5',
      discountBadge: '10% OFF',
      discountTimer: '12:39:01',
      image: require('../../../assets/images/profile/1007604716.jpg'),
    },
    {
      id: 'f3',
      name: 'Beard Facial',
      category: 'Facial',
      price: '₦33,900.00',
      numericPrice: 33900,
      originalPrice: '₦41,00',
      duration: '34 min',
      rating: '4.5',
      discountBadge: '10% OFF',
      discountTimer: '12:39:01',
      image: require('../../../assets/images/profile/1007604716.jpg'),
    },
    {
      id: 'f4',
      name: 'Razor Burn & Ingrown Hair Treatment:',
      category: 'Facial',
      price: '₦4,200.00',
      numericPrice: 4200,
      originalPrice: '₦41,00',
      duration: '40 min',
      rating: '5.0',
      discountBadge: '10% OFF',
      discountTimer: '12:39:01',
      image: require('../../../assets/images/profile/1007604716.jpg'),
    },
    {
      id: 'f5',
      name: 'Anti Ageing FAcial',
      category: 'Facial',
      price: '₦76,700.00',
      numericPrice: 76700,
      originalPrice: '₦41,00',
      duration: '45 min',
      rating: '3.2',
      discountBadge: '10% OFF',
      discountTimer: '12:39:01',
      image: require('../../../assets/images/profile/1007604716.jpg'),
    },
    {
      id: 'f6',
      name: 'Man Braid',
      category: 'Facial',
      price: '₦81,700.00',
      numericPrice: 81700,
      originalPrice: '₦41,00',
      duration: '1hr',
      rating: '3.9',
      discountBadge: '10% OFF',
      discountTimer: '12:39:01',
      image: require('../../../assets/images/profile/1007604716.jpg'),
    },

    // ── Manicure (Figma Spec) ────────────────────────────────────────────────
    {
      id: 'm1',
      name: 'General Manicure',
      category: 'Manicure',
      price: '₦13,750.00',
      numericPrice: 13750,
      originalPrice: '₦41,00',
      duration: '10 min',
      rating: '2.3',
      discountBadge: '10% OFF',
      discountTimer: '12:39:01',
      image: require('../../../assets/images/profile/1007653036.jpg'),
    },
    {
      id: 'm2',
      name: 'Nail Repai',
      category: 'Manicure',
      price: '₦27,800.00',
      numericPrice: 27800,
      originalPrice: '₦41,00',
      duration: '1hr min',
      rating: '1.5',
      discountBadge: '10% OFF',
      discountTimer: '12:39:01',
      image: require('../../../assets/images/profile/1007653036.jpg'),
    },
  ],
};

const SALON_GALLERY_IMAGES = [
  require('../../../assets/images/custom/gallery_luminous_lux_sign.jpg'),
  require('../../../assets/images/custom/gallery_barber_haircut.png'),
  require('../../../assets/images/custom/gallery_barber_shave.png'),
  require('../../../assets/images/custom/gallery_salon_chairs.png'),
  require('../../../assets/images/custom/gallery_barber_trim.jpg'),
  require('../../../assets/images/custom/gallery_barber_facial.jpg'),
];

export const SalonDetailScreen = ({ salonId }: { salonId?: string }) => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSkeletonLoading } = useSkeletonCadence();

  const resolvedId = (salonId || params.id || 'salon2') as string;

  // Resolve Salon info dynamically from MOCK_SALONS or fallback
  const salon: SalonItem = useMemo(() => {
    const found = MOCK_SALONS.find(
      (s) => s.id === resolvedId || (params.name && s.name.toLowerCase() === (params.name as string).toLowerCase())
    );
    if (found) {
      if (params.name && typeof params.name === 'string') {
        return { ...found, name: params.name };
      }
      return found;
    }
    return {
      id: resolvedId,
      name: (params.name as string) || 'Luminous Lux',
      rating: 4.1,
      reviews: 148,
      distance: '2.89km',
      numericDistance: 2.89,
      isOpen: true,
      location: '11 Gani Street, NNPC Tower Asokoro, Abuja.',
      time: '8am - 12am',
      priceFrom: '₦27,000',
      priceTo: '₦41,00',
      numericMinPrice: 27000,
      numericMaxPrice: 41000,
      promoText: 'PEDICURE TREATMENT',
      isVerified: true,
      images: [],
    };
  }, [resolvedId, params]);

  const [activeCategory, setActiveCategory] = useState<SalonCategory>('Hair Cut');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const categoryTabsScrollRef = useRef<ScrollView>(null);
  const categoryLayouts = useRef<{ [key: string]: { x: number; width: number } }>({});
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleCategorySelect = (cat: SalonCategory) => {
    if (cat === activeCategory) return;
    setSearchQuery('');
    setActiveCategory(cat);

    // Subtle fade animation for category transition
    fadeAnim.setValue(0.5);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();

    // Auto-scroll the tab bar if scrollable
    const layout = categoryLayouts.current[cat];
    if (layout && (categoryTabsScrollRef.current as any)?.scrollTo) {
      (categoryTabsScrollRef.current as any).scrollTo({
        x: Math.max(0, layout.x - 24),
        animated: true,
      });
    }
  };

  // Horizontal swipe gesture on services section to slide between categories
  const servicesPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_evt, gestureState) => {
          return (
            Math.abs(gestureState.dx) > 30 &&
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5
          );
        },
        onPanResponderRelease: (_evt, gestureState) => {
          const currentIndex = SALON_CATEGORIES.indexOf(activeCategory);
          if (gestureState.dx < -50) {
            // Swiped Left -> Advance to next category
            if (currentIndex < SALON_CATEGORIES.length - 1) {
              handleCategorySelect(SALON_CATEGORIES[currentIndex + 1]);
            }
          } else if (gestureState.dx > 50) {
            // Swiped Right -> Go back to previous category
            if (currentIndex > 0) {
              handleCategorySelect(SALON_CATEGORIES[currentIndex - 1]);
            }
          }
        },
      }),
    [activeCategory]
  );
  const [sortFilters, setSortFilters] = useState<SalonSortFilterState>({
    rating: 0,
    minPrice: 0,
    maxPrice: 1000000,
    gender: 'all',
    duration: '',
  });

  // Dynamic gallery overlay label matching Figma: "6+" on Hair Cut, "10+" on Pedicure/Facial/Manicure
  const galleryOverlayBadge = activeCategory === 'Hair Cut' ? '6+' : '10+';

  // Track how many times user has used the filter page for filtering
  const [filterUsageCount, setFilterUsageCount] = useState<number>(0);

  const hasActiveFilters = filterUsageCount > 0;

  const parseDurationToMinutes = (durStr: string): number => {
    const norm = durStr.toLowerCase().trim();
    let totalMin = 0;
    if (norm.includes('hr') || norm.includes('hrs')) {
      const hrPart = norm.match(/(\d+)\s*hr/);
      if (hrPart) totalMin += parseInt(hrPart[1], 10) * 60;
    }
    if (norm.includes('h:')) {
      const hPart = norm.match(/(\d+)h:(\d+)m/);
      if (hPart) {
        totalMin += parseInt(hPart[1], 10) * 60 + parseInt(hPart[2], 10);
      }
    }
    const minPart = norm.match(/(\d+)\s*min/);
    if (minPart && !norm.includes('hr min')) {
      totalMin += parseInt(minPart[1], 10);
    }
    if (totalMin === 0) {
      const num = parseInt(norm.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(num)) totalMin = num;
    }
    return totalMin;
  };

  const categoryServices = useMemo(() => {
    const rawServices = DEFAULT_SALON_SERVICES[resolvedId] || DEFAULT_SALON_SERVICES['salon2'];
    return rawServices.filter((s) => (searchQuery.trim() ? true : s.category === activeCategory));
  }, [resolvedId, activeCategory, searchQuery]);

  const servicesList = useMemo(() => {
    const rawServices = DEFAULT_SALON_SERVICES[resolvedId] || DEFAULT_SALON_SERVICES['salon2'];
    const all = rawServices.map((s) => ({
      ...s,
      id: resolvedId === 'salon2' ? s.id : `${resolvedId}_${s.id}`,
    }));
    return all.filter((s) => {
      // Search query filter
      if (searchQuery.trim()) {
        const matchesQuery = s.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
        if (!matchesQuery) return false;
      } else {
        // Category filter
        if (s.category !== activeCategory) return false;
      }

      // Gender filter
      if (sortFilters.gender && sortFilters.gender !== 'all') {
        const name = s.name.toLowerCase();
        if (sortFilters.gender === 'men') {
          if (name.includes('female') || name.includes('women') || name.includes('lady')) return false;
        } else if (sortFilters.gender === 'female') {
          if (name.includes('men') && !name.includes('women')) return false;
        }
      }

      // Rating filter
      if (sortFilters.rating > 0 && parseFloat(s.rating) < sortFilters.rating) {
        return false;
      }

      // Price filter
      if (s.numericPrice < sortFilters.minPrice || s.numericPrice > sortFilters.maxPrice) {
        return false;
      }

      // Duration filter
      if (sortFilters.duration) {
        const filterMinutes = parseDurationToMinutes(sortFilters.duration);
        const itemMinutes = parseDurationToMinutes(s.duration);
        if (filterMinutes > 0 && itemMinutes > 0) {
          // Allow items that fit within or around selected duration (+15 min tolerance)
          if (itemMinutes > filterMinutes + 15) return false;
        }
      }

      return true;
    });
  }, [resolvedId, activeCategory, searchQuery, sortFilters]);

  const handleShare = () => {
    shareStore.openShare({
      title: salon.name,
      status: salon.isOpen ? 'Available' : 'Closed',
      statusColor: salon.isOpen ? 'rgba(12, 121, 12, 0.96)' : 'rgba(204, 41, 41, 0.9)',
      url: `https://trend.app/salon/${salon.id}`,
      avatar: salon.images?.[0] ? { uri: salon.images[0] } : undefined,
    });
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)' as any);
    }
  };

  const handleServiceSelect = (service: SalonServiceItem) => {
    bookingStore.setServiceName(service.name);
    bookingStore.setServiceId(service.id);
    bookingStore.setBasePrice(service.numericPrice);
    bookingStore.setSalonName(salon.name);
    bookingStore.setSalonId(salon.id);
    bookingStore.setDuration(service.duration);
    bookingStore.setRating(service.rating);

    router.push({
      pathname: '/professional/style-details',
      params: {
        id: service.id,
        serviceId: service.id,
        name: service.name,
        title: service.name,
        serviceName: service.name,
        price: service.price,
        originalPrice: service.originalPrice || '',
        duration: service.duration,
        rating: service.rating,
        category: service.category,
        salonName: salon.name,
        salonId: salon.id,
      },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ─── Page Header (Figma: height: 64px, padding: 8px 16px) ─────────── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
        </TouchableOpacity>

        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle} numberOfLines={1} selectable={false}>
            {salon.name}
          </Text>
          {salon.isVerified && <VerifiedShieldIcon size={18} />}
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + insets.bottom }]}
      >
        {/* ─── 3x2 Top Gallery Grid (Figma: 112x112, radius: 24px, 6+/10+ dynamic overlay) ─ */}
        <View style={styles.galleryGrid}>
          {[
            SALON_GALLERY_IMAGES.slice(0, 3),
            SALON_GALLERY_IMAGES.slice(3, 6),
          ].map((rowImages, rowIndex) => (
            <View key={rowIndex} style={styles.galleryRow}>
              {rowImages.map((img, colIndex) => {
                const idx = rowIndex * 3 + colIndex;
                const isLast = idx === 5;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={styles.galleryCell}
                    activeOpacity={0.85}
                    onPress={() => {
                      if (isLast) {
                        router.push({
                          pathname: '/salon/gallery',
                          params: { salonId: salon.id, name: salon.name },
                        } as any);
                      } else {
                        const topGalleryItems = [
                          { image: SALON_GALLERY_IMAGES[0], title: `${salon.name} Sign`, price: salon.priceFrom || '₦12,500', duration: '1hr', rating: '4.8' },
                          { image: SALON_GALLERY_IMAGES[1], title: 'Classic Men Haircut', price: '₦8,500', duration: '45min', rating: '4.9' },
                          { image: SALON_GALLERY_IMAGES[2], title: 'Beard Trim & Shave', price: '₦5,000', duration: '30min', rating: '4.7' },
                          { image: SALON_GALLERY_IMAGES[3], title: 'Salon Stations & Mirrors', price: '₦16,000', duration: '1hr 15min', rating: '4.6' },
                          { image: SALON_GALLERY_IMAGES[4], title: 'Gentleman Grooming', price: '₦12,000', duration: '50min', rating: '4.8' },
                          { image: SALON_GALLERY_IMAGES[5], title: 'Facial Treatment', price: '₦18,000', duration: '1hr', rating: '4.9' },
                        ];
                        previewStore.setPreviewImages(
                          SALON_GALLERY_IMAGES,
                          salon.name,
                          topGalleryItems,
                          idx
                        );
                        router.push({
                          pathname: '/professional/gallery-preview',
                          params: { index: idx, initialIndex: idx, source: 'salon', title: salon.name },
                        } as any);
                      }
                    }}
                  >
                    <SafeImage source={img} style={styles.galleryImage} resizeMode="cover" />
                    {isLast && (
                      <View style={styles.galleryOverlay}>
                        <Text style={styles.galleryOverlayText}>{galleryOverlayBadge}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* ─── Basic Salon Display Information (Figma: gap: 24px) ────────── */}
        <View style={styles.salonInfoSection}>
          {/* Row 1: Name & Verification Tag + Rating */}
          <View style={styles.nameRatingRow}>
            <View style={styles.nameBadgeGroup}>
              <TextSkeleton loading={isSkeletonLoading} width={150} height={24} borderRadius={6}>
                <Text style={styles.salonNameText}>{salon.name}</Text>
              </TextSkeleton>
              {salon.isVerified && !isSkeletonLoading && <VerifiedShieldIcon size={20} />}
            </View>

            <View style={styles.ratingGroup}>
              <TextSkeleton loading={isSkeletonLoading} width={45} height={20} borderRadius={6}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Star size={16} fill="#F89B18" color="#F89B18" />
                  <Text style={styles.ratingText}>{salon.rating ? salon.rating.toFixed(1) : '4.1'}</Text>
                </View>
              </TextSkeleton>
            </View>
          </View>

          {/* Row 2: Distance, Operating Hours, Operating Days */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <RouteIcon size={18} color="rgba(0, 8, 20, 0.96)" />
              <TextSkeleton loading={isSkeletonLoading} width={50} height={16} borderRadius={4}>
                <Text style={styles.metaText}>{salon.distance || '2.89km'}</Text>
              </TextSkeleton>
            </View>

            <View style={styles.metaItem}>
              <Clock size={18} color="rgba(0, 8, 20, 0.96)" />
              <TextSkeleton loading={isSkeletonLoading} width={75} height={16} borderRadius={4}>
                <Text style={styles.metaText}>{salon.time || '8am - 12am'}</Text>
              </TextSkeleton>
            </View>

            <View style={styles.metaItem}>
              <DoorOpen size={18} color="rgba(0, 8, 20, 0.96)" />
              <TextSkeleton loading={isSkeletonLoading} width={105} height={16} borderRadius={4}>
                <Text style={styles.metaText}>{salon.workDays || 'Monday - Sunday'}</Text>
              </TextSkeleton>
            </View>
          </View>

          {/* Row 3: Action Buttons (About, Location, Contact) */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.aboutButton}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: '/salon/about',
                  params: {
                    salonId: salon.id,
                    name: salon.name,
                    address: salon.location,
                    workDays: salon.workDays || 'Monday - Sunday',
                    time: salon.time,
                  },
                } as any)
              }
            >
              <AboutIcon size={20} color="#141B34" />
              <Text style={styles.actionButtonText}>About</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.locationButton}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: '/salon/location',
                  params: {
                    salonId: salon.id,
                    name: salon.name,
                    address: salon.location,
                    price: salon.priceFrom,
                    rating: salon.rating,
                  },
                } as any)
              }
            >
              <LocationIcon size={20} color="#141B34" />
              <Text style={styles.actionButtonText}>Location</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactButton}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: '/chat/[id]',
                  params: { id: salon.id, name: salon.name },
                } as any)
              }
            >
              <ContactIcon size={20} color="#141B34" />
              <Text style={styles.actionButtonText}>Contact</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Category Tabs & Search (Figma: tab nav and search) ─────────── */}
        <View style={styles.navAndSearchSection}>
          {/* Salon Service Category Tabs (Stretched to extreme ends of screen) */}
          <View style={styles.categoryTabsContainer}>
            {SALON_CATEGORIES.map((cat, idx) => {
              const isActive = activeCategory === cat;
              const isFirst = idx === 0;
              const isLast = idx === SALON_CATEGORIES.length - 1;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryTabItem,
                    isFirst && { paddingLeft: 0 },
                    isLast && { paddingRight: 0 },
                  ]}
                  onPress={() => handleCategorySelect(cat)}
                  onLayout={(e) => {
                    const { x, width } = e.nativeEvent.layout;
                    categoryLayouts.current[cat] = { x, width };
                  }}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                >
                  <Text style={[styles.categoryTabText, isActive && styles.categoryTabTextActive]}>
                    {cat}
                  </Text>
                  {isActive && <View style={styles.categoryActiveBar} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Search Bar & Filter Button */}
          <View style={styles.searchFilterRow}>
            <View style={styles.searchBox}>
              <Search size={20} color="rgba(96, 96, 102, 0.96)" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search here.."
                placeholderTextColor="rgba(96, 96, 102, 0.96)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={16} color="rgba(96, 96, 102, 0.96)" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.filterButton}
              activeOpacity={0.7}
              onPress={() => setIsSortModalOpen(true)}
            >
              <FilterFunnelIcon size={20} color="#141B34" />
              {filterUsageCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{filterUsageCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Services List (Figma: hair cuts category) ──────────────────── */}
        <Animated.View
          style={[styles.servicesListSection, { opacity: fadeAnim }]}
          {...servicesPanResponder.panHandlers}
        >
          {servicesList.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateTitle}>No services match your filters</Text>
              <Text style={styles.emptyStateDesc}>
                Try adjusting your price range, duration, or rating criteria.
              </Text>
              <TouchableOpacity
                style={styles.resetFilterButton}
                activeOpacity={0.8}
                onPress={() => {
                  setSearchQuery('');
                  setFilterUsageCount(0);
                  setSortFilters({
                    rating: 0,
                    minPrice: 0,
                    maxPrice: 1000000,
                    gender: 'all',
                    duration: '',
                  });
                }}
              >
                <Text style={styles.resetFilterButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            servicesList.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.serviceCard}
                activeOpacity={0.88}
                onPress={() => handleServiceSelect(item)}
              >
                {/* Image Frame (88x88 white card with 80x80 image - anywhere clicked leads to service profile) */}
                <View style={styles.serviceImageFrame}>
                  <SafeImage source={item.image} style={styles.serviceImage} resizeMode="cover" />
                </View>

                {/* Service Details */}
                <View style={styles.serviceContent}>
                  {/* Title */}
                  <TextSkeleton loading={isSkeletonLoading} width={130} height={18} borderRadius={4} style={{ marginBottom: 4 }}>
                    <Text style={styles.serviceTitleText} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </TextSkeleton>

                  {/* Price Row */}
                  <View style={styles.servicePriceRow}>
                    <TextSkeleton loading={isSkeletonLoading} width={90} height={16} borderRadius={4}>
                      <Text style={styles.serviceMainPrice}>{item.price}</Text>
                    </TextSkeleton>
                  </View>

                  {/* Meta Row: Duration + Star Rating */}
                  <View style={styles.serviceMetaRow}>
                    <View style={styles.serviceMetaItem}>
                      <Clock size={16} color="rgba(96, 96, 102, 0.96)" />
                      <TextSkeleton loading={isSkeletonLoading} width={45} height={14} borderRadius={4}>
                        <Text style={styles.serviceMetaText}>{item.duration}</Text>
                      </TextSkeleton>
                    </View>

                    <View style={styles.serviceMetaItem}>
                      <Star
                        size={16}
                        color="rgba(245, 149, 15, 0.96)"
                        fill="rgba(245, 149, 15, 0.96)"
                      />
                      <TextSkeleton loading={isSkeletonLoading} width={30} height={14} borderRadius={4}>
                        <Text style={styles.serviceMetaText}>{item.rating}</Text>
                      </TextSkeleton>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </Animated.View>
      </ScrollView>

      {/* ─── Salon Sort / Filter Modal ────────────────────────────────────── */}
      <SalonSortModal
        visible={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        onApply={(newFilters) => {
          setSortFilters(newFilters);
          const hasFilters =
            newFilters.rating > 0 ||
            newFilters.minPrice > 0 ||
            newFilters.maxPrice < 1000000 ||
            (newFilters.gender && newFilters.gender !== 'all') ||
            !!newFilters.duration;
          if (hasFilters) {
            setFilterUsageCount((prev) => prev + 1);
          } else {
            setFilterUsageCount(0);
          }
        }}
        currentFilters={sortFilters}
        availableItems={categoryServices}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header (Figma: height: 64px, padding: 8px 16px)
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

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 24,
  },

  // 3x2 Top Gallery Grid (responsive 100% width, 2 rows x 3 columns)
  galleryGrid: {
    width: '100%',
    flexDirection: 'column',
    gap: 24,
  },
  galleryRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 11,
  },
  galleryCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  galleryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  galleryOverlayText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 32,
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },

  // Basic Salon Information
  salonInfoSection: {
    width: '100%',
    alignSelf: 'stretch',
    gap: 24,
  },
  nameRatingRow: {
    width: '100%',
    alignSelf: 'stretch',
    height: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  salonNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.02,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  ratingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // Salon Operating Days and Distance
  metaRow: {
    width: '100%',
    alignSelf: 'stretch',
    height: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // Salon Information Buttons
  actionButtonsRow: {
    width: '100%',
    alignSelf: 'stretch',
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  aboutButton: {
    width: 95,
    height: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 8,
  },
  locationButton: {
    width: 116,
    height: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 8,
  },
  contactButton: {
    width: 111,
    height: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 8,
  },
  actionButtonText: {
    ...typography.button,
    textAlign: 'center',
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // Category Tabs & Search
  navAndSearchSection: {
    width: '100%',
    alignSelf: 'stretch',
    gap: 24,
  },
  categoryTabsContainer: {
    width: '100%',
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
  },
  categoryTabItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    position: 'relative',
  },
  categoryTabText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    textAlign: 'center',
    color: 'rgba(96, 96, 102, 0.96)',
  },
  categoryTabTextActive: {
    color: 'rgba(0, 8, 20, 0.96)',
  },
  categoryActiveBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },

  // Search Row
  searchFilterRow: {
    width: '100%',
    alignSelf: 'stretch',
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  searchBox: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(0, 8, 20, 0.96)',
    padding: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
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

  // Empty state when filters return no results
  emptyStateContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyStateTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
    color: '#000814',
    textAlign: 'center',
  },
  emptyStateDesc: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#606066',
    textAlign: 'center',
    marginBottom: 12,
  },
  resetFilterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#000814',
  },
  resetFilterButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 14,
    color: '#FFFFFF',
  },

  // Service Cards List (responsive width)
  servicesListSection: {
    width: '100%',
    alignSelf: 'stretch',
    gap: 40,
  },
  serviceCard: {
    width: '100%',
    alignSelf: 'stretch',
    height: 116,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    overflow: 'hidden',
  },
  serviceImageFrame: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.1)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 2,
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  serviceContent: {
    flex: 1,
    height: 80,
    gap: 8,
    justifyContent: 'center',
  },
  serviceTitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  servicePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceMainPrice: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.6,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  serviceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  serviceMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceMetaText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
});

export default SalonDetailScreen;
