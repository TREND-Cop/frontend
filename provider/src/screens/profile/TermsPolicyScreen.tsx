import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

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

const termsSections = [
  {
    title: '1. Agreement to Terms',
    content:
      'By registering as a Service Provider on Trend Business, you agree to comply with and be bound by these Terms of Service, our Privacy Policy, and all applicable laws and regulations.',
  },
  {
    title: '2. Provider Services & Quality Standards',
    content:
      'As a verified service provider, you warrant that all services offered, pricing indicated, staff listed, and portfolio photographs uploaded represent genuine and lawful professional activities. You agree to maintain high hygiene and customer care standards at all times.',
  },
  {
    title: '3. Appointments & Client Obligations',
    content:
      'Providers are expected to honor all confirmed bookings. In the event of emergency cancellations or delays exceeding 15 minutes, providers must promptly communicate with clients via Trend In-App Messaging or customer care.',
  },
  {
    title: '4. Commission & Payout Schedule',
    content:
      'Trend deducts an agreed platform convenience fee from verified appointment bookings. Earned funds are disbursed directly to your designated commercial bank account in accordance with our bi-weekly payout cadence.',
  },
  {
    title: '5. Intellectual Property & Image Rights',
    content:
      'You grant Trend a non-exclusive license to showcase your business name, logos, and uploaded portfolio work within the Trend Customer application for marketing and booking facilitation.',
  },
  {
    title: '6. Privacy & Personal Data Security',
    content:
      'We handle client and provider data in strict compliance with the Nigeria Data Protection Act (NDPA) and global privacy best practices. Client contact numbers and residential details must never be used for unauthorized solicitation.',
  },
  {
    title: '7. Account Termination & Changes',
    content:
      'Trend reserves the right to suspend or terminate accounts that breach quality benchmarks, engage in fraudulent transactions, or exhibit harassment. Terms may be updated periodically with notice provided via email or in-app alerts.',
  },
];

export function ProviderTermsPolicyScreen() {
  const router = useRouter();

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Review the Trend Business Terms and Policy: https://trendapp.io/terms-policy',
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
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <ArrowLeftIcon size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Terms and policy</Text>

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
        {/* ── Heading Banner ── */}
        <View style={styles.bannerContainer}>
          <Text style={styles.bannerTitle}>Terms and Conditions</Text>
          <Text style={styles.bannerDate}>Last updated: March 12, 2026</Text>
        </View>

        {/* ── Content Sections ── */}
        {termsSections.map((sec, idx) => (
          <View key={idx} style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>{sec.title}</Text>
            <Text style={styles.sectionBody}>{sec.content}</Text>
          </View>
        ))}
      </ScrollView>

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
    paddingBottom: 60,
    gap: 20,
  },
  bannerContainer: {
    marginBottom: 8,
    gap: 4,
  },
  bannerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.2,
    color: '#000000',
  },
  bannerDate: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  sectionBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    padding: 16,
    gap: 8,
  },
  sectionHeading: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  sectionBody: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
  },
});
