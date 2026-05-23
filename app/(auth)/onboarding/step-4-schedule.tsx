import { useState } from 'react';
import { Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressIndicator } from '@/components/onboarding/ProgressIndicator';
import { OptionSelector } from '@/components/onboarding/OptionSelector';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

export default function Step4Schedule() {
  const router = useRouter();
  const store = useOnboardingStore();
  const [wakeTime, setWakeTime] = useState(store.wake_time ?? '07:00');
  const [trainingTime, setTrainingTime] = useState(store.training_time_picker ?? '18:00');
  const [cooksAtHome, setCooksAtHome] = useState<boolean | null>(store.cooks_at_home ?? true);
  const hasTraining = (store.training_days ?? 0) > 0;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ProgressIndicator current={5} total={7} />
      <ScrollView className="px-6">
        <Text className="font-display text-text-primary text-2xl mb-4">Horario y rutina</Text>
        <Input label="¿A qué hora te despertás?" value={wakeTime} onChangeText={setWakeTime} placeholder="07:00" />
        {hasTraining ? (
          <Input label="¿A qué hora entrenás?" value={trainingTime} onChangeText={setTrainingTime} placeholder="18:00" />
        ) : null}
        <Text className="font-sans-medium text-text-primary mb-2">¿Dónde comés mayormente?</Text>
        <OptionSelector
          options={[
            { value: 'home', label: 'Cocino en casa' },
            { value: 'out', label: 'Como afuera mayormente' },
          ]}
          value={cooksAtHome === null ? null : cooksAtHome ? 'home' : 'out'}
          onChange={(v) => setCooksAtHome(v === 'home')}
        />
        <Button
          className="mt-6 mb-8"
          onPress={() => {
            store.setField('wake_time', wakeTime);
            store.setField('training_time_picker', trainingTime);
            store.setField('cooks_at_home', cooksAtHome ?? true);
            router.push('/(auth)/onboarding/step-4b-food-habits' as '/(auth)/onboarding/step-5-wearable');
          }}
        >
          Continuar
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
