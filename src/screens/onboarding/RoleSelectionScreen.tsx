import React, { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { useSafeRouter } from '../../utils/safeNavigation';
import { OnboardingHeroVideo } from '../../components/OnboardingHeroVideo';
import { WebMobileViewport } from '../../components/WebMobileViewport';

type RoleOptionId = 'client' | 'business_owner' | 'staff';

interface RoleOption {
  id: RoleOptionId;
  label: string;
  route: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  { id: 'client', label: 'I am a client', route: '/sign-up' },
  { id: 'business_owner', label: 'I am a business owner', route: '/partner?tab=login' },
  { id: 'staff', label: 'I am a staff', route: '/partner/staff-login-code' },
];

export const RoleSelectionScreen: React.FC = () => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const screenHeight = windowHeight > 0 ? windowHeight : 844;
  const [selectedRole, setSelectedRole] = useState<RoleOptionId | null>(null);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const onBackPress = () => {
      safeRouter.replace('/' as any);
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [safeRouter]);

  const handleSelectRole = (option: RoleOption) => {
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    setSelectedRole(option.id);
    navTimerRef.current = setTimeout(() => {
      safeRouter.push(option.route as any);
    }, 110);
  };

  // Figma video frame height: 478 on 844 viewport (56.6%)
  const heroHeight = Math.min(screenHeight * 0.566, 478);

  return (
    <WebMobileViewport>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* Same looping muted video as onboarding screen */}
          <OnboardingHeroVideo height={heroHeight}>
            <Text
              style={[
                styles.topBrandMark,
                { top: Platform.OS === 'web' ? 63 : Math.max(insets.top + 12, 63) },
              ]}
            >
              Trend
            </Text>
          </OnboardingHeroVideo>

          {/* Lower sheet content: overlaps bottom fade per Figma top 465 vs hero height 478 (-13px) */}
          <SafeAreaView style={styles.contentSection} edges={['bottom']}>
            <View style={styles.innerColumn}>
              <Text style={styles.heading}>How can we help you?</Text>

              <View style={styles.optionsList}>
                {ROLE_OPTIONS.map((option) => {
                  const isSelected = selectedRole === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                      onPress={() => handleSelectRole(option)}
                      activeOpacity={0.8}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={option.label}
                    >
                      <Text style={styles.optionLabel}>{option.label}</Text>
                      <View style={styles.radioWrapper}>
                        <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                          {isSelected && <Check size={13} color="#FFFFFF" strokeWidth={2.5} />}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </SafeAreaView>
        </ScrollView>
      </View>
    </WebMobileViewport>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: 32,
  },
  topBrandMark: {
    position: 'absolute',
    left: 17,
    fontFamily: Platform.select({
      ios: 'SF Pro',
      android: 'DMSans_500Medium',
      web: 'DMSans_500Medium, sans-serif',
      default: 'DMSans_500Medium',
    }),
    ...(Platform.OS === 'web' ? { fontWeight: '400' as const } : { fontWeight: '500' as const }),
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.1,
    color: 'rgba(0, 8, 20, 0.96)',
    textShadowColor: 'rgba(255, 255, 255, 0.75)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    includeFontPadding: false,
    zIndex: 10,
  },
  contentSection: {
    flex: 1,
    backgroundColor: 'transparent',
    marginTop: -13,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  innerColumn: {
    width: '100%',
    maxWidth: 361,
    // Figma coordinate gap: options top 537 - (heading top 465 + height 32) = 40
    gap: 40,
  },
  heading: {
    width: '100%',
    fontFamily: Platform.select({
      ios: 'SF Pro',
      android: 'DMSans_600SemiBold',
      web: 'DMSans_600SemiBold, sans-serif',
      default: 'DMSans_600SemiBold',
    }),
    ...(Platform.OS === 'web' ? { fontWeight: '400' as const } : { fontWeight: '600' as const }),
    fontSize: 32,
    lineHeight: 32,
    letterSpacing: 0.6,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  optionsList: {
    width: '100%',
    gap: 24,
  },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderStyle: 'solid',
    borderRadius: 24,
  },
  optionCardSelected: {
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  optionLabel: {
    fontFamily: Platform.select({
      ios: 'SF Pro',
      android: 'DMSans_400Regular',
      web: 'DMSans_400Regular, sans-serif',
      default: 'DMSans_400Regular',
    }),
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
    includeFontPadding: false,
  },
  radioWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
});

export default RoleSelectionScreen;
