import { useState, useEffect } from 'react';
import { trendApi, getAuthToken } from '../api/trendApi';

export type MessageType = 'text' | 'image' | 'serviceCard' | 'dateDivider';

export interface ServiceCardData {
  title: string;
  image: any;
  duration: string;
  rating: string;
  reviewsCount?: string;
  price: string;
}

export interface ChatMessage {
  id: string;
  type?: MessageType;
  text?: string;
  image?: any;
  serviceCard?: ServiceCardData;
  time: string;
  sender: 'provider' | 'customer';
}

export interface ProviderConversation {
  id: string;
  name: string;
  firstName: string;
  role?: string;
  avatar: any;
  lastMessage: string;
  time: string;
  unreadCount: number;
  messages: ChatMessage[];
}

const GODWIN_CONVERSATION: ChatMessage[] = [
  {
    id: 'm1',
    type: 'text',
    sender: 'customer',
    text: 'Hello this is Fabulous',
    time: '12:04',
  },
  {
    id: 'm2',
    type: 'text',
    sender: 'provider',
    text: 'Hi there!! This is luminous Lux, how can we be of help?',
    time: '12:05',
  },
  {
    id: 'm3',
    type: 'text',
    sender: 'customer',
    text: 'Thanks, please i would love the following service, is it available?',
    time: '12:04',
  },
  {
    id: 'm4',
    type: 'image',
    sender: 'customer',
    image: require('../../assets/images/profile/4538d4759870466dd05509849b26c4b0b111d827.jpg'),
    time: '12:04',
  },
  {
    id: 'm5',
    type: 'text',
    sender: 'provider',
    text: 'Yes, we do.',
    time: '12:04',
  },
  {
    id: 'm6',
    type: 'serviceCard',
    sender: 'provider',
    serviceCard: {
      title: 'Clove Pattern',
      image: require('../../assets/images/profile/4538d4759870466dd05509849b26c4b0b111d827.jpg'),
      duration: '1hr',
      rating: '4.8',
      reviewsCount: '(120)',
      price: '₦14,200',
    },
    time: '12:04',
  },
];

const LARA_CONVERSATION: ChatMessage[] = [
  {
    id: 'l1',
    type: 'text',
    sender: 'customer',
    text: 'Hello, do you have any opening for hair styling today?',
    time: '12:08',
  },
  {
    id: 'l2',
    type: 'text',
    sender: 'provider',
    text: 'Hi Lara! Yes, we have an open slot at 2:00 PM with our senior specialist.',
    time: '12:09',
  },
  {
    id: 'l3',
    type: 'text',
    sender: 'customer',
    text: 'Lorem ipsum dolor sit amet cons...',
    time: '12:11',
  },
];

const CHISOM_CONVERSATION: ChatMessage[] = [
  {
    id: 'c1',
    type: 'text',
    sender: 'customer',
    text: 'Hello, can I book a nail session for tomorrow afternoon?',
    time: '11:45',
  },
  {
    id: 'c2',
    type: 'text',
    sender: 'provider',
    text: 'Sure Chisom! Bisola is available from 1:00 PM to 4:00 PM.',
    time: '11:52',
  },
  {
    id: 'c3',
    type: 'text',
    sender: 'customer',
    text: 'Lorem ipsum dolor sit amet cons...',
    time: '12:11',
  },
];

const DEFAULT_CONVERSATIONS: ProviderConversation[] = [
  {
    id: '1',
    name: 'Godwin Thomas',
    firstName: 'Godwin',
    role: 'Customer',
    avatar: require('../../assets/images/messages/godwin_thomas.jpg'),
    lastMessage: 'Hello this is luminious looks and...',
    time: '12:11',
    unreadCount: 1,
    messages: GODWIN_CONVERSATION,
  },
  {
    id: '2',
    name: 'Lara Olapade',
    firstName: 'Lara',
    role: 'Customer',
    avatar: require('../../assets/images/messages/lara_olapade.jpg'),
    lastMessage: 'Lorem ipsum dolor sit amet cons...',
    time: '12:11',
    unreadCount: 0,
    messages: LARA_CONVERSATION,
  },
  {
    id: '3',
    name: 'Chisom Emanuella',
    firstName: 'Chisom',
    role: 'Customer',
    avatar: require('../../assets/images/messages/chisom_emanuella.jpg'),
    lastMessage: 'Lorem ipsum dolor sit amet cons...',
    time: '12:11',
    unreadCount: 0,
    messages: CHISOM_CONVERSATION,
  },
  {
    id: 'staff-6',
    name: 'Chidinma Okafor',
    firstName: 'Chidinma',
    role: 'Nail Artist',
    avatar: require('../../assets/images/profile/1007605322.jpg'),
    lastMessage: '',
    time: '12:00',
    unreadCount: 0,
    messages: [], // Empty state shows "Message Chidinma" 1:1 with Figma
  },
  {
    id: 'jude',
    name: 'Jude Fabulous',
    firstName: 'Jude',
    role: 'Customer',
    avatar: require('../../assets/images/appointments/jude_fabulous.png'),
    lastMessage: '',
    time: '12:00',
    unreadCount: 0,
    messages: [], // New conversation triggers empty in-chat state 1:1 with Figma
  },
];

let conversationsState: ProviderConversation[] = [...DEFAULT_CONVERSATIONS];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export const providerMessagesStore = {
  getConversations: (): ProviderConversation[] => {
    return conversationsState;
  },

  getConversation: (
    idOrName?: string,
    meta?: { name?: string; role?: string; avatar?: any }
  ): ProviderConversation => {
    if (!idOrName && !meta?.name) return conversationsState[0];
    const query = (idOrName || '').toLowerCase().trim();
    const queryName = meta?.name ? meta.name.toLowerCase().trim() : '';

    const found = conversationsState.find(
      (c) =>
        (query && c.id.toLowerCase() === query) ||
        (query && c.name.toLowerCase() === query) ||
        (queryName && c.name.toLowerCase() === queryName) ||
        (queryName && c.name.toLowerCase().includes(queryName)) ||
        (query.length > 2 && c.name.toLowerCase().includes(query)) ||
        (query.length > 2 && c.firstName.toLowerCase() === query)
    );

    if (found) {
      if (meta?.name && (!found.name || found.name === found.id)) {
        found.name = meta.name;
        found.firstName = meta.name.split(' ')[0] || meta.name;
      }
      if (meta?.avatar && !found.avatar) {
        found.avatar = meta.avatar;
      }
      return found;
    }

    // Create ad-hoc conversation if not found
    const resolvedName = meta?.name || idOrName || 'Customer';
    const newConv: ProviderConversation = {
      id: idOrName || resolvedName.toLowerCase().replace(/\s+/g, '-'),
      name: resolvedName,
      firstName: resolvedName.split(' ')[0] || resolvedName,
      role: meta?.role || 'Customer',
      avatar: meta?.avatar || require('../../assets/images/profile/1007605322.jpg'),
      lastMessage: '',
      time: 'Just now',
      unreadCount: 0,
      messages: [],
    };
    conversationsState = [newConv, ...conversationsState];
    notify();
    return newConv;
  },

  markAsRead: (idOrName: string) => {
    const query = idOrName.toLowerCase().trim();
    conversationsState = conversationsState.map((c) => {
      if (
        c.id.toLowerCase() === query ||
        c.name.toLowerCase().includes(query) ||
        c.firstName.toLowerCase() === query
      ) {
        return { ...c, unreadCount: 0 };
      }
      return c;
    });
    notify();
  },

  sendMessage: (
    idOrName: string,
    text: string,
    type: MessageType = 'text',
    image?: any,
    serviceCard?: ServiceCardData
  ) => {
    const query = idOrName.toLowerCase().trim();
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      type,
      text,
      image,
      serviceCard,
      time: timeStr,
      sender: 'provider', // Provider is the user of this partner app!
    };

    let targetConv: ProviderConversation | undefined;

    conversationsState = conversationsState.map((c) => {
      if (
        c.id.toLowerCase() === query ||
        c.name.toLowerCase().includes(query) ||
        c.firstName.toLowerCase() === query
      ) {
        targetConv = c;
        const updatedMessages = [...c.messages, newMsg];
        return {
          ...c,
          lastMessage: text || (image ? 'Photo' : 'Service Card'),
          time: timeStr,
          messages: updatedMessages,
        };
      }
      return c;
    });

    if (!targetConv) {
      // Add and append
      const newConv: ProviderConversation = {
        id: idOrName,
        name: idOrName,
        firstName: idOrName.split(' ')[0] || idOrName,
        role: 'Customer',
        avatar: require('../../assets/images/appointments/jude_fabulous.png'),
        lastMessage: text,
        time: timeStr,
        unreadCount: 0,
        messages: [newMsg],
      };
      conversationsState = [newConv, ...conversationsState];
      targetConv = newConv;
    }

    notify();

    // Sync outgoing message with live backend when authenticated
    const recipientId = targetConv?.id || idOrName;
    getAuthToken('business')
      .then(async (token) => {
        if (!token) return false;
        let mediaUrl = '';
        const rawUri =
          typeof image === 'string'
            ? image
            : typeof (image as any)?.uri === 'string'
            ? (image as any).uri
            : '';
        if (rawUri.length > 0) {
          const up = await trendApi.uploads.uploadMedia(
            rawUri,
            'provider_chat.jpg',
            'image/jpeg',
            'business'
          );
          mediaUrl = up.data?.url || up.data?.secure_url || '';
        }
        const res = await trendApi.messages.send(
          {
            to: recipientId,
            body: text || (image ? 'Photo' : 'Service Card'),
            media_url: mediaUrl,
          },
          'business'
        );
        return res.ok;
      })
      .catch(() => false);
  },
};

export function useProviderMessagesStore() {
  const [conversations, setConversations] = useState<ProviderConversation[]>(conversationsState);

  useEffect(() => {
    const handleUpdate = () => {
      setConversations([...conversationsState]);
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return {
    conversations,
    getConversation: providerMessagesStore.getConversation,
    markAsRead: providerMessagesStore.markAsRead,
    sendMessage: providerMessagesStore.sendMessage,
  };
}

export default providerMessagesStore;
