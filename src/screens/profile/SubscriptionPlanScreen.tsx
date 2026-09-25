import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Share2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const BLUE_BADGE_IMAGE = require('../../../assets/images/profile/blue_subscription_badge.png');

export const SubscriptionPlanScreen: React.FC = () => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annually' | null>('monthly');

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile' as any);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Get offers and discounts with TREND blue subscription badge!',
      });
    } catch (error) {
      // Ignored
    }
  };

  const handleSubscribe = () => {
    // Navigates to payment / success
    router.push('/payment' as any);
  };

  const getButtonText = () => {
    if (selectedPlan === 'monthly') {
      return 'Pay ₦22,700 / Monthly';
    }
    if (selectedPlan === 'annually') {
      return 'Pay ₦55,000 / Annually';
    }
    return 'Subscribe Now';
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

        <Text style={styles.headerTitle}>Subscription Plan</Text>

        <TouchableOpacity
          style={styles.headerShareButton}
          onPress={handleShare}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Share2 size={24} color="#141B34" />
        </TouchableOpacity>
      </View>

      {/* ── Scrollable Body Area ── */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Verification Package Card (Figma: width 358px, height 411px, borderRadius 24px) */}
        <View style={styles.packageCard}>
          {/* Blue Glowing Badge Banner (Figma: 326x179px, borderRadius 16px) */}
          <View style={styles.bannerContainer}>
            <Image
              source={BLUE_BADGE_IMAGE}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </View>

          {/* Text Info & Benefits (Figma: width 326px, height 176px, gap 16px) */}
          <View style={styles.cardInfoSection}>
            <Text style={styles.cardMainTitle}>
              Get offers and discounts with blue subscription badge.
            </Text>

            {/* Benefits List (Figma: height 112px, gap 8px) */}
            <View style={styles.benefitsList}>
              {/* Benefit 1 */}
              <View style={styles.benefitRow}>
                <View style={styles.benefitCheckCircle}>
                  <Check size={12} color="#FFFFFF" strokeWidth={3} />
                </View>
                <Text style={styles.benefitText}>
                  Save 10% when you book any 3-star location
                </Text>
              </View>

              {/* Benefit 2 */}
              <View style={styles.benefitRow}>
                <View style={styles.benefitCheckCircle}>
                  <Check size={12} color="#FFFFFF" strokeWidth={3} />
                </View>
                <Text style={styles.benefitText}>
                  Priority booking on all appointments
                </Text>
              </View>

              {/* Benefit 3 */}
              <View style={styles.benefitRow}>
                <View style={styles.benefitCheckCircle}>
                  <Check size={12} color="#FFFFFF" strokeWidth={3} />
                </View>
                <Text style={styles.benefitText}>
                  Save 10% when you book home service
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Bottom Pricing Sheet Section (Figma: height 277px, borderTopLeft/RightRadius 24px) ── */}
      <View style={styles.pricingSheet}>
        {/* Two Pricing Cards Side-by-Side (Figma: gap 14px) */}
        <View style={styles.pricingCardsRow}>
          {/* Card 1: Monthly */}
          <TouchableOpacity
            style={[
              styles.priceCard,
              selectedPlan === 'monthly' && styles.priceCardSelected,
            ]}
            activeOpacity={0.8}
            onPress={() => setSelectedPlan('monthly')}
          >
            <View style={styles.priceCardTop}>
              <View style={styles.priceTextGroup}>
                <Text style={styles.planDurationLabel}>Monthly</Text>
                <Text style={styles.planPriceText}>₦22,700</Text>
              </View>

              {/* Radio Indicator */}
              {selectedPlan === 'monthly' ? (
                <View style={styles.radioSelectedCircle}>
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
              ) : (
                <View style={styles.radioUnselectedCircle} />
              )}
            </View>

            <Text style={styles.cancelAnytimeText}>Cancel Anytime</Text>
          </TouchableOpacity>

          {/* Card 2: Annually */}
          <TouchableOpacity
            style={[
              styles.priceCard,
              selectedPlan === 'annually' && styles.priceCardSelected,
            ]}
            activeOpacity={0.8}
            onPress={() => setSelectedPlan('annually')}
          >
            <View style={styles.priceCardTop}>
              <View style={styles.priceTextGroup}>
                <Text style={styles.planDurationLabel}>Annually</Text>
                <Text style={styles.planPriceText}>₦55,000 -10%</Text>
              </View>

              {/* Radio Indicator */}
              {selectedPlan === 'annually' ? (
                <View style={styles.radioSelectedCircle}>
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
              ) : (
                <View style={styles.radioUnselectedCircle} />
              )}
            </View>

            <Text style={styles.cancelAnytimeText}>Cancel Anytime</Text>
          </TouchableOpacity>
        </View>

        {/* CTA Button (Figma: 342x48px, borderRadius 24px, dark rgba(0, 8, 20, 0.96)) */}
        <TouchableOpacity
          style={styles.subscribeButton}
          activeOpacity={0.8}
          onPress={handleSubscribe}
        >
          <Text style={styles.subscribeButtonText}>{getButtonText()}</Text>
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

  // ── Header (Figma: 64px, borderBottom 1px solid rgba(235, 235, 245, 0.96)) ──
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
    paddingBottom: 24,
    alignItems: 'center',
  },

  // ── Package Card (Figma: width 358px, borderRadius 24px, padding 16px, gap 24px) ──
  packageCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 24,
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 8, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },

  // ── Banner Image (Figma: 326x179px, borderRadius 16px) ──
  bannerContainer: {
    width: '100%',
    height: 179,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },

  // ── Card Info & Benefits (Figma: height 176px, gap 16px) ──
  cardInfoSection: {
    gap: 16,
    width: '100%',
  },
  cardMainTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  benefitsList: {
    gap: 12,
    width: '100%',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 24,
  },
  benefitCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
    flex: 1,
  },

  // ── Bottom Pricing Sheet (Figma: height 277px, borderTopLeft/RightRadius 24px) ──
  pricingSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 16 : 24,
    paddingHorizontal: 16,
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  pricingCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 20,
  },

  // ── Price Card (Figma: width 165px, height 120px, borderRadius 24px, padding 16px) ──
  priceCard: {
    flex: 1,
    height: 120,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  priceCardSelected: {
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  priceCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  priceTextGroup: {
    gap: 8,
    flex: 1,
  },
  planDurationLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  planPriceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  cancelAnytimeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Radio Circles (Figma: 24x24px) ──
  radioSelectedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioUnselectedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 192, 204, 0.96)',
  },

  // ── CTA Subscribe Button (Figma: 342x48px, borderRadius 24px, dark) ──
  subscribeButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 8, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  subscribeButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
});
