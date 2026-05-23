import { create } from 'zustand';
import type { BiometricsInput } from '@/types/nutrition.types';

type WorkType = 'sedentary' | 'light_active' | 'active' | 'very_active';
type SleepQuality = 'poor' | 'fair' | 'good' | 'excellent';
type CookingComfort = 'minimal' | 'basic' | 'comfortable' | 'enthusiast';

interface OnboardingStore extends Partial<BiometricsInput> {
  wake_time?: string;
  sleep_time?: string;
  work_type?: WorkType;
  sleep_quality?: SleepQuality;
  cooking_comfort?: CookingComfort;
  food_preferences?: string[];
  food_dislikes?: string[];
  main_goal_detail?: string;
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
  food_preferences: [],
  food_dislikes: [],
  setField: () => {},
  reset: () => {},
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  ...initial,
  setField: (key, value) => set({ [key]: value }),
  reset: () => set({ ...initial, setField: initial.setField, reset: initial.reset }),
}));
