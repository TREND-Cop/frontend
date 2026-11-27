import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  AppState,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import Svg, { Path } from 'react-native-svg';
import { triggerLightHaptic } from '../../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

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

function ArrowRightIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14.43 5.93L20.5 12L14.43 18.07"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3.5 12H20.33"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PauseSymbol() {
  return (
    <View style={styles.pauseSymbolContainer}>
      <View style={styles.pauseBar} />
      <View style={styles.pauseBar} />
    </View>
  );
}

function PlaySymbol() {
  return (
    <Svg width={20} height={24} viewBox="0 0 20 24" fill="none">
      <Path d="M2 3L18 12L2 21V3Z" fill="#FFFFFF" />
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

export interface TutorialStepLike {
  stepNumber: number;
  title: string;
  body: string;
  targetId?: string;
}

export interface TutorialVideoModalProps {
  visible: boolean;
  step: TutorialStepLike | null;
  onBack: () => void;
  onNext?: () => void;
  totalSteps?: number;
  isTour?: boolean;
  customTitle?: string;
  videoSources?: Record<number, any>;
  defaultVideoSource?: any;
}

export const TutorialVideoModal: React.FC<TutorialVideoModalProps> = ({
  visible,
  step,
  onBack,
  onNext,
  totalSteps = 11,
  isTour = true,
  customTitle,
  videoSources,
  defaultVideoSource,
}) => {
  const insets = useSafeAreaInsets();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const stepNumber = step?.stepNumber ?? 1;
  const isFinalStep = stepNumber >= totalSteps;

  // Video source from videoSources map or defaultVideoSource
  const rawVideoSource = useMemo(() => {
    if (videoSources && videoSources[stepNumber] !== undefined) {
      return videoSources[stepNumber];
    }
    return defaultVideoSource ?? null;
  }, [videoSources, stepNumber, defaultVideoSource]);

  const videoSource = useMemo(() => {
    if (!rawVideoSource) return null;
    if (Platform.OS === 'web') return rawVideoSource;
    try {
      if (typeof rawVideoSource === 'number') {
        const resolved = Image.resolveAssetSource(rawVideoSource);
        if (resolved && resolved.uri) {
          return { uri: resolved.uri };
        }
      }
      return rawVideoSource;
    } catch {
      return rawVideoSource;
    }
  }, [rawVideoSource]);

  // Player initialization via expo-video
  const player = useVideoPlayer(videoSource, (p) => {
    if (videoSource) {
      try {
        p.loop = true;
        p.play();
        setIsPlaying(true);
      } catch (e) {
        console.warn('Failed to auto-play tutorial video:', e);
        setIsPlaying(false);
      }
    }
  });

  // Track playback time
  useEffect(() => {
    if (!player || !videoSource) {
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      return;
    }

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
  }, [player, videoSource, isPlaying]);

  // Handle app background/foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState.match(/inactive|background/) && player) {
        try {
          player.pause();
          setIsPlaying(false);
        } catch {}
      }
    });
    return () => subscription.remove();
  }, [player]);

  // Pause on unmount or visibility change
  useEffect(() => {
    if (!visible && player) {
      try {
        player.pause();
        setIsPlaying(false);
      } catch {}
    }
  }, [visible, player]);

  if (!visible || !step) return null;

  const togglePlayPause = () => {
    triggerLightHaptic();
    if (!player || !videoSource) return;

    try {
      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
      } else {
        player.play();
        setIsPlaying(true);
      }
    } catch (e) {
      console.warn('Failed to toggle play/pause:', e);
    }
  };

  const handleBackPress = () => {
    triggerLightHaptic();
    if (player) {
      try {
        player.pause();
      } catch {}
    }
    onBack();
  };

  const handleNextPress = () => {
    triggerLightHaptic();
    if (player) {
      try {
        player.pause();
      } catch {}
    }
    onNext?.();
  };

  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

  return (
    <View style={styles.fullscreenModal} pointerEvents="box-none">
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#000814" />

        {/* ── Page Header (Figma 64px, back button + centered step title) ── */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={handleBackPress}
            accessibilityLabel="Back"
          >
            <WhiteBackArrow size={24} />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {customTitle || step.title}
          </Text>

          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* ── Video Frame Container: Sits perfectly in marked area ── */}
        <View style={styles.videoArea}>
          <View style={styles.videoFrame}>
            {videoSource ? (
              <VideoView
                style={styles.videoPlayer}
                player={player}
                contentFit="cover"
                nativeControls={false}
              />
            ) : (
              // Inert dark background when no video asset is provided
              <View style={styles.videoPlaceholder} />
            )}

            {/* Tap backdrop to toggle play/pause */}
            <TouchableOpacity
              activeOpacity={1}
              style={StyleSheet.absoluteFill}
              onPress={togglePlayPause}
            />

            {/* Top Right Counter Tag Pill: n / totalSteps (only shown during tour) */}
            {isTour && (
              <View style={styles.counterPill} pointerEvents="none">
                <Text style={styles.counterText}>
                  {stepNumber} / {totalSteps}
                </Text>
              </View>
            )}

            {/* Center Circular Pause/Play Button (Figma: 56x56, border 2px solid white, radius 28) */}
            <TouchableOpacity
              activeOpacity={videoSource ? 0.8 : 1}
              style={[
                styles.centerPlayButton,
                !videoSource && styles.centerPlayButtonInert,
              ]}
              onPress={togglePlayPause}
            >
              {isPlaying ? <PauseSymbol /> : <PlaySymbol />}
            </TouchableOpacity>

            {/* Floating Action Button: "Next tutorial →" (on final step: "Get started") */}
            {isTour && onNext && (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.nextTutorialButton}
                onPress={handleNextPress}
              >
                <Text style={styles.nextTutorialText}>
                  {isFinalStep ? 'Get started' : 'Next tutorial'}
                </Text>
                {!isFinalStep && <ArrowRightIcon size={24} />}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Video Timer & Progress Indicator (Figma: width 358, gap 6) ── */}
        <View style={styles.progressContainer}>
          {/* Times: Left = Elapsed, Right = Total Duration */}
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>

          {/* Progress Bar (height 4, background #D9D9D9, active rgba(26, 130, 255, 0.9)) */}
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressRatio * 100}%` },
              ]}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullscreenModal: {
    ...StyleSheet.absoluteFill,
    zIndex: 99999,
    backgroundColor: '#000814',
  },
  container: {
    flex: 1,
    backgroundColor: '#000814',
    justifyContent: 'space-between',
  },
  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    flex: 1,
    textAlign: 'center',
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#FFFFFF',
    paddingHorizontal: 8,
  },
  headerRightPlaceholder: {
    width: 48,
    height: 48,
  },
  // ── Video Frame (Sits perfectly filling the marked area) ─────────────────
  videoArea: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000814',
    overflow: 'hidden',
  },
  videoFrame: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000814',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  videoPlayer: {
    ...StyleSheet.absoluteFill,
  },
  videoPlaceholder: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0A1120',
  },
  counterPill: {
    position: 'absolute',
    top: 20,
    right: 20,
    height: 28,
    paddingHorizontal: 14,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  counterText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  centerPlayButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 8, 20, 0.4)',
    zIndex: 2,
  },
  centerPlayButtonInert: {
    opacity: 0.7,
  },
  pauseSymbolContainer: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBar: {
    width: 4,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  nextTutorialButton: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  nextTutorialText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.15,
    color: '#141B34',
  },
  // ── Progress Bar ──────────────────────────────────────────────────────────
  progressContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 6,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: '#D9D9D9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'rgba(26, 130, 255, 0.9)',
    borderRadius: 2,
  },
});
