import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

/**
 * 1:1 Figma Vector for message-circle-plus (Node 6750:47816 / 6750:47820)
 */
export function MessageCirclePlusIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21.4961 12C21.4961 17.2467 17.2428 21.5 11.9961 21.5C10.368 21.5 8.83549 21.0904 7.49609 20.3687C5.62786 19.362 4.37071 20.2979 3.26202 20.4658C3.09383 20.4913 2.92634 20.4302 2.80606 20.31C2.6235 20.1274 2.58875 19.8451 2.6896 19.6074C3.12475 18.5818 3.5243 16.6382 2.9795 15C2.6659 14.057 2.49609 13.0483 2.49609 12C2.49609 6.75329 6.74939 2.5 11.9961 2.5C17.2428 2.5 21.4961 6.75329 21.4961 12Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.4961 12H11.9961M11.9961 12H8.49609M11.9961 12V8.5M11.9961 12V15.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma Vector for search icon (lucide/search Node 2139:16057)
 */
export function SearchIcon({ size = 24, color = '#000000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 21L16.66 16.66M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma Vector for back button circle 48x48 (arrow-left-02 Node 6750:49862)
 */
export function ArrowLeftCircleButton({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Rect width="48" height="48" rx="24" fill="#F7F7F7" fillOpacity="0.96" />
      <Rect
        x="0.5"
        y="0.5"
        width="47"
        height="47"
        rx="23.5"
        stroke="#C0C0CC"
        strokeOpacity="0.96"
      />
      <Path
        d="M17.5 24.002H31"
        stroke="#000814"
        strokeOpacity="0.96"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22.9999 30.002C22.9999 30.002 17 25.583 17 24.0019C17 22.4208 23 18.002 23 18.002"
        stroke="#000814"
        strokeOpacity="0.96"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Simple 24x24 arrow left icon for page headers
 */
export function SimpleArrowLeftIcon({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.5 12.002H16.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.25 15.002C12.25 15.002 9.25 12.792 9.25 12.0019C9.25 11.2118 12.25 9.002 12.25 9.002"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
