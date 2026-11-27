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
import { useLocalSearchParams } from 'expo-router';
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Path, Circle } from 'react-native-svg';

import { NativeDockSpacer } from '../../components/NativeDockSpacer';

// Master Typography Fonts per Provider Platform Mandate
const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_SEMIBOLD = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold';

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

interface TermSection {
  title: string;
  content?: string;
  intro?: string;
  bullets?: string[];
  outro?: string;
}

// ── BUSINESS OWNER TERMS OF SERVICE (1:1 Spec) ──
const BUSINESS_OWNER_SECTIONS: TermSection[] = [
  {
    title: '1. Linking Your Bank Account',
    content:
      'By linking your bank account, you agree to provide accurate and complete bank details required for receiving payouts.\n\nYou are responsible for keeping your bank account information up to date.',
  },
  {
    title: '2. Security of Your Bank Information',
    content:
      'The bank account information you submit is protected.\n\nTrend uses secure systems to handle your data.\n\nYour bank details are not visible to other users, clients, or unauthorized persons.\n\nOnly the systems required to process payments and payouts can access the necessary information.',
  },
  {
    title: '3. How Payments Work',
    content:
      'When a client pays for a booking on Trend, the full payment is received and held by Trend.\n\nThe payment will only be released to your linked bank account after the service has been successfully completed.\n\nBefore releasing your share, Trend will automatically deduct its commission.\n\nThe remaining balance will then be sent to your bank account according to the Platform’s payout process.',
  },
  {
    title: '4. Commission',
    content:
      'Trend charges a commission on successfully completed appointments.\n\nThe commission rate is as agreed during your onboarding or as otherwise communicated on the Platform.\n\nCommission is deducted before your share is paid out.',
  },
  {
    title: '5. Cancellations and Refunds',
    content:
      'If a client cancels a booking through the official Trend cancellation process, or if the appointment is cancelled by Trend or the provider under applicable rules, the client may receive a refund in accordance with the Refund Policy.\n\nIn such cases, no payout will be made to you for that booking (or the relevant portion will be adjusted).',
  },
  {
    title: '6. Your Responsibilities',
    intro: 'You agree to:',
    bullets: [
      'Provide accurate bank account details',
      'Only offer legitimate services',
      'Complete services as booked',
      'Comply with all applicable laws and Trend’s policies',
    ],
    outro:
      'You are responsible for any taxes or legal obligations related to income you receive through Trend.',
  },
  {
    title: '7. Incorrect or Failed Payouts',
    content:
      'If a payout fails because of incorrect bank details or other information you provided, Trend is not responsible for the delay or failure.\n\nYou must update your bank details promptly so that future payouts can be processed correctly.',
  },
  {
    title: '8. Account Suspension',
    intro: 'Trend may suspend or restrict your payouts if:',
    bullets: [
      'There is suspected fraud or misuse',
      'Required information is missing or inaccurate',
      'You violate these Terms or other Trend policies',
      'There are unresolved disputes or chargebacks related to your bookings',
    ],
  },
  {
    title: '9. Limitation of Liability',
    content:
      'Trend is a technology platform that facilitates bookings and payments.\n\nWhile we take reasonable steps to protect your information and process payouts correctly, Trend is not liable for delays or failures caused by banks, payment providers, or incorrect information supplied by you.',
  },
  {
    title: '10. Changes to These Terms',
    content:
      'Trend may update these terms from time to time. Continued use of the payout feature after changes means you accept the updated terms.',
  },
  {
    title: '11. Contact',
    content:
      'For questions about your bank account, payouts, or these terms, contact Trend Support through the in-app help feature.',
  },
];

// ── STAFF TERMS OF SERVICE (1:1 Client Spec) ──
const STAFF_TERMS_SECTIONS: TermSection[] = [
  {
    title: '1. Your Role as Staff',
    content:
      'You are added to Trend by a Business Owner. Trend is not your employer. Your working relationship, pay, schedule, and employment terms are solely between you and the Business Owner.',
  },
  {
    title: '2. Staff Code of Conduct',
    intro:
      'As a staff member on Trend, you are expected to maintain a high standard of professional behavior at all times. This Code of Conduct applies whenever you are representing the business or interacting with clients through the Platform.\n\nYou must:',
    bullets: [
      'Always treat clients with respect, politeness, calmness, and professionalism',
      'Communicate clearly and courteously',
      'Be punctual and reliable for all scheduled appointments',
      'Maintain appropriate personal hygiene and professional appearance when providing services',
      'Respect client privacy and keep their personal information confidential',
      'Be honest about services, results, and limitations',
      'Follow the instructions and standards set by the Business Owner',
      'Avoid any form of harassment, discrimination, aggression, or inappropriate behavior',
      'Use the Platform responsibly and only for legitimate service-related activities',
    ],
    outro:
      'Failure to follow this Code of Conduct may result in removal from the business, suspension, or permanent termination of your access on Trend.',
  },
  {
    title: '3. Professional Conduct',
    content:
      'You are expected to behave in a polite, calm, nice, and professional manner with all clients at all times. Clients can leave feedback and reviews after appointments. Negative or unprofessional behavior can embarrass the business you work for and may affect your position.',
  },
  {
    title: '4. Visibility to Business Owner',
    content:
      'Everything you do on the Platform in relation to the business (including appointments, messages, status updates, and content submissions) can be seen by the Business Owner. Act with the understanding that your actions are visible to your boss.',
  },
  {
    title: '5. Appointments and Reliability',
    content:
      'You are expected to honor appointments assigned to you. Missed appointments negatively affect the business and can also affect your role or continued access on the Platform.',
  },
  {
    title: '6. Post Work Section',
    content:
      'The “Post Work” section is strictly for posting services you have performed. Any content you submit must be reviewed and approved by the Business Owner before it becomes public on the Platform. You are not allowed to publish content without the Business Owner’s approval.',
  },
  {
    title: '7. Content Rules',
    intro: 'When submitting content for approval, you must ensure that:',
    bullets: [
      'It only shows real services you have performed',
      'It is professional and appropriate',
      'It does not contain sensitive, hazardous, explicit, misleading, or illegal material',
      'It does not involve minors in any inappropriate way',
    ],
    outro:
      'The Business Owner is responsible for final approval, but you remain responsible for the content you submit.',
  },
  {
    title: '8. Communication with Clients',
    content:
      'All communication with clients should remain professional and respectful. Use the in-app messaging system appropriately. Anything that happens outside the Trend messaging platform is outside Trend’s responsibility.',
  },
  {
    title: '9. Client Information and Privacy',
    content:
      'You may have access to certain client information for the purpose of providing services. You must keep all client information confidential and use it only for the intended service. You are not allowed to share, misuse, or store client data outside the Platform without proper authorization.',
  },
  {
    title: '10. Prohibited Behavior',
    intro: 'You must not:',
    bullets: [
      'Be rude, aggressive, or unprofessional toward clients',
      'Miss appointments without valid reason and proper communication',
      'Post or submit inappropriate content',
      'Misrepresent services or results',
      'Engage in any illegal or prohibited activity on the Platform',
    ],
  },
  {
    title: '11. Consequences of Violation',
    intro: 'Violation of these Terms may result in:',
    bullets: [
      'Removal from the business on Trend',
      'Permanent termination of your staff access on the Platform',
      'Possible impact on the Business Owner’s account (as outlined in the Business Owner Terms)',
    ],
  },
  {
    title: '12. Limitation of Liability',
    content:
      'Trend is a technology platform that connects clients with businesses and their staff. Trend is not responsible for your conduct, the quality of services you provide, or any disputes between you, the Business Owner, or clients.',
  },
  {
    title: '13. Changes to These Terms',
    content:
      'We may update these Terms from time to time. Continued use of the Platform as staff after changes constitutes acceptance of the updated Terms.',
  },
  {
    title: '14. Contact',
    content:
      'For questions regarding these Terms, please contact us through the in-app support feature or speak with your Business Owner.',
  },
];

export interface ProviderTermsPolicyScreenProps {
  isStaff?: boolean;
}

// Populate with exact Refund Policy copy for Apple App Store compliance
export const PROVIDER_REFUND_POLICY = '';

export function ProviderTermsPolicyScreen({ isStaff = false }: ProviderTermsPolicyScreenProps) {
  const safeRouter = useSafeRouter();
  const params = useLocalSearchParams<{ isStaff?: string; mode?: string }>();

  // Determine active view mode: Staff vs Business Owner
  const staffMode = isStaff || params.isStaff === 'true' || params.mode === 'staff';
  const baseSections = staffMode ? STAFF_TERMS_SECTIONS : BUSINESS_OWNER_SECTIONS;
  const sections =
    !staffMode && PROVIDER_REFUND_POLICY.trim().length > 0
      ? [
          ...baseSections,
          {
            title: `${baseSections.length + 1}. Refund Policy`,
            content: PROVIDER_REFUND_POLICY,
          },
        ]
      : baseSections;
  const pageTitle = staffMode ? 'Staff Terms of Service' : 'Terms of Service';
  const bannerHeading = staffMode ? 'TREND – STAFF TERMS OF SERVICE' : 'Terms of Service';
  const bannerIntro = staffMode
    ? 'Welcome to Trend. These Terms of Service (“Terms”) govern your access to and use of the Trend Platform as a Staff member of a registered business. By accepting an invitation to join a business or using the Platform as staff, you agree to these Terms.'
    : 'These terms apply when you link a bank account on Trend to receive online payments (bank transfers, card payments, and other supported methods).';

  const handleShare = async () => {
    try {
      await Share.share({
        message: staffMode
          ? 'Review the Trend Staff Terms of Service: https://trendapp.io/staff-terms'
          : 'Review the Trend Terms of Service: https://trendapp.io/terms-of-service',
      });
    } catch {
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
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeftIcon size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{pageTitle}</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleShare}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="Share terms and policy"
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
          <Text style={styles.bannerTitle}>{bannerHeading}</Text>
          <Text style={styles.bannerIntro}>{bannerIntro}</Text>
          {staffMode && (
            <Text style={styles.bannerDate}>Last updated: March 12, 2026</Text>
          )}
        </View>

        {/* ── Content Sections (Headers: 20px, Body: 16px, Distance to body: 16px, Between sections: 40px) ── */}
        {sections.map((sec, idx) => (
          <View key={idx} style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>{sec.title}</Text>

            {/* Direct paragraph content */}
            {sec.content ? (
              sec.content.split('\n\n').map((paragraph, pIdx) => (
                <Text key={pIdx} style={styles.sectionBody}>
                  {paragraph}
                </Text>
              ))
            ) : null}

            {/* Intro before bullet list */}
            {sec.intro ? (
              <Text style={styles.sectionBody}>{sec.intro}</Text>
            ) : null}

            {/* Bullet list items */}
            {sec.bullets && sec.bullets.length > 0 ? (
              <View style={styles.bulletList}>
                {sec.bullets.map((item, bIdx) => (
                  <View key={bIdx} style={styles.bulletItem}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Outro after bullet list */}
            {sec.outro ? (
              <Text style={styles.sectionBody}>{sec.outro}</Text>
            ) : null}
          </View>
        ))}
      </ScrollView>

      <NativeDockSpacer />
    </SafeAreaView>
  );
}

export default ProviderTermsPolicyScreen;

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
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#000814',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  // Spacing between one header from another is 40px
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 60,
    gap: 40,
  },
  bannerContainer: {
    gap: 16,
  },
  bannerTitle: {
    fontFamily: FONT_SEMIBOLD,
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.2,
    color: '#000814',
  },
  bannerIntro: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'justify',
  },
  bannerDate: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  // Distance from header to body text is 16px
  sectionBlock: {
    gap: 16,
  },
  // Headers are strictly 20px
  sectionHeading: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000814',
  },
  // Body text is strictly 16px
  sectionBody: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'justify',
  },
  bulletList: {
    gap: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletDot: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  bulletText: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'justify',
  },
});
