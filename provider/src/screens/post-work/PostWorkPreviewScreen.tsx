import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useSafeRouter, useSingleFlight } from '../../utils/safeNavigation';
import Svg, { Path } from 'react-native-svg';

import { useWorkPhotos } from '../../context/WorkPhotosContext';
import { useStaffWorkPhotos } from '../../context/StaffWorkPhotosContext';
import { STAFF_ROUTES } from '../../constants/staffRoutes';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { triggerLightHaptic } from '../../utils/haptics';

const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

// ── Close X Icon (24x24) ──
function CloseXIcon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma Post Work Preview Screen (Frames U3 & U4)
 * - Full-screen route with grey background
 * - Top-left circular white X button (closes and discards photo)
 * - Center photo displayed with contain mode (never stretched)
 * - Bottom dark pill "Upload" button with safe-area padding
 * - LoadingOverlay with 4 dots active during upload (blocking touches)
 */
export interface PostWorkPreviewScreenProps {
  isStaff?: boolean;
}

export const PostWorkPreviewScreen: React.FC<PostWorkPreviewScreenProps> = ({ isStaff = false }) => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const ownerPhotos = useWorkPhotos();
  const staffPhotos = useStaffWorkPhotos();

  const [isUploading, setIsUploading] = useState(false);

  // Close & discard photo
  const handleClose = useSingleFlight(() => {
    if (isUploading) return;
    triggerLightHaptic();
    safeRouter.back();
  });

  // Upload handler
  const handleUpload = useSingleFlight(async () => {
    if (isUploading || !uri) return;
    triggerLightHaptic();
    setIsUploading(true);

    try {
      if (isStaff) {
        await staffPhotos.uploadStaffWorkPhoto(uri);
        safeRouter.replace(STAFF_ROUTES.POST_WORK_SUCCESS as any);
      } else {
        await ownerPhotos.uploadWorkPhoto(uri);
        safeRouter.replace('/post-work/success' as any);
      }
    } catch (e) {
      // TODO (Backend): handle failure
      setIsUploading(false);
    }
  });

  return (
    <View style={styles.container}>
      {/* ── Top-Left Circular White X Button ── */}
      <SafeAreaView edges={['top']} style={styles.topSafeArea}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleClose}
          disabled={isUploading}
          style={styles.closeButton}
          accessibilityLabel="Close preview"
        >
          <CloseXIcon size={20} color="#141B34" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* ── Centered Photo (Contain, never stretched) ── */}
      <View style={styles.imageContainer}>
        {uri ? (
          <Image
            source={{ uri }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        ) : null}
      </View>

      {/* ── Bottom Upload Button ── */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: Math.max(insets.bottom, 24) + 16 },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleUpload}
          disabled={isUploading}
          style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
          accessibilityLabel="Upload"
        >
          <Text style={styles.uploadButtonText}>Upload</Text>
        </TouchableOpacity>
      </View>

      {/* ── Loading Overlay (Frame U4: dimmed with 4 dots pulsing over the entire screen) ── */}
      <LoadingOverlay
        visible={isUploading}
        dotsCount={4}
        dotSize={16}
        dotGap={20}
        overlayOpacity={0.35}
        centered
      />
    </View>
  );
};

export default PostWorkPreviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D9D9D9',
    position: 'relative',
  },
  topSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 80,
    paddingBottom: 100,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    alignItems: 'center',
    zIndex: 10,
  },
  uploadButton: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});
