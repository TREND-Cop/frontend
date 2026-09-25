import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Search, X, Clock, Star } from 'lucide-react-native';
import { SafeImage } from '../../components/ui/SafeImage';
import { ShareIcon } from '../../components/ShareIcon';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';
import { bookingStore } from '../../utils/bookingStore';
import { shareStore } from '../../utils/shareStore';

export interface ProfessionalSkillCategory {
  id: string;
  name: string;
  category: string;
  price: string;
  numericPrice: number;
  originalPrice: string;
  duration: string;
  rating: string;
  image: any;
  targetServiceType: string;
}

const BISOLA_SKILL_CATEGORIES: ProfessionalSkillCategory[] = [
  {
    id: 'bc1',
    name: 'Green Nails',
    category: 'Nail Art',
    price: '₦14,200',
    numericPrice: 14200,
    originalPrice: '₦41,000',
    duration: '1hr',
    rating: '3.6',
    image: require('../../../assets/images/profile/1007674598.jpg'),
    targetServiceType: 'Nail Art',
  },
  {
    id: 'bc2',
    name: 'Men Brade',
    category: 'Men Braids',
    price: '₦14,200',
    numericPrice: 14200,
    originalPrice: '₦41,000',
    duration: '1hr',
    rating: '3.6',
    image: require('../../../assets/images/profile/men_braids.jpg'),
    targetServiceType: 'Men Braids',
  },
  {
    id: 'bc3',
    name: 'Acrylic Extensions',
    category: 'Nail Art',
    price: '₦16,500',
    numericPrice: 16500,
    originalPrice: '₦45,000',
    duration: '1hr 30min',
    rating: '4.8',
    image: require('../../../assets/images/profile/1007653036.jpg'),
    targetServiceType: 'Nail Art',
  },
  {
    id: 'bc4',
    name: 'Gel Polish & Spa',
    category: 'Pedicure',
    price: '₦12,000',
    numericPrice: 12000,
    originalPrice: '₦35,000',
    duration: '1hr',
    rating: '4.9',
    image: require('../../../assets/images/profile/dry_wow_pedicure.jpg'),
    targetServiceType: 'Pedicure',
  },
];

export const ProfessionalCategoryScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const providerId = (params.id || params.providerId || 'p1') as string;
  const providerName = (params.name || params.providerName || 'Bisola Olarewaju') as string;
  const firstName = providerName.split(' ')[0] || 'Bisola';
  const salonName = (params.salonName || 'GoodCare Spa') as string;
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return BISOLA_SKILL_CATEGORIES;
    return BISOLA_SKILL_CATEGORIES.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleShare = () => {
    shareStore.openShare({
      title: `${providerName} - Services`,
      status: 'Available',
      statusColor: 'rgba(12, 121, 12, 0.96)',
      url: `https://trend.app/professional/${providerId}/services`,
    });
  };

  const handleCategorySelect = (item: ProfessionalSkillCategory) => {
    bookingStore.setServiceName(item.name);
    bookingStore.setServiceId(item.id);
    bookingStore.setBasePrice(item.numericPrice);
    bookingStore.setSalonName(salonName);
    bookingStore.setDuration(item.duration);
    bookingStore.setRating(item.rating);

    // Route to style details for all items in the professional's category
    router.push({
      pathname: '/professional/style-details',
      params: {
        id: item.id,
        name: item.name,
        title: item.name,
        serviceName: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        rating: item.rating,
        duration: item.duration,
        category: item.category,
        salonName: salonName,
      },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header (Figma: height 64px, padding 8px 16px, borderBottom) ── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {firstName}s Category
        </Text>

        <TouchableOpacity onPress={handleShare} style={styles.iconButton} activeOpacity={0.7}>
          <ShareIcon size={24} color="#141B34" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 24 },
        ]}
      >
        {/* ── Search Bar (Figma: height 48px, radius 24px) ── */}
        <View style={styles.searchBox}>
          <Search size={20} color="rgba(96, 96, 102, 0.96)" />
          <TextInput
            style={[styles.searchInput, { outlineStyle: 'none' } as any]}
            placeholder="Search here.."
            placeholderTextColor="rgba(96, 96, 102, 0.96)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={16} color="rgba(96, 96, 102, 0.96)" />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Category Section Header (Figma: Category / Based on bisola's skill set) ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Category</Text>
          <Text style={styles.sectionSubtitle}>Based on {firstName.toLowerCase()}'s skill set</Text>
        </View>

        {/* ── Category List Cards ── */}
        <View style={styles.listContainer}>
          {filteredCategories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.88}
              onPress={() => handleCategorySelect(item)}
            >

              {/* Image Place Holder (88x88 white card with 80x80 image) */}
              <View style={styles.imagePlaceholder}>
                <SafeImage
                  source={item.image}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              </View>

              {/* Service Info */}
              <View style={styles.cardDetails}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {item.name}
                </Text>

                {/* Price Row */}
                <View style={styles.priceRow}>
                  <Text style={styles.priceMain}>{item.price}</Text>
                </View>

                {/* Meta Row: Duration + Rating */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Clock size={16} color="rgba(96, 96, 102, 0.96)" />
                    <Text style={styles.metaText}>{item.duration}</Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Star
                      size={16}
                      color="rgba(248, 155, 24, 0.96)"
                      fill="rgba(248, 155, 24, 0.96)"
                    />
                    <Text style={styles.metaText}>{item.rating}</Text>
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

  // ── Header (Figma: height 64px, borderBottom 1px solid rgba(235, 235, 245, 0.96)) ──
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
  iconButton: {
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
    paddingTop: 24,
    gap: 24,
  },

  // ── Search Bar (Figma: width 358px, height 48px, radius 24px, border 1px solid #c0c0cc) ──
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#c0c0cc',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(0, 8, 20, 0.96)',
    height: '100%',
  },

  // ── Section Header (Figma: Category / Based on bisola's skill set) ──
  sectionHeader: {
    gap: 8,
  },
  sectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  sectionSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── List Container ──
  listContainer: {
    gap: 40,
  },

  // ── Card (Figma: height 116px, background #f7f7f7, border 1px solid #ebebf5, radius 24px) ──
  card: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    height: 116,
    padding: 16,
    gap: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: '#ebebf5',
    overflow: 'hidden',
  },
  imagePlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  cardDetails: {
    flex: 1,
    height: 84,
    justifyContent: 'space-between',
  },
  cardName: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priceMain: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  priceStrike: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
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
  metaText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Discount Tag Ribbon (Figma: bg #f6f0e6, text #f89b18 12px Medium) ──
  discountRibbon: {
    position: 'absolute',
    top: 8,
    right: 12,
    backgroundColor: '#f6f0e6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountRibbonText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    color: '#f89b18',
  },
});
