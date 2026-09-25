import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check, Clock, Maximize2, Star } from 'lucide-react-native';
import { useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSafeBottomPadding } from '../../utils/safeArea';
import { ShareIcon } from '../../components/ShareIcon';
import { bookingStore } from '../../utils/bookingStore';
import { shareStore } from '../../utils/shareStore';
import { previewStore } from '../../utils/previewStore';
import { SafeImage } from '../../components/ui/SafeImage';
import { BookingProgressStepper } from '../../components/BookingProgressStepper';
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const STYLES_DATA = [
  {
    id: 's1',
    name: 'Feet & Fingers',
    rating: '2.1',
    image: require('../../../assets/images/profile/14dcc3440340f9f140251ac160473457c89b198c.jpg'),
  },
  {
    id: 's2',
    name: 'Long Nails',
    rating: '3.7',
    image: require('../../../assets/images/profile/30b9a5ab22324bd8357f666111d5584ad2e3c83e.jpg'),
  },
  {
    id: 's3',
    name: 'Short Feet Nails',
    rating: '4.5',
    image: require('../../../assets/images/profile/eb3281d09659fdef5e45647cf5529f61e83190f1.jpg'),
  },
  {
    id: 's4',
    name: 'Short Nails',
    rating: '3.1',
    image: require('../../../assets/images/profile/b4bdda58fe4760cb04cb35cca583a63e04b99e77.jpg'),
  },
  {
    id: 's5',
    name: 'Average Nails',
    rating: '4.5',
    image: require('../../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg'),
  },
  {
    id: 's6',
    name: 'Both Hands',
    rating: '3.1',
    image: require('../../../assets/images/profile/ee549b1ea85771de4cd8695943af94f474fedf19.jpg'),
  },
];

import { getAddOnsForService, ADD_ON_CATALOG } from '../../constants/addOneCatalog';

interface AddOnItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  duration: string;
  rating: number;
  image: any;
  isSelected: boolean;
  hasSubCategory?: boolean;
  subCategoryRoute?: string;
}

export const StyleSelectionScreen = ({ navigation }: { navigation?: any }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ from?: string }>();
  const isReviewMode = params?.from === 'review';

  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(() => {
    const current = bookingStore.getSelectedStyle();
    return current?.id || (isReviewMode ? 's4' : 's4');
  });
  const [isAddOnsModalVisible, setIsAddOnsModalVisible] = useState(false);
  const [addOns, setAddOns] = useState<AddOnItem[]>(() => {
    const providerAddOns = getAddOnsForService(
      bookingStore.getServiceId(),
      bookingStore.getSalonId()
    );
    return providerAddOns.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      duration: item.duration,
      rating: item.rating,
      image: item.image,
      isSelected: bookingStore.isAddOnSelected(item.id),
      hasSubCategory: item.hasSubCategory,
      subCategoryRoute: item.subCategoryRoute,
    }));
  });

  const basePrice = bookingStore.getBasePrice() || 12000;
  const selectedAddOnsTotal = addOns
    .filter((item) => item.isSelected)
    .reduce((sum, item) => sum + item.price, 0);
  const totalPrice = basePrice + selectedAddOnsTotal;

  const handleGoBack = () => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(isReviewMode ? ('/booking-review' as any) : ('/appointment-time' as any));
    }
  };

  const handleNext = () => {
    if (!selectedStyleId) return;
    const selectedStyle = STYLES_DATA.find((s) => s.id === selectedStyleId);
    if (selectedStyle) {
      bookingStore.setSelectedStyle({
        id: selectedStyle.id,
        name: selectedStyle.name,
        audience: 'Male only',
        image: selectedStyle.image,
        rating: selectedStyle.rating,
      });
    }
    if (isReviewMode) {
      router.back();
      return;
    }
    // If the provider uploaded NO add-ons for this service, skip the add-on modal completely
    if (addOns.length === 0) {
      bookingStore.setSelectedIds([]);
      router.push('/specialist' as any);
      return;
    }
    setIsAddOnsModalVisible(true);
  };

  const handleModalNext = () => {
    setIsAddOnsModalVisible(false);
    const selectedStyle = STYLES_DATA.find((s) => s.id === selectedStyleId);
    if (selectedStyle) {
      bookingStore.setSelectedStyle({
        id: selectedStyle.id,
        name: selectedStyle.name,
        audience: 'Male only',
        image: selectedStyle.image,
        rating: selectedStyle.rating,
      });
    }
    const selectedItems = addOns.filter((item) => item.isSelected);
    const selectedIds = selectedItems.map((item) => item.id);
    bookingStore.setSelectedIds(selectedIds);

    // Auto-assign provider-uploaded staff for chosen add-ons
    if (selectedItems.length > 0) {
      let assignedStaff = null;
      for (const item of selectedItems) {
        const catalogItem = ADD_ON_CATALOG[item.id];
        if (catalogItem?.specialist) {
          assignedStaff = catalogItem.specialist;
          break;
        }
      }
      bookingStore.setAddOnSpecialist(assignedStaff);
    } else {
      bookingStore.setAddOnSpecialist(null);
    }

    // Check if any selected add-on requires specific product/ingredient selection
    const addOnWithProducts = selectedItems.find((item) => item.hasSubCategory);

    if (addOnWithProducts) {
      // ONLY opens when a selected add-on requires product choice
      router.push({
        pathname: (addOnWithProducts.subCategoryRoute || '/add-one-product') as any,
        params: { addOnId: addOnWithProducts.id, addOnName: addOnWithProducts.name },
      });
    } else {
      // Skips Add-on Product screen and proceeds directly to Specialist
      router.push('/specialist' as any);
    }
  };

  const handleAddOnItemPress = (item: AddOnItem) => {
    toggleAddOn(item.id);
  };

  const toggleAddOn = (id: string) => {
    setAddOns((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isSelected: !item.isSelected } : item
      )
    );
    bookingStore.toggleAddOn(id);
  };

  const handleExpandImage = (style: typeof STYLES_DATA[0]) => {
    const styleIndex = STYLES_DATA.findIndex((s) => s.id === style.id);
    const styleImgs = STYLES_DATA.map((s) => s.image);
    const styleItems = STYLES_DATA.map((s) => ({
      image: s.image,
      title: s.name,
      price: '₦14,200',
      duration: '1hr',
      rating: s.rating || '4.8',
    }));
    previewStore.setPreviewImages(styleImgs, 'Select Style', styleItems, styleIndex);
    router.push({ pathname: '/professional/gallery-preview', params: { index: styleIndex, initialIndex: styleIndex, source: 'styles' } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ─── Header Row ────────────────────────────────────────────── */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton} activeOpacity={0.7}>
          <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service type</Text>
        <TouchableOpacity
          style={styles.shareButton}
          activeOpacity={0.7}
          onPress={() =>
            shareStore.openShare({
              title: 'Service type',
              status: 'Available',
              statusColor: 'rgba(12, 121, 12, 0.96)',
              url: 'https://trend.app/style-selection',
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
        {/* ─── Stepper Progress Indicator (Hidden in review change-style flow) ─── */}
        {!isReviewMode && <BookingProgressStepper currentStep={2} />}

        {/* ─── Styles Grid ──────────────────────────────────────────── */}
        <View style={styles.stylesGrid}>
          {STYLES_DATA.map((item) => {
            const isSelected = selectedStyleId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.styleCard}
                activeOpacity={0.9}
                onPress={() => setSelectedStyleId(item.id)}
              >
                {/* Image Frame (Frame 1000006014) */}
                <View style={styles.imageFrame}>
                  <Image source={item.image} style={styles.cardImage} resizeMode="cover" />

                  {/* Expand Button */}
                  <TouchableOpacity
                    style={styles.expandButton}
                    activeOpacity={0.8}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleExpandImage(item);
                    }}
                  >
                    <Maximize2 size={16} color="#FFFFFF" strokeWidth={2} />
                  </TouchableOpacity>

                  {/* Rating Overlay */}
                  <View style={styles.ratingOverlay}>
                    <Star size={16} color="rgba(248, 155, 24, 0.96)" fill="rgba(248, 155, 24, 0.96)" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                </View>

                {/* Title & Radio Row (Frame 1000006387) */}
                <View style={styles.labelRow}>
                  <Text style={[styles.styleName, isSelected && styles.styleNameSelected]} numberOfLines={1}>
                    {item.name}
                  </Text>

                  {/* Radio Checkmark Button */}
                  <View
                    style={[
                      styles.radioButton,
                      isSelected && styles.radioButtonSelected,
                    ]}
                  >
                    {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={2.5} />}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* ─── Bottom Action Bar ────────────────── */}
      {isReviewMode ? (
        <View style={[styles.reviewBottomBar, { paddingBottom: getSafeBottomPadding(insets, 16, 8) }]}>
          <TouchableOpacity
            style={[
              styles.saveChangesButton,
              !selectedStyleId && styles.nextButtonDisabled,
            ]}
            activeOpacity={selectedStyleId ? 0.8 : 1}
            disabled={!selectedStyleId}
            onPress={handleNext}
          >
            <Text style={styles.saveChangesButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.bottomBar, { paddingBottom: getSafeBottomPadding(insets, 16, 8) }]}>
          <View style={styles.totalPriceCol}>
            <Text style={styles.estimatedLabel}>Estimated</Text>
            <Text style={styles.totalPriceText}>₦{basePrice.toLocaleString()}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.nextButton,
              !selectedStyleId && styles.nextButtonDisabled,
            ]}
            activeOpacity={selectedStyleId ? 0.8 : 1}
            disabled={!selectedStyleId}
            onPress={handleNext}
          >
            <Text
              style={[
                styles.nextButtonText,
                !selectedStyleId && styles.nextButtonTextDisabled,
              ]}
            >
              Next
            </Text>
          </TouchableOpacity>
        </View>
      )}

        {/* ─── Suggested Add-One Bottom Sheet Modal ──────────────────── */}
        <Modal
          visible={isAddOnsModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsAddOnsModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <TouchableOpacity
              style={styles.modalBackdropTouch}
              activeOpacity={1}
              onPress={() => setIsAddOnsModalVisible(false)}
            />

            <View style={styles.modalContent}>
              {/* Drag Handle */}
              <View style={styles.dragHandle} />

              {/* Modal Header (Figma: suggested header) */}
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Suggested Add-Ons</Text>
                <Text style={styles.modalSubtitle}>
                  Select any of the suggested add-ons to spice up your service.
                </Text>
              </View>

              {/* Add-On Cards List */}
              <ScrollView
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {addOns.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.addOnCard,
                      item.isSelected && styles.addOnCardSelected,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => handleAddOnItemPress(item)}
                  >

                    {/* Thumbnail Image (80x80 - Figma: hair cut image frame) */}
                    <SafeImage source={item.image} style={styles.addOnImage} resizeMode="cover" />

                    {/* Details Column (Figma: Frame 1000006082) */}
                    <View style={styles.addOnDetails}>
                      <Text style={styles.addOnTitle}>{item.name}</Text>

                      {/* Price Row (Figma: service price) */}
                      <View style={styles.addOnPriceRow}>
                        <Text style={styles.addOnPrice}>₦{item.price.toLocaleString()}</Text>
                      </View>

                      {/* Meta Row: Duration and Rating (Figma: Frame 1000006081) */}
                      <View style={styles.addOnMetaRow}>
                        <View style={styles.metaItem}>
                          <Clock size={16} color="rgba(96, 96, 102, 0.96)" />
                          <Text style={styles.metaText}>{item.duration}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Star size={16} color="rgba(245, 149, 15, 0.96)" fill="rgba(245, 149, 15, 0.96)" />
                          <Text style={styles.metaText}>{item.rating}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Checkmark / Radio Selection Circle (Figma: checkmark-circle-02) */}
                    <TouchableOpacity
                      style={[
                        styles.selectCircle,
                        item.isSelected && styles.selectCircleSelected,
                      ]}
                      activeOpacity={0.8}
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleAddOn(item.id);
                      }}
                    >
                      {item.isSelected && (
                        <Check size={14} color="#FFFFFF" strokeWidth={3} />
                      )}
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Modal Bottom Action Bar (Figma: price button and indicatro) */}
              <View style={styles.modalBottomBar}>
                <View style={styles.totalPriceCol}>
                  <Text style={styles.estimatedLabel}>Estimated</Text>
                  <Text style={styles.totalPriceText}>₦{totalPrice.toLocaleString()}</Text>
                </View>

                <TouchableOpacity
                  style={styles.modalNextButton}
                  activeOpacity={0.85}
                  onPress={handleModalNext}
                >
                  <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    height: 64,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    flex: 1,
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 120,
    gap: 24,
  },

  // Stepper Progress Bar
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stepItem: {
    flex: 1,
    gap: 10,
  },
  stepItemLast: {
    alignItems: 'flex-end',
    gap: 8,
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircleActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleInactive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  stepLine: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 4,
    marginLeft: 6,
  },
  stepLineActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  stepLabel: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    color: 'rgba(160, 160, 176, 0.9)',
    textAlign: 'left',
  },
  stepLabelActive: {
    color: 'rgba(0, 8, 20, 0.96)',
    fontWeight: '400',
  },

  // Styles Grid
  stylesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 40,
  },
  styleCard: {
    width: 160,
    height: 208,
    gap: 16,
  },
  styleNameSelected: {
    color: 'rgba(0, 8, 20, 0.96)',
    fontWeight: '500',
  },
  imageFrame: {
    width: 160,
    height: 160,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
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
  },
  ratingOverlay: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  ratingText: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
  },
  labelRow: {
    width: 160,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  styleName: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    color: 'rgba(96, 96, 102, 0.96)',
    flex: 1,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioButtonSelected: {
    borderColor: 'rgba(0, 8, 20, 0.96)',
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },

  // Bottom Fixed Bar (Booking Flow)
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(133, 139, 148, 1)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  totalPriceCol: {
    gap: 4,
    minWidth: 100,
    flexShrink: 0,
  },
  estimatedLabel: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  totalPriceText: {
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 20,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  nextButton: {
    flex: 1,
    marginLeft: 16,
    height: 48,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  nextButtonText: {
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontSize: 16,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  nextButtonTextDisabled: {
    color: 'rgba(160, 160, 176, 0.9)',
  },

  // Bottom Fixed Bar (Review Flow: Save Changes)
  reviewBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(133, 139, 148, 1)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  saveChangesButton: {
    height: 48,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveChangesButtonText: {
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },

  // Modal & Add-On Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalBackdropTouch: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    maxHeight: '85%',
  },
  dragHandle: {
    width: 56,
    height: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeaderRow: {
    marginBottom: 16,
    gap: 4,
  },
  modalTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  modalSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  modalScrollContent: {
    gap: 16,
    paddingBottom: 16,
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
    position: 'relative',
    overflow: 'hidden',
  },
  addOnCardSelected: {
    borderColor: 'rgba(0, 8, 20, 0.2)',
  },
  addOnImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  addOnDetails: {
    flex: 1,
    gap: 8,
  },
  addOnTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
    letterSpacing: 0.3,
  },
  addOnPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addOnPrice: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.6,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  discountPriceWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountPriceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  strikethroughLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(96, 96, 102, 0.96)',
  },
  addOnMetaRow: {
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
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  ribbonBadgeContainer: {
    position: 'absolute',
    top: 14,
    right: -24,
    width: 100,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    zIndex: 2,
  },
  ribbonBadge: {
    backgroundColor: 'rgba(242, 233, 218, 0.96)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    width: '100%',
    alignItems: 'center',
  },
  ribbonText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: 'rgba(245, 149, 15, 0.96)',
    letterSpacing: 0.4,
  },
  selectCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  selectCircleSelected: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  actionBtnSelected: {
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 8,
  },
  actionBtnAdd: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
  },
  actionBtnText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  modalBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  modalNextButton: {
    width: 200,
    height: 48,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
