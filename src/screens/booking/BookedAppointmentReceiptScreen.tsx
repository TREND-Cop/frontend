import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { SafeImage } from '../../components/ui/SafeImage';
import { bookingStore } from '../../utils/bookingStore';
import { useBookingContext } from '../../store/BookingContext';
import { getServiceByIdOrName } from '../../constants/serviceCatalog';
import { ADD_ON_CATALOG } from '../../constants/addOneCatalog';
import { getPackageById, PackageItem } from '../../constants/packageCatalog';

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

const CheckmarkCircleIcon = ({ size = 24, color = 'rgba(12, 121, 12, 0.96)' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill={color} />
    <Path
      d="M8 12L11 15L16 9"
      stroke="#FFFFFF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PackageCheckCircleIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Circle cx="10" cy="10" r="10" fill="rgba(0, 8, 20, 0.96)" />
    <Path
      d="M6 10L8.5 12.5L14 7"
      stroke="#FFFFFF"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ClockTimeIcon = ({ size = 18, color = 'rgba(96, 96, 102, 0.96)' }: { size?: number; color?: string }) => (
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

const CalendarIcon = ({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) => (
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

const ClockBigIcon = ({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) => (
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

const HomeServiceIcon = ({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 10L12 3L21 10V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 21V12H15V21"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BookedAppointmentReceiptScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { activeAppointment, appointments } = useBookingContext();

  // Find appointment by ticketNumber, id, or fallback to activeAppointment
  const currentAppointment = useMemo(() => {
    if (params.ticketNumber) {
      const match = appointments.find((a) => a.ticketNumber === params.ticketNumber);
      if (match) return match;
      return null;
    }
    if (params.id) {
      const match = appointments.find((a) => a.id === params.id);
      if (match) return match;
      return null;
    }
    return activeAppointment || null;
  }, [params.ticketNumber, params.id, activeAppointment, appointments]);

  // Dynamic parameters for Primary Service
  const primaryServiceName = (params.name || params.serviceName || currentAppointment?.serviceName || bookingStore.getServiceName() || 'Acrylic nails') as string;
  const primaryServicePrice = (params.price || (currentAppointment ? `₦${currentAppointment.basePrice.toLocaleString()}` : (bookingStore.getBasePrice() ? `₦${bookingStore.getBasePrice().toLocaleString()}` : '₦12,000'))) as string;
  const primaryServiceDuration = (params.duration || (currentAppointment ? '24min' : bookingStore.getDuration()) || '24min') as string;
  const primaryServiceRating = (params.rating || (currentAppointment ? '5.1' : bookingStore.getRating()) || '5.1') as string;

  // Dynamic Service Image resolution
  const catalogService = getServiceByIdOrName((params.serviceId as string) || bookingStore.getServiceId(), primaryServiceName);
  const primaryServiceImage =
    params.image ||
    params.serviceImage ||
    currentAppointment?.serviceImage ||
    bookingStore.getServiceImage() ||
    catalogService?.image ||
    ((primaryServiceName.toLowerCase().includes('almond') || (primaryServiceName.toLowerCase().includes('green') && primaryServiceName.toLowerCase().includes('acrylic')))
      ? require('../../../assets/images/profile/4538d4759870466dd05509849b26c4b0b111d827.jpg')
      : (primaryServiceName.toLowerCase().includes('nail') || primaryServiceName.toLowerCase().includes('acrylic')
      ? require('../../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg')
      : (currentAppointment?.salonImage ? { uri: currentAppointment.salonImage } : require('../../../assets/images/profile/men_braids.jpg'))));

  // Specialist resolution for Primary Service
  const specialist = currentAppointment?.specialist || bookingStore.getSelectedSpecialist();
  const specialistName = (params.specialistName as string) || specialist?.name || 'Bisola Olarewaju';
  const specialistRole = (params.specialistRole as string) || specialist?.role || 'Nail Artist';
  const specialistRating = (params.specialistRating as string) || specialist?.rating || '6.1';
  const specialistDuration = '24min';
  const specialistAvatar = specialist && 'avatarUri' in specialist && specialist.avatarUri
    ? { uri: specialist.avatarUri }
    : specialist && 'image' in specialist && specialist.image
    ? (typeof specialist.image === 'string' ? { uri: specialist.image } : specialist.image)
    : require('../../../assets/images/lady.jpg');

  // Multi-Specialist resolution for Primary Service
  const resolvedSpecialists = useMemo(() => {
    if (currentAppointment?.specialists && currentAppointment.specialists.length > 0) {
      return currentAppointment.specialists;
    }
    const storeSpecialists = bookingStore.getSelectedSpecialists();
    if (storeSpecialists.length > 0) {
      return storeSpecialists;
    }
    if (specialist) {
      return [specialist];
    }
    return [
      {
        id: 'sp-default',
        name: specialistName,
        role: specialistRole,
        rating: specialistRating,
        image: specialistAvatar,
      },
    ];
  }, [currentAppointment, specialist, specialistName, specialistRole, specialistRating, specialistAvatar]);

  // Separate Add-On Items (strictly distinct from primary service!)
  interface BookedAddOnItem {
    id: string;
    name: string;
    price: string;
    rawPrice: number;
    duration: string;
    rating: string;
    image: any;
    specialist?: {
      name: string;
      role: string;
      rating: string;
      image?: any;
    };
  }

  const bookedAddOnsList: BookedAddOnItem[] = useMemo(() => {
    // 1. From current appointment record
    if (currentAppointment?.addOns && currentAppointment.addOns.length > 0) {
      return currentAppointment.addOns.map((ao) => {
        const catalogItem = ADD_ON_CATALOG[ao.id];
        return {
          id: ao.id,
          name: ao.name,
          price: `₦${ao.price.toLocaleString()}`,
          rawPrice: ao.price,
          duration: catalogItem?.duration || '24min',
          rating: String(catalogItem?.rating || '5.1'),
          image: catalogItem?.image || require('../../../assets/images/profile/dry_wow_pedicure.jpg'),
          specialist: catalogItem?.specialist
            ? {
                name: catalogItem.specialist.name,
                role: catalogItem.specialist.role,
                rating: catalogItem.specialist.rating,
                image: catalogItem.specialist.image,
              }
            : undefined,
        };
      });
    }

    // 2. From bookingStore if viewing right after checkout without appointment record
    if (!currentAppointment && !params.ticketNumber && !params.id && !params.name && !params.serviceName) {
      const storeAddOns = bookingStore.getSelectedItems();
      if (storeAddOns.length > 0) {
        return storeAddOns.map((ao) => ({
          id: ao.id,
          name: ao.name,
          price: `₦${ao.price.toLocaleString()}`,
          rawPrice: ao.price,
          duration: ao.duration || '24min',
          rating: String(ao.rating || '5.1'),
          image: ao.image || require('../../../assets/images/profile/dry_wow_pedicure.jpg'),
          specialist: ao.specialist
            ? {
                name: ao.specialist.name,
                role: ao.specialist.role,
                rating: ao.specialist.rating,
                image: ao.specialist.image,
              }
            : undefined,
        }));
      }
    }

    // 3. Fallback from URL params if passed
    if (params.addOnName || params.addOnPrice) {
      return [
        {
          id: 'ao_param',
          name: (params.addOnName as string) || 'Nail Repair',
          price: (params.addOnPrice as string) || '₦22,700',
          rawPrice: parseInt(String(params.addOnPrice).replace(/[^0-9]/g, ''), 10) || 22700,
          duration: (params.addOnDuration as string) || '24min',
          rating: (params.addOnRating as string) || '5.1',
          image: require('../../../assets/images/profile/dry_wow_pedicure.jpg'),
        },
      ];
    }

    return [];
  }, [currentAppointment, params.ticketNumber, params.id, params.name, params.serviceName, params.addOnName, params.addOnPrice, params.addOnDuration, params.addOnRating]);

  // Specialist for Add-One Section
  const resolvedAddOnSpecialist = useMemo(() => {
    if (currentAppointment?.addOnSpecialist) {
      return currentAppointment.addOnSpecialist;
    }
    const storeAddOnSpec = bookingStore.getAddOnSpecialist();
    if (storeAddOnSpec) {
      return storeAddOnSpec;
    }
    if (bookedAddOnsList.length > 0 && bookedAddOnsList[0].specialist) {
      return bookedAddOnsList[0].specialist;
    }
    return {
      id: 'spec_addon_default',
      name: 'Bisola Olarewaju',
      role: 'Nail Artist',
      rating: '6.1',
      image: require('../../../assets/images/lady.jpg'),
    };
  }, [currentAppointment, bookedAddOnsList]);

  // Dynamically resolve the package the user booked (null if no package was booked)
  const bookedPackage: PackageItem | null = useMemo(() => {
    if (currentAppointment?.servicePackage) {
      const pkg = currentAppointment.servicePackage;
      const catalogMatch = getPackageById(pkg.id);
      return {
        id: pkg.id,
        name: pkg.name || catalogMatch?.name || 'Service Package',
        price: pkg.price ?? catalogMatch?.price ?? 0,
        images: (pkg.images && Array.isArray(pkg.images) && pkg.images.length > 0)
          ? pkg.images
          : (catalogMatch?.images || []),
        features: (pkg.features && Array.isArray(pkg.features) && pkg.features.length > 0)
          ? pkg.features
          : (catalogMatch?.features || []),
      };
    }

    if (!currentAppointment && !params.ticketNumber && !params.id && !params.name && !params.serviceName) {
      const storePkg = bookingStore.getSelectedPackage();
      if (storePkg) {
        return storePkg;
      }
    }

    if (params.packageId) {
      const match = getPackageById(params.packageId as string);
      if (match) return match;
    }

    if (params.packageName || params.packagePrice) {
      let parsedImages = [];
      let parsedFeatures = [];
      try {
        if (params.packageImages) parsedImages = JSON.parse(params.packageImages as string);
        if (params.packageFeatures) parsedFeatures = JSON.parse(params.packageFeatures as string);
      } catch (e) {}

      return {
        id: (params.packageId as string) || 'pkg_custom',
        name: (params.packageName as string) || 'Service Package',
        price: params.packagePrice ? Number(params.packagePrice) : 0,
        images: parsedImages,
        features: parsedFeatures,
      };
    }

    return null;
  }, [currentAppointment?.servicePackage, params.packageId, params.packageName, params.packagePrice, params.packageImages, params.packageFeatures]);

  const packageImages = (bookedPackage?.images && Array.isArray(bookedPackage.images)) ? bookedPackage.images : [];
  const packageFeatures = (bookedPackage?.features && Array.isArray(bookedPackage.features)) ? bookedPackage.features : [];
  const packagePriceFormatted = bookedPackage
    ? (typeof bookedPackage.price === 'number'
        ? `₦${bookedPackage.price.toLocaleString()}`
        : (bookedPackage.price || ''))
    : '';

  // Dynamic receipt total calculation
  const totalAmount = useMemo(() => {
    if (params.total) return params.total as string;
    if (currentAppointment?.totalPrice) return `₦${currentAppointment.totalPrice.toLocaleString()}`;
    const primaryRaw = parseInt(primaryServicePrice.replace(/[^0-9]/g, ''), 10) || 12000;
    const addOnsSum = bookedAddOnsList.reduce((acc, s) => acc + s.rawPrice, 0);
    const packageSum = bookedPackage ? (typeof bookedPackage.price === 'number' ? bookedPackage.price : 0) : 0;
    const sum = primaryRaw + addOnsSum + packageSum;
    return `₦${sum.toLocaleString()}`;
  }, [params.total, currentAppointment, primaryServicePrice, bookedAddOnsList, bookedPackage]);

  // Resolve payment details dynamically
  const appointmentPaymentDetails = currentAppointment?.paymentDetails;
  const storePaymentDetails = bookingStore.getPaymentDetails();

  const resolvedMethod = useMemo((): 'bank_transfer' | 'card' | 'cash' => {
    const rawParam = ((params.paymentMethod || params.paymentOption || '') as string).toLowerCase();
    if (rawParam.includes('cash')) return 'cash';
    if (rawParam.includes('card')) return 'card';
    if (rawParam.includes('transfer') || rawParam.includes('bank')) return 'bank_transfer';

    if (currentAppointment?.paymentMethod) return currentAppointment.paymentMethod;
    if (currentAppointment?.paymentDetails?.method) return currentAppointment.paymentDetails.method;
    const aptOption = (currentAppointment?.paymentOption || '').toLowerCase();
    if (aptOption.includes('cash')) return 'cash';
    if (aptOption.includes('card')) return 'card';
    if (aptOption.includes('transfer') || aptOption.includes('bank')) return 'bank_transfer';

    if (storePaymentDetails?.method) return storePaymentDetails.method;
    const storeType = bookingStore.getPaymentType();
    if (storeType === 'cash' || storeType === 'card' || storeType === 'bank_transfer') {
      return storeType;
    }

    return 'bank_transfer';
  }, [params.paymentMethod, params.paymentOption, currentAppointment, storePaymentDetails]);

  const paymentOptionTitle = useMemo(() => {
    if (params.paymentOption) return params.paymentOption as string;
    if (currentAppointment?.paymentOption) return currentAppointment.paymentOption;
    if (currentAppointment?.paymentDetails?.methodTitle) return currentAppointment.paymentDetails.methodTitle;
    if (storePaymentDetails?.methodTitle) return storePaymentDetails.methodTitle;

    switch (resolvedMethod) {
      case 'cash':
        return 'Cash';
      case 'card':
        return 'Card Payment';
      case 'bank_transfer':
      default:
        return 'Inter-Bank Transfer';
    }
  }, [params.paymentOption, currentAppointment, storePaymentDetails, resolvedMethod]);

  const accountName = (params.accountName || appointmentPaymentDetails?.accountName || storePaymentDetails?.accountName || 'TREND SECURE') as string;
  const receiverAccountNumber = (params.receiverAccountNumber || appointmentPaymentDetails?.accountNumber || storePaymentDetails?.accountNumber || '123456789') as string;

  const cardBrand = (params.cardBrand || appointmentPaymentDetails?.cardBrand || storePaymentDetails?.cardBrand || 'Mastercard') as string;
  const cardLast4 = (params.cardLast4 || appointmentPaymentDetails?.cardLast4 || storePaymentDetails?.cardLast4 || '0938') as string;
  const cardDisplay = `${cardBrand} (•••• ${cardLast4})`;
  const cardTransactionRef = (params.transactionRef || appointmentPaymentDetails?.transactionRef || storePaymentDetails?.transactionRef || (currentAppointment?.ticketNumber ? `TRX-${currentAppointment.ticketNumber.replace('TR-', '')}` : 'TRX-10999')) as string;

  const cashStatus = (params.paymentStatus || appointmentPaymentDetails?.status || storePaymentDetails?.status || 'Pay at Salon') as string;
  const cashReceiver = (params.receiverName || appointmentPaymentDetails?.receiver || storePaymentDetails?.receiver || currentAppointment?.salonName || bookingStore.getSalonName() || 'Salon Front Desk') as string;

  const ticketNumber = (params.ticketNumber || currentAppointment?.ticketNumber || '#3456789') as string;

  const appointmentDate = (params.appointmentDate || params.date || currentAppointment?.date || bookingStore.getAppointmentDate() || 'Nov 19, 2026') as string;
  const appointmentTime = (params.appointmentTime || params.time || currentAppointment?.time || bookingStore.getAppointmentTime() || '9:30am') as string;
  const transactionDate = (params.transactionDate || (currentAppointment ? `${currentAppointment.date} - ${currentAppointment.time}` : 'Oct 26, 2026 - 3:11:07pm')) as string;
  const appointmentType = (params.appointmentType || bookingStore.getAppointmentType() || 'Home Service') as string;

  const userNote = (params.note as string) || currentAppointment?.note || bookingStore.getSpecialistNote() || '';

  const handleGoBack = () => {
    router.replace('/home/bookings' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Top Header (Figma: height 64px, padding 8px 16px, borderBottom 1px) ── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeftIcon size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{(params.title as string) || 'Booked Appointment'}</Text>

        <View style={styles.headerPlaceholder} />
      </View>

      {/* ── Scrollable Body ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 48 },
        ]}
      >
        {/* ── Top Receipt Card (Figma: paid information, height 412px, bg rgba(248, 249, 250, 0.98), borderRadius 24px) ── */}
        <View style={styles.receiptCard}>
          {/* Header Tag: Booking Successful */}
          <View style={styles.receiptTagRow}>
            <CheckmarkCircleIcon size={24} />
            <Text style={styles.receiptTagText}>Booking Successful</Text>
          </View>

          {/* Transaction Info Breakdown */}
          <View style={styles.receiptBreakdown}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Payment Option</Text>
              <Text style={styles.receiptValue}>{paymentOptionTitle}</Text>
            </View>

            {resolvedMethod === 'cash' ? (
              <>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Payment Status</Text>
                  <Text style={styles.receiptValue}>{cashStatus}</Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Appointment Ticket</Text>
                  <Text style={styles.receiptValue}>{ticketNumber}</Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Payment Receiver</Text>
                  <Text style={styles.receiptValue}>{cashReceiver}</Text>
                </View>
              </>
            ) : resolvedMethod === 'card' ? (
              <>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Card Details</Text>
                  <Text style={styles.receiptValue}>{cardDisplay}</Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Appointment Ticket</Text>
                  <Text style={styles.receiptValue}>{ticketNumber}</Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Transaction Ref</Text>
                  <Text style={styles.receiptValue}>{cardTransactionRef}</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Account Name</Text>
                  <Text style={styles.receiptValue}>{accountName}</Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Appointment Ticket</Text>
                  <Text style={styles.receiptValue}>{ticketNumber}</Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Receiver Account Number</Text>
                  <Text style={styles.receiptValue}>{receiverAccountNumber}</Text>
                </View>
              </>
            )}


            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Date</Text>
              <Text style={styles.receiptValue}>{transactionDate}</Text>
            </View>
          </View>

          {/* Total Row */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{totalAmount}</Text>
          </View>
        </View>

        {/* ── Section 1: Service (Standalone Primary Service + Specialist) ── */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>Service</Text>

          <View style={styles.sectionCard}>
            {/* Primary Service Item Card */}
            <View style={styles.serviceItemCard}>
              {/* White Framed Thumbnail (88x88 box, 80x80 image) */}
              <View style={styles.thumbFrame}>
                <SafeImage
                  source={primaryServiceImage}
                  style={styles.thumbImage}
                  resizeMode="cover"
                />
              </View>

              {/* Service Info */}
              <View style={styles.serviceInfoCol}>
                <Text style={styles.serviceNameText}>{primaryServiceName}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.servicePriceText}>{primaryServicePrice}</Text>
                </View>

                {/* Duration & Star Rating */}
                <View style={styles.metaRow}>
                  <View style={styles.metaGroup}>
                    <ClockTimeIcon size={18} />
                    <Text style={styles.metaText}>{primaryServiceDuration}</Text>
                  </View>
                  <View style={styles.metaGroup}>
                    <GoldStarIcon size={16} />
                    <Text style={styles.metaText}>{primaryServiceRating}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Specialist Sub-Section under Service */}
            <View style={styles.subSpecialistContainer}>
              <Text style={styles.subHeading}>
                {resolvedSpecialists.length > 1 ? 'Specialists' : 'Specialist'}
              </Text>
              {resolvedSpecialists.map((specItem: any, idx: number) => {
                const sAvatar =
                  specItem && 'avatarUri' in specItem && specItem.avatarUri
                    ? { uri: specItem.avatarUri }
                    : specItem && 'image' in specItem && specItem.image
                    ? (typeof specItem.image === 'string' ? { uri: specItem.image } : specItem.image)
                    : specialistAvatar;

                return (
                  <View
                    key={specItem.id || `receipt-spec-${idx}`}
                    style={[styles.specialistCard, idx > 0 && { marginTop: 12 }]}
                  >
                    <SafeImage
                      source={sAvatar}
                      style={styles.specialistAvatar}
                      resizeMode="cover"
                    />
                    <View style={styles.specialistInfoCol}>
                      <Text style={styles.specialistName}>{specItem.name || specialistName}</Text>
                      <Text style={styles.specialistRole}>{specItem.role || specialistRole}</Text>
                      <View style={styles.metaRow}>
                        <View style={styles.metaGroup}>
                          <ClockTimeIcon size={18} />
                          <Text style={styles.metaText}>{specItem.duration || specialistDuration}</Text>
                        </View>
                        <View style={styles.metaGroup}>
                          <GoldStarIcon size={16} />
                          <Text style={styles.metaText}>{specItem.rating || specialistRating}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Section 2: Appointment Information ── */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>Appointment Information</Text>

          <View style={styles.sectionCard}>
            {/* Appointment Date */}
            <View style={styles.appointmentInfoItem}>
              <Text style={styles.appointmentInfoLabel}>Appointment Date</Text>
              <View style={styles.appointmentInfoBox}>
                <View style={styles.appointmentInfoIconCircle}>
                  <CalendarIcon size={24} />
                </View>
                <Text style={styles.appointmentInfoValue}>{appointmentDate}</Text>
              </View>
            </View>

            {/* Appointment Time */}
            <View style={styles.appointmentInfoItem}>
              <Text style={styles.appointmentInfoLabel}>Appointment Time</Text>
              <View style={styles.appointmentInfoBox}>
                <View style={styles.appointmentInfoIconCircle}>
                  <ClockBigIcon size={24} />
                </View>
                <Text style={styles.appointmentInfoValue}>{appointmentTime}</Text>
              </View>
            </View>

            {/* Appointment Type */}
            <View style={styles.appointmentInfoItem}>
              <Text style={styles.appointmentInfoLabel}>Appointment Type</Text>
              <View style={styles.appointmentInfoBox}>
                <View style={styles.appointmentInfoIconCircle}>
                  <HomeServiceIcon size={24} />
                </View>
                <Text style={styles.appointmentInfoValue}>{appointmentType}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Section 3: Add-One (Rendered ONLY if Add-Ons exist, strictly separate!) ── */}
        {bookedAddOnsList.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>Add-One</Text>

            <View style={styles.sectionCard}>
              {/* Add-On Items List */}
              {bookedAddOnsList.map((addonItem, idx) => (
                <View
                  key={addonItem.id || `addon-${idx}`}
                  style={[styles.specialistCard, idx > 0 && { marginTop: 12 }]}
                >
                  <SafeImage
                    source={addonItem.image}
                    style={styles.specialistAvatar}
                    resizeMode="cover"
                  />
                  <View style={styles.specialistInfoCol}>
                    <Text style={styles.specialistName}>{addonItem.name}</Text>
                    <Text style={styles.servicePriceText}>{addonItem.price}</Text>
                    <View style={styles.metaRow}>
                      <View style={styles.metaGroup}>
                        <ClockTimeIcon size={18} />
                        <Text style={styles.metaText}>{addonItem.duration}</Text>
                      </View>
                      <View style={styles.metaGroup}>
                        <GoldStarIcon size={16} />
                        <Text style={styles.metaText}>{addonItem.rating}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}

              {/* Specialist Sub-Section under Add-One */}
              <View style={styles.subSpecialistContainer}>
                <Text style={styles.subHeading}>Specialist</Text>
                <View style={styles.specialistCard}>
                  <SafeImage
                    source={
                      resolvedAddOnSpecialist && 'avatarUri' in resolvedAddOnSpecialist && (resolvedAddOnSpecialist as any).avatarUri
                        ? { uri: (resolvedAddOnSpecialist as any).avatarUri }
                        : resolvedAddOnSpecialist && 'image' in resolvedAddOnSpecialist && resolvedAddOnSpecialist.image
                        ? (typeof resolvedAddOnSpecialist.image === 'string' ? { uri: resolvedAddOnSpecialist.image } : resolvedAddOnSpecialist.image)
                        : specialistAvatar
                    }
                    style={styles.specialistAvatar}
                    resizeMode="cover"
                  />
                  <View style={styles.specialistInfoCol}>
                    <Text style={styles.specialistName}>{resolvedAddOnSpecialist?.name || specialistName}</Text>
                    <Text style={styles.specialistRole}>{resolvedAddOnSpecialist?.role || specialistRole}</Text>
                    <View style={styles.metaRow}>
                      <View style={styles.metaGroup}>
                        <ClockTimeIcon size={18} />
                        <Text style={styles.metaText}>24min</Text>
                      </View>
                      <View style={styles.metaGroup}>
                        <GoldStarIcon size={16} />
                        <Text style={styles.metaText}>{resolvedAddOnSpecialist?.rating || '6.1'}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ── Section 4: Note (Rendered only if user note exists) ── */}
        {Boolean(userNote && userNote.trim().length > 0) && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>Note</Text>
            <View style={styles.noteCard}>
              <Text style={styles.noteText}>"{userNote}"</Text>
              <Text style={styles.noteCharCount}>{userNote.length}/120</Text>
            </View>
          </View>
        )}

        {/* ── Section 5: Package (Rendered only if a package was booked) ── */}
        {Boolean(bookedPackage) && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>Package</Text>
            <View style={styles.packageCard}>
              {/* Images Grid (Figma: 140x140px, rounded 16px) */}
              {packageImages.length > 0 && (
                <View style={styles.packageImagesGrid}>
                  {/* Row 1 */}
                  <View style={styles.packageImageRow}>
                    <View style={styles.packageImageCell}>
                      <SafeImage
                        source={packageImages[0]}
                        style={styles.packageGridImage}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={styles.packageImageCell}>
                      {packageImages[1] ? (
                        <SafeImage
                          source={packageImages[1]}
                          style={styles.packageGridImage}
                          resizeMode="cover"
                        />
                      ) : null}
                    </View>
                  </View>

                  {/* Row 2 */}
                  {packageImages[2] && (
                    <View style={styles.packageImageRow}>
                      <View style={styles.packageImageCell}>
                        <SafeImage
                          source={packageImages[2]}
                          style={styles.packageGridImage}
                          resizeMode="cover"
                        />
                      </View>
                      <View style={styles.packageImageCell}>
                        {packageImages[3] ? (
                          <SafeImage
                            source={packageImages[3]}
                            style={styles.packageGridImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={{ flex: 1 }} />
                        )}
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* Package Price (24px SF Pro 510, lineHeight 32px) */}
              <Text style={styles.packagePriceText}>{packagePriceFormatted}</Text>

              {/* Package Features / Checklist */}
              {packageFeatures.length > 0 && (
                <View style={styles.packageFeatureList}>
                  {packageFeatures.map((feature: string, idx: number) => (
                    <View key={idx} style={styles.packageFeatureItem}>
                      <PackageCheckCircleIcon size={20} />
                      <Text style={styles.packageFeatureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
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
  backButton: {
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
  headerPlaceholder: {
    width: 48,
    height: 48,
    opacity: 0,
  },

  // ── Scroll Content ──
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 40,
  },

  // ── Top Receipt Card ──
  receiptCard: {
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 24,
  },
  receiptTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  receiptTagText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(12, 121, 12, 0.96)',
  },
  receiptBreakdown: {
    gap: 24,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  receiptValue: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
  },
  totalLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  totalValue: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Sections Generic ──
  sectionContainer: {
    gap: 24,
  },
  sectionHeading: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
  },
  sectionCard: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 16,
  },

  // ── Service Item Card ──
  serviceItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  thumbFrame: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 3,
  },
  thumbImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  serviceInfoCol: {
    flex: 1,
    gap: 8,
  },
  serviceNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  servicePriceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: Platform.OS === 'ios' ? 0.6 : 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  metaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Specialist Sub-Section ──
  subSpecialistContainer: {
    gap: 8,
  },
  subHeading: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  specialistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  specialistAvatar: {
    width: 88,
    height: 88,
    borderRadius: 24,
  },
  specialistInfoCol: {
    flex: 1,
    gap: 8,
  },
  specialistName: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  specialistRole: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Appointment Information Items ──
  appointmentInfoItem: {
    gap: 16,
  },
  appointmentInfoLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  appointmentInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  appointmentInfoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentInfoValue: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Note Card ──
  noteCard: {
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    minHeight: 108,
    justifyContent: 'space-between',
  },
  noteText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  noteCharCount: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    alignSelf: 'flex-end',
  },

  // ── Package Card ──
  packageCard: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 24,
  },
  packageImagesGrid: {
    width: '100%',
    gap: 24,
  },
  packageImageRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 24,
    justifyContent: 'space-between',
  },
  packageImageCell: {
    flex: 1,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
  },
  packageGridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  packagePriceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.1,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  packageFeatureList: {
    gap: 8,
  },
  packageFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 24,
  },
  packageFeatureText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
});

export default BookedAppointmentReceiptScreen;
