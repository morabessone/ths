import { useState } from 'react';
import { Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressIndicator } from '@/components/onboarding/ProgressIndicator';
import { OptionSelector } from '@/components/onboarding/OptionSelector';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

export default function Step3bRoutine() {
  const router = useRouter();
  const store = useOnboardingStore();
  const [wakeTime, setWakeTime] = useState(store.wake_time ?? '07:00');
  const [sleepTime, setSleepTime] = useState(store.sleep_time ?? '23:00');
  const [workType, setWorkType] = useState<string | null>(store.work_type ?? null);
  const [sleepQuality, setSleepQuality] = useState<string | null>(store.sleep_quality ?? null);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ProgressIndicator current={4} total={7} />
      <ScrollView className="px-6">
        <Text className="font-display text-text-primary text-2xl mb-2">Contanos tu rutina</Text>
        <Text className="font-sans text-text-secondary mb-4">
          Esto nos ayuda a sugerir el mejor timing para tus comidas.
        </Text>
        <Input label="¿A qué hora te despertás?" value={wakeTime} onChangeText={setWakeTime} placeholder="07:00" />
        <Input label="¿A qué hora te acostás?" value={sleepTime} onChangeText={setSleepTime} placeholder="23:00" />
        <Text className="font-sans-medium text-text-primary mt-4 mb-2">¿Cómo es tu trabajo?</Text>
        <OptionSelector
          options={[
            { value: 'sedentary', label: 'Sentado todo el día' },
            { value: 'light_active', label: 'Mezcla de sentado y activo' },
            { value: 'active', label: 'Mayormente de pie/activo' },
            { value: 'very_active', label: 'Muy activo físicamente' },
          ]}
          value={workType}
          onChange={(v) => setWorkType(v as string)}
        />
        <Text className="font-sans-medium text-text-primary mt-4 mb-2">¿Cómo dormís?</Text>
        <OptionSelector
          options={[
            { value: 'poor', label: 'Muy mal' },
            { value: 'fair', label: 'Regular' },
            { value: 'good', label: 'Bien' },
            { value: 'excellent', label: 'Muy bien' },
          ]}
          value={sleepQuality}
          onChange={(v) => setSleepQuality(v as string)}
        />
        <Button
          className="mt-6 mb-8"
          disabled={!workType || !sleepQuality}
          onPress={() => {
            store.setField('wake_time', wakeTime);
            store.setField('sleep_time', sleepTime);
            store.setField('work_type', workType as never);
            store.setField('sleep_quality', sleepQuality as never);
            router.push('/(auth)/onboarding/step-4-schedule');
          }}
        >
          Continuar
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
