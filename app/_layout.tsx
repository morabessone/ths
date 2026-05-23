import '../global.css';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  useFonts,
} from '@expo-google-fonts/dm-sans';
import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AppProviders } from '@/providers/AppProviders';
import { useAuth } from '@/hooks/useAuth';
import { isSupabaseConfigured } from '@/lib/supabase';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const root = segments[0];
    const inAuth = root === '(auth)';
    const inOnboarding = segments.some((s) => String(s).includes('onboarding'));

    // Modo demo sin Supabase
    if (!isSupabaseConfigured) {
      if (profile?.onboarding_done && inAuth) {
        router.replace('/(tabs)');
      } else if (!profile?.onboarding_done && root === '(tabs)') {
        router.replace('/(auth)/welcome');
      }
      return;
    }

    // Sin sesión: solo pantallas de auth públicas
    if (!user) {
      if (!inAuth) {
        router.replace('/(auth)/welcome');
      }
      return;
    }

    // Con sesión pero perfil aún cargando: no redirigir
    if (!profile) return;

    const onResult = segments.some((s) => String(s) === 'result');

    // Onboarding pendiente
    if (!profile.onboarding_done) {
      if (!inOnboarding) {
        router.replace('/(auth)/onboarding/step-1-biometrics');
      }
      return;
    }

    // Onboarding listo → app principal (permitir pantalla result tras wearable)
    if (inAuth && !inOnboarding && !onResult) {
      router.replace('/(tabs)');
    }
  }, [user, profile, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator size="large" color="#5B4FCF" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AppProviders>
      <StatusBar style="dark" />
      <AuthGate>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FAFAF9' } }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="supplements" options={{ headerShown: false }} />
          <Stack.Screen name="learn" options={{ headerShown: false }} />
          <Stack.Screen name="pantry" options={{ headerShown: false }} />
        </Stack>
      </AuthGate>
    </AppProviders>
  );
}
