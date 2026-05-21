import { Text, Pressable, View } from 'react-native';
import { useState } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { learnVideoHref } from '@/lib/education/routes';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { youtubeThumbnail } from '@/lib/education/youtube';
import type { EducationTip as EducationTipType } from '@/types/nutrition.types';

interface EducationTipProps {
  tip: EducationTipType | null;
  onExplore?: () => void;
  videoYoutubeId?: string | null;
}

export function EducationTip({ tip, onExplore, videoYoutubeId }: EducationTipProps) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  if (!tip) return null;

  const hasVideo = Boolean(tip.video_id);

  return (
    <Card className="mb-4">
      <Badge label={tip.topic} />
      <View className="flex-row items-start mt-2 mb-2">
        {hasVideo && videoYoutubeId ? (
          <Image
            source={{ uri: youtubeThumbnail(videoYoutubeId, 'hq') }}
            className="w-10 h-10 rounded-lg mr-3"
            contentFit="cover"
          />
        ) : null}
        <Text className="font-display text-text-primary text-lg flex-1">{tip.title}</Text>
      </View>
      <Text
        className="font-sans text-text-secondary text-sm leading-5"
        numberOfLines={expanded ? undefined : 3}
      >
        {tip.content}
      </Text>
      <Pressable
        accessibilityRole="button"
        className="mt-2"
        onPress={() => setExpanded(!expanded)}
      >
        <Text className="font-sans-semibold text-primary text-sm">
          {expanded ? 'Ver menos' : 'Leer más'}
        </Text>
      </Pressable>
      {hasVideo && tip.video_id ? (
        <Button
          variant="secondary"
          size="sm"
          className="mt-3 self-start"
          onPress={() => tip.video_id && router.push(learnVideoHref(tip.video_id))}
        >
          Ver video
        </Button>
      ) : null}
      {onExplore ? (
        <Pressable accessibilityRole="link" className="mt-2" onPress={onExplore}>
          <Text className="font-sans-semibold text-primary text-sm">Explorar más →</Text>
        </Pressable>
      ) : null}
    </Card>
  );
}
