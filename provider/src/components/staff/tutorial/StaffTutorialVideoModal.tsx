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
import Svg, { Path, Rect } from 'react-native-svg';
import { StaffTutorialStep, STAFF_TUTORIAL_VIDEOS } from '../../../constants/staffTutorialSteps';
import { triggerLightHaptic } from '../../../utils/haptics';

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

export interface StaffTutorialVideoModalProps {
  visible: boolean;
  step: StaffTutorialStep | null;
  onBack: () => void;
  onNext?: () => void;
  totalSteps?: number;
  isTour?: boolean;
  customTitle?: string;
}

export const StaffTutorialVideoModal: React.FC<StaffTutorialVideoModalProps> = ({
  visible,
  step,
  onBack,
  onNext,
  totalSteps = 9,
  isTour = true,
  customTitle,
}) => {
  const insets = useSafeAreaInsets();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const stepNumber = step?.stepNumber ?? 1;
  const isFinalStep = stepNumber >= totalSteps;

  // Video source from STAFF_TUTORIAL_VIDEOS map
  const rawVideoSource = useMemo(() => {
    return STAFF_TUTORIAL_VIDEOS[stepNumber] ?? null;
  }, [stepNumber]);

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
        console.warn('Failed to auto-play staff tutorial video:', e);
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

  // AppState pause on background
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

  if (!visible || !step) return null;

  const togglePlayPause = () => {
    if (!videoSource || !player) return; // Inert when no video source exists
    triggerLightHaptic();
    try {
      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
      } else {
        player.play();
        setIsPlaying(true);
      }
    } catch (e) {
      console.warn('Toggle staff video error:', e);
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

        {/* ── Video Frame Container (Figma: width 390, height 561) ── */}
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

            {/* Top Right Counter Tag Pill: n / 9 (only shown during tour) */}
            {isTour && (
              <View style={styles.counterPill}>
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

            {/* Floating Action Button: "Next tutorial →" (on step 9: "Get started") (only shown during tour) */}
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
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    zIndex: 99999,
    elevation: 35,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'space-between',
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
    includeFontPadding: false,
  },
  headerRightPlaceholder: {
    width: 48,
    height: 48,
  },
  videoArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  videoFrame: {
    width: '100%',
    maxWidth: 390,
    height: 561,
    backgroundColor: '#000814',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  videoPlayer: {
    ...StyleSheet.absoluteFill,
  },
  videoPlaceholder: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#050D1A',
  },
  counterPill: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 68,
    height: 28,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  counterText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  centerPlayButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  centerPlayButtonInert: {
    opacity: 0.7,
  },
  pauseSymbolContainer: {
    flexDirection: 'row',
    gap: 8,
    width: 18,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseBar: {
    width: 5,
    height: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  nextTutorialButton: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  nextTutorialText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  progressContainer: {
    width: '100%',
    paddingHorizontal: 16,
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
    letterSpacing: 0.4,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: '#D9D9D9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: 'rgba(26, 130, 255, 0.9)',
    borderRadius: 4,
  },
});
