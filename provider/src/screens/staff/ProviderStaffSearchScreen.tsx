import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Platform,
  StatusBar,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { DommyLoader } from '../../components/DommyLoader';
import {
  useStaffStore,
  useRecentStaffSearches,
  StaffMember,
  SUGGESTED_STAFF_GAVIN,
} from '../../store/staffStore';

// ── Typography Mandate (AGENTS.md & onefile.txt) ──────────────────────────────
const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

// ── 1:1 Vector Icons from onefile.txt ────────────────────────────────────────

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

function SearchIcon({ size = 24, color = '#000000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={1.5} />
      <Path d="M20 20l-4-4" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function CloseCircleIcon({ size = 20, color = 'rgba(96, 96, 102, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="8" fill="rgba(192, 192, 204, 0.4)" />
      <Path d="M7 7l6 6M13 7l-6 6" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

/**
 * 1:1 Figma checkmark-circle-02 selection radio
 */
function CheckmarkCircle02Icon({
  selected,
  size = 24,
}: {
  selected: boolean;
  size?: number;
}) {
  if (selected) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: 'rgba(0, 8, 20, 0.96)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
          <Path
            d="M3 7.2l2.8 2.8L11 4.5"
            stroke="#FFFFFF"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: 'rgba(192, 192, 204, 0.96)',
        backgroundColor: 'transparent',
      }}
    />
  );
}

/**
 * 1:1 Figma briefcase-06 Vector Icon
 */
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
      <Path d="M1.33 7.33h13.34" stroke={color} strokeWidth={1} />
      <Path d="M7.83 7.67v.5h.34v-.5" stroke={color} strokeWidth={1} />
    </Svg>
  );
}

/**
 * 1:1 Figma famicons:fast-food-outline Vector Icon
 */
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
        d="M3 11c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M2.5 13.5h14"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M3.5 16.5c0 1.5 2.5 2.5 6 2.5s6-1 6-2.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M17 9l1.5 10.5a1 1 0 001 .9h1a1 1 0 001-.9L23 9H17z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20 9V4.5l-1.5-1.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma home-03 Vector Icon
 */
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
        d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 21V12h6v9"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma seat-selector Vector Icon
 */
function SeatSelectorIcon({
  size = 16,
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
        d="M4 8.5v3a1 1 0 001 1h1.5"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 8.5v3a1 1 0 01-1 1h-1.5"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6 12.5h8"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      <Path
        d="M10 12.5V17"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      <Path
        d="M6.5 17h7"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function StarGoldIcon({
  size = 16,
  color = 'rgba(248, 155, 24, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 2.2l1.85 3.75 4.15.6-3 2.92.71 4.13L8 11.65l-3.71 1.95.71-4.13-3-2.92 4.15-.6L8 2.2z"
        fill={color}
      />
    </Svg>
  );
}

function AlertTriangleIcon({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <Path
        d="M20.268 7.00001C21.0378 5.66668 22.9622 5.66668 23.732 7.00001L39.3205 34C40.0903 35.3333 39.1281 37 37.5885 37H6.41154C4.87194 37 3.90969 35.3333 4.67949 34L20.268 7.00001Z"
        fill="#F04438"
      />
      <Path
        d="M22 16V25"
        stroke="#FFFFFF"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <Circle cx="22" cy="30" r="1.5" fill="#FFFFFF" />
    </Svg>
  );
}

function FourDotPulseLoader({
  dotSize = 16,
  spacing = 20,
  color = 'rgba(0, 8, 20, 0.96)',
}: {
  dotSize?: number;
  spacing?: number;
  color?: string;
}) {
  const dot1 = useRef(new Animated.Value(0.4)).current;
  const dot2 = useRef(new Animated.Value(0.4)).current;
  const dot3 = useRef(new Animated.Value(0.4)).current;
  const dot4 = useRef(new Animated.Value(0.4)).current;

  React.useEffect(() => {
    const createPulseAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0.4,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.delay(Math.max(0, 600 - delay)),
        ])
      );
    };

    const a1 = createPulseAnimation(dot1, 0);
    const a2 = createPulseAnimation(dot2, 150);
    const a3 = createPulseAnimation(dot3, 300);
    const a4 = createPulseAnimation(dot4, 450);

    a1.start();
    a2.start();
    a3.start();
    a4.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
      a4.stop();
    };
  }, [dot1, dot2, dot3, dot4]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing }}>
      {[dot1, dot2, dot3, dot4].map((anim, i) => (
        <Animated.View
          key={i}
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
            opacity: anim,
            transform: [
              {
                scale: anim.interpolate({
                  inputRange: [0.4, 1],
                  outputRange: [0.85, 1.1],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}

export function ProviderStaffSearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const searchTimeoutRef = useRef<any>(null);

  const { staffList } = useStaffStore();
  const { recentList, addRecentStaffSearch, deleteRecentStaffSearches } =
    useRecentStaffSearches();

  const isSearching = searchQuery.trim().length > 0;

  // Filtered staff results based on query
  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = searchQuery.toLowerCase().trim();
    return staffList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q) ||
        (s.service?.title && s.service.title.toLowerCase().includes(q))
    );
  }, [searchQuery, isSearching, staffList]);

  // Suggested staff when search has no direct match (e.g. Gavin Nwosisi from Figma)
  const suggestedStaff = useMemo(() => {
    if (searchResults.length > 0) return null;
    if (!isSearching) return null;
    return SUGGESTED_STAFF_GAVIN;
  }, [searchResults, isSearching]);

  // Handle staff card click
  const handleStaffPress = (staff: StaffMember) => {
    if (isSelectionMode) {
      toggleSelection(staff.id);
      return;
    }
    addRecentStaffSearch(staff.id);
    router.push({
      pathname: '/staff-profile',
      params: {
        id: staff.id,
        staffName: staff.name,
        staffRole: staff.role,
        staffStatus: staff.status,
        staffHours: staff.hours || '8am - 10:30pm',
      },
    });
  };

  // Selection mode toggles
  const handleClearAllPress = () => {
    setIsSelectionMode(true);
    setSelectedIds([]);
  };

  const handleCancelSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === recentList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(recentList.map((s) => s.id));
    }
  };

  const handleDeleteSearchPress = () => {
    if (selectedIds.length === 0) return;
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleteModalVisible(false);
    const toDelete = [...selectedIds];
    setIsDeleting(true);

    setTimeout(() => {
      deleteRecentStaffSearches(toDelete);
      setIsDeleting(false);
      setSelectedIds([]);
      if (recentList.length <= toDelete.length) {
        setIsSelectionMode(false);
      }
    }, 600);
  };

  const renderStatusTag = (staff: StaffMember) => {
    const code = staff.statusCode;
    if (code === 'available') {
      return (
        <View style={[styles.statusTag, styles.statusTagAvailable]}>
          <Briefcase06Icon size={16} color="rgba(12, 121, 12, 0.96)" />
          <Text style={styles.statusTextAvailable}>Available For work</Text>
        </View>
      );
    }
    if (code === 'on_break') {
      return (
        <View style={[styles.statusTag, styles.statusTagLunch]}>
          <FastFoodOutlineIcon size={16} color="rgba(248, 155, 24, 0.96)" />
          <Text style={styles.statusTextLunch}>Lunch Break</Text>
        </View>
      );
    }
    if (code === 'closed') {
      return (
        <View style={[styles.statusTag, styles.statusTagClosed]}>
          <Home03Icon size={16} color="rgba(96, 96, 102, 0.96)" />
          <Text style={styles.statusTextClosed}>Closed</Text>
        </View>
      );
    }
    return (
      <View style={[styles.statusTag, styles.statusTagAttending]}>
        <SeatSelectorIcon size={16} color="rgba(12, 121, 12, 0.96)" />
        <Text style={styles.statusTextAttending}>Attending to client</Text>
      </View>
    );
  };

  const renderStaffCard = (staff: StaffMember) => {
    const isSelected = selectedIds.includes(staff.id);

    return (
      <View key={staff.id} style={styles.cardRowContainer}>
        {/* Checkbox when in selection mode (delete state in onefile.txt) */}
        {isSelectionMode && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.checkboxTouchTarget}
            onPress={() => toggleSelection(staff.id)}
          >
            <CheckmarkCircle02Icon selected={isSelected} size={24} />
          </TouchableOpacity>
        )}

        {/* 358x116px Staff Card */}
        <TouchableOpacity
          activeOpacity={0.88}
          style={[styles.card, isSelectionMode && styles.cardInSelection]}
          onPress={() => handleStaffPress(staff)}
        >
          <View style={styles.cardInner}>
            {/* 80x80px Avatar (radius 16px) */}
            <Image
              source={staff.avatar}
              style={styles.avatar}
              resizeMode="cover"
            />

            {/* 230x84px Info Column */}
            <View style={styles.infoColumn}>
              {/* Row 1: Name */}
              <View style={styles.nameRow}>
                <Text style={styles.staffName} numberOfLines={1}>
                  {staff.name}
                </Text>
              </View>

              {/* Row 2: Role & Hours */}
              <View style={styles.roleTimeRow}>
                <Text style={styles.roleText}>{staff.role}</Text>
                <View style={styles.dotSeparator} />
                <Text style={styles.hoursText}>
                  {staff.hours || '8am - 10pm'}
                </Text>
              </View>

              {/* Row 3: Tag & Rate */}
              <View style={styles.tagRateRow}>
                {renderStatusTag(staff)}

                <View style={styles.ratingContainer}>
                  <StarGoldIcon size={16} />
                  <Text style={styles.ratingText}>
                    {staff.service?.rating || '4.1'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── 1:1 Figma Search Header (72px, top: 44px) ── */}
      <View style={styles.searchHeaderContainer}>
        <View style={styles.searchHeaderRow}>
          {/* Back button (48x48px, radius 24px) */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.backButton}
            onPress={() => {
              if (isSelectionMode) {
                setIsSelectionMode(false);
              } else {
                router.back();
              }
            }}
          >
            <ArrowLeft02Icon size={24} color="rgba(0, 8, 20, 0.96)" />
          </TouchableOpacity>

          {/* Search Bar Input (288x48px, or 230x48px in Selection Mode) */}
          <View
            style={[
              styles.searchBarContainer,
              isSelectionMode && styles.searchBarContainerWithCancel,
            ]}
          >
            <View style={styles.searchInputWrap}>
              <SearchIcon size={24} color="#000000" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search here.."
                placeholderTextColor="rgba(96, 96, 102, 0.96)"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (isSelectionMode) setIsSelectionMode(false);
                  if (text.trim().length > 0) {
                    setIsSearchLoading(true);
                    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
                    searchTimeoutRef.current = setTimeout(() => {
                      setIsSearchLoading(false);
                    }, 600);
                  } else {
                    setIsSearchLoading(false);
                  }
                }}
                autoFocus={true}
                returnKeyType="search"
              />
            </View>
            {isSearching && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setSearchQuery('');
                  setIsSearchLoading(false);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <CloseCircleIcon size={20} color="rgba(96, 96, 102, 0.96)" />
              </TouchableOpacity>
            )}
          </View>

          {/* Cancel button in selection mode (cancel delete state in onefile.txt) */}
          {isSelectionMode && (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.cancelButton}
              onPress={handleCancelSelectionMode}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Main Scroll View ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* ── State 1: Active Search Mode ── */}
        {isSearching ? (
          searchResults.length > 0 ? (
            /* Search Matches Found */
            <View>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Search Results</Text>
              </View>
              {searchResults.map((staff) => renderStaffCard(staff))}

              {/* 4-Dot Search Loader centered beneath results (matching b5.png) */}
              {isSearchLoading && (
                <View style={styles.searchLoaderContainer}>
                  <FourDotPulseLoader dotSize={16} spacing={20} />
                </View>
              )}
            </View>
          ) : (
            /* 1:1 Figma No Search Found with "You mean Gavin Nwosisi" */
            <View style={styles.noSearchFoundContainer}>
              {/* If still loading query, show 4-dot loader */}
              {isSearchLoading ? (
                <View style={styles.searchLoaderContainer}>
                  <FourDotPulseLoader dotSize={16} spacing={20} />
                </View>
              ) : (
                <>
                  {/* 150x150px Illustration */}
                  <Image
                    source={require('../../../assets/images/appointments/empty_search_illustration.png')}
                    style={styles.emptyIllustration}
                    resizeMode="contain"
                  />

                  <Text style={styles.noSearchFoundTitle}>No Search found</Text>

                  {suggestedStaff && (
                    <View style={styles.youMeanContainer}>
                      <Text style={styles.youMeanRegular}>You mean </Text>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleStaffPress(suggestedStaff)}
                      >
                        <Text style={styles.youMeanLink}>Gavin Nwosisi</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Display suggested staff card at top: 580px */}
                  {suggestedStaff && (
                    <View style={styles.suggestedStaffCardWrap}>
                      {renderStaffCard(suggestedStaff)}
                    </View>
                  )}
                </>
              )}
            </View>
          )
        ) : (
          /* ── State 2: Recent Searches / Selection Mode ── */
          recentList.length > 0 ? (
            <View>
              {/* Section Header (Recent Search + Clear all / Select all / Delete search) */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Recent Search</Text>

                {!isSelectionMode ? (
                  /* Normal mode: Clear all button (89x36px) */
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.clearAllButton}
                    onPress={handleClearAllPress}
                  >
                    <Text style={styles.clearAllText}>Clear all</Text>
                  </TouchableOpacity>
                ) : selectedIds.length === 0 ? (
                  /* Selection mode with 0 items: Select all */
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.selectAllButton}
                    onPress={handleSelectAll}
                  >
                    <Text style={styles.selectAllText}>Select all</Text>
                  </TouchableOpacity>
                ) : (
                  /* Selection mode with >= 1 items: Delete search (in Red) */
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.deleteSearchButton}
                    onPress={handleDeleteSearchPress}
                  >
                    <Text style={styles.deleteSearchText}>Delete search</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* List of Recent Staff */}
              {recentList.map((staff) => renderStaffCard(staff))}
            </View>
          ) : (
            /* 1:1 Figma Empty Search State: No Search history (Screenshot 1) */
            <View style={styles.emptyHistoryContainer}>
              <Image
                source={require('../../../assets/images/appointments/empty_search_illustration.png')}
                style={styles.emptyIllustration}
                resizeMode="contain"
              />
              <Text style={styles.emptyHistoryTitle}>No Search history</Text>
              <Text style={styles.emptyHistorySubtitle}>
                Type on the box above to search
              </Text>
            </View>
          )
        )}
      </ScrollView>

      {/* ── 1:1 Figma Delete Search Warning Modal (matching modal_zoom.png) ── */}
      <Modal
        visible={isDeleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            {/* Warning Triangle Icon */}
            <View style={styles.modalIconWrap}>
              <AlertTriangleIcon size={44} />
            </View>

            {/* Warning Text Block */}
            <View style={styles.modalTextWrap}>
              <Text style={styles.modalTitle}>Delete this search?</Text>
              <Text style={styles.modalBody}>
                Deleting your search history will permanently erase all previous search.
              </Text>
            </View>

            {/* Action Buttons Row */}
            <View style={styles.modalButtonsRow}>
              {/* Yes, Delete button (Red) */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.modalDeleteButton}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.modalDeleteText}>Yes, Delete</Text>
              </TouchableOpacity>

              {/* No, Cancel it button */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.modalCancelButton}
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>No, Cancel it.</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Standard Full-Screen Transition Loader ── */}
      <DommyLoader visible={isDeleting} />

      {/* ── Android Native System Dock Barrier ── */}
      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </SafeAreaView>
  );
}

export default ProviderStaffSearchScreen;

// ── 1:1 Converter Output Stylesheet from onefile.txt ─────────────────────────

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchHeaderContainer: {
    height: 72,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  searchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  searchBarContainer: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  searchBarContainerWithCancel: {
    flex: 1,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
  },
  cancelButton: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 36,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
  },
  clearAllButton: {
    width: 89,
    height: 36,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderRadius: 24,
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
  selectAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectAllText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  deleteSearchButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteSearchText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(204, 41, 41, 0.9)',
  },
  cardRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  checkboxTouchTarget: {
    paddingRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flex: 1,
    height: 116,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
  },
  cardInSelection: {
    flex: 1,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 84,
    width: '100%',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#EAEAEA',
  },
  infoColumn: {
    flex: 1,
    height: 84,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
  },
  staffName: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  roleTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    gap: 8,
  },
  roleText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  dotSeparator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },
  hoursText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  tagRateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 24,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    gap: 8,
    height: 24,
  },
  statusTagAvailable: {
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
  },
  statusTagLunch: {
    backgroundColor: 'rgba(246, 240, 230, 0.96)',
  },
  statusTagClosed: {
    backgroundColor: 'rgba(229, 229, 229, 0.8)',
  },
  statusTagAttending: {
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
  },
  statusTextAvailable: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(12, 121, 12, 0.96)',
  },
  statusTextLunch: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(248, 155, 24, 0.96)',
  },
  statusTextClosed: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  statusTextAttending: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(12, 121, 12, 0.96)',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  loaderContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* 1:1 Figma Empty Search State (matching Screenshot 1) */
  emptyHistoryContainer: {
    alignItems: 'center',
    paddingTop: 136,
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
    marginTop: 16,
    width: 150,
  },
  emptyHistorySubtitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    marginTop: 16,
    width: 258,
  },
  /* 1:1 Figma No Search Found State (matching Screenshot 2) */
  noSearchFoundContainer: {
    alignItems: 'center',
    paddingTop: 111,
  },
  noSearchFoundTitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
    textAlign: 'center',
    marginTop: 16,
    width: 150,
  },
  youMeanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    height: 24,
  },
  youMeanRegular: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  youMeanLink: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#1A82FF',
    textDecorationLine: 'underline',
  },
  suggestedStaffCardWrap: {
    width: '100%',
    marginTop: 114,
  },
  searchLoaderContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  /* 1:1 Figma Delete Warning Modal (matching modal_zoom.png) */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 8, 20, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  deleteModalContainer: {
    width: '100%',
    maxWidth: 326,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  modalIconWrap: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTextWrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalBody: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
  },
  modalDeleteButton: {
    flex: 1,
    height: 44,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDeleteText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
    color: 'rgba(204, 41, 41, 0.96)',
    textAlign: 'center',
  },
  modalCancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
});
