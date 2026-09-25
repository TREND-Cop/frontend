import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Modal,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, ChevronUp, ChevronDown, X } from 'lucide-react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { bookingStore } from '../../utils/bookingStore';
import { useBookingContext } from '../../store/BookingContext';
import { typography } from '../../constants/theme';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';

// ── Cash Icon matching Figma ──
const CashIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="5" width="20" height="14" rx="3" stroke="#141B34" strokeWidth="1.5" />
    <Circle cx="12" cy="12" r="3" stroke="#141B34" strokeWidth="1.5" />
    <Path d="M5 8H6M18 16H19" stroke="#141B34" strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

// ── Flash / Zap Icon matching Figma ──
const FlashIcon = () => (
  <Svg width="12" height="12" viewBox="0 0 24 24" fill="rgba(245, 149, 15, 0.96)" stroke="rgba(245, 149, 15, 0.96)">
    <Path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ── Bank Icon matching Figma ──
const BankIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M3 9.5L12 3L21 9.5" stroke="#141B34" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M5 10V17M10 10V17M14 10V17M19 10V17" stroke="#141B34" strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M2 17.5H22M2 21H22" stroke="#141B34" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ── Credit Card Icon matching Figma ──
const CreditCardIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="4" width="20" height="16" rx="3" stroke="#141B34" strokeWidth="1.5" />
    <Path d="M2 9H22" stroke="#141B34" strokeWidth="1.5" />
    <Path d="M10 16H14" stroke="#141B34" strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M6 16H7" stroke="#141B34" strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

export const PaymentScreen = ({ navigation }: { navigation?: any }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android' ? Math.max(insets.bottom, 56) : Math.max(insets.bottom, 16);

  // Selected payment method (default: null until selected)
  const [selectedPaymentType, setSelectedPaymentType] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<boolean>(false);

  // Estimated breakdown modal state & animations
  const [isEstimateModalRendered, setIsEstimateModalRendered] = useState<boolean>(false);
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(600)).current;

  const openEstimateModal = () => {
    setIsEstimateModalRendered(true);
    backdropAnim.setValue(0);
    sheetTranslateY.setValue(600);

    Animated.parallel([
      // Ghost 99: "like a 1sec fade In the moment the bottom sheet button has been pushed"
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeEstimateModal = (onCompleted?: () => void) => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 600,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsEstimateModalRendered(false);
      if (onCompleted) {
        onCompleted();
      }
    });
  };

  const handleSelectPaymentType = (type: string) => {
    setSelectedPaymentType(type);
    bookingStore.setPaymentType(type);
    if (type === 'cash') {
      bookingStore.setPaymentDetails({
        method: 'cash',
        methodTitle: 'Cash',
        status: 'Pay at Salon',
        receiver: bookingStore.getSalonName() || 'Salon Front Desk',
      });
    } else if (type === 'bank_transfer') {
      bookingStore.setPaymentDetails({
        method: 'bank_transfer',
        methodTitle: 'Inter-Bank Transfer',
        accountName: 'TREND SECURE',
        accountNumber: '123456789',
        bankName: 'Zenith Bank',
      });
    } else if (type === 'card') {
      bookingStore.setPaymentDetails({
        method: 'card',
        methodTitle: 'Card Payment',
        cardBrand: 'Mastercard',
        cardLast4: '0938',
        transactionRef: `TRX-${Math.floor(10000 + Math.random() * 90000)}`,
      });
    }
    if (paymentError) {
      setPaymentError(false);
    }
  };

  // Coupon & points state
  const [usePoints, setUsePoints] = useState<boolean>(false);
  const [couponApplied, setCouponApplied] = useState<boolean>(false);

  // Dynamic booking state from bookingStore
  const [selectedAddOns, setSelectedAddOns] = useState(bookingStore.getSelectedItems());
  const [selectedPackage, setSelectedPackage] = useState(bookingStore.getSelectedPackage());
  const [selectedSpecialist, setSelectedSpecialist] = useState(bookingStore.getSelectedSpecialist());
  const [selectedSpecialists, setSelectedSpecialists] = useState(bookingStore.getSelectedSpecialists());

  useEffect(() => {
    const unsubscribe = bookingStore.subscribe(() => {
      setSelectedAddOns(bookingStore.getSelectedItems());
      setSelectedPackage(bookingStore.getSelectedPackage());
      setSelectedSpecialist(bookingStore.getSelectedSpecialist());
      setSelectedSpecialists(bookingStore.getSelectedSpecialists());
    });
    return unsubscribe;
  }, []);

  // Dynamic price calculation from bookingStore
  const baseServicePrice = bookingStore.getBasePrice();
  const addOnsTotal = bookingStore.getAddOnsTotal();
  const packageTotal = bookingStore.getPackageTotal();
  const specialistTotal = bookingStore.getSpecialistTotal();
  const subtotal = bookingStore.getSubtotal();

  // Dynamic Discounts
  const paymentDiscount =
    selectedPaymentType === 'bank_transfer' || selectedPaymentType === 'card'
      ? Math.round(subtotal * 0.02)
      : 0;
  const couponDiscount = couponApplied ? Math.round(subtotal * 0.08) : 0;
  const pointsDiscount = usePoints ? 300 : 0;
  const totalDiscount = paymentDiscount + couponDiscount + pointsDiscount;
  const finalTotal = Math.max(0, subtotal - totalDiscount);

  const handleGoBack = () => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/booking-review');
    }
  };

  const handleCardPaymentPress = () => {
    handleSelectPaymentType('card');
    router.push('/add-card');
  };

  const { confirmBooking } = useBookingContext();

  const handlePayNow = async () => {
    if (!selectedPaymentType) {
      setPaymentError(true);
      return;
    }
    setPaymentError(false);
    if (selectedPaymentType === 'bank_transfer') {
      router.push('/bank-transfer');
    } else if (selectedPaymentType === 'card') {
      router.push('/add-card');
    } else {
      const cashDetails = {
        method: 'cash' as const,
        methodTitle: 'Cash',
        status: 'Pay at Salon',
        receiver: bookingStore.getSalonName() || 'Salon Front Desk',
      };
      const newAppt = await confirmBooking(cashDetails);
      router.push({
        pathname: '/booking-success',
        params: { appointmentId: newAppt?.id },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ─── Top Header Bar ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton} activeOpacity={0.7}>
          <ArrowLeft size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 170 + bottomInset }]}
      >
        {/* ─── Section 1: Payment Option (Figma Specs) ─────────────── */}
        <View style={styles.paymentOptionSection}>
          <Text style={styles.paymentOptionTitle}>Payment Option</Text>

          <View style={[styles.paymentMethodsCard, paymentError && styles.paymentMethodsCardError]}>
            {/* 1. Bank Transfer */}
            <TouchableOpacity
              style={styles.paymentMethodRow}
              activeOpacity={0.7}
              onPress={() => handleSelectPaymentType('bank_transfer')}
            >
              <View style={styles.paymentMethodLeft}>
                <BankIcon />
                <Text style={styles.paymentMethodLabel}>Bank Transfer</Text>
              </View>

              <View style={styles.paymentMethodRight}>
                <View
                  style={[
                    styles.radioCircle,
                    selectedPaymentType === 'bank_transfer' && styles.radioCircleSelected,
                  ]}
                >
                  {selectedPaymentType === 'bank_transfer' && (
                    <Check size={14} color="#FFFFFF" strokeWidth={3} />
                  )}
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.methodDivider} />

            {/* 2. Card Payment */}
            <TouchableOpacity
              style={styles.paymentMethodRow}
              activeOpacity={0.7}
              onPress={handleCardPaymentPress}
            >
              <View style={styles.paymentMethodLeft}>
                <CreditCardIcon />
                <Text style={styles.paymentMethodLabel}>Card Payment</Text>
              </View>

              <View style={styles.paymentMethodRight}>
                <View
                  style={[
                    styles.radioCircle,
                    selectedPaymentType === 'card' && styles.radioCircleSelected,
                  ]}
                >
                  {selectedPaymentType === 'card' && (
                    <Check size={14} color="#FFFFFF" strokeWidth={3} />
                  )}
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.methodDivider} />

            {/* 3. Cash */}
            <TouchableOpacity
              style={styles.paymentMethodRow}
              activeOpacity={0.7}
              onPress={() => handleSelectPaymentType('cash')}
            >
              <View style={styles.paymentMethodLeft}>
                <CashIcon />
                <Text style={styles.paymentMethodLabel}>Cash</Text>
              </View>

              <View style={styles.paymentMethodRight}>
                <View
                  style={[
                    styles.radioCircle,
                    selectedPaymentType === 'cash' && styles.radioCircleSelected,
                  ]}
                >
                  {selectedPaymentType === 'cash' && (
                    <Check size={14} color="#FFFFFF" strokeWidth={3} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {paymentError && (
            <Text style={styles.paymentErrorText}>You have not select payment option</Text>
          )}
        </View>
      </ScrollView>

      {/* ─── Bottom Fixed Action Bar ──────────────────────────────── */}
      <View style={[styles.bottomBar, { paddingBottom: bottomInset }]}>
        <TouchableOpacity
          style={styles.estimateRow}
          activeOpacity={0.7}
          onPress={openEstimateModal}
        >
          <Text style={styles.estimateLabel}>Estimate</Text>
          <Text style={styles.estimatePrice}>₦{finalTotal.toLocaleString()}</Text>
          <ChevronUp size={20} color="rgba(96, 96, 102, 0.96)" strokeWidth={1.5} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.payNowBtn}
          activeOpacity={0.8}
          onPress={handlePayNow}
        >
          <Text style={styles.payNowBtnText}>Pay Now</Text>
        </TouchableOpacity>
      </View>
      <NativeDockSpacer />

      {/* ─── Estimated Payment Breakdown Bottom Sheet (Figma Specs) ─── */}
      <Modal
        visible={isEstimateModalRendered}
        transparent
        animationType="none"
        onRequestClose={() => closeEstimateModal()}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalBackdrop,
              {
                opacity: backdropAnim,
              },
            ]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => closeEstimateModal()}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.estimateSheetContainer,
              {
                paddingBottom: Math.max(20, insets.bottom),
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
            {/* Header and Close Button */}
            <View style={styles.estimateSheetHeader}>
              <TouchableOpacity
                style={styles.estimateTitleRow}
                activeOpacity={0.7}
                onPress={() => closeEstimateModal()}
              >
                <Text style={styles.estimateSheetTitle}>Estimated Payment</Text>
                <ChevronDown size={20} color="rgba(96, 96, 102, 0.96)" strokeWidth={1.5} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.estimateCloseBtn}
                activeOpacity={0.7}
                onPress={() => closeEstimateModal()}
              >
                <X size={22} color="#141B34" strokeWidth={1.5} />
              </TouchableOpacity>
            </View>

            {/* Breakdown Items (Dynamic from bookingStore) */}
            <View style={styles.estimateBreakdownList}>
              {/* Row 1: Base Service Price */}
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Price</Text>
                <View style={styles.breakdownLine} />
                <Text style={styles.breakdownValue}>₦{baseServicePrice.toLocaleString()}</Text>
              </View>

              {/* Row 4: Package (if any) */}
              {selectedPackage && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>{selectedPackage.name}</Text>
                  <View style={styles.breakdownLine} />
                  <Text style={styles.breakdownValue}>₦{selectedPackage.price.toLocaleString()}</Text>
                </View>
              )}

              {/* Row 5: Add-Ons (if any selected) */}
              {selectedAddOns.length > 0 ? (
                selectedAddOns.map((addon) => (
                  <View key={addon.id} style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>{addon.name}</Text>
                    <View style={styles.breakdownLine} />
                    <Text style={styles.breakdownValue}>₦{addon.price.toLocaleString()}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Add-Ons</Text>
                  <View style={styles.breakdownLine} />
                  <Text style={styles.breakdownValue}>₦0</Text>
                </View>
              )}

              {/* Row 6: Specialist (if any) */}
              {(selectedSpecialists.length > 0 || selectedSpecialist) && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>
                    {selectedSpecialists.length > 1
                      ? `${selectedSpecialists.length} Specialists`
                      : 'Specialist'}
                  </Text>
                  <View style={styles.breakdownLine} />
                  <Text style={styles.breakdownValue}>₦{specialistTotal.toLocaleString()}</Text>
                </View>
              )}

              {/* Row 7: Dynamic Total */}
              <View style={styles.breakdownTotalRow}>
                <Text style={styles.breakdownTotalLabel}>Total</Text>
                <View style={styles.breakdownLine} />
                <Text style={styles.breakdownTotalValue}>₦{finalTotal.toLocaleString()}</Text>
              </View>
            </View>

            {/* Pay Now Button in Modal */}
            <TouchableOpacity
              style={styles.estimatePayNowBtn}
              activeOpacity={0.8}
              onPress={() => {
                closeEstimateModal(() => {
                  handlePayNow();
                });
              }}
            >
              <Text style={styles.payNowBtnText}>Pay Now</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 24,
  },

  // ── Section 1: Payment Option (Figma Specs) ──
  paymentOptionSection: {
    gap: 16,
  },
  paymentOptionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: Platform.OS === 'ios' ? 0.3 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  paymentMethodsCard: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },
  paymentMethodsCardError: {
    borderColor: '#E53935',
    borderWidth: 1,
  },
  paymentErrorText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#E53935',
    marginTop: -8,
    paddingHorizontal: 4,
  },
  paymentMethodRow: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  paymentMethodLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: '#141A33',
    fontWeight: '400',
  },
  paymentMethodRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(242, 233, 218, 0.96)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 24,
    gap: 4,
  },
  discountBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    color: 'rgba(245, 149, 15, 0.96)',
    fontWeight: '400',
  },
  methodDivider: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Section 2: Coupon & Points Section ──
  couponSection: {
    gap: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    fontWeight: '400',
  },
  discountsContainer: {
    gap: 12,
    alignItems: 'stretch',
    paddingBottom: 16,
  },

  // ── Estimated Payment Modal Styles (Figma Specs) ──
  estimateSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 20,
    shadowColor: '#858B94',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
  estimateSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
  },
  estimateTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  estimateSheetTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  estimateCloseBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  estimateBreakdownList: {
    gap: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 24,
  },
  breakdownLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  breakdownLine: {
    flex: 1,
    height: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    marginHorizontal: 12,
  },
  breakdownValue: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  breakdownPointsValue: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(245, 149, 15, 0.96)',
  },
  breakdownTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 28,
    marginTop: 4,
  },
  breakdownTotalLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  breakdownTotalValue: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  estimatePayNowBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  estimateDiscountBadge: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(245, 149, 15, 0.96)',
    marginLeft: 4,
  },
  estimatePointsBadge: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(245, 149, 15, 0.96)',
    marginLeft: 4,
  },

  // ── 1. Points Card (height 84 matching Figma) ──
  pointsCard: {
    height: 84,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsInfoCol: {
    gap: 8,
    justifyContent: 'center',
  },
  pointsLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 24,
  },
  pointsValue: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(245, 149, 15, 0.96)',
  },
  pointsUnit: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    color: 'rgba(245, 149, 15, 0.96)',
  },

  // ── 2. Or Text Divider ──
  orDividerText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    marginVertical: 4,
  },

  // ── 3. Discount Ticket Card (height 112 matching Figma) ──
  ticketCardWrapper: {
    width: '100%',
    height: 112,
    position: 'relative',
    justifyContent: 'center',
  },
  ticketContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  ticketLeftCol: {
    gap: 10,
    width: 130,
    height: 88,
    justifyContent: 'center',
  },
  ticketBadge: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  ticketPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 28,
  },
  ticketPrice: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  ticketDiscountLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  ticketExpiry: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  applyCouponBtn: {
    width: 77,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyCouponBtnText: {
    ...typography.button,
    color: '#FFFFFF',
  },

  // ── Bottom Fixed Action Bar (Exact Figma Specs) ──
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
    // @ts-ignore
    boxShadow: '0px -8px 20px rgba(133, 139, 148, 0.12)',
    shadowColor: '#858B94',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  estimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 28,
  },
  estimateLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  estimatePrice: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  payNowBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payNowBtnText: {
    ...typography.button,
    color: '#FFFFFF',
  },

  // ── Payment Type Half-Screen Modal ──
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
});
