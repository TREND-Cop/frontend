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

export interface StaffWorkHoursSheetProps {
  visible: boolean;
  currentWorkHours?: { start: string; end: string } | null;
  onApply: (workHours: { start: string; end: string }) => void;
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
 * 1:1 Figma Work Hours Edit Sheet (Frame E1)
 *
 * Implements:
 * - Two labelled fields: "Opening Hours" and "Closing Hours" side-by-side
 * - Each uses TimeSegmentInput with red ✕ (clearable)
 * - Helper: "What time does this staff resume and close from work"
 * - Bottom button: "Apply changes" (grey disabled when unchanged or invalid; dark enabled when changed & valid)
 * - Valid when both times are set
 */
export const StaffWorkHoursSheet: React.FC<StaffWorkHoursSheetProps> = ({
  visible,
  currentWorkHours,
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
  const [openingTime, setOpeningTime] = useState<TimeSegmentValue | null>(null);
  const [closingTime, setClosingTime] = useState<TimeSegmentValue | null>(null);

  useEffect(() => {
    if (visible) {
      if (currentWorkHours?.start) {
        setOpeningTime(parseTimeString(currentWorkHours.start));
      } else {
        setOpeningTime(null);
      }
      if (currentWorkHours?.end) {
        setClosingTime(parseTimeString(currentWorkHours.end));
      } else {
        setClosingTime(null);
      }
    } else {
      setKeyboardHeight(0);
    }
  }, [visible, currentWorkHours]);

  const openingStr = useMemo(() => formatTimeSegment(openingTime), [openingTime]);
  const closingStr = useMemo(() => formatTimeSegment(closingTime), [closingTime]);

  const isValid = useMemo(() => {
    return openingTime?.hour !== null && openingTime?.hour !== undefined &&
           closingTime?.hour !== null && closingTime?.hour !== undefined;
  }, [openingTime, closingTime]);

  const isChanged = useMemo(() => {
    const origStart = currentWorkHours?.start?.toLowerCase().replace(/\s/g, '') || '';
    const origEnd = currentWorkHours?.end?.toLowerCase().replace(/\s/g, '') || '';
    const newStart = openingStr.toLowerCase().replace(/\s/g, '');
    const newEnd = closingStr.toLowerCase().replace(/\s/g, '');
    return newStart !== origStart || newEnd !== origEnd;
  }, [currentWorkHours, openingStr, closingStr]);

  const canApply = isValid && isChanged;

  const handleApply = useSingleFlight(() => {
    if (!visible || !canApply) return;
    triggerLightHaptic();
    Keyboard.dismiss();
    onApply({
      start: openingStr,
      end: closingStr,
    });
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
          accessibilityLabel="Dismiss work hours sheet"
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
              <Text style={styles.headerTitle}>Work Hours</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.closeButton}
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close work hours sheet"
            >
              <CloseIcon size={24} />
            </TouchableOpacity>
          </View>

          {/* ── Body ── */}
          <View style={styles.body}>
            {/* Two Columns Row */}
            <View style={styles.inputsRow}>
              {/* Opening Hours */}
              <View style={styles.columnItem}>
                <Text style={styles.inputLabel}>Opening Hours</Text>
                <TimeSegmentInput
                  label="Opening Hours"
                  placeholder="0:00 am"
                  value={openingTime}
                  onChange={setOpeningTime}
                  clearable
                />
              </View>

              {/* Closing Hours */}
              <View style={styles.columnItem}>
                <Text style={styles.inputLabel}>Closing Hours</Text>
                <TimeSegmentInput
                  label="Closing Hours"
                  placeholder="0:00 pm"
                  value={closingTime}
                  onChange={setClosingTime}
                  clearable
                />
              </View>
            </View>

            {/* Helper Text */}
            <Text style={styles.helperText}>
              What time does this staff resume and close from work
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

export default StaffWorkHoursSheet;

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
