import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { triggerLightHaptic } from '../../../utils/haptics';
import { useSingleFlight } from '../../../utils/safeNavigation';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

export interface ExperiencePresetItem {
  years: number;
  label: string;
  isFaint?: boolean;
}

/**
 * 1:1 Figma Presets Grid (CSS: dates width 360px, height 214.5px, colGap 24px, rowGap 31.5px)
 * Row 1: 5 Years, 7 Years
 * Row 2: 6 Years, 1 Year
 * Row 3: 3 Years (faint unselected), 2 Years
 */
export const EXPERIENCE_PRESET_PAIRS: Array<[ExperiencePresetItem, ExperiencePresetItem]> = [
  [
    { years: 5, label: '5 Years' },
    { years: 7, label: '7 Years' },
  ],
  [
    { years: 6, label: '6 Years' },
    { years: 1, label: '1 Year' },
  ],
  [
    { years: 3, label: '3 Years' },
    { years: 2, label: '2 Years' },
  ],
];

export const ALL_PRESET_YEARS: number[] = [5, 7, 6, 1, 3, 2];

export interface ExperienceSheetProps {
  visible: boolean;
  mode?: 'add' | 'edit';
  currentYears?: number | null;
  onConfirm: (years: number) => void;
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
function ChipCheckIcon({
  isSelected,
  isFaint,
}: {
  isSelected: boolean;
  isFaint?: boolean;
}) {
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

  const strokeColor = isFaint ? 'rgba(235, 235, 245, 0.96)' : 'rgba(192, 192, 204, 0.96)';

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

// ── Inline Checkmark Icon for Custom Input Confirmation ──
function InlineCheckIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12l5 5L19 7"
        stroke="#FFFFFF"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma Work Experience Bottom Sheet (Add mode & Edit mode Frame E3)
 */
export const ExperienceSheet: React.FC<ExperienceSheetProps> = ({
  visible,
  mode = 'add',
  currentYears,
  onConfirm,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customText, setCustomText] = useState<string>('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      if (e?.endCoordinates?.height) {
        setKeyboardHeight(e.endCoordinates.height);
      }
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      setKeyboardHeight(0);
      return;
    }

    if (currentYears !== undefined && currentYears !== null && currentYears > 0) {
      if (ALL_PRESET_YEARS.includes(currentYears)) {
        setSelectedPreset(currentYears);
        setCustomText('');
      } else {
        setSelectedPreset(null);
        setCustomText(currentYears.toString());
      }
    } else {
      setSelectedPreset(null);
      setCustomText('');
    }
  }, [visible, currentYears]);

  const handleSelectPreset = (years: number) => {
    triggerLightHaptic();
    setSelectedPreset(years);
    setCustomText('');
  };

  const handleCustomChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    setCustomText(cleaned);
    if (cleaned.length > 0) {
      setSelectedPreset(null);
    }
  };

  // Active computed value
  const parsedCustom = parseFloat(customText);
  const isCustomValid = !isNaN(parsedCustom) && parsedCustom > 0;
  const activeYears = selectedPreset !== null ? selectedPreset : (isCustomValid ? parsedCustom : null);

  const isComplete = activeYears !== null && activeYears > 0;

  const isChanged = useMemo(() => {
    if (mode !== 'edit') return true;
    return activeYears !== (currentYears ?? null);
  }, [mode, activeYears, currentYears]);

  const canConfirm = isComplete && isChanged;

  const handleConfirmPress = useSingleFlight(() => {
    if (!visible || !canConfirm) return;
    triggerLightHaptic();
    onConfirm(activeYears!);
    onClose();
  });

  const handleClearCurrent = () => {
    triggerLightHaptic();
    setSelectedPreset(null);
    setCustomText('');
  };

  const handleDismiss = useSingleFlight(() => {
    if (!visible) return;
    Keyboard.dismiss();
    onClose();
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <View
        style={[
          styles.overlay,
          keyboardHeight > 0 ? { paddingBottom: keyboardHeight } : null,
        ]}
      >
        <Pressable style={styles.backdrop} onPress={handleDismiss} />

        <View
          style={[
            styles.sheetContainer,
            keyboardHeight > 0
              ? {
                minHeight: 0,
                maxHeight: Dimensions.get('window').height - keyboardHeight - (insets.top || 20),
              }
              : null,
            { paddingBottom: keyboardHeight > 0 ? 8 : insets.bottom + 16 },
          ]}
        >
          {/* ── 1. Header (64px, CSS Spec Line 65) ── */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Experience</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.closeButton}
              onPress={handleDismiss}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Close experience sheet"
            >
              <CloseIcon size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            {/* ── 2. Edit Mode: Current Experience Section (Frame E3) ── */}
            {mode === 'edit' && (
              <View style={styles.currentSection}>
                <Text style={styles.sectionHeading}>Current Experience</Text>
                {activeYears !== null && activeYears > 0 ? (
                  <View style={styles.currentChip}>
                    <Text style={styles.currentChipText}>
                      {activeYears === 1 ? '1 Year' : `${activeYears} Years`}
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={handleClearCurrent}
                      accessibilityRole="button"
                      accessibilityLabel="Clear current experience"
                    >
                      <CircleXBadgeIcon size={24} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.noCurrentText}>No experience selected</Text>
                )}
              </View>
            )}

            {/* ── 3. Body Container (width: 360, gap: 24, CSS Spec) ── */}
            <View style={styles.bodyContainer}>
              {mode === 'edit' && (
                <Text style={styles.sectionHeading}>Select Experience</Text>
              )}

              {/* Question: What level of experience does this staff have? */}
              <Text style={styles.questionText}>
                What level of experience does this staff have?
              </Text>

              {/* ── 4. Dates Grid (360x214.5px, colGap: 24, rowGap: 31.5) ── */}
              <View style={styles.datesGrid}>
                {EXPERIENCE_PRESET_PAIRS.map(([leftItem, rightItem], rowIdx) => {
                  const isLeftSelected = selectedPreset === leftItem.years;
                  const isRightSelected = selectedPreset === rightItem.years;

                  return (
                    <View key={`row_${rowIdx}`} style={styles.gridRow}>
                      {/* Left Chip */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={[
                          styles.chip,
                          isLeftSelected
                            ? styles.chipSelected
                            : leftItem.isFaint
                              ? styles.chipFaint
                              : styles.chipUnselected,
                        ]}
                        onPress={() => handleSelectPreset(leftItem.years)}
                        accessible
                        accessibilityRole="radio"
                        accessibilityState={{ selected: isLeftSelected }}
                        accessibilityLabel={leftItem.label}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isLeftSelected
                              ? styles.chipTextSelected
                              : leftItem.isFaint
                                ? styles.chipTextFaint
                                : styles.chipTextUnselected,
                          ]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {leftItem.label}
                        </Text>
                        <ChipCheckIcon
                          isSelected={isLeftSelected}
                          isFaint={leftItem.isFaint && !isLeftSelected}
                        />
                      </TouchableOpacity>

                      {/* Right Chip */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={[
                          styles.chip,
                          isRightSelected
                            ? styles.chipSelected
                            : rightItem.isFaint
                              ? styles.chipFaint
                              : styles.chipUnselected,
                        ]}
                        onPress={() => handleSelectPreset(rightItem.years)}
                        accessible
                        accessibilityRole="radio"
                        accessibilityState={{ selected: isRightSelected }}
                        accessibilityLabel={rightItem.label}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isRightSelected
                              ? styles.chipTextSelected
                              : rightItem.isFaint
                                ? styles.chipTextFaint
                                : styles.chipTextUnselected,
                          ]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {rightItem.label}
                        </Text>
                        <ChipCheckIcon
                          isSelected={isRightSelected}
                          isFaint={rightItem.isFaint && !isRightSelected}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>

              {/* ── 5. Custom Work Experience Input ── */}
              <View style={styles.customFieldContainer}>
                <TextInput
                  style={styles.customInput}
                  placeholder="Enter custom work experience"
                  placeholderTextColor="rgba(96, 96, 102, 0.96)"
                  value={customText}
                  onChangeText={handleCustomChange}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 120);
                  }}
                  keyboardType="numeric"
                  accessible
                  accessibilityLabel="Enter custom work experience in years"
                />

                {isCustomValid && (
                  <View style={styles.confirmBadgeCircle}>
                    <InlineCheckIcon size={20} />
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* ── 6. Action Button (height: 80px, CSS Spec) ── */}
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
              accessibilityLabel="Confirm experience"
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

export default ExperienceSheet;

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
    minHeight: 636,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    paddingHorizontal: 16,
    position: 'relative',
  },
  headerTitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 12,
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  currentSection: {
    width: '100%',
    maxWidth: 358,
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
  currentChip: {
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
    width: '48%',
    minWidth: 140,
  },
  currentChipText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  noCurrentText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  bodyContainer: {
    width: '100%',
    maxWidth: 358,
    gap: 20,
  },
  questionText: {
    width: '100%',
    maxWidth: 358,
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  datesGrid: {
    width: '100%',
    gap: 16,
  },
  gridRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
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
  chipFaint: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    opacity: 0.6,
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
  chipTextFaint: {
    color: 'rgba(235, 235, 245, 0.96)',
  },
  customFieldContainer: {
    width: '100%',
    maxWidth: 358,
    height: 57,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  customInput: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
  },
  confirmBadgeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
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
