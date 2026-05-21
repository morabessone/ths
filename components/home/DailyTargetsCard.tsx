import { Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import type { NutrientTargetsRow } from '@/types/database.types';

interface DailyTargetsCardProps {
  targets: NutrientTargetsRow | null;
}

export function DailyTargetsCard({ targets }: DailyTargetsCardProps) {
  if (!targets) return null;

  const items = [
    { label: 'Calorías objetivo', value: `${Math.round(Number(targets.calories_kcal))} kcal` },
    { label: 'Proteína', value: `${Math.round(Number(targets.protein_g))} g` },
    { label: 'Hidratos', value: `${Math.round(Number(targets.carbs_g))} g` },
    { label: 'Grasas', value: `${Math.round(Number(targets.fat_g))} g` },
    { label: 'Agua', value: `${Math.round(Number(targets.water_ml))} ml` },
  ];

  return (
    <Card className="mb-4">
      <Text className="font-sans-semibold text-text-primary mb-1">Objetivos de hoy</Text>
      <Text className="font-sans text-text-tertiary text-xs mb-3">
        No tenés que cargar comidas — esto es tu guía según actividad y perfil.
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {items.map((item) => (
          <View key={item.label} className="bg-primary-light rounded-xl px-3 py-2 min-w-[46%]">
            <Text className="font-sans text-text-tertiary text-[10px]">{item.label}</Text>
            <Text className="font-sans-semibold text-primary text-sm">{item.value}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
