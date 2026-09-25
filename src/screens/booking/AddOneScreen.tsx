import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Platform,
  Modal,
  PanResponder,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSafeBottomPadding } from '../../utils/safeArea';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Search,
  Filter,
  Clock,
  Star,
} from 'lucide-react-native';
import { colors, typography } from '../../constants/theme';
import { ShareIcon } from '../../components/ShareIcon';
import { bookingStore } from '../../utils/bookingStore';
import { shareStore } from '../../utils/shareStore';
import { ADD_ON_CATALOG, AddOnCatalogItem } from '../../constants/addOneCatalog';
import { SalonSortModal, SalonSortFilterState } from '../../components/SalonSortModal';

const HISTOGRAM_BARS = [
  { id: 0, height: 5 },
  { id: 1, height: 5 },
  { id: 2, height: 5 },
  { id: 3, height: 10 },
  { id: 4, height: 5 },
  { id: 5, height: 15 },
  { id: 6, height: 24 },
  { id: 7, height: 10 },
  { id: 8, height: 20 },
  { id: 9, height: 32 },
  { id: 10, height: 20 },
  { id: 11, height: 32 },
  { id: 12, height: 53 },
  { id: 13, height: 45 },
  { id: 14, height: 32 },
  { id: 15, height: 40 },
  { id: 16, height: 58 },
  { id: 17, height: 45 },
  { id: 18, height: 24 },
  { id: 19, height: 10 },
  { id: 20, height: 5 },
  { id: 21, height: 5 },
  { id: 22, height: 10 },
];

export const AddOneScreen = ({ navigation }: { navigation?: any }) => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter Modal State - Default to broad range so screen is NOT empty on load
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [minBarIndex, setMinBarIndex] = useState<number>(0);
  const [maxBarIndex, setMaxBarIndex] = useState<number>(22);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low' | 'price_high' | 'rating' | 'duration_short' | 'duration_long'>('recommended');

  // Track how many times user has used the filter page for filtering
  const [filterUsageCount, setFilterUsageCount] = useState<number>(0);

  const isFilterActive = filterUsageCount > 0;

  const resetFilters = () => {
    setFilterUsageCount(0);
    setSelectedRating(null);
    setMinPrice(0);
    setMaxPrice(100000);
    setMinBarIndex(0);
    setMaxBarIndex(22);
    setSelectedDuration(null);
    setSortBy('recommended');
  };

  // PanResponder for drag-down-to-close modal
  const panY = useRef(new Animated.Value(0)).current;

  const resetPanAndClose = () => {
    Animated.timing(panY, {
      toValue: 0,
      duration: 200,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => setIsFilterModalVisible(false));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80 || gestureState.vy > 0.5) {
          resetPanAndClose();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: Platform.OS !== 'web',
          }).start();
        }
      },
    })
  ).current;

  // Sync selected state from store
  const [selectedIds, setSelectedIds] = useState<string[]>(
    bookingStore.getSelectedIds()
  );

  useEffect(() => {
    if (params.selectedIds) {
      try {
        const ids = (params.selectedIds as string).split(',').filter(Boolean);
        bookingStore.setSelectedIds(ids);
      } catch (e) {}
    }

    const unsubscribe = bookingStore.subscribe(() => {
      setSelectedIds(bookingStore.getSelectedIds());
    });
    setSelectedIds(bookingStore.getSelectedIds());

    return unsubscribe;
  }, [params.selectedIds]);

  // Master add-ons list from catalog
  const catalogList: AddOnCatalogItem[] = Object.values(ADD_ON_CATALOG);

  const basePrice = 12700;
  const selectedTotal = selectedIds.reduce((sum, id) => {
    const item = ADD_ON_CATALOG[id];
    return sum + (item ? item.price : 0);
  }, 0);
  const totalPrice = basePrice + selectedTotal;

  const handleGoBack = () => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/booking-review');
    }
  };

  const toggleSelectAddOn = (id: string) => {
    bookingStore.toggleAddOn(id);
  };

  const toggleFilter = () => {
    panY.setValue(0);
    setIsFilterModalVisible(true);
  };

  const filteredItems = catalogList
    .filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        item.name.toLowerCase().includes(q) ||
        (item.category && item.category.toLowerCase().includes(q));

      const matchesRating = selectedRating === null || item.rating >= selectedRating;
      const matchesPrice = item.price >= minPrice && item.price <= maxPrice;

      let matchesDuration = true;
      if (selectedDuration) {
        const itemMins = parseInt(item.duration, 10) || 0;
        if (selectedDuration === '15m') matchesDuration = itemMins <= 15;
        else if (selectedDuration === '30m') matchesDuration = itemMins <= 30;
        else if (selectedDuration === '45m') matchesDuration = itemMins <= 45;
        else if (selectedDuration === '1 hrs') matchesDuration = itemMins <= 60;
        else if (selectedDuration === '1h:30m') matchesDuration = itemMins <= 90;
        else if (selectedDuration === '2 hrs') matchesDuration = itemMins <= 120;
      }

      return matchesSearch && matchesRating && matchesPrice && matchesDuration;
    })
    .sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'duration_short') {
        const minsA = parseInt(a.duration, 10) || 0;
        const minsB = parseInt(b.duration, 10) || 0;
        return minsA - minsB;
      }
      if (sortBy === 'duration_long') {
        const minsA = parseInt(a.duration, 10) || 0;
        const minsB = parseInt(b.duration, 10) || 0;
        return minsB - minsA;
      }
      return 0; // recommended
    });

  const handleItemPress = (item: AddOnCatalogItem) => {
    toggleSelectAddOn(item.id);
  };

  const handleAddSubmit = () => {
    bookingStore.setSelectedIds(selectedIds);
    const selectedCatalogItems = selectedIds
      .map((id) => ADD_ON_CATALOG[id])
      .filter(Boolean);
    const addOnWithProducts = selectedCatalogItems.find(
      (item) => item.hasSubCategory || (item.products && item.products.length > 0)
    );

    if (addOnWithProducts) {
      // ONLY opens when a selected add-on requires product choice
      router.push({
        pathname: (addOnWithProducts.subCategoryRoute || '/add-one-product') as any,
        params: { addOnId: addOnWithProducts.id, addOnName: addOnWithProducts.name },
      });
    } else {
      router.push({
        pathname: '/booking-review',
        params: { selectedIds: selectedIds.join(',') },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ─── Page Header ───────────────────────────────────────────── */}
      <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton} activeOpacity={0.7}>
            <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add One</Text>
          <TouchableOpacity
            style={styles.shareButton}
            activeOpacity={0.7}
            onPress={() =>
              shareStore.openShare({
                title: 'Add-Ons',
                status: 'Available',
                statusColor: 'rgba(12, 121, 12, 0.96)',
                url: 'https://trend.app/add-ons',
              })
            }
          >
            <ShareIcon size={24} color="#141B34" />
          </TouchableOpacity>
        </View>

        {/* ─── Search Bar & Filter Button ────────────────────────────── */}
        <View style={styles.searchBarSection}>
          <View style={styles.searchBarContainer}>
            <Search size={20} color="rgba(96, 96, 102, 0.96)" />
            <TextInput
              style={[styles.searchInput, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
              placeholder="Search and filter add-ones here.."
              placeholderTextColor="rgba(96, 96, 102, 0.96)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {/* Vertical Divider Line */}
            <View style={styles.filterDivider} />

            {/* Filter Icon Button with Red Indicator Badge */}
            <TouchableOpacity
              style={styles.filterButton}
              activeOpacity={0.7}
              onPress={toggleFilter}
            >
              <Filter size={20} color={isFilterActive ? 'rgba(0, 8, 20, 0.96)' : 'rgba(0, 8, 20, 0.86)'} />
              
              {/* Red Filter Badge Indicator */}
              {isFilterActive && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{filterUsageCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Add-One Items Scroll List ─────────────────────────────── */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No add-ones found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting or resetting your filter options.</Text>
              <TouchableOpacity style={styles.resetButton} onPress={resetFilters} activeOpacity={0.8}>
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.addOnCard,
                    isSelected && styles.addOnCardSelected,
                  ]}
                  activeOpacity={0.9}
                  onPress={() => handleItemPress(item)}
                >

                  {/* Product Thumbnail */}
                  <Image source={item.image} style={styles.addOnImage} resizeMode="cover" />

                  {/* Content Info (Frame 1000006082) */}
                  <View style={styles.addOnContent}>
                    {/* Title & Price Row */}
                    <View style={styles.titlePriceRow}>
                      <Text style={styles.addOnTitle}>{item.name}</Text>

                      <View style={styles.priceContainer}>
                        <Text style={styles.addOnPrice}>₦{item.price.toLocaleString()}</Text>
                      </View>
                    </View>

                    {/* Duration & Rating Row (Frame 1000006213) */}
                    <View style={styles.metaActionRow}>
                      <View style={styles.metaSubRow}>
                        {/* Duration */}
                        <View style={styles.metaItem}>
                          <Clock size={16} color="rgba(96, 96, 102, 0.96)" />
                          <Text style={styles.metaText}>{item.duration}</Text>
                        </View>

                        {/* Rating */}
                        <View style={styles.metaItem}>
                          <Star size={16} color="rgba(245, 149, 15, 0.96)" fill="rgba(245, 149, 15, 0.96)" />
                          <Text style={styles.metaText}>{item.rating}</Text>
                        </View>
                      </View>

                      {/* Add / Selected Button */}
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          isSelected ? styles.actionButtonSelected : styles.actionButtonAdd,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => toggleSelectAddOn(item.id)}
                      >
                        <Text style={[styles.actionButtonText, isSelected && styles.actionButtonTextSelected]}>
                          {isSelected ? 'Selected' : 'Add one'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* ─── Bottom Action Bar with Estimated Price & Add Button ─────── */}
        <View style={[styles.bottomBar, { height: undefined, paddingBottom: getSafeBottomPadding(insets, 16, 8) }]}>
          <View style={styles.totalPriceCol}>
            <Text style={styles.estimatedLabel}>Estimated</Text>
            <Text style={styles.totalPriceText}>₦{totalPrice.toLocaleString()}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.addPillButton,
              selectedIds.length === 0 && styles.addPillButtonDisabled,
            ]}
            activeOpacity={selectedIds.length > 0 ? 0.8 : 1}
            disabled={selectedIds.length === 0}
            onPress={handleAddSubmit}
          >
            <Text
              style={[
                styles.addPillButtonText,
                selectedIds.length === 0 && styles.addPillButtonTextDisabled,
              ]}
            >
              Add
            </Text>
          </TouchableOpacity>
        </View>

        {/* ─── Bottom Sheet Filter Modal (Figma: Standard 711px Height) ─── */}
        <SalonSortModal
          visible={isFilterModalVisible}
          onClose={() => setIsFilterModalVisible(false)}
          currentFilters={{
            rating: selectedRating || undefined,
            minPrice: minPrice,
            maxPrice: maxPrice,
            gender: 'all',
            duration: selectedDuration || '',
          }}
          onApply={(filters) => {
            setSelectedRating(filters.rating > 0 ? filters.rating : null);
            setMinPrice(filters.minPrice);
            setMaxPrice(filters.maxPrice);
            setSelectedDuration(filters.duration || null);
            setIsFilterModalVisible(false);

            const hasFilters =
              filters.rating > 0 ||
              filters.minPrice > 0 ||
              filters.maxPrice < 1000000 ||
              !!filters.duration;
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
  headerRow: {
    height: 52,
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
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBarSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    color: 'rgba(0, 8, 20, 0.96)',
    borderWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  filterDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(215, 215, 222, 0.8)',
  },
  filterButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(204, 41, 41, 0.9)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 110,
    gap: 24,
  },
  addOnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    backgroundColor: 'rgba(247, 247, 247, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  addOnCardSelected: {
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  ribbonContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 90,
    height: 90,
    overflow: 'hidden',
    zIndex: 2,
  },
  ribbonBadge: {
    position: 'absolute',
    top: 14,
    right: -24,
    width: 100,
    backgroundColor: 'rgba(242, 233, 218, 0.96)',
    paddingVertical: 3,
    transform: [{ rotate: '37deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  ribbonText: {
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 11,
    color: 'rgba(245, 149, 15, 0.96)',
  },
  addOnImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  addOnContent: {
    flex: 1,
    gap: 8,
  },
  titlePriceRow: {
    gap: 4,
  },
  addOnTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addOnPrice: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: Platform.OS === 'ios' ? 0.6 : 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  strikePriceWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountPriceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  strikethroughLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(96, 96, 102, 0.96)',
  },
  metaActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  metaSubRow: {
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
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  actionButton: {
    paddingHorizontal: 16,
    height: 32,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonAdd: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  actionButtonSelected: {
    backgroundColor: 'rgba(229, 229, 229, 0.8)',
  },
  actionButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },
  actionButtonTextSelected: {
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // Bottom Fixed Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(133, 139, 148, 1)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  totalPriceCol: {
    gap: 4,
  },
  estimatedLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  totalPriceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: Platform.OS === 'ios' ? 0.3 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  addPillButton: {
    flex: 1,
    marginLeft: 24,
    height: 48,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPillButtonDisabled: {
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  addPillButtonText: {
    ...typography.button,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  addPillButtonTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },

  // Modal Bottom Sheet Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 8, 20, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContentContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '84%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  modalHeaderContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(240, 240, 245, 0.8)',
  },
  dragHandleWrapper: {
    width: 72,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragHandle: {
    width: 56,
    height: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },
  modalHeaderTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#000000',
    marginTop: 4,
  },
  modalScrollBody: {
    paddingHorizontal: 16,
  },
  modalScrollContent: {
    paddingTop: 24,
    paddingBottom: 24,
  },
  filterSection: {
    gap: 16,
  },
  sectionTitle: {
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 20,
    color: '#000000',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(240, 240, 245, 0.8)',
    marginVertical: 24,
  },
  starRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  starButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceChartContainer: {
    height: 70,
    justifyContent: 'flex-end',
    position: 'relative',
    marginTop: 8,
    marginBottom: 24,
  },
  histogramBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 58,
  },
  histogramBar: {
    width: 8,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  chartBaseLine: {
    height: 1,
    backgroundColor: 'rgba(204, 41, 41, 0.9)',
    width: '100%',
  },
  sliderKnobsOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -18,
    height: 40,
  },
  sliderKnob: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    shadowColor: 'rgba(133, 139, 148, 1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  priceButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  priceCol: {
    alignItems: 'center',
    gap: 8,
  },
  priceCaption: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 12,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  pricePill: {
    width: 110,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  pricePillLarge: {
    width: 140,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  pricePillText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  durationPill: {
    width: '30%',
    minWidth: 100,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  durationPillSelected: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  durationText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  durationTextSelected: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.3 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  emptySubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    marginBottom: 16,
  },
  resetButton: {
    paddingHorizontal: 24,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },
  modalHeaderTitleRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  clearAllText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: 'rgba(204, 41, 41, 0.9)',
  },
  sortChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sortChip: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  sortChipSelected: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  sortChipText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  sortChipTextSelected: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
