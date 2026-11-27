import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Platform,
  FlatList,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Path } from 'react-native-svg';

import { useStaffMember } from '../../context/StaffContext';
import { triggerLightHaptic } from '../../utils/haptics';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

// ── 1:1 Vector White Back Arrow (24x24) ──
function WhiteBackArrowIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.57 5.93L3.5 12L9.57 18.07"
        stroke="rgba(255, 255, 255, 0.96)"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.5 12H3.67"
        stroke="rgba(255, 255, 255, 0.96)"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma Full-Screen Photo Viewer (Frame V1)
 *
 * Implements:
 * - Full-screen dark container (#000814) with light-content status bar
 * - 64px header: White back arrow, centered "Image" title
 * - Paging horizontally through member's photos starting at tapped index
 * - Photo centered with resizeMode="contain", never stretched
 * - 1:1 Figma Pager dots with sliding window for 7+ photos
 * - Neutral placeholder fallback if an image fails to load
 * - Back button returns cleanly to Portfolio tab without skeleton reload
 */
export const StaffPhotoViewerScreen: React.FC = () => {
  const safeRouter = useSafeRouter();
  const { id, index } = useLocalSearchParams<{ id: string; index?: string }>();
  const { width: windowWidth } = useWindowDimensions();

  const staffMember = useStaffMember(id || '');
  const photos = staffMember?.portfolio || [];

  const initialIndex = Math.max(
    0,
    Math.min(parseInt(index || '0', 10) || 0, Math.max(0, photos.length - 1))
  );

  const [activeIndex, setActiveIndex] = useState<number>(initialIndex);
  const [failedPhotoIds, setFailedPhotoIds] = useState<Record<string, boolean>>({});
  const flatListRef = useRef<FlatList>(null);

  const handleBack = () => {
    triggerLightHaptic();
    safeRouter.back();
  };

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / windowWidth);
      if (newIndex >= 0 && newIndex < photos.length && newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    },
    [windowWidth, photos.length, activeIndex]
  );

  const renderDots = () => {
    if (photos.length <= 1) return null;

    // Sliding window of 7 dots if photos > 7
    const MAX_DOTS = 7;
    let dotIndices: number[] = [];

    if (photos.length <= MAX_DOTS) {
      dotIndices = photos.map((_, i) => i);
    } else {
      let start = Math.max(0, activeIndex - Math.floor(MAX_DOTS / 2));
      let end = start + MAX_DOTS;
      if (end > photos.length) {
        end = photos.length;
        start = Math.max(0, end - MAX_DOTS);
      }
      for (let i = start; i < end; i++) {
        dotIndices.push(i);
      }
    }

    return (
      <View
        style={styles.pagerDotsContainer}
        accessible
        accessibilityLabel={`Photo ${activeIndex + 1} of ${photos.length}`}
      >
        {dotIndices.map((idx) => {
          const isActive = idx === activeIndex;
          const distFromActive = Math.abs(idx - activeIndex);

          // Dot sizing per Figma CSS spec: 8px active, 6px, 5px, 4px, 3px for edge dots
          let dotSize = 8;
          let dotOpacity = 1;

          if (isActive) {
            dotSize = 8;
            dotOpacity = 1;
          } else if (distFromActive === 1) {
            dotSize = 6;
            dotOpacity = 0.8;
          } else if (distFromActive === 2) {
            dotSize = 5;
            dotOpacity = 0.6;
          } else {
            dotSize = 4;
            dotOpacity = 0.4;
          }

          return (
            <View
              key={idx}
              style={[
                styles.dot,
                {
                  width: dotSize,
                  height: dotSize,
                  borderRadius: dotSize / 2,
                  opacity: dotOpacity,
                  backgroundColor: '#FFFFFF',
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0, 8, 20, 0.96)" />

      {/* ── 1. Page Header (64px, back arrow, "Image" title) ── */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.headerButton}
          onPress={handleBack}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Back to staff portfolio"
        >
          <WhiteBackArrowIcon size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Image</Text>

        <View style={styles.headerButton} />
      </View>

      {/* ── 2. Full-Screen Horizontal Pager ── */}
      <View style={styles.pagerWrapper}>
        <FlatList
          ref={flatListRef}
          data={photos}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, idx) => ({
            length: windowWidth,
            offset: windowWidth * idx,
            index: idx,
          })}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          renderItem={({ item, index: photoIdx }) => {
            const hasFailed = failedPhotoIds[item.id];

            return (
              <View style={[styles.photoSlide, { width: windowWidth }]}>
                {!hasFailed ? (
                  <Image
                    source={typeof item.uri === 'string' ? { uri: item.uri } : item.uri}
                    style={[styles.heroImage, { width: windowWidth }]}
                    resizeMode="contain"
                    onError={() =>
                      setFailedPhotoIds((prev) => ({ ...prev, [item.id]: true }))
                    }
                    accessible
                    accessibilityLabel={`Photo ${photoIdx + 1} of ${photos.length}`}
                  />
                ) : (
                  // Neutral placeholder if photo failed to load
                  <View style={styles.failedPlaceholder}>
                    <Text style={styles.failedText}>Photo unavailable</Text>
                  </View>
                )}
              </View>
            );
          }}
        />
      </View>

      {/* ── 3. Bottom Pager Dots Indicator ── */}
      <View style={styles.bottomArea}>{renderDots()}</View>
    </SafeAreaView>
  );
};

export default StaffPhotoViewerScreen;

const styles = StyleSheet.create({
  container: {
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
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  pagerWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  photoSlide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    height: 427,
  },
  failedPlaceholder: {
    width: 280,
    height: 280,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  failedText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  bottomArea: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagerDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    backgroundColor: '#FFFFFF',
  },
});
