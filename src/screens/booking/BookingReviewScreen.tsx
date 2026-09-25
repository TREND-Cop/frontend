import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Modal,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSafeBottomPadding } from '../../utils/safeArea';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Check,
  Star,
  Calendar,
  Home,
  Clock,
  Minus,
  Plus,
  Footprints,
  AlertCircle,
} from 'lucide-react-native';
import { bookingStore, SpecialistItem } from '../../utils/bookingStore';
import { AddOnCatalogItem } from '../../constants/addOneCatalog';
import { PACKAGE_CATALOG, PackageItem } from '../../constants/packageCatalog';
import { AppointmentTypeModal } from '../../components/AppointmentTypeModal';
import { BookingProgressStepper } from '../../components/BookingProgressStepper';
import { getServiceByIdOrName } from '../../constants/serviceCatalog';
import { PackagePhotosCarousel } from '../../components/ui/PackagePhotosCarousel';
import { theme } from '../../constants/theme';

const TIME_SLOT_ROWS = [
  ['8:00am', '9:00am', '10:00am'],
  ['11:00am', '8:00am', '12:00am'],
  ['1:00pm', '2:00pm'],
];

export const BookingReviewScreen = ({ navigation }: { navigation?: any }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  const [packageSectionY, setPackageSectionY] = useState<number>(0);

  // Dynamic Base service details from params, bookingStore, or service catalog
  const baseServiceName =
    (params.serviceName as string) ||
    (params.name as string) ||
    bookingStore.getServiceName() ||
    'Acrylic nails';

  const baseServicePrice =
    params.price
      ? parseInt(String(params.price).replace(/[^0-9]/g, ''), 10) || bookingStore.getBasePrice() || 12000
      : bookingStore.getBasePrice() || 12000;

  const baseServiceDuration =
    (params.duration as string) || bookingStore.getDuration() || '24min';

  const baseServiceRating =
    (params.rating as string) || bookingStore.getRating() || '5.0';

  const catalogService = getServiceByIdOrName(
    (params.serviceId as string) || bookingStore.getServiceId(),
    baseServiceName
  );

  const baseServiceImage =
    bookingStore.getServiceImage() ||
    catalogService?.image ||
    (baseServiceName.toLowerCase().includes('nail') || baseServiceName.toLowerCase().includes('acrylic')
      ? require('../../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg')
      : require('../../../assets/images/profile/men_braids.jpg'));

  // Sync state with bookingStore
  const [selectedAddOns, setSelectedAddOns] = useState<AddOnCatalogItem[]>(
    bookingStore.getSelectedItems()
  );

  const [hasSpecialist, setHasSpecialist] = useState<boolean>(true);
  const [selectedSpecialist, setSelectedSpecialist] = useState(bookingStore.getSelectedSpecialist());
  const [selectedSpecialists, setSelectedSpecialists] = useState<SpecialistItem[]>(
    bookingStore.getSelectedSpecialists()
  );
  const [addOnSpecialist, setAddOnSpecialist] = useState(bookingStore.getAddOnSpecialist());
  const [hasAddOnSpecialist, setHasAddOnSpecialist] = useState<boolean>(bookingStore.getAddOnSpecialist() !== null);
  const [hasPackage, setHasPackage] = useState<boolean>(bookingStore.getSelectedPackage() !== null);
  const [selectedPackage, setSelectedPackage] = useState(bookingStore.getSelectedPackage());
  const [appointmentDate, setAppointmentDate] = useState<string>(bookingStore.getAppointmentDate());
  const [appointmentTime, setAppointmentTime] = useState<string>(bookingStore.getAppointmentTime());
  const [appointmentType, setAppointmentType] = useState<string>(bookingStore.getAppointmentType());
  const [isTimeModalRendered, setIsTimeModalRendered] = useState<boolean>(false);
  const timeBackdropAnim = useRef(new Animated.Value(0)).current;
  const timeSheetTranslateY = useRef(new Animated.Value(500)).current;

  const openTimeModal = () => {
    setIsTimeModalRendered(true);
    timeBackdropAnim.setValue(0);
    timeSheetTranslateY.setValue(500);
    Animated.parallel([
      Animated.timing(timeBackdropAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(timeSheetTranslateY, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeTimeModal = (onDone?: () => void) => {
    Animated.parallel([
      Animated.timing(timeBackdropAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(timeSheetTranslateY, {
        toValue: 500,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsTimeModalRendered(false);
      if (onDone) onDone();
    });
  };
  const [isTypeModalVisible, setIsTypeModalVisible] = useState<boolean>(false);
  const [noteText, setNoteText] = useState(bookingStore.getSpecialistNote() || '');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
  const [noteSectionY, setNoteSectionY] = useState<number>(0);
  const [specialistError, setSpecialistError] = useState<boolean>(false);

  useEffect(() => {
    if (hasSpecialist && (selectedSpecialists.length > 0 || selectedSpecialist)) {
      setSpecialistError(false);
    }
  }, [hasSpecialist, selectedSpecialists, selectedSpecialist]);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
        setTimeout(() => {
          if (noteSectionY > 0) {
            scrollViewRef.current?.scrollTo({
              y: Math.max(0, noteSectionY - 40),
              animated: true,
            });
          } else {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }
        }, 120);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [noteSectionY]);

  // Subscribe to store updates & URL search params
  useEffect(() => {
    if (params.selectedIds) {
      try {
        const ids = (params.selectedIds as string).split(',').filter(Boolean);
        bookingStore.setSelectedIds(ids);
      } catch (e) {}
    }

    const unsubscribe = bookingStore.subscribe(() => {
      setSelectedAddOns(bookingStore.getSelectedItems());
      const pkg = bookingStore.getSelectedPackage();
      setSelectedPackage(pkg);
      setHasPackage(pkg !== null);
      setSelectedSpecialist(bookingStore.getSelectedSpecialist());
      setSelectedSpecialists(bookingStore.getSelectedSpecialists());
      const curAddOnSpecialist = bookingStore.getAddOnSpecialist();
      setAddOnSpecialist(curAddOnSpecialist);
      setHasAddOnSpecialist(curAddOnSpecialist !== null);
      if (bookingStore.getSpecialistNote()) setNoteText(bookingStore.getSpecialistNote());
      setAppointmentDate(bookingStore.getAppointmentDate());
      setAppointmentTime(bookingStore.getAppointmentTime());
      setAppointmentType(bookingStore.getAppointmentType());
    });
    setSelectedAddOns(bookingStore.getSelectedItems());
    const pkg = bookingStore.getSelectedPackage();
    setSelectedPackage(pkg);
    setHasPackage(pkg !== null);
    setSelectedSpecialist(bookingStore.getSelectedSpecialist());
    setSelectedSpecialists(bookingStore.getSelectedSpecialists());
    const initialAddOnSpecialist = bookingStore.getAddOnSpecialist();
    setAddOnSpecialist(initialAddOnSpecialist);
    setHasAddOnSpecialist(initialAddOnSpecialist !== null);
    if (bookingStore.getSpecialistNote()) setNoteText(bookingStore.getSpecialistNote());
    setAppointmentDate(bookingStore.getAppointmentDate());
    setAppointmentTime(bookingStore.getAppointmentTime());
    setAppointmentType(bookingStore.getAppointmentType());

    return unsubscribe;
  }, [params.selectedIds]);

  // Scroll to package section if navigated back from package screen
  useEffect(() => {
    if (params.scrollTo === 'package' && scrollViewRef.current) {
      const targetY = packageSectionY > 0 ? Math.max(0, packageSectionY - 16) : 750;
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [params.scrollTo, packageSectionY]);

  // Dynamic estimated total price calculation
  const addOnsTotal = selectedAddOns.reduce((sum, item) => sum + item.price, 0);
  const packageTotal = (hasPackage && selectedPackage) ? selectedPackage.price : 0;
  const specialistCount = hasSpecialist
    ? selectedSpecialists.length > 0
      ? selectedSpecialists.length
      : selectedSpecialist
      ? 1
      : 0
    : 0;
  const specialistTotal =
    Math.max(0, specialistCount - 1) * 4500 +
    (hasAddOnSpecialist && selectedAddOns.length > 0 && addOnSpecialist ? 4500 : 0);
  const totalPrice = baseServicePrice + addOnsTotal + packageTotal + specialistTotal;

  const handleRemoveSpecialist = (id: string) => {
    bookingStore.removeSpecialist(id);
    const updated = selectedSpecialists.filter((s) => s.id !== id);
    setSelectedSpecialists(updated);
    if (updated.length === 0) {
      setHasSpecialist(false);
      setSelectedSpecialist(null);
    } else {
      setSelectedSpecialist(updated[0]);
    }
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/appointment-specialist' as any);
    }
  };

  const handleRemoveAddOn = (id: string) => {
    bookingStore.removeAddOn(id);
  };

  const handleAddMoreAddOn = () => {
    const selectedIds = bookingStore.getSelectedIds().join(',');
    router.push({
      pathname: '/add-one',
      params: { selectedIds },
    });
  };

  const handlePay = () => {
    if (!hasSpecialist || (selectedSpecialists.length === 0 && !selectedSpecialist)) {
      setSpecialistError(true);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setSpecialistError(false);
    router.push('/payment');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ─── Top Header Bar (height: 52) ─────────────────────────── */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton} activeOpacity={0.7}>
          <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Review</Text>
        <View style={styles.headerRightSpace} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: (isKeyboardVisible ? 360 : 120) + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
        {/* ─── Stepper Progress Indicator (3 steps: Day / Time -> Specialist -> Review) ──── */}
        <BookingProgressStepper currentStep={3} />

        {/* ─── Section 1: Service ──────────────────────────────────── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Service</Text>
          <View style={styles.cardContainer}>

            {/* Service Main Item */}
            <View style={styles.serviceMainCard}>
              <View style={styles.serviceImageFrame}>
                <Image
                  source={baseServiceImage}
                  style={styles.serviceImage}
                  resizeMode="cover"
                />
              </View>

              <View style={styles.serviceInfoCol}>
                <Text style={styles.serviceCategoryLabel}>{baseServiceName}</Text>
                
                {/* Price Row */}
                <View style={styles.priceRow}>
                  <Text style={styles.serviceMainPrice}>₦{baseServicePrice.toLocaleString()}</Text>
                </View>

                {/* Duration & Rating */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Clock size={16} color="rgba(96, 96, 102, 0.96)" strokeWidth={1.5} />
                    <Text style={styles.metaText}>{baseServiceDuration}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Star size={16} color="rgba(245, 149, 15, 0.96)" fill="rgba(245, 149, 15, 0.96)" style={styles.starIcon} strokeWidth={1.5} />
                    <Text style={styles.metaText}>{baseServiceRating}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Specialist Sub-section */}
            <View style={styles.subHeaderRow}>
              <Text style={styles.subHeaderTitle}>Specialist</Text>
              {specialistCount < 2 && (
                <TouchableOpacity
                  style={styles.addInlineButton}
                  activeOpacity={0.7}
                  onPress={() => router.push({ pathname: '/change-specialist', params: { fromReview: 'true', mode: 'add' } } as any)}
                >
                  <Plus size={16} color="rgba(26, 130, 255, 0.9)" strokeWidth={2.2} />
                  <Text style={styles.addInlineText} numberOfLines={1}>Add Specialist</Text>
                </TouchableOpacity>
              )}
            </View>

            {specialistError && (!hasSpecialist || (selectedSpecialists.length === 0 && !selectedSpecialist)) && (
              <View style={styles.specialistErrorContainer}>
                <AlertCircle size={16} color="#CC2929" strokeWidth={2} />
                <Text style={styles.specialistErrorText}>Please select at least one specialist</Text>
              </View>
            )}

            {hasSpecialist && selectedSpecialists.length > 0 ? (
              selectedSpecialists.map((spec, index) => (
                <View
                  key={spec.id || `spec-${index}`}
                  style={[styles.specialistRow, index > 0 && { marginTop: 16 }]}
                >
                  <View style={styles.specialistLeftCol}>
                    <View style={styles.avatarWrapper}>
                      <Image
                        source={
                          typeof spec.image === 'string'
                            ? { uri: spec.image }
                            : spec.image || { uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80' }
                        }
                        style={styles.avatarImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.removeCircleBadge}
                        activeOpacity={0.8}
                        onPress={() => handleRemoveSpecialist(spec.id)}
                      >
                        <Minus size={12} color="#FFFFFF" strokeWidth={3} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.specialistInfo}>
                      <Text style={styles.specialistName}>{spec.name || 'Micheal Ureal'}</Text>
                      <Text style={styles.specialistRole}>{spec.role || 'Hair stylist'}</Text>
                      <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                          <Star size={16} color="rgba(245, 149, 15, 0.96)" fill="rgba(245, 149, 15, 0.96)" style={styles.starIcon} strokeWidth={1.5} />
                          <Text style={styles.metaText}>{spec.rating || '5.0'}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.changePillButton}
                    activeOpacity={0.7}
                    onPress={() => router.push({ pathname: '/change-specialist', params: { fromReview: 'true', mode: 'change', replacingId: spec.id } } as any)}
                  >
                    <Text style={styles.changePillText}>Change</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : hasSpecialist && selectedSpecialist ? (
              <View style={styles.specialistRow}>
                <View style={styles.specialistLeftCol}>
                  <View style={styles.avatarWrapper}>
                    <Image
                      source={
                        typeof selectedSpecialist?.image === 'string'
                          ? { uri: selectedSpecialist.image }
                          : selectedSpecialist?.image || { uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80' }
                      }
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.removeCircleBadge}
                      activeOpacity={0.8}
                      onPress={() => {
                        setHasSpecialist(false);
                        bookingStore.setSelectedSpecialist(null);
                        bookingStore.setSelectedSpecialists([]);
                      }}
                    >
                      <Minus size={12} color="#FFFFFF" strokeWidth={3} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.specialistInfo}>
                    <Text style={styles.specialistName}>{selectedSpecialist?.name || 'Micheal Ureal'}</Text>
                    <Text style={styles.specialistRole}>{selectedSpecialist?.role || 'Hair stylist'}</Text>
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Star size={16} color="rgba(245, 149, 15, 0.96)" fill="rgba(245, 149, 15, 0.96)" style={styles.starIcon} strokeWidth={1.5} />
                        <Text style={styles.metaText}>{selectedSpecialist?.rating || '5.0'}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.changePillButton}
                  activeOpacity={0.7}
                  onPress={() => router.push({ pathname: '/change-specialist', params: { fromReview: 'true', mode: 'change', replacingId: selectedSpecialist?.id } } as any)}
                >
                  <Text style={styles.changePillText}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>

        {/* ─── Section 2: Appointment Information ──────────────────── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Appointment Information</Text>
          <View style={styles.infoCardContainer}>
            {/* Appointment Date */}
            <View style={styles.infoRowItem}>
              <Text style={styles.infoLabel}>Appointment Date</Text>
              <View style={styles.infoRowContent}>
                <View style={styles.infoLeftGroup}>
                  <View style={styles.infoIconBox}>
                    <Calendar size={20} color="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} />
                  </View>
                  <Text style={styles.infoValueText}>{appointmentDate}</Text>
                </View>
                <TouchableOpacity
                  style={styles.changePillButton}
                  activeOpacity={0.7}
                  onPress={() => router.push({ pathname: '/appointment-day', params: { from: 'review' } } as any)}
                >
                  <Text style={styles.changePillText}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Appointment Time */}
            <View style={styles.infoRowItem}>
              <Text style={styles.infoLabel}>Appointment Time</Text>
              <View style={styles.infoRowContent}>
                <View style={styles.infoLeftGroup}>
                  <View style={styles.infoIconBox}>
                    <Clock size={20} color="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} />
                  </View>
                  <Text style={styles.infoValueText}>{appointmentTime}</Text>
                </View>
                <TouchableOpacity
                  style={styles.changePillButton}
                  activeOpacity={0.7}
                  onPress={openTimeModal}
                >
                  <Text style={styles.changePillText}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Appointment Type */}
            <View style={styles.infoRowItem}>
              <Text style={styles.infoLabel}>Appointment Type</Text>
              <View style={styles.infoRowContent}>
                <View style={styles.infoLeftGroup}>
                  <View style={styles.infoIconBox}>
                    {appointmentType === 'Home Service' ? (
                      <Home size={20} color="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} />
                    ) : (
                      <Footprints size={20} color="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} />
                    )}
                  </View>
                  <Text style={styles.infoValueText}>{appointmentType}</Text>
                </View>
                <TouchableOpacity
                  style={styles.changePillButton}
                  activeOpacity={0.7}
                  onPress={() => setIsTypeModalVisible(true)}
                >
                  <Text style={styles.changePillText}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* ─── Section 3: Add-One ───────────────────────────────────── */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderBetween}>
            <Text style={styles.sectionTitle}>Add-One</Text>
            <TouchableOpacity
              style={styles.addInlineButton}
              activeOpacity={0.7}
              onPress={handleAddMoreAddOn}
            >
              <Plus size={16} color="rgba(26, 130, 255, 0.9)" strokeWidth={2.2} />
              <Text style={styles.addInlineText} numberOfLines={1}>Add Ones</Text>
            </TouchableOpacity>
          </View>

          {selectedAddOns.length > 0 && (
            <View style={styles.cardContainer}>
              {selectedAddOns.map((item) => (
                <View key={item.id} style={styles.specialistRow}>
                  <View style={styles.specialistLeftCol}>
                    <View style={styles.avatarWrapper}>
                      <Image source={item.image} style={styles.avatarImage} resizeMode="cover" />
                      <TouchableOpacity
                        style={styles.removeCircleBadge}
                        activeOpacity={0.8}
                        onPress={() => handleRemoveAddOn(item.id)}
                      >
                        <Minus size={12} color="#FFFFFF" strokeWidth={3} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.specialistInfo}>
                      <Text style={styles.serviceCategoryLabel}>{item.name}</Text>
                      <Text style={styles.serviceMainPrice}>₦{item.price.toLocaleString()}</Text>
                      <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                          <Clock size={16} color="rgba(96, 96, 102, 0.96)" strokeWidth={1.5} />
                          <Text style={styles.metaText}>{item.duration || '24min'}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Star size={16} color="rgba(245, 149, 15, 0.96)" fill="rgba(245, 149, 15, 0.96)" style={styles.starIcon} strokeWidth={1.5} />
                          <Text style={styles.metaText}>{item.rating || '5.1'}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.changePillButton}
                    activeOpacity={0.7}
                    onPress={handleAddMoreAddOn}
                  >
                    <Text style={styles.changePillText}>Change</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* Specialist Sub-section under Add-One (Yellow - ONLY shows up when client adds an add-on) */}
              <View style={styles.subHeaderRow}>
                <Text style={styles.subHeaderTitle}>Specialist</Text>
                {!hasAddOnSpecialist && (
                  <TouchableOpacity
                    style={styles.addInlineButton}
                    activeOpacity={0.7}
                    onPress={() => router.push({ pathname: '/change-specialist', params: { isAddOn: 'true', fromReview: 'true', mode: 'add' } } as any)}
                  >
                    <Plus size={16} color="rgba(26, 130, 255, 0.9)" strokeWidth={2.2} />
                    <Text style={styles.addInlineText} numberOfLines={1}>Add Specialist</Text>
                  </TouchableOpacity>
                )}
              </View>

              {hasAddOnSpecialist && (
                <View style={styles.specialistRow}>
                  <View style={styles.specialistLeftCol}>
                    <View style={styles.avatarWrapper}>
                      <Image
                        source={
                          typeof addOnSpecialist?.image === 'string'
                            ? { uri: addOnSpecialist.image }
                            : addOnSpecialist?.image || { uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80' }
                        }
                        style={styles.avatarImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.removeCircleBadge}
                        activeOpacity={0.8}
                        onPress={() => setHasAddOnSpecialist(false)}
                      >
                        <Minus size={12} color="#FFFFFF" strokeWidth={3} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.specialistInfo}>
                      <Text style={styles.specialistName}>{addOnSpecialist?.name || 'Micheal Ureal'}</Text>
                      <Text style={styles.specialistRole}>{addOnSpecialist?.role || 'Nail Art Specialist'}</Text>
                      <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                          <Star size={16} color="rgba(245, 149, 15, 0.96)" fill="rgba(245, 149, 15, 0.96)" style={styles.starIcon} strokeWidth={1.5} />
                          <Text style={styles.metaText}>{addOnSpecialist?.rating || '5.0'}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.changePillButton}
                    activeOpacity={0.7}
                    onPress={() => router.push({ pathname: '/change-specialist', params: { isAddOn: 'true', fromReview: 'true', mode: 'change', replacingId: addOnSpecialist?.id } } as any)}
                  >
                    <Text style={styles.changePillText}>Change</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        {/* ─── Section 4: Note ─────────────────────────────────────── */}
        <View
          style={styles.sectionBlock}
          onLayout={(e) => setNoteSectionY(e.nativeEvent.layout.y)}
        >
          <Text style={styles.sectionTitle}>Note</Text>
          <View style={styles.noteBox}>
            <TextInput
              style={[styles.noteInput, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
              placeholder="Leave a note for the Specialist"
              placeholderTextColor="rgba(96, 96, 102, 0.96)"
              value={noteText}
              onChangeText={(text) => {
                setNoteText(text);
                bookingStore.setSpecialistNote(text);
              }}
              onFocus={() => {
                setTimeout(() => {
                  if (noteSectionY > 0) {
                    scrollViewRef.current?.scrollTo({
                      y: Math.max(0, noteSectionY - 40),
                      animated: true,
                    });
                  } else {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }
                }, 200);
              }}
              maxLength={120}
              multiline
            />
            <View style={styles.noteCounterRow}>
              <Text style={styles.noteCounter}>{noteText.length}/120</Text>
            </View>
          </View>
        </View>

        {/* ─── Section 5: Package ──────────────────────────────────── */}
        <View
          style={styles.sectionBlock}
          onLayout={(event) => {
            setPackageSectionY(event.nativeEvent.layout.y);
          }}
        >
          <View style={styles.sectionHeaderBetween}>
            <Text style={styles.sectionTitle}>Package</Text>
            {hasPackage && selectedPackage ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setHasPackage(false);
                  setSelectedPackage(null);
                  bookingStore.setSelectedPackage(null);
                }}
              >
                <Text style={styles.removeTextButton}>Remove</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.addInlineButton}
                activeOpacity={0.7}
                onPress={() => router.push('/service-package')}
              >
                <Plus size={16} color="rgba(26, 130, 255, 0.9)" strokeWidth={2.2} />
                <Text style={styles.addInlineText} numberOfLines={1}>Add Package</Text>
              </TouchableOpacity>
            )}
          </View>

          {hasPackage && selectedPackage && (
            (() => {
              const pkg = selectedPackage;
              const has4Images = pkg.images && pkg.images.length >= 4;

              return (
                <View style={styles.packageCard}>
                  {/* Images Grid with Swipe & Moving Indicators */}
                  <PackagePhotosCarousel images={pkg.images} />

                  {/* Price */}
                  <Text style={styles.packagePriceText}>₦{pkg.price.toLocaleString()}</Text>

                  {/* Checklist */}
                  <View style={styles.packageFeatureList}>
                    {pkg.features.map((feature: string, idx: number) => (
                      <View key={idx} style={styles.packageFeatureItem}>
                        <View style={styles.packageCheckCircle}>
                          <Check size={12} color="#FFFFFF" strokeWidth={2.5} />
                        </View>
                        <Text style={styles.packageFeatureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })()
          )}
        </View>
      </ScrollView>

      {/* ─── Bottom Fixed Action Bar ──────────────────────────────── */}
      {!isKeyboardVisible && (
        <View style={[styles.bottomBar, { paddingBottom: getSafeBottomPadding(insets, 16, 8) }]}>
          <View style={styles.totalPriceCol}>
            <Text style={styles.estimatedLabel}>Estimated</Text>
            <Text style={styles.totalPriceText}>₦{totalPrice.toLocaleString()}</Text>
          </View>

          <TouchableOpacity
            style={styles.payButton}
            activeOpacity={0.8}
            onPress={handlePay}
          >
            <Text style={styles.payButtonText}>Pay</Text>
          </TouchableOpacity>
        </View>
      )}
      </KeyboardAvoidingView>

      {/* ─── Bottom Sheet Modal: Appointment Time ─────────────────── */}
      <Modal
        visible={isTimeModalRendered}
        transparent
        animationType="none"
        onRequestClose={() => closeTimeModal()}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalBackdrop, { opacity: timeBackdropAnim }]}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => closeTimeModal()}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.bottomSheetContainer,
              {
                paddingBottom: Math.max(insets.bottom, 24),
                transform: [{ translateY: timeSheetTranslateY }],
              },
            ]}
          >
            {/* Top Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Illustration Header */}
            <View style={styles.sheetHeaderRow}>
              <Image
                source={require('../../../assets/images/custom/alarm_clock.jpg')}
                style={styles.clockIconImage}
                resizeMode="cover"
              />
              <View style={styles.sheetHeaderTextCol}>
                <Text style={styles.sheetTitle}>Appointment Time</Text>
                <Text style={styles.sheetSubtitle}>
                  Choose your selected appointment time.
                </Text>
              </View>
            </View>

            {/* Divider Line */}
            <View style={styles.sheetDivider} />

            {/* Time Grid */}
            <View style={styles.timeGridContainer}>
              {TIME_SLOT_ROWS.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.timeSlotRow}>
                  {row.map((slot, colIndex) => {
                    const isSelected = appointmentTime === slot;
                    return (
                      <TouchableOpacity
                        key={`${rowIndex}-${colIndex}`}
                        style={[
                          styles.timeSlotPill,
                          isSelected && styles.timeSlotPillSelected,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => {
                          setAppointmentTime(slot);
                          bookingStore.setAppointmentTime(slot);
                          closeTimeModal();
                        }}
                      >
                        <Text
                          style={[
                            styles.timeSlotText,
                            isSelected && styles.timeSlotTextSelected,
                          ]}
                        >
                          {slot}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  {row.length < 3 && <View style={styles.timeSlotSpacer} />}
                </View>
              ))}
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* ─── Appointment Type Bottom Sheet Modal (Figma: 390x448, In-Person / Home Service) ─── */}
      <AppointmentTypeModal
        visible={isTypeModalVisible}
        selectedType={appointmentType as any}
        inPersonPrice={1500}
        homeServicePrice={2200}
        homeServiceDiscountPercent={10}
        homeServiceDiscountedPrice={2100}
        distanceText="5 km"
        onSelectType={(type) => {
          setAppointmentType(type);
          bookingStore.setAppointmentType(type);
        }}
        onClose={() => setIsTypeModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    height: 52,
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
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    ...theme.typography.pageHeader,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  headerRightSpace: {
    width: 40,
    height: 40,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 130,
    gap: 40,
  },

  // Stepper
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 8,
  },
  stepItem: {
    flex: 1,
    gap: 8,
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircleActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepLine: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 4,
    marginLeft: 6,
  },
  stepLineActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  stepLabel: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.14,
    color: 'rgba(160, 160, 176, 0.9)',
    textAlign: 'left',
  },
  stepLabelActive: {
    color: 'rgba(0, 8, 20, 0.96)',
    fontWeight: '400',
  },

  // Sections
  sectionBlock: {
    gap: 24,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: '#000000',
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardContainer: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 0,
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  infoCardContainer: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 24,
  },

  // Corner Ribbon
  cornerRibbonContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 80,
    height: 80,
    overflow: 'hidden',
    zIndex: 10,
  },
  cornerRibbon: {
    position: 'absolute',
    top: 14,
    right: -24,
    width: 90,
    height: 20,
    backgroundColor: 'rgba(242, 233, 218, 0.96)',
    transform: [{ rotate: '45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerRibbonText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
    color: 'rgba(245, 149, 15, 0.96)',
  },

  // Service Main Card
  serviceMainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  serviceImageFrame: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: 24,
  },
  serviceInfoCol: {
    flex: 1,
    gap: 8,
  },
  serviceCategoryLabel: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  serviceMainPrice: {
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.6,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  discountPriceText: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starIcon: {
    marginTop: -2,
  },
  metaText: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  // Sub Headers & Specialist
  subHeaderRow: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  subHeaderTitle: {
    ...theme.typography.bodyMed,
    color: 'rgba(0, 8, 20, 0.96)',
    flexShrink: 0,
  },
  addInlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  addInlineText: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(26, 130, 255, 0.9)',
    flexShrink: 0,
  },
  specialistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderRadius: 24,
    padding: 16,
  },
  specialistLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    position: 'relative',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 24,
  },
  removeCircleBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(204, 41, 41, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  specialistInfo: {
    flex: 1,
    gap: 8,
  },
  specialistName: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  specialistRole: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  changePillButton: {
    width: 88,
    height: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePillText: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  // Appointment Info Items
  infoRowItem: {
    gap: 16,
  },
  infoLabel: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  infoRowContent: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  infoValueText: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // Note Box
  noteBox: {
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    minHeight: 108,
    gap: 12,
  },
  noteInput: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
    minHeight: 56,
    textAlignVertical: 'top',
  },
  noteCounterRow: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  noteCounter: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // Package Card
  packageCard: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 24,
  },
  packagePhotosWrapper: {
    width: '100%',
    gap: 16,
  },
  packageImagesGrid: {
    width: '100%',
    gap: 24,
  },
  packageImageRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 24,
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
  packageIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  packageIndicatorDotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  packageIndicatorDotInactive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },
  packagePriceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
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
  packageCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  packageFeatureText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  removeTextButton: {
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(204, 41, 41, 0.9)',
    textTransform: 'capitalize',
  },

  // Bottom Fixed Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(133, 139, 148, 1)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  totalPriceCol: {
    gap: 4,
  },
  estimatedLabel: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  totalPriceText: {
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.3,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  payButton: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    height: 48,
    minWidth: 225,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payButtonText: {
    ...theme.typography.button,
    color: '#FFFFFF',
  },

  // Appointment Time Bottom Sheet Modal
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
    backgroundColor: 'rgba(0, 8, 20, 0.45)',
  },
  bottomSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 8,
    shadowColor: 'rgba(0, 8, 20, 0.2)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 24,
  },
  dragHandle: {
    width: 56,
    height: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
    alignSelf: 'center',
    marginTop: 8,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
  },
  clockIconImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  sheetHeaderTextCol: {
    flex: 1,
    gap: 4,
  },
  sheetTitle: {
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  sheetSubtitle: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  sheetDivider: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginTop: 16,
    marginBottom: 20,
  },
  timeGridContainer: {
    gap: 16,
    marginBottom: 8,
  },
  timeSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  timeSlotPill: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  timeSlotPillSelected: {
    borderColor: 'rgba(0, 8, 20, 0.96)',
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
  },
  timeSlotText: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    textAlign: 'center',
    color: 'rgba(0, 8, 20, 0.96)',
  },
  timeSlotTextSelected: {
    fontWeight: '500',
    color: 'rgba(0, 8, 20, 0.96)',
  },
  timeSlotSpacer: {
    flex: 1,
  },

  // Appointment Type Bottom Sheet Modal
  typeIllustrationImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  typeOptionsContainer: {
    gap: 40,
    marginBottom: 8,
  },
  typeOptionCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FFFFFF',
  },
  typeOptionCardSelected: {
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  typeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeInfoCol: {
    flex: 1,
    gap: 6,
  },
  typeRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeNameText: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  typePriceText: {
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  typeDistanceText: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(242, 233, 218, 0.96)',
    borderRadius: 24,
  },
  discountBadgeText: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(245, 149, 15, 0.96)',
  },
  priceSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },
  payDiscountText: {
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(245, 149, 15, 0.96)',
  },
  specialistErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 235, 235, 0.95)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(204, 41, 41, 0.3)',
    marginTop: 12,
  },
  specialistErrorText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
    color: '#CC2929',
    flex: 1,
  },
});
