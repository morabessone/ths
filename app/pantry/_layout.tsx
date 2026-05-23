import { Stack } from 'expo-router';

export default function PantryLayout() {
  return (
    <Stack screenOptions={{ headerTintColor: '#5B4FCF', headerStyle: { backgroundColor: '#FAFAF9' } }}>
      <Stack.Screen name="shopping-list" options={{ title: 'Lista de super' }} />
    </Stack>
  );
}
