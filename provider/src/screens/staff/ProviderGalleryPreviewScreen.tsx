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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { ShareIcon } from '../../components/ShareIcon';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { previewStore } from '../../utils/previewStore';
import { shareStore } from '../../utils/shareStore';

function ArrowLeft02Icon({
  size = 24,
  color = '#FFFFFF',
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

function ClockIcon({ size = 16, color = 'rgba(248, 249, 250, 0.98)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 6v6l4 2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function StarGoldIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1 1 5.79L10 14.77l-5.21 2.74 1-5.79-4.21-4.1 5.82-.85L10 1.5z"
        fill="rgba(248, 155, 24, 0.96)"
      />
    </Svg>
  );
}

const DEFAULT_GALLERY_IMAGES = [
  require('../../../assets/images/profile/14dcc3440340f9f140251ac160473457c89b198c.jpg'),
  require('../../../assets/images/profile/30b9a5ab22324bd8357f666111d5584ad2e3c83e.jpg'),
  require('../../../assets/images/profile/eb3281d09659fdef5e45647cf5529f61e83190f1.jpg'),
  require('../../../assets/images/profile/dry_wow_pedicure.jpg'),
  require('../../../assets/images/profile/ee549b1ea85771de4cd8695943af94f474fedf19.jpg'),
  require('../../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg'),
];

export function ProviderGalleryPreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const pageTitle = (params.title as string) || 'Godwin Portfolio';

  let images = DEFAULT_GALLERY_IMAGES;
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
  const flatListRef = useRef<FlatList>(null);

  const viewerWidth = Math.min(358, (width > 0 ? width : 390) - 32);
  const estimatedHeight = Math.max(380, (height > 0 ? height : 844) - 64 - 116 - 90);
  const [viewerHeight, setViewerHeight] = useState<number>(estimatedHeight);

  const currentItem = previewItems && previewItems[activeIndex] ? previewItems[activeIndex] : null;
  const currentItemTitle =
    currentItem?.title ||
    (params.serviceName as string) ||
    (params.name as string) ||
    'Full Body Massage';
  const currentItemPrice = currentItem?.price || (params.price as string) || '₦14,200';
  const currentItemDuration = currentItem?.duration || (params.duration as string) || '1hr';
  const currentItemRating = currentItem?.rating || (params.rating as string) || '4.4';

  const hasScrolledInitialRef = useRef(false);

  useEffect(() => {
    if (!hasScrolledInitialRef.current && initialIndex >= 0 && images.length > 0) {
      hasScrolledInitialRef.current = true;
      const timer = setTimeout(() => {
        try {
          flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false });
        } catch {
          // Handled by onScrollToIndexFailed
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [initialIndex, images.length]);

  const updateIndexFromOffset = (offsetX: number, layoutWidth?: number) => {
    const w = layoutWidth && layoutWidth > 0 ? layoutWidth : viewerWidth;
    if (w > 0 && images.length > 0) {
      const nextIdx = Math.min(images.length - 1, Math.max(0, Math.round(offsetX / w)));
      setActiveIndex((prev) => (prev !== nextIdx ? nextIdx : prev));
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const w = event.nativeEvent.layoutMeasurement?.width || viewerWidth;
    updateIndexFromOffset(offsetX, w);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
    if (viewableItems && viewableItems.length > 0) {
      const first = viewableItems[0];
      if (first.index !== null && first.index !== undefined && first.index >= 0) {
        setActiveIndex(first.index);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
    waitForInteraction: false,
  }).current;

  const handleShare = () => {
    shareStore.openShare({
      title: currentItemTitle,
      status: 'Available',
      statusColor: 'rgba(12, 121, 12, 0.96)',
      url: `https://trend.app/provider/gallery-preview`,
      avatar: images[activeIndex],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0, 8, 20, 0.96)" />

      {/* ─── Top Header (Figma: height 64px, background: rgba(0, 8, 20, 0.96)) ─── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <ArrowLeft02Icon color="#FFFFFF" size={24} />
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

      {/* ─── Main Content Area: Floating Image Card ───────── */}
      <View
        style={[
          styles.carouselWrapper,
          {
            paddingBottom:
              Platform.OS === 'android'
                ? Math.max(insets.bottom, 56)
                : Math.max(16, insets.bottom + 8),
          },
        ]}
      >
        <View
          style={[
            styles.imageViewerContainer,
            {
              width: viewerWidth,
              flex: 1,
              marginTop: 12,
              marginBottom: 16,
              borderRadius: 0,
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
            decelerationRate="normal"
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
            onScroll={handleScroll}
            onMomentumScrollEnd={handleScroll}
            onScrollEndDrag={handleScroll}
            scrollEventThrottle={16}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
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
                  borderRadius: 0,
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

          {/* Top-Right Counter Badge: 1 / 6 */}
          {images.length > 1 && (
            <View style={styles.counterBadge} pointerEvents="none">
              <Text style={styles.counterText}>
                {activeIndex + 1} / {images.length}
              </Text>
            </View>
          )}

          {/* Bottom Pagination Dots */}
          {images.length > 1 && (
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

        {/* ─── Bottom Floating Service Card (358px x 116px) ── */}
        <View style={[styles.bottomMediaCard, { width: viewerWidth }]}>
          {/* Thumbnail Container (88px x 88px) */}
          <View style={styles.bottomMediaThumbContainer}>
            <Image
              source={images[activeIndex] || images[0]}
              style={styles.bottomMediaThumb}
              resizeMode="cover"
            />
          </View>

          {/* Details Column */}
          <View style={styles.bottomMediaInfo}>
            {/* Title (14px Regular) */}
            <Text style={styles.bottomMediaTitle} numberOfLines={1}>
              {currentItemTitle}
            </Text>

            {/* Price (16px Medium) */}
            <Text style={styles.bottomMediaPrice}>{currentItemPrice}</Text>

            {/* Duration & Rating Row */}
            <View style={styles.bottomMediaMetaRow}>
              <View style={styles.metaSubRow}>
                <ClockIcon size={16} />
                <Text style={styles.bottomMediaMetaText}>{currentItemDuration}</Text>
              </View>

              <View style={styles.metaSubRow}>
                <StarGoldIcon size={16} />
                <Text style={styles.bottomMediaMetaText}>{currentItemRating}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Android System Navigation Dock Barrier */}
      <NativeDockSpacer backgroundColor="rgba(0, 8, 20, 0.96)" />
    </SafeAreaView>
  );
}

export default ProviderGalleryPreviewScreen;

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
    borderRadius: 0,
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

  // ── Bottom Floating Card (358px x 116px, border) ──
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
