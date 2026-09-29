import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Check } from 'lucide-react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';
import { bookingStore } from '../../utils/bookingStore';

export type AppointmentBookingType = 'In-Person' | 'Home Service';

// 1:1 Figma In-Person Walking Icon (viewBox="32 225 40 40")
const InPersonIcon = () => (
  <Svg width={40} height={40} viewBox="32 225 40 40" fill="none">
    <Circle cx="52" cy="245" r="20" fill="#000814" fillOpacity={0.96} />
    <Path
      d="M46 245.5L47.7381 242.893C47.9103 242.634 48.1404 242.42 48.4099 242.266L50.599 241.015C51.1619 240.693 51.8483 240.674 52.4282 240.964C53.0851 241.292 53.4658 241.986 53.7461 242.665C54.2069 243.781 55.3984 245 58 245"
      stroke="white"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M53.0002 242L51.7774 247.595M50.5002 241.5L49.7748 244.764C49.6071 245.519 49.8892 246.303 50.4993 246.777L54.0002 249.5L55.5002 254"
      stroke="white"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M49.5 249L49 250.5L46.5 253.5"
      stroke="white"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M55 237.5C55 238.328 54.3284 239 53.5 239C52.6716 239 52 238.328 52 237.5C52 236.672 52.6716 236 53.5 236C54.3284 236 55 236.672 55 237.5Z"
      stroke="white"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 1:1 Figma Home Service Icon (viewBox="32 339 40 40")
const HomeServiceIcon = () => (
  <Svg width={40} height={40} viewBox="32 339 40 40" fill="none">
    <Circle cx="52" cy="359" r="20" fill="#000814" fillOpacity={0.96} />
    <Path
      d="M62 357.5L52.8825 349.822C52.6355 349.614 52.3229 349.5 52 349.5C51.6771 349.5 51.3645 349.614 51.1175 349.822L42 357.5"
      stroke="white"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M60.5 352V362.5C60.5 365.328 60.5 366.743 59.6213 367.621C58.7426 368.5 57.3284 368.5 54.5 368.5H49.5C46.6716 368.5 45.2574 368.5 44.3787 367.621C43.5 366.743 43.5 365.328 43.5 362.5V356.5"
      stroke="white"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M55 368.5V363.5C55 362.086 55 361.379 54.5607 360.939C54.1213 360.5 53.4142 360.5 52 360.5C50.5858 360.5 49.8787 360.5 49.4393 360.939C49 361.379 49 362.086 49 363.5V368.5"
      stroke="white"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 1:1 Figma Back Arrow Icon (24x24)
const ArrowLeftIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5"
      stroke="#000814"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 19L5 12L12 5"
      stroke="#000814"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export function AppointmentTypeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [selectedType, setSelectedType] = useState<AppointmentBookingType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1:1 Figma dommy loader: 4 Dots (Ellipse 223, 224, 225, 226)
  // width: 16px, height: 16px, gap: 20px, total width: 124px
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const dot4 = useRef(new Animated.Value(0)).current;

  // Reset loading and restore selection when returning/navigating to screen
  useFocusEffect(
    React.useCallback(() => {
      setIsLoading(false);
      dot1.setValue(0);
      dot2.setValue(0);
      dot3.setValue(0);
      dot4.setValue(0);

      const savedType = bookingStore.getAppointmentType() as AppointmentBookingType;
      if (savedType) {
        setSelectedType(savedType);
      }
    }, [dot1, dot2, dot3, dot4])
  );

  useEffect(() => {
    if (!isLoading) return;

    const createPulseAnim = (val: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(val, {
              toValue: 1,
              duration: 320,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(val, {
              toValue: 0,
              duration: 320,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ),
      ]);
    };

    const anim1 = createPulseAnim(dot1, 0);
    const anim2 = createPulseAnim(dot2, 140);
    const anim3 = createPulseAnim(dot3, 280);
    const anim4 = createPulseAnim(dot4, 420);

    anim1.start();
    anim2.start();
    anim3.start();
    anim4.start();

    // Auto-advance to Appointment Time after ~1100ms
    const timer = setTimeout(() => {
      const type = selectedType || 'In-Person';
      bookingStore.setAppointmentType(type);
      setIsLoading(false);

      router.push({
        pathname: '/appointment-time',
        params: {
          serviceId: params.serviceId || bookingStore.getServiceId() || '',
          serviceName: params.serviceName || bookingStore.getServiceName() || '',
          servicePrice: params.servicePrice || '',
          duration: params.duration || bookingStore.getDuration() || '',
          salonName: params.salonName || bookingStore.getSalonName() || '',
          salonId: params.salonId || bookingStore.getSalonId() || '',
          appointmentType: type,
        },
      } as any);
    }, 1100);

    return () => {
      clearTimeout(timer);
      anim1.stop();
      anim2.stop();
      anim3.stop();
      anim4.stop();
      dot1.setValue(0);
      dot2.setValue(0);
      dot3.setValue(0);
      dot4.setValue(0);
    };
  }, [isLoading, selectedType, params, router]);

  const handleSelectType = (type: AppointmentBookingType) => {
    if (isLoading) return;
    setSelectedType(type);
    setIsLoading(true);
  };

  const getDotStyle = (anim: Animated.Value) => {
    const opacity = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.35, 1],
    });
    const scale = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.85, 1.08],
    });
    return {
      opacity,
      transform: [{ scale }],
    };
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* ─── Top Navigation Bar (Figma: page header: 64px, padding: 8px 16px, border-bottom 1px solid rgba(235, 235, 245, 0.96)) ─── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeftIcon />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Appointment Type</Text>

        {/* Balance placeholder for symmetrical centering (Figma: header share button: 48x48, opacity: 0) */}
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* ─── Main Scrollable Area ─── */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Frame 1000006524: width: 358px, gap: 40px */}
        <View style={styles.contentFrame}>
          {/* appoint illustration header (Figma: height 56px, gap 16px) */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Appointment type</Text>
            <Text style={styles.sectionSubtitle}>How you would like your Appointment?</Text>
          </View>

          {/* Options Container (Figma: Frame 1000006523: width 358px, height 288px, gap 40px) */}
          <View style={styles.optionsContainer}>
            {/* Option 1: In-Person (Figma: Frame 1000006522: width 358px, height 124px, gap 16px) */}
            <View style={styles.optionWrapper}>
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  selectedType === 'In-Person' && styles.optionCardSelected,
                ]}
                activeOpacity={0.88}
                onPress={() => handleSelectType('In-Person')}
              >
                {/* in person icon: 40x40, padding 8px, background rgba(0, 8, 20, 0.96), radius 24 */}
                <View style={styles.iconContainer}>
                  <InPersonIcon />
                </View>

                {/* Frame 1000006207: width 230px, height 56px, gap 8px */}
                <View style={styles.cardDetails}>
                  <Text style={styles.optionLabel}>In-Person</Text>
                  <Text style={styles.optionPrice}>₦2,200</Text>
                </View>

                {/* checkmark-circle-02: 24x24, radius 12 */}
                <View
                  style={[
                    styles.radioCircle,
                    selectedType === 'In-Person' && styles.radioCircleSelected,
                  ]}
                >
                  {selectedType === 'In-Person' && (
                    <Check size={14} color="#FFFFFF" strokeWidth={2.8} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Distance of 5km: 14px 400, line-height 20px, letter-spacing 0.4px */}
              <Text style={styles.subtext}>Distance of 5km</Text>
            </View>

            {/* Option 2: Home Service (Figma: Frame 1000006521: width 358px, height 124px, gap 16px) */}
            <View style={styles.optionWrapper}>
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  selectedType === 'Home Service' && styles.optionCardSelected,
                ]}
                activeOpacity={0.88}
                onPress={() => handleSelectType('Home Service')}
              >
                {/* home service icon: 40x40, padding 8px, background rgba(0, 8, 20, 0.96), radius 24 */}
                <View style={styles.iconContainer}>
                  <HomeServiceIcon />
                </View>

                {/* Frame 1000006207: width 230px, height 56px, gap 8px */}
                <View style={styles.cardDetails}>
                  <Text style={styles.optionLabel}>Home Service</Text>
                  <Text style={styles.optionPrice}>₦3,200</Text>
                </View>

                {/* checkmark-circle-02: 24x24, radius 12 */}
                <View
                  style={[
                    styles.radioCircle,
                    selectedType === 'Home Service' && styles.radioCircleSelected,
                  ]}
                >
                  {selectedType === 'Home Service' && (
                    <Check size={14} color="#FFFFFF" strokeWidth={2.8} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Service provider arrives in 30 minute: 14px 400, line-height 20px, letter-spacing 0.4px */}
              <Text style={styles.subtext}>Service provider arrives in 30 minute</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ─── Screen 2 1:1 Figma Dommy Loader (width: 124px, height: 16px, gap: 20px, 4x 16px dots) ─── */}
      {isLoading && (
        <View style={styles.loaderOverlay} pointerEvents="none">
          <View style={styles.dommyLoader}>
            {/* Ellipse 223: 16x16 */}
            <Animated.View style={[styles.ellipseDot, getDotStyle(dot1)]} />
            {/* Ellipse 224: 16x16 */}
            <Animated.View style={[styles.ellipseDot, getDotStyle(dot2)]} />
            {/* Ellipse 225: 16x16 */}
            <Animated.View style={[styles.ellipseDot, getDotStyle(dot3)]} />
            {/* Ellipse 226: 16x16 */}
            <Animated.View style={[styles.ellipseDot, getDotStyle(dot4)]} />
          </View>
        </View>
      )}

      {/* ─── Android System Navigation Bar & Native Dock Protection ─── */}
      <NativeDockSpacer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // /* page header */
  // height: 64px; border-bottom: 1px solid rgba(235, 235, 245, 0.96); padding: 8px 16px;
  header: {
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  // /* back or forward button icon */
  // width: 48px; height: 48px; border-radius: 24px; padding: 12px;
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // /* Top Header (Appointment Type) */
  // font-family: 'DM Sans'; font-weight: 500; font-size: 17px; line-height: 24px; letter-spacing: 0.2px; color: rgba(0, 8, 20, 0.96);
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  headerRightPlaceholder: {
    width: 48,
    height: 48,
  },
  scrollArea: {
    flex: 1,
  },
  // /* Frame 1000006524 */
  // top: 132px (header 108px + 24px), width: 358px, gap: 40px;
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  contentFrame: {
    gap: 40,
  },
  // /* appoint illustration header */
  // width: 358px; height: 56px; gap: 16px;
  sectionHeader: {
    gap: 8,
  },
  // /* Appointment type */
  // font-family: 'SF Pro'; font-weight: 510; font-size: 20px; line-height: 28px; letter-spacing: 0.2px; color: rgba(0, 8, 20, 0.96);
  sectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  // /* How you would like your Appointment? */
  // font-family: 'SF Pro'; font-weight: 400; font-size: 14px; line-height: 20px; letter-spacing: 0.4px; color: rgba(96, 96, 102, 0.96);
  sectionSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  // /* Frame 1000006523 */
  // width: 358px; height: 288px; gap: 40px;
  optionsContainer: {
    gap: 40,
  },
  // /* Frame 1000006522 / Frame 1000006521 */
  // width: 358px; height: 124px; gap: 16px;
  optionWrapper: {
    gap: 16,
  },
  // /* in person / home service */
  // width: 358px; height: 88px; background: rgba(247, 247, 247, 0.96); border: 1px solid rgba(235, 235, 245, 0.96); border-radius: 24px; padding: 16px; gap: 16px;
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    height: 88,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
  },
  optionCardSelected: {
    borderColor: 'rgba(0, 8, 20, 0.25)',
  },
  // /* in person icon / home service icon */
  // width: 40px; height: 40px; background: rgba(0, 8, 20, 0.96); border-radius: 24px; padding: 8px;
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // /* Frame 1000006207 */
  // width: 230px; height: 56px; gap: 8px;
  cardDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 8,
  },
  // /* In-Person / Home Service */
  // font-family: 'SF Pro'; font-weight: 400; font-size: 16px; line-height: 24px; letter-spacing: 0.4px; color: rgba(0, 8, 20, 0.96);
  optionLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  // /* ₦2,200 / ₦3,200 */
  // font-family: 'SF Pro'; font-weight: 510; font-size: 16px; line-height: 24px; letter-spacing: 0.5px;
  optionPrice: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  // /* checkmark-circle-02 */
  // width: 24px; height: 24px; border: 1.5px solid rgba(192, 192, 204, 0.96);
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  radioCircleSelected: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  // /* Distance of 5km / Service provider arrives in 30 minute */
  // font-family: 'SF Pro'; font-weight: 400; font-size: 14px; line-height: 20px; letter-spacing: 0.4px; color: rgba(96, 96, 102, 0.96);
  subtext: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    paddingLeft: 4,
  },
  // Screen 2 Loader Overlay: pure dimmed backdrop
  loaderOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  // /* dommy loader */
  // display: flex; flex-direction: row; align-items: center; padding: 0px; gap: 20px; width: 124px; height: 16px;
  dommyLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    gap: 20,
    width: 124,
    height: 16,
  },
  // /* Ellipse 223, 224, 225, 226 */
  // width: 16px; height: 16px; background: rgba(0, 8, 20, 0.96);
  ellipseDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
});
