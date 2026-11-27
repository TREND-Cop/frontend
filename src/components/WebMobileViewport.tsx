import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';

export interface WebMobileViewportProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Constrains mobile-designed landing and auth screens to a centered 420px column on
 * wider desktop web browsers while remaining full-bleed on phones and native devices.
 */
export const WebMobileViewport: React.FC<WebMobileViewportProps> = ({ children, style }) => {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={styles.outerBackdrop}>
      <View style={[styles.mobileColumn, style]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerBackdrop: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  mobileColumn: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
});
