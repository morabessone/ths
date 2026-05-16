import { Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

export default function AnthropometryScreen() {
  const { canAccess } = useFeatureAccess();

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView className="px-4 pt-4">
        {canAccess('anthropometry') ? (
          <Text className="font-sans text-text-secondary">
            Registrá medidas corporales para seguir tu evolución.
          </Text>
        ) : (
          <Text className="font-sans text-text-secondary">
            La antropometría avanzada está disponible en el plan Premium.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
