import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  AppState,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import Svg, { Path } from 'react-native-svg';
import { getGuide, DEV_SAMPLE_GUIDE_VIDEO } from '../../constants/guideTopics';
import { triggerLightHaptic } from '../../utils/haptics';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

// ── Back Arrow (24x24, white stroke) ──────────────────────────────────────────
function WhiteBackArrow({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.57 5.93L3.5 12L9.57 18.07"
        stroke="#FFFFFF"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.5 12H3.67"
        stroke="#FFFFFF"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Pause Icon (circle 64x64, border 1.5px white, 2 vertical bars) ────────────
function PauseOverlayIcon({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Path
        d="M32 60C47.464 60 60 47.464 60 32C60 16.536 47.464 4 32 4C16.536 4 4 16.536 4 32C4 47.464 16.536 60 32 60Z"
        stroke="#FFFFFF"
        strokeWidth="2"
      />
      <Path
        d="M26 22V42M38 22V42"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ── Play Icon (circle 64x64, border 1.5px white, triangle) ────────────────────
function PlayOverlayIcon({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Path
        d="M32 60C47.464 60 60 47.464 60 32C60 16.536 47.464 4 32 4C16.536 4 4 16.536 4 32C4 47.464 16.536 60 32 60Z"
        stroke="#FFFFFF"
        strokeWidth="2"
      />
      <Path
        d="M27 23L43 32L27 41V23Z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

function formatTime(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  const mm = mins < 10 ? `0${mins}` : `${mins}`;
  const ss = secs < 10 ? `0${secs}` : `${secs}`;
  return `${mm}:${ss}`;
}

/**
 * 1:1 Figma VideoGuideScreen
 *
 * Implements:
 * - Dark background (#000814) with light-content status bar
 * - Header: back button + centered topic title
 * - Full-width video container (aspect ratio contain)
 * - Large circular pause/play button centered over the video
 * - Autoplay on open with pause toggle on tap
 * - Caption: "What is {topic in lowercase}"
 * - Thin blue progress bar with elapsed on left and total duration on right
 * - Pause on background / blur and cleanup on unmount
 */
export const VideoGuideScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ topic?: string }>();
  const topicId = params.topic || 'general';

  const guideData = useMemo(() => getGuide(topicId), [topicId]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Safe native source calculation
  const videoSource = useMemo(() => {
    const raw = guideData.videoSource || DEV_SAMPLE_GUIDE_VIDEO;
    if (Platform.OS === 'web') return raw;
    try {
      if (typeof raw === 'number') {
        const resolved = Image.resolveAssetSource(raw);
        if (resolved && resolved.uri) {
          return { uri: resolved.uri };
        }
      }
      return raw;
    } catch {
      return raw;
    }
  }, [guideData.videoSource]);

  // Player initialization
  const player = useVideoPlayer(videoSource, (p) => {
    try {
      p.loop = true;
      p.play();
      setIsPlaying(true);
    } catch (e) {
      console.warn('Failed to auto-play guide video:', e);
      setIsPlaying(false);
    }
  });

  // Track playback time and duration
  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      try {
        if (player.currentTime !== undefined) {
          setCurrentTime(player.currentTime);
        }
        if (player.duration !== undefined && player.duration > 0) {
          setDuration(player.duration);
        }
        if (player.playing !== undefined && player.playing !== isPlaying) {
          setIsPlaying(player.playing);
        }
      } catch {}
    }, 250);

    return () => clearInterval(interval);
  }, [player, isPlaying]);

  // AppState background pause handler
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active' && player) {
        try {
          player.pause();
          setIsPlaying(false);
        } catch {}
      }
    });

    return () => {
      sub.remove();
      if (player) {
        try {
          player.pause();
        } catch {}
      }
    };
  }, [player]);

  const togglePlayPause = () => {
    triggerLightHaptic();
    if (!player) return;

    try {
      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
      } else {
        player.play();
        setIsPlaying(true);
      }
    } catch (e) {
      console.warn('Toggle video error:', e);
    }
  };

  const handleBack = () => {
    triggerLightHaptic();
    if (player) {
      try {
        player.pause();
      } catch {}
    }
    router.back();
  };

  // Progress fraction (0 to 1)
  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#000814" />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={handleBack}
          accessibilityLabel="Back"
        >
          <WhiteBackArrow size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {guideData.title}
        </Text>

        <View style={styles.headerRightSpacer} />
      </View>

      {/* ── Video Area ───────────────────────────────────────────────────── */}
      <View style={styles.videoArea}>
        {videoSource ? (
          <TouchableOpacity
            activeOpacity={0.95}
            style={styles.videoWrapper}
            onPress={togglePlayPause}
          >
            <VideoView
              style={styles.videoPlayer}
              player={player}
              contentFit="contain"
              nativeControls={false}
            />

            {/* Centered Pause/Play overlay button */}
            <View style={styles.overlayControlContainer} pointerEvents="none">
              {isPlaying ? (
                <PauseOverlayIcon size={64} />
              ) : (
                <PlayOverlayIcon size={64} />
              )}
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.noVideoFallback}>
            <Text style={styles.noVideoText}>Guide video not available yet</Text>
          </View>
        )}
      </View>

      {/* ── Caption & Progress Bar Section ───────────────────────────────── */}
      <View style={styles.bottomContent}>
        {/* Caption */}
        <Text style={styles.captionText}>{guideData.caption}</Text>

        {/* Elapsed & Duration time row */}
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        {/* Progress Bar (Thin blue progress track) */}
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${progressRatio * 100}%` }]} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default VideoGuideScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000814',
  },
  /* Header: height 64px, paddingHorizontal: 16 */
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#000814',
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
    flex: 1,
  },
  headerRightSpacer: {
    width: 48,
  },

  /* Video Area: Full width, centered aspect ratio */
  videoArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000814',
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    maxHeight: 520,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  overlayControlContainer: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
  },
  noVideoFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noVideoText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },

  /* Bottom Content: caption, time row, progress bar */
  bottomContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
  },
  /* Caption text: 16px SF Pro 400, white */
  captionText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: '#FFFFFF',
  },
  /* Thin blue progress bar */
  progressBarTrack: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0C8CE4',
    borderRadius: 2,
  },
});
