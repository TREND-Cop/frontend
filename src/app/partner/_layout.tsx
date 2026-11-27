import React from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { configureUnifiedPartnerRouting } from '../../../provider/src/utils/safeNavigation';
import { ProviderOnboardingProvider } from '../../../provider/src/context/ProviderOnboardingContext';
import { FirstTimeProvider } from '../../../provider/src/context/FirstTimeContext';
import { ServiceDraftProvider } from '../../../provider/src/context/ServiceDraftContext';
import { WorkPhotosProvider } from '../../../provider/src/context/WorkPhotosContext';
import { StaffProvider } from '../../../provider/src/context/StaffContext';
import { ReviewsProvider } from '../../../provider/src/context/ReviewsContext';
import { ProviderProfileProvider } from '../../../provider/src/context/ProviderProfileContext';
import { NotificationsProvider } from '../../../provider/src/context/NotificationsContext';
import { MessagesProvider } from '../../../provider/src/context/MessagesContext';
import { StaffLoginProvider } from '../../../provider/src/context/StaffLoginContext';
import { StaffAppointmentsProvider } from '../../../provider/src/context/StaffAppointmentsContext';
import { ExitAppDialog } from '../../../provider/src/components/ExitAppDialog';

// Configure all internal provider navigation calls to scope under `/partner`
// while preserving `/role-selection` as the back exit route to the unified landing flow.
configureUnifiedPartnerRouting('/partner', '/role-selection');

export default function PartnerRootLayout() {
  return (
    <ProviderOnboardingProvider>
      <ProviderProfileProvider>
        <NotificationsProvider>
          <FirstTimeProvider>
            <ServiceDraftProvider>
              <WorkPhotosProvider>
                <StaffProvider>
                  <StaffLoginProvider>
                    <StaffAppointmentsProvider>
                      <MessagesProvider>
                        <ReviewsProvider>
                          <Stack
                            screenOptions={{
                              headerShown: false,
                              contentStyle: { backgroundColor: '#FFFFFF' },
                              animation: Platform.OS === 'web' ? 'none' : Platform.OS === 'ios' ? 'default' : 'fade_from_bottom',
                              navigationBarColor: '#FFFFFF',
                              navigationBarTranslucent: false,
                            }}
                          />
                          <ExitAppDialog />
                        </ReviewsProvider>
                      </MessagesProvider>
                    </StaffAppointmentsProvider>
                  </StaffLoginProvider>
                </StaffProvider>
              </WorkPhotosProvider>
            </ServiceDraftProvider>
          </FirstTimeProvider>
        </NotificationsProvider>
      </ProviderProfileProvider>
    </ProviderOnboardingProvider>
  );
}
