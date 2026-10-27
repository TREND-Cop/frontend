import { StaffAppointment } from '../types/staffAppointments';
import { formatDetailDate, formatAppointmentTime } from '../utils/staffAppointmentFormatters';

/**
 * Dev override to seed sample appointments matching the Figma frames.
 * STRICT DEFAULT: false (store starts empty so empty state shows).
 */
export const DEV_SAMPLE_STAFF_APPOINTMENTS = false;

/**
 * Dev-only toggle for staff member's own services chips in the filter sheet.
 * When false, useStaffOwnServices() returns undefined (and Services section is hidden).
 * STRICT DEFAULT: false.
 */
export const DEV_SAMPLE_STAFF_SERVICES = false;

/**
 * 6 services from the Figma filter sheet frame.
 */
export const FRAME_STAFF_SERVICES = [
  'Hair Cut',
  'Nail Art',
  'Hair Wash',
  'Pedicure',
  'Manicure',
  'Feet Massage',
] as const;

/**
 * Mock delay (ms) for client verification in completion flow.
 * TODO (Backend): Realtime confirmation from client.
 */
export const MOCK_CLIENT_VERIFY_DELAY_MS = 4000;

/**
 * Dev-only toggle to keep the Verifying screen waiting indefinitely.
 * STRICT DEFAULT: false.
 */
export const DEV_STAFF_CLIENT_NEVER_VERIFIES = false;

/**
 * Generates sample appointments relative to Date.now() for testing countdowns and history.
 */
export function generateSampleAppointments(): StaffAppointment[] {
  const now = Date.now();
  const ONE_DAY = 24 * 3600 * 1000;
  const ONE_MONTH = 30 * ONE_DAY;
  const ONE_YEAR = 365 * ONE_DAY;

  return [
    // 1. Starts later today: ~2 hours and 59 seconds from now
    {
      id: 'apt-sample-1',
      client: {
        name: 'Jude Fabulous',
        photo: require('../../assets/images/profile/cont1.jpg'),
        isNew: true,
        gender: 'Male',
        badge: 'Non',
        membershipAgeText: '5 Days ago',
      },
      service: {
        category: 'Hair cut',
        serviceName: 'Men Brade',
        image: require('../../assets/images/profile/dry_wow_pedicure.jpg'),
        price: 22700,
        duration: '1hr',
        rating: 3.5,
      },
      specialist: {
        name: 'Bannie Olanrewaju',
        role: 'Nail Artist',
        photo: require('../../assets/images/profile/cont2.jpg'),
        rating: 5.1,
      },
      date: 'Nov 19, 2026',
      time: '9:30am',
      type: 'Home Service',
      note: 'i would love for you to go gentle on my scalp',
      status: 'waiting',
      startTime: now + (2 * 3600 + 59) * 1000, // +2h 00m 59s
      isLaterDate: false,
    },

    // 2. Start time reached today, waiting for client to start (timer counting up from 0)
    {
      id: 'apt-sample-2',
      client: {
        name: 'Adeleke Davies',
        photo: require('../../assets/images/profile/cont3.jpg'),
        isNew: true,
        gender: 'Male',
        badge: 'Non',
        membershipAgeText: '12 Days ago',
      },
      service: {
        category: 'Male facial',
        serviceName: 'Deep Cleansing Facial',
        image: require('../../assets/images/profile/men_braids.jpg'),
        price: 22700,
        duration: '1hr',
        rating: 3.6,
      },
      specialist: {
        name: 'Chinedu Eze',
        role: 'Barber & Stylist',
        photo: require('../../assets/images/profile/cont1.jpg'),
        rating: 4.8,
      },
      date: 'Nov 19, 2026',
      time: '12:00pm',
      type: 'In-Person',
      note: 'Please use hypoallergenic face scrub and warm towels.',
      status: 'waiting',
      startTime: now - 35 * 1000, // 35 seconds ago (start time reached!)
      isLaterDate: false,
    },

    // 3. On a later date: "Starts in 26th June, 2026"
    {
      id: 'apt-sample-3',
      client: {
        name: 'Timi Balogun',
        photo: require('../../assets/images/profile/cont2.jpg'),
        isNew: false,
        gender: 'Male',
        badge: 'Verified',
        membershipAgeText: '2 Months ago',
      },
      service: {
        category: 'Nail art',
        serviceName: 'Nail Repair & Polish',
        image: require('../../assets/images/profile/dry_wow_pedicure.jpg'),
        price: 22700,
        duration: '1hr',
        rating: 3.5,
      },
      specialist: {
        name: 'Bannie Olanrewaju',
        role: 'Nail Artist',
        photo: require('../../assets/images/profile/cont2.jpg'),
        rating: 5.1,
      },
      date: '26th June, 2026',
      time: '2:00pm',
      type: 'Home Service',
      note: 'Need full pedicure alongside gel nail repair.',
      status: 'waiting',
      startTime: now + 60 * 24 * 3600 * 1000, // Future date
      isLaterDate: true,
    },

    // 4. In-progress appointment (Prompt 3: Ongoing appointment with live timer & package)
    {
      id: 'apt-sample-4',
      client: {
        name: 'Jude Fabulous',
        photo: require('../../assets/images/profile/cont1.jpg'),
        isNew: true,
        gender: 'Male',
        badge: 'Non',
        membershipAgeText: '5 Days ago',
      },
      service: {
        category: 'Crystal Nail Art',
        serviceName: 'Men Brade',
        image: require('../../assets/images/profile/dry_wow_pedicure.jpg'),
        price: 22700,
        duration: '1hr',
        rating: 3.5,
      },
      specialist: {
        name: 'Bisola Olanrewaju',
        role: 'Nail Artist',
        photo: require('../../assets/images/profile/cont2.jpg'),
        rating: 5.1,
      },
      date: 'Nov 19, 2026',
      time: '9:30am',
      type: 'Home Service',
      note: 'i would love for you to go gentle on my scalp',
      status: 'in-progress',
      startTime: now - (1 * 3600 + 25 * 60 + 30) * 1000,
      startedAt: now - (1 * 3600 + 25 * 60 + 30) * 1000, // ~1 hr 25 mins 30 secs ago (frame shows 1:25:30)
      package: {
        price: 4500,
        includedItems: ['Hair Washing', 'Conditioning & Wash', 'Manicure'],
        images: [
          require('../../assets/images/profile/dry_wow_pedicure.jpg'),
          require('../../assets/images/profile/cont3.jpg'),
          require('../../assets/images/profile/men_braids.jpg'),
        ],
      },
      isLaterDate: false,
    },

    // ── 5. Completed Today ──────────────────────────────────────────────────
    {
      id: 'apt-sample-5',
      client: {
        name: 'Samuel Akuune',
        photo: require('../../assets/images/profile/cont1.jpg'),
        isNew: false,
        gender: 'Male',
        badge: 'Subscriber',
        membershipAgeText: '5 Days ago',
      },
      service: {
        category: 'Haircut',
        serviceName: 'Men Brade',
        image: require('../../assets/images/profile/men_braids.jpg'),
        price: 14200,
        duration: '1hr',
        rating: 3.6,
      },
      specialist: {
        name: 'Bisola Olarewaju',
        role: 'Nail Artist',
        photo: require('../../assets/images/profile/cont2.jpg'),
        rating: 5.1,
      },
      date: formatDetailDate(now),
      time: '9:30am',
      type: 'Home Service',
      note: 'i would love for you to go gentle on my scalp',
      status: 'completed',
      startTime: now - 3600 * 1000,
      startedAt: now - 3600 * 1000,
      completionTime: now - 1800 * 1000,
      actualDurationText: '00:00:00',
      package: {
        price: 4500,
        includedItems: ['Hair Washing', 'Conditioning & Wash', 'Manicure'],
        images: [
          require('../../assets/images/profile/dry_wow_pedicure.jpg'),
          require('../../assets/images/profile/cont3.jpg'),
          require('../../assets/images/profile/men_braids.jpg'),
        ],
      },
    },

    // ── 6. Completed 3 Days Ago (Current Month) ────────────────────────────
    {
      id: 'apt-sample-6',
      client: {
        name: 'Samuel Akuune',
        photo: require('../../assets/images/profile/cont2.jpg'),
        isNew: false,
        gender: 'Male',
        badge: 'Subscriber',
        membershipAgeText: '8 Days ago',
      },
      service: {
        category: 'Crystal Nail Art',
        serviceName: 'Crystal Nail Art',
        image: require('../../assets/images/profile/dry_wow_pedicure.jpg'),
        price: 22700,
        duration: '1hr',
        rating: 3.5,
      },
      specialist: {
        name: 'Bisola Olarewaju',
        role: 'Nail Artist',
        photo: require('../../assets/images/profile/cont2.jpg'),
        rating: 5.1,
      },
      date: formatDetailDate(now - 3 * ONE_DAY),
      time: '11:00am',
      type: 'In-Person',
      note: 'Please bring matte top coats as well.',
      status: 'completed',
      startTime: now - 3 * ONE_DAY,
      startedAt: now - 3 * ONE_DAY,
      completionTime: now - 3 * ONE_DAY + 3600 * 1000,
      actualDurationText: '01:05:20',
      package: {
        price: 4500,
        includedItems: ['Nail Polish', 'Cuticle Treatment', 'Hand Massage'],
        images: [
          require('../../assets/images/profile/dry_wow_pedicure.jpg'),
          require('../../assets/images/profile/cont1.jpg'),
          require('../../assets/images/profile/cont3.jpg'),
        ],
      },
    },

    // ── 7. Completed 2 Months Ago ──────────────────────────────────────────
    {
      id: 'apt-sample-7',
      client: {
        name: 'Ayobami Isaac',
        photo: require('../../assets/images/profile/cont3.jpg'),
        isNew: false,
        gender: 'Male',
        badge: 'Verified',
        membershipAgeText: '2 Months ago',
      },
      service: {
        category: 'Hair Wash',
        serviceName: 'Deep Conditioning & Wash',
        image: require('../../assets/images/profile/dry_wow_pedicure.jpg'),
        price: 22700,
        duration: '1hr',
        rating: 3.5,
      },
      specialist: {
        name: 'Chinedu Eze',
        role: 'Hair Stylist',
        photo: require('../../assets/images/profile/cont1.jpg'),
        rating: 4.9,
      },
      date: formatDetailDate(now - 65 * ONE_DAY),
      time: '12:04pm',
      type: 'Home Service',
      note: 'Organic tea tree oil shampoo requested.',
      status: 'completed',
      startTime: now - 65 * ONE_DAY,
      startedAt: now - 65 * ONE_DAY,
      completionTime: now - 65 * ONE_DAY + 45 * 60 * 1000,
      actualDurationText: '00:45:10',
      package: {
        price: 5500,
        includedItems: ['Hair Washing', 'Conditioning & Wash', 'Scalp Massage'],
        images: [
          require('../../assets/images/profile/dry_wow_pedicure.jpg'),
          require('../../assets/images/profile/cont3.jpg'),
          require('../../assets/images/profile/men_braids.jpg'),
        ],
      },
    },

    // ── 8. Completed Over 1 Year Ago ───────────────────────────────────────
    {
      id: 'apt-sample-8',
      client: {
        name: 'Timi Balogun',
        photo: require('../../assets/images/profile/cont1.jpg'),
        isNew: false,
        gender: 'Male',
        badge: 'Subscriber',
        membershipAgeText: '1 Year ago',
      },
      service: {
        category: 'Haircut',
        serviceName: 'Full Men Grooming',
        image: require('../../assets/images/profile/men_braids.jpg'),
        price: 18500,
        duration: '1hr',
        rating: 4.8,
      },
      specialist: {
        name: 'Chinedu Eze',
        role: 'Master Barber',
        photo: require('../../assets/images/profile/cont1.jpg'),
        rating: 4.9,
      },
      date: formatDetailDate(now - (ONE_YEAR + 40 * ONE_DAY)),
      time: '3:30pm',
      type: 'In-Person',
      note: 'Beard trim and hot towel shave.',
      status: 'completed',
      startTime: now - (ONE_YEAR + 40 * ONE_DAY),
      startedAt: now - (ONE_YEAR + 40 * ONE_DAY),
      completionTime: now - (ONE_YEAR + 40 * ONE_DAY) + 3600 * 1000,
      actualDurationText: '01:00:00',
      package: {
        price: 4500,
        includedItems: ['Haircut', 'Beard Trim', 'Hot Towel'],
        images: [
          require('../../assets/images/profile/dry_wow_pedicure.jpg'),
          require('../../assets/images/profile/cont2.jpg'),
          require('../../assets/images/profile/cont3.jpg'),
        ],
      },
    },

    // ── 9. Cancelled Today ─────────────────────────────────────────────────
    {
      id: 'apt-sample-9',
      client: {
        name: 'Samuel Akuune',
        photo: require('../../assets/images/profile/cont1.jpg'),
        isNew: false,
        gender: 'Male',
        badge: 'Subscriber',
        membershipAgeText: '5 Days ago',
      },
      service: {
        category: 'Haircut',
        serviceName: 'Men Brade',
        image: require('../../assets/images/profile/men_braids.jpg'),
        price: 14200,
        duration: '1hr',
        rating: 3.6,
      },
      specialist: {
        name: 'Bisola Olarewaju',
        role: 'Nail Artist',
        photo: require('../../assets/images/profile/cont2.jpg'),
        rating: 5.1,
      },
      date: formatDetailDate(now),
      time: '9:30am',
      type: 'Home Service',
      note: 'i would love for you to go gentle on my scalp',
      status: 'cancelled',
      startTime: now - 3600 * 1000,
      cancellationTime: now - 1800 * 1000,
    },

    // ── 10. Cancelled 2 Days Ago ───────────────────────────────────────────
    {
      id: 'apt-sample-10',
      client: {
        name: 'Ayobami Isaac',
        photo: require('../../assets/images/profile/cont3.jpg'),
        isNew: false,
        gender: 'Male',
        badge: 'Subscriber',
        membershipAgeText: '15 Days ago',
      },
      service: {
        category: 'Crystal Nail Art',
        serviceName: 'Crystal Nail Art',
        image: require('../../assets/images/profile/dry_wow_pedicure.jpg'),
        price: 22700,
        duration: '1hr',
        rating: 3.5,
      },
      specialist: {
        name: 'Bisola Olarewaju',
        role: 'Nail Artist',
        photo: require('../../assets/images/profile/cont2.jpg'),
        rating: 5.1,
      },
      date: formatDetailDate(now - 2 * ONE_DAY),
      time: '12:04pm',
      type: 'In-Person',
      note: 'Client rescheduled for next week due to traffic.',
      status: 'cancelled',
      startTime: now - 2 * ONE_DAY,
      cancellationTime: now - 2 * ONE_DAY - 3600 * 1000,
    },

    // ── 11. Cancelled 2 Months Ago ─────────────────────────────────────────
    {
      id: 'apt-sample-11',
      client: {
        name: 'Jude Fabulous',
        photo: require('../../assets/images/profile/cont2.jpg'),
        isNew: true,
        gender: 'Male',
        badge: 'Non',
        membershipAgeText: '2 Months ago',
      },
      service: {
        category: 'Feet Massage',
        serviceName: 'Aromatherapy Foot Scrub',
        image: require('../../assets/images/profile/dry_wow_pedicure.jpg'),
        price: 18000,
        duration: '1hr',
        rating: 4.2,
      },
      specialist: {
        name: 'Bannie Olanrewaju',
        role: 'Nail Artist',
        photo: require('../../assets/images/profile/cont2.jpg'),
        rating: 5.1,
      },
      date: formatDetailDate(now - 62 * ONE_DAY),
      time: '4:00pm',
      type: 'Home Service',
      note: 'Cancelled by client emergency.',
      status: 'cancelled',
      startTime: now - 62 * ONE_DAY,
      cancellationTime: now - 62 * ONE_DAY - 7200 * 1000,
    },

    // ── 12. Cancelled Over 1 Year Ago ──────────────────────────────────────
    {
      id: 'apt-sample-12',
      client: {
        name: 'Adeleke Davies',
        photo: require('../../assets/images/profile/cont3.jpg'),
        isNew: false,
        gender: 'Male',
        badge: 'Non',
        membershipAgeText: '1 Year ago',
      },
      service: {
        category: 'Pedicure',
        serviceName: 'Classic Pedicure & Scrub',
        image: require('../../assets/images/profile/dry_wow_pedicure.jpg'),
        price: 15000,
        duration: '1hr',
        rating: 4.0,
      },
      specialist: {
        name: 'Bisola Olarewaju',
        role: 'Nail Artist',
        photo: require('../../assets/images/profile/cont2.jpg'),
        rating: 5.1,
      },
      date: formatDetailDate(now - (ONE_YEAR + 60 * ONE_DAY)),
      time: '1:30pm',
      type: 'In-Person',
      note: 'Client cancelled appointment.',
      status: 'cancelled',
      startTime: now - (ONE_YEAR + 60 * ONE_DAY),
      cancellationTime: now - (ONE_YEAR + 60 * ONE_DAY) - 1800 * 1000,
    },
  ];
}

