import { View } from 'react-native';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { NutrientTargetsRow } from '@/types/database.types';

interface NutrientProgressProps {
  targets: NutrientTargetsRow | null;
  onMacroPress?: () => void;
}

export function NutrientProgress({ targets, onMacroPress }: NutrientProgressProps) {
  if (!targets) return null;

  const macros = [
    { label: 'Proteína', current: Number(targets.protein_g) * 0.7, target: Number(targets.protein_g), unit: 'g' },
    { label: 'Hidratos', current: Number(targets.carbs_g) * 0.65, target: Number(targets.carbs_g), unit: 'g' },
    { label: 'Grasas', current: Number(targets.fat_g) * 0.6, target: Number(targets.fat_g), unit: 'g' },
    { label: 'Agua', current: Number(targets.water_ml) * 0.5, target: Number(targets.water_ml), unit: 'ml' },
  ];

  return (
    <View className="mb-4">
      {macros.map((m) => {
        const pct = m.target > 0 ? (m.current / m.target) * 100 : 0;
        return (
          <ProgressBar
            key={m.label}
            label={m.label}
            value={pct}
            currentValue={m.current}
            targetValue={m.target}
            unit={m.unit}
            onPress={onMacroPress}
          />
        );
      })}
    </View>
  );
}
