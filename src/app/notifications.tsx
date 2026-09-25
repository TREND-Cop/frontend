import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, Platform } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { NotificationScreen } from '../screens/notifications/NotificationScreen';

export default function NotificationsRoute() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Notification',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/home' as any);
                }
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={{
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: Platform.OS === 'ios' ? 0 : -4,
              }}
            >
              <ArrowLeft size={24} color="#000814" strokeWidth={1.8} />
            </TouchableOpacity>
          ),
        }} 
      />
      <NotificationScreen />
    </>
  );
}
