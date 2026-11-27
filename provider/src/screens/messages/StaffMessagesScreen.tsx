import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Platform,
  BackHandler,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useSafeRouter } from '../../utils/safeNavigation';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

import { useStaffMessages } from '../../context/StaffMessagesContext';
import { StaffConversation, WAVING_PERSON_ILLUSTRATION } from '../../constants/staffMessages.config';
import { STAFF_ROUTES } from '../../constants/staffRoutes';
import { triggerLightHaptic } from '../../utils/haptics';
import { useBottomInset } from '../../utils/bottomInset';
import { useStaffMessagesSkeleton } from '../../hooks/useStaffMessagesSkeleton';
import { StaffMessagesSkeleton } from '../../components/staff/StaffMessagesSkeleton';
import { useNativeBackExitGuard } from '../../utils/exitAppGuard';

// ── 1:1 Vector Icons ──────────────────────────────────────────────────────────

function SearchIcon({ size = 24, color = '#000000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.5" />
      <Path d="M20 20l-3.5-3.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function MessageCirclePlusIcon({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12 8v6M9 11h6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function ArrowLeft02Icon({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) {
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

function DashboardNavIcon({ size = 24, active = false }: { size?: number; active?: boolean }) {
  const color = active ? 'rgba(0, 8, 20, 0.96)' : 'rgba(96, 96, 102, 0.96)';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7.5" height="7.5" rx="2" fill={active ? color : 'none'} stroke={color} strokeWidth="1.5" />
      <Rect x="13.5" y="3" width="7.5" height="7.5" rx="2" fill={active ? color : 'none'} stroke={color} strokeWidth="1.5" />
      <Rect x="3" y="13.5" width="7.5" height="7.5" rx="2" fill={active ? color : 'none'} stroke={color} strokeWidth="1.5" />
      <Rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" fill={active ? color : 'none'} stroke={color} strokeWidth="1.5" />
    </Svg>
  );
}

function ChattingNavIcon({ size = 24, active = true }: { size?: number; active?: boolean }) {
  const color = active ? 'rgba(0, 8, 20, 0.96)' : 'rgba(96, 96, 102, 0.96)';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12C2 7.029 6.029 3 11 3h2c4.971 0 9 4.029 9 9 0 4.971-4.029 9-9 9H8l-4.5 1.5L5 18C3.12 16.32 2 14.28 2 12z"
        fill={active ? color : 'none'}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M8 10h8M8 14h5" stroke={active ? '#FFFFFF' : color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function ProfileNavIcon({ size = 24, active = false }: { size?: number; active?: boolean }) {
  const color = active ? 'rgba(0, 8, 20, 0.96)' : 'rgba(96, 96, 102, 0.96)';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.5" />
      <Path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

// ── Highlight Substring Helper ────────────────────────────────────────────────
function renderHighlightedName(fullName: string, query: string) {
  if (!query) {
    return <Text style={styles.conversationNameText}>{fullName}</Text>;
  }

  const lowerName = fullName.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerName.indexOf(lowerQuery);

  if (index === -1) {
    return <Text style={styles.conversationNameLightText}>{fullName}</Text>;
  }

  const before = fullName.slice(0, index);
  const match = fullName.slice(index, index + query.length);
  const after = fullName.slice(index + query.length);

  return (
    <Text style={styles.conversationNameText}>
      {before && <Text style={styles.conversationNameLightText}>{before}</Text>}
      <Text style={styles.conversationNameDarkText}>{match}</Text>
      {after && <Text style={styles.conversationNameLightText}>{after}</Text>}
    </Text>
  );
}

// ── Main Staff Messages Screen Component ──────────────────────────────────────
export function StaffMessagesScreen() {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { conversations, markConversationRead, totalUnreadCount } = useStaffMessages();

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<TextInput>(null);

  const { tabBottomOffset, tabScrollPadding, fabBottomOffset, bottomFadeHeight } = useBottomInset();
  const { isLoading } = useStaffMessagesSkeleton();

  // Filtered conversations when in search mode
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return conversations;
    }
    const q = searchQuery.toLowerCase().trim();
    return conversations.filter((c) => c.participantName.toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  const handleStartNewChat = () => {
    triggerLightHaptic();
    safeRouter.push(STAFF_ROUTES.NEW_CHAT as any);
  };

  const handleOpenConversation = (conv: StaffConversation) => {
    triggerLightHaptic();
    markConversationRead(conv.id);
    safeRouter.push({
      pathname: STAFF_ROUTES.CHAT as any,
      params: {
        conversationId: conv.id,
        participantId: conv.participantId,
        participantName: conv.participantName,
        participantRole: conv.participantRole,
      },
    });
  };

  const handleEnterSearch = () => {
    triggerLightHaptic();
    setIsSearchActive(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const handleExitSearch = () => {
    triggerLightHaptic();
    setSearchQuery('');
    setIsSearchActive(false);
  };

  // Android Native Back Button Guard:
  // - If search is active, closes search.
  // - Otherwise, prompts user with in-built Exit Confirmation Dialog; directing them to use in-app back buttons.
  useNativeBackExitGuard({
    closeActiveModal: () => {
      if (isSearchActive) {
        handleExitSearch();
        return true;
      }
      return false;
    },
  });

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="dark" />

      {/* ── Top Header Area ── */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 16 }]}>
        {!isSearchActive ? (
          <>
            <Text style={styles.screenTitle}>Message</Text>

            {/* Inactive Search Bar (Click to search) */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.searchBarIdle}
              onPress={handleEnterSearch}
            >
              <View style={styles.searchBarInnerRow}>
                <SearchIcon size={24} color="#000000" />
                <Text style={styles.searchPlaceholderText}>Search names here</Text>
              </View>
            </TouchableOpacity>
          </>
        ) : (
          /* Active Search Row (Back Button + Input) */
          <View style={styles.activeSearchRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.searchBackButton}
              onPress={handleExitSearch}
              accessibilityLabel="Back to messages"
            >
              <ArrowLeft02Icon size={24} color="rgba(0, 8, 20, 0.96)" />
            </TouchableOpacity>

            <View style={styles.activeSearchInputWrapper}>
              <TextInput
                ref={searchInputRef}
                style={styles.activeSearchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search names here"
                placeholderTextColor="rgba(96, 96, 102, 0.96)"
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>
          </View>
        )}
      </View>

      {/* ── Search Mode: Results Content ── */}
      {isSearchActive ? (
        <ScrollView
          style={styles.contentScrollView}
          contentContainerStyle={[
            styles.scrollContentContainer,
            { paddingBottom: insets.bottom + 16 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.resultsHeaderLabel}>Results</Text>

          {filteredConversations.length > 0 ? (
            <View style={styles.conversationsList}>
              {filteredConversations.map((conv) => (
                <TouchableOpacity
                  key={conv.id}
                  activeOpacity={0.7}
                  style={styles.conversationRow}
                  onPress={() => handleOpenConversation(conv)}
                >
                  <Image source={conv.participantAvatar} style={styles.avatarImage} />

                  <View style={styles.conversationContent}>
                    <View style={styles.leftCol}>
                      <View style={styles.nameAndTagRow}>
                        {renderHighlightedName(conv.participantName, searchQuery)}
                        <View style={styles.verticalDivider} />
                        <View style={styles.teamTagBadge}>
                          <Text style={styles.teamTagText}>Team</Text>
                        </View>
                      </View>
                      <Text style={styles.previewText} numberOfLines={1}>
                        {conv.lastMessagePreview || 'Started a conversation'}
                      </Text>
                    </View>

                    <View style={styles.rightCol}>
                      <Text style={styles.dateCaptionText}>{conv.dateText || 'Today'}</Text>
                      {conv.unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadBadgeText}>{conv.unreadCount}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.searchEmptyContainer}>
              <Image
                source={WAVING_PERSON_ILLUSTRATION}
                style={styles.searchEmptyImage}
                resizeMode="contain"
              />
              <Text style={styles.searchEmptyTitle}>No Result Found</Text>
              <Text style={styles.searchEmptySubtitle}>
                No messages or colleagues match "{searchQuery}"
              </Text>
            </View>
          )}
        </ScrollView>
      ) : isLoading ? (
        <StaffMessagesSkeleton />
      ) : conversations.length === 0 ? (
        /* ── Normal Mode: Screen 1 Empty State ── */
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCardBlock}>
            <Image
              source={WAVING_PERSON_ILLUSTRATION}
              style={styles.emptyIllustration}
              resizeMode="contain"
            />
            <Text style={styles.emptyTitleText}>No messages yet</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.startNewChatButton}
            onPress={handleStartNewChat}
          >
            <MessageCirclePlusIcon size={24} color="#FFFFFF" />
            <Text style={styles.startNewChatButtonText}>Start new chat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* ── Normal Mode: Screen 2 Populated Conversations List ── */
        <ScrollView
          style={styles.contentScrollView}
          contentContainerStyle={[
            styles.scrollContentContainer,
            { paddingBottom: tabScrollPadding },
          ]}
        >
          <View style={styles.conversationsList}>
            {conversations.map((conv) => (
              <TouchableOpacity
                key={conv.id}
                activeOpacity={0.7}
                style={styles.conversationRow}
                onPress={() => handleOpenConversation(conv)}
              >
                <Image source={conv.participantAvatar} style={styles.avatarImage} />

                <View style={styles.conversationContent}>
                  <View style={styles.leftCol}>
                    <View style={styles.nameAndTagRow}>
                      <Text style={styles.conversationNameText} numberOfLines={1}>
                        {conv.participantName}
                      </Text>
                      <View style={styles.verticalDivider} />
                      <View style={styles.teamTagBadge}>
                        <Text style={styles.teamTagText}>Team</Text>
                      </View>
                    </View>
                    <Text style={styles.previewText} numberOfLines={1}>
                      {conv.lastMessagePreview || 'Started a conversation'}
                    </Text>
                  </View>

                  <View style={styles.rightCol}>
                    <Text style={styles.timeCaptionText}>{conv.lastMessageTime || '12:11'}</Text>
                    {conv.unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>{conv.unreadCount}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* ── Floating New Chat FAB (Shown in list & empty list, hidden in search and loading) ── */}
      {!isSearchActive && !isLoading && (
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.fabButton,
            { bottom: fabBottomOffset },
          ]}
          onPress={handleStartNewChat}
          accessibilityLabel="New chat"
        >
          <MessageCirclePlusIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* ── Bottom Fade Gradient Shield (List frames) ── */}
      {!isSearchActive && (
        <View
          style={[styles.bottomFadeOverlay, { height: bottomFadeHeight }]}
          pointerEvents="none"
        >
          {Platform.OS === 'ios' && (
            <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
          )}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.85)', '#FFFFFF']}
            locations={[0, 0.4, 1.0]}
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}

      {/* ── Floating App Navigation Bar (List frames only) ── */}
      {!isSearchActive && (
        <View style={[styles.bottomNavContainer, { bottom: tabBottomOffset }]} pointerEvents="box-none">
          <View style={styles.bottomNavBar}>
            {/* Tab 1: Dashboard */}
            <TouchableOpacity
              style={styles.navTabItem}
              activeOpacity={0.8}
              onPress={() => {
                triggerLightHaptic();
                safeRouter.replace(STAFF_ROUTES.HOME as any);
              }}
            >
              <View style={styles.navTabContent}>
                <DashboardNavIcon size={24} active={false} />
                <Text style={[styles.navTabText, styles.navTabTextInactive]}>
                  Dashboard
                </Text>
              </View>
            </TouchableOpacity>

            {/* Tab 2: Messages (Active) */}
            <TouchableOpacity
              style={styles.navTabItem}
              activeOpacity={0.8}
              onPress={() => {
                triggerLightHaptic();
              }}
            >
              <View style={styles.navTabContent}>
                <ChattingNavIcon size={24} active={true} />
                <Text style={[styles.navTabText, styles.navTabTextActive]}>
                  Messages
                </Text>
              </View>

              {/* Active Indicator Bar: Rectangle 299 (width: 65px, height: 5px, radius: 8px) */}
              <View style={styles.activeTabIndicator} />
            </TouchableOpacity>

            {/* Tab 3: Profile */}
            <TouchableOpacity
              style={styles.navTabItem}
              activeOpacity={0.8}
              onPress={() => {
                triggerLightHaptic();
                safeRouter.replace(STAFF_ROUTES.PROFILE as any);
              }}
            >
              <View style={styles.navTabContent}>
                <ProfileNavIcon size={24} active={false} />
                <Text style={[styles.navTabText, styles.navTabTextInactive]}>
                  Profile
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// ── 1:1 Pixel-Accurate Styles (from staff-messages-converted.ts) ───────────────
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  screenTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.1,
    color: '#000000',
    marginBottom: 24,
    includeFontPadding: false,
  },
  searchBarIdle: {
    height: 48,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginBottom: 16,
  },
  searchBarInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  searchPlaceholderText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  /* ── Active Search Row ── */
  activeSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 16,
  },
  searchBackButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeSearchInputWrapper: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  activeSearchInput: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    padding: 0,
    includeFontPadding: false,
  },
  resultsHeaderLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    marginBottom: 16,
    includeFontPadding: false,
  },

  /* ── Content & Lists ── */
  contentScrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
  },
  conversationsList: {
    gap: 16,
  },
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 16,
    height: 64,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F0F5',
  },
  conversationContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftCol: {
    flex: 1,
    gap: 4,
    marginRight: 12,
  },
  nameAndTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 24,
  },
  conversationNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    includeFontPadding: false,
    maxWidth: 160,
  },
  conversationNameDarkText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    includeFontPadding: false,
  },
  conversationNameLightText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  verticalDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  teamTagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 24,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamTagText: {
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
  rightCol: {
    alignItems: 'flex-end',
    gap: 8,
    minWidth: 56,
  },
  timeCaptionText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: '#000000',
    textAlign: 'right',
    includeFontPadding: false,
  },
  dateCaptionText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'right',
    includeFontPadding: false,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: 'rgba(204, 41, 41, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    color: '#FFFFFF',
    includeFontPadding: false,
  },

  /* ── Screen 1 Empty State ── */
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyCardBlock: {
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  emptyIllustration: {
    width: 118,
    height: 118,
  },
  emptyTitleText: {
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: 188,
    height: 40,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 32,
    paddingHorizontal: 16,
  },
  startNewChatButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
  },

  /* ── Search Empty State ── */
  searchEmptyContainer: {
    alignItems: 'center',
    paddingTop: 64,
  },
  searchEmptyImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  searchEmptyTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    marginBottom: 8,
    includeFontPadding: false,
  },
  searchEmptySubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },

  /* ── Floating FAB ── */
  fabButton: {
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },

  /* ── Bottom Fade ── */
  bottomFadeOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 15,
  },

  /* ── Floating Navigation Bar (width: 300px, height: 80px) ── */
  bottomNavContainer: {
    position: 'absolute',
    width: 300,
    height: 80,
    alignSelf: 'center',
    zIndex: 100,
  },
  bottomNavBar: {
    width: 300,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
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
    alignItems: 'center',
    gap: 4,
  },
  navTabText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    textAlign: 'center',
    includeFontPadding: false,
  },
  navTabTextActive: {
    fontWeight: '500',
    color: 'rgba(0, 8, 20, 0.96)',
  },
  navTabTextInactive: {
    fontWeight: '400',
    color: 'rgba(96, 96, 102, 0.96)',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 65,
    height: 5,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 8,
  },
});

