import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Path } from 'react-native-svg';
import { useEditProfileDraft } from '../../context/EditProfileDraftContext';
import { useProviderOnboarding } from '../../context/ProviderOnboardingContext';
import { useBusinessStore } from '../../store/businessStore';
import {
  formatHoursForClients,
  formatDaysForClients,
  formatPreviewPrice,
} from '../../utils/businessProfileHelpers';
import {
  useBusinessStatus,
  useBusinessRating,
  useBusinessDistance,
  usePreviewServices,
  getPreviewPhotos,
} from '../../hooks/usePreviewProfileData';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';

// ── Master Typography Standards ──
const FONT_MEDIUM = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_500Medium',
  default: 'DMSans_500Medium',
});

const FONT_REGULAR = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_400Regular',
  default: 'DMSans_400Regular',
});

// ── Icons ──

function ArrowLeftIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.57 5.93L3.5 12l6.07 6.07M20.5 12H3.67"
        stroke="rgba(0, 8, 20, 0.96)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function VerifiedShieldIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L4 5V11C4 16.52 7.41 21.62 12 22.95C16.59 21.62 20 16.52 20 11V5L12 2Z"
        fill="rgba(26, 130, 255, 0.9)"
        stroke="rgba(26, 130, 255, 0.9)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 12L11 14L15 10"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function StarIcon({ size = 16, color = 'rgba(248, 155, 24, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={color}
      />
    </Svg>
  );
}

function RouteIcon({ size = 18, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 19C5.65685 19 7 17.6569 7 16C7 14.3431 5.65685 13 4 13C2.34315 13 1 14.3431 1 16C1 17.6569 2.34315 19 4 19Z"
        stroke={color}
        strokeWidth="1.5"
      />
      <Path
        d="M20 11C21.6569 11 23 9.65685 23 8C23 6.34315 21.6569 5 20 5C18.3431 5 17 6.34315 17 8C17 9.65685 18.3431 11 20 11Z"
        stroke={color}
        strokeWidth="1.5"
      />
      <Path
        d="M7 16H11C13.2091 16 15 14.2091 15 12C15 9.79086 16.7909 8 19 8H20"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ClockIcon({ size = 18, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
        stroke={color}
        strokeWidth="1.5"
      />
      <Path
        d="M12 6v6l4 2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function DoorIcon({ size = 18, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 21h16M6 21V5a2 2 0 012-2h8a2 2 0 012 2v16M14 12v.01"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function AboutIcon({ size = 20, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 7.5C15 7.5 15.5 8 16 9C16 9 17.5 6.5 19 6"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 2.5C7.9 2.4 6.3 2.6 6.3 2.6C5.3 2.7 3.3 3.3 3.3 6.6C3.3 9.9 3.3 14 3.3 15.6C3.3 16.6 3.9 18.9 6 19C8.6 19.1 13.2 19.1 15.3 19C15.9 19 17.8 18.5 18 16.5C18.2 14.4 18.2 12.9 18.2 12.5"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22 7.5C22 9.8 20.1 11.7 17.8 11.7C15.5 11.7 13.6 9.8 13.6 7.5C13.6 5.2 15.5 3.3 17.8 3.3C20.1 3.3 22 5.2 22 7.5Z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <Path d="M7.5 11.5H11" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      <Path d="M7.5 15H14.5" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}

function LocationIcon({ size = 20, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.5 18.5C18.7 18.9 19.5 19.4 19.5 20C19.5 21.3 16.1 22.3 12 22.3C7.9 22.3 4.5 21.3 4.5 20C4.5 19.4 5.3 18.9 6.5 18.5"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <Path
        d="M14.8 10.5C14.8 12 13.6 13.3 12 13.3C10.4 13.3 9.2 12 9.2 10.5C9.2 8.9 10.4 7.7 12 7.7C13.6 7.7 14.8 8.9 14.8 10.5Z"
        stroke={color}
        strokeWidth={1.4}
      />
      <Path
        d="M12 2.5C15.9 2.5 19 5.6 19 9.5C19 13.5 15.7 16.3 12.7 18.2C12.5 18.3 12.3 18.4 12 18.4C11.7 18.4 11.5 18.3 11.3 18.2C8.3 16.3 5 13.5 5 9.5C5 5.6 8.1 2.5 12 2.5Z"
        stroke={color}
        strokeWidth={1.4}
      />
    </Svg>
  );
}

function ContactIcon({ size = 20, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7.4 17.8C7.1 17.7 6.9 17.6 6.8 17.7C6.7 17.7 6.5 17.8 6.2 18C5.7 18.4 5 18.7 4 18.7C3.5 18.7 3.2 18.7 3.1 18.5C3 18.3 3.1 18 3.4 17.5C3.8 16.8 4 15.9 3.6 15.3C3 14.3 2.4 13.2 2.3 12C2.3 11.3 2.3 10.6 2.3 10C2.5 6.6 5.2 4 8.5 3.7C9.6 3.6 10.8 3.6 11.9 3.7C15.2 3.9 17.8 6.5 18 9.8"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.2 21C12.1 20.9 10.5 19.3 10.3 17.2C10.3 16.8 10.3 16.4 10.3 16C10.5 14 12.1 12.3 14.2 12.2C14.9 12.2 15.7 12.2 16.4 12.2C18.5 12.3 20.2 14 20.3 16C20.3 16.4 20.3 16.8 20.3 17.2C20.3 18 19.9 18.7 19.5 19.2C19.3 19.7 19.4 20.2 19.7 20.6C19.9 20.9 20 21.1 19.9 21.2C19.8 21.3 19.6 21.3 19.3 21.3C18.7 21.3 18.3 21.2 18 20.9C17.8 20.8 17.7 20.7 17.6 20.7C17.5 20.7 17.4 20.8 17.2 20.9C16.9 21 16.7 21 16.4 21C15.7 21 14.9 21 14.2 21Z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SearchIcon({ size = 24, color = '#000000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function FilterFunnelIcon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CameraPlaceholderIcon({ size = 24, color = 'rgba(96, 96, 102, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 7a2 2 0 012-2h2.5l1.5-2h8l1.5 2H20a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V7z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 17a4 4 0 100-8 4 4 0 000 8z"
        stroke={color}
        strokeWidth="1.5"
      />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function BusinessProfilePreviewScreen() {
  const safeRouter = useSafeRouter();
  const { width: screenWidth } = useWindowDimensions();

  // Safely read draft working copy and diffs from context
  let draftContext: ReturnType<typeof useEditProfileDraft> | null = null;
  try {
    draftContext = useEditProfileDraft();
  } catch (e) {
    draftContext = null;
  }

  const onboarding = useProviderOnboarding();
  const { business } = useBusinessStore();

  // Safe fallback if opened with no provider or fresh reload
  const workingCopy = useMemo(() => {
    if (draftContext?.workingCopy) {
      return draftContext.workingCopy;
    }
    return {
      businessName: onboarding.businessName || business.name || 'Luminous Lux',
      operatingHours: onboarding.salonDetails.operatingHours || business.operatingHours || '8am - 12am',
      operatingDays: onboarding.salonDetails.operatingDays || business.operatingDays || 'Monday - Sunday',
      address: onboarding.location.address || business.address || 'Street 11 adamu cresent, off nnpc tower, maitama abuja.',
      country: onboarding.location.country || business.country || 'Nigeria',
      countryCode: onboarding.location.countryCode || business.countryCode || '+234',
      state: onboarding.location.state || business.state || 'F.C.T Abuja',
      gender: onboarding.location.gender || business.gender || 'Unisex',
      nameChangedAt: onboarding.nameChangedAt ?? business.nameChangedAt ?? null,
    };
  }, [
    draftContext?.workingCopy,
    onboarding.businessName,
    onboarding.salonDetails.operatingHours,
    onboarding.salonDetails.operatingDays,
    onboarding.location.address,
    onboarding.location.country,
    onboarding.location.countryCode,
    onboarding.location.state,
    onboarding.location.gender,
    onboarding.nameChangedAt,
    business.name,
    business.operatingHours,
    business.operatingDays,
    business.address,
    business.country,
    business.countryCode,
    business.state,
    business.gender,
    business.nameChangedAt,
  ]);

  const changedFields = draftContext?.changedFields || [];

  // ── Highlight Flags (from Figma V2-V4 & Note 1) ──
  const isNameHighlighted = changedFields.includes('businessName');
  const isHoursHighlighted = changedFields.includes('operatingHours');
  const isDaysHighlighted = changedFields.includes('operatingDays');
  // Address, country or state change highlights the Location chip
  const isLocationHighlighted =
    changedFields.includes('address') ||
    changedFields.includes('country') ||
    changedFields.includes('state');

  // ── Stubs (TODO: Backend) ──
  const { isVerified } = useBusinessStatus();
  const { rating } = useBusinessRating();
  const { distance } = useBusinessDistance();
  const { categories, services } = usePreviewServices();

  // ── Photos Resolution ──
  const allPhotos = useMemo(() => {
    const uploaded = onboarding.salonDetails?.photos || business.photos || [];
    return getPreviewPhotos(uploaded);
  }, [onboarding.salonDetails?.photos, business.photos]);

  // Compute 3-column tile width: total horizontal padding is 16*2 = 32. 2 gaps of 11 = 22.
  const tileWidth = Math.floor((Math.max(screenWidth, 320) - 32 - 22) / 3);

  // ── Formatted Client Values ──
  const formattedHours = useMemo(() => {
    return formatHoursForClients(workingCopy.operatingHours);
  }, [workingCopy.operatingHours]);

  const formattedDays = useMemo(() => {
    return formatDaysForClients(workingCopy.operatingDays);
  }, [workingCopy.operatingDays]);

  // ── Search & Filter State ──
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    categories[0]?.id || 'haircut'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtered services matching category + search query (case-insensitive, trimmed)
  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return services.filter((s) => {
      const matchesCategory = categories.length === 0 || s.categoryId === selectedCategoryId;
      const matchesQuery = !q || s.name.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [services, selectedCategoryId, searchQuery, categories.length]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* ── Page Header (64px, back button + title "Preview") ── */}
      <View style={styles.pageHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerBackBtn}
            onPress={() => safeRouter.back()}
            accessibilityRole="button"
            accessibilityLabel="Back to edit business profile"
          >
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            Preview
          </Text>

          {/* Symmetrical placeholder for 1:1 balance */}
          <View style={styles.headerShareStub} />
        </View>
      </View>

      {/* ── Scrollable Profile Body ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Photo Grid (3 columns x 2 rows, 112x112, r24, "{n}+" on 6th tile) ── */}
        <View
          style={styles.salonImagesGrid}
          accessibilityRole="none"
          accessibilityLabel="Business photos"
        >
          {allPhotos.length === 0 ? (
            <View style={[styles.emptyPhotoTile, { width: tileWidth, height: tileWidth }]}>
              <CameraPlaceholderIcon size={28} />
              <Text style={styles.emptyPhotoText}>No photos</Text>
            </View>
          ) : (
            allPhotos.slice(0, 6).map((photoUri, index) => {
              const isSixthWithExtra = index === 5 && allPhotos.length > 6;
              const extraCount = allPhotos.length - 5;

              return (
                <View
                  key={`photo-${index}`}
                  style={[styles.imageTileContainer, { width: tileWidth, height: tileWidth }]}
                >
                  <Image
                    source={typeof photoUri === 'string' ? { uri: photoUri } : photoUri}
                    style={styles.imageTile}
                    resizeMode="cover"
                  />
                  {isSixthWithExtra && (
                    <View style={styles.imageTileOverlay}>
                      <Text style={styles.extraPhotosCount}>
                        {extraCount}+
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* ── 2. Name & Rating Row ── */}
        <View style={styles.salonNameAndRatingRow}>
          {/* Business Name with Verified Shield Check */}
          <View
            style={[
              styles.salonNameVerificationWrapper,
              isNameHighlighted && styles.highlightedBanner,
            ]}
          >
            <View style={styles.salonNameAndBadge}>
              <Text
                style={styles.salonNameText}
                numberOfLines={1}
                ellipsizeMode="tail"
                accessibilityLabel={
                  isNameHighlighted
                    ? `${workingCopy.businessName}, changed`
                    : workingCopy.businessName
                }
              >
                {workingCopy.businessName}
              </Text>

              {isVerified && (
                <View style={styles.shieldBadgeWrapper}>
                  <VerifiedShieldIcon size={20} />
                </View>
              )}
            </View>
          </View>

          {/* Orange Star Rating (hidden if rating === null) */}
          {rating !== null && (
            <View
              style={styles.salonRatingContainer}
              accessibilityRole="text"
              accessibilityLabel={`Rated ${rating}`}
            >
              <StarIcon size={16} />
              <Text style={styles.ratingValueText}>{rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        {/* ── 3. Info Row (Distance, Operating Hours, Operating Days) ── */}
        <View style={styles.salonInfoRow}>
          {/* Distance (hidden if null) */}
          {distance !== null && (
            <View style={styles.infoItem}>
              <RouteIcon size={18} />
              <Text style={styles.infoItemText}>{distance}</Text>
            </View>
          )}

          {/* Operating Hours (tinted highlight if changed) */}
          {Boolean(formattedHours) && (
            <View
              style={[
                styles.infoItem,
                isHoursHighlighted && styles.highlightedBanner,
              ]}
              accessibilityLabel={
                isHoursHighlighted
                  ? `${formattedHours}, changed`
                  : formattedHours
              }
            >
              <ClockIcon size={18} />
              <Text style={styles.infoItemText}>{formattedHours}</Text>
            </View>
          )}

          {/* Operating Days (tinted highlight if changed) */}
          {Boolean(formattedDays) && (
            <View
              style={[
                styles.infoItem,
                isDaysHighlighted && styles.highlightedBanner,
              ]}
              accessibilityLabel={
                isDaysHighlighted
                  ? `${formattedDays}, changed`
                  : formattedDays
              }
            >
              <DoorIcon size={18} />
              <Text style={styles.infoItemText}>{formattedDays}</Text>
            </View>
          )}
        </View>

        {/* ── 4. Action Chips (About, Location, Contact) ── */}
        <View style={styles.chipsRow}>
          {/* About Chip */}
          <TouchableOpacity
            activeOpacity={1}
            style={styles.aboutChip}
            accessibilityRole="button"
            accessibilityLabel="About"
          >
            <AboutIcon size={20} />
            <Text style={styles.chipText}>About</Text>
          </TouchableOpacity>

          {/* Location Chip (highlighted when location fields change) */}
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.locationChip,
              isLocationHighlighted && styles.locationChipHighlighted,
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              isLocationHighlighted ? 'Location, changed' : 'Location'
            }
          >
            <LocationIcon size={20} />
            <Text style={styles.chipText}>Location</Text>
          </TouchableOpacity>

          {/* Contact Chip */}
          <TouchableOpacity
            activeOpacity={1}
            style={styles.contactChip}
            accessibilityRole="button"
            accessibilityLabel="Contact"
          >
            <ContactIcon size={20} />
            <Text style={styles.chipText}>Contact</Text>
          </TouchableOpacity>
        </View>

        {/* ── 5. Service Tabs ── */}
        {categories.length > 0 && (
          <View style={styles.tabsSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsScrollContent}
            >
              {categories.map((cat) => {
                const isActive = cat.id === selectedCategoryId;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    activeOpacity={0.75}
                    style={styles.serviceTabBtn}
                    onPress={() => setSelectedCategoryId(cat.id)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: isActive }}
                    accessibilityLabel={cat.name}
                  >
                    <Text
                      style={[
                        styles.serviceTabText,
                        isActive
                          ? styles.serviceTabTextActive
                          : styles.serviceTabTextInactive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                    {isActive && <View style={styles.activeTabIndicator} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {/* Full width divider line */}
            <View style={styles.tabsBottomLine} />
          </View>
        )}

        {/* ── 6. Search Bar & Filter Button ── */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <SearchIcon size={24} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search here.."
              placeholderTextColor="rgba(96, 96, 102, 0.96)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
              accessibilityLabel="Search services"
            />
          </View>

          {/* Filter button (non-functional in preview per design spec) */}
          <TouchableOpacity
            activeOpacity={1}
            style={styles.filterButton}
            accessibilityRole="button"
            accessibilityLabel="Filter"
          >
            <FilterFunnelIcon size={24} />
          </TouchableOpacity>
        </View>

        {/* ── 7. Services List ── */}
        <View style={styles.servicesListContainer}>
          {filteredServices.length === 0 ? (
            <View style={styles.emptyServicesCard}>
              <Text style={styles.emptyServicesTitle}>No services yet</Text>
              <Text style={styles.emptyServicesSubtitle}>
                Services you add will appear here for clients.
              </Text>
            </View>
          ) : (
            filteredServices.map((service) => (
              <View key={service.id} style={styles.serviceRowCard}>
                <View style={styles.serviceImageContainer}>
                  <Image
                    source={
                      typeof service.imageUri === 'string'
                        ? { uri: service.imageUri }
                        : service.imageUri
                    }
                    style={styles.serviceImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.serviceDetails}>
                  <Text style={styles.serviceNameText} numberOfLines={1}>
                    {service.name}
                  </Text>
                  <Text style={styles.servicePriceText}>
                    {formatPreviewPrice(service.price)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Native Dock Spacer ensures safe barrier above Android system navigation */}
      <NativeDockSpacer />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXACT CONVERTER-VERIFIED STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header ──
  pageHeader: {
    width: '100%',
    height: 64,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 48,
  },
  headerBackBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  headerShareStub: {
    width: 48,
    height: 48,
    opacity: 0,
  },

  // ── ScrollView ──
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // ── 1. Photo Grid (3x2, 112x112, r24) ──
  salonImagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 11,
    rowGap: 24,
    width: '100%',
  },
  imageTileContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  imageTile: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  imageTileOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  extraPhotosCount: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.1,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  emptyPhotoTile: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  emptyPhotoText: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  // ── 2. Name & Rating Row ──
  salonNameAndRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    width: '100%',
    minHeight: 36,
  },
  salonNameVerificationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  salonNameAndBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  salonNameText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
    flexShrink: 1,
  },
  shieldBadgeWrapper: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  salonRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    height: 20,
    paddingLeft: 12,
  },
  ratingValueText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },

  // ── Highlight Banner (Figma V2-V4) ──
  highlightedBanner: {
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },

  // ── 3. Info Row (Distance, Hours, Days) ──
  salonInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 26,
  },
  infoItemText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },

  // ── 4. Action Chips (About, Location, Contact) ──
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
    gap: 8,
  },
  aboutChip: {
    flex: 1,
    height: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  locationChip: {
    flex: 1.2,
    height: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  locationChipHighlighted: {
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
  },
  contactChip: {
    flex: 1.15,
    height: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  chipText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },

  // ── 5. Tabs Section ──
  tabsSection: {
    marginTop: 24,
    width: '100%',
    position: 'relative',
  },
  tabsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingBottom: 2,
  },
  serviceTabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  serviceTabText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  serviceTabTextActive: {
    color: 'rgba(0, 8, 20, 0.96)',
  },
  serviceTabTextInactive: {
    color: 'rgba(96, 96, 102, 0.96)',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -3,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 8,
    zIndex: 2,
  },
  tabsBottomLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginTop: 0,
  },

  // ── 6. Search & Filter ──
  searchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    gap: 16,
    width: '100%',
  },
  searchInputContainer: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
    includeFontPadding: false,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── 7. Services List ──
  servicesListContainer: {
    marginTop: 24,
    gap: 16,
    width: '100%',
  },
  serviceRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 24,
    width: '100%',
    minHeight: 116,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
  },
  serviceImageContainer: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  serviceDetails: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  serviceNameText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  servicePriceText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  // ── Empty Services Block ──
  emptyServicesCard: {
    width: '100%',
    padding: 32,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyServicesTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  emptyServicesSubtitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
});

export default BusinessProfilePreviewScreen;
