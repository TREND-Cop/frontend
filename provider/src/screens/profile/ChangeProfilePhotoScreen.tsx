import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Platform,
  Modal,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../utils/safeNavigation';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Circle } from 'react-native-svg';

import { useProviderProfile } from '../../context/ProviderProfileContext';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';

function ArrowLeftIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M11 6l-6 6 6 6"
        stroke="#000814"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ShareIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="18" cy="5" r="3" stroke="#141B34" strokeWidth="1.5" />
      <Circle cx="6" cy="12" r="3" stroke="#141B34" strokeWidth="1.5" />
      <Circle cx="18" cy="19" r="3" stroke="#141B34" strokeWidth="1.5" />
      <Path
        d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function CameraIcon({ size = 20, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth="1.5" />
    </Svg>
  );
}

function CheckmarkIcon({ size = 16, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M3.33 8l3.34 3.33 6.66-6.66"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ProviderChangeProfilePhotoScreen() {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { ownerPhoto, updateOwnerPhoto } = useProviderProfile();

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(ownerPhoto);
  const [showPickerSheet, setShowPickerSheet] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const toastAnim = useRef(new Animated.Value(0)).current;

  const hasNewPhoto = selectedPhoto !== null && selectedPhoto !== ownerPhoto;

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Manage your Trend Business profile image.',
      });
    } catch (e) {
      // Ignored
    }
  };

  const handleLaunchCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedPhoto(result.assets[0].uri);
      }
    } catch (err) {
      // Ignored
    } finally {
      setShowPickerSheet(false);
    }
  };

  const handleLaunchLibrary = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedPhoto(result.assets[0].uri);
      }
    } catch (err) {
      // Ignored
    } finally {
      setShowPickerSheet(false);
    }
  };

  const handleSave = async () => {
    if (!hasNewPhoto || !selectedPhoto || isUpdating) return;

    setIsUpdating(true);
    await updateOwnerPhoto(selectedPhoto);
    setIsUpdating(false);

    // Trigger Success Toast
    setShowToast(true);
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(1800),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowToast(false);
      safeRouter.back();
    });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {/* ── Fixed Header (height: 64px) ── */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => safeRouter.back()}
          style={styles.headerButton}
        >
          <ArrowLeftIcon size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Profile Image</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleShare}
          style={styles.headerButton}
        >
          <ShareIcon size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 140x140 Avatar Circle with Camera Badge ── */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowPickerSheet(true)}
            style={styles.avatarContainer}
          >
            {selectedPhoto ? (
              <Image
                source={{ uri: selectedPhoto }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require('../../../assets/images/profile/cont1.jpg')}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            )}

            {/* Camera Floating Badge (40x40px, radius 20px) */}
            <View style={styles.cameraBadge}>
              <CameraIcon size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.avatarHint}>Tap on the camera to upload photo</Text>
        </View>
      </ScrollView>

      {/* ── Toast Notification Pill ── */}
      {showToast && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.toastBadge}>
            <CheckmarkIcon size={14} color="#FFFFFF" />
          </View>
          <Text style={styles.toastText}>Profile Image Updated</Text>
        </Animated.View>
      )}

      {/* ── Bottom Save Changes Button ── */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          activeOpacity={hasNewPhoto ? 0.85 : 1}
          disabled={!hasNewPhoto || isUpdating}
          onPress={handleSave}
          style={[
            styles.saveButton,
            hasNewPhoto ? styles.saveButtonActive : styles.saveButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.saveButtonText,
              hasNewPhoto ? styles.saveButtonTextActive : styles.saveButtonTextDisabled,
            ]}
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Photo Picker Bottom Sheet Modal ── */}
      <Modal
        visible={showPickerSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPickerSheet(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPickerSheet(false)}
        >
          <View style={[styles.sheetContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select Profile Photo</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLaunchCamera}
              style={styles.sheetOption}
            >
              <Text style={styles.sheetOptionText}>Take photo</Text>
            </TouchableOpacity>

            <View style={styles.sheetDivider} />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLaunchLibrary}
              style={styles.sheetOption}
            >
              <Text style={styles.sheetOptionText}>Choose from library</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowPickerSheet(false)}
              style={styles.sheetCancelButton}
            >
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <NativeDockSpacer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 80,
    alignItems: 'center',
  },

  // ── Avatar Section ──
  avatarSection: {
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000814',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarHint: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },

  // ── Toast Pill ──
  toastContainer: {
    position: 'absolute',
    top: 76,
    alignSelf: 'center',
    backgroundColor: '#0C790C',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  toastBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // ── Bottom Save Button ──
  bottomContainer: {
    paddingHorizontal: 16,
    paddingTop: 40,
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
  },
  saveButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  saveButtonTextActive: {
    color: '#FFFFFF',
  },
  saveButtonTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },

  // ── Modal Sheet ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 8, 20, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    alignItems: 'center',
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
    marginBottom: 16,
  },
  sheetTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#000000',
    marginBottom: 16,
  },
  sheetOption: {
    width: '100%',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetOptionText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    color: '#000814',
  },
  sheetDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  sheetCancelButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  sheetCancelText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    color: '#000814',
  },
});
