import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { DEV_SAMPLE_NOTIFICATIONS } from '../constants/notifications.config';
import { trendApi, getAuthToken, extractArray } from '../api/trendApi';

export type NotificationKind = 'text' | 'media-approval';
export type MediaApprovalStatus = 'pending' | 'approved' | 'declined';

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  senderName: string;
  senderAvatar?: any;
  timestamp: number; // Unix ms for grouping
  formattedDate: string; // e.g., '12:10pm, 02-03-2026.'
  read: boolean;
  // Text notification properties
  title?: string;
  body?: string;
  // Media approval notification properties
  staffName?: string;
  images?: any[];
  status?: MediaApprovalStatus;
}

export interface NotificationsContextState {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  approveNotification: (id: string) => Promise<void>;
  declineNotification: (id: string) => Promise<void>;
  deleteNotification: (id: string) => void;
}

const sampleAvatars = {
  system: require('../../assets/images/messages/lara_olapade.jpg'),
  freshGlow: require('../../assets/images/messages/chisom_emanuella.jpg'),
  aesthetic: require('../../assets/images/messages/godwin_thomas.jpg'),
  hospital: require('../../assets/images/messages/lara_olapade.jpg'),
};

const sampleMediaImages = [
  require('../../assets/images/portfolio/staff_portfolio_1.png'),
  require('../../assets/images/portfolio/staff_portfolio_2.png'),
  require('../../assets/images/portfolio/staff_portfolio_3.png'),
  require('../../assets/images/portfolio/staff_portfolio_4.png'),
];

// Helper to seed initial sample notifications matching Figma design frames
function createSampleNotifications(): NotificationItem[] {
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  return [
    // Today Section: Media Approval from Anna
    {
      id: 'notif-today-1',
      kind: 'media-approval',
      senderName: 'System Notification',
      senderAvatar: sampleAvatars.system,
      timestamp: now,
      formattedDate: '12:10pm, 02-03-2026.',
      read: false,
      staffName: 'Anna',
      images: sampleMediaImages,
      status: 'pending',
    },
    // Yesterday Section
    {
      id: 'notif-yest-1',
      kind: 'text',
      senderName: 'Fresh Glow',
      senderAvatar: sampleAvatars.freshGlow,
      timestamp: now - ONE_DAY_MS,
      formattedDate: '12:10pm, 02-03-2026.',
      read: true,
      body: 'Lorem ipsum dolor sit amet consectetur. egestas sit at fermentum at ante integer. Ac nulla aliquam rutrum viverra.\n\nNunc ut vel parturient vitae eget sed elit lorem elementum. Lacus fermentum sed et odio posuere mi magna vivamus. At varius imperdiet nunc diam volutpat. Nulla nisi non sed nulla. Mi neque sed sed nam convallis ut. Sem risus facilisis enim eget lobortis dui.',
    },
    {
      id: 'notif-yest-2',
      kind: 'text',
      senderName: 'Aesthetic 101',
      senderAvatar: sampleAvatars.aesthetic,
      timestamp: now - ONE_DAY_MS - 3600000,
      formattedDate: '12:10pm, 02-03-2026.',
      read: true,
      body: 'Lorem ipsum dolor sit amet consectetur. egestas sit at fermentum at ante integer. Ac nulla aliquam rutrum viverra.\n\nNunc ut vel parturient vitae eget sed elit lorem elementum. Lacus fermentum sed et odio posuere mi magna vivamus. At varius imperdiet nunc diam volutpat. Nulla nisi non sed nulla. Mi neque sed sed nam convallis ut. Sem risus facilisis enim eget lobortis dui.',
    },
    {
      id: 'notif-yest-3',
      kind: 'text',
      senderName: 'Plus Care Hospital',
      senderAvatar: sampleAvatars.hospital,
      timestamp: now - ONE_DAY_MS - 7200000,
      formattedDate: '12:10pm, 02-03-2026.',
      read: false,
      body: 'Lorem ipsum dolor sit amet consectetur. Mi sapien sed sit id vitae nullam eu in morbi. Lorem neque ut euismod rhoncus platea donec sit malesuada eget. Vel quam a cursus fames donec semper ut malesuada.\n\nNunc ut vel parturient vitae eget sed elit lorem elementum. Lacus fermentum sed et odio posuere mi magna vivamus. At varius imperdiet nunc diam volutpat. Nulla nisi non sed nulla. Mi neque sed sed nam convallis ut. Sem risus facilisis enim eget lobortis dui.',
    },
    // 2nd May, 2026 Section
    {
      id: 'notif-dated-1',
      kind: 'text',
      senderName: 'Fresh Glow',
      senderAvatar: sampleAvatars.freshGlow,
      timestamp: now - ONE_DAY_MS * 5,
      formattedDate: '12:10pm, 02-03-2026.',
      read: true,
      body: 'Lorem ipsum dolor sit amet consectetur. egestas sit at fermentum at ante integer. Ac nulla aliquam rutrum viverra.\n\nNunc ut vel parturient vitae eget sed elit lorem elementum. Lacus fermentum sed et odio posuere mi magna vivamus. At varius imperdiet nunc diam volutpat. Nulla nisi non sed nulla. Mi neque sed sed nam convallis ut. Sem risus facilisis enim eget lobortis dui.',
    },
    {
      id: 'notif-dated-2',
      kind: 'text',
      senderName: 'Aesthetic 101',
      senderAvatar: sampleAvatars.aesthetic,
      timestamp: now - ONE_DAY_MS * 5 - 3600000,
      formattedDate: '12:10pm, 02-03-2026.',
      read: true,
      body: 'Lorem ipsum dolor sit amet consectetur. egestas sit at fermentum at ante integer. Ac nulla aliquam rutrum viverra.\n\nNunc ut vel parturient vitae eget sed elit lorem elementum. Lacus fermentum sed et odio posuere mi magna vivamus. At varius imperdiet nunc diam volutpat. Nulla nisi non sed nulla. Mi neque sed sed nam convallis ut. Sem risus facilisis enim eget lobortis dui.',
    },
  ];
}

const NotificationsContext = createContext<NotificationsContextState>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  approveNotification: async () => {},
  declineNotification: async () => {},
  deleteNotification: () => {},
});

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Store starts empty unless DEV_SAMPLE_NOTIFICATIONS is active (per spec)
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    DEV_SAMPLE_NOTIFICATIONS ? createSampleNotifications() : []
  );

  useEffect(() => {
    let active = true;
    const hydrate = async () => {
      try {
        const token = await getAuthToken('business');
        if (!token || !active) return;
        const [notifRes, portfolioRes] = await Promise.all([
          trendApi.notifications.list('business'),
          trendApi.business.listPendingPortfolio(),
        ]);
        const remoteItems: NotificationItem[] = [];
        if (portfolioRes.ok && portfolioRes.data) {
          const pending = extractArray<any>(portfolioRes.data, ['portfolio', 'uploads']);
          pending.forEach((p: any, idx: number) => {
            remoteItems.push({
              id: String(p.id || `port_${idx}`),
              kind: 'media-approval',
              senderName: 'System Notification',
              senderAvatar: sampleAvatars.system,
              timestamp: p.created_at ? Date.parse(p.created_at) || Date.now() : Date.now(),
              formattedDate: p.created_at ? new Date(p.created_at).toLocaleString() : 'Just now',
              read: false,
              staffName: p.staff_name || p.staff?.name || 'Staff',
              images: p.url ? [p.url] : Array.isArray(p.images) ? p.images : [],
              status: 'pending',
            });
          });
        }
        if (notifRes.ok && notifRes.data) {
          const rows = extractArray<any>(notifRes.data, ['notifications']);
          rows.forEach((n: any, idx: number) => {
            remoteItems.push({
              id: String(n.id || `notif_${idx}`),
              kind: 'text',
              senderName: n.title || 'TREND',
              senderAvatar: n.image || sampleAvatars.system,
              timestamp: n.created_at ? Date.parse(n.created_at) || Date.now() : Date.now(),
              formattedDate: n.created_at ? new Date(n.created_at).toLocaleString() : 'Just now',
              read: Boolean(n.read ?? n.is_read),
              title: n.title,
              body: n.body || n.message || '',
            });
          });
        }
        if (active && remoteItems.length > 0) {
          setNotifications((prev) => {
            const ids = new Set(remoteItems.map((r) => r.id));
            return [...remoteItems, ...prev.filter((p) => !ids.has(p.id))];
          });
        }
      } catch {
        // Keep local notifications intact
      }
    };
    hydrate();
    return () => {
      active = false;
    };
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    getAuthToken('business')
      .then((token) => (token ? trendApi.notifications.markRead(id, 'business') : null))
      .catch(() => {});
  }, []);

  const approveNotification = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'approved', read: true } : item
      )
    );
    getAuthToken('business')
      .then((token) => (token ? trendApi.business.approvePortfolio(id) : null))
      .catch(() => {});
  }, []);

  const declineNotification = useCallback(async (id: string) => {
    // Decision A1: Mark as read and keep in inbox without "new" badge per Figma note
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'declined', read: true } : item
      )
    );
    getAuthToken('business')
      .then((token) => (token ? trendApi.business.declinePortfolio(id) : null))
      .catch(() => {});
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        approveNotification,
        declineNotification,
        deleteNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);

// Hook derived from store for Profile bell badge & unread tracking
export function useUnreadNotificationCount(): number {
  const { unreadCount } = useNotifications();
  return unreadCount;
}
