import { useMemo, useState } from 'react';
import { Text, View, Pressable } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { buildNowSuggestions } from '@/lib/nutrition/nowSuggestions';
import { useUserStore } from '@/stores/useUserStore';
import { useFridgeStore } from '@/stores/useFridgeStore';
import { useDayPlanStore } from '@/stores/useDayPlanStore';
import type { BiometricsInput, CravingType } from '@/types/nutrition.types';
import { Card } from '@/components/ui/Card';

const CRAVINGS: { key: CravingType; label: string }[] = [
  { key: 'hungry', label: 'Tengo hambre' },
  { key: 'sweet', label: 'Antojo dulce' },
  { key: 'salty', label: 'Antojo salado' },
  { key: 'quick', label: 'Algo rápido' },
];

interface NowFoodSheetProps {
  sheetRef: React.RefObject<BottomSheet | null>;
}

export function NowFoodSheet({ sheetRef }: NowFoodSheetProps) {
  const [craving, setCraving] = useState<CravingType>('hungry');
  const planBuilt = useDayPlanStore((s) => s.planBuilt);
  const bioRaw = useUserStore((s) => s.latestBiometrics);
  const stock = useFridgeStore((s) => s.stock);

  const bio: BiometricsInput | null = bioRaw
    ? {
        weight_kg: Number(bioRaw.weight_kg),
        height_cm: Number(bioRaw.height_cm),
        age: bioRaw.age ?? 30,
        biological_sex: bioRaw.biological_sex ?? 'male',
        goal: (bioRaw.goal as BiometricsInput['goal']) ?? 'general_health',
        activity_level: (bioRaw.activity_level as BiometricsInput['activity_level']) ?? 'moderate',
        training_days: bioRaw.training_days ?? 3,
        training_type: (bioRaw.training_type as BiometricsInput['training_type']) ?? 'mixed',
        training_time: bioRaw.training_time ?? 'morning',
        dietary_style: bioRaw.dietary_style ?? 'omnivore',
        intolerances: bioRaw.intolerances ?? [],
        health_conditions: bioRaw.health_conditions ?? [],
      }
    : null;

  const suggestions = useMemo(() => {
    if (!planBuilt || !bio) return [];
    return buildNowSuggestions(
      craving,
      planBuilt,
      bio,
      stock.map((s) => s.ingredient_name)
    );
  }, [craving, planBuilt, bio, stock]);

  return (
    <BottomSheet ref={sheetRef} index={-1} snapPoints={['85%']} enablePanDownToClose>
      <BottomSheetScrollView className="px-6 pb-10">
        <Text className="font-display text-text-primary text-xl mb-2">Quiero algo ahora</Text>
        <Text className="font-sans text-text-secondary text-sm mb-4">
          Opciones alineadas a tu plan y heladera — sin registrar platos.
        </Text>

        <View className="flex-row flex-wrap gap-2 mb-4">
          {CRAVINGS.map((c) => (
            <Pressable
              key={c.key}
              onPress={() => setCraving(c.key)}
              className={`rounded-full px-4 py-2 border ${
                craving === c.key ? 'bg-primary border-primary' : 'border-border bg-surface'
              }`}
            >
              <Text
                className={`font-sans-medium text-sm ${
                  craving === c.key ? 'text-white' : 'text-text-secondary'
                }`}
              >
                {c.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {suggestions.map((s) => (
          <Card key={s.id} className="mb-3">
            <Text className="font-sans-semibold text-text-primary">{s.title}</Text>
            <Text className="font-sans text-text-secondary text-sm mt-1">{s.description}</Text>
            <Text className="font-sans text-primary text-xs mt-2">{s.aligns_with_plan}</Text>
            {s.tip ? (
              <Text className="font-sans text-text-tertiary text-xs mt-2 italic">{s.tip}</Text>
            ) : null}
            {s.brands?.length ? (
              <Text className="font-sans text-text-tertiary text-xs mt-1">
                Marcas referencia: {s.brands.join(' · ')}
              </Text>
            ) : null}
            {s.meal?.ingredients ? (
              <View className="mt-2">
                {s.meal.ingredients.map((ing, i) => (
                  <Text
                    key={i}
                    className={`font-sans text-xs ${ing.available ? 'text-success' : 'text-danger'}`}
                  >
                    {ing.available ? '✓' : '○'} {ing.name}
                  </Text>
                ))}
              </View>
            ) : null}
          </Card>
        ))}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
