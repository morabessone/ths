import { useState } from 'react';
import { Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressIndicator } from '@/components/onboarding/ProgressIndicator';
import { OptionSelector } from '@/components/onboarding/OptionSelector';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

const FOOD_OPTIONS = [
  'Pollo',
  'Carne',
  'Pescado',
  'Huevos',
  'Legumbres',
  'Pasta',
  'Arroz',
  'Verduras',
  'Frutas',
];

export default function Step4bFoodHabits() {
  const router = useRouter();
  const store = useOnboardingStore();
  const [prefs, setPrefs] = useState<string[]>(store.food_preferences ?? []);
  const [dislikes, setDislikes] = useState(store.food_dislikes?.join(', ') ?? '');
  const [cooking, setCooking] = useState<string | null>(store.cooking_comfort ?? null);
  const [goalDetail, setGoalDetail] = useState(store.main_goal_detail ?? '');

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ProgressIndicator current={6} total={7} />
      <ScrollView className="px-6">
        <Text className="font-display text-text-primary text-2xl mb-2">Tus hábitos alimentarios</Text>
        <Text className="font-sans text-text-secondary mb-4">¿Qué alimentos comés seguido?</Text>
        <OptionSelector
          multiple
          options={FOOD_OPTIONS.map((f) => ({ value: f.toLowerCase(), label: f }))}
          value={prefs}
          onChange={(v) => setPrefs(v as string[])}
        />
        <Input
          label="¿Hay algo que no comés? (opcional)"
          value={dislikes}
          onChangeText={setDislikes}
          placeholder="Ej: mariscos, hígado..."
          className="mt-4"
        />
        <Text className="font-sans-medium text-text-primary mt-4 mb-2">¿Qué tan cómodo/a sos cocinando?</Text>
        <OptionSelector
          options={[
            { value: 'minimal', label: 'Mínimo' },
            { value: 'basic', label: 'Básico' },
            { value: 'comfortable', label: 'Me gusta' },
            { value: 'enthusiast', label: 'Me encanta' },
          ]}
          value={cooking}
          onChange={(v) => setCooking(v as string)}
        />
        <Input
          label="¿Algo más sobre tu objetivo? (opcional)"
          value={goalDetail}
          onChangeText={setGoalDetail}
          placeholder="Contanos en tus palabras..."
          multiline
          className="mt-4"
        />
        <Button
          className="mt-6 mb-8"
          disabled={!cooking}
          onPress={() => {
            store.setField('food_preferences', prefs);
            store.setField(
              'food_dislikes',
              dislikes
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            );
            store.setField('cooking_comfort', cooking as never);
            store.setField('main_goal_detail', goalDetail || undefined);
            router.push('/(auth)/onboarding/step-5-wearable');
          }}
        >
          Continuar
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
