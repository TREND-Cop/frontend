import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import {
  ArrowLeft,
  Clock,
  Star,
  Image as ImageIcon,
  Send,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeImage } from '../../components/ui/SafeImage';
import { previewStore } from '../../utils/previewStore';
import {
  useMessagesContext,
  MessageItem,
  MessageType,
  ServiceCardData,
  PhotosAlbumData,
} from '../../store/MessagesContext';

// ── Outgoing Speech Bubble Tail (Figma: Polygon attached on bottom right) ──
const OutgoingTail = ({ color = 'rgba(26, 130, 255, 0.9)' }: { color?: string }) => (
  <Svg
    width={12}
    height={16}
    viewBox="0 0 12 16"
    style={styles.outgoingTailSvg}
  >
    <Path
      d="M0 0 C1 5 4 11 12 15 C6 15 1 13 0 9 Z"
      fill={color}
    />
  </Svg>
);

// ── Incoming Speech Bubble Tail (Figma: Polygon attached on bottom left) ──
const IncomingTail = ({ color = 'rgba(96, 96, 102, 0.96)' }: { color?: string }) => (
  <Svg
    width={12}
    height={16}
    viewBox="0 0 12 16"
    style={styles.incomingTailSvg}
  >
    <Path
      d="M12 0 C11 5 8 11 0 15 C6 15 11 13 12 9 Z"
      fill={color}
    />
  </Svg>
);

export const InChatScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; name?: string; salonId?: string }>();
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    getMessages,
    sendMessage,
    markAsRead,
    getConversation,
    startOrGetConversation,
  } = useMessagesContext();

  const defaultAvatar = require('../../../assets/images/620f39dda80fe7971b4af170c890481a63da61b0.jpg');

  const resolvedConvId = useMemo(() => {
    const rawId = params.id && params.id !== '[id]' ? params.id : params.salonId;
    if (rawId) {
      const existing = getConversation(rawId);
      if (existing) {
        return existing.id;
      }
      return startOrGetConversation({
        id: rawId,
        name: params.name || 'Salon Specialist',
        avatar: defaultAvatar,
      });
    }
    return 'c1';
  }, [params.id, params.salonId, params.name, getConversation, startOrGetConversation, defaultAvatar]);

  const activeConversation = getConversation(resolvedConvId);
  const salonName = params.name || activeConversation?.name || 'Luminous Lux';
  const salonAvatar = activeConversation?.avatar || defaultAvatar;

  const messages = getMessages(resolvedConvId);

  const scrollToBottom = (delay = 100) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, delay);
  };

  useEffect(() => {
    markAsRead(resolvedConvId);
    scrollToBottom(200);
  }, [resolvedConvId, markAsRead]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom(80);
  }, [messages.length]);

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
        scrollToBottom(80);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleHeaderProfilePress = () => {
    const targetSalonId = params.salonId || (params.id && params.id !== '[id]' && !params.id.startsWith('c') ? params.id : 'salon2');
    router.push({
      pathname: '/salon/[id]',
      params: { id: targetSalonId, name: salonName },
    } as any);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    setInputText('');

    await sendMessage(resolvedConvId, {
      text: textToSend,
      sender: 'user',
      type: 'text',
    });
    scrollToBottom(50);
  };

  const pickFromLibrary = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        handleSendSampleImage();
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photoUri = result.assets[0].uri;
        await sendMessage(resolvedConvId, {
          image: { uri: photoUri },
          sender: 'user',
          type: 'image',
        });
        scrollToBottom(50);
      }
    } catch (e) {
      console.warn('Image picker error, using sample image fallback:', e);
      handleSendSampleImage();
    }
  };

  const pickFromCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        handleSendSampleImage();
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photoUri = result.assets[0].uri;
        await sendMessage(resolvedConvId, {
          image: { uri: photoUri },
          sender: 'user',
          type: 'image',
        });
        scrollToBottom(50);
      }
    } catch (e) {
      console.warn('Camera error, using sample image fallback:', e);
      handleSendSampleImage();
    }
  };

  const handlePickImage = () => {
    Alert.alert(
      'Attach Photo',
      'Select reference photo to send to salon specialist',
      [
        { text: 'Take Photo', onPress: pickFromCamera },
        { text: 'Choose from Photos', onPress: pickFromLibrary },
        { text: 'Sample Reference Photo', onPress: handleSendSampleImage },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleSendSampleImage = async () => {
    await sendMessage(resolvedConvId, {
      image: require('../../../assets/images/profile/dry_wow_pedicure.jpg'),
      sender: 'user',
      type: 'image',
    });
    scrollToBottom(50);
  };

  const openImagePreview = (imageSource: any, title = 'Photo Reference') => {
    previewStore.setPreviewImages([imageSource], title, undefined, 0);
    router.push({
      pathname: '/professional/gallery-preview',
      params: { index: 0, initialIndex: 0, title, source: 'chat', salonName },
    } as any);
  };

  const openAlbumPreview = (album: PhotosAlbumData, initialIdx = 0) => {
    previewStore.setPreviewImages(album.photos, `${salonName} Portfolio`, undefined, initialIdx);
    router.push({
      pathname: '/professional/gallery-preview',
      params: { index: initialIdx, initialIndex: initialIdx, title: `${salonName} Portfolio`, source: 'chat', salonName },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ─── In-Chat Top Header (Figma: height 60px, padding: 8px 16px) ─── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color="#141B34" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerProfileContainer}
          activeOpacity={0.7}
          onPress={handleHeaderProfilePress}
        >
          <SafeImage
            source={salonAvatar}
            style={styles.headerAvatar}
            resizeMode="cover"
          />
          <View style={styles.headerTextGroup}>
            <Text style={styles.headerSalonName} numberOfLines={1}>
              {salonName}
            </Text>
            <Text style={styles.headerStatusText}>Open For Business</Text>
          </View>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        {/* ─── Chat Messages ScrollView ─── */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onContentSizeChange={() => scrollToBottom(50)}
        >
          {messages.map((msg) => {
            // ── System / Date Divider ──
            if (msg.type === 'dateDivider') {
              return (
                <View key={msg.id} style={styles.dateSeparatorPill}>
                  <Text style={styles.dateSeparatorText}>{msg.text}</Text>
                </View>
              );
            }

            // ── Outgoing (User) Messages ──
            if (msg.sender === 'user') {
              if (msg.type === 'image' && msg.image) {
                return (
                  <View key={msg.id} style={styles.outgoingMessageContainer}>
                    <TouchableOpacity
                      style={styles.outgoingPhotoWrapper}
                      activeOpacity={0.9}
                      onPress={() => openImagePreview(msg.image, 'Shared Image')}
                    >
                      <SafeImage
                        source={msg.image}
                        style={styles.sharedPhoto}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                    <Text style={styles.outgoingTime}>{msg.time}</Text>
                  </View>
                );
              }

              if (msg.type === 'photosAlbum' && msg.photosAlbum) {
                const album = msg.photosAlbum;
                return (
                  <View key={msg.id} style={styles.outgoingMessageContainer}>
                    <View style={styles.photosAlbumCard}>
                      <Text style={styles.photosAlbumTitle}>{album.title}</Text>
                      <View style={styles.photosGrid}>
                        <View style={styles.photosGridRow}>
                          {album.photos[0] && (
                            <TouchableOpacity
                              style={styles.albumPhotoCell}
                              activeOpacity={0.9}
                              onPress={() => openAlbumPreview(album, 0)}
                            >
                              <SafeImage
                                source={album.photos[0]}
                                style={styles.albumPhoto}
                                resizeMode="cover"
                              />
                            </TouchableOpacity>
                          )}
                          {album.photos[1] && (
                            <TouchableOpacity
                              style={styles.albumPhotoCell}
                              activeOpacity={0.9}
                              onPress={() => openAlbumPreview(album, 1)}
                            >
                              <SafeImage
                                source={album.photos[1]}
                                style={styles.albumPhoto}
                                resizeMode="cover"
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                        {album.photos[2] && (
                          <TouchableOpacity
                            style={styles.albumPhotoCell}
                            activeOpacity={0.9}
                            onPress={() => openAlbumPreview(album, 2)}
                          >
                            <SafeImage
                              source={album.photos[2]}
                              style={styles.albumPhoto}
                              resizeMode="cover"
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    <Text style={styles.outgoingTime}>{msg.time}</Text>
                  </View>
                );
              }

              return (
                <View key={msg.id} style={styles.outgoingMessageContainer}>
                  <View style={styles.outgoingBubbleWrapper}>
                    <View style={styles.outgoingBubble}>
                      <Text style={styles.outgoingText}>{msg.text}</Text>
                    </View>
                    <OutgoingTail />
                  </View>
                  <Text style={styles.outgoingTime}>{msg.time}</Text>
                </View>
              );
            }

            // ── Incoming (Salon) Messages ──
            if (msg.type === 'serviceCard' && msg.serviceCard) {
              const card = msg.serviceCard;
              return (
                <View key={msg.id} style={styles.incomingMessageContainer}>
                  <TouchableOpacity
                    style={styles.serviceLinkCard}
                    activeOpacity={0.9}
                    onPress={() => {
                      router.push({
                        pathname: '/professional/style-details',
                        params: {
                          name: card.title,
                          title: card.title,
                          price: card.price,
                          duration: card.duration,
                          rating: card.rating,
                          salonName: salonName,
                        },
                      } as any);
                    }}
                  >
                    <SafeImage
                      source={card.image}
                      style={styles.serviceCardImage}
                      resizeMode="cover"
                    />
                    <View style={styles.serviceDetailsContainer}>
                      <Text style={styles.serviceTitleText}>{card.title}</Text>
                      
                      <View style={styles.serviceMetaRow}>
                        <View style={styles.serviceDurationPill}>
                          <Clock size={16} color="rgba(96, 96, 102, 0.96)" />
                          <Text style={styles.serviceMetaText}>{card.duration}</Text>
                        </View>

                        <View style={styles.serviceRatingPill}>
                          <Star size={16} color="#F5950F" fill="#F5950F" />
                          <Text style={styles.serviceMetaText}>{card.rating}</Text>
                          <Text style={styles.serviceReviewsCountText}>{card.reviewsCount}</Text>
                        </View>
                      </View>

                      <View style={styles.servicePriceRow}>
                        <View style={styles.servicePriceLeft}>
                          <Text style={styles.servicePriceMain}>{card.price}</Text>
                        </View>

                      </View>
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.incomingTime}>{msg.time}</Text>
                </View>
              );
            }

            return (
              <View key={msg.id} style={styles.incomingMessageContainer}>
                <View style={styles.incomingBubbleWrapper}>
                  <View style={styles.incomingBubble}>
                    <Text style={styles.incomingText}>{msg.text}</Text>
                  </View>
                  <IncomingTail />
                </View>
                <Text style={styles.incomingTime}>{msg.time}</Text>
              </View>
            );
          })}
        </ScrollView>

        {/* ─── Bottom Message Input Bar (Figma: height 64px, padding: 8px 16px) ─── */}
        <View
          style={[
            styles.inputBarContainer,
            { paddingBottom: isKeyboardVisible ? 8 : Math.max(insets.bottom, 8) },
          ]}
        >
          <TouchableOpacity
            style={styles.addImageButton}
            activeOpacity={0.7}
            onPress={handlePickImage}
          >
            <ImageIcon size={24} color="#141B34" />
          </TouchableOpacity>

          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type here..."
              placeholderTextColor="rgba(96, 96, 102, 0.6)"
              value={inputText}
              onChangeText={setInputText}
              onFocus={() => scrollToBottom(120)}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim().length === 0 && styles.sendButtonDisabled,
            ]}
            activeOpacity={0.8}
            onPress={handleSend}
            disabled={inputText.trim().length === 0}
          >
            <Send size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flexOne: {
    flex: 1,
  },

  // ── Header Row (Figma: height 60px, padding: 8px 16px, borderBottom) ──
  headerRow: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerProfileContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  headerTextGroup: {
    justifyContent: 'center',
    gap: 4,
  },
  headerSalonName: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.6,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  headerStatusText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(12, 121, 12, 0.96)',
  },

  // ── Chat Scroll & Content ──
  chatScroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  chatScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    gap: 18,
  },

  // ── Outgoing (User) Messages (Figma: Accent blue rgba(26, 130, 255, 0.9)) ──
  outgoingMessageContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  outgoingBubbleWrapper: {
    position: 'relative',
    maxWidth: '85%',
  },
  outgoingBubble: {
    backgroundColor: 'rgba(26, 130, 255, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  outgoingTailSvg: {
    position: 'absolute',
    right: -7,
    bottom: 2,
  },
  outgoingText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#FFFFFF',
  },
  outgoingTime: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: '#000000',
    textAlign: 'right',
    marginRight: 4,
  },

  // ── Outgoing Photo (Figma: 267px x 245px, borderRadius: 24px) ──
  outgoingPhotoWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    width: 267,
    height: 245,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  sharedPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },

  // ── Photos Album Card (Figma: Frame 1000006507, 283px x 362px, radius 24px) ──
  photosAlbumCard: {
    width: 283,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 16,
  },
  photosAlbumTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.6,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  photosGrid: {
    gap: 16,
  },
  photosGridRow: {
    flexDirection: 'row',
    gap: 16,
  },
  albumPhotoCell: {
    width: 114,
    height: 133,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E5E5EA',
  },
  albumPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },

  // ── Incoming (Salon) Messages (Figma: Secondary rgba(96, 96, 102, 0.96)) ──
  incomingMessageContainer: {
    alignItems: 'flex-start',
    gap: 4,
  },
  incomingBubbleWrapper: {
    position: 'relative',
    maxWidth: '82%',
  },
  incomingBubble: {
    backgroundColor: 'rgba(96, 96, 102, 0.96)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  incomingTailSvg: {
    position: 'absolute',
    left: -7,
    bottom: 2,
  },
  incomingText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#FFFFFF',
  },
  incomingTime: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: '#000000',
    textAlign: 'left',
    marginLeft: 4,
  },

  // ── Shared Service Link Card (Figma: width 295px, height 419px, radius 24px) ──
  serviceLinkCard: {
    width: 295,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },
  serviceCardImage: {
    width: 263,
    height: 270,
    borderRadius: 16,
    backgroundColor: '#E5E5EA',
  },
  serviceDetailsContainer: {
    gap: 10,
  },
  serviceTitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  serviceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  serviceDurationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  serviceMetaText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  serviceRatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceReviewsCountText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  servicePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePriceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  servicePriceMain: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.6,
    color: '#000000',
  },
  strikethroughContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  serviceOriginalPrice: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(192, 192, 204, 0.96)',
  },
  strikeLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },
  saveDiscountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(246, 240, 230, 0.96)',
    borderRadius: 16,
    gap: 6,
  },
  saveDiscountText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 26,
    letterSpacing: 0.4,
    color: 'rgba(248, 155, 24, 0.96)',
  },

  // ── Date Separator (Figma: Yesterday) ──
  dateSeparatorPill: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderRadius: 16,
    marginVertical: 8,
  },
  dateSeparatorText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },

  // ── Bottom Input Bar (Figma: height 64px, padding: 8px 16px) ──
  inputBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    gap: 12,
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  addImageButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 15,
    color: 'rgba(0, 8, 20, 0.96)',
    padding: 0,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});

export default InChatScreen;
