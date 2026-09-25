import React, { useState, useEffect } from 'react';
import {
  Image,
  ImageProps,
  ImageSourcePropType,
} from 'react-native';

const DEFAULT_FALLBACK = require('../../../assets/images/popular/pop_men_haircut.png');

export interface SafeImageProps extends Omit<ImageProps, 'source'> {
  source: any;
  fallbackSource?: ImageSourcePropType;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  source,
  fallbackSource = DEFAULT_FALLBACK,
  style,
  onError,
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);

  // Reset error state if source prop changes
  useEffect(() => {
    setHasError(false);
  }, [source]);

  // Normalize source safely
  let resolvedSource: ImageSourcePropType = fallbackSource;

  if (!hasError && source) {
    if (typeof source === 'string') {
      const trimmed = source.trim();
      if (trimmed.length > 0) {
        resolvedSource = { uri: trimmed };
      }
    } else if (typeof source === 'object' && source.uri) {
      if (typeof source.uri === 'string' && source.uri.trim().length > 0) {
        resolvedSource = source;
      }
    } else {
      resolvedSource = source;
    }
  }

  return (
    <Image
      {...rest}
      source={resolvedSource}
      onError={(e) => {
        setHasError(true);
        if (onError) onError(e);
      }}
      style={style}
    />
  );
};

export default SafeImage;
