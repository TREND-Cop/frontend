import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Briefcase, Building2, Star, User } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { SafeImage } from './SafeImage';

export interface ProfessionalCardProps {
  name: string;
  image: any;
  experience: string;
  workplace: string;
  rating: number;
  reviewsCount: string;
  isAvailable?: boolean;
  onPress?: () => void;
}

export const ProfessionalCard = ({
  name,
  image,
  experience,
  workplace,
  rating,
  reviewsCount,
  isAvailable = true,
  onPress,
}: ProfessionalCardProps) => {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.imageContainer}>
        <SafeImage 
          source={image} 
          style={styles.image} 
        />
        {isAvailable && (
          <View style={styles.availabilityBadgeContainer} pointerEvents="none">
            <View style={styles.availabilityBadge}>
              <Briefcase size={10} color={theme.colors.successVibrant} strokeWidth={2} />
              <Text style={styles.availabilityText}>Available</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{name}</Text>
        
        <View style={styles.detailsRow}>
          <Briefcase size={14} color={theme.colors.barberPrimarySupport} />
          <Text style={styles.detailText}>{experience}</Text>
          <View style={styles.dot} />
          <Building2 size={14} color={theme.colors.barberPrimarySupport} />
          <Text style={styles.detailText}>{workplace}</Text>
        </View>

        <View style={styles.statsRow}>
          <Star size={16} color={theme.colors.lightBrown} fill={theme.colors.lightBrown} />
          <Text style={styles.statText}>{rating.toFixed(1)}</Text>
          <User size={14} color={theme.colors.barberPrimarySupport} style={{ marginLeft: 12 }} />
          <Text style={styles.detailText}>{reviewsCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FAFAFA', // Light grey background
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 0,
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  availabilityBadgeContainer: {
    position: 'absolute',
    bottom: -6,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    gap: 4,
  },
  availabilityText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.2,
    color: theme.colors.successVibrant,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  name: {
    ...theme.typography.bodyRegular,
    fontWeight: '500',
    color: theme.colors.barberPrimary,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 13,
    color: theme.colors.barberPrimarySupport,
    marginLeft: 6,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0D0D0',
    marginHorizontal: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
    fontWeight: '400',
    color: theme.colors.barberPrimarySupport,
    marginLeft: 6,
  },
});
