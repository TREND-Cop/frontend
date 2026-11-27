import { StaffMember } from '../context/StaffContext';

export interface StaffOngoingAppointment {
  staffId: string;
  service: {
    title: string;
    photo: any;
    rating: string;
    duration: string;
    price: string;
  };
}

/**
 * Dev-only constant holding current ongoing appointments for busy staff members.
 * Default is empty as required by prompt.
 *
 * TODO (Backend): fetch real-time ongoing appointment per busy staff member from the server.
 */
export const DEV_STAFF_ONGOING_APPOINTMENTS: StaffOngoingAppointment[] = [];

/**
 * Sample ongoing appointments for testing/fictional states in dev mode.
 */
export const DEV_TEST_BUSY_APPOINTMENTS: StaffOngoingAppointment[] = [
  {
    staffId: 'staff_1',
    service: {
      title: 'Hair wash',
      photo: require('../../assets/images/appointments/hair_cut.jpg'),
      rating: '3.5',
      duration: '1hr',
      price: '₦22,700',
    },
  },
  {
    staffId: 'staff_2',
    service: {
      title: 'Hair wash',
      photo: require('../../assets/images/appointments/hair_cut.jpg'),
      rating: '3.5',
      duration: '1hr',
      price: '₦22,700',
    },
  },
];

export type StaffCardStatus = 'busy' | 'available' | 'on_break' | 'closed' | 'attending';

export type StaffFilterOption = 'all' | 'busy' | 'break' | 'closed' | 'available';

export interface FilterOptionConfig {
  id: StaffFilterOption;
  label: string;
  iconName: 'seat-selector' | 'fast-food' | 'home' | 'user' | 'arrow-up';
}

export const STAFF_FILTER_OPTIONS: FilterOptionConfig[] = [
  { id: 'busy', label: 'Busy', iconName: 'seat-selector' },
  { id: 'break', label: 'On - Break', iconName: 'fast-food' },
  { id: 'closed', label: 'Closed', iconName: 'home' },
  { id: 'available', label: 'Available', iconName: 'user' },
  { id: 'all', label: 'Filter all', iconName: 'arrow-up' },
];

export interface DerivedStaffStatus {
  status: StaffCardStatus;
  chipLabel: 'Busy' | 'Available For work' | 'Lunch Break' | 'Closed' | 'Attending to client';
  ongoingService?: StaffOngoingAppointment['service'];
}

/**
 * Helper to convert time strings (e.g. '8:00am', '8am', '6:30pm', '10pm') to minutes from midnight.
 */
function parseTimeToMinutes(timeStr?: string | null): number | null {
  if (!timeStr) return null;
  const match = timeStr.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridian = match[3].toLowerCase();
  if (meridian === 'pm' && hours < 12) hours += 12;
  if (meridian === 'am' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

/**
 * Derives staff status in real-time from workDays, workHours, breakHours, and ongoing appointments.
 *
 * TODO (Backend: realtime status): replace client-side derivation with live server/socket status updates.
 */
export function deriveStaffStatus(
  member: StaffMember,
  ongoingAppointments: StaffOngoingAppointment[] = DEV_STAFF_ONGOING_APPOINTMENTS,
  now: Date = new Date(),
  businessIsOpen: boolean = true
): DerivedStaffStatus {
  // If the salon is closed by the business owner, all staff are off duty
  if (!businessIsOpen) {
    return {
      status: 'closed',
      chipLabel: 'Closed',
    };
  }

  // 1. Check if staff member currently has an ongoing appointment
  // TODO (Backend): check live appointment booking status
  const ongoing = ongoingAppointments.find((a) => a.staffId === member.id);
  if (ongoing) {
    return {
      status: 'busy',
      chipLabel: 'Busy',
      ongoingService: ongoing.service,
    };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // 2. Check breakHours (Lunch Break)
  // TODO (Backend: realtime status): check real-time break status / clock-in clock-out
  if (member.breakHours && member.breakHours.start && member.breakHours.end) {
    const breakStart = parseTimeToMinutes(member.breakHours.start);
    const breakEnd = parseTimeToMinutes(member.breakHours.end);
    if (breakStart !== null && breakEnd !== null) {
      if (currentMinutes >= breakStart && currentMinutes < breakEnd) {
        return {
          status: 'on_break',
          chipLabel: 'Lunch Break',
        };
      }
    }
  }

  // 3. Default for active staff in open salon: Available For work
  return {
    status: 'available',
    chipLabel: 'Available For work',
  };
}

