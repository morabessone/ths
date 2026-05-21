import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { learnVideoHref } from '@/lib/education/routes';
import { LevelBadge } from '@/components/education/LevelBadge';
import { WatchedBadge } from '@/components/education/WatchedBadge';
import { youtubeThumbnail } from '@/lib/education/youtube';
import type { EducationVideo } from '@/types/education.types';

interface VideoCardHorizontalProps {
  video: EducationVideo;
  onPremiumPress?: (video: EducationVideo) => void;
}

export function VideoCardHorizontal({ video, onPremiumPress }: VideoCardHorizontalProps) {
  const router = useRouter();
  const isWatched = video.watched ?? false;

  const handlePress = () => {
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
      className="w-[200px] mr-3"
    >
      <View className="relative mb-2">
        <Image
          source={{ uri: youtubeThumbnail(video.youtube_id) }}
          className="w-[200px] h-[112px] rounded-xl"
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
      <Text className="font-sans-semibold text-text-primary text-sm" numberOfLines={2}>
        {video.title}
      </Text>
      {video.category?.name ? (
        <Text className="font-sans text-text-tertiary text-xs mt-0.5">
          {video.category.emoji} {video.category.name}
        </Text>
      ) : null}
      <View className="mt-1">
        <LevelBadge level={video.level} />
      </View>
    </Pressable>
  );
}
