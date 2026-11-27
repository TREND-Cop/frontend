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

export interface ServiceTypeSelectionSheetProps {
  visible: boolean;
  selectedType?: string;
  onSelectType: (type: string) => void;
  onClose: () => void;
}

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

// ── Close Icon (24x24) ────────────────────────────────────────────────────────
function CloseIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="350 18 24 24" fill="none">
      <Path
        d="M368 24L362 30.0004M362 30.0004L356.001 35.9992M362 30.0004L367.999 36M362 30.0004L356 24.0009"
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

// ── Home Service Icon (1:1 Figma) ─────────────────────────────────────────────
function HomeServiceIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="16 114 24 24" fill="none">
      <Path
        d="M28.8924 116.81L37.4876 123.595C37.8112 123.851 38 124.24 38 124.653C38 125.397 37.3969 126 36.6528 126H36V129.5C36 132.328 36 133.743 35.1213 134.621C34.2426 135.5 32.8284 135.5 30 135.5H26C23.1716 135.5 21.7574 135.5 20.8787 134.621C20 133.743 20 132.328 20 129.5V126H19.3472C18.6032 126 18 125.397 18 124.653C18 124.24 18.1888 123.851 18.5124 123.595L27.1076 116.81C27.3617 116.609 27.6761 116.5 28 116.5C28.3239 116.5 28.6383 116.609 28.8924 116.81Z"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M30.5 135.5V131C30.5 130.065 30.5 129.598 30.299 129.25C30.1674 129.022 29.978 128.833 29.75 128.701C29.4019 128.5 28.9346 128.5 28 128.5C27.0654 128.5 26.5981 128.5 26.25 128.701C26.022 128.833 25.8326 129.022 25.701 129.25C25.5 129.598 25.5 130.065 25.5 131V135.5"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── In-Person Walking Icon (1:1 Figma) ─────────────────────────────────────────
function WalkingIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="16 195 24 24" fill="none">
      <Path
        d="M22 207.5L23.7381 204.893C23.9103 204.634 24.1404 204.42 24.4099 204.266L26.599 203.015C27.1619 202.693 27.8483 202.674 28.4282 202.964C29.0851 203.292 29.4658 203.986 29.7461 204.665C30.2069 205.781 31.3984 207 34 207"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M28.9997 204L27.7769 209.595M26.4997 203.5L25.7743 206.764C25.6066 207.519 25.8887 208.303 26.4988 208.777L29.9997 211.5L31.4997 216"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M25.5 211L25 212.5L22.5 215.5"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M31 199.5C31 200.328 30.3284 201 29.5 201C28.6716 201 28 200.328 28 199.5C28 198.672 28.6716 198 29.5 198C30.3284 198 31 198.672 31 199.5Z"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Home Service and In-Person Icon (1:1 Figma) ────────────────────────────────
function DualServiceIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="16 276 24 24" fill="none">
      <Path
        d="M25 281C25 279.586 25 278.879 25.4393 278.439C25.8787 278 26.5858 278 28 278C29.4142 278 30.1213 278 30.5607 278.439C31 278.879 31 279.586 31 281C31 282.414 31 283.121 30.5607 283.561C30.1213 284 29.4142 284 28 284C26.5858 284 25.8787 284 25.4393 283.561C25 283.121 25 282.414 25 281Z"
        stroke="#141B34"
        strokeWidth={1.5}
      />
      <Path
        d="M18 295C18 293.586 18 292.879 18.4393 292.439C18.8787 292 19.5858 292 21 292C22.4142 292 23.1213 292 23.5607 292.439C24 292.879 24 293.586 24 295C24 296.414 24 297.121 23.5607 297.561C23.1213 298 22.4142 298 21 298C19.5858 298 18.8787 298 18.4393 297.561C18 297.121 18 296.414 18 295Z"
        stroke="#141B34"
        strokeWidth={1.5}
      />
      <Path
        d="M32 295C32 293.586 32 292.879 32.4393 292.439C32.8787 292 33.5858 292 35 292C36.4142 292 37.1213 292 37.5607 292.439C38 292.879 38 293.586 38 295C38 296.414 38 297.121 37.5607 297.561C37.1213 298 36.4142 298 35 298C33.5858 298 32.8787 298 32.4393 297.561C32 297.121 32 296.414 32 295Z"
        stroke="#141B34"
        strokeWidth={1.5}
      />
      <Path
        d="M28 284V285M28 285C28 285.932 28 286.398 28.1776 286.765C28.4144 287.255 28.8687 287.645 29.4404 287.848C29.8692 288 30.4128 288 31.5 288H31.5C32.5872 288 33.1308 288 33.5596 288.152C34.1313 288.355 34.5856 288.745 34.8224 289.235C35 289.602 35 290.068 35 291V292M28 285C28 285.932 28 286.398 27.8224 286.765C27.5856 287.255 27.1313 287.645 26.5596 287.848C26.1308 288 25.5872 288 24.5 288H24.5H24.5C23.4128 288 22.8692 288 22.4404 288.152C21.8687 288.355 21.4144 288.745 21.1776 289.235C21 289.602 21 290.068 21 291V292"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const SERVICE_TYPE_OPTIONS = [
  { id: 'home', label: 'Home Service', icon: <HomeServiceIcon size={24} /> },
  { id: 'in_person', label: 'In-Person', icon: <WalkingIcon size={24} /> },
  { id: 'both', label: 'Home Service and In-Person', icon: <DualServiceIcon size={24} /> },
];

/**
 * 1:1 Figma ServiceTypeSelectionSheet
 * Header: "How can client receive the service?"
 * Rows: Home Service, In-Person, Home Service and In-Person
 */
export const ServiceTypeSelectionSheet: React.FC<ServiceTypeSelectionSheetProps> = ({
  visible,
  selectedType,
  onSelectType,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  const handleSelect = (label: string) => {
    triggerLightHaptic();
    onSelectType(label);
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
            { paddingBottom: insets.bottom + 16 },
          ]}
        >
          {/* ── Header (height: 66px) ── */}
          <View style={styles.header}>
            <View style={styles.headerLeftSpacer} />
            <Text style={styles.headerTitle}>How can client receive the service?</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.closeButton}
              accessibilityLabel="Close service type selection"
            >
              <CloseIcon size={24} />
            </TouchableOpacity>
          </View>

          {/* ── Options Rows ── */}
          <View style={styles.optionsContainer}>
            {SERVICE_TYPE_OPTIONS.map((item, index) => {
              const isSelected = selectedType === item.label;
              const isLast = index === SERVICE_TYPE_OPTIONS.length - 1;
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

export default ServiceTypeSelectionSheet;

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
