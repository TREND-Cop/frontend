/**
 * Trend Business — Staff Personal Statistics Configuration & Dev Seeding
 */

import { StatsPeriod } from '../context/StatsContext';
import { ChartDataPoint } from '../components/stats/InteractiveAreaChart';
import {
  RevenueStatsResult,
  ServiceRevenueResult,
  ClientStatsResult,
  AppointmentStatsResult,
  ServiceChip,
} from '../api/statsApi';

/**
 * Dev-only constant controlling whether sample statistics are returned for staff.
 * Default is strictly false (starts empty / null per prompt specification).
 */
export const DEV_SAMPLE_STAFF_STATS = false;

export const STAFF_STATS_TABS = [
  'Revenue',
  'Clients',
  'Appointments',
] as const;

export type StaffStatsTabName = (typeof STAFF_STATS_TABS)[number];

export interface StaffHomeStatsSummary {
  performanceChangePercent: number;
  performanceTimeframe: string;
}

const DAY_ABBRS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function generateSampleMonthSeries(
  year: number,
  monthIndex: number,
  pattern: 'total_income' | 'haircut' | 'pedicure' | 'manicure' | 'clients' | 'appointments'
): ChartDataPoint[] {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const series: ChartDataPoint[] = [];

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
        const t = (day - 1) / (daysInMonth - 1);
        val = Math.round(9500 + t * 24000 + Math.sin(day * 1.5) * 3500);
      }
    } else if (pattern === 'pedicure') {
      val = Math.round(7500 + (day / daysInMonth) * 16000 + Math.cos(day) * 2500);
    } else if (pattern === 'manicure') {
      val = Math.round(4800 + (day / daysInMonth) * 11500 + Math.sin(day * 2) * 1800);
    } else if (pattern === 'clients') {
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

export function getSampleStaffRevenue(period: StatsPeriod): RevenueStatsResult {
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

export const SAMPLE_STAFF_SERVICES: ServiceChip[] = [
  { id: 'haircut', name: 'Hair cut' },
  { id: 'pedicure', name: 'Pedicure' },
  { id: 'manicure', name: 'Manicure' },
];

export function getSampleStaffServiceRevenue(
  serviceId: string,
  period: StatsPeriod
): ServiceRevenueResult {
  const d = period.kind === 'day' ? period.date : new Date(period.year, 0, 1);
  const year = d.getFullYear();
  const month = d.getMonth();

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

  if (serviceId === 'manicure') {
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

  // Default: Hair cut matching Figma frame
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

export function getSampleStaffClients(period: StatsPeriod): ClientStatsResult {
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
    topClients: Array.from({ length: 10 }).map((_, i) => ({
      id: `client-${i + 1}`,
      name: 'David Beckham',
      photoUri: undefined,
      appointments: 72,
    })),
  };
}

export function getSampleStaffAppointments(period: StatsPeriod): AppointmentStatsResult {
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
          label: 'Completed Appoint',
          percent: '76%',
          color: 'rgba(12, 121, 12, 0.96)',
        },
        {
          key: 'canceled',
          label: 'Canceled Appoint',
          percent: '86%',
          color: 'rgba(204, 41, 41, 0.9)',
        },
        {
          key: 'upfront',
          label: 'Upfront Appoint',
          percent: '14%',
          color: 'rgba(192, 192, 204, 0.96)',
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
          key: 'upfront',
          label: 'Upfront Appointment',
          percent: '14%',
          direction: 'up',
          lastMonthPercent: '13%',
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
