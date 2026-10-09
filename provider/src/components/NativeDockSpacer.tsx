import React from 'react';
import { View } from 'react-native';
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
  const { hasDock, dockHeight } = useNativeDock();

  if (!hasDock && (!minHeight || minHeight <= 0)) {
    return null;
  }

  const height = minHeight !== undefined ? Math.max(dockHeight, minHeight) : dockHeight;
  if (height <= 0) return null;

  return <View style={{ height, backgroundColor, width: '100%' }} pointerEvents="none" />;
};

export default NativeDockSpacer;
