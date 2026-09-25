import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import {
  Maximize2,
  X,
  Play,
  Pause,
  ChevronRight,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import Svg, { Path, Polygon } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { previewStore } from '../utils/previewStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface FloatingSalonVideoProps {
  videoThumbnail?: any;
  salonName?: string;
  topPosition?: number;
  serviceName?: string;
  price?: string;
  duration?: string;
  rating?: string;
  videoSource?: any;
}

export const FloatingSalonVideo: React.FC<FloatingSalonVideoProps> = ({
  videoThumbnail = require('../../assets/images/620f39dda80fe7971b4af170c890481a63da61b0.jpg'),
  videoSource,
  salonName = 'Luminous Lux',
  topPosition = 594,
  serviceName = 'Men Brade',
  price = '₦14,200',
  duration = '1hr',
  rating = '3.6',
}) => {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // Animated slide position (-104 = peek/collapsed matching Figma left: -104px, 0 = open)
  const slideAnim = useRef(new Animated.Value(-104)).current;

  const handleCollapse = () => {
    setIsCollapsed(true);
    Animated.spring(slideAnim, {
      toValue: -104, // Slides into left edge matching Figma left: -104px
      friction: 8,
      tension: 45,
      useNativeDriver: true,
    }).start();
  };

  const handleExpandOut = () => {
    setIsCollapsed(false);
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleOpenFullscreen = () => {
    // Set dynamic thumbnails so video screen shows this salon's actual content
    previewStore.setVideoThumbnails(videoThumbnail, undefined, videoSource);
    router.push({
      pathname: '/video',
      params: {
        title: `${salonName} Portfolio`,
        serviceName: serviceName,
        price: price,
        duration: duration,
        rating: rating,
        salonName: salonName,
      },
    } as any);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  return (
    <>
      {/* ─── Floating Video Frame (Figma: 124x176, radius 24px, left 16px) ─── */}
      <Animated.View
        style={[
          styles.floatingContainer,
          {
            top: topPosition,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.cardTouchable}
          activeOpacity={0.95}
          onPress={isCollapsed ? handleExpandOut : handleOpenFullscreen}
        >
          {/* Video Thumbnail Background */}
          <Image
            source={videoThumbnail}
            style={styles.videoBackground}
            resizeMode="cover"
          />

          {/* Dark Overlay gradient for contrast */}
          <View style={styles.thumbnailOverlay} />

          {/* Central Play Indicator (Figma Polygon 7) */}
          <View style={styles.playButtonCircle}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Polygon
                points="6,4 20,12 6,20"
                fill="#000814"
              />
            </Svg>
          </View>

          {/* Top Left: Expand Button */}
          <TouchableOpacity
            style={styles.controlButtonTopLeft}
            activeOpacity={0.8}
            onPress={handleOpenFullscreen}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Maximize2 size={15} color="#141B34" strokeWidth={2} />
          </TouchableOpacity>

          {/* Top Right: Collapse / X Button (slides back to corner) */}
          <TouchableOpacity
            style={styles.controlButtonTopRight}
            activeOpacity={0.8}
            onPress={handleCollapse}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={16} color="#141B34" strokeWidth={2.2} />
          </TouchableOpacity>

          {/* Collapsed Peek Handle (Right edge of card when collapsed) */}
          {isCollapsed && (
            <TouchableOpacity
              style={styles.collapsedTabHandle}
              activeOpacity={0.85}
              onPress={handleExpandOut}
            >
              <ChevronRight size={18} color="#141B34" strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* ─── Fullscreen Video Modal ─── */}
      <Modal
        visible={isFullscreen}
        transparent={false}
        animationType="fade"
        onRequestClose={handleCloseFullscreen}
      >
        <View style={styles.fullscreenModalContainer}>
          {/* Header Bar */}
          <View style={styles.fullscreenHeader}>
            <TouchableOpacity
              style={styles.fullscreenCloseBtn}
              activeOpacity={0.8}
              onPress={handleCloseFullscreen}
            >
              <X size={24} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>

            <Text style={styles.fullscreenTitle} numberOfLines={1}>
              {salonName} • Tour & Preview
            </Text>

            <TouchableOpacity
              style={styles.fullscreenSoundBtn}
              activeOpacity={0.8}
              onPress={() => setIsMuted(!isMuted)}
            >
              {isMuted ? (
                <VolumeX size={22} color="#FFFFFF" strokeWidth={2} />
              ) : (
                <Volume2 size={22} color="#FFFFFF" strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>

          {/* Video Player Display */}
          <View style={styles.videoPlayerWrapper}>
            <Image
              source={videoThumbnail}
              style={styles.fullscreenVideoImage}
              resizeMode="contain"
            />

            {/* Big Play / Pause Overlay Button */}
            <TouchableOpacity
              style={styles.fullscreenPlayOverlayBtn}
              activeOpacity={0.85}
              onPress={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause size={32} color="#FFFFFF" strokeWidth={2} />
              ) : (
                <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          {/* Bottom Video Controls & Duration */}
          <View style={styles.fullscreenControlsBottom}>
            {/* Progress Bar */}
            <View style={styles.progressBarTrack}>
              <View style={styles.progressBarFill} />
              <View style={styles.progressThumb} />
            </View>

            <View style={styles.durationRow}>
              <Text style={styles.durationText}>0:42 / 1:30</Text>
              <Text style={styles.videoBadge}>HD 1080p</Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // ── Floating Video Frame (Figma: 124x176, radius 24px, left 16px) ──
  floatingContainer: {
    position: 'absolute',
    left: 16,
    width: 124,
    height: 176,
    borderRadius: 24,
    zIndex: 999,
    // Figma multi-layer shadow
    shadowColor: 'rgba(130, 134, 140, 0.45)',
    shadowOffset: { width: 7, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  cardTouchable: {
    width: 124,
    height: 176,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000814',
    position: 'relative',
  },
  videoBackground: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 8, 20, 0.22)',
  },

  // ── Play Indicator (Figma Polygon 7, 40x40 circle) ──
  playButtonCircle: {
    position: 'absolute',
    left: 42,
    top: 68,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  // ── Control Button Top-Left: Expand (Figma 28x28, radius 24px) ──
  controlButtonTopLeft: {
    position: 'absolute',
    left: 8,
    top: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Control Button Top-Right: Cancel / Slide to Corner (Figma 28x28, radius 24px) ──
  controlButtonTopRight: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Collapsed Edge Peek Handle ──
  collapsedTabHandle: {
    position: 'absolute',
    right: 4,
    top: 72,
    width: 26,
    height: 32,
    borderTopLeftRadius: 13,
    borderBottomLeftRadius: 13,
    backgroundColor: 'rgba(247, 247, 247, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Fullscreen Video Modal Styles ──
  fullscreenModalContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  fullscreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 56,
  },
  fullscreenCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  fullscreenSoundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fullscreenVideoImage: {
    width: '100%',
    height: '100%',
  },
  fullscreenPlayOverlayBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  fullscreenControlsBottom: {
    paddingHorizontal: 24,
    gap: 12,
  },
  progressBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    position: 'relative',
    justifyContent: 'center',
  },
  progressBarFill: {
    width: '45%',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1A82FF',
  },
  progressThumb: {
    position: 'absolute',
    left: '44%',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  videoBadge: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontSize: 12,
    fontWeight: '600',
    color: '#1A82FF',
  },
});

export default FloatingSalonVideo;
