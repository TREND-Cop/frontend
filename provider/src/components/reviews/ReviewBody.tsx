import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Image,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

import { Review } from '../../constants/reviews.config';
import { formatReviewTimestamp } from '../../utils/reviewFormatters';

const FONT_REGULAR = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_400Regular',
  default: 'DMSans_400Regular',
});

/**
 * 20x20 Client Blue Circular Checkmark Badge
 */
export function ClientVerifiedBadge({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="10" fill="rgba(26, 130, 255, 0.9)" />
      <Path
        d="M6.5 10l2.5 2.5L14 7.5"
        stroke="#FFFFFF"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 20x20 Business Blue Shield-Check Badge
 */
export function BusinessVerifiedBadge({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 2.5L3.5 5.5v5c0 4.14 2.76 8.02 6.5 9 3.74-.98 6.5-4.86 6.5-9v-5L10 2.5z"
        fill="rgba(26, 130, 255, 0.9)"
      />
      <Path
        d="M7 10l2 2 4-4"
        stroke="#FFFFFF"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 32x32 Client Avatar with photo or neutral user silhouette
 */
export function ClientAvatar({
  photoUri,
  name,
}: {
  photoUri?: string | null;
  name?: string;
}) {
  if (photoUri) {
    const source = typeof photoUri === 'string' ? { uri: photoUri } : photoUri;
    return (
      <View style={styles.avatarCircle}>
        <Image source={source} style={styles.avatarImage} resizeMode="cover" />
      </View>
    );
  }

  return (
    <View style={styles.avatarCircle}>
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Circle
          cx="12"
          cy="8"
          r="4"
          stroke="rgba(192, 192, 204, 0.96)"
          strokeWidth={1.5}
        />
        <Path
          d="M5 20c0-3.5 3.13-6 7-6s7 2.5 7 6"
          stroke="rgba(192, 192, 204, 0.96)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

/**
 * 32x32 Business Avatar (Trend logo placeholder on black circle)
 */
export function BusinessAvatar() {
  return (
    <View style={styles.businessAvatarCircle}>
      {/* TODO (Asset): Export official Trend business circular avatar from Figma */}
      <Text style={styles.businessAvatarText}>T</Text>
    </View>
  );
}

export interface ReviewBodyProps {
  review: Review;
  style?: StyleProp<ViewStyle>;
  hideTimestamp?: boolean;
}

/**
 * Reusable ReviewBody Component (Client avatar, name, badge, text, photos, timestamp)
 * Can be reused in ReviewItem, ReplyComposerModal, and Prompt 2 Report Review.
 */
export const ReviewBody: React.FC<ReviewBodyProps> = ({
  review,
  style,
  hideTimestamp = false,
}) => {
  const { client, text, images, createdAt } = review;

  return (
    <View style={[styles.bodyContainer, style]}>
      {/* Client Avatar (32x32) */}
      <ClientAvatar photoUri={client.photoUri} name={client.name} />

      {/* Info Stack */}
      <View style={styles.infoStack}>
        {/* Name and Verified Badge */}
        <View style={styles.nameAndBadgeRow}>
          <Text
            style={styles.clientName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {client.name}
          </Text>
          {client.isVerified && <ClientVerifiedBadge size={20} />}
        </View>

        {/* Review Text (wraps cleanly without truncation) */}
        <Text style={styles.reviewText}>{text}</Text>

        {/* Photos Row (if any) */}
        {images && images.length > 0 && (
          <View style={styles.photosRow}>
            {images.map((img, idx) => {
              const source = typeof img === 'string' ? { uri: img } : img;
              return (
                <View key={`img-${idx}`} style={styles.photoThumbnail}>
                  {/* TODO (Asset): Client review photo thumbnail */}
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

        {/* Timestamp */}
        {!hideTimestamp && (
          <Text style={styles.timestamp}>
            {formatReviewTimestamp(createdAt)}
          </Text>
        )}
      </View>
    </View>
  );
};

export default ReviewBody;

const styles = StyleSheet.create({
  bodyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    width: '100%',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECECF0',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 32,
    height: 32,
  },
  businessAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessAvatarText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoStack: {
    flex: 1,
    gap: 12,
  },
  nameAndBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  photoThumbnail: {
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
  timestamp: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
});
