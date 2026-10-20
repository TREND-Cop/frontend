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
    body: "The switch above controls your business status. When it is set to OPEN, clients can book appointments. When it is set to CLOSED, they can't. Switching to OPEN means your business is physically open for appointments.",
    buttonLabel: 'Next',
    icon: null,
  },
  {
    stepNumber: 2,
    targetId: 'appointments_card',
    title: 'Appointments',
    body: "This is where you'll find all appointments booked by your clients.",
    buttonLabel: 'Next',
    icon: 'calendar-days',
  },
  {
    stepNumber: 3,
    targetId: 'in_progress_card',
    title: 'In Progress',
    body: 'Here you can see all the appointments that are currently in progress (ongoing) in your salon.',
    buttonLabel: 'Next',
    icon: 'loader',
  },
  {
    stepNumber: 4,
    targetId: 'staff_status_card',
    title: 'Staff Status',
    body: 'In this section you can monitor and keep records of all your staff, from working staff to absent staff, etc.',
    buttonLabel: 'Next',
    icon: 'user-multiple',
  },
  {
    stepNumber: 5,
    targetId: 'appointment_history_card',
    title: 'Appointment History',
    body: 'The category section contains other important tools for improving your business, e.g. canceled appointments, completed appointments, etc.',
    buttonLabel: 'Next',
    icon: 'dashboard-circle',
  },
  {
    stepNumber: 6,
    targetId: 'add_service_card',
    title: 'Add Service',
    body: 'Here you can add services to your business portfolio for clients to see, e.g. haircut, pedicure, manicure, facials and many more.',
    buttonLabel: 'Next',
    icon: 'plus-sign-circle',
  },
  {
    stepNumber: 7,
    targetId: 'post_work_card',
    title: 'Post Work',
    body: 'Here you can take pictures of services you recently or previously performed on clients with your phone camera, then come to this section to upload them to your portfolio for clients to see.',
    buttonLabel: 'Next',
    icon: 'album-02',
  },
  {
    stepNumber: 8,
    targetId: 'staff_management_card',
    title: 'Staff Management',
    body: 'Here you can add staff to your business, remove staff from your business and use many other features to help improve your business.',
    buttonLabel: 'Next',
    icon: 'users-round',
  },
  {
    stepNumber: 9,
    targetId: 'business_statistics_card',
    title: 'Business Statistics',
    body: 'Here you can see all the profits and losses you are making in your business. This will help you decide how to improve.',
    buttonLabel: 'Next',
    icon: 'chart-analysis',
  },
  {
    stepNumber: 10,
    targetId: 'clients_review_card',
    title: 'Client Review',
    body: "Here you can read clients' feedback on your services or business, and respond to their feedback.",
    buttonLabel: 'Next',
    icon: 'chat-01',
  },
  {
    stepNumber: 11,
    targetId: 'edit_business_profile_card',
    title: 'Edit Business Profile',
    body: 'Edit Business Profile is the most important section of your business on Trend. Here you can edit your business information such as your business name, etc.',
    buttonLabel: 'Finally',
    icon: 'task-edit-02',
  },
];
