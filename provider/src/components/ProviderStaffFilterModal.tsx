import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

// ── Typography Mandate (AGENTS.md) ──────────────────────────────────────────
const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

// ── 1:1 Vector Icons ──────────────────────────────────────────────────────────

function Cancel01Icon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
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

/**
 * 1:1 Loader / Sunburst Asterisk Icon (24x24)
 */
function LoaderSunburstIcon({ size = 24, color = 'rgba(192, 192, 204, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3v3" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M12 18v3" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M3 12h3" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M18 12h3" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M5.64 5.64l2.12 2.12" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M16.24 16.24l2.12 2.12" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M5.64 18.36l2.12-2.12" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M16.24 7.76l2.12-2.12" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

/**
 * 1:1 ion:fast-food-outline Icon (24x24)
 */
function FastFoodOutlineIcon({ size = 24, color = 'rgba(192, 192, 204, 0.96)' }: { size?: number; color?: string }) {
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
 * 1:1 user-03 Icon (24x24)
 */
function User03Icon({ size = 24, color = 'rgba(192, 192, 204, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={1.5} />
      <Path
        d="M4 20c0-4.42 3.58-8 8-8s8 3.58 8 8"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * 1:1 home-03 Icon (24x24)
 */
function Home03Icon({ size = 24, color = 'rgba(192, 192, 204, 0.96)' }: { size?: number; color?: string }) {
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
 * 1:1 a-arrow-up Icon (24x24)
 */
function AArrowUpIcon({ size = 24, color = 'rgba(192, 192, 204, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3.5 17L7 6.5l3.5 10.5M4.8 13.5h4.4"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18 17.5V6.5m0 0l-3.5 3.5M18 6.5l3.5 3.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Component Props ─────────────────────────────────────────────────────────

export type StaffStatusFilter = 'all' | 'attending' | 'on_break' | 'available' | 'closed';

interface FilterOptionConfig {
  key: StaffStatusFilter;
  label: string;
  renderIcon: (color: string) => React.ReactNode;
}

const FILTER_CONFIGS: FilterOptionConfig[] = [
  {
    key: 'attending',
    label: 'Attending to client',
    renderIcon: (color) => <LoaderSunburstIcon size={24} color={color} />,
  },
  {
    key: 'on_break',
    label: 'On - Break',
    renderIcon: (color) => <FastFoodOutlineIcon size={24} color={color} />,
  },
  {
    key: 'available',
    label: 'Available',
    renderIcon: (color) => <User03Icon size={24} color={color} />,
  },
  {
    key: 'closed',
    label: 'Closed',
    renderIcon: (color) => <Home03Icon size={24} color={color} />,
  },
  {
    key: 'all',
    label: 'Filter all',
    renderIcon: (color) => <AArrowUpIcon size={24} color={color} />,
  },
];

export interface ProviderStaffFilterModalProps {
  visible: boolean;
  selectedFilter?: StaffStatusFilter;
  selectedFilters?: StaffStatusFilter[];
  staffList?: any[];
  recentFilters?: StaffStatusFilter[];
  onRemoveRecentFilter?: (filter: StaffStatusFilter) => void;
  onClose: () => void;
  onApply: (filter: StaffStatusFilter | StaffStatusFilter[]) => void;
  onClear: () => void;
}

export function ProviderStaffFilterModal({
  visible,
  selectedFilter = 'all',
  selectedFilters: externalSelectedFilters,
  staffList,
  recentFilters: externalRecentFilters,
  onRemoveRecentFilter,
  onClose,
  onApply,
  onClear,
}: ProviderStaffFilterModalProps) {
  const getInitialActiveFilters = (): StaffStatusFilter[] => {
    if (externalSelectedFilters !== undefined) {
      return externalSelectedFilters.filter((f) => f !== 'all');
    }
    if (selectedFilter && selectedFilter !== 'all') {
      return [selectedFilter];
    }
    return [];
  };

  const [activeFilters, setActiveFilters] = useState<StaffStatusFilter[]>(getInitialActiveFilters);
  const [internalRecentFilters, setInternalRecentFilters] = useState<StaffStatusFilter[]>([]);

  useEffect(() => {
    setActiveFilters(getInitialActiveFilters());
  }, [selectedFilter, externalSelectedFilters, visible]);

  useEffect(() => {
    if (externalRecentFilters !== undefined) {
      setInternalRecentFilters(externalRecentFilters);
    } else {
      const initial = getInitialActiveFilters();
      if (initial.length > 0) {
        setInternalRecentFilters((prev) => Array.from(new Set([...initial, ...prev])));
      }
    }
  }, [externalRecentFilters, selectedFilter, externalSelectedFilters, visible]);

  const recentList = externalRecentFilters !== undefined ? externalRecentFilters : internalRecentFilters;
  const hasRecentlyFiltered = recentList.length > 0;

  const handleToggle = (filter: StaffStatusFilter) => {
    if (filter === 'all') {
      setActiveFilters([]);
      return;
    }
    setActiveFilters((prev) => {
      if (prev.includes(filter)) {
        return prev.filter((f) => f !== filter);
      } else {
        return [...prev, filter];
      }
    });
  };

  const handleDismissChip = (filter: StaffStatusFilter) => {
    if (onRemoveRecentFilter) {
      onRemoveRecentFilter(filter);
    }
    setInternalRecentFilters((prev) => prev.filter((f) => f !== filter));
    setActiveFilters((prev) => prev.filter((f) => f !== filter));
  };

  const handleClearAll = () => {
    setActiveFilters([]);
    onClear();
    onClose();
  };

  const handleApply = () => {
    if (activeFilters.length > 0) {
      setInternalRecentFilters((prev) => Array.from(new Set([...activeFilters, ...prev])));
    }
    onApply(activeFilters);
    onClose();
  };

  const getRecentlyFilteredLabel = (filter: StaffStatusFilter) => {
    switch (filter) {
      case 'attending':
        return 'In-Service';
      case 'on_break':
        return 'On - Break';
      case 'available':
        return 'Available';
      case 'closed':
        return 'Closed';
      default:
        return 'In-Service';
    }
  };

  // Remaining options not in recently filtered list
  const remainingOptions = FILTER_CONFIGS.filter((opt) => !recentList.includes(opt.key));

  // Dynamic count calculation
  const displayCount = useMemo(() => {
    if (!staffList || staffList.length === 0) return '20+';
    const count = activeFilters.length === 0
      ? staffList.length
      : staffList.filter((s) => activeFilters.includes(s.statusCode)).length;
    return count >= 20 ? '20+' : `${count}`;
  }, [staffList, activeFilters]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.bottomSheetContainer}>
              {/* ── Filter Header (62px) ── */}
              <View style={styles.header}>
                {/* Centered Title */}
                <Text style={styles.headerTitle}>Filter</Text>

                {/* 40x40 Close Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.closeButton}
                  onPress={onClose}
                >
                  <Cancel01Icon size={24} color="#141B34" />
                </TouchableOpacity>
              </View>

              {/* ── Status Options Content Body (1:1 Figma) ── */}
              <View style={styles.contentBody}>
                {hasRecentlyFiltered ? (
                  /* ── State with Recently Filtered Chip (Image 1) ── */
                  <View style={styles.recentlyFilteredSection}>
                    <Text style={styles.recentlyFilteredTitle}>Recently Filtered</Text>

                    {/* Active Chips with ✕ dismiss */}
                    <View style={styles.chipRow}>
                      {recentList.map((rf) => {
                        const isChipActive = activeFilters.includes(rf);
                        return (
                          <TouchableOpacity
                            key={rf}
                            activeOpacity={0.8}
                            style={[
                              styles.recentlyFilteredChip,
                              isChipActive && styles.recentlyFilteredChipActive,
                            ]}
                            onPress={() => handleToggle(rf)}
                          >
                            <Text
                              style={[
                                styles.recentlyFilteredChipText,
                                isChipActive && styles.recentlyFilteredChipTextActive,
                              ]}
                            >
                              {getRecentlyFilteredLabel(rf)}
                            </Text>

                            <TouchableOpacity
                              activeOpacity={0.7}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              style={styles.chipCloseIconBox}
                              onPress={() => handleDismissChip(rf)}
                            >
                              <Cancel01Icon
                                size={14}
                                color={isChipActive ? '#FFFFFF' : '#000814'}
                              />
                            </TouchableOpacity>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* ── Demarcation Line (Separates Recently Filtered from other filter options) ── */}
                    <View style={styles.demarcationLine} />

                    {/* Remaining Options in 2x2 rows */}
                    <View style={styles.remainingOptionsBlock}>
                      {/* Row 1 */}
                      <View style={styles.remainingRow}>
                        {remainingOptions.slice(0, 2).map((opt) => {
                          const isOptActive = opt.key === 'all' ? activeFilters.length === 0 : activeFilters.includes(opt.key);
                          return (
                            <TouchableOpacity
                              key={opt.key}
                              activeOpacity={0.8}
                              style={[
                                styles.halfButton168,
                                isOptActive && styles.optionButtonActive,
                              ]}
                              onPress={() => handleToggle(opt.key)}
                            >
                              {opt.renderIcon(isOptActive ? '#FFFFFF' : 'rgba(192, 192, 204, 0.96)')}
                              <Text
                                style={[
                                  styles.optionText,
                                  isOptActive && styles.optionTextActive,
                                ]}
                              >
                                {opt.label === 'Attending to client' ? 'In-Service' : opt.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      {/* Row 2 */}
                      <View style={styles.remainingRow}>
                        {remainingOptions.slice(2, 4).map((opt) => {
                          const isOptActive = opt.key === 'all' ? activeFilters.length === 0 : activeFilters.includes(opt.key);
                          return (
                            <TouchableOpacity
                              key={opt.key}
                              activeOpacity={0.8}
                              style={[
                                styles.halfButton1685,
                                isOptActive && styles.optionButtonActive,
                              ]}
                              onPress={() => handleToggle(opt.key)}
                            >
                              {opt.renderIcon(isOptActive ? '#FFFFFF' : 'rgba(192, 192, 204, 0.96)')}
                              <Text
                                style={[
                                  styles.optionText,
                                  isOptActive && styles.optionTextActive,
                                ]}
                              >
                                {opt.label === 'Attending to client' ? 'In-Service' : opt.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  </View>
                ) : (
                  /* ── Initial Filter Options Layout (1:1 Figma) ── */
                  <View style={styles.initialOptionsSection}>
                    {/* Row 1: Attending to client (212x48px) */}
                    <View style={styles.row1}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                          styles.attendingButton,
                          activeFilters.includes('attending') && styles.optionButtonActive,
                        ]}
                        onPress={() => handleToggle('attending')}
                      >
                        <LoaderSunburstIcon
                          size={24}
                          color={activeFilters.includes('attending') ? '#FFFFFF' : 'rgba(192, 192, 204, 0.96)'}
                        />
                        <Text
                          style={[
                            styles.optionText,
                            activeFilters.includes('attending') && styles.optionTextActive,
                          ]}
                        >
                          Attending to client
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Row 2: On - Break (168px) & Available (168px) */}
                    <View style={styles.row2}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                          styles.halfButton168,
                          activeFilters.includes('on_break') && styles.optionButtonActive,
                        ]}
                        onPress={() => handleToggle('on_break')}
                      >
                        <FastFoodOutlineIcon
                          size={24}
                          color={activeFilters.includes('on_break') ? '#FFFFFF' : 'rgba(192, 192, 204, 0.96)'}
                        />
                        <Text
                          style={[
                            styles.optionText,
                            activeFilters.includes('on_break') && styles.optionTextActive,
                          ]}
                        >
                          On - Break
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                          styles.halfButton168,
                          activeFilters.includes('available') && styles.optionButtonActive,
                        ]}
                        onPress={() => handleToggle('available')}
                      >
                        <User03Icon
                          size={24}
                          color={activeFilters.includes('available') ? '#FFFFFF' : 'rgba(192, 192, 204, 0.96)'}
                        />
                        <Text
                          style={[
                            styles.optionText,
                            activeFilters.includes('available') && styles.optionTextActive,
                          ]}
                        >
                          Available
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Row 3: Closed (168.5px) & Filter all (168.5px) */}
                    <View style={styles.row3}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                          styles.halfButton1685,
                          activeFilters.includes('closed') && styles.optionButtonActive,
                        ]}
                        onPress={() => handleToggle('closed')}
                      >
                        <Home03Icon
                          size={24}
                          color={activeFilters.includes('closed') ? '#FFFFFF' : 'rgba(192, 192, 204, 0.96)'}
                        />
                        <Text
                          style={[
                            styles.optionText,
                            activeFilters.includes('closed') && styles.optionTextActive,
                          ]}
                        >
                          Closed
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                          styles.halfButton1685,
                          activeFilters.length === 0 && styles.optionButtonActive,
                        ]}
                        onPress={() => handleToggle('all')}
                      >
                        <AArrowUpIcon
                          size={24}
                          color={activeFilters.length === 0 ? '#FFFFFF' : 'rgba(192, 192, 204, 0.96)'}
                        />
                        <Text
                          style={[
                            styles.optionText,
                            activeFilters.length === 0 && styles.optionTextActive,
                          ]}
                        >
                          Filter all
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {/* ── Sticky Bottom Action Bar (80px: 1:1 Figma) ── */}
              <View style={styles.bottomBar}>
                {/* Clear all (115x48px) */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.clearAllButton}
                  onPress={handleClearAll}
                >
                  <Text style={styles.clearAllText}>Clear all</Text>
                </TouchableOpacity>

                {/* Show 20+ related (200x48px / flex: 1) */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.showRelatedButton}
                  onPress={handleApply}
                >
                  <Text style={styles.showRelatedText}>Show {displayCount} related</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

export default ProviderStaffFilterModal;

// ── 1:1 Converter Output Stylesheet (Figma Height: 467px) ───────────────────

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 8, 20, 0.45)',
    justifyContent: 'flex-end',
  },

  /* ── Filter Bottom Sheet (390x467px: 1:1 Figma) ── */
  bottomSheetContainer: {
    width: '100%',
    maxWidth: 390,
    height: 467,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
    position: 'relative',
  },

  /* ── Header (Height: 62px) ── */
  header: {
    width: '100%',
    height: 62,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    position: 'relative',
  },
  headerTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
    includeFontPadding: false,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Content Body ── */
  contentBody: {
    paddingHorizontal: 16,
    width: '100%',
  },

  /* ── Initial Options Layout (gap: 40px, top: 40px: 1:1 Figma) ── */
  initialOptionsSection: {
    paddingTop: 40,
    gap: 40,
  },

  /* ── Recently Filtered Section (1:1 Figma) ── */
  recentlyFilteredSection: {
    paddingTop: 24,
  },
  recentlyFilteredTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  demarcationLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginTop: 20,
    marginBottom: 20,
  },
  recentlyFilteredChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    alignSelf: 'flex-start',
  },
  recentlyFilteredChipActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  recentlyFilteredChipText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  recentlyFilteredChipTextActive: {
    color: '#FFFFFF',
  },
  chipCloseIconBox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remainingOptionsBlock: {
    gap: 24,
  },
  remainingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },

  /* ── Standard Rows ── */
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendingButton: {
    width: 212,
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },

  row2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  halfButton168: {
    width: 168,
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },

  row3: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  halfButton1685: {
    width: 168.5,
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },

  optionText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  optionButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },

  /* ── Bottom Action Bar (80px: 1:1 Figma) ── */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 16,
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  clearAllButton: {
    width: 115,
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearAllText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
    textAlign: 'center',
  },
  showRelatedButton: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  showRelatedText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
    textAlign: 'center',
  },
});
