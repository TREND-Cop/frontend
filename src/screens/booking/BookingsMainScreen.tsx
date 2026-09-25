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
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ChevronRight,
  ArrowRight,
  Heart,
  Clock,
  User,
  Calendar,
  CalendarCheck,
  CalendarX,
  Hourglass,
} from 'lucide-react-native';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { SafeImage } from '../../components/ui/SafeImage';
import { BookingsSkeleton } from '../../components/ui/BookingsSkeleton';
import { useTabSkeleton } from '../../utils/tabSkeletonStore';
import { useBookingContext } from '../../store/BookingContext';
import { useFavoritesContext } from '../../store/FavoritesContext';
import { theme } from '../../constants/theme';

// ── Exact Figma 3D Category PNG Icons ──
const PENDING_CALENDAR_ICON = require('../../../assets/images/custom/booking_calendar_pending.png');
const COMPLETED_CALENDAR_ICON = require('../../../assets/images/custom/booking_calendar_completed.png');
const CANCELLED_CALENDAR_ICON = require('../../../assets/images/custom/booking_calendar_cancelled.png');
const ONGOING_HOURGLASS_ICON = require('../../../assets/images/custom/booking_hourglass.png');
const WISHLIST_HEART_ICON = require('../../../assets/images/custom/booking_heart.png');

const GoldStarSmallIcon = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path
      d="M8 1.5L9.9 5.36L14.16 5.98L11.08 8.98L11.81 13.22L8 11.22L4.19 13.22L4.92 8.98L1.84 5.98L6.1 5.36L8 1.5Z"
      fill="rgba(248, 155, 24, 0.96)"
    />
  </Svg>
);

// ── Mock Popular Items ──

const POPULAR_RIGHT_NOW = [
  {
    id: 'prn1',
    name: 'Men Braids',
    category: 'Hair Styling',
    price: '₦35,000',
    originalPrice: '₦41,000',
    rating: '4.2',
    userType: 'Male & female',
    image: require('../../../assets/images/profile/men_braids.jpg'),
  },
  {
    id: 'prn2',
    name: 'Facial Therapy',
    category: 'Skin Care',
    price: '₦35,000',
    originalPrice: '₦41,000',
    rating: '4.8',
    userType: 'Male & female',
    image: require('../../../assets/images/packages/facial_sheet_mask.png'),
  },
  {
    id: 'prn3',
    name: 'Dry Wow Pedicure',
    category: 'Nail Care',
    price: '₦25,000',
    originalPrice: '₦30,000',
    rating: '5.0',
    userType: 'Male & female',
    image: require('../../../assets/images/profile/dry_wow_pedicure.jpg'),
  },
];

export type BookingOverviewState = 'pending' | 'accepted' | 'cancelled' | 'empty';

export const BookingsMainScreen: React.FC<{ initialState?: BookingOverviewState }> = ({
  initialState,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isLoading = useTabSkeleton('bookings', 1100);
  const params = useLocalSearchParams();
  const { pendingCount, ongoingCount, completedCount, cancelledCount, activeAppointment } = useBookingContext();
  const { favoritesCount } = useFavoritesContext();

  const currentStatus: BookingOverviewState = (
    (params.state || params.status || initialState || (activeAppointment ? (activeAppointment.status === 'approved' ? 'accepted' : activeAppointment.status) : 'empty')) as BookingOverviewState
  );

  const handleNavigateAppointments = () => {
    if (pendingCount === 0) {
      router.push('/empty-booked-item' as any);
    } else {
      router.push('/appointment' as any);
    }
  };

  const handleNavigateCompleted = () => {
    if (completedCount === 0) {
      router.push('/completed-appointment-empty' as any);
    } else {
      router.push('/completed-appointments' as any);
    }
  };

  const handleNavigateCancelled = () => {
    if (cancelledCount === 0) {
      router.push('/cancelled-appointment-empty' as any);
    } else {
      router.push('/cancelled-appointments' as any);
    }
  };

  const handleNavigateOngoing = () => {
    if (ongoingCount === 0) {
      router.push('/empty-booked-item' as any);
    } else {
      router.push('/ongoing-appointment' as any);
    }
  };

  const handleNavigateWishlist = () => {
    if (favoritesCount === 0) {
      router.push('/wishlist-empty' as any);
    } else {
      router.push('/wishlist' as any);
    }
  };

  const handleSeeAllPopular = () => {
    router.push('/popular-men' as any);
  };

  const handleCardPress = (item: (typeof POPULAR_RIGHT_NOW)[0]) => {
    router.push({
      pathname: '/professional/style-details',
      params: {
        id: item.id,
        name: item.name,
        title: item.name,
        price: item.price,
        rating: item.rating,
        category: item.category,
      },
    } as any);
  };

  // State-specific texts & counts driven by unified storage (all default to Empty until an action is taken)
  const appointmentsCountText =
    pendingCount === 0
      ? 'Empty'
      : `${pendingCount} Booked appointment${pendingCount === 1 ? '' : 's'}`;
  const completedCountText = completedCount === 0 ? 'Empty' : `${completedCount} Successful booking${completedCount === 1 ? '' : 's'}`;
  const cancelledCountText = cancelledCount === 0 ? 'Empty' : `${cancelledCount} Cancelled booking${cancelledCount === 1 ? '' : 's'}`;
  const showCancelledBadge = cancelledCount > 0;
  const ongoingCountText = ongoingCount === 0 ? 'Empty' : `${ongoingCount} Service ongoing`;
  const showOngoingBadge = ongoingCount > 0;
  const wishlistCountText = favoritesCount === 0 ? 'Empty' : `${favoritesCount} saved item${favoritesCount === 1 ? '' : 's'}`;

  if (isLoading) {
    return <BookingsSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 100 },
        ]}
      >
        {/* ── Page Header (Figma: Section Header, Bookings, 24px) ── */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Bookings</Text>
        </View>

        {/* ── Booking Navigation Menu List (Figma: booking components) ── */}
        <View style={styles.menuListContainer}>
          {/* 1. Appointments */}
          <TouchableOpacity
            style={styles.menuRowItem}
            activeOpacity={0.7}
            onPress={handleNavigateAppointments}
          >
            <View style={styles.menuRowLeft}>
              <View style={styles.iconHolder}>
                <SafeImage
                  source={PENDING_CALENDAR_ICON}
                  style={styles.categoryPngIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuItemTitle}>Appointments</Text>
                <Text style={styles.menuItemSubtitle}>{appointmentsCountText}</Text>
              </View>
            </View>

            <View style={styles.menuRowRight}>
              {/* Dynamic Status Badges (shown only when active pending/approved appointment exists) */}
              {pendingCount > 0 && currentStatus === 'accepted' && (
                <View style={styles.acceptedBadge}>
                  <Svg width={14} height={14} viewBox="0 0 16 16" fill="none">
                    <Circle cx="8" cy="8" r="7" fill="rgba(12, 121, 12, 0.96)" />
                    <Path
                      d="M5.5 8L7.5 10L11 6"
                      stroke="#FFFFFF"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                  <Text style={styles.acceptedBadgeText}>Accepted</Text>
                </View>
              )}

              {pendingCount > 0 && currentStatus === 'pending' && (
                <View style={styles.pendingBadge}>
                  <Clock size={14} color="rgba(248, 155, 24, 0.96)" />
                  <Text style={styles.pendingBadgeText}>Pending</Text>
                </View>
              )}

              {currentStatus === 'cancelled' && (Boolean(activeAppointment) || Boolean(params.state) || Boolean(initialState)) && (
                <View style={styles.cancelledBadge}>
                  <Svg width={14} height={14} viewBox="0 0 16 16" fill="none">
                    <Circle cx="8" cy="8" r="7" fill="rgba(204, 41, 41, 0.9)" />
                    <Path
                      d="M6 6L10 10M10 6L6 10"
                      stroke="#FFFFFF"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                    />
                  </Svg>
                  <Text style={styles.cancelledBadgeText}>Cancelled</Text>
                </View>
              )}

              <ChevronRight size={20} color="#141B34" />
            </View>
          </TouchableOpacity>

          <View style={styles.dividerLine} />

          {/* 2. Completed Appointments */}
          <TouchableOpacity
            style={styles.menuRowItem}
            activeOpacity={0.7}
            onPress={handleNavigateCompleted}
          >
            <View style={styles.menuRowLeft}>
              <View style={styles.iconHolder}>
                <SafeImage
                  source={COMPLETED_CALENDAR_ICON}
                  style={styles.categoryPngIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuItemTitle}>Completed Appointments</Text>
                <Text style={styles.menuItemSubtitle}>{completedCountText}</Text>
              </View>
            </View>

            <View style={styles.menuRowRight}>
              <ChevronRight size={20} color="#141B34" />
            </View>
          </TouchableOpacity>

          <View style={styles.dividerLine} />

          {/* 3. Cancelled Appointments */}
          <TouchableOpacity
            style={styles.menuRowItem}
            activeOpacity={0.7}
            onPress={handleNavigateCancelled}
          >
            <View style={styles.menuRowLeft}>
              <View style={styles.iconHolder}>
                <SafeImage
                  source={CANCELLED_CALENDAR_ICON}
                  style={styles.categoryPngIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuItemTitle}>Cancelled Appointments</Text>
                <Text style={styles.menuItemSubtitle}>{cancelledCountText}</Text>
              </View>
            </View>

            <View style={styles.menuRowRight}>
              {showCancelledBadge && (
                <View style={styles.redCountBadge}>
                  <Text style={styles.redCountBadgeText}>1</Text>
                </View>
              )}
              <ChevronRight size={20} color="#141B34" />
            </View>
          </TouchableOpacity>

          <View style={styles.dividerLine} />

          {/* 4. Ongoing Appointment */}
          <TouchableOpacity
            style={styles.menuRowItem}
            activeOpacity={0.7}
            onPress={handleNavigateOngoing}
          >
            <View style={styles.menuRowLeft}>
              <View style={styles.iconHolder}>
                <SafeImage
                  source={ONGOING_HOURGLASS_ICON}
                  style={styles.categoryPngIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuItemTitle}>Ongoing Appointment</Text>
                <Text style={styles.menuItemSubtitle}>{ongoingCountText}</Text>
              </View>
            </View>

            <View style={styles.menuRowRight}>
              {/* Red Badge Indicator */}
              {showOngoingBadge && (
                <View style={styles.redCountBadge}>
                  <Text style={styles.redCountBadgeText}>1</Text>
                </View>
              )}
              <ChevronRight size={20} color="#141B34" />
            </View>
          </TouchableOpacity>

          <View style={styles.dividerLine} />

          {/* 5. Wishlist */}
          <TouchableOpacity
            style={styles.menuRowItem}
            activeOpacity={0.7}
            onPress={handleNavigateWishlist}
          >
            <View style={styles.menuRowLeft}>
              <View style={styles.iconHolder}>
                <SafeImage
                  source={WISHLIST_HEART_ICON}
                  style={styles.categoryPngIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuItemTitle}>Wishlist</Text>
                <Text style={styles.menuItemSubtitle}>{wishlistCountText}</Text>
              </View>
            </View>

            <View style={styles.menuRowRight}>
              <ChevronRight size={20} color="#141B34" />
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Section: Popular Right Now (Figma: see more, Popular Right Now) ── */}
        <View style={styles.popularSection}>
          {/* Header Row */}
          <View style={styles.popularHeaderRow}>
            <Text style={styles.popularTitle}>Popular Right Now</Text>
            <TouchableOpacity
              style={styles.seeMoreButton}
              activeOpacity={0.7}
              onPress={handleSeeAllPopular}
            >
              <ArrowRight size={20} color="rgba(0, 8, 20, 0.96)" />
            </TouchableOpacity>
          </View>

          {/* Horizontal Slider */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalSliderContent}
          >
            {POPULAR_RIGHT_NOW.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.popularCard}
                activeOpacity={0.85}
                onPress={() => handleCardPress(item)}
              >
                {/* Image Container */}
                <View style={styles.popularImageContainer}>
                  <SafeImage
                    source={item.image}
                    style={styles.popularImage}
                    resizeMode="cover"
                  />
                </View>

                {/* Info Container */}
                <View style={styles.popularInfoContainer}>
                  {/* Name and Rating */}
                  <View style={styles.nameRatingRow}>
                    <Text style={styles.popularNameText} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={styles.ratingBadge}>
                      <GoldStarSmallIcon size={14} />
                      <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                  </View>

                  {/* Price Row */}
                  <View style={styles.priceRow}>
                    <Text style={styles.priceText}>{item.price}</Text>
                  </View>

                  {/* Gender / Meta */}
                  <View style={styles.genderRow}>
                    <User size={14} color="rgba(96, 96, 102, 0.96)" />
                    <Text style={styles.genderText}>{item.userType}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Scroll Content ──
  scrollContent: {
    paddingTop: 24,
    gap: 36,
  },

  // ── Page Header ──
  headerContainer: {
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    fontSize: 24,
    lineHeight: Platform.OS === 'ios' ? 32 : 28,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: '#000000',
  },

  // ── Menu List ──
  menuListContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  menuRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  iconHolder: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryPngIcon: {
    width: 28,
    height: 28,
  },
  menuTextCol: {
    gap: 4,
  },
  menuItemTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  menuItemSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  menuRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(246, 240, 230, 0.96)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  pendingBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(248, 155, 24, 0.96)',
  },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(207, 237, 207, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  acceptedBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(12, 121, 12, 0.96)',
  },
  cancelledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(254, 226, 226, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  cancelledBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(204, 41, 41, 0.9)',
  },
  redCountBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(204, 41, 41, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  redCountBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  dividerLine: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },

  // ── Popular Right Now Section ──
  popularSection: {
    gap: 16,
  },
  popularHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  popularTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
  },
  seeMoreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
  },
  horizontalSliderContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  popularCard: {
    width: 208,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    padding: 8,
    gap: 12,
  },
  popularImageContainer: {
    width: 192,
    height: 192,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  popularImage: {
    width: '100%',
    height: '100%',
  },
  popularInfoContainer: {
    paddingHorizontal: 4,
    gap: 6,
  },
  nameRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularNameText: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
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
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 2,
  },
  genderText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
});

export default BookingsMainScreen;
