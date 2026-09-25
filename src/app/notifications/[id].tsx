import React from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { TouchableOpacity, Platform } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { ShareIcon } from '../../components/ShareIcon';
import { NotificationDetailScreen } from '../../screens/notifications/NotificationDetailScreen';

import { shareStore } from '../../utils/shareStore';

export default function NotificationDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
                  router.replace('/notifications' as any);
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
          headerRight: () => (
            <TouchableOpacity
              onPress={() =>
                shareStore.openShare({
                  title: 'Trend Notification',
                  status: 'Available',
                  statusColor: 'rgba(12, 121, 12, 0.96)',
                  url: `https://trend.app/notifications/${id}`,
                })
              }
              activeOpacity={0.7}
              style={{ padding: 8 }}
            >
              <ShareIcon size={20} color="#141B34" />
            </TouchableOpacity>
          ),
        }} 
      />
      <NotificationDetailScreen id={id} />
    </>
  );
}
