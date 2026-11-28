import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { trendApi, getAuthToken, extractArray } from '../api/trendApi';
import { useStaffLoginStore } from './StaffLoginContext';

export type StaffNotificationKind = 'text' | 'media-upload-result';
export type StaffMediaStatus = 'declined'; // only designed value per Figma

export interface StaffNotificationItem {
  id: string;
  kind: StaffNotificationKind;
  senderName: string;
  senderAvatar?: any;
  timestamp: number; // Unix ms
  formattedDate: string; // e.g., '12:10pm, 02-03-2026.'
  read: boolean;
  // Text kind
  body?: string;
  // Media upload result kind
  uploaderLabel?: string; // e.g. "Media upload from Anna"
  images?: any[];
  status?: StaffMediaStatus;
}

export interface StaffNotificationsContextState {
  notifications: StaffNotificationItem[];
  unreadCount: number;
  hasPromptedPush: boolean;
  setHasPromptedPush: (val: boolean) => void;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  seedSampleNotifications: () => void;
  clearNotifications: () => void;
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

export function createStaffSampleNotifications(): StaffNotificationItem[] {
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  return [
    // Today Section: Denied Media Upload Result from Anna
    {
      id: 'staff-notif-today-1',
      kind: 'media-upload-result',
      senderName: 'System Notification',
      senderAvatar: sampleAvatars.system,
      timestamp: now,
      formattedDate: '12:10pm, 02-03-2026.',
      read: false,
      uploaderLabel: 'Media upload from Anna',
      images: sampleMediaImages,
      status: 'declined',
    },
    // Yesterday Section
    {
      id: 'staff-notif-yest-1',
      kind: 'text',
      senderName: 'Fresh Glow',
      senderAvatar: sampleAvatars.freshGlow,
      timestamp: now - ONE_DAY_MS,
      formattedDate: '12:10pm, 02-03-2026.',
      read: true,
      body: 'Lorem ipsum dolor sit amet consectetur. egestas sit at fermentum at ante integer. Ac nulla aliquam rutrum viverra.\n\nNunc ut vel parturient vitae eget sed elit lorem elementum. Lacus fermentum sed et odio posuere mi magna vivamus. At varius imperdiet nunc diam volutpat. Nulla nisi non sed nulla. Mi neque sed sed nam convallis ut. Sem risus facilisis enim eget lobortis dui.',
    },
    {
      id: 'staff-notif-yest-2',
      kind: 'text',
      senderName: 'Aesthetic 101',
      senderAvatar: sampleAvatars.aesthetic,
      timestamp: now - ONE_DAY_MS - 3600000,
      formattedDate: '12:10pm, 02-03-2026.',
      read: true,
      body: 'Lorem ipsum dolor sit amet consectetur. egestas sit at fermentum at ante integer. Ac nulla aliquam rutrum viverra.\n\nNunc ut vel parturient vitae eget sed elit lorem elementum. Lacus fermentum sed et odio posuere mi magna vivamus. At varius imperdiet nunc diam volutpat. Nulla nisi non sed nulla. Mi neque sed sed nam convallis ut. Sem risus facilisis enim eget lobortis dui.',
    },
    {
      id: 'staff-notif-yest-3',
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
      id: 'staff-notif-dated-1',
      kind: 'text',
      senderName: 'Fresh Glow',
      senderAvatar: sampleAvatars.freshGlow,
      timestamp: now - ONE_DAY_MS * 5,
      formattedDate: '12:10pm, 02-03-2026.',
      read: true,
      body: 'Lorem ipsum dolor sit amet consectetur. egestas sit at fermentum at ante integer. Ac nulla aliquam rutrum viverra.\n\nNunc ut vel parturient vitae eget sed elit lorem elementum. Lacus fermentum sed et odio posuere mi magna vivamus. At varius imperdiet nunc diam volutpat. Nulla nisi non sed nulla. Mi neque sed sed nam convallis ut. Sem risus facilisis enim eget lobortis dui.',
    },
    {
      id: 'staff-notif-dated-2',
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

/**
 * Dev-only constant: defaults to empty array per prompt specification.
 * Toggle to createStaffSampleNotifications() if you wish to see populated Figma inbox.
 */
export const DEV_STAFF_NOTIFICATIONS: StaffNotificationItem[] = [];

const StaffNotificationsContext = createContext<StaffNotificationsContextState>({
  notifications: [],
  unreadCount: 0,
  hasPromptedPush: false,
  setHasPromptedPush: () => {},
  markAsRead: () => {},
  deleteNotification: () => {},
  seedSampleNotifications: () => {},
  clearNotifications: () => {},
});

export const StaffNotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { verifiedCode } = useStaffLoginStore();
  const [notifications, setNotifications] = useState<StaffNotificationItem[]>(DEV_STAFF_NOTIFICATIONS);
  const [hasPromptedPush, setHasPromptedPush] = useState<boolean>(false);

  // Hydrate live staff notifications from backend
  useEffect(() => {
    let active = true;
    (async () => {
      const token = await getAuthToken('staff');
      if (!token) return;
      try {
        const res = await trendApi.notifications.list('staff');
        if (!active || !res.ok || !res.data) return;
        const rows = extractArray<any>(res.data, ['notifications']);
        const mapped: StaffNotificationItem[] = rows.map((n: any) => {
          const ts = n.created_at ? new Date(n.created_at).getTime() : Date.now();
          const d = new Date(Number.isFinite(ts) ? ts : Date.now());
          const formattedDate = d.toLocaleString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });
          return {
            id: String(n.id),
            kind: 'text',
            senderName: n.title || 'System Notification',
            senderAvatar: sampleAvatars.system,
            timestamp: Number.isFinite(ts) ? ts : Date.now(),
            formattedDate,
            read: n.is_read === 1 || n.is_read === true,
            body: n.body || '',
          };
        });
        setNotifications(mapped);
      } catch {
        // Keep current list if offline
      }
    })();
    return () => {
      active = false;
    };
  }, [verifiedCode]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    getAuthToken('staff')
      .then((token) => (token ? trendApi.notifications.markRead(id, 'staff') : null))
      .catch(() => {});
  }, []);

  const deleteNotification = useCallback((id: string) => {
    // TODO (Backend): Delete notification
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const seedSampleNotifications = useCallback(() => {
    setNotifications(createStaffSampleNotifications());
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <StaffNotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        hasPromptedPush,
        setHasPromptedPush,
        markAsRead,
        deleteNotification,
        seedSampleNotifications,
        clearNotifications,
      }}
    >
      {children}
    </StaffNotificationsContext.Provider>
  );
};

export const useStaffNotifications = () => useContext(StaffNotificationsContext);

