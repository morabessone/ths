import { useState } from 'react';
import { Text, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { registerSchema, type RegisterForm } from '@/lib/auth/schemas';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getSpanishErrorMessage } from '@/lib/errors';
import { ensureUserProfile } from '@/lib/auth/profile';
import { useUserStore } from '@/stores/useUserStore';

export default function RegisterScreen() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const setProfile = useUserStore((s) => s.setProfile);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', fullName: '' },
  });

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    if (!isSupabaseConfigured) {
      router.replace('/(auth)/onboarding/step-1-biometrics');
      return;
    }
    setLoading(true);
    const { data: signUpData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.fullName } },
    });
    setLoading(false);

    if (authError) {
      setError(getSpanishErrorMessage(authError));
      return;
    }

    if (!signUpData.session || !signUpData.user) {
      setError(
        'Te enviamos un email de confirmación. Abrilo, confirmá la cuenta y después iniciá sesión.'
      );
      return;
    }

    setUser(signUpData.user);
    const profile = await ensureUserProfile(
      signUpData.user.id,
      signUpData.user.email ?? data.email,
      data.fullName
    );
    if (profile) setProfile(profile);

    router.replace('/(auth)/onboarding/step-1-biometrics');
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-6 justify-center"
      >
        <Text className="font-display text-text-primary text-3xl mb-2">Crear cuenta</Text>
        <Text className="font-sans text-text-secondary mb-8">Empezá tu guía nutricional</Text>

        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Nombre" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.fullName?.message} />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Email" keyboardType="email-address" autoCapitalize="none" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.email?.message} />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Contraseña" secureTextEntry onBlur={onBlur} onChangeText={onChange} value={value} error={errors.password?.message} />
          )}
        />

        {error ? <Text className="text-danger font-sans mb-4">{error}</Text> : null}

        <Button loading={loading} onPress={handleSubmit(onSubmit)}>Crear cuenta</Button>

        <Link href="/(auth)/login" className="mt-6">
          <Text className="font-sans text-primary text-center">Ya tengo cuenta</Text>
        </Link>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
