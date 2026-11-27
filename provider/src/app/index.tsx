import React, { useEffect, useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSafeRouter } from '../utils/safeNavigation';
import { ProviderOnboardingScreen } from '../screens/auth/ProviderOnboardingScreen';
import { DEV_SEED_DRAFT } from '../context/ServiceDraftContext';

export default function Index() {
  const safeRouter = useSafeRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const initialTab = params.tab === 'create_account' ? 'create_account' : 'login';

  // Lock Android hardware back at the root onboarding screen so it exits/minimizes app
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [])
  );

  useEffect(() => {
    if (DEV_SEED_DRAFT) {
      safeRouter.replace('/business-services-review');
    }
  }, [safeRouter]);

  return (
    <ProviderOnboardingScreen
      initialTab={initialTab}
      onSelectRole={(role, mode) => {
        if (role === 'business_owner') {
          if (mode === 'create_account') {
            safeRouter.push('/sign-up-business-owner');
          } else {
            safeRouter.push('/login-business-owner');
          }
        } else if (role === 'staff') {
          safeRouter.push('/staff-login-code' as any);
        }
      }}
    />
  );
}
