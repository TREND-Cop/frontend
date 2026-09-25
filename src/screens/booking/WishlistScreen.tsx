import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { SafeImage } from '../../components/ui/SafeImage';
import { EmptyWishlistScreen } from './EmptyWishlistScreen';
import { InAppShareModal } from '../../components/InAppShareModal';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';
import { useFavoritesContext } from '../../store/FavoritesContext';
import { shareStore } from '../../utils/shareStore';

// ── Exact Figma Vector Icons ──

const ArrowLeftIcon = ({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4.5 12H19.5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 18C10 18 4.5 13.58 4.5 12C4.5 10.42 10 6 10 6"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ShareIcon = ({ size = 24, color = '#141B34' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3V15M12 3L8 7M12 3L16 7"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 11V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V11"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

const LocationPinIcon = ({ size = 16, color = 'rgba(192, 192, 204, 0.96)' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path
      d="M8 2C5.51 2 3.5 4.01 3.5 6.5C3.5 9.9 8 14 8 14C8 14 12.5 9.9 12.5 6.5C12.5 4.01 10.49 2 8 2Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="8" cy="6.5" r="2" stroke={color} strokeWidth={1.5} />
  </Svg>
);

const GoldStarIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L14.85 7.78L21.22 8.71L16.61 13.2L17.7 19.54L12 16.55L6.3 19.54L7.39 13.2L2.78 8.71L9.15 7.78L12 2Z"
      fill="rgba(248, 155, 24, 0.96)"
    />
  </Svg>
);

// Figma: Favourite Vector (24x24) with fill: rgba(204, 41, 41, 0.9)
const RedHeartFilledIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="rgba(204, 41, 41, 0.9)"
    />
  </Svg>
);

export interface WishlistItem {
  id: string;
  name: string;
  location: string;
  price: string;
  rating: string;
  image: any;
  images?: any[];
  category?: string;
}

const INITIAL_WISHLIST_ITEMS: WishlistItem[] = [
  {
    id: 'w0',
    name: 'Teeth Whitening',
    location: 'Jabi, Abuja',
    price: '₦35,000',
    rating: '1.3',
    image: require('../../../assets/images/packages/clay_scrub_facial.png'),
    images: [
      require('../../../assets/images/packages/clay_scrub_facial.png'),
      require('../../../assets/images/profile/men_braids.jpg'),
      require('../../../assets/images/services/men_haircut.png'),
    ],
  },
  {
    id: 'w1',
    name: 'Men Cornrows & Braids',
    location: 'Jabi, Abuja',
    price: '₦14,200',
    rating: '4.8',
    image: require('../../../assets/images/profile/men_braids.jpg'),
    images: [
      require('../../../assets/images/profile/men_braids.jpg'),
      require('../../../assets/images/services/men_haircut.png'),
    ],
  },
  {
    id: 'w2',
    name: 'Classic Fade Haircut',
    location: 'Gwarinpa, Abuja',
    price: '₦8,500',
    rating: '4.9',
    image: require('../../../assets/images/services/men_haircut.png'),
    images: [
      require('../../../assets/images/services/men_haircut.png'),
      require('../../../assets/images/profile/dry_wow_pedicure.jpg'),
    ],
  },
  {
    id: 'w3',
    name: 'Clay Scrub Deep Facial',
    location: 'Wuse II, Abuja',
    price: '₦18,000',
    rating: '4.7',
    image: require('../../../assets/images/packages/clay_scrub_facial.png'),
  },
  {
    id: 'w4',
    name: 'Dry Wow Pedicure Treatment',
    location: 'Maitama, Abuja',
    price: '₦11,000',
    rating: '4.6',
    image: require('../../../assets/images/profile/dry_wow_pedicure.jpg'),
  },
];

// ── Animated Wishlist Card Component ──
// When red heart is tapped:
// 1. Heart pops with tactile shrink animation
// 2. Card collapses height (124 -> 0) & marginBottom (16 -> 0) with fade
// 3. Elements below slide up seamlessly in real-time
interface AnimatedWishlistCardProps {
  item: WishlistItem;
  onPress: () => void;
  onRemove: (id: string) => void;
}

const AnimatedWishlistCard: React.FC<AnimatedWishlistCardProps> = ({
  item,
  onPress,
  onRemove,
}) => {
  const animatedHeight = useRef(new Animated.Value(124)).current;
  const animatedMarginBottom = useRef(new Animated.Value(16)).current;
  const animatedOpacity = useRef(new Animated.Value(1)).current;
  const animatedScale = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const [isRemoving, setIsRemoving] = useState(false);

  const handleHeartPress = () => {
    if (isRemoving) return;
    setIsRemoving(true);

    // Step 1: Heart pop and shrink feedback
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.35,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 0.1,
        duration: 110,
        useNativeDriver: true,
      }),
    ]).start();

    // Step 2: Smooth height collapse and fade out
    // Both height and marginBottom collapse to 0 so the cards below smoothly slide up
    Animated.parallel([
      Animated.timing(animatedOpacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(animatedScale, {
        toValue: 0.92,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: 320,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      }),
      Animated.timing(animatedMarginBottom, {
        toValue: 0,
        duration: 320,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      }),
    ]).start(() => {
      onRemove(item.id);
    });
  };

  return (
    <Animated.View
      style={[
        styles.animatedCardWrapper,
        {
          height: animatedHeight,
          marginBottom: animatedMarginBottom,
          opacity: animatedOpacity,
          transform: [{ scale: animatedScale }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.wishlistCard}
        activeOpacity={0.85}
        onPress={onPress}
        disabled={isRemoving}
      >
        {/* Left: White Image Box Container (88x88, radius 16px) */}
        <View style={styles.imageOuterBox}>
          <View style={styles.imageInnerWrapper}>
            <SafeImage
              source={item.image}
              style={styles.serviceImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Right: Details Column (Figma: Frame 1000005858, width 214px, height 92px, gap 8px) */}
        <View style={styles.detailsColumn}>
          {/* Top Row: Title + Red Heart Button */}
          <View style={styles.titleHeartRow}>
            <Text style={styles.itemTitleText} numberOfLines={1}>
              {item.name}
            </Text>
            <TouchableOpacity
              style={styles.heartButton}
              activeOpacity={0.7}
              onPress={handleHeartPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <RedHeartFilledIcon size={24} />
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Middle Row: Location */}
          <View style={styles.locationRow}>
            <LocationPinIcon size={16} />
            <Text style={styles.locationLabelText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>

          {/* Bottom Row: Price & Star Rating */}
          <View style={styles.priceRatingRow}>
            <Text style={styles.priceValueText}>{item.price}</Text>

            <View style={styles.ratingBadge}>
              <GoldStarIcon size={20} />
              <Text style={styles.ratingValueText}>{item.rating}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const WishlistScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { favorites, removeFavorite } = useFavoritesContext();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [items, setItems] = useState<WishlistItem[]>(() => {
    if (favorites.length > 0) {
      return favorites.map((f) => ({
        id: f.id,
        name: f.name,
        location: f.location || 'Jabi, Abuja',
        price: f.price ? (typeof f.price === 'number' ? `₦${f.price.toLocaleString()}` : f.price) : '₦35,000',
        rating: f.rating || '1.3',
        image: f.imageUri || (f.images && f.images[0]) || require('../../../assets/images/packages/clay_scrub_facial.png'),
        images: f.images,
      }));
    }
    return INITIAL_WISHLIST_ITEMS;
  });

  // Sync if favorites changes from outside
  useEffect(() => {
    if (favorites.length > 0) {
      setItems(
        favorites.map((f) => ({
          id: f.id,
          name: f.name,
          location: f.location || 'Jabi, Abuja',
          price: f.price ? (typeof f.price === 'number' ? `₦${f.price.toLocaleString()}` : f.price) : '₦35,000',
          rating: f.rating || '1.3',
          image: f.imageUri || (f.images && f.images[0]) || require('../../../assets/images/packages/clay_scrub_facial.png'),
          images: f.images,
        }))
      );
    }
  }, [favorites]);

  const handleGoBack = () => {
    router.replace('/home/bookings' as any);
  };

  const handleItemPress = (item: WishlistItem) => {
    router.push({
      pathname: '/professional/style-details',
      params: {
        id: item.id,
        name: item.name,
        title: item.name,
        price: item.price,
        rating: item.rating,
        location: item.location,
        images: item.images ? JSON.stringify(item.images) : undefined,
      },
    } as any);
  };

  const handleRemoveItem = async (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    try {
      await removeFavorite(id);
    } catch {
      // ignore
    }
  };

  // If there are 0 items in the wishlist, display the Empty Wishlist screen
  if (items.length === 0) {
    return (
      <EmptyWishlistScreen
        onExploreServices={() => router.push('/category' as any)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Page Header (Figma: height 64px, borderBottom 1px) ── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeftIcon size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Wishlist</Text>

        <TouchableOpacity
          style={styles.headerShareButton}
          onPress={() => {
            shareStore.openShare({
              title: 'My Trend Wishlist',
              url: 'https://trend.app/wishlist',
              status: 'Available',
              statusColor: 'rgba(12, 121, 12, 0.96)',
              avatar: items[0]?.image || require('../../../assets/images/profile/men_braids.jpg'),
            });
            setIsShareModalOpen(true);
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ShareIcon size={24} />
        </TouchableOpacity>
      </View>

      {/* ── Wishlist Items Vertical Feed ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 24 },
        ]}
      >
        {items.map((item) => (
          <AnimatedWishlistCard
            key={item.id}
            item={item}
            onPress={() => handleItemPress(item)}
            onRemove={handleRemoveItem}
          />
        ))}
      </ScrollView>
      <NativeDockSpacer />

      {/* ── In-App Share Modal ── */}
      <InAppShareModal
        visible={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="My Trend Wishlist"
        url="https://trend.app/wishlist"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header (Figma: height 64px, padding 8px 16px, borderBottom 1px) ──
  headerRow: {
    height: 64,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
  },
  headerButton: {
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
  headerShareButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Scroll Content ──
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // ── Animated Card Wrapper ──
  animatedCardWrapper: {
    width: '100%',
    overflow: 'hidden',
  },

  // ── Wishlist Card (Figma: 358x124, radius 24px, bg #F8F9FA, border 1px solid rgba(235, 235, 245, 0.96), padding: 16, gap: 24) ──
  wishlistCard: {
    width: '100%',
    height: 124,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },

  // ── Image Outer Container (88x88, radius 16px, white, shadow) ──
  imageOuterBox: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  imageInnerWrapper: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },

  // ── Right Details Column (Figma: Frame 1000005858, height 92px, gap 8px) ──
  detailsColumn: {
    flex: 1,
    height: 92,
    justifyContent: 'space-between',
    gap: 8,
  },
  titleHeartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 24,
    width: '100%',
  },
  heartButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -6,
  },
  itemTitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    flex: 1,
    marginRight: 6,
  },

  // ── Location Row (gap 8px, height 28px) ──
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 28,
  },
  locationLabelText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Price & Rating Row (width 214px, height 24px, gap 8px) ──
  priceRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 24,
    gap: 8,
  },
  priceValueText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: Platform.OS === 'ios' ? 0.6 : 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 20,
  },
  ratingValueText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },
});

export default WishlistScreen;
