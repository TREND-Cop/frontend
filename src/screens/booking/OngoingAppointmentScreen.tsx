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
import { AppointmentTypeModal, AppointmentBookingType } from '../../components/AppointmentTypeModal';
import { EmptyBookedItemScreen } from './EmptyBookedItemScreen';
import { useBookingContext } from '../../store/BookingContext';
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

const GreenClockQuarterIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke="rgba(12, 121, 12, 0.96)" strokeWidth={1.5} />
    <Path
      d="M12 6.5V12L15.5 15.5"
      stroke="rgba(12, 121, 12, 0.96)"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 3V5"
      stroke="rgba(12, 121, 12, 0.96)"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

const GreenCheckBadgeIcon = ({ size = 24 }: { size?: number }) => (
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

// ── Star Loading Indicator (Figma: Star 3, 72x72px) ──
const StarLoadingIcon = ({ size = 72, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 72 72" fill="none">
    <Path
      d="M36 6L44.5 25.5L66 27.5L50 42L54.5 63.5L36 53L17.5 63.5L22 42L6 27.5L27.5 25.5L36 6Z"
      fill={color}
    />
  </Svg>
);

export const OngoingAppointmentScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { appointments, activeAppointment, updateAppointmentStatus } = useBookingContext();

  const targetAppointment = React.useMemo(() => {
    if (params.id) {
      const found = appointments.find((a) => a.id === params.id);
      if (found) return found;
    }
    const foundOngoing = appointments.find((a) => a.status === 'ongoing');
    if (foundOngoing) return foundOngoing;
    if (activeAppointment && (activeAppointment.status === 'ongoing' || activeAppointment.status === 'approved' || activeAppointment.status === 'pending')) {
      return activeAppointment;
    }
    return null;
  }, [appointments, params.id, activeAppointment]);

  const hasOngoing = Boolean(targetAppointment) || Boolean(params.name || params.serviceName);

  if (!hasOngoing) {
    return (
      <EmptyBookedItemScreen
        title="Ongoing Appointment"
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

  // Live Timer: 30 seconds
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAppointmentTypeModalOpen, setIsAppointmentTypeModalOpen] = useState(false);
  const [isCompletingService, setIsCompletingService] = useState(false);

  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining]);

  const isCompleted = secondsRemaining === 0;

  // Format 1:25:30 or 00:00:00
  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `00:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleGoBack = () => {
    router.replace('/home/bookings' as any);
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

  const [selectedBookingType, setSelectedBookingType] = useState<AppointmentBookingType | null>(null);

  const handleBookAgain = () => {
    if (!isCompleted) return;
    setIsAppointmentTypeModalOpen(true);
  };

  const handleSelectAppointmentType = (type: AppointmentBookingType) => {
    setSelectedBookingType(type);
    setIsAppointmentTypeModalOpen(false);
    router.push({
      pathname: '/appointment-time',
      params: {
        appointmentType: type,
        serviceName: serviceName,
        price: price,
      },
    } as any);
  };

  const handleServiceComplete = () => {
    if (!isCompleted) {
      // Allow testing simulation by setting timer to 0
      Alert.alert(
        'Simulate Service Completion?',
        'The timer is currently running. Would you like to finish the ongoing service now?',
        [
          { text: 'Wait', style: 'cancel' },
          {
            text: 'Complete Now',
            onPress: () => setSecondsRemaining(0),
          },
        ]
      );
      return;
    }

    // Show star loading indicator, then transition to Customer Review Screen
    setIsCompletingService(true);
    setTimeout(async () => {
      if (targetAppointment) {
        await updateAppointmentStatus(targetAppointment.id, 'completed');
      }
      setIsCompletingService(false);
      router.replace({
        pathname: '/customer-review',
        params: {
          salonName: targetAppointment?.salonName || 'Luminous Lux',
          specialistName: targetAppointment?.specialist?.name || (targetAppointment?.specialists && targetAppointment.specialists[0]?.name) || 'Precious Emmanuel',
          specialistRole: targetAppointment?.specialist?.role || (targetAppointment?.specialists && targetAppointment.specialists[0]?.role) || 'Hair stylist',
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
    }, 1200);
  };

  const handleLocationPress = () => {
    router.push({
      pathname: '/salon/location',
      params: {
        salonId: (params.salonId as string) || (activeAppointment as any)?.salonId || 'salon2',
        name: (params.salonName as string) || activeAppointment?.salonName || 'Luminous Lux',
        address: locationAddress,
        price: price,
        rating: rating,
      },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Page Header (Figma: height 64px, borderBottom 1px) ── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeftIcon size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Ongoing Appointment</Text>

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
          { paddingBottom: Math.max(insets.bottom, 24) + 90 },
        ]}
      >
        {/* ── 1. Top Card: Ongoing Service Indicator (Figma: 358x86, radius 24px, bg rgba(238, 248, 238, 0.8)) ── */}
        <View
          style={[
            styles.timerCard,
            isCompleted && styles.timerCardCompleted,
          ]}
        >
          {/* Left: Time Badge (Figma Frame 1000006525: 78x40px, bg #FFF, radius 24px) */}
          <View style={styles.timeBadgeContainer}>
            <Text style={styles.timeBadgeText}>
              {isCompleted ? '00:00:00' : formatTimer(secondsRemaining)}
            </Text>
          </View>

          {/* Right: Text Block (Figma Frame 1000006322: gap 6px) */}
          <View style={styles.timerDetailsCol}>
            <Text style={styles.ongoingTitleText}>Ongoing Appointment</Text>
            <Text style={styles.ongoingSubtitleText}>
              {isCompleted
                ? 'This appointment is completed'
                : 'This appointment is currently in progress'}
            </Text>
          </View>
        </View>

        {/* ── 2. Booked Tag Main Container (Figma: 358x472, radius 24px) ── */}
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

          {/* Book Again Inner Button */}
          <TouchableOpacity
            style={[
              styles.bookAgainInnerButton,
              isCompleted && styles.bookAgainInnerButtonActive,
            ]}
            activeOpacity={isCompleted ? 0.85 : 1}
            onPress={handleBookAgain}
            disabled={!isCompleted}
          >
            {isCompleted ? (
              <Text style={styles.bookAgainInnerButtonActiveText}>
                Book Again
              </Text>
            ) : (
              <Text style={styles.bookAgainInnerButtonDisabledText}>Book Again</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── 3. Service Complete Note Warning Section ── */}
        <View style={styles.noteSection}>
          <Text style={styles.noteTitleText}>Note</Text>
          <Text style={styles.noteBodyText}>
            When the timer runs down to zero, the SERVICE COMPLETE button will be open for click.
            {'\n\n'}
            Once clicked on it indicate the service has been completed successful, note this action can not be undone.
          </Text>
        </View>
      </ScrollView>

      {/* ── Sticky Bottom Action Bar (Figma: height 64px, shadow) ── */}
      <View style={[styles.bottomActionBar, { paddingBottom: Math.max(16, insets.bottom) }]}>
        <TouchableOpacity
          style={[
            styles.serviceCompleteButton,
            isCompleted && styles.serviceCompleteButtonActive,
          ]}
          activeOpacity={0.85}
          onPress={handleServiceComplete}
        >
          <Text
            style={[
              styles.serviceCompleteButtonText,
              isCompleted && styles.serviceCompleteButtonTextActive,
            ]}
          >
            Service Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Share Modal ── */}
      <InAppShareModal
        visible={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Ongoing Appointment"
        url={`https://trend.app/ongoing/${ticketNumber}`}
      />

      {/* ── Star Loading Indicator Overlay (Figma: Star 3, 72x72) ── */}
      <Modal visible={isCompletingService} transparent animationType="fade">
        <View style={styles.starLoadingBackdrop}>
          <View style={styles.starLoadingContainer}>
            <StarLoadingIcon size={72} color="rgba(0, 8, 20, 0.96)" />
          </View>
        </View>
      </Modal>

      {/* ── Appointment Type Modal (for Book Again 10% OFF) ── */}
      <AppointmentTypeModal
        visible={isAppointmentTypeModalOpen}
        selectedType={selectedBookingType}
        onClose={() => setIsAppointmentTypeModalOpen(false)}
        onSelectType={handleSelectAppointmentType}
        basePrice={22700}
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
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Scroll Content ──
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 20,
  },

  // ── 1. Top Ongoing Service Indicator (Figma: 358x86, radius 24px, bg rgba(238, 248, 238, 0.8)) ──
  timerCard: {
    width: '100%',
    height: 86,
    borderRadius: 24,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  timerCardCompleted: {
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
  },
  timeBadgeContainer: {
    minWidth: 78,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  timeBadgeText: {
    ...typography.button,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(12, 121, 12, 0.96)',
    textAlign: 'center',
  },
  timerDetailsCol: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  ongoingTitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  ongoingSubtitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── 2. Booked Tag Main Container (Figma: 358x472, radius 24px) ──
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
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  servicePriceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
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
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.3,
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
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.3,
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
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  boxValueText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.3,
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
    letterSpacing: 0.4,
    color: '#000000',
  },
  reviewAppointmentLinkText: {
    ...typography.button,
    fontSize: 15,
    lineHeight: 22,
    textDecorationLine: 'underline',
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Book Again Inner Button ──
  bookAgainInnerButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookAgainInnerButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'transparent',
  },
  bookAgainInnerButtonDisabledText: {
    ...typography.button,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(192, 192, 204, 0.96)',
  },
  bookAgainInnerButtonActiveText: {
    ...typography.button,
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
  },
  bookAgainGoldText: {
    color: 'rgba(248, 155, 24, 0.96)',
  },

  // ── 3. Service Complete Note Section ──
  noteSection: {
    gap: 8,
    paddingHorizontal: 4,
  },
  noteTitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.6,
    color: 'rgba(204, 41, 41, 0.9)',
  },
  noteBodyText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Sticky Bottom Action Bar ──
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  serviceCompleteButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceCompleteButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'transparent',
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  serviceCompleteButtonText: {
    ...typography.button,
    color: 'rgba(192, 192, 204, 0.96)',
  },
  serviceCompleteButtonTextActive: {
    color: '#FFFFFF',
  },

  // ── Star Loading Indicator (Figma: Star 3, 72x72) ──
  starLoadingBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starLoadingContainer: {
    width: 88,
    height: 88,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OngoingAppointmentScreen;
