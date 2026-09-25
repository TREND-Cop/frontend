import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { SafeImage } from '../../components/ui/SafeImage';
import { bookingStore } from '../../utils/bookingStore';
import { InAppShareModal } from '../../components/InAppShareModal';
import { EmptyBookedItemScreen } from './EmptyBookedItemScreen';
import { useBookingContext } from '../../store/BookingContext';
import { pendingTimerStore } from '../../utils/pendingTimerStore';
import { getServiceByIdOrName } from '../../constants/serviceCatalog';
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

const ShareIcon = ({ size = 24, color = '#141B34' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3V15M12 3L8 7M12 3L16 7"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 11V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V11"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

const WalkingManIcon = ({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="5" r="2" stroke={color} strokeWidth={1.5} />
    <Path
      d="M10 9L12 14L15 11L18 14"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 14L10 20"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15 11L16 8L13 7L10 9L7 11"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const GoldClockIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke="rgba(248, 155, 24, 0.96)" strokeWidth={1.5} />
    <Path
      d="M12 7V12L15 15"
      stroke="rgba(248, 155, 24, 0.96)"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const GreenApprovedCheckIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="rgba(12, 121, 12, 0.96)" />
    <Path
      d="M8 12.5L10.5 15L16 9.5"
      stroke="#FFFFFF"
      strokeWidth={2}
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

const GoldStarSmallIcon = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path
      d="M8 1.5L9.9 5.36L14.16 5.98L11.08 8.98L11.81 13.22L8 11.22L4.19 13.22L4.92 8.98L1.84 5.98L6.1 5.36L8 1.5Z"
      fill="rgba(248, 155, 24, 0.96)"
    />
  </Svg>
);

const LocationPinIcon = ({ size = 20, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M10 2.5C6.96 2.5 4.5 4.96 4.5 8C4.5 12.25 10 17.5 10 17.5C10 17.5 15.5 12.25 15.5 8C15.5 4.96 13.04 2.5 10 2.5Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="10" cy="8" r="2.5" stroke={color} strokeWidth={1.5} />
  </Svg>
);

const CalendarIcon = ({ size = 24, color = 'rgba(192, 192, 204, 0.96)' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="17" rx="3" stroke={color} strokeWidth={1.5} />
    <Path d="M3 9H21" stroke={color} strokeWidth={1.5} />
    <Path d="M8 2V5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M16 2V5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

const ClockGreyIcon = ({ size = 24, color = 'rgba(192, 192, 204, 0.96)' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.5} />
    <Path d="M12 7V12L15 15" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

const MessageMultipleIcon = ({ size = 20, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 17V6C3 4.89543 3.89543 4 5 4H17C18.1046 4 19 4.89543 19 6V14C19 15.1046 18.1046 16 17 16H6.5L3 19.5V17Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 18.5V20C8 20.5523 8.44772 21 9 21H18.5L21 22.5V10C21 9.44772 20.5523 9 20 9H19"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Exact Laurel Wreath Icons for "Begin Appointment" (Figma: laurel-wreath-left-01 / right-01) ──
const LaurelWreathLeftIcon = ({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Leaf 1 (Top) */}
    <Path
      d="M13.5 3C15 4.5 14.5 6.2 13 6.8C11.5 6.2 11 4.5 13.5 3Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Leaf 2 (Upper Left) */}
    <Path
      d="M10 5.5C11.5 6.8 11.2 8.5 9.8 9.2C8.5 8.5 8.2 6.8 10 5.5Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Leaf 3 (Middle Left) */}
    <Path
      d="M8 10C9.5 11.2 9.2 13 7.8 13.8C6.5 13 6.2 11.2 8 10Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Leaf 4 (Lower Left) */}
    <Path
      d="M8.5 15C10 16.2 9.8 18 8.4 18.8C7.1 18 6.8 16.2 8.5 15Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Leaf 5 (Bottom) */}
    <Path
      d="M12 18.5C13.5 19.8 13 21.5 11.5 22C10 21.5 9.8 19.8 12 18.5Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const LaurelWreathRightIcon = ({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Leaf 1 (Top) */}
    <Path
      d="M10.5 3C9 4.5 9.5 6.2 11 6.8C12.5 6.2 13 4.5 10.5 3Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Leaf 2 (Upper Right) */}
    <Path
      d="M14 5.5C12.5 6.8 12.8 8.5 14.2 9.2C15.5 8.5 15.8 6.8 14 5.5Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Leaf 3 (Middle Right) */}
    <Path
      d="M16 10C14.5 11.2 14.8 13 16.2 13.8C17.5 13 17.8 11.2 16 10Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Leaf 4 (Lower Right) */}
    <Path
      d="M15.5 15C14 16.2 14.2 18 15.6 18.8C16.9 18 17.2 16.2 15.5 15Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Leaf 5 (Bottom) */}
    <Path
      d="M12 18.5C10.5 19.8 11 21.5 12.5 22C14 21.5 14.2 19.8 12 18.5Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const PendingAppointmentDetailScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { appointments, activeAppointment, updateAppointmentStatus, cancelAppointment } = useBookingContext();

  const targetAppointment = React.useMemo(() => {
    if (params.id) {
      const found = appointments.find((a) => a.id === params.id);
      if (found) return found;
    }
    const foundPending = appointments.find((a) => a.status === 'pending' || a.status === 'approved');
    if (foundPending) return foundPending;
    if (activeAppointment && (activeAppointment.status === 'pending' || activeAppointment.status === 'approved')) {
      return activeAppointment;
    }
    return null;
  }, [appointments, params.id, activeAppointment]);

  const hasAppointment = Boolean(targetAppointment) || Boolean(params.name || params.serviceName || params.date);

  if (!hasAppointment) {
    return (
      <EmptyBookedItemScreen
        title="Appointments"
        onGoBack={() => router.replace('/home/bookings' as any)}
        onExploreLocations={() => router.replace('/home' as any)}
      />
    );
  }

  // Dynamic Parameters with fallback to live active appointment or Figma defaults
  const serviceName = (params.name as string) || (params.serviceName as string) || targetAppointment?.serviceName || bookingStore.getServiceName() || 'Acrylic nails';
  const price = (params.price as string) || (targetAppointment ? `₦${targetAppointment.totalPrice.toLocaleString()}` : `₦${(bookingStore.getFinalTotal() || 12000).toLocaleString()}`);
  const duration = (params.duration as string) || targetAppointment?.duration || bookingStore.getDuration() || '24min';
  const rating = (params.rating as string) || targetAppointment?.rating || bookingStore.getRating() || '5.1';
  const appointmentType = (params.appointmentType as string) || (targetAppointment ? 'In-Person' : bookingStore.getAppointmentType() || 'In-Person');
  const ticketNumber = (params.ticketNumber as string) || targetAppointment?.ticketNumber || '#740375';
  const bookedDate = (params.date as string) || (params.bookedDay as string) || targetAppointment?.date || bookingStore.getAppointmentDate() || 'Wednesday, Oct 24';
  const bookedTime = (params.time as string) || (params.bookedTime as string) || targetAppointment?.time || bookingStore.getAppointmentTime() || '10:00 AM';
  const locationAddress = (params.address as string) || targetAppointment?.salonAddress || bookingStore.getSalonAddress() || 'Jabi, lake mall abuja';
  const salonName = (params.salonName as string) || (params.salon as string) || targetAppointment?.salonName || bookingStore.getSalonName() || 'Luminous Lux';
  const salonId = (params.salonId as string) || (targetAppointment as any)?.salonId || bookingStore.getSalonId() || 'salon2';

  // Dynamic Service Image resolution
  const catalogService = getServiceByIdOrName((params.serviceId as string) || bookingStore.getServiceId(), serviceName);
  const serviceImageSource =
    params.image ||
    params.serviceImage ||
    targetAppointment?.serviceImage ||
    bookingStore.getServiceImage() ||
    catalogService?.image ||
    (serviceName.toLowerCase().includes('nail') || serviceName.toLowerCase().includes('acrylic')
      ? require('../../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg')
      : require('../../../assets/images/services/men_haircut.png'));

  // Unique key for tracking persistent appointment timer
  const aptKey = targetAppointment?.id || (params.id as string) || 'default_pending';

  // State: 'pending' (waiting for provider) -> 'approved' (accepted by provider)
  const initialStatus = (params.status as string) === 'approved' || targetAppointment?.status === 'approved' ? 'approved' : 'pending';
  const [appointmentState, setAppointmentState] = useState<'pending' | 'approved'>(initialStatus);

  // Live Persistent Countdown Timer (keeps decreasing in real time even when leaving the page)
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    if (initialStatus === 'approved') return 0;
    return pendingTimerStore.getRemainingSeconds(aptKey, 180, targetAppointment?.createdAt);
  });
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (appointmentState === 'approved') return;

    const syncTimer = () => {
      const remaining = pendingTimerStore.getRemainingSeconds(aptKey, 180, targetAppointment?.createdAt);
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        setAppointmentState('approved');
        if (targetAppointment && targetAppointment.status !== 'approved') {
          updateAppointmentStatus(targetAppointment.id, 'approved');
        }
      }
    };

    // Immediate sync on mount / screen focus
    syncTimer();

    const interval = setInterval(syncTimer, 1000);
    return () => clearInterval(interval);
  }, [aptKey, appointmentState, targetAppointment, updateAppointmentStatus]);

  const formattedTimer = `${Math.floor(secondsLeft / 60)}:${(secondsLeft % 60).toString().padStart(2, '0')}`;

  const handleGoBack = () => {
    router.replace('/home/bookings' as any);
  };

  const handleContactSupport = () => {
    router.push('/contact-support' as any);
  };

  const handleMessage = () => {
    router.push({
      pathname: '/chat/[id]',
      params: {
        id: salonId,
        name: salonName,
      },
    } as any);
  };

  const handleBeginAppointment = async () => {
    if (targetAppointment) {
      await updateAppointmentStatus(targetAppointment.id, 'ongoing');
    }
    router.push({
      pathname: '/ongoing-appointment',
      params: {
        id: targetAppointment?.id,
        name: serviceName,
        price: price,
        duration: duration,
        rating: rating,
        ticketNumber: ticketNumber,
        date: bookedDate,
        time: bookedTime,
        address: locationAddress,
      },
    } as any);
  };

  const handleConfirmDiscard = async () => {
    setIsCancelModalOpen(false);
    pendingTimerStore.resetTimer(aptKey);
    if (targetAppointment) {
      await cancelAppointment(targetAppointment.id, 'User cancelled');
    }
    // Transition to Cancelled Booking Detail Screen
    router.replace({
      pathname: '/cancelled-booking',
      params: {
        id: targetAppointment?.id,
        name: serviceName,
        price: price,
        duration: duration,
        rating: rating,
        ticketNumber: ticketNumber,
        date: bookedDate,
        time: bookedTime,
        address: locationAddress,
      },
    } as any);
  };

  const handleReviewAppointment = () => {
    router.push({
      pathname: '/review-appointment',
      params: {
        id: params.id,
        name: serviceName,
        price: price,
        duration: duration,
        rating: rating,
        ticketNumber: ticketNumber,
        date: bookedDate,
        time: bookedTime,
        address: locationAddress,
        paymentOption: params.paymentOption,
        paymentMethod: params.paymentMethod,
      },
    } as any);
  };

  const handleLocationPress = () => {
    router.push({
      pathname: '/salon/location',
      params: {
        salonId: (params.salonId as string) || 'salon2',
        name: (params.salonName as string) || 'Luminous Lux',
        address: locationAddress,
        price: price,
        rating: rating,
      },
    } as any);
  };

  // Helper to instantly simulate timer reset / provider approval
  const handleSimulateApproval = () => {
    if (appointmentState === 'pending') {
      pendingTimerStore.expireTimer(aptKey);
      setSecondsLeft(0);
      setAppointmentState('approved');
      if (targetAppointment && targetAppointment.status !== 'approved') {
        updateAppointmentStatus(targetAppointment.id, 'approved');
      }
    }
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

        <Text style={styles.headerTitle}>Appointment</Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setIsShareModalOpen(true)}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ShareIcon size={24} />
        </TouchableOpacity>
      </View>

      {/* ── Scrollable Body Content ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 100 },
        ]}
      >
        {/* ── 1. Top Card: Booking Type Indicator (Figma: 358x82, radius 24px) ── */}
        <View style={styles.bookingTypeCard}>
          {/* Left: Walking Man Icon + Booking Type Name */}
          <View style={styles.bookingTypeLeftGroup}>
            <View style={styles.walkIconContainer}>
              <WalkingManIcon size={20} />
            </View>
            <View style={styles.bookingTypeDetails}>
              <Text style={styles.bookingTypeCaption}>Booking Type</Text>
              <Text style={styles.bookingTypeValue}>{appointmentType}</Text>
            </View>
          </View>

          {/* Right: Pending Status vs Approved Badge */}
          {appointmentState === 'pending' ? (
            <View style={styles.pendingStatusGroup}>
              <GoldClockIcon size={24} />
              <View style={styles.pendingStatusDetails}>
                <Text style={styles.pendingStatusText}>Pending</Text>
                <Text style={styles.pendingTimerText}>{formattedTimer}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.approvedStatusGroup}>
              <GreenApprovedCheckIcon size={24} />
              <Text style={styles.approvedStatusText}>Approved</Text>
            </View>
          )}
        </View>

        {/* ── 2. Approval Notes Section (Figma: height 68px, gap 8px) ── */}
        <View style={styles.noteSection}>
          <Text style={styles.noteHeader}>Note</Text>
          <Text style={styles.noteBody}>
            {appointmentState === 'pending'
              ? 'Waiting for Service provider to accept your appointment'
              : 'Appointment accepted! Press BEGIN only when you arrive at the salon.'}
          </Text>
        </View>

        {/* ── 3. Booked Tag Main Container (Figma: 358x384, radius 24px) ── */}
        <View style={styles.bookedTagCard}>
          {/* Top Service Content Row: Image + Details */}
          <View style={styles.serviceHeaderContent}>
            {/* Service Thumbnail (88x88, radius 24px) */}
            <View style={styles.imageFrame}>
              <SafeImage
                source={serviceImageSource}
                style={styles.serviceImage}
                resizeMode="cover"
              />
            </View>

            {/* Service Text Information */}
            <View style={styles.serviceInfoColumn}>
              <Text style={styles.serviceNameText} numberOfLines={1}>
                {serviceName}
              </Text>
              <Text style={styles.servicePriceText}>{price}</Text>

              {/* Duration & Star Rating */}
              <View style={styles.serviceMetaRow}>
                <View style={styles.durationMeta}>
                  <ClockTimeSmallIcon size={16} />
                  <Text style={styles.metaLabelText}>{duration}</Text>
                </View>

                <View style={styles.ratingMeta}>
                  <GoldStarSmallIcon size={14} />
                  <Text style={styles.metaLabelText}>{rating}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Location Address Banner (Figma: 326x36, radius 8px, bg #f8f9fa) */}
          <TouchableOpacity
            style={styles.locationBanner}
            activeOpacity={0.7}
            onPress={handleLocationPress}
          >
            <LocationPinIcon size={18} />
            <Text style={styles.locationBannerText} numberOfLines={1}>
              {locationAddress}
            </Text>
          </TouchableOpacity>

          {/* Booked Day & Booked Time Double White Boxes (Figma: 326x72) */}
          <View style={styles.dateTimeBoxesRow}>
            {/* Left Box: Booked Day */}
            <View style={styles.dateTimeBox}>
              <CalendarIcon size={22} />
              <View style={styles.dateTimeBoxTextCol}>
                <Text style={styles.boxCaptionText}>Booked day</Text>
                <Text style={styles.boxValueText}>{bookedDate}</Text>
              </View>
            </View>

            {/* Divider Line */}
            <View style={styles.verticalDividerLine} />

            {/* Right Box: Booked Time */}
            <View style={styles.dateTimeBox}>
              <ClockGreyIcon size={22} />
              <View style={styles.dateTimeBoxTextCol}>
                <Text style={styles.boxCaptionText}>Booked Time</Text>
                <Text style={styles.boxValueText}>{bookedTime}</Text>
              </View>
            </View>
          </View>

          {/* Appointment Ticket & Review Link */}
          <View style={styles.ticketAndReviewRow}>
            <View style={styles.ticketColumn}>
              <Text style={styles.ticketCaptionText}>Appointment Ticket</Text>
              <Text style={styles.ticketValueText}>{ticketNumber}</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleReviewAppointment}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.reviewAppointmentLinkText}>Review Appointment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ── Sticky Bottom Action Bar (Figma: height 80px, shadow) ── */}
      <View style={[styles.bottomActionBar, { paddingBottom: Math.max(16, insets.bottom) }]}>
        {appointmentState === 'pending' ? (
          <>
            {/* Left: Message Button */}
            <TouchableOpacity
              style={styles.contactProviderButton}
              activeOpacity={0.85}
              onPress={handleMessage}
            >
              <MessageMultipleIcon size={20} color="#FFFFFF" />
              <Text style={styles.contactProviderText}>Message</Text>
            </TouchableOpacity>

            {/* Right: Timer Countdown Display (Non-clickable during pending countdown) */}
            <View style={styles.cancelCountdownButton}>
              <Text style={styles.cancelCountdownText}>{formattedTimer}</Text>
            </View>
          </>
        ) : (
          <>
            {/* Left: Begin Appointment Button */}
            <TouchableOpacity
              style={styles.beginAppointmentButton}
              activeOpacity={0.85}
              onPress={handleBeginAppointment}
            >
              <LaurelWreathLeftIcon size={20} color="#FFFFFF" />
              <Text style={styles.beginAppointmentText}>Begin Appointment</Text>
              <LaurelWreathRightIcon size={20} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Right: Cancel Button */}
            <TouchableOpacity
              style={styles.cancelApprovedButton}
              activeOpacity={0.8}
              onPress={() => setIsCancelModalOpen(true)}
            >
              <Text style={styles.cancelApprovedText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* ── Cancel Booking Pop-up Modal (Figma: Cancel Booking, Discard, Cancel) ── */}
      <Modal
        visible={isCancelModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCancelModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.cancelModalContainer}>
            <Text style={styles.cancelModalTitle}>Cancel Booking</Text>
            <Text style={styles.cancelModalSubtitle}>
              If you cancel your appointment, this booking will be removed
            </Text>

            <View style={styles.cancelModalActions}>
              <TouchableOpacity
                style={styles.modalDiscardButton}
                activeOpacity={0.85}
                onPress={handleConfirmDiscard}
              >
                <Text style={styles.modalDiscardText}>Discard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalDismissButton}
                activeOpacity={0.7}
                onPress={() => setIsCancelModalOpen(false)}
              >
                <Text style={styles.modalDismissText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Share Modal ── */}
      <InAppShareModal
        visible={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={`${serviceName} Appointment`}
        url={`https://trend.app/appointment/${ticketNumber}`}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header ──
  headerRow: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
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
    paddingTop: 16,
    gap: 20,
  },

  // ── 1. Booking Type Indicator Card ──
  bookingTypeCard: {
    width: '100%',
    height: 82,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookingTypeLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walkIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingTypeDetails: {
    gap: 2,
  },
  bookingTypeCaption: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  bookingTypeValue: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  pendingStatusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pendingStatusDetails: {
    gap: 2,
    alignItems: 'flex-start',
  },
  pendingStatusText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(248, 155, 24, 0.96)',
  },
  pendingTimerText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.3,
    color: 'rgba(248, 155, 24, 0.96)',
  },
  approvedStatusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  approvedStatusText: {
    ...typography.button,
    color: 'rgba(12, 121, 12, 0.96)',
  },

  // ── 2. Approval Notes Section ──
  noteSection: {
    gap: 6,
    paddingHorizontal: 4,
  },
  noteHeader: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_700Bold',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(248, 155, 24, 0.96)',
  },
  noteBody: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: '#000000',
  },

  // ── 3. Booked Tag Main Container ──
  bookedTagCard: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    padding: 16,
    gap: 20,
  },
  serviceHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  imageFrame: {
    width: 88,
    height: 88,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  serviceInfoColumn: {
    flex: 1,
    gap: 4,
  },
  serviceNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  servicePriceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: Platform.OS === 'ios' ? 0.6 : 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  serviceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 2,
  },
  durationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabelText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Location Banner ──
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  locationBannerText: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
    textDecorationLine: 'underline',
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Date & Time Double Boxes ──
  dateTimeBoxesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  dateTimeBox: {
    flex: 1,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
    shadowColor: 'rgba(0, 0, 0, 0.03)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 1,
  },
  verticalDividerLine: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  dateTimeBoxTextCol: {
    flex: 1,
    gap: 2,
  },
  boxCaptionText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  boxValueText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
    color: '#000000',
  },

  // ── Appointment Ticket & Review Row ──
  ticketAndReviewRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  ticketColumn: {
    gap: 2,
  },
  ticketCaptionText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  ticketValueText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: '#000000',
  },
  reviewAppointmentLinkText: {
    ...typography.button,
    fontSize: 15,
    lineHeight: 22,
    textDecorationLine: 'underline',
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Sticky Bottom Action Bar ──
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },

  // Pending State Bottom Buttons
  contactProviderButton: {
    flex: 1.5,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  contactProviderText: {
    ...typography.button,
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
  },
  cancelCountdownButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelCountdownText: {
    ...typography.button,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(204, 41, 41, 0.9)',
  },

  // Approved State Bottom Buttons (Figma: width 246px Begin, width 96px Cancel, gap 16)
  beginAppointmentButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  beginAppointmentText: {
    ...typography.button,
    textTransform: 'capitalize',
    color: '#FFFFFF',
  },
  cancelApprovedButton: {
    width: 96,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  cancelApprovedText: {
    ...typography.button,
    textTransform: 'capitalize',
    color: 'rgba(204, 41, 41, 0.9)',
  },

  // ── Cancel Modal (Figma: Discard / Cancel) ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 8, 20, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cancelModalContainer: {
    width: '100%',
    maxWidth: 326,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 24,
    gap: 16,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 10,
  },
  cancelModalTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#000814',
    textAlign: 'center',
  },
  cancelModalSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  cancelModalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalDiscardButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDiscardText: {
    ...typography.button,
    fontSize: 15,
    color: 'rgba(204, 41, 41, 0.9)',
  },
  modalDismissButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDismissText: {
    ...typography.button,
    fontSize: 15,
    color: 'rgba(0, 8, 20, 0.96)',
  },
});

export default PendingAppointmentDetailScreen;
