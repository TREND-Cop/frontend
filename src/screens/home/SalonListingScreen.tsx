import React, { useState, useMemo } from 'react';
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
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  Lock,
  DoorOpen,
  CheckCircle2,
  X,
  Share2,
  Tag,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { MOCK_SALONS, SalonItem } from './mockSalons';
import { typography } from '../../constants/theme';
import { getServiceNameById } from './mockServices';
import { FilterModal, FilterState, PRICE_STEPS } from '../../components/FilterModal';
import { SafeImage } from '../../components/ui/SafeImage';
import { ShareIcon } from '../../components/ShareIcon';
import { shareStore } from '../../utils/shareStore';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';

interface SalonListingScreenProps {
  categoryId?: string;
  serviceId?: string;
  serviceName?: string;
  gender?: string;
}

interface SalonCardItemProps {
  salon: SalonItem;
  serviceId?: string;
  serviceName?: string;
  categoryId?: string;
  gender?: string;
}

const SalonCardItem: React.FC<SalonCardItemProps> = ({
  salon,
  serviceId,
  serviceName,
  categoryId,
  gender,
}) => {
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState<number>(0);

  const handleCardPress = () => {
    router.push({
      pathname: `/salon/${salon.id}`,
      params: {
        id: salon.id,
        name: salon.name,
        serviceId: serviceId,
        serviceName: serviceName,
        categoryId: categoryId,
        gender: gender,
      },
    } as any);
  };

  const imageWidth = cardWidth > 0 ? cardWidth : (Dimensions.get('window').width - 64);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const width = e.nativeEvent.layoutMeasurement?.width || imageWidth;
    if (width > 0) {
      const idx = Math.min(
        salon.images.length - 1,
        Math.max(0, Math.round(offsetX / width))
      );
      if (idx !== activeImageIndex) {
        setActiveImageIndex(idx);
      }
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* ── Image Layer with Horizontal Swipeable Carousel ── */}
      <View
        style={styles.imageLayer}
        onLayout={(e) => {
          const { width } = e.nativeEvent.layout;
          if (width > 0 && Math.abs(width - cardWidth) > 1) {
            setCardWidth(width);
          }
        }}
      >
        <ScrollView
          horizontal
          pagingEnabled
          snapToInterval={imageWidth}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum={true}
          nestedScrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScroll}
          onScrollEndDrag={handleScroll}
          style={StyleSheet.absoluteFill}
        >
          {salon.images.map((imgUri, idx) => (
            <TouchableOpacity
              key={`${salon.id}-img-${idx}`}
              activeOpacity={0.92}
              onPress={handleCardPress}
              style={{ width: imageWidth, height: 200 }}
            >
              <SafeImage source={imgUri} style={styles.cardImage} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Overlays on Image */}
        <View style={styles.imageOverlays} pointerEvents="box-none">
          {/* Rate badge (top-left) - 14px regular font, no 'rating' word */}
          <View style={styles.rateBadge}>
            <Star size={14} fill="rgba(245, 149, 15, 0.96)" color="rgba(245, 149, 15, 0.96)" />
            <Text style={styles.rateBadgeText}>
              {salon.rating.toFixed(1)} {salon.reviews > 0 ? `(${salon.reviews})` : ''}
            </Text>
          </View>

          {/* Top Right: Distance */}
          <View style={styles.topRightActions}>
            <View style={styles.distanceBadge}>
              <MapPin size={14} color="#FFFFFF" />
              <Text style={styles.distanceBadgeText}>{salon.distance}</Text>
            </View>
          </View>
        </View>

        {/* Image slide indicator dots */}
        {salon.images.length > 1 && (
          <View style={styles.imagePaginationContainer} pointerEvents="none">
            <View style={styles.imagePaginationPill}>
              {salon.images.map((_, dotIdx) => (
                <View
                  key={`dot-${salon.id}-${dotIdx}`}
                  style={[
                    styles.paginationDot,
                    dotIdx === activeImageIndex && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          </View>
        )}
      </View>

      {/* ── Shop Information ── */}
      <TouchableOpacity
        style={styles.shopInfo}
        activeOpacity={0.88}
        onPress={handleCardPress}
      >
        {/* Name, Verified Badge & Open/Closed Status */}
        <View style={styles.shopHeaderRow}>
          <View style={styles.shopNameAndBadge}>
            <Text style={styles.shopName}>{salon.name}</Text>
            {salon.isVerified && (
              <CheckCircle2 size={16} color="#1A82FF" fill="#E6F2FF" />
            )}
          </View>

          <View
            style={[
              styles.statusTag,
              salon.isOpen ? styles.statusTagOpen : styles.statusTagClosed,
            ]}
          >
            {salon.isOpen ? (
              <DoorOpen size={14} color="rgba(10, 95, 10, 0.8)" />
            ) : (
              <Lock size={14} color="rgba(204, 41, 41, 0.9)" />
            )}
            <Text
              style={[
                styles.statusTagText,
                salon.isOpen ? styles.statusTagTextOpen : styles.statusTagTextClosed,
              ]}
            >
              {salon.isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>

        {/* Location & Time */}
        <View style={styles.locationTimeRow}>
          <View style={styles.infoSubItem}>
            <MapPin size={14} color="rgba(96, 96, 102, 0.96)" />
            <Text style={styles.infoSubText}>{salon.location}</Text>
          </View>
          <View style={styles.dotSeparator} />
          <View style={styles.infoSubItem}>
            <Clock size={14} color="rgba(96, 96, 102, 0.96)" />
            <Text style={styles.infoSubText}>{salon.time}</Text>
          </View>
        </View>

        {/* Price Row: From [price] — To [price] */}
        <View style={styles.priceRow}>
          <View style={styles.priceItem}>
            <Text style={styles.priceCaption}>From</Text>
            <Text style={styles.priceAmount}>{salon.priceFrom}</Text>
          </View>
          <View style={styles.priceDash} />
          <View style={styles.priceItem}>
            <Text style={styles.priceCaption}>To</Text>
            <Text style={styles.priceAmount}>{salon.priceTo}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* ── Promo Banner (if available) ── */}
      {!!salon.promoText && (
        <TouchableOpacity
          style={styles.promoBanner}
          activeOpacity={0.88}
          onPress={handleCardPress}
        >
          <View style={styles.promoContent}>
            <Tag size={16} color="rgba(245, 149, 15, 0.96)" />
            <Text style={styles.promoText}>{salon.promoText}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export const SalonListingScreen: React.FC<SalonListingScreenProps> = ({
  categoryId,
  serviceId,
  serviceName,
  gender,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Resolved dynamic title
  const screenTitle = serviceName || getServiceNameById(categoryId);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);

  // Comprehensive Filter State matching Figma Filter Specs (empty by default until applied)
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

  // Track how many times user has used the filter page for filtering
  const [filterUsageCount, setFilterUsageCount] = useState<number>(0);

  // In-app share handler
  const handleShare = () => {
    shareStore.openShare({
      title: screenTitle,
      status: 'Available',
      statusColor: 'rgba(12, 121, 12, 0.96)',
      url: `https://trend.app/salons`,
    });
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilterUsageCount(0);
    setHasAppliedFilters(false);
    setFilterState({
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
  };

  // Filtered Salons list
  const filteredSalons = useMemo(() => {
    return MOCK_SALONS.filter((salon) => {
      // 1. Text Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = salon.name.toLowerCase().includes(q);
        const matchesLoc = salon.location.toLowerCase().includes(q);
        const matchesPromo = salon.promoText.toLowerCase().includes(q);
        if (!matchesName && !matchesLoc && !matchesPromo) return false;
      }

      // 2. Distance filter
      if (filterState.distance === 'nearby' && salon.numericDistance > 5) return false;
      if (filterState.distance === 'more' && salon.numericDistance <= 5) return false;

      // 3. Verification filter
      if (filterState.verification === 'verified' && !salon.isVerified) return false;
      if (filterState.verification === 'non-verified' && salon.isVerified) return false;

      // 4. Star Rating filter
      if (filterState.rating > 0 && salon.rating < filterState.rating) return false;

      // 5. Price filter
      if (
        filterState.minPrice > PRICE_STEPS[0] &&
        salon.numericMaxPrice < filterState.minPrice
      ) {
        return false;
      }
      if (
        filterState.maxPrice < PRICE_STEPS[22] &&
        salon.numericMinPrice > filterState.maxPrice
      ) {
        return false;
      }

      // 6. Gender filter
      if (filterState.gender !== 'all') {
        const sGender = salon.gender || 'unisex';
        if (filterState.gender === 'male' && sGender === 'female') return false;
        if (filterState.gender === 'female' && sGender === 'male') return false;
      }

      // 7. Amenities filter (must have all selected amenities)
      if (filterState.amenities && filterState.amenities.length > 0) {
        const sAmenities = salon.amenities || [];
        if (!filterState.amenities.every((a) => sAmenities.includes(a))) return false;
      }

      // 8. Opening time filter
      if (filterState.openingTime && salon.openingTime) {
        if (filterState.openingTime === '6:00am' && salon.openingTime !== '6:00am') return false;
        if (filterState.openingTime === '8:00am' && (salon.openingTime === '9:00am' || salon.openingTime === '10:00am')) return false;
        if (filterState.openingTime === '10:00am' && salon.openingTime !== '10:00am' && salon.openingTime !== '9:00am' && salon.openingTime !== '8:00am') return false;
      }

      // 9. Closing time filter
      if (filterState.closingTime && salon.closingTime) {
        if (filterState.closingTime === '12:00am' && salon.closingTime !== '12:00am') return false;
        if (filterState.closingTime === '11:00pm' && salon.closingTime === '10:00pm') return false;
      }

      return true;
    });
  }, [searchQuery, filterState]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Top Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)' as any))}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {screenTitle}
        </Text>

        <TouchableOpacity onPress={handleShare} style={styles.headerButton} activeOpacity={0.7}>
          <ShareIcon size={24} color="#141B34" />
        </TouchableOpacity>
      </View>

      {/* ── Search & Filter Bar ── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          {/* Search Box */}
          <TouchableOpacity
            style={styles.searchBox}
            activeOpacity={0.8}
            onPress={() => router.push('/search')}
          >
            <Search size={20} color="rgba(96, 96, 102, 0.96)" />
            <Text style={styles.searchInputPlaceholder}>Search here..</Text>
          </TouchableOpacity>

          {/* Filter Button */}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setIsFilterModalOpen(true)}
            activeOpacity={0.7}
          >
            <Filter size={20} color="rgba(0, 8, 20, 0.96)" />
            {filterUsageCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{filterUsageCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Salon List Content ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.listScrollContent,
          { paddingBottom: 32 },
        ]}
      >
        {/* Results Counter */}
        <View style={styles.resultsSummaryRow}>
          <Text style={styles.resultsSummaryText}>
            Showing {filteredSalons.length} {filteredSalons.length === 1 ? 'salon' : 'salons'}
          </Text>
          {filterUsageCount > 0 && (
            <TouchableOpacity onPress={handleResetFilters}>
              <Text style={styles.clearFiltersText}>Reset filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {filteredSalons.length > 0 ? (
          filteredSalons.map((salon) => (
            <SalonCardItem
              key={salon.id}
              salon={salon}
              serviceId={serviceId}
              serviceName={serviceName}
              categoryId={categoryId}
              gender={gender}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Search size={32} color="rgba(192, 192, 204, 0.96)" />
            </View>
            <Text style={styles.emptyTitle}>No salons found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search query or relaxing your filter preferences.
            </Text>
            <TouchableOpacity
              style={styles.resetFiltersBtn}
              activeOpacity={0.8}
              onPress={() => {
                setSearchQuery('');
                handleResetFilters();
              }}
            >
              <Text style={styles.resetFiltersBtnText}>Reset All</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Solid bottom barrier matching screen background preventing content from bleeding under Android 3-button dock / iOS bar */}
      <NativeDockSpacer />

      {/* ── Filter Modal (Initial Sort & Full In-Use States) ── */}
      <FilterModal
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        currentFilters={filterState}
        hasAppliedFilters={hasAppliedFilters}
        items={MOCK_SALONS}
        onReset={() => {
          handleResetFilters();
        }}
        onApply={(newFilters) => {
          setFilterState(newFilters);
          setHasAppliedFilters(newFilters.recentFilters && newFilters.recentFilters.length > 0);
          const hasFilters =
            newFilters.distance !== 'all' ||
            newFilters.verification !== 'all' ||
            newFilters.gender !== 'all' ||
            (newFilters.amenities && newFilters.amenities.length > 0) ||
            newFilters.rating > 0 ||
            newFilters.minPrice > PRICE_STEPS[0] ||
            newFilters.maxPrice < PRICE_STEPS[22] ||
            !!newFilters.openingTime ||
            !!newFilters.closingTime;
          if (hasFilters) {
            setFilterUsageCount((prev) => prev + 1);
          } else {
            setFilterUsageCount(0);
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  headerTitle: {
    flex: 1,
    ...typography.pageHeader,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  searchInputPlaceholder: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  clearSearchBtn: {
    padding: 4,
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
    top: 0,
    right: 0,
    backgroundColor: '#CC2929',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_700Bold',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
    textAlign: 'center',
  },
  listScrollContent: {
    padding: 16,
    gap: 24,
    paddingBottom: 48,
  },
  resultsSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  resultsSummaryText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  clearFiltersText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontSize: 13,
    fontWeight: '600',
    color: '#1A82FF',
  },

  // ── Salon Card Styles ──
  cardContainer: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 16,
  },
  imageLayer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  imageOverlays: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(132, 132, 132, 0.4)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 8,
    height: 32,
  },
  rateBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    color: 'rgba(255, 255, 255, 0.96)',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(132, 132, 132, 0.4)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 8,
    height: 32,
  },
  distanceBadgeText: {
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 13,
    fontWeight: '400',
  },
  bookmarkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePaginationContainer: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePaginationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 6,
    height: 12,
    shadowColor: '#858B94',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D9D9D9',
  },
  paginationDotActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Shop Info Section ──
  shopInfo: {
    gap: 8,
  },
  shopHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shopNameAndBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  shopName: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 6,
    height: 28,
  },
  statusTagOpen: {
    backgroundColor: 'rgba(207, 237, 207, 0.8)',
  },
  statusTagClosed: {
    backgroundColor: 'rgba(250, 237, 237, 0.96)',
  },
  statusTagText: {
    ...typography.tag,
    lineHeight: 26,
    textAlign: 'center',
  },
  statusTagTextOpen: {
    color: 'rgba(10, 95, 10, 0.8)',
  },
  statusTagTextClosed: {
    color: 'rgba(204, 41, 41, 0.9)',
  },
  locationTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoSubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoSubText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D9D9D9',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 4,
  },
  priceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceCaption: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  priceAmount: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: Platform.OS === 'ios' ? 0.6 : 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  priceDash: {
    width: 12,
    height: 1,
    backgroundColor: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Promo Banner ──
  promoBanner: {
    backgroundColor: 'rgba(242, 233, 218, 0.96)',
    borderRadius: 12,
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  promoText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(245, 149, 15, 0.96)',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },

  // ── Empty State ──
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 32,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(247, 247, 247, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontSize: 18,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  emptySubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  resetFiltersBtn: {
    marginTop: 8,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  resetFiltersBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontSize: 14,
  },
});
