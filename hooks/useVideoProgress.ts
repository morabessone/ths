import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertVideoProgress } from '@/lib/education/videoProgress';

export function useVideoProgress(userId: string) {
  const queryClient = useQueryClient();

  const markWatched = useMutation({
    mutationFn: async (videoId: string) => {
      const { error } = await upsertVideoProgress({
        user_id: userId,
        video_id: videoId,
        watched: true,
        watched_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education-videos'] });
      queryClient.invalidateQueries({ queryKey: ['education-videos-featured'] });
      queryClient.invalidateQueries({ queryKey: ['education-videos-saved'] });
      queryClient.invalidateQueries({ queryKey: ['education-video'] });
      queryClient.invalidateQueries({ queryKey: ['education-categories'] });
    },
  });

  const toggleSaved = useMutation({
    mutationFn: async ({
      videoId,
      currentlySaved,
    }: {
      videoId: string;
      currentlySaved: boolean;
    }) => {
      const { error } = await upsertVideoProgress({
        user_id: userId,
        video_id: videoId,
        saved: !currentlySaved,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education-videos'] });
      queryClient.invalidateQueries({ queryKey: ['education-videos-featured'] });
      queryClient.invalidateQueries({ queryKey: ['education-videos-saved'] });
      queryClient.invalidateQueries({ queryKey: ['education-video'] });
    },
  });

  const recordPlayStart = useMutation({
    mutationFn: async (videoId: string) => {
      const { error } = await upsertVideoProgress(
        {
          user_id: userId,
          video_id: videoId,
          watched: false,
        },
        { ignoreDuplicates: true }
      );
      if (error) throw error;
    },
  });

  return { markWatched, toggleSaved, recordPlayStart };
}
