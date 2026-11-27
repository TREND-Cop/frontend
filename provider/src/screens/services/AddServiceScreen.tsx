import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
import { useFocusEffect } from 'expo-router';
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Path } from 'react-native-svg';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { TactilePressable } from '../../components/ui/TactilePressable';
import { DeletePostDialog } from '../../components/DeletePostDialog';
import { triggerLightHaptic } from '../../utils/haptics';
import { useServices, Service, DEV_SAMPLE_SERVICES } from '../../hooks/useServices';
import { formatServiceDateParts, formatServiceDate } from '../../utils/formatServiceDate';

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

// ── 1:1 Vector Trash Icon (24x24) ──
function TrashIcon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19.5 5.5L18.8 17.5C18.7 19.2 17.3 20.5 15.6 20.5H8.4C6.7 20.5 5.3 19.2 5.2 17.5L4.5 5.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path d="M3 5.5H21" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path
        d="M9.5 5.5V4C9.5 3.2 10.2 2.5 11 2.5H13C13.8 2.5 14.5 3.2 14.5 4V5.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path d="M10 10V16" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M14 10V16" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

// ── Plus Icon (16x16) ──
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

// ── Check Mark Icon for Selected Service (14x14) ──
function CheckMarkIcon({ size = 14, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 12.6l5.4 5.4L20 6"
        stroke={color}
        strokeWidth={2.4}
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
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();

  // Load business services & delete hook
  const { services, reloadServices, deleteServices } = useServices({ devSample: devSampleServices });

  useFocusEffect(
    useCallback(() => {
      reloadServices();
    }, [reloadServices])
  );

  // Selection & Delete state
  const [mode, setMode] = useState<'view' | 'select'>('view');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isNavigatingRef = useRef(false);

  const isSelectMode = mode === 'select';
  const hasSelected = selectedIds.length > 0;

  // Handle Return to Dashboard
  const handleGoBack = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    triggerLightHaptic();
    if (safeRouter.canGoBack()) {
      safeRouter.back();
    } else {
      safeRouter.push('/dashboard' as any);
    }
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 700);
  }, [safeRouter]);

  // Android Hardware Back Handler: exits selection mode if active
  useEffect(() => {
    const onBackPress = () => {
      if (mode === 'select') {
        setMode('view');
        setSelectedIds([]);
        return true;
      }
      handleGoBack();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [mode, handleGoBack]);

  // Header Back Button handler
  const handleHeaderBack = () => {
    triggerLightHaptic();
    if (mode === 'select') {
      setMode('view');
      setSelectedIds([]);
    } else {
      handleGoBack();
    }
  };

  // Header Right Action handler
  const handleHeaderRightAction = () => {
    triggerLightHaptic();
    if (mode === 'view') {
      if (services.length > 0) {
        setMode('select');
        setSelectedIds([]);
      }
    } else {
      if (selectedIds.length > 0) {
        setShowDeleteDialog(true);
      } else {
        setMode('view');
        setSelectedIds([]);
      }
    }
  };

  // Toggle selection on a service card in select mode
  const handleToggleSelect = (id: string) => {
    triggerLightHaptic();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Confirm delete from dialog
  const handleConfirmDelete = async () => {
    triggerLightHaptic();
    setShowDeleteDialog(false);
    await deleteServices(selectedIds);
    setSelectedIds([]);
    setMode('view');
  };

  // Compute Grid Data:
  // "Add new service" tile is visible in view mode, hidden in select mode
  const gridData = useMemo<GridItem[]>(() => {
    const items: GridItem[] = [];

    if (!isSelectMode) {
      items.push({ type: 'add_tile' });
    }

    services.forEach((service) => {
      items.push({ type: 'service_card', service });
    });

    return items;
  }, [isSelectMode, services]);

  // Navigate to Wizard route
  const handleOpenWizard = () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    triggerLightHaptic();
    safeRouter.push('/business-services-wizard' as any);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 700);
  };

  // Navigate to Service details route
  const handleOpenServiceDetails = (serviceId: string) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    triggerLightHaptic();
    safeRouter.push({
      pathname: '/service/[id]',
      params: { id: serviceId, showSuccessBanner: 'true' },
    } as any);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 700);
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
    const isSelected = selectedIds.includes(service.id);
    const dateParts = formatServiceDateParts(service.createdAt);
    const accessibleDate = formatServiceDate(service.createdAt);

    return (
      <TactilePressable
        style={[styles.serviceCard, { width: colWidth }]}
        onPress={() => {
          if (isSelectMode) {
            handleToggleSelect(service.id);
          } else {
            handleOpenServiceDetails(service.id);
          }
        }}
        accessibilityLabel={`${service.name}, ${accessibleDate}`}
      >
        {/* Photo Container */}
        <View style={styles.serviceImageFrame}>
          {service.imageUri ? (
            <Image
              source={
                typeof service.imageUri === 'number'
                  ? service.imageUri
                  : { uri: service.imageUri }
              }
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

          {/* View mode: Green "New" Tag on top-right corner if isNew */}
          {!isSelectMode && service.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>New</Text>
            </View>
          )}

          {/* Select mode: Select circle on top-left */}
          {isSelectMode && (
            <View style={styles.selectBadgePosition}>
              {isSelected ? (
                <View style={styles.selectedCircle}>
                  <CheckMarkIcon size={14} color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.unselectedCircle} />
              )}
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

  return (
    <SafeAreaView style={styles.screenContainer} edges={['top']}>
      {/* ── Page Header (390x64px, 1:1 Figma) ── */}
      <View style={styles.pageHeader}>
        <View style={styles.headerContent}>
          {/* Back button */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={handleHeaderBack}
            accessibilityLabel={isSelectMode ? 'Cancel selection and go back' : 'Go back'}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft02Icon size={24} color="#000814" />
          </TouchableOpacity>

          {/* Centered Page Title */}
          <Text style={styles.headerTitle}>Add Service</Text>

          {/* Right Action: TrashIcon in view mode, Cancel/Delete in select mode */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerRightButton}
            onPress={handleHeaderRightAction}
            accessibilityLabel={
              !isSelectMode
                ? 'Select services to delete'
                : hasSelected
                ? 'Delete selected services'
                : 'Cancel selection'
            }
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {!isSelectMode ? (
              <TrashIcon size={24} color="#141B34" />
            ) : hasSelected ? (
              <Text style={styles.deleteActionText} numberOfLines={1}>
                Delete
              </Text>
            ) : (
              <Text style={styles.cancelActionText} numberOfLines={1}>
                Cancel
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 2-Column Responsive Service Grid ── */}
      <FlatList
        data={gridData}
        keyExtractor={(item) =>
          item.type === 'add_tile' ? 'add_tile' : item.service.id
        }
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: insets.bottom + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* ── Delete Confirmation Dialog ── */}
      <DeletePostDialog
        visible={showDeleteDialog}
        title="Delete Service?"
        description="The service will be removed from your business dashboard and clients can no longer see it."
        confirmText="Yes, Delete"
        cancelText="No,Cancel It."
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
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

  headerRightButton: {
    minWidth: 48,
    height: 48,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },

  cancelActionText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#000814',
    includeFontPadding: false,
  },

  deleteActionText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#CC292B',
    includeFontPadding: false,
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

  selectBadgePosition: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 5,
  },

  unselectedCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },

  selectedCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
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
});
