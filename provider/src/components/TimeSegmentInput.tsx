import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
  Pressable,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

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

export interface TimeSegmentValue {
  hour: number | null;
  minute: number | null;
  period: 'am' | 'pm' | null;
}

export interface TimeSegmentInputProps {
  value: TimeSegmentValue | null;
  onChange: (val: TimeSegmentValue) => void;
  placeholder?: string; // "0:00 am" or "0:00 pm"
  label: string; // "Opening Hours" or "Closing Hours"
  error?: string;
  hourAccessibilityLabel?: string;
  minuteAccessibilityLabel?: string;
  periodAccessibilityLabel?: string;
  clearable?: boolean;
  onClear?: () => void;
  onFocus?: () => void;
}

type ActiveSection = 'hour' | 'minute' | 'period' | null;

/**
 * Reusable segmented time input component for Trend Business Onboarding (Step 4).
 * Enforces typing rules: hour (0-12) -> minute (00-59) -> period (am/pm).
 * Uses a single hidden TextInput as the digit-capture point for 100% Android, iOS & Web reliability.
 */
export const TimeSegmentInput: React.FC<TimeSegmentInputProps> = ({
  value,
  onChange,
  placeholder = '0:00 am',
  label,
  error,
  hourAccessibilityLabel,
  minuteAccessibilityLabel,
  periodAccessibilityLabel,
  clearable = false,
  onClear,
  onFocus,
}) => {
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [hourBuffer, setHourBuffer] = useState<string>('');
  const [minuteBuffer, setMinuteBuffer] = useState<string>('');
  const [hiddenText, setHiddenText] = useState<string>(' ');

  const inputRef = useRef<TextInput>(null);

  const handleClear = useCallback(() => {
    setActiveSection(null);
    setHourBuffer('');
    setMinuteBuffer('');
    setHiddenText(' ');
    onChange({ hour: null, minute: null, period: null });
    onClear?.();
  }, [onChange, onClear]);

  // Derive default period from placeholder (e.g. "0:00 am" -> "am", "0:00 pm" -> "pm")
  const defaultPeriod: 'am' | 'pm' = placeholder.toLowerCase().includes('pm') ? 'pm' : 'am';

  // Check whether valid numerical values exist (strictly check against null and undefined, 0 is valid)
  const hasValidHour =
    typeof value?.hour === 'number' && !isNaN(value.hour) && value.hour >= 0 && value.hour <= 12;
  const hasValidMinute =
    typeof value?.minute === 'number' && !isNaN(value.minute) && value.minute >= 0 && value.minute <= 59;
  const hasValidPeriod =
    value?.period === 'am' || value?.period === 'pm';

  const isSet = hasValidHour;

  // Sync hidden text sentinel when section changes
  useEffect(() => {
    if (activeSection === 'hour' || activeSection === 'minute') {
      setHiddenText(' ');
    }
  }, [activeSection]);

  // Focus hidden input when switching to numeric section
  const focusInput = useCallback(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  }, []);

  // ── Section Activation ──
  const handleSelectSection = useCallback(
    (section: 'hour' | 'minute' | 'period') => {
      setActiveSection(section);
      if (section === 'hour') {
        onFocus?.();
        setHourBuffer('');
        setHiddenText(' ');
        focusInput();
      } else if (section === 'minute') {
        onFocus?.();
        setMinuteBuffer('');
        setHiddenText(' ');
        focusInput();
      } else if (section === 'period') {
        Keyboard.dismiss();
        // Tapping period toggles am <-> pm
        const currentPeriod = value?.period ?? defaultPeriod;
        const newPeriod: 'am' | 'pm' = currentPeriod === 'am' ? 'pm' : 'am';
        const currentHour = value?.hour ?? 0;
        const currentMinute = value?.minute ?? 0;
        onChange({
          hour: currentHour,
          minute: currentMinute,
          period: newPeriod,
        });
      }
    },
    [value, defaultPeriod, onChange, focusInput, onFocus]
  );

  // Pill tap handler: if empty, start at hour; if filled, activate hour
  const handlePillPress = useCallback(() => {
    if (!isSet || activeSection === null) {
      handleSelectSection('hour');
    }
  }, [isSet, activeSection, handleSelectSection]);

  // ── Normalization on Blur ──
  const handleBlur = useCallback(() => {
    if (activeSection === 'minute' && minuteBuffer.length === 1) {
      // Normalize a lone typed minute digit (e.g. '5' -> 5, rendered as '05')
      const m = parseInt(minuteBuffer, 10);
      onChange({
        hour: value?.hour ?? 0,
        minute: m,
        period: value?.period ?? defaultPeriod,
      });
    }
    setActiveSection(null);
    setHourBuffer('');
    setMinuteBuffer('');
  }, [activeSection, minuteBuffer, value, defaultPeriod, onChange]);

  // ── Typing Engine (State Machine) ──
  const processDigit = useCallback(
    (digit: string) => {
      if (activeSection === 'hour') {
        if (hourBuffer === '') {
          // First digit of hour
          if (digit === '0') {
            // First digit 0: set hour to 0 and wait for possible second digit
            setHourBuffer('0');
            const m = value?.minute ?? 0;
            const p = value?.period ?? defaultPeriod;
            onChange({ hour: 0, minute: m, period: p });
          } else if (digit >= '2' && digit <= '9') {
            // First digit 2-9 -> commit that hour immediately and move to minutes
            const h = parseInt(digit, 10);
            const m = value?.minute ?? 0;
            const p = value?.period ?? defaultPeriod;
            onChange({ hour: h, minute: m, period: p });
            setActiveSection('minute');
            setHourBuffer('');
            setMinuteBuffer('');
            setHiddenText(' ');
          } else if (digit === '1') {
            // First digit 1 -> wait for second digit (0, 1, 2)
            setHourBuffer('1');
            const m = value?.minute ?? 0;
            const p = value?.period ?? defaultPeriod;
            onChange({ hour: 1, minute: m, period: p });
          }
        } else if (hourBuffer === '0') {
          // Second digit after 0
          if (digit >= '1' && digit <= '9') {
            const h = parseInt(digit, 10);
            const m = value?.minute ?? 0;
            const p = value?.period ?? defaultPeriod;
            onChange({ hour: h, minute: m, period: p });
            setActiveSection('minute');
            setHourBuffer('');
            setMinuteBuffer('');
            setHiddenText(' ');
          }
          // 00 is rejected; stay at buffer '0'
        } else if (hourBuffer === '1') {
          // Second digit after 1
          if (digit === '0' || digit === '1' || digit === '2') {
            // Completes 10, 11, 12 and moves on
            const h = parseInt('1' + digit, 10);
            const m = value?.minute ?? 0;
            const p = value?.period ?? defaultPeriod;
            onChange({ hour: h, minute: m, period: p });
            setActiveSection('minute');
            setHourBuffer('');
            setMinuteBuffer('');
            setHiddenText(' ');
          } else if (digit >= '3' && digit <= '9') {
            // Anything else commits 1 and passes that digit to the minutes
            const h = 1;
            const p = value?.period ?? defaultPeriod;
            setActiveSection('minute');
            setHourBuffer('');
            setHiddenText(' ');

            // Pass digit to minutes rule:
            if (digit >= '6' && digit <= '9') {
              // 6-9 in minute commits 0X and moves to period
              const m = parseInt(digit, 10);
              onChange({ hour: h, minute: m, period: p });
              setActiveSection('period');
              Keyboard.dismiss();
            } else {
              // 3-5 in minute: wait for second digit
              const m = parseInt(digit, 10);
              setMinuteBuffer(digit);
              onChange({ hour: h, minute: m, period: p });
            }
          }
        }
      } else if (activeSection === 'minute') {
        if (minuteBuffer === '') {
          // First digit of minute
          if (digit >= '0' && digit <= '5') {
            // 0-5 -> wait for second digit
            setMinuteBuffer(digit);
            const m = parseInt(digit, 10);
            onChange({
              hour: value?.hour ?? 0,
              minute: m,
              period: value?.period ?? defaultPeriod,
            });
          } else if (digit >= '6' && digit <= '9') {
            // 6-9 -> commit 0X (06-09) and move to period
            const m = parseInt(digit, 10);
            onChange({
              hour: value?.hour ?? 0,
              minute: m,
              period: value?.period ?? defaultPeriod,
            });
            setActiveSection('period');
            setMinuteBuffer('');
            Keyboard.dismiss();
          }
        } else {
          // Second digit of minute completes it (00-59)
          const mStr = minuteBuffer + digit;
          const m = parseInt(mStr, 10);
          onChange({
            hour: value?.hour ?? 0,
            minute: m,
            period: value?.period ?? defaultPeriod,
          });
          setActiveSection('period');
          setMinuteBuffer('');
          Keyboard.dismiss();
        }
      }
    },
    [activeSection, hourBuffer, minuteBuffer, value, defaultPeriod, onChange]
  );

  // ── Backspace Engine ──
  const handleBackspace = useCallback(() => {
    if (activeSection === 'period') {
      // Move active section back to minute
      setActiveSection('minute');
      setMinuteBuffer('');
      setHiddenText(' ');
      focusInput();
    } else if (activeSection === 'minute') {
      if (minuteBuffer !== '') {
        // Clear minute buffer
        setMinuteBuffer('');
      } else {
        // Section is already empty: move back to hour
        setActiveSection('hour');
        setHourBuffer('');
        setHiddenText(' ');
        focusInput();
      }
    } else if (activeSection === 'hour') {
      if (hourBuffer !== '') {
        setHourBuffer('');
      } else {
        // Clearing the hour clears the whole field back to placeholder
        onChange({ hour: null, minute: null, period: null });
        setHourBuffer('');
        setMinuteBuffer('');
        setActiveSection(null);
        Keyboard.dismiss();
      }
    }
  }, [activeSection, hourBuffer, minuteBuffer, onChange, focusInput]);

  // ── Text Input Change Handler ──
  const handleChangeText = useCallback(
    (text: string) => {
      // Sentinel check: if text length decreased or sentinel deleted, it's Backspace
      if (text.length < hiddenText.length || text === '') {
        handleBackspace();
        setHiddenText(' ');
        return;
      }

      // Extract newly typed characters
      const newChars = text.replace(hiddenText, '');
      setHiddenText(' ');

      for (let i = 0; i < newChars.length; i++) {
        const char = newChars[i];
        if (/\d/.test(char)) {
          processDigit(char);
        } else if (char.toLowerCase() === 'a' || char.toLowerCase() === 'p') {
          // Hardware keyboard support for a / p
          const p: 'am' | 'pm' = char.toLowerCase() === 'p' ? 'pm' : 'am';
          if (value && value.hour !== null) {
            onChange({
              hour: value.hour,
              minute: value.minute ?? 0,
              period: p,
            });
            setActiveSection('period');
            Keyboard.dismiss();
          }
        }
      }
    },
    [hiddenText, handleBackspace, processDigit, value, onChange]
  );

  // ── Hardware Key Press (Web / iOS direct key capture) ──
  const handleKeyPress = useCallback(
    (e: any) => {
      const key = e?.nativeEvent?.key;
      if (key === 'Backspace') {
        // If hiddenText already caught it, handleChangeText will handle; otherwise backup
        if (hiddenText === ' ') {
          handleBackspace();
        }
      } else if (key === 'a' || key === 'A') {
        if (value && value.hour !== null) {
          onChange({
            hour: value.hour,
            minute: value.minute ?? 0,
            period: 'am',
          });
          setActiveSection('period');
          Keyboard.dismiss();
        }
      } else if (key === 'p' || key === 'P') {
        if (value && value.hour !== null) {
          onChange({
            hour: value.hour,
            minute: value.minute ?? 0,
            period: 'pm',
          });
          setActiveSection('period');
          Keyboard.dismiss();
        }
      }
    },
    [hiddenText, handleBackspace, value, onChange]
  );

  // ── Derived Display Values (Safe against undefined / null) ──
  const displayHour = hasValidHour ? String(value!.hour) : '';
  const displayMinute = hasValidMinute ? String(value!.minute).padStart(2, '0') : '';
  const displayPeriod = hasValidPeriod ? value!.period! : defaultPeriod;

  const placeholderHour = placeholder.split(':')[0]?.trim() || '0';
  const placeholderMinute = '00';

  return (
    <View style={styles.container}>
      {/* ── Pill Input Container ── */}
      <View
        style={[
          styles.pillContainer,
          error ? styles.pillBorderError : null,
          activeSection !== null ? styles.pillActiveBorder : null,
        ]}
      >
        {!isSet && activeSection === null ? (
          /* Empty state: show placeholder as a single clickable touchable */
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.placeholderTouchable}
            onPress={handlePillPress}
            accessibilityLabel={`${label}, ${placeholder}`}
          >
            <Text style={styles.placeholderText} numberOfLines={1}>
              {placeholder}
            </Text>
          </TouchableOpacity>
        ) : (
          /* Filled / Active state: three separate segmented targets */
          <View style={styles.segmentsRow}>
            {/* 1. Hour Segment */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.segmentTouch,
                activeSection === 'hour' && styles.activeSegment,
              ]}
              onPress={() => handleSelectSection('hour')}
              accessibilityRole="spinbutton"
              accessibilityLabel={hourAccessibilityLabel || `${label} hour`}
              accessibilityValue={{ text: hasValidHour ? displayHour : 'Empty' }}
            >
              <Text
                style={[
                  styles.segmentText,
                  !hasValidHour && !hourBuffer && styles.segmentTextPlaceholder,
                  activeSection === 'hour' && styles.segmentTextActive,
                ]}
              >
                {hourBuffer ? hourBuffer : (hasValidHour ? displayHour : placeholderHour)}
              </Text>
            </TouchableOpacity>

            {/* Separator Colon */}
            <Text
              style={[
                styles.colonText,
                !hasValidHour && !hasValidMinute && styles.colonTextPlaceholder,
              ]}
            >
              :
            </Text>

            {/* 2. Minute Segment */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.segmentTouch,
                activeSection === 'minute' && styles.activeSegment,
              ]}
              onPress={() => handleSelectSection('minute')}
              accessibilityRole="spinbutton"
              accessibilityLabel={minuteAccessibilityLabel || `${label} minutes`}
              accessibilityValue={{ text: hasValidMinute ? displayMinute : '00' }}
            >
              <Text
                style={[
                  styles.segmentText,
                  !hasValidMinute && !minuteBuffer && styles.segmentTextPlaceholder,
                  activeSection === 'minute' && styles.segmentTextActive,
                ]}
              >
                {minuteBuffer ? minuteBuffer : (hasValidMinute ? displayMinute : placeholderMinute)}
              </Text>
            </TouchableOpacity>

            {/* Space before period */}
            <View style={styles.periodSpacer} />

            {/* 3. Period Segment (am / pm) */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.segmentTouch,
                activeSection === 'period' && styles.activeSegment,
              ]}
              onPress={() => handleSelectSection('period')}
              accessibilityRole="button"
              accessibilityLabel={periodAccessibilityLabel || `${label} am or pm`}
              accessibilityValue={{ text: displayPeriod }}
            >
              <Text
                style={[
                  styles.segmentText,
                  !hasValidPeriod && styles.segmentTextPlaceholder,
                  activeSection === 'period' && styles.segmentTextActive,
                ]}
              >
                {displayPeriod}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Hidden Digit-Capture TextInput (single capture point for number pad) ── */}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          keyboardType="number-pad"
          value={hiddenText}
          onChangeText={handleChangeText}
          onKeyPress={handleKeyPress}
          onFocus={onFocus}
          onBlur={handleBlur}
          autoCapitalize="none"
          autoCorrect={false}
          caretHidden={true}
          contextMenuHidden={true}
          selectTextOnFocus={false}
          // Font size >= 16 prevents mobile Safari/Chrome viewport zoom on focus
          // aria-hidden prevents screen reader focus collision with the segmented touchables
          {...Platform.select({
            web: {
              style: {
                ...styles.hiddenInput,
                outlineStyle: 'none',
              },
            },
          })}
        />

        {/* ── Clear Button (Frame E1 / E5: circle-x 24x24) ── */}
        {clearable && isSet && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.clearBadgeButton}
            onPress={handleClear}
            accessibilityRole="button"
            accessibilityLabel={`Clear ${label}`}
          >
            <CircleXBadgeIcon size={24} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Required Error Message ── */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

export default TimeSegmentInput;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  clearBadgeButton: {
    position: 'absolute',
    right: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillContainer: {
    width: '100%',
    height: 48.25,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(192, 192, 204, 0.60)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  pillBorderError: {
    borderColor: '#CC2929',
  },
  pillActiveBorder: {
    borderColor: 'rgba(0, 8, 20, 0.96)',
    borderWidth: 1.5,
  },
  placeholderTouchable: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(192, 192, 204, 0.75)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  segmentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentTouch: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* Active segment styling from theme tokens: darker text + subtle 1.5px dark bottom indicator */
  activeSegment: {
    backgroundColor: 'rgba(0, 8, 20, 0.05)',
    borderBottomColor: 'rgba(0, 8, 20, 0.96)',
  },
  segmentText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#000814',
    includeFontPadding: false,
  },
  segmentTextPlaceholder: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  segmentTextActive: {
    color: '#000814',
    fontWeight: '600',
  },
  colonText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 24,
    color: '#000814',
    marginHorizontal: 1,
    includeFontPadding: false,
  },
  colonTextPlaceholder: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  periodSpacer: {
    width: 5,
  },
  errorText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    color: '#CC2929',
    marginTop: 4,
    paddingHorizontal: 4,
    includeFontPadding: false,
  },
  /* Hidden digit capture input: absolute zero-impact capture element with font-size >= 16 */
  hiddenInput: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 1,
    height: 1,
    opacity: 0.01,
    fontSize: 16,
    color: 'transparent',
  },
});
