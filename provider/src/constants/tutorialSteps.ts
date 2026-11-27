export type TutorialIconType =
  | 'calendar-days'
  | 'loader'
  | 'user-multiple'
  | 'dashboard-circle'
  | 'plus-sign-circle'
  | 'album-02'
  | 'users-round'
  | 'chart-analysis'
  | 'chat-01'
  | 'task-edit-02'
  | null;

export interface TutorialStep {
  stepNumber: number;
  targetId: string;
  title: string;
  body: string;
  buttonLabel: 'Next' | 'Finally';
  icon: TutorialIconType;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    stepNumber: 1,
    targetId: 'business_status_switch',
    title: 'Open & Close Button',
    body: "The switch above controls your business status if its OPEN for client to book appointments or CLOSED. this means if its clicked on OPEN then your business is OPEN physically for appointments. See how it works by clicking the “How it works” Button.",
    buttonLabel: 'Next',
    icon: null,
  },
  {
    stepNumber: 2,
    targetId: 'appointments_card',
    title: 'Appointments',
    body: "This is where you'll find all appointments booked by your clients. See how it works by clicking the “How it works” Button.",
    buttonLabel: 'Next',
    icon: 'calendar-days',
  },
  {
    stepNumber: 3,
    targetId: 'in_progress_card',
    title: 'In Progress',
    body: 'Here you can see all the appointments that are currently in progress (ongoing) in your salon. See how it works by clicking the “How it works” Button.',
    buttonLabel: 'Next',
    icon: 'loader',
  },
  {
    stepNumber: 4,
    targetId: 'staff_status_card',
    title: 'Staff Status',
    body: 'In this section you can monitor and keep records of all your staff, from working staff to absent staff, etc. See how it works by clicking the “How it works” Button.',
    buttonLabel: 'Next',
    icon: 'user-multiple',
  },
  {
    stepNumber: 5,
    targetId: 'appointment_history_card',
    title: 'Appointment History',
    body: 'Here you can view all completed, upcoming, cancelled and past appointments of your clients. See how it works by clicking the “How it works” Button.',
    buttonLabel: 'Next',
    icon: 'dashboard-circle',
  },
  {
    stepNumber: 6,
    targetId: 'add_service_card',
    title: 'Add Service',
    body: 'Here you can add services to your business portfolio for clients to see, e.g. haircut, pedicure, manicure, facials and many more. See how it works by clicking the “How it works” Button.',
    buttonLabel: 'Next',
    icon: 'plus-sign-circle',
  },
  {
    stepNumber: 7,
    targetId: 'post_work_card',
    title: 'Post Work',
    body: 'Here you can take pictures of services you recently or previously performed on clients with your phone camera, then come to this section to upload them to your portfolio for clients to see. See how it works by clicking the “How it works” Button.',
    buttonLabel: 'Next',
    icon: 'album-02',
  },
  {
    stepNumber: 8,
    targetId: 'staff_management_card',
    title: 'Staff Management',
    body: 'Here you can add staff to your business, remove staff from your business and use many other features to help improve your business. See how it works by clicking the “How it works” Button.',
    buttonLabel: 'Next',
    icon: 'users-round',
  },
  {
    stepNumber: 9,
    targetId: 'business_statistics_card',
    title: 'Business Statistics',
    body: 'Here you can see all the profits and losses you are making in your business. This will help you decide how to improve. See how it works by clicking the “How it works” Button.',
    buttonLabel: 'Next',
    icon: 'chart-analysis',
  },
  {
    stepNumber: 10,
    targetId: 'clients_review_card',
    title: 'Client review',
    body: "Here you can read clients' feedback on your services or business, and respond to their feedback. See how it works by clicking the “How it works” Button.",
    buttonLabel: 'Next',
    icon: 'chat-01',
  },
  {
    stepNumber: 11,
    targetId: 'edit_business_profile_card',
    title: 'Edit Business Profile',
    body: 'Edit Business Profile is the most important section of your business on Trend. Here you can edit your business information such as your business name, etc. See how it works by clicking the “How it works” Button.',
    buttonLabel: 'Finally',
    icon: 'task-edit-02',
  },
];

/**
 * Tutorial Video Sources Map for Business Owner (step 1..11 -> source)
 * Connects to the business intro video asset.
 */
export const OWNER_TUTORIAL_VIDEOS: Record<number, any> = {
  1: require('../../assets/videos/generate_a_sec_video_on_beau.mp4'),
  2: require('../../assets/videos/generate_a_sec_video_on_beau.mp4'),
  3: require('../../assets/videos/generate_a_sec_video_on_beau.mp4'),
  4: require('../../assets/videos/generate_a_sec_video_on_beau.mp4'),
  5: require('../../assets/videos/generate_a_sec_video_on_beau.mp4'),
  6: require('../../assets/videos/generate_a_sec_video_on_beau.mp4'),
  7: require('../../assets/videos/generate_a_sec_video_on_beau.mp4'),
  8: require('../../assets/videos/generate_a_sec_video_on_beau.mp4'),
  9: require('../../assets/videos/generate_a_sec_video_on_beau.mp4'),
  10: require('../../assets/videos/generate_a_sec_video_on_beau.mp4'),
  11: require('../../assets/videos/generate_a_sec_video_on_beau.mp4'),
};
