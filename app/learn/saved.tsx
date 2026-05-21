import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { VideoCard } from '@/components/education/VideoCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSavedVideos } from '@/hooks/useEducationVideos';
import { useUserStore } from '@/stores/useUserStore';

export default function SavedVideosScreen() {
  const router = useRouter();
  const userId = useUserStore((s) => s.user?.id ?? s.profile?.id ?? '');
  const { data: videos = [], isLoading } = useSavedVideos(userId);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-4 pt-2 pb-3 flex-row items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          className="mr-3 p-1"
        >
          <Ionicons name="chevron-back" size={24} color="#1A1240" />
        </Pressable>
        <View>
          <Text className="font-display text-text-primary text-2xl">Guardados</Text>
          <Text className="font-sans text-text-secondary text-sm">
            {videos.length} {videos.length === 1 ? 'video' : 'videos'}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View className="px-4">
          <Skeleton className="h-24 mb-3" />
          <Skeleton className="h-24 mb-3" />
        </View>
      ) : videos.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-4">🔖</Text>
          <Text className="font-display text-text-primary text-xl text-center mb-2">
            Todavía no guardaste nada
          </Text>
          <Text className="font-sans text-text-secondary text-center">
            Guardá videos para verlos cuando quieras.
          </Text>
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderItem={({ item }) => <VideoCard video={item} />}
        />
      )}
    </SafeAreaView>
  );
}
