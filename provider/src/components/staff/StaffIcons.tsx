import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

/**
 * 1:1 Figma Vector Arrow Left (48x48 touch target, 24x24 icon)
 */
export function ArrowLeft02Icon({
  size = 24,
  color = 'rgba(0, 8, 20, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.57 5.93L3.5 12L9.57 18.07"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.5 12H3.67"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma store-02 Vector Icon (20x20)
 *
 * Vector coordinates from CSS spec:
 * - Roof: top 12.5%, bottom 58.33%, left 8.33%, right 8.33%
 * - Body: top 41.67%, bottom 12.5%, left 14.58%, right 14.58%
 * - Door: top 75%, bottom 25%, left 33.33%, right 33.33%
 */
export function Store02Icon({
  size = 20,
  color = 'rgba(192, 192, 204, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      {/* Roof Awning */}
      <Path
        d="M2.5 7.5L3.8 2.5H16.2L17.5 7.5H2.5Z"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Scallops/Awning lines */}
      <Path
        d="M6 2.5V7.5M10 2.5V7.5M14 2.5V7.5"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      {/* Base Store walls */}
      <Path
        d="M3.5 7.5V17.5H16.5V7.5"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Door */}
      <Path
        d="M7.5 17.5V12.5H12.5V17.5"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma user-group-03 Vector Icon (24x24)
 *
 * Vector coordinates from CSS spec:
 * - Center head: cx=12, cy=8, r=3.5
 * - Center body: M6.5 20v-1a5.5 5.5 0 0111 0v1
 * - Left & Right heads and bodies in perspective
 */
export function UserGroup03Icon({
  size = 24,
  color = '#FFFFFF',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Center user head */}
      <Circle cx="12" cy="7.5" r="3.25" stroke={color} strokeWidth={1.5} />
      {/* Center user body */}
      <Path
        d="M6 20.5v-1.5C6 16.24 8.69 14 12 14s6 2.24 6 5v1.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Left user head */}
      <Path
        d="M7 5.5A2.75 2.75 0 004.5 8"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Left user body */}
      <Path
        d="M2.5 19v-0.75a4.75 4.75 0 013.75-4.65"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Right user head */}
      <Path
        d="M17 5.5A2.75 2.75 0 0119.5 8"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Right user body */}
      <Path
        d="M17.75 13.6a4.75 4.75 0 013.75 4.65V19"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}
