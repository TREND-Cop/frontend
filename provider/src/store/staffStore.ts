import { useState, useEffect } from 'react';

export type StaffStatusCode = 'all' | 'attending' | 'on_break' | 'available' | 'closed';

export interface StaffClientInfo {
  name: string;
  badge: string;
  avatar: any;
  gender: string;
  badgeStatus: string;
  membership: string;
}

export interface StaffServiceInfo {
  title: string;
  rating: string;
  duration: string;
  price: string;
  image: any;
}

export interface StaffAppointmentInfo {
  date: string;
  time: string;
  type: string;
}

export interface StaffAddOnInfo {
  title: string;
  price: string;
  duration: string;
  rating: string;
  image: any;
}

export interface StaffPackageInfo {
  price: string;
  images: any[];
  items: string[];
}

export interface StaffSummaryInfo {
  appointmentCost: string;
  trendPoints: string;
  paymentType: string;
  total: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  status: string;
  statusCode: StaffStatusCode;
  hours?: string;
  avatar: any;
  gender?: string;
  badge?: string;
  experience?: string;
  client: StaffClientInfo;
  service: StaffServiceInfo;
  appointmentInfo: StaffAppointmentInfo;
  addOn: StaffAddOnInfo;
  note: {
    text: string;
    count: string;
  };
  package: StaffPackageInfo;
  summary: StaffSummaryInfo;
}

export const INITIAL_STAFF_DATA: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Ibrahim Musa',
    role: 'Barber',
    status: 'Attending to client',
    statusCode: 'attending',
    hours: '8am - 10pm',
    avatar: require('../../assets/images/profile/1007604716.jpg'),
    gender: 'Male',
    badge: 'Senior Barber',
    experience: '3 Years',
    client: {
      name: 'Jude Fabulous',
      badge: 'New Client',
      avatar: require('../../assets/images/appointments/jude_fabulous.png'),
      gender: 'Male',
      badgeStatus: 'Non',
      membership: '5 Days ago',
    },
    service: {
      title: 'Hair wash',
      rating: '2.5',
      duration: '1hr',
      price: '₦22,700',
      image: require('../../assets/images/appointments/hair_cut.jpg'),
    },
    appointmentInfo: {
      date: 'Nov 19, 2026',
      time: '10:00am',
      type: 'In-Shop Service',
    },
    addOn: {
      title: 'Beard Grooming',
      price: '₦12,000',
      duration: '20min',
      rating: '4.8',
      image: require('../../assets/images/appointments/nail_art.png'),
    },
    note: {
      text: 'please apply beard balm after trimming',
      count: '1/120',
    },
    package: {
      price: '₦4,500',
      images: [
        require('../../assets/images/packages/shampoo_wash.png'),
        require('../../assets/images/packages/men_manicure.png'),
        require('../../assets/images/packages/facial_sheet_mask.png'),
      ],
      items: ['Hair Washing', 'Conditioning & Wash', 'Beard Trim'],
    },
    summary: {
      appointmentCost: '₦34,700',
      trendPoints: '-₦2,700',
      paymentType: 'Opay (Transfer)',
      total: '₦32,000',
    },
  },
  {
    id: 'staff-2',
    name: 'Ayobami Isaac',
    role: 'Barber',
    status: 'Attending to client',
    statusCode: 'attending',
    hours: '8am - 10pm',
    avatar: require('../../assets/images/profile/1007643877.jpg'),
    gender: 'Male',
    badge: 'Master Barber',
    experience: '4 Years',
    client: {
      name: 'Jude Fabulous',
      badge: 'New Client',
      avatar: require('../../assets/images/appointments/jude_fabulous.png'),
      gender: 'Male',
      badgeStatus: 'Non',
      membership: '5 Days ago',
    },
    service: {
      title: 'Hair wash',
      rating: '3.5',
      duration: '1hr',
      price: '₦22,700',
      image: require('../../assets/images/appointments/hair_cut.jpg'),
    },
    appointmentInfo: {
      date: 'Nov 19, 2026',
      time: '9:30am',
      type: 'Home Service',
    },
    addOn: {
      title: 'Nail Repair',
      price: '₦22,700',
      duration: '24min',
      rating: '5.1',
      image: require('../../assets/images/appointments/nail_art.png'),
    },
    note: {
      text: '',
      count: '0/120',
    },
    package: {
      price: '₦4,500',
      images: [
        require('../../assets/images/packages/shampoo_wash.png'),
        require('../../assets/images/packages/men_manicure.png'),
        require('../../assets/images/packages/facial_sheet_mask.png'),
      ],
      items: ['Hair Washing', 'Conditioning & Wash', 'Manicure'],
    },
    summary: {
      appointmentCost: '₦52,700',
      trendPoints: '-₦2,700',
      paymentType: 'Opay (Transfer)',
      total: '₦50,000',
    },
  },
  {
    id: 'staff-3',
    name: 'Godwill Thomas',
    role: 'Nail Artist',
    status: 'Available for work',
    statusCode: 'available',
    hours: '8am - 10pm',
    avatar: require('../../assets/images/profile/1007604717.jpg'),
    gender: 'Male',
    badge: 'Nail Specialist',
    experience: '2 Years',
    client: {
      name: 'Sarah Jenkins',
      badge: 'VIP Client',
      avatar: require('../../assets/images/appointments/jude_fabulous.png'),
      gender: 'Female',
      badgeStatus: 'Gold',
      membership: '3 Months ago',
    },
    service: {
      title: 'Crystal Nail Art',
      rating: '4.1',
      duration: '45min',
      price: '₦18,500',
      image: require('../../assets/images/appointments/nail_art.png'),
    },
    appointmentInfo: {
      date: 'Today',
      time: 'Available Now',
      type: 'In-Shop Service',
    },
    addOn: {
      title: 'Cuticle Treatment',
      price: '₦8,000',
      duration: '15min',
      rating: '4.9',
      image: require('../../assets/images/appointments/nail_art.png'),
    },
    note: {
      text: 'Prefers square rounded nail shaping',
      count: '1/120',
    },
    package: {
      price: '₦5,000',
      images: [
        require('../../assets/images/packages/men_manicure.png'),
        require('../../assets/images/packages/facial_sheet_mask.png'),
      ],
      items: ['Nail Polish', 'Cuticle Cleanse', 'Hand Massage'],
    },
    summary: {
      appointmentCost: '₦26,500',
      trendPoints: '-₦1,500',
      paymentType: 'Card (POS)',
      total: '₦25,000',
    },
  },
  {
    id: 'staff-4',
    name: 'Gavin Nwosi',
    role: 'Nail Artist',
    status: 'Lunch Break',
    statusCode: 'on_break',
    hours: '8am - 10pm',
    avatar: require('../../assets/images/profile/gavin_nwosis_avatar.png'),
    gender: 'Male',
    badge: 'Nail Artist',
    experience: '2 Years',
    client: {
      name: 'Michael Chen',
      badge: 'Returning',
      avatar: require('../../assets/images/appointments/jude_fabulous.png'),
      gender: 'Male',
      badgeStatus: 'Silver',
      membership: '1 Month ago',
    },
    service: {
      title: 'Nail Repair',
      rating: '4.1',
      duration: '24min',
      price: '₦15,000',
      image: require('../../assets/images/appointments/nail_art.png'),
    },
    appointmentInfo: {
      date: 'Today',
      time: '1:00pm - 2:00pm',
      type: 'Scheduled Break',
    },
    addOn: {
      title: 'Nail Polish',
      price: '₦5,000',
      duration: '10min',
      rating: '4.5',
      image: require('../../assets/images/appointments/nail_art.png'),
    },
    note: {
      text: 'Currently on scheduled meal break',
      count: '1/120',
    },
    package: {
      price: '₦3,500',
      images: [
        require('../../assets/images/packages/men_manicure.png'),
      ],
      items: ['Nail Repair', 'Buffing'],
    },
    summary: {
      appointmentCost: '₦20,000',
      trendPoints: '-₦1,000',
      paymentType: 'Opay (Transfer)',
      total: '₦19,000',
    },
  },
  {
    id: 'staff-5',
    name: 'Emmanuel Kalu',
    role: 'Nail Artist',
    status: 'Closed',
    statusCode: 'closed',
    hours: '8am - 10pm',
    avatar: require('../../assets/images/profile/1007618600.jpg'),
    gender: 'Male',
    badge: 'Senior Technician',
    experience: '2 Years',
    client: {
      name: 'David Adeleke',
      badge: 'Regular',
      avatar: require('../../assets/images/appointments/jude_fabulous.png'),
      gender: 'Male',
      badgeStatus: 'Non',
      membership: '2 Weeks ago',
    },
    service: {
      title: 'Pedicure Care',
      rating: '4.1',
      duration: '30min',
      price: '₦12,000',
      image: require('../../assets/images/appointments/nail_art.png'),
    },
    appointmentInfo: {
      date: 'Shift Ended',
      time: 'Resumes 8:00am',
      type: 'Off Duty',
    },
    addOn: {
      title: 'Foot Scrub',
      price: '₦6,000',
      duration: '15min',
      rating: '4.7',
      image: require('../../assets/images/appointments/nail_art.png'),
    },
    note: {
      text: 'Shift concluded for today',
      count: '1/120',
    },
    package: {
      price: '₦4,000',
      images: [
        require('../../assets/images/packages/shampoo_wash.png'),
      ],
      items: ['Foot Soak', 'Pedicure Cleanse'],
    },
    summary: {
      appointmentCost: '₦18,000',
      trendPoints: '-₦1,000',
      paymentType: 'Bank Transfer',
      total: '₦17,000',
    },
  },
  {
    id: 'staff-6',
    name: 'Chidinma Okafor',
    role: 'Nail Artist',
    status: 'Attending to client',
    statusCode: 'attending',
    hours: '8am - 10pm',
    avatar: require('../../assets/images/profile/1007605322.jpg'),
    gender: 'Male',
    badge: 'Master Nail Technician',
    experience: '3 Years',
    client: {
      name: 'Jessica Amadi',
      badge: 'New Client',
      avatar: require('../../assets/images/appointments/jude_fabulous.png'),
      gender: 'Female',
      badgeStatus: 'Gold',
      membership: '2 Weeks ago',
    },
    service: {
      title: 'Luxury Gel Extensions',
      rating: '4.1',
      duration: '1hr 15min',
      price: '₦22,000',
      image: require('../../assets/images/appointments/nail_art.png'),
    },
    appointmentInfo: {
      date: 'Today',
      time: '2:30pm',
      type: 'In-Shop Service',
    },
    addOn: {
      title: 'Nail Art Polish',
      price: '₦5,000',
      duration: '20min',
      rating: '4.9',
      image: require('../../assets/images/appointments/nail_art.png'),
    },
    note: {
      text: 'Long almond gel extension with metallic chrome finish',
      count: '1/120',
    },
    package: {
      price: '₦6,500',
      images: [
        require('../../assets/images/packages/men_manicure.png'),
        require('../../assets/images/packages/facial_sheet_mask.png'),
      ],
      items: ['Gel Extension', 'Chrome Polish', 'Cuticle Oil'],
    },
    summary: {
      appointmentCost: '₦33,500',
      trendPoints: '-₦1,500',
      paymentType: 'Opay (Transfer)',
      total: '₦32,000',
    },
  },
];

export const SUGGESTED_STAFF_GAVIN: StaffMember = {
  id: 'staff-gavin',
  name: 'Gavin Nwosis',
  role: 'Nail Artist',
  status: 'Attending to client',
  statusCode: 'attending',
  hours: '8am - 10pm',
  avatar: require('../../assets/images/profile/gavin_nwosis_avatar.png'),
  gender: 'Male',
  badge: 'Nail Specialist',
  experience: '2 Years',
  client: {
    name: 'Michael Chen',
    badge: 'Returning',
    avatar: require('../../assets/images/appointments/jude_fabulous.png'),
    gender: 'Male',
    badgeStatus: 'Silver',
    membership: '1 Month ago',
  },
  service: {
    title: 'Nail Repair',
    rating: '4.1',
    duration: '24min',
    price: '₦15,000',
    image: require('../../assets/images/appointments/nail_art.png'),
  },
  appointmentInfo: {
    date: 'Today',
    time: '1:00pm - 2:00pm',
    type: 'In-Shop Service',
  },
  addOn: {
    title: 'Nail Polish',
    price: '₦5,000',
    duration: '10min',
    rating: '4.5',
    image: require('../../assets/images/appointments/nail_art.png'),
  },
  note: {
    text: '',
    count: '0/120',
  },
  package: {
    price: '₦3,500',
    images: [
      require('../../assets/images/packages/men_manicure.png'),
    ],
    items: ['Nail Repair', 'Buffing'],
  },
  summary: {
    appointmentCost: '₦20,000',
    trendPoints: '-₦1,000',
    paymentType: 'Opay (Transfer)',
    total: '₦19,000',
  },
};

let globalStaffList: StaffMember[] = [...INITIAL_STAFF_DATA];
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function getStaffById(id: string | undefined): StaffMember | undefined {
  if (!id) return undefined;
  return globalStaffList.find((s) => s.id === id);
}

export function getAllStaff(): StaffMember[] {
  return [...globalStaffList];
}

export function addStaffMember(staff: StaffMember): void {
  globalStaffList = [staff, ...globalStaffList];
  notifyListeners();
}

export function updateStaffStatus(id: string, statusCode: StaffStatusCode, statusText: string): void {
  globalStaffList = globalStaffList.map((s) =>
    s.id === id ? { ...s, statusCode, status: statusText } : s
  );
  notifyListeners();
}

// ── Recent Searches State (Defaults to the 4 items from Figma recent search screen) ──
let globalRecentSearches: string[] = ['staff-3', 'staff-4', 'staff-5', 'staff-6'];
const searchListeners = new Set<() => void>();

function notifySearchListeners() {
  searchListeners.forEach((listener) => listener());
}

export function getRecentStaffSearches(): StaffMember[] {
  return globalRecentSearches
    .map((id) => globalStaffList.find((s) => s.id === id))
    .filter((s): s is StaffMember => s !== undefined);
}

export function addRecentStaffSearch(id: string): void {
  if (!id) return;
  globalRecentSearches = [id, ...globalRecentSearches.filter((item) => item !== id)].slice(0, 10);
  notifySearchListeners();
}

export function clearRecentStaffSearches(): void {
  globalRecentSearches = [];
  notifySearchListeners();
}

export function deleteRecentStaffSearches(ids: string[]): void {
  globalRecentSearches = globalRecentSearches.filter((item) => !ids.includes(item));
  notifySearchListeners();
}

export function useStaffStore() {
  const [staffList, setStaffList] = useState<StaffMember[]>(globalStaffList);

  useEffect(() => {
    const listener = () => setStaffList([...globalStaffList]);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    staffList,
    getStaffById,
    addStaffMember,
    updateStaffStatus,
  };
}

export function useRecentStaffSearches() {
  const [recentList, setRecentList] = useState<StaffMember[]>(getRecentStaffSearches());

  useEffect(() => {
    const listener = () => setRecentList(getRecentStaffSearches());
    searchListeners.add(listener);
    return () => {
      searchListeners.delete(listener);
    };
  }, []);

  return {
    recentList,
    addRecentStaffSearch,
    deleteRecentStaffSearches,
    clearRecentStaffSearches,
  };
}
