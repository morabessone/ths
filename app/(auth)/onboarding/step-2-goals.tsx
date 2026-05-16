import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressIndicator } from '@/components/onboarding/ProgressIndicator';
import { OptionSelector } from '@/components/onboarding/OptionSelector';
import { Button } from '@/components/ui/Button';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import type { Goal, TrainingType } from '@/types/nutrition.types';

const GOALS: { value: Goal; label: string; description: string }[] = [
  { value: 'hypertrophy', label: 'Hipertrofia', description: 'Ganar masa muscular con superávit controlado' },
  { value: 'fat_loss', label: 'Pérdida de grasa', description: 'Definición preservando músculo' },
  { value: 'performance', label: 'Rendimiento', description: 'Optimizar energía para competir' },
  { value: 'general_health', label: 'Salud general', description: 'Hábitos sostenibles a largo plazo' },
  { value: 'energy', label: 'Más energía', description: 'Vitalidad diaria y mejor sueño' },
];

export default function Step2Goals() {
  const router = useRouter();
  const store = useOnboardingStore();
  const [goal, setGoal] = useState<Goal | null>(store.goal ?? null);
  const [trainingDays, setTrainingDays] = useState(store.training_days ?? 3);
  const [trainingType, setTrainingType] = useState<TrainingType | null>(store.training_type ?? null);
  const [trainingTime, setTrainingTime] = useState<string | null>(store.training_time ?? null);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ProgressIndicator current={2} />
      <ScrollView className="px-6">
        <Text className="font-display text-text-primary text-2xl mb-4">Objetivo y actividad</Text>
        <OptionSelector options={GOALS} value={goal} onChange={(v) => setGoal(v as Goal)} />
        <Text className="font-sans-medium text-text-primary mt-4 mb-2">
          Días de entrenamiento por semana: {trainingDays}
        </Text>
        <View className="flex-row gap-3 mb-4">
          <Button size="sm" variant="secondary" onPress={() => setTrainingDays(Math.max(0, trainingDays - 1))}>−</Button>
          <Button size="sm" variant="secondary" onPress={() => setTrainingDays(Math.min(7, trainingDays + 1))}>+</Button>
        </View>
        <Text className="font-sans-medium text-text-primary mb-2">Tipo de entrenamiento</Text>
        <OptionSelector
          options={[
            { value: 'strength', label: 'Fuerza' },
            { value: 'cardio', label: 'Cardio' },
            { value: 'mixed', label: 'Mixto' },
            { value: 'functional', label: 'Funcional' },
          ]}
          value={trainingType}
          onChange={(v) => setTrainingType(v as TrainingType)}
        />
        <Text className="font-sans-medium text-text-primary mt-4 mb-2">Horario habitual</Text>
        <OptionSelector
          options={[
            { value: 'morning', label: 'Mañana' },
            { value: 'afternoon', label: 'Tarde' },
            { value: 'evening', label: 'Noche' },
          ]}
          value={trainingTime}
          onChange={(v) => setTrainingTime(v as string)}
        />
        <Button
          className="mt-6 mb-8"
          disabled={!goal || !trainingType}
          onPress={() => {
            store.setField('goal', goal!);
            store.setField('training_days', trainingDays);
            store.setField('training_type', trainingType!);
            store.setField('training_time', trainingTime ?? 'morning');
            store.setField('activity_level', trainingDays >= 5 ? 'active' : trainingDays >= 3 ? 'moderate' : 'light');
            router.push('/(auth)/onboarding/step-3-preferences');
          }}
        >
          Continuar
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
