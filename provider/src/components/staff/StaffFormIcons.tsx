import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

/**
 * 1:1 Figma alert-02 Warning Icon (20x20)
 * CSS: border: 1.5px solid rgba(248, 155, 24, 0.96)
 */
export function Alert02WarningIcon({
  size = 20,
  color = 'rgba(248, 155, 24, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="7.5" stroke={color} strokeWidth={1.5} />
      <Path
        d="M10 6.5v4"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Circle cx="10" cy="13.5" r="0.8" fill={color} />
    </Svg>
  );
}

/**
 * 1:1 Figma user-02 Icon (20x20)
 * Used for "Staff Full Name"
 */
export function User02Icon({
  size = 20,
  color = 'rgba(96, 96, 102, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="6.5" r="3.5" stroke={color} strokeWidth={1.5} />
      <Path
        d="M3.5 17c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma briefcase-06 Icon (20x20)
 * Used for "Staff Role"
 */
export function Briefcase06Icon({
  size = 20,
  color = 'rgba(96, 96, 102, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M7 2.5h6a1.5 1.5 0 011.5 1.5V5H5.5V4A1.5 1.5 0 017 2.5z"
        stroke={color}
        strokeWidth={1.5}
      />
      <Rect x="2.5" y="5" width="15" height="12.5" rx="2.5" stroke={color} strokeWidth={1.5} />
      <Path d="M2.5 9.5h15" stroke={color} strokeWidth={1.5} />
      <Path d="M9.5 9.5h1" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

/**
 * 1:1 Figma ai-brain-01 Icon (20x20)
 * Used for "Staff Experience"
 */
export function AiBrain01Icon({
  size = 20,
  color = 'rgba(96, 96, 102, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 2.5c-4.14 0-7.5 3.36-7.5 7.5 0 2.5 1.25 4.7 3.16 6 .22.15.34.4.34.67V17.5h8v-.83c0-.27.12-.52.34-.67A7.48 7.48 0 0017.5 10c0-4.14-3.36-7.5-7.5-7.5z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 2.5v15M6.5 6.5C6.5 8 8 9 10 9s3.5-1 3.5-2.5M6 13c1 1 2.3 1.5 4 1.5s3-.5 4-1.5"
        stroke={color}
        strokeWidth={1.3}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma work-history Icon (20x20)
 * Used for "Work Hours"
 */
export function WorkHistoryIcon({
  size = 20,
  color = 'rgba(96, 96, 102, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="7.5" stroke={color} strokeWidth={1.5} />
      <Path
        d="M10 6v4.5l3 1.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma dish-01 Icon (20x20)
 * Used for "Break Time"
 */
export function Dish01Icon({
  size = 20,
  color = 'rgba(96, 96, 102, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M2.5 14.5h15M4 14.5c.5 2 2.5 3 6 3s5.5-1 6-3M10 2.5v3M4 11.5c1-4.5 4-6 6-6s5 1.5 6 6H4z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma calendar-clock Icon (20x20)
 * Used for "Work Days"
 */
export function CalendarClockIcon({
  size = 20,
  color = 'rgba(96, 96, 102, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Rect x="2.5" y="4" width="15" height="13.5" rx="2.5" stroke={color} strokeWidth={1.5} />
      <Path d="M2.5 8h15M6.5 2v3M13.5 2v3" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Circle cx="13" cy="13" r="3.5" stroke={color} strokeWidth={1.3} fill="#FFFFFF" />
      <Path d="M13 11.5v1.5l1 .5" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  );
}

/**
 * 1:1 Figma camera-01 Icon (24x24 / 20x20)
 */
export function Camera01Icon({
  size = 24,
  color = '#141B34',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 8a2 2 0 012-2h2.5l1.5-2h6l1.5 2H19a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 16.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="17.5" cy="9.5" r="0.75" fill={color} />
    </Svg>
  );
}

/**
 * 1:1 Figma arrow-down-01 Chevron Icon (24x24)
 */
export function ArrowDown01Icon({
  size = 24,
  color = 'rgba(0, 8, 20, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9l6 6 6-6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma arrow-right-01 Chevron Icon (24x24)
 */
export function ArrowRight01Icon({
  size = 24,
  color = '#141B34',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18l6-6-6-6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma clock-hour-3 Icon (24x24)
 */
export function ClockHour3Icon({
  size = 24,
  color = '#141B34',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth={1.5} />
      <Path
        d="M12 6.5v5.5h4"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma calendar-days Icon (24x24)
 */
export function CalendarDaysIcon({
  size = 24,
  color = '#141B34',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="17" rx="3" stroke={color} strokeWidth={1.5} />
      <Path d="M3 9h18M8 2v4M16 2v4" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Circle cx="8" cy="13" r="1" fill={color} />
      <Circle cx="12" cy="13" r="1" fill={color} />
      <Circle cx="16" cy="13" r="1" fill={color} />
      <Circle cx="8" cy="17" r="1" fill={color} />
      <Circle cx="12" cy="17" r="1" fill={color} />
    </Svg>
  );
}

/**
 * 1:1 Figma shield-check Outline Icon (24x24)
 * Used in non-tappable verification status row
 */
export function ShieldCheckOutlineIcon({
  size = 24,
  color = '#141B34',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.5s7.5 2 7.5 7.5c0 5.5-4.5 9-7.5 10.5C9 20 4.5 16.5 4.5 11 4.5 5.5 12 3.5 12 3.5z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.5 11.5l2.5 2.5 5-5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma Blue Verified Badge Icon (20x20 / 24x24)
 * Filled shield with white checkmark matching D2 & banner illustration
 */
export function BlueVerifiedBadgeIcon({
  size = 20,
}: {
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 2.5s6.5 1.5 6.5 6c0 4.5-3.8 7.5-6.5 9C7.3 16 3.5 13 3.5 8.5c0-4.5 6.5-6 6.5-6z"
        fill="rgba(26, 130, 255, 0.9)"
        stroke="rgba(26, 130, 255, 0.9)"
        strokeWidth={1.2}
      />
      <Path
        d="M7 9.5l2 2 4.5-4.5"
        stroke="#FFFFFF"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma square-lock-02 Icon (16x16)
 * Used inside the "Off Duty" red status toggle pill on StaffDetailScreen
 */
export function SquareLock02Icon({
  size = 16,
  color = 'rgba(204, 41, 41, 0.9)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M5 6V4.5a3 3 0 016 0V6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect
        x="2.67"
        y="6"
        width="10.66"
        height="8.67"
        rx="2"
        stroke={color}
        strokeWidth={1.5}
      />
      <Path
        d="M8 9.67V11"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}


