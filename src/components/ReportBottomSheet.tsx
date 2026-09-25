import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
  Image,
  Alert,
  Keyboard,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CloseIcon = ({ size = 24, color = '#141B34' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CameraIcon = ({ size = 24, color = '#141B34' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3.5 8C3.5 6.89543 4.39543 6 5.5 6H7.3C7.83 6 8.34 5.79 8.71 5.41L9.49 4.59C9.86 4.21 10.37 4 10.9 4H13.1C13.63 4 14.14 4.21 14.51 4.59L15.29 5.41C15.66 5.79 16.17 6 16.7 6H18.5C19.6046 6 20.5 6.89543 20.5 8V17C20.5 18.1046 19.6046 19 18.5 19H5.5C4.39543 19 3.5 18.1046 3.5 17V8Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="12.5" r="3.25" stroke={color} strokeWidth={1.5} />
    <Circle cx="17" cy="9" r="0.75" fill={color} />
  </Svg>
);

const ChevronRightIcon = ({ size = 16, color = '#000000' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18L15 12L9 6"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CloseCircleIcon = ({ size = 18 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Circle cx="10" cy="10" r="10" fill="rgba(204, 41, 41, 0.95)" />
    <Path
      d="M6.5 6.5L13.5 13.5M13.5 6.5L6.5 13.5"
      stroke="#FFFFFF"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CheckmarkRadio = ({ checked = false, size = 24 }: { checked?: boolean; size?: number }) => {
  if (checked) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="12" fill="rgba(0, 8, 20, 0.96)" />
        <Path
          d="M7.5 12L10.5 15L16.5 9"
          stroke="#FFFFFF"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="11.25"
        stroke="rgba(192, 192, 204, 0.96)"
        strokeWidth={1.5}
        fill="none"
      />
    </Svg>
  );
};

export interface ReportBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (reportData: any) => void;
}

export const ReportBottomSheet: React.FC<ReportBottomSheetProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const isSubmitEnabled =
    selectedOption !== null ||
    title.trim().length > 0 ||
    description.trim().length > 0;

  const handleAddPhoto = async () => {
    if (uploadedPhotos.length >= 4) {
      Alert.alert('Limit Reached', 'You can upload a maximum of 4 photos.');
      return;
    }

    const pickFromLibrary = async () => {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Please grant photo library access to upload photos.');
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
          setUploadedPhotos((prev) => [...prev, result.assets[0].uri]);
        }
      } catch (err) {
        console.warn('Error launching image library:', err);
      }
    };

    const takeWithCamera = async () => {
      try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Please grant camera access to take photos.');
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
          setUploadedPhotos((prev) => [...prev, result.assets[0].uri]);
        }
      } catch (err) {
        console.warn('Error launching camera:', err);
      }
    };

    if (Platform.OS === 'web') {
      await pickFromLibrary();
      return;
    }

    Alert.alert(
      'Upload Photo',
      'Select a photo from your gallery or take a new one',
      [
        { text: 'Take Photo', onPress: takeWithCamera },
        { text: 'Choose from Gallery', onPress: pickFromLibrary },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!isSubmitEnabled) return;
    if (onSubmit) {
      const finalTitle =
        title.trim() ||
        (selectedOption
          ? selectedOption === 'environment'
            ? 'Environment'
            : 'Over Hyped price'
          : 'Report Issue');
      onSubmit({
        selectedOption,
        title: finalTitle,
        description: description.trim(),
        photos: uploadedPhotos,
      });
    }
    handleClose();
  };

  const handleClose = () => {
    setSelectedOption(null);
    setShowMore(false);
    setTitle('');
    setDescription('');
    setUploadedPhotos([]);
    onClose();
  };

  const toggleOption = (option: string) => {
    setSelectedOption((prev) => (prev === option ? null : option));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.dismissArea}
          onPress={handleClose}
          activeOpacity={1}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.bottomSheetContainer}
        >
          <View style={styles.bottomSheet}>
            {/* Header Area */}
            <View style={styles.header}>
              {/* Top Icons Row: Officer icon on left (40x40), Close button on right (40x40) */}
              <View style={styles.topIconsRow}>
                <Image
                  source={require('../../assets/images/custom/report_officer.png')}
                  style={styles.officerImage}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeBtn}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <CloseIcon size={24} color="#141B34" />
                </TouchableOpacity>
              </View>

              {/* Frame 1000006474: Title & Subtitle */}
              <View style={styles.titleSection}>
                <Text style={styles.reportTitle}>Report</Text>
                <Text style={styles.reportSubtitle}>
                  Report any issue on to the service or service provider.
                </Text>
              </View>

              {/* Line 185: Divider */}
              <View style={styles.divider} />
            </View>

            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              style={styles.scrollView}
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: 24 },
              ]}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              bounces={false}
            >
              {/* Option 1: Environment */}
              <TouchableOpacity
                style={styles.optionCard}
                activeOpacity={0.7}
                onPress={() => toggleOption('environment')}
              >
                <View style={styles.optionCaption}>
                  <Text style={styles.optionTitle}>Environment</Text>
                  <Text style={styles.optionDesc}>
                    location is unhealthy and different for listed
                  </Text>
                </View>
                <CheckmarkRadio checked={selectedOption === 'environment'} size={24} />
              </TouchableOpacity>

              {/* Option 2: Over Hyped price */}
              <TouchableOpacity
                style={styles.optionCard}
                activeOpacity={0.7}
                onPress={() => toggleOption('price')}
              >
                <View style={styles.optionCaption}>
                  <Text style={styles.optionTitle}>Over Hyped price</Text>
                  <Text style={styles.optionDesc}>
                    The price tag is not the same as listed
                  </Text>
                </View>
                <CheckmarkRadio checked={selectedOption === 'price'} size={24} />
              </TouchableOpacity>

              {/* Collapsed State: "see more >" */}
              {!showMore ? (
                <TouchableOpacity
                  style={styles.seeMoreBtn}
                  activeOpacity={0.7}
                  onPress={() => setShowMore(true)}
                >
                  <Text style={styles.seeMoreText}>see more</Text>
                  <ChevronRightIcon size={16} color="#000000" />
                </TouchableOpacity>
              ) : (
                /* Expanded State: "Others" Section */
                <View style={styles.othersSection}>
                  <Text style={styles.othersHeader}>Others</Text>

                  <Text style={styles.reportTitleLabel}>Report Title</Text>
                  <View style={styles.reportTitleInputWrapper}>
                    <TextInput
                      style={styles.reportTitleInput}
                      placeholder="Write report heading eg. Hygiene"
                      placeholderTextColor="rgba(192, 192, 204, 0.96)"
                      value={title}
                      onChangeText={setTitle}
                      maxLength={60}
                      onFocus={() => {
                        setTimeout(() => {
                          scrollViewRef.current?.scrollToEnd({ animated: true });
                        }, 200);
                      }}
                    />
                  </View>

                  <View style={styles.commentFieldWrapper}>
                    <TextInput
                      style={styles.commentField}
                      placeholder="Write report here"
                      placeholderTextColor="rgba(192, 192, 204, 0.96)"
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      textAlignVertical="top"
                      onFocus={() => {
                        setTimeout(() => {
                          scrollViewRef.current?.scrollToEnd({ animated: true });
                        }, 200);
                      }}
                    />
                  </View>

                  {/* report image frame: 4 camera upload boxes */}
                  <View style={styles.reportImageFrame}>
                    {uploadedPhotos.map((photoUri, index) => (
                      <View key={`report-photo-${index}`} style={styles.photoThumbWrapper}>
                        <View style={styles.photoThumbInner}>
                          <Image
                            source={{ uri: photoUri }}
                            style={styles.photoThumb}
                            resizeMode="cover"
                          />
                        </View>
                        <TouchableOpacity
                          style={styles.removePhotoButton}
                          activeOpacity={0.8}
                          onPress={() => handleRemovePhoto(index)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <CloseCircleIcon size={18} />
                        </TouchableOpacity>
                      </View>
                    ))}

                    {Array.from({ length: Math.max(0, 4 - uploadedPhotos.length) }).map(
                      (_, idx) => (
                        <TouchableOpacity
                          key={`empty-camera-${idx}`}
                          style={styles.cameraBox}
                          activeOpacity={0.7}
                          onPress={handleAddPhoto}
                        >
                          <CameraIcon size={24} color="#141B34" />
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Filled action Button (Submit) */}
            <View
              style={[
                styles.submitContainer,
                { paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 24 : 16) },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  !isSubmitEnabled && styles.submitBtnDisabled,
                ]}
                activeOpacity={isSubmitEnabled ? 0.8 : 1}
                onPress={handleSubmit}
                disabled={!isSubmitEnabled}
              >
                <Text
                  style={[
                    styles.submitBtnText,
                    !isSubmitEnabled && styles.submitBtnTextDisabled,
                  ]}
                >
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  bottomSheetContainer: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.90,
    justifyContent: 'flex-end',
  },
  /* complain bottom sheet */
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.90,
    overflow: 'hidden',
  },
  scrollView: {
    flexGrow: 0,
    flexShrink: 1,
  },
  header: {
    width: '100%',
    paddingTop: 16,
  },
  topIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 40,
  },
  /* Rectangle 300 */
  officerImage: {
    width: 40,
    height: 40,
  },
  /* close button */
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  /* Frame 1000006474 */
  titleSection: {
    paddingHorizontal: 16,
    marginTop: 6,
    gap: 8,
    width: '100%',
  },
  /* Report */
  reportTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: '#000000',
  },
  /* Report any issue on to the service or service provider. */
  reportSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  /* Line 185 */
  divider: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    width: '100%',
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 8,
  },
  /* experience option button & value for money option button */
  optionCard: {
    width: '100%',
    height: 68,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  /* caption */
  optionCaption: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    paddingRight: 12,
  },
  /* Environment & Over Hyped price */
  optionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.4,
    color: '#000000',
  },
  /* location is unhealthy... & The price tag is not the same... */
  optionDesc: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  seeMoreBtn: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 0,
    marginBottom: 40,
  },
  seeMoreText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.4,
    color: '#000000',
  },
  /* Others Section */
  othersSection: {
    width: '100%',
    marginTop: 0,
    marginBottom: 40,
  },
  /* Others */
  othersHeader: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: '#000000',
    marginBottom: 40,
  },
  /* Report Title */
  reportTitleLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.4,
    color: '#000000',
    marginBottom: 16,
  },
  /* Frame 1000006475 */
  reportTitleInputWrapper: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginBottom: 24,
  },
  reportTitleInput: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
    padding: 0,
  },
  /* comment field */
  commentFieldWrapper: {
    width: '100%',
    height: 185,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
  },
  commentField: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: '#000000',
    height: '100%',
    padding: 0,
  },
  /* report image frame */
  reportImageFrame: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  /* image frame */
  cameraBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  photoThumbWrapper: {
    width: 48,
    height: 48,
    position: 'relative',
  },
  photoThumbInner: {
    width: 48,
    height: 48,
    borderRadius: 16,
    overflow: 'hidden',
  },
  photoThumb: {
    width: 48,
    height: 48,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    zIndex: 10,
  },
  /* Filled action Button */
  submitContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.8)',
  },
  submitBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  /* Empty state */
  submitBtnDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  submitBtnText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  submitBtnTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
});
