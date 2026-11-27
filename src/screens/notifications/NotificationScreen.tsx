import React, { useEffect, useRef, useState, useCallback } from 'react';
import {  View, Text, StyleSheet, TouchableOpacity, Animated, Image, SectionList , Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from 'expo-router';
import { useSafeRouter } from '../../utils/safeNavigation';
import { theme } from '../../constants/theme';
import { MOCK_NOTIFICATIONS } from '../../constants/mockData';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';
import { tabSkeletonStore } from '../../utils/tabSkeletonStore';
import { trendApi, getAuthToken, extractArray } from '../../api/trendApi';

// --- COMPONENTS ---
const NotificationSkeleton = () => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if ((Platform.OS as string) === 'web') return;
    const isNotWeb = (Platform.OS as string) !== 'web';
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: isNotWeb }),
        Animated.timing(fadeAnim, { toValue: 0.3, duration: 1000, useNativeDriver: isNotWeb }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.skeletonCard, { opacity: fadeAnim }]}>
      <View style={styles.skeletonImageContainer}>
        <View style={styles.skeletonImage} />
      </View>
      <View style={styles.skeletonTextContainer}>
        <View style={styles.skeletonLineShort} />
        <View style={styles.skeletonLineLong} />
        <View style={styles.skeletonLineLong} />
      </View>
    </Animated.View>
  );
};

const NotificationItem = ({ item, onPress }: { item: any, onPress: () => void }) => (
  <TouchableOpacity style={styles.notificationItem} activeOpacity={0.7} onPress={onPress}>
    {/* Avatar */}
    <View style={styles.avatarContainer}>
      {item.image ? (
        <Image
          source={typeof item.image === 'string' ? { uri: item.image } : item.image}
          style={styles.avatarImage}
        />
      ) : (
        <View style={styles.avatarInitialsContainer}>
          <Text style={styles.avatarInitials}>{item.initials}</Text>
        </View>
      )}
    </View>
    
    {/* Content */}
    <View style={styles.notificationContent}>
      <View style={styles.notificationHeader}>
        <View>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationTime}>{item.time}</Text>
        </View>
        {item.isUnread && <View style={styles.unreadDot} />}
      </View>
      <Text style={styles.notificationBody} numberOfLines={3}>{item.content}</Text>
    </View>
  </TouchableOpacity>
);

const EMPTY_NOTIFICATIONS_IMAGE = require('../../../assets/images/notifications/empty_notifications.png');

const EmptyState = ({ onEnablePush }: { onEnablePush: () => void }) => (
  <View style={styles.emptyContent}>
    <View style={styles.emptyIllustrationWrapper}>
      <Image
        source={EMPTY_NOTIFICATIONS_IMAGE}
        style={{ width: 150, height: 150 }}
        resizeMode="contain"
      />
    </View>
    <Text style={styles.emptyTitle}>No Notification Yet</Text>
    <Text style={styles.emptySubtitle}>We would notify you when something shows up.</Text>

    <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={onEnablePush}>
      <Text style={styles.actionButtonText}>Enable Push Notification</Text>
    </TouchableOpacity>
  </View>
);

// --- MAIN SCREEN ---
export const NotificationScreen = () => {
  const safeRouter = useSafeRouter();
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [sections, setSections] = useState(MOCK_NOTIFICATIONS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set to true to test empty state
  const isEmpty = false; 

  const hydrateNotifications = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;
      const res = await trendApi.notifications.list();
      if (!res.ok || !res.data) return;
      const items = extractArray<any>(res.data, ['notifications']);
      if (items.length === 0) return;
      const mapped = items.map((n: any, idx: number) => ({
        id: String(n.id || `notif_${idx}`),
        title: n.title || 'TREND',
        content: n.body || n.message || n.content || '',
        time: n.created_at
          ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Now',
        initials: (n.title || 'TR').slice(0, 2).toUpperCase(),
        image: n.image || null,
        isUnread: n.read === false || n.is_read === false || n.read === 0,
      }));
      setSections([{ title: 'Recent', data: mapped }]);
    } catch {
      // Keep fallback sections intact
    }
  }, []);

  const startLoading = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsLoading(true);
    hydrateNotifications();
    timerRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 1400);
  }, [hydrateNotifications]);

  const resetToLoading = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsLoading(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      startLoading();
      return () => {
        resetToLoading();
      };
    }, [startLoading, resetToLoading])
  );

  useEffect(() => {
    if (!navigation) return;

    const unsubFocus = navigation.addListener('focus', () => {
      startLoading();
    });

    const unsubBlur = navigation.addListener('blur', () => {
      resetToLoading();
    });

    const parentNav = navigation.getParent?.();
    const unsubParentFocus = parentNav?.addListener?.('focus', () => {
      if (navigation.isFocused?.()) {
        startLoading();
      }
    });

    const unsubBack = tabSkeletonStore.subscribeBack(() => {
      setTimeout(() => {
        if (navigation.isFocused?.()) {
          startLoading();
        }
      }, 50);
    });

    return () => {
      unsubFocus?.();
      unsubBlur?.();
      unsubParentFocus?.();
      unsubBack?.();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [navigation, startLoading, resetToLoading]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {isLoading ? (
        <View style={styles.loadingContent}>
          <View style={styles.skeletonList}>
            <NotificationSkeleton />
            <NotificationSkeleton />
          </View>
          <Text style={styles.infoText}>
            Stay updated on appointments, promotions, discounts and special offers with push notification.
          </Text>
          <TouchableOpacity style={styles.actionButtonFloating} activeOpacity={0.8}>
            <Text style={styles.actionButtonText}>Enable Push Notification</Text>
          </TouchableOpacity>
        </View>
      ) : isEmpty ? (
        <EmptyState onEnablePush={() => safeRouter.back()} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem 
              item={item} 
              onPress={() => {
                getAuthToken()
                  .then((token) => (token ? trendApi.notifications.markRead(item.id) : null))
                  .catch(() => {});
                safeRouter.push(`/notifications/${item.id}`);
              }} 
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}
      <NativeDockSpacer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Loading Styles
  loadingContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
    alignItems: 'center',
  },
  skeletonList: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    marginBottom: 80,
  },
  skeletonCard: {
    width: '100%',
    maxWidth: 358,
    height: 84,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    shadowColor: '#858B94',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
  },
  skeletonImageContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#EBEBEB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  skeletonImage: {
    width: 24,
    height: 24,
    backgroundColor: '#D9D9D9',
    borderRadius: 4,
  },
  skeletonTextContainer: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
  },
  skeletonLineShort: {
    width: 62,
    height: 10,
    backgroundColor: '#D9D9D9',
    borderRadius: 4,
    marginBottom: 3,
  },
  skeletonLineLong: {
    width: '90%',
    height: 10,
    backgroundColor: '#D9D9D9',
    borderRadius: 4,
  },
  infoText: {
    ...theme.typography.bodyRegular,
    color: theme.colors.barberPrimarySupport,
    textAlign: 'center',
    letterSpacing: 0.4,
    maxWidth: 358,
    lineHeight: 24,
  },
  actionButtonFloating: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    backgroundColor: theme.colors.barberPrimary,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 50,
  },
  
  // Empty State Styles
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  emptyIllustrationWrapper: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    ...theme.typography.h2Med,
    color: '#000000',
    lineHeight: 28,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...theme.typography.bodyRegular,
    color: theme.colors.barberPrimarySupport,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 36,
  },
  actionButton: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    backgroundColor: theme.colors.barberPrimary,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    ...theme.typography.button,
    color: '#FFFFFF',
    textTransform: 'capitalize',
    letterSpacing: 0.15,
  },
  
  // List Styles
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionHeader: {
    ...theme.typography.h2Med,
    fontSize: 18,
    color: '#000000',
    marginTop: 16,
    marginBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarInitialsContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    ...theme.typography.bodyMed,
    color: '#000000',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  notificationTitle: {
    ...theme.typography.bodyMed,
    color: '#000000',
    marginBottom: 2,
  },
  notificationTime: {
    ...theme.typography.caption,
    color: theme.colors.barberPrimarySupport,
    fontSize: 11,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.dangerVibrant, // '#CC292B' (Red dot)
    marginTop: 4,
  },
  notificationBody: {
    ...theme.typography.bodyRegular,
    color: theme.colors.barberPrimarySupport,
    fontSize: 14,
    lineHeight: 20,
  },
});
