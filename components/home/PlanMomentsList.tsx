import { Text, View } from 'react-native';
import { MealCard } from '@/components/home/MealCard';
import type { PlanMoment } from '@/types/nutrition.types';

interface PlanMomentsListProps {
  moments: PlanMoment[];
  isTraining: boolean;
  trainingTime?: string;
}

export function PlanMomentsList({ moments, isTraining, trainingTime }: PlanMomentsListProps) {
  return (
    <View>
      <Text className="font-sans-semibold text-text-primary mb-3">Plan para hoy</Text>
      {moments.map((moment) => {
        if (!moment.meal) return null;
        return (
          <View key={moment.id} className="mb-1">
            <Text className="font-sans text-text-tertiary text-xs mb-1">
              {moment.label} · {moment.time_hint}
              {moment.timing_rationale ? ` · ${moment.timing_rationale}` : ''}
            </Text>
            <MealCard
              title={moment.label}
              meal={moment.meal}
              timingBadge={
                moment.id === 'post_training'
                  ? 'Post-entreno'
                  : moment.id === 'pre_training'
                    ? 'Pre-entreno'
                    : undefined
              }
            />
          </View>
        );
      })}
    </View>
  );
}
