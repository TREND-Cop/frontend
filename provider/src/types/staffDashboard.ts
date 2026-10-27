/**
 * Staff Dashboard Screen Data Types
 *
 * Contains ONLY the fields displayed on the Staff Home Screen.
 * No backend database schema, tables, or role columns.
 */

export interface StaffDashboardData {
  // Header
  businessName: string;
  address?: string;
  avatarUrl?: string;

  // Work Dashboard (2x2 Grid)
  pendingAppointmentsCount?: number;
  ongoingAppointmentsCount?: number;
  cancelledAppointmentsCount?: number;
  completedAppointmentsCount?: number;

  // Personal Data (2x2 Grid)
  closingTime?: string;
  breakTime?: string;
  resumptionTime?: string;
  workDays?: string[]; // e.g. ['Mon', 'Tue', 'Wed', 'Sun']

  // Floating Break Countdown Chip
  breakSecondsRemaining?: number | null; // Seconds remaining until break, null if no break later today

  // Personal Dashboard
  photosCount?: number;
  performanceChangePercent?: number; // e.g. 12 for +12%
  performanceTimeframe?: string;     // e.g. 'Today'
  reviewsCount?: number;
}
