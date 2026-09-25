import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  useWindowDimensions,
  FlatList,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Play, Pause, Clock, Star } from 'lucide-react-native';
import { ShareIcon } from '../../components/ShareIcon';
import { SafeImage } from '../../components/ui/SafeImage';
import { previewStore } from '../../utils/previewStore';
import { shareStore } from '../../utils/shareStore';

const ALL_SERVICE_IMAGES = [
  require('../../../assets/images/profile/men_braids.jpg'),
  require('../../../assets/images/services/men_haircut.png'),
  require('../../../assets/images/620f39dda80fe7971b4af170c890481a63da61b0.jpg'),
  require('../../../assets/images/4218763aec656cbbdd9bfa7d3952a6234a3eefe6.jpg'),
  require('../../../assets/images/profile/14dcc3440340f9f140251ac160473457c89b198c.jpg'),
  require('../../../assets/images/profile/30b9a5ab22324bd8357f666111d5584ad2e3c83e.jpg'),
];

export default function GalleryPreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const source = params.source as string;
  const isVideo = params.isVideo === 'true' || source === 'video';

  // Dynamic titles matching Figma: "Portfolio" for video, "Luminous Lux Portfolio" for image portfolio
  const salonName = (params.salonName as string) || (params.salon as string) || 'Luminous Lux';
  const pageTitle = isVideo
    ? (params.title as string) || 'Portfolio'
    : (params.title as string) || `${salonName} Portfolio`;

  let images = ALL_SERVICE_IMAGES;
  const customImgs = previewStore.getPreviewImages();
  if (customImgs && customImgs.length > 0) {
    images = customImgs;
  }

  const resolveInitialIndex = () => {
    if (params.index !== undefined && params.index !== null && params.index !== '') {
      const p = parseInt(params.index as string, 10);
      if (!isNaN(p)) return p;
    }
    if (params.initialIndex !== undefined && params.initialIndex !== null && params.initialIndex !== '') {
      const p = parseInt(params.initialIndex as string, 10);
      if (!isNaN(p)) return p;
    }
    return previewStore.getInitialIndex();
  };

  const previewItems = previewStore.getPreviewItems();
  const initialIndex = Math.max(0, Math.min(resolveInitialIndex(), images.length - 1));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const isDraggingRef = useRef(false);

  // Exact card width matching the bottom card (358px max with 16px screen padding)
  const viewerWidth = Math.min(358, (width > 0 ? width : 390) - 32);
  const estimatedHeight = Math.max(380, (height > 0 ? height : 844) - 64 - 116 - 90);
  const [viewerHeight, setViewerHeight] = useState<number>(estimatedHeight);

  const currentItem = previewItems && previewItems[activeIndex] ? previewItems[activeIndex] : null;
  const currentItemTitle =
    currentItem?.title ||
    (params.serviceName as string) ||
    (params.name as string) ||
    (params.title as string) ||
    'Full Body Massage';
  const currentItemPrice = currentItem?.price || (params.price as string) || '₦14,200';
  const currentItemDuration = currentItem?.duration || (params.duration as string) || '1hr';
  const currentItemRating = currentItem?.rating || (params.rating as string) || '3.6';

  useEffect(() => {
    setActiveIndex(initialIndex);
    if (initialIndex >= 0 && images.length > 0) {
      const timer = setTimeout(() => {
        try {
          flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false });
        } catch {
          // Handled by onScrollToIndexFailed
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [viewerWidth, initialIndex, images.length]);

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    isDraggingRef.current = false;
    const scrollOffset = event.nativeEvent.contentOffset.x;
    if (viewerWidth > 0) {
      const currentIndex = Math.round(scrollOffset / viewerWidth);
      if (currentIndex >= 0 && currentIndex < images.length) {
        setActiveIndex(currentIndex);
      }
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!isDraggingRef.current) return;
    const scrollOffset = event.nativeEvent.contentOffset.x;
    if (viewerWidth > 0) {
      const currentIndex = Math.round(scrollOffset / viewerWidth);
      if (currentIndex >= 0 && currentIndex < images.length && currentIndex !== activeIndex) {
        setActiveIndex(currentIndex);
      }
    }
  };

  const handleShare = () => {
    shareStore.openShare({
      title: currentItemTitle,
      status: 'Available',
      statusColor: 'rgba(12, 121, 12, 0.96)',
      url: `https://trend.app/gallery-preview`,
      avatar: images[activeIndex],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0, 8, 20, 0.96)" />
      
      {/* ─── Top Header (Figma: height: 64px, padding: 8px 16px, background: rgba(0, 8, 20, 0.96)) ─── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)' as any);
            }
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <ArrowLeft color="#FFFFFF" size={24} strokeWidth={1.5} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>{pageTitle}</Text>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <ShareIcon color="#FFFFFF" size={24} />
        </TouchableOpacity>
      </View>

      {/* ─── Main Content Area: Comfortable floating image card aligned with bottom card ───────── */}
      <View style={[styles.carouselWrapper, { paddingBottom: Math.max(16, insets.bottom + 8) }]}>
        <View
          style={[
            styles.imageViewerContainer,
            {
              width: viewerWidth,
              flex: 1,
              marginTop: 12,
              marginBottom: 16,
              borderRadius: 24,
              overflow: 'hidden',
            },
          ]}
          onLayout={(e) => {
            const h = Math.round(e.nativeEvent.layout.height);
            if (h > 0 && Math.abs(h - viewerHeight) > 1) {
              setViewerHeight(h);
            }
          }}
        >
          <FlatList
            ref={flatListRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => `preview-img-${index}`}
            initialScrollIndex={initialIndex}
            getItemLayout={(_, index) => ({
              length: viewerWidth,
              offset: viewerWidth * index,
              index,
            })}
            initialNumToRender={images.length}
            maxToRenderPerBatch={images.length}
            windowSize={5}
            onScrollBeginDrag={() => {
              isDraggingRef.current = true;
            }}
            onScroll={handleScroll}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            scrollEventThrottle={16}
            onScrollToIndexFailed={(info) => {
              setTimeout(() => {
                flatListRef.current?.scrollToIndex({ index: info.index, animated: false });
              }, 50);
            }}
            style={{ width: viewerWidth, flex: 1 }}
            renderItem={({ item }) => (
              <View
                style={{
                  width: viewerWidth,
                  height: viewerHeight > 0 ? viewerHeight : '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden',
                  borderRadius: 24,
                }}
              >
                <Image
                  source={item}
                  style={{
                    width: viewerWidth,
                    height: viewerHeight > 0 ? viewerHeight : '100%',
                  }}
                  resizeMode="cover"
                />
              </View>
            )}
          />

          {/* Center Play/Pause button ONLY for video mode */}
          {isVideo && (
            <TouchableOpacity
              style={styles.playPauseCenterBtn}
              activeOpacity={0.8}
              onPress={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause size={28} color="#FFFFFF" />
              ) : (
                <Play size={28} color="#FFFFFF" fill="#FFFFFF" />
              )}
            </TouchableOpacity>
          )}

          {/* Top-Right Counter Badge for Image mode */}
          {!isVideo && images.length > 1 && (
            <View style={styles.counterBadge} pointerEvents="none">
              <Text style={styles.counterText}>
                {activeIndex + 1} / {images.length}
              </Text>
            </View>
          )}

          {/* Position Dot Indicators at the bottom of the image viewer */}
          {!isVideo && images.length > 1 && (
            <View style={styles.paginationDotsContainer}>
              {images.map((_, idx) => (
                <TouchableOpacity
                  key={`dot-${idx}`}
                  activeOpacity={0.7}
                  onPress={() => {
                    setActiveIndex(idx);
                    flatListRef.current?.scrollToIndex({ index: idx, animated: true });
                  }}
                  style={[
                    styles.paginationDot,
                    idx === activeIndex ? styles.paginationDotActive : styles.paginationDotInactive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* ─── Bottom Floating Service Card (Figma: hair cut categories, 358px x 116px, border: 1px solid rgba(235, 235, 245, 0.96)) ── */}
        <TouchableOpacity
          style={[styles.bottomMediaCard, { width: viewerWidth }]}
          activeOpacity={0.9}
          onPress={() => {
            router.push({
              pathname: '/professional/style-details',
              params: {
                name: currentItemTitle,
                title: currentItemTitle,
                price: currentItemPrice,
                duration: currentItemDuration,
                rating: currentItemRating,
                salonName: salonName,
              },
            } as any);
          }}
        >
          {/* Thumbnail Container (Figma: 88px x 88px, padding: 4px, white background with shadow) */}
          <View style={styles.bottomMediaThumbContainer}>
            <SafeImage
              source={images[activeIndex] || images[0]}
              style={styles.bottomMediaThumb}
              resizeMode="cover"
            />
          </View>

          {/* Details Column (Figma: Frame 1000006082, 232px x 80px) */}
          <View style={styles.bottomMediaInfo}>
            {/* Title (Figma: Label 14px SF Pro 400, color: rgba(248, 249, 250, 0.98)) */}
            <Text style={styles.bottomMediaTitle} numberOfLines={1}>
              {currentItemTitle}
            </Text>

            {/* Price (Figma: 16px SF Pro 510, color: rgba(248, 249, 250, 0.98)) */}
            <Text style={styles.bottomMediaPrice}>{currentItemPrice}</Text>

            {/* Duration & Rating Row (Figma: Frame 1000006081) */}
            <View style={styles.bottomMediaMetaRow}>
              <View style={styles.metaSubRow}>
                <Clock size={16} color="rgba(248, 249, 250, 0.98)" />
                <Text style={styles.bottomMediaMetaText}>{currentItemDuration}</Text>
              </View>

              <View style={styles.metaSubRow}>
                <Star size={16} color="rgba(248, 155, 24, 0.96)" fill="rgba(248, 155, 24, 0.96)" />
                <Text style={styles.bottomMediaMetaText}>{currentItemRating}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    zIndex: 10,
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
    color: 'rgba(255, 255, 255, 0.96)',
    textAlign: 'center',
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  imageViewerContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 26, 51, 0.4)',
  },
  counterBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  counterText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  playPauseCenterBtn: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  paginationDotsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    zIndex: 100,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: '#FFFFFF',
  },
  paginationDotInactive: {
    width: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },

  // ── Bottom Floating Card (Figma: hair cut categories, 358px x 116px, border) ──
  bottomMediaCard: {
    maxWidth: 358,
    minHeight: 116,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    backgroundColor: 'rgba(20, 26, 51, 0.4)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  bottomMediaThumbContainer: {
    width: 88,
    height: 88,
    borderRadius: 16,
    padding: 4,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.25)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 3,
  },
  bottomMediaThumb: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  bottomMediaInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  bottomMediaTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(248, 249, 250, 0.98)',
  },
  bottomMediaPrice: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.6,
    color: 'rgba(248, 249, 250, 0.98)',
  },
  bottomMediaMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  metaSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bottomMediaMetaText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(248, 249, 250, 0.98)',
  },
});
