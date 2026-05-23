import { create } from 'zustand';
import * as Haptics from 'expo-haptics';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { sendChatMessage } from '@/lib/ai/edgeFunctions';
import { ERROR_AI_GENERIC } from '@/constants/copy-tone';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

interface ChatStore {
  messages: ChatMessage[];
  isTyping: boolean;
  isLoading: boolean;
  error: string | null;
  loadHistory: (userId: string) => Promise<void>;
  sendMessage: (userId: string, content: string) => Promise<void>;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isTyping: false,
  isLoading: false,
  error: null,

  loadHistory: async (userId) => {
    if (!isSupabaseConfigured) return;
    set({ isLoading: true, error: null });
    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      set({ isLoading: false, error: ERROR_AI_GENERIC });
      return;
    }

    const rows = (data ?? []) as {
      id: string;
      role: string;
      content: string;
      created_at?: string;
    }[];
    const messages = rows
      .reverse()
      .map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        created_at: m.created_at,
      }));

    set({ messages, isLoading: false });
  },

  sendMessage: async (userId, content) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    set((s) => ({
      messages: [...s.messages, optimistic],
      isTyping: true,
      error: null,
    }));

    try {
      const history = get().messages
        .filter((m) => !m.id.startsWith('local-'))
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      const { reply } = await sendChatMessage({
        userId,
        message: trimmed,
        conversationHistory: history,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      set((s) => ({
        messages: [
          ...s.messages,
          { id: `assistant-${Date.now()}`, role: 'assistant', content: reply },
        ],
        isTyping: false,
      }));
    } catch {
      set({ isTyping: false, error: ERROR_AI_GENERIC });
    }
  },

  clearChat: () => set({ messages: [], error: null }),
}));
