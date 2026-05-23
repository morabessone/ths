import { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, Alert, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { PlanMarkdown } from '@/components/plan/PlanMarkdown';
import { useUserStore } from '@/stores/useUserStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { generateOnboardingPlan } from '@/lib/ai/edgeFunctions';
import { ERROR_AI_GENERIC } from '@/constants/copy-tone';

export default function MyPlanScreen() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const [planText, setPlanText] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const loadPlan = useCallback(async () => {
    if (!user?.id || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('onboarding_plan')
      .select('plan_text, generated_at')
      .eq('user_id', user.id)
      .maybeSingle();
    const row = data as { plan_text?: string; generated_at?: string } | null;
    setPlanText(row?.plan_text ?? null);
    setGeneratedAt(row?.generated_at ?? null);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const handleRegenerate = () => {
    if (!user?.id) return;
    Alert.alert(
      'Actualizar mi plan',
      'Vamos a generar un plan nuevo con tus datos actuales. ¿Continuamos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Actualizar',
          onPress: async () => {
            setRegenerating(true);
            try {
              const result = await generateOnboardingPlan(user.id);
              setPlanText(result.plan_text);
              setGeneratedAt(new Date().toISOString());
            } catch {
              Alert.alert('LivIn', ERROR_AI_GENERIC);
            } finally {
              setRegenerating(false);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Tu plan de LivIn' }} />
      <SafeAreaView className="flex-1 bg-bg" edges={['bottom']}>
        <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 24 }}>
          {generatedAt ? (
            <Text className="font-sans text-text-tertiary text-sm mb-4">
              Generado el{' '}
              {format(new Date(generatedAt), "d 'de' MMMM yyyy", { locale: es })}
            </Text>
          ) : null}

          <Button variant="secondary" loading={regenerating} onPress={handleRegenerate} className="mb-4">
            Actualizar mi plan
          </Button>

          {loading ? (
            <View className="gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-32 w-full" />
            </View>
          ) : planText ? (
            <PlanMarkdown content={planText} />
          ) : (
            <Text className="font-sans text-text-secondary">
              Todavía no tenés un plan generado. Completá el onboarding para crearlo.
            </Text>
          )}

          <Button variant="ghost" className="mt-4" onPress={() => router.back()}>
            Volver
          </Button>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
