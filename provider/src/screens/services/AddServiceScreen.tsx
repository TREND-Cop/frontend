import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  Dimensions,
  BackHandler,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { TactilePressable } from '../../components/ui/TactilePressable';
import { triggerLightHaptic } from '../../utils/haptics';
import { useServices, Service, DEV_SAMPLE_SERVICES } from '../../hooks/useServices';
import { formatServiceDateParts, formatServiceDate } from '../../utils/formatServiceDate';
import { DateFilterSheet, FilterValue } from '../../components/DateFilterSheet';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_HEADER = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';

// ── Exact 1:1 Vector Icons ───────────────────────────────────────────────────

function ArrowLeft02Icon({ size = 24, color = '#000814' }: { size?: number; color?: string }) {
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

function FilterFunnelIcon({ size = 18, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 4H3L10.2 12.5V19L13.8 21V12.5L21 4Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PlusIcon({ size = 16, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 3.33v9.34M3.33 8h9.34"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Grid Item Types ──────────────────────────────────────────────────────────
type GridItem =
  | { type: 'add_tile' }
  | { type: 'service_card'; service: Service };

export interface AddServiceScreenProps {
  /** Optional override to preview sample services */
  devSampleServices?: boolean;
}

export const AddServiceScreen: React.FC<AddServiceScreenProps> = ({
  devSampleServices = DEV_SAMPLE_SERVICES,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Load business services (TODO: Backend)
  const { services } = useServices({ devSample: devSampleServices });

  // Date Filter Sheet & Active Filter State
  const [isFilterSheetVisible, setIsFilterSheetVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterValue | null>(null);

  // Android Hardware Back Handler: Closes filter sheet first if open
  useEffect(() => {
    const onBackPress = () => {
      if (isFilterSheetVisible) {
        setIsFilterSheetVisible(false);
        return true;
      }
      handleGoBack();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [isFilterSheetVisible]);

  // Handle Return to Dashboard
  const handleGoBack = useCallback(() => {
    triggerLightHaptic();
    // TODO (Skeleton): global skeleton loader on return to dashboard
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/dashboard' as any);
    }
  }, [router]);

  // Filter Matching in device's local time (compare local year/month/day, never UTC strings)
  const filteredServices = useMemo(() => {
    if (!activeFilter) {
      return services;
    }

    return services.filter((srv) => {
      const srvDate = new Date(srv.createdAt);
      if (isNaN(srvDate.getTime())) return false;

      if (activeFilter.type === 'day') {
        return (
          srvDate.getFullYear() === activeFilter.year &&
          srvDate.getMonth() === activeFilter.month &&
          srvDate.getDate() === activeFilter.day
        );
      } else {
        return srvDate.getFullYear() === activeFilter.year;
      }
    });
  }, [services, activeFilter]);

  // Compute Grid Data:
  // Tile is hidden while a filter is active (inferred from F7)
  const gridData = useMemo<GridItem[]>(() => {
    const isFilterActive = activeFilter !== null;
    const items: GridItem[] = [];

    if (!isFilterActive) {
      items.push({ type: 'add_tile' });
    }

    filteredServices.forEach((service) => {
      items.push({ type: 'service_card', service });
    });

    return items;
  }, [activeFilter, filteredServices]);

  // Navigate to Wizard route (placeholder)
  const handleOpenWizard = () => {
    triggerLightHaptic();
    router.push('/business-services-wizard' as any);
  };

  // Navigate to Service details route, passing only the id (placeholder)
  const handleOpenServiceDetails = (serviceId: string) => {
    triggerLightHaptic();
    router.push({
      pathname: '/service/[id]',
      params: { id: serviceId },
    } as any);
  };

  // Calculate Responsive Column Width
  const sidePadding = 16;
  const colGap = 16;
  const colWidth = Math.floor((SCREEN_WIDTH - sidePadding * 2 - colGap) / 2);

  // Render Grid Item
  const renderItem = ({ item }: { item: GridItem }) => {
    if (item.type === 'add_tile') {
      return (
        <TactilePressable
          style={[styles.addServiceTile, { width: colWidth }]}
          onPress={handleOpenWizard}
          accessibilityLabel="Add new service"
        >
          <View style={styles.addTileTextContainer}>
            <Text style={styles.addTileTitle} numberOfLines={2}>
              Add new service
            </Text>
            <Text style={styles.addTileCaption} numberOfLines={2}>
              Upload new service to Trend
            </Text>
          </View>

          <View style={styles.addTilePlusCircle}>
            <PlusIcon size={16} color="#FFFFFF" />
          </View>
        </TactilePressable>
      );
    }

    const { service } = item;
    const dateParts = formatServiceDateParts(service.createdAt);
    const accessibleDate = formatServiceDate(service.createdAt);

    return (
      <TactilePressable
        style={[styles.serviceCard, { width: colWidth }]}
        onPress={() => handleOpenServiceDetails(service.id)}
        accessibilityLabel={`${service.name}, ${accessibleDate}`}
      >
        {/* Photo Container */}
        <View style={styles.serviceImageFrame}>
          {/* TODO (Asset): Export photo for service card (153x104, 2x: 306x208, 3x: 459x312 PNG/JPG) */}
          {service.imageUri ? (
            <Image
              source={{ uri: service.imageUri }}
              style={styles.serviceImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.serviceImagePlaceholder}>
              <Text style={styles.serviceImagePlaceholderText} numberOfLines={1}>
                {service.name}
              </Text>
            </View>
          )}

          {/* Green "New" Tag on top-right corner if isNew */}
          {service.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>New</Text>
            </View>
          )}
        </View>

        {/* Info Column */}
        <View style={styles.serviceInfoColumn}>
          <Text style={styles.serviceNameText} numberOfLines={1}>
            {service.name}
          </Text>

          {/* Date with transformed superscript ordinal (11th 03, 2026) */}
          <Text style={styles.serviceDateText} numberOfLines={1}>
            {dateParts.day}
            <Text style={styles.serviceDateSuperscript}>{dateParts.ordinal}</Text>
            {` ${dateParts.monthString}, ${dateParts.year}`}
          </Text>
        </View>
      </TactilePressable>
    );
  };

  const isNoRecordFound = activeFilter !== null && filteredServices.length === 0;

  return (
    <SafeAreaView style={styles.screenContainer} edges={['top']}>
      {/* ── Page Header (390x64px, 1:1 Figma) ── */}
      <View style={styles.pageHeader}>
        <View style={styles.headerContent}>
          {/* Back button */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={handleGoBack}
            accessibilityLabel="Go back"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft02Icon size={24} color="#000814" />
          </TouchableOpacity>

          {/* Centered Page Title */}
          <Text style={styles.headerTitle}>Add Service</Text>

          {/* Filter button */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.filterButton}
            onPress={() => {
              triggerLightHaptic();
              setIsFilterSheetVisible(true);
            }}
            accessibilityLabel="Filter by date"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <FilterFunnelIcon size={18} color="#141B34" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Body: 2-Column Grid vs "No Record Found" ── */}
      {isNoRecordFound ? (
        /* ── F7: "No Record Found" State ── */
        <View style={styles.noRecordContainer}>
          {/* TODO (Asset): Export No Record Found illustration (134x134, 2x: 268x268, 3x: 402x402 PNG) */}
          <View style={styles.noRecordIllustrationWrapper}>
            <Image
              source={require('../../../assets/images/search_not_found.png')}
              style={styles.noRecordIllustration}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.noRecordTitle}>No Record Found</Text>
          <Text style={styles.noRecordSubtitle}>No recorded activity on this search</Text>
        </View>
      ) : (
        /* ── F1 & F2: 2-Column Responsive Service Grid ── */
        <FlatList
          data={gridData}
          keyExtractor={(item, index) =>
            item.type === 'add_tile' ? 'add_tile' : item.service.id
          }
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom:
                Platform.OS === 'android'
                  ? Math.max(insets.bottom, 56) + 24
                  : Math.max(insets.bottom, 16) + 24,
            },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ── Date Filter Bottom Sheet (Month / Year) ── */}
      <DateFilterSheet
        visible={isFilterSheetVisible}
        onClose={() => setIsFilterSheetVisible(false)}
        onApplyFilter={(filter) => {
          setActiveFilter(filter);
        }}
        currentFilter={activeFilter}
      />

      {/* Android System Navigation Dock Protection */}
      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </SafeAreaView>
  );
};

export default AddServiceScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* ── Page Header (390x64px, 1:1 Figma) ── */
  pageHeader: {
    width: '100%',
    height: 64,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },

  headerContent: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontFamily: FONT_HEADER,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#000814',
    textAlign: 'center',
    includeFontPadding: false,
  },

  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── 2-Column Grid List ── */
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },

  columnWrapper: {
    justifyContent: 'space-between',
    gap: 16,
  },

  /* ── Add New Service Tile (Figma: 169x176px, dashed border) ── */
  addServiceTile: {
    height: 176,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#C0C0CC',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },

  addTileTextContainer: {
    gap: 6,
  },

  addTileTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
    includeFontPadding: false,
  },

  addTileCaption: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  addTilePlusCircle: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },

  /* ── Service Card (Figma: 169x176px, background #F7F7F7) ── */
  serviceCard: {
    height: 176,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 18,
    padding: 8,
    justifyContent: 'space-between',
  },

  serviceImageFrame: {
    width: '100%',
    height: 104,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#EBEBF5',
  },

  serviceImage: {
    width: '100%',
    height: '104%',
    borderRadius: 16,
  },

  serviceImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EBEBF5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },

  serviceImagePlaceholderText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 14,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },

  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 42,
    height: 25,
    backgroundColor: 'rgba(238, 248, 238, 0.9)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  newBadgeText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    color: '#0C790C',
    includeFontPadding: false,
  },

  serviceInfoColumn: {
    gap: 4,
    paddingTop: 4,
  },

  serviceNameText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },

  serviceDateText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  serviceDateSuperscript: {
    fontSize: 9,
    lineHeight: 12,
  },

  /* ── No Record Found State (F7) ── */
  noRecordContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 80,
  },

  noRecordIllustrationWrapper: {
    width: 134,
    height: 134,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  noRecordIllustration: {
    width: 134,
    height: 134,
  },

  noRecordTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    marginBottom: 8,
    includeFontPadding: false,
  },

  noRecordSubtitle: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
