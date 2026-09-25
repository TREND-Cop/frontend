import React from 'react';
import { Platform, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { SafeImage } from './SafeImage';

const CARD_WIDTH = 239;

export interface DiscountServiceCardProps {
  title: string;
  price: number | string;
  originalPrice?: number | string;
  rating?: number;
  image: any;
  onPress?: () => void;
}

export function DiscountServiceCard({
  title,
  price,
  originalPrice,
  rating,
  image,
  onPress,
}: DiscountServiceCardProps) {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.imageWrapper}>
        <SafeImage 
          source={image} 
          style={styles.image} 
        />
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {rating !== undefined && (
            <View style={styles.ratingContainer}>
              <Star size={14} color={theme.colors.tertiaryVibrant} fill={theme.colors.tertiaryVibrant} />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {typeof price === 'number' ? `₦${price.toLocaleString()}` : price}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    padding: 0,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 234,
    borderRadius: 24,
    marginBottom: 16, // Figma: Frame 1000005859 gap: 16px
    backgroundColor: '#FFFFFF', // Need bg for shadow to render properly
    ...theme.shadows.complexCard,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  content: {
    paddingHorizontal: 0,
    paddingBottom: 0,
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...theme.typography.serviceName,
    color: theme.colors.barberPrimary,
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...theme.typography.ratingNumber,
    color: theme.colors.barberPrimarySupport,
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    ...theme.typography.priceTag,
    color: theme.colors.barberPrimarySupport,
  },
  originalPrice: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    color: theme.colors.barberPrimarySupport,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
});
