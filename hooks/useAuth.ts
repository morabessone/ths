import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useUserStore } from '@/stores/useUserStore';
import type { Profile } from '@/types/database.types';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const { user, profile, setUser, setProfile, logout } = useUserStore();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    const loadProfile = async (userId: string) => {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) setProfile(data as Profile);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        logout();
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [setUser, setProfile, logout]);

  return { user, profile, isLoading, isAuthenticated: Boolean(user) };
}
