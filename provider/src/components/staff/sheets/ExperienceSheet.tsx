import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { triggerLightHaptic } from '../../../utils/haptics';

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
    { years: 3, label: '3 Years', isFaint: true },
    { years: 2, label: '2 Years' },
  ],
];

export const ALL_PRESET_YEARS: number[] = [5, 7, 6, 1, 3, 2];

export interface ExperienceSheetProps {
  visible: boolean;
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
 * 1:1 Figma Work Experience Bottom Sheet (CSS Spec: "work experience", height: 636px)
 *
 * Measurements from CSS:
 * - Sheet: width 390px, minHeight 636px, radius 24px 24px 0 0
 * - Header: height 64px, title "Work Experience" (16px SF Pro 400), close button 40x40 at right 16px
 * - Line 64 divider: borderBottom 1px solid rgba(235, 235, 245, 0.96)
 * - Question: "What level of experience does this staff have?" (16px SF Pro 400, line-height 24px, color rgba(96, 96, 102, 0.96))
 * - Dates grid: 360px wide, height 214.5px, 3 rows x 2 cols
 * - Chips: 168x48px, radius 24px, padding 8px 16px, colGap 24px, rowGap 31.5px
 * - Custom input field: height 57px, borderBottom 1px solid rgba(235, 235, 245, 0.96), placeholder "Enter custom work experience"
 * - Action button footer: height 80px, padding 16px, 358x48px Confirm button
 */
export const ExperienceSheet: React.FC<ExperienceSheetProps> = ({
  visible,
  currentYears,
  onConfirm,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customText, setCustomText] = useState<string>('');

  useEffect(() => {
    if (!visible) return;

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
    // Only allow digits and one decimal dot
    const cleaned = text.replace(/[^0-9.]/g, '');
    setCustomText(cleaned);
    if (cleaned.length > 0) {
      setSelectedPreset(null);
    }
  };

  // Determine active value
  const parsedCustom = parseFloat(customText);
  const isCustomValid = !isNaN(parsedCustom) && parsedCustom > 0;
  const isComplete = selectedPreset !== null || isCustomValid;

  const handleConfirmPress = () => {
    if (!isComplete) return;

    triggerLightHaptic();
    const finalValue = selectedPreset !== null ? selectedPreset : parsedCustom;
    onConfirm(finalValue);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.sheetContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {/* ── 1. Header (64px, CSS Spec Line 65) ── */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Work Experience</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.closeButton}
              onPress={onClose}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Close work experience sheet"
            >
              <CloseIcon size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── 2. Body Container (width: 360, gap: 24, CSS Spec) ── */}
            <View style={styles.bodyContainer}>
              {/* Question: What level of experience does this staff have? */}
              <Text style={styles.questionText}>
                What level of experience does this staff have?
              </Text>

              {/* ── 3. Dates Grid (360x214.5px, colGap: 24, rowGap: 31.5) ── */}
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
            </View>

            {/* ── 4. Custom Input Field (height: 57px, CSS Spec) ── */}
            <View style={styles.customInputField}>
              <TextInput
                style={styles.customTextInput}
                placeholder="Enter custom work experience"
                placeholderTextColor="rgba(96, 96, 102, 0.96)"
                keyboardType="decimal-pad"
                value={customText}
                onChangeText={handleCustomChange}
                accessible
                accessibilityLabel="Enter custom work experience"
              />

              {isCustomValid && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.inlineConfirmButton}
                  onPress={handleConfirmPress}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Confirm custom experience input"
                >
                  <InlineCheckIcon size={20} />
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          {/* ── 5. Action Button (height: 80px, CSS Spec) ── */}
          <View style={styles.actionButtonContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.confirmButton,
                isComplete ? styles.confirmButtonActive : styles.confirmButtonDisabled,
              ]}
              disabled={!isComplete}
              onPress={handleConfirmPress}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Confirm experience"
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  isComplete ? styles.confirmTextActive : styles.confirmTextDisabled,
                ]}
              >
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    paddingTop: 40,
    paddingBottom: 24,
    alignItems: 'center',
  },
  bodyContainer: {
    width: 360,
    gap: 24,
  },
  questionText: {
    width: 360,
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  datesGrid: {
    width: 360,
    gap: 31.5,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 360,
  },
  chip: {
    width: 168,
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
    borderColor: 'rgba(192, 192, 204, 0.96)',
  },
  chipFaint: {
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
  },
  chipSelected: {
    borderWidth: 1,
    borderColor: 'rgba(0, 8, 20, 0.96)',
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
  chipTextFaint: {
    color: 'rgba(235, 235, 245, 0.96)',
  },
  chipTextSelected: {
    color: '#000000',
    fontFamily: FONT_MEDIUM,
  },
  customInputField: {
    width: '100%',
    height: 57,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 40,
  },
  customTextInput: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
    paddingVertical: 0,
  },
  inlineConfirmButton: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
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
    elevation: 4,
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
