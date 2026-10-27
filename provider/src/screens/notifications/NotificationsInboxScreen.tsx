import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

import { useNotifications, NotificationItem } from '../../context/NotificationsContext';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';

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
 * 1:1 Figma Empty Notification Stacked Illustration (150x150px)
 * Frame at (120px, 255px) in (2650, 134)
 */
function EmptyNotificationIllustration({ size = 150 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 150 150" fill="none">
      {/* Background stacked card 1 (tilted left) */}
      <Rect
        x="24"
        y="42"
        width="82"
        height="96"
        rx="16"
        transform="rotate(-10 24 42)"
        fill="#EBEBF5"
        opacity={0.6}
      />
      {/* Foreground card */}
      <Rect
        x="36"
        y="28"
        width="88"
        height="104"
        rx="20"
        fill="#F7F7F7"
        stroke="#EBEBF5"
        strokeWidth="1.5"
      />
      {/* Muted bell icon container */}
      <Circle cx="80" cy="80" r="30" fill="#FFFFFF" />
      <Path
        d="M80 62c-6.627 0-12 5.373-12 12v8.54l-3.4 5.1A2 2 0 0066.26 91h27.48a2 2 0 001.66-3.1L92 82.54V74c0-6.627-5.373-12-12-12z"
        stroke="#C0C0CC"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M75 97a5 5 0 0010 0"
        stroke="#C0C0CC"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Diagonal slash for muted/off indicator */}
      <Path
        d="M66 64l28 32"
        stroke="#C0C0CC"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * Helper to format date header: "Today", "Yesterday", or "2nd May, 2026."
 */
function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

function formatDateHeader(timestamp: number | string): string {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return 'Yesterday';

  const day = date.getDate();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day}${getOrdinalSuffix(day)} ${month}, ${year}.`;
}

interface GroupedNotifications {
  title: string;
  hasUnread: boolean;
  items: NotificationItem[];
}

export const NotificationsInboxScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { notifications, markAsRead } = useNotifications();

  // Group notifications chronologically by computed date header
  const groups: GroupedNotifications[] = useMemo(() => {
    if (notifications.length === 0) return [];

    const groupMap: Map<string, NotificationItem[]> = new Map();
    notifications.forEach((item) => {
      const header = formatDateHeader(item.timestamp);
      const existing = groupMap.get(header) || [];
      existing.push(item);
      groupMap.set(header, existing);
    });

    const result: GroupedNotifications[] = [];
    groupMap.forEach((items, title) => {
      const hasUnread = items.some((it) => !it.read);
      result.push({ title, hasUnread, items });
    });
    return result;
  }, [notifications]);

  const handleNotificationPress = (item: NotificationItem) => {
    markAsRead(item.id);
    router.push(`/notification-detail/${item.id}` as any);
  };

  const isEmpty = notifications.length === 0;

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* ── Page Header (Figma 390x64, padding 8px 16px) ── */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ArrowLeftIcon size={24} color="#000814" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notification</Text>

        {/* Empty state omits trash icon per design slip instructions; inbox maintains balanced 48px spacer */}
        <View style={styles.headerRightSpacer} />
      </View>

      {isEmpty ? (
        /* ── Empty State Screen (Frame 2650, 134) ── */
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIllustrationWrapper}>
            <EmptyNotificationIllustration size={150} />
          </View>
          <Text style={styles.emptyTitle}>No Notification</Text>
          <Text style={styles.emptySubtitle}>No recorded notification</Text>
        </View>
      ) : (
        /* ── Inbox List Screen (Frame 500, 134) ── */
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {groups.map((group, groupIndex) => (
            <View key={group.title} style={styles.groupContainer}>
              {/* Group Title Row */}
              <View style={styles.groupHeaderRow}>
                <Text style={styles.groupTitleText}>{group.title}</Text>
                {/* Red unread dot indicator (Figma Frame 16x16 at 71px, 7px on Today) */}
                {group.hasUnread && (
                  <View style={styles.unreadDotBadge}>
                    <Text style={styles.unreadDotText}>1</Text>
                  </View>
                )}
              </View>

              {/* Group Items */}
              {group.items.map((item, itemIndex) => {
                const isLastInGroup = itemIndex === group.items.length - 1;

                return (
                  <View key={item.id} style={styles.itemWrapper}>
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => handleNotificationPress(item)}
                      style={styles.itemCard}
                    >
                      {/* Notification Header (Avatar + Sender + Time) */}
                      <View style={styles.itemHeader}>
                        {item.senderAvatar ? (
                          <Image
                            source={{ uri: item.senderAvatar }}
                            style={styles.avatarImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.avatarFallback}>
                            <Text style={styles.avatarFallbackText}>
                              {item.senderName.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}

                        <View style={styles.senderInfoCol}>
                          <Text style={styles.senderNameText} numberOfLines={1}>
                            {item.senderName}
                          </Text>
                          <Text style={styles.timestampText}>
                            {item.formattedDate}
                          </Text>
                        </View>
                      </View>

                      {/* Item Content: Text Preview or Media Approval Preview */}
                      {item.kind === 'text' ? (
                        <Text style={styles.textPreview} numberOfLines={2}>
                          {item.body}
                        </Text>
                      ) : (
                        <View style={styles.mediaPreviewCol}>
                          <Text style={styles.mediaApprovalTitle}>
                            Media upload from {item.staffName || 'staff'} requesting approval
                          </Text>
                          <View style={styles.thumbnailsRow}>
                            {(item.images || []).slice(0, 4).map((imgUri, idx) => (
                              <View key={idx} style={styles.thumbnailFrame}>
                                <Image
                                  source={{ uri: imgUri }}
                                  style={styles.thumbnailImage}
                                  resizeMode="cover"
                                />
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* Divider between items (Line 124 in Figma, 1px solid #EBEBF5) */}
                    {!isLastInGroup && <View style={styles.itemDivider} />}
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Android dock spacer barrier */}
      <NativeDockSpacer />
    </SafeAreaView>
  );
};

export default NotificationsInboxScreen;

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
  headerRightSpacer: {
    width: 48,
    height: 48,
  },
  // ── Empty State ──
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  emptyIllustrationWrapper: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#000814',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#606066',
    textAlign: 'center',
  },
  // ── Inbox List ──
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  groupContainer: {
    marginBottom: 24,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  groupTitleText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    color: '#000000',
  },
  unreadDotBadge: {
    width: 16,
    height: 16,
    borderRadius: 24,
    backgroundColor: '#DF4628',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDotText: {
    fontFamily: FONT_REGULAR,
    fontSize: 10,
    lineHeight: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  itemWrapper: {
    width: '100%',
  },
  itemCard: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#F0F2F5',
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    color: '#000814',
  },
  senderInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  senderNameText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#000814',
  },
  timestampText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    color: '#606066',
  },
  textPreview: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#000814',
    paddingLeft: 2,
  },
  mediaPreviewCol: {
    flexDirection: 'column',
    gap: 12,
  },
  mediaApprovalTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    color: '#000814',
  },
  thumbnailsRow: {
    flexDirection: 'row',
    gap: 24,
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
  itemDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#EBEBF5',
    marginVertical: 4,
  },
});
