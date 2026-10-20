/**
 * PhotoUploadSheet — Bottom sheet overlay for photo upload options.
 *
 * Used in UserProfileScreen. Displays two options:
 * 1. "Choose from photos" — opens the device photo library
 * 2. "Select from file" — opens a file/document picker (stubbed as TODO)
 *
 * TODO (Backend):
 * 1. Convert the selected local image URI (from expo-image-picker) into a File/Blob.
 * 2. POST request to `/api/users/profile/photo` (or a pre-signed S3 URL).
 *    Content-Type: multipart/form-data
 * 3. The backend should compress/resize the image, upload to CDN/S3, and
 *    save the resulting URL to the user's database record.
 * Usage:
 *   <PhotoUploadSheet
 *     visible={showPhotoSheet}
 *     onChoosePhoto={handleChoosePhoto}
 *     onSelectFile={handleSelectFile}
 *     onClose={() => setShowPhotoSheet(false)}
 *   />
 */


import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { colors, typography, radius, spacing } from '../constants/theme';

interface PhotoUploadSheetProps {
  /** Whether the bottom sheet is visible */
  visible: boolean;
  /** Called when "Open camera" is tapped */
  onOpenCamera?: () => void;
  /** Called when "Choose from photos" is tapped */
  onChoosePhoto: () => void;
  /** Called when "Select from file" is tapped */
  onSelectFile: () => void;
  /** Called when the sheet is dismissed */
  onClose: () => void;
}

// ── 1:1 Vector Camera Icon for "Open camera" ──
function CameraIcon({ size = 24, color = 'rgba(192, 192, 204, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 7a2 2 0 012-2h2.5l1.5-2h8l1.5 2H20a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V7z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="13" r="3.5" stroke={color} strokeWidth="1.5" />
    </Svg>
  );
}

// ── 1:1 Vector Photo Album / Pictures Icon for "Choose from photos" ──
function PhotoAlbumIcon({ size = 24, color = 'rgba(192, 192, 204, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Back overlapping photo card */}
      <Path
        d="M19 21H5a2 2 0 01-2-2V7"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Front photo frame */}
      <Rect
        x="7"
        y="3"
        width="14"
        height="14"
        rx="2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Sun / sparkle dot */}
      <Circle cx="11" cy="7.5" r="1.25" fill={color} />
      {/* Mountains */}
      <Path
        d="M7 14l3.5-3.5a1.2 1.2 0 011.7 0L15 13"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.5 11.5l1.8-1.8a1.2 1.2 0 011.7 0L21 13.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── 1:1 Vector Folder Icon for "Select from file" ──
function FolderIcon({ size = 24, color = 'rgba(192, 192, 204, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 6a2 2 0 012-2h4.5l2 2H20a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export const PhotoUploadSheet: React.FC<PhotoUploadSheetProps> = ({
  visible,
  onOpenCamera,
  onChoosePhoto,
  onSelectFile,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <SafeAreaView style={styles.sheetContainer}>
          {/* ─── Sheet Header ───────────────────────────────────────── */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Photo Upload</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#141B34" />
            </TouchableOpacity>
          </View>

          {/* ─── Option 1: Open Camera (Camera Icon) ────────────────── */}
          {onOpenCamera && (
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                onOpenCamera();
                onClose();
              }}
              activeOpacity={0.7}
            >
              <View style={styles.optionIcon}>
                <CameraIcon size={24} color="rgba(192, 192, 204, 0.96)" />
              </View>
              <Text style={styles.optionText}>Open camera</Text>
            </TouchableOpacity>
          )}

          {/* ─── Option 2: Choose from Photos (Photo Album Icon) ────── */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => {
              onChoosePhoto();
              onClose();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.optionIcon}>
              <PhotoAlbumIcon size={24} color="rgba(192, 192, 204, 0.96)" />
            </View>
            <Text style={styles.optionText}>Choose from photos</Text>
          </TouchableOpacity>

          {/* ─── Option 3: Select from File (Folder Icon) ───────────── */}
          <TouchableOpacity
            style={[styles.optionRow, styles.lastOptionRow]}
            onPress={() => {
              onSelectFile();
              onClose();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.optionIcon}>
              <FolderIcon size={24} color="rgba(192, 192, 204, 0.96)" />
            </View>
            <Text style={styles.optionText}>Select from file</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.appBackground,
    borderTopLeftRadius: radius.large,
    borderTopRightRadius: radius.large,
    paddingBottom: 30,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.buttonPadding,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
  },
  sheetTitle: {
    ...typography.bodyMed,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Options ─────────────────────────────────────────────────────────────
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: spacing.buttonPadding,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
  },
  lastOptionRow: {
    borderBottomWidth: 0,
  },
  optionIcon: {
    marginRight: 10,
  },
  optionText: {
    ...typography.bodyRegular,
    color: 'rgba(0, 8, 20, 0.96)',
  },
});
