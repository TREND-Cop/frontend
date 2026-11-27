/**
 * Staff Appointments Data Types
 *
 * Designed for in-memory store in Prompts 2-4.
 * Frontend only — no backend schema or table columns.
 */

export type StaffAppointmentStatus = 'waiting' | 'in-progress' | 'completed' | 'cancelled';
export type StaffAppointmentType = 'Home Service' | 'In-Person';
export type ClientGender = 'Male' | 'Female';

export interface AppointmentClient {
  name: string;
  photo?: any;
  isNew: boolean; // true = "New Client" pill, false = returning
  gender: ClientGender;
  badge: string; // e.g. "Non" or "Verified"
  membershipAgeText: string; // e.g. "5 Days ago"
}

export interface AppointmentService {
  category: string; // e.g. "Haircut" or "Hair cut", "Male facial", "Nail art"
  serviceName: string; // e.g. "Hair wash", "Men Brade", "All Back Dreadlock"
  image?: any;
  price: number; // e.g. 22700, 14200
  duration: string; // e.g. "1hr"
  rating: number; // e.g. 3.5, 3.6
}

export interface AppointmentSpecialist {
  name: string; // e.g. "Bannie Olanrewaju"
  role: string; // e.g. "Nail Artist"
  photo?: any;
  rating: number; // e.g. 5.1
}

export interface AppointmentPackage {
  images: any[];
  price: number;
  includedItems: string[];
}

export interface StaffAppointment {
  id: string;
  client: AppointmentClient;
  service: AppointmentService;
  specialist: AppointmentSpecialist;
  date: string; // e.g. "Nov 19, 2026" or "26th June, 2026"
  time: string; // e.g. "9:30am"
  type: StaffAppointmentType; // "Home Service" | "In-Person"
  note: string; // client's note (e.g. "leave a note for the staff")
  status: StaffAppointmentStatus; // 'waiting' | 'in-progress' | 'completed' | 'cancelled'
  startTime: number; // Timestamp (ms) used for live countdown calculation
  startedAt?: number; // Timestamp (ms) when ongoing appointment began (used for live count-up timer)
  completionTime?: number; // Timestamp (ms) when appointment was marked completed
  cancellationTime?: number; // Timestamp (ms) when appointment was cancelled
  actualDurationText?: string; // Formatted duration e.g. "00:00:00" or "1:15:30"
  package?: AppointmentPackage; // Package details (3 images, price, included items)
  isLaterDate?: boolean; // When true, shows "Starts in {date}" banner
}

