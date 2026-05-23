import { Platform } from 'react-native';
import { format } from 'date-fns';
import type { NormalizedHealthData } from '@/types/health.types';
import { isExpoGo } from './expoGo';
import type { ManualHealthInput } from './healthService.types';

export type { ManualHealthInput } from './healthService.types';
export { persistWearableData, manualToNormalized } from './healthPersistence';

const EXPO_GO_MESSAGE =
  'Para conectar Apple Salud o Health Connect usá un development build (npx expo run:ios). En Expo Go podés registrar actividad manual.';

export async function requestHealthPermissions(): Promise<{
  granted: boolean;
  needsDevBuild: boolean;
  message?: string;
}> {
  if (Platform.OS === 'web' || isExpoGo()) {
    return {
      granted: false,
      needsDevBuild: isExpoGo(),
      message: isExpoGo() ? EXPO_GO_MESSAGE : 'Usá registro manual en web.',
    };
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
      message: EXPO_GO_MESSAGE,
    };
  }

  return { granted: false, needsDevBuild: true };
}

export async function readHealthToday(): Promise<NormalizedHealthData | null> {
  if (Platform.OS === 'web' || isExpoGo()) return null;

  const today = format(new Date(), 'yyyy-MM-dd');
  const start = new Date();
  start.setHours(0, 0, 0, 0);

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
      const end = new Date();
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
