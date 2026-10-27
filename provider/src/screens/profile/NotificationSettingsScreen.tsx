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
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { useProviderProfile } from '../../context/ProviderProfileContext';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';

function ArrowLeftIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18l-6-6 6-6"
        stroke="#141B34"
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
      <Path
        d="M18 8a3 3 0 100-6 3 3 0 000 6zM6 15a3 3 0 100-6 3 3 0 000 6zM18 22a3 3 0 100-6 3 3 0 000 6zM8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckmarkIcon({ size = 16, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M3.33 8l3.34 3.33 6.66-6.66"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

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
  }, [value, animatedValue]);

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
          styles.toggleTrack,
          {
            backgroundColor: trackBgColor,
            borderColor: trackBorderColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.toggleThumb,
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

export function ProviderNotificationSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { pushNotificationsEnabled, emailNotificationsEnabled, updateNotificationSettings } = useProviderProfile();

  const [pushEnabled, setPushEnabled] = useState(pushNotificationsEnabled);
  const [emailEnabled, setEmailEnabled] = useState(emailNotificationsEnabled);
  const [showToast, setShowToast] = useState(false);
  const toastAnim = useRef(new Animated.Value(0)).current;

  // Track if changes have been made
  const hasChanges = pushEnabled !== pushNotificationsEnabled || emailEnabled !== emailNotificationsEnabled;

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Manage your Trend Business notifications and alert preferences.',
      });
    } catch (e) {
      // Ignored
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    await updateNotificationSettings(pushEnabled, emailEnabled);

    // Trigger Toast Animation
    setShowToast(true);
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowToast(false);
    });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {/* ── Fixed Header (height: 64px, paddingHorizontal: 16px) ── */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <ArrowLeftIcon size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notification Settings</Text>

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
        {/* ── Push Notification Card (358x80px) ── */}
        <View style={styles.settingCard}>
          <View style={styles.cardTextColumn}>
            <Text style={styles.settingTitle}>Push Notification</Text>
            <Text style={styles.settingSubtitle}>
              Receive instant updates on bookings, reviews, and client inquiries.
            </Text>
          </View>
          <CustomToggleSwitch value={pushEnabled} onValueChange={setPushEnabled} />
        </View>

        {/* ── Email Notification Card (358x80px) ── */}
        <View style={styles.settingCard}>
          <View style={styles.cardTextColumn}>
            <Text style={styles.settingTitle}>Email Notification</Text>
            <Text style={styles.settingSubtitle}>
              Receive monthly financial statements, payouts, and security alerts.
            </Text>
          </View>
          <CustomToggleSwitch value={emailEnabled} onValueChange={setEmailEnabled} />
        </View>
      </ScrollView>

      {/* ── Toast Notification Pill ── */}
      {showToast && (
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
          <View style={styles.toastBadge}>
            <CheckmarkIcon size={14} color="#FFFFFF" />
          </View>
          <Text style={styles.toastText}>Changes Saved</Text>
        </Animated.View>
      )}

      {/* ── Bottom Sticky Save Button Container ── */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          activeOpacity={hasChanges ? 0.85 : 1}
          disabled={!hasChanges}
          onPress={handleSave}
          style={[
            styles.saveButton,
            hasChanges ? styles.saveButtonActive : styles.saveButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.saveButtonText,
              hasChanges ? styles.saveButtonTextActive : styles.saveButtonTextDisabled,
            ]}
          >
            Save Changes
          </Text>
        </TouchableOpacity>
      </View>

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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    paddingBottom: 100,
    gap: 16,
  },
  settingCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  cardTextColumn: {
    flex: 1,
    gap: 4,
  },
  settingTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  settingSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Custom Animated Switch ──
  toggleTrack: {
    width: 64,
    height: 32,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },

  // ── Toast Pill ──
  toastContainer: {
    position: 'absolute',
    top: 76,
    alignSelf: 'center',
    backgroundColor: '#0C790C',
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
  toastBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // ── Bottom Button Container ──
  bottomContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
  },
  saveButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
  },
  saveButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  saveButtonTextActive: {
    color: '#FFFFFF',
  },
  saveButtonTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
});
