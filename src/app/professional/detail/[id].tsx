import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SalonDetailScreen } from '../../../screens/salon/SalonDetailScreen';

export default function ServiceDetailRoute() {
  const { id } = useLocalSearchParams();
  return <SalonDetailScreen salonId={id as string} />;
}
