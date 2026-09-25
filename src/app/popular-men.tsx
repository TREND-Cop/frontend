import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Star } from 'lucide-react-native';
import { ShareIcon } from '../components/ShareIcon';
import { theme } from '../constants/theme';
import { POPULAR_DATA } from '../screens/home/mockData';
import { HorizontalSeeAllCard } from '../components/ui/HorizontalSeeAllCard';
import { NativeDockSpacer } from '../components/ui/NativeDockSpacer';
import { shareStore } from '../utils/shareStore';

export default function PopularMenScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)' as any)}>
          <ArrowLeft size={24} color={theme.colors.barberPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Popular Amongst Men</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() =>
            shareStore.openShare({
              title: 'Popular Amongst Men',
              status: 'Available',
              statusColor: 'rgba(12, 121, 12, 0.96)',
              url: 'https://trend.app/popular-men',
            })
          }
        >
          <ShareIcon size={24} color="#141B34" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        {POPULAR_DATA.map((item) => (
          <HorizontalSeeAllCard
            key={item.id}
            item={item}
            showFavorite={false}
            onPress={() => {
              router.push({
                pathname: '/professional/style-details',
                params: {
                  id: item.id,
                  name: item.title,
                  title: item.title,
                  price: typeof item.price === 'number' ? `₦${item.price.toLocaleString()}` : item.price,
                  rating: item.rating?.toString() || '4.8',
                  duration: '1hr',
                  category: item.title.includes('Facial')
                    ? 'Facials'
                    : item.title.includes('Massage')
                    ? 'Massage'
                    : item.title.includes('Shave')
                    ? 'Shave'
                    : 'Hair Cut',
                  salonName: item.providerLocation || 'Luminous Lux',
                },
              } as any);
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
