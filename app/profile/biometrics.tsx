import { Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Callout } from '@/components/ui/Callout';
import { useUserStore } from '@/stores/useUserStore';

export default function BiometricsScreen() {
  const bio = useUserStore((s) => s.latestBiometrics);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView className="px-4">
        <Callout className="mt-4 mb-4">
          Actualizá tus datos cuando cambie tu peso o rutina de entrenamiento.
        </Callout>
        {bio ? (
          <>
            <Text className="font-sans text-text-primary py-2">Peso: {bio.weight_kg} kg</Text>
            <Text className="font-sans text-text-primary py-2">Altura: {bio.height_cm} cm</Text>
            <Text className="font-sans text-text-primary py-2">Edad: {bio.age}</Text>
            <Text className="font-sans text-text-primary py-2">Objetivo: {bio.goal}</Text>
          </>
        ) : (
          <Text className="font-sans text-text-secondary">Completá el onboarding para ver tus datos.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
