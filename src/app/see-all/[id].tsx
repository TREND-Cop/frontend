import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ShareIcon } from '../../components/ShareIcon';
import { theme } from '../../constants/theme';
import { SEE_ALL_SECTIONS } from '../../screens/home/mockData';
import { HorizontalSeeAllCard } from '../../components/ui/HorizontalSeeAllCard';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';
import { shareStore } from '../../utils/shareStore';

export default function SeeAllScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const sectionData = id ? SEE_ALL_SECTIONS[id] : null;

  if (!sectionData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)' as any)}>
            <ArrowLeft size={24} color={theme.colors.barberPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Section Not Found</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)' as any)}>
          <ArrowLeft size={24} color={theme.colors.barberPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{sectionData.title}</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() =>
            shareStore.openShare({
              title: sectionData.title,
              status: 'Available',
              statusColor: 'rgba(12, 121, 12, 0.96)',
              url: `https://trend.app/see-all/${id}`,
            })
          }
        >
          <ShareIcon size={24} color="#141B34" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        {sectionData.data.map((item: any) => (
          <HorizontalSeeAllCard
            key={item.id}
            item={item}
            showFavorite={false}
            onPress={() => {
              if (item.categories || item.reviews !== undefined || item.rank) {
                // Salon card -> navigate to salon details
                router.push({
                  pathname: `/salon/${item.id}`,
                  params: { id: item.id, name: item.title || item.name },
                } as any);
              } else {
                // Service card -> navigate to style details
                router.push({
                  pathname: '/professional/style-details',
                  params: {
                    id: item.id,
                    serviceId: item.id,
                    name: item.title || item.name,
                    title: item.title || item.name,
                    serviceName: item.title || item.name,
                    price: typeof item.price === 'number' ? `₦${item.price.toLocaleString()}` : item.price,
                    rating: item.rating ? item.rating.toString() : '4.8',
                    duration: '1hr',
                    category: sectionData.title,
                    salonName: item.location || item.providerLocation || 'Luminous Lux',
                  },
                } as any);
              }
            }}
          />
        ))}
      </ScrollView>
      <NativeDockSpacer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...theme.typography.h2Med,
    color: theme.colors.barberPrimary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
});
