import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEV_INITIAL_CHAT_MESSAGES,
  DEV_OWNER_CONTACT,
  DEV_SAMPLE_CONVERSATIONS,
  DEV_SAMPLE_STAFF_MESSAGES,
  DEV_STAFF_COLLEAGUES,
  StaffChatMessage,
  StaffContact,
  StaffConversation,
} from '../constants/staffMessages.config';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/providerStorage';

function formatCurrentTime(): string {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${minutesStr}`;
}

export interface StaffMessagesContextType {
  conversations: StaffConversation[];
  colleagues: StaffContact[];
  ownerContact: StaffContact;
  totalUnreadCount: number;
  markConversationRead: (id: string) => void;
  getConversation: (id: string) => StaffConversation | undefined;
  getOrCreateConversationForContact: (contact: StaffContact) => StaffConversation;
  getMessagesForConversation: (convId: string) => StaffChatMessage[];
  sendMessage: (convId: string, text: string) => void;
  sendImageMessage: (convId: string, image: any) => void;
}

const StaffMessagesContext = createContext<StaffMessagesContextType | undefined>(undefined);

const fallbackStaffMessages: StaffMessagesContextType = {
  conversations: [],
  colleagues: [],
  ownerContact: DEV_OWNER_CONTACT,
  totalUnreadCount: 0,
  markConversationRead: () => { },
  getConversation: () => undefined,
  getOrCreateConversationForContact: (c) => ({
    id: `conv_${c.id}`,
    participantId: c.id,
    participantName: c.name,
    participantRole: c.role,
    participantAvatar: c.avatar,
    tag: 'Team',
    lastMessagePreview: '',
    lastMessageTime: '',
    dateText: 'Today',
    unreadCount: 0,
  }),
  getMessagesForConversation: () => [],
  sendMessage: () => { },
  sendImageMessage: () => { },
};

export const StaffMessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const existing = useContext(StaffMessagesContext);
  if (existing) {
    return <>{children}</>;
  }

  // In-memory isolated staff messaging store
  // TODO (Backend): Load staff conversations, colleagues, and messages from staff messaging endpoints
  const [conversations, setConversations] = useState<StaffConversation[]>(() => {
    return DEV_SAMPLE_STAFF_MESSAGES ? DEV_SAMPLE_CONVERSATIONS : [];
  });

  const [colleagues, setColleagues] = useState<StaffContact[]>(() => {
    return DEV_SAMPLE_STAFF_MESSAGES ? DEV_STAFF_COLLEAGUES : [];
  });

  const [ownerContact] = useState<StaffContact>(DEV_OWNER_CONTACT);

  const [chatMessagesMap, setChatMessagesMap] = useState<Record<string, StaffChatMessage[]>>(() => {
    return DEV_SAMPLE_STAFF_MESSAGES ? { ...DEV_INITIAL_CHAT_MESSAGES } : {};
  });

  // Hydrate colleagues from staff list storage on mount
  useEffect(() => {
    let isMounted = true;
    loadFromStorage<any[]>(STORAGE_KEYS.STAFF_LIST, []).then((saved) => {
      if (isMounted && saved && saved.length > 0) {
        const customColleagues: StaffContact[] = saved.map((s) => ({
          id: s.id,
          name: s.name,
          role: s.role || (s.roles && s.roles[0]) || 'Specialist',
          avatar: s.photoUri
            ? (typeof s.photoUri === 'string' ? { uri: s.photoUri } : s.photoUri)
            : require('../../assets/images/messages/lara_olapade.jpg'),
        }));
        setColleagues((prev) => {
          const base = DEV_SAMPLE_STAFF_MESSAGES ? DEV_STAFF_COLLEAGUES : [];
          const existingIds = new Set(customColleagues.map((c) => c.id));
          return [...customColleagues, ...base.filter((c) => !existingIds.has(c.id))];
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Hydrate conversations and messages from storage on mount
  useEffect(() => {
    let isMounted = true;
    loadFromStorage<StaffConversation[] | null>(STORAGE_KEYS.STAFF_MESSAGES_CONVERSATIONS, null).then((saved) => {
      if (isMounted && saved && saved.length > 0) {
        setConversations(saved);
      }
    });
    loadFromStorage<Record<string, StaffChatMessage[]> | null>(STORAGE_KEYS.STAFF_MESSAGES_MAP, null).then((saved) => {
      if (isMounted && saved && Object.keys(saved).length > 0) {
        setChatMessagesMap(saved);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Persist conversations
  useEffect(() => {
    if (conversations.length > 0) {
      saveToStorage(STORAGE_KEYS.STAFF_MESSAGES_CONVERSATIONS, conversations);
    }
  }, [conversations]);

  // Persist messages
  useEffect(() => {
    if (Object.keys(chatMessagesMap).length > 0) {
      saveToStorage(STORAGE_KEYS.STAFF_MESSAGES_MAP, chatMessagesMap);
    }
  }, [chatMessagesMap]);

  const markConversationRead = useCallback((convId: string) => {
    // TODO (Backend): POST /api/staff/messages/read
    setConversations((prev) =>
      prev.map((conv) => (conv.id === convId ? { ...conv, unreadCount: 0 } : conv))
    );
  }, []);

  const getConversation = useCallback(
    (convId: string) => {
      return conversations.find((c) => c.id === convId);
    },
    [conversations]
  );

  const getOrCreateConversationForContact = useCallback(
    (contact: StaffContact): StaffConversation => {
      const existing = conversations.find((c) => c.participantId === contact.id);
      if (existing) {
        return existing;
      }
      const newConv: StaffConversation = {
        id: `conv_${contact.id}_${Date.now()}`,
        participantId: contact.id,
        participantName: contact.name,
        participantRole: contact.role,
        participantAvatar: contact.avatar,
        tag: 'Team',
        lastMessagePreview: '',
        lastMessageTime: formatCurrentTime(),
        dateText: 'Today',
        unreadCount: 0,
      };
      setConversations((prev) => [newConv, ...prev]);
      return newConv;
    },
    [conversations]
  );

  const getMessagesForConversation = useCallback(
    (convId: string): StaffChatMessage[] => {
      return chatMessagesMap[convId] || [];
    },
    [chatMessagesMap]
  );

  const sendMessage = useCallback((convId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const time = formatCurrentTime();
    const newMsg: StaffChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'me',
      type: 'text',
      text: trimmed,
      time,
      timestamp: Date.now(),
    };

    // TODO (Backend): POST /api/staff/messages/send
    setChatMessagesMap((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === convId
          ? {
            ...conv,
            lastMessagePreview: trimmed,
            lastMessageTime: time,
            dateText: 'Today',
          }
          : conv
      )
    );
  }, []);

  const sendImageMessage = useCallback((convId: string, image: any) => {
    const time = formatCurrentTime();
    const newMsg: StaffChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'me',
      type: 'image',
      image,
      time,
      timestamp: Date.now(),
    };

    // TODO (Backend): POST /api/staff/messages/send-media
    setChatMessagesMap((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === convId
          ? {
            ...conv,
            lastMessagePreview: 'Sent a photo',
            lastMessageTime: time,
            dateText: 'Today',
          }
          : conv
      )
    );
  }, []);

  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);
  }, [conversations]);

  const value = useMemo(
    () => ({
      conversations,
      colleagues,
      ownerContact,
      totalUnreadCount,
      markConversationRead,
      getConversation,
      getOrCreateConversationForContact,
      getMessagesForConversation,
      sendMessage,
      sendImageMessage,
    }),
    [
      conversations,
      colleagues,
      ownerContact,
      totalUnreadCount,
      markConversationRead,
      getConversation,
      getOrCreateConversationForContact,
      getMessagesForConversation,
      sendMessage,
      sendImageMessage,
    ]
  );

  return <StaffMessagesContext.Provider value={value}>{children}</StaffMessagesContext.Provider>;
};

export const useStaffMessages = (): StaffMessagesContextType => {
  const context = useContext(StaffMessagesContext);
  if (!context) {
    return fallbackStaffMessages;
  }
  return context;
};

