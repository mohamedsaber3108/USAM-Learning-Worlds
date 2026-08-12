/**
 * useAzouz Hook
 * Manages real-time connection to Azouz character backend
 */

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/services/api';
import type { AIMessage } from '@/types/domain';

interface UseAzouzOptions {
  characterId?: string;
  autoLoad?: boolean;
}

interface UseAzouzReturn {
  messages: AIMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  startConversation: (type: string) => Promise<void>;
  clearMessages: () => void;
}

export function useAzouz(options: UseAzouzOptions = {}): UseAzouzReturn {
  const { characterId = 'azouz', autoLoad = true } = options;

  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Azouz character on mount
  useEffect(() => {
    if (autoLoad) {
      loadCharacter();
    }
  }, [characterId, autoLoad]);

  const loadCharacter = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to get Egyptian Arabic version if available
      const character = await api.characters.get(characterId, 'ar-EG');

      // Add welcome message
      setMessages([
        {
          id: 'welcome',
          author: 'azouz',
          kind: 'chat',
          text: 'أهلا! عامل إيه؟ أنا عزوز، صديقك في التعلم. عايز تتعلم إيه النهاردة؟',
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load character');

      // Fallback to English
      setMessages([
        {
          id: 'welcome',
          author: 'azouz',
          kind: 'chat',
          text: "Hi! I'm Azouz, your learning companion. What would you like to learn today?",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const startConversation = useCallback(
    async (type: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await api.characters.createConversation(
          characterId,
          type,
        );

        setConversationId(response.id);

        // Add initial messages
        const formattedMessages: AIMessage[] = response.messages.map((m) => ({
          id: m.id,
          author: m.role === 'LEARNER' ? 'learner' : 'azouz',
          kind: 'chat',
          text: m.content,
          timestamp: new Date(m.timestamp),
        }));

        setMessages(formattedMessages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start conversation');
      } finally {
        setIsLoading(false);
      }
    },
    [characterId],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      try {
        setIsLoading(true);
        setError(null);

        // Add learner message immediately (optimistic update)
        const learnerMessage: AIMessage = {
          id: `temp-${Date.now()}`,
          author: 'learner',
          kind: 'chat',
          text: text.trim(),
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, learnerMessage]);

        // If no conversation exists, use quick chat
        if (!conversationId) {
          const response = await api.characters.chat(characterId, text);

          const azouzMessage: AIMessage = {
            id: response.messageId,
            author: 'azouz',
            kind: 'chat',
            text: response.characterResponse,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, azouzMessage]);
          setConversationId(response.conversationId);
        } else {
          // Use existing conversation
          const response = await api.characters.sendMessage(conversationId, text);

          const azouzMessage: AIMessage = {
            id: response.id,
            author: 'azouz',
            kind: 'chat',
            text: response.content,
            timestamp: new Date(response.timestamp),
          };

          setMessages((prev) => [...prev, azouzMessage]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');

        // Remove optimistic update on error
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
      }
    },
    [characterId, conversationId],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    startConversation,
    clearMessages,
  };
}
