import React from 'react';
import { BusinessStatisticsScreen } from '../../screens/stats/BusinessStatisticsScreen';

/**
 * Staff Personal Statistics Route (Prompt 6)
 *
 * Renders the Personal Statistics screen in staff mode:
 * - 3 tabs: Revenue, Clients, Appointments (Staff & Marketing tabs omitted)
 * - Header title: "Personal Statistics"
 * - Data isolated from owner through StaffStatisticsProvider
 * - Back button triggers skeleton-on-return to staff home
 */
export default function StaffStatisticsRoute() {
  return <BusinessStatisticsScreen isStaff />;
}
