import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { ShareIcon } from '../../components/ShareIcon';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { previewStore } from '../../utils/previewStore';
import { shareStore } from '../../utils/shareStore';

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

function StarGoldIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1 1 5.79L10 14.77l-5.21 2.74 1-5.79-4.21-4.1 5.82-.85L10 1.5z"
        fill="rgba(245, 149, 15, 0.96)"
      />
    </Svg>
  );
}

function StarHalfGoldIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1 1 5.79L10 14.77V1.5z"
        fill="rgba(245, 149, 15, 0.96)"
      />
      <Path
        d="M10 14.77l-5.21 2.74 1-5.79-4.21-4.1 5.82-.85L10 1.5v13.27z"
        fill="rgba(235, 235, 245, 0.96)"
      />
    </Svg>
  );
}

interface ReviewItem {
  id: string;
  name: string;
  avatar: any;
  comment: string;
  stars: number;
  hasHalfStar: boolean;
  time: string;
  date: string;
  attachments?: any[];
}

export function ProviderStaffReviewsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const staffName = (params.name as string) || 'Godwin Thomas';
  const firstName = staffName.split(' ')[0] || 'Godwin';
  const headerTitle = (params.title as string) || `${firstName} Reviews`;

  const reviewsList: ReviewItem[] = [
    {
      id: '1',
      name: 'Samuel Obanuju',
      avatar: require('../../../assets/images/profile/samuel_obanuju_avatar.png'),
      comment: 'The service was premium, love the good work guys keep it up.',
      stars: 4,
      hasHalfStar: true,
      time: '12:04:20',
      date: '12/02/2026',
    },
    {
      id: '2',
      name: 'Jessica Amadi',
      avatar: require('../../../assets/images/profile/samuel_obanuju_avatar.png'),
      comment: 'The service was premium, love the good work guys keep it up.',
      stars: 4,
      hasHalfStar: true,
      time: '12:04:20',
      date: '12/02/2026',
    },
    {
      id: '3',
      name: 'Fabulous Jude',
      avatar: require('../../../assets/images/profile/samuel_obanuju_avatar.png'),
      comment: 'The service was premium, love the good work guys keep it up.',
      stars: 5,
      hasHalfStar: false,
      time: '12:04:20',
      date: '12/02/2026',
    },
    {
      id: '4',
      name: 'Chinedu Eze',
      avatar: require('../../../assets/images/profile/samuel_obanuju_avatar.png'),
      comment: 'The service was premium, love the good work guys keep it up.',
      stars: 5,
      hasHalfStar: false,
      time: '12:04:20',
      date: '12/02/2026',
    },
  ];

  const handlePreviewAttachment = (attachments: any[], index: number) => {
    previewStore.setPreviewImages(attachments, 'Review Photos', undefined, index);
    router.push({
      pathname: '/gallery-preview' as any,
      params: { index, initialIndex: index, source: 'review', title: 'Review Photos' },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── 1:1 Figma Header ── */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft02Icon size={24} color="rgba(0, 8, 20, 0.96)" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>{headerTitle}</Text>

        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() =>
            shareStore.openShare({
              title: headerTitle,
              status: 'Available',
              statusColor: 'rgba(12, 121, 12, 0.96)',
              url: `https://trend.app/provider/staff/reviews`,
            })
          }
        >
          <ShareIcon size={24} color="#141B34" />
        </TouchableOpacity>
      </View>

      {/* ── Reviews List ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
      >
        {reviewsList.map((review) => (
          <View key={review.id} style={styles.reviewItem}>
            {/* Avatar */}
            <Image source={review.avatar} style={styles.reviewerAvatar} resizeMode="cover" />

            {/* Content Column */}
            <View style={styles.reviewContent}>
              {/* Name & Stars Row */}
              <View style={styles.nameRatingRow}>
                <Text style={styles.reviewerName}>{review.name}</Text>

                <View style={styles.rightRating}>
                  <View style={styles.metaDot} />
                  <View style={styles.starsRow}>
                    {Array.from({ length: review.stars }).map((_, i) => (
                      <StarGoldIcon key={i} size={16} />
                    ))}
                    {review.hasHalfStar && <StarHalfGoldIcon size={16} />}
                  </View>
                </View>
              </View>

              {/* Comment */}
              <Text style={styles.reviewComment}>{review.comment}</Text>

              {/* Attachments (if any) */}
              {review.attachments && review.attachments.length > 0 && (
                <View style={styles.reviewAttachmentsRow}>
                  {review.attachments.map((attImg, attIdx) => (
                    <React.Fragment key={attIdx}>
                      {attIdx > 0 && <View style={styles.reviewAttachmentDivider} />}
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.reviewAttachmentWrapper}
                        onPress={() => handlePreviewAttachment(review.attachments!, attIdx)}
                      >
                        <Image source={attImg} style={styles.reviewAttachmentImage} resizeMode="cover" />
                      </TouchableOpacity>
                    </React.Fragment>
                  ))}
                </View>
              )}

              {/* Date & Time Row */}
              <View style={styles.dateTimeRow}>
                <Text style={styles.dateTimeText}>{review.date}</Text>
                <View style={styles.metaDot} />
                <Text style={styles.dateTimeText}>{review.time}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <NativeDockSpacer />
    </SafeAreaView>
  );
}

export default ProviderStaffReviewsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  iconButton: {
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
  },
  reviewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  reviewContent: {
    flex: 1,
    gap: 10,
  },
  nameRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewerName: {
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    lineHeight: 22,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  rightRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D9D9D9',
  },
  reviewComment: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(96, 96, 102, 0.96)',
    marginTop: 2,
    marginBottom: 2,
  },
  reviewAttachmentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 4,
  },
  reviewAttachmentWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    overflow: 'hidden',
  },
  reviewAttachmentImage: {
    width: '100%',
    height: '100%',
  },
  reviewAttachmentDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  dateTimeText: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(96, 96, 102, 0.96)',
  },
});
