import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { triggerLightHaptic } from '../../utils/haptics';
import { StaffFilterOption } from '../../constants/staffStatus.config';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

export interface StaffStatusFilterModalProps {
  visible: boolean;
  onClose: () => void;
  activeFilter: StaffFilterOption;
  recentFilter?: StaffFilterOption | null;
  onApplyFilter: (filter: StaffFilterOption) => void;
  onClearFilter: () => void;
  onRemoveRecentFilter?: () => void;
}

// Custom 1:1 SVG Icons from Figma specs
function SeatSelectorIcon({ color = 'rgba(192, 192, 204, 0.96)' }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 10v4a2 2 0 002 2h12a2 2 0 002-2v-4"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 10h16M17 10V5a2 2 0 00-2-2H9a2 2 0 00-2 2v5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M7 21v-3M17 21v-3" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function FastFoodIcon({ color = 'rgba(192, 192, 204, 0.96)' }: { color?: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 11h16a1 1 0 011 1v1a7 7 0 01-7 7H10a7 7 0 01-7-7v-1a1 1 0 011-1z"
        stroke={color}
        strokeWidth={1.5}
      />
      <Path d="M5 11c0-4 3.5-7 7-7s7 3 7 7" stroke={color} strokeWidth={1.5} />
      <Path d="M9 15h6" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function HomeIcon({ color = 'rgba(192, 192, 204, 0.96)' }: { color?: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9.5z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function UserIcon({ color = 'rgba(192, 192, 204, 0.96)' }: { color?: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ArrowUpIcon({ color = 'rgba(192, 192, 204, 0.96)' }: { color?: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 15V6m0 0l-3 3m3-3l3 3M6 18l3.5-9 3.5 9M7.2 15h4.6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CancelIcon({
  size = 24,
  color = '#141B34',
  strokeWidth = 1.5,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export const StaffStatusFilterModal: React.FC<StaffStatusFilterModalProps> = ({
  visible,
  onClose,
  activeFilter,
  recentFilter,
  onApplyFilter,
  onClearFilter,
  onRemoveRecentFilter,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<StaffFilterOption>(activeFilter);

  useEffect(() => {
    if (visible) {
      setSelectedFilter(activeFilter);
    }
  }, [visible, activeFilter]);

  const handleSelect = (filter: StaffFilterOption) => {
    triggerLightHaptic();
    setSelectedFilter(filter);
  };

  const handleClear = () => {
    triggerLightHaptic();
    setSelectedFilter('all');
    onClearFilter();
  };

  const handleApply = () => {
    triggerLightHaptic();
    onApplyFilter(selectedFilter);
    onClose();
  };

  const renderIcon = (type: StaffFilterOption, isSelected: boolean) => {
    const color = isSelected ? '#FFFFFF' : 'rgba(192, 192, 204, 0.96)';
    switch (type) {
      case 'busy':
        return <SeatSelectorIcon color={color} />;
      case 'break':
        return <FastFoodIcon color={color} />;
      case 'closed':
        return <HomeIcon color={color} />;
      case 'available':
        return <UserIcon color={color} />;
      case 'all':
      default:
        return <ArrowUpIcon color={color} />;
    }
  };

  const getFilterLabel = (type: StaffFilterOption) => {
    switch (type) {
      case 'busy':
        return 'Busy';
      case 'break':
        return 'On - Break';
      case 'closed':
        return 'Closed';
      case 'available':
        return 'Available';
      case 'all':
      default:
        return 'Filter all';
    }
  };

  const hasRecent = !!recentFilter && recentFilter !== 'all';
  const sheetHeight = hasRecent ? 546 : 467;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.bottomSheet,
            {
              height: sheetHeight + Math.max(insets.bottom, 16),
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            <Text style={styles.headerTitle}>Filter</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                triggerLightHaptic();
                onClose();
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <CancelIcon size={24} color="#141B34" strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          {/* Content Body */}
          <ScrollView
            bounces={false}
            contentContainerStyle={styles.contentBody}
            showsVerticalScrollIndicator={false}
          >
            {hasRecent ? (
              // EXPANDED STATE (with Recently Filtered)
              <>
                <View style={styles.recentSection}>
                  <Text style={styles.recentTitle}>Recently Filtered</Text>
                  <View style={styles.recentTagRow}>
                    <TouchableOpacity
                      style={[
                        styles.recentChip,
                        selectedFilter === recentFilter && styles.chipActive,
                      ]}
                      onPress={() => handleSelect(recentFilter!)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.chipContent}>
                        {renderIcon(recentFilter!, selectedFilter === recentFilter)}
                        <Text
                          style={[
                            styles.chipText,
                            selectedFilter === recentFilter && styles.chipTextActive,
                          ]}
                        >
                          {getFilterLabel(recentFilter!)}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {onRemoveRecentFilter && (
                      <TouchableOpacity
                        style={styles.recentCloseBtn}
                        onPress={() => {
                          triggerLightHaptic();
                          onRemoveRecentFilter();
                        }}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <CancelIcon size={16} color="#141B34" strokeWidth={1.5} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* 2x2 Grid for Remaining Options */}
                <View style={styles.gridContainer}>
                  <View style={styles.gridRow}>
                    <TouchableOpacity
                      style={[
                        styles.gridChip,
                        selectedFilter === 'closed' && styles.chipActive,
                      ]}
                      onPress={() => handleSelect('closed')}
                      activeOpacity={0.8}
                    >
                      {renderIcon('closed', selectedFilter === 'closed')}
                      <Text
                        style={[
                          styles.chipText,
                          selectedFilter === 'closed' && styles.chipTextActive,
                        ]}
                      >
                        Closed
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.gridChip,
                        selectedFilter === 'available' && styles.chipActive,
                      ]}
                      onPress={() => handleSelect('available')}
                      activeOpacity={0.8}
                    >
                      {renderIcon('available', selectedFilter === 'available')}
                      <Text
                        style={[
                          styles.chipText,
                          selectedFilter === 'available' && styles.chipTextActive,
                        ]}
                      >
                        Available
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.gridRow}>
                    <TouchableOpacity
                      style={[
                        styles.gridChip,
                        selectedFilter === 'all' && styles.chipActive,
                      ]}
                      onPress={() => handleSelect('all')}
                      activeOpacity={0.8}
                    >
                      {renderIcon('all', selectedFilter === 'all')}
                      <Text
                        style={[
                          styles.chipText,
                          selectedFilter === 'all' && styles.chipTextActive,
                        ]}
                      >
                        Filter all
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.gridChip,
                        selectedFilter === 'break' && styles.chipActive,
                      ]}
                      onPress={() => handleSelect('break')}
                      activeOpacity={0.8}
                    >
                      {renderIcon('break', selectedFilter === 'break')}
                      <Text
                        style={[
                          styles.chipText,
                          selectedFilter === 'break' && styles.chipTextActive,
                        ]}
                      >
                        On - Break
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            ) : (
              // DEFAULT STATE (Lines 5200 - 5835 Figma specs)
              <View style={styles.defaultOptionsContainer}>
                {/* Row 1: Busy (100px) & On - Break (168px) */}
                <View style={styles.defaultRow}>
                  <TouchableOpacity
                    style={[
                      styles.busyChip,
                      selectedFilter === 'busy' && styles.chipActive,
                    ]}
                    onPress={() => handleSelect('busy')}
                    activeOpacity={0.8}
                  >
                    {renderIcon('busy', selectedFilter === 'busy')}
                    <Text
                      style={[
                        styles.chipText,
                        selectedFilter === 'busy' && styles.chipTextActive,
                      ]}
                    >
                      Busy
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.breakChip,
                      selectedFilter === 'break' && styles.chipActive,
                    ]}
                    onPress={() => handleSelect('break')}
                    activeOpacity={0.8}
                  >
                    {renderIcon('break', selectedFilter === 'break')}
                    <Text
                      style={[
                        styles.chipText,
                        selectedFilter === 'break' && styles.chipTextActive,
                      ]}
                    >
                      On - Break
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Row 2: Closed (168.5px) & Available (168px) */}
                <View style={styles.defaultRow}>
                  <TouchableOpacity
                    style={[
                      styles.closedChip,
                      selectedFilter === 'closed' && styles.chipActive,
                    ]}
                    onPress={() => handleSelect('closed')}
                    activeOpacity={0.8}
                  >
                    {renderIcon('closed', selectedFilter === 'closed')}
                    <Text
                      style={[
                        styles.chipText,
                        selectedFilter === 'closed' && styles.chipTextActive,
                      ]}
                    >
                      Closed
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.availableChip,
                      selectedFilter === 'available' && styles.chipActive,
                    ]}
                    onPress={() => handleSelect('available')}
                    activeOpacity={0.8}
                  >
                    {renderIcon('available', selectedFilter === 'available')}
                    <Text
                      style={[
                        styles.chipText,
                        selectedFilter === 'available' && styles.chipTextActive,
                      ]}
                    >
                      Available
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Row 3: Filter all (168.5px) */}
                <View style={styles.defaultRowSingle}>
                  <TouchableOpacity
                    style={[
                      styles.filterAllChip,
                      selectedFilter === 'all' && styles.chipActive,
                    ]}
                    onPress={() => handleSelect('all')}
                    activeOpacity={0.8}
                  >
                    {renderIcon('all', selectedFilter === 'all')}
                    <Text
                      style={[
                        styles.chipText,
                        selectedFilter === 'all' && styles.chipTextActive,
                      ]}
                    >
                      Filter all
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer Action Bar */}
          <View style={styles.footerBar}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              activeOpacity={0.8}
            >
              <Text style={styles.clearButtonText}>Clear all</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.8}
            >
              <Text style={styles.applyButtonText}>Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  bottomSheet: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    height: 62,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
  },
  headerSpacer: {
    width: 40,
    height: 40,
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
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentBody: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  defaultOptionsContainer: {
    gap: 24,
  },
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  defaultRowSingle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  busyChip: {
    width: 100,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  breakChip: {
    width: 168,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  closedChip: {
    width: 168.5,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  availableChip: {
    width: 168,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  filterAllChip: {
    width: 168.5,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  chipActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  chipText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  recentSection: {
    gap: 16,
    marginBottom: 24,
  },
  recentTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  recentTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recentChip: {
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recentCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    gap: 16,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  gridChip: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  footerBar: {
    height: 80,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 15,
  },
  clearButton: {
    width: 115,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  applyButton: {
    flex: 1,
    marginLeft: 17,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 8, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 10,
  },
  applyButtonText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },
});
