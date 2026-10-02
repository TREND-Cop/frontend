import React, { useState, useEffect } from 'react';
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

interface ProviderStaffFilterModalProps {
  visible: boolean;
  selectedFilter?: StaffStatusFilter;
  onClose: () => void;
  onApply: (filter: StaffStatusFilter) => void;
  onClear: () => void;
}

export function ProviderStaffFilterModal({
  visible,
  selectedFilter = 'all',
  onClose,
  onApply,
  onClear,
}: ProviderStaffFilterModalProps) {
  const [activeFilter, setActiveFilter] = useState<StaffStatusFilter>(selectedFilter);

  useEffect(() => {
    setActiveFilter(selectedFilter);
  }, [selectedFilter, visible]);

  const handleSelect = (filter: StaffStatusFilter) => {
    setActiveFilter(filter);
  };

  const handleDismissChip = () => {
    setActiveFilter('all');
  };

  const handleClearAll = () => {
    setActiveFilter('all');
    onClear();
    onClose();
  };

  const handleApply = () => {
    onApply(activeFilter);
    onClose();
  };

  const hasRecentlyFiltered = activeFilter !== 'all';

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

  // Get the 4 remaining options that are NOT the active recently filtered one
  const remainingOptions = FILTER_CONFIGS.filter((opt) => opt.key !== activeFilter);
  const isFilter = (val: string) => (activeFilter as string) === val;

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

              {/* ── Status Options Content ── */}
              <View style={styles.contentBody}>
                {hasRecentlyFiltered ? (
                  /* ── State with Recently Filtered Chip (1:1 Figma) ── */
                  <View style={styles.recentlyFilteredSection}>
                    <Text style={styles.recentlyFilteredTitle}>Recently Filtered</Text>

                    {/* Active Chip with ✕ dismiss */}
                    <View style={styles.chipRow}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.recentlyFilteredChip}
                        onPress={handleDismissChip}
                      >
                        <Text style={styles.recentlyFilteredChipText}>
                          {getRecentlyFilteredLabel(activeFilter)}
                        </Text>
                        <View style={styles.chipCloseIconBox}>
                          <Cancel01Icon size={14} color="#000814" />
                        </View>
                      </TouchableOpacity>
                    </View>

                    {/* Remaining 4 Options in 2x2 rows */}
                    <View style={styles.remainingOptionsBlock}>
                      {/* Row 1 */}
                      <View style={styles.remainingRow}>
                        {remainingOptions.slice(0, 2).map((opt) => (
                          <TouchableOpacity
                            key={opt.key}
                            activeOpacity={0.8}
                            style={styles.halfButton168}
                            onPress={() => handleSelect(opt.key)}
                          >
                            {opt.renderIcon('rgba(192, 192, 204, 0.96)')}
                            <Text style={styles.optionText}>{opt.label === 'Attending to client' ? 'In-Service' : opt.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      {/* Row 2 */}
                      <View style={styles.remainingRow}>
                        {remainingOptions.slice(2, 4).map((opt) => (
                          <TouchableOpacity
                            key={opt.key}
                            activeOpacity={0.8}
                            style={styles.halfButton168}
                            onPress={() => handleSelect(opt.key)}
                          >
                            {opt.renderIcon('rgba(192, 192, 204, 0.96)')}
                            <Text style={styles.optionText}>{opt.label === 'Attending to client' ? 'In-Service' : opt.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                ) : (
                  /* ── Standard Initial Filter Options (1:1 Figma) ── */
                  <>
                    {/* Row 1: Attending to client (212x48px) */}
                    <View style={styles.row1}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                          styles.attendingButton,
                          isFilter('attending') && styles.optionButtonActive,
                        ]}
                        onPress={() => handleSelect('attending')}
                      >
                        <LoaderSunburstIcon
                          size={24}
                          color={isFilter('attending') ? '#000814' : 'rgba(192, 192, 204, 0.96)'}
                        />
                        <Text
                          style={[
                            styles.optionText,
                            isFilter('attending') && styles.optionTextActive,
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
                          isFilter('on_break') && styles.optionButtonActive,
                        ]}
                        onPress={() => handleSelect('on_break')}
                      >
                        <FastFoodOutlineIcon
                          size={24}
                          color={isFilter('on_break') ? '#000814' : 'rgba(192, 192, 204, 0.96)'}
                        />
                        <Text
                          style={[
                            styles.optionText,
                            isFilter('on_break') && styles.optionTextActive,
                          ]}
                        >
                          On - Break
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                          styles.halfButton168,
                          isFilter('available') && styles.optionButtonActive,
                        ]}
                        onPress={() => handleSelect('available')}
                      >
                        <User03Icon
                          size={24}
                          color={isFilter('available') ? '#000814' : 'rgba(192, 192, 204, 0.96)'}
                        />
                        <Text
                          style={[
                            styles.optionText,
                            isFilter('available') && styles.optionTextActive,
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
                          isFilter('closed') && styles.optionButtonActive,
                        ]}
                        onPress={() => handleSelect('closed')}
                      >
                        <Home03Icon
                          size={24}
                          color={isFilter('closed') ? '#000814' : 'rgba(192, 192, 204, 0.96)'}
                        />
                        <Text
                          style={[
                            styles.optionText,
                            isFilter('closed') && styles.optionTextActive,
                          ]}
                        >
                          Closed
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                          styles.halfButton1685,
                          isFilter('all') && styles.optionButtonActive,
                        ]}
                        onPress={() => handleSelect('all')}
                      >
                        <AArrowUpIcon
                          size={24}
                          color={isFilter('all') ? '#000814' : 'rgba(192, 192, 204, 0.96)'}
                        />
                        <Text
                          style={[
                            styles.optionText,
                            isFilter('all') && styles.optionTextActive,
                          ]}
                        >
                          Filter all
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>

              {/* ── Sticky Bottom Action Bar (80px) ── */}
              <View style={styles.bottomBar}>
                {/* Clear all (115x48px) */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.clearAllButton}
                  onPress={handleClearAll}
                >
                  <Text style={styles.clearAllText}>Clear all</Text>
                </TouchableOpacity>

                {/* Show 20+ related (200x48px) */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.showRelatedButton}
                  onPress={handleApply}
                >
                  <Text style={styles.showRelatedText}>Show 20+ related</Text>
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

// ── 1:1 Converter Output Stylesheet ─────────────────────────────────────────

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 8, 20, 0.45)',
    justifyContent: 'flex-end',
  },

  /* ── Filter Bottom Sheet (390x467px) ── */
  bottomSheetContainer: {
    width: '100%',
    maxWidth: 390,
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
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
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
    paddingTop: 24,
    paddingBottom: 24,
    gap: 24,
  },

  /* ── Recently Filtered Section (1:1 Figma) ── */
  recentlyFilteredSection: {
    gap: 16,
  },
  recentlyFilteredTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#000000',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentlyFilteredChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
  },
  recentlyFilteredChipText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  chipCloseIconBox: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remainingOptionsBlock: {
    gap: 16,
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
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
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
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
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
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },

  optionButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(0, 8, 20, 0.96)',
    borderWidth: 1.5,
  },
  optionText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  optionTextActive: {
    color: 'rgba(0, 8, 20, 0.96)',
    fontWeight: '500',
  },

  /* ── Bottom Action Bar (80px) ── */
  bottomBar: {
    width: '100%',
    height: 80,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
    backgroundColor: '#FFFFFF',
  },
  clearAllButton: {
    width: 115,
    height: 48,
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
  },
  showRelatedButton: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 8, 20, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  showRelatedText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },
});
