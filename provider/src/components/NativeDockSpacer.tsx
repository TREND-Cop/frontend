import React from 'react';
import { View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNativeDock } from '../utils/useNativeDock';

export interface NativeDockSpacerProps {
  backgroundColor?: string;
  minHeight?: number;
}

/**
 * NativeDockSpacer — Solid bottom barrier matching screen background.
 *
 * Guarantees that scrollable screens and card lists never bleed or scroll underneath
 * the Android 3-button navigation dock (◁ ○ □) or iOS home bar on native builds.
 * When gesture navigation is used (no dock), renders null so the screen is completely full.
 */
export const NativeDockSpacer: React.FC<NativeDockSpacerProps> = ({
  backgroundColor = '#FFFFFF',
  minHeight,
}) => {
  const insets = useSafeAreaInsets();
  const { hasDock, dockHeight } = useNativeDock();

  // On Android, only render barrier when there is an active 3-button dock or minHeight specified
  if (Platform.OS === 'android') {
    if (!hasDock && (!minHeight || minHeight <= 0)) {
      return null;
    }
    const androidHeight = Math.max(insets.bottom, dockHeight, 48, minHeight ?? 0);
    return <View style={{ height: androidHeight, backgroundColor, width: '100%' }} pointerEvents="none" />;
  }

  if (!hasDock && (!minHeight || minHeight <= 0)) {
    return null;
  }

  const height = minHeight !== undefined ? Math.max(dockHeight, minHeight) : dockHeight;
  if (height <= 0) return null;

  return <View style={{ height, backgroundColor, width: '100%' }} pointerEvents="none" />;
};

export default NativeDockSpacer;
