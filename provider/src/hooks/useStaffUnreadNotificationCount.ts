import { useStaffNotifications } from '../context/StaffNotificationsContext';

/**
 * Hook to retrieve staff unread notifications count from the staff notifications store.
 * The Profile row badge is automatically hidden when count is 0.
 */
export function useStaffUnreadNotificationCount(): number {
  const { unreadCount } = useStaffNotifications();
  return unreadCount;
}
