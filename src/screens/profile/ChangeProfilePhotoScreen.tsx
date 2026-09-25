import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Animated,
  Easing,
  Platform,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, Image as ImageIcon, Folder, X, User, Check } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useUserContext } from '../../store/UserContext';

// ── Star Loading Indicator (Figma: Star 3, 72x72px) ──
const StarLoadingIcon = ({ size = 72, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 72 72" fill="none">
    <Path
      d="M36 6L44.5 25.5L66 27.5L50 42L54.5 63.5L36 53L17.5 63.5L22 42L6 27.5L27.5 25.5L36 6Z"
      fill={color}
    />
  </Svg>
);

const DEFAULT_AVATAR =
  require('../../../assets/images/profile/05fc2d4379598a2d970225e7fdac24e129516033.jpg');

export function ChangeProfilePhotoScreen() {
  const router = useRouter();
  const { profileData, setAvatarUri } = useUserContext();

  const existingAvatar = profileData.avatarUri || null;
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Star spinner animation
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSaving) {
      rotateAnim.setValue(0);
      const loop = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loop.start();
      return () => loop.stop();
    }
  }, [isSaving]);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile' as any);
    }
  };

  const handleOpenPicker = () => {
    setShowBottomSheet(true);
  };

  const handleSelectFromPhotos = async () => {
    setShowBottomSheet(false);
    try {
      const ImagePicker = require('expo-image-picker');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant photo library access to upload a profile photo.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setSelectedPhoto(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Image picker error:', err);
    }
  };

  const handleSelectFromFile = async () => {
    setShowBottomSheet(false);
    try {
      const ImagePicker = require('expo-image-picker');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status === 'granted') {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!result.canceled && result.assets?.[0]?.uri) {
          setSelectedPhoto(result.assets[0].uri);
        }
      }
    } catch (err) {
      console.warn('File picker error:', err);
    }
  };

  const handleSaveChanges = () => {
    if (!selectedPhoto || isSaving) return;

    setIsSaving(true);
    setAvatarUri(selectedPhoto);

    // Fast, responsive feedback: quick 350ms spinner then brief 450ms toast
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccessToast(true);

      setTimeout(() => {
        router.replace('/profile' as any);
      }, 500);
    }, 350);
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const hasNewPhoto = !!selectedPhoto && selectedPhoto !== existingAvatar;
  const isButtonEnabled = hasNewPhoto && !isSaving;

  const displayAvatarSource = selectedPhoto
    ? { uri: selectedPhoto }
    : existingAvatar
    ? { uri: existingAvatar }
    : DEFAULT_AVATAR;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── Page Header (Figma: height 64px, borderBottom 1px solid rgba(235, 235, 245, 0.96)) ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Profile Image</Text>

        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* ── Body Content ── */}
      <View style={styles.content}>
        {/* Profile Frame (Figma: 140x140px, top 199px) */}
        <TouchableOpacity
          style={styles.profileFrame}
          onPress={handleOpenPicker}
          activeOpacity={0.8}
        >
          {/* Inner Circle with existing profile picture (124x124px) */}
          <View style={styles.avatarCircle}>
            <Image
              source={displayAvatarSource}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </View>

          {/* Profile Camera Badge (Figma: 32x32px, layer bg rgba(248, 249, 250, 0.98), borderRadius 24px) */}
          <View style={styles.cameraBadge}>
            <Camera size={18} color="rgba(0, 8, 20, 0.96)" />
          </View>
        </TouchableOpacity>

        {/* Tap Instruction (Figma: 16px font, lineHeight 24px, letterSpacing 0.4px) */}
        <Text style={styles.instructionText}>
          Tap on the circle to upload photo
        </Text>

        {/* ── Save Changes Button — positioned in the lower indicated area ── */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            isButtonEnabled
              ? styles.saveButtonActive
              : styles.saveButtonDisabled,
          ]}
          activeOpacity={isButtonEnabled ? 0.8 : 1}
          disabled={!isButtonEnabled}
          onPress={handleSaveChanges}
        >
          <Text
            style={[
              styles.saveButtonText,
              isButtonEnabled
                ? styles.saveButtonTextActive
                : styles.saveButtonTextDisabled,
            ]}
          >
            Save Changes
          </Text>
        </TouchableOpacity>

        {/* Center Star Spinner Animation during Saving State */}
        {isSaving && (
          <View style={styles.centerSpinnerContainer} pointerEvents="none">
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <StarLoadingIcon size={72} color="rgba(0, 8, 20, 0.96)" />
            </Animated.View>
          </View>
        )}

        {/* Profile Updated Pill Toast */}
        {showSuccessToast && (
          <View style={styles.toastContainer}>
            <View style={styles.toastGreenCircle}>
              <Check size={14} color="#FFFFFF" strokeWidth={3} />
            </View>
            <Text style={styles.toastText}>Profile Updated</Text>
          </View>
        )}
      </View>

      {/* ── Photo Upload Bottom Sheet Modal ── */}
      <Modal
        visible={showBottomSheet}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBottomSheet(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowBottomSheet(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.bottomSheetContainer}>
                {/* Bottom Sheet Header */}
                <View style={styles.bottomSheetHeader}>
                  <View style={styles.sheetHeaderSpacer} />
                  <Text style={styles.bottomSheetTitle}>Photo Upload</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowBottomSheet(false)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={20} color="rgba(0, 8, 20, 0.96)" />
                  </TouchableOpacity>
                </View>

                <View style={styles.sheetDivider} />

                {/* Option 1: Choose from photos */}
                <TouchableOpacity
                  style={styles.sheetOption}
                  activeOpacity={0.7}
                  onPress={handleSelectFromPhotos}
                >
                  <View style={styles.sheetIconBox}>
                    <ImageIcon size={22} color="rgba(0, 8, 20, 0.96)" />
                  </View>
                  <Text style={styles.sheetOptionText}>Choose from photos</Text>
                </TouchableOpacity>

                {/* Option 2: Select from file */}
                <TouchableOpacity
                  style={styles.sheetOption}
                  activeOpacity={0.7}
                  onPress={handleSelectFromFile}
                >
                  <View style={styles.sheetIconBox}>
                    <Folder size={22} color="rgba(0, 8, 20, 0.96)" />
                  </View>
                  <Text style={styles.sheetOptionText}>Select from file</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header (Figma: 64px height, borderBottom 1px solid rgba(235, 235, 245, 0.96)) ──
  header: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  headerRightPlaceholder: {
    width: 48,
    height: 48,
  },

  // ── Body Content ──
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 75,
    paddingBottom: Platform.OS === 'ios' ? 12 : 24,
  },

  // ── Profile Frame (Figma: 140x140px, top 199px) ──
  profileFrame: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 32,
  },
  avatarCircle: {
    width: 124,
    height: 124,
    borderRadius: 62,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarCircleEmpty: {
    borderWidth: 1,
    borderColor: 'rgba(96, 96, 102, 0.96)',
    borderStyle: 'dashed',
    backgroundColor: '#FFFFFF',
  },
  avatarCircleWithImage: {
    borderWidth: 1,
    borderColor: 'rgba(96, 96, 102, 0.96)',
    borderStyle: 'dashed',
  },
  avatarImage: {
    width: 124,
    height: 124,
    borderRadius: 62,
  },

  // ── Camera Badge (Figma: 32x32px, left: 91px, top: 105px) ──
  cameraBadge: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 32,
    height: 32,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  // ── Instruction Text (Figma: 16px, lineHeight 24px, letterSpacing 0.4px) ──
  instructionText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },

  centerSpinnerContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    zIndex: 10,
  },

  flexSpacer: {
    flex: 1,
  },

  // ── Profile Updated Toast (Figma: pill badge with green check) ──
  toastContainer: {
    position: 'absolute',
    bottom: 36,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    gap: 8,
    zIndex: 20,
  },
  toastGreenCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0C790C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.2,
    color: '#FFFFFF',
  },

  // ── Save Changes Button (Positioned in marked lower area, marginTop: 160px) ──
  saveButton: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 160,
  },
  saveButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 8, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
  },
  saveButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.15,
    textTransform: 'capitalize',
  },
  saveButtonTextActive: {
    color: '#FFFFFF',
  },
  saveButtonTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },

  // ── Photo Upload Bottom Sheet Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingHorizontal: 20,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  sheetHeaderSpacer: {
    width: 24,
  },
  bottomSheetTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginBottom: 16,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 16,
  },
  sheetIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetOptionText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
});
