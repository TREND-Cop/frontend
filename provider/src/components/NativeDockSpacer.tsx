import React from 'react';
import { View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface NativeDockSpacerProps {
  backgroundColor?: string;
  minHeight?: number;
}

/**
 * NativeDockSpacer — Solid bottom barrier matching screen background.
 *
 * Guarantees that scrollable screens and card lists never bleed or scroll underneath
 * the Android 3-button navigation dock (◁ ○ □) or iOS home bar on native builds.
 */
export const NativeDockSpacer: React.FC<NativeDockSpacerProps> = ({
  backgroundColor = '#FFFFFF',
  minHeight,
}) => {
  const insets = useSafeAreaInsets();
  const defaultMin = Platform.OS === 'android' ? 56 : 0;
  const effectiveMin = minHeight !== undefined ? minHeight : defaultMin;
  const height = Math.max(insets.bottom, effectiveMin);

  if (height <= 0) return null;

  return <View style={{ height, backgroundColor, width: '100%' }} pointerEvents="none" />;
};

export default NativeDockSpacer;
