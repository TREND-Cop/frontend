import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Review } from '../../constants/reviews.config';
import { formatReviewTimestamp } from '../../utils/reviewFormatters';
import { useProviderOnboarding } from '../../context/ProviderOnboardingContext';
import {
  ClientAvatar,
  BusinessAvatar,
  ClientVerifiedBadge,
  BusinessVerifiedBadge,
} from './ReviewBody';

const FONT_REGULAR = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_400Regular',
  default: 'DMSans_400Regular',
});

const FONT_MEDIUM = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_500Medium',
  default: 'DMSans_500Medium',
});

/**
 * 24x24 Three Vertical Dots (⋮) Icon
 */
function EllipsisVerticalIcon({
  size = 24,
  color = '#141B34',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="6" r="1.5" fill={color} />
      <Circle cx="12" cy="12" r="1.5" fill={color} />
      <Circle cx="12" cy="18" r="1.5" fill={color} />
    </Svg>
  );
}

export interface ReviewItemProps {
  review: Review;
  onPressReply?: (review: Review) => void;
  onPressMenu?: (review: Review) => void;
  hideReplyButton?: boolean;
}

/**
 * ReviewItem Component
 * Renders complete review item with client row, ⋮ menu, text, photos, footer with timestamp & Reply pill,
 * and threaded business reply when reply exists.
 */
export const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  onPressReply,
  onPressMenu,
  hideReplyButton = false,
}) => {
  const { businessName } = useProviderOnboarding();
  const displayBusinessName = businessName?.trim() || 'Luminous lux';

  const hasReply = Boolean(review.reply);

  return (
    <View style={styles.container}>
      {/* ── Client Review Section ── */}
      <View style={styles.clientSection}>
        {/* Left: Avatar */}
        <ClientAvatar
          photoUri={review.client.photoUri}
          name={review.client.name}
        />

        {/* Right: Message Content */}
        <View style={styles.contentColumn}>
          {/* Top Row: Name, Badge, and ⋮ Menu Button */}
          <View style={styles.topNameRow}>
            <View style={styles.nameAndBadge}>
              <Text
                style={styles.clientName}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {review.client.name}
              </Text>
              {review.client.isVerified && <ClientVerifiedBadge size={20} />}
            </View>

            {/* ⋮ Menu Button (Hit area >= 44x44, stub for Prompt 2) */}
            <TouchableOpacity
              style={styles.menuButton}
              activeOpacity={0.7}
              onPress={() => onPressMenu?.(review)}
              accessibilityRole="button"
              accessibilityLabel={`More options for ${review.client.name}'s review`}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <EllipsisVerticalIcon size={24} />
            </TouchableOpacity>
          </View>

          {/* Review Text */}
          <Text style={styles.reviewText}>{review.text}</Text>

          {/* Photo Thumbnails (if any) */}
          {review.images && review.images.length > 0 && (
            <View style={styles.photosRow}>
              {review.images.map((img, idx) => {
                const source = typeof img === 'string' ? { uri: img } : img;
                return (
                  <View key={`img-${idx}`} style={styles.thumbnailContainer}>
                    {/* TODO (Asset): Export client review photo thumbnails from Figma */}
                    <Image
                      source={source}
                      style={styles.thumbnailImage}
                      resizeMode="cover"
                    />
                  </View>
                );
              })}
            </View>
          )}

          {/* Footer Row: Timestamp at left, Reply pill at right (only if no reply) */}
          <View style={styles.footerRow}>
            <Text style={styles.timestamp}>
              {formatReviewTimestamp(review.createdAt)}
            </Text>

            {!hasReply && !hideReplyButton && (
              <TouchableOpacity
                style={styles.replyButton}
                activeOpacity={0.8}
                onPress={() => onPressReply?.(review)}
                accessibilityRole="button"
                accessibilityLabel={`Reply to ${review.client.name}`}
              >
                <Text style={styles.replyButtonText}>Reply</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* ── Threaded Business Reply Section (when reply exists) ── */}
      {hasReply && review.reply && (
        <View style={styles.replySection}>
          {/* Vertical Thread Connector Line */}
          <View style={styles.connectorLine} />

          {/* Business Row */}
          <View style={styles.businessRow}>
            <BusinessAvatar />

            <View style={styles.businessContentColumn}>
              {/* Business Name and Verified Shield Badge */}
              <View style={styles.nameAndBadge}>
                <Text
                  style={styles.businessName}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {displayBusinessName}
                </Text>
                <BusinessVerifiedBadge size={20} />
              </View>

              {/* Reply Text */}
              <Text style={styles.replyText}>{review.reply.text}</Text>

              {/* Reply Timestamp */}
              <Text style={styles.timestamp}>
                {formatReviewTimestamp(review.reply.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ReviewItem;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  clientSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    width: '100%',
  },
  contentColumn: {
    flex: 1,
    gap: 12,
  },
  topNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 28,
  },
  nameAndBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  clientName: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
    flexShrink: 1,
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginRight: -10,
  },
  reviewText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  photosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 2,
    marginBottom: 2,
  },
  thumbnailContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E5E5EA',
  },
  thumbnailImage: {
    width: 40,
    height: 40,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 32,
    marginTop: 2,
  },
  timestamp: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  replyButton: {
    height: 32,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
  },
  replyButtonText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  replySection: {
    position: 'relative',
    marginTop: 12,
    width: '100%',
  },
  connectorLine: {
    position: 'absolute',
    left: 15.5,
    top: -12,
    bottom: 24,
    width: 1,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },
  businessRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    width: '100%',
  },
  businessContentColumn: {
    flex: 1,
    gap: 12,
  },
  businessName: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
    flexShrink: 1,
  },
  replyText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
});
