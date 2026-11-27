import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  LayoutChangeEvent,
  ViewStyle,
} from 'react-native';
import { ImageUploadTile } from './ImageUploadTile';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ImageUploadGridProps {
  /** Array of image URIs for slots */
  images: (string | null | undefined)[];
  /** Total number of slots to display (defaults to 6) */
  maxImages?: number;
  /** Number of columns per row (defaults to 3) */
  columns?: number;
  /** Horizontal gap between columns (defaults to 24px) */
  columnGap?: number;
  /** Vertical gap between rows (defaults to 16px) */
  rowGap?: number;
  /** Aspect ratio width/height for each tile (defaults to 1, square) */
  aspectRatio?: number;
  /** Corner radius for each tile (defaults to 24px) */
  borderRadius?: number;
  /** Size for camera icon (defaults to 24px) */
  cameraSize?: number;
  /** Whether to show error stroke on empty slots */
  isError?: boolean;
  /** Whether filled slots display a removal badge */
  showRemoveBadge?: boolean;
  /** Callback when a slot is tapped */
  onSlotPress: (index: number) => void;
  /** Optional callback when remove badge is tapped */
  onRemoveImage?: (index: number) => void;
  /** Optional label prefix for accessibility */
  accessibilityLabelPrefix?: string;
  /** Optional container style */
  style?: ViewStyle;
}

/**
 * 1:1 Figma Multi-Slot Image Upload Grid
 *
 * Responsiveness & Parity Guarantees:
 * - Dynamically computes exact pixel widths from available width:
 *   tileWidth = Math.floor((containerWidth - (columns - 1) * columnGap) / columns)
 * - Eliminates Yoga flexWrap cross-axis collapse bugs on Android.
 * - Rows structured explicitly (e.g. 2 rows of 3) with exact row & column gaps.
 * - Container height derived strictly from contents (rows × tileHeight + gaps).
 * - Guaranteed exact parity across 360dp, 390dp, and 430dp screen widths and large fonts.
 */
export const ImageUploadGrid: React.FC<ImageUploadGridProps> = ({
  images,
  maxImages = 6,
  columns = 3,
  columnGap = 24,
  rowGap = 16,
  aspectRatio = 1,
  borderRadius = 24,
  cameraSize = 24,
  isError = false,
  showRemoveBadge = false,
  onSlotPress,
  onRemoveImage,
  accessibilityLabelPrefix = 'Service photo',
  style,
}) => {
  // Initial fallback container width (assuming standard 16px side padding, capped at 358px on 390dp frame)
  const initialWidth = Math.max(280, Math.min(SCREEN_WIDTH - 32, 358));
  const [containerWidth, setContainerWidth] = useState<number>(initialWidth);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const measuredWidth = Math.round(e.nativeEvent.layout.width);
    if (measuredWidth > 0 && Math.abs(measuredWidth - containerWidth) >= 1) {
      setContainerWidth(measuredWidth);
    }
  }, [containerWidth]);

  // Compute exact tile size
  const tileWidth = useMemo(() => {
    const totalGap = (columns - 1) * columnGap;
    return Math.floor((containerWidth - totalGap) / columns);
  }, [containerWidth, columns, columnGap]);

  const tileHeight = useMemo(() => {
    return Math.round(tileWidth * aspectRatio);
  }, [tileWidth, aspectRatio]);

  // Partition slots into rows of length = columns
  const rows = useMemo(() => {
    const rowList: number[][] = [];
    let currentRow: number[] = [];
    for (let i = 0; i < maxImages; i++) {
      currentRow.push(i);
      if (currentRow.length === columns || i === maxImages - 1) {
        rowList.push(currentRow);
        currentRow = [];
      }
    }
    return rowList;
  }, [maxImages, columns]);

  return (
    <View
      style={[styles.gridContainer, { gap: rowGap }, style]}
      onLayout={handleLayout}
    >
      {rows.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={[styles.gridRow, { gap: columnGap }]}
        >
          {row.map((slotIndex) => (
            <ImageUploadTile
              key={slotIndex}
              imageUri={images[slotIndex]}
              width={tileWidth}
              height={tileHeight}
              borderRadius={borderRadius}
              cameraSize={cameraSize}
              isError={isError}
              showRemoveBadge={showRemoveBadge}
              onPress={() => onSlotPress(slotIndex)}
              onRemove={onRemoveImage ? () => onRemoveImage(slotIndex) : undefined}
              accessibilityLabel={`${accessibilityLabelPrefix} slot ${slotIndex + 1}`}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

export default ImageUploadGrid;

const styles = StyleSheet.create({
  gridContainer: {
    width: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
});

