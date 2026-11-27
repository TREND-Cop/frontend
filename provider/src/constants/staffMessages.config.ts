/**
 * Staff Messages Configuration & Types
 *
 * All state is strictly isolated from owner messaging.
 * Frontend only — all backend/auth calls are stubs marked `TODO (Backend)`.
 */

export interface StaffContact {
  id: string;
  name: string;
  role: string; // e.g. "Owner", "Pedicure Specialist", "Nail Artist", "Barber"
  avatar: any;
  isAdmin?: boolean;
}

export type StaffMessageType = 'text' | 'image';

export interface StaffChatMessage {
  id: string;
  sender: 'me' | 'other';
  type: StaffMessageType;
  text?: string;
  image?: any;
  time: string; // 12-hour format e.g. "12:04", "12:32"
  timestamp: number;
}

export interface StaffConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  participantAvatar: any;
  tag: string; // "Team"
  lastMessagePreview: string;
  lastMessageTime: string; // e.g. "12:11"
  dateText: string; // e.g. "Wed/3/2026", "Today"
  unreadCount: number;
}

/**
 * DEV_SAMPLE_STAFF_MESSAGES flag:
 * Default: `false` (shows empty state per Figma Screen 1).
 * When `true`, loads mock conversations, contacts, and chat messages matching Figma Screens 2-8.
 */
export const DEV_SAMPLE_STAFF_MESSAGES = false;

// ── Shared Assets ────────────────────────────────────────────────────────────
export const WAVING_PERSON_ILLUSTRATION = require('../../assets/images/messages/empty_messages_waving.png');
export const NO_STAFF_ILLUSTRATION = require('../../assets/images/messages/no_staff_illustration.png');
export const JUDE_AVATAR = require('../../assets/images/appointments/jude_fabulous.png');
export const PROFILE_AVATAR = require('../../assets/images/profile/4538d4759870466dd05509849b26c4b0b111d827.jpg');

// ── Default Contacts ─────────────────────────────────────────────────────────

// Admin (Owner) — always present
export const DEV_OWNER_CONTACT: StaffContact = {
  id: 'owner_admin_1',
  name: 'Ouluwadamilola Samuel',
  role: 'Owner',
  avatar: PROFILE_AVATAR,
  isAdmin: true,
};

// Colleagues (other staff)
export const DEV_STAFF_COLLEAGUES: StaffContact[] = [
  {
    id: 'colleague_1',
    name: 'Etibong Samuel',
    role: 'Pedicure Specialist',
    avatar: PROFILE_AVATAR,
  },
  {
    id: 'colleague_2',
    name: 'Etibiri olamilakun',
    role: 'Nail Artist',
    avatar: JUDE_AVATAR,
  },
  {
    id: 'colleague_3',
    name: 'Ebitue Agada',
    role: 'Barber',
    avatar: JUDE_AVATAR,
  },
];

// ── Sample Seed Conversations ────────────────────────────────────────────────
export const DEV_SAMPLE_CONVERSATIONS: StaffConversation[] = [
  {
    id: 'conv_1',
    participantId: 'colleague_1',
    participantName: 'Etibong Samuel',
    participantRole: 'Pedicure Specialist',
    participantAvatar: PROFILE_AVATAR,
    tag: 'Team',
    lastMessagePreview: "Hello this is luminious looks and we're..",
    lastMessageTime: '12:11',
    dateText: 'Wed/3/2026',
    unreadCount: 1,
  },
  {
    id: 'conv_2',
    participantId: 'colleague_2',
    participantName: 'Etibiri olamilakun',
    participantRole: 'Nail Artist',
    participantAvatar: JUDE_AVATAR,
    tag: 'Team',
    lastMessagePreview: "Hello this is luminious looks and we're..",
    lastMessageTime: '12:11',
    dateText: 'Wed/3/2026',
    unreadCount: 1,
  },
  {
    id: 'conv_3',
    participantId: 'colleague_3',
    participantName: 'Ebitue Agada',
    participantRole: 'Barber',
    participantAvatar: JUDE_AVATAR,
    tag: 'Team',
    lastMessagePreview: "Hello this is luminious looks and we're..",
    lastMessageTime: 'Today',
    dateText: 'Today',
    unreadCount: 0,
  },
];

// ── Initial Mock Messages in Chat ────────────────────────────────────────────
export const DEV_INITIAL_CHAT_MESSAGES: Record<string, StaffChatMessage[]> = {
  conv_1: [
    {
      id: 'msg_1',
      sender: 'me',
      type: 'image',
      image: WAVING_PERSON_ILLUSTRATION,
      time: '12:32',
      timestamp: Date.now() - 3600000,
    },
    {
      id: 'msg_2',
      sender: 'me',
      type: 'text',
      text: 'Hello samuel Ebitueh',
      time: '12:04',
      timestamp: Date.now() - 1800000,
    },
  ],
};

