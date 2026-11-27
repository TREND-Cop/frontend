import React, { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ProviderOnboardingScreen } from '../../../provider/src/screens/auth/ProviderOnboardingScreen';
import { useSafeRouter } from '../../../provider/src/utils/safeNavigation';

export default function PartnerIndexRoute() {
  const safeRouter = useSafeRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const initialTab = params.tab === 'create_account' ? 'create_account' : 'login';

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        safeRouter.exitToUnifiedRoot();
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [safeRouter])
  );

  return (
    <ProviderOnboardingScreen
      initialTab={initialTab}
      businessOwnerOnly={true}
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
