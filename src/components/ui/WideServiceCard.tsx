import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { User } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { SafeImage } from './SafeImage';

export interface WideServiceCardProps {
  image: any;
  title: string;
  price: string;
  audience?: string;
  onPress: () => void;
  style?: ViewStyle;
}

export const WideServiceCard = ({
  image,
  title,
  price,
  audience,
  onPress,
  style,
}: WideServiceCardProps) => {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.8}>
      <SafeImage 
        source={image} 
        style={styles.image} 
        resizeMode="cover" 
      />
      
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        
        <Text style={styles.price}>{price}</Text>
        
        {audience && (
          <View style={styles.metadataRow}>
            <User size={14} color={theme.colors.barberPrimarySupport} />
            <Text style={styles.metadataText}>{audience}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 0,
    width: '100%',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    ...theme.typography.serviceName,
    color: theme.colors.barberPrimary,
  },
  price: {
    ...theme.typography.priceTag,
    color: theme.colors.barberPrimarySupport,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  metadataText: {
    ...theme.typography.caption,
    color: theme.colors.barberPrimarySupport,
  },
});
