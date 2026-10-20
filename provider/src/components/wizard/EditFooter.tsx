import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { triggerLightHaptic } from '../../utils/haptics';

const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

function CircleXToastIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={1.5} />
      <Path
        d="M9 9l6 6M15 9l-6 6"
        stroke="rgba(204, 41, 41, 0.9)"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

interface EditFooterProps {
  isDirty: boolean;
  onSave: () => void;
  errorText?: string | null;
  showErrorToast?: boolean;
  saveLabel?: string;
  testID?: string;
}

/**
 * 1:1 Figma Save Changes Sticky Footer Component
 *
 * Implements:
 * - Height: 76px container with bottom safe-area insets
 * - Top soft shadow: 0px -8px 20px rgba(133, 139, 148, 0.12)
 * - Error toast pill: red background with white CircleXToastIcon + text
 * - Save changes button:
 *   - Not dirty -> grey disabled (rgba(247, 247, 247, 0.96)), does nothing
 *   - Dirty -> dark navy (rgba(0, 8, 20, 0.96)), white text, pressable
 */
export const EditFooter: React.FC<EditFooterProps> = ({
  isDirty,
  onSave,
  errorText,
  showErrorToast,
  saveLabel = 'Save changes',
  testID,
}) => {
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    if (!isDirty) {
      // Disabled when nothing was edited
      return;
    }
    triggerLightHaptic();
    onSave();
  };

  return (
    <View
      style={[
        styles.stickyFooter,
        { paddingBottom: Math.max(insets.bottom, 16) },
      ]}
      testID={testID}
    >
      {/* Red Validation Toast Pill */}
      {showErrorToast && !!errorText && (
        <View style={styles.toastContainer}>
          <View style={styles.toastPill}>
            <CircleXToastIcon size={24} />
            <Text style={styles.toastText} numberOfLines={1}>
              {errorText}
            </Text>
          </View>
        </View>
      )}

      {/* Save Changes Button */}
      <TouchableOpacity
        activeOpacity={isDirty ? 0.85 : 1}
        style={[
          styles.saveButton,
          isDirty ? styles.saveButtonEnabled : styles.saveButtonDisabled,
        ]}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={saveLabel}
        accessibilityState={{ disabled: !isDirty }}
      >
        <Text
          style={[
            styles.saveButtonText,
            isDirty ? styles.saveTextEnabled : styles.saveTextDisabled,
          ]}
        >
          {saveLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  stickyFooter: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(235, 235, 245, 0.6)',
    // Soft top shadow
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  toastContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  toastPill: {
    height: 44,
    borderRadius: 24,
    backgroundColor: 'rgba(204, 41, 41, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    alignSelf: 'center',
    maxWidth: '92%',
  },
  toastText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  saveButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  saveButtonEnabled: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  saveButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    includeFontPadding: false,
  },
  saveTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  saveTextEnabled: {
    color: '#FFFFFF',
  },
});

export default EditFooter;
