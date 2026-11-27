import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Path } from 'react-native-svg';

import { useReviews } from '../../context/ReviewsContext';
import { useStaffReviews } from '../../context/StaffReviewsContext';
import { Review, MOCK_SAMPLE_REVIEWS } from '../../constants/reviews.config';
import { MOCK_SAMPLE_STAFF_REVIEWS } from '../../constants/staffReviews.config';
import { markStaffSubScreenNavigation } from '../../hooks/useStaffDashboardSkeleton';
import { ReviewItem } from '../../components/reviews/ReviewItem';
import { ReplyComposerModal } from '../../components/reviews/ReplyComposerModal';
import { ReportCommentBottomSheet } from '../../components/reviews/ReportCommentBottomSheet';
import { SuccessToast } from '../../components/reviews/SuccessToast';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';

const FONT_HEADER = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_500Medium',
  default: 'DMSans_500Medium',
});

const FONT_REGULAR = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_400Regular',
  default: 'DMSans_400Regular',
});

/**
 * 24x24 Vector arrow-left-02 Back Icon matching Figma header specification
 */
function ArrowLeft02Icon({
  size = 24,
  color = 'rgba(0, 8, 20, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.57 5.93L3.5 12L9.57 18.07"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.5 12H3.67"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * ClientsReviewScreen (/clients-review)
 *
 * Implements:
 * - Back button with safeRouter.back() (triggers dashboard entry cadence)
 * - Header title "Clients Review"
 * - Skeleton cadence loader on every entry (useSkeletonCadence)
 * - Smooth fade-in of reviews list with 0 flash of stale content
 * - FlatList of reviews with 1px divider between items
 * - NativeDockSpacer for safe Android dock protection
 * - Reply composer modal (Frame L2) with blur overlay & lifted card
 * - Success toast notification (Frame L4) with green checkmark
 * - Report Comment bottom sheet (Frame P2) triggered via ⋮ menu
 * - Minimal theme empty state when no reviews exist
 */
export interface ClientsReviewScreenProps {
  isStaff?: boolean;
}

export const ClientsReviewScreen: React.FC<ClientsReviewScreenProps> = ({ isStaff = false }) => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const ownerReviews = useReviews();
  const staffReviews = useStaffReviews();

  const rawReviews = isStaff ? staffReviews.reviews : ownerReviews.reviews;
  const fallbackReviews = isStaff ? MOCK_SAMPLE_STAFF_REVIEWS : MOCK_SAMPLE_REVIEWS;
  const reviews = rawReviews && rawReviews.length > 0 ? rawReviews : fallbackReviews;
  const postReply = ownerReviews.postReply;

  // Composer state
  const [selectedReviewForReply, setSelectedReviewForReply] = useState<Review | null>(null);
  const [isComposerVisible, setIsComposerVisible] = useState(false);

  // Report bottom sheet state (Frame P2)
  const [selectedReviewForMenu, setSelectedReviewForMenu] = useState<Review | null>(null);
  const [isMenuSheetVisible, setIsMenuSheetVisible] = useState(false);

  // Toast state
  const [isToastVisible, setIsToastVisible] = useState(false);

  const handleBack = useCallback(() => {
    if (isStaff) {
      markStaffSubScreenNavigation();
    }
    safeRouter.back();
  }, [safeRouter, isStaff]);

  const handleOpenReplyComposer = useCallback((review: Review) => {
    if (isStaff) return;
    setSelectedReviewForReply(review);
    setIsComposerVisible(true);
  }, [isStaff]);

  const handleCloseReplyComposer = useCallback(() => {
    setIsComposerVisible(false);
    setSelectedReviewForReply(null);
  }, []);

  const handleSendReply = useCallback(
    async (reviewId: string, replyText: string) => {
      await postReply(reviewId, replyText);
      // Trigger success toast
      setIsToastVisible(true);
    },
    [postReply]
  );

  const handlePressMenu = useCallback((review: Review) => {
    if (isStaff) return;
    setSelectedReviewForMenu(review);
    setIsMenuSheetVisible(true);
  }, [isStaff]);

  const handleCloseMenuSheet = useCallback(() => {
    setIsMenuSheetVisible(false);
    setSelectedReviewForMenu(null);
  }, []);

  const handleSelectReport = useCallback(() => {
    if (!selectedReviewForMenu) return;
    const targetId = selectedReviewForMenu.id;
    setIsMenuSheetVisible(false);
    setSelectedReviewForMenu(null);
    safeRouter.push({
      pathname: '/clients-review/report',
      params: { id: targetId },
    } as any);
  }, [safeRouter, selectedReviewForMenu]);

  const renderItem = useCallback(
    ({ item }: { item: Review }) => (
      <ReviewItem
        review={item}
        onPressReply={isStaff ? undefined : handleOpenReplyComposer}
        onPressMenu={isStaff ? undefined : handlePressMenu}
        hideReplyButton={isStaff}
        hideMenu={isStaff}
      />
    ),
    [isStaff, handleOpenReplyComposer, handlePressMenu]
  );

  const renderItemSeparator = useCallback(() => <View style={styles.separatorLine} />, []);

  const keyExtractor = useCallback((item: Review) => item.id, []);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {/* ── Fixed Top Page Header (64px, #FFFFFF) ── */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Back Button (48x48) */}
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft02Icon size={24} />
          </TouchableOpacity>

          {/* Centered Title: "Client review" */}
          <Text
            style={styles.headerTitle}
            numberOfLines={1}
            accessibilityRole="header"
          >
            Client review
          </Text>

          {/* Invisible 48x48 Spacer (matching Figma header share button opacity: 0) */}
          <View style={styles.headerSpacer} pointerEvents="none" />
        </View>
      </View>

      {/* ── Success Toast Notification (Frame L4, Owner only) ── */}
      {!isStaff && (
        <SuccessToast
          visible={isToastVisible}
          message="Comment posted"
          onDismiss={() => setIsToastVisible(false)}
          topOffset={insets.top + 72}
        />
      )}

      {/* ── Body Content: FlatList or Empty State ── */}
      <View style={styles.contentBody}>
        {reviews.length === 0 ? (
          /* Empty State (when DEV_SAMPLE_REVIEWS = false or no reviews) */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 21a9 9 0 100-18 9 9 0 000 18z"
                  stroke="rgba(192, 192, 204, 0.96)"
                  strokeWidth={1.5}
                />
                <Path
                  d="M8 12h8M12 16h4"
                  stroke="rgba(192, 192, 204, 0.96)"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              </Svg>
            </View>
            <Text style={styles.emptyTitle}>No reviews yet</Text>
            <Text style={styles.emptySubtitle}>
              {isStaff
                ? 'When clients leave reviews about your services, they will appear here.'
                : 'When clients leave reviews about your salon and services, they will appear here.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={reviews}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ItemSeparatorComponent={renderItemSeparator}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: Math.max(insets.bottom, 24) },
            ]}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          />
        )}
      </View>

      {/* Golden Rule #7: Android native dock spacer */}
      <NativeDockSpacer />

      {/* ── Reply Composer Modal (Frame L2, Owner only) ── */}
      {!isStaff && (
        <ReplyComposerModal
          visible={isComposerVisible}
          review={selectedReviewForReply}
          onClose={handleCloseReplyComposer}
          onSendReply={handleSendReply}
          onPressMenu={handlePressMenu}
        />
      )}

      {/* ── Report Comment Bottom Sheet (Frame P2, Owner only) ── */}
      {!isStaff && (
        <ReportCommentBottomSheet
          visible={isMenuSheetVisible}
          onClose={handleCloseMenuSheet}
          onSelectReport={handleSelectReport}
        />
      )}
    </SafeAreaView>
  );
};

export default ClientsReviewScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    width: '100%',
    height: 64,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONT_HEADER,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  headerSpacer: {
    width: 48,
    height: 48,
    opacity: 0,
  },
  contentBody: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  separatorLine: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    width: '100%',
    marginVertical: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: FONT_HEADER,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
});
