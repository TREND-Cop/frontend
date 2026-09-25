import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { SafeImage } from '../../components/ui/SafeImage';
import { bookingStore } from '../../utils/bookingStore';
import { ReportBottomSheet } from '../../components/ReportBottomSheet';

// ── Exact Figma Vector Icons ──

const ArrowLeftIcon = ({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4.5 12H19.5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 18C10 18 4.5 13.58 4.5 12C4.5 10.42 10 6 10 6"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CustomerSupportIcon = ({ size = 24, color = '#141B34' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 14V12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12V14"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Rect
      x="2"
      y="13"
      width="4"
      height="7"
      rx="2"
      stroke={color}
      strokeWidth={1.5}
    />
    <Rect
      x="18"
      y="13"
      width="4"
      height="7"
      rx="2"
      stroke={color}
      strokeWidth={1.5}
    />
    <Path
      d="M20 17C20 18.6569 18.6569 20 17 20H15"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CheckmarkCircleIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="rgba(12, 121, 12, 0.96)" />
    <Path
      d="M8 12L11 15L16 9"
      stroke="#FFFFFF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const LocationPinIcon = ({ size = 20, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21C16 17.5 20 13.4183 20 9.5C20 5.35786 16.4183 2 12 2C7.58172 2 4 5.35786 4 9.5C4 13.4183 8 17.5 12 21Z"
      stroke={color}
      strokeWidth={1.5}
    />
    <Circle cx="12" cy="9.5" r="3" stroke={color} strokeWidth={1.5} />
  </Svg>
);

const CalendarIcon = ({ size = 24, color = 'rgba(192, 192, 204, 0.96)' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="4"
      width="18"
      height="17"
      rx="4"
      stroke={color}
      strokeWidth={1.5}
    />
    <Path d="M8 2V6" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M16 2V6" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M3 10H21" stroke={color} strokeWidth={1.5} />
  </Svg>
);

const ClockIcon = ({ size = 24, color = 'rgba(192, 192, 204, 0.96)' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth={1.5} />
    <Path
      d="M12 7V12L15.5 14"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ClockTimeSmallIcon = ({ size = 18, color = 'rgba(96, 96, 102, 0.96)' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <Circle cx="9" cy="9" r="7.5" stroke={color} strokeWidth={1.2} />
    <Path
      d="M9 5.5V9H12"
      stroke={color}
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const GoldStarIcon = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path
      d="M8 1.5L9.9 5.36L14.16 5.98L11.08 8.98L11.81 13.22L8 11.22L4.19 13.22L4.92 8.98L1.84 5.98L6.1 5.36L8 1.5Z"
      fill="rgba(248, 155, 24, 0.96)"
    />
  </Svg>
);

export const SuccessfulBookingDetailScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const [showReportModal, setShowReportModal] = useState(false);

  // Dynamic parameters with fallback to Figma specs
  const serviceName = (params.name || params.serviceName || params.title || 'Haircut') as string;
  const price = (params.price || '₦22,700') as string;
  const duration = (params.duration || '24min') as string;
  const rating = (params.rating || '5.1') as string;
  const bookedDate = (params.date || 'Jan 03,2026') as string;
  const bookedTime = (params.time || '10:30am') as string;
  const completionTimestamp = (params.completionTimestamp || 'Jan 03, 22:03:12') as string;
  const ticketNumber = (params.ticketNumber || '#740375') as string;
  const locationAddress = (params.location || '1st floor off David Chris Cresent, Kado Abuja') as string;

  const handleGoBack = () => {
    router.replace('/home/bookings' as any);
  };

  const handleSupportPress = () => {
    setShowReportModal(true);
  };

  const handleReviewPress = () => {
    router.push({
      pathname: '/booked-appointment',
      params: {
        id: params.id,
        name: serviceName,
        serviceName: serviceName,
        price: price,
        duration: duration,
        rating: rating,
        image: params.image || params.serviceImage,
        appointmentDate: bookedDate,
        appointmentTime: bookedTime,
        ticketNumber: ticketNumber,
        location: locationAddress,
        paymentOption: params.paymentOption,
        paymentMethod: params.paymentMethod,
      },
    } as any);
  };

  const handleBookAgain = () => {
    const salonId = (params.salonId as string) || 'salon2';
    router.push({
      pathname: '/salon/[id]',
      params: { id: salonId, name: 'Luminous Lux' },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Page Header (Figma: height: 64px, padding: 8px 16px, borderBottom: 1px) ── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeftIcon size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Successful Appointments</Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleSupportPress}
          activeOpacity={0.7}
        >
          <CustomerSupportIcon size={24} color="#141B34" />
        </TouchableOpacity>
      </View>

      {/* ── Scrollable Content ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 96 },
        ]}
      >
        {/* ── Completed Booking Indicator Banner (Figma: height 84px, bg rgba(238, 248, 238, 0.8), borderRadius 24px) ── */}
        <View style={styles.completedBanner}>
          <View style={styles.completedIconWrapper}>
            <CheckmarkCircleIcon size={24} />
          </View>
          <View style={styles.completedTextContainer}>
            <Text style={styles.completedTitle}>Service Completed</Text>
            <Text style={styles.completedSubtitle}>{completionTimestamp}</Text>
          </View>
        </View>

        {/* ── Booked Tag Card Container (Figma: height 384px, bg rgba(247, 247, 247, 0.96), borderRadius 24px) ── */}
        <View style={styles.bookedCard}>
          {/* Top Section: Image + Service Information */}
          <View style={styles.serviceInfoRow}>
            {/* Service Image Frame (88×88px, borderRadius 24px) */}
            <SafeImage
              source={
                params.image ||
                params.serviceImage ||
                ((serviceName.toLowerCase().includes('almond') || (serviceName.toLowerCase().includes('green') && serviceName.toLowerCase().includes('acrylic')))
                  ? require('../../../assets/images/profile/4538d4759870466dd05509849b26c4b0b111d827.jpg')
                  : (serviceName.toLowerCase().includes('nail') || serviceName.toLowerCase().includes('acrylic')
                  ? require('../../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg')
                  : (serviceName.toLowerCase().includes('facial') || serviceName.toLowerCase().includes('skin')
                  ? require('../../../assets/images/packages/facial_sheet_mask.png')
                  : (serviceName.toLowerCase().includes('pedicure') || serviceName.toLowerCase().includes('feet')
                  ? require('../../../assets/images/profile/dry_wow_pedicure.jpg')
                  : require('../../../assets/images/profile/men_braids.jpg')))))
              }
              style={styles.serviceImage}
              resizeMode="cover"
            />

            {/* Service Details Column */}
            <View style={styles.serviceTextColumn}>
              <Text style={styles.serviceCategory} numberOfLines={1}>
                {serviceName}
              </Text>
              <Text style={styles.servicePrice}>{price}</Text>

              {/* Meta Row: Duration & Star Rating */}
              <View style={styles.metaRow}>
                <View style={styles.metaGroup}>
                  <ClockTimeSmallIcon size={18} />
                  <Text style={styles.metaText}>{duration}</Text>
                </View>

                <View style={styles.metaGroup}>
                  <GoldStarIcon size={16} />
                  <Text style={styles.metaText}>{rating}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Location Row (Frame 1000006308: bg rgba(248, 249, 250, 0.98), borderRadius 8px) */}
          <TouchableOpacity
            style={styles.locationContainer}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: '/salon/location',
                params: {
                  salonId: (params.salonId as string) || 'salon2',
                  name: (params.salonName as string) || 'Luminous Lux',
                  address: locationAddress,
                  price: price,
                  rating: rating,
                },
              } as any)
            }
          >
            <LocationPinIcon size={20} />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationAddress}
            </Text>
          </TouchableOpacity>

          {/* Date & Time Selector Boxes (calender row) */}
          <View style={styles.dateTimeRow}>
            {/* Booked Day Box */}
            <View style={styles.dateTimeBox}>
              <CalendarIcon size={24} />
              <View style={styles.dateTimeBoxText}>
                <Text style={styles.dateTimeLabel}>Booked day</Text>
                <Text style={styles.dateTimeValue}>{bookedDate}</Text>
              </View>
            </View>

            {/* Divider Line */}
            <View style={styles.dateTimeDivider} />

            {/* Booked Time Box */}
            <View style={styles.dateTimeBox}>
              <ClockIcon size={24} />
              <View style={styles.dateTimeBoxText}>
                <Text style={styles.dateTimeLabel}>Booked Time</Text>
                <Text style={styles.dateTimeValue}>{bookedTime}</Text>
              </View>
            </View>
          </View>

          {/* Ticket & Review Order Row (tick and order review) */}
          <View style={styles.ticketReviewRow}>
            <View style={styles.ticketColumn}>
              <Text style={styles.ticketLabel}>Appointment Ticket</Text>
              <Text style={styles.ticketNumber}>{ticketNumber}</Text>
            </View>

            <TouchableOpacity
              style={styles.reviewButton}
              activeOpacity={0.7}
              onPress={handleReviewPress}
            >
              <Text style={styles.reviewButtonText}>Review Appointment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ── Fixed Bottom Button: "Book Again • Get 10% OFF" ── */}
      <View
        style={[
          styles.bottomActionBar,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <TouchableOpacity
          style={styles.bookAgainButton}
          activeOpacity={0.85}
          onPress={handleBookAgain}
        >
          <View style={styles.bookAgainContent}>
            <Text style={styles.bookAgainText}>Book Again</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Support / Report Case Bottom Sheet ── */}
      <ReportBottomSheet
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header Row ──
  headerRow: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },

  // ── Scroll Content ──
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 24,
  },

  // ── Completed Banner ──
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    borderRadius: 24,
  },
  completedIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedTextContainer: {
    flex: 1,
    gap: 4,
  },
  completedTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.6,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  completedSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Booked Card ──
  bookedCard: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 20,
  },

  // ── Service Info Row ──
  serviceInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  serviceImage: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  serviceTextColumn: {
    flex: 1,
    gap: 6,
  },
  serviceCategory: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  servicePrice: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.6,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  metaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Location ──
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderRadius: 8,
  },
  locationText: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    textDecorationLine: 'underline',
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Date & Time Row ──
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateTimeBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  dateTimeBoxText: {
    flex: 1,
    gap: 4,
  },
  dateTimeLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  dateTimeValue: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: '#000000',
  },
  dateTimeDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },

  // ── Ticket & Review Row ──
  ticketReviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 4,
  },
  ticketColumn: {
    gap: 4,
  },
  ticketLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  ticketNumber: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  reviewButton: {
    paddingVertical: 2,
  },
  reviewButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    textDecorationLine: 'underline',
    textTransform: 'capitalize',
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Bottom Fixed Action Bar ──
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  bookAgainButton: {
    height: 48,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookAgainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookAgainText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    textTransform: 'capitalize',
    color: '#FFFFFF',
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#D9D9D9',
  },
  discountText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontStyle: 'italic',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    textTransform: 'capitalize',
    color: 'rgba(248, 155, 24, 0.96)',
  },
});

export default SuccessfulBookingDetailScreen;
