import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { StaffMember } from '../../hooks/useStaff';
import { triggerLightHaptic } from '../../utils/haptics';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

// ── Icons ─────────────────────────────────────────────────────────────────────

function SearchIcon({ size = 20, color = '#000000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={1.5} />
      <Path d="M20 20L16 16" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function ClearIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M3 3l10 10M13 3L3 13"
        stroke="rgba(96, 96, 102, 0.96)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BriefcaseIcon({ size = 20, color = 'rgba(192, 192, 204, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M7 2.5h6a1.5 1.5 0 011.5 1.5V5H5.5V4A1.5 1.5 0 017 2.5z"
        stroke={color}
        strokeWidth={1.2}
      />
      <Rect x="2.5" y="5" width="15" height="12.5" rx="2.5" stroke={color} strokeWidth={1.2} />
      <Path d="M2.5 9.5h15" stroke={color} strokeWidth={1.2} />
      <Path d="M9.5 9.5h1" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}

function BrainExperienceIcon({ size = 20, color = 'rgba(192, 192, 204, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="7.5" stroke={color} strokeWidth={1.2} />
      <Path d="M10 9V14" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
      <Circle cx="10" cy="6.5" r="0.8" fill={color} />
    </Svg>
  );
}

function CheckmarkCircleIcon({ isSelected }: { isSelected: boolean }) {
  if (isSelected) {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill="rgba(0, 8, 20, 0.96)" />
        <Path
          d="M8 12.2l2.8 2.8L16.5 9"
          stroke="#FFFFFF"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9.25" stroke="rgba(192, 192, 204, 0.96)" strokeWidth={1.5} />
    </Svg>
  );
}

function NoStaffIllustration() {
  return (
    <Svg width={150} height={150} viewBox="0 0 150 150" fill="none">
      <Rect x="20" y="10" width="110" height="110" rx="24" fill="#F2F4F7" />
      <Rect x="25" y="15" width="100" height="100" rx="22" fill="#E4E7EC" />
      <Rect x="30" y="20" width="90" height="90" rx="20" fill="#EAECF0" />
      <Circle cx="75" cy="54" r="16" fill="#98A2B3" />
      <Path
        d="M50 92c0-13.8 11.2-24 25-24s25 10.2 25 24v2H50v-2z"
        fill="#98A2B3"
      />
    </Svg>
  );
}

export interface StaffSelectorListProps {
  staffList: StaffMember[];
  selectedIds: string[];
  onToggleSelect: (staffId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  mode: 'create' | 'edit';
  introText?: string;
  onAddStaff?: () => void;
  onNoStaff?: () => void;
  testID?: string;
}

/**
 * 1:1 Figma Reusable Staff Selector List Component
 *
 * Implements:
 * - Search bar with filter preservation
 * - Staff selection cards (multi-select)
 * - Empty state ("No Staff Found") with Add staff button
 *   (Omits "I don't have staff" in edit mode per spec)
 */
export const StaffSelectorList: React.FC<StaffSelectorListProps> = ({
  staffList,
  selectedIds,
  onToggleSelect,
  searchQuery,
  onSearchChange,
  mode,
  introText,
  onAddStaff,
  onNoStaff,
  testID,
}) => {
  const filteredStaff = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) return staffList;
    return staffList.filter((staff) => staff.name.toLowerCase().includes(trimmed));
  }, [staffList, searchQuery]);

  const hasStaffData = staffList.length > 0;

  const defaultIntroText =
    mode === 'edit'
      ? 'The added staff will be seen by clients during the booking process. You can add more than one staff under a service.'
      : 'The selected staff will be responsible for this service. You can add more than one staff under a service.';

  if (!hasStaffData) {
    return (
      <View style={styles.emptyContainer} testID={testID}>
        <View style={styles.illustrationWrapper}>
          <NoStaffIllustration />
        </View>

        <Text style={styles.emptyTitle}>No Staff Found</Text>
        <Text style={styles.emptySubtitle}>
          You currently have no registered staff members.
        </Text>

        <View style={styles.emptyButtonsContainer}>
          {onAddStaff && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.addStaffButton}
              onPress={() => {
                triggerLightHaptic();
                onAddStaff();
              }}
              accessibilityLabel="Add staff"
              accessibilityRole="button"
            >
              <Text style={styles.addStaffButtonText}>Add staff</Text>
            </TouchableOpacity>
          )}

          {mode === 'create' && onNoStaff && (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.noStaffButton}
              onPress={() => {
                triggerLightHaptic();
                onNoStaff();
              }}
              accessibilityLabel="I don't have staff"
              accessibilityRole="button"
            >
              <Text style={styles.noStaffButtonText}>I don't have staff</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      {/* Intro Text */}
      <Text style={styles.introText}>{introText || defaultIntroText}</Text>

      {/* Search Bar (358x48px, radius 24px) */}
      <View style={styles.searchBar}>
        <View style={styles.searchIconWrapper}>
          <SearchIcon size={20} color="#000000" />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search staff name here.."
          placeholderTextColor="rgba(96, 96, 102, 0.96)"
          value={searchQuery}
          onChangeText={onSearchChange}
          autoCorrect={false}
          accessibilityLabel="Search staff by name"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchChange('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Clear search input"
          >
            <ClearIcon size={16} />
          </TouchableOpacity>
        )}
      </View>

      {/* Staff Cards List */}
      <View style={styles.staffCardsContainer}>
        {filteredStaff.length > 0 ? (
          filteredStaff.map((staff) => {
            const isSelected = selectedIds.includes(staff.id);
            return (
              <TouchableOpacity
                key={staff.id}
                activeOpacity={0.8}
                style={[
                  styles.staffCard,
                  isSelected && styles.staffCardSelected,
                ]}
                onPress={() => {
                  triggerLightHaptic();
                  onToggleSelect(staff.id);
                }}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`${staff.name}, ${staff.role}, ${staff.yearsExperience} years experience`}
              >
                {/* Staff Avatar / Headshot (80x80px, radius 24px) */}
                <View style={styles.avatarContainer}>
                  {staff.avatarUri ? (
                    <Image
                      source={{ uri: staff.avatarUri }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarInitial}>
                        {staff.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Staff Details (middle) */}
                <View style={styles.staffDetails}>
                  <Text style={styles.staffName} numberOfLines={1}>
                    {staff.name}
                  </Text>

                  {/* Role row */}
                  <View style={styles.metaRow}>
                    <BriefcaseIcon size={18} />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {staff.role}
                    </Text>
                  </View>

                  {/* Experience row */}
                  <View style={styles.metaRow}>
                    <BrainExperienceIcon size={18} />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {staff.yearsExperience} {staff.yearsExperience === 1 ? 'year' : 'years'} Experience
                    </Text>
                  </View>
                </View>

                {/* Checkmark circle selection indicator (24x24) */}
                <View style={styles.checkmarkWrapper}>
                  <CheckmarkCircleIcon isSelected={isSelected} />
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.noSearchResults}>
            <Text style={styles.noSearchText}>No staff matches "{searchQuery}"</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  introText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    marginBottom: 24,
  },
  searchBar: {
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchIconWrapper: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
  },
  staffCardsContainer: {
    width: '100%',
    gap: 16,
  },
  staffCard: {
    width: '100%',
    minHeight: 112,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  staffCardSelected: {
    borderColor: 'rgba(0, 8, 20, 0.2)',
    backgroundColor: '#FFFFFF',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    resizeMode: 'cover',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E4E7EC',
  },
  avatarInitial: {
    fontFamily: FONT_MEDIUM,
    fontSize: 28,
    color: '#475467',
  },
  staffDetails: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  staffName: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  checkmarkWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSearchResults: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  noSearchText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  illustrationWrapper: {
    marginBottom: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyButtonsContainer: {
    width: '100%',
    gap: 16,
  },
  addStaffButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addStaffButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },
  noStaffButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noStaffButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(0, 8, 20, 0.96)',
  },
});

export default StaffSelectorList;
