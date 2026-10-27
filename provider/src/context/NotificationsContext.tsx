import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { DEV_SAMPLE_NOTIFICATIONS } from '../constants/notifications.config';

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

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  }, []);

  const approveNotification = useCallback(async (id: string) => {
    // TODO (Backend): Persist media approval status
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'approved', read: true } : item
      )
    );
  }, []);

  const declineNotification = useCallback(async (id: string) => {
    // Decision A1: Mark as read and keep in inbox without "new" badge per Figma note
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'declined', read: true } : item
      )
    );
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
