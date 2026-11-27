import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Path, Circle } from 'react-native-svg';

import { useServiceDetails } from '../../hooks/useServiceDetails';
import { EditHeader } from '../../components/wizard/EditHeader';
import { ServiceSuccessBanner } from '../../components/wizard/ServiceSuccessBanner';
import { ReviewServiceCard } from '../../components/wizard/ReviewServiceCard';
import { ReviewAddOnsSection } from '../../components/wizard/ReviewAddOnsSection';
import { ReviewPackageSection } from '../../components/wizard/ReviewPackageSection';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { triggerLightHaptic } from '../../utils/haptics';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

function AlertCircleIcon({ size = 48, color = 'rgba(96, 96, 102, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.5} />
      <Path d="M12 8v5M12 16h.01" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export interface ServiceDetailsScreenProps {
  /** Optional override for service ID (defaults to route param `id`) */
  id?: string;
  /** Optional override for success banner visibility (defaults to route param `showSuccessBanner`) */
  showSuccessBanner?: boolean;
}

/**
 * 1:1 Figma Service Details Screen (D1)
 *
 * Route: `/services/[id]` or `/service/[id]`
 * Features:
 * - Header: Back arrow, centered service name (17px 500, truncated with ellipsis), no help icon
 * - Green Success Banner: "Service upload successful" (shown ONLY when showSuccessBanner=true)
 * - "Added Service" section: photo with soft shadow, name, price, duration, staff members
 * - "Add-ons" section: compact card per add-on (only when service has add-ons)
 * - "Service Package" section: 2-column image grid, price, checklist (only when service has packages)
 * - No footer button, no Edit pills, no discount ribbon
 * - Explicit "Service not found" empty state for unknown IDs
 */
export const ServiceDetailsScreen: React.FC<ServiceDetailsScreenProps> = (props) => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const searchParams = useLocalSearchParams<{ id?: string; showSuccessBanner?: string }>();

  // Resolve service ID from prop or route params
  const serviceId = props.id || searchParams.id;

  // Resolve success banner visibility (defaults to on per Figma Review frame unless explicitly false)
  const isBannerVisible =
    props.showSuccessBanner !== undefined
      ? props.showSuccessBanner
      : searchParams.showSuccessBanner !== 'false';

  // Load service details from hook stub
  const { service, isNotFound } = useServiceDetails(serviceId);

  const handleBack = () => {
    triggerLightHaptic();
    safeRouter.back();
  };

  // ── 1. Not Found State ──────────────────────────────────────────────────────
  if (isNotFound || !service) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <EditHeader
          title="Service Details"
          showHelp={false}
          onBack={handleBack}
          backAccessibilityLabel="Back to service list"
        />

        <View style={styles.notFoundContainer}>
          <View style={styles.notFoundIconCircle}>
            <AlertCircleIcon size={40} color="rgba(96, 96, 102, 0.96)" />
          </View>
          <Text style={styles.notFoundTitle} accessibilityRole="header">
            Service not found
          </Text>
          <Text style={styles.notFoundSubtitle}>
            The requested service could not be found or has been removed.
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.notFoundBackButton}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Return to services list"
          >
            <Text style={styles.notFoundBackButtonText}>Back to services</Text>
          </TouchableOpacity>
        </View>

        <NativeDockSpacer backgroundColor="#FFFFFF" />
      </SafeAreaView>
    );
  }

  // ── 2. Service Details (Figma Frame D1) ──────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ── Page Header (64px, back arrow, centered service name, no help icon) ── */}
      <EditHeader
        title={service.name}
        showHelp={false}
        onBack={handleBack}
        backAccessibilityLabel="Back to service list"
      />

      {/* ── Scrollable Details Content ── */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Success Banner (Optional, shown only when asked) ── */}
        {isBannerVisible && (
          <ServiceSuccessBanner message="Service upload successful" />
        )}

        {/* ── 1. Added Service Section (Service photo, name, price, duration, staff) ── */}
        <ReviewServiceCard
          title="Added Service"
          name={service.name}
          imageUri={service.imageUri}
          images={service.images}
          price={service.price}
          duration={service.duration}
          discount={service.discount}
          staffMembers={service.staff}
          readOnly={true}
          showDiscountRibbon={false}
        />

        {/* ── 2. Add-ons Section (Only when service has add-ons) ── */}
        {service.addOns.length > 0 && (
          <ReviewAddOnsSection
            title="Add-One"
            addOns={service.addOns}
            readOnly={true}
          />
        )}

        {/* ── 3. Service Package Section (Only when service has packages) ── */}
        {service.packages.length > 0 && (
          <ReviewPackageSection
            title="Service Package"
            packages={service.packages}
            readOnly={true}
          />
        )}
      </ScrollView>

      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </SafeAreaView>
  );
};

export default ServiceDetailsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  notFoundIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  notFoundTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  notFoundSubtitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    marginBottom: 16,
  },
  notFoundBackButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
  },
  notFoundBackButtonText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
