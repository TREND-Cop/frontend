import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { SafeImage } from './ui/SafeImage';

import { useRouter } from 'expo-router';
import { useBookmarkStore } from '../utils/bookmarkStore';
import { typography } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SHEET_HEIGHT = 472;

// ── Close X Icon ──
const CloseXIcon = ({ size = 18, color = '#141B34' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Heart Badge Icon with crisp border ──
const HeartBadgeIcon = ({ size = 26 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="rgba(204, 41, 41, 0.95)"
      stroke="#FFFFFF"
      strokeWidth={2}
      strokeLinejoin="round"
    />
  </Svg>
);

export interface BookmarkBottomSheetModalProps {
  visible?: boolean;
  onClose?: () => void;
  onOpenWishlist?: () => void;
  serviceName?: string;
  images?: any[];
}

export const BookmarkBottomSheetModal: React.FC<BookmarkBottomSheetModalProps> = ({
  visible: propVisible,
  onClose: propOnClose,
  onOpenWishlist: propOnOpenWishlist,
  serviceName: propServiceName,
  images: propImages,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const store = useBookmarkStore();

  const isVisible = propVisible !== undefined ? propVisible : store.isOpen;
  const serviceName = propServiceName || store.options.serviceName || 'Service';
  const images = (propImages && propImages.length > 0) ? propImages : store.options.images;
  const isSingleImage = !images || images.length <= 1;
  const singleImg = (images && images[0]) || require('../../assets/images/profile/men_braids.jpg');

  const handleClose = () => {
    if (propOnClose) propOnClose();
    store.closeBookmark();
  };

  const handleOpenWishlist = () => {
    if (propOnOpenWishlist) {
      propOnOpenWishlist();
    } else {
      router.push('/wishlist' as any);
    }
  };

  // Animation drivers
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  // Individual image animation drivers
  const centerImageScale = useRef(new Animated.Value(0.5)).current;
  const centerImageTranslateY = useRef(new Animated.Value(24)).current;
  const centerImageOpacity = useRef(new Animated.Value(0)).current;

  const leftImageTranslateX = useRef(new Animated.Value(30)).current;
  const leftImageTranslateY = useRef(new Animated.Value(15)).current;
  const leftImageScale = useRef(new Animated.Value(0.6)).current;
  const leftImageOpacity = useRef(new Animated.Value(0)).current;

  const rightImageTranslateX = useRef(new Animated.Value(-30)).current;
  const rightImageTranslateY = useRef(new Animated.Value(15)).current;
  const rightImageScale = useRef(new Animated.Value(0.6)).current;
  const rightImageOpacity = useRef(new Animated.Value(0)).current;

  const heartScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Reset values
      backdropAnim.setValue(0);
      sheetTranslateY.setValue(SHEET_HEIGHT);
      centerImageScale.setValue(0.5);
      centerImageTranslateY.setValue(24);
      centerImageOpacity.setValue(0);

      leftImageTranslateX.setValue(30);
      leftImageTranslateY.setValue(15);
      leftImageScale.setValue(0.6);
      leftImageOpacity.setValue(0);

      rightImageTranslateX.setValue(-30);
      rightImageTranslateY.setValue(15);
      rightImageScale.setValue(0.6);
      rightImageOpacity.setValue(0);

      heartScale.setValue(0);

      // Slide up bottom sheet
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();

      // If single image (e.g. from homescreen service cards), animate single card & heart
      if (isSingleImage) {
        setTimeout(() => {
          Animated.parallel([
            Animated.spring(centerImageScale, {
              toValue: 1,
              friction: 6,
              tension: 55,
              useNativeDriver: true,
            }),
            Animated.spring(centerImageTranslateY, {
              toValue: 0,
              friction: 6,
              tension: 55,
              useNativeDriver: true,
            }),
            Animated.timing(centerImageOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();

          // Heart badge pops in after single image settles
          setTimeout(() => {
            Animated.spring(heartScale, {
              toValue: 1,
              friction: 4,
              tension: 60,
              useNativeDriver: true,
            }).start();
          }, 180);
        }, 100);
      } else {
        // Trigger 3 images entrance animation with staggered spring fan-out (for multi-image packages)
        setTimeout(() => {
          // 1. Center Image pops up
          Animated.parallel([
            Animated.spring(centerImageScale, {
              toValue: 1,
              friction: 6,
              tension: 55,
              useNativeDriver: true,
            }),
            Animated.spring(centerImageTranslateY, {
              toValue: 0,
              friction: 6,
              tension: 55,
              useNativeDriver: true,
            }),
            Animated.timing(centerImageOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();

          // 2. Left Image fans out to the left
          Animated.parallel([
            Animated.spring(leftImageTranslateX, {
              toValue: 0,
              friction: 5,
              tension: 45,
              useNativeDriver: true,
            }),
            Animated.spring(leftImageTranslateY, {
              toValue: 0,
              friction: 5,
              tension: 45,
              useNativeDriver: true,
            }),
            Animated.spring(leftImageScale, {
              toValue: 1,
              friction: 5,
              tension: 45,
              useNativeDriver: true,
            }),
            Animated.timing(leftImageOpacity, {
              toValue: 1,
              duration: 220,
              useNativeDriver: true,
            }),
          ]).start();

          // 3. Right Image fans out to the right
          Animated.parallel([
            Animated.spring(rightImageTranslateX, {
              toValue: 0,
              friction: 5,
              tension: 45,
              useNativeDriver: true,
            }),
            Animated.spring(rightImageTranslateY, {
              toValue: 0,
              friction: 5,
              tension: 45,
              useNativeDriver: true,
            }),
            Animated.spring(rightImageScale, {
              toValue: 1,
              friction: 5,
              tension: 45,
              useNativeDriver: true,
            }),
            Animated.timing(rightImageOpacity, {
              toValue: 1,
              duration: 220,
              useNativeDriver: true,
            }),
          ]).start();

          // 4. Heart badge pops in after images settle
          setTimeout(() => {
            Animated.spring(heartScale, {
              toValue: 1,
              friction: 4,
              tension: 60,
              useNativeDriver: true,
            }).start();
          }, 220);
        }, 100);
      }
    }
  }, [isVisible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SHEET_HEIGHT,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      handleClose();
    });
  };

  const handlePressOpenWishlist = () => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SHEET_HEIGHT,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      handleClose();
      handleOpenWishlist();
    });
  };

  if (!isVisible) return null;

  // Resolve 3 distinct images with graceful fallbacks
  const img1 = images[0] || require('../../assets/images/profile/men_braids.jpg');
  const img2 = images[1] || require('../../assets/images/services/men_haircut.png');
  const img3 = images[2] || require('../../assets/images/profile/30b9a5ab22324bd8357f666111d5584ad2e3c83e.jpg');

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={handleDismiss}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        {/* Backdrop Tap Target */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.45],
              }),
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleDismiss}
          />
        </Animated.View>

        {/* Sliding Half-Screen Sheet */}
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              paddingBottom: Math.max(insets.bottom, 24),
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
        >
          {/* Top Right Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            activeOpacity={0.7}
            onPress={handleDismiss}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <CloseXIcon size={18} color="#141B34" />
          </TouchableOpacity>

          {/* Animated Image(s): Single Image for Home screen adds, 3-Cluster for multi-photo packages */}
          {isSingleImage ? (
            <View style={styles.singleImageContainer}>
              <Animated.View
                style={[
                  styles.singleImageWrapper,
                  {
                    opacity: centerImageOpacity,
                    transform: [
                      { scale: centerImageScale },
                      { translateY: centerImageTranslateY },
                    ],
                  },
                ]}
              >
                <SafeImage source={singleImg} style={styles.cardImage} resizeMode="cover" />

                {/* Heart Badge anchored at bottom right of the single image */}
                <Animated.View
                  style={[
                    styles.heartBadgeWrapperSingle,
                    {
                      transform: [{ scale: heartScale }],
                    },
                  ]}
                >
                  <HeartBadgeIcon size={28} />
                </Animated.View>
              </Animated.View>
            </View>
          ) : (
            <View style={styles.clusterContainer}>
              {/* 1. Top Center Image */}
              <Animated.View
                style={[
                  styles.topCenterImageWrapper,
                  {
                    opacity: centerImageOpacity,
                    transform: [
                      { scale: centerImageScale },
                      { translateY: centerImageTranslateY },
                    ],
                  },
                ]}
              >
                <SafeImage source={img1} style={styles.cardImage} resizeMode="cover" />
              </Animated.View>

              {/* 2. Bottom Left Image (overlaps bottom left of top center) */}
              <Animated.View
                style={[
                  styles.bottomLeftImageWrapper,
                  {
                    opacity: leftImageOpacity,
                    transform: [
                      { scale: leftImageScale },
                      { translateX: leftImageTranslateX },
                      { translateY: leftImageTranslateY },
                    ],
                  },
                ]}
              >
                <SafeImage source={img2} style={styles.cardImage} resizeMode="cover" />
              </Animated.View>

              {/* 3. Bottom Right Image (overlaps bottom right of top center) */}
              <Animated.View
                style={[
                  styles.bottomRightImageWrapper,
                  {
                    opacity: rightImageOpacity,
                    transform: [
                      { scale: rightImageScale },
                      { translateX: rightImageTranslateX },
                      { translateY: rightImageTranslateY },
                    ],
                  },
                ]}
              >
                <SafeImage source={img3} style={styles.cardImage} resizeMode="cover" />

                {/* Heart Badge anchored at bottom right of right image */}
                <Animated.View
                  style={[
                    styles.heartBadgeWrapper,
                    {
                      transform: [{ scale: heartScale }],
                    },
                  ]}
                >
                  <HeartBadgeIcon size={26} />
                </Animated.View>
              </Animated.View>
            </View>
          )}

          {/* Title & Subtitle: [Service Name] Added To Wishlist */}
          <View style={styles.textContainer}>
            <Text style={styles.serviceTitleText} numberOfLines={1}>
              {serviceName}
            </Text>
            <Text style={styles.addedSubtitleText}>
              Added To Wishlist
            </Text>
          </View>

          {/* Action Button: Open Wishlist */}
          <TouchableOpacity
            style={styles.openWishlistButton}
            activeOpacity={0.88}
            onPress={handlePressOpenWishlist}
          >
            <Text style={styles.openWishlistButtonText}>Open Wishlist</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000814',
  },
  // ── Bottom Sheet Container (Figma: 390px wide, 472px high, radius 24px top) ──
  sheetContainer: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    height: SHEET_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    position: 'relative',
    shadowColor: 'rgba(133, 139, 148, 0.16)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 20,
  },

  // ── Close X Button (Figma: 40x40, bg rgba(247, 247, 247, 0.96), radius 24px, left: 334, top: 16) ──
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  // ── Single Image Container (Home screen adds) ──
  singleImageContainer: {
    width: 140,
    height: 140,
    alignSelf: 'center',
    marginTop: 36,
    marginBottom: 20,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  singleImageWrapper: {
    width: 136,
    height: 136,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(240, 240, 245, 0.9)',
    shadowColor: 'rgba(133, 139, 148, 0.16)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
    position: 'relative',
  },
  heartBadgeWrapperSingle: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    zIndex: 10,
    backgroundColor: 'transparent',
  },

  // ── Cluster Container: Holds the 3 overlapping images (Total width ~260, height ~180) ──
  clusterContainer: {
    width: 260,
    height: 196,
    alignSelf: 'center',
    marginTop: 20,
    position: 'relative',
  },

  // ── 1. Top Center Image (Figma: 112x112, top: 24, radius 24) ──
  topCenterImageWrapper: {
    position: 'absolute',
    width: 112,
    height: 112,
    top: 0,
    left: (260 - 112) / 2, // Exactly 74px centered
    borderRadius: 24,
    overflow: 'hidden',
    zIndex: 1,
    backgroundColor: 'rgba(240, 240, 245, 0.9)',
  },

  // ── 2. Bottom Left Image (Figma: 112x112, top: 84, border: 3px solid #FFFFFF, radius 24) ──
  bottomLeftImageWrapper: {
    position: 'absolute',
    width: 112,
    height: 112,
    top: 60,
    left: 4,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    zIndex: 3,
    backgroundColor: 'rgba(240, 240, 245, 0.9)',
    shadowColor: 'rgba(133, 139, 148, 0.16)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 4,
  },

  // ── 3. Bottom Right Image (Figma: 112x112, top: 84, border: 3px solid #FFFFFF, radius 24) ──
  bottomRightImageWrapper: {
    position: 'absolute',
    width: 112,
    height: 112,
    top: 60,
    right: 4,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    zIndex: 4,
    backgroundColor: 'rgba(240, 240, 245, 0.9)',
    shadowColor: 'rgba(133, 139, 148, 0.16)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 5,
  },

  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 21,
  },

  // ── Red Heart Badge on the bottom right of the right image ──
  heartBadgeWrapper: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    zIndex: 10,
    backgroundColor: 'transparent',
  },

  // ── Text Section (Figma: 247x48, top 244, 16px Inter 500, line-height 24px) ──
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 24,
  },
  serviceTitleText: {
    ...typography.bodyMed,
    textTransform: 'capitalize',
    color: '#000000',
    textAlign: 'center',
  },
  addedSubtitleText: {
    ...typography.bodyMed,
    textTransform: 'capitalize',
    color: '#000000',
    textAlign: 'center',
  },

  // ── Filled Action Button: Open Wishlist (Figma: 358x48, radius 24, top 353) ──
  openWishlistButton: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 5,
  },
  openWishlistButtonText: {
    ...typography.button,
    textTransform: 'capitalize',
    color: '#FFFFFF',
  },
});
