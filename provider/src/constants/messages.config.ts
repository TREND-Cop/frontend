/**
 * Messages Configuration & Types
 *
 * TODO (Backend): Load conversations, unread counts, and realtime updates from backend API.
 * Currently in-memory only.
 */

export interface Conversation {
  id: string;
  staffId: string;
  lastMessagePreview: string;
  lastMessageTime: string; // e.g. ISO string or "12:11" / "Wed/3/2026"
  unreadCount: number;
  kind?: 'Staff';
}

/**
 * DEV_SAMPLE_CONVERSATIONS flag:
 * Default: `false` (shows empty state per prompt instructions).
 * Set to `true` to test conversations list with sample staff data.
 */
export const DEV_SAMPLE_CONVERSATIONS = false;

/**
 * Fallback / seed sample conversation data used when DEV_SAMPLE_CONVERSATIONS is true.
 * Built dynamically against staff in StaffProvider where available.
 */
export const SAMPLE_SEED_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    staffId: 'staff_1',
    lastMessagePreview: "Hello this is luminious looks and we're..",
    lastMessageTime: '12:11', // Today
    unreadCount: 1,
    kind: 'Staff',
  },
  {
    id: 'conv_2',
    staffId: 'staff_2',
    lastMessagePreview: "Hello this is luminious looks and we're..",
    lastMessageTime: 'Wed/3/2026', // Older date
    unreadCount: 0,
    kind: 'Staff',
  },
];
