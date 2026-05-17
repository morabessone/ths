import { Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

export default function MedicalStudiesScreen() {
  const router = useRouter();
  const { canAccess } = useFeatureAccess();

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView className="px-4">
        <Callout variant="medical" title="Aviso médico" className="mt-4 mb-4">
          Esta información complementa tu guía nutricional. Consultá con tu médico para interpretación clínica.
        </Callout>
        {canAccess('medical_studies') ? (
          <>
            <Text className="font-sans text-text-secondary mb-4">
              Todavía no subiste estudios.
            </Text>
            <Button disabled>+ Subir estudio (próximamente)</Button>
          </>
        ) : (
          <Text className="font-sans text-text-secondary">
            Subir y procesar estudios médicos requiere plan Premium.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
