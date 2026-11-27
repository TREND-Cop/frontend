import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { bookingStore, BookingPaymentDetails } from '../utils/bookingStore';
import { pendingTimerStore } from '../utils/pendingTimerStore';
import { getServiceByIdOrName } from '../constants/serviceCatalog';
import { useUserContext } from './UserContext';
import { trendApi, getAuthToken, extractArray } from '../api/trendApi';

function toBackendBookingDate(displayDate: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(displayDate)) return displayDate;
  const parsed = Date.parse(displayDate);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

function toBackendBookingTime(displayTime: string): string {
  const m = displayTime.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return '10:00';
  let hour = parseInt(m[1], 10);
  const mins = m[2];
  const meridiem = m[3]?.toUpperCase();
  if (meridiem === 'PM' && hour < 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${mins}`;
}

function mapRemoteStatus(status?: string): AppointmentStatus {
  const s = (status || '').toLowerCase();
  if (s === 'upcoming' || s === 'accepted' || s === 'approved' || s === 'awaiting_arrival') {
    return 'approved';
  }
  if (s === 'in_progress' || s === 'ongoing') return 'ongoing';
  if (s === 'completed' || s === 'done') return 'completed';
  if (s === 'cancelled' || s === 'canceled' || s === 'declined') return 'cancelled';
  return 'pending';
}

function mapRemoteBooking(row: any): Appointment {
  const rawId = String(row.id || `apt_${Date.now()}`);
  const serviceName = row.service_name || row.service?.name || 'Service';
  const mappedStatus = mapRemoteStatus(row.status);
  const parsedCompletedAt = row.completed_at
    ? Date.parse(row.completed_at)
    : row.updated_at
    ? Date.parse(row.updated_at)
    : NaN;
  return {
    id: rawId,
    ticketNumber: row.ticket_number || row.reference || `TR-${rawId.slice(-5).toUpperCase()}`,
    status: mappedStatus,
    salonName: row.business_name || row.business?.name || 'TREND Salon',
    salonAddress: row.business_address || row.business?.address || '',
    salonImage: row.business_image || row.business?.image,
    serviceName,
    serviceImage: row.service_image || row.service?.images?.[0],
    duration: row.duration ? `${row.duration}min` : '30min',
    rating: row.rating ? String(row.rating) : '5.0',
    styleName: row.style_name || serviceName,
    specialist: {
      id: String(row.staff_id || row.staff?.id || 'sp-1'),
      name: row.staff_name || row.staff?.name || 'Specialist',
      role: row.staff_title || row.staff?.title || 'Specialist',
      rating: '5.0',
      avatarUri: row.staff_image || row.staff?.image,
    },
    date: row.date || new Date().toISOString().slice(0, 10),
    time: row.start_time || row.start || row.time || '10:00',
    basePrice: Number(row.price ?? row.base_price ?? row.total_price ?? 0),
    addOns: Array.isArray(row.addons)
      ? row.addons.map((a: any, idx: number) =>
          typeof a === 'string'
            ? { id: a, name: a, price: 0 }
            : {
                id: String(a?.id || idx),
                name: a?.name || 'Add-on',
                price: Number(a?.price || 0),
              }
        )
      : [],
    servicePackage: null,
    totalPrice: Number(row.total_price ?? row.total ?? row.price ?? 0),
    note: row.notes || '',
    serviceId: row.service_id ? String(row.service_id) : undefined,
    salonId: row.business_id ? String(row.business_id) : undefined,
    createdAt: row.created_at ? Date.parse(row.created_at) || Date.now() : Date.now(),
    completedAt:
      mappedStatus === 'completed'
        ? !Number.isNaN(parsedCompletedAt)
          ? parsedCompletedAt
          : Date.now()
        : undefined,
  };
}

const APPOINTMENTS_STORAGE_KEY = '@trend_appointments_v3';

export type AppointmentStatus = 'pending' | 'approved' | 'ongoing' | 'completed' | 'cancelled';

export interface BookingSpecialist {
  id: string;
  name: string;
  role: string;
  rating: string;
  avatarUri?: string;
  image?: any;
}

export interface BookingAddOn {
  id: string;
  name: string;
  price: number;
}

export interface BookingPackage {
  id: string;
  name: string;
  price: number;
  description?: string;
  images?: any[];
  features?: string[];
}

export interface Appointment {
  id: string;
  serviceId?: string;
  salonId?: string;
  ticketNumber: string;
  status: AppointmentStatus;
  salonName: string;
  salonAddress: string;
  salonImage?: string;
  serviceName: string;
  serviceImage?: any;
  duration?: string;
  rating?: string;
  styleName: string;
  specialist: BookingSpecialist;
  specialists?: BookingSpecialist[];
  addOnSpecialist?: BookingSpecialist;
  date: string;
  time: string;
  basePrice: number;
  addOns: BookingAddOn[];
  servicePackage: BookingPackage | null;
  totalPrice: number;
  note: string;
  paymentMethod?: 'bank_transfer' | 'card' | 'cash';
  paymentOption?: string;
  paymentDetails?: BookingPaymentDetails;
  createdAt: number;
  completedAt?: number;
  cancelledAt?: number;
  cancelReason?: string;
}

export interface BookingDraft {
  salonName: string;
  salonAddress: string;
  serviceName: string;
  styleName: string;
  date: string;
  time: string;
  basePrice: number;
  addOns: BookingAddOn[];
  servicePackage: BookingPackage | null;
  specialist: BookingSpecialist | null;
  note: string;
}

const DEFAULT_DRAFT: BookingDraft = {
  salonName: 'Hello! Fabulous',
  salonAddress: 'Jabi, lake mall abuja',
  serviceName: 'Acrylic nails',
  styleName: 'Almond Green Acrylic',
  date: 'Wednesday, Oct 24',
  time: '10:00 AM',
  basePrice: 12000,
  addOns: [],
  servicePackage: null,
  specialist: {
    id: 'sp-1',
    name: 'Sarah Jenkins',
    role: 'Senior Nail Artist',
    rating: '4.9',
  },
  note: '',
};

interface BookingContextType {
  draft: BookingDraft;
  updateDraft: (updates: Partial<BookingDraft>) => void;
  resetDraft: () => void;
  calculatedTotal: number;

  appointments: Appointment[];
  activeAppointment: Appointment | null;
  confirmBooking: (paymentDetailsOverride?: BookingPaymentDetails) => Promise<Appointment>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<void>;
  cancelAppointment: (id: string, reason?: string) => Promise<void>;
  clearAllAppointments: () => Promise<void>;
  getAppointment: (id: string) => Appointment | undefined;

  // Counters
  pendingCount: number;
  ongoingCount: number;
  completedCount: number;
  cancelledCount: number;
  allBookingsCount: number;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profileData } = useUserContext();
  const [draft, setDraft] = useState<BookingDraft>(DEFAULT_DRAFT);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Load saved appointments from AsyncStorage on app startup and hydrate from live backend
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        // Clean up legacy test data from previous storage versions
        await AsyncStorage.removeItem('@trend_appointments');
        await AsyncStorage.removeItem('@trend_appointments_v2');

        const stored = await AsyncStorage.getItem(APPOINTMENTS_STORAGE_KEY);
        let localList: Appointment[] = [];
        if (stored) {
          localList = JSON.parse(stored);
          setAppointments(localList);
        } else {
          setAppointments([]);
        }

        const token = await getAuthToken();
        if (token) {
          const res = await trendApi.bookings.list();
          if (res.ok && res.data) {
            const remoteRows = extractArray<any>(res.data, ['bookings', 'appointments']);
            if (remoteRows.length > 0) {
              const mapped = remoteRows.map(mapRemoteBooking);
              const existingIds = new Set(mapped.map((m) => m.id));
              const merged = [
                ...mapped,
                ...localList.filter((l) => !existingIds.has(l.id)),
              ];
              setAppointments(merged);
              AsyncStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(merged)).catch(
                () => {}
              );
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load appointments from storage:', err);
      }
    };
    loadAppointments();
  }, [profileData?.isLoggedIn]);

  // Save appointments to AsyncStorage
  const persistAppointments = useCallback(async (newList: Appointment[]) => {
    setAppointments(newList);
    try {
      await AsyncStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(newList));
    } catch (err) {
      console.warn('Failed to save appointments:', err);
    }
  }, []);

  // Background check for pending appointments: auto-transition to approved when 180s elapse
  useEffect(() => {
    if (appointments.length === 0) return;
    const checkPendingTimeouts = () => {
      const now = Date.now();
      let hasUpdates = false;
      const updated = appointments.map((apt) => {
        if (apt.status === 'pending') {
          const startTime = pendingTimerStore.getStartTime(apt.id) || apt.createdAt;
          if (startTime && now - startTime >= 180 * 1000) {
            hasUpdates = true;
            return { ...apt, status: 'approved' as AppointmentStatus };
          }
        }
        return apt;
      });
      if (hasUpdates) {
        persistAppointments(updated);
      }
    };

    const interval = setInterval(checkPendingTimeouts, 2000);
    return () => clearInterval(interval);
  }, [appointments, persistAppointments]);

  const updateDraft = useCallback((updates: Partial<BookingDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraft(DEFAULT_DRAFT);
  }, []);

  // Calculate dynamic pricing
  const calculatedTotal = useMemo(() => {
    const addOnsTotal = draft.addOns.reduce((sum, item) => sum + item.price, 0);
    const packageTotal = draft.servicePackage ? draft.servicePackage.price : 0;
    return draft.basePrice + addOnsTotal + packageTotal;
  }, [draft]);

  // Create real appointment on checkout
  const confirmBooking = useCallback(async (paymentDetailsOverride?: BookingPaymentDetails): Promise<Appointment> => {
    const randomTicketNum = Math.floor(10000 + Math.random() * 90000);
    const sName = bookingStore.getServiceName() || draft.serviceName || 'Acrylic nails';
    const sId = bookingStore.getServiceId();
    const catalogItem = getServiceByIdOrName(sId, sName);
    const resolvedImage =
      bookingStore.getServiceImage() ||
      catalogItem?.image ||
      (sName.toLowerCase().includes('nail') || sName.toLowerCase().includes('acrylic')
        ? require('../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg')
        : require('../../assets/images/services/men_haircut.png'));

    const sSpecialist = bookingStore.getSelectedSpecialist() || draft.specialist;
    const avatarUri =
      sSpecialist && 'avatarUri' in sSpecialist && sSpecialist.avatarUri
        ? sSpecialist.avatarUri
        : sSpecialist && 'image' in sSpecialist && typeof sSpecialist.image === 'string'
        ? sSpecialist.image
        : undefined;

    const specialistImage =
      sSpecialist && 'image' in sSpecialist ? sSpecialist.image : undefined;

    const specialist: BookingSpecialist = sSpecialist
      ? {
          id: sSpecialist.id,
          name: sSpecialist.name,
          role: sSpecialist.role,
          rating: sSpecialist.rating,
          avatarUri,
          image: specialistImage,
        }
      : {
          id: 'sp-1',
          name: 'Micheal Ureal',
          role: 'Nail Art Specialist',
          rating: '5.0',
        };

    const finalAddOns =
      bookingStore.getSelectedItems().length > 0
        ? bookingStore.getSelectedItems().map((a) => ({ id: a.id, name: a.name, price: a.price }))
        : [...draft.addOns];

    const selectedPkg = bookingStore.getSelectedPackage();
    const servicePackage = selectedPkg
      ? {
          id: selectedPkg.id,
          name: selectedPkg.name,
          price: selectedPkg.price,
          description: selectedPkg.description,
          images: selectedPkg.images,
          features: selectedPkg.features,
        }
      : draft.servicePackage;

    const finalTotal = bookingStore.getFinalTotal();
    const finalPrice =
      finalTotal > 0
        ? finalTotal
        : calculatedTotal > 0
        ? calculatedTotal
        : bookingStore.getBasePrice() || 12000;

    const effectivePaymentDetails: BookingPaymentDetails =
      paymentDetailsOverride ||
      bookingStore.getPaymentDetails() ||
      (() => {
        const type = bookingStore.getPaymentType();
        if (type === 'card') {
          return {
            method: 'card',
            methodTitle: 'Card Payment',
            cardBrand: 'Mastercard',
            cardLast4: '0938',
            transactionRef: `TRX-${randomTicketNum}`,
          };
        }
        if (type === 'cash') {
          return {
            method: 'cash',
            methodTitle: 'Cash',
            status: 'Pay at Salon',
            receiver: bookingStore.getSalonName() || 'Salon Front Desk',
          };
        }
        return {
          method: 'bank_transfer',
          methodTitle: 'Inter-Bank Transfer',
          accountName: 'TREND SECURE',
          accountNumber: '123456789',
          bankName: 'Zenith Bank',
        };
      })();

    const storeSpecialists = bookingStore.getSelectedSpecialists();
    const mappedSpecialists: BookingSpecialist[] =
      storeSpecialists.length > 0
        ? storeSpecialists.map((s) => ({
            id: s.id,
            name: s.name,
            role: s.role,
            rating: s.rating,
            avatarUri:
              'avatarUri' in s && s.avatarUri
                ? (s as any).avatarUri
                : typeof s.image === 'string'
                ? s.image
                : undefined,
            image: s.image,
          }))
        : [specialist];

    const storeAddOnSpec = bookingStore.getAddOnSpecialist();
    const mappedAddOnSpecialist: BookingSpecialist | undefined = storeAddOnSpec
      ? {
          id: storeAddOnSpec.id,
          name: storeAddOnSpec.name,
          role: storeAddOnSpec.role,
          rating: storeAddOnSpec.rating,
          avatarUri:
            'avatarUri' in storeAddOnSpec && (storeAddOnSpec as any).avatarUri
              ? (storeAddOnSpec as any).avatarUri
              : typeof storeAddOnSpec.image === 'string'
              ? storeAddOnSpec.image
              : undefined,
          image: storeAddOnSpec.image,
        }
      : undefined;

    let remoteBookingId: string | null = null;
    try {
      const token = await getAuthToken();
      if (token) {
        const rawSpecId = String(specialist.id || '');
        const isMockStaffId = !rawSpecId || /^(sp-|s\d+|spec_)/i.test(rawSpecId);
        const rawType = (bookingStore.getAppointmentType() || '').toLowerCase();
        const res = await trendApi.bookings.create({
          service_id: sId || sName,
          date: toBackendBookingDate(
            bookingStore.getAppointmentDate() || draft.date || 'Wednesday, Oct 24'
          ),
          start: toBackendBookingTime(
            bookingStore.getAppointmentTime() || draft.time || '10:00 AM'
          ),
          ...(isMockStaffId ? {} : { staff_id: rawSpecId }),
          addons: finalAddOns.map((a) => a.id),
          appointment_type: rawType.includes('home') ? 'home_service' : 'in_shop',
          notes: bookingStore.getSpecialistNote() || draft.note || '',
        });
        const createdId = res.data?.id || res.data?.booking?.id;
        if (res.ok && createdId) {
          remoteBookingId = String(createdId);
        }
      }
    } catch {
      // Keep local booking flow resilient if offline
    }

    const newAppointment: Appointment = {
      id: remoteBookingId || `apt_${Date.now()}`,
      serviceId: sId || undefined,
      salonId: bookingStore.getSalonId() || undefined,
      ticketNumber: `TR-${randomTicketNum}`,
      status: 'pending',
      salonName: bookingStore.getSalonName() || draft.salonName || 'Luminous Lux',
      salonAddress: bookingStore.getSalonAddress() || draft.salonAddress || 'Jabi, lake mall abuja',
      serviceName: sName,
      serviceImage: resolvedImage,
      duration: bookingStore.getDuration() || '24min',
      rating: bookingStore.getRating() || '4.9',
      styleName: draft.styleName || sName,
      specialist,
      specialists: mappedSpecialists,
      addOnSpecialist: mappedAddOnSpecialist,
      date: bookingStore.getAppointmentDate() || draft.date || 'Wednesday, Oct 24',
      time: bookingStore.getAppointmentTime() || draft.time || '10:00 AM',
      basePrice: bookingStore.getBasePrice() || draft.basePrice || 12000,
      addOns: finalAddOns,
      servicePackage,
      totalPrice: finalPrice,
      note: bookingStore.getSpecialistNote() || draft.note,
      paymentMethod: effectivePaymentDetails.method,
      paymentOption: effectivePaymentDetails.methodTitle,
      paymentDetails: effectivePaymentDetails,
      createdAt: Date.now(),
    };

    const updated = [newAppointment, ...appointments];
    await persistAppointments(updated);
    resetDraft();
    return newAppointment;
  }, [draft, calculatedTotal, appointments, persistAppointments, resetDraft]);

  const updateAppointmentStatus = useCallback(
    async (id: string, status: AppointmentStatus) => {
      const updated = appointments.map((apt) => {
        if (apt.id === id) {
          return {
            ...apt,
            status,
            completedAt: status === 'completed' ? Date.now() : apt.completedAt,
          };
        }
        return apt;
      });
      await persistAppointments(updated);
      if (status === 'completed') {
        getAuthToken()
          .then((token) => (token ? trendApi.bookings.approve(id) : null))
          .catch(() => {});
      }
    },
    [appointments, persistAppointments]
  );

  const cancelAppointment = useCallback(
    async (id: string, reason?: string) => {
      const updated = appointments.map((apt) => {
        if (apt.id === id) {
          return {
            ...apt,
            status: 'cancelled' as AppointmentStatus,
            cancelledAt: Date.now(),
            cancelReason: reason || 'User requested cancellation',
          };
        }
        return apt;
      });
      await persistAppointments(updated);
      getAuthToken()
        .then((token) =>
          token ? trendApi.bookings.cancel(id, reason || 'User requested cancellation') : null
        )
        .catch(() => {});
    },
    [appointments, persistAppointments]
  );

  const clearAllAppointments = useCallback(async () => {
    setAppointments([]);
    try {
      await AsyncStorage.removeItem(APPOINTMENTS_STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear appointments:', err);
    }
  }, []);

  const getAppointment = useCallback(
    (id: string) => {
      return appointments.find((apt) => apt.id === id);
    },
    [appointments]
  );

  // In Guest state, guests have no appointments because they must sign in before booking
  const userAppointments = useMemo(() => {
    if (!profileData?.isLoggedIn) return [];
    return appointments;
  }, [profileData?.isLoggedIn, appointments]);

  // Active appointment is the first pending or ongoing appointment
  const activeAppointment = useMemo(() => {
    return (
      userAppointments.find((apt) => apt.status === 'pending' || apt.status === 'approved' || apt.status === 'ongoing') ||
      null
    );
  }, [userAppointments]);

  const pendingCount = useMemo(
    () => userAppointments.filter((a) => a.status === 'pending' || a.status === 'approved').length,
    [userAppointments]
  );

  const ongoingCount = useMemo(
    () => userAppointments.filter((a) => a.status === 'ongoing').length,
    [userAppointments]
  );

  const completedCount = useMemo(
    () => userAppointments.filter((a) => a.status === 'completed').length,
    [userAppointments]
  );

  const cancelledCount = useMemo(
    () => userAppointments.filter((a) => a.status === 'cancelled').length,
    [userAppointments]
  );

  const allBookingsCount = userAppointments.length;

  return (
    <BookingContext.Provider
      value={{
        draft,
        updateDraft,
        resetDraft,
        calculatedTotal,
        appointments: userAppointments,
        activeAppointment,
        confirmBooking,
        updateAppointmentStatus,
        cancelAppointment,
        clearAllAppointments,
        getAppointment,
        pendingCount,
        ongoingCount,
        completedCount,
        cancelledCount,
        allBookingsCount,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
};
