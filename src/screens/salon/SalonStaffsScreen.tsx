import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Briefcase,
  Star,
  User,
  Building2,
} from 'lucide-react-native';
import { ShareIcon } from '../../components/ShareIcon';
import { SafeImage } from '../../components/ui/SafeImage';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';
import { MOCK_SALONS } from '../home/mockSalons';
import { shareStore } from '../../utils/shareStore';

export interface SalonStaffMember {
  id: string;
  name: string;
  role?: string;
  experience: string;
  salonName: string;
  rating: string;
  reviews: string;
  image: any;
  available: boolean;
}

const STAFF_PROFILES = [
  {
    name: 'Bisola Andrew',
    experience: '5years',
    rating: '4.8',
    reviews: '142 Reviews',
    role: 'Nail Art Specialist',
    image: require('../../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg'),
    available: true,
  },
  {
    name: 'Essie Micheal',
    experience: '4years',
    rating: '4.7',
    reviews: '98 Reviews',
    role: 'Massage Therapist',
    image: require('../../../assets/images/profile/30b9a5ab22324bd8357f666111d5584ad2e3c83e.jpg'),
    available: false,
  },
  {
    name: 'Tunde Adeleke',
    experience: '6years',
    rating: '4.9',
    reviews: '215 Reviews',
    role: 'Senior Barber',
    image: require('../../../assets/images/profile/cont1.jpg'),
    available: true,
  },
  {
    name: 'Chidinma Okonkwo',
    experience: '3years',
    rating: '4.6',
    reviews: '76 Reviews',
    role: 'Facial & Skin Specialist',
    image: require('../../../assets/images/profile/cont2.jpg'),
    available: false,
  },
];

export const SalonStaffsScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const salonId = (params.salonId || params.id || 'salon2') as string;

  const salon = useMemo(() => {
    const found = MOCK_SALONS.find((s) => s.id === salonId);
    if (found) return found;
    return {
      id: salonId,
      name: (params.name as string) || 'Luminous Lux',
    };
  }, [salonId, params]);

  const staffMembers = useMemo<SalonStaffMember[]>(() => {
    return STAFF_PROFILES.map((st, idx) => ({
      id: `staff_${salon.id}_${idx + 1}`,
      name: st.name,
      role: st.role,
      experience: st.experience,
      salonName: salon.name,
      rating: st.rating,
      reviews: st.reviews,
      image: st.image,
      available: st.available,
    }));
  }, [salon]);

  const headerTitle = `${salon.name} Staff`;

  const handleShare = () => {
    shareStore.openShare({
      title: `${salon.name} Staff`,
      status: 'Available',
      statusColor: 'rgba(12, 121, 12, 0.96)',
      url: `https://trend.app/salon/${salon.id}/staffs`,
      avatar: 'images' in salon && salon.images?.[0] ? { uri: salon.images[0] } : undefined,
    });
  };

  const handleStaffPress = (staff: SalonStaffMember) => {
    router.push({
      pathname: `/professional/${staff.id}`,
      params: {
        id: staff.id,
        name: staff.name,
        role: staff.role,
        salonName: salon.name,
        workplace: salon.name,
        experience: staff.experience,
        rating: staff.rating,
        reviewsCount: staff.reviews,
        status: staff.available ? 'available' : 'unavailable',
      },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Page Header (Figma: height: 64px, padding: 8px 16px) ─────────── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (router.canGoBack() ? router.back() : router.replace(`/salon/${salon.id}` as any))}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {headerTitle}
        </Text>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ShareIcon size={24} color="#141B34" />
        </TouchableOpacity>
      </View>

      {/* ── Staff Members List (Figma: gap 40px between cards) ───────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 40 + insets.bottom },
        ]}
      >
        <View style={styles.staffsList}>
          {staffMembers.map((st, idx) => (
            <TouchableOpacity
              key={`${st.id}-${idx}`}
              style={styles.staffCard}
              activeOpacity={0.88}
              onPress={() => handleStaffPress(st)}
            >
              {/* Staff Thumbnail (80x80) with dynamic Available/Unavailable badge */}
              <View style={styles.staffImageWrapper}>
                <SafeImage source={st.image} style={styles.staffImage} resizeMode="cover" />
                <View style={styles.statusBadgeAnchor} pointerEvents="none">
                  <View
                    style={[
                      styles.statusBadge,
                      st.available ? styles.statusBadgeAvailable : styles.statusBadgeUnavailable,
                    ]}
                  >
                    <Briefcase
                      size={12}
                      color={st.available ? 'rgba(12, 121, 12, 0.96)' : 'rgba(204, 41, 41, 0.96)'}
                    />
                    <Text
                      style={[
                        styles.statusBadgeText,
                        st.available ? styles.statusBadgeTextAvailable : styles.statusBadgeTextUnavailable,
                      ]}
                      numberOfLines={1}
                    >
                      {st.available ? 'Available' : 'Unavailable'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Staff Details (Figma: location information, width: 230px, height: 84px, gap: 8px) */}
              <View style={styles.staffInfoCol}>
                {/* Staff Name (Figma: 16px, line-height 24px, letter-spacing 0.4px) */}
                <Text style={styles.staffNameText} numberOfLines={1}>
                  {st.name}
                </Text>

                {/* Line 1: Experience • Workplace (Figma: Frame 1000006254, gap: 8px) */}
                <View style={styles.experienceRow}>
                  <View style={styles.experienceGroup}>
                    <Briefcase size={16} color="rgba(192, 192, 204, 0.96)" />
                    <Text style={styles.metaText}>{st.experience}</Text>
                  </View>

                  {/* Ellipse 188 (Dot: 6x6, bg: rgba(192, 192, 204, 0.96)) */}
                  <View style={styles.ellipseDot} />

                  <View style={styles.workplaceGroup}>
                    <Building2 size={16} color="rgba(192, 192, 204, 0.96)" />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {salon.name}
                    </Text>
                  </View>
                </View>

                {/* Line 2: Rates & Reviews (Figma: Frame 1000006253, gap: 16px) */}
                <View style={styles.ratesReviewsRow}>
                  {/* Rates (Figma: gap: 8px) */}
                  <View style={styles.rateGroup}>
                    <Star
                      size={20}
                      color="rgba(248, 155, 24, 0.96)"
                      fill="rgba(248, 155, 24, 0.96)"
                    />
                    <Text style={styles.ratingText}>{st.rating}</Text>
                  </View>

                  {/* Reviews (Figma: gap: 8px) */}
                  <View style={styles.reviewGroup}>
                    <User size={16} color="rgba(192, 192, 204, 0.96)" />
                    <Text style={styles.metaText}>{st.reviews}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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

  // Header (Figma: height: 64px, padding: 8px 16px, border-bottom: 1px solid rgba(235, 235, 245, 0.96))
  headerRow: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Main Scroll View (Figma: top offset 24px below header, gap 40px between cards)
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  staffsList: {
    gap: 40,
  },

  // Staff Card (Figma: width: 358px, height: 104px, padding: 16px, gap: 16px, radius: 24px, bg: rgba(248, 249, 250, 0.98))
  staffCard: {
    width: '100%',
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    padding: 16,
    gap: 16,
  },

  // Frame 1000006248 (width: 80px, height: 80px, radius: 16px)
  staffImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 16,
    position: 'relative',
    alignItems: 'center',
  },
  staffImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },

  // Dynamic Staff Status Tag (centered horizontally with no clipping)
  statusBadgeAnchor: {
    position: 'absolute',
    bottom: -8,
    left: -24,
    right: -24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 8,
    gap: 4,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  statusBadgeAvailable: {
    backgroundColor: 'rgba(238, 248, 238, 0.96)',
    borderColor: 'rgba(12, 121, 12, 0.22)',
  },
  statusBadgeUnavailable: {
    backgroundColor: 'rgba(254, 242, 242, 0.96)',
    borderColor: 'rgba(204, 41, 41, 0.22)',
  },
  statusBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  statusBadgeTextAvailable: {
    color: 'rgba(12, 121, 12, 0.96)',
  },
  statusBadgeTextUnavailable: {
    color: 'rgba(204, 41, 41, 0.96)',
  },

  // Location Information Column (Figma: width: 230px, height: 84px, gap: 8px)
  staffInfoCol: {
    flex: 1,
    height: 84,
    justifyContent: 'space-between',
    gap: 8,
  },

  // Staff Name (Figma: 16px, line-height 24px, letter-spacing 0.4px)
  staffNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // Frame 1000006254 (gap: 8px, height: 20px)
  experienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 20,
  },
  experienceGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workplaceGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  metaText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // Ellipse 188 (width: 6px, height: 6px, bg: rgba(192, 192, 204, 0.96), radius: 3px)
  ellipseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },

  // Frame 1000006253 (gap: 16px, height: 24px)
  ratesReviewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    height: 24,
  },
  rateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  reviewGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default SalonStaffsScreen;
