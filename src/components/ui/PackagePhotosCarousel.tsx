import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from 'react-native';
import { SafeImage } from './SafeImage';

export interface PackagePhotosCarouselProps {
  images: any[];
}

export const PackagePhotosCarousel: React.FC<PackagePhotosCarouselProps> = ({ images }) => {
  const [activeDot, setActiveDot] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const has4Images = images && images.length >= 4;

  const defaultWidth = Dimensions.get('window').width - 64;
  const layoutWidth = containerWidth > 0 ? containerWidth : defaultWidth;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const width = e.nativeEvent.layoutMeasurement?.width || layoutWidth;
    if (width > 0) {
      const idx = Math.min(1, Math.max(0, Math.round(offsetX / width)));
      if (idx !== activeDot) {
        setActiveDot(idx);
      }
    }
  };

  const handleDotPress = (index: number) => {
    setActiveDot(index);
    scrollRef.current?.scrollTo({ x: index * layoutWidth, animated: true });
  };

  if (!images || images.length === 0) return null;

  return (
    <View
      style={styles.photosWrapper}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0 && Math.abs(w - containerWidth) > 1) {
          setContainerWidth(w);
        }
      }}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        snapToInterval={layoutWidth}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum={true}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        {/* Slide 1: 2x2 Grid (Primary Photos) */}
        <View style={[styles.imagesGrid, { width: layoutWidth }]}>
          <View style={styles.imageRow}>
            <View style={styles.imageCell}>
              <SafeImage source={images[0]} style={styles.gridImage} resizeMode="cover" />
            </View>
            <View style={styles.imageCell}>
              {images[1] ? (
                <SafeImage source={images[1]} style={styles.gridImage} resizeMode="cover" />
              ) : null}
            </View>
          </View>
          {images[2] && (
            <View style={styles.imageRow}>
              <View style={styles.imageCell}>
                <SafeImage source={images[2]} style={styles.gridImage} resizeMode="cover" />
              </View>
              <View style={styles.imageCell}>
                {images[3] ? (
                  <SafeImage source={images[3]} style={styles.gridImage} resizeMode="cover" />
                ) : null}
              </View>
            </View>
          )}
        </View>

        {/* Slide 2: 2x2 Grid (Transformation / Alternate Views) */}
        {has4Images && (
          <View style={[styles.imagesGrid, { width: layoutWidth }]}>
            <View style={styles.imageRow}>
              <View style={styles.imageCell}>
                <SafeImage
                  source={images[2] || images[0]}
                  style={styles.gridImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.imageCell}>
                <SafeImage
                  source={images[3] || images[1]}
                  style={styles.gridImage}
                  resizeMode="cover"
                />
              </View>
            </View>
            <View style={styles.imageRow}>
              <View style={styles.imageCell}>
                <SafeImage
                  source={images[0]}
                  style={styles.gridImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.imageCell}>
                <SafeImage
                  source={images[1]}
                  style={styles.gridImage}
                  resizeMode="cover"
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Carousel Indicator Dots */}
      {has4Images && (
        <View style={styles.indicatorRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleDotPress(0)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View
              style={activeDot === 0 ? styles.indicatorDotActive : styles.indicatorDotInactive}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleDotPress(1)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View
              style={activeDot === 1 ? styles.indicatorDotActive : styles.indicatorDotInactive}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  photosWrapper: {
    width: '100%',
    gap: 16,
  },
  imagesGrid: {
    gap: 8,
  },
  imageRow: {
    flexDirection: 'row',
    gap: 8,
  },
  imageCell: {
    flex: 1,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  indicatorDotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  indicatorDotInactive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },
});
