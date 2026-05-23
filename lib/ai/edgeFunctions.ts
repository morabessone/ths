import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ERROR_AI_GENERIC } from '@/constants/copy-tone';

async function invoke<T>(name: string, body: Record<string, unknown>): Promise<T> {
  if (!isSupabaseConfigured) {
    throw new Error(ERROR_AI_GENERIC);
  }
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw new Error(ERROR_AI_GENERIC);
  if (data?.error) throw new Error(ERROR_AI_GENERIC);
  return data as T;
}

export async function generateOnboardingPlan(userId: string) {
  return invoke<{ plan_text: string; nutrition_summary: unknown }>('generate-onboarding-plan', {
    user_id: userId,
  });
}

export async function sendChatMessage(params: {
  userId: string;
  message: string;
  conversationHistory: { role: 'user' | 'assistant'; content: string }[];
}) {
  return invoke<{ reply: string }>('chat', {
    user_id: params.userId,
    message: params.message,
    conversation_history: params.conversationHistory,
  });
}

export async function processPantryPhoto(params: {
  userId: string;
  imageBase64: string;
  mediaType?: string;
  sourceType?: 'pantry_photo' | 'receipt';
}) {
  return invoke<{ items: unknown[]; confidence?: string }>('process-pantry-photo', {
    user_id: params.userId,
    image_base64: params.imageBase64,
    media_type: params.mediaType ?? 'image/jpeg',
    source_type: params.sourceType ?? 'pantry_photo',
  });
}

export async function generateShoppingList(userId: string) {
  return invoke<{ items: unknown[]; budget_estimate?: unknown }>('generate-shopping-list', {
    user_id: userId,
  });
}
