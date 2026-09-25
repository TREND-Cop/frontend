import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { SafeImage } from '../../components/ui/SafeImage';
import { EmptyCompletedAppointmentScreen } from './EmptyCompletedAppointmentScreen';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';
import { useBookingContext } from '../../store/BookingContext';
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

const CheckmarkCircleIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Circle cx="10" cy="10" r="8.5" fill="rgba(12, 121, 12, 0.96)" />
    <Path
      d="M6.5 10L9 12.5L13.5 7.5"
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

// ── Mock Data matching Figma Specifications ──
export interface BookedAppointmentItem {
  id: string;
  category: string;
  name: string;
  price: string;
  duration: string;
  rating: string;
  status: 'Completed' | 'Upcoming' | 'In Progress';
  image: any;
}

const SUCCESSFUL_APPOINTMENTS: BookedAppointmentItem[] = [
  {
    id: 'b1',
    category: 'Dread Locks',
    name: 'Barrel Twist Dreadlocks',
    price: '₦22,700',
    duration: '24min',
    rating: '5.1',
    status: 'Completed',
    image: require('../../../assets/images/profile/men_braids.jpg'),
  },
  {
    id: 'b2',
    category: 'Dread Locks',
    name: 'Herbal Sheet Facial Treatment',
    price: '₦22,700',
    duration: '24min',
    rating: '5.1',
    status: 'Completed',
    image: require('../../../assets/images/profile/14dcc3440340f9f140251ac160473457c89b198c.jpg'),
  },
  {
    id: 'b3',
    category: 'Hair Styling',
    name: 'Executive Fade Haircut & Beard',
    price: '₦18,500',
    duration: '35min',
    rating: '4.9',
    status: 'Completed',
    image: require('../../../assets/images/services/men_haircut.png'),
  },
  {
    id: 'b4',
    category: 'Nail Care',
    name: 'Deluxe Pedicure & Feet Spa',
    price: '₦15,000',
    duration: '40min',
    rating: '5.0',
    status: 'Completed',
    image: require('../../../assets/images/profile/dry_wow_pedicure.jpg'),
  },
];

export const BookingsListScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleGoBack = () => {
    router.replace('/home/bookings' as any);
  };

  const handleCardPress = (item: BookedAppointmentItem) => {
    router.push({
      pathname: '/successful-booking',
      params: {
        id: item.id,
        name: item.name,
        serviceName: item.name,
        category: item.category,
        price: item.price,
        duration: item.duration,
        rating: item.rating,
        image: item.image,
        date: 'Jan 03,2026',
        time: '10:30am',
        completionTimestamp: 'Jan 03, 22:03:12',
        ticketNumber: '#740375',
        location: '1st floor off David Chris Cresent, Kado Abuja',
      },
    } as any);
  };

  const { appointments: storedAppointments } = useBookingContext();
  const completedAppointments: BookedAppointmentItem[] = React.useMemo(() => {
    return storedAppointments
      .filter((a) => a.status === 'completed')
      .map((a) => ({
        id: a.id,
        category: a.serviceName || 'Hair Styling',
        name: a.styleName || a.serviceName,
        price: `₦${a.totalPrice.toLocaleString()}`,
        duration: '30min',
        rating: '5.0',
        status: 'Completed' as const,
        image: a.serviceImage || (
          (a.styleName || a.serviceName || '').toLowerCase().includes('almond') || ((a.styleName || a.serviceName || '').toLowerCase().includes('green') && (a.styleName || a.serviceName || '').toLowerCase().includes('acrylic'))
            ? require('../../../assets/images/profile/4538d4759870466dd05509849b26c4b0b111d827.jpg')
            : (a.styleName || a.serviceName || '').toLowerCase().includes('nail') || (a.styleName || a.serviceName || '').toLowerCase().includes('acrylic')
            ? require('../../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg')
            : ((a.styleName || a.serviceName || '').toLowerCase().includes('facial')
            ? require('../../../assets/images/packages/facial_sheet_mask.png')
            : require('../../../assets/images/profile/men_braids.jpg'))
        ),
      }));
  }, [storedAppointments]);

  if (completedAppointments.length === 0) {
    return (
      <EmptyCompletedAppointmentScreen
        onBookNow={() => router.replace('/home' as any)}
      />
    );
  }

  // Staggered 2-column distribution
  const leftColItems = completedAppointments.filter((_, i) => i % 2 === 0);
  const rightColItems = completedAppointments.filter((_, i) => i % 2 === 1);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Page Header (Figma: height 64px, padding 8px 16px, borderBottom 1px) ── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeftIcon size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Successful Appointments</Text>

        {/* Empty placeholder to balance flex row */}
        <View style={styles.headerPlaceholder} />
      </View>

      {/* ── Main Scroll View ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 24 },
        ]}
      >
        {/* ── 2-Column Grid (flex: 1 with gap: 16) ── */}
        <View style={styles.gridContainer}>
          {/* Left Column */}
          <View style={styles.column}>
            {leftColItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.appointmentCard}
                activeOpacity={0.85}
                onPress={() => handleCardPress(item)}
              >
                {/* Image Container with Tag Badge */}
                <View style={styles.imageContainer}>
                  <SafeImage
                    source={item.image}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                  {/* Status Badge (Figma: background rgba(238, 248, 238, 0.8), border-radius 16px) */}
                  <View style={styles.statusBadge}>
                    <CheckmarkCircleIcon size={20} />
                    <Text style={styles.statusBadgeText}>{item.status}</Text>
                  </View>
                </View>

                {/* Product Information */}
                <View style={styles.productInfo}>
                  <Text style={styles.categoryText} numberOfLines={1}>
                    {item.category}
                  </Text>
                  <Text style={styles.priceText}>{item.price}</Text>

                  {/* Duration & Rating Row */}
                  <View style={styles.metaRow}>
                    <View style={styles.durationGroup}>
                      <ClockTimeIcon size={18} />
                      <Text style={styles.metaText}>{item.duration}</Text>
                    </View>

                    <View style={styles.ratingGroup}>
                      <GoldStarIcon size={16} />
                      <Text style={styles.metaText}>{item.rating}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Right Column */}
          <View style={styles.column}>
            {rightColItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.appointmentCard}
                activeOpacity={0.85}
                onPress={() => handleCardPress(item)}
              >
                {/* Image Container with Tag Badge */}
                <View style={styles.imageContainer}>
                  <SafeImage
                    source={item.image}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                  {/* Status Badge */}
                  <View style={styles.statusBadge}>
                    <CheckmarkCircleIcon size={20} />
                    <Text style={styles.statusBadgeText}>{item.status}</Text>
                  </View>
                </View>

                {/* Product Information */}
                <View style={styles.productInfo}>
                  <Text style={styles.categoryText} numberOfLines={1}>
                    {item.category}
                  </Text>
                  <Text style={styles.priceText}>{item.price}</Text>

                  {/* Duration & Rating Row */}
                  <View style={styles.metaRow}>
                    <View style={styles.durationGroup}>
                      <ClockTimeIcon size={18} />
                      <Text style={styles.metaText}>{item.duration}</Text>
                    </View>

                    <View style={styles.ratingGroup}>
                      <GoldStarIcon size={16} />
                      <Text style={styles.metaText}>{item.rating}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Bottom "No More List" Section with Divider Lines ── */}
        <View style={styles.noMoreListContainer}>
          <View style={styles.noMoreLine} />
          <Text style={styles.noMoreListText}>No More List</Text>
          <View style={styles.noMoreLine} />
        </View>
      </ScrollView>
      <NativeDockSpacer />
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
    ...typography.pageHeader,
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
  },

  // ── 2-Column Grid ──
  gridContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  column: {
    flex: 1,
    gap: 24,
  },

  // ── Card ──
  appointmentCard: {
    width: '100%',
    gap: 12,
  },
  imageContainer: {
    width: '100%',
    height: 164,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },

  // ── Status Badge ──
  statusBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    borderRadius: 16,
  },
  statusBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(10, 95, 10, 0.8)',
  },

  // ── Product Information ──
  productInfo: {
    gap: 6,
  },
  categoryText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  priceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.6,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Meta Row ──
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Bottom "No More List" ──
  noMoreListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 48,
    marginBottom: 16,
  },
  noMoreLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  noMoreListText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.6,
    color: 'rgba(96, 96, 102, 0.96)',
  },
});

export default BookingsListScreen;
