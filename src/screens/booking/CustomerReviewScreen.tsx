import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
  Modal,
  Image,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { SafeImage } from '../../components/ui/SafeImage';
import * as ImagePicker from 'expo-image-picker';
import { typography } from '../../constants/theme';

// ── Exact Figma Vector Icons ──

const ArrowLeftIcon = ({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4.5 12H19.5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 18C10 18 4.5 13.58 4.5 12C4.5 10.42 10 6 10 6"
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
      d="M2 19V8C2 6.89543 2.89543 6 4 6H7.5L9 3.5H15L16.5 6H20C21.1046 6 22 6.89543 22 8V19C22 20.1046 21.1046 21 20 21H4C2.89543 21 2 20.1046 2 19Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="13.5" r="3.5" stroke={color} strokeWidth={1.5} />
  </Svg>
);

const CloseCircleIcon = ({ size = 18 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Circle cx="10" cy="10" r="10" fill="rgba(204, 41, 41, 0.95)" />
    <Path
      d="M6.5 6.5L13.5 13.5M13.5 6.5L6.5 13.5"
      stroke="#FFFFFF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const StarIcon = ({
  size = 32,
  filled = false,
  color = 'rgba(192, 192, 204, 0.96)',
  fillColor = 'rgba(248, 155, 24, 0.96)',
}: {
  size?: number;
  filled?: boolean;
  color?: string;
  fillColor?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2.5L15.09 8.76L22 9.77L17 14.64L18.18 21.52L12 18.27L5.82 21.52L7 14.64L2 9.77L8.91 8.76L12 2.5Z"
      stroke={filled ? fillColor : color}
      strokeWidth={1.5}
      fill={filled ? fillColor : 'none'}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Satisfying Vote Option Definition ──
interface SatisfyingOption {
  id: string;
  label: string;
  emoji: string;
}

const SATISFYING_OPTIONS: SatisfyingOption[] = [
  { id: 'professionalism', label: 'Professionalism', emoji: '💼' },
  { id: 'speed', label: 'Speed', emoji: '🚀' },
  { id: 'cleanness', label: 'Cleanness', emoji: '✨' },
  { id: 'establishment', label: 'Establishment', emoji: '🏛️' },
  { id: 'price_accuracy', label: 'Price Accuracy', emoji: '💰' },
  { id: 'hospitality', label: 'Hospitality', emoji: '🥂' },
  { id: 'location_finding', label: 'Location Finding', emoji: '🧭' },
  { id: 'comfort', label: 'Comfort', emoji: '🛋️' },
  { id: 'communication', label: 'Communication', emoji: '🗣️' },
  { id: 'customer_care', label: 'Customer Care', emoji: '🤝' },
];

export const CustomerReviewScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const salonName = (params.salonName as string) || 'Luminous Lux';
  const specialistName = (params.specialistName as string) || 'Precious Emmanuel';
  const specialistRole = (params.specialistRole as string) || 'Hair stylist';

  // ── States (Clean Empty Initial State) ──
  // 1. General Experience Comment & Uploads
  const [experienceComment, setExperienceComment] = useState<string>('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  // 2. Experience Rating (1 to 5)
  // 0: None, 1: Fair, 2: Okay, 3: Average, 4: Good, 5: Excellent
  const [experienceRating, setExperienceRating] = useState<number>(0);

  // 3. Specialist Rating & Comment
  // 0: None, 1: Newbie, 2: Armature, 3: Average, 4: Excellent, 5: Expert
  const [specialistRating, setSpecialistRating] = useState<number>(0);
  const [specialistComment, setSpecialistComment] = useState<string>('');

  // 4. Satisfying Location Tags
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // 5. Success Dialog Modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // ── Handlers ──
  const handleGoBack = () => {
    router.replace('/home/bookings' as any);
  };

  const handleAddPhoto = async () => {
    if (uploadedPhotos.length >= 4) {
      Alert.alert('Limit Reached', 'You can upload a maximum of 4 photos.');
      return;
    }

    const pickFromLibrary = async () => {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission required',
            'Please grant photo library access to upload photos.'
          );
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
          Alert.alert(
            'Permission required',
            'Please grant camera access to take photos.'
          );
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
      'Upload Image',
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

  const handleSelectExperienceRating = (level: number) => {
    setExperienceRating((prev) => (prev === level ? 0 : level));
  };

  const handleSelectSpecialistRating = (level: number) => {
    setSpecialistRating((prev) => (prev === level ? 0 : level));
  };

  const handleToggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmitFeedback = () => {
    if (
      experienceRating === 0 &&
      !experienceComment.trim() &&
      specialistRating === 0 &&
      !specialistComment.trim()
    ) {
      Alert.alert(
        'Review Required',
        'Please select a rating or write a comment before submitting.'
      );
      return;
    }
    setIsSuccessModalOpen(true);
  };

  const handleDismissSuccess = () => {
    setIsSuccessModalOpen(false);
    router.replace('/home/bookings' as any);
  };

  // Experience level labels
  const experienceLevels = [
    { level: 1, label: 'Fair' },
    { level: 2, label: 'Okay' },
    { level: 3, label: 'Average' },
    { level: 4, label: 'Good' },
    { level: 5, label: 'Excellent' },
  ];

  // Specialist level labels
  const specialistLevels = [
    { level: 1, label: 'Newbie' },
    { level: 2, label: 'Armature' },
    { level: 3, label: 'Average' },
    { level: 4, label: 'Excellent' },
    { level: 5, label: 'Expert' },
  ];

  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
  const [comment1Y, setComment1Y] = useState<number>(0);
  const [comment2Y, setComment2Y] = useState<number>(0);
  const scrollViewRef = useRef<ScrollView>(null);

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Top Page Header (Figma: height 64px, borderBottom 1px) ── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeftIcon size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Customer Review</Text>

        <View style={styles.headerPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* ── Scrollable Review Body ── */}
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + (isKeyboardVisible ? 360 : 90) },
          ]}
        >
        {/* ══════════════════════════════════════════════════════════
            SECTION 1: Comment your experience
        ══════════════════════════════════════════════════════════ */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Comment your experience</Text>
          <Text style={styles.sectionSubtitle}>
            Your comment will help the service provider improve its work and services.
          </Text>

          {/* Salon Comment Box */}
          <View
            style={styles.commentBoxContainer}
            onLayout={(e) => setComment1Y(e.nativeEvent.layout.y)}
          >
            <TextInput
              style={[
                styles.commentInput,
                Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
              ]}
              placeholder={`Tap to add comment about ${salonName}`}
              placeholderTextColor="rgba(96, 96, 102, 0.6)"
              multiline
              value={experienceComment}
              onChangeText={setExperienceComment}
              onFocus={() => {
                setTimeout(() => {
                  if (comment1Y > 0) {
                    scrollViewRef.current?.scrollTo({
                      y: Math.max(0, comment1Y - 20),
                      animated: true,
                    });
                  }
                }, 200);
              }}
              textAlignVertical="top"
            />
          </View>

          {/* Upload Photo Slots Row (4 slots: 48x48) */}
          <View style={styles.photoSlotsRow}>
            {uploadedPhotos.map((photoUri, idx) => (
              <View key={`photo-${idx}`} style={styles.uploadedPhotoWrapper}>
                <View style={styles.photoThumbnailContainer}>
                  <Image
                    source={typeof photoUri === 'string' ? { uri: photoUri } : photoUri}
                    style={styles.photoThumbnail}
                    resizeMode="cover"
                  />
                </View>
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  activeOpacity={0.8}
                  onPress={() => handleRemovePhoto(idx)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <CloseCircleIcon size={18} />
                </TouchableOpacity>
              </View>
            ))}

            {Array.from({ length: Math.max(0, 4 - uploadedPhotos.length) }).map((_, idx) => (
              <TouchableOpacity
                key={`empty-slot-${idx}`}
                style={styles.emptyPhotoSlot}
                activeOpacity={0.7}
                onPress={handleAddPhoto}
              >
                <CameraIcon size={22} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════
            SECTION 2: Rate your experience
        ══════════════════════════════════════════════════════════ */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Rate your experience</Text>

          {/* 5 Rating Boxes: 64x72, radius 8px */}
          <View style={styles.ratingBoxesRow}>
            {experienceLevels.map((item) => {
              const isSelected = experienceRating >= item.level && experienceRating > 0;
              return (
                <TouchableOpacity
                  key={`exp-${item.level}`}
                  style={[
                    styles.ratingBox,
                    isSelected ? styles.ratingBoxSelected : styles.ratingBoxUnselected,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => handleSelectExperienceRating(item.level)}
                >
                  <StarIcon
                    size={28}
                    filled={isSelected}
                    fillColor="rgba(248, 155, 24, 0.96)"
                    color="rgba(192, 192, 204, 0.96)"
                  />
                  <Text style={styles.ratingCaptionText}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════
            SECTION 3: Rate & Comment Specialist
        ══════════════════════════════════════════════════════════ */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Rate & Comment Specialist</Text>

          {/* Specialist Profile Card (Figma: 358x112, radius 24px) */}
          <View style={styles.specialistCard}>
            <View style={styles.specialistAvatarFrame}>
              <SafeImage
                source={require('../../../assets/images/profile/4a9734255fadfce341e3a5e71b654fbd1e477662.jpg')}
                style={styles.specialistAvatar}
                resizeMode="cover"
              />
            </View>

            <View style={styles.specialistInfoCol}>
              <Text style={styles.specialistNameText}>{specialistName}</Text>
              <Text style={styles.specialistRoleText}>{specialistRole}</Text>

              {/* 5 Star Rating Preview */}
              <View style={styles.miniStarRow}>
                {[1, 2, 3, 4, 5].map((starIdx) => (
                  <TouchableOpacity
                    key={`spec-star-${starIdx}`}
                    activeOpacity={0.7}
                    onPress={() => handleSelectSpecialistRating(starIdx)}
                    hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                  >
                    <StarIcon
                      size={16}
                      filled={specialistRating >= starIdx && specialistRating > 0}
                      fillColor="rgba(248, 155, 24, 0.96)"
                      color="rgba(192, 192, 204, 0.96)"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Specialist Rating 5 Level Boxes */}
          <View style={styles.ratingBoxesRow}>
            {specialistLevels.map((item) => {
              const isSelected = specialistRating >= item.level && specialistRating > 0;
              return (
                <TouchableOpacity
                  key={`spec-level-${item.level}`}
                  style={[
                    styles.ratingBox,
                    isSelected ? styles.ratingBoxSelected : styles.ratingBoxUnselected,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => handleSelectSpecialistRating(item.level)}
                >
                  <StarIcon
                    size={28}
                    filled={isSelected}
                    fillColor="rgba(248, 155, 24, 0.96)"
                    color="rgba(192, 192, 204, 0.96)"
                  />
                  <Text style={styles.ratingCaptionText}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Specialist Comment Box */}
          <View
            style={styles.commentBoxContainer}
            onLayout={(e) => setComment2Y(e.nativeEvent.layout.y)}
          >
            <TextInput
              style={[
                styles.commentInput,
                Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
              ]}
              placeholder={`Add comment about ${specialistName.split(' ')[0]}`}
              placeholderTextColor="rgba(96, 96, 102, 0.6)"
              multiline
              value={specialistComment}
              onChangeText={setSpecialistComment}
              onFocus={() => {
                setTimeout(() => {
                  if (comment2Y > 0) {
                    scrollViewRef.current?.scrollTo({
                      y: Math.max(0, comment2Y - 20),
                      animated: true,
                    });
                  } else {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }
                }, 200);
              }}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════
            SECTION 4: Vote on what you think was satisfying
        ══════════════════════════════════════════════════════════ */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>
            Vote on what you think was satisfying about this location.
          </Text>
          <Text style={styles.sectionSubtitle}>
            Your vote will help the service provider adjust its establishment
          </Text>

          {/* Tag Pill Chips Grid (2 Columns, Balanced Full Width) */}
          <View style={styles.tagsGrid}>
            {SATISFYING_OPTIONS.reduce<SatisfyingOption[][]>((rows, tag, index) => {
              if (index % 2 === 0) {
                rows.push([tag]);
              } else {
                rows[rows.length - 1].push(tag);
              }
              return rows;
            }, []).map((pair, rowIndex) => (
              <View key={`tag-row-${rowIndex}`} style={styles.tagsRow}>
                {pair.map((tag) => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <TouchableOpacity
                      key={tag.id}
                      style={[
                        styles.tagPillButton,
                        isSelected ? styles.tagPillSelected : styles.tagPillUnselected,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => handleToggleTag(tag.id)}
                    >
                      <Text style={styles.tagEmojiText}>{tag.emoji}</Text>
                      <Text
                        style={[
                          styles.tagLabelText,
                          isSelected ? styles.tagLabelSelected : styles.tagLabelUnselected,
                        ]}
                        numberOfLines={1}
                      >
                        {tag.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════
            SECTION 5: Appreciation Footer
        ══════════════════════════════════════════════════════════ */}
        <View style={styles.appreciationRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.appreciationText}>Thank you for your time 🙏</Text>
          <View style={styles.dividerLine} />
        </View>
      </ScrollView>

      {/* ── Sticky Bottom Action Bar (Figma: height 60px, Submit Feedback) ── */}
      {!isKeyboardVisible && (
        <View style={[styles.bottomActionBar, { paddingBottom: Math.max(16, insets.bottom) }]}>
          <TouchableOpacity
            style={styles.submitButton}
            activeOpacity={0.85}
            onPress={handleSubmitFeedback}
          >
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          </TouchableOpacity>
        </View>
      )}
      </KeyboardAvoidingView>

      {/* ── Review Submitted Success Modal ── */}
      <Modal
        visible={isSuccessModalOpen}
        transparent
        animationType="fade"
        onRequestClose={handleDismissSuccess}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.successModalCard}>
            <View style={styles.successStarContainer}>
              <StarIcon size={44} filled fillColor="rgba(248, 155, 24, 0.96)" />
            </View>
            <Text style={styles.successTitle}>Review Submitted!</Text>
            <Text style={styles.successSubtitle}>
              Thank you for sharing your feedback. Your review helps us and the service provider
              deliver better quality services.
            </Text>

            <TouchableOpacity
              style={styles.successDoneButton}
              activeOpacity={0.85}
              onPress={handleDismissSuccess}
            >
              <Text style={styles.successDoneButtonText}>Back to Bookings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header ──
  headerRow: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerPlaceholder: {
    width: 48,
    height: 48,
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Scroll Content ──
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 36,
  },

  // ── Section Container ──
  sectionBlock: {
    gap: 14,
  },
  sectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  sectionSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Comment Box (Figma: 358x126, radius 24px, bg #F7F7F7) ──
  commentBoxContainer: {
    width: '100%',
    height: 126,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    padding: 16,
  },
  commentInput: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(0, 8, 20, 0.96)',
    borderWidth: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: 'transparent',
  },

  // ── Photo Upload Slots (Figma: 48x48, radius 16px) ──
  photoSlotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 4,
  },
  uploadedPhotoWrapper: {
    width: 48,
    height: 48,
    position: 'relative',
  },
  photoThumbnailContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  photoThumbnail: {
    width: 48,
    height: 48,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    zIndex: 10,
  },
  emptyPhotoSlot: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  // ── Rating Boxes (Figma: 64x72, radius 8px, gap 10) ──
  ratingBoxesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  ratingBox: {
    flex: 1,
    height: 72,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
    backgroundColor: '#FFFFFF',
  },
  ratingBoxUnselected: {
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
  },
  ratingBoxSelected: {
    borderWidth: 1,
    borderColor: 'rgba(248, 155, 24, 0.96)',
  },
  ratingCaptionText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
    color: '#000000',
  },

  // ── Specialist Card (Figma: 358x112, radius 24px) ──
  specialistCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FFFFFF',
  },
  specialistAvatarFrame: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  specialistAvatar: {
    width: '100%',
    height: '100%',
  },
  specialistInfoCol: {
    flex: 1,
    gap: 4,
  },
  specialistNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  specialistRoleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  miniStarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },

  // ── Satisfying Tag Pill Chips (2 Columns, Balanced Full Width) ──
  tagsGrid: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  tagPillButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  tagPillUnselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
  },
  tagPillSelected: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  tagEmojiText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
  },
  tagLabelText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  tagLabelUnselected: {
    color: 'rgba(0, 8, 20, 0.96)',
  },
  tagLabelSelected: {
    color: '#FFFFFF',
  },

  // ── Appreciation Footer ──
  appreciationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  appreciationText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: '#000000',
  },

  // ── Sticky Bottom Action Bar (Figma: height 60px) ──
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  submitButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.15)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 4,
  },
  submitButtonText: {
    ...typography.button,
    textTransform: 'capitalize',
    color: '#FFFFFF',
  },

  // ── Success Modal ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 8, 20, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successModalCard: {
    width: '100%',
    maxWidth: 326,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    gap: 12,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 10,
  },
  successStarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(248, 155, 24, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  successTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#000814',
    textAlign: 'center',
  },
  successSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  successDoneButton: {
    width: '100%',
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  successDoneButtonText: {
    ...typography.button,
    fontSize: 15,
    color: '#FFFFFF',
  },
});

export default CustomerReviewScreen;
