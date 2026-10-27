export type StaffTutorialIconType =
  | 'calendar-days'
  | 'loader'
  | 'id-card'
  | 'clock'
  | 'camera-01'
  | 'chart-03'
  | 'chat-feedback-01';

export interface StaffTutorialStep {
  stepNumber: number;
  targetId: string;
  fallbackTargetId?: string;
  title: string;
  body: string;
  icon: StaffTutorialIconType;
}

/**
 * 9-Step Staff Tutorial configuration
 * Exact copy from docs/design/staff-tutorial-1-css.txt with confirmed typo/wording corrections.
 */
export const STAFF_TUTORIAL_STEPS: StaffTutorialStep[] = [
  {
    stepNumber: 1,
    targetId: 'staff-appointments-card',
    title: 'Appointments',
    body: 'This is where you’ll find all appointments booked by clients who have chosen your services. See how it works by clicking the “How it works” Button.',
    icon: 'calendar-days',
  },
  {
    stepNumber: 2,
    targetId: 'staff-in-progress-card',
    title: 'In Progress',
    // Corrected design slip: replaced "Play" with "How it works"
    body: 'Here you\'ll find appointments you have acknowledged and currently working on. See how it works by clicking the “How it works” Button.',
    icon: 'loader',
  },
  {
    stepNumber: 3,
    targetId: 'staff-cancelled-card',
    // Corrected tooltip title spelling: "Cancelled" to match card and prompt instruction
    title: 'Cancelled Appointments',
    // Corrected typo: "canceled" -> "cancelled"
    body: 'This section is for appointments that have been cancelled by clients.',
    icon: 'calendar-days',
  },
  {
    stepNumber: 4,
    targetId: 'staff-completed-card',
    title: 'Completed Appointments',
    body: 'This section displays all the appointments you’ve completed.',
    icon: 'calendar-days',
  },
  {
    stepNumber: 5,
    targetId: 'staff-personal-data-card',
    title: 'Personal Data',
    body: 'This section displays your work information as a staff of a certain business, information such as work hours etc.',
    icon: 'id-card',
  },
  {
    stepNumber: 6,
    targetId: 'staff-break-timer-chip',
    fallbackTargetId: 'staff-break-time-cell',
    title: 'Timer',
    // Corrected typos: "These data includes" -> "These data include", "such as, closing hours time" -> "such as closing hours"
    body: 'The timer is a clock specially designed for each staff of a business based on the staff data set by the business owner. These data include your schedules such as closing hours, next break time, etc.',
    icon: 'clock',
  },
  {
    stepNumber: 7,
    targetId: 'staff-post-photos-card',
    title: 'Post Work',
    // Corrected typo: "its visible" -> "it's visible"
    body: 'This section is for you to be able to post services you have completed to your personal portfolio, it\'s visible for clients to see and book you for private appointments.',
    icon: 'camera-01',
  },
  {
    stepNumber: 8,
    targetId: 'staff-personal-stats-card',
    title: 'Personal Statistics',
    // Corrected typo: "numbers of appointments" -> "the number of appointments"
    body: 'This section displays your growth process such as the number of appointments you have received and many more.',
    icon: 'chart-03',
  },
  {
    stepNumber: 9,
    targetId: 'staff-clients-reviews-card',
    title: 'Clients Review',
    body: 'This section displays clients feedback towards your current work environment, though you may not have the opportunity to respond to any feedback.',
    icon: 'chat-feedback-01',
  },
];

/**
 * Tutorial Video Sources Map (step 1..9 -> source)
 * TODO (Assets): tutorial videos — All sources are empty until asset URLs or files are provided.
 */
export const STAFF_TUTORIAL_VIDEOS: Record<number, any> = {
  1: null,
  2: null,
  3: null,
  4: null,
  5: null,
  6: null,
  7: null,
  8: null,
  9: null,
};
