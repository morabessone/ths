import { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import BottomSheet from '@gorhom/bottom-sheet';
import { VideoCard } from '@/components/education/VideoCard';
import { PremiumVideoSheet } from '@/components/education/PremiumVideoSheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { useEducationCategories } from '@/hooks/useEducationCategories';
import { useVideosByCategory } from '@/hooks/useEducationVideos';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useUserStore } from '@/stores/useUserStore';
import { learnVideoHref } from '@/lib/education/routes';
import { cn } from '@/lib/cn';
import type { EducationVideo, LevelFilter } from '@/types/education.types';

const LEVEL_CHIPS: { key: LevelFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'beginner', label: 'Principiante' },
  { key: 'intermediate', label: 'Intermedio' },
  { key: 'advanced', label: 'Avanzado' },
];

export default function CategoryVideosScreen() {
  const { categorySlug } = useLocalSearchParams<{ categorySlug: string }>();
  const router = useRouter();
  const userId = useUserStore((s) => s.user?.id ?? s.profile?.id ?? '');
  const { isPremium } = useFeatureAccess();
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [offline, setOffline] = useState(false);
  const premiumSheetRef = useRef<BottomSheet>(null);
  const [premiumVideo, setPremiumVideo] = useState<EducationVideo | null>(null);

  const slug = String(categorySlug ?? '');
  const { data: categories = [] } = useEducationCategories(userId);
  const category = categories.find((c) => c.slug === slug);
  const { data: videos = [], isLoading } = useVideosByCategory(slug, userId, levelFilter);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) => setOffline(!(s.isConnected ?? true)));
    NetInfo.fetch().then((s) => setOffline(!(s.isConnected ?? true)));
    return () => unsub();
  }, []);

  const handlePremiumPress = (video: EducationVideo) => {
    if (isPremium) {
      router.push(learnVideoHref(video.id));
      return;
    }
    setPremiumVideo(video);
    premiumSheetRef.current?.expand();
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-4 pt-2 pb-2 flex-row items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          className="mr-2 p-1"
        >
          <Ionicons name="chevron-back" size={24} color="#1A1240" />
        </Pressable>
        <Text className="text-2xl mr-2">{category?.emoji ?? '📚'}</Text>
        <View className="flex-1">
          <Text className="font-display text-text-primary text-xl">{category?.name ?? slug}</Text>
          <Text className="font-sans text-text-secondary text-sm">
            {videos.length} {videos.length === 1 ? 'video' : 'videos'}
          </Text>
        </View>
      </View>

      {offline ? (
        <View className="mx-4 mb-2 bg-warning/15 rounded-xl px-3 py-2">
          <Text className="font-sans text-text-secondary text-sm text-center">
            Sin conexión · Los videos requieren internet
          </Text>
        </View>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 mb-3"
        contentContainerStyle={{ gap: 8 }}
      >
        {LEVEL_CHIPS.map((chip) => {
          const active = levelFilter === chip.key;
          return (
            <Pressable
              key={chip.key}
              accessibilityRole="button"
              onPress={() => setLevelFilter(chip.key)}
              className={cn(
                'rounded-full px-4 py-2 border',
                active ? 'bg-primary-light border-primary' : 'bg-transparent border-border'
              )}
            >
              <Text
                className={cn(
                  'font-sans-medium text-sm',
                  active ? 'text-primary' : 'text-text-secondary'
                )}
              >
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <View className="px-4">
          <Skeleton className="h-24 mb-3" />
          <Skeleton className="h-24 mb-3" />
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => `${item.id}-${levelFilter}`}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <VideoCard
              video={item}
              disabled={offline}
              onPremiumPress={!isPremium && item.is_premium ? handlePremiumPress : undefined}
            />
          )}
        />
      )}

      <PremiumVideoSheet video={premiumVideo} sheetRef={premiumSheetRef} />
    </SafeAreaView>
  );
}
