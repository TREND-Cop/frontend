import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

export interface ProviderPhotoUploadSheetProps {
  visible: boolean;
  title?: string;
  onOpenCamera?: () => void;
  onChoosePhotos: () => void;
  onSelectFile: () => void;
  onClose: () => void;
}

// ── 1:1 Vector camera-01 Icon (24x24, stroke 1.5px rgba(192, 192, 204, 0.96)) ──
function CameraIcon({
  size = 24,
  color = 'rgba(192, 192, 204, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 8a2 2 0 012-2h2.5l1.5-2h6l1.5 2H19a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 16.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="17.5" cy="9.5" r="0.75" fill={color} />
    </Svg>
  );
}

// ── 1:1 Vector album-01 Icon (24x24, stroke 1.5px rgba(192, 192, 204, 0.96)) ──
function AlbumIcon({
  size = 24,
  color = 'rgba(192, 192, 204, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Back photo frame peaking out */}
      <Path
        d="M19 7h1a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2v-1"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Front photo frame */}
      <Rect
        x="3"
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
      <Circle cx="7.5" cy="7.5" r="1.25" fill={color} />
      {/* Mountain hills */}
      <Path
        d="M3 14l3.5-3.5a1.2 1.2 0 011.7 0L12 14"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.5 11.5l1.8-1.8a1.2 1.2 0 011.7 0L17 13.7"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── 1:1 Vector folder-01 Icon (24x24, stroke 1.5px rgba(192, 192, 204, 0.96)) ──
function FolderIcon({
  size = 24,
  color = 'rgba(192, 192, 204, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 6.5A2.5 2.5 0 015.5 4h3.172a2 2 0 011.414.586l1.828 1.828A2 2 0 0013.328 7H18.5A2.5 2.5 0 0121 9.5v8a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 17.5v-11z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── 1:1 Close cancel-01 Icon (24x24, stroke 1.5px #141B34) ──
function CloseIcon({
  size = 24,
  color = '#141B34',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma Photo Upload Bottom Sheet (Frame height: 395px, top radius 24px)
 * Matches exact geometry, typography, and iconography from spec.
 */
export const ProviderPhotoUploadSheet: React.FC<ProviderPhotoUploadSheetProps> = ({
  visible,
  title = 'Photo Upload',
  onOpenCamera,
  onChoosePhotos,
  onSelectFile,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  const handleOpenCameraPress = () => {
    if (onOpenCamera) {
      onOpenCamera();
    } else {
      onChoosePhotos();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop dismiss */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.sheetContainer,
            {
              paddingBottom: Math.max(insets.bottom, 24),
            },
          ]}
        >
          {/* ── Header and close button (height: 72px) ── */}
          <View style={styles.header}>
            <View style={styles.headerLeftSpacer} />
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>{title}</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <CloseIcon size={24} color="#141B34" />
            </TouchableOpacity>
          </View>

          {/* ── Photo upload options (top: 112px, gap: 16px, width: 358px) ── */}
          <View style={styles.optionsContainer}>
            {/* 1. Open Camera button (358x44px, padding: 8px, gap: 10px) */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.optionButton}
              onPress={handleOpenCameraPress}
            >
              <View style={styles.optionIconContainer}>
                <CameraIcon size={24} color="rgba(192, 192, 204, 0.96)" />
              </View>
              <Text style={styles.optionText}>Open Camera</Text>
            </TouchableOpacity>

            {/* Divider 1 (Line 161: width 342px, border 1px rgba(235, 235, 245, 0.96)) */}
            <View style={styles.divider} />

            {/* 2. Choose from photos button (358x44px, padding: 8px, gap: 10px) */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.optionButton}
              onPress={onChoosePhotos}
            >
              <View style={styles.optionIconContainer}>
                <AlbumIcon size={24} color="rgba(192, 192, 204, 0.96)" />
              </View>
              <Text style={styles.optionText}>Choose from photos</Text>
            </TouchableOpacity>

            {/* Divider 2 (Line 160: width 342px, border 1px rgba(235, 235, 245, 0.96)) */}
            <View style={styles.divider} />

            {/* 3. Select from file button (358x44px, padding: 8px, gap: 10px) */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.optionButton}
              onPress={onSelectFile}
            >
              <View style={styles.optionIconContainer}>
                <FolderIcon size={24} color="rgba(192, 192, 204, 0.96)" />
              </View>
              <Text style={styles.optionText}>Select from file</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ProviderPhotoUploadSheet;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  /* photo upload bottom sheet: 390x395px, background #FFFFFF, radius 24px 24px 0px 0px, box-shadow */
  sheetContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 15,
  },

  /* header and close button: height 72px, padding: 16px, borderBottom 1px solid rgba(235, 235, 245, 0.96) */
  header: {
    width: '100%',
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  headerLeftSpacer: {
    width: 40,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* Photo Upload title: 16px SF Pro 510/500, line-height 24px, letterSpacing 0.5px, color rgba(0, 8, 20, 0.96) */
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  /* close overlay button: 40x40px, radius 24px, background rgba(247, 247, 247, 0.96) */
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* photo upload options: top: 112px (40px below 72px header), width: 358px, gap: 16px */
  optionsContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 24,
    gap: 16,
  },
  /* 358x44px, padding 8px, gap 10px */
  optionButton: {
    width: '100%',
    maxWidth: 358,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 10,
  },
  optionIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* 16px SF Pro 400, line-height 24px, letterSpacing 0.4px, color rgba(0, 8, 20, 0.96) */
  optionText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  /* Line 160 & 161: width 342px (within 358px container), border 1px solid rgba(235, 235, 245, 0.96) */
  divider: {
    width: '100%',
    maxWidth: 342,
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    alignSelf: 'center',
  },
});
