import { useEffect, useState } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayContextCard } from '@/components/home/DayContextCard';
import { MealCard } from '@/components/home/MealCard';
import { NutrientProgress } from '@/components/home/NutrientProgress';
import { EducationTip } from '@/components/home/EducationTip';
import { Skeleton } from '@/components/ui/Skeleton';
import { useUserStore } from '@/stores/useUserStore';
import { useDayPlanStore } from '@/stores/useDayPlanStore';
import type { Meal, EducationTip as TipType, SupplementRecommendation } from '@/types/nutrition.types';
import { useVideoYoutubeId } from '@/hooks/useEducationVideos';
import { getTimingNote } from '@/constants/timing-rules';

function parseMeal(json: unknown): Meal | null {
  if (!json || typeof json !== 'object') return null;
  return json as Meal;
}

function parseTip(json: unknown): TipType | null {
  if (!json || typeof json !== 'object') return null;
  return json as TipType;
}

function parseSupplements(json: unknown): SupplementRecommendation[] {
  if (!Array.isArray(json)) return [];
  return json as SupplementRecommendation[];
}

export default function HomeScreen() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const user = useUserStore((s) => s.user);
  const { todayPlan, todayTargets, wearableData, isGenerating, loadTodayPlan } = useDayPlanStore();
  const [loading, setLoading] = useState(true);

  const userId = user?.id ?? profile?.id ?? 'demo-user';
  const name = profile?.full_name?.split(' ')[0] ?? 'Usuario';
  const isTraining = todayTargets?.day_type === 'training';

  useEffect(() => {
    loadTodayPlan(userId).finally(() => setLoading(false));
  }, [userId, loadTodayPlan]);

  const subtitle = isTraining
    ? `Día de entrenamiento · ${todayTargets?.training_focus ?? 'fuerza'}`
    : todayPlan
      ? 'Día de recuperación'
      : format(new Date(), "EEEE d 'de' MMMM", { locale: es });

  const educationTip = parseTip(todayPlan?.education_tip);
  const { data: tipVideoYoutubeId } = useVideoYoutubeId(educationTip?.video_id);

  const sleepInsight =
    wearableData?.sleep_hours != null && Number(wearableData.sleep_hours) < 6.5
      ? `Dormiste ${wearableData.sleep_hours}h. El plan incluye magnesio y un desayuno más proteico.`
      : undefined;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="flex-row justify-between items-center mb-1 mt-2">
          <View className="flex-1">
            <Text className="font-display text-text-primary text-3xl">Buenos días, {name}.</Text>
            <Text className="font-sans text-text-secondary capitalize mt-1">{subtitle}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Perfil"
            onPress={() => router.push('/profile')}
            className="w-10 h-10 rounded-full bg-primary-light items-center justify-center"
          >
            <Text className="font-sans-semibold text-primary">{name[0]}</Text>
          </Pressable>
        </View>

        <View className="mt-4">
          <DayContextCard wearable={wearableData} insight={sleepInsight} />
        </View>

        <Text className="font-sans-semibold text-text-primary mt-6 mb-3">Macros del día</Text>
        {loading || isGenerating ? (
          <Skeleton className="h-20 mb-4" />
        ) : (
          <NutrientProgress targets={todayTargets} onMacroPress={() => router.push('/(tabs)/nutrients')} />
        )}

        <Text className="font-sans-semibold text-text-primary mb-3">Tu plan de hoy</Text>
        {loading ? (
          <>
            <Skeleton className="h-28 mb-3" />
            <Skeleton className="h-28 mb-3" />
          </>
        ) : (
          <>
            <MealCard
              title="Desayuno"
              meal={parseMeal(todayPlan?.breakfast)}
              timingBadge={getTimingNote('breakfast', isTraining, undefined)}
            />
            <MealCard title="Almuerzo" meal={parseMeal(todayPlan?.lunch)} />
            <MealCard
              title="Merienda"
              meal={parseMeal(todayPlan?.snack)}
              timingBadge={isTraining ? 'Post-entreno' : undefined}
            />
            <MealCard title="Cena" meal={parseMeal(todayPlan?.dinner)} />
          </>
        )}

        {parseSupplements(todayPlan?.supplements).length > 0 ? (
          <>
            <Text className="font-sans-semibold text-text-primary mt-4 mb-2">Suplementos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {parseSupplements(todayPlan?.supplements).map((s, i) => (
                <View key={i} className="bg-primary-light rounded-full px-4 py-2 mr-2">
                  <Text className="font-sans text-text-primary text-sm">
                    {s.name} · {s.dose} · {s.timing}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </>
        ) : null}

        <EducationTip
          tip={educationTip}
          videoYoutubeId={tipVideoYoutubeId}
          onExplore={() => router.push('/(tabs)/learn')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
