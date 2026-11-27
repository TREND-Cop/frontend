import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { StaffNotificationDetailScreen } from '../../screens/staff/notifications/StaffNotificationDetailScreen';

export default function StaffNotificationDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <StaffNotificationDetailScreen id={id || ''} />;
}

