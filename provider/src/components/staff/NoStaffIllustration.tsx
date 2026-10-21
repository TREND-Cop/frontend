import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

interface NoStaffIllustrationProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

/**
 * 1:1 "No Staff Found" Illustration (Frame 1000006541 / Rectangle 283)
 * Exact Figma graphic: overlapping tilted card with user silhouette inside soft circular container.
 */
export function NoStaffIllustration({ size = 150, style }: NoStaffIllustrationProps) {
  return (
    <Image
      source={require('../../../assets/images/staff/no_staff_illustration.png')}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}

export default NoStaffIllustration;

