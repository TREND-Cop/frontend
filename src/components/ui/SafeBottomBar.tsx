import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSafeBottomPadding } from '../../utils/safeArea';

export interface SafeBottomBarProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  minPadding?: number;
  extraSpacing?: number;
}

/**
 * Universal Safe Bottom Bar component that guarantees bottom action buttons
 * sit cleanly above the Android 3-button dock, gesture bar, and iOS home indicator.
 */
export const SafeBottomBar: React.FC<SafeBottomBarProps> = ({
  children,
  style,
  backgroundColor = '#FFFFFF',
  minPadding = 16,
  extraSpacing = 8,
}) => {
  const insets = useSafeAreaInsets();
  const paddingBottom = getSafeBottomPadding(insets, minPadding, extraSpacing);

  return (
    <View style={[styles.bar, { backgroundColor, paddingBottom }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    shadowColor: 'rgba(133, 139, 148, 1)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
    zIndex: 100,
  },
});

export default SafeBottomBar;
