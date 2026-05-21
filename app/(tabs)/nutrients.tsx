import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDayPlanStore } from '@/stores/useDayPlanStore';
import { useUserStore } from '@/stores/useUserStore';
import { NUTRIENT_LABELS, NUTRIENT_UNITS } from '@/constants/nutrients';
import { MicroGuidanceCard } from '@/components/home/MicroGuidanceCard';
import { Card } from '@/components/ui/Card';

export default function NutrientsScreen() {
  const targets = useDayPlanStore((s) => s.todayTargets);
  const planBuilt = useDayPlanStore((s) => s.planBuilt);
  const user = useUserStore((s) => s.user);
  const profile = useUserStore((s) => s.profile);
  const userId = user?.id ?? profile?.id ?? 'demo-user';
  const loadTodayPlan = useDayPlanStore((s) => s.loadTodayPlan);

  useEffect(() => {
    loadTodayPlan(userId);
  }, [userId, loadTodayPlan]);

  const microKeys = Object.keys(NUTRIENT_LABELS);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="font-display text-text-primary text-3xl mt-2 mb-2">Cobertura del día</Text>
        <Text className="font-sans text-text-secondary text-sm mb-4">
          Objetivos de micros según tu perfil y estudios. LivIn te dice cómo cubrirlos en comidas y
          suplementos — sin registrar cada bocado.
        </Text>

        <MicroGuidanceCard guidance={planBuilt?.microGuidance ?? []} />

        <Text className="font-sans-semibold text-text-primary mb-3 mt-2">Objetivos diarios</Text>
        {microKeys.map((key) => {
          const target = Number(
            (targets as unknown as Record<string, number | null>)?.[key] ?? 0
          );
          if (!target) return null;
          return (
            <Card key={key} className="mb-2 py-3 px-4">
              <View className="flex-row justify-between">
                <Text className="font-sans-medium text-text-primary">{NUTRIENT_LABELS[key]}</Text>
                <Text className="font-sans-semibold text-primary">
                  {Math.round(target)} {NUTRIENT_UNITS[key]}
                </Text>
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
