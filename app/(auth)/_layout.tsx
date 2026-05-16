import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="onboarding/step-1-biometrics" />
      <Stack.Screen name="onboarding/step-2-goals" />
      <Stack.Screen name="onboarding/step-3-preferences" />
      <Stack.Screen name="onboarding/step-4-schedule" />
      <Stack.Screen name="onboarding/step-5-wearable" />
    </Stack>
  );
}
