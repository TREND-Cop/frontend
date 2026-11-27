import React, { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Image, Platform, ViewStyle } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';

const VIDEO_SOURCE = require('../../assets/videos/lv_0_20260903090731.mp4');

export interface OnboardingHeroVideoProps {
  /** Height of the hero video container in px. */
  height: number;
  /** Optional style overrides for the outer container. */
  style?: ViewStyle;
  /** Optional overlays rendered inside the hero container above the gradient (e.g., brand mark). */
  children?: React.ReactNode;
}

/**
 * Shared muted, looping hero video header used on the TREND landing and role-selection screens.
 * Supports both HTML5 <video> on web and expo-video VideoView on native platforms.
 */
export const OnboardingHeroVideo: React.FC<OnboardingHeroVideoProps> = ({
  height,
  style,
  children,
}) => {
  const webVideoRef = useRef<any>(null);

  const videoUri = useMemo(() => {
    if (typeof VIDEO_SOURCE === 'string') return VIDEO_SOURCE;
    if (VIDEO_SOURCE && typeof VIDEO_SOURCE === 'object') {
      if ((VIDEO_SOURCE as any).uri) return (VIDEO_SOURCE as any).uri;
      if ((VIDEO_SOURCE as any).default) {
        return typeof (VIDEO_SOURCE as any).default === 'string'
          ? (VIDEO_SOURCE as any).default
          : (VIDEO_SOURCE as any).default?.uri || '/assets/assets/videos/lv_0_20260903090731.mp4';
      }
    }
    return '/assets/assets/videos/lv_0_20260903090731.mp4';
  }, []);

  const safeNativeSource = useMemo(() => {
    if (Platform.OS === 'web') return null;
    try {
      if (typeof VIDEO_SOURCE === 'number') {
        const resolved = Image.resolveAssetSource(VIDEO_SOURCE);
        if (resolved && resolved.uri) {
          return { uri: resolved.uri };
        }
      }
      return VIDEO_SOURCE;
    } catch {
      return null;
    }
  }, []);

  const player = useVideoPlayer(safeNativeSource, (p) => {
    try {
      p.loop = true;
      p.muted = true;
      p.play();
    } catch (e) {
      console.warn('Video player init callback error:', e);
    }
  });

  useEffect(() => {
    if (Platform.OS === 'web' && webVideoRef.current) {
      webVideoRef.current.muted = true;
      webVideoRef.current.defaultMuted = true;
      webVideoRef.current.loop = true;
      webVideoRef.current.playsInline = true;
      webVideoRef.current.play?.().catch(() => {
        // Browsers may defer autoplay until first user interaction if unmuted policies tighten
      });
    } else if (player) {
      try {
        player.muted = true;
        player.loop = true;
        player.play();
      } catch (e) {
        console.warn('Video player playback error:', e);
      }
    }
  }, [player]);

  return (
    <View style={[styles.heroFrame, { height }, style]}>
      {Platform.OS === 'web' ? (
        React.createElement('video', {
          ref: webVideoRef,
          src: videoUri,
          autoPlay: true,
          loop: true,
          muted: true,
          playsInline: true,
          style: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
            border: 0,
            backgroundColor: '#000000',
          },
        })
      ) : player && safeNativeSource ? (
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000814' }]} />
      )}

      {/* Figma Frame 1000006447 bottom fade (height 110px) */}
      <LinearGradient
        colors={[
          'rgba(255, 255, 255, 0)',
          'rgba(255, 255, 255, 0.45)',
          'rgba(255, 255, 255, 0.88)',
          '#FFFFFF',
        ]}
        locations={[0, 0.35, 0.72, 1]}
        style={styles.gradient}
        pointerEvents="none"
      />

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  heroFrame: {
    width: '100%',
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 110,
  },
});
