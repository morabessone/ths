import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ensureUserProfile, fetchUserProfile } from '@/lib/auth/profile';
import { useUserStore } from '@/stores/useUserStore';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const { user, profile, setUser, setProfile, logout } = useUserStore();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const syncSession = async (userId: string, email: string, fullName?: string | null) => {
      const p = await ensureUserProfile(userId, email, fullName);
      if (mounted && p) setProfile(p);
    };

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        await syncSession(u.id, u.email ?? '', u.user_metadata?.full_name as string | undefined);
      }
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        await syncSession(u.id, u.email ?? '', u.user_metadata?.full_name as string | undefined);
      } else if (event === 'SIGNED_OUT') {
        logout();
      }
      if (mounted) setIsLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [setUser, setProfile, logout]);

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: Boolean(user),
    refreshProfile: async () => {
      if (!user) return;
      const p = await fetchUserProfile(user.id);
      if (p) setProfile(p);
    },
  };
}
