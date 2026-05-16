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

    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments.includes('onboarding');

    if (!isSupabaseConfigured) {
      const done = profile?.onboarding_done;
      if (done && inAuth) {
        router.replace('/(tabs)');
        return;
      }
      if (!done && !inAuth && segments[0] !== '(tabs)' && segments[0] !== 'profile') {
        router.replace('/(auth)/welcome');
      }
      return;
    }

    if (!user && !inAuth) {
      router.replace('/(auth)/welcome');
      return;
    }

    if (user && profile && !profile.onboarding_done && !inOnboarding) {
      router.replace('/(auth)/onboarding/step-1-biometrics');
      return;
    }

    if (user && profile?.onboarding_done && inAuth) {
      router.replace('/(tabs)');
    }
  }, [user, profile, isLoading, segments, router]);

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
        </Stack>
      </AuthGate>
    </AppProviders>
  );
}
