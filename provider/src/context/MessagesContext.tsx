import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import {
  Conversation,
  DEV_SAMPLE_CONVERSATIONS,
  SAMPLE_SEED_CONVERSATIONS,
} from '../constants/messages.config';
import { useStaffStore } from './StaffContext';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/providerStorage';
import { trendApi, getAuthToken, extractArray } from '../api/trendApi';

export interface MessagesContextType {
  conversations: Conversation[];
  markConversationRead: (id: string) => void;
  getConversationForStaff: (staffId: string) => Conversation | undefined;
  startConversation: (staffId: string) => string;
  updateLastMessage: (convIdOrStaffId: string, preview: string, time?: string) => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { staff } = useStaffStore();

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    if (!DEV_SAMPLE_CONVERSATIONS) {
      return [];
    }
    return SAMPLE_SEED_CONVERSATIONS;
  });

  // Hydrate conversations from storage and live backend
  useEffect(() => {
    let isMounted = true;
    const hydrate = async () => {
      const saved = await loadFromStorage<Conversation[] | null>(
        STORAGE_KEYS.PROVIDER_CONVERSATIONS,
        null
      );
      if (isMounted && saved && saved.length > 0) {
        setConversations(saved);
      }

      try {
        const token = await getAuthToken('business');
        if (!token || !isMounted) return;
        const res = await trendApi.conversations.list('business');
        if (!res.ok || !res.data || !isMounted) return;
        const rows = extractArray<any>(res.data, ['conversations']);
        if (rows.length === 0) return;

        const mapped: Conversation[] = rows.map((c: any, idx: number) => ({
          id: String(c.user_id || c.peer || c.id || `remote_conv_${idx}`),
          staffId: String(c.user_id || c.peer || c.partner_id || c.id || `remote_${idx}`),
          lastMessagePreview: c.last_message || c.lastMessage || '',
          lastMessageTime:
            c.last_at || c.last_message_at || c.updated_at
              ? new Date(c.last_at || c.last_message_at || c.updated_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Just now',
          unreadCount: Number(c.unread ?? c.unread_count ?? c.unreadCount ?? 0),
          kind: c.role === 'staff' ? 'Staff' : undefined,
          ...(c.name ? { partnerName: c.name } : {}),
          ...(c.role ? { partnerRole: c.role } : {}),
        }));

        setConversations((prev) => {
          const ids = new Set(mapped.map((m) => m.id));
          return [...mapped, ...prev.filter((p) => !ids.has(p.id))];
        });
      } catch {
        // Keep local conversations intact
      }
    };
    hydrate();
    return () => {
      isMounted = false;
    };
  }, []);

  // Persist conversations
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PROVIDER_CONVERSATIONS, conversations);
  }, [conversations]);

  const markConversationRead = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === id ? { ...conv, unreadCount: 0 } : conv))
    );
  }, []);

  const getConversationForStaff = useCallback(
    (staffId: string) => {
      return conversations.find((conv) => conv.staffId === staffId);
    },
    [conversations]
  );

  const startConversation = useCallback(
    (staffId: string) => {
      const existing = conversations.find((conv) => conv.staffId === staffId);
      if (existing) {
        return existing.id;
      }
      const newId = `conv_${Date.now()}`;
      const newConv: Conversation = {
        id: newId,
        staffId,
        lastMessagePreview: 'Started a new conversation',
        lastMessageTime: '12:11',
        unreadCount: 0,
        kind: 'Staff',
      };
      setConversations((prev) => [newConv, ...prev]);
      return newId;
    },
    [conversations]
  );

  const updateLastMessage = useCallback((convIdOrStaffId: string, preview: string, time?: string) => {
    const formattedTime = time || 'Just now';
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === convIdOrStaffId || conv.staffId === convIdOrStaffId) {
          return {
            ...conv,
            lastMessagePreview: preview,
            lastMessageTime: formattedTime,
          };
        }
        return conv;
      })
    );
  }, []);

  const value = useMemo(
    () => ({
      conversations,
      markConversationRead,
      getConversationForStaff,
      startConversation,
      updateLastMessage,
    }),
    [conversations, markConversationRead, getConversationForStaff, startConversation, updateLastMessage]
  );

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
};

export function useMessagesStore(): MessagesContextType {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessagesStore must be used within a MessagesProvider');
  }
  return context;
}

export default MessagesContext;
