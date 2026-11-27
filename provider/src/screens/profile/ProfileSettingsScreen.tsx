import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

import { useProviderProfile } from '../../context/ProviderProfileContext';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';

function ArrowLeftIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M11 6l-6 6 6 6"
        stroke="#000814"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ShareIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="18" cy="5" r="3" stroke="#141B34" strokeWidth="1.5" />
      <Circle cx="6" cy="12" r="3" stroke="#141B34" strokeWidth="1.5" />
      <Circle cx="18" cy="19" r="3" stroke="#141B34" strokeWidth="1.5" />
      <Path
        d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ChevronRightIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18l6-6-6-6"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SquareLockIcon({ size = 20, color = 'rgba(96, 96, 102, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Rect
        x="3.5"
        y="8"
        width="13"
        height="10"
        rx="2.5"
        stroke={color}
        strokeWidth="1.2"
      />
      <Path
        d="M6.5 8V5.5a3.5 3.5 0 017 0V8"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <Circle cx="10" cy="13" r="1.2" fill={color} />
    </Svg>
  );
}

export function ProviderProfileSettingsScreen() {
  const safeRouter = useSafeRouter();
  const { isNameLocked, nameChangeLockDaysRemaining } = useProviderProfile();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;

  const showLockToast = () => {
    setToastMessage(`Name change unavailable until ${nameChangeLockDaysRemaining} days`);
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(2200),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setToastMessage(null));
  };

  const handleIdNamePress = () => {
    if (isNameLocked) {
      showLockToast();
    } else {
      safeRouter.push('/change-username' as any);
    }
  };

  const handlePhotoPress = () => {
    safeRouter.push('/change-profile-photo' as any);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Manage your Trend Business profile credentials and identity.',
      });
    } catch (e) {
      // Ignored
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {/* ── Fixed Header (height: 64px) ── */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => safeRouter.back()}
          style={styles.headerButton}
        >
          <ArrowLeftIcon size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Profile Settings</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleShare}
          style={styles.headerButton}
        >
          <ShareIcon size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardGroup}>
          {/* Row 1: ID Name Change */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleIdNamePress}
            style={styles.optionRow}
          >
            <Text style={styles.optionLabel}>ID Name Change</Text>
            <View style={styles.rowRight}>
              {isNameLocked && (
                <View style={styles.lockBadge}>
                  <SquareLockIcon size={16} />
                  <Text style={styles.lockBadgeText}>{nameChangeLockDaysRemaining}d</Text>
                </View>
              )}
              <ChevronRightIcon size={24} />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Row 2: Change Profile Photo */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePhotoPress}
            style={styles.optionRow}
          >
            <Text style={styles.optionLabel}>Change Profile Photo</Text>
            <ChevronRightIcon size={24} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Floating Lock Toast ── */}
      {toastMessage && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <SquareLockIcon size={16} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      <NativeDockSpacer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 60,
  },
  cardGroup: {
    width: '100%',
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  optionLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(235, 235, 245, 0.6)',
  },
  lockBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    width: '100%',
  },
  toastContainer: {
    position: 'absolute',
    top: 76,
    alignSelf: 'center',
    backgroundColor: '#141A33',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
