import { useCallback, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import BottomSheet from '@gorhom/bottom-sheet';
import { VideoPlayer } from '@/components/education/VideoPlayer';
import { VideoCardHorizontal } from '@/components/education/VideoCardHorizontal';
import { LevelBadge } from '@/components/education/LevelBadge';
import { TagPill } from '@/components/education/TagPill';
import { FeedbackToast } from '@/components/education/FeedbackToast';
import { PremiumVideoSheet } from '@/components/education/PremiumVideoSheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { useVideoDetail, useVideosByCategory } from '@/hooks/useEducationVideos';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useUserStore } from '@/stores/useUserStore';
import { learnCategoryHref } from '@/lib/education/routes';

export default function VideoDetailScreen() {
  const { videoId } = useLocalSearchParams<{ videoId: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const playerHeight = width * (9 / 16);
  const userId = useUserStore((s) => s.user?.id ?? s.profile?.id ?? '');
  const { isPremium } = useFeatureAccess();
  const id = String(videoId ?? '');

  const { data: video, isLoading } = useVideoDetail(id, userId);
  const categorySlug = video?.category?.slug ?? '';
  const { data: related = [] } = useVideosByCategory(categorySlug, userId);
  const { markWatched, toggleSaved, recordPlayStart } = useVideoProgress(userId);

  const [hasMarkedWatched, setHasMarkedWatched] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const premiumSheetRef = useRef<BottomSheet>(null);
  const bookmarkScale = useSharedValue(1);

  const watched = video?.watched || hasMarkedWatched;
  const saved = video?.saved ?? false;

  const onEnded = useCallback(() => {
    if (!video || hasMarkedWatched || video.watched) return;
    markWatched.mutate(video.id);
    setHasMarkedWatched(true);
  }, [video, hasMarkedWatched, markWatched]);

  const onPlayStart = useCallback(() => {
    if (video) recordPlayStart.mutate(video.id);
  }, [video, recordPlayStart]);

  const handleMarkWatched = () => {
    if (!video || watched) return;
    markWatched.mutate(video.id);
    setHasMarkedWatched(true);
  };

  const handleToggleSaved = () => {
    if (!video) return;
    toggleSaved.mutate(
      { videoId: video.id, currentlySaved: saved },
      {
        onSuccess: () => {
          setToast(saved ? 'Eliminado de tu lista' : 'Guardado en tu lista');
          bookmarkScale.value = withSpring(1.2, {}, () => {
            bookmarkScale.value = withSpring(1);
          });
        },
      }
    );
  };

  const bookmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bookmarkScale.value }],
  }));

  if (isLoading || !video) {
    return (
      <View className="flex-1 bg-bg">
        <Skeleton className="w-full" style={{ height: playerHeight }} />
        <View className="p-4">
          <Skeleton className="h-8 mb-2" />
          <Skeleton className="h-20" />
        </View>
      </View>
    );
  }

  if (video.is_premium && !isPremium) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center px-6">
        <Text className="font-display text-text-primary text-xl mb-4 text-center">
          Contenido exclusivo Premium
        </Text>
        <Pressable onPress={() => premiumSheetRef.current?.expand()}>
          <Text className="font-sans-semibold text-primary">Ver beneficios</Text>
        </Pressable>
        <PremiumVideoSheet video={video} sheetRef={premiumSheetRef} />
      </SafeAreaView>
    );
  }

  const moreInCategory = related.filter((v) => v.id !== video.id).slice(0, 8);

  return (
    <View className="flex-1 bg-bg">
      <VideoPlayer
        youtubeId={video.youtube_id}
        height={playerHeight}
        onEnded={onEnded}
        onPlayStart={onPlayStart}
      />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-4 pt-4">
          <Text className="font-display text-text-primary text-[22px] mb-2">{video.title}</Text>
          {video.category ? (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                video.category?.slug && router.push(learnCategoryHref(video.category.slug))
              }
            >
              <Text className="font-sans text-primary text-sm mb-3">
                {video.category.emoji} {video.category.name}
              </Text>
            </Pressable>
          ) : null}

          {video.instructor ? (
            <Text className="font-sans-semibold text-text-primary text-sm">{video.instructor}</Text>
          ) : null}
          {video.instructor_bio ? (
            <>
              <Text
                className="font-sans text-text-tertiary text-xs mt-0.5"
                numberOfLines={bioExpanded ? undefined : 2}
              >
                {video.instructor_bio}
              </Text>
              <Pressable onPress={() => setBioExpanded(!bioExpanded)}>
                <Text className="font-sans-semibold text-primary text-xs mt-1">
                  {bioExpanded ? 'Ver menos' : 'Ver más'}
                </Text>
              </Pressable>
            </>
          ) : null}

          <View className="flex-row items-center gap-2 mt-3 mb-4">
            {video.duration_min ? (
              <Text className="font-sans text-text-secondary text-sm">⏱ {video.duration_min} min</Text>
            ) : null}
            <LevelBadge level={video.level} />
          </View>

          <View className="flex-row items-center gap-3 mb-6">
            <Pressable
              accessibilityRole="button"
              onPress={handleMarkWatched}
              disabled={watched}
              className={`flex-1 flex-row items-center justify-center rounded-xl py-3 px-4 ${
                watched ? 'bg-success/15' : 'bg-primary-light'
              }`}
            >
              <Ionicons
                name={watched ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={watched ? '#22B87A' : '#5B4FCF'}
              />
              <Text
                className={`font-sans-semibold text-sm ml-2 ${watched ? 'text-success' : 'text-primary'}`}
              >
                {watched ? 'Visto' : 'Marcar como visto'}
              </Text>
            </Pressable>
            <Animated.View style={bookmarkStyle}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={saved ? 'Quitar de guardados' : 'Guardar video'}
                onPress={handleToggleSaved}
                className="w-12 h-12 rounded-xl border border-border items-center justify-center bg-surface"
              >
                <Ionicons
                  name={saved ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                  color="#5B4FCF"
                />
              </Pressable>
            </Animated.View>
          </View>

          {video.description ? (
            <>
              <Text className="font-sans-semibold text-text-primary mb-2">Descripción</Text>
              <Text
                className="font-sans text-text-secondary text-sm leading-5"
                numberOfLines={descExpanded ? undefined : 3}
              >
                {video.description}
              </Text>
              <Pressable onPress={() => setDescExpanded(!descExpanded)} className="mt-1 mb-4">
                <Text className="font-sans-semibold text-primary text-sm">
                  {descExpanded ? 'Ver menos ↑' : 'Ver más ↓'}
                </Text>
              </Pressable>
            </>
          ) : null}

          {video.tags?.length > 0 ? (
            <>
              <Text className="font-sans-semibold text-text-primary mb-2">Temas</Text>
              <View className="flex-row flex-wrap mb-6">
                {video.tags.map((tag) => (
                  <TagPill
                    key={tag}
                    tag={tag}
                    onPress={(t) =>
                      router.push({ pathname: '/(tabs)/learn', params: { q: t } })
                    }
                  />
                ))}
              </View>
            </>
          ) : null}

          {moreInCategory.length > 0 ? (
            <>
              <Text className="font-sans-semibold text-text-primary mb-3">Más en esta categoría</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                {moreInCategory.map((v) => (
                  <VideoCardHorizontal key={v.id} video={v} />
                ))}
              </ScrollView>
            </>
          ) : null}
        </View>
      </ScrollView>

      <FeedbackToast message={toast} onHide={() => setToast(null)} />
    </View>
  );
}
