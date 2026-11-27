import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Share2 } from 'lucide-react-native';
import { useSafeRouter } from '../../utils/safeNavigation';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';

export const TermsPolicyScreen: React.FC = () => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const layoutHeightRef = useRef(0);
  const contentHeightRef = useRef(0);

  const handleGoBack = () => {
    if (safeRouter.canGoBack()) {
      safeRouter.back();
    } else {
      safeRouter.replace('/profile' as any);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'TREND Terms of Service: https://trend-app.com/terms',
      });
    } catch (error) {
      // Ignored
    }
  };

  const checkScrollToEnd = (offsetY: number, layoutHeight: number, contentHeight: number) => {
    if (contentHeight <= layoutHeight + 10) {
      setHasScrolledToEnd(true);
      return;
    }
    if (layoutHeight + offsetY >= contentHeight - 32) {
      setHasScrolledToEnd(true);
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    layoutHeightRef.current = layoutMeasurement.height;
    contentHeightRef.current = contentSize.height;
    checkScrollToEnd(contentOffset.y, layoutMeasurement.height, contentSize.height);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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

        <Text style={styles.headerTitle}>Terms of Service</Text>

        <TouchableOpacity
          style={styles.headerShareButton}
          onPress={handleShare}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Share2 size={24} color="#141B34" />
        </TouchableOpacity>
      </View>

      {/* ── Content Body (paddingHorizontal 16px, gap 28px) ── */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onLayout={(e) => {
          layoutHeightRef.current = e.nativeEvent.layout.height;
          if (contentHeightRef.current > 0) {
            checkScrollToEnd(0, layoutHeightRef.current, contentHeightRef.current);
          }
        }}
        onContentSizeChange={(_w, h) => {
          contentHeightRef.current = h;
          if (layoutHeightRef.current > 0) {
            checkScrollToEnd(0, layoutHeightRef.current, h);
          }
        }}
      >
        {/* ============================================================== */}
        {/* PART 1: TERMS OF SERVICE                                       */}
        {/* ============================================================== */}
        <View style={styles.majorHeaderBlock}>
          <Text style={styles.majorHeading}>TERMS OF SERVICE</Text>
          <Text style={styles.introText}>
            Welcome to Trend. These Terms of Service govern your access to and use of the Trend mobile application, website, and related services (collectively, the “Platform”). By creating an account or using the Platform, you agree to these Terms.
          </Text>
        </View>

        {/* Section 1 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>1. Eligibility – 18+ Only</Text>
          <Text style={styles.bodyText}>
            You must be at least 18 years of age to create an account or use Trend.{'\n\n'}
            We require this age limit to reduce the risk of minors attending appointments alone and encountering situations they may not be equipped to handle. By using the Platform, you confirm that you are 18 or older. Trend does not knowingly allow users under 18.
          </Text>
        </View>

        {/* Section 2 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>2. Account Registration and Security</Text>
          <Text style={styles.bodyText}>
            You must provide accurate, complete, and up-to-date information during registration.{'\n\n'}
            The Platform relies heavily on GPS location data to show you nearby registered salons and service providers. Inaccurate information may prevent the system from functioning properly.{'\n\n'}
            You are solely responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.{'\n\n'}
            Notify us immediately of any unauthorized use of your account.
          </Text>
        </View>

        {/* Section 3 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>3. Platform Open to All Genders</Text>
          <Text style={styles.bodyText}>
            Trend is open to users of all genders. We do not discriminate on the basis of gender identity or expression.
          </Text>
        </View>

        {/* Section 4 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>4. Nature of Services and Content</Text>
          <Text style={styles.bodyText}>
            All service listings, descriptions, photos, prices, and content on Trend are created and uploaded by independent business owners and service providers.{'\n\n'}
            Trend does not create, verify, or control this content.{'\n\n'}
            If you find any content that makes you uncomfortable, you may file a report through the Platform.{'\n\n'}
            Ratings and reviews displayed on the Platform are submitted by clients who have used the services and are not generated or controlled by Trend.
          </Text>
        </View>

        {/* Section 5 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>5. Pricing, Discounts, and Payments</Text>
          <Text style={styles.bodyText}>
            Service prices and discounts are set exclusively by the service providers, not by Trend.{'\n\n'}
            Any promotional discount offered by Trend itself will be clearly stated on advertisements or within the Platform.{'\n\n'}
            Trend is not responsible for pricing disputes between clients and service providers.
          </Text>
        </View>

        {/* Section 6 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>6. Booking and Appointments</Text>
          <Text style={styles.bodyText}>
            When you book an appointment, you enter into a direct agreement with the service provider. Trend acts only as a booking facilitator.
          </Text>

          <Text style={styles.subHeading}>Cancellation inside the Trend app</Text>
          <Text style={styles.bodyText}>
            If you cancel an appointment using the official cancellation feature inside the Trend app, the cancellation is free of charge. Trend does not charge any cancellation fee, and the service provider does not receive a cancellation fee through the Platform for that booking. The appointment is officially cancelled and the time slot is released.
          </Text>

          <Text style={styles.subHeading}>Cancellation outside the Trend app</Text>
          <Text style={styles.bodyText}>
            If you cancel an appointment outside the Trend app (for example, by calling the salon, sending a WhatsApp message, texting, or speaking to the staff in person), the free cancellation rule does not apply. Trend is not involved in outside cancellations. Any fees, refunds, or disputes that arise are left entirely between you and the service provider. The booking may still appear as active on the Platform until it is updated or cancelled inside the app.{'\n\n'}
            If an appointment is not fully completed but you click the “Service Completed” button, the matter is left between you and the business owner to resolve. Trend will not intervene in such cases.{'\n\n'}
            Booking a staff member privately (outside the Platform’s booking system) is done entirely at your own risk. Trend is not responsible for any property loss, damage, or other issues that may arise. You may raise complaints directly with the business where the staff member works.
          </Text>
        </View>

        {/* Section 7 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>7. Adult Services and Age-Restricted Treatments</Text>
          <Text style={styles.bodyText}>
            Some services listed on Trend are intended for adults only.{'\n\n'}
            If a client books a service that is inappropriate for their age or circumstances, Trend has no involvement. Resolution of any issues is left entirely to the client and the service provider through the in-app messaging system.{'\n\n'}
            If communication moves outside Trend’s messaging platform, that is solely the responsibility of the parties involved.
          </Text>
        </View>

        {/* Section 8 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>8. Professional Qualifications and Licensing</Text>
          <Text style={styles.bodyText}>
            Trend does not verify, license, or certify any service provider’s professional qualifications, training, or licenses (including surgical or medical aesthetic licensing).{'\n\n'}
            Clients are solely responsible for conducting their own research into a provider’s credentials before booking.{'\n\n'}
            If you believe a service provider is not a professional in their field, you may report them to Trend or leave a review about the business, owner, or staff member. Any report from client to Trend about a business owner performing an unlicensed service and Any incident occurs, the business gets permanently terminated from Trend and gets fined as well.
          </Text>
        </View>

        {/* Section 9 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>9. Client Responsibilities and Research</Text>
          <Text style={styles.bodyText}>
            Clients are expected to research salons, staff, and services on the Platform before booking. Trend does not guarantee the quality, safety, or outcome of any service.
          </Text>
        </View>

        {/* Section 10 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>10. Complaints, Reports, and Assault</Text>
          <Text style={styles.bodyText}>
            You may report a staff member or business for serious complaints through the Platform.{'\n\n'}
            If you experience any form of assault or serious misconduct during a service, you may report it to Trend. We will review the report and take action if the explanation is justified. If not, we will communicate with both the client and the business owner via the in-app messaging platform.{'\n\n'}
            If the service you received is substantially different from what was displayed, you may file a report or leave a comment/review after clicking the “Service Completed” button.
          </Text>
        </View>

        {/* Section 11 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>11. Limitation of Liability</Text>
          <Text style={styles.bodyText}>
            Trend is a technology platform that connects clients with independent service providers. We are not responsible for the actions, omissions, quality of service, safety, or conduct of any service provider or client. To the fullest extent permitted by law, Trend shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform or any services booked through it.
          </Text>
        </View>

        {/* Section 12 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>12. User Conduct</Text>
          <Text style={styles.bodyText}>
            You agree not to misuse the Platform, post false information, harass others, or engage in any illegal activity. Violation may result in account suspension or termination.
          </Text>
        </View>

        {/* Section 13 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>13. Account Deletion</Text>
          <Text style={styles.bodyText}>
            You may delete your Trend account at any time through the account settings in the profile or by contacting Trend support.{'\n\n'}
            Once your account deletion request is confirmed:
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                Your account will be deactivated and you will no longer be able to log in or book new appointments.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                Your profile information, booking history, saved preferences, and other personal data associated with your account will be permanently deleted or anonymized from Trend’s active systems, subject to the exceptions below.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                Messages exchanged with service providers through the in-app messaging system may be retained by the service provider independently of Trend.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                Information that has already been shared with a service provider in connection with a past or upcoming booking (for example, your name and contact details for an appointment) remains under the control of that service provider. Trend cannot force them to delete it.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                Trend may retain certain limited data for a reasonable period where required by law, for legitimate business purposes (such as resolving disputes, preventing fraud, or complying with legal obligations), or for security and audit reasons. Such retained data will be kept securely and will not be used for marketing or other active purposes.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                Account deletion is permanent and cannot be undone. If you wish to use Trend again in the future, you will need to create a new account.
              </Text>
            </View>
          </View>
        </View>

        {/* Section 14 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>14. Modifications and Termination</Text>
          <Text style={styles.bodyText}>
            We may update these Terms at any time. Continued use of the Platform after changes constitutes acceptance. We reserve the right to suspend or terminate accounts that violate these Terms.
          </Text>
        </View>

        {/* Section 15 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>15. Contact</Text>
          <Text style={styles.bodyText}>
            For questions about these Terms, please contact us through the in-app support feature or at the email address provided in the app.
          </Text>
        </View>

        {/* Policy Divider Line */}
        <View style={styles.policyDivider} />

        {/* ============================================================== */}
        {/* PART 2: PRIVACY POLICY                                         */}
        {/* ============================================================== */}
        <View style={styles.majorHeaderBlock}>
          <Text style={styles.majorHeading}>PRIVACY POLICY</Text>
          <Text style={styles.introText}>
            This Privacy Policy explains how Trend collects, uses, and protects your information.
          </Text>
        </View>

        {/* Privacy Section 1 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>1. Information We Collect</Text>
          <Text style={styles.bodyText}>
            We collect information you provide when creating an account (name, contact details, location data, etc.) and information generated through your use of the Platform (booking history, reviews, messages, GPS location for nearby salon recommendations).
          </Text>
        </View>

        {/* Privacy Section 2 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>2. How We Use Your Information</Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                To operate the Platform and show you nearby registered salons and services (GPS-based).
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                To facilitate bookings and communication between clients and service providers.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                To improve the Platform and provide customer support.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                We do not use your information for any malicious activities.
              </Text>
            </View>
          </View>
        </View>

        {/* Privacy Section 3 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>3. Data Sharing and Sale of Data</Text>
          <Text style={styles.bodyText}>
            We do not sell the personal data you use to sign into the Platform.{'\n\n'}
            We share information only as necessary to provide the services (e.g., sharing booking details with the relevant service provider) or when required by law.{'\n\n'}
            Service providers receive only the information needed to fulfill your appointment.
          </Text>
        </View>

        {/* Privacy Section 4 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>4. Account Security</Text>
          <Text style={styles.bodyText}>
            You are responsible for keeping your login credentials secure. Trend uses reasonable technical and organizational measures to protect your data, but no system is completely secure.
          </Text>
        </View>

        {/* Privacy Section 5 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>5. Accuracy of Information</Text>
          <Text style={styles.bodyText}>
            Because the Platform relies on accurate GPS and location data to function properly, you agree to provide truthful and up-to-date information.
          </Text>
        </View>

        {/* Privacy Section 6 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>6. Your Rights</Text>
          <Text style={styles.bodyText}>
            Depending on your location, you may have rights to access, correct, delete, or restrict the processing of your personal data. You can exercise these rights through the app settings or by contacting us.
          </Text>
        </View>

        {/* Privacy Section 7 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>7. Content and Reports</Text>
          <Text style={styles.bodyText}>
            All content is generated by business owners. You may report uncomfortable content, staff, or businesses through the Platform’s reporting tools.
          </Text>
        </View>

        {/* Privacy Section 8 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>8. Account Deletion and Data Removal</Text>
          <Text style={styles.bodyText}>
            You have the right to request deletion of your account and the personal data associated with it.
          </Text>

          <Text style={styles.subHeading}>How to request deletion</Text>
          <Text style={styles.bodyText}>
            You can delete your account directly in the app under Account profile, where a delete button is available.
          </Text>

          <Text style={styles.subHeading}>What happens after you request deletion?</Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                We will deactivate your account promptly.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                We will delete or anonymize your personal data from our active systems within a reasonable timeframe (normally within 30 days of confirmed request).
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                Data that we are legally required to keep (for example, transaction records needed for tax, accounting, or dispute resolution) may be retained for the period required by applicable law. After that period it will be securely deleted or anonymized.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                Data already provided to service providers in connection with bookings is outside Trend’s control once shared. You may need to contact those service providers directly if you want them to delete information they hold about you.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                We do not sell your personal data. Upon account deletion, your data will not be used for any further commercial purposes.
              </Text>
            </View>
          </View>

          <Text style={styles.subHeading}>Exceptions</Text>
          <Text style={styles.bodyText}>
            We may retain limited information if:
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                It is necessary to resolve an ongoing dispute or investigation,
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                It is required by law or regulation,
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                It is needed to protect the safety, rights, or property of Trend, our users, or the public.
              </Text>
            </View>
          </View>
          <Text style={styles.bodyText}>
            In all such cases the retained data will be limited to what is strictly necessary and will be protected with appropriate security measures.{'\n\n'}
            If you have any questions about account deletion or the status of your data removal request, please contact us through the in-app support channel.
          </Text>
        </View>

        {/* Privacy Section 9 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>9. Changes to This Policy</Text>
          <Text style={styles.bodyText}>
            We may update this Privacy Policy from time to time. We will notify you of significant changes through the Platform or by email.
          </Text>
        </View>

        {/* Policy Divider Line */}
        <View style={styles.policyDivider} />

        {/* ============================================================== */}
        {/* PART 3: REFUND POLICY                                          */}
        {/* ============================================================== */}
        <View style={styles.majorHeaderBlock}>
          <Text style={styles.majorHeading}>REFUND POLICY</Text>
        </View>

        {/* Refund Section 1 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>1. When You Get a Refund</Text>
          <Text style={styles.bodyText}>
            You will receive a refund if:
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                You cancel the appointment through the Trend app
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                The service provider cancels the appointment
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                Trend cancels the appointment
              </Text>
            </View>
          </View>
        </View>

        {/* Refund Section 2 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>2. Refund Time</Text>
          <Text style={styles.bodyText}>
            Refunds are normally processed within 1 hour.{'\n\n'}
            If you do not receive it within 1 hour:
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                Check your bank or payment method
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                Contact Trend Support with your booking reference
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                We will investigate and follow up until the refund is completed
              </Text>
            </View>
          </View>
          <Text style={styles.bodyText}>
            Delays caused by your bank or payment provider after Trend has released the refund are outside our control.
          </Text>
        </View>

        {/* Refund Section 3 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>3. How Refunds Are Paid</Text>
          <Text style={styles.bodyText}>
            Refunds are returned to the same payment method used for the booking.
          </Text>
        </View>

        {/* Refund Section 4 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>4. When Refunds Do Not Apply</Text>
          <Text style={styles.bodyText}>
            No refund will be given if:
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                You cancel outside the Trend app
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                You click “Service Completed”
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                The service has already been fully provided
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Us Section */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>10. Contact Us</Text>
          <Text style={styles.bodyText}>
            For privacy-related questions or requests, please contact us through the in-app support channel.
          </Text>
        </View>
      </ScrollView>

      {/* ── Fixed Bottom Actions ("I accept" gated until scrolled to end) ── */}
      <View
        style={[
          styles.footerContainer,
          {
            paddingBottom:
              Platform.OS === 'android'
                ? Math.max(insets.bottom, 56) + 12
                : Math.max(insets.bottom, 20) + 12,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!hasScrolledToEnd}
          style={[
            styles.acceptButton,
            !hasScrolledToEnd && styles.acceptButtonDisabled,
          ]}
          onPress={handleGoBack}
        >
          <Text
            style={[
              styles.acceptButtonText,
              !hasScrolledToEnd && styles.acceptButtonTextDisabled,
            ]}
          >
            I accept
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
  headerShareButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Scroll Content ──
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 24,
  },

  // ── Major Document Header ──
  majorHeaderBlock: {
    gap: 8,
    marginTop: 4,
  },
  majorHeading: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_700Bold',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: 0.3,
    color: '#000814',
  },
  introText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Section Block ──
  sectionBlock: {
    gap: 8,
  },
  sectionHeading: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0.3,
    color: '#000814',
  },
  subHeading: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    letterSpacing: 0.2,
    color: '#141A33',
    marginTop: 6,
  },
  bodyText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Bullet List ──
  bulletList: {
    gap: 8,
    paddingLeft: 4,
    marginVertical: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  bulletText: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Policy Divider ──
  policyDivider: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginVertical: 12,
  },

  // ── Footer & Accept Action ──
  footerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    alignItems: 'center',
  },
  acceptButton: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    backgroundColor: '#000814',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButtonDisabled: {
    backgroundColor: 'rgba(0, 8, 20, 0.25)',
  },
  acceptButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },
  acceptButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.65)',
  },
});
