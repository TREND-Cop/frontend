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
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Path, Circle } from 'react-native-svg';

import { useNotifications, NotificationItem } from '../../context/NotificationsContext';
import { RadialChart } from '../../components/stats/RadialChart';
import { DeletePostDialog } from '../../components/DeletePostDialog';
import { SuccessToast } from '../../components/reviews/SuccessToast';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import {
  APPROVE_PROGRESS_DURATION_MS,
  DECLINE_PROGRESS_DURATION_MS,
  APPROVE_REDIRECT_DELAY_MS,
  DECLINE_REDIRECT_DELAY_MS,
} from '../../constants/notifications.config';

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
 * 1:1 Figma Checkmark Icon for approved state banner
 */
function ApprovedCheckmarkCircleIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill="rgba(12, 121, 12, 0.96)" />
      <Path
        d="M8.5 12l2.5 2.5 5-5"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface NotificationDetailScreenProps {
  id: string;
}

export const NotificationDetailScreen: React.FC<NotificationDetailScreenProps> = ({ id }) => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { notifications, markAsRead, approveNotification, declineNotification } = useNotifications();

  const item = notifications.find((n) => n.id === id);

  // Mark as read upon opening
  useEffect(() => {
    if (item && !item.read) {
      markAsRead(item.id);
    }
  }, [item?.id]);

  // ── Flow State & Modals ──
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approveProgress, setApproveProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [declineProgress, setDeclineProgress] = useState(0);
  const [declinePhase, setDeclinePhase] = useState<'red' | 'green'>('red');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const animValue = useRef(new Animated.Value(0)).current;

  // Header trash press handler
  const handleTrashPress = () => {
    // TODO: delete behavior not defined in design
  };

  // ── Approve Sequence ──
  const handleApprovePress = () => {
    if (!item) return;
    setIsApproving(true);
    setApproveProgress(0);

    animValue.setValue(0);
    const listener = animValue.addListener(({ value }) => {
      setApproveProgress(Math.round(value));
    });

    Animated.timing(animValue, {
      toValue: 100,
      duration: APPROVE_PROGRESS_DURATION_MS,
      useNativeDriver: false,
    }).start(() => {
      animValue.removeListener(listener);
      setApproveProgress(100);

      // Show toast
      setToastMessage('Media upload approved');
      setToastVisible(true);

      // Approve in store
      approveNotification(item.id);

      // Close modal
      setTimeout(() => {
        setIsApproving(false);
        // Auto-redirect to inbox per user clarification
        setTimeout(() => {
          safeRouter.back();
        }, APPROVE_REDIRECT_DELAY_MS);
      }, 600);
    });
  };

  // ── Decline Sequence ──
  const handleDeclinePress = () => {
    setShowDeclineConfirm(true);
  };

  const handleConfirmDecline = () => {
    setShowDeclineConfirm(false);
    if (!item) return;

    setIsDeleting(true);
    setDeclineProgress(0);
    setDeclinePhase('red');

    animValue.setValue(0);
    const listener = animValue.addListener(({ value }) => {
      setDeclineProgress(Math.round(value));
    });

    Animated.timing(animValue, {
      toValue: 100,
      duration: DECLINE_PROGRESS_DURATION_MS,
      useNativeDriver: false,
    }).start(() => {
      animValue.removeListener(listener);
      setDeclineProgress(100);

      // Turn ring green and show "Notification Deleted" toast (Figma sequence)
      setDeclinePhase('green');
      setToastMessage('Notification Deleted');
      setToastVisible(true);

      // Mark read and save decline status
      declineNotification(item.id);

      // Wait a moment then redirect to inbox
      setTimeout(() => {
        setIsDeleting(false);
        safeRouter.back();
      }, DECLINE_REDIRECT_DELAY_MS);
    });
  };

  const handleOpenViewer = (initialIndex: number) => {
    if (!item) return;
    safeRouter.push({
      pathname: `/notification-viewer/${item.id}`,
      params: { index: initialIndex.toString() },
    } as any);
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

  const isMedia = item.kind === 'media-approval';
  const isApproved = item.status === 'approved';
  const showBottomBar = isMedia && !isApproved;

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* ── Page Header (Figma 390x64, padding 8px 16px) ── */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => safeRouter.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <ArrowLeftIcon size={24} color="#000814" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notification</Text>

        {/* Pressable Red Trash Icon */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleTrashPress}
          style={styles.trashIconButton}
          accessibilityLabel="Delete notification"
        >
          <DeleteTrashIcon size={24} color="#CC2929" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: showBottomBar ? 100 : Math.max(insets.bottom, 24) + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Sender Header Block ── */}
        <View style={isMedia ? styles.mediaSenderBlock : styles.textSenderBlock}>
          {item.senderAvatar ? (
            <Image
              source={
                typeof item.senderAvatar === 'string'
                  ? { uri: item.senderAvatar }
                  : (item.senderAvatar as any)
              }
              style={isMedia ? styles.mediaAvatarImage : styles.textAvatarImage}
              resizeMode="cover"
            />
          ) : (
            <View style={isMedia ? styles.mediaAvatarFallback : styles.textAvatarFallback}>
              <Text style={styles.avatarFallbackText}>
                {item.senderName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.senderTextCol}>
            <Text style={styles.senderTitleText}>
              {isMedia ? 'System Notification' : item.senderName}
            </Text>
            <Text style={styles.senderTimestampText}>
              {item.formattedDate}
            </Text>
          </View>
        </View>

        {/* ── Inline Approved Banner (Frame 2981, 1220) ── */}
        {isApproved && (
          <View style={styles.approvedBanner}>
            <View style={styles.approvedIconCircle}>
              <ApprovedCheckmarkCircleIcon size={24} />
            </View>
            <Text style={styles.approvedBannerText}>Media upload approved</Text>
          </View>
        )}

        {/* ── Text Notification Body ── */}
        {!isMedia && (
          <View style={styles.textBodyContainer}>
            <Text style={styles.textBodyParagraph}>{item.body}</Text>
          </View>
        )}

        {/* ── Media Approval Detail ── */}
        {isMedia && (
          <View style={styles.mediaContainer}>
            {/* Label: Media upload from Anna */}
            <Text style={styles.mediaUploadLabel}>
              Media upload from {item.staffName || 'staff'}
            </Text>

            {/* Row of 4 thumbnails (tap opens viewer at that thumbnail index) */}
            <View style={styles.thumbnailsRow}>
              {(item.images || []).slice(0, 4).map((uri, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  onPress={() => handleOpenViewer(idx)}
                  style={styles.thumbnailFrame}
                >
                  <Image
                    source={typeof uri === 'string' ? { uri } : (uri as any)}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Large Hero Image (358x421px) */}
            {item.images && item.images.length > 0 && (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleOpenViewer(0)}
                style={styles.heroImageFrame}
              >
                <Image
                  source={
                    typeof item.images[0] === 'string'
                      ? { uri: item.images[0] }
                      : (item.images[0] as any)
                  }
                  style={styles.heroImage}
                  resizeMode="cover"
                />

                {/* Real position badge: 1 / N */}
                <View style={styles.heroPositionBadge}>
                  <Text style={styles.heroPositionBadgeText}>
                    1 / {item.images.length}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* ── Fixed Bottom Bar for Media Approval (Frame 1000006530) ── */}
      {showBottomBar && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
          {/* Decline Upload (Light red pill button) */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleDeclinePress}
            style={styles.declineButton}
          >
            <Text style={styles.declineButtonText}>Decline upload</Text>
          </TouchableOpacity>

          {/* Approve Upload (Dark pill button) */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleApprovePress}
            style={styles.approveButton}
          >
            <Text style={styles.approveButtonText}>Approve upload</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Decline Confirmation Dialog (Frame 1224, 1245) ── */}
      <DeletePostDialog
        visible={showDeclineConfirm}
        title="Decline Post?"
        description="Are you sure you want to decline this post?"
        confirmText="Yes, Decline"
        cancelText="Cancel"
        confirmVariant="lightRed"
        cancelVariant="dark"
        onConfirm={handleConfirmDecline}
        onCancel={() => setShowDeclineConfirm(false)}
      />

      {/* ── Approve Progress Ring Modal (Frame 1763, 1245 & 2302, 1245) ── */}
      <Modal visible={isApproving} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.progressModalBackdrop}>
          <View style={styles.progressCard}>
            <RadialChart
              size={145}
              ringThickness={14}
              progress={approveProgress}
              trackColor="#D9D9D9"
              progressColor="#41DF21"
              centerContent={
                <Text style={styles.progressPercentText}>{approveProgress}%</Text>
              }
            />
            <Text style={styles.progressLabelGreen}>
              {approveProgress >= 100 ? 'Uploaded' : 'Uploading...'}
            </Text>
          </View>
        </View>
      </Modal>

      {/* ── Decline Deleting Progress Ring Modal (Frame 695, 2889 -> 1555, 2889) ── */}
      <Modal visible={isDeleting} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.progressModalBackdrop}>
          <View style={styles.progressCard}>
            <RadialChart
              size={145}
              ringThickness={14}
              progress={declineProgress}
              trackColor="#D9D9D9"
              progressColor={declinePhase === 'green' ? '#41DF21' : '#DF2121'}
              centerContent={
                <Text style={styles.progressPercentText}>{declineProgress}%</Text>
              }
            />
            <Text
              style={
                declinePhase === 'green'
                  ? styles.progressLabelGreen
                  : styles.progressLabelRed
              }
            >
              {declineProgress >= 100 ? 'Deleted' : 'Deleting...'}
            </Text>
          </View>
        </View>
      </Modal>

      {/* ── Top Toast Indicator ── */}
      <SuccessToast
        visible={toastVisible}
        message={toastMessage}
        duration={2500}
        onDismiss={() => setToastVisible(false)}
      />

      {/* Android Dock Spacer Barrier */}
      <NativeDockSpacer />
    </SafeAreaView>
  );
};

export default NotificationDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    width: '100%',
    height: 64,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F7F7',
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
    color: '#000814',
    textAlign: 'center',
  },
  trashIconButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightSpacer: {
    width: 48,
    height: 48,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    color: '#606066',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  // Text notification sender block (Frame 978, 134)
  textSenderBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  textAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F2F5',
  },
  textAvatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Media notification sender block (Frame 1474, 134)
  mediaSenderBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  mediaAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F2F5',
  },
  mediaAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 18,
    color: '#000814',
  },
  senderTextCol: {
    flex: 1,
    gap: 4,
  },
  senderTitleText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#000814',
  },
  senderTimestampText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    color: '#606066',
  },
  // Approved State Banner (Frame 2981, 1220)
  approvedBanner: {
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 16,
    marginBottom: 20,
  },
  approvedIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approvedBannerText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#0C790C',
  },
  // Text Body
  textBodyContainer: {
    width: '100%',
  },
  textBodyParagraph: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#000814',
  },
  // Media details
  mediaContainer: {
    width: '100%',
  },
  mediaUploadLabel: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    color: '#000814',
    marginBottom: 16,
  },
  thumbnailsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  thumbnailFrame: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F0F2F5',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  heroImageFrame: {
    width: '100%',
    height: 421,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F0F2F5',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPositionBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPositionBadgeText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    color: '#000814',
  },
  // Fixed Bottom Bar (Frame 1000006530: 390x64)
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F7F7F7',
  },
  declineButton: {
    width: '45%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: '#C0C0CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#CC2929',
  },
  approveButton: {
    width: '50%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  // Progress modal
  progressModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  progressCard: {
    width: 326,
    height: 244,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  progressPercentText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 32,
    color: '#000000',
    textAlign: 'center',
  },
  progressLabelGreen: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#0C790C',
    textAlign: 'center',
  },
  progressLabelRed: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#CC2929',
    textAlign: 'center',
  },
});
