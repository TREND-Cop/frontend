import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

// Exact Figma Vector: Log Out Icon (24x24)
export function ProfileLogoutIcon({ size = 24, color = 'rgba(204, 41, 41, 0.9)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14.5 6C14.45 4.91 14.31 4.21 13.9 3.67C13.74 3.47 13.56 3.28 13.35 3.12C12.54 2.5 11.36 2.5 9.01 2.5H8.51C5.68 2.5 4.26 2.5 3.38 3.38C2.5 4.26 2.5 5.67 2.5 8.5V15.5C2.5 18.33 2.5 19.74 3.38 20.62C4.26 21.5 5.68 21.5 8.51 21.5H9.01C11.36 21.5 12.54 21.5 13.35 20.88C13.56 20.72 13.74 20.53 13.9 20.33C14.31 19.79 14.45 19.09 14.5 18"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.5 12H8.5M18 15.5C18 15.5 21.5 12.92 21.5 12C21.5 11.08 18 8.5 18 8.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Exact Figma Vector: User / Profile Settings (24x24)
export function ProfileUserIcon({ size = 24, color = '#C0C0CC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15.5 10.5C15.5 8.57 13.93 7 12 7C10.07 7 8.5 8.57 8.5 10.5C8.5 12.43 10.07 14 12 14C13.93 14 15.5 12.43 15.5 10.5Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18 20C18 16.69 15.31 14 12 14C8.69 14 6 16.69 6 20"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Exact Figma Vector: Location Change (24x24)
export function ProfileLocationIcon({ size = 24, color = '#C0C0CC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 18C19.24 18.42 20 18.98 20 19.59C20 20.92 16.42 22 12 22C7.58 22 4 20.92 4 19.59C4 18.98 4.76 18.42 6 18"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M15 9.5C15 11.16 13.66 12.5 12 12.5C10.34 12.5 9 11.16 9 9.5C9 7.84 10.34 6.5 12 6.5C13.66 6.5 15 7.84 15 9.5Z"
        stroke={color}
        strokeWidth={1.5}
      />
      <Path
        d="M12 2C16.06 2 19.5 5.43 19.5 9.59C19.5 13.81 16 16.78 12.77 18.79C12.54 18.93 12.27 19 12 19C11.73 19 11.46 18.93 11.23 18.79C8 16.76 4.5 13.83 4.5 9.59C4.5 5.43 7.94 2 12 2Z"
        stroke={color}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

// Exact Figma Vector: Notifications (24x24)
export function ProfileNotificationIcon({ size = 24, color = '#C0C0CC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15.5 18C15.5 19.93 13.93 21.5 12 21.5C10.07 21.5 8.5 19.93 8.5 18"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19.23 18H4.77C3.79 18 3 17.21 3 16.23C3 15.76 3.19 15.31 3.52 14.98L4.12 14.38C4.68 13.81 5 13.05 5 12.26V9.5C5 5.63 8.13 2.5 12 2.5C15.87 2.5 19 5.63 19 9.5V12.26C19 13.05 19.32 13.81 19.88 14.38L20.48 14.98C20.81 15.31 21 15.76 21 16.23C21 17.21 20.21 18 19.23 18Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Exact Figma Vector: Reset Password / Lock (24x24)
export function ProfileLockIcon({ size = 24, color = '#C0C0CC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.27 18.85C4.49 20.51 5.88 21.82 7.56 21.9C8.98 21.97 10.42 22 12 22C13.58 22 15.02 21.97 16.44 21.9C18.12 21.82 19.51 20.51 19.73 18.85C19.88 17.75 20 16.64 20 15.5C20 14.36 19.88 13.25 19.73 12.15C19.51 10.49 18.12 9.18 16.44 9.1C15.02 9.03 13.58 9 12 9C10.42 9 8.98 9.03 7.56 9.1C5.88 9.18 4.49 10.49 4.27 12.15C4.12 13.25 4 14.36 4 15.5C4 16.64 4.12 17.75 4.27 18.85Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7.5 9V6.5C7.5 4.01 9.51 2 12 2C14.49 2 16.5 4.01 16.5 6.5V9"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.13 15.5H12M12.25 15.5C12.25 15.64 12.14 15.75 12 15.75C11.86 15.75 11.75 15.64 11.75 15.5C11.75 15.36 11.86 15.25 12 15.25C12.14 15.25 12.25 15.36 12.25 15.5Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.13 15.5H8M8.25 15.5C8.25 15.64 8.14 15.75 8 15.75C7.86 15.75 7.75 15.64 7.75 15.5C7.75 15.36 7.86 15.25 8 15.25C8.14 15.25 8.25 15.36 8.25 15.5Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16.13 15.5H16M16.25 15.5C16.25 15.64 16.14 15.75 16 15.75C15.86 15.75 15.75 15.64 15.75 15.5C15.75 15.36 15.86 15.25 16 15.25C16.14 15.25 16.25 15.36 16.25 15.5Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Exact Figma Vector: Phone Number Change (24x24)
export function ProfilePhoneChangeIcon({ size = 24, color = '#C0C0CC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12.5 2H8.5L9 3H12L12.5 2Z"
        stroke={color}
        strokeOpacity={0.96}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.5 11V10C15.5 9.17157 16.1716 8.5 17 8.5C17.8284 8.5 18.5 9.17157 18.5 10V11.0003M15 15.5H19C19.5523 15.5 20 15.0523 20 14.5V12.5C20 11.9477 19.5523 11.5 19 11.5H15C14.4477 11.5 14 11.9477 14 12.5V14.5C14 15.0523 14.4477 15.5 15 15.5Z"
        stroke={color}
        strokeOpacity={0.96}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16.9974 6C16.9829 4.29344 16.8882 3.35264 16.2678 2.73223C15.5355 2 14.357 2 12 2H9C6.64298 2 5.46447 2 4.73223 2.73223C4 3.46447 4 4.64298 4 7V17C4 19.357 4 20.5355 4.73223 21.2678C5.46447 22 6.64298 22 9 22H12C14.357 22 15.5355 22 16.2678 21.2678C16.8882 20.6474 16.9829 19.7066 16.9974 18.0001"
        stroke={color}
        strokeOpacity={0.96}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Exact Figma Vector: Two Step Verification / Shield Lock (24x24)
export function ProfileShieldLockIcon({ size = 24, color = '#C0C0CC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18.71 3.5C16.82 2.55 14.5 2 12 2C9.5 2 7.18 2.55 5.29 3.5C4.36 3.96 3.9 4.19 3.45 4.91C3 5.64 3 6.34 3 7.75V11.24C3 16.92 7.54 20.08 10.17 21.43C10.91 21.81 11.27 22 12 22C12.73 22 13.09 21.81 13.83 21.43C16.46 20.08 21 16.92 21 11.24V7.75C21 6.34 21 5.64 20.55 4.91C20.1 4.19 19.64 3.96 18.71 3.5Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 10V8.5C10 7.4 10.9 6.5 12 6.5C13.1 6.5 14 7.4 14 8.5V10"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14 10H10C9.17 10 8.5 10.67 8.5 11.5V13C8.5 13.83 9.17 14.5 10 14.5H14C14.83 14.5 15.5 13.83 15.5 13V11.5C15.5 10.67 14.83 10 14 10Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Exact Figma Vector: Biometric Login / Face ID (24x24)
export function ProfileBiometricIcon({ size = 24, color = '#C0C0CC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 21.5C16.39 21.5 17.09 21.5 17.67 21.36C19.5 20.92 20.92 19.5 21.36 17.67C21.5 17.09 21.5 16.39 21.5 15M9 21.5C7.61 21.5 6.91 21.5 6.33 21.36C4.5 20.92 3.08 19.5 2.64 17.67C2.5 17.09 2.5 16.39 2.5 15M9 2.5C7.61 2.5 6.91 2.5 6.33 2.64C4.5 3.08 3.08 4.5 2.64 6.33C2.5 6.91 2.5 7.61 2.5 9M15 2.5C16.39 2.5 17.09 2.5 17.67 2.64C19.5 3.08 20.92 4.5 21.36 6.33C21.5 6.91 21.5 7.61 21.5 9"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15 9.5C15 7.84 13.66 6.5 12 6.5C10.34 6.5 9 7.84 9 9.5C9 11.16 10.34 12.5 12 12.5C13.66 12.5 15 11.16 15 9.5Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17 17.5C17 14.74 14.76 12.5 12 12.5C9.24 12.5 7 14.74 7 17.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Exact Figma Vector: Chevron Right (24x24)
export function ProfileChevronRight({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 6C9 6 15 10.419 15 12C15 13.581 9 18 9 18"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Exact Figma Vector: Sparkle Star (27x27)
export function BannerSparkle({ size = 27, color = '#FFFFFF', opacity = 1 }: { size?: number; color?: string; opacity?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 27 27" fill="none">
      <Path
        d="M13.5 0L15.438 11.562L27 13.5L15.438 15.438L13.5 27L11.562 15.438L0 13.5L11.562 11.562L13.5 0Z"
        fill={color}
        fillOpacity={opacity}
      />
    </Svg>
  );
}

// Exact Figma Vector: Stat Card Handshake Icon (Normalized 20x20 footprint)
export function StatHandshakeIcon({ size = 20, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="2.5 4.5 19 14.5" fill="none">
      <Path
        d="M20.3333 7.6247H18.0092C17.5083 7.6247 17.2578 7.6247 17.0216 7.5532C16.7855 7.4816 16.577 7.3427 16.1602 7.0648C15.535 6.648 14.8218 6.1725 14.4675 6.0653C14.1132 5.958 13.7375 5.958 12.986 5.958C11.9642 5.958 11.3055 5.958 10.8461 6.1483C10.3867 6.3386 10.0254 6.6999 9.3029 7.4225L8.667 8.0584C8.5041 8.2212 8.4227 8.3026 8.3724 8.383C8.1861 8.681 8.2067 9.0639 8.424 9.3401C8.4827 9.4146 8.5724 9.4868 8.7518 9.6312C9.4149 10.1649 10.371 10.1116 10.9715 9.5075L12 8.4729H12.8333L17.8333 13.5026C18.2935 13.9656 18.2935 14.7162 17.8333 15.1792C17.373 15.6422 16.6269 15.6422 16.1666 15.1792L15.75 14.7601M13.25 15.5984L14.0833 16.4366C14.5435 16.8996 15.2897 16.8996 15.75 16.4366C16.2102 15.9737 16.2102 15.2231 15.75 14.7601L13.25 12.2452M11.5833 13.9317L13.25 15.5984C13.7102 16.0613 13.7102 16.812 13.25 17.275C12.7897 17.7379 12.0435 17.7379 11.5833 17.275L10.3333 16.0175M3.6666 14.2913H3.9324C4.6234 14.2913 4.9688 14.2913 5.2786 14.4215C5.5883 14.5517 5.8301 14.7985 6.3136 15.2921L8.6666 17.6941C9.1269 18.1571 9.8731 18.1571 10.3333 17.6941C10.7935 17.2311 10.7935 16.4805 10.3333 16.0175L9.9166 15.5984"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M20.3333 14.292H18.25" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M9.0833 7.625H3.6666" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

// Exact Figma Vector: Stat Card Calendar Icon (Normalized 20x20 footprint)
export function StatCalendarIcon({ size = 20, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="3.5 2.5 17 19" fill="none">
      <Path d="M15.333 3.667V7.0003M8.667 3.667V7.0003" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12.833 5.333H11.167C8.024 5.333 6.453 5.333 5.476 6.3093C4.5 7.2856 4.5 8.857 4.5 11.9997V13.6663C4.5 16.809 4.5 18.3804 5.476 19.3567C6.453 20.333 8.024 20.333 11.167 20.333H12.833C15.976 20.333 17.547 20.333 18.524 19.3567C19.5 18.3804 19.5 16.809 19.5 13.6663V11.9997C19.5 8.857 19.5 7.2856 18.524 6.3093C17.547 5.333 15.976 5.333 12.833 5.333Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M4.5 10.333H19.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12.105 13.6663H12.001M12.105 16.9997H12.001M8.354 13.6663H8.25M8.354 16.9997H8.25M15.854 13.6663H15.75M12.209 13.6663C12.209 13.7814 12.116 13.8747 12.001 13.8747C11.886 13.8747 11.792 13.7814 11.792 13.6663C11.792 13.5513 11.886 13.458 12.001 13.458C12.116 13.458 12.209 13.5513 12.209 13.6663ZM12.209 16.9997C12.209 17.1148 12.116 17.208 12.001 17.208C11.886 17.208 11.792 17.1148 11.792 16.9997C11.792 16.8846 11.886 16.7913 12.001 16.7913C12.116 16.7913 12.209 16.8846 12.209 16.9997ZM8.458 13.6663C8.458 13.7814 8.365 13.8747 8.25 13.8747C8.135 13.8747 8.042 13.7814 8.042 13.6663C8.042 13.5513 8.135 13.458 8.25 13.458C8.365 13.458 8.458 13.5513 8.458 13.6663ZM8.458 16.9997C8.458 17.1148 8.365 17.208 8.25 17.208C8.135 17.208 8.042 17.1148 8.042 16.9997C8.042 16.8846 8.135 16.7913 8.25 16.7913C8.365 16.7913 8.458 16.8846 8.458 16.9997ZM15.958 13.6663C15.958 13.7814 15.865 13.8747 15.75 13.8747C15.635 13.8747 15.542 13.7814 15.542 13.6663C15.542 13.5513 15.635 13.458 15.75 13.458C15.865 13.458 15.958 13.5513 15.958 13.6663Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Exact Figma Vector: Verified Checkmark Badge (for Avatar & Subscription)
export function VerifiedCheckmarkBadge({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 1.5L14.3 3.8L17.5 3.5L18.8 6.5L21.8 7.6L21.8 10.8L23.6 13.3L21.9 16L22.6 19.2L19.5 20.5L17.7 23.2L14.5 22.6L12.2 24.7L9.9 22.6L6.7 23.2L4.9 20.5L1.8 19.2L2.5 16L0.8 13.3L2.6 10.8L2.6 7.6L5.6 6.5L6.9 3.5L10.1 3.8L12 1.5Z"
        fill="#1A82FF"
      />
      <Path
        d="M7.5 12.5L10.5 15.5L16.5 9.5"
        stroke="#FFFFFF"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Exact Figma Vector: Big Banner Hero Checkmark Badge (72x72)
export function BannerHeroBadge({ size = 72 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72" fill="none">
      <Path
        d="M36 4.5L42.9 11.4L52.5 10.5L56.4 19.5L65.4 22.8L65.4 32.4L70.8 39.9L65.7 48L67.8 57.6L58.5 61.5L53.1 69.6L43.5 67.8L36.6 74.1L29.7 67.8L20.1 69.6L14.7 61.5L5.4 57.6L7.5 48L2.4 39.9L7.8 32.4L7.8 22.8L16.8 19.5L20.7 10.5L30.3 11.4L36 4.5Z"
        fill="#1A82FF"
      />
      <Path
        d="M22.5 37.5L31.5 46.5L49.5 28.5"
        stroke="#FFFFFF"
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Exact Figma Vector: Gmail Security (24x24)
export function ProfileGmailSecurityIcon({ size = 24, color = '#C0C0CC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 5L8.91302 8.92462C11.4387 10.3585 12.5613 10.3585 15.087 8.92462L22 5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Path
        d="M12 19.5C12 19.5 10.0691 19.4878 9.09883 19.4634C5.95033 19.3843 4.37608 19.3448 3.24496 18.2094C2.11383 17.0739 2.08114 15.5412 2.01577 12.4756C1.99475 11.4899 1.99474 10.5101 2.01576 9.52438C2.08114 6.45885 2.11382 4.92608 3.24495 3.79065C4.37608 2.65521 5.95033 2.61566 9.09882 2.53656C11.0393 2.48781 12.9607 2.48781 14.9012 2.53657C18.0497 2.61568 19.6239 2.65523 20.7551 3.79066C21.8862 4.92609 21.9189 6.45886 21.9842 9.52439C21.9947 10.0172 22 10.5086 22 11"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22 17V14.5C20 14.5 18.5 13.5 18.5 13.5C18.5 13.5 17 14.5 15 14.5V17C15 20.5 18.5 21.5 18.5 21.5C18.5 21.5 22 20.5 22 17Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
