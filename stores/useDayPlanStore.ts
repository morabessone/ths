import { create } from 'zustand';
import { format } from 'date-fns';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { buildPlanWithAI } from '@/lib/ai/nutritionAdvisor';
import { studiesFromDb } from '@/lib/nutrition/dailyPlanBuilder';
import {
  persistWearableData,
  manualToNormalized,
  type ManualHealthInput,
} from '@/lib/health/healthPersistence';
import type { DailyPlan, Json, NutrientTargetsRow, WearableData } from '@/types/database.types';
import type { BiometricsInput, DailyPlanBuilt } from '@/types/nutrition.types';
import type { NormalizedHealthData } from '@/types/health.types';
import { useUserStore } from './useUserStore';
import { loadFridgeStock, fridgeIngredientNames } from '@/lib/fridge/stockService';

interface DayPlanStore {
  todayPlan: DailyPlan | null;
  todayTargets: NutrientTargetsRow | null;
  wearableData: WearableData | null;
  planBuilt: DailyPlanBuilt | null;
  isGenerating: boolean;
  loadTodayPlan: (userId: string) => Promise<void>;
  regeneratePlan: (userId: string) => Promise<void>;
  syncWearableFromHealth: (userId: string) => Promise<{ ok: boolean; message?: string }>;
  saveManualActivity: (userId: string, input: ManualHealthInput) => Promise<void>;
}

async function fetchStudies(userId: string) {
  if (!isSupabaseConfigured) return [];
  const { data } = await supabase
    .from('medical_studies')
    .select('id, values_json, alerts, study_date')
    .eq('user_id', userId)
    .order('study_date', { ascending: false })
    .limit(5);
  return studiesFromDb(data ?? []);
}

function wearableToNormalized(w: WearableData | null): NormalizedHealthData | null {
  if (!w) return null;
  return {
    date: w.date,
    source: (w.source as NormalizedHealthData['source']) ?? 'manual',
    steps: w.steps ?? 0,
    caloriesBurned: Number(w.calories_burned ?? 0),
    activeMinutes: w.active_minutes ?? 0,
    trainingDetected: w.training_detected ?? false,
    trainingType: w.training_type ?? undefined,
    sleepHours: w.sleep_hours != null ? Number(w.sleep_hours) : undefined,
    sleepQuality: (w.sleep_quality as NormalizedHealthData['sleepQuality']) ?? undefined,
  };
}

async function buildAndPersist(userId: string, wearable: NormalizedHealthData | null) {
  const bio = useUserStore.getState().latestBiometrics;
  if (!bio?.weight_kg || !bio.height_cm || !bio.age || !bio.biological_sex) return null;

  const biometrics: BiometricsInput = {
    weight_kg: Number(bio.weight_kg),
    height_cm: Number(bio.height_cm),
    age: bio.age,
    biological_sex: bio.biological_sex,
    goal: (bio.goal as BiometricsInput['goal']) ?? 'general_health',
    activity_level: (bio.activity_level as BiometricsInput['activity_level']) ?? 'moderate',
    training_days: bio.training_days ?? 3,
    training_type: (bio.training_type as BiometricsInput['training_type']) ?? 'mixed',
    training_time: bio.training_time ?? 'morning',
    dietary_style: bio.dietary_style ?? 'omnivore',
    intolerances: bio.intolerances ?? [],
    health_conditions: bio.health_conditions ?? [],
  };

  const studies = await fetchStudies(userId);
  const fridgeStock = await loadFridgeStock(userId);
  const fridgeIngredients = fridgeIngredientNames(fridgeStock);

  const built = await buildPlanWithAI({
    bio: biometrics,
    wearable,
    studies,
    fridgeIngredients,
  });

  const today = format(new Date(), 'yyyy-MM-dd');

  if (isSupabaseConfigured) {
    const targetsRow = { user_id: userId, date: today, ...built.targets };
    const planRow = {
      user_id: userId,
      date: today,
      breakfast: built.breakfast as unknown as Json,
      lunch: built.lunch as unknown as Json,
      snack: built.snack as unknown as Json,
      dinner: built.dinner as unknown as Json,
      supplements: built.supplements as unknown as Json,
      education_tip: built.education_tip as unknown as Json,
      wearable_context: built.wearable_context as unknown as Json,
      generated_at: new Date().toISOString(),
    };

    const { data: existingTargets } = await supabase
      .from('nutrient_targets')
      .select('id')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();
    if (existingTargets?.id) {
      await supabase.from('nutrient_targets').update(targetsRow as never).eq('id', existingTargets.id);
    } else {
      await supabase.from('nutrient_targets').insert(targetsRow as never);
    }

    const { data: existingPlan } = await supabase
      .from('daily_plan')
      .select('id')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();
    if (existingPlan?.id) {
      await supabase.from('daily_plan').update(planRow as never).eq('id', existingPlan.id);
    } else {
      await supabase.from('daily_plan').insert(planRow as never);
    }
  }

  return { built, today };
}

export const useDayPlanStore = create<DayPlanStore>((set, get) => ({
  todayPlan: null,
  todayTargets: null,
  wearableData: null,
  planBuilt: null,
  isGenerating: false,

  loadTodayPlan: async (userId) => {
    const today = format(new Date(), 'yyyy-MM-dd');

    if (!isSupabaseConfigured) {
      const normalized = wearableToNormalized(get().wearableData);
      const result = await buildAndPersist(userId, normalized);
      if (!result) return;
      set({
        planBuilt: result.built,
        todayPlan: {
          id: 'local',
          user_id: userId,
          date: today,
          breakfast: result.built.breakfast as unknown as Json,
          lunch: result.built.lunch as unknown as Json,
          snack: result.built.snack as unknown as Json,
          dinner: result.built.dinner as unknown as Json,
          supplements: result.built.supplements as unknown as Json,
          education_tip: result.built.education_tip as unknown as Json,
          wearable_context: result.built.wearable_context as unknown as Json,
          generated_at: new Date().toISOString(),
        },
        todayTargets: {
          id: 'local',
          user_id: userId,
          date: today,
          ...result.built.targets,
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

    if (!plan || !targets) {
      await get().regeneratePlan(userId);
    } else {
      const normalized = wearableToNormalized(wearable);
      const built = await buildPlanWithAI({
        bio: {
          weight_kg: Number(useUserStore.getState().latestBiometrics?.weight_kg ?? 70),
          height_cm: Number(useUserStore.getState().latestBiometrics?.height_cm ?? 170),
          age: useUserStore.getState().latestBiometrics?.age ?? 30,
          biological_sex:
            (useUserStore.getState().latestBiometrics?.biological_sex as BiometricsInput['biological_sex']) ??
            'male',
          goal: (useUserStore.getState().latestBiometrics?.goal as BiometricsInput['goal']) ?? 'general_health',
          activity_level:
            (useUserStore.getState().latestBiometrics?.activity_level as BiometricsInput['activity_level']) ??
            'moderate',
          training_days: useUserStore.getState().latestBiometrics?.training_days ?? 3,
          training_type:
            (useUserStore.getState().latestBiometrics?.training_type as BiometricsInput['training_type']) ??
            'mixed',
          training_time: useUserStore.getState().latestBiometrics?.training_time ?? 'morning',
          dietary_style: useUserStore.getState().latestBiometrics?.dietary_style ?? 'omnivore',
          intolerances: useUserStore.getState().latestBiometrics?.intolerances ?? [],
          health_conditions: useUserStore.getState().latestBiometrics?.health_conditions ?? [],
        },
        wearable: normalized,
        studies: await fetchStudies(userId),
        fridgeIngredients: fridgeIngredientNames(await loadFridgeStock(userId)),
      });
      set({ planBuilt: built });
    }
  },

  regeneratePlan: async (userId) => {
    set({ isGenerating: true });
    try {
      const normalized = wearableToNormalized(get().wearableData);
      const result = await buildAndPersist(userId, normalized);
      if (result) {
        if (isSupabaseConfigured) {
          await get().loadTodayPlan(userId);
        } else {
          set({
            planBuilt: result.built,
            todayPlan: {
              id: 'local',
              user_id: userId,
              date: result.today,
              breakfast: result.built.breakfast as unknown as Json,
              lunch: result.built.lunch as unknown as Json,
              snack: result.built.snack as unknown as Json,
              dinner: result.built.dinner as unknown as Json,
              supplements: result.built.supplements as unknown as Json,
              education_tip: result.built.education_tip as unknown as Json,
              wearable_context: result.built.wearable_context as unknown as Json,
              generated_at: new Date().toISOString(),
            },
            todayTargets: {
              id: 'local',
              user_id: userId,
              date: result.today,
              ...result.built.targets,
            } as NutrientTargetsRow,
          });
        }
      }
    } finally {
      set({ isGenerating: false });
    }
  },

  syncWearableFromHealth: async (userId) => {
    const { requestHealthPermissions, readHealthToday } = await import('@/lib/health/healthService');
    const perm = await requestHealthPermissions();
    if (!perm.granted) {
      return { ok: false, message: perm.message ?? 'Permisos no otorgados. Usá registro manual.' };
    }
    const data = await readHealthToday();
    if (!data) {
      return { ok: false, message: 'No pudimos leer datos de Salud. Probá registro manual.' };
    }
    await persistWearableData(userId, data, data.source);
    const today = format(new Date(), 'yyyy-MM-dd');
    set({
      wearableData: {
        id: 'sync',
        user_id: userId,
        date: today,
        source: data.source,
        steps: data.steps,
        calories_burned: data.caloriesBurned,
        active_minutes: data.activeMinutes,
        training_detected: data.trainingDetected,
        training_type: data.trainingType ?? null,
        sleep_hours: data.sleepHours ?? null,
        sleep_quality: data.sleepQuality ?? null,
        synced_at: new Date().toISOString(),
      },
    });
    await get().regeneratePlan(userId);
    return { ok: true };
  },

  saveManualActivity: async (userId, input) => {
    const data = manualToNormalized(input, 'manual');
    await persistWearableData(userId, data, 'manual');
    const today = format(new Date(), 'yyyy-MM-dd');
    set({
      wearableData: {
        id: 'manual',
        user_id: userId,
        date: today,
        source: 'manual',
        steps: data.steps,
        calories_burned: data.caloriesBurned,
        active_minutes: 0,
        training_detected: data.trainingDetected,
        training_type: data.trainingType ?? null,
        sleep_hours: data.sleepHours ?? null,
        sleep_quality: null,
        synced_at: new Date().toISOString(),
      },
    });
    await get().regeneratePlan(userId);
  },
}));
