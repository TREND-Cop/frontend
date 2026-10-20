import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface GoogleIconProps {
  size?: number;
  width?: number;
  height?: number;
}

/**
 * Official Google "G" multicolored logo
 */
export const GoogleIcon: React.FC<GoogleIconProps> = ({
  size = 28,
  width,
  height,
}) => {
  const iconWidth = width ?? size;
  const iconHeight = height ?? size;

  return (
    <Svg width={iconWidth} height={iconHeight} viewBox="0 0 24 24" fill="none">
      <Path
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.02h3.87c2.26-2.09 3.67-5.17 3.67-9.12z"
        fill="#4285F4"
      />
      <Path
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.02c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.12C3.32 21.36 7.37 24 12 24z"
        fill="#34A853"
      />
      <Path
        d="M5.27 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.61H1.28C.46 8.23 0 10.06 0 12s.46 3.77 1.28 5.39l3.99-3.12z"
        fill="#FBBC05"
      />
      <Path
        d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.32 2.64 1.28 6.61l3.99 3.12c.95-2.85 3.6-4.96 6.73-4.96z"
        fill="#EA4335"
      />
    </Svg>
  );
};

export default GoogleIcon;
