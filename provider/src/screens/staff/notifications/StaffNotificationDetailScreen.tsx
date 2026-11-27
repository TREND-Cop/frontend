import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Animated,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../../utils/safeNavigation';
import Svg, { Path } from 'react-native-svg';

import { useStaffNotifications } from '../../../context/StaffNotificationsContext';
import { RadialChart } from '../../../components/stats/RadialChart';
import { DeletePostDialog } from '../../../components/DeletePostDialog';
import { SuccessToast } from '../../../components/reviews/SuccessToast';
import { NativeDockSpacer } from '../../../components/NativeDockSpacer';
import { STAFF_ROUTES } from '../../../constants/staffRoutes';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

function ArrowLeftIcon({ size = 24, color = '#000814' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.57 5.93L3.5 12l6.07 6.07"
        stroke={color}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.5 12H3.67"
        stroke={color}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma delete-02 trash icon in header (24x24, #CC2929)
 */
function DeleteTrashIcon({ size = 24, color = '#CC2929' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.5 5.5v14.5a2 2 0 002 2h11a2 2 0 002-2V5.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3 5.5h18"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M8 5.5V3.5a1.5 1.5 0 011.5-1.5h5a1.5 1.5 0 011.5 1.5v2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M9.5 10.5v6"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M14.5 10.5v6"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma Alert Icon (alert-02, 20x20, stroke 1.5px #CC2929)
 */
function AlertTriangleIcon({ size = 20, color = 'rgba(204, 41, 41, 0.9)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 9v4M12 17.5h.01"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface StaffNotificationDetailScreenProps {
  id: string;
}

export const StaffNotificationDetailScreen: React.FC<StaffNotificationDetailScreenProps> = ({ id }) => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { notifications, markAsRead, deleteNotification } = useStaffNotifications();

  const item = notifications.find((n) => n.id === id);

  // Auto mark read upon opening
  useEffect(() => {
    if (item && !item.read) {
      markAsRead(item.id);
    }
  }, [item?.id]);

  // Selected image index for media upload detail (defaults to last or 0)
  const [selectedImageIndex, setSelectedImageIndex] = useState(3);

  // Flow State & Modals
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(35);
  const [deletePhase, setDeletePhase] = useState<'red' | 'green'>('red');
  const [toastVisible, setToastVisible] = useState(false);

  const animValue = useRef(new Animated.Value(35)).current;

  const handleDeletePress = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    if (!item) return;

    setIsDeleting(true);
    setDeleteProgress(35);
    setDeletePhase('red');

    // Phase A: Hold at 35% briefly
    setTimeout(() => {
      animValue.setValue(35);
      const listener = animValue.addListener(({ value }) => {
        setDeleteProgress(Math.round(value));
      });

      // Phase B: Animate to 100% red ring
      Animated.timing(animValue, {
        toValue: 100,
        duration: 900,
        useNativeDriver: false,
      }).start(() => {
        animValue.removeListener(listener);
        setDeleteProgress(100);

        // Phase C: Turn green & show toast "Notification Deleted"
        setDeletePhase('green');
        setToastVisible(true);

        // Remove from store
        deleteNotification(item.id);

        // Phase D: Toast visible, then redirect to inbox
        setTimeout(() => {
          setIsDeleting(false);
          safeRouter.back();
        }, 1200);
      });
    }, 600);
  };

  const handleOpenViewer = (initialIndex: number) => {
    if (!item) return;
    safeRouter.push({
      pathname: STAFF_ROUTES.IMAGE_VIEWER as any,
      params: { id: item.id, index: initialIndex.toString() },
    });
  };

  if (!item) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => safeRouter.back()} style={styles.backButton}>
            <ArrowLeftIcon size={24} color="#000814" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification</Text>
          <View style={styles.headerRightSpacer} />
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Notification not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isMedia = item.kind === 'media-upload-result';
  const images = item.images || [];
  const currentImage = images[selectedImageIndex] || images[0];

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* ── Page Header (Figma 390x64, padding 8px 16px) ── */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => safeRouter.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ArrowLeftIcon size={24} color="#000814" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notification</Text>

        {/* Right Slot: red trash icon for media upload result, invisible spacer for text */}
        {isMedia ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleDeletePress}
            style={styles.trashIconButton}
            accessibilityLabel="Delete notification"
            accessibilityRole="button"
          >
            <DeleteTrashIcon size={24} color="#CC2929" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerRightSpacer} />
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Sender Row ── */}
        <View style={isMedia ? styles.senderRowMedia : styles.senderRowText}>
          {item.senderAvatar ? (
            <Image
              source={typeof item.senderAvatar === 'string' ? { uri: item.senderAvatar } : item.senderAvatar}
              style={isMedia ? styles.senderAvatar40 : styles.senderAvatar56}
              resizeMode="cover"
            />
          ) : (
            <View style={[isMedia ? styles.senderAvatar40 : styles.senderAvatar56, styles.avatarFallback]}>
              <Text style={styles.avatarFallbackText}>
                {item.senderName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.senderTextCol}>
            <Text style={styles.senderNameText} numberOfLines={1}>
              {item.senderName}
            </Text>
            <Text style={styles.senderTimeText}>
              {item.formattedDate}
            </Text>
          </View>
        </View>

        {/* ── SCREEN 4: Text Notification Detail ── */}
        {!isMedia && (
          <View style={styles.textBodyContainer}>
            <Text style={styles.textBodyParagraph}>
              {item.body}
            </Text>
          </View>
        )}

        {/* ── SCREEN 5: Media Upload Declined Detail ── */}
        {isMedia && (
          <View style={styles.mediaContainer}>
            {/* Red Alert Banner: 2-line variant in detail, 1-line variant in deleting progress */}
            <View style={isDeleting ? styles.redBannerOneLine : styles.redBannerTwoLine}>
              <View style={styles.bannerIconCircle}>
                <AlertTriangleIcon size={20} color="rgba(204, 41, 41, 0.9)" />
              </View>
              <Text style={styles.bannerText}>
                {isDeleting
                  ? 'Media upload declined'
                  : 'Media upload declined by business owner'}
              </Text>
            </View>

            {/* Sub-block: Uploader label + Thumbnail strip */}
            <View style={styles.uploaderBlock}>
              <Text style={styles.uploaderLabel}>
                {item.uploaderLabel || 'Media upload from staff'}
              </Text>

              <View style={styles.thumbnailStrip}>
                {images.slice(0, 4).map((imgSource, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.8}
                    onPress={() => setSelectedImageIndex(idx)}
                    style={[
                      styles.thumbnailFrame,
                      selectedImageIndex === idx && styles.thumbnailFrameActive,
                    ]}
                  >
                    <Image
                      source={typeof imgSource === 'string' ? { uri: imgSource } : imgSource}
                      style={styles.thumbnailImg}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Large Image Card (358x421) */}
            {currentImage && (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleOpenViewer(selectedImageIndex)}
                style={styles.largeImageCard}
              >
                <Image
                  source={typeof currentImage === 'string' ? { uri: currentImage } : currentImage}
                  style={styles.largeImage}
                  resizeMode="cover"
                />

                {/* Counter Pill (49x28, top 16px, right 16px) */}
                <View style={styles.counterPill}>
                  <Text style={styles.counterPillText}>
                    {`${selectedImageIndex + 1} / ${images.length || 4}`}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* ── SCREEN 7: Delete Dialog Modal ── */}
      <DeletePostDialog
        visible={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Notification"
        description="Are you sure you want to delete this notification"
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="lightRed"
        cancelVariant="dark"
      />

      {/* ── SCREEN 8: Deleting Progress Ring Modal ── */}
      <Modal
        visible={isDeleting}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.scrimOverlay}>
          {/* Top In-App Action Toast */}
          <SuccessToast
            visible={toastVisible}
            message="Notification Deleted"
            topOffset={Math.max(insets.top, 24) + 16}
          />

          {/* Progress Card (326x244, radius 24) */}
          <View style={styles.progressCard}>
            <RadialChart
              size={145}
              ringThickness={14}
              progress={deleteProgress}
              trackColor="#D9D9D9"
              progressColor={deletePhase === 'green' ? '#41DF21' : '#DF2121'}
              centerContent={
                <Text style={styles.progressPercentText}>{deleteProgress}%</Text>
              }
            />

            <Text
              style={
                deletePhase === 'green'
                  ? styles.progressLabelGreen
                  : styles.progressLabelRed
              }
            >
              {deleteProgress < 100 ? 'Deleting...' : 'Deleted'}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Android dock spacer barrier */}
      <NativeDockSpacer />
    </SafeAreaView>
  );
};

export default StaffNotificationDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  headerRightSpacer: {
    width: 48,
    height: 48,
    opacity: 0,
  },
  trashIconButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  senderRowMedia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  senderRowText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  senderAvatar40: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  senderAvatar56: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    backgroundColor: 'rgba(0, 8, 20, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 18,
    color: '#000814',
    includeFontPadding: false,
  },
  senderTextCol: {
    flex: 1,
    gap: 4,
  },
  senderNameText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  senderTimeText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  textBodyContainer: {
    marginTop: 8,
  },
  textBodyParagraph: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  mediaContainer: {
    gap: 24,
  },
  redBannerTwoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 16,
    backgroundColor: 'rgba(248, 239, 239, 0.96)',
    borderRadius: 16,
    minHeight: 56,
  },
  redBannerOneLine: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 16,
    backgroundColor: 'rgba(248, 239, 239, 0.96)',
    borderRadius: 16,
    height: 52,
  },
  bannerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(204, 41, 41, 0.9)',
    includeFontPadding: false,
  },
  uploaderBlock: {
    gap: 16,
  },
  uploaderLabel: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  thumbnailStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  thumbnailFrame: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F7F7F7',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  thumbnailFrameActive: {
    borderColor: '#000814',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  largeImageCard: {
    width: '100%',
    height: 421,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F7F7F7',
    position: 'relative',
  },
  largeImage: {
    width: '100%',
    height: '100%',
  },
  counterPill: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 49,
    height: 28,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  counterPillText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  scrimOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCard: {
    width: 326,
    height: 244,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  progressPercentText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.1,
    color: '#000000',
    textAlign: 'center',
    includeFontPadding: false,
  },
  progressLabelRed: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(204, 41, 41, 0.9)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  progressLabelGreen: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(12, 121, 12, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
});

