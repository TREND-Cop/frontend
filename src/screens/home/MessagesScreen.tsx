import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SafeImage } from '../../components/ui/SafeImage';
import { MessagesSkeleton } from '../../components/ui/MessagesSkeleton';
import { useTabSkeleton } from '../../utils/tabSkeletonStore';

import { useMessagesContext, MessageConversation } from '../../store/MessagesContext';

export const MessagesScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isLoading = useTabSkeleton('messages', 1100);
  const { conversations, markAsRead } = useMessagesContext();

  const handleConversationPress = (item: MessageConversation) => {
    markAsRead(item.id);
    router.push({
      pathname: '/chat/[id]',
      params: {
        id: item.id,
        name: item.name,
        salonId: item.salonId || item.id,
      },
    } as any);
  };

  if (isLoading) {
    return <MessagesSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ─── Top Screen Header (Figma: Message, 24px SemiBold) ─── */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Message</Text>
      </View>

      {/* Top Divider (Line 135: 390px, top: 118px) */}
      <View style={styles.topDivider} />

      {/* ─── Messages List ─────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Platform.OS === 'ios' ? 120 : 90 + insets.bottom },
        ]}
      >
        {conversations.map((item, index) => (
          <View key={item.id} style={styles.itemWrapper}>
            <TouchableOpacity
              style={styles.messageRow}
              activeOpacity={0.7}
              onPress={() => handleConversationPress(item)}
            >
              {/* Avatar (Ellipse 194: 48px x 48px, radius 24px) */}
              <SafeImage
                source={item.avatar}
                style={styles.avatarImage}
                resizeMode="cover"
              />

              {/* Message Content & Indicators (Figma: gap: 55px, height: 48px) */}
              <View style={styles.messageCenterGroup}>
                {/* Left: Company Name & Message Snippet (Figma: width: 238px, gap: 4px) */}
                <View style={styles.textContent}>
                  <Text style={styles.companyNameText} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.snippetText} numberOfLines={1}>
                    {item.lastMessage}
                  </Text>
                </View>

                {/* Right: Time & New Message Indicator (Figma: width: 56px, gap: 8px) */}
                <View style={styles.metaGroup}>
                  <Text style={styles.timeText}>{item.time}</Text>
                  {item.unreadCount > 0 ? (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                    </View>
                  ) : (
                    <View style={styles.unreadBadgePlaceholder} />
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {/* Inset Divider Line (Line 136 - Line 141: 302px width, offset 64px) */}
            {index < conversations.length - 1 && (
              <View style={styles.itemDivider} />
            )}
          </View>
        ))}

        {/* Final Bottom Divider (Line 142) */}
        <View style={styles.bottomDivider} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header Title (Figma: Message, top: 70px, 24px SemiBold) ──
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.4,
    color: '#000000',
  },

  // ── Top Header Divider (Line 135: width 390px, top 118px) ──
  topDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  itemWrapper: {
    // Exact pitch: 64px row + 28px vertical spacing
  },

  // ── Message UI Item Row (Figma: 358px x 64px, padding: 8px 0px, gap: 16px) ──
  messageRow: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 16,
  },

  // ── Circular Avatar (Figma: Ellipse 194, 48px x 48px, radius 24px) ──
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },

  // ── Center Group: Text & Time (Figma: width 294px, height 48px) ──
  messageCenterGroup: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
  },

  // ── Company Name & Message Snippet (Figma: width 238px, height 48px, gap 4px) ──
  textContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
    paddingRight: 8,
  },
  companyNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.6,
    color: '#000000',
  },
  snippetText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Meta Group: Time & Unread Badge (Figma: width 56px, height 48px, gap 8px) ──
  metaGroup: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
    minWidth: 56,
  },
  timeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: '#000000',
    textAlign: 'right',
  },

  // ── Unread Badge (Figma: 20px x 20px, Accent Color blue) ──
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(26, 130, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  unreadBadgePlaceholder: {
    height: 20,
  },

  // ── Inset Item Divider (Figma: 302px width, offset by avatar + gap = 64px) ──
  itemDivider: {
    marginLeft: 64,
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginTop: 11.5,
    marginBottom: 16.5,
  },

  // ── Final Bottom Divider (Line 142) ──
  bottomDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginTop: 16,
  },
});

export default MessagesScreen;
