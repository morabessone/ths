import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

export type VideoProgressInsert = Database['public']['Tables']['video_progress']['Insert'];

export async function upsertVideoProgress(
  row: VideoProgressInsert,
  options?: { ignoreDuplicates?: boolean }
) {
  const client = supabase as unknown as {
    from: (table: string) => {
      upsert: (
        values: VideoProgressInsert[],
        opts: { onConflict: string; ignoreDuplicates?: boolean }
      ) => Promise<{ error: { message: string } | null }>;
    };
  };
  return client.from('video_progress').upsert([row], {
    onConflict: 'user_id,video_id',
    ...options,
  });
}
