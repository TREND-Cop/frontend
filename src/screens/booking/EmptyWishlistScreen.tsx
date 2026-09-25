import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { SafeImage } from '../../components/ui/SafeImage';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';
import { typography } from '../../constants/theme';

// ── Vector Icons ──

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

const GoldStarSmallIcon = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path
      d="M8 1.5L9.9 5.36L14.16 5.98L11.08 8.98L11.81 13.22L8 11.22L4.19 13.22L4.92 8.98L1.84 5.98L6.1 5.36L8 1.5Z"
      fill="rgba(248, 155, 24, 0.96)"
    />
  </Svg>
);

const MapPinSmallIcon = ({ size = 16, color = 'rgba(96, 96, 102, 0.96)' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path
      d="M8 2C5.51 2 3.5 4.01 3.5 6.5C3.5 9.9 8 14 8 14C8 14 12.5 9.9 12.5 6.5C12.5 4.01 10.49 2 8 2Z"
      stroke={color}
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="8" cy="6.5" r="2" stroke={color} strokeWidth={1.2} />
  </Svg>
);

const HeartOutlineIcon = ({ size = 20, color = 'rgba(255, 255, 255, 0.95)' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
      stroke={color}
      strokeWidth={1.5}
      fill="rgba(0, 0, 0, 0.2)"
    />
  </Svg>
);

// ── Figma Stacked Cards with Heart Illustration ──
const EmptyWishlistIllustration = ({ size = 160 }: { size?: number }) => (
  <View style={styles.illustrationContainer}>
    {/* Soft Glow/Circle Backdrop */}
    <View style={styles.circleBackdrop} />

    {/* Stacked Underneath Card 1 (Rotated Left) */}
    <View style={[styles.stackedCard, styles.stackedCardLeft]} />

    {/* Stacked Underneath Card 2 (Rotated Right) */}
    <View style={[styles.stackedCard, styles.stackedCardRight]} />

    {/* Main Foreground Card with Heart */}
    <View style={styles.mainCard}>
      <Svg width={54} height={54} viewBox="0 0 48 48" fill="none">
        <Path
          d="M24 40.5L21.4 38.13C12.12 29.72 6 24.18 6 17.37C6 11.83 10.35 7.5 15.9 7.5C19.03 7.5 22.04 8.96 24 11.26C25.96 8.96 28.97 7.5 32.1 7.5C37.65 7.5 42 11.83 42 17.37C42 24.18 35.88 29.72 26.6 38.15L24 40.5Z"
          stroke="#9AA4B2"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  </View>
);

// ── Recommended "You Might Like" Catalog ──
const YOU_MIGHT_LIKE_ITEMS = [
  {
    id: 'yml1',
    name: "Men's Grooming",
    price: '₦35,000',
    originalPrice: '₦41,000',
    rating: '4.1',
    location: 'Jabi, Abuja',
    image: require('../../../assets/images/services/men_haircut.png'),
  },
  {
    id: 'yml2',
    name: 'Pedicure & Foot Spa',
    price: '₦28,000',
    originalPrice: '₦35,000',
    rating: '4.2',
    location: 'Wuse II, Abuja',
    image: require('../../../assets/images/profile/dry_wow_pedicure.jpg'),
  },
  {
    id: 'yml3',
    name: 'Facial Therapy',
    price: '₦32,000',
    originalPrice: '₦38,000',
    rating: '4.8',
    location: 'Maitama, Abuja',
    image: require('../../../assets/images/packages/clay_scrub_facial.png'),
  },
];

import { useFavoritesContext } from '../../store/FavoritesContext';
import { ShareIcon } from '../../components/ShareIcon';
import { shareStore } from '../../utils/shareStore';

interface EmptyWishlistScreenProps {
  onExploreServices?: () => void;
}

export const EmptyWishlistScreen: React.FC<EmptyWishlistScreenProps> = ({
  onExploreServices,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite: toggleContextFavorite } = useFavoritesContext();

  const handleToggleFavorite = async (item: (typeof YOU_MIGHT_LIKE_ITEMS)[0]) => {
    const numPrice = parseInt(item.price.replace(/[^0-9]/g, ''), 10) || 35000;
    await toggleContextFavorite({
      id: item.id,
      name: item.name,
      price: numPrice,
      rating: item.rating,
      location: item.location,
      imageUri: item.image,
      images: [item.image, item.image, item.image],
    });
  };

  const handleGoBack = () => {
    router.replace('/home/bookings' as any);
  };

  const handleExplorePress = () => {
    if (onExploreServices) {
      onExploreServices();
    } else {
      router.push('/home/explore' as any);
    }
  };

  const handleCardPress = (item: (typeof YOU_MIGHT_LIKE_ITEMS)[0]) => {
    router.push({
      pathname: '/professional/style-details',
      params: {
        id: item.id,
        name: item.name,
        title: item.name,
        price: item.price,
        rating: item.rating,
      },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Page Header (Figma: height 64px, borderBottom 1px) ── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeftIcon size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Wishlist</Text>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={() =>
            shareStore.openShare({
              title: 'Trend Services',
              url: 'https://trend.app/wishlist',
              status: 'Available',
              statusColor: 'rgba(12, 121, 12, 0.96)',
              avatar: require('../../../assets/images/services/men_haircut.png'),
            })
          }
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ShareIcon size={24} />
        </TouchableOpacity>
      </View>

      {/* ── Scrollable Body ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 24 },
        ]}
      >
        {/* ── Empty State Hero Section ── */}
        <View style={styles.emptyHeroSection}>
          {/* Stacked Cards Heart Illustration */}
          <EmptyWishlistIllustration size={160} />

          {/* Texts */}
          <View style={styles.textGroup}>
            <Text style={styles.emptyTitleText}>No added favourite item</Text>
            <Text style={styles.emptySubtitleText}>
              If you Like any services, you'll find it saved here.
            </Text>
          </View>

          {/* Primary Action Button: Explore Services */}
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.85}
            onPress={handleExplorePress}
          >
            <Text style={styles.actionButtonText}>Explore Services</Text>
          </TouchableOpacity>
        </View>

        {/* ── "You Might Like" Section ── */}
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionHeading}>You Might Like</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollList}
          >
            {YOU_MIGHT_LIKE_ITEMS.map((item) => {
              const isFav = isFavorite(item.id);

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.servicePromoCard}
                  activeOpacity={0.85}
                  onPress={() => handleCardPress(item)}
                >
                  {/* Card Thumbnail (192x192, radius 24px) */}
                  <View style={styles.cardImageWrapper}>
                    <SafeImage
                      source={item.image}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />

                    {/* Top-Left: Popular Pill Tag */}
                    <View style={styles.popularTagPill}>
                      <Text style={styles.popularTagText}>Popular</Text>
                    </View>

                    {/* Top-Right: Heart Favorite Button */}
                    <TouchableOpacity
                      style={styles.bookmarkButton}
                      activeOpacity={0.7}
                      onPress={() => handleToggleFavorite(item)}
                    >
                      <HeartOutlineIcon size={18} color={isFav ? '#FF3B30' : '#FFFFFF'} />
                    </TouchableOpacity>
                  </View>

                  {/* Card Details */}
                  <View style={styles.cardDetailsColumn}>
                    {/* Title + Star Rating */}
                    <View style={styles.titleRatingRow}>
                      <Text style={styles.cardTitleText} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={styles.ratingBadge}>
                        <GoldStarSmallIcon size={14} />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                      </View>
                    </View>

                    {/* Price */}
                    <View style={styles.priceTagRow}>
                      <Text style={styles.priceText}>{item.price}</Text>
                    </View>

                    {/* Location */}
                    <View style={styles.locationRow}>
                      <MapPinSmallIcon size={14} />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {item.location}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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

  // ── Header ──
  headerRow: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
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

  // ── Scroll Content ──
  scrollContent: {
    paddingTop: 24,
    gap: 36,
  },

  // ── Empty Hero Section ──
  emptyHeroSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },
  illustrationContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circleBackdrop: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(245, 246, 248, 0.95)',
  },
  stackedCard: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 20,
    backgroundColor: 'rgba(235, 238, 242, 0.8)',
  },
  stackedCardLeft: {
    transform: [{ rotate: '-12deg' }],
    left: 28,
    top: 36,
  },
  stackedCardRight: {
    transform: [{ rotate: '10deg' }],
    right: 28,
    top: 38,
  },
  mainCard: {
    width: 96,
    height: 96,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.16)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
  },

  // ── Texts ──
  textGroup: {
    alignItems: 'center',
    gap: 8,
    maxWidth: 340,
  },
  emptyTitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  emptySubtitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },

  // ── Primary Button ──
  actionButton: {
    width: 260,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  actionButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },

  // ── Recommendations Section ──
  recommendationsSection: {
    gap: 16,
    paddingLeft: 16,
  },
  sectionHeading: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
  },
  horizontalScrollList: {
    paddingRight: 16,
    gap: 16,
  },
  servicePromoCard: {
    width: 208,
    borderRadius: 16,
    padding: 8,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  cardImageWrapper: {
    width: 192,
    height: 192,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  popularTagPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(229, 229, 229, 0.85)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(248, 249, 250, 0.98)',
  },
  popularTagText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Card Details ──
  cardDetailsColumn: {
    gap: 6,
    paddingHorizontal: 4,
  },
  titleRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitleText: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 15,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  priceTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.4,
    color: '#000000',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  locationText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
});

export default EmptyWishlistScreen;
