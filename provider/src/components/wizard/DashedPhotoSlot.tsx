import React, { useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  LayoutChangeEvent,
  ViewStyle,
  Platform,
} from 'react-native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import { triggerLightHaptic } from '../../utils/haptics';

/**
 * 1:1 Vector Camera-01 Icon matching Figma specs
 * - Outer body: rounded rectangular body with top trapezoid bump
 * - Center lens: clean circular aperture (cx=12, cy=13, r=3.75)
 * - Stroke: 1.5px, strokeLinecap="round", strokeLinejoin="round"
 * - No corner dot (matches Figma design frame)
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

/**
 * Red ✕ Badge Icon for photo removal
 */
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

export interface DashedPhotoSlotProps {
  imageUri?: string | null;
  onPress: () => void;
  onRemove?: () => void;
  showRemoveBadge?: boolean;
  isError?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
  cameraSize?: number;
  borderRadius?: number;
  testID?: string;
}

/**
 * 1:1 Figma Dashed Photo Upload Slot
 *
 * Guaranteed 100% precision rounded dashed borders on iOS, Android & Web:
 * Standard React Native View with `borderStyle: 'dashed'` and `borderRadius`
 * breaks on Android (flattening corners or rendering solid lines).
 * This component uses an internal SVG <Rect rx={24} strokeDasharray="5 5" />
 * measuring exact container layout for flawless, crisp rounded dashed lines.
 */
export const DashedPhotoSlot: React.FC<DashedPhotoSlotProps> = ({
  imageUri,
  onPress,
  onRemove,
  showRemoveBadge = false,
  isError = false,
  accessibilityLabel,
  style,
  cameraSize = 24,
  borderRadius = 24,
  testID,
}) => {
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 104,
    height: 104,
  });

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setDimensions((prev) => {
        if (Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1) {
          return prev;
        }
        return { width: Math.round(width), height: Math.round(height) };
      });
    }
  }, []);

  const isFilled = !!imageUri;

  if (isFilled) {
    return (
      <View style={[styles.slotBase, style]} onLayout={onLayout} testID={testID}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.touchable, { borderRadius }]}
          onPress={onPress}
          accessibilityLabel={accessibilityLabel || 'Replace photo'}
          accessibilityRole="button"
        >
          <Image
            source={{ uri: imageUri }}
            style={[styles.image, { borderRadius }]}
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

  // Empty Slot with 1:1 SVG Rounded Dashed Border
  const strokeColor = isError ? 'rgba(204, 41, 41, 0.9)' : 'rgba(192, 192, 204, 0.96)';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.slotBase, style]}
      onLayout={onLayout}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel || 'Upload photo'}
      accessibilityRole="button"
      testID={testID}
    >
      {/* 1:1 Mathematical Rounded Dashed Border via SVG */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg
          width={dimensions.width}
          height={dimensions.height}
        >
          <Rect
            x={1}
            y={1}
            width={Math.max(0, dimensions.width - 2)}
            height={Math.max(0, dimensions.height - 2)}
            rx={borderRadius}
            stroke={strokeColor}
            strokeWidth={1.2}
            strokeDasharray="5 5"
            fill="#FFFFFF"
          />
        </Svg>
      </View>

      {/* Centered Camera Icon */}
      <View style={styles.centerIconWrapper} pointerEvents="none">
        <Camera01Icon size={cameraSize} color="#141B34" />
      </View>
    </TouchableOpacity>
  );
};

export default DashedPhotoSlot;

const styles = StyleSheet.create({
  slotBase: {
    width: '30.5%',
    aspectRatio: 1,
    maxWidth: 104,
    maxHeight: 104,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
    overflow: 'hidden',
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
  touchable: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 10,
  },
});
