import { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import BottomSheet from '@gorhom/bottom-sheet';
import { DayContextCard } from '@/components/home/DayContextCard';
import { DailyTargetsCard } from '@/components/home/DailyTargetsCard';
import { MicroGuidanceCard } from '@/components/home/MicroGuidanceCard';
import { PlanMomentsList } from '@/components/home/PlanMomentsList';
import { EducationTip } from '@/components/home/EducationTip';
import { HealthConnectSheet } from '@/components/home/HealthConnectSheet';
import { NowFoodSheet } from '@/components/home/NowFoodSheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/stores/useUserStore';
import { useDayPlanStore } from '@/stores/useDayPlanStore';
import { useFridgeStore } from '@/stores/useFridgeStore';
import type { EducationTip as TipType, SupplementRecommendation } from '@/types/nutrition.types';
import { useVideoYoutubeId } from '@/hooks/useEducationVideos';

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
  const {
    todayPlan,
    todayTargets,
    wearableData,
    planBuilt,
    isGenerating,
    loadTodayPlan,
    regeneratePlan,
  } = useDayPlanStore();
  const loadStock = useFridgeStore((s) => s.loadStock);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const healthSheetRef = useRef<BottomSheet>(null);
  const nowSheetRef = useRef<BottomSheet>(null);

  const userId = user?.id ?? profile?.id ?? 'demo-user';
  const name = profile?.full_name?.split(' ')[0] ?? 'Usuario';
  const isTraining = todayTargets?.day_type === 'training';

  useEffect(() => {
    loadStock(userId);
    loadTodayPlan(userId).finally(() => setLoading(false));
  }, [userId, loadTodayPlan, loadStock]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStock(userId);
    await regeneratePlan(userId);
    setRefreshing(false);
  };

  const subtitle = planBuilt?.daySummary
    ? planBuilt.daySummary.split('.')[0]
    : isTraining
      ? `Día de entrenamiento · ${todayTargets?.training_focus ?? 'fuerza'}`
      : format(new Date(), "EEEE d 'de' MMMM", { locale: es });

  const educationTip = parseTip(todayPlan?.education_tip);
  const { data: tipVideoYoutubeId } = useVideoYoutubeId(educationTip?.video_id);

  const sleepInsight =
    wearableData?.sleep_hours != null && Number(wearableData.sleep_hours) < 6.5
      ? `Dormiste ${wearableData.sleep_hours}h — el plan suma magnesio y más proteína en el desayuno.`
      : undefined;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView
        className="px-4"
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="flex-row justify-between items-center mb-1 mt-2">
          <View className="flex-1">
            <Text className="font-display text-text-primary text-3xl">Buenos días, {name}.</Text>
            <Text className="font-sans text-text-secondary mt-1 text-sm">{subtitle}</Text>
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

        <View className="mt-4 gap-3">
          <Button onPress={() => nowSheetRef.current?.expand()}>Quiero algo ahora</Button>
          <Button variant="secondary" onPress={() => healthSheetRef.current?.expand()}>
            Actividad / Salud
          </Button>
        </View>

        <View className="mt-4">
          <DayContextCard
            wearable={wearableData}
            insight={sleepInsight}
            onConnect={() => healthSheetRef.current?.expand()}
          />
        </View>

        {loading || isGenerating ? (
          <>
            <Skeleton className="h-28 mt-4 mb-3" />
            <Skeleton className="h-40 mb-3" />
          </>
        ) : (
          <>
            <DailyTargetsCard targets={todayTargets} />
            <MicroGuidanceCard guidance={planBuilt?.microGuidance ?? []} />
            {planBuilt?.moments?.length ? (
              <PlanMomentsList
                moments={planBuilt.moments}
                isTraining={isTraining}
                trainingTime={useUserStore.getState().latestBiometrics?.training_time ?? undefined}
              />
            ) : null}
          </>
        )}

        {parseSupplements(todayPlan?.supplements).length > 0 ? (
          <>
            <Text className="font-sans-semibold text-text-primary mt-4 mb-2">Suplementos sugeridos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {parseSupplements(todayPlan?.supplements).map((s, i) => (
                <View key={i} className="bg-primary-light rounded-full px-4 py-2 mr-2 max-w-[280px]">
                  <Text className="font-sans text-text-primary text-sm">
                    {s.name} · {s.dose}
                  </Text>
                  <Text className="font-sans text-text-tertiary text-xs">{s.timing}</Text>
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

      <HealthConnectSheet sheetRef={healthSheetRef} userId={userId} />
      <NowFoodSheet sheetRef={nowSheetRef} />
    </SafeAreaView>
  );
}
