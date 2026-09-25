import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// ── Custom Animated 64x32px Toggle Switch (Figma Spec) ──
interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (newValue: boolean) => void;
}

const CustomToggleSwitch: React.FC<ToggleSwitchProps> = ({ value, onValueChange }) => {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [value]);

  const thumbTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 36],
  });

  const trackBgColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(248, 249, 250, 0.98)', 'rgba(12, 121, 12, 0.96)'],
  });

  const trackBorderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(235, 235, 245, 0.96)', 'rgba(12, 121, 12, 0.96)'],
  });

  const thumbBgColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(192, 192, 204, 0.96)', 'rgba(255, 255, 255, 0.96)'],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onValueChange(!value)}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Animated.View
        style={[
          styles.switchTrack,
          {
            backgroundColor: trackBgColor,
            borderColor: trackBorderColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.switchThumb,
            {
              transform: [{ translateX: thumbTranslateX }],
              backgroundColor: thumbBgColor,
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

import { useUserContext } from '../../store/UserContext';

export const BiometricsScreen: React.FC = () => {
  const router = useRouter();
  const { profileData, setBiometricsEnabled } = useUserContext();
  const [isFaceIdEnabled, setIsFaceIdEnabled] = useState(
    profileData.biometricsEnabled ?? false
  );

  const handleToggle = (val: boolean) => {
    setIsFaceIdEnabled(val);
    setBiometricsEnabled(val);
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile' as any);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── Page Header (Figma: height 64px, borderBottom 1px solid rgba(235, 235, 245, 0.96)) ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Biometrics</Text>

        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* ── Scrollable Body Area (Figma: top 147px -> paddingTop 40px) ── */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Biometrics Card (Figma: height 48px, background rgba(247, 247, 247, 0.96), border 1px solid rgba(235, 235, 245, 0.96), borderRadius 16px) */}
        <View style={styles.optionCard}>
          <Text style={styles.optionLabel}>Enable Face ID</Text>
          <CustomToggleSwitch
            value={isFaceIdEnabled}
            onValueChange={handleToggle}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header (Figma: height 64px, borderBottom 1px solid rgba(235, 235, 245, 0.96)) ──
  header: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  headerRightPlaceholder: {
    width: 48,
    height: 48,
  },

  // ── Scroll Content (Figma: top 147px -> paddingTop 40px, paddingHorizontal 16px) ──
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 24,
  },

  // ── Biometrics Option Card (Figma: height 48px, borderRadius 16px, padding 8px 16px) ──
  optionCard: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },

  // ── Custom Toggle Switch (64x32px, borderRadius 24px) ──
  switchTrack: {
    width: 64,
    height: 32,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    position: 'relative',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
