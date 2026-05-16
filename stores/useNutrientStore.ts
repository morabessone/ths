import { create } from 'zustand';
import { NUTRIENT_LABELS } from '@/constants/nutrients';

export interface NutrientProgress {
  key: string;
  label: string;
  current: number;
  target: number;
  unit: string;
}

interface NutrientStore {
  progress: NutrientProgress[];
  setFromTargets: (targets: Record<string, number | null | undefined>) => void;
}

export const useNutrientStore = create<NutrientStore>((set) => ({
  progress: [],
  setFromTargets: (targets) => {
    const keys = Object.keys(NUTRIENT_LABELS);
    const progress: NutrientProgress[] = keys.map((key) => {
      const target = Number(targets[key] ?? 0);
      const current = Math.round(target * (0.55 + Math.random() * 0.35));
      return {
        key,
        label: NUTRIENT_LABELS[key],
        current,
        target,
        unit: key.includes('water') ? 'ml' : key.includes('mcg') ? 'mcg' : 'mg',
      };
    });
    set({ progress });
  },
}));
