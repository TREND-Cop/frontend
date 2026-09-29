import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  Dimensions,
  Animated,
  Easing,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, Star, Check, X, ArrowLeft } from 'lucide-react-native';
import { SafeImage } from './ui/SafeImage';
import { useNativeDock } from '../utils/useNativeDock';
import { ADD_ON_CATALOG, AddOnCatalogItem, getAddOnsForService } from '../constants/addOneCatalog';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface SubStyleProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image: any;
}

export interface SuggestedAddOnsModalProps {
  visible: boolean;
  basePrice: number;
  serviceId?: string;
  salonId?: string;
  initialSelectedIds?: string[];
  initialStep?: 'list' | 'sub_styles';
  onClose: () => void;
  onConfirm: (selectedIds: string[], totalPrice: number) => void;
}

// ── 1:1 Figma Products matching screenshot and CSS spec ──
export const DEFAULT_SHAMPOO_PRODUCTS: SubStyleProduct[] = [
  {
    id: 'prod_dry_wow',
    name: 'Dry Wow Shampoo',
    category: 'Dry shampoo',
    price: 8500,
    image: require('../../assets/images/products/shampoo_white.png'),
  },
  {
    id: 'prod_whine',
    name: 'Whine Shampoo',
    category: 'Dry shampoo',
    price: 11900,
    image: require('../../assets/images/products/shampoo_red.png'),
  },
  {
    id: 'prod_diamond_black',
    name: 'Diamond Black Shampoo',
    category: 'Dry shampoo',
    price: 20500,
    image: require('../../assets/images/products/shampoo_black.png'),
  },
];

export function SuggestedAddOnsModal({
  visible,
  basePrice,
  serviceId,
  salonId,
  initialSelectedIds = [],
  initialStep = 'list',
  onClose,
  onConfirm,
}: SuggestedAddOnsModalProps) {
  const { width: windowWidth } = useWindowDimensions();
  const screenWidth = windowWidth || Dimensions.get('window').width || 390;

  const insets = useSafeAreaInsets();
  const { hasDock, dockHeight } = useNativeDock();
  const rawDockHeight = Math.max(dockHeight, insets.bottom);
  // Guarantee that on Android, bottom padding always clears the system navigation dock (48-56dp)
  const bottomPadding = Platform.select({
    android: Math.max(rawDockHeight, hasDock ? 56 : 48) + 16,
    ios: Math.max(insets.bottom, 16),
    default: 24,
  });

  // Responsive 2-column calculation so items never wrap onto a single column on smaller devices
  const horizontalPadding = 16 * 2; // 32px
  const gridGap = screenWidth < 380 ? 12 : 20;
  const itemWidth = Math.floor((screenWidth - horizontalPadding - gridGap) / 2);
  const imageBoxHeight = Math.round(itemWidth * (178 / 169));

  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [selectedSubStyleId, setSelectedSubStyleId] = useState<string>('prod_dry_wow');
  const [step, setStep] = useState<'list' | 'loading' | 'sub_styles'>(initialStep);

  // 1:1 Figma dommy loader animation: 4 Dots (16x16px, gap: 20px, total width 124px)
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const dot4 = useRef(new Animated.Value(0)).current;

  // Sync state when modal opens
  useEffect(() => {
    if (visible) {
      setStep(initialStep);
      setSelectedIds(initialSelectedIds);
      setSelectedSubStyleId('prod_dry_wow');
    }
  }, [visible, initialStep, initialSelectedIds]);

  // Handle loader animation during 'loading' step
  useEffect(() => {
    if (step !== 'loading') return;

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

    const timer = setTimeout(() => {
      setStep('sub_styles');
    }, 900);

    return () => {
      clearTimeout(timer);
      anim1.stop();
      anim2.stop();
      anim3.stop();
      anim4.stop();
    };
  }, [step]);

  // Master add-ons list: exactly 4 items matching Figma Screen 1
  const addOnItems = useMemo(() => {
    let items = getAddOnsForService(serviceId, salonId);
    if (!items || items.length === 0) {
      items = [
        ADD_ON_CATALOG['ao_quiff1'] || {
          id: 'ao_quiff1',
          name: 'Quiff',
          price: 8500,
          originalPrice: 41000,
          duration: '24min',
          rating: 5.1,
          discountBadge: '10% OFF',
          image: require('../../assets/images/profile/cont2.jpg'),
        },
        ADD_ON_CATALOG['ao_quiff2'] || {
          id: 'ao_quiff2',
          name: 'Quiff',
          price: 8500,
          originalPrice: 41000,
          duration: '24min',
          rating: 5.1,
          discountBadge: '10% OFF',
          hasSubCategory: true,
          image: require('../../assets/images/profile/cont3.jpg'),
        },
        ADD_ON_CATALOG['ao_feet'] || {
          id: 'ao_feet',
          name: 'Quiff',
          price: 8500,
          originalPrice: 41000,
          duration: '24min',
          rating: 5.1,
          discountBadge: '10% OFF',
          image: require('../../assets/images/profile/cont1.jpg'),
        },
        ADD_ON_CATALOG['p3'] || {
          id: 'p3',
          name: 'Quiff',
          price: 8500,
          originalPrice: 41000,
          duration: '24min',
          rating: 5.1,
          discountBadge: '10% OFF',
          image: require('../../assets/images/profile/30b9a5ab22324bd8357f666111d5584ad2e3c83e.jpg'),
        },
      ] as AddOnCatalogItem[];
    }
    return items;
  }, [serviceId, salonId]);

  // Toggle selection on Screen 1
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Dynamic estimated total calculation
  const estimatedTotal = useMemo(() => {
    if (step === 'sub_styles') {
      const activeProduct = DEFAULT_SHAMPOO_PRODUCTS.find((p) => p.id === selectedSubStyleId);
      const productPrice = activeProduct ? activeProduct.price : 8500;
      if (basePrice && basePrice > 0) {
        return basePrice + productPrice;
      }
      return 12700;
    }

    const selectedAddOnsTotal = addOnItems
      .filter((item) => selectedIds.includes(item.id))
      .reduce((sum, item) => sum + item.price, 0);

    if (basePrice && basePrice > 0) {
      return basePrice + selectedAddOnsTotal;
    }
    return 12700;
  }, [step, selectedSubStyleId, addOnItems, selectedIds, basePrice]);

  // Handle clicking an add-on item in the list
  const handleItemClick = (item: AddOnCatalogItem) => {
    // If it has sub-category/products or is the styled item, trigger loader -> sub_styles
    if (item.hasSubCategory || item.id === 'ao_quiff2' || item.id === 'p1') {
      if (!selectedIds.includes(item.id)) {
        setSelectedIds((prev) => [...prev, item.id]);
      }
      setStep('loading');
    } else {
      toggleSelection(item.id);
    }
  };

  const handleContinue = () => {
    if (step === 'sub_styles') {
      onConfirm([...selectedIds, selectedSubStyleId], estimatedTotal);
    } else {
      onConfirm(selectedIds, estimatedTotal);
    }
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
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        {/* Dark Screen Backdrop Overlay (Figma 1:1: Dimmed Screen Behind Bottom Sheet) */}
        <TouchableOpacity
          style={styles.backdropOverlay}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* ─── 1:1 Figma Bottom Sheet Container (width 390px, height 886px) ─── */}
        <View style={styles.modalContainer}>
          {/* ═══════════════════════════════════════════════════════════════════════
              STEP 1 & STEP 2: ADD-ONS LIST SCREEN & LOADING OVERLAY (Figma 1:1)
             ═══════════════════════════════════════════════════════════════════════ */}
          {(step === 'list' || step === 'loading') && (
            <>
              {/* Close Button: 40x40, top: 16px, right: 16px */}
              <TouchableOpacity
                style={styles.closeButton}
                activeOpacity={0.8}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color="#141B34" strokeWidth={1.8} />
              </TouchableOpacity>

              {/* ─── Suggested Header (Figma: Frame 1000006518) ─── */}
              <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Add-Ons</Text>
                <Text style={styles.headerSubtitle}>
                  Select any of the added add-ons to improrve your appointment.
                </Text>
              </View>

              {/* ─── Add-On Cards Scrollable List (Figma: add one) ─── */}
              <ScrollView
                style={styles.cardsScrollView}
                contentContainerStyle={styles.cardsScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {addOnItems.map((item, index) => {
                  const isSelected = selectedIds.includes(item.id);
                  const formattedPrice = `₦${item.price.toLocaleString()}`;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.addOnCard,
                        isSelected && styles.addOnCardSelected,
                      ]}
                      activeOpacity={0.85}
                      onPress={() => handleItemClick(item)}
                    >
                      {/* Thumbnail Image (Figma: hair cut image frame: 80x80, radius 16) */}
                      <SafeImage
                        source={item.image}
                        style={styles.cardImage}
                        resizeMode="cover"
                      />

                      {/* Details Column (Figma: Frame 1000006082: gap 8px) */}
                      <View style={styles.cardDetails}>
                        {/* Item Name (Figma: Quiff: 14px 400) */}
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {item.name}
                        </Text>

                        {/* Price Row (Figma: service price: 16px 500) */}
                        <View style={styles.cardPriceRow}>
                          <Text style={styles.cardPriceText}>{formattedPrice}</Text>
                        </View>

                        {/* Meta Row: Duration & Star (Figma: Frame 1000006081: gap 24px) */}
                        <View style={styles.metaRow}>
                          <View style={styles.metaItem}>
                            <Clock size={16} color="rgba(96, 96, 102, 0.96)" strokeWidth={1.5} />
                            <Text style={styles.metaText}>{item.duration || '24min'}</Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Star
                              size={16}
                              color="rgba(248, 155, 24, 0.96)"
                              fill="rgba(248, 155, 24, 0.96)"
                            />
                            <Text style={styles.metaText}>{item.rating || '5.1'}</Text>
                          </View>
                        </View>
                      </View>

                      {/* Checkmark Circle (Figma: checkmark-circle-02: 24x24) */}
                      <TouchableOpacity
                        style={[
                          styles.checkCircle,
                          isSelected && styles.checkCircleSelected,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => toggleSelection(item.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        {isSelected && (
                          <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
                        )}
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Bottom Sticky Action Bar */}
              <View
                style={[
                  styles.bottomBar,
                  { paddingBottom: bottomPadding },
                ]}
              >
                <View style={styles.actionRow}>
                  {/* Total Column */}
                  <View style={styles.totalCol}>
                    <Text style={styles.estimatedLabel}>Estimated</Text>
                    <Text style={styles.totalPriceText} numberOfLines={1}>
                      ₦{estimatedTotal.toLocaleString()}
                    </Text>
                  </View>

                  {/* Filled Action Button */}
                  <TouchableOpacity
                    style={styles.continueButton}
                    activeOpacity={0.85}
                    onPress={handleContinue}
                  >
                    <Text style={styles.continueButtonText}>Continue</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* ═══════════════════════════════════════════════════════════════════════
                  4-DOT LOADING OVERLAY (Figma 1:1: Centered Overlay on top of Sheet)
                 ═══════════════════════════════════════════════════════════════════════ */}
              {step === 'loading' && (
                <View style={styles.loadingOverlay}>
                  <View style={styles.dommyLoader}>
                    <Animated.View style={[styles.ellipseDot, getDotStyle(dot1)]} />
                    <Animated.View style={[styles.ellipseDot, getDotStyle(dot2)]} />
                    <Animated.View style={[styles.ellipseDot, getDotStyle(dot3)]} />
                    <Animated.View style={[styles.ellipseDot, getDotStyle(dot4)]} />
                  </View>
                </View>
              )}
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              STEP 3: 1:1 FIGMA PRODUCTS 2-COLUMN GRID (Screen 3 in Image 1)
              (Frame 1000006520: width 358px, top 80px)
             ═══════════════════════════════════════════════════════════════════════ */}
          {step === 'sub_styles' && (
            <>
              {/* Top Navigation Row: Back Arrow on left, Close Button on right */}
              <View style={styles.subStylesHeader}>
                <TouchableOpacity
                  style={styles.backButton}
                  activeOpacity={0.8}
                  onPress={() => setStep('list')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <ArrowLeft size={24} color="#141B34" strokeWidth={1.8} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeButtonSubStyles}
                  activeOpacity={0.8}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={20} color="#141B34" strokeWidth={1.8} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.productsScrollView}
                contentContainerStyle={styles.productsScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={[styles.productsGrid, { columnGap: gridGap }]}>
                  {DEFAULT_SHAMPOO_PRODUCTS.map((prod) => {
                    const isSelected = selectedSubStyleId === prod.id;
                    return (
                      <TouchableOpacity
                        key={prod.id}
                        style={[styles.productItemContainer, { width: itemWidth }]}
                        activeOpacity={0.88}
                        onPress={() => setSelectedSubStyleId(prod.id)}
                      >
                        {/* Image Frame (add one product): responsive width x height */}
                        <View style={[styles.productImageBox, { width: itemWidth, height: imageBoxHeight }]}>
                          {/* 1:1 Figma Circular Expand / Checkmark Button: 32x32px, left 8px, top 8px, border-radius 16px */}
                          <View style={styles.expandButton}>
                            <View
                              style={[
                                styles.checkmarkCircle,
                                isSelected
                                  ? styles.checkmarkCircleSelected
                                  : styles.checkmarkCircleUnselected,
                              ]}
                            >
                              {isSelected && (
                                <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
                              )}
                            </View>
                          </View>

                          {/* Product Bottle Image */}
                          <Image
                            source={prod.image}
                            style={styles.bottleImage}
                            resizeMode="contain"
                          />
                        </View>

                        {/* Product Info (Frame 1000006391: width 169px, height 52px, gap 8px) */}
                        <View style={styles.productInfo}>
                          <Text style={styles.productTitle} numberOfLines={1}>
                            {prod.name}
                          </Text>
                          <Text style={styles.productSubtitle} numberOfLines={1}>
                            {prod.category}
                          </Text>
                        </View>

                        {/* Price Row (Frame 1000006390: width 169px, height 20px) */}
                        <View style={styles.priceRow}>
                          <Text style={styles.productPrice}>
                            ₦{prod.price.toLocaleString()}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Bottom Sticky Action Bar */}
              <View style={[styles.bottomBar, { paddingBottom: bottomPadding }]}>
                <View style={styles.actionRow}>
                  {/* Total Column - Flexible width so amount is never truncated */}
                  <View style={styles.totalCol}>
                    <Text style={styles.estimatedLabel}>Estimated</Text>
                    <Text style={styles.totalPriceText} numberOfLines={1}>
                      ₦{estimatedTotal.toLocaleString()}
                    </Text>
                  </View>

                  {/* Filled Action Button (226x48px, radius 24px, background rgba(0, 8, 20, 0.96)) */}
                  <TouchableOpacity
                    style={styles.continueButton}
                    activeOpacity={0.85}
                    onPress={handleContinue}
                  >
                    <Text style={styles.continueButtonText}>Continue</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  // /* bottom sheet add one screen: width 390px, height 886px */
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN 1: ADD-ONS LIST STYLES
  // ═══════════════════════════════════════════════════════════════════════════
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 8,
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000814',
  },
  headerSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    maxWidth: 320,
  },
  cardsScrollView: {
    maxHeight: 520,
  },
  cardsScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  addOnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    width: '100%',
    height: 116,
  },
  addOnCardSelected: {
    borderColor: 'rgba(0, 8, 20, 0.24)',
    backgroundColor: '#FFFFFF',
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  cardDetails: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  cardPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardPriceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkCircleSelected: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN 2: LOADING STATE OVERLAY STYLES (Figma 1:1)
  // ═══════════════════════════════════════════════════════════════════════════
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 25,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  dommyLoader: {
    width: 124,
    height: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
  },
  ellipseDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN 3: 2-COLUMN PRODUCT GRID STYLES
  // ═══════════════════════════════════════════════════════════════════════════
  subStylesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    width: '100%',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonSubStyles: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productsScrollView: {
    maxHeight: 520,
    flexShrink: 1,
    paddingTop: 8,
  },
  productsScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 24,
    justifyContent: 'space-between',
  },
  productItemContainer: {
    gap: 8,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  productImageBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  // 1:1 Figma expand button: 32x32px, radius 16px, background #FFFFFF, subtle elevation
  expandButton: {
    position: 'absolute',
    left: 8,
    top: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 8, 20, 0.08)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  // 1:1 Figma checkmark-circle-02: 24x24px, radius 12px
  checkmarkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkCircleSelected: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  checkmarkCircleUnselected: {
    borderWidth: 1.5,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: 'transparent',
  },
  bottleImage: {
    width: 80,
    height: 145,
    maxHeight: '82%',
    maxWidth: '70%',
  },
  productInfo: {
    width: '100%',
    gap: 4,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  productTitle: {
    width: '100%',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  productSubtitle: {
    width: '100%',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  priceRow: {
    width: '100%',
    height: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BOTTOM STICKY ACTION BAR (Shared across steps)
  // ═══════════════════════════════════════════════════════════════════════════
  bottomBar: {
    width: '100%',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(133, 139, 148, 0.12)',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  actionRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  // Flexible container so amount is NEVER clipped or wrapped into two lines
  totalCol: {
    flexShrink: 0,
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 2,
  },
  estimatedLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  totalPriceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  continueButton: {
    width: 226,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(133, 139, 148, 0.08)',
        shadowOffset: { width: 8, height: 16 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  continueButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },
  homeIndicatorWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 100,
    backgroundColor: '#000000',
  },
});
