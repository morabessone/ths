import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { CategoryCard } from '@/components/education/CategoryCard';
import { VideoCard } from '@/components/education/VideoCard';
import { VideoCardHorizontal } from '@/components/education/VideoCardHorizontal';
import { PremiumVideoSheet } from '@/components/education/PremiumVideoSheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useEducationCategories } from '@/hooks/useEducationCategories';
import {
  useFeaturedVideos,
  useSavedVideos,
  useVideoSearch,
} from '@/hooks/useEducationVideos';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useUserStore } from '@/stores/useUserStore';
import { learnSavedHref, learnVideoHref } from '@/lib/education/routes';
import type { EducationVideo } from '@/types/education.types';

export default function LearnScreen() {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const userId = useUserStore((s) => s.user?.id ?? s.profile?.id ?? '');
  const { isPremium } = useFeatureAccess();

  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const premiumSheetRef = useRef<BottomSheet>(null);
  const [premiumVideo, setPremiumVideo] = useState<EducationVideo | null>(null);

  useEffect(() => {
    if (typeof q === 'string' && q.length > 0) {
      setSearch(q);
    }
  }, [q]);

  const searchQuery = search.trim();
  const isSearching = searchQuery.length >= 2;

  const categories = useEducationCategories(userId);
  const featured = useFeaturedVideos(userId);
  const saved = useSavedVideos(userId);
  const searchResults = useVideoSearch(searchQuery, userId);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      categories.refetch(),
      featured.refetch(),
      saved.refetch(),
      isSearching ? searchResults.refetch() : Promise.resolve(),
    ]);
    setRefreshing(false);
  }, [categories, featured, saved, searchResults, isSearching]);

  const handlePremiumPress = (video: EducationVideo) => {
    if (isPremium) {
      router.push(learnVideoHref(video.id));
      return;
    }
    setPremiumVideo(video);
    premiumSheetRef.current?.expand();
  };

  const loading =
    categories.isLoading || featured.isLoading || (isSearching && searchResults.isLoading);

  const refreshControl = (
    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#5B4FCF" />
  );

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView
        className="flex-1 px-4"
        refreshControl={refreshControl}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="font-display text-text-primary text-[28px] mt-2">Aprendé</Text>
        <Text className="font-sans text-text-secondary text-sm mb-4">Explorá por categoría</Text>

        <Input
          placeholder="🔍 Buscar videos..."
          value={search}
          onChangeText={setSearch}
          containerClassName="mb-4"
        />

        {isSearching ? (
          <View className="mb-6">
            {loading ? (
              <>
                <Skeleton className="h-24 mb-3" />
                <Skeleton className="h-24 mb-3" />
              </>
            ) : (searchResults.data ?? []).length === 0 ? (
              <Text className="font-sans text-text-secondary text-center py-8">
                No encontramos videos para &quot;{searchQuery}&quot;
              </Text>
            ) : (
              (searchResults.data ?? []).map((video) => (
                <View key={video.id}>
                  {video.category ? (
                    <View className="mb-1">
                      <Badge
                        label={`${video.category.emoji ?? ''} ${video.category.name}`.trim()}
                      />
                    </View>
                  ) : null}
                  <VideoCard
                    video={video}
                    onPremiumPress={
                      video.is_premium && !isPremium ? handlePremiumPress : undefined
                    }
                  />
                </View>
              ))
            )}
          </View>
        ) : (
          <>
            <View className="flex-row justify-between items-center mb-3 mt-2">
              <Text className="font-sans-semibold text-text-primary">Destacados</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push(learnSavedHref())}
              >
                <Ionicons name="bookmark-outline" size={22} color="#5B4FCF" />
              </Pressable>
            </View>
            {featured.isLoading ? (
              <Skeleton className="h-[112px] mb-6 w-[200px]" />
            ) : (featured.data ?? []).length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-6 -mx-1"
              >
                {(featured.data ?? []).map((video) => (
                  <VideoCardHorizontal
                    key={video.id}
                    video={video}
                    onPremiumPress={
                      video.is_premium && !isPremium ? handlePremiumPress : undefined
                    }
                  />
                ))}
              </ScrollView>
            ) : (
              <Text className="font-sans text-text-tertiary text-sm mb-6">
                Pronto habrá videos destacados.
              </Text>
            )}

            <Text className="font-sans-semibold text-text-primary mb-3">Categorías</Text>
            {categories.isLoading ? (
              <View className="flex-row flex-wrap">
                <Skeleton className="h-[110px] w-[47%] mr-[3%] mb-3" />
                <Skeleton className="h-[110px] w-[47%] mb-3" />
              </View>
            ) : (
              <View className="flex-row flex-wrap justify-between mb-4">
                {(categories.data ?? []).map((cat) => (
                  <View key={cat.id} className="w-[48%]">
                    <CategoryCard category={cat} />
                  </View>
                ))}
              </View>
            )}

            {(saved.data ?? []).length > 0 ? (
              <>
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="font-sans-semibold text-text-primary">Guardados</Text>
                  <Pressable onPress={() => router.push(learnSavedHref())}>
                    <Text className="font-sans-semibold text-primary text-sm">Ver todos</Text>
                  </Pressable>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-8"
                >
                  {(saved.data ?? []).slice(0, 6).map((video) => (
                    <VideoCardHorizontal key={video.id} video={video} />
                  ))}
                </ScrollView>
              </>
            ) : null}
          </>
        )}
      </ScrollView>

      <PremiumVideoSheet video={premiumVideo} sheetRef={premiumSheetRef} />
    </SafeAreaView>
  );
}
