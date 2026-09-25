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
import { AppointmentTypeModal, AppointmentBookingType } from '../../components/AppointmentTypeModal';
import { ReportBottomSheet } from '../../components/ReportBottomSheet';
import { typography } from '../../constants/theme';

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

const CancelCrossIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 7L17 17M17 7L7 17"
      stroke="rgba(204, 41, 41, 0.9)"
      strokeWidth={1.8}
      strokeLinecap="round"
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

export const CancelledBookingDetailScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // Dynamic parameters with fallback to Figma specs
  const serviceName = (params.name || params.serviceName || params.title || 'Haircut') as string;
  const price = (params.price || '₦22,700') as string;
  const duration = (params.duration || '24min') as string;
  const rating = (params.rating || '5.1') as string;
  const bookedDate = (params.date || 'Jan 03,2026') as string;
  const bookedTime = (params.time || '10:30am') as string;
  const cancellationTimestamp = (params.cancellationTimestamp || '5-03-2026, 22:03:12') as string;
  const ticketNumber = (params.ticketNumber || '#740375') as string;
  const locationAddress = (params.location || '1st floor off David Chris Cresent, Kado Abuja') as string;
  const cancellationNote = (params.note || 'Service provider cancelled your appointment') as string;

  const handleGoBack = () => {
    router.replace('/home/bookings' as any);
  };

  const [showReportModal, setShowReportModal] = useState(false);

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
        appointmentDate: bookedDate,
        appointmentTime: bookedTime,
        ticketNumber: ticketNumber,
        location: locationAddress,
        paymentOption: params.paymentOption,
        paymentMethod: params.paymentMethod,
      },
    } as any);
  };

  const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);
  const [selectedAppointmentType, setSelectedAppointmentType] = useState<AppointmentBookingType | null>(null);

  const handleReschedule = () => {
    setIsTypeModalVisible(true);
  };

  const handleSelectAppointmentType = (type: AppointmentBookingType) => {
    setSelectedAppointmentType(type);
    setIsTypeModalVisible(false);

    bookingStore.setServiceName(serviceName);
    const numPrice = parseInt(price.replace(/[^0-9]/g, ''), 10) || 22700;
    bookingStore.setBasePrice(numPrice);
    bookingStore.setAppointmentType(type);
    bookingStore.setDuration(duration);
    bookingStore.setRating(rating);

    router.push({
      pathname: '/appointment-time',
      params: {
        name: serviceName,
        price: price,
        duration: duration,
        rating: rating,
        appointmentType: type,
        reschedule: 'true',
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
      {/* ── Page Header (Figma: height 64px, padding 8px 16px, borderBottom 1px) ── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeftIcon size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Cancelled Appointments</Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleSupportPress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <CustomerSupportIcon size={24} />
        </TouchableOpacity>
      </View>

      {/* ── Scrollable Body ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 100 },
        ]}
      >
        {/* ── Cancelled Booking Indicator Banner ── */}
        <View style={styles.cancelledIndicatorBanner}>
          <View style={styles.cancelledIconCircle}>
            <CancelCrossIcon size={24} />
          </View>
          <View style={styles.indicatorTextCol}>
            <Text style={styles.indicatorTitle}>Cancelled Appointment</Text>
            <Text style={styles.indicatorTimestamp}>{cancellationTimestamp}</Text>
          </View>
        </View>

        {/* ── Approval / Cancellation Notes ── */}
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Note</Text>
          <Text style={styles.notesDescription}>{cancellationNote}</Text>
        </View>

        {/* ── Booked Service Info Card (Figma: booked tag, 358px width, 24px radius) ── */}
        <View style={styles.bookedCard}>
          {/* Card Top: Service Thumbnail + Details */}
          <View style={styles.cardHeaderRow}>
            <View style={styles.serviceImageFrame}>
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
            </View>

            <View style={styles.serviceDetailsCol}>
              <Text style={styles.serviceTitleText}>{serviceName}</Text>
              <Text style={styles.servicePriceText}>{price}</Text>

              {/* Duration & Rating Row */}
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <ClockTimeSmallIcon size={16} />
                  <Text style={styles.metaText}>{duration}</Text>
                </View>

                <View style={styles.metaItem}>
                  <GoldStarIcon size={14} />
                  <Text style={styles.metaText}>{rating}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Location Address Banner */}
          <TouchableOpacity
            style={styles.locationBanner}
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
            <LocationPinIcon size={18} />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationAddress}
            </Text>
          </TouchableOpacity>

          {/* Day & Time Boxes */}
          <View style={styles.dateTimeContainer}>
            {/* Booked Day Box */}
            <View style={styles.dateTimeBox}>
              <CalendarIcon size={22} color="rgba(192, 192, 204, 0.96)" />
              <View style={styles.dateTimeTextCol}>
                <Text style={styles.dateTimeCaption}>Booked day</Text>
                <Text style={styles.dateTimeValue}>{bookedDate}</Text>
              </View>
            </View>

            {/* Vertical Divider */}
            <View style={styles.verticalDivider} />

            {/* Booked Time Box */}
            <View style={styles.dateTimeBox}>
              <ClockIcon size={22} color="rgba(192, 192, 204, 0.96)" />
              <View style={styles.dateTimeTextCol}>
                <Text style={styles.dateTimeCaption}>Booked Time</Text>
                <Text style={styles.dateTimeValue}>{bookedTime}</Text>
              </View>
            </View>
          </View>

          {/* Ticket & Review Appointment Row */}
          <View style={styles.ticketReviewRow}>
            <View style={styles.ticketCol}>
              <Text style={styles.ticketCaption}>Appointment Ticket</Text>
              <Text style={styles.ticketValue}>{ticketNumber}</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleReviewPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.reviewAppointmentLink}>Review Appointment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ── Fixed Bottom Actions Bar ── */}
      <View style={[styles.bottomBarContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.bottomButtonsRow}>
          {/* Reschedule Button */}
          <TouchableOpacity
            style={styles.rescheduleButton}
            activeOpacity={0.8}
            onPress={handleReschedule}
          >
            <Text style={styles.rescheduleButtonText}>Reschedule</Text>
          </TouchableOpacity>

          {/* Book Again Button */}
          <TouchableOpacity
            style={styles.bookAgainButton}
            activeOpacity={0.85}
            onPress={handleBookAgain}
          >
            <Text style={styles.bookAgainButtonText}>Book Again</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Appointment Type Modal for Book Again */}
      <AppointmentTypeModal
        visible={isTypeModalVisible}
        onClose={() => setIsTypeModalVisible(false)}
        onSelectType={handleSelectAppointmentType}
        selectedType={selectedAppointmentType}
      />

      {/* Support / Report Case Bottom Sheet */}
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
    paddingTop: 24,
    paddingHorizontal: 16,
    gap: 24,
  },

  // ── Cancelled Indicator Banner ──
  cancelledIndicatorBanner: {
    width: '100%',
    height: 84,
    backgroundColor: 'rgba(248, 239, 239, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
  cancelledIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorTextCol: {
    flex: 1,
    gap: 4,
  },
  indicatorTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.6,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  indicatorTimestamp: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Notes Section ──
  notesContainer: {
    gap: 8,
  },
  notesLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_700Bold',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(248, 155, 24, 0.96)',
  },
  notesDescription: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: '#000000',
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
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  serviceImageFrame: {
    width: 88,
    height: 88,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  serviceDetailsCol: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  serviceTitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  servicePriceText: {
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
    gap: 16,
  },
  metaItem: {
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

  // ── Location Banner ──
  locationBanner: {
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  dateTimeBox: {
    flex: 1,
    height: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  dateTimeTextCol: {
    flex: 1,
    gap: 4,
  },
  dateTimeCaption: {
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
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },

  // ── Ticket & Review Appointment Row ──
  ticketReviewRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  ticketCol: {
    gap: 4,
  },
  ticketCaption: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  ticketValue: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  reviewAppointmentLink: {
    ...typography.button,
    textDecorationLine: 'underline',
    textTransform: 'capitalize',
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Fixed Bottom Bar ──
  bottomBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingHorizontal: 16,
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rescheduleButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rescheduleButtonText: {
    ...typography.button,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  bookAgainButton: {
    flex: 1.1,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  bookAgainButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});

export default CancelledBookingDetailScreen;
