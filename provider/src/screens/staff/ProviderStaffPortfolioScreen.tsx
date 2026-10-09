import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { previewStore } from '../../utils/previewStore';
import { getSpecialistPortfolio, PortfolioItem } from '../../data/specialistPortfolioData';

function ArrowLeft02Icon({
  size = 24,
  color = 'rgba(0, 8, 20, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.57 5.93L3.5 12L9.57 18.07"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.5 12H3.67"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ProviderStaffPortfolioScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const staffName = (params.name as string) || 'Bisola Olarewaju';
  const firstName = staffName.split(' ')[0] || 'Bisola';
  const headerTitle = (params.title as string) || `${firstName} Portfolio`;

  // Dynamic portfolio items from unified specialist portfolio data
  const portfolioItems = getSpecialistPortfolio(staffName);
  const leftColumnImages = portfolioItems.filter((item) => item.column === 'left');
  const rightColumnImages = portfolioItems.filter((item) => item.column === 'right');

  const orderedItems: PortfolioItem[] = [];
  const maxRows = Math.max(leftColumnImages.length, rightColumnImages.length);
  for (let i = 0; i < maxRows; i++) {
    if (leftColumnImages[i]) orderedItems.push(leftColumnImages[i]);
    if (rightColumnImages[i]) orderedItems.push(rightColumnImages[i]);
  }

  const handleImagePress = (index: number) => {
    const allImages = orderedItems.map((item) => item.image);
    previewStore.setPreviewImages(
      allImages,
      headerTitle,
      orderedItems.map((item) => ({
        image: item.image,
        title: item.title,
        price: item.price,
        duration: item.duration,
        rating: item.rating,
      })),
      index
    );
    router.push({
      pathname: '/gallery-preview' as any,
      params: { index, initialIndex: index, source: 'portfolio', title: headerTitle },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── 1:1 Figma Header (390x64px, padding 8px 16px) ── */}
      <View style={styles.headerContainer}>
        {/* Back button (48x48px, radius 24px) */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft02Icon size={24} color="rgba(0, 8, 20, 0.96)" />
        </TouchableOpacity>

        {/* 17px DM Sans Medium Title */}
        <Text style={styles.headerTitle}>{headerTitle}</Text>

        {/* 1:1 Figma Invisible Spacer for symmetrical header alignment (opacity: 0, 48x48px) */}
        <View style={styles.headerSpacer} pointerEvents="none" />
      </View>

      {/* ── 1:1 Figma Staggered Portfolio Grid (167px columns, 24px colGap, 40px rowGap) ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.gridContainer}>
          {/* Left Column (167px wide, gap 40px: 239px, 188px, 239px) */}
          <View style={styles.column}>
            {leftColumnImages.map((item, index) => (
              <TouchableOpacity
                key={`left-${item.id || index}`}
                activeOpacity={0.85}
                onPress={() => handleImagePress(index * 2)}
              >
                <Image
                  source={item.image}
                  style={[styles.portfolioImage, { height: item.height }]}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Right Column (167px wide, gap 40px: 188px, 239px, 188px) */}
          <View style={styles.column}>
            {rightColumnImages.map((item, index) => (
              <TouchableOpacity
                key={`right-${item.id || index}`}
                activeOpacity={0.85}
                onPress={() => handleImagePress(index * 2 + 1)}
              >
                <Image
                  source={item.image}
                  style={[styles.portfolioImage, { height: item.height }]}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Native Dock protection */}
      <NativeDockSpacer />
    </SafeAreaView>
  );
}

export default ProviderStaffPortfolioScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  /* 1:1 Figma: width 390px, height 64px, padding 8px 16px */
  headerContainer: {
    width: '100%',
    maxWidth: 390,
    height: 64,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
    height: 48,
    opacity: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  /* 1:1 Figma: width 358px, colGap 24px */
  gridContainer: {
    width: 358,
    flexDirection: 'row',
    gap: 24,
  },
  /* 1:1 Figma: width 167px, rowGap 40px */
  column: {
    width: 167,
    gap: 40,
  },
  /* 1:1 Figma: width 167px, border-radius 24px */
  portfolioImage: {
    width: 167,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
  },
});
