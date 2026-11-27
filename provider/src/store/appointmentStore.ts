import { useEffect, useState } from 'react';
import { trendApi, getAuthToken, extractArray } from '../api/trendApi';

let hasHydratedBookings = false;

export async function hydrateProviderBookingsFromApi(): Promise<void> {
  if (hasHydratedBookings) return;
  try {
    const token = await getAuthToken();
    if (!token) return;
    hasHydratedBookings = true;
    const res = await trendApi.bookings.list();
    if (!res.ok || !res.data) return;
    const rows = extractArray<any>(res.data, ['bookings', 'appointments']);
    if (rows.length === 0) return;

    const pending: AppointmentItem[] = [];
    const awaiting: AwaitingAppointmentItem[] = [];
    const ongoing: OngoingAppointmentItem[] = [];

    rows.forEach((b: any) => {
      const status = String(b.status || '').toLowerCase();
      const id = String(b.id || `bk_${Date.now()}`);
      const numericPrice = Number(b.total_price ?? b.price ?? 0);
      const formattedPrice = `₦${numericPrice.toLocaleString()}`;
      const baseFields = {
        id,
        title: b.service_name || b.service?.name || 'Service',
        duration: b.duration ? `${b.duration}min` : '1hr',
        rating: String(b.rating || '5.0'),
        price: formattedPrice,
        numericPrice,
        image:
          b.service_image ||
          b.service?.images?.[0] ||
          require('../../assets/images/appointments/hair_cut.jpg'),
        clientName: b.client_name || b.client?.name || 'Client',
        clientStatus: 'Verified Client',
        specialist: b.staff_name || b.staff?.name || 'Specialist',
        specialistRole: b.staff_title || b.staff?.title || 'Specialist',
        staff: b.staff_name || b.staff?.name || 'Specialist',
        customerType: 'verified' as const,
        paymentMethod: (b.payment_method === 'cash' ? 'cash' : 'transfer') as 'cash' | 'transfer',
        appointmentType: (b.appointment_type === 'home_service' ? 'home-service' : 'in-person') as
          | 'in-person'
          | 'home-service',
        bookedPackage: 'basic' as const,
      };

      if (status === 'in_progress' || status === 'ongoing') {
        ongoing.push({
          ...baseFields,
          status: 'in-progress',
          statusText: 'Appointment In-Progress',
          elapsedTime: '0:00:00',
          appointmentDate: b.date || 'Today',
          appointmentTime: b.start || 'Now',
          note: b.notes || '',
        });
      } else if (status === 'awaiting_arrival' || status === 'upcoming' || status === 'accepted') {
        awaiting.push({
          ...baseFields,
          status: 'awaiting',
          statusText: 'Awaiting client arrival',
          appointmentDate: b.date || 'Today',
          appointmentTime: b.start || 'Now',
          note: b.notes || '',
        });
      } else if (status === 'pending') {
        pending.push({
          ...baseFields,
          countdown: '2:59',
          statusText: 'Waiting for you to Accept',
          date: b.date || '',
          time: b.start || '',
        });
      }
    });

    if (pending.length > 0) {
      appointmentsState = [...pending, ...appointmentsState.filter((a) => !pending.some((p) => p.id === a.id))];
      notify();
    }
    if (awaiting.length > 0) {
      awaitingAppointmentsState = [
        ...awaiting,
        ...awaitingAppointmentsState.filter((a) => !awaiting.some((p) => p.id === a.id)),
      ];
      notifyAwaiting();
    }
    if (ongoing.length > 0) {
      ongoingAppointmentsState = [
        ...ongoing,
        ...ongoingAppointmentsState.filter((a) => !ongoing.some((p) => p.id === a.id)),
      ];
      notifyOngoing();
    }
  } catch {
    // Keep local store intact if offline
  }
}

export interface AppointmentItem {
  id: string;
  title: string;
  duration: string;
  rating: string;
  price: string;
  numericPrice?: number;
  countdown: string;
  statusText: string;
  image: any;
  clientName?: string;
  clientStatus?: string;
  gender?: string;
  membership?: string;
  staff?: string;
  specialistRole?: string;
  date?: string;
  time?: string;
  customerType?: 'verified' | 'non-verified';
  paymentMethod?: 'cash' | 'transfer';
  appointmentType?: 'in-person' | 'home-service';
  bookedPackage?: 'basic' | 'premium' | 'exclusive';
  paymentType?: string;
  appointmentCost?: string;
  ticketNumber?: string;
  packagePrice?: string;
  total?: string;
}

export const DEFAULT_INITIAL_APPOINTMENTS: AppointmentItem[] = [
  {
    id: '1',
    title: 'Hair cut',
    duration: '1hr',
    rating: '4.8',
    price: '₦22,700',
    numericPrice: 22700,
    countdown: '2:59',
    statusText: 'Waiting for you to Accept',
    image: require('../../assets/images/appointments/hair_cut.jpg'),
    clientName: 'Ayobami Isaac',
    clientStatus: 'New Client',
    gender: 'Male',
    membership: '5 Days ago',
    staff: 'Bisola Olarewaju',
    specialistRole: 'Nail Artist',
    date: 'Nov 19, 2026',
    time: '9:30am',
    customerType: 'non-verified',
    paymentMethod: 'transfer',
    paymentType: 'Opay (Transfer)',
    appointmentType: 'home-service',
    bookedPackage: 'basic',
  },
  {
    id: '2',
    title: 'Male facial',
    duration: '1hr 15m',
    rating: '4.7',
    price: '₦32,500',
    numericPrice: 32500,
    countdown: '2:59',
    statusText: 'Waiting for you to Accept',
    image: require('../../assets/images/appointments/hair_cut.jpg'),
    clientName: 'Chukwuma Eze',
    clientStatus: 'New Client',
    gender: 'Male',
    membership: 'Joined 3 months ago',
    staff: 'Chioma Okeke',
    specialistRole: 'Esthetician',
    date: 'Today, 3:30 PM',
    time: '03:30 PM',
    customerType: 'verified',
    paymentMethod: 'cash',
    appointmentType: 'in-person',
    bookedPackage: 'premium',
  },
  {
    id: '3',
    title: 'Nail art',
    duration: '45m',
    rating: '4.9',
    price: '₦18,500',
    numericPrice: 18500,
    countdown: '2:59',
    statusText: 'Waiting for you to Accept',
    image: require('../../assets/images/appointments/nail_art.png'),
    clientName: 'Fatima Bello',
    clientStatus: 'Subscriber Client',
    gender: 'Female',
    membership: 'Joined 1 mo ago',
    staff: 'Ahsia Musa',
    specialistRole: 'Nail Technician',
    date: 'Today, 4:15 PM',
    time: '04:15 PM',
    customerType: 'verified',
    paymentMethod: 'transfer',
    appointmentType: 'in-person',
    bookedPackage: 'basic',
  },
  {
    id: '4',
    title: 'Men Brade',
    duration: '2hrs',
    rating: '4.6',
    price: '₦28,000',
    numericPrice: 28000,
    countdown: '2:59',
    statusText: 'Waiting for you to Accept',
    image: require('../../assets/images/appointments/men_braids.jpg'),
    clientName: 'David Adeleke',
    clientStatus: 'Verified Client',
    gender: 'Male',
    membership: 'Joined 6 months ago',
    staff: 'Bisola Olarewaju',
    specialistRole: 'Master Stylist',
    date: 'Tomorrow, 10:00 AM',
    time: '10:00 AM',
    customerType: 'verified',
    paymentMethod: 'transfer',
    appointmentType: 'home-service',
    bookedPackage: 'exclusive',
  },
  {
    id: '5',
    title: 'Hair wash',
    duration: '40m',
    rating: '4.5',
    price: '₦15,000',
    numericPrice: 15000,
    countdown: '2:59',
    statusText: 'Waiting for you to Accept',
    image: require('../../assets/images/appointments/hair_cut.jpg'),
    clientName: 'Blessing Johnson',
    clientStatus: 'New Client',
    gender: 'Female',
    membership: 'Joined 2 days ago',
    staff: 'Chioma Okeke',
    specialistRole: 'Hair Stylist',
    date: 'Tomorrow, 11:30 AM',
    time: '11:30 AM',
    customerType: 'non-verified',
    paymentMethod: 'cash',
    appointmentType: 'in-person',
    bookedPackage: 'basic',
  },
  {
    id: '6',
    title: 'Hair cut & Styling',
    duration: '1hr 30m',
    rating: '5.0',
    price: '₦35,000',
    numericPrice: 35000,
    countdown: '2:59',
    statusText: 'Waiting for you to Accept',
    image: require('../../assets/images/appointments/hair_cut.jpg'),
    clientName: 'Babajide Sanwo',
    clientStatus: 'Verified Client',
    gender: 'Male',
    membership: 'Joined 1 yr ago',
    staff: 'Tunde Adebayo',
    specialistRole: 'Master Barber',
    date: 'Tomorrow, 01:00 PM',
    time: '01:00 PM',
    customerType: 'verified',
    paymentMethod: 'transfer',
    appointmentType: 'in-person',
    bookedPackage: 'premium',
  },
  {
    id: '7',
    title: 'Hair wash & Steam',
    duration: '1hr',
    rating: '4.4',
    price: '₦28,000',
    numericPrice: 28000,
    countdown: '2:59',
    statusText: 'Waiting for you to Accept',
    image: require('../../assets/images/appointments/hair_cut.jpg'),
    clientName: 'Amina Mohammed',
    clientStatus: 'Non Subscriber',
    gender: 'Female',
    membership: 'Joined 3 wks ago',
    staff: 'Chioma Okeke',
    specialistRole: 'Hair Specialist',
    date: 'Tomorrow, 02:30 PM',
    time: '02:30 PM',
    customerType: 'non-verified',
    paymentMethod: 'cash',
    appointmentType: 'home-service',
    bookedPackage: 'basic',
  },
  {
    id: '8',
    title: 'Deep Hair Conditioning',
    duration: '1hr 15m',
    rating: '4.8',
    price: '₦48,000',
    numericPrice: 48000,
    countdown: '2:59',
    statusText: 'Waiting for you to Accept',
    image: require('../../assets/images/appointments/hair_cut.jpg'),
    clientName: 'Halima Yusuf',
    clientStatus: 'Subscriber Client',
    gender: 'Female',
    membership: 'Joined 4 months ago',
    staff: 'Chioma Okeke',
    specialistRole: 'Hair Specialist',
    date: 'Thu, 11 May, 10:00 AM',
    time: '10:00 AM',
    customerType: 'verified',
    paymentMethod: 'transfer',
    appointmentType: 'in-person',
    bookedPackage: 'exclusive',
  },
  {
    id: '9',
    title: 'Luxury Manicure',
    duration: '50m',
    rating: '4.9',
    price: '₦25,000',
    numericPrice: 25000,
    countdown: '2:59',
    statusText: 'Waiting for you to Accept',
    image: require('../../assets/images/appointments/nail_art.png'),
    clientName: 'Ngozi Okonjo',
    clientStatus: 'New Client',
    gender: 'Female',
    membership: 'Joined 8 months ago',
    staff: 'Ahsia Musa',
    specialistRole: 'Senior Nail Artist',
    date: 'Thu, 11 May, 01:30 PM',
    time: '01:30 PM',
    customerType: 'verified',
    paymentMethod: 'cash',
    appointmentType: 'in-person',
    bookedPackage: 'premium',
  },
  {
    id: '10',
    title: 'Pedicure & Spa',
    duration: '1hr',
    rating: '4.7',
    price: '₦27,000',
    numericPrice: 27000,
    countdown: '2:59',
    statusText: 'Waiting for you to Accept',
    image: require('../../assets/images/appointments/nail_art.png'),
    clientName: 'Emeka Nnamdi',
    clientStatus: 'Verified Client',
    gender: 'Male',
    membership: 'Joined 5 months ago',
    staff: 'Adaeze Nwosu',
    specialistRole: 'Senior Pedicurist',
    date: 'Thu, 11 May, 03:00 PM',
    time: '03:00 PM',
    customerType: 'verified',
    paymentMethod: 'transfer',
    appointmentType: 'in-person',
    bookedPackage: 'basic',
  },
];

// In-memory state with listeners
let appointmentsState: AppointmentItem[] = [...DEFAULT_INITIAL_APPOINTMENTS];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export const appointmentStore = {
  getAppointments: (): AppointmentItem[] => {
    return appointmentsState;
  },

  getAppointmentById: (id: string): AppointmentItem | undefined => {
    return appointmentsState.find((item) => item.id === id);
  },

  cancelAppointment: (id: string): boolean => {
    const prevCount = appointmentsState.length;
    appointmentsState = appointmentsState.filter((item) => item.id !== id);
    if (appointmentsState.length !== prevCount) {
      notify();
      getAuthToken()
        .then((token) => (token ? trendApi.bookings.cancel(id, 'Cancelled by business') : null))
        .catch(() => {});
      return true;
    }
    return false;
  },

  resetAppointments: () => {
    appointmentsState = [...DEFAULT_INITIAL_APPOINTMENTS];
    notify();
  },
};

// ── Ongoing Appointments Store ───────────────────────────────────────────────

export interface OngoingAppointmentItem {
  id: string;
  title: string;
  duration: string;
  rating: string;
  price: string;
  numericPrice: number;
  image: any;
  status: 'in-progress';
  statusText: string;
  gender?: string;
  membership?: string;
  clientName: string;
  clientStatus: string;
  specialist: string;
  specialistRole: string;
  staff: string;
  customerType: 'verified' | 'non-verified';
  paymentMethod: 'cash' | 'transfer';
  appointmentType: 'in-person' | 'home-service';
  bookedPackage: 'basic' | 'premium' | 'exclusive';
  elapsedTime: string;
  appointmentDate?: string;
  appointmentTime?: string;
  note?: string;
}

export const DEFAULT_ONGOING_APPOINTMENTS: OngoingAppointmentItem[] = [
  {
    id: 'ongoing-1',
    title: 'Crystal Nail Art',
    duration: '1hr',
    rating: '4.8',
    price: '₦22,700',
    numericPrice: 22700,
    image: require('../../assets/images/appointments/nail_art.png'),
    status: 'in-progress',
    statusText: 'Appointment In-Progress',
    clientName: 'Ayobami Isaac',
    clientStatus: 'Verified Client',
    gender: 'Male',
    membership: 'Joined 2 wks ago',
    specialist: 'Bisola Olarewaju',
    specialistRole: 'Master Stylist',
    staff: 'Chioma Okafor',
    customerType: 'verified',
    paymentMethod: 'transfer',
    appointmentType: 'home-service',
    bookedPackage: 'basic',
    elapsedTime: '1:25:30',
    appointmentDate: 'Nov 19, 2026',
    appointmentTime: '9:30am',
    note: '',
  },
  {
    id: 'ongoing-2',
    title: 'Luxury Men Grooming & Trim',
    duration: '1hr 30m',
    rating: '4.9',
    price: '₦35,000',
    numericPrice: 35000,
    image: require('../../assets/images/appointments/hair_cut.jpg'),
    status: 'in-progress',
    statusText: 'Appointment In-Progress',
    clientName: 'Fabulous Jude',
    clientStatus: 'New Client',
    gender: 'Male',
    membership: 'Joined 4 months ago',
    specialist: 'Aisha Bello',
    specialistRole: 'Master Barber',
    staff: 'Aisha Bello',
    customerType: 'verified',
    paymentMethod: 'cash',
    appointmentType: 'in-person',
    bookedPackage: 'premium',
    elapsedTime: '0:45:10',
    appointmentDate: 'Nov 19, 2026',
    appointmentTime: '10:30am',
    note: 'Please keep the side burns sharp.',
  },
  {
    id: 'ongoing-3',
    title: 'Pedicure & Foot Reflexology',
    duration: '50m',
    rating: '4.7',
    price: '₦28,000',
    numericPrice: 28000,
    image: require('../../assets/images/appointments/nail_art.png'),
    status: 'in-progress',
    statusText: 'Appointment In-Progress',
    clientName: 'Kelechi Amadi',
    clientStatus: 'Subscriber Client',
    gender: 'Female',
    membership: 'Joined 1 mo ago',
    specialist: 'Tunde Adebayo',
    specialistRole: 'Senior Pedicurist',
    staff: 'Tunde Adebayo',
    customerType: 'verified',
    paymentMethod: 'transfer',
    appointmentType: 'in-person',
    bookedPackage: 'exclusive',
    elapsedTime: '0:18:40',
    appointmentDate: 'Nov 19, 2026',
    appointmentTime: '11:15am',
    note: 'Regular polish finish.',
  },
];

let ongoingAppointmentsState: OngoingAppointmentItem[] = [...DEFAULT_ONGOING_APPOINTMENTS];
const ongoingListeners = new Set<() => void>();

function notifyOngoing() {
  ongoingListeners.forEach((listener) => listener());
}

export const ongoingAppointmentStore = {
  getOngoingAppointments: (): OngoingAppointmentItem[] => {
    return ongoingAppointmentsState;
  },

  getOngoingAppointmentById: (id: string): OngoingAppointmentItem | undefined => {
    return ongoingAppointmentsState.find((item) => item.id === id);
  },

  clearOngoingAppointments: () => {
    ongoingAppointmentsState = [];
    notifyOngoing();
  },

  refreshOngoingAppointments: () => {
    ongoingAppointmentsState = [...DEFAULT_ONGOING_APPOINTMENTS];
    notifyOngoing();
  },

  setOngoingAppointments: (items: OngoingAppointmentItem[]) => {
    ongoingAppointmentsState = [...items];
    notifyOngoing();
  },

  addOngoingAppointment: (item: Partial<OngoingAppointmentItem>) => {
    const newItem: OngoingAppointmentItem = {
      id: item.id || `ongoing-${Date.now()}`,
      title: item.title || 'Men Brade',
      duration: item.duration || '1hr',
      rating: String(item.rating || '3.6'),
      price: item.price || '₦14,200',
      numericPrice: item.numericPrice || 14200,
      image: item.image || require('../../assets/images/appointments/men_braids.jpg'),
      status: 'in-progress',
      statusText: 'Appointment In-Progress',
      clientName: item.clientName || 'Jude Fabulous',
      clientStatus: item.clientStatus || 'Returning Client',
      gender: item.gender || 'Male',
      membership: item.membership || 'Joined 5 days ago',
      specialist: item.specialist || 'Bisola Olarewaju',
      specialistRole: item.specialistRole || 'Hair Stylist',
      staff: item.staff || 'Bisola Olarewaju',
      customerType: item.customerType || 'verified',
      paymentMethod: item.paymentMethod || 'transfer',
      appointmentType: item.appointmentType || 'in-person',
      bookedPackage: item.bookedPackage || 'basic',
      elapsedTime: '1:25:30',
      appointmentDate: item.appointmentDate || 'Today',
      appointmentTime: item.appointmentTime || 'Now',
      note: item.note || '',
    };
    ongoingAppointmentsState = [newItem, ...ongoingAppointmentsState.filter((a) => a.id !== newItem.id)];
    notifyOngoing();
    getAuthToken()
      .then((token) => (token ? trendApi.bookings.start(newItem.id) : null))
      .catch(() => {});
  },
};

export function useOngoingAppointments() {
  const [ongoingAppointments, setOngoingAppointments] = useState<OngoingAppointmentItem[]>(ongoingAppointmentsState);

  useEffect(() => {
    hydrateProviderBookingsFromApi();
    const handleUpdate = () => {
      setOngoingAppointments([...ongoingAppointmentsState]);
    };
    ongoingListeners.add(handleUpdate);
    return () => {
      ongoingListeners.delete(handleUpdate);
    };
  }, []);

  return {
    ongoingAppointments,
    refreshOngoingAppointments: ongoingAppointmentStore.refreshOngoingAppointments,
    clearOngoingAppointments: ongoingAppointmentStore.clearOngoingAppointments,
    getOngoingAppointmentById: ongoingAppointmentStore.getOngoingAppointmentById,
  };
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>(appointmentsState);

  useEffect(() => {
    hydrateProviderBookingsFromApi();
    const handleUpdate = () => {
      setAppointments([...appointmentsState]);
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return {
    appointments,
    cancelAppointment: appointmentStore.cancelAppointment,
    resetAppointments: appointmentStore.resetAppointments,
    getAppointmentById: appointmentStore.getAppointmentById,
  };
}

// ── Awaiting Client Appointments Store ──────────────────────────────────────

export interface AwaitingAppointmentItem {
  id: string;
  title: string;
  duration: string;
  rating: string;
  price: string;
  numericPrice: number;
  image: any;
  status: 'awaiting';
  statusText: string;
  clientName: string;
  clientStatus: string;
  gender?: string;
  membership?: string;
  specialist: string;
  specialistRole: string;
  staff: string;
  customerType: 'verified' | 'non-verified';
  paymentMethod: 'cash' | 'transfer';
  appointmentType: 'in-person' | 'home-service';
  bookedPackage: 'basic' | 'premium' | 'exclusive';
  appointmentDate?: string;
  appointmentTime?: string;
  note?: string;
}

export const DEFAULT_AWAITING_APPOINTMENTS: AwaitingAppointmentItem[] = [
  {
    id: 'awaiting-1',
    title: 'Crystal Nail Art',
    duration: '1hr',
    rating: '3.5',
    price: '₦22,700',
    numericPrice: 22700,
    image: require('../../assets/images/appointments/nail_art.png'),
    status: 'awaiting',
    statusText: 'Awaiting client arrival',
    clientName: 'Ayobami Isaac',
    clientStatus: 'Verified Client',
    gender: 'Female',
    membership: 'Joined 2 wks ago',
    specialist: 'Bisola Olarewaju',
    specialistRole: 'Master Stylist',
    staff: 'Bisola Olarewaju',
    customerType: 'verified',
    paymentMethod: 'transfer',
    appointmentType: 'in-person',
    bookedPackage: 'basic',
    appointmentDate: 'Nov 19, 2026',
    appointmentTime: '9:30am',
    note: 'Special crystal glitter overlay.',
  },
];

let awaitingAppointmentsState: AwaitingAppointmentItem[] = [...DEFAULT_AWAITING_APPOINTMENTS];
const awaitingListeners = new Set<() => void>();

function notifyAwaiting() {
  awaitingListeners.forEach((listener) => listener());
}

export const awaitingAppointmentStore = {
  getAwaitingAppointments: (): AwaitingAppointmentItem[] => {
    return awaitingAppointmentsState;
  },

  getAwaitingAppointmentById: (id: string): AwaitingAppointmentItem | undefined => {
    return awaitingAppointmentsState.find((item) => item.id === id);
  },

  cancelAwaitingAppointment: (id: string): boolean => {
    const prevCount = awaitingAppointmentsState.length;
    awaitingAppointmentsState = awaitingAppointmentsState.filter((item) => item.id !== id);
    if (awaitingAppointmentsState.length !== prevCount) {
      notifyAwaiting();
      getAuthToken()
        .then((token) => (token ? trendApi.bookings.cancel(id, 'Cancelled by business') : null))
        .catch(() => {});
      return true;
    }
    return false;
  },

  clearAwaitingAppointments: () => {
    awaitingAppointmentsState = [];
    notifyAwaiting();
  },

  refreshAwaitingAppointments: () => {
    awaitingAppointmentsState = [...DEFAULT_AWAITING_APPOINTMENTS];
    notifyAwaiting();
  },

  setAwaitingAppointments: (items: AwaitingAppointmentItem[]) => {
    awaitingAppointmentsState = [...items];
    notifyAwaiting();
  },
};

export function useAwaitingAppointments() {
  const [awaitingAppointments, setAwaitingAppointments] = useState<AwaitingAppointmentItem[]>(awaitingAppointmentsState);

  useEffect(() => {
    hydrateProviderBookingsFromApi();
    const handleUpdate = () => {
      setAwaitingAppointments([...awaitingAppointmentsState]);
    };
    awaitingListeners.add(handleUpdate);
    return () => {
      awaitingListeners.delete(handleUpdate);
    };
  }, []);

  return {
    awaitingAppointments,
    cancelAwaitingAppointment: awaitingAppointmentStore.cancelAwaitingAppointment,
    refreshAwaitingAppointments: awaitingAppointmentStore.refreshAwaitingAppointments,
    clearAwaitingAppointments: awaitingAppointmentStore.clearAwaitingAppointments,
    getAwaitingAppointmentById: awaitingAppointmentStore.getAwaitingAppointmentById,
  };
}

