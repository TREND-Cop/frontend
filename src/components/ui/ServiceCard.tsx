import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, Platform } from 'react-native';
import { MapPin, User, Star } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { SafeImage } from './SafeImage';

export interface ServiceCardProps {
  id?: string;
  image: any;
  title: string;
  price: number | string;
  rating?: number;
  providerName?: string;
  providerLocation?: string;
  audience?: string;
  badge?: 'popular' | 'top_choices' | string | null;
  favoriteIcon?: boolean;
  onFavoritePress?: () => void;
  onPress: () => void;
  style?: ViewStyle;
}

export const ServiceCard = ({
  id,
  image,
  title,
  price,
  rating,
  providerName,
  providerLocation,
  audience,
  badge,
  onPress,
  style,
}: ServiceCardProps) => {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.8}>
      {/* Outer White Image Frame (with 24px radius and shadow) */}
      <View style={styles.outerFrame}>
        {/* Inner Image Frame */}
        <View style={styles.innerFrame}>
          <SafeImage 
            source={image} 
            style={styles.image} 
            resizeMode="cover" 
          />
        </View>

        {/* ── 1:1 Figma Image Tag Badge (left: 16px, top: 16px, height: 28px) ── */}
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {badge === 'popular' ? 'Popular' : badge === 'top_choices' ? 'Top Choices' : badge}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {rating !== undefined && (
            <View style={styles.ratingRow}>
              <Star size={14} color={theme.colors.lightBrown} fill={theme.colors.lightBrown} />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{typeof price === 'number' ? `₦${price.toLocaleString()}` : price}</Text>
        </View>

        <View style={styles.metadataRow}>
          {providerLocation && (
            <View style={styles.metadataItem}>
              <MapPin size={12} color={theme.colors.barberPrimarySupport} />
              <Text style={styles.metadataText} numberOfLines={1}>
                {providerName ? `${providerName}, ` : ''}{providerLocation}
              </Text>
            </View>
          )}
          {audience && (
            <View style={styles.metadataItem}>
              <User size={12} color={theme.colors.barberPrimarySupport} />
              <Text style={styles.metadataText}>{audience}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
    marginBottom: 0,
  },
  outerFrame: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...theme.shadows.complexCard,
  },
  innerFrame: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(247, 247, 247, 0.98)',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  badge: {
    position: 'absolute',
    top: 16,
    left: 16,
    height: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(248, 249, 250, 0.98)',
    backgroundColor: 'rgba(229, 229, 229, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 2,
  },
  badgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  infoContainer: {
    paddingHorizontal: 0,
    paddingBottom: 0,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    ...theme.typography.serviceName,
    color: theme.colors.barberPrimary,
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  ratingText: {
    ...theme.typography.ratingNumber,
    color: theme.colors.barberPrimarySupport,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    ...theme.typography.priceTag,
    color: theme.colors.barberPrimarySupport,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 2,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metadataText: {
    ...theme.typography.caption,
    color: theme.colors.barberPrimarySupport,
  },
});
