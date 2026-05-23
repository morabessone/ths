import { format } from 'date-fns';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { NormalizedHealthData, HealthSource } from '@/types/health.types';
import type { ManualHealthInput } from './healthService.types';

export type { ManualHealthInput } from './healthService.types';

export async function persistWearableData(
  userId: string,
  data: NormalizedHealthData | ManualHealthInput,
  source: HealthSource
): Promise<void> {
  const today = format(new Date(), 'yyyy-MM-dd');
  const row = {
    user_id: userId,
    date: today,
    source,
    steps: 'steps' in data ? (data.steps ?? null) : (data as NormalizedHealthData).steps,
    sleep_hours:
      'sleep_hours' in data
        ? (data.sleep_hours ?? null)
        : ((data as NormalizedHealthData).sleepHours ?? null),
    calories_burned:
      'calories_burned' in data
        ? (data.calories_burned ?? null)
        : ((data as NormalizedHealthData).caloriesBurned ?? null),
    training_detected:
      'training_detected' in data
        ? (data.training_detected ?? false)
        : ((data as NormalizedHealthData).trainingDetected ?? false),
    training_type:
      'training_type' in data
        ? (data.training_type ?? null)
        : ((data as NormalizedHealthData).trainingType ?? null),
  };

  if (!isSupabaseConfigured) return;

  const { data: existing } = await supabase
    .from('wearable_data')
    .select('id')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (existing?.id) {
    await supabase.from('wearable_data').update(row as never).eq('id', existing.id);
  } else {
    await supabase.from('wearable_data').insert(row as never);
  }
}

export function manualToNormalized(
  input: ManualHealthInput,
  source: HealthSource = 'manual'
): NormalizedHealthData {
  return {
    date: format(new Date(), 'yyyy-MM-dd'),
    source,
    steps: input.steps ?? 0,
    caloriesBurned: input.calories_burned ?? 0,
    activeMinutes: 0,
    trainingDetected: input.training_detected ?? false,
    trainingType: input.training_type,
    sleepHours: input.sleep_hours,
  };
}
