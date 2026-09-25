import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Platform, View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { useVideoPlayer, VideoView } from 'expo-video';

export interface VideoCardProps {
  thumbnailUrl: any; // URL or require()
  videoSource?: any;
  duration?: string;
  onPress?: () => void;
  onBookNowPress?: () => void;
  title?: string;
  subtitle?: string;
}

export function VideoCard({
  thumbnailUrl,
  videoSource,
  duration = "00:10",
  onPress,
  onBookNowPress,
  title = "Experience advanced body improvement treatments",
}: VideoCardProps) {
  const durationSecRef = useRef<number>(10);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTimeStr, setCurrentTimeStr] = useState('00:00');
  const [totalDurationStr, setTotalDurationStr] = useState(duration);
  const [trackWidth, setTrackWidth] = useState(0);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) secs = 0;
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const safeSource = useMemo(() => {
    if (!videoSource) return null;
    try {
      if (typeof videoSource === 'number') {
        const resolved = Image.resolveAssetSource(videoSource);
        if (resolved?.uri) {
          return { uri: resolved.uri };
        }
        return videoSource;
      }
      if (typeof videoSource === 'string') {
        return { uri: videoSource };
      }
      return videoSource;
    } catch {
      return videoSource;
    }
  }, [videoSource]);

  const player = useVideoPlayer(safeSource, (p) => {
    try {
      p.loop = true;
      p.muted = true;
      p.timeUpdateEventInterval = 0.1;
      p.play();
    } catch (e) {
      console.warn('VideoCard player error:', e);
    }
  });

  useEffect(() => {
    if (!player) return;
    try {
      player.loop = true;
      player.muted = isMuted;
      player.timeUpdateEventInterval = 0.1;
    } catch {}
  }, [player, isMuted]);

  useEffect(() => {
    if (!player || typeof player.addListener !== 'function') return;

    const subPlaying = player.addListener('playingChange', ({ isPlaying: playing }) => {
      setIsPlaying(playing);
    });

    const subTime = player.addListener('timeUpdate', ({ currentTime }) => {
      const dur = player.duration || durationSecRef.current || 10;
      const cur = Math.max(0, Math.min(currentTime || 0, dur));
      if (dur > 0) {
        setProgress(cur / dur);
      }
      setCurrentTimeStr(formatTime(cur));
    });

    const subSourceLoad = player.addListener('sourceLoad', ({ duration: dur }) => {
      if (dur && dur > 0) {
        durationSecRef.current = dur;
        setTotalDurationStr(formatTime(dur));
      }
    });

    const subStatus = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') {
        if (player.duration && player.duration > 0) {
          durationSecRef.current = player.duration;
          setTotalDurationStr(formatTime(player.duration));
        }
      }
    });

    return () => {
      subPlaying?.remove?.();
      subTime?.remove?.();
      subSourceLoad?.remove?.();
      subStatus?.remove?.();
    };
  }, [player]);

  useEffect(() => {
    return () => {
      if (player) {
        try {
          player.pause();
        } catch {}
      }
    };
  }, [player]);

  const handleOpenVideo = () => {
    if (player) {
      try {
        player.pause();
        setIsPlaying(false);
      } catch {}
    }
    onPress?.();
  };

  const handlePlayPause = (e: any) => {
    e?.stopPropagation?.();
    if (!player) return;
    try {
      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
      } else {
        if (player.duration && player.currentTime >= player.duration - 0.2) {
          player.replay();
        } else {
          player.play();
        }
        setIsPlaying(true);
      }
    } catch (err) {
      console.warn('Play/pause error:', err);
    }
  };

  const handleToggleVolume = (e: any) => {
    e?.stopPropagation?.();
    if (player) {
      try {
        const nextMuted = !player.muted;
        player.muted = nextMuted;
        setIsMuted(nextMuted);
      } catch (err) {
        console.warn('Volume toggle error:', err);
      }
    } else {
      setIsMuted(!isMuted);
    }
  };

  const handleMaximize = (e: any) => {
    e?.stopPropagation?.();
    handleOpenVideo();
  };

  const handleSeekToProgress = (ratio: number) => {
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    const dur = player?.duration || durationSecRef.current || 10;
    const targetTime = clampedRatio * dur;
    if (player) {
      try {
        player.currentTime = targetTime;
      } catch {}
    }
    setProgress(clampedRatio);
    setCurrentTimeStr(formatTime(targetTime));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.touchable} activeOpacity={0.9} onPress={handleOpenVideo}>
        <View style={styles.thumbnail}>
          {player && safeSource ? (
            <VideoView
              player={player}
              style={styles.thumbnailImage}
              contentFit="cover"
              nativeControls={false}
            />
          ) : (
            <Image
              source={typeof thumbnailUrl === 'string' ? { uri: thumbnailUrl } : thumbnailUrl}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
          )}

          {/* Semi-transparent dark cinematic tint overlay */}
          <View style={styles.tintOverlay} pointerEvents="none" />

          {/* Overlay controls container */}
          <View style={styles.overlayContent} pointerEvents="box-none">
            {/* Top row controls */}
            <View style={styles.topRow} pointerEvents="box-none">
              <TouchableOpacity style={styles.iconCircle} activeOpacity={0.7} onPress={handleToggleVolume}>
                {isMuted ? <VolumeX color="#FFF" size={18} /> : <Volume2 color="#FFF" size={18} />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconCircle} activeOpacity={0.7} onPress={handleMaximize}>
                <Maximize color="#FFF" size={18} />
              </TouchableOpacity>
            </View>

            {/* Centered play/pause button */}
            <View style={styles.centerRow} pointerEvents="box-none">
              <TouchableOpacity
                style={styles.playButton}
                activeOpacity={0.8}
                onPress={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause color="#FFF" size={28} fill="#FFF" />
                ) : (
                  <Play color="#FFF" size={30} fill="#FFF" style={styles.playIconOffset} />
                )}
              </TouchableOpacity>
            </View>

            {/* Bottom timeline controls: Left is current playback time, Right is total duration */}
            <View style={styles.bottomRow} pointerEvents="box-none">
              <Text style={styles.timeText}>{currentTimeStr}</Text>
              <View
                style={styles.progressBarContainer}
                onLayout={(e) => {
                  const w = e.nativeEvent.layout.width;
                  if (w > 0) setTrackWidth(w);
                }}
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                onResponderGrant={(e) => {
                  e?.stopPropagation?.();
                  const touchX = e.nativeEvent.locationX;
                  if (trackWidth > 0) {
                    handleSeekToProgress(touchX / trackWidth);
                  }
                }}
                onResponderMove={(e) => {
                  e?.stopPropagation?.();
                  const touchX = e.nativeEvent.locationX;
                  if (trackWidth > 0) {
                    handleSeekToProgress(touchX / trackWidth);
                  }
                }}
              >
                <View style={[styles.progressBarFill, { width: `${Math.max(progress * 100, 2)}%` }]} />
              </View>
              <Text style={styles.timeText}>{totalDurationStr || duration}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText} numberOfLines={2}>
          {title}
        </Text>
        <TouchableOpacity style={styles.bookButton} onPress={onBookNowPress}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'stretch',
    marginBottom: 0,
  },
  touchable: {
    width: '100%',
    alignSelf: 'stretch',
  },
  thumbnail: {
    width: '100%',
    alignSelf: 'stretch',
    height: 225,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E1E1E',
  },
  thumbnailImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  tintOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
  overlayContent: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  topRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  bottomRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#FFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 12,
    fontWeight: '500',
    includeFontPadding: false,
  },
  progressBarContainer: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 10,
    borderRadius: 2,
    overflow: 'hidden',
  },
  playIconOffset: {
    marginLeft: 3,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 4,
    width: '100%',
    alignSelf: 'stretch',
  },
  footerText: {
    ...theme.typography.bodyRegular,
    color: theme.colors.barberPrimarySupport,
    flex: 1,
    marginRight: 16,
  },
  bookButton: {
    backgroundColor: theme.colors.barberPrimary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  bookButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontSize: 14,
  },
});
