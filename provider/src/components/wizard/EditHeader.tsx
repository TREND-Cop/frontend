import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeRouter, useSingleFlight } from '../../utils/safeNavigation';
import { triggerLightHaptic } from '../../utils/haptics';

const FONT_PAGE_HEADER = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';

function ArrowLeft02Icon({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.57 5.93L3.5 12L9.57 18.07"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.5 12H3.67"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function HelpCircleIcon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.5} />
      <Path
        d="M9.5 9.5C9.5 8.12 10.62 7 12 7C13.38 7 14.5 8.12 14.5 9.5C14.5 11 12.5 11.75 12.5 13.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Circle cx="12.5" cy="16.5" r="0.75" fill={color} />
    </Svg>
  );
}

interface EditHeaderProps {
  title: string;
  onBack?: () => void;
  onHelp?: () => void;
  showHelp?: boolean;
  backAccessibilityLabel?: string;
  testID?: string;
}

/**
 * 1:1 Figma Header component across edit screens and details screen
 * Height: 64px, background: #FFFFFF, borderBottom: 1px solid rgba(235, 235, 245, 0.96)
 * Left: 48x48 back button with ArrowLeft02Icon
 * Center: title in 17px DM Sans Medium (SF Pro on iOS) with ellipsis truncation
 * Right: 48x48 tutorial button with HelpCircleIcon (or spacer when showHelp=false)
 */
export const EditHeader: React.FC<EditHeaderProps> = ({
  title,
  onBack,
  onHelp,
  showHelp = true,
  backAccessibilityLabel = 'Go back',
  testID,
}) => {
  const safeRouter = useSafeRouter();

  const handleBack = useSingleFlight(() => {
    triggerLightHaptic();
    if (onBack) {
      onBack();
    } else {
      safeRouter.back();
    }
  });

  const handleHelp = useSingleFlight(() => {
    triggerLightHaptic();
    if (onHelp) {
      onHelp();
    } else {
      safeRouter.push('/guide/general' as any);
    }
  });

  return (
    <View style={styles.header} testID={testID}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.headerIconButton}
        onPress={handleBack}
        accessibilityLabel={backAccessibilityLabel}
        accessibilityRole="button"
      >
        <ArrowLeft02Icon size={24} />
      </TouchableOpacity>

      <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
        {title}
      </Text>

      {showHelp ? (
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.headerIconButton}
          onPress={handleHelp}
          accessibilityLabel="Service tutorial guide"
          accessibilityRole="button"
        >
          <HelpCircleIcon size={24} />
        </TouchableOpacity>
      ) : (
        <View style={styles.headerIconButton} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FONT_PAGE_HEADER,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    marginHorizontal: 8,
  },
});

export default EditHeader;
