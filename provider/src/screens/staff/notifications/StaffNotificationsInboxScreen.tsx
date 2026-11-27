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
import { useSafeRouter } from '../../../utils/safeNavigation';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

import { useStaffNotifications, StaffNotificationItem } from '../../../context/StaffNotificationsContext';
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

const EMPTY_NOTIFICATIONS_IMAGE = require('../../../../assets/images/notifications/empty_notifications.png');

/**
 * 1:1 Figma Empty Notification Stacked Illustration (150x150px)
 */
function EmptyNotificationIllustration({ size = 150 }: { size?: number }) {
  return (
    <Image
      source={EMPTY_NOTIFICATIONS_IMAGE}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}

function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

function formatDateHeader(timestamp: number): string {
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
  const suffix = getDaySuffix(day);
  const months = [
    'Jan', 'Feb', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${day}${suffix} ${months[date.getMonth()]}, ${date.getFullYear()}.`;
}

interface GroupedNotifications {
  title: string;
  hasUnread: boolean;
  items: StaffNotificationItem[];
}

export const StaffNotificationsInboxScreen: React.FC = () => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { notifications, markAsRead } = useStaffNotifications();

  const groups: GroupedNotifications[] = useMemo(() => {
    if (notifications.length === 0) return [];

    const groupMap: Map<string, StaffNotificationItem[]> = new Map();
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

  const handleNotificationPress = (item: StaffNotificationItem) => {
    markAsRead(item.id);
    safeRouter.push({
      pathname: STAFF_ROUTES.NOTIFICATION_DETAIL as any,
      params: { id: item.id },
    });
  };

  const isEmpty = notifications.length === 0;

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

        {/* Opacity 0 spacer per Figma CSS */}
        <View style={styles.headerRightSpacer} />
      </View>

      {/* ── Content View ── */}
      {isEmpty ? (
        /* SCREEN 2: 1:1 Figma Empty State */
        <View style={styles.emptyContainer}>
          <View style={styles.illustrationWrapper}>
            <EmptyNotificationIllustration size={150} />
          </View>
          <Text style={styles.emptyTitle}>No Notification</Text>
          <Text style={styles.emptySubtitle}>No recorded notification</Text>
        </View>
      ) : (
        /* SCREEN 3: 1:1 Figma Populated Inbox with Groups */
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {groups.map((group) => (
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
                            source={typeof item.senderAvatar === 'string' ? { uri: item.senderAvatar } : item.senderAvatar}
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

                      {/* Item Content: Text Preview or Media Upload Result Preview */}
                      {item.kind === 'text' ? (
                        <Text style={styles.textPreview} numberOfLines={3}>
                          {item.body}
                        </Text>
                      ) : (
                        <View style={styles.mediaPreviewCol}>
                          <Text style={styles.mediaDeniedTitle}>
                            Request Denied
                          </Text>
                          <View style={styles.thumbnailsRow}>
                            {(item.images || []).slice(0, 4).map((imgSource, idx) => (
                              <View key={idx} style={styles.thumbnailFrame}>
                                <Image
                                  source={typeof imgSource === 'string' ? { uri: imgSource } : imgSource}
                                  style={styles.thumbnailImage}
                                  resizeMode="cover"
                                />
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* Divider between items (Line 12x in Figma, 1px solid rgba(235,235,245,0.96)) */}
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

export default StaffNotificationsInboxScreen;

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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: -40,
  },
  illustrationWrapper: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    marginBottom: 8,
    textAlign: 'center',
    includeFontPadding: false,
  },
  emptySubtitle: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
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
    letterSpacing: 0.2,
    color: '#000000',
    includeFontPadding: false,
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
    includeFontPadding: false,
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
    marginBottom: 12,
    gap: 16,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 24,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    color: '#000814',
    includeFontPadding: false,
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
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    marginBottom: 2,
    includeFontPadding: false,
  },
  timestampText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  textPreview: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  mediaPreviewCol: {
    gap: 12,
  },
  mediaDeniedTitle: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(204, 41, 41, 0.9)', // #CC2929 Red Text or Warning
    includeFontPadding: false,
  },
  thumbnailsRow: {
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
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  itemDivider: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginVertical: 4,
  },
});

