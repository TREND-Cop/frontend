import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, Star, Check } from 'lucide-react-native';
import { SafeImage } from './ui/SafeImage';
import { ADD_ON_CATALOG, AddOnCatalogItem, getAddOnsForService } from '../constants/addOneCatalog';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface SuggestedAddOnsModalProps {
  visible: boolean;
  basePrice: number;
  serviceId?: string;
  salonId?: string;
  initialSelectedIds?: string[];
  onClose: () => void;
  onConfirm: (selectedIds: string[], totalPrice: number) => void;
}

export function SuggestedAddOnsModal({
  visible,
  basePrice,
  serviceId,
  salonId,
  initialSelectedIds = [],
  onClose,
  onConfirm,
}: SuggestedAddOnsModalProps) {
  const insets = useSafeAreaInsets();
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);

  // Sync initialSelectedIds when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedIds(initialSelectedIds);
    }
  }, [visible, initialSelectedIds]);

  // Retrieve add-on items: prefer catalog for service/salon, fallback to default 4 Quiff/add-on cards
  const addOnItems = React.useMemo(() => {
    let items = getAddOnsForService(serviceId, salonId);
    if (!items || items.length === 0) {
      // Default 4 cards matching the Figma specification & screenshot
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

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedAddOnsTotal = React.useMemo(() => {
    return addOnItems
      .filter((item) => selectedIds.includes(item.id))
      .reduce((sum, item) => sum + item.price, 0);
  }, [addOnItems, selectedIds]);

  const estimatedTotal = basePrice + selectedAddOnsTotal;

  const handleNext = () => {
    onConfirm(selectedIds, estimatedTotal);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        {/* Backdrop touch area to dismiss */}
        <TouchableOpacity
          style={styles.modalBackdropTouch}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* ─── Bottom Sheet Container (Figma: bottom sheet add one screen) ─── */}
        <View style={styles.modalContainer}>
          {/* Top Drag Handle */}
          <View style={styles.dragHandle} />

          {/* ─── Suggested Header (Figma: suggested header) ─── */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Suggested Add-Ons</Text>
            <Text style={styles.headerSubtitle}>
              Select any of the suggested add-ons to spice up your service.
            </Text>
          </View>

          {/* ─── Add-On Cards Scrollable List (Figma: add one) ─── */}
          <ScrollView
            style={styles.cardsScrollView}
            contentContainerStyle={styles.cardsScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {addOnItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const formattedPrice = `₦${item.price.toLocaleString()}`;
              const formattedOriginalPrice = item.originalPrice
                ? `₦${item.originalPrice.toLocaleString()}`
                : '₦41,000';
              const badgeText = item.discountBadge || '10% OFF';

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.addOnCard,
                    isSelected && styles.addOnCardSelected,
                  ]}
                  activeOpacity={0.88}
                  onPress={() => toggleSelection(item.id)}
                >
                  {/* Corner Ribbon / Animation frame holder (Figma: animation frame holder) */}
                  <View style={styles.ribbonContainer} pointerEvents="none">
                    <View style={styles.ribbonBadge}>
                      <Text style={styles.ribbonText}>{badgeText}</Text>
                    </View>
                  </View>

                  {/* Thumbnail Image (Figma: hair cut image frame: 80x80, radius 16) */}
                  <SafeImage
                    source={item.image}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />

                  {/* Details Column (Figma: Frame 1000006082: gap 8px) */}
                  <View style={styles.cardDetails}>
                    {/* Item Name (Figma: Frame 1000006080 / Quiff: 14px 400) */}
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.name}
                    </Text>

                    {/* Price Row (Figma: service price: 16px 500, strikethrough 12px 400) */}
                    <View style={styles.priceRow}>
                      <Text style={styles.priceText}>{formattedPrice}</Text>
                      <View style={styles.discountPriceWrapper}>
                        <Text style={styles.discountPriceText}>
                          {formattedOriginalPrice}
                        </Text>
                      </View>
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
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleSelection(item.id);
                    }}
                  >
                    {isSelected && (
                      <Check size={14} color="#FFFFFF" strokeWidth={2.8} />
                    )}
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ─── Bottom Sticky Action Bar (Figma: price button and indicatro) ─── */}
          <View
            style={[
              styles.bottomBar,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <View style={styles.totalCol}>
              <Text style={styles.estimatedLabel}>Estimated</Text>
              <Text style={styles.totalPriceText}>
                ₦{estimatedTotal.toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.85}
              onPress={handleNext}
            >
              <Text style={styles.actionButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalBackdropTouch: {
    flex: 1,
  },
  // /* bottom sheet add one screen */
  // width: 390px; height: 819px; background: #FFFFFF; border-radius: 24px 24px 0px 0px;
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    width: '100%',
    paddingTop: 8,
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  // /* suggested header */
  // width: 358px; height: 76px; gap: 8px;
  headerContainer: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  // /* Suggested Add-Ons */
  // font-family: 'SF Pro'; font-weight: 510; font-size: 20px; line-height: 28px; letter-spacing: 0.2px; color: #000000;
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
  },
  // /* Select any of the suggested add-ons to spice up your service. */
  // font-family: 'SF Pro'; font-weight: 400; font-size: 14px; line-height: 20px; letter-spacing: 0.4px; color: rgba(96, 96, 102, 0.96);
  headerSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  cardsScrollView: {
    maxHeight: 480,
  },
  cardsScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  // /* add one */
  // padding: 16px; gap: 16px; width: 358px; height: 116px; background: rgba(248, 249, 250, 0.98); border: 1px solid rgba(235, 235, 245, 0.96); border-radius: 24px;
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
    borderColor: 'rgba(0, 8, 20, 0.3)',
  },
  // /* hair cut image frame */
  // width: 80px; height: 80px; border-radius: 16px;
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  // /* Frame 1000006082 */
  // width: 188px; height: 92px; gap: 8px;
  cardDetails: {
    flex: 1,
    gap: 8,
  },
  // /* Quiff */
  // font-family: 'SF Pro'; font-weight: 400; font-size: 14px; line-height: 20px; letter-spacing: 0.4px; color: rgba(96, 96, 102, 0.96);
  cardTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  // /* service price */
  // gap: 10px; height: 24px;
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  // /* ₦8,500 */
  // font-family: 'SF Pro'; font-weight: 510; font-size: 16px; line-height: 24px; letter-spacing: 0.5px; color: rgba(0, 8, 20, 0.96);
  priceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  // /* discount price */
  // font-family: 'SF Pro'; font-weight: 400; font-size: 12px; line-height: 16px; letter-spacing: 0.4px; color: rgba(96, 96, 102, 0.96);
  discountPriceWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountPriceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textDecorationLine: 'line-through',
  },
  // /* Frame 1000006081 */
  // gap: 24px; height: 20px;
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  // /* service duration */ & /* star */
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
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  // /* animation frame holder */
  // position: absolute; width: 125px; height: 24px; background: rgba(246, 240, 230, 0.96); border-radius: 4px; transform: rotate(37deg);
  ribbonContainer: {
    position: 'absolute',
    top: 12,
    right: -28,
    width: 105,
    transform: [{ rotate: '37deg' }],
    alignItems: 'center',
    zIndex: 2,
  },
  ribbonBadge: {
    backgroundColor: 'rgba(246, 240, 230, 0.96)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    width: '100%',
    alignItems: 'center',
  },
  // /* 10% OFF */
  // font-family: 'SF Pro'; font-weight: 510; font-size: 12px; line-height: 16px; letter-spacing: 0.4px; color: rgba(248, 155, 24, 0.96);
  ribbonText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(248, 155, 24, 0.96)',
  },
  // /* checkmark-circle-02 */
  // width: 24px; height: 24px; border: 1.5px solid rgba(192, 192, 204, 0.96);
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
  // /* price button and indicatro */
  // padding: 8px 16px; gap: 16px; background: #FFFFFF; box-shadow: 0px -8px 20px rgba(133, 139, 148, 0.12);
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    shadowColor: '#858B94',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  // /* total */
  // width: 78px; height: 52px; gap: 4px;
  totalCol: {
    justifyContent: 'center',
    gap: 4,
  },
  // /* Estimated */
  // font-family: 'SF Pro'; font-weight: 400; font-size: 14px; line-height: 20px; letter-spacing: 0.4px; color: rgba(96, 96, 102, 0.96);
  estimatedLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  // /* ₦12,700 */
  // font-family: 'SF Pro'; font-weight: 510; font-size: 20px; line-height: 28px; letter-spacing: 0.2px; color: rgba(0, 8, 20, 0.96);
  totalPriceText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  // /* Filled action Button */
  // width: 226px; height: 48px; background: rgba(0, 8, 20, 0.96); border-radius: 24px;
  actionButton: {
    width: 226,
    height: 48,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#858B94',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  // /* Next */
  // font-family: 'Inter'; font-weight: 500; font-size: 16px; line-height: 24px; letter-spacing: 0.15px; color: #FFFFFF;
  actionButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },
});
