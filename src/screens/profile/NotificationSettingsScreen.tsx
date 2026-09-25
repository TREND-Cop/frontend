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
import { useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useUserContext } from '../../store/UserContext';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';

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
              left: thumbTranslateX,
              backgroundColor: thumbBgColor,
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export const NotificationSettingsScreen: React.FC = () => {
  const router = useRouter();
  const { profileData, setNotificationSettings } = useUserContext();

  // Notification toggle states initialized from persistent user context
  const [pushNotification, setPushNotification] = useState(
    profileData.notificationSettings?.push ?? true
  );
  const [emailNotification, setEmailNotification] = useState(
    profileData.notificationSettings?.email ?? false
  );
  const [promosNotification, setPromosNotification] = useState(
    profileData.notificationSettings?.promotional ?? false
  );

  // Flow states
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile' as any);
    }
  };

  const handleTogglePush = (val: boolean) => {
    setPushNotification(val);
    setHasChanges(true);
    setShowSuccessToast(false);
  };

  const handleToggleEmail = (val: boolean) => {
    setEmailNotification(val);
    setHasChanges(true);
    setShowSuccessToast(false);
  };

  const handleTogglePromos = (val: boolean) => {
    setPromosNotification(val);
    setHasChanges(true);
    setShowSuccessToast(false);
  };

  const handleSaveChanges = () => {
    if (!hasChanges) return;
    setNotificationSettings({
      push: pushNotification,
      email: emailNotification,
      promotional: promosNotification,
    });
    setHasChanges(false);
    setShowSuccessToast(true);
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

        <Text style={styles.headerTitle}>Notification</Text>

        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* ── Content Area ── */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Option 1: Push Notification (Figma: height 48px, gap 24px) */}
        <View style={styles.notificationRow}>
          <Text style={styles.notificationLabel}>Push Notification</Text>
          <CustomToggleSwitch
            value={pushNotification}
            onValueChange={handleTogglePush}
          />
        </View>

        {/* Option 2: Email Notification (Figma: height 48px, gap 24px) */}
        <View style={styles.notificationRow}>
          <Text style={styles.notificationLabel}>Email Notification</Text>
          <CustomToggleSwitch
            value={emailNotification}
            onValueChange={handleToggleEmail}
          />
        </View>

        {/* Option 3: Promos and Offers Notification (Figma: height 48px) */}
        <View style={styles.notificationRow}>
          <Text style={styles.notificationLabel}>
            Promos and Offers Notification
          </Text>
          <CustomToggleSwitch
            value={promosNotification}
            onValueChange={handleTogglePromos}
          />
        </View>
      </ScrollView>

      {/* ── Bottom Section (Success Toast + Save Changes Button) ── */}
      <View style={styles.bottomContainer}>
        {/* In-app Action taken indicator (Figma: width 237px, height 44px, background rgba(0, 8, 20, 0.96)) */}
        {showSuccessToast && (
          <View style={styles.actionTakenIndicator}>
            <View style={styles.checkmarkCircle}>
              <Check size={14} color="#FFFFFF" strokeWidth={3} />
            </View>
            <Text style={styles.actionTakenText}>Notification Updated</Text>
          </View>
        )}

        {/* Save Changes Button (Active: black rgba(0, 8, 20, 0.96), Disabled: rgba(248, 249, 250, 0.98)) */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            hasChanges ? styles.saveButtonActive : styles.saveButtonDisabled,
          ]}
          activeOpacity={hasChanges ? 0.8 : 1}
          disabled={!hasChanges}
          onPress={handleSaveChanges}
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header (Figma: 64px height, 1px border bottom) ──
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

  // ── Content Area (Figma: paddingTop 40px, distance 24px between rows) ──
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 24,
    gap: 24,
  },
  notificationRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  notificationLabel: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── 64x32px Toggle Switch (Figma Spec) ──
  toggleTrack: {
    width: 64,
    height: 32,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    position: 'relative',
  },
  toggleThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    top: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },

  // ── Bottom Area (Toast + Button) ──
  bottomContainer: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 12 : 24,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  actionTakenIndicator: {
    width: 237,
    height: 44,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  checkmarkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(12, 121, 12, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTakenText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#FFFFFF',
  },
  saveButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
  },
  saveButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 8, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  saveButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.15,
    textTransform: 'capitalize',
  },
  saveButtonTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  saveButtonTextActive: {
    color: '#FFFFFF',
  },
});
