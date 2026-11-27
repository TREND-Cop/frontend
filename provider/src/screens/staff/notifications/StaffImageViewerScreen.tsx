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
import { useSafeRouter } from '../../../utils/safeNavigation';
import Svg, { Path } from 'react-native-svg';

import { useStaffNotifications } from '../../../context/StaffNotificationsContext';
import { NativeDockSpacer } from '../../../components/NativeDockSpacer';

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

interface StaffImageViewerScreenProps {
  id: string;
  initialIndex?: number;
}

export const StaffImageViewerScreen: React.FC<StaffImageViewerScreenProps> = ({
  id,
  initialIndex = 0,
}) => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { notifications } = useStaffNotifications();

  const item = notifications.find((n) => n.id === id);
  const images = item?.images || [];

  const [currentIndex, setCurrentIndex] = useState(
    Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0))
  );
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (initialIndex > 0 && images.length > initialIndex) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false });
      }, 50);
    }
  }, [initialIndex, images.length]);

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const nextIndex = Math.round(x / SCREEN_WIDTH);
    if (nextIndex >= 0 && nextIndex < images.length) {
      setCurrentIndex(nextIndex);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000814" />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* ── Page Header (Dark Variant, 64px, bg rgba(0,8,20,0.96)) ── */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => safeRouter.back()}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ArrowLeftWhiteIcon size={24} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Upload Image</Text>

          <View style={styles.headerRightSpacer} />
        </View>

        {/* ── Center Carousel Area ── */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={images}
            keyExtractor={(_, index) => `img-viewer-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumScrollEnd}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            renderItem={({ item: imgSource }) => (
              <View style={styles.imageSlide}>
                <Image
                  source={typeof imgSource === 'string' ? { uri: imgSource } : imgSource}
                  style={styles.fullImage}
                  resizeMode="cover"
                />
              </View>
            )}
          />

          {/* Top Right Counter Pill (Figma: width 49, height 28, left 325, top 16) */}
          {images.length > 0 && (
            <View style={styles.counterPill}>
              <Text style={styles.counterPillText}>
                {`${currentIndex + 1} / ${images.length}`}
              </Text>
            </View>
          )}

          {/* ── Tapering Carousel Dots Indicator (Figma 6 dots) ── */}
          <View style={styles.dotsIndicatorRow}>
            <View
              style={[
                styles.dot,
                {
                  width: currentIndex === 0 ? 8 : 6,
                  height: currentIndex === 0 ? 8 : 6,
                  borderRadius: 4,
                  backgroundColor: currentIndex === 0 ? '#FFFFFF' : 'rgba(247, 247, 247, 0.6)',
                },
              ]}
            />
            <View
              style={[
                styles.dot,
                {
                  width: currentIndex === 1 ? 8 : 6,
                  height: currentIndex === 1 ? 8 : 6,
                  borderRadius: 4,
                  backgroundColor: currentIndex === 1 ? '#FFFFFF' : 'rgba(247, 247, 247, 0.6)',
                },
              ]}
            />
            <View
              style={[
                styles.dot,
                {
                  width: currentIndex === 2 ? 8 : 5,
                  height: currentIndex === 2 ? 8 : 5,
                  borderRadius: 4,
                  backgroundColor: currentIndex === 2 ? '#FFFFFF' : 'rgba(247, 247, 247, 0.5)',
                },
              ]}
            />
            <View
              style={[
                styles.dot,
                {
                  width: currentIndex === 3 ? 8 : 4,
                  height: currentIndex === 3 ? 8 : 4,
                  borderRadius: 4,
                  backgroundColor: currentIndex === 3 ? '#FFFFFF' : 'rgba(247, 247, 247, 0.4)',
                },
              ]}
            />
            <View
              style={[
                styles.dot,
                {
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'rgba(247, 247, 247, 0.3)',
                },
              ]}
            />
            <View
              style={[
                styles.dot,
                {
                  width: 3,
                  height: 3,
                  borderRadius: 1.5,
                  backgroundColor: 'rgba(247, 247, 247, 0.2)',
                },
              ]}
            />
          </View>
        </View>

        {/* Android dock spacer barrier */}
        <NativeDockSpacer />
      </SafeAreaView>
    </View>
  );
};

export default StaffImageViewerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
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
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
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
    includeFontPadding: false,
  },
  headerRightSpacer: {
    width: 48,
    height: 48,
    opacity: 0,
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imageSlide: {
    width: SCREEN_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: 427,
  },
  counterPill: {
    position: 'absolute',
    top: 24,
    right: 16,
    width: 49,
    height: 28,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  counterPillText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  dotsIndicatorRow: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {},
});

