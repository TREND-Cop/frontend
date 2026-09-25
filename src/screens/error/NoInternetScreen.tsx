import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { typography } from '../../constants/theme';

// ── Exact Figma 1:1 Vector Illustration for No Internet Connection ──
export const NoInternetIllustration = ({ size = 150 }: { size?: number }) => (
  <View style={[styles.illustrationWrapper, { width: size, height: size }]}>
    {/* Soft Circle Backdrop */}
    <View style={styles.circleBackdrop} />

    {/* Stacked Tilted Card Underneath (Left) */}
    <View style={[styles.stackedCard, styles.stackedCardLeft]} />

    {/* Foreground Card with Slash-Wifi Icon */}
    <View style={styles.mainCard}>
      <Svg width={54} height={54} viewBox="0 0 52 52" fill="none">
        {/* Wifi Base Dot */}
        <Circle cx="26" cy="41" r="3.5" fill="rgba(96, 96, 102, 0.96)" />

        {/* Inner Wifi Arc */}
        <Path
          d="M19 33.5C21 31.5 23.4 30.5 26 30.5C28.6 30.5 31 31.5 33 33.5"
          stroke="rgba(96, 96, 102, 0.96)"
          strokeWidth={3.5}
          strokeLinecap="round"
        />

        {/* Middle Wifi Arc */}
        <Path
          d="M13 26.5C16.8 23 21.2 21 26 21C30.8 21 35.2 23 39 26.5"
          stroke="rgba(96, 96, 102, 0.96)"
          strokeWidth={3.5}
          strokeLinecap="round"
        />

        {/* Outer Wifi Arc */}
        <Path
          d="M7 19.5C12.3 14.5 18.8 12 26 12C33.2 12 39.7 14.5 45 19.5"
          stroke="rgba(96, 96, 102, 0.96)"
          strokeWidth={3.5}
          strokeLinecap="round"
        />

        {/* Diagonal Slash Line (Top-Right to Bottom-Left) */}
        <Path
          d="M41 12L11 42"
          stroke="rgba(96, 96, 102, 0.96)"
          strokeWidth={4.5}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  </View>
);

export interface NoInternetScreenProps {
  onReload?: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
}

export const NoInternetScreen: React.FC<NoInternetScreenProps> = ({
  onReload,
  title = 'Page Error',
  message = 'Please check your internet connection',
  buttonText = 'Reload',
}) => {
  const router = useRouter();
  const [isReloading, setIsReloading] = useState(false);

  const handleReload = async () => {
    if (isReloading) return;
    setIsReloading(true);
    try {
      if (onReload) {
        await Promise.resolve(onReload());
      } else {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/home');
        }
      }
    } catch {
      // Ignored
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.content}>
        {/* Vector Illustration */}
        <NoInternetIllustration size={150} />

        {/* Page Error Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Description Subtitle */}
        <Text style={styles.message}>{message}</Text>

        {/* Reload Action Button */}
        <TouchableOpacity
          style={styles.reloadButton}
          activeOpacity={0.85}
          onPress={handleReload}
          disabled={isReloading}
        >
          {isReloading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>{buttonText}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  // ── Illustration Styles ──
  illustrationWrapper: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  circleBackdrop: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#F2F4F7',
  },
  stackedCard: {
    position: 'absolute',
    width: 78,
    height: 94,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
  },
  stackedCardLeft: {
    transform: [{ rotate: '-14deg' }],
    left: 26,
    top: 26,
  },
  mainCard: {
    width: 78,
    height: 94,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0F2F5',
    shadowColor: '#858B94',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  // ── Typography & Action Button (100% Figma CSS) ──
  title: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    marginBottom: 40,
  },
  reloadButton: {
    width: 214,
    height: 48,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: 'rgba(133, 139, 148, 0.25)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },
  buttonText: {
    ...typography.button,
    textTransform: 'capitalize',
    color: '#FFFFFF',
  },
});

export default NoInternetScreen;
