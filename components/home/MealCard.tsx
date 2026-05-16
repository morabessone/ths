import { Text, View, Pressable } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Meal } from '@/types/nutrition.types';

interface MealCardProps {
  title: string;
  meal: Meal | null;
  timingBadge?: string;
  onPress?: () => void;
}

export function MealCard({ title, meal, timingBadge, onPress }: MealCardProps) {
  if (!meal) return null;

  return (
    <Card className="mb-3">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="font-sans-semibold text-text-tertiary text-xs uppercase">{title}</Text>
        {timingBadge ? <Badge label={timingBadge} /> : null}
      </View>
      <Text className="font-sans-semibold text-text-primary text-base mb-1">{meal.name}</Text>
      <Text className="font-sans text-text-secondary text-sm mb-3">
        {meal.macros.protein_g}g P · {meal.macros.carbs_g}g C · {meal.macros.fat_g}g G ·{' '}
        {meal.macros.calories} kcal
      </Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`Ver detalles de ${title}`} onPress={onPress}>
        <Text className="font-sans-semibold text-primary text-sm">Ver detalles →</Text>
      </Pressable>
    </Card>
  );
}
