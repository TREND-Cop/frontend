import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  Conversation,
  DEV_SAMPLE_CONVERSATIONS,
  SAMPLE_SEED_CONVERSATIONS,
} from '../constants/messages.config';
import { useStaffStore } from './StaffContext';

export interface MessagesContextType {
  conversations: Conversation[];
  markConversationRead: (id: string) => void;
  getConversationForStaff: (staffId: string) => Conversation | undefined;
  startConversation: (staffId: string) => string;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { staff } = useStaffStore();

  // In-memory conversations store
  // TODO (Backend): load conversations, unread counts, realtime updates. No persistence.
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    if (!DEV_SAMPLE_CONVERSATIONS) {
      return [];
    }

    // Seed conversations dynamically with existing staff if available
    if (staff.length > 0) {
      return [
        {
          id: 'conv_1',
          staffId: staff[0].id,
          lastMessagePreview: "Hello this is luminious looks and we're..",
          lastMessageTime: '12:11',
          unreadCount: 1,
          kind: 'Staff',
        },
        ...(staff.length > 1
          ? [
              {
                id: 'conv_2',
                staffId: staff[1].id,
                lastMessagePreview: "Hello this is luminious looks and we're..",
                lastMessageTime: 'Wed/3/2026',
                unreadCount: 0,
                kind: 'Staff' as const,
              },
            ]
          : []),
      ];
    }

    return SAMPLE_SEED_CONVERSATIONS;
  });

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

  const value = useMemo(
    () => ({
      conversations,
      markConversationRead,
      getConversationForStaff,
      startConversation,
    }),
    [conversations, markConversationRead, getConversationForStaff, startConversation]
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
