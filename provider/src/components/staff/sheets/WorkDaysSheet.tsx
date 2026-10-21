import React, { useState, useEffect, useMemo } from 'react';
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
  mode?: 'add' | 'edit';
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
function DayCheckIcon({ isSelected, disabled }: { isSelected: boolean; disabled?: boolean }) {
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
  const strokeColor = disabled ? 'rgba(235, 235, 245, 0.96)' : 'rgba(192, 192, 204, 0.96)';
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="10.5"
        stroke={strokeColor}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

// ── Red Circle ✕ Badge Icon (24x24) ──
function CircleXBadgeIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill="rgba(204, 41, 41, 0.9)" />
      <Path
        d="M9 9l6 6M15 9l-6 6"
        stroke="#FFFFFF"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma WorkDaysSheet (Frames B2/B3 in Add mode, Frame E4 in Edit mode)
 */
export const WorkDaysSheet: React.FC<WorkDaysSheetProps> = ({
  visible,
  mode = 'add',
  selectedDays: initialSelectedDays,
  onConfirm,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [workingDays, setWorkingDays] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setWorkingDays(initialSelectedDays ? [...initialSelectedDays] : []);
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

  const handleAddDayInEdit = (day: string) => {
    if (workingDays.includes(day)) return;
    triggerLightHaptic();
    setWorkingDays((prev) => [...prev, day]);
  };

  const handleRemoveDayInEdit = (day: string) => {
    triggerLightHaptic();
    setWorkingDays((prev) => prev.filter((d) => d !== day));
  };

  const handleToggleEveryday = () => {
    triggerLightHaptic();
    if (mode === 'edit') {
      // In edit mode: "Everyday" adds all remaining days
      setWorkingDays([...ALL_WEEK_DAYS]);
    } else {
      if (isAllSelected) {
        setWorkingDays([]);
      } else {
        setWorkingDays([...ALL_WEEK_DAYS]);
      }
    }
  };

  const orderedWorkingDays = useMemo(() => {
    return ALL_WEEK_DAYS.filter((d) => workingDays.includes(d));
  }, [workingDays]);

  const hasSelection = workingDays.length > 0;

  const isChanged = useMemo(() => {
    if (mode !== 'edit') return true;
    if (!initialSelectedDays) return workingDays.length > 0;
    if (orderedWorkingDays.length !== initialSelectedDays.length) return true;
    return orderedWorkingDays.some((d, i) => d !== initialSelectedDays[i]);
  }, [mode, orderedWorkingDays, initialSelectedDays, workingDays]);

  const canConfirm = hasSelection && isChanged;

  const handleConfirmPress = () => {
    if (!canConfirm) return;
    triggerLightHaptic();
    onConfirm(orderedWorkingDays);
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

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ── 2. Edit Mode: Current Work Day Section (Frame E4) ── */}
            {mode === 'edit' && (
              <View style={styles.currentSection}>
                <Text style={styles.sectionHeading}>Current Work Day</Text>
                <View style={styles.chipsRow}>
                  {orderedWorkingDays.map((day) => (
                    <View key={day} style={styles.dayChip}>
                      <Text style={styles.dayChipText} numberOfLines={1}>{day}</Text>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleRemoveDayInEdit(day)}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${day}`}
                      >
                        <CircleXBadgeIcon size={24} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                <Text style={styles.sectionHeading}>Select Work Day</Text>
                <Text style={styles.helperText}>How many days a week will the staff work?</Text>
              </View>
            )}

            {/* ── 3. Dates Grid (358x294, CSS Spec) ── */}
            <View style={styles.datesGrid}>
              {dayPairs.map(([leftItem, rightItem], rowIdx) => {
                const isLeftAlreadyAdded = mode === 'edit' && leftItem !== 'Everyday' && workingDays.includes(leftItem);
                const isRightAlreadyAdded = mode === 'edit' && rightItem !== 'Everyday' && workingDays.includes(rightItem);
                const isEverydayDisabled = mode === 'edit' && isAllSelected;

                const isLeftSelected = leftItem === 'Everyday' ? isAllSelected : workingDays.includes(leftItem);
                const isRightSelected = rightItem === 'Everyday' ? isAllSelected : workingDays.includes(rightItem);

                return (
                  <View key={`row_${rowIdx}`} style={styles.gridRow}>
                    {/* Left Chip */}
                    <TouchableOpacity
                      activeOpacity={isLeftAlreadyAdded ? 1 : 0.7}
                      style={[
                        styles.chip,
                        isLeftSelected ? styles.chipSelected : styles.chipUnselected,
                        isLeftAlreadyAdded && styles.chipDisabled,
                      ]}
                      onPress={() => {
                        if (isLeftAlreadyAdded) return;
                        if (leftItem === 'Everyday') {
                          handleToggleEveryday();
                        } else if (mode === 'edit') {
                          handleAddDayInEdit(leftItem);
                        } else {
                          handleToggleDay(leftItem);
                        }
                      }}
                      disabled={isLeftAlreadyAdded}
                      accessible
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isLeftSelected }}
                      accessibilityLabel={leftItem}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isLeftSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                          isLeftAlreadyAdded && styles.chipTextDisabled,
                        ]}
                      >
                        {leftItem}
                      </Text>
                      <DayCheckIcon
                        isSelected={isLeftSelected}
                        disabled={isLeftAlreadyAdded}
                      />
                    </TouchableOpacity>

                    {/* Right Chip */}
                    <TouchableOpacity
                      activeOpacity={isRightAlreadyAdded || isEverydayDisabled ? 1 : 0.7}
                      style={[
                        styles.chip,
                        isRightSelected ? styles.chipSelected : styles.chipUnselected,
                        (isRightAlreadyAdded || isEverydayDisabled) && styles.chipDisabled,
                      ]}
                      onPress={() => {
                        if (isRightAlreadyAdded || isEverydayDisabled) return;
                        if (rightItem === 'Everyday') {
                          handleToggleEveryday();
                        } else if (mode === 'edit') {
                          handleAddDayInEdit(rightItem);
                        } else {
                          handleToggleDay(rightItem);
                        }
                      }}
                      disabled={isRightAlreadyAdded || isEverydayDisabled}
                      accessible
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isRightSelected }}
                      accessibilityLabel={rightItem}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isRightSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                          (isRightAlreadyAdded || isEverydayDisabled) && styles.chipTextDisabled,
                        ]}
                      >
                        {rightItem}
                      </Text>
                      <DayCheckIcon
                        isSelected={isRightSelected}
                        disabled={isRightAlreadyAdded || isEverydayDisabled}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* ── 4. Action Button (Confirm) ── */}
          <View style={styles.actionButtonContainer}>
            <TouchableOpacity
              activeOpacity={canConfirm ? 0.85 : 1}
              style={[
                styles.confirmButton,
                canConfirm ? styles.confirmButtonActive : styles.confirmButtonDisabled,
              ]}
              disabled={!canConfirm}
              onPress={handleConfirmPress}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Confirm work days"
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  canConfirm ? styles.confirmTextActive : styles.confirmTextDisabled,
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
    maxHeight: '92%',
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
    top: 11,
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  currentSection: {
    width: '100%',
    marginBottom: 24,
  },
  sectionHeading: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  dayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    minWidth: 140,
    gap: 12,
  },
  dayChipText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  helperText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    marginBottom: 16,
  },
  datesGrid: {
    width: '100%',
    gap: 16,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  chip: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipUnselected: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
  },
  chipSelected: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
  },
  chipDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    opacity: 0.35,
  },
  chipText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
  },
  chipTextUnselected: {
    color: 'rgba(0, 8, 20, 0.96)',
  },
  chipTextSelected: {
    color: '#000000',
    fontFamily: FONT_MEDIUM,
  },
  chipTextDisabled: {
    color: 'rgba(96, 96, 102, 0.96)',
  },
  actionButtonContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  confirmButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  confirmButtonDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  confirmButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
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
