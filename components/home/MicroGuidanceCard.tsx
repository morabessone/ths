import { Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import type { MicroGuidance } from '@/types/nutrition.types';

interface MicroGuidanceCardProps {
  guidance: MicroGuidance[];
}

export function MicroGuidanceCard({ guidance }: MicroGuidanceCardProps) {
  if (!guidance.length) return null;

  return (
    <Card className="mb-4 border-l-4 border-l-warning">
      <Text className="font-sans-semibold text-text-primary mb-2">Micros según tus estudios</Text>
      {guidance.map((g) => (
        <View key={g.nutrient} className="mb-3">
          <Text className="font-sans-semibold text-text-primary text-sm">{g.nutrient}</Text>
          <Text className="font-sans text-text-secondary text-sm mt-0.5">{g.message}</Text>
          {g.food_suggestions.length > 0 ? (
            <Text className="font-sans text-text-tertiary text-xs mt-1">
              En comidas: {g.food_suggestions.join(' · ')}
            </Text>
          ) : null}
          {g.supplement_note ? (
            <Text className="font-sans text-primary text-xs mt-1">Suple: {g.supplement_note}</Text>
          ) : null}
        </View>
      ))}
    </Card>
  );
}
