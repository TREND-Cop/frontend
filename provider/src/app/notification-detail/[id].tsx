import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { NotificationDetailScreen } from '../../screens/notifications';

export default function NotificationDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <NotificationDetailScreen id={id || ''} />;
}
