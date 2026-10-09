import React from 'react';
import { View, Text, StyleSheet, Image, Platform, TouchableOpacity } from 'react-native';

export interface NoRecordedAppointmentsEmptyStateProps {
  message?: string;
  style?: object;
  onRefresh?: () => void;
  showRefreshButton?: boolean;
  refreshButtonText?: string;
}

export function NoRecordedAppointmentsEmptyState({
  message = 'No appointment found',
  style,
  onRefresh,
  showRefreshButton = false,
  refreshButtonText = 'Refresh',
}: NoRecordedAppointmentsEmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {/* 150x150px Illustration (Calendar empty state) */}
      <Image
        source={require('../../assets/images/appointments/appointment_empty_calendar.png')}
        style={styles.illustration}
        resizeMode="contain"
      />

      {/* Label: No appointment found */}
      <Text style={styles.messageText}>{message}</Text>

      {/* Action Button: Refresh */}
      {showRefreshButton && onRefresh && (
        <TouchableOpacity
          style={styles.refreshButton}
          activeOpacity={0.88}
          onPress={onRefresh}
        >
          <Text style={styles.refreshButtonText}>{refreshButtonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  illustration: {
    width: 150,
    height: 150,
  },
  messageText: {
    marginTop: 24,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: Platform.OS === 'ios' ? 0.3 : 0.2,
    color: '#000000',
    includeFontPadding: false,
  },
  refreshButton: {
    width: 238,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 36,
    ...Platform.select({
      ios: {
        shadowColor: '#000814',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  refreshButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});

export default NoRecordedAppointmentsEmptyState;
