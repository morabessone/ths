import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressIndicator } from '@/components/onboarding/ProgressIndicator';
import { OptionSelector } from '@/components/onboarding/OptionSelector';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

export default function Step1Biometrics() {
  const router = useRouter();
  const store = useOnboardingStore();
  const [weight, setWeight] = useState(String(store.weight_kg ?? 70));
  const [height, setHeight] = useState(String(store.height_cm ?? 170));
  const [age, setAge] = useState(String(store.age ?? 28));
  const [sex, setSex] = useState<'male' | 'female' | null>(store.biological_sex ?? null);

  const continue_ = () => {
    store.setField('weight_kg', Number(weight));
    store.setField('height_cm', Number(height));
    store.setField('age', Number(age));
    if (sex) store.setField('biological_sex', sex);
    router.push('/(auth)/onboarding/step-2-goals');
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ProgressIndicator current={1} total={7} />
      <ScrollView className="px-6" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="font-display text-text-primary text-2xl mb-2">Tus datos base</Text>
        <Text className="font-sans text-text-secondary mb-6">
          Estos datos calculan tus necesidades reales. Podés actualizarlos cuando quieras.
        </Text>
        <Input label="Peso (kg)" keyboardType="decimal-pad" value={weight} onChangeText={setWeight} />
        <Input label="Altura (cm)" keyboardType="number-pad" value={height} onChangeText={setHeight} />
        <Input label="Edad" keyboardType="number-pad" value={age} onChangeText={setAge} />
        <Text className="font-sans-medium text-text-primary mb-2">Sexo biológico</Text>
        <OptionSelector
          options={[
            { value: 'male', label: 'Masculino' },
            { value: 'female', label: 'Femenino' },
          ]}
          value={sex}
          onChange={(v) => setSex(v as 'male' | 'female')}
        />
        <Button className="mt-4" disabled={!sex} onPress={continue_}>
          Continuar
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
