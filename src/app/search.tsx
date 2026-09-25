import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Check,
  Clock,
  MapPin,
  Navigation,
  Search,
  Star,
  TrendingUp,
  Trophy,
  X,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  ImageBackground,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { SafeImage } from '../components/ui/SafeImage';
import { NativeDockSpacer } from '../components/ui/NativeDockSpacer';
import { previewStore } from '../utils/previewStore';
import { searchHistoryStore } from '../utils/searchHistoryStore';

// ── Figma Gold Shield Award Icon for Salon of the Year Badge ──
const GoldShieldAwardIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <Path
      d="M8 1.5L13 3.5V7.5C13 11 10.5 13.8 8 14.8C5.5 13.8 3 11 3 7.5V3.5L8 1.5Z"
      fill="#D49320"
      stroke="#B87B14"
      strokeWidth={0.8}
    />
    <Path
      d="M8 4.5L8.9 6.5L11 6.8L9.5 8.2L9.9 10.3L8 9.3L6.1 10.3L6.5 8.2L5 6.8L7.1 6.5L8 4.5Z"
      fill="#FFF9EE"
    />
  </Svg>
);

// ── 1:1 Figma Navigation 03 Icon (compass arrow / paper plane) ──
const Navigation03Icon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.5 3.5L3.5 10.5L10.5 13.5L13.5 20.5L20.5 3.5Z"
      stroke="rgba(0, 8, 20, 0.96)"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 1:1 Figma iconamoon:trend-up-light Icon ──
const TrendUpIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3.5 17L9 11.5L13.5 14.5L20.5 7.5"
      stroke="rgba(0, 8, 20, 0.96)"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15 7.5H20.5V13"
      stroke="rgba(0, 8, 20, 0.96)"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── 1:1 Figma Outline Star Icon ──
const StarOutlineIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2.5L14.9 8.4L21.4 9.3L16.7 13.9L17.8 20.4L12 17.3L6.2 20.4L7.3 13.9L2.6 9.3L9.1 8.4L12 2.5Z"
      stroke="rgba(0, 8, 20, 0.96)"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Search Item Interface Supporting Location Salons & Services ──
export interface SearchItem {
  id: string;
  type: 'salon' | 'service';
  title: string;
  location?: string;
  category: string;
  image: any;
  hasBadge?: boolean;
  badgeText?: string;
  rating: string;
  price?: string;
  oldPrice?: string;
  duration?: string;
  discountTag?: string;
}

// ── Master Search Catalog from Figma Reference Screens ──
const MASTER_SEARCH_CATALOG: SearchItem[] = [
  // ── Frame 1 & 2: Salons & Locations (Figma Specs) ──
  {
    id: 'salon-1',
    type: 'salon',
    title: 'AUO Kings Beauty',
    location: 'Apo (1.2km)',
    category: 'Hair cut',
    image: require('../../assets/images/search_salon1.png'),
    hasBadge: true,
    badgeText: 'Salon of the year',
    rating: '1.0',
  },
  {
    id: 'salon-2',
    type: 'salon',
    title: 'Great Beauty Empire',
    location: 'Jabi (1.2km)',
    category: 'Spa',
    image: require('../../assets/images/search_salon1.png'),
    hasBadge: false, // Badge hidden per Figma spec for item 2
    rating: '1.0',
  },
  {
    id: 'salon-3',
    type: 'salon',
    title: 'Skin 101',
    location: 'Jabi (1.2km)',
    category: 'Spa',
    image: require('../../assets/images/search_salon2.png'),
    hasBadge: true,
    badgeText: 'Salon of the year',
    rating: '1.0',
  },
  {
    id: 'salon-4',
    type: 'salon',
    title: 'Aesthetic First',
    location: 'Kanna (11.0km)',
    category: 'Hydra Facial',
    image: require('../../assets/images/search_salon2.png'),
    hasBadge: true,
    badgeText: 'Salon of the year',
    rating: '1.0',
  },
  {
    id: 'salon-5',
    type: 'salon',
    title: 'All Beauty Care',
    location: 'Barwa (9.3km)',
    category: 'Manicure',
    image: require('../../assets/images/search_salon1.png'),
    hasBadge: true,
    badgeText: 'Salon of the year',
    rating: '1.0',
  },
  {
    id: 'salon-6',
    type: 'salon',
    title: 'Author White Salon',
    location: 'Kuja (9.6km)',
    category: 'Pedicure',
    image: require('../../assets/images/search_salon2.png'),
    hasBadge: true,
    badgeText: 'Salon of the year',
    rating: '1.0',
  },
  {
    id: 'salon-7',
    type: 'salon',
    title: 'A11 Aesthetic',
    location: 'Maitama (4.2km)',
    category: 'Body Spa',
    image: require('../../assets/images/search_salon1.png'),
    hasBadge: true,
    badgeText: 'Salon of the year',
    rating: '1.0',
  },
  {
    id: 'salon-8',
    type: 'salon',
    title: 'White Lights Salon',
    location: 'Asokoro (5.0km)',
    category: 'Hair cut',
    image: require('../../assets/images/search_salon2.png'),
    hasBadge: true,
    badgeText: 'Salon of the year',
    rating: '4.5',
  },

  // ── Frame 3: Services & Styles (Figma Specs: style search / related search) ──
  {
    id: 'service-1',
    type: 'service',
    title: 'Dread Locks',
    category: 'Dread',
    image: require('../../assets/images/profile/men_braids.jpg'),
    price: '₦14,200',
    oldPrice: '₦41,00',
    duration: '1hr',
    rating: '3.6',
  },
  {
    id: 'service-2',
    type: 'service',
    title: 'Dread Threads',
    category: 'Dread',
    image: require('../../assets/images/profile/1007630792.jpg'),
    price: '₦14,200',
    oldPrice: '₦41,00',
    duration: '1hr',
    rating: '3.6',
    discountTag: '10% OFF',
  },
  {
    id: 'service-3',
    type: 'service',
    title: 'Female Dread Locks',
    category: 'Dread',
    image: require('../../assets/images/profile/1007641383.jpg'),
    price: '₦14,200',
    oldPrice: '₦41,00',
    duration: '1hr',
    rating: '3.6',
    discountTag: '10% OFF',
  },
  {
    id: 'service-4',
    type: 'service',
    title: 'Men Brade',
    category: 'Braid',
    image: require('../../assets/images/trending/trend_1.png'),
    price: '₦14,200',
    oldPrice: '₦41,00',
    duration: '1hr',
    rating: '3.6',
  },
  {
    id: 'service-5',
    type: 'service',
    title: 'Barrel Twist',
    category: 'Locs',
    image: require('../../assets/images/profile/1007604716.jpg'),
    price: '₦14,200',
    oldPrice: '₦41,00',
    duration: '1hr',
    rating: '3.6',
    discountTag: '10% OFF',
  },
  {
    id: 'service-6',
    type: 'service',
    title: '47 Handsome Barrel Roll Locs',
    category: 'Locs',
    image: require('../../assets/images/profile/1007674598.jpg'),
    price: '₦14,200',
    oldPrice: '₦41,00',
    duration: '1hr',
    rating: '3.6',
    discountTag: '10% OFF',
  },
  {
    id: 'service-7',
    type: 'service',
    title: 'Men Fade & Beard Trim',
    category: 'Men Hair',
    image: require('../../assets/images/trending/trend_2.png'),
    price: '₦12,500',
    oldPrice: '₦18,00',
    duration: '45mins',
    rating: '4.8',
    discountTag: '10% OFF',
  },
  {
    id: 'service-8',
    type: 'service',
    title: 'Men Wave Cut',
    category: 'Men Hair',
    image: require('../../assets/images/trending/trend_3.png'),
    price: '₦16,000',
    oldPrice: '₦24,00',
    duration: '1hr 15mins',
    rating: '4.5',
  },
  {
    id: 'service-9',
    type: 'service',
    title: 'Locs Maintenance & Retwist',
    category: 'Men Hair',
    image: require('../../assets/images/trending/trend_4.png'),
    price: '₦18,500',
    oldPrice: '₦25,00',
    duration: '1hr 30mins',
    rating: '4.7',
    discountTag: '15% OFF',
  },
  {
    id: 'service-10',
    type: 'service',
    title: 'Box Braids With Fade',
    category: 'Braid',
    image: require('../../assets/images/trending/trend_5.png'),
    price: '₦15,000',
    oldPrice: '₦22,00',
    duration: '2hrs',
    rating: '4.9',
    discountTag: '10% OFF',
  },
  {
    id: 'salon-alex-white',
    type: 'salon',
    title: 'Alex White Salon',
    location: 'Maitama (2.5km)',
    category: 'Hair Shampoo & Spa',
    image: require('../../assets/images/search_salon2.png'),
    hasBadge: true,
    badgeText: 'Salon of the year',
    rating: '4.8',
  },
  {
    id: 'salon-luminous',
    type: 'salon',
    title: 'Luminous Lux',
    location: 'Maitama (1.0km)',
    category: 'Hair & Spa',
    image: require('../../assets/images/search_salon1.png'),
    hasBadge: true,
    badgeText: 'Salon of the year',
    rating: '4.9',
  },
  {
    id: 'salon-opal',
    type: 'salon',
    title: 'Opal Glow Studio',
    location: 'Kado (9.0km)',
    category: 'Pedicure & Nails',
    image: require('../../assets/images/search_salon2.png'),
    hasBadge: true,
    badgeText: 'Salon of the year',
    rating: '4.8',
  },
];

// ── 1:1 Figma Spec Fallback for "Places Near You" under Error Search ──
const PLACES_NEAR_YOU_ERROR_SEARCH: SearchItem[] = [
  {
    id: 'places-great-beauty',
    type: 'salon',
    title: 'Great Beauty Empire',
    location: 'Jabi (1.2km)',
    category: 'Spa',
    image: require('../../assets/images/search_salon1.png'),
    hasBadge: true,
    badgeText: 'Salon of the year',
    rating: '1.0',
  },
  {
    id: 'places-aram',
    type: 'salon',
    title: 'Aram',
    location: 'Jabi (1.2km)',
    category: 'Spa',
    image: require('../../assets/images/search_salon2.png'),
    hasBadge: false,
    rating: '1.0',
  },
];

// ── Levenshtein Distance & String Similarity Functions ──
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i);

  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      if (s1[i - 1] === s2[j - 1]) {
        dp[j] = prev;
      } else {
        dp[j] = 1 + Math.min(prev, dp[j], dp[j - 1]);
      }
      prev = temp;
    }
  }

  return dp[n];
}

function computeSimilarity(query: string, candidate: string): number {
  const q = query.toLowerCase().trim();
  const c = candidate.toLowerCase().trim();

  if (!q || !c) return 0;
  if (q === c) return 1.0;

  // Exact substring containment
  if (c.includes(q)) return 0.95;
  if (q.includes(c)) return 0.85;

  // Word/token-level matching
  const qWords = q.split(/[\s\-_]+/).filter((w) => w.length > 1);
  const cWords = c.split(/[\s\-_]+/).filter((w) => w.length > 1);

  let tokenMatchScore = 0;
  for (const qw of qWords) {
    let bestWordMatch = 0;
    for (const cw of cWords) {
      if (cw === qw) {
        bestWordMatch = 1.0;
        break;
      }
      if (cw.includes(qw) || qw.includes(cw)) {
        bestWordMatch = Math.max(bestWordMatch, 0.85);
      } else {
        const dist = levenshteinDistance(qw, cw);
        const maxLen = Math.max(qw.length, cw.length);
        const sim = 1 - dist / maxLen;
        if (sim > bestWordMatch) {
          bestWordMatch = sim;
        }
      }
    }
    tokenMatchScore += bestWordMatch;
  }

  const tokenAvg = qWords.length > 0 ? tokenMatchScore / qWords.length : 0;

  // Overall whole-string Levenshtein similarity
  const overallDist = levenshteinDistance(q, c);
  const maxLen = Math.max(q.length, c.length);
  const overallSim = 1 - overallDist / maxLen;

  return Math.max(tokenAvg, overallSim);
}

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();

  // Dynamic search query state
  const [searchQuery, setSearchQuery] = useState(params.q || '');

  // Active search state: false shows 1:1 Figma empty search state; true shows active search with 10% OFF banner & recent searches
  const [isSearchActive, setIsSearchActive] = useState(Boolean(params.q));
  const inputRef = React.useRef<TextInput>(null);

  // Dynamic recent search list (initializes empty; populated as user performs searches)
  const [recentSearchIds, setRecentSearchIds] = useState<string[]>(searchHistoryStore.getHistory());

  React.useEffect(() => {
    const unsubscribe = searchHistoryStore.subscribe(() => {
      setRecentSearchIds(searchHistoryStore.getHistory());
    });
    setRecentSearchIds(searchHistoryStore.getHistory());
    return unsubscribe;
  }, []);

  // Selection & Delete state matching Figma "delete button" / "selection state"
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  // If search was opened with a direct shortcut query like "trending" or "popular", redirect directly to Explore screen
  React.useEffect(() => {
    const q = (params.q || '').trim().toLowerCase();
    if (q === 'trending near you' || q === 'trending') {
      router.replace({ pathname: '/home/explore', params: { filter: 'trending' } } as any);
    } else if (q === 'popular' || q === 'popular near you') {
      router.replace({ pathname: '/home/explore', params: { filter: 'popular' } } as any);
    } else if (q === 'near you' || q === 'near me') {
      router.replace({ pathname: '/home/explore', params: { filter: 'near_you' } } as any);
    }
  }, [params.q]);

  // Real-time dynamic search filter across title, location, category, and style
  const filteredResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    // Smart query handling for Trending / Popular / Near You shortcuts:
    if (query === 'trending' || query === 'trending near you' || query === 'trending places' || query === 'trend') {
      return [...MASTER_SEARCH_CATALOG].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    }
    if (query === 'popular' || query === 'popular near you' || query === 'popular places') {
      return [...MASTER_SEARCH_CATALOG].filter((item) => item.hasBadge || parseFloat(item.rating) >= 4.0 || item.type === 'salon');
    }
    if (query === 'near you' || query === 'near me' || query === 'places near you' || query === 'places near me') {
      return MASTER_SEARCH_CATALOG.filter((item) => item.type === 'salon');
    }

    return MASTER_SEARCH_CATALOG.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchLocation = item.location ? item.location.toLowerCase().includes(query) : false;
      const matchCategory = item.category.toLowerCase().includes(query);
      return matchTitle || matchLocation || matchCategory;
    });
  }, [searchQuery]);

  // Recent searches list derived from recentSearchIds
  const recentSearchesList = useMemo(() => {
    return recentSearchIds
      .map((id) => MASTER_SEARCH_CATALOG.find((item) => item.id === id))
      .filter((item): item is SearchItem => Boolean(item));
  }, [recentSearchIds]);

  const isSearching = isSearchActive || searchQuery.trim().length > 0;
  const isNotFound = isSearching && searchQuery.trim().length > 0 && filteredResults.length === 0;

  // Dynamically find the salon or service that most closely matches the user's typed query
  const closestMatch = useMemo<SearchItem | null>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    let bestScore = -1;
    let bestItem: SearchItem | null = null;

    // Search across all catalog items
    for (const item of MASTER_SEARCH_CATALOG) {
      // Avoid suggesting exact query string if identical
      if (item.title.toLowerCase() === q) continue;

      const titleSim = computeSimilarity(q, item.title);
      const catSim = computeSimilarity(q, item.category);
      const locSim = item.location ? computeSimilarity(q, item.location) * 0.7 : 0;

      const score = Math.max(titleSim * 1.3, catSim, locSim);

      if (score > bestScore) {
        bestScore = score;
        bestItem = item;
      }
    }

    return bestItem || MASTER_SEARCH_CATALOG[5] || MASTER_SEARCH_CATALOG[0];
  }, [searchQuery]);

  // Items to display in active search mode
  const displayItems = useMemo(() => {
    if (searchQuery.trim().length > 0) {
      return filteredResults;
    }
    if (recentSearchesList.length > 0) {
      return recentSearchesList;
    }
    return MASTER_SEARCH_CATALOG.slice(0, 5);
  }, [searchQuery, filteredResults, recentSearchesList]);

  // Handle item click: track into recent searches and navigate to that particular screen
  const handleItemPress = (item: SearchItem) => {
    if (isSelectionMode) {
      toggleSelectItem(item.id);
      return;
    }
    searchHistoryStore.addSearch(item.id);
    if (item.type === 'service') {
      previewStore.setPreviewImages([item.image], item.title);
      router.push({
        pathname: '/professional/style-details',
        params: {
          title: item.title,
          price: item.price || '₦14,200',
          duration: item.duration || '1hr',
          rating: item.rating || '4.8',
          salonName: 'Luminous Lux',
        },
      } as any);
    } else {
      const cleanId = item.id.replace(/^(salon-|places-)/, '') || '1';
      router.push({
        pathname: '/salon/[id]',
        params: { id: cleanId, name: item.title },
      } as any);
    }
  };

  // Toggle selection checkbox for an item
  const toggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Clear / Select / Delete button handler
  const handleRecentActionPress = () => {
    if (!isSelectionMode) {
      // Enter selection mode
      setIsSelectionMode(true);
      setSelectedItemIds([]);
    } else {
      if (selectedItemIds.length > 0) {
        // Open delete confirmation modal
        setIsDeleteModalVisible(true);
      }
    }
  };

  // Confirm delete handler from modal
  const handleConfirmDelete = () => {
    searchHistoryStore.removeSearches(selectedItemIds);
    setSelectedItemIds([]);
    setIsSelectionMode(false);
    setIsDeleteModalVisible(false);
  };

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedItemIds([]);
  };

  const handleClearInput = () => {
    setSearchQuery('');
  };

  const handleBackPress = () => {
    if (isSearchActive || searchQuery.length > 0) {
      setSearchQuery('');
      setIsSearchActive(false);
      inputRef.current?.blur();
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)' as any);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ─── Search Header (Figma: map search, 72px height, 1px borderBottom) ─── */}
      <View style={styles.headerContainer}>
        <View style={styles.searchBackArrowRow}>
          {/* Circular Back Button (48x48px) */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} />
          </TouchableOpacity>

          {/* Search Bar Input (288px width, 48px height, 24px radius) */}
          <TouchableOpacity
            style={[styles.searchBar, isSelectionMode && styles.searchBarWithCancel]}
            activeOpacity={1}
            onPress={() => {
              setIsSearchActive(true);
              inputRef.current?.focus();
            }}
          >
            <Search size={24} color="#000000" strokeWidth={1.5} />
            <TextInput
              ref={inputRef}
              style={[
                styles.searchInput,
                Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
              ]}
              placeholder="Search anything"
              placeholderTextColor="rgba(96, 96, 102, 0.96)"
              value={searchQuery}
              onFocus={() => setIsSearchActive(true)}
              onChangeText={(text) => {
                if (isSelectionMode) setIsSelectionMode(false);
                setSearchQuery(text);
                if (!isSearchActive) setIsSearchActive(true);
              }}
              autoFocus={false}
              selectionColor="rgba(0, 8, 20, 0.96)"
              returnKeyType="search"
              onSubmitEditing={() => {
                const q = searchQuery.trim().toLowerCase();
                if (q === 'trending near you' || q === 'trending' || q === 'trend') {
                  router.push({ pathname: '/home/explore', params: { filter: 'trending' } } as any);
                } else if (q === 'popular' || q === 'popular near you' || q === 'popular places') {
                  router.push({ pathname: '/home/explore', params: { filter: 'popular' } } as any);
                } else if (q === 'near you' || q === 'near me' || q === 'places near you') {
                  router.push({ pathname: '/home/explore', params: { filter: 'near_you' } } as any);
                }
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={handleClearInput}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                <X size={18} color="rgba(96, 96, 102, 0.96)" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* Cancel button in selection mode */}
          {isSelectionMode && (
            <TouchableOpacity
              style={styles.cancelModeButton}
              onPress={handleCancelSelection}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelModeText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {isSearching ? (
          isNotFound ? (
            /* ─── Search Not Found State (Figma: Error search 1:1) ─── */
            <View style={styles.notFoundContainer}>
              <View style={styles.notFoundImagePlaceholder}>
                <SafeImage
                  source={require('../../assets/images/search_not_found.png')}
                  style={styles.notFoundImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.notFoundTitle}>Search Not Found</Text>

              <View style={styles.suggestionRow}>
                <Text style={styles.suggestionText}>Do you mean </Text>
                {closestMatch && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleItemPress(closestMatch)}
                  >
                    <Text style={styles.suggestionLink}>{closestMatch.title}?</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Recommended Salons Fallback (Figma: Places Near You) */}
              <View style={[styles.relatedSearchContainer, { marginTop: 40 }]}>
                <Text style={styles.placesNearYouTitle}>Places Near You</Text>
                <View style={styles.suggestedOptionsList}>
                  {PLACES_NEAR_YOU_ERROR_SEARCH.map((item) => (
                    <SalonSearchCard
                      key={item.id}
                      item={item}
                      onPress={() => handleItemPress(item)}
                    />
                  ))}
                </View>
              </View>
            </View>
          ) : (
            /* ─── Dynamic Active Search Results (Figma Frames 1, 2, & 3: user search based on location / service) ─── */
            <>
              {/* 10% OFF Ads Banner with 4 Carousel Dots */}
              <View style={styles.bannerContainer}>
                <ImageBackground
                  source={require('../../assets/images/banner/promo_salon.png')}
                  style={styles.bannerImage}
                  imageStyle={styles.bannerImageRadius}
                >
                  <View style={styles.bannerOverlay}>
                    <Text style={styles.bannerText}>10% OFF</Text>
                  </View>
                  <View style={styles.bannerDotsContainer}>
                    <View style={[styles.bannerDot, styles.bannerDotActive]} />
                    <View style={styles.bannerDot} />
                    <View style={styles.bannerDot} />
                    <View style={styles.bannerDot} />
                  </View>
                </ImageBackground>
              </View>

              {/* Results List Section */}
              <View style={styles.relatedSearchContainer}>
                <View style={styles.recentSearchHeader}>
                  <Text style={styles.recentSearchTitle}>Recent Searches</Text>
                  <TouchableOpacity
                    style={styles.clearButton}
                    activeOpacity={0.7}
                    onPress={handleClearInput}
                  >
                    <Text style={styles.clearButtonText}>Clear</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.suggestedOptionsList}>
                  {displayItems.map((item) =>
                    item.type === 'service' ? (
                      <ServiceSearchCard
                        key={item.id}
                        item={item}
                        onPress={() => handleItemPress(item)}
                      />
                    ) : (
                      <SalonSearchCard
                        key={item.id}
                        item={item}
                        onPress={() => handleItemPress(item)}
                      />
                    )
                  )}
                </View>
              </View>
            </>
          )
        ) : (
          /* ─── Empty Search Input State: 1:1 Figma "empty search state" ─── */
          <>
            {/* Recent Searches with Delete / Selection Mode (Only rendered if search history exists) */}
            {recentSearchesList.length > 0 && (
              <View style={[styles.relatedSearchContainer, { marginBottom: 32 }]}>
                <View style={styles.recentSearchHeader}>
                  <Text style={styles.recentSearchTitle}>Recent Searches</Text>
                  <TouchableOpacity
                    style={styles.clearButton}
                    activeOpacity={0.7}
                    onPress={handleRecentActionPress}
                  >
                    <Text style={styles.clearButtonText}>
                      {!isSelectionMode
                        ? 'Clear'
                        : selectedItemIds.length > 0
                          ? 'Delete'
                          : 'Select'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.suggestedOptionsList}>
                  {recentSearchesList.map((item) => (
                    <View key={`recent-${item.id}`} style={styles.recentCardWrapper}>
                      {/* Circular Selection Radio Checkbox */}
                      {isSelectionMode && (
                        <TouchableOpacity
                          style={styles.checkboxTouch}
                          onPress={() => toggleSelectItem(item.id)}
                          activeOpacity={0.7}
                        >
                          <View
                            style={[
                              styles.checkboxCircle,
                              selectedItemIds.includes(item.id) && styles.checkboxCircleSelected,
                            ]}
                          >
                            {selectedItemIds.includes(item.id) && (
                              <Check size={12} color="#FFFFFF" strokeWidth={3} />
                            )}
                          </View>
                        </TouchableOpacity>
                      )}

                      <View style={{ flex: 1 }}>
                        <SalonSearchCard
                          item={item}
                          onPress={() => handleItemPress(item)}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Suggested Searches Quick Options (1:1 Figma: suggested search, 358x244, gap 24) */}
            <View style={styles.suggestedSearchSection}>
              <Text style={styles.sectionTitleText}>Suggested Search</Text>

              <View style={styles.optionsList}>
                {/* Near You Option (Figma: near you button) */}
                <TouchableOpacity
                  style={styles.optionContainer}
                  onPress={() => router.push({ pathname: '/home/explore', params: { filter: 'near_you' } } as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <Navigation03Icon />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.optionTitle}>Near You</Text>
                    <Text style={styles.optionSubtitle}>See locations around you</Text>
                  </View>
                </TouchableOpacity>

                {/* Trending Near You Option (Figma: iconamoon:trend-up-light) */}
                <TouchableOpacity
                  style={styles.optionContainer}
                  onPress={() => router.push({ pathname: '/home/explore', params: { filter: 'trending' } } as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <TrendUpIcon />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.optionTitle}>Trending Near You</Text>
                    <Text style={styles.optionSubtitle}>Discover trending places</Text>
                  </View>
                </TouchableOpacity>

                {/* Popular Option (Figma: star) */}
                <TouchableOpacity
                  style={styles.optionContainer}
                  onPress={() => router.push({ pathname: '/home/explore', params: { filter: 'popular' } } as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <StarOutlineIcon />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.optionTitle}>Popular</Text>
                    <Text style={styles.optionSubtitle}>See popular places</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
      <NativeDockSpacer />

      {/* ─── Delete Search History Confirmation Modal (Figma: cancel booking ... / Delete Search History) ─── */}
      <Modal
        visible={isDeleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete Search History</Text>
            <Text style={styles.modalSubtitle}>
              You wont find this search on your recent search again
            </Text>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalPillCancelBtn}
                activeOpacity={0.7}
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPillDeleteBtn}
                activeOpacity={0.7}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.modalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Salon Search Card (Frames 1 & 2: 88x88 image frame, badge, location, rating) ──
const SalonSearchCard = ({ item, onPress }: { item: SearchItem; onPress: () => void }) => (
  <TouchableOpacity style={styles.locationCard} onPress={onPress} activeOpacity={0.8}>
    {/* Image frame place holder (88x88px with shadow and 80x80px image) */}
    <View style={styles.imageFramePlaceholder}>
      <SafeImage source={item.image} style={styles.cardImage} resizeMode="cover" />
    </View>

    {/* Right Info Column (222px width, 92px/84px height) */}
    <View style={styles.cardInfoColumn}>
      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.title}
      </Text>

      {/* Location & Category Row */}
      <View style={styles.metaLocationRow}>
        {item.location && (
          <View style={styles.locationSubRow}>
            <MapPin size={16} color="rgba(192, 192, 204, 0.96)" strokeWidth={1.5} />
            <Text style={styles.metaText}>{item.location}</Text>
          </View>
        )}
        {item.location && <View style={styles.metaDividerDot} />}
        <Text style={styles.metaText}>{item.category}</Text>
      </View>

      {/* Badge & Rating Row */}
      <View style={styles.badgeRatingRow}>
        {item.hasBadge && (
          <View style={styles.awardBadge}>
            <GoldShieldAwardIcon />
            <Text style={styles.awardBadgeText}>{item.badgeText || 'Salon of the year'}</Text>
          </View>
        )}
        {item.hasBadge && <View style={styles.metaDividerDot} />}
        <View style={styles.ratesRow}>
          <Star size={16} color="rgba(245, 149, 15, 0.96)" fill="rgba(245, 149, 15, 0.96)" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

// ── Service Search Card (Frame 3: map search based on service) ──
// ── Service Search Card (Figma: hair cut categories, 358px x 116px) ──
const ServiceSearchCard = ({ item, onPress }: { item: SearchItem; onPress: () => void }) => (
  <TouchableOpacity style={styles.serviceCard} onPress={onPress} activeOpacity={0.8}>
    {/* Style Thumbnail (Figma: image place holder 88px x 88px, padding 4px) */}
    <View style={styles.serviceImageContainer}>
      <SafeImage source={item.image} style={styles.serviceImage} resizeMode="cover" />
    </View>

    {/* Center Details Column (Figma: Frame 1000006082, 232px x 80px) */}
    <View style={styles.serviceDetails}>
      <Text style={styles.serviceItemTitle} numberOfLines={1}>
        {item.title}
      </Text>

      {/* Pricing Row */}
      <View style={styles.servicePriceRow}>
        <Text style={styles.servicePriceText}>{item.price}</Text>
      </View>

      {/* Duration & Rating Row (Figma: Frame 1000006081) */}
      <View style={styles.serviceMetaRow}>
        {item.duration && (
          <View style={styles.durationSubRow}>
            <Clock size={16} color="rgba(96, 96, 102, 0.96)" />
            <Text style={styles.serviceMetaDurationText}>{item.duration}</Text>
          </View>
        )}
        <View style={styles.ratesRow}>
          <Star size={16} color="rgba(248, 155, 24, 0.96)" fill="rgba(248, 155, 24, 0.96)" />
          <Text style={styles.serviceMetaRatingText}>{item.rating}</Text>
        </View>
      </View>
    </View>

    {/* Optional Corner Ribbon (Figma: animation frame holder, 10% OFF) */}
    {item.discountTag && (
      <View style={styles.serviceDiscountRibbon}>
        <Text style={styles.serviceDiscountRibbonText}>{item.discountTag}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header (map search: height 72px, borderBottom 1px solid rgba(235, 235, 245, 0.96)) ──
  headerContainer: {
    height: 72,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
  },
  searchBackArrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 48,
    gap: 12,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },
  searchBarWithCancel: {
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    height: '100%',
    paddingVertical: 0,
  },
  cancelModeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelModeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    color: 'rgba(26, 130, 255, 0.9)',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // ── Ads Banner (358px x 88px, 16px radius, "10% OFF") ──
  bannerContainer: {
    width: '100%',
    height: 88,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  bannerImageRadius: {
    borderRadius: 16,
  },
  bannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  bannerText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_700Bold',
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: 0.2,
    color: '#FFFFFF',
  },
  bannerDotsContainer: {
    position: 'absolute',
    bottom: 8,
    right: 16,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  bannerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  bannerDotActive: {
    backgroundColor: '#FFFFFF',
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // ── Related Search Section (Figma: related search) ──
  relatedSearchContainer: {
    width: '100%',
    gap: 16,
  },
  recentSearchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 40,
  },
  recentSearchTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(204, 41, 41, 0.9)',
  },
  noRecentSearchContainer: {
    paddingVertical: 16,
    paddingHorizontal: 4,
    alignItems: 'flex-start',
  },
  noRecentSearchText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.8)',
  },

  // ── Location-Based Cards List (Frames 1 & 2) ──
  suggestedOptionsList: {
    width: '100%',
    gap: 16,
  },
  recentCardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  checkboxTouch: {
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxCircleSelected: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    width: '100%',
    minHeight: 120,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderRadius: 24,
  },
  imageFramePlaceholder: {
    width: 88,
    height: 88,
    padding: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 1)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  cardInfoColumn: {
    flex: 1,
    minHeight: 84,
    justifyContent: 'center',
    gap: 8,
  },
  cardTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  metaLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  metaDividerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },
  badgeRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  awardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
    backgroundColor: 'rgba(246, 240, 230, 0.96)',
    borderRadius: 16,
    height: 28,
  },
  awardBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(248, 155, 24, 0.96)',
  },
  ratesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Service Search Card (Figma: hair cut categories, 358px x 116px) ──
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 20,
    width: '100%',
    minHeight: 116,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  serviceImageContainer: {
    width: 88,
    height: 88,
    borderRadius: 16,
    padding: 4,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.25)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 3,
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  serviceDetails: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  serviceItemTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  servicePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  servicePriceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.6,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  oldPriceContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  oldPriceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  discountStrikethrough: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 0.8,
    backgroundColor: 'rgba(96, 96, 102, 0.96)',
  },
  serviceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  durationSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceMetaDurationText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  serviceMetaRatingText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  serviceDiscountRibbon: {
    position: 'absolute',
    top: 14,
    right: -24,
    width: 100,
    height: 22,
    backgroundColor: 'rgba(246, 240, 230, 0.96)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '37deg' }],
  },
  serviceDiscountRibbonText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(248, 155, 24, 0.96)',
    letterSpacing: 0.3,
  },

  // ── Not Found State (Figma: Error search 1:1) ──
  notFoundContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
  },
  notFoundImagePlaceholder: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  notFoundImage: {
    width: 150,
    height: 150,
  },
  notFoundTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    marginBottom: 8,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    paddingVertical: 8,
  },
  suggestionText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  suggestionLink: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#1A82FF',
    textDecorationLine: 'underline',
  },
  placesNearYouTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    marginBottom: 4,
  },

  // ── Suggested Search Section (Empty input) ──
  suggestedSearchSection: {
    width: '100%',
    gap: 24,
  },
  sectionTitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
  },
  optionsList: {
    gap: 24,
    width: '100%',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    height: 48,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 4,
    height: 48,
  },
  optionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  optionSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Delete Confirmation Modal Styles (Figma: cancel booking ... / Delete Search History) ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 342,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: 'center',
    gap: 12,
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'Inter',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'Inter',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    maxWidth: 260,
    marginBottom: 8,
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  modalPillCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'Inter',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
  },
  modalPillDeleteBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDeleteText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'Inter',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(223, 70, 40, 0.96)',
  },
});
