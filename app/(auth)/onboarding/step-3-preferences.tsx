import { useState } from 'react';
import { Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressIndicator } from '@/components/onboarding/ProgressIndicator';
import { OptionSelector } from '@/components/onboarding/OptionSelector';
import { Button } from '@/components/ui/Button';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

export default function Step3Preferences() {
  const router = useRouter();
  const store = useOnboardingStore();
  const [diet, setDiet] = useState<string | null>(store.dietary_style ?? 'omnivore');
  const [intolerances, setIntolerances] = useState<string[]>(store.intolerances);
  const [conditions, setConditions] = useState<string[]>(store.health_conditions);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ProgressIndicator current={3} />
      <ScrollView className="px-6">
        <Text className="font-display text-text-primary text-2xl mb-4">Preferencias alimentarias</Text>
        <Text className="font-sans-medium text-text-primary mb-2">Estilo dietario</Text>
        <OptionSelector
          options={[
            { value: 'omnivore', label: 'Omnívoro' },
            { value: 'vegetarian', label: 'Vegetariano' },
            { value: 'vegan', label: 'Vegano' },
            { value: 'keto', label: 'Keto' },
            { value: 'gluten_free', label: 'Sin gluten' },
          ]}
          value={diet}
          onChange={(v) => setDiet(v as string)}
        />
        <Text className="font-sans-medium text-text-primary mt-4 mb-2">Intolerancias</Text>
        <OptionSelector
          multiple
          options={[
            { value: 'lactose', label: 'Lactosa' },
            { value: 'gluten', label: 'Gluten' },
            { value: 'nuts', label: 'Frutos secos' },
            { value: 'egg', label: 'Huevo' },
            { value: 'soy', label: 'Soja' },
          ]}
          value={intolerances}
          onChange={(v) => setIntolerances(v as string[])}
        />
        <Text className="font-sans-medium text-text-primary mt-4 mb-2">Condiciones de salud</Text>
        <OptionSelector
          multiple
          options={[
            { value: 'thyroid', label: 'Tiroides' },
            { value: 'insulin_resistance', label: 'Resistencia insulínica' },
            { value: 'pcos', label: 'SOP' },
            { value: 'diabetes', label: 'Diabetes tipo 2' },
            { value: 'none', label: 'Ninguna' },
          ]}
          value={conditions}
          onChange={(v) => setConditions(v as string[])}
        />
        <Button
          className="mt-6 mb-8"
          onPress={() => {
            store.setField('dietary_style', diet ?? 'omnivore');
            store.setField('intolerances', intolerances);
            store.setField('health_conditions', conditions);
            router.push('/(auth)/onboarding/step-4-schedule');
          }}
        >
          Continuar
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
