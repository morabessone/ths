import { useEffect, useState } from 'react';
import { Text, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { PlanMarkdown } from '@/components/plan/PlanMarkdown';
import { useUserStore } from '@/stores/useUserStore';
import { generateOnboardingPlan } from '@/lib/ai/edgeFunctions';
import { ERROR_AI_GENERIC } from '@/constants/copy-tone';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const LOADING_LINES = [
  'Analizando tu perfil...',
  'Calculando tus rangos...',
  'Armando tus recomendaciones...',
];

export default function OnboardingResultScreen() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const [planText, setPlanText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setLineIndex((i) => (i + 1) % LOADING_LINES.length), 2000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isSupabaseConfigured) {
          const { data: existing } = await supabase
            .from('onboarding_plan')
            .select('plan_text')
            .eq('user_id', user.id)
            .maybeSingle();

          const row = existing as { plan_text?: string } | null;
          if (row?.plan_text) {
            setPlanText(row.plan_text);
            setLoading(false);
            return;
          }
        }

        const result = await generateOnboardingPlan(user.id);
        setPlanText(result.plan_text);
      } catch {
        setError(ERROR_AI_GENERIC);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [user?.id]);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView className="px-6" contentContainerStyle={{ paddingBottom: 32 }}>
        <Animated.View entering={FadeIn.duration(500)}>
          <Text className="font-display text-text-primary text-[28px] mt-4 mb-2">✨ Tu plan está listo</Text>
          <Text className="font-sans text-text-secondary mb-6">
            Basado en todo lo que nos contaste sobre vos
          </Text>
        </Animated.View>

        {loading ? (
          <View>
            <Skeleton className="h-4 mb-2 w-full" />
            <Skeleton className="h-4 mb-2 w-[90%]" />
            <Skeleton className="h-4 mb-4 w-[75%]" />
            <Text className="font-sans text-primary text-center mt-2">{LOADING_LINES[lineIndex]}</Text>
          </View>
        ) : error ? (
          <Text className="font-sans text-danger text-center">{error}</Text>
        ) : planText ? (
          <PlanMarkdown content={planText} />
        ) : null}

        {!loading ? (
          <Button className="mt-8" onPress={() => router.replace('/(tabs)')}>
            Ir a mi panel →
          </Button>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
