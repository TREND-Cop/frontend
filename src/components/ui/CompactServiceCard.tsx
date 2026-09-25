import React from 'react';
import { Platform, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Star, MapPin, User } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { SafeImage } from './SafeImage';

export interface CompactServiceCardProps {
  title: string;
  price: number;
  location: string;
  rating: number;
  gender: string;
  image: any;
  onPress?: () => void;
}

export function CompactServiceCard({
  title,
  price,
  location,
  rating,
  gender,
  image,
  onPress,
}: CompactServiceCardProps) {
  const formattedPrice = `₦${price.toLocaleString()}`;

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={onPress}>
      <SafeImage 
        source={image} 
        style={styles.image} 
      />
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        
        <View style={styles.row}>
          <Text style={styles.price}>{formattedPrice}</Text>
          <View style={styles.dot} />
          <MapPin size={14} color={theme.colors.barberPrimarySupport} />
          <Text style={styles.subText}>{location}</Text>
        </View>

        <View style={styles.row}>
          <Star size={14} color={theme.colors.tertiaryVibrant} fill={theme.colors.tertiaryVibrant} />
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          <User size={14} color={theme.colors.barberPrimarySupport} style={{ marginLeft: 12 }} />
          <Text style={styles.subText}>{gender}</Text>
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
    gap: 16,
    marginBottom: 0,
    ...theme.shadows.complexCard,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    ...theme.typography.serviceName,
    color: theme.colors.barberPrimary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    ...theme.typography.priceTag,
    color: theme.colors.barberPrimarySupport,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0D0D0',
    marginHorizontal: 4,
  },
  subText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 13,
    color: theme.colors.barberPrimarySupport,
  },
  ratingText: {
    ...theme.typography.ratingNumber,
    color: theme.colors.barberPrimarySupport,
  },
});
