import React, { useState, useRef, useEffect } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  BackHandler,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useSafeRouter, useSingleFlight } from '../../utils/safeNavigation';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

import { useStaffMessages } from '../../context/StaffMessagesContext';
import {
  WAVING_PERSON_ILLUSTRATION,
  PROFILE_AVATAR,
  StaffChatMessage,
} from '../../constants/staffMessages.config';
import { ProviderPhotoUploadSheet } from '../../components/ProviderPhotoUploadSheet';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { previewStore } from '../../utils/previewStore';
import { triggerLightHaptic } from '../../utils/haptics';

// ── 1:1 Vector Icons ──────────────────────────────────────────────────────────

function ArrowLeft02Icon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.57 5.93L3.5 12l6.07 6.07M20.5 12H3.67"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Image03Icon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="3" width="20" height="18" rx="4" stroke={color} strokeWidth="1.5" />
      <Circle cx="8" cy="8.5" r="1.5" stroke={color} strokeWidth="1.5" />
      <Path
        d="M2.5 16l5.5-5.5a1.4 1.4 0 012 0l7.5 7.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M14.5 15l1.5-1.5a1.4 1.4 0 012 0l3.5 3.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function SentIcon({ size = 20, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M18.333 1.667L9.167 10.833M18.333 1.667L12.5 18.333l-3.333-7.5-7.5-3.333 16.666-5.833z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function StaffChatScreen() {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setIsKeyboardVisible(true);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 120);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const params = useLocalSearchParams<{
    conversationId?: string;
    participantId?: string;
    participantName?: string;
    participantRole?: string;
  }>();

  const convId = params.conversationId || 'conv_default';
  const participantName = params.participantName || 'Etibong Samuel';
  const participantRole = params.participantRole || 'Staff';
  const roleLabel = participantRole.toLowerCase().includes('owner') ? 'Owner' : 'Staff';

  const { getMessagesForConversation, sendMessage, sendImageMessage } = useStaffMessages();
  const messages = getMessagesForConversation(convId);

  const [inputText, setInputText] = useState('');
  const [photoSheetVisible, setPhotoSheetVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Hardware Back Button:
  // - Closes photo sheet if open.
  // - Otherwise, navigates back cleanly to conversation list.
  useEffect(() => {
    const onBackPress = () => {
      if (photoSheetVisible) {
        setPhotoSheetVisible(false);
        return true;
      }
      safeRouter.back();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [photoSheetVisible, safeRouter]);

  const hasInput = inputText.trim().length > 0;

  // Auto-scroll to end on new messages
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages.length]);

  const handleSendText = useSingleFlight(() => {
    if (!hasInput) return;
    triggerLightHaptic();
    sendMessage(convId, inputText);
    setInputText('');
  });

  const handleSendWavingIllustration = useSingleFlight(() => {
    triggerLightHaptic();
    sendImageMessage(convId, WAVING_PERSON_ILLUSTRATION);
  });

  const handleImageSelected = (img: any) => {
    triggerLightHaptic();
    setPhotoSheetVisible(false);
    sendImageMessage(convId, img);
  };

  const handleOpenCamera = async () => {
    setPhotoSheetVisible(false);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        handleImageSelected({ uri: result.assets[0].uri });
      }
    } catch (e) {
      // Handled gracefully
    }
  };

  const handleChoosePhotos = async () => {
    setPhotoSheetVisible(false);
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
        handleImageSelected({ uri: result.assets[0].uri });
      }
    } catch (e) {
      // Handled gracefully
    }
  };

  const handleImageTap = (img: any) => {
    triggerLightHaptic();
    previewStore.setPreviewImages([img], participantName, undefined, 0);
    safeRouter.push({
      pathname: '/gallery-preview' as any,
      params: { index: 0, initialIndex: 0, title: participantName },
    });
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="dark" />

      {/* ── Fixed In-Chat Header (height: 60px) ── */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.headerContentRow}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => {
              triggerLightHaptic();
              safeRouter.back();
            }}
            accessibilityLabel="Go back"
          >
            <ArrowLeft02Icon size={24} color="#141B34" />
          </TouchableOpacity>

          {/* Profile & Name */}
          <View style={styles.profileAndNameRow}>
            <Image source={PROFILE_AVATAR} style={styles.headerAvatar} />
            <View style={styles.headerTextCol}>
              <Text style={styles.headerNameText} numberOfLines={1}>
                {participantName}
              </Text>
              <Text style={styles.headerRoleCaption}>{roleLabel}</Text>
            </View>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 60 : 0}
      >
        {/* ── Chat Messages Scroll Body ── */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatScrollView}
        contentContainerStyle={[
          styles.chatScrollContent,
          messages.length === 0 && styles.chatEmptyCenter,
          { paddingBottom: 24 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {messages.length === 0 ? (
          /* Screen 5: Empty Chat State */
          <View style={styles.emptyChatBlock}>
            <Text style={styles.emptyNoMessagesText}>No messages here yet</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.emptyPromptBlock}
              onPress={handleSendWavingIllustration}
            >
              <Text style={styles.emptyTapToSayHelloText}>Tap to say “Hello”</Text>
              <Image
                source={WAVING_PERSON_ILLUSTRATION}
                style={styles.emptyIllustration}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        ) : (
          /* Screen 6: Messages List */
          <View style={styles.messagesListContainer}>
            {messages.map((msg) => {
              const isMe = msg.sender === 'me';

              if (msg.type === 'image') {
                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageRowWrapper,
                      isMe ? styles.alignRight : styles.alignLeft,
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => handleImageTap(msg.image)}
                    >
                      <Image
                        source={msg.image}
                        style={styles.messageImageContent}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                    <Text style={styles.messageTimeCaption}>{msg.time}</Text>
                  </View>
                );
              }

              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageRowWrapper,
                    isMe ? styles.alignRight : styles.alignLeft,
                  ]}
                >
                  <View style={[styles.bubbleBase, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                    <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextOther]}>
                      {msg.text}
                    </Text>
                  </View>
                  <Text style={styles.messageTimeCaption}>{msg.time}</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── Message Composer (height: 64px) ── */}
      <View
        style={[
          styles.composerContainer,
          {
            paddingBottom: isKeyboardVisible ? 8 : Math.max(insets.bottom, 8),
          },
        ]}
      >
        <View style={styles.composerRow}>
          {/* Add Image Button */}
          <TouchableOpacity
            style={styles.addImageButton}
            activeOpacity={0.7}
            onPress={() => {
              triggerLightHaptic();
              setPhotoSheetVisible(true);
            }}
            accessibilityLabel="Attach photo"
          >
            <Image03Icon size={24} color="#141B34" />
          </TouchableOpacity>

          {/* Text Input */}
          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 150);
              }}
              placeholder="Type a message..."
              placeholderTextColor="rgba(96, 96, 102, 0.6)"
              returnKeyType="send"
              onSubmitEditing={handleSendText}
            />
          </View>

          {/* Send Button */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              hasInput ? styles.sendButtonActive : styles.sendButtonIdle,
            ]}
            disabled={!hasInput}
            activeOpacity={0.8}
            onPress={handleSendText}
            accessibilityLabel="Send message"
          >
            <SentIcon size={20} color={hasInput ? '#FFFFFF' : 'rgba(192, 192, 204, 0.96)'} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>

    {!isKeyboardVisible && <NativeDockSpacer backgroundColor="#FFFFFF" />}

    {/* ── Photo Upload Action Sheet ── */}
    <ProviderPhotoUploadSheet
      visible={photoSheetVisible}
      title="Send Photo"
      onClose={() => setPhotoSheetVisible(false)}
      onOpenCamera={handleOpenCamera}
      onChoosePhotos={handleChoosePhotos}
      onSelectFile={handleChoosePhotos}
    />
  </View>
  );
}

// ── 1:1 Pixel-Accurate Styles (from staff-messages-converted.ts) ───────────────
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    zIndex: 10,
  },
  headerContentRow: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAndNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F5',
  },
  headerTextCol: {
    flex: 1,
    gap: 4,
  },
  headerNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  headerRoleCaption: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(12, 121, 12, 0.96)',
    includeFontPadding: false,
  },

  /* ── Chat Body ── */
  chatScrollView: {
    flex: 1,
  },
  chatScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  chatEmptyCenter: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Empty Chat State ── */
  emptyChatBlock: {
    alignItems: 'center',
    gap: 8,
    width: 234,
  },
  emptyNoMessagesText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  emptyPromptBlock: {
    alignItems: 'center',
    gap: 8,
  },
  emptyTapToSayHelloText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  emptyIllustration: {
    width: 118,
    height: 118,
  },

  /* ── Messages List ── */
  messagesListContainer: {
    gap: 16,
  },
  messageRowWrapper: {
    marginBottom: 4,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  alignLeft: {
    alignItems: 'flex-start',
  },
  messageImageContent: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#F0F0F5',
  },
  bubbleBase: {
    maxWidth: '82%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleMe: {
    backgroundColor: 'rgba(26, 130, 255, 0.9)',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: 'rgba(240, 240, 245, 0.96)',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  bubbleTextMe: {
    color: '#FFFFFF',
  },
  bubbleTextOther: {
    color: '#000000',
  },
  messageTimeCaption: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: '#000000',
    marginTop: 4,
    includeFontPadding: false,
  },

  /* ── Composer ── */
  composerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    elevation: 15,
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    height: 48,
  },
  addImageButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  textInputWrapper: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  textInput: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#000000',
    padding: 0,
    includeFontPadding: false,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonIdle: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  sendButtonActive: {
    backgroundColor: 'rgba(26, 130, 255, 0.9)',
  },
});

