import { useState } from 'react';
import { ScrollView, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Callout } from '@/components/ui/Callout';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/stores/useUserStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const SECTIONS = [
  { label: 'Tu plan de LivIn', href: '/profile/my-plan' },
  { label: 'Mis datos', href: '/profile/biometrics' },
  { label: 'Antropometría', href: '/profile/anthropometry' },
  { label: 'Estudios médicos', href: '/profile/medical-studies' },
  { label: 'Suplementación', href: '/supplements' },
  { label: 'Configuración', href: '/settings' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const isPremium = useUserStore((s) => s.isPremium);
  const logout = useUserStore((s) => s.logout);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = () => {
    Alert.alert('Cerrar sesión', '¿Querés salir de tu cuenta en este dispositivo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          if (isSupabaseConfigured) {
            await supabase.auth.signOut();
          }
          logout();
          setSigningOut(false);
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  return (
      <SafeAreaView className="flex-1 bg-bg" edges={['bottom']}>
        <ScrollView className="px-4">
          <Card className="items-center mt-4 mb-6">
            <Text className="font-display text-text-primary text-2xl">
              {profile?.full_name ?? 'Usuario'}
            </Text>
            <Badge label={isPremium ? 'Premium' : 'Free'} variant={isPremium ? 'success' : 'primary'} />
          </Card>

          {SECTIONS.map((s) => (
            <Pressable
              key={s.href}
              accessibilityRole="button"
              onPress={() => router.push(s.href as '/profile/biometrics')}
            >
              <Card className="mb-2 flex-row justify-between items-center">
                <Text className="font-sans-semibold text-text-primary">{s.label}</Text>
                <Text className="text-primary">→</Text>
              </Card>
            </Pressable>
          ))}

          <Callout variant="medical" title="Aviso médico" className="mt-4">
            Esta información complementa tu guía nutricional. Consultá con tu médico para interpretación clínica.
          </Callout>

          <Button
            variant="ghost"
            className="mt-6 mb-8"
            loading={signingOut}
            onPress={handleSignOut}
          >
            Cerrar sesión
          </Button>
        </ScrollView>
      </SafeAreaView>
  );
}
