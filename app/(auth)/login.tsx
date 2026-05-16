import { useState } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { loginSchema, type LoginForm } from '@/lib/auth/schemas';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getSpanishErrorMessage } from '@/lib/errors';

export default function LoginScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    if (!isSupabaseConfigured) {
      router.replace('/(tabs)');
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    setLoading(false);
    if (authError) {
      setError(getSpanishErrorMessage(authError));
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-6 justify-center"
      >
        <Text className="font-display text-text-primary text-3xl mb-2">Bienvenido</Text>
        <Text className="font-sans text-text-secondary mb-8">Iniciá sesión en tu cuenta</Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Contraseña"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
            />
          )}
        />

        {error ? <Text className="text-danger font-sans mb-4">{error}</Text> : null}

        <Button loading={loading} onPress={handleSubmit(onSubmit)}>
          Iniciar sesión
        </Button>

        <Pressable className="mt-4 py-3 items-center" accessibilityRole="button">
          <Text className="font-sans text-text-secondary">Continuar con Google</Text>
        </Pressable>

        <Link href="/(auth)/register" className="mt-6">
          <Text className="font-sans text-primary text-center">
            ¿No tenés cuenta? Registrate
          </Text>
        </Link>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
