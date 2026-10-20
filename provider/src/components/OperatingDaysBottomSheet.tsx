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
import Svg, { Path } from 'react-native-svg';

export interface OperatingDaysBottomSheetProps {
  visible: boolean;
  selectedDays?: string[];
  onConfirm: (formattedDays: string, daysList: string[]) => void;
  onClose: () => void;
}

const ALL_WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const ORDERED_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
  'Everyday',
];

// ── Close Icon (cancel-01: 24x24, stroke 1.5px #141B34) ──
function CloseIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Red Remove Icon for Selected Pill (circle-x: 24x24, red bg, white 'x') ──
function CircleRemoveIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
        fill="rgba(204, 41, 41, 0.9)"
        stroke="rgba(204, 41, 41, 0.9)"
        strokeWidth="1.5"
      />
      <Path
        d="M15 9l-6 6M9 9l6 6"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Unselected Radio Circle (24x24, border 1.5px rgba(192, 192, 204, 0.96)) ──
function UnselectedRadioCircle({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21a9 9 0 100-18 9 9 0 000 18z"
        stroke="rgba(192, 192, 204, 0.96)"
        strokeWidth="1.5"
      />
    </Svg>
  );
}

// ── Selected Checkmark Circle (24x24, black bg, white checkmark) ──
function SelectedCheckmarkCircle({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
        fill="rgba(0, 8, 20, 0.96)"
      />
      <Path
        d="M8 12.5l2.8 2.8 5.2-5.6"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export const OperatingDaysBottomSheet: React.FC<OperatingDaysBottomSheetProps> = ({
  visible,
  selectedDays: incomingDays = [],
  onConfirm,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string[]>([]);
  const [initialHasSavedDays, setInitialHasSavedDays] = useState(false);

  // Sync state when sheet opens
  useEffect(() => {
    if (visible) {
      if (incomingDays && incomingDays.length > 0) {
        setSelected([...incomingDays]);
        setInitialHasSavedDays(true);
      } else {
        setSelected([]);
        setInitialHasSavedDays(false);
      }
    }
  }, [visible, incomingDays]);

  const hasSelections = selected.length > 0;
  // Selected Option is ONLY shown when the user had already previously selected days and returned to correct/view
  const showSelectedSection = initialHasSavedDays && selected.length > 0;

  // Toggle day selection
  const handleToggleDay = (day: string) => {
    if (day === 'Everyday') {
      const allSelected = ALL_WEEKDAYS.every((d) => selected.includes(d));
      if (allSelected) {
        setSelected([]);
      } else {
        setSelected([...ALL_WEEKDAYS]);
      }
      return;
    }

    if (selected.includes(day)) {
      setSelected(selected.filter((d) => d !== day));
    } else {
      setSelected([...selected, day]);
    }
  };

  const handleRemoveSelected = (day: string) => {
    setSelected(selected.filter((d) => d !== day));
  };

  const isDaySelected = (day: string) => {
    if (day === 'Everyday') {
      return ALL_WEEKDAYS.every((d) => selected.includes(d));
    }
    return selected.includes(day);
  };

  // Format final string
  const formatDaysString = (): string => {
    if (selected.length === 0) return '';
    const allSelected = ALL_WEEKDAYS.every((d) => selected.includes(d));
    if (allSelected) return 'Mondays & Sundays';

    // Sort according to weekday order
    const sorted = [...selected].sort(
      (a, b) => ALL_WEEKDAYS.indexOf(a) - ALL_WEEKDAYS.indexOf(b)
    );

    if (sorted.length === 2 && sorted.includes('Monday') && sorted.includes('Sunday')) {
      return 'Mondays & Sundays';
    }

    // Check if contiguous range
    const indices = sorted.map((d) => ALL_WEEKDAYS.indexOf(d));
    let isContiguous = true;
    for (let i = 1; i < indices.length; i++) {
      if (indices[i] !== indices[i - 1] + 1) {
        isContiguous = false;
        break;
      }
    }

    if (isContiguous && sorted.length >= 2) {
      return `${sorted[0]} - ${sorted[sorted.length - 1]}`;
    }

    return sorted.join(', ');
  };

  const handleConfirmPress = () => {
    if (!hasSelections) return;
    const formatted = formatDaysString();
    onConfirm(formatted, selected);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.sheetContainer,
            {
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}
        >
          {/* ── Filter Header (height: 62px) ── */}
          <View style={styles.filterHeader}>
            <View style={styles.headerTitleWrapper}>
              <Text style={styles.headerTitle}>Business Operating Days</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <CloseIcon size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Subtitle (height: 48px, top: 86px) ── */}
            <Text style={styles.subtitleText}>
              What day of the week do you open and close your business
            </Text>

            {/* ── Selected Option Section (Only shown when user came back with existing selections) ── */}
            {showSelectedSection && (
              <View style={styles.selectedSection}>
                <Text style={styles.selectedSectionTitle}>Selected Option</Text>

                <View style={styles.selectedGrid}>
                  {selected.map((day) => (
                    <TouchableOpacity
                      key={day}
                      activeOpacity={0.8}
                      style={styles.selectedDayPill}
                      onPress={() => handleRemoveSelected(day)}
                    >
                      <Text style={styles.selectedDayText}>{day}</Text>
                      <CircleRemoveIcon size={24} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* ── Select Operating Day Section (Frame 1000006623) ── */}
            <View style={styles.optionsSection}>
              {showSelectedSection && (
                <Text style={styles.optionsSectionTitle}>Select Operating Day</Text>
              )}

              <View style={styles.optionsGrid}>
                {ORDERED_DAYS.map((day) => {
                  const active = isDaySelected(day);
                  return (
                    <TouchableOpacity
                      key={day}
                      activeOpacity={0.8}
                      style={[
                        styles.optionPill,
                        active ? styles.optionPillActive : styles.optionPillInactive,
                      ]}
                      onPress={() => handleToggleDay(day)}
                    >
                      <Text style={styles.optionText}>{day}</Text>
                      {active ? (
                        <SelectedCheckmarkCircle size={24} />
                      ) : (
                        <UnselectedRadioCircle size={24} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* ── Bottom Confirm Action Button (358x48px, radius 24px) ── */}
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={!hasSelections}
              style={[
                styles.confirmButton,
                hasSelections ? styles.confirmButtonActive : styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirmPress}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  hasSelections
                    ? styles.confirmButtonTextActive
                    : styles.confirmButtonTextDisabled,
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

export default OperatingDaysBottomSheet;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },

  /* Header (filter header: height: 62px, borderBottom: 1px rgba(235, 235, 245, 0.96)) */
  filterHeader: {
    width: '100%',
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
  },
  headerTitleWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 40,
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#000000',
    includeFontPadding: false,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Scroll Area */
  scrollArea: {
    flexGrow: 0,
    maxHeight: 620,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },

  /* Subtitle (16px, 400, line-height 24px, color rgba(96, 96, 102, 0.96)) */
  subtitleText: {
    width: '100%',
    maxWidth: 358,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    marginBottom: 40,
    includeFontPadding: false,
  },

  /* Selected Option Section (current work day: gap: 24px, marginBottom: 40px) */
  selectedSection: {
    width: '100%',
    maxWidth: 358,
    gap: 24,
    marginBottom: 40,
  },
  selectedSectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  selectedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    rowGap: 16,
    columnGap: 24,
  },
  selectedDayPill: {
    width: 167,
    height: 48.25,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  selectedDayText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },

  /* Select Operating Day Section (Frame 1000006623) */
  optionsSection: {
    width: '100%',
    maxWidth: 358,
    gap: 24,
  },
  optionsSectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    includeFontPadding: false,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    rowGap: 16,
    columnGap: 24,
  },
  optionPill: {
    width: 167,
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  optionPillInactive: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(192, 192, 204, 0.96)',
  },
  optionPillActive: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  optionText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
    includeFontPadding: false,
  },

  /* Bottom Confirm Button (Filled action Button: 358x48, radius 24) */
  bottomButtonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  confirmButton: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  confirmButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    shadowColor: 'rgba(133, 139, 148, 0.04)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  confirmButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    includeFontPadding: false,
  },
  confirmButtonTextActive: {
    color: '#FFFFFF',
  },
  confirmButtonTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
});
