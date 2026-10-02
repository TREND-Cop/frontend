import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';

interface NoRecordedAppointmentsEmptyStateProps {
  message?: string;
  style?: object;
}

export function NoRecordedAppointmentsEmptyState({
  message = 'No Recorded Appointments',
  style,
}: NoRecordedAppointmentsEmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {/* 150x150px Illustration (remove_the_outlines_2K_202606021458 1 in Figma) */}
      <Image
        source={require('../../assets/images/appointments/empty_state_illustration.png')}
        style={styles.illustration}
        resizeMode="contain"
      />

      {/* 218x24px Label (No Recorded Appointments) */}
      <Text style={styles.messageText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 75, // 317px (Figma top) - 242px (Search Section bottom) = 75px exact distance
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  illustration: {
    width: 150,
    height: 150,
  },
  messageText: {
    marginTop: 24, // 491px (Figma text top) - 467px (Figma image bottom) = 24px exact gap
    width: 218,
    height: 24,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: '#000000',
    includeFontPadding: false,
  },
});
