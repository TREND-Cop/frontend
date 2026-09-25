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
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { SafeImage } from '../../components/ui/SafeImage';
import { EmptyCancelledAppointmentScreen } from './EmptyCancelledAppointmentScreen';
import { ReportBottomSheet } from '../../components/ReportBottomSheet';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';
import { useBookingContext } from '../../store/BookingContext';

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

const HeadphoneIcon = ({ size = 24, color = '#141B34' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 14C3 9.02944 7.02944 5 12 5C16.9706 5 21 9.02944 21 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 14H5C6.10457 14 7 14.8954 7 16V19C7 20.1046 6.10457 21 5 21H4C3.44772 21 3 20.5523 3 20V14Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 14H19C17.8954 14 17 14.8954 17 16V19C17 20.1046 17.8954 21 19 21H20C20.5523 21 21 20.5523 21 20V14Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 17C21 17 18 20 12 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" />
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

const CancelCircleBadgeIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Circle cx="10" cy="10" r="9" fill="rgba(204, 41, 41, 0.9)" />
    <Path
      d="M7.5 7.5L12.5 12.5M12.5 7.5L7.5 12.5"
      stroke="#FFFFFF"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

export interface CancelledAppointmentItem {
  id: string;
  name: string;
  category: string;
  price: string;
  duration: string;
  rating: string;
  image: any;
}

const CANCELLED_APPOINTMENTS: CancelledAppointmentItem[] = [
  {
    id: 'c1',
    name: 'Dread Locks',
    category: 'Hair Styling',
    price: '₦22,700',
    duration: '24min',
    rating: '5.1',
    image: require('../../../assets/images/profile/men_braids.jpg'),
  },
  {
    id: 'c2',
    name: 'Dread Locks',
    category: 'Hair Styling',
    price: '₦22,700',
    duration: '24min',
    rating: '5.1',
    image: require('../../../assets/images/services/men_haircut.png'),
  },
];

export const CancelledAppointmentsScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [appointments, setAppointments] = useState<CancelledAppointmentItem[]>(CANCELLED_APPOINTMENTS);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);

  const handleGoBack = () => {
    router.replace('/home/bookings' as any);
  };

  const handleReportPress = () => {
    setIsReportModalVisible(true);
  };

  const handleCardPress = (item: CancelledAppointmentItem) => {
    router.push({
      pathname: '/cancelled-booking',
      params: {
        id: item.id,
        name: item.name,
        serviceName: item.name,
        category: item.category,
        price: item.price,
        duration: item.duration,
        rating: item.rating,
      },
    } as any);
  };

  const { appointments: storedAppointments } = useBookingContext();
  const cancelledAppointments: CancelledAppointmentItem[] = React.useMemo(() => {
    return storedAppointments
      .filter((a) => a.status === 'cancelled')
      .map((a) => ({
        id: a.id,
        category: a.serviceName || 'Hair Styling',
        name: a.styleName || a.serviceName,
        price: `₦${a.totalPrice.toLocaleString()}`,
        duration: '30min',
        rating: '5.0',
        image: require('../../../assets/images/profile/men_braids.jpg'),
      }));
  }, [storedAppointments]);

  if (cancelledAppointments.length === 0) {
    return <EmptyCancelledAppointmentScreen onGoBack={handleGoBack} />;
  }

  // Staggered 2-column distribution with flex: 1 avoiding flexWrap bugs
  const leftColItems = cancelledAppointments.filter((_, i) => i % 2 === 0);
  const rightColItems = cancelledAppointments.filter((_, i) => i % 2 === 1);

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
          onPress={handleReportPress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <HeadphoneIcon size={24} />
        </TouchableOpacity>
      </View>

      {/* ── Scrollable Body ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 24 },
        ]}
      >
        {/* ── 2-Column Grid Layout (gap: 16) ── */}
        <View style={styles.gridContainer}>
          {/* Left Column */}
          <View style={styles.column}>
            {leftColItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.cardContainer}
                activeOpacity={0.85}
                onPress={() => handleCardPress(item)}
              >
                {/* Image Frame with Overlaid Cancelled Tag */}
                <View style={styles.imageFrame}>
                  <SafeImage
                    source={item.image}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                  {/* Cancelled Pill Tag */}
                  <View style={styles.cancelledTag}>
                    <CancelCircleBadgeIcon size={18} />
                    <Text style={styles.cancelledTagText}>Cancelled</Text>
                  </View>
                </View>

                {/* Product Information */}
                <View style={styles.cardInfo}>
                  <View style={styles.nameRatingRow}>
                    <Text style={styles.serviceNameText} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={styles.ratingBadge}>
                      <GoldStarSmallIcon size={14} />
                      <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                  </View>

                  <Text style={styles.priceText}>{item.price}</Text>

                  <View style={styles.durationRow}>
                    <ClockTimeIcon size={16} />
                    <Text style={styles.durationText}>{item.duration}</Text>
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
                style={styles.cardContainer}
                activeOpacity={0.85}
                onPress={() => handleCardPress(item)}
              >
                {/* Image Frame with Overlaid Cancelled Tag */}
                <View style={styles.imageFrame}>
                  <SafeImage
                    source={item.image}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                  {/* Cancelled Pill Tag */}
                  <View style={styles.cancelledTag}>
                    <CancelCircleBadgeIcon size={18} />
                    <Text style={styles.cancelledTagText}>Cancelled</Text>
                  </View>
                </View>

                {/* Product Information */}
                <View style={styles.cardInfo}>
                  <View style={styles.nameRatingRow}>
                    <Text style={styles.serviceNameText} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={styles.ratingBadge}>
                      <GoldStarSmallIcon size={14} />
                      <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                  </View>

                  <Text style={styles.priceText}>{item.price}</Text>

                  <View style={styles.durationRow}>
                    <ClockTimeIcon size={16} />
                    <Text style={styles.durationText}>{item.duration}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── End of List Divider (Figma: No More List, Line 177, Line 178) ── */}
        <View style={styles.noMoreListContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.noMoreListText}>No More List</Text>
          <View style={styles.dividerLine} />
        </View>
      </ScrollView>
      <NativeDockSpacer />

      <ReportBottomSheet
        visible={isReportModalVisible}
        onClose={() => setIsReportModalVisible(false)}
        onSubmit={(data) => {
          console.log('Report submitted:', data);
        }}
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
    gap: 40,
  },

  // ── 2-Column Grid Layout ──
  gridContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  column: {
    flex: 1,
    gap: 20,
  },
  cardContainer: {
    gap: 12,
  },
  imageFrame: {
    width: '100%',
    height: 164,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cancelledTag: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
    backgroundColor: 'rgba(248, 239, 239, 0.96)',
    borderRadius: 16,
  },
  cancelledTagText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.3,
    color: 'rgba(204, 41, 41, 0.9)',
  },

  // ── Card Information ──
  cardInfo: {
    gap: 6,
    paddingHorizontal: 2,
  },
  nameRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceNameText: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
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
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── No More List Footer ──
  noMoreListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  dividerLine: {
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

export default CancelledAppointmentsScreen;
