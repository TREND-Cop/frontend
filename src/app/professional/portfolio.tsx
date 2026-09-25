import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ShareIcon } from '../../components/ShareIcon';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';

import { shareStore } from '../../utils/shareStore';
import { previewStore } from '../../utils/previewStore';

export default function ProfessionalPortfolioScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const specialistId = (params.id as string) || 'p1';
  const specialistName = (params.name as string) || 'Specialist';
  const headerTitle = (params.title as string) || `${specialistName} Portfolio`;

  const defaultLeft = [
    { source: require('../../../assets/images/profile/14dcc3440340f9f140251ac160473457c89b198c.jpg'), height: 239, title: 'Glossy French Manicure', price: '₦12,500', duration: '45min', rating: '4.9' },
    { source: require('../../../assets/images/profile/30b9a5ab22324bd8357f666111d5584ad2e3c83e.jpg'), height: 188, title: 'Abstract Marble Nails', price: '₦14,200', duration: '1hr', rating: '4.8' },
    { source: require('../../../assets/images/profile/eb3281d09659fdef5e45647cf5529f61e83190f1.jpg'), height: 239, title: 'Chrome Finish Acrylics', price: '₦16,000', duration: '1hr 15min', rating: '5.0' },
  ];

  const defaultRight = [
    { source: require('../../../assets/images/profile/dry_wow_pedicure.jpg'), height: 188, title: 'Dry Wow French Pedicure', price: '₦14,000', duration: '50min', rating: '4.9' },
    { source: require('../../../assets/images/profile/ee549b1ea85771de4cd8695943af94f474fedf19.jpg'), height: 239, title: 'Feet & Fingers Combo Art', price: '₦22,000', duration: '2hr', rating: '5.0' },
    { source: require('../../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg'), height: 188, title: 'Chocolate Brown Acrylic Nails', price: '₦16,000', duration: '1hr 15min', rating: '4.8' },
  ];

  // If previewStore has custom preview items for this specialist, build columns dynamically
  const previewItems = previewStore.getPreviewItems();
  const leftColumnImages = (previewItems && previewItems.length > 0)
    ? previewItems.filter((_, idx) => idx % 2 === 0).map((item, idx) => ({
        source: item.image,
        height: idx % 2 === 0 ? 239 : 188,
        title: item.title,
        price: item.price,
        duration: item.duration,
        rating: item.rating,
      }))
    : defaultLeft;

  const rightColumnImages = (previewItems && previewItems.length > 0)
    ? previewItems.filter((_, idx) => idx % 2 === 1).map((item, idx) => ({
        source: item.image,
        height: idx % 2 === 0 ? 188 : 239,
        title: item.title,
        price: item.price,
        duration: item.duration,
        rating: item.rating,
      }))
    : defaultRight;

  const orderedPortfolioItems = [
    leftColumnImages[0],
    rightColumnImages[0],
    leftColumnImages[1],
    rightColumnImages[1],
    leftColumnImages[2],
    rightColumnImages[2],
  ].filter(Boolean);

  const handleImagePress = (index: number) => {
    const allItems = orderedPortfolioItems.map((img) => ({
      image: img.source,
      title: img.title,
      price: img.price,
      duration: img.duration,
      rating: img.rating,
    }));
    const allImages = allItems.map((item) => item.image);

    previewStore.setPreviewImages(
      allImages,
      headerTitle,
      allItems,
      index
    );
    router.push({
      pathname: '/professional/gallery-preview',
      params: { index, initialIndex: index, source: 'portfolio', title: headerTitle },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => router.canGoBack() ? router.back() : router.replace(`/professional/${specialistId}` as any)} 
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={() =>
              shareStore.openShare({
                title: headerTitle,
                status: 'Available',
                statusColor: 'rgba(12, 121, 12, 0.96)',
                url: `https://trend.app/professional/${specialistId}/portfolio`,
              })
            }
          >
            <ShareIcon size={24} color="#141B34" />
          </TouchableOpacity>
        </View>

        {/* Staggered Portfolio Grid */}
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
          <View style={styles.gridContainer}>
            {/* Left Column */}
            <View style={styles.column}>
              {leftColumnImages.map((item, index) => (
                <TouchableOpacity 
                  key={`left-${index}`} 
                  activeOpacity={0.8}
                  onPress={() => handleImagePress(index * 2)}
                >
                  <Image
                    source={item.source}
                    style={[styles.portfolioImage, { height: item.height }]}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Right Column */}
            <View style={styles.column}>
              {rightColumnImages.map((item, index) => (
                <TouchableOpacity 
                  key={`right-${index}`} 
                  activeOpacity={0.8}
                  onPress={() => handleImagePress(index * 2 + 1)}
                >
                  <Image
                    source={item.source}
                    style={[styles.portfolioImage, { height: item.height }]}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
        <NativeDockSpacer />
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 17,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 24,
  },
  column: {
    flex: 1,
    gap: 40,
  },
  portfolioImage: {
    width: '100%',
    borderRadius: 24,
  },
});
