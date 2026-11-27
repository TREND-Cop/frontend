import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  useWindowDimensions,
  Platform,
  BackHandler,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeRouter, useSingleFlight } from '../../utils/safeNavigation';
import Svg, { Path } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';

import { useWorkPhotos, WorkPhoto } from '../../context/WorkPhotosContext';
import { useStaffWorkPhotos } from '../../context/StaffWorkPhotosContext';
import { ProviderPhotoUploadSheet } from '../../components/ProviderPhotoUploadSheet';
import { DeletePostDialog } from '../../components/DeletePostDialog';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { triggerLightHaptic } from '../../utils/haptics';

import { markStaffSubScreenNavigation } from '../../hooks/useStaffDashboardSkeleton';
import { STAFF_ROUTES } from '../../constants/staffRoutes';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

// ── Back Arrow Icon (24x24 standard ArrowLeft02) ──
function ArrowLeft02Icon({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.57 5.93L3.5 12L9.57 18.07"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.5 12H3.67"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── 1:1 Vector Trash Icon (24x24) ──
function TrashIcon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19.5 5.5L18.8 17.5C18.7 19.2 17.3 20.5 15.6 20.5H8.4C6.7 20.5 5.3 19.2 5.2 17.5L4.5 5.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path d="M3 5.5H21" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path
        d="M9.5 5.5V4C9.5 3.2 10.2 2.5 11 2.5H13C13.8 2.5 14.5 3.2 14.5 4V5.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path d="M10 10V16" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M14 10V16" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

// ── Plus Icon (20x20) ──
function PlusIcon({ size = 20, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 4V16M4 10H16"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Check Icon for Selected Photo (14x14) ──
function CheckMarkIcon({ size = 14, color = '#FFFFFF' }: { size?: number; color?: string }) {
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

export interface PostWorkScreenProps {
  isStaff?: boolean;
}

export const PostWorkScreen: React.FC<PostWorkScreenProps> = ({ isStaff = false }) => {
  const safeRouter = useSafeRouter();
  const ownerPhotos = useWorkPhotos();
  const staffPhotos = useStaffWorkPhotos();

  const photos = isStaff ? staffPhotos.photos : ownerPhotos.photos;
  const deleteWorkPhotos = isStaff ? staffPhotos.deleteStaffWorkPhotos : ownerPhotos.deleteWorkPhotos;
  const { width: windowWidth } = useWindowDimensions();

  // Mode: 'view' | 'select'
  const [mode, setMode] = useState<'view' | 'select'>('view');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Responsive 2-column calculation matching formula: (window width - side padding * 2 - gap) / 2
  const SIDE_PADDING = 16;
  const GAP = 16;
  const colWidth = Math.floor((windowWidth - SIDE_PADDING * 2 - GAP) / 2);

  // Android hardware back button: exits select mode if in select mode, else returns to dashboard
  useEffect(() => {
    const onBackPress = () => {
      if (mode === 'select') {
        setMode('view');
        setSelectedIds([]);
        return true;
      }
      if (isStaff) {
        markStaffSubScreenNavigation();
        safeRouter.replace(STAFF_ROUTES.HOME as any);
      } else {
        safeRouter.replace('/dashboard');
      }
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [mode, isStaff, safeRouter]);

  // Header Back Button handler
  const handleHeaderBack = () => {
    triggerLightHaptic();
    if (mode === 'select') {
      setMode('view');
      setSelectedIds([]);
    } else {
      if (isStaff) {
        markStaffSubScreenNavigation();
        safeRouter.replace(STAFF_ROUTES.HOME as any);
      } else {
        safeRouter.replace('/dashboard');
      }
    }
  };

  // Header Right Action handler
  const handleHeaderRightAction = () => {
    triggerLightHaptic();
    if (mode === 'view') {
      // Tapping trash icon in view mode: enter select mode if photos exist
      if (photos.length > 0) {
        setMode('select');
        setSelectedIds([]);
      } else {
        // Empty state: pressing trash does nothing as noted in prompt
      }
    } else {
      // Select mode
      if (selectedIds.length > 0) {
        // "Delete" action pressed -> open confirm dialog (S3)
        setShowDeleteDialog(true);
      } else {
        // "Cancel" action pressed -> exit select mode
        setMode('view');
        setSelectedIds([]);
      }
    }
  };

  // Toggle selection on a photo in select mode
  const handleToggleSelect = (id: string) => {
    triggerLightHaptic();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Confirm deletion from dialog (S3 -> S4)
  const handleConfirmDelete = useSingleFlight(async () => {
    triggerLightHaptic();
    setShowDeleteDialog(false);
    await deleteWorkPhotos(selectedIds);
    setSelectedIds([]);
    setMode('view');
  });

  // Cancel deletion from dialog (keeps select mode and selection intact)
  const handleCancelDeleteDialog = useSingleFlight(() => {
    triggerLightHaptic();
    setShowDeleteDialog(false);
  });

  // Open upload sheet (U2)
  const handleOpenUploadSheet = useSingleFlight(() => {
    if (showUploadSheet) return;
    triggerLightHaptic();
    setShowUploadSheet(true);
  });

  // Camera Picker (Open Camera - Back camera)
  const handleOpenCamera = async () => {
    setShowUploadSheet(false);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos of your work.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        cameraType: ImagePicker.CameraType.back,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const targetPreview = isStaff ? STAFF_ROUTES.POST_WORK_PREVIEW : '/post-work/preview';
        safeRouter.push({
          pathname: targetPreview,
          params: { uri },
        } as any);
      }
    } catch (e) {
      // Handled gracefully without crash
    }
  };

  // Photo Library Picker (Choose from photos)
  const handleChoosePhotos = async () => {
    setShowUploadSheet(false);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Photo library permission is required to choose photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const targetPreview = isStaff ? STAFF_ROUTES.POST_WORK_PREVIEW : '/post-work/preview';
        safeRouter.push({
          pathname: targetPreview,
          params: { uri },
        } as any);
      }
    } catch (e) {
      // Handled gracefully without crash
    }
  };

  // Select from file stub
  const handleSelectFile = () => {
    setShowUploadSheet(false);
    // TODO (Backend): integrate document/file picker when cloud document storage is added
    handleChoosePhotos();
  };

  const isSelectMode = mode === 'select';
  const hasSelected = selectedIds.length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ── Fixed Header (Height: 64px) ── */}
      <View style={styles.header}>
        {/* Left: Back Arrow */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleHeaderBack}
          style={styles.headerButton}
          accessibilityLabel={isSelectMode ? 'Cancel selection and go back' : 'Go back to dashboard'}
        >
          <ArrowLeft02Icon size={24} color="#000814" />
        </TouchableOpacity>

        {/* Center: Title */}
        <Text style={styles.headerTitle}>Post Work</Text>

        {/* Right Action */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleHeaderRightAction}
          style={styles.headerRightButton}
          accessibilityLabel={
            !isSelectMode
              ? 'Select photos to delete'
              : hasSelected
              ? 'Delete selected photos'
              : 'Cancel selection'
          }
        >
          {!isSelectMode ? (
            <TrashIcon size={24} color="#141B34" />
          ) : hasSelected ? (
            <Text style={styles.deleteActionText} numberOfLines={1}>
              Delete
            </Text>
          ) : (
            <Text style={styles.cancelActionText} numberOfLines={1}>
              Cancel
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Content Area ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro text: visible in view mode, hidden in select mode */}
        {!isSelectMode && (
          <Text style={styles.introText}>
            Any uploaded image on this section would be seen by clients on Trend.
          </Text>
        )}

        {/* 2-Column Grid */}
        <View style={styles.gridContainer}>
          {/* Upload Tile: first cell in view mode, hidden in select mode */}
          {!isSelectMode && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleOpenUploadSheet}
              style={[
                styles.uploadTile,
                { width: colWidth, height: colWidth },
              ]}
              accessibilityLabel="Upload photos"
            >
              <View style={styles.uploadTileTextContainer}>
                <Text style={styles.uploadTileTitle}>Post Work</Text>
                <Text style={styles.uploadTileCaption}>Tap to upload photos</Text>
              </View>

              <View style={styles.plusCircle}>
                <PlusIcon size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          )}

          {/* Photo Cells */}
          {photos.map((item, index) => {
            const isSelected = selectedIds.includes(item.id);

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={isSelectMode ? 0.7 : 1}
                onPress={() => {
                  if (isSelectMode) {
                    handleToggleSelect(item.id);
                  }
                  // Tapping photo in view mode is not designed; do nothing per prompt
                }}
                style={[
                  styles.photoCard,
                  { width: colWidth, height: colWidth },
                ]}
                accessibilityLabel={
                  isSelectMode
                    ? `Photo ${index + 1}, ${isSelected ? 'selected' : 'not selected'}`
                    : `Photo ${index + 1}`
                }
              >
                <Image
                  source={typeof item.uri === 'string' ? { uri: item.uri } : item.uri}
                  style={styles.photoImage}
                  resizeMode="cover"
                />

                {/* View mode: Green "New" badge on top-right if isNew */}
                {!isSelectMode && item.isNew && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>New</Text>
                  </View>
                )}

                {/* Select mode: Select circle on top-left */}
                {isSelectMode && (
                  <View style={styles.selectBadgePosition}>
                    {isSelected ? (
                      <View style={styles.selectedCircle}>
                        <CheckMarkIcon size={14} color="#FFFFFF" />
                      </View>
                    ) : (
                      <View style={styles.unselectedCircle} />
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* ── Photo Upload Bottom Sheet (U2) ── */}
      <ProviderPhotoUploadSheet
        visible={showUploadSheet}
        title="Photo Upload"
        onOpenCamera={handleOpenCamera}
        onChoosePhotos={handleChoosePhotos}
        onSelectFile={handleSelectFile}
        onClose={() => setShowUploadSheet(false)}
      />

      {/* ── Delete Confirmation Dialog (S3) ── */}
      <DeletePostDialog
        visible={showDeleteDialog}
        onCancel={handleCancelDeleteDialog}
        onConfirm={handleConfirmDelete}
      />

      {/* ── Native Dock Spacer (Android barrier guarantee) ── */}
      <NativeDockSpacer />
    </SafeAreaView>
  );
};

export default PostWorkScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 64,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
  },
  headerButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightButton: {
    minWidth: 48,
    height: 48,
    paddingHorizontal: 8,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#000814',
    textAlign: 'center',
    includeFontPadding: false,
  },
  cancelActionText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#000814',
    includeFontPadding: false,
  },
  deleteActionText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#CC292B',
    includeFontPadding: false,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  introText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    marginBottom: 20,
    includeFontPadding: false,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  uploadTile: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  uploadTileTextContainer: {
    gap: 4,
  },
  uploadTileTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
    includeFontPadding: false,
  },
  uploadTileCaption: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  plusCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  photoCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F7F7F7',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 42,
    height: 25,
    backgroundColor: 'rgba(238, 248, 238, 0.9)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBadgeText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    color: '#0C790C',
    includeFontPadding: false,
  },
  selectBadgePosition: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  unselectedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  selectedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
