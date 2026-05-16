import { Text, View, Pressable } from 'react-native';
import { Card } from '@/components/ui/Card';
import type { WearableData } from '@/types/database.types';

interface DayContextCardProps {
  wearable?: WearableData | null;
  insight?: string;
  onConnect?: () => void;
}

export function DayContextCard({ wearable, insight, onConnect }: DayContextCardProps) {
  if (!wearable) {
    return (
      <Card highlighted className="bg-primary-light">
        <Text className="font-sans-semibold text-text-primary mb-2">
          Personalizá tu día
        </Text>
        <Text className="font-sans text-text-secondary text-sm mb-3">
          Conectá tu dispositivo para ajustar el plan según sueño, pasos y entrenamiento.
        </Text>
        <Pressable accessibilityRole="button" onPress={onConnect}>
          <Text className="font-sans-semibold text-primary">Conectá tu dispositivo →</Text>
        </Pressable>
      </Card>
    );
  }

  return (
    <Card highlighted className="bg-primary-light">
      <View className="flex-row gap-4 mb-2">
        {wearable.sleep_hours != null ? (
          <Text className="font-sans text-text-secondary text-sm">🌙 {wearable.sleep_hours}h</Text>
        ) : null}
        {wearable.steps != null ? (
          <Text className="font-sans text-text-secondary text-sm">👟 {wearable.steps}</Text>
        ) : null}
        {wearable.calories_burned != null ? (
          <Text className="font-sans text-text-secondary text-sm">
            🔥 {wearable.calories_burned} kcal
          </Text>
        ) : null}
      </View>
      {insight ? (
        <Text className="font-sans text-text-primary text-sm">{insight}</Text>
      ) : null}
    </Card>
  );
}
