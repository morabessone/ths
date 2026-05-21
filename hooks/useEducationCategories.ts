import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { EducationCategory } from '@/types/education.types';

export function useEducationCategories(userId: string) {
  return useQuery({
    queryKey: ['education-categories', userId],
    queryFn: async (): Promise<EducationCategory[]> => {
      const { data: categoriesRaw, error } = await supabase
        .from('education_categories')
        .select('*')
        .eq('published', true)
        .order('order_index');

      if (error) throw error;
      const categories = (categoriesRaw ?? []) as EducationCategory[];
      if (!categories.length) return [];

      const categoryIds = categories.map((c) => c.id);

      const { data: videosRaw, error: videosError } = await supabase
        .from('education_videos')
        .select('id, category_id')
        .eq('published', true)
        .in('category_id', categoryIds);

      if (videosError) throw videosError;

      const videos = (videosRaw ?? []) as { id: string; category_id: string }[];
      const videoCountByCategory: Record<string, number> = {};
      for (const v of videos) {
        videoCountByCategory[v.category_id] = (videoCountByCategory[v.category_id] ?? 0) + 1;
      }

      const watchedByCategory: Record<string, number> = {};
      if (userId) {
        const { data: watchedRows, error: watchedError } = await supabase
          .from('video_progress')
          .select('video_id')
          .eq('user_id', userId)
          .eq('watched', true);

        if (watchedError) throw watchedError;

        const watchedIds = (watchedRows ?? []).map((r) => (r as { video_id: string }).video_id);
        if (watchedIds.length > 0) {
          const { data: watchedVideos } = await supabase
            .from('education_videos')
            .select('category_id')
            .in('id', watchedIds);

          for (const v of (watchedVideos ?? []) as { category_id: string }[]) {
            watchedByCategory[v.category_id] = (watchedByCategory[v.category_id] ?? 0) + 1;
          }
        }
      }

      return categories.map((cat) => ({
        ...cat,
        video_count: videoCountByCategory[cat.id] ?? 0,
        watched_count: watchedByCategory[cat.id] ?? 0,
      }));
    },
    staleTime: 1000 * 60 * 10,
  });
}
