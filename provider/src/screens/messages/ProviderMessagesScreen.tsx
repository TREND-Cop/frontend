import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Platform,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Rect, Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useStaffStore } from '../../context/StaffContext';
import { useMessagesStore } from '../../context/MessagesContext';
import { Conversation } from '../../constants/messages.config';
import {
  MessageCirclePlusIcon,
  SearchIcon,
  ArrowLeftCircleButton,
} from '../../components/messages/MessageIcons';
import { useBottomInset } from '../../utils/bottomInset';
import { useMessagesSkeleton } from '../../hooks/useMessagesSkeleton';
import { ProviderMessagesSkeleton } from '../../components/ProviderMessagesSkeleton';
import { useNativeBackExitGuard } from '../../utils/exitAppGuard';

const EMPTY_MESSAGES_WAVING = require('../../../assets/images/messages/empty_messages_waving.png');
const DEFAULT_AVATAR = require('../../../assets/images/messages/lara_olapade.jpg');

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
  const fillColor = active ? 'rgba(0, 8, 20, 0.96)' : 'none';
  const strokeColor = active ? 'rgba(0, 8, 20, 0.96)' : 'rgba(192, 192, 204, 0.96)';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C10.2977 22 8.70119 21.5739 7.30739 20.8249L3 22L4.17511 17.6926C3.42609 16.2988 3 14.7023 3 13"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ProfileNavIcon({ size = 24, active = false }: { size?: number; active?: boolean }) {
  const strokeColor = active ? 'rgba(0, 8, 20, 0.96)' : 'rgba(192, 192, 204, 0.96)';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ProviderMessagesScreen() {
  const insets = useSafeAreaInsets();
  const { tabBottomOffset, tabScrollPadding, fabBottomOffset, bottomFadeHeight } = useBottomInset();
  const safeRouter = useSafeRouter();
  const { staff } = useStaffStore();
  const { conversations, markConversationRead } = useMessagesStore();

  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<TextInput>(null);

  // Map staff id to StaffMember object for quick lookup
  const staffMap = useMemo(() => {
    const map = new Map<string, (typeof staff)[0]>();
    staff.forEach((member) => map.set(member.id, member));
    return map;
  }, [staff]);

  const handleOpenNewChat = useCallback(() => {
    safeRouter.push('/new-chat' as any);
  }, [safeRouter]);

  const handleConversationPress = useCallback(
    (conv: Conversation) => {
      markConversationRead(conv.id);
      const member = staff.find((s) => s.id === conv.staffId);
      safeRouter.push({
        pathname: '/chat' as any,
        params: {
          id: conv.id,
          name: member?.name || 'Staff Member',
          role: member?.role || (member?.roles && member?.roles[0]) || 'Staff',
          recipientName: member?.name,
        },
      });
    },
    [markConversationRead, staff, safeRouter]
  );

  const handleEnterSearch = useCallback(() => {
    setIsSearchMode(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  }, []);

  const handleExitSearch = useCallback(() => {
    setSearchQuery('');
    setIsSearchMode(false);
    Keyboard.dismiss();
  }, []);

  // Android Native Back Button Guard:
  // - If search mode is active, exits search mode cleanly.
  // - Otherwise, prompts user with in-built Exit Confirmation Dialog; NEVER pops to login/auth!
  useNativeBackExitGuard({
    closeActiveModal: () => {
      if (isSearchMode) {
        handleExitSearch();
        return true;
      }
      return false;
    },
  });

  // Tab navigation handlers
  const handleDashboardPress = useCallback(() => {
    safeRouter.replace('/dashboard' as any);
  }, [safeRouter]);

  const handleProfilePress = useCallback(() => {
    safeRouter.replace('/profile' as any);
  }, [safeRouter]);

  // Filter conversations in search mode by staff member name (case-insensitive word prefix)
  const filteredConversations = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) return conversations;

    return conversations.filter((conv) => {
      const staffMember = staffMap.get(conv.staffId);
      const name = staffMember ? staffMember.name.toLowerCase() : '';
      const words = name.split(/\s+/);
      return words.some((word) => word.startsWith(trimmed)) || name.includes(trimmed);
    });
  }, [conversations, searchQuery, staffMap]);

  // Helper to highlight matching word(s) in dark black and others in light grey
  const renderHighlightedName = useCallback(
    (name: string, query: string) => {
      const trimmed = query.trim().toLowerCase();
      if (!isSearchMode || !trimmed) {
        return (
          <Text style={styles.nameText} numberOfLines={1}>
            {name}
          </Text>
        );
      }

      const words = name.split(/(\s+)/);
      return (
        <Text style={styles.nameText} numberOfLines={1}>
          {words.map((word, idx) => {
            const matches =
              word.toLowerCase().startsWith(trimmed) || word.toLowerCase().includes(trimmed);
            return (
              <Text
                key={idx}
                style={matches ? styles.matchedWordText : styles.unmatchedWordText}
              >
                {word}
              </Text>
            );
          })}
        </Text>
      );
    },
    [isSearchMode]
  );

  const isConversationsEmpty = conversations.length === 0;
  const { isLoading: isMessagesLoading } = useMessagesSkeleton(900);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />

        {!isSearchMode && isMessagesLoading ? (
          <ProviderMessagesSkeleton />
        ) : (
          <>
            {/* ── Top Header Area ── */}
        {!isSearchMode ? (
          /* Normal Mode: "Message" Title + Search Field */
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Message</Text>

            <TouchableOpacity
              style={styles.normalSearchBar}
              onPress={handleEnterSearch}
              activeOpacity={0.85}
              accessibilityLabel="Search names"
            >
              <SearchIcon size={24} color="#000000" />
              <Text style={styles.normalSearchPlaceholder}>Search names here</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Search Mode: Back Button Circle + Active Search Input */
          <View style={styles.searchHeaderContainer}>
            <TouchableOpacity
              style={styles.backCircleTouch}
              onPress={handleExitSearch}
              activeOpacity={0.8}
              accessibilityLabel="Exit search"
            >
              <ArrowLeftCircleButton size={48} />
            </TouchableOpacity>

            <View style={styles.activeSearchBar}>
              <SearchIcon size={24} color="#000000" />
              <TextInput
                ref={searchInputRef}
                style={styles.activeSearchInput}
                placeholder="Search names here"
                placeholderTextColor="rgba(96, 96, 102, 0.96)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
                returnKeyType="search"
              />
            </View>
          </View>
        )}

        {/* ── Search Mode "Results" Label ── */}
        {isSearchMode && searchQuery.trim().length > 0 && (
          <View style={styles.resultsLabelContainer}>
            <Text style={styles.resultsLabel}>Results</Text>
          </View>
        )}

        {/* ── Main Content Area ── */}
        {!isSearchMode && isConversationsEmpty ? (
          /* Empty State: Waving Illustration + "No messages yet" + "Start new chat" pill */
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateCard}>
              <Image
                source={EMPTY_MESSAGES_WAVING}
                style={styles.emptyIllustration}
                resizeMode="contain"
              />
              <Text style={styles.emptyTitle}>No messages yet</Text>
            </View>

            <TouchableOpacity
              style={styles.startNewChatButton}
              onPress={handleOpenNewChat}
              activeOpacity={0.85}
            >
              <MessageCirclePlusIcon size={24} color="#FFFFFF" />
              <Text style={styles.startNewChatText}>Start new chat</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Conversation List / Search Results List */
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingBottom: isSearchMode
                  ? insets.bottom + 16
                  : tabScrollPadding,
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {(isSearchMode ? filteredConversations : conversations).map((conv, index, arr) => {
              const staffMember = staffMap.get(conv.staffId);
              const displayName = staffMember?.name || 'Staff Member';
              const avatarSource = staffMember?.photoUri
                ? (typeof staffMember.photoUri === 'string' ? { uri: staffMember.photoUri } : staffMember.photoUri)
                : staffMember?.avatarUri
                ? (typeof staffMember.avatarUri === 'string' ? { uri: staffMember.avatarUri } : staffMember.avatarUri)
                : DEFAULT_AVATAR;

              return (
                <View key={conv.id} style={styles.messageRowWrapper}>
                  <TouchableOpacity
                    style={styles.messageRow}
                    activeOpacity={0.75}
                    onPress={() => handleConversationPress(conv)}
                  >
                    {/* Ellipse 194: Avatar 48x48 */}
                    <Image source={avatarSource} style={styles.avatarImage} />

                    {/* Content and Meta */}
                    <View style={styles.messageContentBlock}>
                      {/* Left: Name, Staff Tag, Preview */}
                      <View style={styles.textColumn}>
                        <View style={styles.nameAndTagRow}>
                          {renderHighlightedName(displayName, searchQuery)}

                          {/* Line 143: Decorative separator */}
                          <View style={styles.verticalSeparator} />

                          {/* Green "Staff" Tag */}
                          <View style={styles.staffTag}>
                            <Text style={styles.staffTagText}>Staff</Text>
                          </View>
                        </View>

                        {/* Preview Text */}
                        <Text style={styles.previewText} numberOfLines={1}>
                          {conv.lastMessagePreview}
                        </Text>
                      </View>

                      {/* Right: Time / Date & Unread Badge */}
                      <View style={styles.metaColumn}>
                        <Text
                          style={[
                            styles.timeText,
                            isSearchMode && styles.searchTimeText,
                          ]}
                        >
                          {conv.lastMessageTime}
                        </Text>

                        {conv.unreadCount > 0 ? (
                          <View style={styles.unreadBadge}>
                            <Text style={styles.unreadBadgeText}>
                              {conv.unreadCount}
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.unreadBadgeSpacer} />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Line 136: Item Divider */}
                  {index < arr.length - 1 && <View style={styles.itemDivider} />}
                </View>
              );
            })}
          </ScrollView>
        )}
          </>
        )}

        {/* ── Floating "New Chat" Button (Hidden in Search Mode) ── */}
        {!isSearchMode && (
          <TouchableOpacity
            style={[
              styles.floatingNewChatButton,
              { bottom: fabBottomOffset },
            ]}
            onPress={handleOpenNewChat}
            activeOpacity={0.85}
            accessibilityLabel="New chat"
          >
            <MessageCirclePlusIcon size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* ── Floating Island Tab Bar (Hidden in Search Mode) ── */}
        {!isSearchMode && (
          <View style={styles.bottomFixedContainer} pointerEvents="box-none">
            {/* Soft Gradient Backdrop Shield */}
            <View
              style={[
                styles.bottomBackdropShield,
                { height: bottomFadeHeight },
              ]}
              pointerEvents="none"
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0)', '#FFFFFF']}
                style={styles.backdropGradient}
              />
              <View style={styles.backdropSolidWhite} />
            </View>

            {/* Floating Navigation Pill */}
            <View
              style={[
                styles.bottomNavContainer,
                { bottom: tabBottomOffset },
              ]}
              pointerEvents="box-none"
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

                  {/* Active indicator line */}
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
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

// ── 1:1 Figma Converted Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header (Normal Mode) ──
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    gap: 16,
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
  normalSearchBar: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    height: 48,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  normalSearchPlaceholder: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  // ── Search Mode Header ──
  searchHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 24,
    width: '100%',
    maxWidth: 390,
    alignSelf: 'center',
  },
  backCircleTouch: {
    width: 48,
    height: 48,
  },
  activeSearchBar: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  activeSearchInput: {
    flex: 1,
    height: '100%',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: '#000000',
    padding: 0,
    margin: 0,
  },

  // ── Results Label ──
  resultsLabelContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  // ── Empty State ──
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: -60,
  },
  emptyStateCard: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  emptyIllustration: {
    width: 118,
    height: 118,
  },
  emptyTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  startNewChatButton: {
    width: 188,
    height: 40,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  startNewChatText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
  },

  // ── Floating Action Button (48x48) ──
  floatingNewChatButton: {
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 90,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 8, 20, 0.25)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  // ── Conversation Rows List ──
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  messageRowWrapper: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 0,
    gap: 16,
    width: '100%',
    height: 64,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    flexShrink: 0,
  },
  messageContentBlock: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textColumn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    paddingRight: 8,
  },
  nameAndTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  nameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: '#000000',
    includeFontPadding: false,
    maxWidth: 160,
  },
  matchedWordText: {
    color: '#000000',
    fontWeight: '500',
  },
  unmatchedWordText: {
    color: 'rgba(96, 96, 102, 0.96)',
    fontWeight: '400',
  },
  verticalSeparator: {
    width: 1,
    height: 8,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  staffTag: {
    minWidth: 45,
    height: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  staffTagText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(12, 121, 12, 0.96)',
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
  metaColumn: {
    width: 60,
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
  searchTimeText: {
    color: 'rgba(96, 96, 102, 0.96)',
  },
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
  itemDivider: {
    width: 302,
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    alignSelf: 'flex-end',
    marginVertical: 4,
  },

  // ── Bottom Navigation & Backdrop ──
  bottomFixedContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 80,
    ...Platform.select({
      android: {
        elevation: 8,
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
  bottomNavContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 85,
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
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(133, 139, 148, 0.12)',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: {
        elevation: 10,
      },
      web: {
        shadowColor: 'rgba(133, 139, 148, 0.12)',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
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
