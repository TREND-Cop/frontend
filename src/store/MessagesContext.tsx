import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONVERSATIONS_STORAGE_KEY = '@trend_conversations_v2';
const MESSAGES_STORAGE_KEY = '@trend_messages_v2';

export type MessageType = 'text' | 'image' | 'serviceCard' | 'photosAlbum' | 'dateDivider';

export interface ServiceCardData {
  title: string;
  image: any;
  duration: string;
  rating: string;
  reviewsCount: string;
  price: string;
  originalPrice?: string;
  discountText?: string;
}

export interface PhotosAlbumData {
  title: string;
  photos: any[];
}

export interface MessageItem {
  id: string;
  type: MessageType;
  text?: string;
  image?: any;
  serviceCard?: ServiceCardData;
  photosAlbum?: PhotosAlbumData;
  sender: 'user' | 'salon' | 'system';
  time: string;
}

export interface MessageConversation {
  id: string;
  name: string;
  avatar: any;
  lastMessage: string;
  time: string;
  unreadCount: number;
  salonId?: string;
}

const DEFAULT_CONVERSATIONS: MessageConversation[] = [
  {
    id: 'c1',
    name: 'Luminous Lux',
    avatar: require('../../assets/images/620f39dda80fe7971b4af170c890481a63da61b0.jpg'),
    lastMessage: 'Thanks for reaching out! One of our specialists will be with you right away.',
    time: '12:20',
    unreadCount: 1,
    salonId: 'salon2',
  },
  {
    id: 'c2',
    name: 'Lampord',
    avatar: require('../../assets/images/4218763aec656cbbdd9bfa7d3952a6234a3eefe6.jpg'),
    lastMessage: 'Your haircut appointment is confirmed for tomorrow.',
    time: '12:11',
    unreadCount: 0,
    salonId: 'salon1',
  },
  {
    id: 'c3',
    name: 'Beauty',
    avatar: require('../../assets/images/search_salon1.png'),
    lastMessage: 'We have special offers on pedicure sessions this weekend!',
    time: '11:45',
    unreadCount: 0,
  },
  {
    id: 'c4',
    name: 'Nova',
    avatar: require('../../assets/images/search_salon2.png'),
    lastMessage: 'Would you like to reschedule your manicure?',
    time: 'Yesterday',
    unreadCount: 0,
  },
  {
    id: 'c5',
    name: 'Ominials',
    avatar: require('../../assets/images/c80c90051e066678cbe3be653183cf5ff19c352d.jpg'),
    lastMessage: 'See you soon! Let us know if you need parking.',
    time: 'Yesterday',
    unreadCount: 0,
  },
  {
    id: 'c6',
    name: 'Vogue',
    avatar: require('../../assets/images/2994a594d66b1394572508c5f3985ee6209b360f.jpg'),
    lastMessage: 'Thank you for choosing Vogue Salon.',
    time: '12/03/2026',
    unreadCount: 0,
  },
  {
    id: 'c7',
    name: 'Soft Touch',
    avatar: require('../../assets/images/882a99380ae2d750b39f897365bd1d6083664a3b.jpg'),
    lastMessage: 'Feel free to ask any styling questions.',
    time: '12/03/2026',
    unreadCount: 0,
  },
];

const DEFAULT_MESSAGES: Record<string, MessageItem[]> = {
  c1: [
    {
      id: 'm1',
      type: 'text',
      sender: 'user',
      text: 'Hello this is Fabulous',
      time: '12:04',
    },
    {
      id: 'm2',
      type: 'text',
      sender: 'salon',
      text: 'Hi there!! This is luminous Lux, how can we be of help?',
      time: '12:05',
    },
    {
      id: 'm3',
      type: 'text',
      sender: 'user',
      text: 'Thanks, please i would love the following service, is it available?',
      time: '12:04',
    },
    {
      id: 'm4',
      type: 'image',
      sender: 'user',
      image: require('../../assets/images/profile/4538d4759870466dd05509849b26c4b0b111d827.jpg'),
      time: '12:04',
    },
    {
      id: 'm5',
      type: 'text',
      sender: 'salon',
      text: 'Yes, we do.',
      time: '12:04',
    },
    {
      id: 'm6',
      type: 'serviceCard',
      sender: 'salon',
      serviceCard: {
        title: 'Clove Pattern',
        image: require('../../assets/images/profile/4538d4759870466dd05509849b26c4b0b111d827.jpg'),
        duration: '1hrs cut',
        rating: '4.1',
        reviewsCount: '(321)',
        price: '₦14,200',
        originalPrice: '1500',
        discountText: 'Save 10%',
      },
      time: '12:16',
    },
    {
      id: 'm7',
      type: 'dateDivider',
      sender: 'system',
      text: 'Yesterday',
      time: '',
    },
    {
      id: 'm8',
      type: 'photosAlbum',
      sender: 'user',
      photosAlbum: {
        title: '3 Photos',
        photos: [
          require('../../assets/images/profile/14dcc3440340f9f140251ac160473457c89b198c.jpg'),
          require('../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg'),
          require('../../assets/images/profile/30b9a5ab22324bd8357f666111d5584ad2e3c83e.jpg'),
        ],
      },
      time: '12:20',
    },
  ],
  c2: [
    {
      id: 'm_c2_1',
      type: 'text',
      sender: 'user',
      text: 'Hello, is my booking for tomorrow confirmed?',
      time: '12:10',
    },
    {
      id: 'm_c2_2',
      type: 'text',
      sender: 'salon',
      text: 'Your haircut appointment is confirmed for tomorrow. See you at 2:00 PM!',
      time: '12:11',
    },
  ],
};

interface MessagesContextType {
  conversations: MessageConversation[];
  getConversation: (id: string) => MessageConversation | undefined;
  getMessages: (conversationId: string) => MessageItem[];
  sendMessage: (
    conversationId: string,
    message: {
      text?: string;
      image?: any;
      serviceCard?: ServiceCardData;
      photosAlbum?: PhotosAlbumData;
      type?: MessageType;
      sender?: 'user' | 'salon';
    }
  ) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  startOrGetConversation: (salon: {
    id: string;
    name: string;
    avatar?: any;
    salonId?: string;
  }) => string;
  totalUnreadCount: number;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

const formatCurrentTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const mins = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${mins}`;
};

export const MessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<MessageConversation[]>(DEFAULT_CONVERSATIONS);
  const [messagesMap, setMessagesMap] = useState<Record<string, MessageItem[]>>(DEFAULT_MESSAGES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted conversations and messages on mount
  useEffect(() => {
    const loadStorage = async () => {
      try {
        const storedConvs = await AsyncStorage.getItem(CONVERSATIONS_STORAGE_KEY);
        const storedMsgs = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);

        if (storedConvs) {
          setConversations(JSON.parse(storedConvs));
        }
        if (storedMsgs) {
          setMessagesMap(JSON.parse(storedMsgs));
        }
      } catch (e) {
        console.warn('Failed to load message store from AsyncStorage:', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadStorage();
  }, []);

  // Persist state updates
  const saveState = useCallback(
    async (
      updatedConvs: MessageConversation[],
      updatedMsgs: Record<string, MessageItem[]>
    ) => {
      setConversations(updatedConvs);
      setMessagesMap(updatedMsgs);
      try {
        await AsyncStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(updatedConvs));
        await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(updatedMsgs));
      } catch (e) {
        console.warn('Failed to persist messages to AsyncStorage:', e);
      }
    },
    []
  );

  const getConversation = useCallback(
    (id: string) => {
      if (!id) return undefined;
      const normalizedId = id === '1' ? 'c1' : id === '2' ? 'c2' : id;
      return (
        conversations.find((c) => c.id === normalizedId) ||
        conversations.find((c) => c.salonId === normalizedId) ||
        conversations.find((c) => c.id === id) ||
        conversations.find((c) => c.salonId === id)
      );
    },
    [conversations]
  );

  const getMessages = useCallback(
    (conversationId: string) => {
      const conv = getConversation(conversationId);
      const actualId = conv ? conv.id : conversationId;
      return messagesMap[actualId] || [];
    },
    [getConversation, messagesMap]
  );

  const markAsRead = useCallback(
    async (conversationId: string) => {
      const conv = getConversation(conversationId);
      const targetId = conv ? conv.id : conversationId;
      let changed = false;
      const updated = conversations.map((c) => {
        if ((c.id === targetId || c.salonId === targetId) && c.unreadCount > 0) {
          changed = true;
          return { ...c, unreadCount: 0 };
        }
        return c;
      });
      if (changed) {
        await saveState(updated, messagesMap);
      }
    },
    [conversations, getConversation, messagesMap, saveState]
  );

  const startOrGetConversation = useCallback(
    (salon: { id: string; name: string; avatar?: any; salonId?: string }): string => {
      const existing = getConversation(salon.id) || (salon.salonId ? getConversation(salon.salonId) : undefined);
      if (existing) {
        return existing.id;
      }

      const newId = `c_${Date.now()}`;
      const newConversation: MessageConversation = {
        id: newId,
        name: salon.name,
        avatar: salon.avatar || require('../../assets/images/620f39dda80fe7971b4af170c890481a63da61b0.jpg'),
        lastMessage: 'Conversation started',
        time: formatCurrentTime(),
        unreadCount: 0,
        salonId: salon.id,
      };

      const newConvs = [newConversation, ...conversations];
      const newMsgs = {
        ...messagesMap,
        [newId]: [
          {
            id: `sys_${Date.now()}`,
            type: 'dateDivider' as MessageType,
            text: 'Today',
            time: '',
            sender: 'system' as const,
          },
          {
            id: `sal_welcome_${Date.now()}`,
            type: 'text' as MessageType,
            sender: 'salon' as const,
            text: `Welcome to ${salon.name}! How can our specialists assist you today?`,
            time: formatCurrentTime(),
          },
        ],
      };

      saveState(newConvs, newMsgs);
      return newId;
    },
    [conversations, getConversation, messagesMap, saveState]
  );

  const sendMessage = useCallback(
    async (
      conversationId: string,
      message: {
        text?: string;
        image?: any;
        serviceCard?: ServiceCardData;
        photosAlbum?: PhotosAlbumData;
        type?: MessageType;
        sender?: 'user' | 'salon';
      }
    ) => {
      const conv = getConversation(conversationId);
      const actualConvId = conv ? conv.id : conversationId;
      const timeStr = formatCurrentTime();
      const newMessage: MessageItem = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: message.type || (message.image ? 'image' : 'text'),
        text: message.text,
        image: message.image,
        serviceCard: message.serviceCard,
        photosAlbum: message.photosAlbum,
        sender: message.sender || 'user',
        time: timeStr,
      };

      const existingMessages = messagesMap[actualConvId] || [];
      const updatedMessagesForThread = [...existingMessages, newMessage];
      const updatedMsgs = {
        ...messagesMap,
        [actualConvId]: updatedMessagesForThread,
      };

      // Determine last message text preview
      let previewText = message.text || '';
      if (message.image) previewText = '📷 Photo';
      if (message.serviceCard) previewText = `💼 Service: ${message.serviceCard.title}`;
      if (message.photosAlbum) previewText = `🖼️ ${message.photosAlbum.title}`;

      // Update conversations list (move active chat to top)
      let targetConv = conv;

      let updatedConvs: MessageConversation[];
      if (targetConv) {
        const remaining = conversations.filter((c) => c.id !== targetConv!.id);
        const updatedTarget: MessageConversation = {
          ...targetConv,
          lastMessage: previewText,
          time: timeStr,
          unreadCount: message.sender === 'salon' ? targetConv.unreadCount + 1 : 0,
        };
        updatedConvs = [updatedTarget, ...remaining];
      } else {
        // Fallback create conversation if not exists
        const newConv: MessageConversation = {
          id: actualConvId,
          name: 'Salon Specialist',
          avatar: require('../../assets/images/620f39dda80fe7971b4af170c890481a63da61b0.jpg'),
          lastMessage: previewText,
          time: timeStr,
          unreadCount: 0,
          salonId: actualConvId,
        };
        updatedConvs = [newConv, ...conversations];
      }

      await saveState(updatedConvs, updatedMsgs);

      // If sent by user, simulate realistic salon specialist response
      if (message.sender !== 'salon') {
        setTimeout(async () => {
          const userLower = (message.text || '').toLowerCase();
          let salonReply =
            'Thanks for reaching out! One of our specialists will be with you right away.';

          if (message.image) {
            salonReply = 'That reference looks fantastic! We have specialists skilled in this exact style.';
          } else if (
            userLower.includes('price') ||
            userLower.includes('cost') ||
            userLower.includes('how much')
          ) {
            salonReply =
              'Our packages start from ₦8,500 depending on your hair or treatment package. Would you like to see available options?';
          } else if (
            userLower.includes('time') ||
            userLower.includes('open') ||
            userLower.includes('today') ||
            userLower.includes('available')
          ) {
            salonReply =
              'We are open today until 10:00 PM! You can tap any service card to book your preferred time slot.';
          } else if (userLower.includes('book') || userLower.includes('appointment')) {
            salonReply =
              'Awesome! You can view and book appointments directly through our service catalog here.';
          }

          const salonTime = formatCurrentTime();
          const salonMsg: MessageItem = {
            id: `sal_${Date.now()}`,
            type: 'text',
            text: salonReply,
            sender: 'salon',
            time: salonTime,
          };

          const currentMessagesNow = updatedMsgs[actualConvId] || [];
          const withSalonReply = [...currentMessagesNow, salonMsg];
          const newMapWithReply = {
            ...updatedMsgs,
            [actualConvId]: withSalonReply,
          };

          // Update conversation row
          const convNow = updatedConvs.find((c) => c.id === actualConvId);
          if (convNow) {
            const rest = updatedConvs.filter((c) => c.id !== convNow.id);
            const updatedWithReply: MessageConversation = {
              ...convNow,
              lastMessage: salonReply,
              time: salonTime,
            };
            await saveState([updatedWithReply, ...rest], newMapWithReply);
          }
        }, 1200);
      }
    },
    [conversations, getConversation, messagesMap, saveState]
  );

  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }, [conversations]);

  const value = {
    conversations,
    getConversation,
    getMessages,
    sendMessage,
    markAsRead,
    startOrGetConversation,
    totalUnreadCount,
  };

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
};

export const useMessagesContext = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessagesContext must be used within a MessagesProvider');
  }
  return context;
};

export default MessagesContext;
