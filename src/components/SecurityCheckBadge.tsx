import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface SecurityCheckBadgeProps {
  size?: number;
}

/**
 * Pixel-exact Security Check Shield Badge from Figma:
 * Blue shield shape tapering to a bottom point with white checkmark.
 */
export const SecurityCheckBadge: React.FC<SecurityCheckBadgeProps> = ({ size = 32 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Shield Outer Path */}
      <Path
        d="M16 2.5C22.5 2.5 27 4.5 27 12.5C27 20.5 19.5 27.5 16 29.5C12.5 27.5 5 20.5 5 12.5C5 4.5 9.5 2.5 16 2.5Z"
        fill="rgba(26, 130, 255, 0.9)"
        stroke="rgba(26, 130, 255, 0.9)"
        strokeWidth={1}
      />
      {/* White Checkmark */}
      <Path
        d="M10.5 15.5L14 19L21.5 11.5"
        stroke="#FFFFFF"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default SecurityCheckBadge;
