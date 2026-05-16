import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { Biometrics, Profile, Subscription } from '@/types/database.types';

interface UserStore {
  user: User | null;
  profile: Profile | null;
  latestBiometrics: Biometrics | null;
  subscription: Subscription | null;
  isPremium: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  updateBiometrics: (data: Partial<Biometrics>) => void;
  setSubscription: (sub: Subscription | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  profile: null,
  latestBiometrics: null,
  subscription: null,
  isPremium: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) =>
    set({
      profile,
      isPremium: profile?.role === 'premium' || profile?.role === 'nutritionist',
    }),
  updateBiometrics: (data) =>
    set({
      latestBiometrics: get().latestBiometrics
        ? { ...get().latestBiometrics!, ...data }
        : (data as Biometrics),
    }),
  setSubscription: (subscription) =>
    set({
      subscription,
      isPremium:
        subscription?.status === 'active' || subscription?.status === 'trialing',
    }),
  logout: () =>
    set({
      user: null,
      profile: null,
      latestBiometrics: null,
      subscription: null,
      isPremium: false,
    }),
}));
