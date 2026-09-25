/**
 * InputFields — 1:1 Figma Input Fields Components (Frame 1000006434)
 * Contains the 3 component sets:
 * 1. Phone Number Input (Empty, Number Correction / Valid, Phone Number Error)
 * 2. Password Input (Empty, Hidden / Asterisks, Incorrect Password, Password Does Not Match, Successful / Valid)
 * 3. Full Name Input (Current Name, Correct / Valid, Error State, Empty State)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Platform,
} from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

// ── Nigerian Flag SVG (24x24 with rounded border) ──
export const NigeriaFlagIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect width="24" height="24" rx="4" fill="#F9F9F9" />
    <Rect width="8" height="24" rx="2" fill="#83BF4F" />
    <Rect x="16" width="8" height="24" rx="2" fill="#83BF4F" />
  </Svg>
);

// ── Green Checkmark Badge (Figma Component 5 / checkmark-circle-02) ──
export const GreenCheckBadge = ({ size = 24 }: { size?: number }) => (
  <View
    style={[
      styles.badgeBase,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: 'rgba(12, 121, 12, 0.96)',
      },
    ]}
  >
    <Svg width={size * 0.55} height={size * 0.55} viewBox="0 0 12 10" fill="none">
      <Path
        d="M1.5 5.2L4.2 8L10.5 1.8"
        stroke="#FFFFFF"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

// ── Grey Checkmark Badge (Figma current name state) ──
export const GreyCheckBadge = ({ size = 24 }: { size?: number }) => (
  <View
    style={[
      styles.badgeBase,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: 'rgba(192, 192, 204, 0.96)',
      },
    ]}
  >
    <Svg width={size * 0.55} height={size * 0.55} viewBox="0 0 12 10" fill="none">
      <Path
        d="M1.5 5.2L4.2 8L10.5 1.8"
        stroke="#FFFFFF"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

// ── Eye Open Icon (Figma Spec) ──
export const EyeOpenIcon = ({
  size = 24,
  color = 'rgba(0, 8, 20, 0.96)',
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 12C3.6 7.6 7.8 4.5 12 4.5C16.2 4.5 20.4 7.6 22 12C20.4 16.4 16.2 19.5 12 19.5C7.8 19.5 3.6 16.4 2 12Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.5} />
  </Svg>
);

// ── Eye Closed with Eyelashes Icon (Figma Spec) ──
export const EyeClosedIcon = ({
  size = 24,
  color = 'rgba(0, 8, 20, 0.96)',
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 10.5C5.8 14.5 8.7 16.2 12 16.2C15.3 16.2 18.2 14.5 21 10.5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path d="M6 13.5L4 16.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M10 15.5L9 19" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M14 15.5L15 19" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M18 13.5L20 16.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// 1. Phone Number Input Component
// ─────────────────────────────────────────────────────────────────────────────

export interface PhoneNumberInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  countryCode?: string;
  onCountryCodePress?: () => void;
  error?: string | null;
  isValid?: boolean;
  containerStyle?: ViewStyle;
}

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  label = 'Phone Number',
  value,
  onChangeText,
  countryCode = '+234',
  onCountryCodePress,
  error = null,
  isValid = false,
  containerStyle,
  ...rest
}) => {
  const isError = !!error;
  const isFilled = value.trim().length > 0;
  const showCheckmark = isValid && !isError;

  return (
    <View style={[styles.fieldContainer, containerStyle]}>
      {/* Label */}
      <Text style={styles.fieldLabel}>{label}</Text>

      {/* Input Field Container */}
      <View style={[styles.inputBox, isError && styles.inputBoxError]}>
        {/* Country Code and Flag */}
        <TouchableOpacity
          style={styles.countryCodeContainer}
          onPress={onCountryCodePress}
          activeOpacity={onCountryCodePress ? 0.7 : 1}
          disabled={!onCountryCodePress}
        >
          <NigeriaFlagIcon size={24} />
          <Text
            style={[
              styles.countryCodeText,
              isFilled && styles.countryCodeTextActive,
            ]}
          >
            {countryCode}
          </Text>
        </TouchableOpacity>

        {/* Text Input */}
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder="08110783610"
          placeholderTextColor="rgba(192, 192, 204, 0.96)"
          keyboardType="phone-pad"
          autoCorrect={false}
          {...rest}
        />

        {/* Right Status Badge */}
        {showCheckmark && <GreenCheckBadge size={24} />}
      </View>

      {/* Error Message */}
      {isError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Password Input Component
// ─────────────────────────────────────────────────────────────────────────────

export interface PasswordInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string | null;
  isValid?: boolean;
  containerStyle?: ViewStyle;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label = 'Enter Password',
  value,
  onChangeText,
  error = null,
  isValid = false,
  containerStyle,
  ...rest
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const isError = !!error;
  const showCheckmark = isValid && !isError;

  return (
    <View style={[styles.fieldContainer, containerStyle]}>
      {/* Label */}
      <Text style={styles.fieldLabel}>{label}</Text>

      {/* Input Field Container */}
      <View style={[styles.inputBox, isError && styles.inputBoxError]}>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder="JohnDoe1234"
          placeholderTextColor="rgba(192, 192, 204, 0.96)"
          secureTextEntry={!isVisible}
          autoCapitalize="none"
          autoCorrect={false}
          {...rest}
        />

        {/* Right Status / Toggle */}
        {showCheckmark ? (
          <GreenCheckBadge size={24} />
        ) : (
          <TouchableOpacity
            onPress={() => setIsVisible((prev) => !prev)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isVisible ? (
              <EyeClosedIcon size={24} color="rgba(0, 8, 20, 0.96)" />
            ) : (
              <EyeOpenIcon size={24} color="rgba(0, 8, 20, 0.96)" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {isError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Full Name / Text Input Component
// ─────────────────────────────────────────────────────────────────────────────

export interface FullNameInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string | null;
  isValid?: boolean;
  isCurrent?: boolean; // Shows grey checkmark when pre-filled / existing
  containerStyle?: ViewStyle;
}

export const FullNameInput: React.FC<FullNameInputProps> = ({
  label = 'Full Name',
  value,
  onChangeText,
  error = null,
  isValid = false,
  isCurrent = false,
  containerStyle,
  ...rest
}) => {
  const isError = !!error;
  const isFilled = value.trim().length > 0;

  return (
    <View style={[styles.fieldContainer, containerStyle]}>
      {/* Label */}
      <Text style={styles.fieldLabel}>{label}</Text>

      {/* Input Field Container */}
      <View style={[styles.inputBox, isError && styles.inputBoxError]}>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder="John Doe"
          placeholderTextColor="rgba(192, 192, 204, 0.96)"
          autoCorrect={false}
          {...rest}
        />

        {/* Right Status Badge */}
        {isCurrent && !isError && <GreyCheckBadge size={24} />}
        {isValid && !isCurrent && !isError && <GreenCheckBadge size={24} />}
      </View>

      {/* Error Message */}
      {isError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Exact 1:1 Figma Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fieldContainer: {
    width: '100%',
    gap: 8,
  },

  // ── Field Label (Body Text Med) ──
  fieldLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Input Field Container (358x48px, radius 24px) ──
  inputBox: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  inputBoxError: {
    borderColor: 'rgba(204, 41, 41, 0.9)',
  },

  // ── Country Code Container (82x32px, decorative right border) ──
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: 'rgba(235, 235, 245, 0.96)',
    height: 32,
  },
  countryCodeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(192, 192, 204, 0.96)',
  },
  countryCodeTextActive: {
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Text Input ──
  textInput: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
  },

  // ── Badges Base ──
  badgeBase: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Error Message (16px SF Pro 400 or 500, #CC2929) ──
  errorText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(204, 41, 41, 0.9)',
    marginTop: 0,
  },
});
