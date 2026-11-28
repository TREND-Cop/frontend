import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
import { trendApi, getAuthToken, extractArray } from '../api/trendApi';
import { useStaffLoginStore } from './StaffLoginContext';

const DEFAULT_AVATAR = require('../../assets/images/messages/lara_olapade.jpg');

function formatCurrentTime(iso?: string): string {
  const now = iso ? new Date(iso) : new Date();
  const valid = Number.isFinite(now.getTime()) ? now : new Date();
  let hours = valid.getHours();
  const minutes = valid.getMinutes();
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
  fetchMessages: (convId: string, participantId?: string) => Promise<void>;
  sendMessage: (convId: string, text: string, participantId?: string) => void;
  sendImageMessage: (convId: string, image: any, participantId?: string) => void;
}

const StaffMessagesContext = createContext<StaffMessagesContextType | undefined>(undefined);

const fallbackStaffMessages: StaffMessagesContextType = {
  conversations: [],
  colleagues: [],
  ownerContact: DEV_OWNER_CONTACT,
  totalUnreadCount: 0,
  markConversationRead: () => {},
  getConversation: () => undefined,
  getOrCreateConversationForContact: (c) => ({
    id: c.id,
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
  fetchMessages: async () => {},
  sendMessage: () => {},
  sendImageMessage: () => {},
};

export const StaffMessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const existing = useContext(StaffMessagesContext);
  if (existing) {
    return <>{children}</>;
  }

  const { verifiedCode } = useStaffLoginStore();
  const staffUserIdRef = useRef<string | null>(null);

  const [conversations, setConversations] = useState<StaffConversation[]>(() => {
    return DEV_SAMPLE_STAFF_MESSAGES ? DEV_SAMPLE_CONVERSATIONS : [];
  });
  const conversationsRef = useRef<StaffConversation[]>(conversations);
  conversationsRef.current = conversations;

  const [colleagues, setColleagues] = useState<StaffContact[]>(() => {
    return DEV_SAMPLE_STAFF_MESSAGES ? DEV_STAFF_COLLEAGUES : [];
  });

  const [ownerContact, setOwnerContact] = useState<StaffContact>(DEV_OWNER_CONTACT);

  const [chatMessagesMap, setChatMessagesMap] = useState<Record<string, StaffChatMessage[]>>(() => {
    return DEV_SAMPLE_STAFF_MESSAGES ? { ...DEV_INITIAL_CHAT_MESSAGES } : {};
  });

  // Hydrate live staff profile (owner + colleagues) and conversations from backend
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const token = await getAuthToken('staff');
      if (token) {
        try {
          const [meRes, convRes] = await Promise.all([
            trendApi.auth.me('staff'),
            trendApi.conversations.list('staff'),
          ]);
          if (!isMounted) return;
          if (meRes.ok && meRes.data) {
            const me = meRes.data;
            staffUserIdRef.current = me.id ? String(me.id) : null;
            if (me.owner_id) {
              setOwnerContact({
                id: String(me.owner_id),
                name: me.owner_name || me.business_name || 'Business Owner',
                role: 'Business Owner',
                avatar: me.owner_image
                  ? { uri: me.owner_image }
                  : me.business_logo
                  ? { uri: me.business_logo }
                  : DEFAULT_AVATAR,
              });
            }
            if (Array.isArray(me.colleagues)) {
              setColleagues(
                me.colleagues.map((c: any) => ({
                  id: String(c.id),
                  name: c.name || 'Colleague',
                  role: c.title || 'Staff',
                  avatar: c.image ? { uri: c.image } : DEFAULT_AVATAR,
                }))
              );
            }
          }
          if (convRes.ok && convRes.data) {
            const rows = extractArray<any>(convRes.data, ['conversations']);
            const mapped: StaffConversation[] = rows.map((c: any) => {
              const peerId = String(c.peer || c.user_id || c.id || '');
              return {
                id: peerId,
                participantId: peerId,
                participantName: c.name || 'User',
                participantRole:
                  c.role === 'business'
                    ? 'Business Owner'
                    : c.role === 'client'
                    ? 'Client'
                    : 'Staff',
                participantAvatar: c.image ? { uri: c.image } : DEFAULT_AVATAR,
                tag: c.role === 'client' ? 'Client' : 'Team',
                lastMessagePreview: c.last_message || '',
                lastMessageTime: formatCurrentTime(c.last_at),
                dateText: 'Today',
                unreadCount: Number(c.unread || 0),
              };
            });
            setConversations(mapped);
          }
        } catch {
          // Keep current state if offline
        }
        return;
      }

      // Offline / unauthenticated preview fallback
      const savedStaff = await loadFromStorage<any[]>(STORAGE_KEYS.STAFF_LIST, []);
      if (isMounted && savedStaff && savedStaff.length > 0) {
        const customColleagues: StaffContact[] = savedStaff.map((s) => ({
          id: s.id,
          name: s.name,
          role: s.role || (s.roles && s.roles[0]) || 'Specialist',
          avatar: s.photoUri
            ? typeof s.photoUri === 'string'
              ? { uri: s.photoUri }
              : s.photoUri
            : DEFAULT_AVATAR,
        }));
        setColleagues(customColleagues);
      }
      const savedConvs = await loadFromStorage<StaffConversation[] | null>(
        STORAGE_KEYS.STAFF_MESSAGES_CONVERSATIONS,
        null
      );
      if (isMounted && savedConvs && savedConvs.length > 0) {
        setConversations(savedConvs);
      }
      const savedMap = await loadFromStorage<Record<string, StaffChatMessage[]> | null>(
        STORAGE_KEYS.STAFF_MESSAGES_MAP,
        null
      );
      if (isMounted && savedMap && Object.keys(savedMap).length > 0) {
        setChatMessagesMap(savedMap);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [verifiedCode]);

  useEffect(() => {
    if (conversations.length > 0) {
      saveToStorage(STORAGE_KEYS.STAFF_MESSAGES_CONVERSATIONS, conversations);
    }
  }, [conversations]);

  useEffect(() => {
    if (Object.keys(chatMessagesMap).length > 0) {
      saveToStorage(STORAGE_KEYS.STAFF_MESSAGES_MAP, chatMessagesMap);
    }
  }, [chatMessagesMap]);

  const resolvePeerId = useCallback((convId: string, participantId?: string): string => {
    if (participantId) return participantId;
    const conv = conversationsRef.current.find((c) => c.id === convId);
    return conv?.participantId || convId;
  }, []);

  const markConversationRead = useCallback((convId: string) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === convId ? { ...conv, unreadCount: 0 } : conv))
    );
  }, []);

  const getConversation = useCallback(
    (convId: string) => {
      return conversations.find((c) => c.id === convId || c.participantId === convId);
    },
    [conversations]
  );

  const getOrCreateConversationForContact = useCallback(
    (contact: StaffContact): StaffConversation => {
      const existingConv = conversations.find(
        (c) => c.participantId === contact.id || c.id === contact.id
      );
      if (existingConv) {
        return existingConv;
      }
      const newConv: StaffConversation = {
        id: contact.id,
        participantId: contact.id,
        participantName: contact.name,
        participantRole: contact.role,
        participantAvatar: contact.avatar,
        tag: contact.role.toLowerCase().includes('client') ? 'Client' : 'Team',
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

  const fetchMessages = useCallback(
    async (convId: string, participantId?: string) => {
      const token = await getAuthToken('staff');
      if (!token) return;
      const peerId = resolvePeerId(convId, participantId);
      if (!peerId || peerId === 'conv_default') return;
      try {
        const res = await trendApi.messages.list(peerId, 'staff');
        if (!res.ok || !res.data) return;
        const rows = extractArray<any>(res.data, ['messages']);
        const mapped: StaffChatMessage[] = rows.map((m: any) => {
          const isMe = staffUserIdRef.current
            ? String(m.sender_id) === staffUserIdRef.current
            : String(m.recipient_id) === peerId;
          const ts = m.created_at ? new Date(m.created_at).getTime() : Date.now();
          return {
            id: String(m.id),
            sender: isMe ? 'me' : 'other',
            type: m.media_url ? 'image' : 'text',
            text: m.body || '',
            image: m.media_url ? { uri: m.media_url } : undefined,
            time: formatCurrentTime(m.created_at),
            timestamp: Number.isFinite(ts) ? ts : Date.now(),
          };
        });
        setChatMessagesMap((prev) => ({ ...prev, [convId]: mapped }));
      } catch {
        // Keep cached messages if offline
      }
    },
    [resolvePeerId]
  );

  const sendMessage = useCallback(
    (convId: string, text: string, participantId?: string) => {
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

      const peerId = resolvePeerId(convId, participantId);
      getAuthToken('staff')
        .then((token) =>
          token && peerId && peerId !== 'conv_default'
            ? trendApi.messages.send({ to: peerId, body: trimmed }, 'staff')
            : null
        )
        .catch(() => {});
    },
    [resolvePeerId]
  );

  const sendImageMessage = useCallback(
    (convId: string, image: any, participantId?: string) => {
      const time = formatCurrentTime();
      const newMsg: StaffChatMessage = {
        id: `msg_${Date.now()}`,
        sender: 'me',
        type: 'image',
        image,
        time,
        timestamp: Date.now(),
      };

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

      const peerId = resolvePeerId(convId, participantId);
      const rawUri = typeof image === 'string' ? image : image?.uri;
      if (rawUri && peerId && peerId !== 'conv_default') {
        (async () => {
          try {
            const token = await getAuthToken('staff');
            if (!token) return;
            let mediaUrl = rawUri;
            if (!/^https?:\/\//i.test(rawUri)) {
              const up = await trendApi.uploads.uploadMedia(
                rawUri,
                'staff_chat.jpg',
                'image/jpeg',
                'staff'
              );
              if (up.ok && up.data?.url) mediaUrl = up.data.url;
            }
            await trendApi.messages.send({ to: peerId, body: '', media_url: mediaUrl }, 'staff');
          } catch {
            // Non-fatal offline fallback
          }
        })();
      }
    },
    [resolvePeerId]
  );

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
      fetchMessages,
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
      fetchMessages,
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
