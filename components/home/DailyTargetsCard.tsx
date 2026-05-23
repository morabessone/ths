import { Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import type { NutrientTargetsRow } from '@/types/database.types';
import { MACRO_RANGE_LABEL } from '@/constants/copy-tone';

interface DailyTargetsCardProps {
  targets: NutrientTargetsRow | null;
}

export function DailyTargetsCard({ targets }: DailyTargetsCardProps) {
  if (!targets) return null;

  const protein = Math.round(Number(targets.protein_g));
  const proteinMin = Math.round(protein * 0.9);
  const proteinMax = Math.round(protein * 1.1);

  const items = [
    {
      label: 'Energía orientativa',
      value: `~${Math.round(Number(targets.calories_kcal))} kcal (referencia, no meta)`,
    },
    { label: 'Proteína', value: MACRO_RANGE_LABEL(proteinMin, proteinMax, 'g') },
    { label: 'Hidratos', value: 'Priorizá complejos en comidas principales' },
    { label: 'Grasas', value: 'Grasas buenas en cada comida' },
    { label: 'Agua', value: 'Tomá agua a lo largo del día' },
  ];

  return (
    <Card className="mb-4">
      <Text className="font-sans-semibold text-text-primary mb-1">Orientación de hoy</Text>
      <Text className="font-sans text-text-tertiary text-xs mb-3">
        Rangos según tu contexto — no hay que “completar números”.
      </Text>
      <View className="gap-2">
        {items.map((item) => (
          <View key={item.label} className="bg-primary-light rounded-xl px-3 py-2">
            <Text className="font-sans text-text-tertiary text-[10px]">{item.label}</Text>
            <Text className="font-sans-semibold text-primary text-sm">{item.value}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
