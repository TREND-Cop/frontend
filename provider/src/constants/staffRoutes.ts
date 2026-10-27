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
} as const;


export type StaffRouteKey = keyof typeof STAFF_ROUTES;
