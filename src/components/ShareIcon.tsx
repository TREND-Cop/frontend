import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ShareIconProps {
  size?: number;
  color?: string;
  stroke?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

/**
 * Universal Share Icon according to Figma spec (share-03):
 * Upward arrow coming out of a rounded tray container.
 */
export const ShareIcon: React.FC<ShareIconProps> = ({
  size = 24,
  color,
  stroke,
  width,
  height,
  strokeWidth = 1.8,
}) => {
  const iconSize = width ?? size;
  const iconHeight = height ?? size;
  const iconColor = color ?? stroke ?? '#141B34';

  return (
    <Svg width={iconSize} height={iconHeight} viewBox="0 0 24 24" fill="none">
      {/* Outer Tray / Box Container */}
      <Path
        d="M4 12V18C4 19.6569 5.34315 21 7 21H17C18.6569 21 20 19.6569 20 18V12"
        stroke={iconColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arrow Stem */}
      <Path
        d="M12 15V3"
        stroke={iconColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arrow Head */}
      <Path
        d="M7.5 7.5L12 3L16.5 7.5"
        stroke={iconColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ShareIcon;
