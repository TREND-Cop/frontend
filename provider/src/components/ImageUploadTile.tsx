import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import { triggerLightHaptic } from '../utils/haptics';

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
        d="M2.5 8C2.5 6.62 3.62 5.5 5 5.5H7.2L8.6 3.7C8.97 3.2 9.56 2.9 10.19 2.9H13.81C14.44 2.9 15.03 3.2 15.4 3.7L16.8 5.5H19C20.38 5.5 21.5 6.62 21.5 8V18C21.5 19.38 20.38 20.5 19 20.5H5C3.62 20.5 2.5 19.38 2.5 18V8Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="13" r="3.75" stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

function CircleXBadgeIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="10"
        fill="rgba(204, 41, 41, 0.9)"
        stroke="rgba(204, 41, 41, 0.9)"
        strokeWidth={1.5}
      />
      <Path
        d="M9 9l6 6M15 9l-6 6"
        stroke="#FFFFFF"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export interface ImageUploadTileProps {
  imageUri?: string | null;
  width: number;
  height: number;
  borderRadius?: number;
  cameraSize?: number;
  isError?: boolean;
  showRemoveBadge?: boolean;
  onPress: () => void;
  onRemove?: () => void;
  accessibilityLabel?: string;
  style?: ViewStyle;
  testID?: string;
}

/**
 * 1:1 Figma Single Image Upload Tile
 *
 * Features:
 * - Deterministic, non-collapsing dimensions (width & height in dp).
 * - SVG rounded dashed border (<Rect rx={borderRadius} strokeDasharray="5 5" />)
 *   rendered absolutely in background without impacting flex flow.
 * - Camera icon 100% mathematically centered in both axes.
 * - Uploaded image preview clipped cleanly to borderRadius with optional removal badge.
 */
export const ImageUploadTile: React.FC<ImageUploadTileProps> = ({
  imageUri,
  width,
  height,
  borderRadius = 24,
  cameraSize = 24,
  isError = false,
  showRemoveBadge = false,
  onPress,
  onRemove,
  accessibilityLabel,
  style,
  testID,
}) => {
  const isFilled = !!imageUri;
  const strokeColor = isError ? 'rgba(204, 41, 41, 0.9)' : 'rgba(192, 192, 204, 0.96)';

  if (isFilled) {
    return (
      <View
        style={[
          styles.tileContainer,
          { width, height, borderRadius },
          style,
        ]}
        testID={testID}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.fillTouchable, { borderRadius }]}
          onPress={onPress}
          accessibilityLabel={accessibilityLabel || 'Replace photo'}
          accessibilityRole="button"
        >
          <Image
            source={{ uri: imageUri }}
            style={[styles.imagePreview, { borderRadius }]}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {showRemoveBadge && onRemove && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.removeBadge}
            onPress={() => {
              triggerLightHaptic();
              onRemove();
            }}
            accessibilityLabel="Remove photo"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <CircleXBadgeIcon size={24} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.tileContainer,
        { width, height, borderRadius },
        style,
      ]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel || 'Upload photo'}
      accessibilityRole="button"
      testID={testID}
    >
      {/* 1:1 SVG Rounded Dashed Border Background */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={width} height={height}>
          <Rect
            x={1}
            y={1}
            width={Math.max(0, width - 2)}
            height={Math.max(0, height - 2)}
            rx={borderRadius}
            stroke={strokeColor}
            strokeWidth={1.2}
            strokeDasharray="5 5"
            fill="#FFFFFF"
          />
        </Svg>
      </View>

      {/* Centered Camera Icon (Guaranteed vertical and horizontal center) */}
      <View style={styles.centerIconWrapper} pointerEvents="none">
        <Camera01Icon size={cameraSize} color="#141B34" />
      </View>
    </TouchableOpacity>
  );
};

export default ImageUploadTile;

const styles = StyleSheet.create({
  tileContainer: {
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
  },
  fillTouchable: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  centerIconWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 10,
  },
});
