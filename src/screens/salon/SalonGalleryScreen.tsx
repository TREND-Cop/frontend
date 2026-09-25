import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { ShareIcon } from '../../components/ShareIcon';
import { SafeImage } from '../../components/ui/SafeImage';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';
import { MOCK_SALONS } from '../home/mockSalons';
import { previewStore } from '../../utils/previewStore';
import { shareStore } from '../../utils/shareStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Verified Blue Shield Check Icon ──
const VerifiedShieldIcon = ({ size = 18 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L4 5V11C4 16.52 7.41 21.62 12 22.95C16.59 21.62 20 16.52 20 11V5L12 2Z"
      fill="#1A82FF"
      stroke="#1A82FF"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 12L11 14L15 10"
      stroke="#FFFFFF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 8 Masonry Gallery items (staggered heights: Left 239, 188, 239, 188; Right 188, 239, 188, 239)
export const SALON_MASONRY_IMAGES = [
  // Left Column
  {
    id: 'l1',
    col: 'left',
    height: 239,
    source: require('../../../assets/images/profile/b4bdda58fe4760cb04cb35cca583a63e04b99e77.jpg'),
    title: 'Corn Row Dreadlocks',
    price: '₦14,200',
    duration: '1hr',
    rating: '4.6',
  },
  {
    id: 'l2',
    col: 'left',
    height: 188,
    source: require('../../../assets/images/profile/30b9a5ab22324bd8357f666111d5584ad2e3c83e.jpg'),
    title: 'Men Fade & Beard Trim',
    price: '₦9,500',
    duration: '45min',
    rating: '4.8',
  },
  {
    id: 'l3',
    col: 'left',
    height: 239,
    source: require('../../../assets/images/profile/eb3281d09659fdef5e45647cf5529f61e83190f1.jpg'),
    title: 'Locs Maintenance & Retwist',
    price: '₦18,000',
    duration: '1hr 30min',
    rating: '4.7',
  },
  {
    id: 'l4',
    col: 'left',
    height: 188,
    source: require('../../../assets/images/profile/a44768df76965402c7083306472d2392050076db.jpg'),
    title: 'Box Braids With Fade',
    price: '₦22,000',
    duration: '2hrs',
    rating: '4.9',
  },

  // Right Column
  {
    id: 'r1',
    col: 'right',
    height: 188,
    source: require('../../../assets/images/profile/14dcc3440340f9f140251ac160473457c89b198c.jpg'),
    title: 'Acrylic Nail Extensions',
    price: '₦12,500',
    duration: '50min',
    rating: '4.5',
  },
  {
    id: 'r2',
    col: 'right',
    height: 239,
    source: require('../../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg'),
    title: '47 Handsome Barrel Roll Locs',
    price: '₦16,000',
    duration: '1hr 15min',
    rating: '4.7',
  },
  {
    id: 'r3',
    col: 'right',
    height: 188,
    source: require('../../../assets/images/profile/ee549b1ea85771de4cd8695943af94f474fedf19.jpg'),
    title: 'Full Body Massage',
    price: '₦14,200',
    duration: '1hr',
    rating: '3.6',
  },
  {
    id: 'r4',
    col: 'right',
    height: 239,
    source: require('../../../assets/images/profile/dry_wow_pedicure.jpg'),
    title: 'Dry Wow Pedicure',
    price: '₦11,000',
    duration: '40min',
    rating: '4.6',
  },
];

export const SalonGalleryScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const salonId = (params.salonId as string) || '1';
  const salon = useMemo(() => {
    return {
      id: salonId,
      name: (params.name as string) || 'Luminous Lux',
      isVerified: true,
    };
  }, [salonId, params]);

  const leftColumnImages = SALON_MASONRY_IMAGES.filter((img) => img.col === 'left');
  const rightColumnImages = SALON_MASONRY_IMAGES.filter((img) => img.col === 'right');

  const orderedGalleryImages = useMemo(() => {
    const items: typeof SALON_MASONRY_IMAGES = [];
    const maxLen = Math.max(leftColumnImages.length, rightColumnImages.length);
    for (let i = 0; i < maxLen; i++) {
      if (leftColumnImages[i]) items.push(leftColumnImages[i]);
      if (rightColumnImages[i]) items.push(rightColumnImages[i]);
    }
    return items;
  }, [leftColumnImages, rightColumnImages]);

  const handleShare = () => {
    shareStore.openShare({
      title: `${salon.name} Gallery`,
      status: 'Available',
      statusColor: 'rgba(12, 121, 12, 0.96)',
      url: `https://trend.app/salon/${salon.id}/gallery`,
    });
  };

  const handleImagePress = (index: number) => {
    previewStore.setPreviewImages(
      orderedGalleryImages.map((img) => img.source),
      `${salon.name} Gallery`,
      orderedGalleryImages.map((img) => ({
        image: img.source,
        title: img.title,
        price: img.price,
        duration: img.duration,
        rating: img.rating,
      })),
      index
    );
    router.push({
      pathname: '/professional/gallery-preview',
      params: { index, initialIndex: index, source: 'salon', title: `${salon.name} Gallery` },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Page Header (Figma: height: 64px, padding: 8px 16px) ─────────── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (router.canGoBack() ? router.back() : router.replace(`/salon/${salon.id}` as any))}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
        </TouchableOpacity>

        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {salon.name}
          </Text>
          {salon.isVerified && <VerifiedShieldIcon size={18} />}
        </View>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ShareIcon size={24} color="#141B34" />
        </TouchableOpacity>
      </View>

      {/* ── Masonry 2-Column Scroll Area ──────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 }]}
      >
        <View style={styles.masonryContainer}>
          {/* Left Column (167px width) */}
          <View style={styles.masonryColumn}>
            {leftColumnImages.map((item, idx) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.imageCard, { height: item.height }]}
                activeOpacity={0.88}
                onPress={() => handleImagePress(idx * 2)}
              >
                <SafeImage source={item.source} style={styles.masonryImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Right Column (167px width) */}
          <View style={styles.masonryColumn}>
            {rightColumnImages.map((item, idx) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.imageCard, { height: item.height }]}
                activeOpacity={0.88}
                onPress={() => handleImagePress(idx * 2 + 1)}
              >
                <SafeImage source={item.source} style={styles.masonryImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      <NativeDockSpacer />
    </SafeAreaView>
  );
};

const columnWidth = (SCREEN_WIDTH - 32 - 16) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header (Figma: height: 64px, padding: 8px 16px)
  headerRow: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  masonryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  masonryColumn: {
    width: columnWidth,
    gap: 24,
  },
  imageCard: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  masonryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
});

export default SalonGalleryScreen;
