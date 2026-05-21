import { Platform } from 'react-native';
import { format } from 'date-fns';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { NormalizedHealthData, HealthSource } from '@/types/health.types';

export type ManualHealthInput = {
  steps?: number;
  sleep_hours?: number;
  training_detected?: boolean;
  training_type?: string;
  calories_burned?: number;
};

export async function requestHealthPermissions(): Promise<{
  granted: boolean;
  needsDevBuild: boolean;
  message?: string;
}> {
  if (Platform.OS === 'web') {
    return { granted: false, needsDevBuild: false, message: 'Usá registro manual en web.' };
  }

  try {
    if (Platform.OS === 'ios') {
      const Healthkit = await import('@kingstinct/react-native-healthkit');
      if (!Healthkit.isHealthDataAvailable()) {
        return { granted: false, needsDevBuild: true, message: 'Salud no disponible en este dispositivo.' };
      }
      await Healthkit.requestAuthorization({
        toRead: [
          'HKQuantityTypeIdentifierStepCount',
          'HKQuantityTypeIdentifierActiveEnergyBurned',
          'HKCategoryTypeIdentifierSleepAnalysis',
          'HKWorkoutTypeIdentifier',
        ],
      });
      return { granted: true, needsDevBuild: false };
    }

    if (Platform.OS === 'android') {
      const {
        initialize,
        requestPermission,
        getSdkStatus,
        SdkAvailabilityStatus,
      } = await import('react-native-health-connect');
      const status = await getSdkStatus();
      if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
        return {
          granted: false,
          needsDevBuild: false,
          message: 'Instalá Health Connect desde Play Store y volvé a intentar.',
        };
      }
      await initialize();
      const granted = await requestPermission([
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
        { accessType: 'read', recordType: 'SleepSession' },
        { accessType: 'read', recordType: 'ExerciseSession' },
      ]);
      return { granted: (granted?.length ?? 0) > 0, needsDevBuild: false };
    }
  } catch {
    return {
      granted: false,
      needsDevBuild: true,
      message:
        'Para leer Salud/Health Connect necesitás un development build (npx expo run:ios o run:android). Usá registro manual mientras tanto.',
    };
  }

  return { granted: false, needsDevBuild: true };
}

export async function readHealthToday(): Promise<NormalizedHealthData | null> {
  if (Platform.OS === 'web') return null;

  const today = format(new Date(), 'yyyy-MM-dd');
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();

  try {
    if (Platform.OS === 'ios') {
      const Healthkit = await import('@kingstinct/react-native-healthkit');
      const steps = await Healthkit.queryQuantitySamples('HKQuantityTypeIdentifierStepCount', {
        limit: 500,
        ascending: false,
      });
      const energy = await Healthkit.queryQuantitySamples(
        'HKQuantityTypeIdentifierActiveEnergyBurned',
        { limit: 500, ascending: false }
      );
      const workouts = await Healthkit.queryWorkoutSamples({
        limit: 5,
        ascending: false,
      });

      const stepTotal = steps
        .filter((s) => new Date(s.startDate) >= start)
        .reduce((sum, s) => sum + s.quantity, 0);
      const kcal = energy
        .filter((s) => new Date(s.startDate) >= start)
        .reduce((sum, s) => sum + s.quantity, 0);
      const todayWorkout = workouts.find((w) => new Date(w.startDate) >= start);

      return {
        date: today,
        source: 'apple_health',
        steps: Math.round(stepTotal),
        caloriesBurned: Math.round(kcal),
        activeMinutes: 0,
        trainingDetected: Boolean(todayWorkout),
        trainingType: todayWorkout?.workoutActivityType?.toString(),
        trainingDurationMin: todayWorkout
          ? Math.round(
              (new Date(todayWorkout.endDate).getTime() -
                new Date(todayWorkout.startDate).getTime()) /
                60000
            )
          : undefined,
      };
    }

    if (Platform.OS === 'android') {
      const { initialize, readRecords } = await import('react-native-health-connect');
      await initialize();
      const timeRangeFilter = {
        operator: 'between' as const,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      };
      const stepsResult = await readRecords('Steps', { timeRangeFilter });
      const exerciseResult = await readRecords('ExerciseSession', { timeRangeFilter });
      const totalSteps =
        stepsResult?.records?.reduce(
          (s: number, r: { count?: number }) => s + (r.count ?? 0),
          0
        ) ?? 0;

      return {
        date: today,
        source: 'google_fit',
        steps: totalSteps,
        caloriesBurned: 0,
        activeMinutes: 0,
        trainingDetected: (exerciseResult?.records?.length ?? 0) > 0,
      };
    }
  } catch {
    return null;
  }

  return null;
}

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
