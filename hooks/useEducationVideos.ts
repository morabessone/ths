import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  attachCategoryFromJoin,
  fetchProgressMap,
  mergeVideoProgress,
} from '@/lib/education/progress';
import type { EducationVideo, LevelFilter } from '@/types/education.types';

export function useVideosByCategory(
  categorySlug: string,
  userId: string,
  levelFilter: LevelFilter = 'all'
) {
  return useQuery({
    queryKey: ['education-videos', categorySlug, userId, levelFilter],
    queryFn: async (): Promise<EducationVideo[]> => {
      const { data: catRaw, error: catError } = await supabase
        .from('education_categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

      const cat = catRaw as { id: string } | null;
      if (catError || !cat) throw new Error('Categoría no encontrada');

      let query = supabase
        .from('education_videos')
        .select('*')
        .eq('category_id', cat.id)
        .eq('published', true)
        .order('order_index');

      if (levelFilter !== 'all') {
        query = query.eq('level', levelFilter);
      }

      const { data: rows, error } = await query;
      if (error) throw error;

      const data = (rows ?? []) as EducationVideo[];
      const progressMap = await fetchProgressMap(
        supabase,
        userId,
        data.map((v) => v.id)
      );
      return mergeVideoProgress(data, progressMap);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useFeaturedVideos(userId: string) {
  return useQuery({
    queryKey: ['education-videos-featured', userId],
    queryFn: async (): Promise<EducationVideo[]> => {
      const { data, error } = await supabase
        .from('education_videos')
        .select('*, education_categories(name, emoji, slug)')
        .eq('featured', true)
        .eq('published', true)
        .order('order_index')
        .limit(10);

      if (error) throw error;

      const videos = ((data ?? []) as EducationVideo[]).map(attachCategoryFromJoin);
      const progressMap = await fetchProgressMap(
        supabase,
        userId,
        videos.map((v) => v.id)
      );
      return mergeVideoProgress(videos, progressMap);
    },
  });
}

export function useSavedVideos(userId: string) {
  return useQuery({
    queryKey: ['education-videos-saved', userId],
    queryFn: async (): Promise<EducationVideo[]> => {
      const { data, error } = await supabase
        .from('video_progress')
        .select('watched, saved, education_videos(*, education_categories(name, emoji, slug))')
        .eq('user_id', userId)
        .eq('saved', true);

      if (error) throw error;

      type SavedRow = {
        watched: boolean;
        saved: boolean;
        education_videos: EducationVideo & {
          education_categories?: EducationVideo['category'];
        };
      };

      return ((data ?? []) as SavedRow[])
        .map((row) => {
          const video = attachCategoryFromJoin(row.education_videos);
          return {
            ...video,
            watched: row.watched ?? false,
            saved: row.saved ?? true,
          };
        })
        .filter((v) => v.id);
    },
  });
}

export function useVideoSearch(query: string, userId: string) {
  return useQuery({
    queryKey: ['education-videos-search', query, userId],
    enabled: query.length >= 2,
    queryFn: async (): Promise<EducationVideo[]> => {
      const { data, error } = await supabase
        .from('education_videos')
        .select('*, education_categories(name, emoji, slug)')
        .eq('published', true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('order_index')
        .limit(20);

      if (error) throw error;

      const videos = ((data ?? []) as EducationVideo[]).map(attachCategoryFromJoin);
      const progressMap = await fetchProgressMap(
        supabase,
        userId,
        videos.map((v) => v.id)
      );
      return mergeVideoProgress(videos, progressMap);
    },
  });
}

export function useVideoYoutubeId(videoId?: string) {
  return useQuery({
    queryKey: ['education-video-youtube', videoId],
    enabled: Boolean(videoId),
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await supabase
        .from('education_videos')
        .select('youtube_id')
        .eq('id', videoId!)
        .maybeSingle();
      if (error) throw error;
      return (data as { youtube_id: string } | null)?.youtube_id ?? null;
    },
    staleTime: 1000 * 60 * 30,
  });
}

export function useVideoDetail(videoId: string, userId: string) {
  return useQuery({
    queryKey: ['education-video', videoId, userId],
    queryFn: async (): Promise<EducationVideo | null> => {
      const { data, error } = await supabase
        .from('education_videos')
        .select('*, education_categories(name, emoji, slug)')
        .eq('id', videoId)
        .single();

      if (error) throw error;
      if (!data) return null;

      const video = attachCategoryFromJoin(data as unknown as EducationVideo);
      const progressMap = await fetchProgressMap(supabase, userId, [video.id]);
      const merged = mergeVideoProgress([video], progressMap);
      return merged[0] ?? null;
    },
  });
}
