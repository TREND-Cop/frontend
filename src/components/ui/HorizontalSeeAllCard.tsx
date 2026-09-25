import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Heart, MapPin } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeImage } from './SafeImage';
import { theme } from '../../constants/theme';

const GoldStarIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L14.85 7.78L21.22 8.71L16.61 13.2L17.7 19.54L12 16.55L6.3 19.54L7.39 13.2L2.78 8.71L9.15 7.78L12 2Z"
      fill="rgba(248, 155, 24, 0.96)"
    />
  </Svg>
);

export interface HorizontalSeeAllCardProps {
  item: any;
  onPress?: () => void;
  showFavorite?: boolean;
}

export const HorizontalSeeAllCard = ({ item, onPress, showFavorite }: HorizontalSeeAllCardProps) => {
  // Gracefully handle slightly different data structures
  const rawLocation = item.providerLocation || item.location || 'Wuse 2, Abuja';
  const location = rawLocation.includes('Abuja') ? rawLocation : `${rawLocation}, Abuja`;
  const rating = item.rating !== undefined ? item.rating : 4.8;
  const price = item.price;
  const title = item.title;
  const image = item.image;
  const isFavoriteVisible = showFavorite !== undefined ? showFavorite : !!item.favoriteIcon;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.imageContainer}>
        <View style={styles.imageWrapper}>
          <SafeImage source={image} style={styles.image} resizeMode="cover" />
        </View>
        {isFavoriteVisible && (
          <TouchableOpacity style={styles.favoriteButton}>
            <Heart size={20} color="rgba(247, 247, 247, 0.98)" fill="rgba(192, 192, 204, 0.96)" strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        {/* Row 1: Title */}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>

        {/* Row 2: Location */}
        <View style={styles.locationContainer}>
          <MapPin size={16} color="rgba(192, 192, 204, 0.96)" />
          <Text style={styles.locationText} numberOfLines={1}>{location}</Text>
        </View>

        {/* Row 3: Price & Rating */}
        <View style={styles.priceRatingRow}>
          {price !== undefined ? (
            <Text style={styles.price}>
              {typeof price === 'number' ? `₦${price.toLocaleString()}` : price}
            </Text>
          ) : (
            <View />
          )}

          {rating !== undefined && (
            <View style={styles.ratingBadge}>
              <GoldStarIcon size={20} />
              <Text style={styles.ratingText}>{Number(rating).toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 124,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
  },
  imageContainer: {
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
    position: 'relative',
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 4, 
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  infoContainer: {
    flex: 1,
    height: 92,
    justifyContent: 'space-between',
  },
  title: {
    ...theme.typography.serviceName,
    color: theme.colors.barberPrimary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 28,
  },
  locationText: {
    ...theme.typography.supportText,
    color: theme.colors.barberPrimarySupport,
  },
  priceRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 24,
    gap: 8,
  },
  price: {
    ...theme.typography.priceTag,
    color: theme.colors.barberPrimarySupport,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 20,
  },
  ratingText: {
    ...theme.typography.ratingNumber,
    color: theme.colors.barberPrimarySupport,
  },
});
