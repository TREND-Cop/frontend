import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Platform,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Path } from 'react-native-svg';

import { useNotifications } from '../../context/NotificationsContext';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';

function ArrowLeftWhiteIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.57 5.93L3.5 12l6.07 6.07"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.5 12H3.67"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface ImageViewerScreenProps {
  id: string;
  initialIndex?: number;
}

export const ImageViewerScreen: React.FC<ImageViewerScreenProps> = ({
  id,
  initialIndex = 0,
}) => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { notifications } = useNotifications();

  const item = notifications.find((n) => n.id === id);
  const images = item?.images || [];
  const totalCount = images.length;

  const [activeIndex, setActiveIndex] = useState(
    Math.min(Math.max(0, initialIndex), Math.max(0, totalCount - 1))
  );

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (initialIndex > 0 && initialIndex < totalCount) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false });
      }, 50);
    }
  }, [initialIndex, totalCount]);

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index >= 0 && index < totalCount) {
      setActiveIndex(index);
    }
  };

  if (!item || images.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000814" />
        <View style={styles.header}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => safeRouter.back()} style={styles.backButton}>
            <ArrowLeftWhiteIcon size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Image</Text>
          <View style={styles.headerRightSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No image available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000814" />

      {/* ── Header: Back Arrow + "Upload Image" ── */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => safeRouter.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <ArrowLeftWhiteIcon size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Upload Image</Text>

        <View style={styles.headerRightSpacer} />
      </View>

      {/* ── Full Width Image Carousel ── */}
      <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          data={images}
          keyExtractor={(_, index) => `viewer-img-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          renderItem={({ item: imageUri, index }) => (
            <View style={styles.slide}>
              <View style={styles.imageFrame}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.image}
                  resizeMode="contain"
                />

                {/* Top-Right Badge: Active Position / Total */}
                <View style={styles.positionBadge}>
                  <Text style={styles.positionBadgeText}>
                    {index + 1} / {totalCount}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      </View>

      {/* ── Bottom Page Dots Indicator (1 dot per image) ── */}
      {totalCount > 1 && (
        <View style={[styles.dotsContainer, { paddingBottom: Math.max(insets.bottom, 24) + 16 }]}>
          {images.map((_, dotIndex) => {
            const isActive = dotIndex === activeIndex;
            return (
              <View
                key={`dot-${dotIndex}`}
                style={[
                  styles.dot,
                  isActive ? styles.dotActive : styles.dotInactive,
                ]}
              />
            );
          })}
        </View>
      )}

      {/* Android dock protection */}
      <NativeDockSpacer />
    </SafeAreaView>
  );
};

export default ImageViewerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000814',
  },
  header: {
    width: '100%',
    height: 64,
    backgroundColor: '#000814',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerRightSpacer: {
    width: 48,
    height: 48,
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFrame: {
    width: SCREEN_WIDTH,
    height: 427,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  positionBadge: {
    position: 'absolute',
    top: 16,
    right: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionBadgeText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    color: '#000814',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
  },
  dot: {
    borderRadius: 4,
  },
  dotActive: {
    width: 8,
    height: 8,
    backgroundColor: '#FFFFFF',
  },
  dotInactive: {
    width: 6,
    height: 6,
    backgroundColor: 'rgba(247, 247, 247, 0.4)',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
