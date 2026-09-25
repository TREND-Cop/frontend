import React from 'react';
import { Platform, View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Dimensions } from 'react-native';
import { Star, MapPin } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { SafeImage } from './SafeImage';

export interface RankedPlaceCardProps {
  rank: number;
  title: string;
  categories: string;
  rating: number;
  location: string;
  image: any;
  onPress?: () => void;
  style?: any;
}

export function RankedPlaceCard({
  rank,
  title,
  categories,
  rating,
  location,
  image,
  onPress,
  style,
}: RankedPlaceCardProps) {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min((windowWidth || Dimensions.get('window').width || 390) - 48, 420);

  return (
    <TouchableOpacity style={[styles.container, { width: cardWidth }, style]} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.imageContainer}>
        <SafeImage 
          source={image} 
          style={styles.image} 
        />
        {/* Rank Badge */}
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{rank}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.categoriesText} numberOfLines={1}>{categories}</Text>
        
        <View style={styles.row}>
          <Star size={14} color={theme.colors.tertiaryVibrant} fill={theme.colors.tertiaryVibrant} />
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          <MapPin size={14} color={theme.colors.barberPrimarySupport} style={{ marginLeft: 16 }} />
          <Text style={styles.subText}>{location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    padding: 16,
    minHeight: 112,
    ...theme.shadows.complexCard,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  rankBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1.5,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: '#FFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_700Bold',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  title: {
    ...theme.typography.serviceName,
    color: theme.colors.barberPrimary,
  },
  categoriesText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 13,
    color: theme.colors.barberPrimarySupport,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.barberPrimary,
    marginLeft: 8,
  },
  subText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 13,
    color: theme.colors.barberPrimarySupport,
    marginLeft: 8,
  },
});
