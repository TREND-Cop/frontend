import { useSafeRouter } from '../../utils/safeNavigation';
import React, { useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { LoadingOverlay } from '../../components/LoadingOverlay';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { useNativeDock } from '../../utils/useNativeDock';
import { ReviewAddOnsSection } from '../../components/wizard/ReviewAddOnsSection';
import { ReviewPackageSection } from '../../components/wizard/ReviewPackageSection';
import { ReviewServiceCard } from '../../components/wizard/ReviewServiceCard';
import { WizardStepper } from '../../components/wizard/WizardStepper';
import { useServiceDraft } from '../../context/ServiceDraftContext';
import { addCreatedService, Service } from '../../hooks/useServices';
import { StaffMember, useStaff } from '../../hooks/useStaff';
import { triggerLightHaptic } from '../../utils/haptics';
import { formatDurationCompact, getServicePricing } from '../../utils/servicePricing';

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

function Time04Icon({ size = 18, color = 'rgba(96, 96, 102, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.5} />
      <Path d="M12 7v5l3 2" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BriefcaseIcon({ size = 18, color = 'rgba(192, 192, 204, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M7 2.5h6a1.5 1.5 0 011.5 1.5V5H5.5V4A1.5 1.5 0 017 2.5z"
        stroke={color}
        strokeWidth={1.2}
      />
      <Path
        d="M2.5 7.5a2.5 2.5 0 012.5-2.5h10a2.5 2.5 0 012.5 2.5v7.5a2.5 2.5 0 01-2.5 2.5H5a2.5 2.5 0 01-2.5-2.5V7.5z"
        stroke={color}
        strokeWidth={1.2}
      />
      <Path d="M2.5 9.5h15" stroke={color} strokeWidth={1.2} />
    </Svg>
  );
}

function BrainExperienceIcon({ size = 18, color = 'rgba(192, 192, 204, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="7.5" stroke={color} strokeWidth={1.2} />
      <Path d="M10 9V14" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
      <Circle cx="10" cy="6.5" r="0.8" fill={color} />
    </Svg>
  );
}

function PlusSignCircleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} />
      <Path d="M12 8v8M8 12h8" stroke="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function CircleXDeleteIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill="rgba(204, 41, 41, 0.9)" stroke="rgba(204, 41, 41, 0.9)" strokeWidth={1.5} />
      <Path
        d="M9 9l6 6M15 9l-6 6"
        stroke="#FFFFFF"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function DarkCheckCircleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="10" fill="rgba(0, 8, 20, 0.96)" />
      <Path
        d="M6.5 10.5L8.8 12.8L13.5 8"
        stroke="#FFFFFF"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma ReviewScreen (Step 4 of 4-step Business Services Wizard)
 *
 * Implements:
 * - F1: Review without add-ons
 * - F2: Review with discount ribbon & struck-through pricing
 * - F3: Review with add-ons list
 * - F4: Dimmed LoadingOverlay (4 dots)
 * - All 4 Edit buttons routing to placeholder flows
 * - Staff list with red ✕ removal
 * - Package checklist breakdown
 * - Validation guard & submission to Congratulations screen
 */
export const ReviewScreen: React.FC = () => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { hasDock } = useNativeDock();

  const {
    draft,
    removeStaffId,
    isStep1Valid,
    isStep2Valid,
  } = useServiceDraft();

  const { staffList } = useStaff();

  const [isLoading, setIsLoading] = useState(false);

  // Back button returns to Step 3 (Add-ons) with draft intact per Figma flow
  const handleBack = () => {
    triggerLightHaptic();
    safeRouter.back();
  };

  // Header "?" tutorial guide
  const handleHeaderHelp = () => {
    triggerLightHaptic();
    safeRouter.push('/guide/general' as any);
  };

  // Calculate pricing & discount
  const pricing = getServicePricing(draft.price, draft.discount);

  // Submit button handler
  const handlePressSubmit = () => {
    triggerLightHaptic();

    // Guard: ensure step 1 and step 2 requirements are satisfied
    if (!isStep1Valid) {
      safeRouter.push('/business-services-wizard' as any);
      return;
    }
    if (!isStep2Valid) {
      safeRouter.push('/business-services-staff' as any);
      return;
    }

    setIsLoading(true);

    // Persist newly created service to browser memory / AsyncStorage
    const newService: Service = {
      id: `service_${Date.now()}`,
      name: draft.name.trim(),
      imageUri: draft.images.length > 0 ? draft.images[0] : null,
      images: draft.images || [],
      createdAt: new Date().toISOString(),
      isNew: true,
      price: pricing.discountedPriceNumber || draft.price || 0,
      duration: draft.duration || '1hr',
      discount: draft.discount,
      category: draft.category,
      description: draft.description,
      staff: selectedStaffMembers,
      addOns: (draft.addOns || []).filter(
        (item) => item.name?.trim() || (item.price !== null && item.price > 0) || item.imageUri
      ),
      packages: (draft.packages || []).filter(
        (pkg) =>
          pkg.contents?.trim() ||
          (pkg.price !== null && pkg.price > 0) ||
          (pkg.images && pkg.images.length > 0)
      ),
    };
    addCreatedService(newService);

    // Mock API submission delay (~1200ms)
    // TODO (Backend): submitService(draft) to backend API
    setTimeout(() => {
      setIsLoading(false);
      safeRouter.resetRoot('/congratulations-service' as any);
    }, 1200);
  };

  // Compact duration
  const compactDuration = formatDurationCompact(draft.duration);

  // Check whether draft has any populated add-ons
  const hasPopulatedAddOns = useMemo(() => {
    return (draft.addOns || []).some(
      (item) => item.name?.trim() || (item.price !== null && item.price > 0) || item.imageUri
    );
  }, [draft.addOns]);

  // Check whether draft has any populated packages
  const hasPopulatedPackages = useMemo(() => {
    return (draft.packages || []).some(
      (pkg) =>
        pkg.contents?.trim() ||
        (pkg.price !== null && pkg.price > 0) ||
        (pkg.images && pkg.images.length > 0)
    );
  }, [draft.packages]);

  // Map selected staff IDs to staff details
  const selectedStaffMembers: StaffMember[] = draft.staffIds.map((id) => {
    const found = staffList.find((s) => s.id === id);
    if (found) return found;
    // Fallback display if loaded from sample
    return {
      id,
      name: 'Annabelle Gideon',
      role: 'Barber',
      yearsExperience: 5,
      avatarUri: null,
    };
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ── 1. Page Header (64px, "Add Services", help "?" button) ── */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.headerIconButton}
          onPress={handleBack}
          accessibilityLabel="Back to step 3"
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

      {/* ── 2. Stepper Container (Step 4 active: all 4 steps checked) ── */}
      <View style={styles.stepperContainer}>
        <WizardStepper currentStep={4} />
      </View>

      {/* ── 3. Review Content ScrollView ── */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══════════════════════════════════════════════════════════════════
           SECTION 1: SERVICE (Main details, discount ribbon, staff rows)
           ═══════════════════════════════════════════════════════════════════ */}
        <ReviewServiceCard
          title="Service"
          name={draft.name || 'Men Brade'}
          images={draft.images}
          price={draft.price}
          duration={draft.duration}
          discount={draft.discount}
          staffMembers={selectedStaffMembers}
          providerIsOwner={draft.providerIsOwner}
          readOnly={false}
          showDiscountRibbon={pricing.hasDiscount}
          onEditService={() => {
            triggerLightHaptic();
            safeRouter.push('/wizard/edit/service' as any);
          }}
          onAddStaff={() => {
            triggerLightHaptic();
            safeRouter.push('/wizard/edit/staff' as any);
          }}
          onRemoveStaffId={(id) => {
            removeStaffId(id);
          }}
        />

        {/* ═══════════════════════════════════════════════════════════════════
           SECTION 2: ADD-ONS (Only when draft has valid populated add-ons)
           ═══════════════════════════════════════════════════════════════════ */}
        {hasPopulatedAddOns && (
          <ReviewAddOnsSection
            title="Add-ons"
            addOns={draft.addOns}
            readOnly={false}
            onEdit={() => {
              triggerLightHaptic();
              safeRouter.push('/wizard/edit/addons' as any);
            }}
          />
        )}

        {/* ═══════════════════════════════════════════════════════════════════
           SECTION 3: SERVICE PACKAGE (Only when draft has valid populated packages)
           ═══════════════════════════════════════════════════════════════════ */}
        {hasPopulatedPackages && (
          <ReviewPackageSection
            title="Service Package"
            packages={draft.packages}
            readOnly={false}
            onEdit={() => {
              triggerLightHaptic();
              safeRouter.push('/wizard/edit/package' as any);
            }}
          />
        )}

        {/* Bottom space before sticky footer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── 4. Sticky Footer (Add service Button) ── */}
      <View
        style={[
          styles.stickyFooter,
          { paddingBottom: hasDock ? 14 : Math.max(insets.bottom, 14) },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.submitButton}
          onPress={handlePressSubmit}
          accessibilityRole="button"
          accessibilityLabel="Add service"
        >
          <Text style={styles.submitButtonText}>Add service</Text>
        </TouchableOpacity>
      </View>

      {/* ── 5. Dimmed Submit Loading Overlay (F4: 4 dots, blocks touches) ── */}
      <LoadingOverlay
        visible={isLoading}
        dotsCount={4}
        dotSize={16}
        dotGap={20}
        overlayOpacity={0.1}
        dotColor="rgba(0, 8, 20, 0.96)"
      />

      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </SafeAreaView>
  );
};

export default ReviewScreen;

// ── Styles (1:1 Figma CSS Spec) ───────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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
  stepperContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },

  // Section Header & Edit Pill
  sectionWrapper: {
    marginTop: 32,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  editPill: {
    width: 72,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editPillText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // Service Card (359px, background: #F7F7F7, radius: 24px)
  serviceCardContainer: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    paddingVertical: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  serviceItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 20,
    position: 'relative',
  },
  imageHolder: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  servicePhoto: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#EAECF0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    color: '#98A2B3',
  },
  serviceInfoColumn: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  serviceName: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  currentPriceText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  struckPriceWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  struckPriceText: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  strikeLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(96, 96, 102, 0.96)',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // Discount Ribbon Badge (F2: top-right corner)
  ribbonWrapper: {
    position: 'absolute',
    right: -10,
    top: -4,
    transform: [{ rotate: '37deg' }],
  },
  ribbonBadge: {
    backgroundColor: 'rgba(246, 240, 230, 0.96)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  ribbonText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(248, 155, 24, 0.96)',
    textAlign: 'center',
  },

  // Staff Sub-section
  staffHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  staffSectionTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
  },
  addStaffAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addStaffActionText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  staffListContainer: {
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 4,
  },
  staffRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    paddingVertical: 12,
  },
  staffAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#EAECF0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  staffAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 24,
  },
  staffAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EAECF0',
  },
  staffTextColumn: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
    justifyContent: 'center',
    gap: 6,
  },
  staffMemberName: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  staffMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  staffMetaText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  staffRemoveButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerNoticeCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    gap: 4,
  },
  ownerNoticeTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 15,
    color: '#000814',
  },
  ownerNoticeSubtitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 13,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  noStaffAssignedContainer: {
    paddingVertical: 12,
  },
  noStaffAssignedText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // Add-ons Section
  addOnsListWrapper: {
    gap: 12,
  },
  addOnItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 112,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderRadius: 24,
    padding: 16,
    gap: 16,
  },
  addOnPhotoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#EAECF0',
  },
  addOnPhotoImage: {
    width: 80,
    height: 80,
    borderRadius: 24,
  },
  addOnPhotoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#EAECF0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addOnDetailsColumn: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  addOnName: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  addOnPriceText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // Service Package Section
  packagesContainer: {
    gap: 16,
  },
  packageCard: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 20,
  },
  packageImagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    width: 296,
    maxWidth: '100%',
    alignSelf: 'center',
    justifyContent: 'flex-start',
  },
  packageImageCell: {
    width: 140,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#EAECF0',
  },
  packageImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  packagePriceText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.1,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  checklistContainer: {
    gap: 12,
  },
  checklistItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checklistItemText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    flexShrink: 1,
  },

  // Sticky Footer & Submit Button
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
  submitButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  submitButtonText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },
});
