import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useSafeRouter } from '../utils/safeNavigation';

export interface NoPendingAppointmentsEmptyStateProps {
  onCheckOngoing?: () => void;
}

/**
 * 1:1 Figma Empty State for Awaiting Client Arrival / Pending Approval (Rectangle 302: 150x150)
 */
export function NoPendingAppointmentsEmptyState({
  onCheckOngoing,
}: NoPendingAppointmentsEmptyStateProps) {
  const safeRouter = useSafeRouter();

  return (
    <View style={styles.emptyStateContainer}>
      {/* 150x150px Illustration (Rectangle 302: Cancelled_appointment_calendar_icon_2K_202608290328) */}
      <View style={styles.illustrationWrapper}>
        <Image
          source={require('../../assets/images/appointments/no_pending_appointments.png')}
          style={styles.illustrationImage}
          resizeMode="contain"
        />
      </View>

      {/* Description Block (358x80px, gap: 16px) */}
      <View style={styles.descriptionBlock}>
        <Text style={styles.emptyTitleText}>No pending appointments</Text>
        <Text style={styles.emptySubtitleText}>
          Check the status of appointments you’ve accepted while waiting for the client to begin the service.
        </Text>
      </View>

      {/* Action Button: check ongoing appointment (291x48px, radius: 24px) */}
      <TouchableOpacity
        style={styles.actionButton}
        activeOpacity={0.88}
        onPress={
          onCheckOngoing ||
          (() => {
            safeRouter.push('/ongoing-appointments' as any);
          })
        }
      >
        <Text style={styles.actionButtonText}>check ongoing appointment</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyStateContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  illustrationWrapper: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationImage: {
    width: 150,
    height: 150,
  },
  descriptionBlock: {
    width: '100%',
    maxWidth: 358,
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  emptyTitleText: {
    width: '100%',
    maxWidth: 358,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    textAlign: 'center',
    color: '#000000',
    includeFontPadding: false,
  },
  emptySubtitleText: {
    width: '100%',
    maxWidth: 358,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    textAlign: 'center',
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  actionButton: {
    width: 291,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(133, 139, 148, 0.08)',
        shadowOffset: { width: 4, height: 10 },
        shadowOpacity: 1,
        shadowRadius: 24,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  actionButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});

export default NoPendingAppointmentsEmptyState;
