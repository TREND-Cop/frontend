import React, { useState, useEffect } from 'react';
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
import { getSafeBottomPadding } from '../../utils/safeArea';
import { useRouter } from 'expo-router';
import { ArrowLeft, Star, Maximize2, Check } from 'lucide-react-native';
import { ShareIcon } from '../../components/ShareIcon';
import { bookingStore } from '../../utils/bookingStore';
import { previewStore } from '../../utils/previewStore';
import { shareStore } from '../../utils/shareStore';
import { typography } from '../../constants/theme';

interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  image: any;
  isSelected: boolean;
}

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod_dry_wow_classic',
    name: 'Dry Wow Classic Shampoo',
    category: 'Dry shampoo',
    price: 6500,
    rating: 4.8,
    image: require('../../../assets/images/profile/cont1.jpg'),
    isSelected: false,
  },
  {
    id: 'prod_tea_tree_wash',
    name: 'Organic Tea Tree Wash',
    category: 'Clarifying wash',
    price: 8500,
    rating: 4.9,
    image: require('../../../assets/images/profile/cont2.jpg'),
    isSelected: false,
  },
  {
    id: 'prod_keratin_moisture',
    name: 'Keratin Moisture Soap',
    category: 'Moisturizing care',
    price: 11500,
    rating: 5.0,
    image: require('../../../assets/images/profile/cont3.jpg'),
    isSelected: false,
  },
];

export const AddOneProductScreen = ({ navigation }: { navigation?: any }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedIds, setSelectedIds] = useState<string[]>(bookingStore.getSelectedIds());

  useEffect(() => {
    const unsubscribe = bookingStore.subscribe(() => {
      setSelectedIds(bookingStore.getSelectedIds());
    });
    setSelectedIds(bookingStore.getSelectedIds());
    return unsubscribe;
  }, []);

  const products = INITIAL_PRODUCTS.map((p) => ({
    ...p,
    isSelected: selectedIds.includes(p.id),
  }));

  const basePrice = 12700;
  const selectedProductsTotal = products
    .filter((p) => p.isSelected)
    .reduce((sum, p) => sum + p.price, 0);
  const totalPrice = basePrice + selectedProductsTotal;

  const handleGoBack = () => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/booking-review' as any);
    }
  };

  const handleToggleSelect = (id: string) => {
    bookingStore.toggleAddOn(id);
  };

  const handlePreviewImage = (index: number) => {
    const productImgs = products.map((p) => p.image);
    const productItems = products.map((p) => ({
      image: p.image,
      title: p.name,
      price: `₦${p.price.toLocaleString()}`,
      duration: '15min',
      rating: p.rating ? p.rating.toFixed(1) : '4.8',
    }));
    previewStore.setPreviewImages(productImgs, 'Add-On Products', productItems, index);
    router.push({
      pathname: '/professional/gallery-preview',
      params: { index, initialIndex: index, source: 'products' },
    });
  };

  const handleReviewBooking = () => {
    router.push('/booking-review');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ─── Top Header Bar ────────────────────────────────────────── */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton} activeOpacity={0.7}>
          <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add One Product</Text>
        <TouchableOpacity
          style={styles.shareButton}
          activeOpacity={0.7}
          onPress={() =>
            shareStore.openShare({
              title: 'Add One Product',
              status: 'Available',
              statusColor: 'rgba(12, 121, 12, 0.96)',
              url: 'https://trend.app/add-one-product',
            })
          }
        >
          <ShareIcon size={24} color="#141B34" />
        </TouchableOpacity>
      </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ─── Product Grid ──────────────────────────────────────────── */}
          <View style={styles.productsGrid}>
            {products.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={styles.productCardContainer}
                activeOpacity={0.9}
                onPress={() => handleToggleSelect(item.id)}
              >
                {/* Image Frame */}
                <View style={styles.imageFrame}>
                  <Image source={item.image} style={styles.productImage} resizeMode="contain" />

                  {/* Top-Left Selection Check Badge */}
                  <TouchableOpacity
                    style={[
                      styles.checkCircle,
                      item.isSelected ? styles.checkCircleSelected : styles.checkCircleUnselected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleToggleSelect(item.id)}
                  >
                    {item.isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                  </TouchableOpacity>

                  {/* Top-Right Expand Button */}
                  <TouchableOpacity
                    style={styles.expandButton}
                    activeOpacity={0.8}
                    onPress={(e) => {
                      e.stopPropagation();
                      handlePreviewImage(index);
                    }}
                  >
                    <Maximize2 size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {/* Product Info (Frame 1000006391) */}
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.productCategory}>{item.category}</Text>

                  {/* Price & Rating Row (Frame 1000006390) */}
                  <View style={styles.priceRatingRow}>
                    <Text style={styles.priceText}>₦{item.price.toLocaleString()}</Text>
                    <View style={styles.ratingRow}>
                      <Star size={16} color="rgba(245, 149, 15, 0.96)" fill="rgba(245, 149, 15, 0.96)" />
                      <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* ─── Bottom Action Bar with Review Booking ─────────────────── */}
        <View style={[styles.bottomBar, { height: undefined, paddingBottom: getSafeBottomPadding(insets, 16, 8) }]}>
          <View style={styles.totalPriceCol}>
            <Text style={styles.estimatedLabel}>Estimated</Text>
            <Text style={styles.totalPriceText}>₦{totalPrice.toLocaleString()}</Text>
          </View>

          <TouchableOpacity
            style={styles.reviewBookingButton}
            activeOpacity={0.8}
            onPress={handleReviewBooking}
          >
            <Text style={styles.reviewBookingButtonText}>Review Booking</Text>
          </TouchableOpacity>
        </View>
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
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 17,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 110,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  productCardContainer: {
    width: '47.5%',
    marginBottom: 16,
    gap: 8,
  },
  imageFrame: {
    width: '100%',
    height: 178,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '80%',
    height: '80%',
  },
  checkCircle: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  checkCircleSelected: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  checkCircleUnselected: {
    borderWidth: 1.5,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  expandButton: {
    position: 'absolute',
    top: 11,
    right: 11,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(229, 229, 229, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  productInfo: {
    gap: 4,
  },
  productName: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 22,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  productCategory: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  priceRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  priceText: {
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    lineHeight: 22,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 22,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
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
    lineHeight: 26,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  reviewBookingButton: {
    flex: 1,
    marginLeft: 24,
    height: 48,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewBookingButtonText: {
    ...typography.button,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
});
