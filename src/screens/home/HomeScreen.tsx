import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Dimensions, 
  Platform,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StatusBar as RNStatusBar,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Search, BellRing, LayoutGrid, Check } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { useUserContext } from '../../store/UserContext';
import { bookingStore } from '../../utils/bookingStore';

import { GridCardList } from '../../components/ui/GridCardList';
import { HorizontalCardList } from '../../components/ui/HorizontalCardList';
import { PagedCardCarousel } from '../../components/ui/PagedCardCarousel';
import { PromoBanner } from '../../components/ui/PromoBanner';
import { VideoCard } from '../../components/ui/VideoCard';
import { DiscountServiceCard } from '../../components/ui/DiscountServiceCard';
import { CompactServiceCard } from '../../components/ui/CompactServiceCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { RankedPlaceCard } from '../../components/ui/RankedPlaceCard';
import { ProfessionalCard } from '../../components/ui/ProfessionalCard';
import { ServiceCard } from '../../components/ui/ServiceCard';
import { HomeSkeleton } from '../../components/ui/HomeSkeleton';
import { useTabSkeleton } from '../../utils/tabSkeletonStore';
import { formatDisplayLocation } from '../../utils/locationFormatter';
import {
  MEN_SERVICES,
  WOMEN_SERVICES,
  WEEKEND_DEAL,
  TRENDING_DATA,
  POPULAR_DATA,
  MORE_TO_SEE_DATA,
  BODY_WORK_DATA,
  WEEKEND_SPECIALS_DATA,
  HAIR_REMOVAL_DATA,
  BODY_TREATMENT_DATA,
  TOP_RATED_DATA,
  SPECIAL_LADIES_DATA,
  PROFESSIONALS_DATA,
  BEAUTY_PLUS_DATA,
  NON_SURGICAL_DATA,
  PREMIUM_LADIES_LOOKS_DATA,
  MALE_AESTHETIC_DATA,
  Category
} from './mockData';
import { previewStore } from '../../utils/previewStore';

// Helper to chunk data into columns
const chunkData = (data: any[], size: number) => {
  const chunked = [];
  for (let i = 0; i < data.length; i += size) {
    chunked.push(data.slice(i, i + size));
  }
  return chunked;
};

export interface DealSlide {
  id: string;
  label: string;
  title: string;
  buttonText: string;
  image: string;
  route: string;
}

export const HERO_DEAL: DealSlide = {
  id: 'deal-hero',
  label: 'Beauty & Nails',
  title: 'SPECIAL DEAL',
  buttonText: 'Book Now',
  image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&q=80',
  route: '/category',
};

export const DEAL_CAROUSEL_IMAGES: string[] = [
  'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&q=80', // Beauty & Nails
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80', // Luxury Salon Spa
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80', // Body Wellness
  'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80', // Gentlemen Cut
  'https://images.unsplash.com/photo-1512496015851-a98fb38ba79eb?w=800&q=80', // Makeup & Glam
];

export const DEAL_SLIDES: DealSlide[] = DEAL_CAROUSEL_IMAGES.map((img, idx) => ({
  id: `deal-${idx + 1}`,
  label: HERO_DEAL.label,
  title: HERO_DEAL.title,
  buttonText: HERO_DEAL.buttonText,
  image: img,
  route: HERO_DEAL.route,
}));

const DEAL_IMAGES = DEAL_CAROUSEL_IMAGES;

import Svg, { Path } from 'react-native-svg';

const SearchList02Icon = ({ color, size = 24, strokeWidth = 1.8, fill = 'none', ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" color={color} fill={fill} {...props}>
    <Path d="M2.5 9.5H6.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2.5 14.5H6.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2.5 19.5H18.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18.5355 13.0355L21.5 16M20 9.5C20 6.73858 17.7614 4.5 15 4.5C12.2386 4.5 10 6.73858 10 9.5C10 12.2614 12.2386 14.5 15 14.5C17.7614 14.5 20 12.2614 20 9.5Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// --- COMPONENTS ---

const ServiceCategoryGrid = ({ category }: { category: Category }) => {
  const data = category === 'men' ? MEN_SERVICES : WOMEN_SERVICES;
  const router = useRouter();
  
  return (
    <View style={styles.gridContainer}>
      {data.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.gridItem}
          activeOpacity={0.7}
          onPress={() => {
            if (item.isMore) {
              router.push('/home/category');
            } else {
              const salonTitle = item.name.toLowerCase().includes('salon')
                ? item.name
                : `${item.name} Salons`;
              router.push({
                pathname: `/salon-listing/${item.id}`,
                params: { id: item.id, name: salonTitle },
              } as any);
            }
          }}
        >
          <View style={styles.gridIconContainer}>
            {item.isMore ? (
              <SearchList02Icon size={24} color={theme.colors.barberPrimary} strokeWidth={1.8} />
            ) : (
              <Image 
                source={typeof item.icon === 'string' ? { uri: item.icon } : item.icon} 
                style={styles.gridImage} 
                resizeMode="cover" 
              />
            )}
          </View>
          <Text style={[styles.gridLabel, item.isMore && styles.gridLabelMore]} numberOfLines={1}>{item.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export const HomeScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = insets.top > 0 ? insets.top : (Platform.OS === 'android' ? (RNStatusBar.currentHeight || 28) : 20);
  const bottomInset = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 16 : 0);
  const { profileData } = useUserContext();
  const { width: windowWidth } = useWindowDimensions();
  const screenWidth = windowWidth || Dimensions.get('window').width || 390;

  const [selectedCategory, setSelectedCategory] = useState<Category>('men');
  const [currentDealImageIndex, setCurrentDealImageIndex] = useState(0);
  const isLoading = useTabSkeleton('home', 1100);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const dealCarouselRef = useRef<ScrollView>(null);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

  const statusBarOpacity = scrollY.interpolate({
    inputRange: [0, 40, 90],
    outputRange: [0, 0.6, 1],
    extrapolate: 'clamp',
  });

  const handleMainScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    scrollY.setValue(y);
    if (y > 100 && !isScrolled) {
      setIsScrolled(true);
    } else if (y <= 100 && isScrolled) {
      setIsScrolled(false);
    }
  };

  const startAutoScroll = () => {
    if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    autoScrollTimer.current = setInterval(() => {
      setCurrentDealImageIndex((prev) => {
        const nextIndex = (prev + 1) % DEAL_CAROUSEL_IMAGES.length;
        dealCarouselRef.current?.scrollTo({
          x: nextIndex * screenWidth,
          animated: true,
        });
        return nextIndex;
      });
    }, 4500);
  };


  useEffect(() => {
    startAutoScroll();
    return () => {
      if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    };
  }, [screenWidth]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const width = e.nativeEvent.layoutMeasurement?.width || screenWidth;
    if (width > 0) {
      const newIndex = Math.min(
        DEAL_CAROUSEL_IMAGES.length - 1,
        Math.max(0, Math.round(offsetX / width))
      );
      if (newIndex !== currentDealImageIndex) {
        setCurrentDealImageIndex(newIndex);
      }
    }
  };

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    handleScroll(e);
    startAutoScroll();
  };

  const handleDotPress = (index: number) => {
    setCurrentDealImageIndex(index);
    dealCarouselRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true,
    });
    startAutoScroll();
  };

  const handleServiceCardPress = (item: any, categoryTitle?: string) => {
    if (item.route) {
      router.push(item.route as any);
      return;
    }

    // Check if this is a Salon place (has rank or categories)
    if (item.rank !== undefined || item.categories !== undefined) {
      handleRankedPlacePress(item);
      return;
    }

    const title = item.title || item.name || 'Service';
    let numPrice = 15000;
    if (typeof item.price === 'number') {
      numPrice = item.price;
    } else if (typeof item.price === 'string') {
      const parsed = parseInt(item.price.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsed)) numPrice = parsed;
    }

    const formattedPrice = typeof item.price === 'number' ? `₦${item.price.toLocaleString()}` : (item.price || `₦${numPrice.toLocaleString()}`);
    const originalPrice = item.originalPrice ? (typeof item.originalPrice === 'number' ? `₦${item.originalPrice.toLocaleString()}` : item.originalPrice) : undefined;
    const rating = typeof item.rating === 'number' ? item.rating.toString() : (item.rating || '4.8');

    let serviceCategory = categoryTitle || item.category;
    if (!serviceCategory) {
      const lower = title.toLowerCase();
      if (lower.includes('facial') || lower.includes('face') || lower.includes('pore')) serviceCategory = 'Facials';
      else if (lower.includes('massage') || lower.includes('spa') || lower.includes('scrub')) serviceCategory = 'Massage';
      else if (lower.includes('pedicure') || lower.includes('manicure') || lower.includes('nail')) serviceCategory = 'Nails';
      else if (lower.includes('shave') || lower.includes('cut') || lower.includes('groom') || lower.includes('hair')) serviceCategory = 'Hair Cut';
      else serviceCategory = 'Service';
    }

    const salonName = item.providerLocation
      ? `${title} Studio`
      : (item.location ? `${item.location} Salon` : 'Luminous Lux');
    const location = item.providerLocation || item.location || 'Jabi, Abuja';

    // Seed booking context
    bookingStore.setServiceName(title);
    bookingStore.setServiceId(item.id || 'srv_1');
    bookingStore.setBasePrice(numPrice);
    bookingStore.setSalonName(salonName);
    bookingStore.setRating(rating);
    bookingStore.setDuration(item.duration || '1hr');

    // Route to Style Details for Services
    router.push({
      pathname: '/professional/style-details',
      params: {
        id: item.id || 'srv_1',
        serviceId: item.id || 'srv_1',
        name: title,
        title: title,
        serviceName: title,
        price: formattedPrice,
        originalPrice: originalPrice,
        rating: rating,
        duration: item.duration || '1hr',
        category: serviceCategory,
        salonName: salonName,
        location: location,
      },
    } as any);
  };

  const handleRankedPlacePress = (item: any) => {
    const salonId = item.id || 'tr1';
    router.push({
      pathname: '/salon/[id]',
      params: {
        id: salonId,
        name: item.title,
        rating: item.rating ? item.rating.toString() : '4.8',
        location: item.location || 'Jabi, Abuja',
      },
    } as any);
  };

  if (isLoading) {
    return <HomeSkeleton />;
  }

  return (
    <View style={styles.rootContainer}>
      {/* Top Status Bar Cover - Solid barrier that caps the notification bar so content never scrolls through it */}
      <Animated.View
        style={[
          styles.statusBarCover,
          {
            height: topInset,
            opacity: statusBarOpacity,
          },
        ]}
        pointerEvents="none"
      />

      <StatusBar style={isScrolled ? 'dark' : 'light'} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingBottom: 58 + (bottomInset > 0 ? bottomInset + (Platform.OS === 'ios' ? 4 : 8) : (Platform.OS === 'ios' ? 32 : 12)) + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleMainScroll}
        decelerationRate="normal"
        nestedScrollEnabled={true}
        removeClippedSubviews={Platform.OS !== 'web'}
        keyboardShouldPersistTaps="handled"
        overScrollMode="never"
        bounces={true}
      >
        
        {/* FULL TOP BACKGROUND AREA (450px tall as per Figma) */}
        <View style={styles.topBackground}>
          {/* Dynamic background carousel (User can swipe/slide horizontally, auto-scrolls) */}
          <ScrollView
            ref={dealCarouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
            directionalLockEnabled={true}
            scrollEventThrottle={16}
            onScrollBeginDrag={() => {
              if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
            }}
            onScroll={handleScroll}
            onMomentumScrollEnd={handleScrollEnd}
            onScrollEndDrag={handleScrollEnd}
            style={StyleSheet.absoluteFill}
          >
            {DEAL_CAROUSEL_IMAGES.map((imageUrl, index) => (
              <View key={index} style={{ width: screenWidth, height: 450, position: 'relative' }}>
                <Image 
                  source={{ uri: imageUrl }} 
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>

          {/* Dark overlay across the entire banner */}
          <View style={styles.topOverlay} pointerEvents="none" />

          {/* STATIC DEAL CARD OVERLAY - Remains completely static in place while background images move */}
          <View 
            style={[styles.weekendDealWrapper, { top: topInset + 144 }]} 
            pointerEvents="box-none"
          >
            {/* Text Content aligned to the right */}
            <View style={styles.dealTextContainer} pointerEvents="box-none">
              <Text style={styles.dealLabel}>{HERO_DEAL.label}</Text>
              <Text style={styles.dealDiscount}>{HERO_DEAL.title}</Text>
              <TouchableOpacity 
                style={styles.dealButton} 
                onPress={() => router.push(HERO_DEAL.route as any)} 
                activeOpacity={0.8}
              >
                <Text style={styles.dealButtonText}>{HERO_DEAL.buttonText}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FIXED HEADER & SEARCH BAR ON TOP */}
          <View 
            style={[styles.topFixedControls, { paddingTop: topInset + 12 }]} 
            pointerEvents="box-none"
          >
          {/* HEADER ROW */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.userInfo}
              activeOpacity={0.8}
              onPress={() => router.push('/profile' as any)}
            >
              <View style={styles.avatarWrapper}>
                <Image 
                  source={
                    typeof profileData.avatarUri === 'string'
                      ? { uri: profileData.avatarUri }
                      : profileData.avatarUri || require('../../../assets/images/profile/05fc2d4379598a2d970225e7fdac24e129516033.jpg')
                  } 
                  style={styles.avatar} 
                />
                <View style={styles.verifiedBadge}>
                  <Check size={10} color="#FFFFFF" strokeWidth={3} />
                </View>
              </View>

              <View style={styles.userTextContainer}>
                <Text style={styles.greetingText}>Hello! {profileData.username || 'Fabulous'}</Text>
                <View style={styles.locationRow}>
                  <MapPin size={14} color={theme.colors.appBackground} />
                  <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
                    {formatDisplayLocation(profileData.location)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7} onPress={() => router.push('/notifications')}>
              <BellRing size={20} color={theme.colors.appBackground} strokeWidth={1.5} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>

          {/* SEARCH BAR ROW */}
          <View style={styles.searchRow}>
            <TouchableOpacity 
              style={styles.searchBar} 
              activeOpacity={0.7}
              onPress={() => router.push('/search')}
            >
              <Search size={20} color={theme.colors.barberPrimary} />
              <Text style={styles.searchText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Banner Pagination Dots */}
        <View style={styles.bannerDots} pointerEvents="box-none">
          {DEAL_CAROUSEL_IMAGES.map((_, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              onPress={() => handleDotPress(index)}
              style={styles.dotTouchArea}
            >
              <View 
                style={index === currentDealImageIndex ? styles.dotActive : styles.dotInactive} 
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.bottomContent}>
        {/* SERVICES SECTION */}
        <View style={styles.servicesSection}>
          <View style={styles.servicesHeader}>
            <Text style={styles.servicesTitle}>Services</Text>
            <View style={styles.tabsContainer}>
              <TouchableOpacity 
                style={styles.tabButton} 
                onPress={() => setSelectedCategory('men')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, selectedCategory === 'men' && styles.tabTextActive]}>Men</Text>
                {selectedCategory === 'men' && <View style={[styles.activeIndicator, { width: 36 }]} />}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.tabButton} 
                onPress={() => setSelectedCategory('women')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, selectedCategory === 'women' && styles.tabTextActive]}>Women</Text>
                {selectedCategory === 'women' && <View style={[styles.activeIndicator, { width: 56 }]} />}
              </TouchableOpacity>
            </View>
          </View>

          <ServiceCategoryGrid category={selectedCategory} />
        </View>

        {/* FEEDS */}
        <HorizontalCardList
          title="Now Trending"
          icon="fire"
          cardGap={37}
          data={TRENDING_DATA}
          onItemPress={handleServiceCardPress}
        />

        <HorizontalCardList
          title="Popular Amongst Men"
          subtitle="Join the groove with others"
          showSeeAll={true}
          onSeeAllPress={() => router.push('/popular-men')}
          cardGap={32}
          data={POPULAR_DATA}
          onItemPress={handleServiceCardPress}
        />

        <PagedCardCarousel
          title="Try Something New"
          subtitle="Experience Other Services"
          data={MORE_TO_SEE_DATA}
          onItemPress={handleServiceCardPress}
        />

        <PromoBanner 
          image={require('../../../assets/images/banner/promo_salon.png')}
          title={"Get quality\ncustomer services"}
          buttonText="Review"
          onPress={() => router.push('/home/category')}
        />

        {/* Havana */}
        <HorizontalCardList
          title="Havana"
          subtitle="Block stress points around your body"
          showSeeAll={true}
          onSeeAllPress={() => router.push('/see-all/havana-body-work')}
          cardGap={32}
          data={BODY_WORK_DATA}
          onItemPress={handleServiceCardPress}
        />

        {/* Video Thumbnail */}
        <View style={styles.videoSectionContainer}>
          <SectionHeader title="Body Improvement Therapy" />
          <VideoCard
            title="Experience advanced body improvement therapy"
            duration="00:10"
            thumbnailUrl={require('../../../assets/images/custom/body_therapy_video_frame.jpg')}
            videoSource={require('../../../assets/videos/generate_a_sec_video_on_beau.mp4')}
            onPress={() => {
              previewStore.setVideoThumbnails(
                require('../../../assets/images/custom/body_therapy_video_frame.jpg'),
                undefined,
                require('../../../assets/videos/generate_a_sec_video_on_beau.mp4')
              );
              router.push({
                pathname: '/video',
                params: {
                  title: 'Body Improvement Therapy',
                  serviceName: 'Full Body Therapy Treatment',
                  price: '₦45,000',
                  duration: '00:10',
                  rating: '4.8',
                  salonName: 'Body Improvement Therapy',
                },
              } as any);
            }}
            onBookNowPress={() => {
              router.push({
                pathname: '/professional/style-details',
                params: {
                  title: 'Full Body Therapy Treatment',
                  name: 'Full Body Therapy Treatment',
                  price: '₦45,000',
                  duration: '2hr',
                  rating: '4.8',
                  salonName: 'Body Improvement Therapy',
                },
              } as any);
            }}
          />
        </View>

        {/* Weekends Specials */}
        <View>
          <SectionHeader 
            title="⚡ Weekends Specials" 
            subtitle="Relaxing spots for the weekends"
            titleColor="#F59E0B"
            rightElement={<Text style={{ color: theme.colors.dangerVibrant, fontWeight: '500' }}>1:20:01</Text>}
          />
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            scrollEventThrottle={16}
            nestedScrollEnabled={true}
            removeClippedSubviews={Platform.OS !== 'web'}
            overScrollMode="never"
            contentContainerStyle={{ paddingRight: 16, gap: 24, paddingBottom: 24 }}
            snapToInterval={263} // 239 width + 24 gap
            decelerationRate="fast"
          >
            {WEEKEND_SPECIALS_DATA.map((item) => (
              <DiscountServiceCard
                key={item.id}
                title={item.title}
                price={item.price}
                originalPrice={item.originalPrice}
                rating={item.rating}
                image={item.image}
                onPress={() => handleServiceCardPress(item)}
              />
            ))}
          </ScrollView>
        </View>

        <PromoBanner 
          image={require('../../../assets/images/banner/promo_salon.png')}
          title={"Get quality\ncustomer services"}
          buttonText="Review"
          onPress={() => router.push('/home/category')}
        />

        {/* Hair Removal Treatments */}
        <View>
          <SectionHeader 
            title="Hair Removal Treatments" 
            subtitle="Best in getting rid of unwanted hairs"
            showSeeAll={true}
            onSeeAllPress={() => router.push('/see-all/hair-removal')}
          />
          <View style={styles.tagsContainer}>
            {HAIR_REMOVAL_DATA.map((item) => (
              <CompactServiceCard
                key={item.id}
                title={item.title}
                price={item.price}
                location={item.location}
                rating={item.rating}
                gender={item.gender}
                image={item.image}
                onPress={() => handleServiceCardPress(item)}
              />
            ))}
          </View>
        </View>

        {/* Body Treatment */}
        <View>
          <SectionHeader 
            title="Body Treatment" 
            subtitle="Treatments to make you look young again"
          />
          <View style={styles.tagsContainer}>
            {BODY_TREATMENT_DATA.map((item) => (
              <CompactServiceCard
                key={item.id}
                title={item.title}
                price={item.price}
                location={item.location}
                rating={item.rating}
                gender={item.gender}
                image={item.image}
                onPress={() => handleServiceCardPress(item)}
              />
            ))}
          </View>
        </View>

        {/* Top Rated Places */}
        <View>
          <SectionHeader 
            title="Top 5 Rated Places Near You" 
            subtitle="See top rated places loved by people in your area"
          />
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            scrollEventThrottle={16}
            nestedScrollEnabled={true}
            removeClippedSubviews={Platform.OS !== 'web'}
            overScrollMode="never"
            contentContainerStyle={{ paddingRight: 16, paddingBottom: 24 }}
            snapToInterval={Math.min(screenWidth - 48, 420) + 24}
            decelerationRate="fast"
          >
            {chunkData(TOP_RATED_DATA, 2).map((columnItems, columnIndex) => (
              <View key={columnIndex} style={{ marginRight: 24, gap: 32 }}>
                {columnItems.map((item: any) => (
                  <RankedPlaceCard
                    key={item.id}
                    rank={item.rank}
                    title={item.title}
                    categories={item.categories}
                    rating={item.rating}
                    location={item.location}
                    image={item.image}
                    onPress={() => handleRankedPlacePress(item)}
                  />
                ))}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Second Promo Banner */}
        <PromoBanner 
          image={require('../../../assets/images/banner/promo_salon.png')}
          title={"Get quality\ncustomer services"}
          buttonText="Review"
          onPress={() => router.push('/home/category')}
        />



        {/* Special For The Ladies */}
        <HorizontalCardList 
          title="Special For The Ladies" 
          subtitle="Top choices services for the women"
          showSeeAll={true}
          onSeeAllPress={() => router.push('/see-all/special-ladies')}
          data={SPECIAL_LADIES_DATA}
          onItemPress={handleServiceCardPress}
        />

        {/* Service Professionals */}
        <PagedCardCarousel
          title="Service Professionals"
          subtitle="Book professional service providing agents, available for work."
          data={PROFESSIONALS_DATA}
          itemGap={16}
          renderItem={(item) => (
            <ProfessionalCard
              name={item.name}
              experience={item.experience}
              workplace={item.workplace}
              rating={item.rating}
              reviewsCount={item.reviewsCount}
              isAvailable={item.isAvailable}
              image={item.image}
              onPress={() =>
                router.push({
                  pathname: `/professional/${item.id}`,
                  params: {
                    id: item.id,
                    name: item.name,
                    workplace: item.workplace,
                    experience: item.experience,
                    rating: item.rating.toString(),
                    reviewsCount: item.reviewsCount,
                    status: item.isAvailable ? 'available' : 'unavailable',
                  },
                } as any)
              }
            />
          )}
        />

        {/* Beauty Plus */}
        <HorizontalCardList 
          title="Beauty Plus" 
          subtitle="Extra touches to make you look vibrant"
          showSeeAll={true}
          onSeeAllPress={() => router.push('/see-all/beauty-plus')}
          data={BEAUTY_PLUS_DATA}
          onItemPress={handleServiceCardPress}
        />

        {/* Third Promo Banner */}
        <PromoBanner 
          image={require('../../../assets/images/banner/promo_salon.png')}
          title={"Get quality\ncustomer services"}
          buttonText="Review"
          onPress={() => router.push('/home/category')}
        />

        {/* Non-Surgical Aesthetic */}
        <HorizontalCardList 
          title="Non-Surgical Aesthetic" 
          subtitle="Surgery free services and still look natural"
          showSeeAll={true}
          onSeeAllPress={() => router.push('/see-all/non-surgical')}
          data={NON_SURGICAL_DATA}
          onItemPress={handleServiceCardPress}
        />

        {/* Premium Ladies Looks */}
        <HorizontalCardList 
          title="Premium Ladies Looks" 
          subtitle="Little improvements that looks like noting happend"
          showSeeAll={true}
          onSeeAllPress={() => router.push('/see-all/premium-ladies')}
          data={PREMIUM_LADIES_LOOKS_DATA}
          onItemPress={handleServiceCardPress}
        />

        {/* Male Aesthetic */}
        <HorizontalCardList 
          title="Male Aesthetic" 
          subtitle="Improvements for the gentlemen"
          showSeeAll={true}
          onSeeAllPress={() => router.push('/see-all/male-aesthetic')}
          data={MALE_AESTHETIC_DATA}
          onItemPress={handleServiceCardPress}
        />

        <View style={{ height: 20 }} /> 
      </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: theme.colors.appBackground,
    position: 'relative',
  },
  statusBarCover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 999,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.appBackground,
  },
  contentContainer: {
    paddingBottom: Platform.OS === 'ios' ? 110 : 90,
  },
  // --- TOP BACKGROUND SECTION ---
  topBackground: {
    width: '100%',
    height: 450,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
  },
  topFixedControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  topOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  // --- HEADER ROW ---
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.appBackground,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'rgba(26, 130, 255, 0.9)', // Blue badge color from CSS
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
  userTextContainer: {
    gap: 4,
    maxWidth: 260,
  },
  greetingText: {
    ...theme.typography.bodyRegular,
    color: theme.colors.appBackground,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 240,
  },
  locationText: {
    ...theme.typography.label,
    color: theme.colors.appBackground,
    flexShrink: 1,
  },
  notificationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF383C',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  // --- SEARCH ROW ---
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24, // Reduced gap
    zIndex: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.layerBg,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    gap: 10,
    flex: 1,
  },
  searchText: {
    ...theme.typography.label,
    color: theme.colors.barberPrimarySupport,
  },

  // --- WEEKEND DEAL ---
  weekendDealWrapper: {
    position: 'absolute',
    right: 16,
    height: 190,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  dealBarberImage: {
    position: 'absolute',
    width: 280,
    height: 208,
    left: -40,
    top: 0,
    borderRadius: 16,
    opacity: 0.8,
  },
  dealTextContainer: {
    width: 176,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'transparent',
  },
  dealLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
    letterSpacing: 0.2,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 6,
  },
  dealDiscount: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '800',
    fontSize: 34,
    lineHeight: 40,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.95)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  dealButton: {
    width: 134, // Exact width 134px requested
    height: 42,
    borderColor: '#FFFFFF',
    borderWidth: 1.5,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 8, 20, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  dealButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bannerDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  dotTouchArea: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotInactive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  dotActive: {
    width: 18,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  // --- BOTTOM CONTENT (Figma: /* home content */ padding: 0px, gap: 40px, left: 16px) ---
  bottomContent: {
    paddingHorizontal: 16,
    paddingTop: 24, // 24px spacing from the image carousel
    paddingBottom: 40,
    gap: 40, // 40px vertical gap between each service section
    backgroundColor: theme.colors.appBackground,
    width: '100%',
    alignSelf: 'stretch',
  },
  videoSectionContainer: {
    width: '100%',
    alignSelf: 'stretch',
  },
  tagsContainer: {
    gap: 32, // was 24, +8 = 32px between vertical card items
  },
  servicesSection: {
    width: '100%',
  },
  servicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  servicesTitle: {
    ...theme.typography.homeHeader,
    color: theme.colors.barberPrimary,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tabText: {
    ...theme.typography.bodyMed,
    color: theme.colors.barberPrimarySupport,
  },
  tabTextActive: {
    fontWeight: '500',
    color: theme.colors.barberPrimary,
  },
  activeIndicator: {
    height: 2,
    backgroundColor: theme.colors.barberPrimary,
    borderRadius: 2,
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  gridItem: {
    width: 78,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 10,
  },
  gridIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: theme.colors.layerBg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  gridImage: {
    width: 48,
    height: 48,
    borderRadius: 4,
  },
  gridLabel: {
    ...theme.typography.label,
    color: theme.colors.barberPrimary,
    textAlign: 'center',
    height: 20,
  },
  gridLabelMore: {
    ...theme.typography.labelMed,
    color: theme.colors.barberPrimary,
  },
});
