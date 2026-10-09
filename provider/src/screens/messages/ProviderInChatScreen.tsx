import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { previewStore } from '../../utils/previewStore';
import { useProviderMessagesStore, providerMessagesStore, ChatMessage } from '../../store/providerMessagesStore';

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

function StarGoldIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1 1 5.79L10 14.77l-5.21 2.74 1-5.79-4.21-4.1 5.82-.85L10 1.5z"
        fill="rgba(245, 149, 15, 0.96)"
      />
    </Svg>
  );
}

function ClockIcon({ size = 16, color = 'rgba(96, 96, 102, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 6v6l4 2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}


export function ProviderInChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    role?: string;
    recipientName?: string;
  }>();

  const { getConversation, sendMessage, markAsRead } = useProviderMessagesStore();
  const targetName = params.name || params.recipientName;
  const targetId = params.id || targetName || '1';
  const conversation = getConversation(targetId, {
    name: targetName,
    role: params.role,
  });
  const clientName = targetName || conversation.name;
  const firstName = clientName.split(' ')[0] || conversation.firstName;
  const avatarSource = conversation.avatar;
  const messages = conversation.messages;

  useEffect(() => {
    markAsRead(conversation.id);
  }, [conversation.id]);

  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    sendMessage(conversation.id, trimmed);
    setInputText('');
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handlePromptClick = (text: string) => {
    const cleanText = text.replace(/[“”"]/g, '');
    sendMessage(conversation.id, cleanText);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleHeaderProfilePress = () => {
    if (conversation.id === '1' || clientName.toLowerCase().includes('godwin')) {
      router.push({
        pathname: '/staff-profile' as any,
        params: {
          id: 'staff-1',
          staffName: clientName,
        },
      });
    } else if (
      conversation.id.startsWith('staff-') ||
      params.role?.toLowerCase().includes('artist') ||
      params.role?.toLowerCase().includes('specialist') ||
      params.role?.toLowerCase().includes('stylist')
    ) {
      router.push({
        pathname: '/staff-profile' as any,
        params: {
          id: conversation.id,
          staffName: clientName,
        },
      });
    } else if (conversation.id === 'jude' || clientName.toLowerCase().includes('jude')) {
      router.push({
        pathname: '/appointment-detail' as any,
        params: {
          id: 'jude',
          clientName: clientName,
        },
      });
    }
  };

  const handleOpenPreview = (imageSource: any, title = 'Clove Pattern') => {
    previewStore.setPreviewImages([imageSource], title, undefined, 0);
    router.push({
      pathname: '/gallery-preview' as any,
      params: { index: 0, initialIndex: 0, title },
    });
  };

  const hasInput = inputText.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <StatusBar style="dark" />

        {/* ── Top Header (height: 60px, border-bottom: 1px, 1:1 Figma) ── */}
        <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
          <View style={styles.headerRow}>
            {/* Back button (44x44px) */}
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => router.back()}
              accessibilityLabel="Back to messages"
            >
              <ArrowLeft02Icon size={24} color="#141B34" />
            </TouchableOpacity>

            {/* Profile and Name (Clickable -> Navigates to Staff or Client Profile) */}
            <TouchableOpacity
              style={styles.profileRow}
              activeOpacity={0.7}
              onPress={handleHeaderProfilePress}
            >
              {/* Ellipse 194 (40x40px avatar) */}
              <Image
                source={avatarSource}
                style={styles.avatarImage}
                resizeMode="cover"
              />

              {/* Name & Role/Status Text Block */}
              <View style={styles.profileTextCol}>
                <Text style={styles.profileNameText} numberOfLines={1}>
                  {clientName}
                </Text>
                <View style={styles.onlineStatusRow}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.profileRoleText}>Online</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Chat Body / Scroll Area ── */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={[
            styles.chatContent,
            messages.length === 0 && styles.chatContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            /* ── 1:1 Figma Empty Message In-Chat State ── */
            <View style={styles.emptyStateContainer}>
              <View style={styles.illustrationFrame}>
                <Image
                  source={require('../../../assets/images/messages/empty_chat_bubbles.png')}
                  style={styles.illustrationImage}
                  resizeMode="contain"
                />
                <Text style={styles.emptyTitleText}>Message {firstName}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => handlePromptClick(`“Hi ${firstName}, Good Morning?”`)}
                style={styles.promptButton}
              >
                <Text style={styles.promptText}>
                  “Hi {firstName}, Good Morning?”
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ── Active Conversation Messages List ── */
            <View style={styles.messagesList}>
              {messages.map((item) => {
                const isOutgoing = item.sender === 'provider'; // Provider is user of this partner app -> Right side!

                // Image message
                if (item.type === 'image' && item.image) {
                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.messageBubbleWrapper,
                        isOutgoing ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft,
                      ]}
                    >
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => handleOpenPreview(item.image, 'Photo Reference')}
                        style={styles.photoMessageWrapper}
                      >
                        <Image
                          source={item.image}
                          style={styles.photoMessage}
                          resizeMode="cover"
                        />
                        <Text style={styles.photoTimeText}>{item.time}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                }

                // Service Card message
                if (item.type === 'serviceCard' && item.serviceCard) {
                  const card = item.serviceCard;
                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.messageBubbleWrapper,
                        isOutgoing ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft,
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.serviceLinkCard}
                        activeOpacity={0.9}
                        onPress={() => handleOpenPreview(card.image, card.title)}
                      >
                        <Image
                          source={card.image}
                          style={styles.serviceCardImage}
                          resizeMode="cover"
                        />
                        <View style={styles.serviceDetailsContainer}>
                          <Text style={styles.serviceTitleText}>{card.title}</Text>

                          <View style={styles.serviceMetaRow}>
                            <View style={styles.serviceDurationPill}>
                              <ClockIcon size={14} />
                              <Text style={styles.serviceMetaText}>{card.duration}</Text>
                            </View>

                            <View style={styles.serviceRatingPill}>
                              <StarGoldIcon size={14} />
                              <Text style={styles.serviceMetaText}>{card.rating}</Text>
                              {card.reviewsCount && (
                                <Text style={styles.serviceReviewsCountText}>
                                  {card.reviewsCount}
                                </Text>
                              )}
                            </View>
                          </View>

                          <Text style={styles.servicePriceMain}>{card.price}</Text>
                        </View>
                      </TouchableOpacity>
                      <Text style={styles.messageTimeLeft}>{item.time}</Text>
                    </View>
                  );
                }

                // Normal Text message
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.messageBubbleWrapper,
                      isOutgoing ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft,
                    ]}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        isOutgoing ? styles.bubbleRight : styles.bubbleLeft,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          isOutgoing ? styles.messageTextRight : styles.messageTextLeft,
                        ]}
                      >
                        {item.text}
                      </Text>
                      <Text
                        style={[
                          styles.messageTimeText,
                          isOutgoing ? styles.messageTimeRight : styles.messageTimeLeft,
                        ]}
                      >
                        {item.time}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* ── Bottom Message Input Bar (height: 64px, 1:1 Figma) ── */}
        <View style={styles.inputBarContainer}>
          <View style={styles.inputInnerRow}>
            {/* Image and Text Input Field (width: 306px, gap: 16px) */}
            <View style={styles.imageAndInputRow}>
              {/* Add Image Button (40x40px, image-03 icon 24x24) */}
              <TouchableOpacity
                style={styles.addImageButton}
                activeOpacity={0.7}
                accessibilityLabel="Attach photo"
                onPress={() =>
                  handleOpenPreview(
                    require('../../../assets/images/profile/4538d4759870466dd05509849b26c4b0b111d827.jpg'),
                    'Preview Attached Photo'
                  )
                }
              >
                <Image03Icon size={24} color="#141B34" />
              </TouchableOpacity>

              {/* Text Input Field (height: 40px, radius: 24px, bg: rgba(235, 235, 245, 0.96)) */}
              <View style={styles.textInputWrapper}>
                <TextInput
                  style={styles.textInput}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Type a message..."
                  placeholderTextColor="rgba(96, 96, 102, 0.6)"
                  returnKeyType="send"
                  onSubmitEditing={handleSend}
                />
              </View>
            </View>

            {/* Send Message Button (36x36px, radius 32px, bg: #1A82FF, sent 20x20) */}
            <TouchableOpacity
              style={[
                styles.sendButton,
                { opacity: hasInput ? 1 : 0 },
              ]}
              disabled={!hasInput}
              activeOpacity={0.8}
              onPress={handleSend}
              accessibilityLabel="Send message"
            >
              <SentIcon size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Android Native System Navigation Bar Barrier ── */}
        <NativeDockSpacer backgroundColor="#FFFFFF" />
      </View>
    </KeyboardAvoidingView>
  );
}

export default ProviderInChatScreen;

// ── 1:1 Stylesheet (Strict Line-by-Line Figma Conversion) ──────────────────────

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* ── Header ── */
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
  },
  headerRow: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileRow: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  profileTextCol: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    gap: 4,
  },
  profileNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.3,
    color: '#000000',
    includeFontPadding: false,
  },
  onlineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0C790C',
  },
  profileRoleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  /* ── Chat Area ── */
  chatArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  chatContentEmpty: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 164,
  },

  /* ── Empty State ── */
  emptyStateContainer: {
    alignItems: 'center',
    width: 358,
  },
  illustrationFrame: {
    width: 158,
    height: 182,
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  illustrationImage: {
    width: 150,
    height: 150,
  },
  emptyTitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    textAlign: 'center',
    includeFontPadding: false,
  },
  promptButton: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(26, 130, 255, 0.9)',
    textAlign: 'center',
    includeFontPadding: false,
  },

  /* ── Active Messages List ── */
  messagesList: {
    gap: 16,
  },
  messageBubbleWrapper: {
    flexDirection: 'column',
    marginBottom: 4,
  },
  bubbleWrapperRight: {
    alignItems: 'flex-end',
  },
  bubbleWrapperLeft: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  bubbleRight: {
    backgroundColor: 'rgba(26, 130, 255, 0.9)',
    borderBottomRightRadius: 4,
  },
  bubbleLeft: {
    backgroundColor: 'rgba(240, 240, 245, 0.96)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: 0.2,
  },
  messageTextRight: {
    color: '#FFFFFF',
  },
  messageTextLeft: {
    color: '#000000',
  },
  messageTimeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeRight: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  messageTimeLeft: {
    color: 'rgba(96, 96, 102, 0.75)',
    fontSize: 11,
    marginTop: 4,
  },

  /* ── Photo Message ── */
  photoMessageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    maxWidth: 240,
  },
  photoMessage: {
    width: 240,
    height: 180,
    borderRadius: 16,
  },
  photoTimeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 11,
    color: 'rgba(96, 96, 102, 0.75)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },

  /* ── Service Link Card (Figma Screen 7) ── */
  serviceLinkCard: {
    width: 240,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceCardImage: {
    width: '100%',
    height: 140,
  },
  serviceDetailsContainer: {
    padding: 12,
    gap: 6,
  },
  serviceTitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 15,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  serviceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceDurationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceRatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceMetaText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 12,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  serviceReviewsCountText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 12,
    color: 'rgba(96, 96, 102, 0.75)',
  },
  servicePriceMain: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    color: 'rgba(0, 8, 20, 0.96)',
    marginTop: 4,
  },

  /* ── Bottom Input Bar ── */
  inputBarContainer: {
    height: 64,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.6)',
  },
  inputInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    height: 40,
  },
  imageAndInputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    height: 40,
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
    borderRadius: 24,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  textInput: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 20,
    color: '#000000',
    padding: 0,
    margin: 0,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(26, 130, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
