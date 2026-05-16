import { useState } from 'react';
import { Text, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ProgressIndicator } from '@/components/onboarding/ProgressIndicator';
import { OptionSelector } from '@/components/onboarding/OptionSelector';
import { Button } from '@/components/ui/Button';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { useUserStore } from '@/stores/useUserStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useDayPlanStore } from '@/stores/useDayPlanStore';

export default function Step5Wearable() {
  const router = useRouter();
  const store = useOnboardingStore();
  const user = useUserStore((s) => s.user);
  const setProfile = useUserStore((s) => s.setProfile);
  const updateBiometrics = useUserStore((s) => s.updateBiometrics);
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const finishOnboarding = async () => {
    setLoading(true);
    const bio = {
      weight_kg: store.weight_kg,
      height_cm: store.height_cm,
      age: store.age,
      biological_sex: store.biological_sex,
      goal: store.goal,
      activity_level: store.activity_level ?? 'moderate',
      training_days: store.training_days ?? 3,
      training_type: store.training_type ?? 'mixed',
      training_time: store.training_time ?? 'morning',
      dietary_style: store.dietary_style ?? 'omnivore',
      intolerances: store.intolerances,
      health_conditions: store.health_conditions,
    };

    updateBiometrics(bio as Parameters<typeof updateBiometrics>[0]);

    const userId = user?.id ?? 'demo-user';

    if (isSupabaseConfigured && user) {
      await supabase.from('biometrics').insert({ user_id: user.id, ...bio } as never);
      await supabase
        .from('profiles')
        .update({ onboarding_done: true } as never)
        .eq('id', user.id);
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) setProfile(profile);
    } else {
      setProfile({
        id: userId,
        email: 'demo@livin.app',
        full_name: 'Usuario',
        avatar_url: null,
        role: 'free',
        onboarding_done: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    await useDayPlanStore.getState().regeneratePlan(userId);
    setLoading(false);
    setDone(true);
    setTimeout(() => router.replace('/(tabs)'), 1500);
  };

  if (done) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center px-6">
        <Animated.View entering={FadeIn.duration(600)} className="items-center">
          <Text className="font-display text-primary text-4xl mb-2">¡Perfil listo!</Text>
          <Text className="font-sans text-text-secondary text-center">
            Estamos preparando tu plan del día...
          </Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ProgressIndicator current={5} />
      <ScrollView className="px-6">
        <Text className="font-display text-text-primary text-2xl mb-2">Conectá tu wearable</Text>
        <Text className="font-sans text-text-secondary mb-6">
          LivIn lee tu actividad para ajustar el plan automáticamente. Podés omitirlo y conectarlo después.
        </Text>
        <OptionSelector
          options={[
            { value: 'apple_health', label: 'Apple Watch / Health' },
            { value: 'google_fit', label: 'Google Fit / Health Connect' },
            { value: 'garmin', label: 'Garmin' },
            { value: 'skip', label: 'Omitir por ahora' },
          ]}
          value={source}
          onChange={(v) => {
            setSource(v as string);
            store.setField('wearable_source', v as string);
          }}
        />
        <View className="mt-6 gap-3">
          <Button loading={loading} onPress={finishOnboarding}>
            Finalizar
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
