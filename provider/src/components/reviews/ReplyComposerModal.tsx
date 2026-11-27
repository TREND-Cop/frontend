import { BlurView } from 'expo-blur';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { Review } from '../../constants/reviews.config';
import { formatReviewTimestamp } from '../../utils/reviewFormatters';
import { useSingleFlight } from '../../utils/safeNavigation';
import { ClientAvatar, ClientVerifiedBadge } from './ReviewBody';

const FONT_REGULAR = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_400Regular',
  default: 'DMSans_400Regular',
});

/**
 * 24x24 Close (X) icon matching Frame L2 multiplication-sign
 */
function CloseXIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke="#FFFFFF"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 20x20 Telegram / Paper-plane Send icon matching Frame L2
 */
function TelegramSendIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
        stroke="#FFFFFF"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 24x24 Three Vertical Dots (⋮) Icon
 */
function EllipsisVerticalIcon({
  size = 24,
  color = '#141B34',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="6" r="1.5" fill={color} />
      <Circle cx="12" cy="12" r="1.5" fill={color} />
      <Circle cx="12" cy="18" r="1.5" fill={color} />
    </Svg>
  );
}

export interface ReplyComposerModalProps {
  visible: boolean;
  review: Review | null;
  onClose: () => void;
  onSendReply: (reviewId: string, replyText: string) => Promise<void>;
  onPressMenu?: (review: Review) => void;
}

/**
 * ReplyComposerModal (Frame L2)
 *
 * Requirements:
 * - Blurred background overlay (expo-blur BlurView intensity 30)
 * - Round dark X button at top left (40x40)
 * - Lifted review card with soft shadow and asymmetrical speech bubble border radius (24px 24px 24px 0px)
 * - Custom input bar at bottom with 40x40 round dark send button
 * - Placeholder: "Write a reply..." (TODO (Copy))
 * - Auto-focus keyboard
 * - Discard on X or Android hardware back
 */
export const ReplyComposerModal: React.FC<ReplyComposerModalProps> = ({
  visible,
  review,
  onClose,
  onSendReply,
  onPressMenu,
}) => {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const handleKeyboardShow = (e: any) => {
      setIsKeyboardVisible(true);
      const height = e?.endCoordinates?.height ?? 0;
      if (height > 0) {
        setKeyboardHeight(height);
      }
    };

    const handleKeyboardHide = () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    };

    const showSubWill = Keyboard.addListener('keyboardWillShow', handleKeyboardShow);
    const showSubDid = Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
    const hideSubWill = Keyboard.addListener('keyboardWillHide', handleKeyboardHide);
    const hideSubDid = Keyboard.addListener('keyboardDidHide', handleKeyboardHide);

    return () => {
      showSubWill.remove();
      showSubDid.remove();
      hideSubWill.remove();
      hideSubDid.remove();
    };
  }, []);

  // Clear text on open / close and auto-focus
  useEffect(() => {
    if (visible) {
      setText('');
      setIsSending(false);
      // Auto-focus after modal transition settles
      const delay = Platform.OS === 'android' ? 250 : 150;
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    }
  }, [visible]);

  // Handle Android hardware back
  useEffect(() => {
    if (!visible) return;

    const onBackPress = () => {
      if (isKeyboardVisible) {
        Keyboard.dismiss();
        return true;
      }
      onClose();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );
    return () => backHandler.remove();
  }, [visible, isKeyboardVisible, onClose]);

  const handleBackdropPress = useCallback(() => {
    if (isKeyboardVisible) {
      Keyboard.dismiss();
    } else {
      onClose();
    }
  }, [isKeyboardVisible, onClose]);

  const handleSend = useSingleFlight(
    useCallback(async () => {
      const trimmed = text.trim();
      if (!trimmed || isSending || !review) return;

      try {
        setIsSending(true);
        await onSendReply(review.id, trimmed);
        Keyboard.dismiss();
        onClose();
      } catch {
        // TODO (Backend): handle failure
      } finally {
        setIsSending(false);
      }
    }, [text, isSending, review, onSendReply, onClose])
  );

  if (!visible || !review) return null;

  const canSend = text.trim().length > 0 && !isSending;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        {/* Real Frosted Scrim Backdrop:
            - iOS: Native BlurView with light frosted tint overlay
            - Android: High-opacity frosted veil (94% neutral wash) that completely obscures
              the background reviews and eliminats visual clutter/confusion
        */}
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {Platform.OS === 'ios' ? (
            <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill}>
              <View style={styles.iosBlurOverlay} />
            </BlurView>
          ) : (
            <View style={styles.androidScrimOverlay} />
          )}
        </View>

        {/* Backdrop Tap to Dismiss (dismiss keyboard first, then modal) */}
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        {/* Top-Left Dark Close Button (40x40) with High Contrast */}
        <TouchableOpacity
          style={[
            styles.closeButton,
            { top: Math.max(insets.top + 12, 44) },
          ]}
          activeOpacity={0.8}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close reply composer"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <CloseXIcon size={24} />
        </TouchableOpacity>

        {/* Keyboard-avoiding container:
            - iOS: Uses native KeyboardAvoidingView padding
            - Android: Directly applies tracked keyboardHeight to paddingBottom so the chat bar
              always sits flush right on top of the soft keyboard
        */}
        <KeyboardAvoidingView
          style={[
            styles.keyboardContainer,
            Platform.OS === 'android' && {
              paddingBottom: keyboardHeight,
            },
          ]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          {/* Scrollable Center Space for Lifted Review Card */}
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingTop: Math.max(insets.top + (isKeyboardVisible ? 56 : 72), 72),
                paddingBottom: 24,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <TouchableWithoutFeedback onPress={handleBackdropPress}>
              <View style={styles.scrollInnerDismissArea}>
                {/* Lifted Review Card (Frame L2) - isolated tap so tapping card does not dismiss */}
                <TouchableWithoutFeedback onPress={() => { }}>
                  <View style={styles.liftedCard}>
                    <View style={styles.clientSection}>
                      <ClientAvatar
                        photoUri={review.client.photoUri}
                        name={review.client.name}
                      />

                      <View style={styles.contentColumn}>
                        {/* Name, Badge, and ⋮ menu */}
                        <View style={styles.topNameRow}>
                          <View style={styles.nameAndBadge}>
                            <Text
                              style={styles.clientName}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {review.client.name}
                            </Text>
                            {review.client.isVerified && (
                              <ClientVerifiedBadge size={20} />
                            )}
                          </View>

                          <TouchableOpacity
                            style={styles.menuButton}
                            activeOpacity={0.7}
                            onPress={() => onPressMenu?.(review)}
                            accessibilityRole="button"
                            accessibilityLabel={`More options for ${review.client.name}'s review`}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <EllipsisVerticalIcon size={24} />
                          </TouchableOpacity>
                        </View>

                        {/* Review text */}
                        <Text style={styles.reviewText}>{review.text}</Text>

                        {/* Timestamp */}
                        <Text style={styles.timestamp}>
                          {formatReviewTimestamp(review.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>

          {/* Custom Chat Input Bar (57px height):
              Sits directly above the soft keyboard when keyboard is open,
              and above native dock/safe area when keyboard is closed
          */}
          <View
            style={[
              styles.inputBarContainer,
              {
                paddingBottom: isKeyboardVisible
                  ? (Platform.OS === 'android' ? 10 : 8)
                  : Math.max(insets.bottom, 8),
              },
            ]}
          >
            <View style={styles.customInputField}>
              {/* Single-line text input */}
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                placeholder="Write a reply..."
                placeholderTextColor="rgba(96, 96, 102, 0.6)"
                value={text}
                onChangeText={setText}
                multiline={false}
                returnKeyType="send"
                onSubmitEditing={handleSend}
                editable={!isSending}
                accessibilityLabel="Write a reply"
              />

              {/* Confirm / Send Button (40x40) */}
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !canSend && styles.sendButtonDisabled,
                ]}
                activeOpacity={0.8}
                onPress={handleSend}
                disabled={!canSend}
                accessibilityRole="button"
                accessibilityLabel="Send reply"
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <TelegramSendIcon size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default ReplyComposerModal;

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  iosBlurOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  androidScrimOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(245, 246, 250, 0.94)',
  },
  closeButton: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  scrollInnerDismissArea: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
  },
  liftedCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    // Figma exact speech bubble radius: 24px 24px 24px 0px
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    // Figma Hard Shadow
    shadowColor: 'rgba(133, 139, 148, 0.25)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  clientSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    width: '100%',
  },
  contentColumn: {
    flex: 1,
    gap: 12,
  },
  topNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 28,
  },
  nameAndBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  clientName: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
    flexShrink: 1,
  },
  menuButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginRight: -6,
  },
  reviewText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  timestamp: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  inputBarContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
  },
  customInputField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 57,
    paddingHorizontal: 16,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
    includeFontPadding: false,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
