import { useState, useEffect } from 'react';

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
  customerType?: 'verified' | 'non-verified';
  paymentMethod?: 'cash' | 'transfer';
  appointmentType?: 'in-person' | 'home-service';
  bookedPackage?: 'basic' | 'premium' | 'exclusive';
}

export const DEFAULT_INITIAL_APPOINTMENTS: AppointmentItem[] = [
  {
    id: '1',
    title: 'Hair cut',
    duration: '1hr',
    rating: '3.5',
    price: '₦22,700',
    numericPrice: 22700,
    countdown: '2:59',
    statusText: 'Waiting for you to Accept',
    image: require('../../assets/images/appointments/hair_cut.jpg'),
    clientName: 'Ayobami Isaac',
    clientStatus: 'New Client',
    gender: 'Male',
    membership: '5 Days ago',
    staff: 'Tunde',
    customerType: 'verified',
    paymentMethod: 'transfer',
    appointmentType: 'in-person',
    bookedPackage: 'basic',
  },
  {
    id: '2',
    title: 'Male facial',
    duration: '1hr',
    rating: '3.5',
    price: '₦22,700',
    numericPrice: 22700,
    countdown: '2:59',
    statusText: 'Waiting for you to Accept',
    image: require('../../assets/images/appointments/hair_cut.jpg'),
    clientName: 'Ayobami Isaac',
    clientStatus: 'New Client',
    gender: 'Male',
    membership: '5 Days ago',
    staff: 'Chioma',
    customerType: 'verified',
    paymentMethod: 'cash',
    appointmentType: 'in-person',
    bookedPackage: 'basic',
  },
  {
    id: '3',
    title: 'Nail art',
    duration: '1hr',
    rating: '3.5',
    price: '₦22,700',
    numericPrice: 22700,
    countdown: '2:59',
    statusText: 'Waiting for you to Accept',
    image: require('../../assets/images/appointments/nail_art.png'),
    clientName: 'Ayobami Isaac',
    clientStatus: 'New Client',
    gender: 'Male',
    membership: '5 Days ago',
    staff: 'Ahsia',
    customerType: 'verified',
    paymentMethod: 'transfer',
    appointmentType: 'in-person',
    bookedPackage: 'basic',
  },
  {
    id: '4',
    title: 'Men Brade',
    duration: '1hr',
    rating: '3.6',
    price: '₦14,200',
    numericPrice: 14200,
    countdown: '2:59',
    statusText: 'Waiting for you to Accept',
    image: require('../../assets/images/appointments/men_braids.jpg'),
    clientName: 'Ayobami Isaac',
    clientStatus: 'New Client',
    gender: 'Male',
    membership: '5 Days ago',
    staff: 'Bisola Olarewaju',
    customerType: 'verified',
    paymentMethod: 'transfer',
    appointmentType: 'home-service',
    bookedPackage: 'basic',
  },
  {
    id: '5',
    title: 'Hair wash',
    duration: '1hr',
    rating: '3.5',
    price: '₦30,000',
    numericPrice: 30000,
    countdown: '2:59',
    statusText: 'Waiting for you to Accept',
    image: require('../../assets/images/appointments/hair_cut.jpg'),
    clientName: 'Ayobami Isaac',
    clientStatus: 'New Client',
    gender: 'Male',
    membership: '5 Days ago',
    staff: 'Chioma',
    customerType: 'verified',
    paymentMethod: 'cash',
    appointmentType: 'in-person',
    bookedPackage: 'basic',
  },
  {
    id: '6',
    title: 'Hair cut & Styling',
    duration: '1hr',
    rating: '3.5',
    price: '₦35,000',
    numericPrice: 35000,
    countdown: '2:59',
    statusText: 'Waiting for you to Accept',
    image: require('../../assets/images/appointments/hair_cut.jpg'),
    clientName: 'Ayobami Isaac',
    clientStatus: 'New Client',
    gender: 'Male',
    membership: '5 Days ago',
    staff: 'Tunde',
    customerType: 'verified',
    paymentMethod: 'transfer',
    appointmentType: 'in-person',
    bookedPackage: 'premium',
  },
  {
    id: '7',
    title: 'Hair wash & Steam',
    duration: '1hr',
    rating: '3.5',
    price: '₦28,000',
    numericPrice: 28000,
    countdown: '2:59',
    statusText: 'Waiting for you to Accept',
    image: require('../../assets/images/appointments/hair_cut.jpg'),
    clientName: 'Ayobami Isaac',
    clientStatus: 'New Client',
    gender: 'Male',
    membership: '5 Days ago',
    staff: 'Chioma',
    customerType: 'non-verified',
    paymentMethod: 'cash',
    appointmentType: 'home-service',
    bookedPackage: 'basic',
  },
  {
    id: '8',
    title: 'Deep Hair Conditioning',
    duration: '1hr',
    rating: '3.5',
    price: '₦48,000',
    numericPrice: 48000,
    countdown: '2:59',
    statusText: 'Waiting for you to Accept',
    image: require('../../assets/images/appointments/hair_cut.jpg'),
    clientName: 'Ayobami Isaac',
    clientStatus: 'New Client',
    gender: 'Male',
    membership: '5 Days ago',
    staff: 'Chioma',
    customerType: 'verified',
    paymentMethod: 'transfer',
    appointmentType: 'in-person',
    bookedPackage: 'exclusive',
  },
  {
    id: '9',
    title: 'Luxury Manicure',
    duration: '1hr',
    rating: '3.5',
    price: '₦25,000',
    numericPrice: 25000,
    countdown: '2:59',
    statusText: 'Waiting for you to Accept',
    image: require('../../assets/images/appointments/nail_art.png'),
    clientName: 'Ayobami Isaac',
    clientStatus: 'New Client',
    gender: 'Male',
    membership: '5 Days ago',
    staff: 'Ahsia',
    customerType: 'verified',
    paymentMethod: 'cash',
    appointmentType: 'in-person',
    bookedPackage: 'premium',
  },
  {
    id: '10',
    title: 'Pedicure & Spa',
    duration: '1hr',
    rating: '3.5',
    price: '₦27,000',
    numericPrice: 27000,
    countdown: '2:59',
    statusText: 'Waiting for you to Accept',
    image: require('../../assets/images/appointments/nail_art.png'),
    clientName: 'Ayobami Isaac',
    clientStatus: 'New Client',
    gender: 'Male',
    membership: '5 Days ago',
    staff: 'Adaeze',
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
    rating: '3.5',
    price: '₦22,700',
    numericPrice: 22700,
    image: require('../../assets/images/appointments/nail_art.png'),
    status: 'in-progress',
    statusText: 'Appointment In-Progress',
    clientName: 'Ayobami Isaac',
    clientStatus: 'New Client',
    specialist: 'Bisola Olarewaju',
    specialistRole: 'Nail Artist',
    staff: 'Chioma Okafor',
    customerType: 'verified',
    paymentMethod: 'transfer',
    appointmentType: 'home-service',
    bookedPackage: 'basic',
    elapsedTime: '1:25:30',
    appointmentDate: 'Nov 19, 2026',
    appointmentTime: '9:30am',
    note: 'I would love for you to go gentle on my scalp',
  },
  {
    id: 'ongoing-2',
    title: 'Crystal Nail Art',
    duration: '1hr',
    rating: '3.5',
    price: '₦22,700',
    numericPrice: 22700,
    image: require('../../assets/images/appointments/nail_art.png'),
    status: 'in-progress',
    statusText: 'Appointment In-Progress',
    clientName: 'Ayobami Isaac',
    clientStatus: 'New Client',
    specialist: 'Aisha Bello',
    specialistRole: 'Nail Artist',
    staff: 'Aisha Bello',
    customerType: 'verified',
    paymentMethod: 'cash',
    appointmentType: 'in-person',
    bookedPackage: 'premium',
    elapsedTime: '0:45:10',
    appointmentDate: 'Nov 19, 2026',
    appointmentTime: '10:30am',
    note: 'Please make sure nails are filed evenly.',
  },
  {
    id: 'ongoing-3',
    title: 'Crystal Nail Art',
    duration: '1hr',
    rating: '3.5',
    price: '₦22,700',
    numericPrice: 22700,
    image: require('../../assets/images/appointments/nail_art.png'),
    status: 'in-progress',
    statusText: 'Appointment In-Progress',
    clientName: 'Ayobami Isaac',
    clientStatus: 'New Client',
    specialist: 'Tunde Adebayo',
    specialistRole: 'Nail Artist',
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
};

export function useOngoingAppointments() {
  const [ongoingAppointments, setOngoingAppointments] = useState<OngoingAppointmentItem[]>(ongoingAppointmentsState);

  useEffect(() => {
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

