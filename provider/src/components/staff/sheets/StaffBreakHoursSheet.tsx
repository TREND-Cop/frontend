import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { TimeSegmentInput, TimeSegmentValue } from '../../TimeSegmentInput';
import { parseTimeString } from '../../../utils/staffFormatters';
import { triggerLightHaptic } from '../../../utils/haptics';
import { useSingleFlight } from '../../../utils/safeNavigation';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

export interface StaffBreakHoursSheetProps {
  visible: boolean;
  currentBreakHours?: { start: string; end: string } | null;
  onApply: (breakHours: { start: string; end: string } | null) => void;
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

function formatTimeSegment(val: TimeSegmentValue | null): string {
  if (!val || val.hour === null) return '';
  const m = val.minute === null ? '00' : val.minute < 10 ? `0${val.minute}` : `${val.minute}`;
  const p = val.period || 'am';
  return `${val.hour}:${m}${p}`;
}

/**
 * 1:1 Figma Break Hours Edit Sheet (Frame E5)
 *
 * Implements:
 * - Two labelled fields: "Break Start" and "Break End" side-by-side
 * - Each uses TimeSegmentInput with red ✕ (clearable)
 * - Helper: "What time does this staff go for break and return?"
 * - Bottom button: "Apply changes"
 * - Validity rules:
 *   - Valid when both times are set OR both are cleared (clearing both removes break)
 *   - One set and one empty is invalid
 *   - Disabled when unchanged from stored value
 */
export const StaffBreakHoursSheet: React.FC<StaffBreakHoursSheetProps> = ({
  visible,
  currentBreakHours,
  onApply,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Keyboard height handling
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

  // Working copy initialized from store on open
  const [breakStart, setBreakStart] = useState<TimeSegmentValue | null>(null);
  const [breakEnd, setBreakEnd] = useState<TimeSegmentValue | null>(null);

  useEffect(() => {
    if (visible) {
      if (currentBreakHours?.start) {
        setBreakStart(parseTimeString(currentBreakHours.start));
      } else {
        setBreakStart(null);
      }
      if (currentBreakHours?.end) {
        setBreakEnd(parseTimeString(currentBreakHours.end));
      } else {
        setBreakEnd(null);
      }
    } else {
      setKeyboardHeight(0);
    }
  }, [visible, currentBreakHours]);

  const startStr = useMemo(() => formatTimeSegment(breakStart), [breakStart]);
  const endStr = useMemo(() => formatTimeSegment(breakEnd), [breakEnd]);

  const hasStart = breakStart?.hour !== null && breakStart?.hour !== undefined;
  const hasEnd = breakEnd?.hour !== null && breakEnd?.hour !== undefined;

  // Both set OR both cleared is valid
  const isValid = (hasStart && hasEnd) || (!hasStart && !hasEnd);

  const isChanged = useMemo(() => {
    const origStart = currentBreakHours?.start?.toLowerCase().replace(/\s/g, '') || '';
    const origEnd = currentBreakHours?.end?.toLowerCase().replace(/\s/g, '') || '';
    const newStart = startStr.toLowerCase().replace(/\s/g, '');
    const newEnd = endStr.toLowerCase().replace(/\s/g, '');
    return newStart !== origStart || newEnd !== origEnd;
  }, [currentBreakHours, startStr, endStr]);

  const canApply = isValid && isChanged;

  const handleApply = useSingleFlight(() => {
    if (!visible || !canApply) return;
    triggerLightHaptic();
    Keyboard.dismiss();
    if (hasStart && hasEnd) {
      onApply({
        start: startStr,
        end: endStr,
      });
    } else {
      // Both cleared -> removes break time
      onApply(null);
    }
  });

  const handleClose = useSingleFlight(() => {
    if (!visible) return;
    triggerLightHaptic();
    Keyboard.dismiss();
    onClose();
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View
        style={[
          styles.backdropOverlay,
          keyboardHeight > 0 ? { paddingBottom: keyboardHeight } : null,
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
          accessibilityLabel="Dismiss break hours sheet"
        />

        {/* ── Sheet Container ── */}
        <View
          style={[
            styles.sheetContainer,
            keyboardHeight > 0
              ? {
                  maxHeight: Dimensions.get('window').height - keyboardHeight - (insets.top || 20),
                }
              : null,
            { paddingBottom: keyboardHeight > 0 ? 8 : insets.bottom + 16 },
          ]}
        >
          {/* ── Header (62px) ── */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Break Hours</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.closeButton}
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close break hours sheet"
            >
              <CloseIcon size={24} />
            </TouchableOpacity>
          </View>

          {/* ── Body ── */}
          <View style={styles.body}>
            {/* Two Columns Row */}
            <View style={styles.inputsRow}>
              {/* Break Start */}
              <View style={styles.columnItem}>
                <Text style={styles.inputLabel}>Break Start</Text>
                <TimeSegmentInput
                  label="Break Start"
                  placeholder="0:00 am"
                  value={breakStart}
                  onChange={setBreakStart}
                  clearable
                />
              </View>

              {/* Break End */}
              <View style={styles.columnItem}>
                <Text style={styles.inputLabel}>Break End</Text>
                <TimeSegmentInput
                  label="Break End"
                  placeholder="0:00 pm"
                  value={breakEnd}
                  onChange={setBreakEnd}
                  clearable
                />
              </View>
            </View>

            {/* Helper Text */}
            <Text style={styles.helperText}>
              What time does this staff go for break and return?
            </Text>

            {/* Apply changes Button */}
            <TouchableOpacity
              activeOpacity={canApply ? 0.85 : 1}
              style={[
                styles.actionButton,
                canApply ? styles.actionButtonActive : styles.actionButtonDisabled,
              ]}
              onPress={handleApply}
              accessibilityRole="button"
              accessibilityLabel="Apply changes"
              accessibilityState={{ disabled: !canApply }}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  canApply ? styles.actionTextActive : styles.actionTextDisabled,
                ]}
              >
                Apply changes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default StaffBreakHoursSheet;

const styles = StyleSheet.create({
  backdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingLeft: 40,
  },
  headerTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#000000',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  columnItem: {
    flex: 1,
  },
  inputLabel: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    marginBottom: 8,
  },
  helperText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    marginBottom: 32,
  },
  actionButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  actionButtonDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  actionButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  actionTextActive: {
    color: '#FFFFFF',
  },
  actionTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
});
