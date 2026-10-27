import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ImageViewerScreen } from '../../screens/notifications';

export default function NotificationViewerRoute() {
  const { id, index } = useLocalSearchParams<{ id: string; index?: string }>();
  const parsedIndex = index ? parseInt(index, 10) : 0;

  return (
    <ImageViewerScreen
      id={id || ''}
      initialIndex={isNaN(parsedIndex) ? 0 : parsedIndex}
    />
  );
}
