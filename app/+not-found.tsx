import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'No encontrado' }} />
      <View className="flex-1 items-center justify-center p-5 bg-bg">
        <Text className="font-display text-text-primary text-xl">Página no encontrada</Text>
        <Link href="/" className="mt-4">
          <Text className="font-sans text-primary">Volver al inicio</Text>
        </Link>
      </View>
    </>
  );
}
