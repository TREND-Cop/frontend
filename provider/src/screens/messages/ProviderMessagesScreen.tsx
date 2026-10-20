import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { ProviderMessagesSkeleton } from '../../components/ProviderMessagesSkeleton';
import { useProviderMessagesStore } from '../../store/providerMessagesStore';

// ── 1:1 Vector Icons for Navigation Bar ──────────────────────────────────────

function DashboardNavIcon({ size = 24, active = false }: { size?: number; active?: boolean }) {
  const strokeColor = active ? 'rgba(0, 8, 20, 0.96)' : 'rgba(192, 192, 204, 0.96)';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="3"
        width="7.5"
        height="7.5"
        rx="2"
        fill={active ? 'rgba(0, 8, 20, 0.96)' : 'none'}
        stroke={strokeColor}
        strokeWidth="1.5"
      />
      <Rect
        x="13.5"
        y="3"
        width="7.5"
        height="7.5"
        rx="2"
        fill={active ? 'rgba(0, 8, 20, 0.96)' : 'none'}
        stroke={strokeColor}
        strokeWidth="1.5"
      />
      <Rect
        x="3"
        y="13.5"
        width="7.5"
        height="7.5"
        rx="2"
        fill={active ? 'rgba(0, 8, 20, 0.96)' : 'none'}
        stroke={strokeColor}
        strokeWidth="1.5"
      />
      <Rect
        x="13.5"
        y="13.5"
        width="7.5"
        height="7.5"
        rx="2"
        fill={active ? 'rgba(0, 8, 20, 0.96)' : 'none'}
        stroke={strokeColor}
        strokeWidth="1.5"
      />
    </Svg>
  );
}

function ChattingNavIcon({ size = 24, active = true }: { size?: number; active?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12C2 7.029 6.029 3 11 3h2c4.971 0 9 4.029 9 9 0 4.971-4.029 9-9 9H8l-4.5 1.5L5 18C3.12 16.32 2 14.28 2 12z"
        fill={active ? 'rgba(0, 8, 20, 0.96)' : 'none'}
        stroke="rgba(0, 8, 20, 0.96)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 10h8M8 14h5"
        stroke={active ? '#FFFFFF' : 'rgba(0, 8, 20, 0.96)'}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ProfileNavIcon({ size = 24, active = false }: { size?: number; active?: boolean }) {
  const strokeColor = active ? 'rgba(0, 8, 20, 0.96)' : 'rgba(192, 192, 204, 0.96)';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={strokeColor} strokeWidth="1.5" />
      <Circle cx="12" cy="9" r="3" stroke={strokeColor} strokeWidth="1.5" />
      <Path
        d="M6.5 18c1.5-2.5 3.5-3.5 5.5-3.5s4 1 5.5 3.5"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ── 1:1 Figma Mock Data ──────────────────────────────────────────────────────

export interface ProviderMessageItem {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  avatar: any;
}

const PROVIDER_CONVERSATIONS: ProviderMessageItem[] = [
  {
    id: '1',
    name: 'Godwin Thomas',
    lastMessage: 'Hello this is luminious looks and...',
    time: '12:11',
    unreadCount: 1,
    avatar: require('../../../assets/images/messages/godwin_thomas.jpg'),
  },
  {
    id: '2',
    name: 'Lara Olapade',
    lastMessage: 'Lorem ipsum dolor sit amet cons...',
    time: '12:11',
    unreadCount: 0,
    avatar: require('../../../assets/images/messages/lara_olapade.jpg'),
  },
  {
    id: '3',
    name: 'Chisom Emanuella',
    lastMessage: 'Lorem ipsum dolor sit amet cons...',
    time: '12:11',
    unreadCount: 0,
    avatar: require('../../../assets/images/messages/chisom_emanuella.jpg'),
  },
];

interface ProviderMessagesScreenProps {
  onTabChange?: (tab: 'dashboard' | 'messages' | 'profile') => void;
}

export function ProviderMessagesScreen({ onTabChange }: ProviderMessagesScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Locked Bottom Navigation Bar offset:
  // Strictly locked at its designated bottom coordinate so it never moves when scrolling.
  // On iOS: safely above the Home Indicator (Math.max(insets.bottom, 20)).
  // On Android: safely above the Android 3-button system dock / gesture pill (Math.max(insets.bottom, 56) + 16).
  const lockedBottomOffset = Platform.OS === 'android'
    ? Math.max(insets.bottom, 56) + 16
    : Math.max(insets.bottom, 20);

  const [isMessagesLoading, setIsMessagesLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsMessagesLoading(true);
      const timer = setTimeout(() => {
        setIsMessagesLoading(false);
      }, 900);
      return () => {
        clearTimeout(timer);
        setIsMessagesLoading(true);
      };
    }, [])
  );

  const handleDashboardPress = () => {
    if (onTabChange) {
      onTabChange('dashboard');
    } else {
      router.push('/dashboard' as any);
    }
  };

  const handleProfilePress = () => {
    if (onTabChange) {
      onTabChange('profile');
    }
  };

  const { conversations, markAsRead } = useProviderMessagesStore();
  const visibleConversations = conversations.filter(
    (c) => c.messages.length > 0 || c.id === '1' || c.id === '2' || c.id === '3'
  );

  const handleConversationPress = (conversation: any) => {
    markAsRead(conversation.id);
    router.push({
      pathname: '/chat' as any,
      params: {
        id: conversation.id,
        name: conversation.name,
      },
    } as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {isMessagesLoading ? (
        <ProviderMessagesSkeleton />
      ) : (
        <>
          {/* ── Page Header: Message (matches Dashboard paddingTop exactly) ── */}
          <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top + 16, 56) }]}>
            <Text style={styles.headerTitle}>Message</Text>
          </View>

          {/* ── Line 135: Top Divider (width: 390px, top: 126px, 1:1 Figma) ── */}
          <View style={styles.topDivider} />

          {/* ── Scrollable Messages List (width: 358px, gap: 24px) ── */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: 130 + lockedBottomOffset },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {visibleConversations.map((item, index) => (
              <View key={item.id} style={styles.messageRowWrapper}>
                <TouchableOpacity
                  style={styles.messageRow}
                  activeOpacity={0.7}
                  onPress={() => handleConversationPress(item)}
                >
                  {/* Ellipse 194: Avatar (48x48px, radius 24px) */}
                  <Image source={item.avatar} style={styles.avatarImage} resizeMode="cover" />

                  {/* Message and Indicators (gap: 55px, height: 48px) */}
                  <View style={styles.messageContentBlock}>
                    {/* Company Name and Message (width: 238px, gap: 4px) */}
                    <View style={styles.textColumn}>
                      <Text style={styles.nameText} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.previewText} numberOfLines={1}>
                        {item.lastMessage}
                      </Text>
                    </View>

                    {/* Time of Message and New Message Indicator (width: 56px, gap: 8px) */}
                    <View style={styles.metaColumn}>
                      <Text style={styles.timeText}>{item.time}</Text>

                      {item.unreadCount > 0 ? (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                        </View>
                      ) : (
                        <View style={styles.unreadBadgeSpacer} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Inset Divider: Line 136 / Line 137 (width: 302px, left: 72px) */}
                {index < visibleConversations.length - 1 && (
                  <View style={styles.itemDivider} />
                )}
              </View>
            ))}
          </ScrollView>
        </>
      )}

      {/* ── Fixed Bottom Navigation Container (Locked at bottom, 100% stationary) ── */}
      <View pointerEvents="box-none" style={styles.bottomFixedContainer}>
        {/* Backdrop Fade & Solid White Shield to completely mask scrolling items */}
        <View
          style={[
            styles.bottomBackdropShield,
            {
              height: lockedBottomOffset + 80 + 36,
            },
          ]}
          pointerEvents="none"
        >
          {Platform.OS === 'ios' && (
            <BlurView
              intensity={25}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          )}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.85)', '#FFFFFF']}
            locations={[0, 0.4, 1.0]}
            style={styles.backdropGradient}
          />
          <View style={styles.backdropSolidWhite} />
        </View>

        {/* ── App Navigation Bar (width: 300px, height: 80px, radius: 40px, locked) ── */}
        <View
          pointerEvents="box-none"
          style={[
            styles.bottomNavContainer,
            {
              bottom: lockedBottomOffset,
            },
          ]}
        >
          <View style={styles.bottomNavBar}>
            {/* Tab 1: Dashboard */}
            <TouchableOpacity
              style={styles.navTabItem}
              activeOpacity={0.8}
              onPress={handleDashboardPress}
            >
              <View style={styles.navTabContent}>
                <DashboardNavIcon size={24} active={false} />
                <Text style={styles.navTabTextInactive}>Dashboard</Text>
              </View>
            </TouchableOpacity>

            {/* Tab 2: Messages (Active) */}
            <TouchableOpacity
              style={styles.navTabItem}
              activeOpacity={0.8}
            >
              <View style={styles.navTabContent}>
                <ChattingNavIcon size={24} active={true} />
                <Text style={styles.navTabTextActive}>Messages</Text>
              </View>

              {/* Rectangle 299: Active indicator bar (width: 65px, height: 5px, radius: 8px) */}
              <View style={styles.activeTabIndicator} />
            </TouchableOpacity>

            {/* Tab 3: Profile */}
            <TouchableOpacity
              style={styles.navTabItem}
              activeOpacity={0.8}
              onPress={handleProfilePress}
            >
              <View style={styles.navTabContent}>
                <ProfileNavIcon size={24} active={false} />
                <Text style={styles.navTabTextInactive}>Profile</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

// ── 1:1 Figma Converted Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header (left: 16px, top: 74px, height: 32px) ──
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.4,
    color: '#000000',
    includeFontPadding: false,
  },

  // ── Line 135: Top Divider (width: 390px, top: 126px) ──
  topDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },

  // ── Scrollable Body ──
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },

  messageRowWrapper: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
  },

  // ── message ui (Auto layout: 358x64px, padding: 8px 0px, gap: 16px) ──
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 0,
    gap: 16,
    width: '100%',
    height: 64,
  },

  // ── Ellipse 194 (width: 48px, height: 48px, radius: 24px) ──
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    flexShrink: 0,
  },

  // ── message and indicators (gap: 55px, height: 48px) ──
  messageContentBlock: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // ── company name and message (width: 238px, height: 48px, gap: 4px) ──
  textColumn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  nameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: '#000000',
    includeFontPadding: false,
  },
  previewText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  // ── time of message and new message indicator (width: 56px, height: 44px, gap: 8px) ──
  metaColumn: {
    width: 56,
    height: 44,
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    gap: 8,
    flexShrink: 0,
  },
  timeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    textAlign: 'right',
    color: '#000000',
    includeFontPadding: false,
  },

  // ── new message indicator (width: 20px, height: 20px, radius: 24px) ──
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(204, 41, 41, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeSpacer: {
    width: 20,
    height: 20,
    opacity: 0,
  },
  unreadBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    textAlign: 'center',
    color: '#FFFFFF',
    includeFontPadding: false,
  },

  // ── Line 136 / Line 137: Inset Divider (width: 302px, left: 72px) ──
  itemDivider: {
    width: 302,
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 8,
  },

  // ── Fixed Bottom Navigation Container & Backdrop Shield ──
  bottomFixedContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
    ...Platform.select({
      android: {
        elevation: 10,
      },
    }),
  },

  bottomBackdropShield: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },

  backdropGradient: {
    height: 36,
    width: '100%',
  },

  backdropSolidWhite: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },

  // ── App Navigation Bar (Floating Island Locked at Bottom) ──
  bottomNavContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  bottomNavBar: {
    width: 300,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(133, 139, 148, 0.08)',
        shadowOffset: { width: 4, height: 10 },
        shadowOpacity: 0.16,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
      web: {
        shadowColor: 'rgba(133, 139, 148, 0.08)',
        shadowOffset: { width: 4, height: 10 },
        shadowOpacity: 0.16,
        shadowRadius: 24,
      },
    }),
  },
  navTabItem: {
    width: 72,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  navTabContent: {
    width: 72,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  navTabTextActive: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  navTabTextInactive: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },

  // ── Rectangle 299: Active Indicator (width: 65px, height: 5px, radius: 8px) ──
  activeTabIndicator: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    width: 65,
    height: 5,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 8,
  },
});
