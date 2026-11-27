import React from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StaffReviewsProvider } from '../../context/StaffReviewsContext';
import { StaffWorkPhotosProvider } from '../../context/StaffWorkPhotosContext';
import { StaffStatisticsProvider } from '../../context/StaffStatisticsContext';
import { StaffMessagesProvider } from '../../context/StaffMessagesContext';
import { StaffProfileProvider } from '../../context/StaffProfileContext';
import { StaffNotificationsProvider } from '../../context/StaffNotificationsContext';
import { StaffTutorialProvider } from '../../context/StaffTutorialContext';
import { StatsProvider } from '../../context/StatsContext';

/**
 * Isolated Staff Route Group Layout
 *
 * Provides dedicated, isolated in-memory stores for Staff Reviews, Staff Work Photos,
 * Staff Personal Statistics, Staff Messages, Staff Profile, Staff Notifications, and Staff Tutorial,
 * ensuring staff sessions never read or mutate owner stores.
 */
export default function StaffLayout() {
  return (
    <StaffReviewsProvider>
      <StaffWorkPhotosProvider>
        <StaffStatisticsProvider>
          <StaffMessagesProvider>
            <StaffProfileProvider>
              <StaffNotificationsProvider>
                <StaffTutorialProvider>
                  <StatsProvider>
                    <Stack
                      screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: '#FFFFFF' },
                        animation: Platform.OS === 'ios' ? 'default' : 'fade_from_bottom',
                        navigationBarColor: '#FFFFFF',
                        navigationBarTranslucent: false,
                      }}
                    />
                  </StatsProvider>
                </StaffTutorialProvider>
              </StaffNotificationsProvider>
            </StaffProfileProvider>
          </StaffMessagesProvider>
        </StaffStatisticsProvider>
      </StaffWorkPhotosProvider>
    </StaffReviewsProvider>
  );
}
