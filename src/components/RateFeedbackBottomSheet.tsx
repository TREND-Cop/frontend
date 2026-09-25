import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { typography } from '../constants/theme';

// ── Storage Keys ──
const STORAGE_KEY_HAS_RATED = '@trend_has_rated_app';
const STORAGE_KEY_LAST_PROMPT_TIME = '@trend_last_rate_prompt_time';

// ── Rating Levels (Figma: 5 options) ──
interface RatingOption {
  id: number;
  label: string;
}

const RATING_OPTIONS: RatingOption[] = [
  { id: 1, label: 'Fair' },
  { id: 2, label: 'Okay' },
  { id: 3, label: 'Average' },
  { id: 4, label: 'Good' },
  { id: 5, label: 'Excellent' },
];

// ── Star Icon (Figma: 32x32, filled gold rgba(248, 155, 24, 0.96)) ──
const StarIcon = ({ filled }: { filled: boolean }) => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    {filled ? (
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill="rgba(248, 155, 24, 0.96)"
      />
    ) : (
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        stroke="rgba(192, 192, 204, 0.96)"
        strokeWidth={1.5}
        fill="none"
      />
    )}
  </Svg>
);

// ── Helper: Check if user has already rated ──
export const hasUserRated = async (): Promise<boolean> => {
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEY_HAS_RATED);
    return val === 'true';
  } catch {
    return false;
  }
};

// ── Helper: Mark user as rated ──
const markUserAsRated = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_HAS_RATED, 'true');
  } catch {}
};

// ── Helper: Check if enough time has passed for random prompt (8-9 hours) ──
export const shouldShowRandomRatePrompt = async (): Promise<boolean> => {
  try {
    const rated = await AsyncStorage.getItem(STORAGE_KEY_HAS_RATED);
    if (rated === 'true') return false;

    const lastPromptStr = await AsyncStorage.getItem(STORAGE_KEY_LAST_PROMPT_TIME);
    if (!lastPromptStr) {
      // First time — set the time and allow showing
      await AsyncStorage.setItem(STORAGE_KEY_LAST_PROMPT_TIME, Date.now().toString());
      return true;
    }

    const lastPromptTime = parseInt(lastPromptStr, 10);
    const now = Date.now();
    const hoursSinceLastPrompt = (now - lastPromptTime) / (1000 * 60 * 60);

    // Random interval between 8-9 hours
    const randomInterval = 8 + Math.random(); // 8.0 to 9.0 hours

    if (hoursSinceLastPrompt >= randomInterval) {
      await AsyncStorage.setItem(STORAGE_KEY_LAST_PROMPT_TIME, now.toString());
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

// ── Helper: Trigger after booking ──
export const shouldShowPostBookingRatePrompt = async (): Promise<boolean> => {
  try {
    const rated = await AsyncStorage.getItem(STORAGE_KEY_HAS_RATED);
    return rated !== 'true';
  } catch {
    return false;
  }
};

// ── Props ──
interface RateFeedbackBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (rating: number, feedback: string) => void;
}

export const RateFeedbackBottomSheet: React.FC<RateFeedbackBottomSheetProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedRating(null);
      setFeedbackText('');
    }
  }, [visible]);

  const handleSubmit = useCallback(async () => {
    if (selectedRating === null) return;

    // Mark as rated so it won't show again
    await markUserAsRated();

    onSubmit?.(selectedRating, feedbackText.trim());
    onClose();
  }, [selectedRating, feedbackText, onSubmit, onClose]);

  const isSubmitEnabled = selectedRating !== null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Backdrop tap to close */}
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Bottom Sheet Card (Figma: 390x535, borderRadius 24px 24px 0px 0px) */}
        <View style={[styles.sheetContainer, { paddingBottom: Math.max(24, insets.bottom + 16) }]}>
          {/* Close Button (Figma: 30x30, radius 16px, bg rgba(247, 247, 247, 0.96), top-right) */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={24} color="#141B34" strokeWidth={1.5} />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {/* ── Section 1: "What do you think?" + 5 Rating Cards (Figma: 358x124, gap 24px) ── */}
            <View style={styles.rateSection}>
              {/* Figma: "What do you think?" — 20px SF Pro Regular, lineHeight 28, letterSpacing 0.2, color #000000 */}
              <Text style={styles.rateTitleText}>What do you think?</Text>

              {/* 5 Rating Items Row (No outline boxes, pulled together to create room) */}
              <View style={styles.ratingCardsRow}>
                {RATING_OPTIONS.map((option) => {
                  const isSelected = selectedRating !== null && option.id <= selectedRating;
                  const isExactTier = selectedRating === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.ratingCard}
                      activeOpacity={0.7}
                      onPress={() =>
                        setSelectedRating((prev) => (prev === option.id ? null : option.id))
                      }
                    >
                      {/* Star Icon (32x32) */}
                      <StarIcon filled={isSelected} />

                      {/* Label */}
                      <Text
                        style={[
                          styles.ratingCardLabel,
                          isExactTier && styles.ratingCardLabelSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ── Section 2: "Leave a feedback" + Comment Box (Figma: 358x178, gap 24px) ── */}
            <View style={styles.feedbackSection}>
              {/* Figma: "Leave a feedback" — 20px SF Pro Medium, lineHeight 28, letterSpacing 0.2, color rgba(0, 8, 20, 0.96) */}
              <Text style={styles.feedbackTitleText}>Leave a feedback</Text>

              {/* Comment Box (Figma: 358x126, bg rgba(247, 247, 247, 0.96), radius 24px) */}
              <View style={styles.commentBox}>
                <TextInput
                  style={[
                    styles.commentInput,
                    Platform.OS === 'web' && ({ outlineStyle: 'none', borderStyle: 'none' } as any),
                  ]}
                  value={feedbackText}
                  onChangeText={setFeedbackText}
                  placeholder="Tap here to tell the team where to improve"
                  placeholderTextColor="rgba(192, 192, 204, 0.96)"
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                />
              </View>
            </View>

            {/* ── Submit Button (Figma: 358x48, radius 24px, bg rgba(0, 8, 20, 0.96)) ── */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                !isSubmitEnabled && styles.submitButtonDisabled,
              ]}
              activeOpacity={isSubmitEnabled ? 0.85 : 1}
              disabled={!isSubmitEnabled}
              onPress={handleSubmit}
            >
              <Text
                style={[
                  styles.submitButtonText,
                  !isSubmitEnabled && styles.submitButtonTextDisabled,
                ]}
              >
                Submit Feedback
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // ── Modal Overlay ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(65, 63, 63, 0.3)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },

  // ── Bottom Sheet Container (Figma: 390x535, radius 24 24 0 0, bg #FFFFFF, shadow 0px -8px 20px rgba(133, 139, 148, 0.12)) ──
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 44,
    shadowColor: 'rgba(133, 139, 148, 1)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  scrollContent: {
    gap: 40,
    paddingBottom: 8,
  },

  // ── Close Button (Figma: 30x30, radius 16px, bg rgba(247, 247, 247, 0.96), position top-right) ──
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 16,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
    zIndex: 10,
  },

  // ── Section 1: Rate (Figma: 358x124, gap 24px) ──
  rateSection: {
    gap: 24,
  },
  rateTitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
  },

  // ── Rating Items Row (No outlines, pulled together for optimal room) ──
  ratingCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },

  // ── Individual Rating Item ──
  ratingCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    gap: 8,
  },
  ratingCardLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    letterSpacing: 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  ratingCardLabelSelected: {
    fontWeight: '600',
    color: '#000000',
  },

  // ── Section 2: Feedback (Figma: 358x178, gap 24px) ──
  feedbackSection: {
    gap: 24,
  },
  feedbackTitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Comment Box (Figma: 358x126, bg rgba(247, 247, 247, 0.96), radius 24px) ──
  commentBox: {
    height: 126,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
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
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },

  // ── Submit Button (Figma: 358x48, radius 24px, bg rgba(0, 8, 20, 0.96), shadow Hard Shadow) ──
  submitButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 1)',
    shadowOffset: { width: 8, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    ...typography.button,
    textTransform: 'capitalize',
    color: '#FFFFFF',
  },
  submitButtonTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
});

export default RateFeedbackBottomSheet;
