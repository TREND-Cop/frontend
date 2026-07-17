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
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, radius, spacing } from '../constants/theme';

interface PhotoUploadSheetProps {
  /** Whether the bottom sheet is visible */
  visible: boolean;
  /** Called when "Choose from photos" is tapped */
  onChoosePhoto: () => void;
  /** Called when "Select from file" is tapped */
  onSelectFile: () => void;
  /** Called when the sheet is dismissed */
  onClose: () => void;
}

export const PhotoUploadSheet: React.FC<PhotoUploadSheetProps> = ({
  visible,
  onChoosePhoto,
  onSelectFile,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
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

          {/* ─── Option: Choose from Photos ─────────────────────────── */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => {
              onChoosePhoto();
              onClose();
            }}
            activeOpacity={0.7}
          >
            <Feather name="camera" size={24} color="rgba(192, 192, 204, 0.96)" style={styles.optionIcon} />
            <Text style={styles.optionText}>Choose from photos</Text>
          </TouchableOpacity>

          {/* ─── Option: Select from File ───────────────────────────── */}
          <TouchableOpacity
            style={[styles.optionRow, styles.lastOptionRow]}
            onPress={() => {
              onSelectFile();
              onClose();
            }}
            activeOpacity={0.7}
          >
            <Feather name="folder" size={24} color="rgba(192, 192, 204, 0.96)" style={styles.optionIcon} />
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
