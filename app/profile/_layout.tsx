import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerTintColor: '#5B4FCF', headerStyle: { backgroundColor: '#FAFAF9' } }}>
      <Stack.Screen name="index" options={{ title: 'Perfil' }} />
      <Stack.Screen name="my-plan" options={{ title: 'Tu plan de LivIn' }} />
      <Stack.Screen name="biometrics" options={{ title: 'Mis datos' }} />
      <Stack.Screen name="anthropometry" options={{ title: 'Antropometría' }} />
      <Stack.Screen name="medical-studies/index" options={{ title: 'Estudios médicos' }} />
    </Stack>
  );
}
