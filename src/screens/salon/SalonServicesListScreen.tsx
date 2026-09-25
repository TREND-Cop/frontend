import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Clock,
  Search,
  Star,
  X
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { SalonSortFilterState, SalonSortModal } from '../../components/SalonSortModal';
import { ShareIcon } from '../../components/ShareIcon';
import { SafeImage } from '../../components/ui/SafeImage';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';
import { bookingStore } from '../../utils/bookingStore';
import { shareStore } from '../../utils/shareStore';
import { theme } from '../../constants/theme';

// ── Exact Figma Filter Funnel Icon ──
const FilterFunnelIcon = ({ size = 20, color = '#141B34' }: { size?: number; color?: string }) => (
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

export interface DynamicSalonService {
  id: string;
  name: string;
  category: string;
  price: string;
  numericPrice: number;
  originalPrice: string;
  duration: string;
  rating: string;
  discountBadge?: string;
  discountTimer?: string;
  image: any;
}

const CATEGORY_SERVICES_MAP: Record<string, DynamicSalonService[]> = {
  'men braids': [
    {
      id: 'mb1',
      name: 'Straight-Back Cornrows',
      category: 'Men Braids',
      price: '₦14,200',
      numericPrice: 14200,
      originalPrice: '₦18,000',
      duration: '1hr 30min',
      rating: '4.8',
      discountBadge: '10% OFF',
      image: require('../../../assets/images/profile/men_braids.jpg'),
    },
    {
      id: 'mb2',
      name: 'Box Braids & Fade',
      category: 'Men Braids',
      price: '₦16,500',
      numericPrice: 16500,
      originalPrice: '₦20,000',
      duration: '2hr',
      rating: '4.9',
      image: require('../../../assets/images/profile/men_braids.jpg'),
    },
    {
      id: 'mb3',
      name: 'Zig-Zag Stitch Braids',
      category: 'Men Braids',
      price: '₦15,000',
      numericPrice: 15000,
      originalPrice: '₦19,000',
      duration: '1hr 45min',
      rating: '4.7',
      image: require('../../../assets/images/profile/men_braids.jpg'),
    },
    {
      id: 'mb4',
      name: 'Two-Strand Twist Braids',
      category: 'Men Braids',
      price: '₦13,800',
      numericPrice: 13800,
      originalPrice: '₦16,500',
      duration: '1hr 15min',
      rating: '4.6',
      image: require('../../../assets/images/profile/men_braids.jpg'),
    },
    {
      id: 'mb5',
      name: 'Triangle Parting Braids',
      category: 'Men Braids',
      price: '₦17,200',
      numericPrice: 17200,
      originalPrice: '₦22,000',
      duration: '2hr 15min',
      rating: '5.0',
      discountBadge: '15% OFF',
      image: require('../../../assets/images/profile/men_braids.jpg'),
    },
    {
      id: 'mb6',
      name: 'Men Freestyle Braid Art',
      category: 'Men Braids',
      price: '₦18,500',
      numericPrice: 18500,
      originalPrice: '₦24,000',
      duration: '2hr 30min',
      rating: '4.9',
      discountBadge: '10% OFF',
      image: require('../../../assets/images/profile/men_braids.jpg'),
    },
  ],
  'nail art': [
    {
      id: 'na1',
      name: 'French Glam Gel Art',
      category: 'Nail Art',
      price: '₦12,500',
      numericPrice: 12500,
      originalPrice: '₦15,000',
      duration: '45min',
      rating: '4.9',
      discountBadge: '10% OFF',
      image: require('../../../assets/images/profile/14dcc3440340f9f140251ac160473457c89b198c.jpg'),
    },
    {
      id: 'na2',
      name: 'Abstract Marble Nails',
      category: 'Nail Art',
      price: '₦14,200',
      numericPrice: 14200,
      originalPrice: '₦18,000',
      duration: '1hr',
      rating: '4.8',
      image: require('../../../assets/images/profile/30b9a5ab22324bd8357f666111d5584ad2e3c83e.jpg'),
    },
    {
      id: 'na3',
      name: 'Chrome Finish Acrylics',
      category: 'Nail Art',
      price: '₦16,000',
      numericPrice: 16000,
      originalPrice: '₦20,000',
      duration: '1hr 15min',
      rating: '5.0',
      image: require('../../../assets/images/profile/eb3281d09659fdef5e45647cf5529f61e83190f1.jpg'),
    },
    {
      id: 'na4',
      name: 'Ombre Nails & Crystals',
      category: 'Nail Art',
      price: '₦15,500',
      numericPrice: 15500,
      originalPrice: '₦19,500',
      duration: '1hr',
      rating: '4.7',
      image: require('../../../assets/images/profile/b4bdda58fe4760cb04cb35cca583a63e04b99e77.jpg'),
    },
    {
      id: 'na5',
      name: 'Long Stiletto Extensions',
      category: 'Nail Art',
      price: '₦18,000',
      numericPrice: 18000,
      originalPrice: '₦23,000',
      duration: '1hr 30min',
      rating: '4.9',
      discountBadge: '15% OFF',
      image: require('../../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg'),
    },
    {
      id: 'na6',
      name: 'Feet & Fingers Combo Art',
      category: 'Nail Art',
      price: '₦22,000',
      numericPrice: 22000,
      originalPrice: '₦28,000',
      duration: '2hr',
      rating: '5.0',
      discountBadge: '10% OFF',
      image: require('../../../assets/images/profile/ee549b1ea85771de4cd8695943af94f474fedf19.jpg'),
    },
  ],
  'hair cut': [
    {
      id: 'hc1',
      name: 'Low Skin Fade & Lineup',
      category: 'Hair Cut',
      price: '₦8,500',
      numericPrice: 8500,
      originalPrice: '₦11,000',
      duration: '35min',
      rating: '4.9',
      discountBadge: '10% OFF',
      image: require('../../../assets/images/services/men_haircut.png'),
    },
    {
      id: 'hc2',
      name: 'Taper Fade & Beard Sculpt',
      category: 'Hair Cut',
      price: '₦11,000',
      numericPrice: 11000,
      originalPrice: '₦14,000',
      duration: '45min',
      rating: '5.0',
      image: require('../../../assets/images/services/men_haircut.png'),
    },
    {
      id: 'hc3',
      name: 'Burst Fade Mohawk',
      category: 'Hair Cut',
      price: '₦9,500',
      numericPrice: 9500,
      originalPrice: '₦12,500',
      duration: '40min',
      rating: '4.8',
      image: require('../../../assets/images/services/men_haircut.png'),
    },
    {
      id: 'hc4',
      name: 'Buzz Cut & Sharp Razor',
      category: 'Hair Cut',
      price: '₦7,000',
      numericPrice: 7000,
      originalPrice: '₦9,000',
      duration: '25min',
      rating: '4.7',
      image: require('../../../assets/images/services/men_haircut.png'),
    },
    {
      id: 'hc5',
      name: 'Executive Cut & Hot Towel',
      category: 'Hair Cut',
      price: '₦13,500',
      numericPrice: 13500,
      originalPrice: '₦17,000',
      duration: '50min',
      rating: '5.0',
      discountBadge: '15% OFF',
      image: require('../../../assets/images/services/men_haircut.png'),
    },
  ],
  'pedicure': [
    {
      id: 'pd1',
      name: 'Dry Wow Pedicure',
      category: 'Pedicure',
      price: '₦8,500',
      numericPrice: 8500,
      originalPrice: '₦11,000',
      duration: '40min',
      rating: '4.9',
      discountBadge: '10% OFF',
      image: require('../../../assets/images/profile/dry_wow_pedicure.jpg'),
    },
    {
      id: 'pd2',
      name: 'Deluxe Jelly Spa Pedicure',
      category: 'Pedicure',
      price: '₦12,000',
      numericPrice: 12000,
      originalPrice: '₦15,500',
      duration: '55min',
      rating: '5.0',
      image: require('../../../assets/images/profile/dry_wow_pedicure.jpg'),
    },
    {
      id: 'pd3',
      name: 'Paraffin Foot Therapy',
      category: 'Pedicure',
      price: '₦10,500',
      numericPrice: 10500,
      originalPrice: '₦13,500',
      duration: '45min',
      rating: '4.8',
      image: require('../../../assets/images/profile/dry_wow_pedicure.jpg'),
    },
  ],
  'facial': [
    {
      id: 'fc1',
      name: 'Facial Clay Scrub',
      category: 'Facial',
      price: '₦11,500',
      numericPrice: 11500,
      originalPrice: '₦15,000',
      duration: '45min',
      rating: '4.9',
      discountBadge: '10% OFF',
      image: require('../../../assets/images/packages/clay_scrub_facial.png'),
    },
    {
      id: 'fc2',
      name: 'Hydra-Glow Sheet Mask',
      category: 'Facial',
      price: '₦14,000',
      numericPrice: 14000,
      originalPrice: '₦18,000',
      duration: '50min',
      rating: '5.0',
      image: require('../../../assets/images/packages/facial_sheet_mask.png'),
    },
  ],
};

export const SalonServicesListScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Parse category / serviceType from params dynamically
  const rawServiceType = (
    params.serviceType ||
    params.category ||
    params.title ||
    params.name ||
    'Men Braids'
  ) as string;

  const serviceType = rawServiceType.trim();
  const salonName = ((params.salonName || params.salon || params.name || 'Luminous Lux') as string).trim();
  const salonId = ((params.salonId || params.id || 'salon2') as string).trim();

  // Dynamic header title
  const displayTitle = serviceType.toLowerCase().endsWith('services')
    ? serviceType
    : `${serviceType} Services`;

  const [searchQuery, setSearchQuery] = useState('');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [sortFilters, setSortFilters] = useState<SalonSortFilterState>({
    rating: 0,
    minPrice: 0,
    maxPrice: 1000000,
    gender: 'all',
    duration: '',
  });

  const baseServices: DynamicSalonService[] = useMemo(() => {
    const key = serviceType.toLowerCase();
    if (CATEGORY_SERVICES_MAP[key]) return CATEGORY_SERVICES_MAP[key];

    // Check partial matches
    if (key.includes('braid') || key.includes('men')) return CATEGORY_SERVICES_MAP['men braids'];
    if (key.includes('nail')) return CATEGORY_SERVICES_MAP['nail art'];
    if (key.includes('cut') || key.includes('hair')) return CATEGORY_SERVICES_MAP['hair cut'];
    if (key.includes('pedicure') || key.includes('feet')) return CATEGORY_SERVICES_MAP['pedicure'];
    if (key.includes('facial') || key.includes('face') || key.includes('spa')) return CATEGORY_SERVICES_MAP['facial'];

    // Dynamic fallback
    return [
      {
        id: 's1',
        name: `${serviceType} Classic`,
        category: serviceType,
        price: '₦14,200',
        numericPrice: 14200,
        originalPrice: '₦18,000',
        duration: '1hr',
        rating: '4.8',
        image: require('../../../assets/images/profile/men_braids.jpg'),
      },
      {
        id: 's2',
        name: `${serviceType} Deluxe`,
        category: serviceType,
        price: '₦16,500',
        numericPrice: 16500,
        originalPrice: '₦21,000',
        duration: '1hr 30min',
        rating: '4.9',
        image: require('../../../assets/images/profile/men_braids.jpg'),
      },
      {
        id: 's3',
        name: `${serviceType} Express`,
        category: serviceType,
        price: '₦11,000',
        numericPrice: 11000,
        originalPrice: '₦14,500',
        duration: '45min',
        rating: '4.6',
        image: require('../../../assets/images/profile/men_braids.jpg'),
      },
      {
        id: 's4',
        name: `${serviceType} Premium`,
        category: serviceType,
        price: '₦18,000',
        numericPrice: 18000,
        originalPrice: '₦23,000',
        duration: '2hr',
        rating: '5.0',
        discountBadge: '10% OFF',
        image: require('../../../assets/images/profile/men_braids.jpg'),
      },
    ];
  }, [serviceType]);

  // Track how many times user has used the filter page for filtering
  const [filterUsageCount, setFilterUsageCount] = useState<number>(0);

  const hasActiveFilters = filterUsageCount > 0;

  const parseDurationToMinutes = (dur: string): number => {
    let mins = 0;
    const hrMatch = dur.match(/(\d+)\s*hr/i);
    const minMatch = dur.match(/(\d+)\s*min/i);
    if (hrMatch) mins += parseInt(hrMatch[1], 10) * 60;
    if (minMatch) mins += parseInt(minMatch[1], 10);
    return mins;
  };

  const filteredServices = useMemo(() => {
    return baseServices.filter((s) => {
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const match =
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.price.toLowerCase().includes(q);
        if (!match) return false;
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
      if (sortFilters.rating > 0 && parseFloat(s.rating) < sortFilters.rating) return false;
      if (s.numericPrice < sortFilters.minPrice || s.numericPrice > sortFilters.maxPrice) return false;
      if (sortFilters.duration) {
        const filterMinutes = parseDurationToMinutes(sortFilters.duration);
        const itemMinutes = parseDurationToMinutes(s.duration);
        if (filterMinutes > 0 && itemMinutes > 0) {
          if (itemMinutes > filterMinutes + 15) return false;
        }
      }
      return true;
    });
  }, [baseServices, searchQuery, sortFilters]);

  const handleShare = () => {
    shareStore.openShare({
      title: `${displayTitle} - ${salonName}`,
      status: 'Available',
      statusColor: 'rgba(12, 121, 12, 0.96)',
      url: `https://trend.app/salon/${salonId}/services`,
    });
  };

  const handleServiceSelect = (item: DynamicSalonService) => {
    bookingStore.setServiceName(item.name);
    bookingStore.setServiceId(item.id);
    bookingStore.setBasePrice(item.numericPrice);
    bookingStore.setSalonName(salonName);
    bookingStore.setSalonId(salonId);
    bookingStore.setDuration(item.duration);
    bookingStore.setRating(item.rating);

    router.push({
      pathname: '/professional/style-details',
      params: {
        id: item.id,
        serviceId: item.id,
        name: item.name,
        title: item.name,
        serviceName: item.name,
        price: item.price,
        originalPrice: item.originalPrice || '',
        rating: item.rating,
        duration: item.duration,
        category: item.category,
        salonName: salonName,
        salonId: salonId,
      },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Page Header (Figma: height: 64px, padding: 8px 16px) ─────────── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (router.canGoBack() ? router.back() : router.replace(`/salon/${salonId}` as any))}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {displayTitle}
        </Text>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ShareIcon size={24} color="#141B34" />
        </TouchableOpacity>
      </View>

      {/* ── Search & Filter Bar (Figma: height: 48px, gap: 60px) ───────────── */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color="rgba(96, 96, 102, 0.96)" />
          <TextInput
            style={[styles.searchInput, { outlineStyle: 'none' } as any]}
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

      {/* ── Services List (Figma: Dynamic category services) ───────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 }]}
      >
        {filteredServices.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateTitle}>No services match your filters</Text>
            <Text style={styles.emptyStateDesc}>
              Try adjusting your search query, price range, or rating criteria.
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
              <Text style={styles.resetFilterText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            {filteredServices.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.serviceCard,
                  index < filteredServices.length - 1 && styles.serviceCardMargin,
                ]}
                activeOpacity={0.88}
                onPress={() => handleServiceSelect(item)}
              >
                {/* Left Image (80x80, radius 16px) */}
                <SafeImage
                  source={item.image}
                  style={styles.serviceImage}
                  resizeMode="cover"
                />

                {/* Middle Details (Name, Price Row, Time & Rating) */}
                <View style={styles.serviceDetails}>
                  <Text style={styles.serviceName} numberOfLines={1}>
                    {item.name}
                  </Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.priceCurrent}>{item.price}</Text>
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Clock size={14} color="rgba(0, 8, 20, 0.96)" />
                      <Text style={styles.metaText}>{item.duration}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Star
                        size={14}
                        color="rgba(248, 155, 24, 0.96)"
                        fill="rgba(248, 155, 24, 0.96)"
                      />
                      <Text style={styles.metaText}>{item.rating}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
      <NativeDockSpacer />

      {/* ── Sort & Filter Modal ── */}
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
        availableItems={baseServices}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header (Figma: height 64px, padding 8px 16px, borderBottom) ──
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
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Search & Filter Section (Figma: height 48px, gap 60px) ──
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
    gap: 16,
  },
  searchBar: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(0, 8, 20, 0.96)',
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

  // ── Service Cards List ──
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  cardsContainer: {
    width: '100%',
  },
  serviceCard: {
    width: '100%',
    height: 112,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  serviceCardMargin: {
    marginBottom: 32,
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#E2E2E2',
  },
  serviceDetails: {
    flex: 1,
    gap: 6,
  },
  serviceName: {
    ...theme.typography.serviceName,
    color: '#000000',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  priceCurrent: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.6,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  priceOriginal: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  discountBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(242, 233, 218, 0.96)',
    borderBottomLeftRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  discountBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 11,
    color: 'rgba(248, 155, 24, 0.96)',
  },

  // ── Empty State ──
  emptyStateContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 12,
  },
  emptyStateTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 17,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  emptyStateDesc: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  resetFilterButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 20,
  },
  resetFilterText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default SalonServicesListScreen;
