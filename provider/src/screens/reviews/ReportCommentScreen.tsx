import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Path, Circle } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';

import { useReviews } from '../../context/ReviewsContext';
import { ReviewBody } from '../../components/reviews/ReviewBody';
import { ProviderPhotoUploadSheet } from '../../components/ProviderPhotoUploadSheet';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { MOCK_SAMPLE_REVIEWS } from '../../constants/reviews.config';

const FONT_MEDIUM = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_500Medium',
  default: 'DMSans_500Medium',
});

const FONT_REGULAR = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_400Regular',
  default: 'DMSans_400Regular',
});

/**
 * 24x24 Vector arrow-left-02 Back Icon
 */
function ArrowLeft02Icon({
  size = 24,
  color = 'rgba(0, 8, 20, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
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

/**
 * 24x24 Vector camera-01 Icon
 */
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
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 16.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="17.5" cy="9.5" r="0.75" fill={color} />
    </Svg>
  );
}

/**
 * 24x24 Vector circle-x Red Delete Badge Icon matching Frame P4 & P5
 */
function CircleXBadgeIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill="rgba(204, 41, 41, 0.9)" />
      <Path
        d="M15 9l-6 6M9 9l6 6"
        stroke="#FFFFFF"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export const ReportCommentScreen: React.FC = () => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { getReviewById, reportReview } = useReviews();

  // ScrollView reference to scroll to first invalid field on error
  const scrollRef = useRef<ScrollView>(null);

  // Retrieve the review being reported (fallback to sample review 3 if not found)
  const review = (id ? getReviewById(id) : undefined) || MOCK_SAMPLE_REVIEWS[2];

  // Local form state
  const [reportTitle, setReportTitle] = useState('');
  const [reportText, setReportText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isPhotoSheetVisible, setIsPhotoSheetVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field validation
  const isTitleValid = reportTitle.trim().length > 0;
  const isTextValid = reportText.trim().length > 0;
  const isFormValid = isTitleValid && isTextValid;

  const showTitleError = hasAttemptedSubmit && !isTitleValid;
  const showTextError = hasAttemptedSubmit && !isTextValid;

  const handleBack = useCallback(() => {
    if (isSubmitting) return;
    safeRouter.back();
  }, [safeRouter, isSubmitting]);

  // Photo handlers
  const handleOpenPhotoSheet = useCallback(() => {
    if (photos.length >= 4) return;
    setIsPhotoSheetVisible(true);
  }, [photos.length]);

  const handleClosePhotoSheet = useCallback(() => {
    setIsPhotoSheetVisible(false);
  }, []);

  const handleCameraCapture = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to capture photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotos((prev) => [...prev, result.assets[0].uri].slice(0, 4));
      }
    } catch (e) {
      // Ignore picker cancel/failure
    } finally {
      setIsPhotoSheetVisible(false);
    }
  }, []);

  const handleChooseFromLibrary = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Media library permission is required to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 4 - photos.length,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUris = result.assets.map((a) => a.uri);
        setPhotos((prev) => [...prev, ...newUris].slice(0, 4));
      }
    } catch (e) {
      // Ignore picker cancel/failure
    } finally {
      setIsPhotoSheetVisible(false);
    }
  }, [photos.length]);

  const handleRemovePhoto = useCallback((indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  }, []);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    if (!isFormValid) {
      setHasAttemptedSubmit(true);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    try {
      setIsSubmitting(true);
      await reportReview({
        reviewId: review.id,
        title: reportTitle.trim(),
        report: reportText.trim(),
        images: photos,
      });

      // Clear local state
      setReportTitle('');
      setReportText('');
      setPhotos([]);
      setHasAttemptedSubmit(false);

      // Navigate to Successful Screen
      safeRouter.replace('/clients-review/success' as any);
    } catch {
      // TODO (Backend): handle failure
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, isFormValid, reportReview, review.id, reportTitle, reportText, photos, safeRouter]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {/* ── Fixed Top Page Header (64px) ── */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={handleBack}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Go back to clients review"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft02Icon size={24} />
          </TouchableOpacity>

          {/* Centered Title */}
          <Text style={styles.headerTitle} accessibilityRole="header">
            Report Comment
          </Text>

          {/* Invisible Spacer */}
          <View style={styles.headerSpacer} pointerEvents="none" />
        </View>
      </View>

      {/* ── Main Keyboard-Aware Content ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 80 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Section: Reported Comment */}
          <Text style={styles.sectionHeadingGrey}>Reported comment</Text>

          {/* Quoted Review Card (using ReviewBody without ⋮ or Reply) */}
          <View style={styles.quotedReviewCard}>
            <ReviewBody review={review} hideTimestamp={false} />
          </View>

          {/* Line 186: Thin Divider */}
          <View style={styles.dividerLine} />

          {/* Section: Report Title */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabelBlack}>Report Title</Text>
            <View
              style={[
                styles.titleInputContainer,
                showTitleError && styles.inputErrorBorder,
              ]}
            >
              <TextInput
                style={styles.textInputSingle}
                placeholder="E.g. Scammer"
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                value={reportTitle}
                onChangeText={(val) => {
                  setReportTitle(val);
                  if (hasAttemptedSubmit && val.trim().length > 0) {
                    // clear error as soon as user types
                  }
                }}
                editable={!isSubmitting}
                accessibilityLabel="Report Title"
              />
            </View>
            {showTitleError && (
              <Text
                style={styles.errorText}
                accessibilityLiveRegion="polite"
              >
                Enter report title
              </Text>
            )}
          </View>

          {/* Section: Write Report */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabelBlack}>Write Report</Text>
            <View
              style={[
                styles.textareaContainer,
                showTextError && styles.inputErrorBorder,
              ]}
            >
              <TextInput
                style={styles.textInputMulti}
                placeholder="Write your complaint here"
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                value={reportText}
                onChangeText={(val) => {
                  setReportText(val);
                }}
                multiline
                textAlignVertical="top"
                editable={!isSubmitting}
                accessibilityLabel="Write Report"
              />
            </View>
            {showTextError && (
              <Text
                style={styles.errorText}
                accessibilityLiveRegion="polite"
              >
                Enter your report
              </Text>
            )}
          </View>

          {/* Section: Photos (Row of 4 Slots) */}
          <View style={styles.photosSection}>
            <View style={styles.photosRow}>
              {[0, 1, 2, 3].map((slotIndex) => {
                const photoUri = photos[slotIndex];
                const isFilled = Boolean(photoUri);

                if (isFilled) {
                  return (
                    <View key={`photo-slot-${slotIndex}`} style={styles.photoSlotContainer}>
                      <Image
                        source={{ uri: photoUri }}
                        style={styles.photoSlotImage}
                        resizeMode="cover"
                      />
                      {/* Red ✕ badge button to remove photo */}
                      <TouchableOpacity
                        style={styles.removeBadgeButton}
                        activeOpacity={0.8}
                        onPress={() => handleRemovePhoto(slotIndex)}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove photo ${slotIndex + 1}`}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <CircleXBadgeIcon size={24} />
                      </TouchableOpacity>
                    </View>
                  );
                }

                // Empty Slot
                return (
                  <TouchableOpacity
                    key={`photo-slot-${slotIndex}`}
                    style={styles.emptySlotContainer}
                    activeOpacity={0.8}
                    onPress={handleOpenPhotoSheet}
                    accessibilityRole="button"
                    accessibilityLabel={`Add photo slot ${slotIndex + 1}`}
                  >
                    <CameraIcon size={24} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* ── Sticky Bottom Submit Button ── */}
        <View
          style={[
            styles.footerContainer,
            { paddingBottom: insets.bottom + 16 },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.submitButton,
              isFormValid ? styles.submitButtonActive : styles.submitButtonDisabled,
            ]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Submit report"
          >
            <Text
              style={[
                styles.submitButtonText,
                isFormValid ? styles.submitButtonTextActive : styles.submitButtonTextDisabled,
              ]}
            >
              Submit
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ── 4-Dot Dimmed Loading Overlay (Frame P6) ── */}
      <LoadingOverlay
        visible={isSubmitting}
        dotsCount={4}
        paddingTop={429}
        dotSize={16}
        dotGap={20}
        overlayOpacity={0.1}
      />

      {/* ── Photo Upload Action Sheet ── */}
      <ProviderPhotoUploadSheet
        visible={isPhotoSheetVisible}
        onClose={handleClosePhotoSheet}
        onOpenCamera={handleCameraCapture}
        onChoosePhotos={handleChooseFromLibrary}
        onSelectFile={handleChooseFromLibrary}
      />

      {/* Native Dock Spacer */}
      <NativeDockSpacer />
    </SafeAreaView>
  );
};

export default ReportCommentScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    width: '100%',
    height: 64,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  headerSpacer: {
    width: 48,
    height: 48,
    opacity: 0,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeadingGrey: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
    marginBottom: 8,
    includeFontPadding: false,
  },
  quotedReviewCard: {
    width: '100%',
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  dividerLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginVertical: 16,
  },
  inputSection: {
    width: '100%',
    marginBottom: 20,
    gap: 8,
  },
  inputLabelBlack: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    includeFontPadding: false,
  },
  titleInputContainer: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textInputSingle: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
    includeFontPadding: false,
  },
  textareaContainer: {
    width: '100%',
    height: 141,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textInputMulti: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingTop: 0,
    paddingBottom: 0,
    includeFontPadding: false,
  },
  inputErrorBorder: {
    borderColor: 'rgba(204, 41, 41, 0.9)',
  },
  errorText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(204, 41, 41, 0.9)',
    marginTop: 2,
    includeFontPadding: false,
  },
  photosSection: {
    width: '100%',
    marginTop: 8,
    marginBottom: 24,
  },
  photosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    height: 48,
  },
  photoSlotContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    position: 'relative',
  },
  photoSlotImage: {
    width: 48,
    height: 48,
    borderRadius: 16,
  },
  removeBadgeButton: {
    position: 'absolute',
    top: -7,
    right: -7,
    zIndex: 10,
  },
  emptySlotContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderStyle: 'solid',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  footerContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
  },
  submitButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    shadowColor: 'rgba(133, 139, 148, 0.16)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  submitButtonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  submitButtonTextActive: {
    color: '#FFFFFF',
  },
  submitButtonTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
});
