import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Play } from 'lucide-react-native';
import { ShareIcon } from '../components/ShareIcon';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { shareStore } from '../utils/shareStore';
import { previewStore } from '../utils/previewStore';
import { getSafeBottomPadding } from '../utils/safeArea';
import { useVideoPlayer, VideoView } from 'expo-video';

const DEFAULT_VIDEO = require('../../assets/videos/generate_a_sec_video_on_beau.mp4');
const FALLBACK_VIDEO_THUMB = require('../../assets/images/custom/body_therapy_video_frame.jpg');

export default function VideoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const title = (params.title as string) || 'Body Improvement Therapy';
  const serviceName = (params.serviceName as string) || 'Full Body Therapy Treatment';

  const safeSource = useMemo(() => {
    const fromStore = previewStore.getVideoSource();
    const raw = fromStore || (params.videoSource ? { uri: params.videoSource as string } : DEFAULT_VIDEO);
    try {
      if (typeof raw === 'number') {
        const resolved = Image.resolveAssetSource(raw);
        if (resolved?.uri) {
          return { uri: resolved.uri };
        }
        return raw;
      }
      if (typeof raw === 'string') {
        return { uri: raw };
      }
      return raw;
    } catch {
      return raw;
    }
  }, [params.videoSource]);

  const videoThumbnail = useMemo(() => {
    const stored = previewStore.getVideoThumbnail();
    if (stored) return stored;
    return FALLBACK_VIDEO_THUMB;
  }, []);

  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTimeStr, setCurrentTimeStr] = useState('00:00');
  const [durationStr, setDurationStr] = useState('00:10');
  const [trackWidth, setTrackWidth] = useState(358);

  const durationSecRef = useRef<number>(10);
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  const player = useVideoPlayer(safeSource, (p) => {
    try {
      p.loop = true;
      p.muted = false;
      p.timeUpdateEventInterval = 0.1;
      p.play();
    } catch (e) {
      console.warn('Video player init callback error:', e);
    }
  });

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) secs = 0;
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const updateTimeAndProgress = useCallback((current: number, total: number) => {
    if (isNaN(current) || current < 0) current = 0;
    if (isNaN(total) || total <= 0) total = 10;
    durationSecRef.current = total;

    const boundedCurrent = Math.min(current, total);
    const p = total > 0 ? boundedCurrent / total : 0;
    setProgress(Math.min(1, Math.max(0, p)));

    setCurrentTimeStr(formatTime(boundedCurrent));
    setDurationStr(formatTime(total));
  }, []);

  const animateControls = (visible: boolean) => {
    Animated.timing(controlsOpacity, {
      toValue: visible ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const clearControlsTimer = useCallback(() => {
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
      hideControlsTimer.current = null;
    }
  }, []);

  const startAutoHideTimer = useCallback(() => {
    clearControlsTimer();
    hideControlsTimer.current = setTimeout(() => {
      setShowControls(false);
      animateControls(false);
    }, 2800);
  }, [clearControlsTimer]);

  const toggleControls = () => {
    if (showControls) {
      clearControlsTimer();
      setShowControls(false);
      animateControls(false);
    } else {
      setShowControls(true);
      animateControls(true);
      if (isPlaying) {
        startAutoHideTimer();
      }
    }
  };

  // Initial playback start
  useEffect(() => {
    if (!player) return;
    try {
      player.loop = true;
      player.timeUpdateEventInterval = 0.1;
      player.play();
      setIsPlaying(true);
      startAutoHideTimer();
    } catch (e) {
      console.warn('Player playback start error:', e);
    }
  }, [player, startAutoHideTimer]);

  // Player native event listeners
  useEffect(() => {
    if (!player || typeof player.addListener !== 'function') return;

    const subStatus = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') {
        try {
          if (isPlaying) {
            player.play();
          }
          if (player.duration && player.duration > 0) {
            durationSecRef.current = player.duration;
            setDurationStr(formatTime(player.duration));
          }
        } catch {}
      }
    });

    const subSourceLoad = player.addListener('sourceLoad', ({ duration: total }) => {
      if (total && total > 0) {
        durationSecRef.current = total;
        setDurationStr(formatTime(total));
      }
    });

    const subPlaying = player.addListener('playingChange', ({ isPlaying: playing }) => {
      setIsPlaying(playing);
      if (playing) {
        startAutoHideTimer();
      } else {
        clearControlsTimer();
        setShowControls(true);
        animateControls(true);
      }
    });

    const subTime = player.addListener('timeUpdate', ({ currentTime }) => {
      const total = player.duration || durationSecRef.current || 10;
      updateTimeAndProgress(currentTime, total);
    });

    const subEnd = player.addListener('playToEnd', () => {
      if (player.loop) {
        try {
          player.replay();
        } catch {}
      } else {
        setIsPlaying(false);
        clearControlsTimer();
        setShowControls(true);
        animateControls(true);
      }
    });

    return () => {
      subStatus?.remove?.();
      subSourceLoad?.remove?.();
      subPlaying?.remove?.();
      subTime?.remove?.();
      subEnd?.remove?.();
    };
  }, [player, isPlaying, startAutoHideTimer, clearControlsTimer, updateTimeAndProgress]);

  // Clean up player and timer on unmount
  useEffect(() => {
    return () => {
      if (player) {
        try {
          player.pause();
        } catch {}
      }
      clearControlsTimer();
    };
  }, [player, clearControlsTimer]);

  const togglePlayPause = () => {
    if (!player) return;
    try {
      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
        clearControlsTimer();
        setShowControls(true);
        animateControls(true);
      } else {
        if (player.duration && player.currentTime >= player.duration - 0.3) {
          player.replay();
        } else {
          player.play();
        }
        setIsPlaying(true);
        setShowControls(true);
        animateControls(true);
        startAutoHideTimer();
      }
    } catch (e) {
      console.warn('toggle play/pause error:', e);
    }
  };

  const handleSeekToProgress = (ratio: number) => {
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    const total = player?.duration || durationSecRef.current || 10;
    const newTime = clampedRatio * total;

    if (player) {
      try {
        player.currentTime = newTime;
      } catch {}
    }

    setProgress(clampedRatio);
    setCurrentTimeStr(formatTime(newTime));

    if (isPlaying) {
      startAutoHideTimer();
    }
  };

  const handleGoBack = () => {
    if (player) {
      try {
        player.pause();
      } catch {}
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)' as any);
    }
  };

  const handleShare = () => {
    shareStore.openShare({
      title: `${serviceName} - Video`,
      status: 'Available',
      statusColor: 'rgba(12, 121, 12, 0.96)',
      url: `https://trend.app/video/${serviceName.toLowerCase().replace(/\s+/g, '-')}`,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ─── Page Header (Figma: height 64px, padding 8x16, gap 10px) ───── */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Back Button (48x48px, radius 24px) */}
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ArrowLeft color="rgba(255, 255, 255, 0.96)" size={24} strokeWidth={1.5} />
          </TouchableOpacity>

          {/* Header Title (17px SF Pro, letterSpacing 0.2px) */}
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>

          {/* Share Button (48x48px, radius 8px) */}
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <ShareIcon color="#FFFFFF" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Video Frame Container ───────── */}
      <View style={styles.videoFrameContainer}>
        {player && safeSource ? (
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            nativeControls={false}
          />
        ) : (
          <Image
            source={videoThumbnail}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        )}

        {/* Full screen tap backdrop to toggle controls without interfering with play button */}
        <TouchableWithoutFeedback onPress={toggleControls}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        {/* Video Play / Pause Button with Smooth Auto-Hide Animation (56x56px, border 2px #FFFFFF, radius 28px) */}
        <Animated.View
          style={[
            styles.playButtonWrapper,
            { opacity: controlsOpacity },
          ]}
          pointerEvents={showControls ? 'auto' : 'none'}
        >
          <TouchableOpacity
            style={styles.playButton}
            onPress={togglePlayPause}
            activeOpacity={0.85}
          >
            {isPlaying ? (
              <View style={styles.pauseSymbol}>
                <View style={styles.pauseBar} />
                <View style={styles.pauseBar} />
              </View>
            ) : (
              <Play color="#FFFFFF" size={26} fill="#FFFFFF" style={styles.playIconOffset} />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* ─── Bottom Section: Video Scrubber with Interactive Seeking ─────── */}
      <View style={[styles.bottomSection, { paddingBottom: getSafeBottomPadding(insets, 24) }]}>
        {/* Video Timer & Progress Indicator (Figma: 358x26px, gap 6px) */}
        <View style={styles.scrubberContainer}>
          {/* Counter Row: Current Time (left) ... Total Duration (right) */}
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{currentTimeStr}</Text>
            <Text style={styles.timeText}>{durationStr}</Text>
          </View>

          {/* Interactive Progress Bar Track (358x24 touch target with 4px track, radius 4px) */}
          <View
            style={styles.progressBarTouchable}
            onLayout={(e) => {
              const w = e.nativeEvent.layout.width;
              if (w > 0) setTrackWidth(w);
            }}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={(e) => {
              const touchX = e.nativeEvent.locationX;
              if (trackWidth > 0) {
                handleSeekToProgress(touchX / trackWidth);
              }
            }}
            onResponderMove={(e) => {
              const touchX = e.nativeEvent.locationX;
              if (trackWidth > 0) {
                handleSeekToProgress(touchX / trackWidth);
              }
            }}
          >
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${Math.max(progress * 100, 2)}%` }]} />
              <View style={[styles.scrubberThumb, { left: `${Math.max(progress * 100, 2)}%` }]} />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ── Video Screen Container (Figma: background rgba(0, 8, 20, 0.96)) ──
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'space-between',
  },

  // ── Page Header (Figma: height 64px, padding 8x16, gap 10px) ──
  header: {
    height: 64,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    zIndex: 10,
  },
  headerContent: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(255, 255, 255, 0.96)',
    textAlign: 'center',
    flex: 1,
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },

  // ── Video Frame Container ──
  videoFrameContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },

  // ── Video Play Button (Figma: 56x56px, border 2px #FFFFFF, radius 28px) ──
  playButtonWrapper: {
    position: 'absolute',
    zIndex: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 8, 20, 0.45)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  pauseSymbol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 18,
    height: 22,
    paddingHorizontal: 1,
  },
  pauseBar: {
    width: 5,
    height: 22,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  playIconOffset: {
    marginLeft: 3,
  },

  // ── Bottom Section Layout ──
  bottomSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    zIndex: 10,
  },

  // ── Video Scrubber Progress Bar (Figma: 358x26px, gap 6px) ──
  scrubberContainer: {
    width: '100%',
    gap: 6,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 16,
  },
  timeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: '#FFFFFF',
  },
  progressBarTouchable: {
    width: '100%',
    height: 24,
    justifyContent: 'center',
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(235, 235, 245, 0.3)',
    position: 'relative',
    justifyContent: 'center',
  },
  progressBarFill: {
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(26, 130, 255, 0.95)',
  },
  scrubberThumb: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    top: -4,
    marginLeft: -6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});
