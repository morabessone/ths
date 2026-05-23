/** Stub for Expo Go — real module requires a development build. */

export function isHealthDataAvailable() {
  return false;
}

export async function requestAuthorization(_options?: unknown) {
  return undefined;
}

export async function queryQuantitySamples(_type: string, _options?: unknown) {
  return [] as { startDate: string; quantity: number }[];
}

export async function queryWorkoutSamples(_options?: unknown) {
  return [] as {
    startDate: string;
    endDate: string;
    workoutActivityType?: string;
  }[];
}
