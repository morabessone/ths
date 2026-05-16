import { create } from 'zustand';
import type { BiometricsInput } from '@/types/nutrition.types';

interface OnboardingStore extends Partial<BiometricsInput> {
  wake_time?: string;
  training_time_picker?: string;
  cooks_at_home?: boolean;
  wearable_source?: string;
  intolerances: string[];
  health_conditions: string[];
  setField: <K extends keyof OnboardingStore>(key: K, value: OnboardingStore[K]) => void;
  reset: () => void;
}

const initial: OnboardingStore = {
  intolerances: [],
  health_conditions: [],
  setField: () => {},
  reset: () => {},
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  ...initial,
  setField: (key, value) => set({ [key]: value }),
  reset: () => set({ ...initial, setField: initial.setField, reset: initial.reset }),
}));
