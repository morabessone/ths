import Constants from 'expo-constants';

/** True when running inside the Expo Go app (no custom native code). */
export function isExpoGo(): boolean {
  return Constants.executionEnvironment === 'storeClient';
}
