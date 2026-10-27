import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

import { useServiceDraft } from '../../context/ServiceDraftContext';
import { useStaff, StaffMember } from '../../hooks/useStaff';
import { WizardStepper } from '../../components/wizard/WizardStepper';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { triggerLightHaptic } from '../../utils/haptics';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

// ── 1:1 Vector Icons ──────────────────────────────────────────────────────────

function ArrowLeft02Icon({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) {
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

function HelpCircleIcon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.5} />
      <Path
        d="M9.5 9.5C9.5 8.12 10.62 7 12 7C13.38 7 14.5 8.12 14.5 9.5C14.5 11 12.5 11.75 12.5 13.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Circle cx="12.5" cy="16.5" r="0.75" fill={color} />
    </Svg>
  );
}

function SearchIcon({ size = 24, color = '#000000' }: { size?: number; color?: string }) {
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

// ── 1:1 Empty State Illustration (150x150) ───────────────────────────────────
// TODO (Asset): Client will export exact empty-state illustration asset (150x150px)
function NoStaffIllustration() {
  return (
    <Svg width={150} height={150} viewBox="0 0 150 150" fill="none">
      {/* Background soft shadow card */}
      <Rect x="20" y="10" width="110" height="110" rx="24" fill="#F2F4F7" />
      {/* Middle card */}
      <Rect x="25" y="15" width="100" height="100" rx="22" fill="#E4E7EC" />
      {/* Front primary card */}
      <Rect x="30" y="20" width="90" height="90" rx="20" fill="#EAECF0" />
      {/* User Avatar Silhouette */}
      <Circle cx="75" cy="54" r="16" fill="#98A2B3" />
      <Path
        d="M50 92c0-13.8 11.2-24 25-24s25 10.2 25 24v2H50v-2z"
        fill="#98A2B3"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma AddStaffScreen (Step 2 of 4-step Business Services Wizard)
 *
 * Implements:
 * - State F1: Staff list unselected (Next greyed)
 * - State F2: Staff list with selections (Next dark)
 * - State F3: "No Staff Found" empty state with "Add staff" & "I don't have staff"
 * - State F4: Dimmed LoadingOverlay (4 dots)
 * - Full search filter by staff name
 * - Multi-select persistence in shared ServiceDraftContext
 */
export const AddStaffScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    draft,
    toggleStaffId,
    setProviderIsOwner,
    resetDraft,
  } = useServiceDraft();

  const { staffList } = useStaff();

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Loading overlay state
  const [isLoading, setIsLoading] = useState(false);

  // Filter staff by live search query
  const filteredStaff = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) return staffList;
    return staffList.filter((staff) => staff.name.toLowerCase().includes(trimmed));
  }, [staffList, searchQuery]);

  // Back action returns to Step 1 with draft intact
  const handleBack = () => {
    triggerLightHaptic();
    router.back();
  };

  // Header "?" tutorial guide
  const handleHeaderHelp = () => {
    triggerLightHaptic();
    router.push('/guide/general' as any);
  };

  // Toggle selection on staff member card
  const handleCardPress = (staffId: string) => {
    triggerLightHaptic();
    toggleStaffId(staffId);
  };

  // Next button handler (List State)
  const handlePressNext = () => {
    if (draft.staffIds.length === 0) {
      // Disabled when nothing selected; does nothing per spec
      return;
    }

    triggerLightHaptic();
    setIsLoading(true);

    // Mock network loading delay (800-1200ms) per Figma note
    // TODO (Backend): Replace with real API submission when connected
    setTimeout(() => {
      setIsLoading(false);
      router.push('/business-services-addons' as any);
    }, 1000);
  };

  // "Add staff" button handler (Empty State F3)
  const handlePressAddStaff = () => {
    triggerLightHaptic();
    setIsLoading(true);

    // Mock network loading delay per Figma note ("the page will load")
    // TODO (Backend): Replace with real API dispatch
    setTimeout(() => {
      setIsLoading(false);
      // Replace route so AddStaffScreen is not left in back-stack
      router.replace('/staffs' as any);
    }, 800);
  };

  // "I don't have staff" button handler (Empty State F3)
  const handlePressNoStaff = () => {
    triggerLightHaptic();
    // Set providerIsOwner = true and clear staffIds per Figma note
    setProviderIsOwner(true);
    // Direct navigation to Step 3 (Add-ons) without loading overlay per Figma connection
    router.push('/business-services-addons' as any);
  };

  const hasStaffData = staffList.length > 0;
  const hasSelection = draft.staffIds.length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── 1. Page Header (64px, "Add Services", help "?" button) ── */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerIconButton}
            onPress={handleBack}
            accessibilityLabel="Back to step 1"
          >
            <ArrowLeft02Icon size={24} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Add Services</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerIconButton}
            onPress={handleHeaderHelp}
            accessibilityLabel="Service tutorial guide"
          >
            <HelpCircleIcon size={24} />
          </TouchableOpacity>
        </View>

        {/* ── 2. Wizard Stepper (Step 2 active: 4 steps, width 358px, height 48px) ── */}
        <View style={styles.stepperContainer}>
          <WizardStepper currentStep={2} />
        </View>

        {/* ── 3. Content Body (State Driven) ── */}
        {hasStaffData ? (
          /* ═══════════════════════════════════════════════════════════════════
             LIST STATE (F1: Unselected / F2: Selected)
             ═══════════════════════════════════════════════════════════════════ */
          <View style={styles.listFlexWrapper}>
            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Intro Text */}
              <Text style={styles.introText}>
                The selected staff will be responsible for this service. You can add more than one staff under a service.
              </Text>

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
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                  accessibilityLabel="Search staff by name"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
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
                    const isSelected = draft.staffIds.includes(staff.id);
                    return (
                      <TouchableOpacity
                        key={staff.id}
                        activeOpacity={0.8}
                        style={[
                          styles.staffCard,
                          isSelected && styles.staffCardSelected,
                        ]}
                        onPress={() => handleCardPress(staff.id)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: isSelected }}
                        accessibilityLabel={`${staff.name}, ${staff.role}, ${staff.yearsExperience} ${
                          staff.yearsExperience === 1 ? 'year' : 'years'
                        } experience`}
                      >
                        {/* Avatar (80x80px, radius 24px) */}
                        <View style={styles.avatarContainer}>
                          {staff.avatarUri ? (
                            <Image
                              source={{ uri: staff.avatarUri }}
                              style={styles.avatarImage}
                              resizeMode="cover"
                            />
                          ) : (
                            // Placeholder avatar with user initials / default headshot silhouette
                            // TODO (Asset): Export real staff headshot photos
                            <View style={styles.avatarPlaceholder}>
                              <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                                <Circle cx="12" cy="8" r="4" fill="#98A2B3" />
                                <Path
                                  d="M5 19c0-3.87 3.13-7 7-7s7 3.13 7 7v1H5v-1z"
                                  fill="#98A2B3"
                                />
                              </Svg>
                            </View>
                          )}
                        </View>

                        {/* Staff Details (Name, Role, Experience) */}
                        <View style={styles.staffInfo}>
                          <Text style={styles.staffName} numberOfLines={1} ellipsizeMode="tail">
                            {staff.name}
                          </Text>

                          {/* Role Row */}
                          <View style={styles.metaRow}>
                            <BriefcaseIcon size={18} color="rgba(192, 192, 204, 0.96)" />
                            <Text style={styles.metaText} numberOfLines={1}>
                              {staff.role}
                            </Text>
                          </View>

                          {/* Experience Row */}
                          <View style={styles.metaRow}>
                            <BrainExperienceIcon size={18} color="rgba(192, 192, 204, 0.96)" />
                            <Text style={styles.metaText} numberOfLines={1}>
                              {staff.yearsExperience} {staff.yearsExperience === 1 ? 'year' : 'years'} Experience
                            </Text>
                          </View>
                        </View>

                        {/* Selection Check Circle (24x24px) */}
                        <View style={styles.checkCircleWrapper}>
                          <CheckmarkCircleIcon isSelected={isSelected} />
                        </View>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  // Minimal theme-based no-results view
                  <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsText}>
                      No staff found matching "{searchQuery}".
                    </Text>
                  </View>
                )}
              </View>

              {/* Bottom buffer */}
              <View style={{ height: 100 }} />
            </ScrollView>

            {/* Sticky Footer & Next Button (height: 76px, soft shadow) */}
            <View style={[styles.stickyFooter, { paddingBottom: Math.max(insets.bottom, 14) }]}>
              <TouchableOpacity
                activeOpacity={hasSelection ? 0.85 : 1}
                style={[
                  styles.nextButton,
                  hasSelection ? styles.nextButtonEnabled : styles.nextButtonDisabled,
                ]}
                onPress={handlePressNext}
                accessibilityRole="button"
                accessibilityLabel="Next to add-ons step"
              >
                <Text
                  style={[
                    styles.nextButtonText,
                    hasSelection ? styles.nextTextEnabled : styles.nextTextDisabled,
                  ]}
                >
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* ═══════════════════════════════════════════════════════════════════
             EMPTY STATE (F3: "No Staff Found")
             ═══════════════════════════════════════════════════════════════════ */
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.emptyScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Intro Text */}
            <Text style={styles.introText}>
              The added staff will be seen by clients during the booking process. You can add more than one staff under a service.
            </Text>

            {/* Illustration (150x150px) */}
            <View style={styles.illustrationWrapper}>
              <NoStaffIllustration />
            </View>

            {/* Texts */}
            <View style={styles.emptyTextContainer}>
              <Text style={styles.emptyTitle}>No Staff Found</Text>
              <Text style={styles.emptySubtitle}>
                Add staff who will provide your services to clients.
              </Text>
            </View>

            {/* Action Buttons (319x48px, radius 24px) */}
            <View style={styles.emptyActionsContainer}>
              {/* 1. Add staff (Dark Button) */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.addStaffButton}
                onPress={handlePressAddStaff}
                accessibilityRole="button"
                accessibilityLabel="Add staff"
              >
                <Text style={styles.addStaffButtonText}>Add staff</Text>
              </TouchableOpacity>

              {/* 2. I don't have staff (Light Button) */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.noStaffButton}
                onPress={handlePressNoStaff}
                accessibilityRole="button"
                accessibilityLabel="I don't have staff"
              >
                <Text style={styles.noStaffButtonText}>I don't have staff</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom buffer */}
            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {staffList.length === 0 && <NativeDockSpacer backgroundColor="#FFFFFF" />}
      </KeyboardAvoidingView>

      {/* ── 4. Dimmed Loading Overlay (F4: 4 dots, blocks touches) ── */}
      <LoadingOverlay
        visible={isLoading}
        dotsCount={4}
        dotSize={16}
        dotGap={20}
        overlayOpacity={0.1}
        dotColor="rgba(0, 8, 20, 0.96)"
      />
    </SafeAreaView>
  );
};

export default AddStaffScreen;

// ── Styles (1:1 Figma Measurements from CSS Spec) ─────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },

  // 1. Header (height: 64px, padding: 8px 16px)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 64,
    backgroundColor: '#FFFFFF',
  },
  headerIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },

  // 2. Stepper Container (top: 132px, height: 48px, width: 358px)
  stepperContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
    alignItems: 'center',
  },

  // Scroll Container
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },
  listFlexWrapper: {
    flex: 1,
  },

  // Intro text (358x60px, 14px 400, line-height 20px, letter-spacing 0.4px)
  introText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    marginBottom: 24,
  },

  // 3. Search Bar (358x48px, radius: 24px, bg: rgba(248, 249, 250, 0.98))
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  searchIconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
  },

  // 4. Staff Cards List
  staffCardsContainer: {
    gap: 16,
  },
  staffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
  },
  staffCardSelected: {
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#EAECF0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EAECF0',
  },
  staffInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
    justifyContent: 'center',
    gap: 6,
  },
  staffName: {
    fontFamily: FONT_REGULAR,
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
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    flexShrink: 1,
  },
  checkCircleWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  noResultsContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  noResultsText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // 5. Sticky Footer (height: 76px, box-shadow)
  stickyFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.6)',
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  nextButton: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonEnabled: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  nextButtonText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  nextTextEnabled: {
    color: '#FFFFFF',
  },
  nextTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },

  // 6. Empty State F3 Styles
  emptyScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    alignItems: 'center',
  },
  illustrationWrapper: {
    width: 150,
    height: 150,
    marginTop: 20,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTextContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 36,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  emptyActionsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  addStaffButton: {
    width: 319,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addStaffButtonText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },
  noStaffButton: {
    width: 319,
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
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(0, 8, 20, 0.96)',
  },
});
