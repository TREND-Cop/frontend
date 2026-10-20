import React from 'react';
import Svg, { Rect, Circle, Path } from 'react-native-svg';

/**
 * 1:1 "No Staff Found" Illustration (Frame M1 / Rectangle 283)
 * Reused from the service wizard's Add Staff step per spec.
 */
export function NoStaffIllustration({ size = 120 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 150 150" fill="none">
      {/* Background soft shadow card */}
      <Rect x="20" y="10" width="110" height="110" rx="24" fill="#F2F4F7" />
      {/* Middle card */}
      <Rect x="25" y="15" width="100" height="100" rx="22" fill="#E4E7EC" />
      {/* Front primary card */}
      <Rect x="30" y="20" width="90" height="90" rx="20" fill="#EAECF0" />
      {/* User Avatar Silhouette */}
      <Circle cx="75" cy="54" r="16" fill="#98A2B3" />
      <Path
        d="M51 92c0-8 6-16 24-16s24 8 24 16"
        fill="#98A2B3"
      />
    </Svg>
  );
}

export default NoStaffIllustration;
