import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Platform,
  Animated,
} from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

import { StaffMember, PortfolioPhoto } from '../../context/StaffContext';
import { triggerLightHaptic } from '../../utils/haptics';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

export interface StaffPortfolioPanelProps {
  staffMember: StaffMember;
  mode: 'view' | 'select';
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onEnterSelectMode: () => void;
  onDeletePress: () => void;
  onPhotoPress: (index: number) => void;
}

// ── Check Icon for Selected Photo (14x14) ──
function WhiteCheckIcon({ size = 14, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 12.6l5.4 5.4L20 6"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── 1:1 Vector Empty Photo Illustration (150x150) ──
function EmptyMediaIllustration({ size = 150 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 150 150" fill="none">
      <Rect width="150" height="150" rx="24" fill="rgba(247, 247, 247, 0.96)" />
      {/* Outer picture frame */}
      <Rect
        x="35"
        y="40"
        width="80"
        height="70"
        rx="14"
        stroke="rgba(192, 192, 204, 0.96)"
        strokeWidth="2.5"
      />
      {/* Sun / moon */}
      <Circle cx="55" cy="60" r="7" stroke="rgba(192, 192, 204, 0.96)" strokeWidth="2" />
      {/* Mountain range */}
      <Path
        d="M37 96l24-22 18 16 14-12 20 18"
        stroke="rgba(192, 192, 204, 0.96)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * StaffPortfolioPanel
 *
 * Implements the 1:1 Figma Staff Portfolio tab content across 4 key states:
 * 1. P1: Empty state ("No media upload", "No media content from this staff")
 * 2. P2: Normal view mode ("{n} Photos", "Select" pill, 2-column grid, "New" badge)
 * 3. P3: Select mode with 0 selected (radio buttons visible, Delete inactive)
 * 4. P4: Select mode with 1+ selected ("{n} Selected", red "Delete" pill)
 */
export const StaffPortfolioPanel: React.FC<StaffPortfolioPanelProps> = ({
  staffMember,
  mode,
  selectedIds,
  onToggleSelect,
  onEnterSelectMode,
  onDeletePress,
  onPhotoPress,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const photos = staffMember.portfolio || [];

  // Dissolve animation for radio/check circles per Figma note:
  // "when user clicks on the cancel button, all the radio button dissolves"
  const selectAnim = useRef(new Animated.Value(mode === 'select' ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(selectAnim, {
      toValue: mode === 'select' ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [mode, selectAnim]);

  // Responsive 2-column calculation matching CSS formula: (window width - side padding * 2 - gap) / 2
  const SIDE_PADDING = 16;
  const GAP = 16;
  const colWidth = Math.floor((windowWidth - SIDE_PADDING * 2 - GAP) / 2);

  // ── P1: Empty State ──
  if (photos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        {/* TODO (Asset): Replace with exported empty_media_illustration asset */}
        <View style={styles.emptyIllustrationWrapper}>
          <EmptyMediaIllustration size={150} />
        </View>

        <View style={styles.emptyTextGroup}>
          <Text style={styles.emptyTitle}>No media upload</Text>
          <Text style={styles.emptySubtitle}>
            No media content from this staff
          </Text>
        </View>
      </View>
    );
  }

  const isSelectMode = mode === 'select';
  const hasSelection = selectedIds.length > 0;
  const photoCountLabel = photos.length === 1 ? '1 Photo' : `${photos.length} Photos`;
  const selectionCountLabel = `${selectedIds.length} Selected`;

  return (
    <View style={styles.container}>
      {/* ── Toolbar Header (56px) ── */}
      <View style={styles.toolbarRow}>
        {/* Count Label */}
        <Text style={styles.countText}>
          {isSelectMode && hasSelection ? selectionCountLabel : photoCountLabel}
        </Text>

        {/* Action Button: "Select" in view mode, "Delete" in select mode */}
        {!isSelectMode ? (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.selectButtonPill}
            onPress={() => {
              triggerLightHaptic();
              onEnterSelectMode();
            }}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Select photos"
          >
            <Text style={styles.selectButtonText}>Select</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={hasSelection ? 0.7 : 1}
            style={[
              styles.deleteButtonPill,
              !hasSelection && styles.deleteButtonDisabled,
            ]}
            onPress={() => {
              if (hasSelection) {
                triggerLightHaptic();
                onDeletePress();
              }
            }}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Delete ${selectedIds.length} selected photos`}
            accessibilityState={{ disabled: !hasSelection }}
          >
            <Text
              style={[
                styles.deleteButtonText,
                !hasSelection && styles.deleteButtonTextDisabled,
              ]}
            >
              Delete
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── 2-Column Photo Grid ── */}
      <View style={styles.gridContainer}>
        {photos.map((photo: PortfolioPhoto, index: number) => {
          const isSelected = selectedIds.includes(photo.id);

          return (
            <TouchableOpacity
              key={photo.id}
              activeOpacity={0.85}
              style={[
                styles.photoCell,
                { width: colWidth, height: 172 },
              ]}
              onPress={() => {
                if (isSelectMode) {
                  onToggleSelect(photo.id);
                } else {
                  triggerLightHaptic();
                  onPhotoPress(index);
                }
              }}
              accessible
              accessibilityRole={isSelectMode ? 'checkbox' : 'button'}
              accessibilityState={isSelectMode ? { checked: isSelected } : undefined}
              accessibilityLabel={
                isSelectMode
                  ? `Photo ${index + 1} of ${photos.length}, ${
                      isSelected ? 'selected' : 'not selected'
                    }`
                  : `Open photo ${index + 1} of ${photos.length}`
              }
            >
              {/* Photo Image */}
              <Image
                source={typeof photo.uri === 'string' ? { uri: photo.uri } : photo.uri}
                style={styles.photoImage}
                resizeMode="cover"
              />

              {/* Green "New" Tag Badge (P2) */}
              {photo.isNew && (
                <View style={styles.newTagBadge} pointerEvents="none">
                  <Text style={styles.newTagText}>New</Text>
                </View>
              )}

              {/* Checkmark Circle (Select Mode with dissolve animation) */}
              {isSelectMode && (
                <Animated.View
                  style={[
                    styles.checkCircleWrapper,
                    { opacity: selectAnim },
                  ]}
                  pointerEvents="none"
                >
                  <View
                    style={[
                      styles.checkCircle,
                      isSelected && styles.checkCircleSelected,
                    ]}
                  >
                    {isSelected && <WhiteCheckIcon size={14} />}
                  </View>
                </Animated.View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default StaffPortfolioPanel;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 24,
    gap: 16,
  },
  emptyIllustrationWrapper: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTextGroup: {
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },

  /* Toolbar */
  toolbarRow: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  countText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  selectButtonPill: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectButtonText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  deleteButtonPill: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(204, 41, 41, 0.9)',
  },
  deleteButtonTextDisabled: {
    color: 'rgba(204, 41, 41, 0.5)',
  },

  /* Grid */
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingTop: 8,
  },
  photoCell: {
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },

  /* Green "New" Tag */
  newTagBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newTagText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(12, 121, 12, 0.96)',
  },

  /* Check Circle */
  checkCircleWrapper: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleSelected: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
});
