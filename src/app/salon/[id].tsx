import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SalonDetailScreen } from '../../screens/salon/SalonDetailScreen';
import { SalonLocationScreen } from '../../screens/salon/SalonLocationScreen';
import { SalonAboutScreen } from '../../screens/salon/SalonAboutScreen';

export default function SalonRoute() {
  const { id } = useLocalSearchParams();
  if (id === 'location') {
    return <SalonLocationScreen />;
  }
  if (id === 'about') {
    return <SalonAboutScreen />;
  }
  return <SalonDetailScreen salonId={id as string} />;
}
