import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { StaffImageViewerScreen } from '../../screens/staff/notifications/StaffImageViewerScreen';

export default function StaffImageViewerRoute() {
  const { id, index } = useLocalSearchParams<{ id: string; index?: string }>();
  const initialIndex = index ? parseInt(index, 10) : 0;
  return <StaffImageViewerScreen id={id || ''} initialIndex={initialIndex} />;
}

