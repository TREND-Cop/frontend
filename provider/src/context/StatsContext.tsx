import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export type StatsPeriod =
  | { kind: 'day'; date: Date }
  | { kind: 'year'; year: number };

export interface StatsContextType {
  getPeriod: (sectionId: string) => StatsPeriod;
  setPeriod: (sectionId: string, period: StatsPeriod) => void;
  activeSheetSectionId: string | null;
  openDateSheet: (sectionId: string) => void;
  closeDateSheet: () => void;
  resetAllPeriods: () => void;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Map of sectionId -> StatsPeriod
  const [periods, setPeriods] = useState<Record<string, StatsPeriod>>({});
  // Tracks which section opened the shared DateFilterSheet modal
  const [activeSheetSectionId, setActiveSheetSectionId] = useState<string | null>(null);

  const getPeriod = useCallback(
    (sectionId: string): StatsPeriod => {
      if (periods[sectionId]) {
        return periods[sectionId];
      }
      // Default is today (device date, local time)
      return { kind: 'day', date: new Date() };
    },
    [periods]
  );

  const setPeriod = useCallback((sectionId: string, period: StatsPeriod) => {
    setPeriods((prev) => ({
      ...prev,
      [sectionId]: period,
    }));
  }, []);

  const openDateSheet = useCallback((sectionId: string) => {
    setActiveSheetSectionId(sectionId);
  }, []);

  const closeDateSheet = useCallback(() => {
    setActiveSheetSectionId(null);
  }, []);

  const resetAllPeriods = useCallback(() => {
    setPeriods({});
    setActiveSheetSectionId(null);
  }, []);

  const value = useMemo(
    () => ({
      getPeriod,
      setPeriod,
      activeSheetSectionId,
      openDateSheet,
      closeDateSheet,
      resetAllPeriods,
    }),
    [getPeriod, setPeriod, activeSheetSectionId, openDateSheet, closeDateSheet, resetAllPeriods]
  );

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>;
};

/**
 * Hook to access and update a specific section's period.
 * Example: const { period, setPeriod, openDateSheet } = useStatsPeriod('revenue.total');
 */
export function useStatsPeriod(sectionId: string) {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStatsPeriod must be used within a StatsProvider');
  }

  const period = context.getPeriod(sectionId);
  const setPeriod = useCallback(
    (p: StatsPeriod) => {
      context.setPeriod(sectionId, p);
    },
    [context, sectionId]
  );

  const openDateSheet = useCallback(() => {
    context.openDateSheet(sectionId);
  }, [context, sectionId]);

  return {
    period,
    setPeriod,
    openDateSheet,
  };
}

export function useStatsContext() {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStatsContext must be used within a StatsProvider');
  }
  return context;
}
