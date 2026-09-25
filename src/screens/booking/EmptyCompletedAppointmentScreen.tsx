import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, Heart, Users, Star } from 'lucide-react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { SafeImage } from '../../components/ui/SafeImage';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';
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

const GoldStarSmallIcon = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path
      d="M8 1.5L9.9 5.36L14.16 5.98L11.08 8.98L11.81 13.22L8 11.22L4.19 13.22L4.92 8.98L1.84 5.98L6.1 5.36L8 1.5Z"
      fill="rgba(248, 155, 24, 0.96)"
    />
  </Svg>
);

const LOW_BUDGET_SERVICES = [
  {
    id: 'lbs1',
    name: 'Pedicure',
    category: 'Foot Care',
    rating: '4.2',
    price: '₦35,000',
    userType: 'Male & Female',
    location: 'Jabi, Abuja',
    image: require('../../../assets/images/profile/dry_wow_pedicure.jpg'),
  },
  {
    id: 'lbs2',
    name: "Men's Grooming",
    category: 'Grooming',
    rating: '4.8',
    price: '₦30,000',
    userType: 'Male & Female',
    location: 'Wuse II, Abuja',
    image: require('../../../assets/images/services/men_haircut.png'),
  },
  {
    id: 'lbs3',
    name: 'Facial Therapy',
    category: 'Skin Care',
    rating: '4.7',
    price: '₦28,000',
    userType: 'Male & Female',
    location: 'Maitama, Abuja',
    image: require('../../../assets/images/packages/clay_scrub_facial.png'),
  },
];

interface EmptyCompletedAppointmentProps {
  onCheckAppointment?: () => void;
  onBookNow?: () => void;
  onGoBack?: () => void;
  showRecommendations?: boolean;
}

export const EmptyCompletedAppointmentScreen: React.FC<EmptyCompletedAppointmentProps> = ({
  onCheckAppointment,
  onBookNow,
  onGoBack,
  showRecommendations = true,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      router.replace('/home/bookings' as any);
    }
  };

  const handleActionPress = () => {
    if (onCheckAppointment) {
      onCheckAppointment();
    } else if (onBookNow) {
      onBookNow();
    } else {
      router.replace('/home' as any);
    }
  };

  const handleServiceCardPress = (service: (typeof LOW_BUDGET_SERVICES)[0]) => {
    router.push({
      pathname: '/professional/style-details',
      params: {
        id: service.id,
        name: service.name,
        title: service.name,
        price: service.price,
        rating: service.rating,
        category: service.category,
      },
    } as any);
  };

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

        <View style={styles.headerPlaceholder} />
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
        {/* ── Empty State Hero Section ── */}
        <View style={styles.emptyHeroContainer}>
          {/* Calendar Checkmark Illustration (150x150) */}
          <Image
            source={require('../../../assets/images/custom/empty_calendar_checkmark.png')}
            style={styles.emptyIllustration}
            resizeMode="contain"
          />

          {/* Title */}
          <Text style={styles.emptyTitle}>No Completed Appointment</Text>

          {/* Subtitle */}
          <Text style={styles.emptySubtitle}>
            When you complete a service its saved here
          </Text>

          {/* Action Button: Check Appointment / Book Now */}
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.85}
            onPress={handleActionPress}
          >
            <Text style={styles.actionButtonText}>Check Appointment</Text>
          </TouchableOpacity>
        </View>

        {/* ── Optional Low Budget / Recommended Services Section ── */}
        {showRecommendations && (
          <View style={styles.recommendationsSection}>
            <Text style={styles.recommendationsTitle}>Low budget Service</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalSliderContent}
            >
              {LOW_BUDGET_SERVICES.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.servicePromoCard}
                  activeOpacity={0.85}
                  onPress={() => handleServiceCardPress(item)}
                >
                  {/* Card Image Container (192x192, radius 24) */}
                  <View style={styles.cardImageContainer}>
                    <SafeImage
                      source={item.image}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />

                    {/* Bookings Tag (top-left) */}
                    <View style={styles.bookingBadge}>
                      <Text style={styles.bookingBadgeText}>Bookings</Text>
                    </View>

                  </View>

                  {/* Service Info */}
                  <View style={styles.serviceInfoContainer}>
                    {/* Name and Rating Row */}
                    <View style={styles.nameRatingRow}>
                      <Text style={styles.serviceNameText} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={styles.ratingBadge}>
                        <GoldStarSmallIcon size={14} />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                      </View>
                    </View>

                    {/* Price */}
                    <View style={styles.priceRow}>
                      <Text style={styles.priceText}>{item.price}</Text>
                    </View>

                    {/* Meta: User Type & Location */}
                    <View style={styles.metaInfoRow}>
                      <View style={styles.metaItem}>
                        <Users size={14} color="rgba(96, 96, 102, 0.96)" />
                        <Text style={styles.metaItemText}>{item.userType}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <MapPin size={14} color="rgba(96, 96, 102, 0.96)" />
                        <Text style={styles.metaItemText} numberOfLines={1}>
                          {item.location}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
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
    paddingTop: 24,
    gap: 56,
  },

  // ── Empty Hero Section ──
  emptyHeroContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyIllustration: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  emptyTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.6,
    color: '#000000',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
    maxWidth: 320,
  },
  actionButton: {
    width: 248,
    height: 48,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.2)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  actionButtonText: {
    ...typography.button,
    textTransform: 'capitalize',
    color: '#FFFFFF',
  },

  // ── Recommendations Section ──
  recommendationsSection: {
    gap: 16,
  },
  recommendationsTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    paddingHorizontal: 16,
  },
  horizontalSliderContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  servicePromoCard: {
    width: 208,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    padding: 8,
    gap: 12,
  },
  cardImageContainer: {
    width: 192,
    height: 192,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  bookingBadge: {
    position: 'absolute',
    left: 12,
    top: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(229, 229, 229, 0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(248, 249, 250, 0.98)',
  },
  bookingBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  serviceInfoContainer: {
    paddingHorizontal: 4,
    gap: 6,
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
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  metaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaItemText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
});

export default EmptyCompletedAppointmentScreen;
