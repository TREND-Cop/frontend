import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { triggerLightHaptic } from '../../utils/haptics';

export interface ServiceDurationSheetProps {
  visible: boolean;
  selectedDuration?: string; // Formatted value like "1 hr", "1:30 hr", "40 min"
  onSelectDuration: (formattedDisplay: string, rawDurationStr: string) => void;
  onClose: () => void;
}

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

const ITEM_HEIGHT = 40;
const WHEEL_HEIGHT = 160;

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const SECONDS = Array.from({ length: 60 }, (_, i) => i);

// ── Duration Formatters ───────────────────────────────────────────────────────
export function formatDurationForField(h: number, m: number, s: number): string {
  if (h > 0 && m === 0) return `${h} hr`;
  if (h === 0 && m > 0) return `${m} min`;
  if (h > 0 && m > 0) return `${h}:${m < 10 ? '0' + m : m} hr`;
  if (s > 0) return `${s} sec`;
  return '0 min';
}

export function formatDurationRaw(h: number, m: number, s: number): string {
  const hh = h < 10 ? `0${h}` : `${h}`;
  const mm = m < 10 ? `0${m}` : `${m}`;
  const ss = s < 10 ? `0${s}` : `${s}`;
  const unit = h > 0 ? 'Hrs' : 'Min';
  return `${hh}:${mm}:${ss} ${unit}`;
}

// ── Icons ─────────────────────────────────────────────────────────────────────
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

function RadioCheckIcon({ isSelected }: { isSelected: boolean }) {
  if (isSelected) {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill="#0C790C" />
        <Path
          d="M8 12l2.83 2.83L16.5 9.17"
          stroke="#FFFFFF"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9.25" stroke="rgba(192, 192, 204, 0.96)" strokeWidth={1.5} />
    </Svg>
  );
}

// ── Wheel Column Component ────────────────────────────────────────────────────
function DurationWheelColumn<T extends number>({
  items,
  value,
  onValueChange,
  formatItem,
  width = 48,
}: {
  items: T[];
  value: T;
  onValueChange: (val: T) => void;
  formatItem?: (val: T) => string;
  width?: number;
}) {
  const scrollViewRef = useRef<ScrollView>(null);
  const isProgrammaticScroll = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCommittedItem = useRef<T>(value);

  // Mount/value sync
  useEffect(() => {
    const idx = items.indexOf(value);
    if (idx >= 0) {
      scrollViewRef.current?.scrollTo({
        y: idx * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, []);

  const handleItemPress = (item: T, index: number) => {
    isProgrammaticScroll.current = true;
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);

    scrollViewRef.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated: true,
    });
    lastCommittedItem.current = item;
    onValueChange(item);

    scrollTimerRef.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 280);
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isProgrammaticScroll.current) return;
    const offsetY = e.nativeEvent.contentOffset.y;
    const rawIdx = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIdx = Math.max(0, Math.min(items.length - 1, rawIdx));
    const currentItem = items[clampedIdx];

    if (currentItem !== undefined && currentItem !== lastCommittedItem.current) {
      lastCommittedItem.current = currentItem;
      onValueChange(currentItem);
    }

    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      if (!isProgrammaticScroll.current) {
        scrollViewRef.current?.scrollTo({
          y: clampedIdx * ITEM_HEIGHT,
          animated: true,
        });
      }
    }, 45);
  };

  return (
    <View style={[styles.wheelColumnContainer, { width }]}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingVertical: (WHEEL_HEIGHT - ITEM_HEIGHT) / 2,
        }}
      >
        {items.map((item, index) => {
          const isSelected = item === value;
          const display = formatItem ? formatItem(item) : item.toString();
          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              style={[styles.wheelItem, { height: ITEM_HEIGHT }]}
              onPress={() => handleItemPress(item, index)}
            >
              <Text
                style={[
                  styles.wheelItemText,
                  isSelected ? styles.wheelItemTextSelected : styles.wheelItemTextInactive,
                ]}
              >
                {display}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ── Presets List ──────────────────────────────────────────────────────────────
const PRESETS = [
  { id: '1_00_00', label: '1:00:00 Hrs', display: '1 hr', h: 1, m: 0, s: 0 },
  { id: '0_40_00', label: '0:40:00 Min', display: '40 min', h: 0, m: 40, s: 0 },
  { id: '1_30_00', label: '1:30:00 Hrs', display: '1:30 hr', h: 1, m: 30, s: 0 }, // Corrected typo from "1:30:00 Min"
];

/**
 * 1:1 Figma ServiceDurationSheet
 *
 * Implements:
 * 1. Preset Duration Sheet:
 *    - Header: "Service Duration" (height: 61px)
 *    - Preset rows: 1:00:00 Hrs, 0:40:00 Min, 1:30:00 Hrs
 *    - Last row: "Enter custom duration" (corrected typo from "Enter Custom operating Hours")
 * 2. Custom Duration Wheel Sheet (When "Enter custom duration" is tapped):
 *    - Header: "Service Duration"
 *    - 3 Columns: Hours (0–23), Minutes (00–59), Seconds (00–59)
 *    - Highlighted row with Unit label ("Hrs" when h > 0, "Min" otherwise)
 *    - Summary line: "1:30:00 Hrs"
 *    - Dark "Set" button (width: 358px, height: 48px, background: #000814)
 */
export const ServiceDurationSheet: React.FC<ServiceDurationSheetProps> = ({
  visible,
  selectedDuration,
  onSelectDuration,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Custom wheel state
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(30);
  const [seconds, setSeconds] = useState(0);

  // Parse existing duration to wheel state on open
  useEffect(() => {
    if (visible) {
      setIsCustomMode(false);
      if (selectedDuration === '1 hr') {
        setHours(1);
        setMinutes(0);
        setSeconds(0);
      } else if (selectedDuration === '40 min') {
        setHours(0);
        setMinutes(40);
        setSeconds(0);
      } else if (selectedDuration === '1:30 hr') {
        setHours(1);
        setMinutes(30);
        setSeconds(0);
      }
    }
  }, [visible, selectedDuration]);

  const handleSelectPreset = (display: string, raw: string) => {
    triggerLightHaptic();
    onSelectDuration(display, raw);
    onClose();
  };

  const handleSetCustom = () => {
    triggerLightHaptic();
    const display = formatDurationForField(hours, minutes, seconds);
    const raw = formatDurationRaw(hours, minutes, seconds);
    onSelectDuration(display, raw);
    onClose();
  };

  const handleClose = () => {
    triggerLightHaptic();
    setIsCustomMode(false);
    onClose();
  };

  const customSummary = useMemo(() => {
    return formatDurationRaw(hours, minutes, seconds);
  }, [hours, minutes, seconds]);

  const activeUnit = hours > 0 ? 'Hrs' : 'Min';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View
          style={[
            styles.sheetContainer,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.headerLeftSpacer} />
            <Text style={styles.headerTitle}>Service Duration</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleClose}
              style={styles.closeButton}
              accessibilityLabel="Close duration sheet"
            >
              <CloseIcon size={24} />
            </TouchableOpacity>
          </View>

          {!isCustomMode ? (
            /* ── Mode 1: Presets Sheet ── */
            <View style={styles.presetsContainer}>
              {PRESETS.map((preset) => {
                const isSelected = selectedDuration === preset.display;
                return (
                  <TouchableOpacity
                    key={preset.id}
                    activeOpacity={0.7}
                    style={styles.presetRow}
                    onPress={() => handleSelectPreset(preset.display, preset.label)}
                  >
                    <View style={styles.presetTextRow}>
                      <Text style={styles.presetTimeText}>{preset.label.split(' ')[0]}</Text>
                      <Text style={styles.presetUnitText}>{preset.label.split(' ')[1]}</Text>
                    </View>
                    <RadioCheckIcon isSelected={isSelected} />
                  </TouchableOpacity>
                );
              })}

              {/* Enter custom duration row */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.customActionRow}
                onPress={() => {
                  triggerLightHaptic();
                  setIsCustomMode(true);
                }}
              >
                <Text style={styles.customActionText}>Enter custom duration</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ── Mode 2: Custom Duration Wheel Sheet ── */
            <View style={styles.wheelContainer}>
              {/* Wheel Viewport */}
              <View style={styles.wheelViewport}>
                {/* Highlighted Row Pill (width: 356px, height: 40px, radius 24px) */}
                <View style={styles.highlightPill} pointerEvents="none" />

                {/* 3 Columns */}
                <View style={styles.columnsRow}>
                  {/* Hours */}
                  <DurationWheelColumn
                    items={HOURS}
                    value={hours}
                    onValueChange={setHours}
                    formatItem={(val) => val.toString()}
                    width={48}
                  />

                  {/* Minutes */}
                  <DurationWheelColumn
                    items={MINUTES}
                    value={minutes}
                    onValueChange={setMinutes}
                    formatItem={(val) => (val < 10 ? `0${val}` : val.toString())}
                    width={48}
                  />

                  {/* Seconds */}
                  <DurationWheelColumn
                    items={SECONDS}
                    value={seconds}
                    onValueChange={setSeconds}
                    formatItem={(val) => (val < 10 ? `0${val}` : val.toString())}
                    width={48}
                  />
                </View>

                {/* Unit label placed on highlighted row */}
                <View style={styles.unitPillContainer} pointerEvents="none">
                  <Text style={styles.unitPillText}>{activeUnit}</Text>
                </View>
              </View>

              {/* Summary Line under wheel (borderTop 1px solid rgba(235, 235, 245, 0.96)) */}
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryText}>{customSummary}</Text>
              </View>

              {/* Set Button (358x48px, background #000814, radius 24px) */}
              <View style={styles.setButtonContainer}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.setButton}
                  onPress={handleSetCustom}
                >
                  <Text style={styles.setButtonText}>Set</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ServiceDurationSheet;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    width: '100%',
    height: 61,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  headerLeftSpacer: {
    width: 40,
  },
  headerTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    textAlign: 'center',
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

  /* ── Presets Styling ── */
  presetsContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  presetRow: {
    width: '100%',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
  },
  presetTextRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  presetTimeText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
    includeFontPadding: false,
  },
  presetUnitText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  customActionRow: {
    width: '100%',
    height: 57,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
  },
  customActionText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  /* ── Custom Wheel Styling ── */
  wheelContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingTop: 8,
  },
  wheelViewport: {
    width: '100%',
    height: WHEEL_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  highlightPill: {
    position: 'absolute',
    width: '92%',
    maxWidth: 356,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(229, 229, 229, 0.8)',
    borderRadius: 24,
    alignSelf: 'center',
  },
  columnsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    width: '100%',
  },
  wheelColumnContainer: {
    height: WHEEL_HEIGHT,
    overflow: 'hidden',
  },
  wheelItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelItemText: {
    fontFamily: FONT_REGULAR,
    includeFontPadding: false,
    textAlign: 'center',
  },
  wheelItemTextSelected: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    color: '#000000',
  },
  wheelItemTextInactive: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  unitPillContainer: {
    position: 'absolute',
    right: 28,
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitPillText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 24,
    color: '#000000',
    includeFontPadding: false,
  },

  /* Summary Line */
  summaryContainer: {
    width: '100%',
    height: 57,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  summaryText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },

  /* Set Button */
  setButtonContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  setButton: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  setButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});
