import { useEffect, useState } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useDayPlanStore } from '@/stores/useDayPlanStore';
import { useUserStore } from '@/stores/useUserStore';
import { NUTRIENT_LABELS, NUTRIENT_UNITS } from '@/constants/nutrients';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

type Tab = 'today' | 'week' | 'month';

export default function NutrientsScreen() {
  const [tab, setTab] = useState<Tab>('today');
  const targets = useDayPlanStore((s) => s.todayTargets);
  const user = useUserStore((s) => s.user);
  const profile = useUserStore((s) => s.profile);
  const { canAccess } = useFeatureAccess();
  const userId = user?.id ?? profile?.id ?? 'demo-user';
  const loadTodayPlan = useDayPlanStore((s) => s.loadTodayPlan);

  useEffect(() => {
    loadTodayPlan(userId);
  }, [userId, loadTodayPlan]);

  const microKeys = Object.keys(NUTRIENT_LABELS);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="font-display text-text-primary text-3xl mt-2 mb-4">Mapa nutricional</Text>
        <View className="flex-row gap-2 mb-6">
          {(['today', 'week', 'month'] as Tab[]).map((t) => (
            <Pressable
              key={t}
              accessibilityRole="tab"
              onPress={() => setTab(t)}
              className={`rounded-full px-4 py-2 ${tab === t ? 'bg-primary' : 'bg-surface border border-border'}`}
            >
              <Text className={`font-sans-semibold text-sm ${tab === t ? 'text-white' : 'text-text-secondary'}`}>
                {t === 'today' ? 'Hoy' : t === 'week' ? 'Esta semana' : 'Este mes'}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === 'week' ? (
          <View className="bg-surface rounded-2xl p-4 mb-6 shadow-card">
            <Text className="font-sans-semibold text-text-primary mb-2">Resumen semanal</Text>
            <Text className="font-sans text-success text-sm mb-1">Tus puntos fuertes: Zinc ✓ Proteína ✓</Text>
            <Text className="font-sans text-warning text-sm mb-2">Déficits recurrentes: Omega-3 ↓ Vitamina D ↓</Text>
            <Text className="font-sans text-text-secondary text-sm">
              Priorizá pescado azul 2× esta semana y exposición solar matutina.
            </Text>
          </View>
        ) : null}

        <Text className="font-sans-semibold text-text-primary mb-3">Micronutrientes</Text>
        {microKeys.map((key) => {
          const target = Number(
            (targets as unknown as Record<string, number | null>)?.[key] ?? 0
          );
          if (!target) return null;
          const current = Math.round(target * (0.5 + Math.random() * 0.4));
          const pct = (current / target) * 100;
          const showFull = canAccess('full_micros') || ['protein_g', 'carbs_g', 'fat_g'].includes(key);

          if (!showFull && tab === 'today') {
            return (
              <View key={key} className="opacity-40 mb-2">
                <ProgressBar label={NUTRIENT_LABELS[key]} value={0} />
              </View>
            );
          }

          return (
            <ProgressBar
              key={key}
              label={NUTRIENT_LABELS[key]}
              value={pct}
              currentValue={current}
              targetValue={target}
              unit={NUTRIENT_UNITS[key]}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
