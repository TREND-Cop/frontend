import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { StaffAppointment } from '../types/staffAppointments';
import {
  DEV_SAMPLE_STAFF_APPOINTMENTS,
  generateSampleAppointments,
} from '../constants/staffAppointments.config';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/providerStorage';

export interface StaffAppointmentsContextType {
  appointments: StaffAppointment[];
  isRefreshing: boolean;
  refreshAppointments: () => Promise<void>;
  getAppointmentById: (id: string) => StaffAppointment | undefined;
  completeAppointment: (id: string, durationText?: string) => void;
  waitingCount: number;
  inProgressCount: number;
  completedCount: number;
  cancelledCount: number;
}

const StaffAppointmentsContext = createContext<StaffAppointmentsContextType | undefined>(undefined);

export const StaffAppointmentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Store starts with sample appointments populated for reference across all 4 screens
  const [appointments, setAppointments] = useState<StaffAppointment[]>(() => {
    return generateSampleAppointments();
  });

  // Hydrate staff appointments from storage on mount (guaranteeing all 4 screens are populated)
  useEffect(() => {
    let isMounted = true;
    loadFromStorage<StaffAppointment[] | null>(STORAGE_KEYS.STAFF_APPOINTMENTS, null).then((saved) => {
      if (isMounted) {
        if (saved && saved.length > 0) {
          const hasWaiting = saved.some((a) => a.status === 'waiting');
          const hasInProgress = saved.some((a) => a.status === 'in-progress');
          const hasCompleted = saved.some((a) => a.status === 'completed');
          const hasCancelled = saved.some((a) => a.status === 'cancelled');
          if (hasWaiting && hasInProgress && hasCompleted && hasCancelled) {
            setAppointments(saved);
            return;
          }
        }
        const sample = generateSampleAppointments();
        setAppointments(sample);
        saveToStorage(STORAGE_KEYS.STAFF_APPOINTMENTS, sample);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Persist appointments on updates
  useEffect(() => {
    if (appointments.length > 0) {
      saveToStorage(STORAGE_KEYS.STAFF_APPOINTMENTS, appointments);
    }
  }, [appointments]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh handler with mock delay
  const refreshAppointments = useCallback(async () => {
    setIsRefreshing(true);

    // Mock fetch delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Refresh with sample appointments
    const fresh = generateSampleAppointments();
    setAppointments(fresh);
    saveToStorage(STORAGE_KEYS.STAFF_APPOINTMENTS, fresh);

    setIsRefreshing(false);
  }, []);

  const getAppointmentById = useCallback(
    (id: string) => {
      return appointments.find((a) => a.id === id);
    },
    [appointments]
  );

  const completeAppointment = useCallback((id: string, durationText?: string) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id
          ? {
              ...apt,
              status: 'completed' as const,
              completionTime: Date.now(),
              actualDurationText: durationText || apt.actualDurationText || '00:00:00',
            }
          : apt
      )
    );
  }, []);

  const waitingCount = useMemo(() => {
    return appointments.filter((a) => a.status === 'waiting').length;
  }, [appointments]);

  const inProgressCount = useMemo(() => {
    return appointments.filter((a) => a.status === 'in-progress').length;
  }, [appointments]);

  const completedCount = useMemo(() => {
    return appointments.filter((a) => a.status === 'completed').length;
  }, [appointments]);

  const cancelledCount = useMemo(() => {
    return appointments.filter((a) => a.status === 'cancelled').length;
  }, [appointments]);

  const value = useMemo(
    () => ({
      appointments,
      isRefreshing,
      refreshAppointments,
      getAppointmentById,
      completeAppointment,
      waitingCount,
      inProgressCount,
      completedCount,
      cancelledCount,
    }),
    [
      appointments,
      isRefreshing,
      refreshAppointments,
      getAppointmentById,
      completeAppointment,
      waitingCount,
      inProgressCount,
      completedCount,
      cancelledCount,
    ]
  );

  return (
    <StaffAppointmentsContext.Provider value={value}>

      {children}
    </StaffAppointmentsContext.Provider>
  );
};

export function useStaffAppointments(): StaffAppointmentsContextType {
  const ctx = useContext(StaffAppointmentsContext);
  if (!ctx) {
    throw new Error('useStaffAppointments must be used within a StaffAppointmentsProvider');
  }
  return ctx;
}

export default StaffAppointmentsContext;
