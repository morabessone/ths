export type HealthSource = 'apple_health' | 'google_fit' | 'garmin' | 'fitbit' | 'manual';
export type SleepQuality = 'poor' | 'fair' | 'good' | 'excellent';

export interface NormalizedHealthData {
  date: string;
  source: HealthSource;
  steps: number;
  caloriesBurned: number;
  activeMinutes: number;
  trainingDetected: boolean;
  trainingType?: string;
  trainingDurationMin?: number;
  sleepHours?: number;
  sleepQuality?: SleepQuality;
  restingHr?: number;
  hrvMs?: number;
  waterMl?: number;
}
