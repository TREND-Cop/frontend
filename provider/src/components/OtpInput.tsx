import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';

export type OtpStatus = 'default' | 'error' | 'success';

export interface OtpInputProps {
  value: string;
  onChangeText: (text: string) => void;
  status?: OtpStatus;
  autoFocus?: boolean;
  disabled?: boolean;
}

export const OTP_LENGTH = 4;

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChangeText,
  status = 'default',
  autoFocus = true,
  disabled = false,
}) => {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (autoFocus && !disabled) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus, disabled]);

  const handleBoxPress = () => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  };

  const handleChange = (rawText: string) => {
    // Digits only, max 4
    const digitsOnly = rawText.replace(/\D/g, '').slice(0, OTP_LENGTH);
    onChangeText(digitsOnly);
  };

  const digits = value.split('');

  return (
    <View style={styles.container}>
      {/* Hidden single TextInput as single source of truth */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={OTP_LENGTH}
        style={styles.hiddenInput}
        editable={!disabled}
        caretHidden
      />

      {/* 4 Visual Digit Boxes */}
      <View style={styles.boxesRow}>
        {Array.from({ length: OTP_LENGTH }).map((_, index) => {
          const char = digits[index] || '';

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.9}
              style={[
                styles.box,
                status === 'error' && styles.boxError,
                status === 'success' && styles.boxSuccess,
              ]}
              onPress={handleBoxPress}
            >
              <Text style={styles.digitText}>{char}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default OtpInput;

const styles = StyleSheet.create({
  container: {
    width: 312,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    top: 0,
    left: 0,
  },
  boxesRow: {
    width: 312,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 40,
  },
  box: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C0C0CC',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  boxError: {
    borderColor: '#CC2929',
  },
  boxSuccess: {
    borderColor: '#0C790C',
  },
  digitText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
});
