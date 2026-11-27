import React, { createContext, useContext, useMemo } from 'react';
import { StatsPeriod } from './StatsContext';
import {
  RevenueStatsResult,
  ServiceRevenueResult,
  ClientStatsResult,
  AppointmentStatsResult,
  ServiceChip,
} from '../api/statsApi';
import {
  DEV_SAMPLE_STAFF_STATS,
  StaffHomeStatsSummary,
  getSampleStaffRevenue,
  SAMPLE_STAFF_SERVICES,
  getSampleStaffServiceRevenue,
  getSampleStaffClients,
  getSampleStaffAppointments,
} from '../constants/staffStats.config';

export interface StaffStatisticsContextType {
  getStaffRevenue: (period: StatsPeriod) => RevenueStatsResult | null;
  getStaffServices: () => ServiceChip[];
  getStaffServiceRevenue: (serviceId: string, period: StatsPeriod) => ServiceRevenueResult | null;
  getStaffClients: (period: StatsPeriod) => ClientStatsResult | null;
  getStaffAppointments: (period: StatsPeriod) => AppointmentStatsResult | null;
  homeSummary: StaffHomeStatsSummary | null;
}

const StaffStatisticsContext = createContext<StaffStatisticsContextType | undefined>(undefined);

export const StaffStatisticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useMemo<StaffStatisticsContextType>(() => {
    // 1. Dev sample mode (mirrors Figma frames when toggle is true)
    if (DEV_SAMPLE_STAFF_STATS) {
      return {
        getStaffRevenue: (period: StatsPeriod) => getSampleStaffRevenue(period),
        getStaffServices: () => SAMPLE_STAFF_SERVICES,
        getStaffServiceRevenue: (serviceId: string, period: StatsPeriod) =>
          getSampleStaffServiceRevenue(serviceId, period),
        getStaffClients: (period: StatsPeriod) => getSampleStaffClients(period),
        getStaffAppointments: (period: StatsPeriod) => getSampleStaffAppointments(period),
        homeSummary: {
          performanceChangePercent: 12,
          performanceTimeframe: 'Today',
        },
      };
    }

    // 2. Production / Stub mode: returns null / empty array (marked TODO: Backend)
    return {
      getStaffRevenue: () => null,
      getStaffServices: () => [],
      getStaffServiceRevenue: () => null,
      getStaffClients: () => null,
      getStaffAppointments: () => null,
      homeSummary: null,
    };
  }, []);

  return (
    <StaffStatisticsContext.Provider value={value}>
      {children}
    </StaffStatisticsContext.Provider>
  );
};

export function useStaffStatistics(): StaffStatisticsContextType {
  const context = useContext(StaffStatisticsContext);
  if (!context) {
    // Safe fallback if used outside provider
    return {
      getStaffRevenue: () => null,
      getStaffServices: () => [],
      getStaffServiceRevenue: () => null,
      getStaffClients: () => null,
      getStaffAppointments: () => null,
      homeSummary: null,
    };
  }
  return context;
}
