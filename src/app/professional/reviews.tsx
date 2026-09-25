import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Star, StarHalf } from 'lucide-react-native';
import { ShareIcon } from '../../components/ShareIcon';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';
import { previewStore } from '../../utils/previewStore';
import { SafeImage } from '../../components/ui/SafeImage';
import { shareStore } from '../../utils/shareStore';

export default function BisolaReviewsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const specialistId = (params.id as string) || 'p1';
  const headerTitle =
    (params.title as string) ||
    (params.name ? `${params.name} Reviews` : params.salonName ? `${params.salonName} Review` : 'Reviews');

  const reviewsList = [
    {
      id: '1',
      name: 'Samuel Obanuju',
      avatar: { uri: 'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?w=200&q=80' },
      comment: "The salon was too far and my appointment got rescheduled, that's why am giving a 3.",
      stars: 3,
      hasHalfStar: false,
      attachments: [
        require('../../../assets/images/profile/14dcc3440340f9f140251ac160473457c89b198c.jpg'),
        require('../../../assets/images/profile/30b9a5ab22324bd8357f666111d5584ad2e3c83e.jpg'),
        require('../../../assets/images/profile/eb3281d09659fdef5e45647cf5529f61e83190f1.jpg'),
      ],
      time: '12:04:20',
      date: 'Oct 26, 2026',
    },
    {
      id: '2',
      name: 'Samuel Obanuju',
      avatar: { uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      comment: 'The service was premium, love the good work guys keep it up.',
      stars: 4,
      hasHalfStar: true,
      time: '12:04:20',
      date: '12/02/2026',
    },
    {
      id: '3',
      name: 'Samuel Obanuju',
      avatar: { uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
      comment: 'The service was premium, love the good work guys keep it up.',
      stars: 4,
      hasHalfStar: true,
      time: '12:04:20',
      date: '12/02/2026',
    },
    {
      id: '4',
      name: 'Samuel Obanuju',
      avatar: require('../../../assets/images/lady.jpg'),
      comment: 'The service was premium, love the good work guys keep it up.',
      stars: 4,
      hasHalfStar: true,
      time: '12:04:20',
      date: '12/02/2026',
    },
  ];

  const handlePreviewAttachment = (attachments: any[], index: number) => {
    previewStore.setPreviewImages(attachments, 'Review Photos', undefined, index);
    router.push({
      pathname: '/professional/gallery-preview',
      params: { index, initialIndex: index, source: 'review' },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else if (params.salonId) {
                router.replace(`/salon/${params.salonId}` as any);
              } else {
                router.replace(`/professional/${specialistId}` as any);
              }
            }} 
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} />
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
                url: `https://trend.app/professional/${specialistId}/reviews`,
              })
            }
          >
            <ShareIcon size={24} color="#141B34" />
          </TouchableOpacity>
        </View>

        {/* Reviews List */}
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
          {reviewsList.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              {/* Avatar */}
              <SafeImage source={review.avatar} style={styles.reviewerAvatar} resizeMode="cover" />

              {/* Review Content */}
              <View style={styles.reviewContent}>
                {/* Header Row: Name on Left, Dot & Stars on Right */}
                <View style={styles.nameRatingRow}>
                  <Text style={styles.reviewerName}>{review.name}</Text>
                  
                  <View style={styles.rightRating}>
                    <View style={styles.metaDot} />
                    <View style={styles.starsRow}>
                      {Array.from({ length: review.stars }).map((_, i) => (
                        <Star key={i} size={16} color="rgba(245, 149, 15, 0.96)" fill="rgba(245, 149, 15, 0.96)" />
                      ))}
                      {review.hasHalfStar && (
                        <StarHalf size={16} color="rgba(245, 149, 15, 0.96)" fill="rgba(245, 149, 15, 0.96)" />
                      )}
                    </View>
                  </View>
                </View>

                {/* Review Text */}
                <Text style={styles.reviewComment}>{review.comment}</Text>

                {/* Attached Review Thumbnails (Frame 1000006468) */}
                {review.attachments && review.attachments.length > 0 && (
                  <View style={styles.reviewAttachmentsRow}>
                    {review.attachments.map((attImg, attIdx) => (
                      <React.Fragment key={attIdx}>
                        {attIdx > 0 && <View style={styles.reviewAttachmentDivider} />}
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={styles.reviewAttachmentWrapper}
                          onPress={() => handlePreviewAttachment(review.attachments, attIdx)}
                        >
                          <SafeImage source={attImg} style={styles.reviewAttachmentImage} resizeMode="cover" />
                        </TouchableOpacity>
                      </React.Fragment>
                    ))}
                  </View>
                )}

                {/* Date & Time Row */}
                <View style={styles.dateTimeRow}>
                  {review.attachments ? (
                    <>
                      <Text style={styles.dateTimeText}>{review.time}</Text>
                      <View style={styles.metaDot} />
                      <Text style={styles.dateTimeText}>{review.date}</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.dateTimeText}>{review.date}</Text>
                      <View style={styles.metaDot} />
                      <Text style={styles.dateTimeText}>{review.time}</Text>
                    </>
                  )}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
        <NativeDockSpacer />
      </SafeAreaView>
  );
};

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

  // Review Item
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
