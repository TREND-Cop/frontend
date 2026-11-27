import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../utils/safeNavigation';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import { useStaffMessages } from '../../context/StaffMessagesContext';
import { StaffContact, NO_STAFF_ILLUSTRATION } from '../../constants/staffMessages.config';
import { STAFF_ROUTES } from '../../constants/staffRoutes';
import { triggerLightHaptic } from '../../utils/haptics';

// ── 1:1 Vector Back Arrow ─────────────────────────────────────────────────────
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

export function StaffNewChatScreen() {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { colleagues, ownerContact, getOrCreateConversationForContact } = useStaffMessages();

  const [searchQuery, setSearchQuery] = useState('');

  // Search input strictly filters colleagues only (Admin remains pinned)
  const filteredColleagues = useMemo(() => {
    if (!searchQuery.trim()) {
      return colleagues;
    }
    const q = searchQuery.toLowerCase().trim();
    return colleagues.filter(
      (c) => c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q)
    );
  }, [colleagues, searchQuery]);

  const handleSelectContact = (contact: StaffContact) => {
    triggerLightHaptic();
    const conv = getOrCreateConversationForContact(contact);
    safeRouter.replace({
      pathname: STAFF_ROUTES.CHAT as any,
      params: {
        conversationId: conv.id,
        participantId: contact.id,
        participantName: contact.name,
        participantRole: contact.role,
      },
    });
  };

  // Singular / Plural formatting for Colleagues section
  const colleagueCount = filteredColleagues.length;
  const colleagueLabel = colleagueCount === 1 ? '1 Colleague' : `${colleagueCount} Colleagues`;

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="dark" />

      {/* ── Fixed Page Header (height: 64px) ── */}
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
            <ArrowLeft02Icon size={24} color="rgba(0, 8, 20, 0.96)" />
          </TouchableOpacity>

          {/* Centered Title */}
          <Text style={styles.headerTitle}>New Chat</Text>

          {/* Invisible Spacer */}
          <View style={styles.invisibleSpacer} pointerEvents="none" />
        </View>
      </View>

      {/* ── Scrollable Body ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Field (NO leading icon per New Chat design) */}
        <View style={styles.searchFieldWrapper}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search names here"
            placeholderTextColor="rgba(96, 96, 102, 0.96)"
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        {/* ── Admin Section (Owner is always present & pinned) ── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.adminSectionTitle}>Admin</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.contactRow}
            onPress={() => handleSelectContact(ownerContact)}
          >
            <Image source={ownerContact.avatar} style={styles.contactAvatar} />
            <View style={styles.contactTextCol}>
              <Text style={styles.contactName} numberOfLines={1}>
                {ownerContact.name}
              </Text>
              <Text style={styles.contactSubtitle} numberOfLines={1}>
                {ownerContact.role}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Colleagues Section ── */}
        <View style={[styles.sectionBlock, { marginTop: 28 }]}>
          <Text style={styles.colleaguesSectionTitle}>{colleagueLabel}</Text>

          {colleagueCount > 0 ? (
            <View style={styles.colleaguesList}>
              {filteredColleagues.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  style={styles.contactRow}
                  onPress={() => handleSelectContact(item)}
                >
                  <Image source={item.avatar} style={styles.contactAvatar} />
                  <View style={styles.contactTextCol}>
                    <Text style={styles.contactName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.contactSubtitle} numberOfLines={1}>
                      {item.role}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            /* Screen 8: Empty Colleagues State */
            <View style={styles.emptyColleaguesContainer}>
              <Image
                source={NO_STAFF_ILLUSTRATION}
                style={styles.emptyIllustration}
                resizeMode="contain"
              />
              <Text style={styles.emptyTitleText}>No Staff Found</Text>
              <Text style={styles.emptySubtitleText}>
                Business owner has yet to add staff to the business
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Bottom Fade Overlay ── */}
      <View
        style={[styles.bottomFadeOverlay, { height: insets.bottom + 60 }]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.85)', '#FFFFFF']}
          locations={[0, 0.4, 1.0]}
          style={StyleSheet.absoluteFill}
        />
      </View>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
  },
  headerContentRow: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  invisibleSpacer: {
    width: 48,
    height: 48,
    opacity: 0,
  },

  /* ── Scroll Body ── */
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchFieldWrapper: {
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginBottom: 24,
  },
  searchInput: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    padding: 0,
    includeFontPadding: false,
  },

  /* ── Sections ── */
  sectionBlock: {
    gap: 12,
  },
  adminSectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  colleaguesSectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  colleaguesList: {
    gap: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
    height: 64,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F0F5',
  },
  contactTextCol: {
    flex: 1,
    gap: 4,
  },
  contactName: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    includeFontPadding: false,
  },
  contactSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  /* ── Empty Colleagues State ── */
  emptyColleaguesContainer: {
    alignItems: 'center',
    paddingTop: 36,
    paddingHorizontal: 20,
  },
  emptyIllustration: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  emptyTitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
    includeFontPadding: false,
  },
  emptySubtitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },

  /* ── Bottom Fade Overlay ── */
  bottomFadeOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});

