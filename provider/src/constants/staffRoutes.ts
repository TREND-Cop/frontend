/**
 * Staff App Route Targets
 *
 * Centralizes all route paths across Staff App Prompts 1-4.
 * Prompts 2-4 will fill in the concrete screens behind these routes.
 */

export const STAFF_ROUTES = {
  // Prompt 1: Staff Home
  HOME: '/(staff)/staff-home',

  // Prompt 2: Appointments list and appointment detail
  APPOINTMENTS: '/(staff)/staff-appointments',
  APPOINTMENT_DETAIL: '/(staff)/staff-appointment-detail',

  // Prompt 3: In Progress and the completion flow
  IN_PROGRESS: '/(staff)/staff-ongoing',
  ONGOING_APPOINTMENTS: '/(staff)/staff-ongoing',
  ONGOING_DETAIL: '/(staff)/staff-ongoing-detail',
  VERIFYING_STATUS: '/(staff)/staff-verifying-status',
  COMPLETION_SUCCESS: '/(staff)/staff-completion-success',

  // Prompt 4: Completed and Cancelled lists, filters, date filter, detail screens
  COMPLETED: '/(staff)/staff-completed',
  CANCELLED: '/(staff)/staff-cancelled',
  HISTORY_DETAIL: '/(staff)/staff-history-detail',

  // Staff Tutorial: Video Screen
  TUTORIAL_VIDEO: '/(staff)/staff-tutorial-video',

  // Prompt 5: Clients Review and Post Work (isolated staff routes)
  REVIEWS: '/(staff)/staff-reviews',
  POST_WORK: '/(staff)/staff-post-work',
  POST_WORK_PREVIEW: '/(staff)/staff-post-work/preview',
  POST_WORK_SUCCESS: '/(staff)/staff-post-work/success',

  // Prompt 6: Personal Statistics (isolated staff route)
  STATISTICS: '/(staff)/staff-statistics',

  // Prompt 7: Messages tab (isolated staff routes)
  MESSAGES: '/(staff)/staff-messages',
  NEW_CHAT: '/(staff)/staff-new-chat',
  CHAT: '/(staff)/staff-chat',

  // Prompt 8: Staff Profile tab (hub, bio, terms, logout)
  PROFILE: '/(staff)/staff-profile',
  TERMS_POLICY: '/(staff)/staff-terms-policy',
  LOGOUT: '/(staff)/staff-logout',

  // Prompt 9: Staff Notifications (push, inbox, detail, viewer)
  NOTIFICATIONS: '/(staff)/staff-notifications',
  NOTIFICATION_DETAIL: '/(staff)/staff-notification-detail',
  NOTIFICATION_PUSH: '/(staff)/staff-notification-push',
  IMAGE_VIEWER: '/(staff)/staff-image-viewer',
} as const;


export type StaffRouteKey = keyof typeof STAFF_ROUTES;
