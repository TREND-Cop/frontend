/**
 * Trend Business — Stats API Layer Shell
 *
 * Frontend only:
 * - DEV_SAMPLE_STATS flag (clearly marked, default false)
 * - Returns explicit empty result (null) marked TODO (Backend)
 * - Sample data shaped like Figma designs when DEV_SAMPLE_STATS = true
 */

import { useState, useEffect } from 'react';
import { StatsPeriod } from '../context/StatsContext';
import { ChartDataPoint } from '../components/stats/InteractiveAreaChart';
import { useStaffStore, StaffMember } from '../context/StaffContext';
import { DEV_SAMPLE_STAFF } from '../constants/staff.config';
import { trendApi, getAuthToken } from './trendApi';

function getPeriodRange(period: StatsPeriod): { from: string; to: string } {
  if (period.kind === 'day') {
    const y = period.date.getFullYear();
    const m = period.date.getMonth();
    const from = `${y}-${String(m + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m + 1, 0).getDate();
    const to = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { from, to };
  }
  return { from: `${period.year}-01-01`, to: `${period.year}-12-31` };
}

function useLiveBusinessStats(period: StatsPeriod): any | null {
  const [liveData, setLiveData] = useState<any | null>(null);
  const { from, to } = getPeriodRange(period);

  useEffect(() => {
    let active = true;
    getAuthToken('business')
      .then((token) => (token ? trendApi.stats.getBusiness({ from, to }) : null))
      .then((res) => {
        if (active && res && res.ok && res.data) {
          setLiveData(res.data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [from, to]);

  return liveData;
}

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
  const live = useLiveBusinessStats(period);
  if (live && typeof live.revenue === 'number') {
    const monthlyRows = Array.isArray(live.monthly) ? live.monthly : [];
    const series: RevenueSeriesPoint[] = Array.isArray(live.revenue_series)
      ? live.revenue_series.map((p: any, idx: number) => ({
          key: String(p.date || p.key || idx),
          label: String(p.label || p.date || idx),
          value: Number(p.value ?? p.amount ?? 0),
        }))
      : monthlyRows
          .slice()
          .reverse()
          .map((m: any, idx: number) => ({
            key: String(m.month || idx),
            label: String(m.month || idx),
            value: Number(m.revenue ?? 0),
          }));
    const lastMonth = Number(
      live.last_month_revenue ?? (monthlyRows.length > 1 ? monthlyRows[1]?.revenue : 0) ?? 0
    );
    const diff = live.revenue - lastMonth;
    const pct = lastMonth > 0 ? Math.abs(Math.round((diff / lastMonth) * 100)) : 0;
    return {
      total: live.revenue,
      trend: { direction: diff >= 0 ? 'up' : 'down', percent: `${pct}%` },
      comparedToLastMonth: lastMonth,
      series,
      summary: {
        lastMonthTotal: lastMonth,
        changePercent: `${pct}%`,
        changeDirection: diff >= 0 ? 'increase' : 'decrease',
      },
    };
  }

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
  const live = useLiveBusinessStats(period);
  const clientsObj = live?.clients;
  if (
    live &&
    (clientsObj || typeof live.total_clients === 'number' || typeof live.new_clients === 'number')
  ) {
    const newCount = Number(clientsObj?.new ?? live.new_clients ?? 0);
    const returningCount = Number(clientsObj?.returning ?? live.returning_clients ?? 0);
    const total = Number(clientsObj?.total ?? live.total_clients ?? newCount + returningCount);
    const mixTotal = Math.max(1, newCount + returningCount);
    const newPercent = Math.round((newCount / mixTotal) * 100);
    const returningPercent = Math.max(0, 100 - newPercent);
    return {
      total,
      trend: { direction: 'up', percent: '0%' },
      comparedClients: Number(live.last_month_clients ?? 0),
      series: Array.isArray(live.clients_series) ? live.clients_series : [],
      mix: {
        total,
        newPercent,
        returningPercent,
        newTrend: { direction: 'up', percent: `${newPercent}%` },
        returningTrend: { direction: 'up', percent: `${returningPercent}%` },
        lastMonthNewPercent: 0,
        lastMonthReturningPercent: 0,
      },
      topClients: Array.isArray(live.top_clients) ? live.top_clients : [],
    };
  }

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
  const live = useLiveBusinessStats(period);
  const rawByStatus = live?.by_status ?? live?.appointments_by_status;
  if (live && rawByStatus) {
    const counts: Record<string, number> = {};
    if (Array.isArray(rawByStatus)) {
      rawByStatus.forEach((row: any) => {
        if (row?.status) counts[String(row.status)] = Number(row.count ?? 0);
      });
    } else if (typeof rawByStatus === 'object') {
      Object.entries(rawByStatus).forEach(([k, v]) => {
        counts[k] = Number(v ?? 0);
      });
    }
    const completed = counts.completed ?? 0;
    const cancelled = (counts.cancelled ?? 0) + (counts.canceled ?? 0);
    const total =
      Number(live.total_appointments ?? 0) ||
      Object.values(counts).reduce((sum, n) => sum + n, 0);
    const denom = Math.max(1, total);
    const completedPct = `${Math.round((completed / denom) * 100)}%`;
    const cancelledPct = `${Math.round((cancelled / denom) * 100)}%`;
    const monthlyRows = Array.isArray(live.monthly) ? live.monthly : [];
    const series = Array.isArray(live.appointments_series)
      ? live.appointments_series
      : monthlyRows
          .slice()
          .reverse()
          .map((m: any, idx: number) => ({
            key: String(m.month || idx),
            label: String(m.month || idx),
            value: Number(m.appointments ?? 0),
          }));
    return {
      total,
      trend: { direction: 'up', percent: '0%' },
      comparedAppointments: Number(
        live.last_month_appointments ?? (monthlyRows.length > 1 ? monthlyRows[1]?.appointments : 0) ?? 0
      ),
      series,
      status: {
        total,
        slices: [
          { key: 'completed', label: 'Completed', percent: completedPct, color: 'rgba(12, 121, 12, 0.96)' },
          { key: 'canceled', label: 'Canceled', percent: cancelledPct, color: 'rgba(204, 41, 41, 0.9)' },
        ],
        rows: [
          { key: 'completed', label: 'Completed Appointment', percent: completedPct, direction: 'up', lastMonthPercent: '0%' },
          { key: 'canceled', label: 'Canceled Appointment', percent: cancelledPct, direction: 'down', lastMonthPercent: '0%' },
        ],
      },
      busiest: {
        dayLabel: live.busiest_day || '-',
        appointments: Number(live.busiest_day_count ?? 0),
        appointmentsDirection: 'up',
        workHours: Number(live.busiest_work_hours ?? 0),
        workHoursDirection: 'up',
      },
    };
  }

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
