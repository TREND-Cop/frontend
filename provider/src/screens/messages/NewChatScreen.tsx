import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStaffStore, StaffMember } from '../../context/StaffContext';
import {
  SearchIcon,
  ArrowLeftCircleButton,
  SimpleArrowLeftIcon,
} from '../../components/messages/MessageIcons';

const NO_STAFF_ILLUSTRATION = require('../../../assets/images/messages/no_staff_illustration.png');
const DEFAULT_AVATAR = require('../../../assets/images/messages/lara_olapade.jpg');

export function NewChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { staff } = useStaffStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleAddStaff = useCallback(() => {
    // Navigates to existing Add Staff form from staff management flow
    router.push('/staff-add' as any);
  }, [router]);

  const handleStaffRowPress = useCallback((member: StaffMember) => {
    // TODO (Messages prompt 2): open or start the chat with this staff member
    // Pressable with no navigation yet per prompt 1 spec
  }, []);

  // Filter staff by case-insensitive word prefix matching
  const filteredStaff = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) return staff;
    return staff.filter((member) => {
      const words = member.name.toLowerCase().split(/\s+/);
      return words.some((word) => word.startsWith(trimmed)) || member.name.toLowerCase().includes(trimmed);
    });
  }, [staff, searchQuery]);

  // ── Render Case A: "No Staff Found" empty state ────────────────────────────
  if (staff.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />

        {/* Top search & back row (Figma No staff empty state: top 60px, gap 24px) */}
        <View style={styles.noStaffTopRow}>
          <TouchableOpacity
            style={styles.backCircleTouch}
            onPress={handleBack}
            activeOpacity={0.8}
            accessibilityLabel="Go back"
          >
            <ArrowLeftCircleButton size={48} />
          </TouchableOpacity>

          <View style={styles.searchBarContainer}>
            <SearchIcon size={24} color="#000000" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search names here"
              placeholderTextColor="rgba(96, 96, 102, 0.96)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Centered Empty State Content */}
        <View style={styles.noStaffContentContainer}>
          <Image
            source={NO_STAFF_ILLUSTRATION}
            style={styles.noStaffIllustration}
            resizeMode="contain"
          />

          <View style={styles.noStaffTextGroup}>
            <Text style={styles.noStaffTitle}>No Staff Found</Text>
            <Text style={styles.noStaffSubtitle}>
              Add staffs who will provide your services to clients.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addStaffButton}
            onPress={handleAddStaff}
            activeOpacity={0.85}
          >
            <Text style={styles.addStaffButtonText}>Add staffs</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Render Case B: Staff List with New Chat Header ─────────────────────────
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />

        {/* 1:1 Page Header: Back + "New Chat" title + Placeholder share button */}
        <View style={styles.pageHeader}>
          <TouchableOpacity
            style={styles.headerBackTouch}
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <SimpleArrowLeftIcon size={24} color="rgba(0, 8, 20, 0.96)" />
          </TouchableOpacity>

          <Text style={styles.pageHeaderTitle}>New Chat</Text>

          {/* Invisible placeholder matching Figma share-03 opacity 0 */}
          <View style={styles.headerSharePlaceholder} />
        </View>

        {/* Second back circle + Search Bar (Per Figma staff list design slip) */}
        <View style={styles.staffSearchRow}>
          <TouchableOpacity
            style={styles.backCircleTouch}
            onPress={handleBack}
            activeOpacity={0.8}
            accessibilityLabel="Go back"
          >
            <ArrowLeftCircleButton size={48} />
          </TouchableOpacity>

          <View style={styles.searchBarContainer}>
            <SearchIcon size={24} color="#000000" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search names here"
              placeholderTextColor="rgba(96, 96, 102, 0.96)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
          </View>
        </View>

        {/* N Staff Counter Label */}
        <View style={styles.staffCountContainer}>
          <Text style={styles.staffCountText}>{filteredStaff.length} Staff</Text>
        </View>

        {/* Staff Rows List */}
        <ScrollView
          style={styles.staffScrollView}
          contentContainerStyle={[
            styles.staffScrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 16 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {filteredStaff.map((member, index) => {
            const roleDisplay =
              (member.roles && member.roles.length > 0
                ? member.roles.join(', ')
                : member.role) || 'Specialist';
            const avatarSource = member.photoUri
              ? { uri: member.photoUri }
              : member.avatarUri
              ? { uri: member.avatarUri }
              : DEFAULT_AVATAR;

            return (
              <View key={member.id}>
                <TouchableOpacity
                  style={styles.staffRow}
                  activeOpacity={0.75}
                  onPress={() => handleStaffRowPress(member)}
                >
                  <Image source={avatarSource} style={styles.staffAvatar} />

                  <View style={styles.staffInfo}>
                    <Text style={styles.staffName} numberOfLines={1}>
                      {member.name}
                    </Text>
                    <Text style={styles.staffRole} numberOfLines={1}>
                      {roleDisplay}
                    </Text>
                  </View>
                </TouchableOpacity>

                {index < filteredStaff.length - 1 && <View style={styles.staffDivider} />}
              </View>
            );
          })}
        </ScrollView>
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

  // ── No Staff Empty State ──
  noStaffTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 24,
    width: '100%',
    maxWidth: 390,
    alignSelf: 'center',
  },
  backCircleTouch: {
    width: 48,
    height: 48,
  },
  searchBarContainer: {
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
  searchInput: {
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

  noStaffContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: -40,
  },
  noStaffIllustration: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  noStaffTextGroup: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
    maxWidth: 338,
  },
  noStaffTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    textAlign: 'center',
    includeFontPadding: false,
  },
  noStaffSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  addStaffButton: {
    width: 319,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(133, 139, 148, 0.08)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  addStaffButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
  },

  // ── Staff List State ──
  pageHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  headerBackTouch: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  pageHeaderTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  headerSharePlaceholder: {
    width: 48,
    height: 48,
    opacity: 0,
  },

  staffSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 24,
    width: '100%',
    maxWidth: 390,
    alignSelf: 'center',
  },
  staffCountContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  staffCountText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  staffScrollView: {
    flex: 1,
  },
  staffScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 16,
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
  },
  staffAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    flexShrink: 0,
  },
  staffInfo: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  staffName: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    includeFontPadding: false,
  },
  staffRole: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  staffDivider: {
    width: 302,
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    alignSelf: 'flex-end',
    marginVertical: 4,
  },
});
