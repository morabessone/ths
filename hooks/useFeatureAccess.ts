import { useCallback } from 'react';
import { useUserStore } from '@/stores/useUserStore';

const FEATURE_GATES = {
  full_micros: 'premium',
  medical_studies: 'premium',
  wearable_sync: 'free',
  fridge_unlimited: 'premium',
  anthropometry: 'premium',
  education_full: 'premium',
  supplement_detailed: 'premium',
} as const;

export type FeatureKey = keyof typeof FEATURE_GATES;

export function useFeatureAccess() {
  const isPremium = useUserStore((s) => s.isPremium);
  const profile = useUserStore((s) => s.profile);

  const canAccess = useCallback(
    (feature: FeatureKey): boolean => {
      if (isPremium || profile?.role === 'premium' || profile?.role === 'nutritionist') {
        return true;
      }
      return FEATURE_GATES[feature] !== 'premium';
    },
    [isPremium, profile?.role]
  );

  return { canAccess, isPremium };
}
