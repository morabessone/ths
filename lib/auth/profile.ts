import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/database.types';

export async function fetchUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) {
    console.warn('[LivIn] fetchUserProfile:', error.message);
    return null;
  }
  return data as Profile | null;
}

/** Crea el perfil si el trigger de Supabase no corrió (p. ej. usuario antiguo). */
/** Si ya cargó biométricos pero onboarding_done quedó en false, marcar como listo. */
export async function syncOnboardingStatus(userId: string, profile: Profile): Promise<Profile> {
  if (profile.onboarding_done) return profile;

  const { data: bio } = await supabase
    .from('biometrics')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (!bio?.length) return profile;

  const { data: updated } = await supabase
    .from('profiles')
    .update({ onboarding_done: true } as never)
    .eq('id', userId)
    .select()
    .single();

  if (updated) return updated as Profile;
  return { ...profile, onboarding_done: true };
}

export async function ensureUserProfile(
  userId: string,
  email: string,
  fullName?: string | null
): Promise<Profile | null> {
  let existing = await fetchUserProfile(userId);
  if (existing) {
    existing = await syncOnboardingStatus(userId, existing);
    return existing;
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      full_name: fullName ?? null,
    } as never)
    .select()
    .single();

  if (error) {
    console.warn('[LivIn] ensureUserProfile insert:', error.message);
    return fetchUserProfile(userId);
  }
  return data as Profile;
}
