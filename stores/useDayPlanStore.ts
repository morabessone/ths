import { create } from 'zustand';
import { format } from 'date-fns';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { calculateNutrientTargets } from '@/lib/nutrition/engine';
import { generateSupplementStack } from '@/lib/nutrition/supplements';
import { SAMPLE_MEALS } from '@/constants/foods';
import type { DailyPlan, Json, NutrientTargetsRow, WearableData } from '@/types/database.types';
import type { BiometricsInput, Meal } from '@/types/nutrition.types';
import { useUserStore } from './useUserStore';

interface DayPlanStore {
  todayPlan: DailyPlan | null;
  todayTargets: NutrientTargetsRow | null;
  wearableData: WearableData | null;
  isGenerating: boolean;
  loadTodayPlan: (userId: string) => Promise<void>;
  regeneratePlan: (userId: string) => Promise<void>;
  syncWearable: () => Promise<void>;
}

function buildLocalPlan(bio: BiometricsInput) {
  const targets = calculateNutrientTargets(bio);
  const isTraining = targets.day_type === 'training';
  const supplements = generateSupplementStack({
    goal: bio.goal,
    studies: [],
    healthConditions: bio.health_conditions ?? [],
    poorSleep: false,
  });

  const breakfast: Meal = isTraining
    ? SAMPLE_MEALS.breakfast_training
    : {
        ...SAMPLE_MEALS.breakfast_training,
        name: 'Huevos con pan integral y palta',
        timing_note: undefined,
        why: 'Proteína y grasas buenas para empezar el día con energía estable.',
      };

  return {
    breakfast,
    lunch: SAMPLE_MEALS.lunch_default,
    snack: isTraining ? SAMPLE_MEALS.snack_post : null,
    dinner: SAMPLE_MEALS.dinner_rest,
    supplements,
    education_tip: {
      title: '¿Por qué hidratos simples post-entreno?',
      content:
        'Después del entrenamiento, los músculos absorben glucosa con mayor eficiencia. Los hidratos simples en esta ventana aceleran la reposición de glucógeno.',
      topic: 'timing',
    },
    wearable_context: null,
    targets,
  };
}

export const useDayPlanStore = create<DayPlanStore>((set) => ({
  todayPlan: null,
  todayTargets: null,
  wearableData: null,
  isGenerating: false,

  loadTodayPlan: async (userId) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (!isSupabaseConfigured) {
      const bio = useUserStore.getState().latestBiometrics;
      if (!bio?.weight_kg || !bio.height_cm || !bio.age || !bio.biological_sex) return;
      const local = buildLocalPlan({
        weight_kg: Number(bio.weight_kg),
        height_cm: Number(bio.height_cm),
        age: bio.age,
        biological_sex: bio.biological_sex,
        goal: (bio.goal as BiometricsInput['goal']) ?? 'general_health',
        activity_level: (bio.activity_level as BiometricsInput['activity_level']) ?? 'moderate',
        training_days: bio.training_days ?? 3,
        training_type: (bio.training_type as BiometricsInput['training_type']) ?? 'mixed',
        health_conditions: bio.health_conditions ?? [],
      });
      set({
        todayPlan: {
          id: 'local',
          user_id: userId,
          date: today,
          breakfast: local.breakfast as unknown as Json,
          lunch: local.lunch as unknown as Json,
          snack: local.snack as unknown as Json,
          dinner: local.dinner as unknown as Json,
          supplements: local.supplements as unknown as Json,
          education_tip: local.education_tip as unknown as Json,
          wearable_context: local.wearable_context,
          generated_at: new Date().toISOString(),
        },
        todayTargets: {
          id: 'local',
          user_id: userId,
          date: today,
          ...local.targets,
        } as NutrientTargetsRow,
      });
      return;
    }

    const [{ data: plan }, { data: targets }, { data: wearable }] = await Promise.all([
      supabase.from('daily_plan').select('*').eq('user_id', userId).eq('date', today).maybeSingle(),
      supabase.from('nutrient_targets').select('*').eq('user_id', userId).eq('date', today).maybeSingle(),
      supabase.from('wearable_data').select('*').eq('user_id', userId).eq('date', today).maybeSingle(),
    ]);
    set({ todayPlan: plan, todayTargets: targets, wearableData: wearable });
  },

  regeneratePlan: async (userId) => {
    set({ isGenerating: true });
    try {
      if (isSupabaseConfigured) {
        await supabase.functions.invoke('calculate-daily-plan', { body: { user_id: userId } });
        await useDayPlanStore.getState().loadTodayPlan(userId);
      } else {
        await useDayPlanStore.getState().loadTodayPlan(userId);
      }
    } finally {
      set({ isGenerating: false });
    }
  },

  syncWearable: async () => {
    // Placeholder — integración HealthKit / Health Connect en fase posterior
  },
}));
