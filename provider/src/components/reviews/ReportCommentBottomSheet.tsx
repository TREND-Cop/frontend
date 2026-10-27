import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';

const FONT_MEDIUM = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_500Medium',
  default: 'DMSans_500Medium',
});

const FONT_REGULAR = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_400Regular',
  default: 'DMSans_400Regular',
});

/**
 * 24x24 Vector cancel-01 Close Icon (1.5px stroke #141B34)
 */
function CloseIcon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 24x24 Vector police-cap Icon matching Figma Frame P2 spec
 */
export function PoliceCapIcon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Cap Crown */}
      <Path
        d="M3 11c0-4 4-8 9-8s9 4 9 8l-2 3H5l-2-3z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Visor / Brim */}
      <Path
        d="M4 14c2.5 3.5 13.5 3.5 16 0"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Center Cap Badge */}
      <Rect
        x="10.5"
        y="7"
        width="3"
        height="4"
        rx="0.5"
        stroke={color}
        strokeWidth={1.2}
      />
    </Svg>
  );
}

export interface ReportCommentBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectReport: () => void;
}

/**
 * ReportCommentBottomSheet (Figma Frame P2)
 *
 * Requirements:
 * - Rounded top corners (24px 24px 0px 0px)
 * - Header bar (72px) with title "Report Comment" and 40x40 round close button
 * - Option row (104px) with 40x40 white icon container, "Report" title and description
 * - Tapping option calls onSelectReport
 * - Backdrop press or close button dismisses sheet
 */
export const ReportCommentBottomSheet: React.FC<ReportCommentBottomSheetProps> = ({
  visible,
  onClose,
  onSelectReport,
}) => {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        {/* Dimmed backdrop pressable to close */}
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss report menu"
        />

        {/* Bottom Sheet Container */}
        <View
          style={[
            styles.sheetContainer,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
        >
          {/* Header Bar (72px) */}
          <View style={styles.headerBar}>
            <Text style={styles.headerTitle} accessibilityRole="header">
              Report Comment
            </Text>

            <TouchableOpacity
              style={styles.closeButton}
              activeOpacity={0.7}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close report menu"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <CloseIcon size={24} />
            </TouchableOpacity>
          </View>

          {/* Option Content Container */}
          <View style={styles.contentContainer}>
            {/* Single Option Row: Report */}
            <TouchableOpacity
              style={styles.optionRow}
              activeOpacity={0.8}
              onPress={() => {
                onClose();
                onSelectReport();
              }}
              accessibilityRole="button"
              accessibilityLabel="Report this comment. Report any abusive comment towards your service or business."
            >
              {/* 40x40 White Circular Icon Container */}
              <View style={styles.iconCircle}>
                <PoliceCapIcon size={24} />
              </View>

              {/* Text Info */}
              <View style={styles.textStack}>
                <Text style={styles.optionTitle}>Report</Text>
                <Text style={styles.optionDescription}>
                  Report any abusive comment towards your service or business eg. scam
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ReportCommentBottomSheet;

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheetContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 20,
  },
  headerBar: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  optionRow: {
    width: '100%',
    minHeight: 104,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textStack: {
    flex: 1,
    gap: 8,
  },
  optionTitle: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
    includeFontPadding: false,
  },
  optionDescription: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
});
