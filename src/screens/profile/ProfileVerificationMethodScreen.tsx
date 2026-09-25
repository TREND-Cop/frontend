import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Lock, Mail, MessageSquare, Check } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUserContext } from '../../store/UserContext';
import { typography } from '../../constants/theme';

export const ProfileVerificationMethodScreen: React.FC = () => {
  const router = useRouter();
  const { profileData } = useUserContext();
  const params = useLocalSearchParams<{
    signupMethod?: 'phone' | 'email' | 'both';
    type?: string;
    method?: string;
    targetPhone?: string;
    targetEmail?: string;
  }>();

  // If user signed up with number, only number is clickable, email is unclickable. Vice versa for email.
  const userSignupMethod: 'phone' | 'email' =
    params?.signupMethod === 'email' || params?.signupMethod === 'phone'
      ? params.signupMethod
      : profileData?.signupMethod || 'phone';

  const isEmailAvailable = userSignupMethod === 'email';
  const isPhoneAvailable = userSignupMethod === 'phone';

  const [selectedMethod, setSelectedMethod] = useState<'email' | 'phone' | null>(
    userSignupMethod === 'phone' ? 'phone' : 'email'
  );

  const emailAddress = params?.targetEmail || profileData?.email || 'Saulgoodman@gmail.com';
  const phoneNumber = params?.targetPhone || profileData?.phone || '+234 8019238946';

  const subtitleText =
    params?.type === 'phone' || (isPhoneAvailable && !isEmailAvailable)
      ? 'Please verify that this account belongs to you, using existing phone number.'
      : params?.type === 'email' && !isPhoneAvailable
      ? 'Please verify that this account belongs to you, using existing email address.'
      : 'Please verify that this account belongs to you, Select verification method.';

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile' as any);
    }
  };

  const handleConfirm = () => {
    if (selectedMethod === 'email') {
      router.push({
        pathname: '/profile-otp-verification',
        params: {
          method: 'email',
          target: emailAddress,
          type: params?.type,
          targetEmail: params?.targetEmail,
          targetPhone: params?.targetPhone,
        },
      });
    } else if (selectedMethod === 'phone') {
      router.push({
        pathname: '/profile-otp-verification',
        params: {
          method: 'phone',
          target: phoneNumber,
          type: params?.type,
          targetEmail: params?.targetEmail,
          targetPhone: params?.targetPhone,
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── Top Bar with Back Button ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
        </TouchableOpacity>
      </View>

      {/* ── Scrollable Body ── */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Lock Icon Container (Figma: width 48px, height 48px, background rgba(248, 249, 250, 0.98), borderRadius 24px) */}
        <View style={styles.lockIconContainer}>
          <Lock size={24} color="#000000" />
        </View>

        {/* Header Text Block (Figma: width 358px, gap 8px) */}
        <View style={styles.headerTextBlock}>
          <Text style={styles.title}>Account Verification</Text>
          <Text style={styles.subtitle}>{subtitleText}</Text>
        </View>

        {/* Methods Cards Container (Figma: gap 40px, width 358px) */}
        <View style={styles.methodsContainer}>
          {/* Option 1: Email Verification Card */}
          <TouchableOpacity
            style={[
              styles.methodCard,
              selectedMethod === 'email'
                ? styles.methodCardSelected
                : styles.methodCardUnselected,
              !isEmailAvailable && styles.methodCardDisabled,
            ]}
            activeOpacity={isEmailAvailable ? 0.7 : 1}
            disabled={!isEmailAvailable}
            onPress={() => isEmailAvailable && setSelectedMethod('email')}
          >
            <View style={styles.cardLeftContent}>
              {/* Left Icon */}
              <View style={styles.cardIconBox}>
                <Mail
                  size={24}
                  color={
                    selectedMethod === 'email'
                      ? 'rgba(0, 8, 20, 0.96)'
                      : 'rgba(192, 192, 204, 0.96)'
                  }
                />
              </View>

              {/* Text Info */}
              <View style={styles.cardTextGroup}>
                <Text
                  style={[
                    styles.methodTitle,
                    selectedMethod === 'email'
                      ? styles.textSelected
                      : styles.textMuted,
                  ]}
                >
                  Email Verification
                </Text>
                <Text
                  style={[
                    styles.methodSubtitle,
                    selectedMethod === 'email'
                      ? styles.subtitleSelected
                      : styles.subtitleMuted,
                  ]}
                  numberOfLines={1}
                >
                  {isEmailAvailable ? emailAddress : 'No added email address'}
                </Text>
              </View>
            </View>

            {/* Right Checkmark / Radio Indicator */}
            {selectedMethod === 'email' ? (
              <View style={styles.selectedCircle}>
                <Check size={14} color="#FFFFFF" strokeWidth={3} />
              </View>
            ) : (
              <View style={styles.unselectedCircle} />
            )}
          </TouchableOpacity>

          {/* Option 2: Phone Number Verification Card */}
          <TouchableOpacity
            style={[
              styles.methodCard,
              selectedMethod === 'phone'
                ? styles.methodCardSelected
                : styles.methodCardUnselected,
              !isPhoneAvailable && styles.methodCardDisabled,
            ]}
            activeOpacity={isPhoneAvailable ? 0.7 : 1}
            disabled={!isPhoneAvailable}
            onPress={() => isPhoneAvailable && setSelectedMethod('phone')}
          >
            <View style={styles.cardLeftContent}>
              {/* Left Icon */}
              <View style={styles.cardIconBox}>
                <MessageSquare
                  size={24}
                  color={
                    selectedMethod === 'phone'
                      ? 'rgba(0, 8, 20, 0.96)'
                      : 'rgba(192, 192, 204, 0.96)'
                  }
                />
              </View>

              {/* Text Info */}
              <View style={styles.cardTextGroup}>
                <Text
                  style={[
                    styles.methodTitle,
                    selectedMethod === 'phone'
                      ? styles.textSelected
                      : styles.textMuted,
                  ]}
                >
                  Phone Number Verification
                </Text>
                <Text
                  style={[
                    styles.methodSubtitle,
                    selectedMethod === 'phone'
                      ? styles.subtitleSelected
                      : styles.subtitleMuted,
                  ]}
                  numberOfLines={1}
                >
                  {isPhoneAvailable ? phoneNumber : 'No added phone number'}
                </Text>
              </View>
            </View>

            {/* Right Checkmark / Radio Indicator */}
            {selectedMethod === 'phone' ? (
              <View style={styles.selectedCircle}>
                <Check size={14} color="#FFFFFF" strokeWidth={3} />
              </View>
            ) : (
              <View style={styles.unselectedCircle} />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Bottom Confirm Button (Figma: height 48px, width 358px, borderRadius 24px) ── */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            selectedMethod
              ? styles.confirmButtonActive
              : styles.confirmButtonDisabled,
          ]}
          activeOpacity={selectedMethod ? 0.8 : 1}
          disabled={!selectedMethod}
          onPress={handleConfirm}
        >
          <Text
            style={[
              styles.confirmButtonText,
              selectedMethod
                ? styles.confirmButtonTextActive
                : styles.confirmButtonTextDisabled,
            ]}
          >
            Confirm
          </Text>
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

  // ── Header (Figma: back button 48x48 rounded 24px) ──
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerBackButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Scroll Content ──
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: 'center',
  },

  // ── Lock Icon Container (Figma: 48x48px, background rgba(248, 249, 250, 0.98), borderRadius 24px) ──
  lockIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  // ── Header Text (Figma: 24px font, 32px line height, 0.4px letterSpacing, #141A33) ──
  headerTextBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    letterSpacing: 0.4,
    color: '#141A33',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    paddingHorizontal: 8,
  },

  // ── Methods Container (Figma: 40px gap between cards) ──
  methodsContainer: {
    width: '100%',
    gap: 40,
  },
  methodCard: {
    width: '100%',
    height: 88,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  methodCardSelected: {
    borderWidth: 1,
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  methodCardUnselected: {
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
  },
  methodCardDisabled: {
    opacity: 0.5,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
  },
  cardLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextGroup: {
    flex: 1,
    gap: 4,
  },
  methodTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
  },
  methodSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.2 : 0.2,
  },
  textSelected: {
    color: '#000000',
  },
  textMuted: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  subtitleSelected: {
    color: 'rgba(96, 96, 102, 0.96)',
  },
  subtitleMuted: {
    color: 'rgba(192, 192, 204, 0.96)',
  },

  // ── Right Indicators ──
  selectedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 192, 204, 0.96)',
  },

  // ── Bottom Area (Figma: 48px height, 24px borderRadius) ──
  bottomContainer: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 12 : 24,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
  },
  confirmButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 8, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
  },
  confirmButtonText: {
    ...typography.button,
    textTransform: 'capitalize',
  },
  confirmButtonTextActive: {
    color: '#FFFFFF',
  },
  confirmButtonTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
});
