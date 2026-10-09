import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

interface OpayIconProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

/**
 * 1:1 Figma OPay Icon (Rectangle 202: 24x24)
 * width: 24px;
 * height: 24px;
 */
export const OpayIcon: React.FC<OpayIconProps> = ({ size = 24, style }) => {
  return (
    <Image
      source={require('../../assets/images/payment/opay.png')}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
};

export default OpayIcon;
