import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { triggerLightHaptic } from '../../../utils/haptics';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

export const ALL_WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export type WeekDay = typeof ALL_WEEK_DAYS[number];

/**
 * Pure function to format selected work days:
 * - Arranged in Monday-first calendar order
 * - Returns "Everyday" when all 7 days are selected
 * - Comma-separated when partial (e.g. "Monday, Wednesday, Sunday")
 */
export function formatWorkDays(selectedDays: string[]): string {
  if (!selectedDays || selectedDays.length === 0) return '';

  const ordered = ALL_WEEK_DAYS.filter((day) => selectedDays.includes(day));
  if (ordered.length === 7) {
    return 'Everyday';
  }

  return ordered.join(', ');
}

export interface WorkDaysSheetProps {
  visible: boolean;
  selectedDays: string[];
  onConfirm: (days: string[]) => void;
  onClose: () => void;
}

// ── Close Icon (cancel-01, 24x24) ──
function CloseIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── 1:1 Figma checkmark-circle-02 (24x24) ──
function DayCheckIcon({ isSelected }: { isSelected: boolean }) {
  if (isSelected) {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="11" fill="rgba(0, 8, 20, 0.96)" />
        <Path
          d="M8 12.2l2.8 2.8L16.5 9"
          stroke="#FFFFFF"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="10.5"
        stroke="rgba(235, 235, 245, 0.96)"
        strokeWidth={1.5}
      />
    </Svg>
  );
}

/**
 * 1:1 Figma WorkDaysSheet (Frames B2 & B3, CSS Spec "work days bottom sheet")
 *
 * Measurements from CSS:
 * - Sheet: 390px wide, minHeight 542px, radius 24px 24px 0 0
 * - Header: height 62px, padding 8px 16px, borderBottom 1px solid rgba(235, 235, 245, 0.96)
 * - Dates grid: 358px wide, height 294px
 * - Chips: 167px wide, 48px height, radius 24px, padding 8px 16px, colGap 24px, rowGap 31.5px
 * - Footer: height 80px, padding 16px, 358x48px Confirm pill button
 */
export const WorkDaysSheet: React.FC<WorkDaysSheetProps> = ({
  visible,
  selectedDays: initialSelectedDays,
  onConfirm,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [workingDays, setWorkingDays] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setWorkingDays(initialSelectedDays || []);
    }
  }, [visible, initialSelectedDays]);

  const isAllSelected = ALL_WEEK_DAYS.every((d) => workingDays.includes(d));

  const handleToggleDay = (day: string) => {
    triggerLightHaptic();
    setWorkingDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const handleToggleEveryday = () => {
    triggerLightHaptic();
    if (isAllSelected) {
      // Clear all
      setWorkingDays([]);
    } else {
      // Select all 7
      setWorkingDays([...ALL_WEEK_DAYS]);
    }
  };

  const hasSelection = workingDays.length > 0;

  const handleConfirmPress = () => {
    if (!hasSelection) return;

    triggerLightHaptic();
    const ordered = ALL_WEEK_DAYS.filter((d) => workingDays.includes(d));
    onConfirm(ordered);
    onClose();
  };

  // Pair items in CSS order:
  // Row 1: Monday, Tuesday
  // Row 2: Wednesday, Thursday
  // Row 3: Friday, Saturday
  // Row 4: Sunday, Everyday
  const dayPairs: Array<[string, string]> = [
    ['Monday', 'Tuesday'],
    ['Wednesday', 'Thursday'],
    ['Friday', 'Saturday'],
    ['Sunday', 'Everyday'],
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.sheetContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {/* ── 1. Filter Header (62px, CSS Spec) ── */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Work Days</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.closeButton}
              onPress={onClose}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Close work days sheet"
            >
              <CloseIcon size={24} />
            </TouchableOpacity>
          </View>

          {/* ── 2. Dates Grid (358x294, CSS Spec) ── */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.datesGrid}>
              {dayPairs.map(([leftItem, rightItem], rowIdx) => {
                const isLeftSelected = leftItem === 'Everyday' ? isAllSelected : workingDays.includes(leftItem);
                const isRightSelected = rightItem === 'Everyday' ? isAllSelected : workingDays.includes(rightItem);

                return (
                  <View key={`row_${rowIdx}`} style={styles.gridRow}>
                    {/* Left Chip */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={[
                        styles.chip,
                        isLeftSelected ? styles.chipSelected : styles.chipUnselected,
                      ]}
                      onPress={() => (leftItem === 'Everyday' ? handleToggleEveryday() : handleToggleDay(leftItem))}
                      accessible
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isLeftSelected }}
                      accessibilityLabel={leftItem}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isLeftSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {leftItem}
                      </Text>
                      <DayCheckIcon isSelected={isLeftSelected} />
                    </TouchableOpacity>

                    {/* Right Chip */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={[
                        styles.chip,
                        isRightSelected ? styles.chipSelected : styles.chipUnselected,
                      ]}
                      onPress={() => (rightItem === 'Everyday' ? handleToggleEveryday() : handleToggleDay(rightItem))}
                      accessible
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isRightSelected }}
                      accessibilityLabel={rightItem}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isRightSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {rightItem}
                      </Text>
                      <DayCheckIcon isSelected={isRightSelected} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* ── 3. Action Button (80px, CSS Spec) ── */}
          <View style={styles.actionButtonContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.confirmButton,
                hasSelection ? styles.confirmButtonActive : styles.confirmButtonDisabled,
              ]}
              disabled={!hasSelection}
              onPress={handleConfirmPress}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Confirm work days"
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  hasSelection ? styles.confirmTextActive : styles.confirmTextDisabled,
                ]}
              >
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default WorkDaysSheet;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 542,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    paddingHorizontal: 16,
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
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 16,
    alignItems: 'center',
  },
  datesGrid: {
    width: 358,
    gap: 31.5,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 358,
  },
  chip: {
    width: 167,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  chipUnselected: {
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
  },
  chipSelected: {
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
  },
  chipText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    flex: 1,
    marginRight: 8,
  },
  chipTextUnselected: {
    color: 'rgba(0, 8, 20, 0.96)',
  },
  chipTextSelected: {
    color: '#000000',
  },
  actionButtonContainer: {
    width: '100%',
    height: 80,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    width: 358,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    shadowColor: '#858B94',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  confirmButtonDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  confirmButtonText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  confirmTextActive: {
    color: '#FFFFFF',
  },
  confirmTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
});
