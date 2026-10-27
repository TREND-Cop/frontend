import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { StaffAppointment } from '../types/staffAppointments';
import {
  DEV_SAMPLE_STAFF_APPOINTMENTS,
  generateSampleAppointments,
} from '../constants/staffAppointments.config';

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
  // Store starts empty by default unless DEV_SAMPLE_STAFF_APPOINTMENTS is true
  const [appointments, setAppointments] = useState<StaffAppointment[]>(() => {
    if (DEV_SAMPLE_STAFF_APPOINTMENTS) {
      return generateSampleAppointments();
    }
    return [];
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh handler with mock delay
  const refreshAppointments = useCallback(async () => {
    setIsRefreshing(true);

    // Mock fetch delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // TODO (Backend): Fetch fresh appointments from staff appointments endpoint
    if (DEV_SAMPLE_STAFF_APPOINTMENTS) {
      setAppointments(generateSampleAppointments());
    } else {
      setAppointments([]);
    }

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
