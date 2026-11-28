import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { StaffAppointment, StaffAppointmentStatus } from '../types/staffAppointments';
import { generateSampleAppointments } from '../constants/staffAppointments.config';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/providerStorage';
import { trendApi, getAuthToken, extractArray } from '../api/trendApi';
import { useStaffLoginStore } from './StaffLoginContext';

const DEFAULT_SERVICE_IMAGE = require('../../assets/images/appointments/hair_cut.jpg');

function mapBackendStatus(raw: string): StaffAppointmentStatus {
  const s = String(raw || '').toLowerCase();
  if (s === 'in_progress' || s === 'ongoing') return 'in-progress';
  if (s === 'completed') return 'completed';
  if (s === 'cancelled' || s === 'declined') return 'cancelled';
  return 'waiting';
}

function mapBackendStaffBooking(row: any): StaffAppointment {
  const status = mapBackendStatus(row.status);
  const mins = Number(row.duration || 60);
  const durationLabel =
    mins >= 60
      ? mins % 60 === 0
        ? `${mins / 60}hr`
        : `${Math.floor(mins / 60)}hr ${mins % 60}min`
      : `${mins}min`;
  const serviceImg =
    typeof row.service_image === 'string' && row.service_image.length > 0
      ? { uri: row.service_image }
      : DEFAULT_SERVICE_IMAGE;

  return {
    id: String(row.id),
    client: {
      name: row.client_name || 'Client',
      isNew: false,
      gender: 'Female',
      badge: 'Verified',
      membershipAgeText: 'TREND Client',
    },
    service: {
      category: row.service_name || row.category || 'Service',
      serviceName: row.service_name || 'Service',
      image: serviceImg,
      price: Number(row.price || 0),
      duration: durationLabel,
      rating: 5.0,
    },
    specialist: {
      name: row.staff_name || 'Specialist',
      role: row.staff_title || 'Specialist',
      rating: 5.0,
    },
    date: row.date || 'Today',
    time: row.start_time || row.start || '9:00am',
    type: row.appointment_type === 'home_service' ? 'Home Service' : 'In-Person',
    note: row.notes || '',
    status,
    startTime: Date.now() + 30 * 60 * 1000,
    startedAt: status === 'in-progress' ? Date.now() : undefined,
    completionTime: status === 'completed' ? Date.now() : undefined,
    cancellationTime: status === 'cancelled' ? Date.now() : undefined,
  };
}

export interface StaffAppointmentsContextType {
  appointments: StaffAppointment[];
  isRefreshing: boolean;
  refreshAppointments: () => Promise<void>;
  getAppointmentById: (id: string) => StaffAppointment | undefined;
  startAppointment: (id: string) => Promise<void>;
  completeAppointment: (id: string, durationText?: string) => void;
  waitingCount: number;
  inProgressCount: number;
  completedCount: number;
  cancelledCount: number;
}

const StaffAppointmentsContext = createContext<StaffAppointmentsContextType | undefined>(undefined);

export const StaffAppointmentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { verifiedCode } = useStaffLoginStore();
  const [appointments, setAppointments] = useState<StaffAppointment[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const hydrateFromBackendOrLocal = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const token = await getAuthToken('staff');
      if (token) {
        const res = await trendApi.bookings.list(undefined, 'staff');
        if (res.ok && res.data) {
          const rows = extractArray<any>(res.data, ['bookings', 'appointments']);
          const mapped = rows.map(mapBackendStaffBooking);
          setAppointments(mapped);
          await saveToStorage(STORAGE_KEYS.STAFF_APPOINTMENTS, mapped);
          return;
        }
      }
      // Unauthenticated preview fallback
      const saved = await loadFromStorage<StaffAppointment[] | null>(STORAGE_KEYS.STAFF_APPOINTMENTS, null);
      if (saved && saved.length > 0) {
        setAppointments(saved);
      } else {
        const sample = generateSampleAppointments();
        setAppointments(sample);
      }
    } catch {
      const saved = await loadFromStorage<StaffAppointment[] | null>(STORAGE_KEYS.STAFF_APPOINTMENTS, null);
      if (saved) setAppointments(saved);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Hydrate on mount and whenever a staff member logs in
  useEffect(() => {
    hydrateFromBackendOrLocal();
  }, [hydrateFromBackendOrLocal, verifiedCode]);

  const refreshAppointments = useCallback(async () => {
    await hydrateFromBackendOrLocal();
  }, [hydrateFromBackendOrLocal]);

  const getAppointmentById = useCallback(
    (id: string) => {
      return appointments.find((a) => a.id === id);
    },
    [appointments]
  );

  const startAppointment = useCallback(async (id: string) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id
          ? { ...apt, status: 'in-progress' as const, startedAt: Date.now() }
          : apt
      )
    );
    try {
      const token = await getAuthToken('staff');
      if (token) {
        await trendApi.bookings.start(id, 'staff');
      }
    } catch {
      // Non-fatal offline fallback
    }
  }, []);

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
    getAuthToken('staff')
      .then((token) => (token ? trendApi.bookings.complete(id, 'staff') : null))
      .catch(() => {});
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
      startAppointment,
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
      startAppointment,
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
