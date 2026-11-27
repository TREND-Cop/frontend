import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { useStaffStore, StaffMember } from '../../context/StaffContext';
import {
  deriveStaffStatus,
  DEV_STAFF_ONGOING_APPOINTMENTS,
} from '../../constants/staffStatus.config';
import {
  RecentSearchStaffItem,
  INITIAL_RECENT_SEARCHES,
  findSuggestedStaffName,
} from '../../constants/staffSearch.config';
import { DeleteSearchConfirmModal } from '../../components/staff/DeleteSearchConfirmModal';
import { triggerLightHaptic } from '../../utils/haptics';

const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

const SEARCH_NOT_FOUND_IMAGE = require('../../../assets/images/search_not_found.png');

// ── 1:1 Vector Icons ────────────────────────────────────────────────────────

function ArrowLeft02Icon({
  size = 24,
  color = 'rgba(0, 8, 20, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.57 5.93L3.5 12L9.57 18.07"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.5 12H3.67"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ArrowRight02Icon({
  size = 24,
  color = 'rgba(0, 8, 20, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14.43 5.93L20.5 12L14.43 18.07"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3.5 12H20.33"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SearchIcon({ size = 24, color = '#000000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={1.5} />
      <Path d="M20 20l-4-4" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function CancelIcon({
  size = 20,
  color = 'rgba(96, 96, 102, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckmarkCircle02Icon({
  checked = false,
  size = 24,
}: {
  checked?: boolean;
  size?: number;
}) {
  if (checked) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill="rgba(12, 121, 12, 0.96)" />
        <Path
          d="M8 12l2.8 2.8L16 9.6"
          stroke="#FFFFFF"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="rgba(192, 192, 204, 0.96)" strokeWidth={1.5} />
    </Svg>
  );
}

function StarGoldIcon({
  size = 18,
  color = 'rgba(248, 155, 24, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path
        d="M9 2.5l2.09 4.24 4.68.68-3.39 3.3 0.8 4.66L9 13.18l-4.18 2.2.8-4.66-3.39-3.3 4.68-.68L9 2.5z"
        fill={color}
      />
    </Svg>
  );
}

function Time04Icon({
  size = 18,
  color = 'rgba(96, 96, 102, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Circle cx="9" cy="9" r="7.5" stroke={color} strokeWidth={1} />
      <Path
        d="M9 5.25v3.75l2.25 1.5"
        stroke={color}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Briefcase06Icon({
  size = 16,
  color = 'rgba(12, 121, 12, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M5.66 4.33V3c0-.55.45-1 1-1h2.68c.55 0 1 .45 1 1v1.33"
        stroke={color}
        strokeWidth={1}
        strokeLinecap="round"
      />
      <Rect
        x="1.33"
        y="4.33"
        width="13.34"
        height="9.67"
        rx="2"
        stroke={color}
        strokeWidth={1}
      />
      <Path d="M1.33 8h13.34" stroke={color} strokeWidth={1} strokeLinecap="round" />
      <Path
        d="M7 8v1.33h2V8"
        stroke={color}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function FastFoodOutlineIcon({
  size = 16,
  color = 'rgba(248, 155, 24, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 11h16a1 1 0 011 1v1a7 7 0 01-7 7H10a7 7 0 01-7-7v-1a1 1 0 011-1z"
        stroke={color}
        strokeWidth={1.5}
      />
      <Path d="M5 11c0-4 3.5-7 7-7s7 3 7 7" stroke={color} strokeWidth={1.5} />
      <Path d="M9 15h6" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function Home03Icon({
  size = 16,
  color = 'rgba(96, 96, 102, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9.5z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SeatSelectorIcon({
  size = 20,
  color = 'rgba(12, 121, 12, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M6.5 8V4.5C6.5 3.12 7.62 2 9 2h2c1.38 0 2.5 1.12 2.5 2.5V8"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      <Path
        d="M4 8.5v3a1 1 0 001 1h1.5M16 8.5v3a1 1 0 01-1 1h-1.5M6 12.5h8M10 12.5V17M6.5 17h7"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ProviderStaffSearchScreen() {
  const safeRouter = useSafeRouter();
  const { staff: providerStaff } = useStaffStore();
  const inputRef = useRef<TextInput>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<RecentSearchStaffItem[]>(INITIAL_RECENT_SEARCHES);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedDeleteIds, setSelectedDeleteIds] = useState<string[]>([]);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  useEffect(() => {
    // Focus search input on mount
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Compute live matching staff
  const staffWithStatus = useMemo(() => {
    const defaultAvatars = [
      require('../../../assets/images/profile/godwin_profile_avatar.png'),
      require('../../../assets/images/profile/gavin_nwosis_avatar.png'),
    ];
    return providerStaff.map((member, index) => {
      const derived = deriveStaffStatus(member, DEV_STAFF_ONGOING_APPOINTMENTS);
      const photoUri = member.avatarUri || member.photoUri;
      const photo = photoUri
        ? (typeof photoUri === 'string' ? { uri: photoUri } : photoUri)
        : defaultAvatars[index % defaultAvatars.length];
      const roleText = member.role || (index % 2 === 0 ? 'Nail Artist' : 'Barber');
      const hoursText =
        member.workHours?.start && member.workHours?.end
          ? `${member.workHours.start} - ${member.workHours.end}`
          : '8am - 10pm';
      return { member, photo, roleText, hoursText, derived };
    });
  }, [providerStaff]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return staffWithStatus.filter(
      (item) =>
        item.member.name.toLowerCase().includes(q) ||
        item.roleText.toLowerCase().includes(q)
    );
  }, [staffWithStatus, searchQuery]);

  // "Do you mean" suggestion
  const suggestedName = useMemo(() => {
    if (!searchQuery.trim() || searchResults.length > 0) return null;
    return findSuggestedStaffName(searchQuery, providerStaff);
  }, [searchQuery, searchResults.length, providerStaff]);

  // Multi-select toggle
  const toggleSelectDelete = (id: string) => {
    triggerLightHaptic();
    setSelectedDeleteIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleConfirmDelete = () => {
    setRecentSearches((prev) => prev.filter((item) => !selectedDeleteIds.includes(item.id)));
    setSelectedDeleteIds([]);
    setIsDeleteMode(false);
    setConfirmModalVisible(false);
  };

  const handleStaffCardPress = (memberId: string, memberName: string) => {
    triggerLightHaptic();
    // Add to recent search
    setRecentSearches((prev) => {
      if (prev.some((r) => r.staffId === memberId)) return prev;
      const matched = staffWithStatus.find((s) => s.member.id === memberId);
      const newItem: RecentSearchStaffItem = {
        id: `recent_${Date.now()}`,
        staffId: memberId,
        name: memberName,
        role: matched?.roleText || 'Specialist',
        hours: matched?.hoursText || '8am - 10pm',
        avatar: matched?.photo || require('../../../assets/images/profile/godwin_profile_avatar.png'),
        rating: '4.1',
        timestamp: Date.now(),
      };
      return [newItem, ...prev].slice(0, 8);
    });
    // Navigate to staff profile
    safeRouter.push({
      pathname: '/staff-profile/[id]' as any,
      params: { id: memberId },
    });
  };

  const handleBusyCardPress = (memberId: string, memberName: string) => {
    triggerLightHaptic();
    setRecentSearches((prev) => {
      if (prev.some((r) => r.staffId === memberId)) return prev;
      const matched = staffWithStatus.find((s) => s.member.id === memberId);
      const newItem: RecentSearchStaffItem = {
        id: `recent_${Date.now()}`,
        staffId: memberId,
        name: memberName,
        role: matched?.roleText || 'Specialist',
        hours: matched?.hoursText || '8am - 10pm',
        avatar: matched?.photo || require('../../../assets/images/profile/godwin_profile_avatar.png'),
        rating: '4.1',
        timestamp: Date.now(),
      };
      return [newItem, ...prev].slice(0, 8);
    });
    safeRouter.push({
      pathname: '/staff-in-progress/[id]' as any,
      params: { id: memberId },
    });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Search Header (Height 72px) ── */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Back Button (48×48) */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => safeRouter.back()}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <ArrowLeft02Icon size={24} color="rgba(0, 8, 20, 0.96)" />
          </TouchableOpacity>

          {/* Search Bar Input (288×48px) */}
          <View style={styles.searchInputContainer}>
            <SearchIcon size={24} color="#000000" />
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search staff here.."
              placeholderTextColor="rgba(96, 96, 102, 0.96)"
              returnKeyType="search"
              autoCapitalize="words"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                <CancelIcon size={20} color="rgba(96, 96, 102, 0.96)" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* ── Main Content Area ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {searchQuery.trim().length === 0 ? (
          // ── CASE A: RECENT SEARCHES OR EMPTY SEARCH HISTORY ──
          recentSearches.length > 0 ? (
            <View style={styles.sectionContainer}>
              {/* Section Header: 'Recent Search' + 'Clear all' / 'Cancel' */}
              <View style={styles.recentHeaderRow}>
                <Text style={styles.recentHeaderTitle}>Recent Search</Text>
                {isDeleteMode ? (
                  <TouchableOpacity
                    style={styles.cancelDeleteBtn}
                    onPress={() => {
                      triggerLightHaptic();
                      setIsDeleteMode(false);
                      setSelectedDeleteIds([]);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelDeleteText}>Cancel</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.clearAllBtn}
                    onPress={() => {
                      triggerLightHaptic();
                      setIsDeleteMode(true);
                      setSelectedDeleteIds([]);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.clearAllText}>Clear all</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Recent Staff Cards List (40px gap) */}
              <View style={styles.cardsList}>
                {recentSearches.map((item) => {
                  const isChecked = selectedDeleteIds.includes(item.id);
                  return (
                    <View key={item.id} style={styles.recentItemRow}>
                      {isDeleteMode && (
                        <TouchableOpacity
                          style={styles.checkboxTouch}
                          onPress={() => toggleSelectDelete(item.id)}
                          activeOpacity={0.8}
                        >
                          <CheckmarkCircle02Icon checked={isChecked} size={24} />
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={[
                          styles.compactCard,
                          isDeleteMode && styles.compactCardWithSelect,
                        ]}
                        activeOpacity={0.85}
                        onPress={() => {
                          if (isDeleteMode) {
                            toggleSelectDelete(item.id);
                          } else {
                            handleStaffCardPress(item.staffId, item.name);
                          }
                        }}
                      >
                        <Image source={item.avatar} style={styles.compactAvatar} resizeMode="cover" />
                        <View style={styles.compactInfoCol}>
                          <Text style={styles.compactName} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <View style={styles.compactFieldTimeRow}>
                            <Text style={styles.compactRole} numberOfLines={1}>
                              {item.role}
                            </Text>
                            <View style={styles.compactDot} />
                            <Text style={styles.compactHours} numberOfLines={1}>
                              {item.hours}
                            </Text>
                          </View>
                          <View style={styles.compactTagRateRow}>
                            <View style={styles.availableChip}>
                              <Briefcase06Icon size={16} color="rgba(12, 121, 12, 0.96)" />
                              <Text style={styles.availableChipText}>Available For work</Text>
                            </View>
                            <View style={styles.compactRatingRow}>
                              <StarGoldIcon size={16} color="rgba(248, 155, 24, 0.96)" />
                              <Text style={styles.compactRatingText}>{item.rating}</Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>

              {/* Bottom Delete Search Action Button in Delete Mode */}
              {isDeleteMode && selectedDeleteIds.length > 0 && (
                <View style={styles.deleteBarContainer}>
                  <TouchableOpacity
                    style={styles.deleteSearchActionBtn}
                    onPress={() => {
                      triggerLightHaptic();
                      setConfirmModalVisible(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.deleteSearchActionText}>
                      Delete search ({selectedDeleteIds.length})
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            // ── EMPTY SEARCH HISTORY STATE ──
            <View style={styles.emptyHistoryContainer}>
              <Image
                source={SEARCH_NOT_FOUND_IMAGE}
                style={styles.emptyIllustration}
                resizeMode="contain"
              />
              <Text style={styles.emptyHistoryTitle}>No Search history</Text>
              <Text style={styles.emptyHistorySubtitle}>
                Type on search box above to search for staffs
              </Text>
            </View>
          )
        ) : (
          // ── CASE B: LIVE SEARCH RESULTS ──
          searchResults.length > 0 ? (
            <View style={styles.cardsList}>
              {searchResults.map((item) => {
                const { member, photo, roleText, hoursText, derived } = item;

                // Busy Card
                if (derived.status === 'busy') {
                  const serviceInfo = derived.ongoingService || {
                    title: 'Hair wash',
                    photo: require('../../../assets/images/appointments/hair_cut.jpg'),
                    rating: '3.5',
                    duration: '1hr',
                    price: '₦22,700',
                  };

                  return (
                    <TouchableOpacity
                      key={member.id}
                      style={styles.busyCard}
                      activeOpacity={0.85}
                      onPress={() => handleBusyCardPress(member.id, member.name)}
                    >
                      <View style={styles.busyTopRow}>
                        <Image source={photo} style={styles.busyAvatar} resizeMode="cover" />
                        <View style={styles.busyNameCol}>
                          <Text style={styles.busyNameText} numberOfLines={1}>
                            {member.name}
                          </Text>
                          <Text style={styles.busyRoleText} numberOfLines={1}>
                            {roleText}
                          </Text>
                        </View>
                        <View style={styles.busyChip}>
                          <SeatSelectorIcon size={20} color="rgba(12, 121, 12, 0.96)" />
                          <Text style={styles.busyChipText}>Busy</Text>
                        </View>
                      </View>
                      <View style={styles.cardDivider} />
                      <View style={styles.busyServiceRow}>
                        <Image source={serviceInfo.photo} style={styles.servicePhoto} resizeMode="cover" />
                        <View style={styles.serviceInfoCol}>
                          <Text style={styles.serviceTitle} numberOfLines={1}>
                            {serviceInfo.title}
                          </Text>
                          <View style={styles.serviceRatingDurationRow}>
                            <View style={styles.serviceRatingBadge}>
                              <StarGoldIcon size={16} color="rgba(248, 155, 24, 0.96)" />
                              <Text style={styles.serviceRatingText}>{serviceInfo.rating}</Text>
                            </View>
                            <View style={styles.serviceDurationBadge}>
                              <Time04Icon size={16} color="rgba(96, 96, 102, 0.96)" />
                              <Text style={styles.serviceDurationText}>{serviceInfo.duration}</Text>
                            </View>
                          </View>
                          <Text style={styles.servicePrice}>{serviceInfo.price}</Text>
                        </View>
                        <View style={styles.arrowButton}>
                          <ArrowRight02Icon size={24} color="rgba(0, 8, 20, 0.96)" />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                }

                // Compact Card
                return (
                  <TouchableOpacity
                    key={member.id}
                    style={styles.compactCard}
                    activeOpacity={0.85}
                    onPress={() => handleStaffCardPress(member.id, member.name)}
                  >
                    <Image source={photo} style={styles.compactAvatar} resizeMode="cover" />
                    <View style={styles.compactInfoCol}>
                      <Text style={styles.compactName} numberOfLines={1}>
                        {member.name}
                      </Text>
                      <View style={styles.compactFieldTimeRow}>
                        <Text style={styles.compactRole} numberOfLines={1}>
                          {roleText}
                        </Text>
                        <View style={styles.compactDot} />
                        <Text style={styles.compactHours} numberOfLines={1}>
                          {hoursText}
                        </Text>
                      </View>
                      <View style={styles.compactTagRateRow}>
                        {derived.status === 'available' && (
                          <View style={styles.availableChip}>
                            <Briefcase06Icon size={16} color="rgba(12, 121, 12, 0.96)" />
                            <Text style={styles.availableChipText}>Available For work</Text>
                          </View>
                        )}
                        {derived.status === 'on_break' && (
                          <View style={styles.lunchBreakChip}>
                            <FastFoodOutlineIcon size={16} color="rgba(248, 155, 24, 0.96)" />
                            <Text style={styles.lunchBreakChipText}>Lunch Break</Text>
                          </View>
                        )}
                        {derived.status === 'closed' && (
                          <View style={styles.closedChip}>
                            <Home03Icon size={16} color="rgba(96, 96, 102, 0.96)" />
                            <Text style={styles.closedChipText}>Closed</Text>
                          </View>
                        )}
                        <View style={styles.compactRatingRow}>
                          <StarGoldIcon size={16} color="rgba(248, 155, 24, 0.96)" />
                          <Text style={styles.compactRatingText}>4.1</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : suggestedName ? (
            // ── DO YOU MEAN SUGGESTION ──
            <View style={styles.suggestedContainer}>
              <View style={styles.suggestedRow}>
                <Text style={styles.doYouMeanLabel}>Do you mean</Text>
                <TouchableOpacity
                  style={styles.suggestedTag}
                  onPress={() => {
                    triggerLightHaptic();
                    setSearchQuery(suggestedName);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.suggestedText}>{suggestedName}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // ── NO RESULTS FOUND ──
            <View style={styles.emptyHistoryContainer}>
              <Image
                source={SEARCH_NOT_FOUND_IMAGE}
                style={styles.emptyIllustration}
                resizeMode="contain"
              />
              <Text style={styles.emptyHistoryTitle}>No Staff Found</Text>
              <Text style={styles.emptyHistorySubtitle}>
                No staff members match "{searchQuery}"
              </Text>
            </View>
          )
        )}
      </ScrollView>

      {/* ── Native Dock Protection Spacer ── */}
      <NativeDockSpacer />

      {/* ── Delete Confirmation Modal ── */}
      <DeleteSearchConfirmModal
        visible={confirmModalVisible}
        onClose={() => setConfirmModalVisible(false)}
        onConfirm={handleConfirmDelete}
        count={selectedDeleteIds.length}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 72,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(0, 8, 20, 0.96)',
    padding: 0,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  sectionContainer: {
    width: 358,
  },
  recentHeaderRow: {
    width: 358,
    height: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  recentHeaderTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
  },
  clearAllBtn: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearAllText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  cancelDeleteBtn: {
    height: 40,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelDeleteText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  cardsList: {
    width: 358,
    gap: 40,
  },
  recentItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  checkboxTouch: {
    padding: 4,
  },
  compactCardWithSelect: {
    flex: 1,
    width: 'auto',
  },
  deleteBarContainer: {
    width: 358,
    alignItems: 'center',
    marginTop: 32,
  },
  deleteSearchActionBtn: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteSearchActionText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(204, 41, 41, 0.9)',
  },
  emptyHistoryContainer: {
    width: 358,
    alignItems: 'center',
    marginTop: 64,
    gap: 16,
  },
  emptyIllustration: {
    width: 150,
    height: 150,
  },
  emptyHistoryTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    textAlign: 'center',
  },
  emptyHistorySubtitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    width: 285,
  },
  suggestedContainer: {
    width: 358,
    alignItems: 'center',
    marginTop: 48,
  },
  suggestedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  doYouMeanLabel: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  suggestedTag: {
    height: 32,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestedText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  /* ── 1:1 BUSY CARD (Large 358×208) ── */
  busyCard: {
    width: 358,
    height: 208,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    padding: 16,
  },
  busyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    width: '100%',
  },
  busyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 24,
  },
  busyNameCol: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  busyNameText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  busyRoleText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  busyChip: {
    height: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 8,
  },
  busyChipText: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    color: 'rgba(12, 121, 12, 0.96)',
  },
  cardDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginTop: 16,
    marginBottom: 16,
  },
  busyServiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 72,
    width: '100%',
  },
  servicePhoto: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  serviceInfoCol: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  serviceTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  serviceRatingDurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 4,
  },
  serviceRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceRatingText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  serviceDurationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceDurationText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  servicePrice: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    marginTop: 4,
  },
  arrowButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── 1:1 COMPACT CARD (358×116) ── */
  compactCard: {
    width: 358,
    height: 116,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactAvatar: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  compactInfoCol: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  compactName: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  compactFieldTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  compactRole: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  compactDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
    marginHorizontal: 8,
  },
  compactHours: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  compactTagRateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  availableChip: {
    height: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 8,
  },
  availableChipText: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    color: 'rgba(12, 121, 12, 0.96)',
  },
  lunchBreakChip: {
    height: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 248, 235, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 8,
  },
  lunchBreakChipText: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    color: 'rgba(248, 155, 24, 0.96)',
  },
  closedChip: {
    height: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 8,
  },
  closedChipText: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  compactRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactRatingText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
});
