import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { colors, fontFamilies } from '../constants/theme';

export interface TimeValue {
  hour: number;
  minute: number;
  period: 'am' | 'pm';
}

export interface OperatingHoursWheelSheetProps {
  visible: boolean;
  initialOpenTime?: TimeValue | null;
  initialClosedTime?: TimeValue | null;
  initialTab?: 'open' | 'closed';
  onConfirm: (rangeFormatted: string) => void;
  onClose: () => void;
}

interface State {
  open: TimeValue | null;
  closed: TimeValue | null;
  activeTab: 'open' | 'closed';
}

const ITEM_HEIGHT = 44;
const CONTAINER_HEIGHT = 176;
const CENTER_OFFSET = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2; // 66px

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS: Array<'am' | 'pm'> = ['am', 'pm'];

const NEUTRAL_OPEN: TimeValue = { hour: 8, minute: 0, period: 'am' };
const NEUTRAL_CLOSED: TimeValue = { hour: 8, minute: 0, period: 'pm' };

/**
 * Wheel column with real-time responsive sliding and zero-delay tap handling
 */
function WheelColumn<T extends string | number>({
  items,
  value,
  hasValue,
  onValueChange,
  formatItem,
  width = 64,
  activeTabKey,
}: {
  items: T[];
  value: T;
  hasValue: boolean;
  onValueChange: (val: T) => void;
  formatItem?: (val: T) => string;
  width?: number;
  activeTabKey: string;
}) {
  const scrollViewRef = useRef<ScrollView>(null);
  const isProgrammaticScroll = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCommittedItem = useRef<T>(value);

  const currentIndex = items.indexOf(value);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;

  // Track latest value in ref
  useEffect(() => {
    lastCommittedItem.current = value;
  }, [value]);

  // Sync scroll position whenever activeTab changes
  useEffect(() => {
    const targetIdx = items.indexOf(value);
    const idx = targetIdx >= 0 ? targetIdx : 0;
    const t = setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: idx * ITEM_HEIGHT,
        animated: false,
      });
    }, 10);
    return () => clearTimeout(t);
  }, [activeTabKey]);

  // Immediate smooth slide when tapping any number
  const handleItemPress = (item: T, index: number) => {
    isProgrammaticScroll.current = true;
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }
    // 1. Instantly trigger smooth slide animation on UI thread
    scrollViewRef.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated: true,
    });
    // 2. Commit the active value immediately
    lastCommittedItem.current = item;
    onValueChange(item);

    // 3. Clear programmatic lock once the slide completes
    scrollTimerRef.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 280);
  };

  // Real-time tracking as numbers slide past the center line
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isProgrammaticScroll.current) return;
    const offsetY = e.nativeEvent.contentOffset.y;
    const rawIdx = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIdx = Math.max(0, Math.min(items.length - 1, rawIdx));
    const currentItem = items[clampedIdx];

    // Real-time update while scrolling
    if (currentItem !== undefined && currentItem !== lastCommittedItem.current) {
      lastCommittedItem.current = currentItem;
      onValueChange(currentItem);
    }

    // Auto-settle fallback for web/momentum to guarantee pixel-perfect snapping
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }
    scrollTimerRef.current = setTimeout(() => {
      if (!isProgrammaticScroll.current) {
        scrollViewRef.current?.scrollTo({
          y: clampedIdx * ITEM_HEIGHT,
          animated: true,
        });
      }
    }, 45);
  };

  const handleScrollEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isProgrammaticScroll.current) return;
    const offsetY = e.nativeEvent.contentOffset.y;
    const rawIdx = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIdx = Math.max(0, Math.min(items.length - 1, rawIdx));
    const currentItem = items[clampedIdx];
    if (currentItem !== undefined) {
      lastCommittedItem.current = currentItem;
      onValueChange(currentItem);
    }
  };

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = null;
    }
    if (isProgrammaticScroll.current) return;
    const offsetY = e.nativeEvent.contentOffset.y;
    const rawIdx = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIdx = Math.max(0, Math.min(items.length - 1, rawIdx));
    const currentItem = items[clampedIdx];
    if (currentItem !== undefined) {
      lastCommittedItem.current = currentItem;
      onValueChange(currentItem);
      scrollViewRef.current?.scrollTo({
        y: clampedIdx * ITEM_HEIGHT,
        animated: true,
      });
    }
  };

  return (
    <View style={[styles.wheelColumnContainer, { width }]}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentOffset={{ x: 0, y: safeIndex * ITEM_HEIGHT }}
        contentContainerStyle={{
          paddingTop: CENTER_OFFSET,
          paddingBottom: CENTER_OFFSET,
        }}
      >
        {items.map((item, index) => {
          const isSelected = hasValue && item === value;
          const display = formatItem ? formatItem(item) : String(item);
          return (
            <Pressable
              key={String(item)}
              onPress={() => handleItemPress(item, index)}
              style={styles.wheelItem}
              hitSlop={{ top: 2, bottom: 2, left: 6, right: 6 }}
            >
              <Text
                style={[
                  styles.wheelItemText,
                  isSelected ? styles.wheelItemTextSelected : styles.wheelItemTextFaded,
                ]}
              >
                {display}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export const OperatingHoursWheelSheet: React.FC<OperatingHoursWheelSheetProps> = ({
  visible,
  initialOpenTime,
  initialClosedTime,
  initialTab = 'open',
  onConfirm,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  // Single source of truth state
  const [state, setState] = useState<State>({
    open: initialOpenTime ?? null,
    closed: initialClosedTime ?? null,
    activeTab: initialTab,
  });

  // Re-sync with incoming initial props whenever the sheet opens
  useEffect(() => {
    if (visible) {
      setState({
        open: initialOpenTime ?? null,
        closed: initialClosedTime ?? null,
        activeTab: initialTab,
      });
    }
  }, [visible, initialOpenTime, initialClosedTime, initialTab]);

  const activeTime = state[state.activeTab];
  const hasActiveValue = activeTime !== null;
  const neutralTime = state.activeTab === 'open' ? NEUTRAL_OPEN : NEUTRAL_CLOSED;
  const displayTime = activeTime ?? neutralTime;

  const updateActiveField = useCallback(
    <K extends keyof TimeValue>(field: K, val: TimeValue[K]) => {
      setState((prev) => {
        const current =
          prev[prev.activeTab] ??
          (prev.activeTab === 'open' ? { ...NEUTRAL_OPEN } : { ...NEUTRAL_CLOSED });
        return {
          ...prev,
          [prev.activeTab]: {
            ...current,
            [field]: val,
          },
        };
      });
    },
    []
  );

  const formatTime = (t: TimeValue) => {
    const minStr = t.minute < 10 ? `0${t.minute}` : `${t.minute}`;
    return `${t.hour}:${minStr}${t.period}`;
  };

  const isConfirmEnabled = state.open !== null && state.closed !== null;

  const handleConfirmPress = () => {
    if (!isConfirmEnabled || !state.open || !state.closed) return;
    const formattedRange = `${formatTime(state.open)} - ${formatTime(state.closed)}`;
    onConfirm(formattedRange);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.sheetContainer,
            {
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          {/* ── Drag Handle (44px x 5px) ── */}
          <View style={styles.dragBarContainer}>
            <View style={styles.dragBar} />
          </View>

          {/* ── Segmented Tab Header (Open Hours / Closed Hours) ── */}
          <View style={styles.tabContainer}>
            <View
              style={[
                styles.tabPill,
                state.activeTab === 'open' ? styles.tabPillLeft : styles.tabPillRight,
              ]}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.tabButton}
              onPress={() => setState((prev) => ({ ...prev, activeTab: 'open' }))}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  state.activeTab === 'open' ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                Open Hours
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.tabButton}
              onPress={() => setState((prev) => ({ ...prev, activeTab: 'closed' }))}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  state.activeTab === 'closed' ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                Closed Hours
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Wheel Pickers (176px tall, persistent columns synced to active tab) ── */}
          <View style={styles.wheelWrapper}>
            {/* Center selection highlight pill (326px x 44px, radius 22px) */}
            <View style={styles.highlightPill} pointerEvents="none" />

            <View style={styles.wheelRow}>
              {/* Hours Column */}
              <WheelColumn
                items={HOURS}
                value={displayTime.hour}
                hasValue={hasActiveValue}
                onValueChange={(h) => updateActiveField('hour', h)}
                width={64}
                activeTabKey={state.activeTab}
              />
              {/* Colon */}
              <View style={styles.colonContainer}>
                <Text style={styles.timeColon}>:</Text>
              </View>
              {/* Minutes Column */}
              <WheelColumn
                items={MINUTES}
                value={displayTime.minute}
                hasValue={hasActiveValue}
                onValueChange={(m) => updateActiveField('minute', m)}
                formatItem={(m) => (m < 10 ? `0${m}` : String(m))}
                width={64}
                activeTabKey={state.activeTab}
              />
              <View style={styles.periodSpacer} />
              {/* AM/PM Column */}
              <WheelColumn
                items={PERIODS}
                value={displayTime.period}
                hasValue={hasActiveValue}
                onValueChange={(p) => updateActiveField('period', p)}
                width={72}
                activeTabKey={state.activeTab}
              />
            </View>
          </View>

          {/* ── Summary Line (Open Time – Closed Time) ── */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryTouchableRow}>
              {/* Touchable Open Time */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setState((prev) => ({ ...prev, activeTab: 'open' }))}
              >
                <Text
                  style={[
                    styles.summaryText,
                    state.activeTab === 'open' && styles.summaryTextFocused,
                    !state.open && styles.summaryTextPlaceholder,
                  ]}
                >
                  {state.open ? formatTime(state.open) : 'Set open'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.summaryDash}> – </Text>

              {/* Touchable Closed Time */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setState((prev) => ({ ...prev, activeTab: 'closed' }))}
              >
                <Text
                  style={[
                    styles.summaryText,
                    state.activeTab === 'closed' && styles.summaryTextFocused,
                    !state.closed && styles.summaryTextPlaceholder,
                  ]}
                >
                  {state.closed ? formatTime(state.closed) : 'Set closed'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Confirm Action Button (358px x 48px, radius 24px) ── */}
          <View style={styles.confirmButtonWrapper}>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={!isConfirmEnabled}
              style={[
                styles.confirmButton,
                isConfirmEnabled ? styles.confirmButtonActive : styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirmPress}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  isConfirmEnabled ? styles.confirmTextActive : styles.confirmTextDisabled,
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

export default OperatingHoursWheelSheet;

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
    backgroundColor: colors.appBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  dragBarContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  dragBar: {
    width: 44,
    height: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },

  /* Tabs (358px x 48px) */
  tabContainer: {
    height: 48,
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: colors.layerBg,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    padding: 4,
  },
  tabPill: {
    position: 'absolute',
    width: '50%',
    height: 40,
    borderRadius: 24,
    backgroundColor: colors.barberPrimary,
    top: 4,
  },
  tabPillLeft: {
    left: 4,
  },
  tabPillRight: {
    right: 4,
  },
  tabButton: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  tabButtonText: {
    fontFamily: fontFamilies.bodyMedium,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    includeFontPadding: false,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabTextInactive: {
    color: colors.barberPrimarySupport,
  },

  /* Wheel wrapper */
  wheelWrapper: {
    width: '100%',
    height: CONTAINER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    position: 'relative',
  },
  highlightPill: {
    position: 'absolute',
    width: 326,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(0, 8, 20, 0.05)',
    borderRadius: 22,
    top: CENTER_OFFSET,
    zIndex: 1,
  },
  wheelRow: {
    width: 240,
    height: CONTAINER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  wheelColumnContainer: {
    height: CONTAINER_HEIGHT,
  },
  colonContainer: {
    width: 16,
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeColon: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 22,
    fontWeight: '700',
    color: colors.barberPrimary,
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 26,
  },
  periodSpacer: {
    width: 16,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelItemText: {
    fontFamily: fontFamilies.body,
    fontSize: 20,
    lineHeight: 26,
    includeFontPadding: false,
    textAlign: 'center',
  },
  wheelItemTextSelected: {
    fontFamily: fontFamilies.bodyMedium,
    fontWeight: '700',
    fontSize: 22,
    color: colors.barberPrimary,
  },
  wheelItemTextFaded: {
    fontFamily: fontFamilies.body,
    fontWeight: '400',
    fontSize: 18,
    color: 'rgba(96, 96, 102, 0.45)',
  },

  /* Summary Row */
  summaryContainer: {
    width: '100%',
    height: 52,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EBEBF5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  summaryTouchableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: {
    fontFamily: fontFamilies.bodyMedium,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: colors.barberPrimary,
    includeFontPadding: false,
  },
  summaryTextFocused: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  summaryTextPlaceholder: {
    color: 'rgba(192, 192, 204, 0.96)',
    fontWeight: '400',
  },
  summaryDash: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 16,
    color: colors.barberPrimarySupport,
    marginHorizontal: 4,
  },

  /* Confirm Button */
  confirmButtonWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  confirmButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonActive: {
    backgroundColor: colors.barberPrimary,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.layerBg,
  },
  confirmButtonText: {
    fontFamily: fontFamilies.button,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    includeFontPadding: false,
  },
  confirmTextActive: {
    color: '#FFFFFF',
  },
  confirmTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
});
