import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { learnVideoHref } from '@/lib/education/routes';
import { Ionicons } from '@expo/vector-icons';
import { LevelBadge } from '@/components/education/LevelBadge';
import { WatchedBadge } from '@/components/education/WatchedBadge';
import { youtubeThumbnail } from '@/lib/education/youtube';
import { cn } from '@/lib/cn';
import type { EducationVideo } from '@/types/education.types';

interface VideoCardProps {
  video: EducationVideo;
  onPremiumPress?: (video: EducationVideo) => void;
  disabled?: boolean;
}

export function VideoCard({ video, onPremiumPress, disabled }: VideoCardProps) {
  const router = useRouter();
  const isWatched = video.watched ?? false;
  const isSaved = video.saved ?? false;

  const handlePress = () => {
    if (disabled) return;
    if (video.is_premium && onPremiumPress) {
      onPremiumPress(video);
      return;
    }
    router.push(learnVideoHref(video.id));
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={video.title}
      onPress={handlePress}
      disabled={disabled}
      className={cn('flex-row mb-3 bg-surface rounded-2xl p-3 border border-border', disabled && 'opacity-50')}
    >
      <View className="relative mr-3">
        <Image
          source={{ uri: youtubeThumbnail(video.youtube_id) }}
          className="w-[120px] h-[68px] rounded-xl"
          contentFit="cover"
          style={{ opacity: isWatched ? 0.7 : 1 }}
        />
        {isWatched ? <WatchedBadge /> : null}
        {video.is_premium ? (
          <View className="absolute top-1 left-1 bg-primary rounded px-1.5 py-0.5">
            <Text className="text-white text-[10px] font-sans-semibold">Premium</Text>
          </View>
        ) : null}
      </View>
      <View className="flex-1 justify-center">
        <Text
          className={cn(
            'font-sans-semibold text-[15px] mb-1',
            isWatched ? 'text-text-secondary' : 'text-text-primary'
          )}
          numberOfLines={2}
        >
          {video.title}
        </Text>
        {video.instructor ? (
          <Text className="font-sans text-text-secondary text-sm mb-1">{video.instructor}</Text>
        ) : null}
        <View className="flex-row items-center gap-2">
          {video.duration_min ? (
            <Text className="font-sans text-text-tertiary text-xs">⏱ {video.duration_min} min</Text>
          ) : null}
          <LevelBadge level={video.level} />
        </View>
      </View>
      <View className="justify-center pl-1">
        <Ionicons
          name={isSaved ? 'bookmark' : 'bookmark-outline'}
          size={22}
          color={isSaved ? '#5B4FCF' : '#A0A0B0'}
        />
      </View>
    </Pressable>
  );
}
