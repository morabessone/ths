import type { EducationVideo } from '@/types/education.types';

export type ProgressMap = Record<
  string,
  { watched: boolean; saved: boolean; watched_at: string | null }
>;

export function mergeVideoProgress<T extends { id: string }>(
  videos: T[],
  progressMap: ProgressMap
): (T & { watched: boolean; saved: boolean })[] {
  return videos.map((v) => ({
    ...v,
    watched: progressMap[v.id]?.watched ?? false,
    saved: progressMap[v.id]?.saved ?? false,
  }));
}

export async function fetchProgressMap(
  supabase: import('@supabase/supabase-js').SupabaseClient,
  userId: string,
  videoIds: string[]
): Promise<ProgressMap> {
  if (!userId || videoIds.length === 0) return {};

  const { data, error } = await supabase
    .from('video_progress')
    .select('video_id, watched, saved, watched_at')
    .eq('user_id', userId)
    .in('video_id', videoIds);

  if (error) throw error;

  const map: ProgressMap = {};
  for (const row of data ?? []) {
    map[row.video_id] = {
      watched: row.watched ?? false,
      saved: row.saved ?? false,
      watched_at: row.watched_at,
    };
  }
  return map;
}

export function attachCategoryFromJoin(
  row: EducationVideo & {
    education_categories?: EducationVideo['category'] | EducationVideo['category'][];
  }
): EducationVideo {
  const cat = row.education_categories;
  const category = Array.isArray(cat) ? cat[0] : cat;
  const { education_categories: _, ...rest } = row as EducationVideo & {
    education_categories?: unknown;
  };
  return { ...rest, category: category ?? rest.category };
}
