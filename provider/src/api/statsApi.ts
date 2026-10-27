/**
 * Trend Business — Stats API Layer Shell
 *
 * Frontend only:
 * - DEV_SAMPLE_STATS flag (clearly marked, default false)
 * - Returns explicit empty result (null) marked TODO (Backend)
 * - Sample data shaped like Figma designs when DEV_SAMPLE_STATS = true
 */

import { StatsPeriod } from '../context/StatsContext';
import { ChartDataPoint } from '../components/stats/InteractiveAreaChart';
import { useStaffStore, StaffMember } from '../context/StaffContext';
import { DEV_SAMPLE_STAFF } from '../constants/staff.config';

/**
 * Dev-only constant controlling whether sample stats are returned.
 * Default is strictly false. Nothing else may produce fake numbers.
 */
export const DEV_SAMPLE_STATS = false;

// ── Types for Revenue Results (Prompt 2) ───────────────────────────────────

export interface RevenueSeriesPoint extends ChartDataPoint {}

export interface RevenueStatsResult {
  total: number;
  trend: {
    direction: 'up' | 'down';
    percent: string;
  };
  comparedToLastMonth: number;
  series: RevenueSeriesPoint[];
  summary: {
    lastMonthTotal: number;
    changePercent: string;
    changeDirection: 'increase' | 'decrease';
  };
}

export interface ServiceRevenueResult {
  serviceId: string;
  serviceName: string;
  appointments: number;
  total: number;
  trend: {
    direction: 'up' | 'down';
    percent: string;
  };
  comparedToLastMonth: number;
  series: RevenueSeriesPoint[];
}

export interface ServiceChip {
  id: string;
  name: string;
}

// ── Types for Tab Results (Stubs for Prompts 3–5) ───────────────────────────

export interface ClientStatsResult {
  total: number;
  trend: {
    direction: 'up' | 'down';
    percent: string;
  };
  comparedClients: number;
  series: ChartDataPoint[];
  mix: {
    total: number;
    newPercent: number;
    returningPercent: number;
    newTrend: {
      direction: 'up' | 'down';
      percent: string;
    };
    returningTrend: {
      direction: 'up' | 'down';
      percent: string;
    };
    lastMonthNewPercent: number;
    lastMonthReturningPercent: number;
  };
  topClients: {
    id: string;
    name: string;
    photoUri?: string;
    appointments: number;
  }[];
}

export interface AppointmentStatusSlice {
  key: string;
  label: string;
  percent: string;
  color: string;
}

export interface AppointmentStatusRow {
  key: string;
  label: string;
  percent: string;
  direction: 'up' | 'down';
  lastMonthPercent: string;
}

export interface AppointmentStatsResult {
  total: number;
  trend: {
    direction: 'up' | 'down';
    percent: string;
  };
  comparedAppointments: number;
  series: ChartDataPoint[];
  status: {
    total: number;
    slices: AppointmentStatusSlice[];
    rows: AppointmentStatusRow[];
  };
  busiest: {
    dayLabel: string;
    appointments: number;
    appointmentsDirection: 'up' | 'down';
    workHours: number;
    workHoursDirection: 'up' | 'down';
  };
}

export interface StaffMetricRow {
  staffId: string;
  revenue: number;
  clients: number;
  rating: number;
}

export interface TopPerformingRow {
  staffId: string;
  rating: number;
}

export interface TopRevenueRow {
  staffId: string;
  revenue: number;
}

export interface TopClientsRow {
  staffId: string;
  clients: number;
}

export interface StaffStatsResult {
  totalStaff: number;
  newStaffCount: number;
  staff: StaffMetricRow[];
  topPerforming: TopPerformingRow[];
  topRevenue: TopRevenueRow[];
  topClients: TopClientsRow[];
}

export interface MarketingSource {
  id: string;
  label: string;
  iconKey: 'referral' | 'in_app_ads' | 'discounts' | string;
  percent: number;
  newViewers: number;
}

export interface MarketingStatsResult {
  sources: MarketingSource[];
}

// ── Helper: Generate Daily Series with Real Dates (No Hardcoded Year) ───────

const DAY_ABBRS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function generateSampleMonthSeries(
  year: number,
  monthIndex: number,
  pattern: 'total_income' | 'haircut' | 'pedicure' | 'manicure' | 'clients' | 'appointments'
): RevenueSeriesPoint[] {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const series: RevenueSeriesPoint[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, monthIndex, day);
    const dayName = DAY_ABBRS[d.getDay()];
    const label = `${dayName} ${day < 10 ? '0' + day : day}`;
    const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    let val = 0;
    if (pattern === 'total_income') {
      if (day === 3) {
        val = 14200; // Matches Figma tooltip ₦14,200 on Wed 03
      } else if (day === 1) {
        val = 27500;
      } else if (day === 2) {
        val = 24000;
      } else if (day === 4) {
        val = 18200;
      } else if (day === 5) {
        val = 15800;
      } else {
        // Downward trending curve with realistic daily fluctuations
        const t = (day - 1) / (daysInMonth - 1);
        val = Math.round(25000 * Math.exp(-t * 1.5) + Math.sin(day * 1.2) * 2800 + 11000);
      }
    } else if (pattern === 'haircut') {
      if (day === 3) {
        val = 26700; // Matches Figma tooltip ₦26,700 on Wed 03
      } else if (day === 1) {
        val = 11500;
      } else if (day === 2) {
        val = 14800;
      } else {
        // Upward trending curve with realistic daily fluctuations
        const t = (day - 1) / (daysInMonth - 1);
        val = Math.round(9500 + t * 24000 + Math.sin(day * 1.5) * 3500);
      }
    } else if (pattern === 'pedicure') {
      val = Math.round(7500 + (day / daysInMonth) * 16000 + Math.cos(day) * 2500);
    } else if (pattern === 'manicure') {
      val = Math.round(4800 + (day / daysInMonth) * 11500 + Math.sin(day * 2) * 1800);
    } else if (pattern === 'clients') {
      // Client counts over month (upward trend, day 3 = 26 clients per C1 design tooltip)
      if (day === 3) {
        val = 26;
      } else if (day === 1) {
        val = 14;
      } else if (day === 2) {
        val = 18;
      } else {
        const t = (day - 1) / (daysInMonth - 1);
        val = Math.round(15 + t * 20 + Math.sin(day * 1.4) * 5);
      }
    } else if (pattern === 'appointments') {
      // Appointment counts over month (upward trend ↗ 5.2%, day 3 = 14 appointments per Wed 03)
      if (day === 3) {
        val = 14;
      } else if (day === 1) {
        val = 18;
      } else if (day === 2) {
        val = 16;
      } else {
        const t = (day - 1) / (daysInMonth - 1);
        val = Math.round(10 + t * 5 + Math.sin(day * 1.1) * 3);
      }
    }

    const isCurrency =
      pattern === 'total_income' ||
      pattern === 'haircut' ||
      pattern === 'pedicure' ||
      pattern === 'manicure';

    series.push({
      key,
      label,
      value: isCurrency ? Math.max(1000, val) : Math.max(1, val),
    });
  }

  return series;
}

// ── Hook Stubs & Data Accessors ────────────────────────────────────────────

/**
 * Hook for Section "Total income"
 * TODO (Backend): Fetch total revenue metrics for the given period.
 */
export function useRevenueStats(period: StatsPeriod): RevenueStatsResult | null {
  if (!DEV_SAMPLE_STATS) {
    return null;
  }

  const d = period.kind === 'day' ? period.date : new Date(period.year, 0, 1);
  const year = d.getFullYear();
  const month = d.getMonth();

  return {
    total: 500200,
    trend: {
      direction: 'down',
      percent: '5.2%',
    },
    comparedToLastMonth: 700600,
    series: generateSampleMonthSeries(year, month, 'total_income'),
    summary: {
      lastMonthTotal: 410230,
      changePercent: '3%',
      changeDirection: 'increase',
    },
  };
}

/**
 * Hook for service chips list under "Revenue per service"
 * Per the "Revenue per service" note, these are the services the staff are attached to in staff management.
 * TODO (Backend): Fetch list of attached services.
 */
export function useRevenueServices(): ServiceChip[] {
  if (!DEV_SAMPLE_STATS) {
    return [];
  }

  return [
    { id: 'haircut', name: 'Hair cut' },
    { id: 'pedicure', name: 'Pedicure' },
    { id: 'manicure', name: 'Manicure' },
  ];
}

/**
 * Hook for Section "Revenue per service"
 * TODO (Backend): Fetch revenue metrics for a specific service.
 */
export function useRevenueByService(
  serviceId: string,
  period: StatsPeriod
): ServiceRevenueResult | null {
  if (!DEV_SAMPLE_STATS || !serviceId) {
    return null;
  }

  const d = period.kind === 'day' ? period.date : new Date(period.year, 0, 1);
  const year = d.getFullYear();
  const month = d.getMonth();

  if (serviceId === 'haircut') {
    return {
      serviceId: 'haircut',
      serviceName: 'Hair cut',
      appointments: 56,
      total: 60200,
      trend: {
        direction: 'up',
        percent: '5.2%',
      },
      comparedToLastMonth: 51600,
      series: generateSampleMonthSeries(year, month, 'haircut'),
    };
  }

  if (serviceId === 'pedicure') {
    return {
      serviceId: 'pedicure',
      serviceName: 'Pedicure',
      appointments: 38,
      total: 44800,
      trend: {
        direction: 'up',
        percent: '3.8%',
      },
      comparedToLastMonth: 41200,
      series: generateSampleMonthSeries(year, month, 'pedicure'),
    };
  }

  // Manicure or other
  return {
    serviceId: 'manicure',
    serviceName: 'Manicure',
    appointments: 28,
    total: 31500,
    trend: {
      direction: 'up',
      percent: '2.1%',
    },
    comparedToLastMonth: 29800,
    series: generateSampleMonthSeries(year, month, 'manicure'),
  };
}

// ── Hook Stubs (Prompts 3–5) ───────────────────────────────────────────────

/**
 * Hook for Clients Tab (Section 1: count, Section 2: mix, Section 3: top clients)
 * TODO (Backend): Fetch client metrics for given period
 */
export function useClientStats(period: StatsPeriod): ClientStatsResult | null {
  if (!DEV_SAMPLE_STATS) {
    return null;
  }

  const d = period.kind === 'day' ? period.date : new Date(period.year, 0, 1);
  const year = d.getFullYear();
  const month = d.getMonth();

  return {
    total: 600,
    trend: {
      direction: 'up',
      percent: '5.2%',
    },
    comparedClients: 99,
    series: generateSampleMonthSeries(year, month, 'clients'),
    mix: {
      total: 90,
      newPercent: 56,
      returningPercent: 44,
      newTrend: {
        direction: 'up',
        percent: '56%',
      },
      returningTrend: {
        direction: 'down',
        percent: '44%',
      },
      lastMonthNewPercent: 12,
      lastMonthReturningPercent: 56,
    },
    topClients: [
      { id: '1', name: 'David Beckham', appointments: 72 },
      { id: '2', name: 'David Beckham', appointments: 72 },
      { id: '3', name: 'David Beckham', appointments: 72 },
      { id: '4', name: 'David Beckham', appointments: 72 },
      { id: '5', name: 'David Beckham', appointments: 72 },
      { id: '6', name: 'David Beckham', appointments: 72 },
      { id: '7', name: 'David Beckham', appointments: 72 },
      { id: '8', name: 'David Beckham', appointments: 72 },
      { id: '9', name: 'David Beckham', appointments: 72 },
      { id: '10', name: 'David Beckham', appointments: 72 },
    ],
  };
}

/**
 * Hook for Appointments Tab (Section 1: count, Section 2: status, Section 3: busiest times)
 * TODO (Backend): Fetch appointment statistics for given period
 */
export function useAppointmentStats(period: StatsPeriod): AppointmentStatsResult | null {
  if (!DEV_SAMPLE_STATS) {
    return null;
  }

  const d = period.kind === 'day' ? period.date : new Date(period.year, 0, 1);
  const year = d.getFullYear();
  const month = d.getMonth();

  return {
    total: 350,
    trend: {
      direction: 'up',
      percent: '5.2%',
    },
    comparedAppointments: 255,
    series: generateSampleMonthSeries(year, month, 'appointments'),
    status: {
      total: 350,
      slices: [
        {
          key: 'completed',
          label: 'Completed',
          percent: '76%',
          color: 'rgba(12, 121, 12, 0.96)',
        },
        {
          key: 'reschedule',
          label: 'Reschedule',
          percent: '66%',
          color: 'rgba(192, 192, 204, 0.96)',
        },
        {
          key: 'upfront',
          label: 'Upfront',
          percent: '44%',
          color: 'rgba(235, 235, 245, 0.96)',
        },
        {
          key: 'canceled',
          label: 'Canceled',
          percent: '86%',
          color: 'rgba(204, 41, 41, 0.9)',
        },
      ],
      rows: [
        {
          key: 'completed',
          label: 'Completed Appointment',
          percent: '76%',
          direction: 'up',
          lastMonthPercent: '52%',
        },
        {
          key: 'canceled',
          label: 'Canceled Appointment',
          percent: '86%',
          direction: 'up',
          lastMonthPercent: '52%',
        },
        {
          key: 'reschedule',
          label: 'Reschedule Appointment',
          percent: '64%',
          direction: 'down',
          lastMonthPercent: '52%',
        },
      ],
    },
    busiest: {
      dayLabel: 'Monday',
      appointments: 32,
      appointmentsDirection: 'up',
      workHours: 15,
      workHoursDirection: 'up',
    },
  };
}

/**
 * Hook for Staff Tab (Count, Staff list, Top 5 Performing, Top revenue, Top clients)
 * TODO (Backend): Fetch staff statistics for given period
 */
export function useStaffStats(period: StatsPeriod): StaffStatsResult | null {
  const { staff } = useStaffStore();

  if (!DEV_SAMPLE_STATS || !DEV_SAMPLE_STAFF || staff.length === 0) {
    return null;
  }

  const sampleRevenues = [12700, 102700, 62700];
  const sampleRatings = [5.1, 4.2, 3.9, 3.1, 3.0];

  return {
    totalStaff: 12,
    newStaffCount: 0,
    staff: staff.map((member: StaffMember, idx: number) => ({
      staffId: member.id,
      revenue: sampleRevenues[idx % sampleRevenues.length],
      clients: 32,
      rating: 5.1,
    })),
    topPerforming: staff.slice(0, 5).map((member: StaffMember, idx: number) => ({
      staffId: member.id,
      rating: sampleRatings[idx] ?? 4.0,
    })),
    topRevenue: staff.slice(0, 5).map((member: StaffMember) => ({
      staffId: member.id,
      revenue: 102700,
    })),
    topClients: staff.slice(0, 5).map((member: StaffMember) => ({
      staffId: member.id,
      clients: 32,
    })),
  };
}

/**
 * Hook for Marketing & Growth Tab (Client Sources)
 * TODO (Backend): Fetch marketing statistics for given period
 */
export function useMarketingStats(period: StatsPeriod): MarketingStatsResult | null {
  if (!DEV_SAMPLE_STATS) {
    return null;
  }

  return {
    sources: [
      {
        id: 'referral',
        label: 'Referral Link',
        iconKey: 'referral',
        percent: 39,
        newViewers: 2,
      },
      {
        id: 'in_app_ads',
        label: 'InApp Paid Marketing Ads',
        iconKey: 'in_app_ads',
        percent: 89,
        newViewers: 22,
      },
      {
        id: 'discounts',
        label: 'Discounts',
        iconKey: 'discounts',
        percent: 72,
        newViewers: 22,
      },
    ],
  };
}
