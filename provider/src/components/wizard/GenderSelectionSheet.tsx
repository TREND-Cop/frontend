import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { triggerLightHaptic } from '../../utils/haptics';

export interface GenderSelectionSheetProps {
  visible: boolean;
  selectedGender?: string;
  onSelectGender: (gender: string) => void;
  onClose: () => void;
}

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

// ── Close Icon (24x24) ────────────────────────────────────────────────────────
function CloseIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="346 18 24 24" fill="none">
      <Path
        d="M364 24L358 30.0004M358 30.0004L352.001 35.9992M358 30.0004L363.999 36M358 30.0004L352 24.0009"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Radio Checkmark Circle ────────────────────────────────────────────────────
function RadioCheckIcon({ isSelected }: { isSelected: boolean }) {
  if (isSelected) {
    return (
      <Svg width={24} height={24} viewBox="350 114 24 24" fill="none">
        <Circle cx="362" cy="126" r="10" fill="#0C790C" />
        <Path
          d="M358 126l2.83 2.83L366.5 123.17"
          stroke="#FFFFFF"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={24} height={24} viewBox="350 114 24 24" fill="none">
      <Path
        d="M372 126C372 120.477 367.523 116 362 116C356.477 116 352 120.477 352 126C352 131.523 356.477 136 362 136C367.523 136 372 131.523 372 126Z"
        stroke="#C0C0CC"
        strokeOpacity={0.96}
        strokeWidth={1.5}
        fill="none"
      />
    </Svg>
  );
}

// ── Man Icon ──────────────────────────────────────────────────────────────────
function ManIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="16 114 24 24" fill="none">
      <Path
        d="M30 118C30 119.105 29.1046 120 28 120C26.8954 120 26 119.105 26 118C26 116.895 26.8954 116 28 116C29.1046 116 30 116.895 30 118Z"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M32 126.5C32 124.614 32 123.672 31.4142 123.086C30.8284 122.5 29.8856 122.5 28 122.5C26.1144 122.5 25.1716 122.5 24.5858 123.086C24 123.672 24 124.614 24 126.5V128C24 128.943 24 129.414 24.2929 129.707C24.5858 130 25.0572 130 26 130V134C26 134.943 26 135.414 26.2929 135.707C26.5858 136 27.0572 136 28 136C28.9428 136 29.4142 136 29.7071 135.707C30 135.414 30 134.943 30 134V130C30.9428 130 31.4142 130 31.7071 129.707C32 129.414 32 128.943 32 128V126.5Z"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Woman Icon ────────────────────────────────────────────────────────────────
function WomanIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="16 195 24 24" fill="none">
      <Path
        d="M30 199C30 200.105 29.1046 201 28 201C26.8954 201 26 200.105 26 199C26 197.895 26.8954 197 28 197C29.1046 197 30 197.895 30 199Z"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M26.0002 211V215C26.0002 215.943 26.0002 216.414 26.2931 216.707C26.586 217 27.0574 217 28.0002 217C28.943 217 29.4144 217 29.7073 216.707C30.0002 216.414 30.0002 215.943 30.0002 215V211L30.2603 211.001C31.8127 211 32.5889 211 32.8927 210.515C33.1965 210.03 32.8312 209.373 32.1007 208.059L30.3008 204.824C29.8476 204.009 28.9628 203.5 27.9996 203.5C27.0368 203.5 26.1525 204.009 25.6994 204.824L23.8993 208.059C23.1688 209.373 22.8035 210.029 23.1073 210.515C23.4111 211 24.1873 211 25.7397 211.001L26.0002 211Z"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Unisex (Man & Woman) Icon ─────────────────────────────────────────────────
function UnisexIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="16 276 24 24" fill="none">
      <Path
        d="M24.5 280C24.5 281.105 23.6046 282 22.5 282C21.3954 282 20.5 281.105 20.5 280C20.5 278.895 21.3954 278 22.5 278C23.6046 278 24.5 278.895 24.5 280Z"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M26.5 288.5C26.5 286.614 26.5 285.672 25.9142 285.086C25.3284 284.5 24.3856 284.5 22.5 284.5C20.6144 284.5 19.6716 284.5 19.0858 285.086C18.5 285.672 18.5 286.614 18.5 288.5V290.5C18.5 291.443 18.5 291.914 18.7929 292.207C19.0858 292.5 19.5572 292.5 20.5 292.5V296C20.5 296.943 20.5 297.414 20.7929 297.707C21.0858 298 21.5572 298 22.5 298C23.4428 298 23.9142 298 24.2071 297.707C24.5 297.414 24.5 296.943 24.5 296V292.5C25.4428 292.5 25.9142 292.5 26.2071 292.207C26.5 291.914 26.5 291.443 26.5 290.5V288.5Z"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Path
        d="M35.5 280C35.5 281.105 34.6046 282 33.5 282C32.3954 282 31.5 281.105 31.5 280C31.5 278.895 32.3954 278 33.5 278C34.6046 278 35.5 278.895 35.5 280Z"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M35.4995 296V292.5C36.5856 292.5 37.1991 292.5 37.4186 292.026C37.6381 291.551 37.3953 290.903 36.9095 289.606L35.6676 286.289C35.2571 285.193 34.4179 284.5 33.5 284.5C32.5821 284.5 31.7429 285.193 31.3324 286.289L30.0905 289.606C29.6047 290.903 29.3619 291.551 29.5814 292.026C29.8009 292.5 30.4133 292.5 31.4995 292.5V296C31.4995 296.943 31.4995 297.414 31.7924 297.707C32.0853 298 32.5567 298 33.4995 298C34.4423 298 34.9137 298 35.2066 297.707C35.4995 297.414 35.4995 296.943 35.4995 296Z"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const GENDER_OPTIONS = [
  { id: 'male', label: 'Male only', icon: <ManIcon size={24} /> },
  { id: 'female', label: 'Female only', icon: <WomanIcon size={24} /> },
  { id: 'unisex', label: 'Unisex', icon: <UnisexIcon size={24} /> },
];

/**
 * 1:1 Figma GenderSelectionSheet
 * Header: "What gender can use this service?" (height: 66px, borderBottom)
 * Rows: Male only, Female only, Unisex (each with icon + radio checkmark)
 */
export const GenderSelectionSheet: React.FC<GenderSelectionSheetProps> = ({
  visible,
  selectedGender,
  onSelectGender,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  const handleSelect = (label: string) => {
    triggerLightHaptic();
    onSelectGender(label);
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
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
        >
          {/* ── Header (height: 66px) ── */}
          <View style={styles.header}>
            <View style={styles.headerLeftSpacer} />
            <Text style={styles.headerTitle}>What gender can use this service?</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.closeButton}
              accessibilityLabel="Close gender selection"
            >
              <CloseIcon size={24} />
            </TouchableOpacity>
          </View>

          {/* ── Options Rows ── */}
          <View style={styles.optionsContainer}>
            {GENDER_OPTIONS.map((item, index) => {
              const isSelected = selectedGender === item.label;
              const isLast = index === GENDER_OPTIONS.length - 1;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  style={[styles.optionRow, isLast && styles.optionRowLast]}
                  onPress={() => handleSelect(item.label)}
                >
                  <View style={styles.optionLeft}>
                    {item.icon}
                    <Text style={styles.optionText}>{item.label}</Text>
                  </View>
                  <RadioCheckIcon isSelected={isSelected} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default GenderSelectionSheet;

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
  /* Header: height 66px, borderBottom 1px solid rgba(235, 235, 245, 0.96) */
  header: {
    width: '100%',
    height: 66,
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
  /* Title: 16px SF Pro 510/500, line-height 24px, letter-spacing 0.5px */
  headerTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 32,
  },
  /* Frame 1000006408: height 57px, borderBottom 1px solid rgba(235, 235, 245, 0.96) */
  optionRow: {
    width: '100%',
    height: 57,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    marginBottom: 24,
  },
  optionRowLast: {
    marginBottom: 0,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  /* 16px SF Pro 400, line-height 24px, letter-spacing 0.4px, #000000 */
  optionText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
    includeFontPadding: false,
  },
});
