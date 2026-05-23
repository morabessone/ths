import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { FridgeStockItem } from '@/types/database.types';
import type { Meal, MealType } from '@/types/nutrition.types';
import { pickMealForMoment } from '@/lib/nutrition/mealComposer';
import type { BiometricsInput } from '@/types/nutrition.types';
import { useUserStore } from './useUserStore';
import { loadFridgeStock as fetchFridgeStock } from '@/lib/fridge/stockService';
import type { MicroGuidance } from '@/types/nutrition.types';

interface FridgeStore {
  stock: FridgeStockItem[];
  isLoading: boolean;
  loadStock: (userId: string) => Promise<void>;
  addIngredient: (item: Omit<FridgeStockItem, 'id' | 'added_at'>) => Promise<void>;
  removeIngredient: (id: string) => Promise<void>;
  clearStock: (userId: string) => Promise<void>;
  generateMeal: (mealType: MealType) => Promise<Meal>;
}

export const useFridgeStore = create<FridgeStore>((set, get) => ({
  stock: [],
  isLoading: false,

  loadStock: async (userId) => {
    if (!isSupabaseConfigured) return;
    set({ isLoading: true });
    const data = await fetchFridgeStock(userId);
    set({ stock: data, isLoading: false });
  },

  addIngredient: async (item) => {
    if (!isSupabaseConfigured) {
      const local: FridgeStockItem = {
        id: `local-${Date.now()}`,
        ...item,
        added_at: new Date().toISOString(),
      };
      set({ stock: [local, ...get().stock] });
      return;
    }
    const { data } = await supabase.from('fridge_stock').insert(item as never).select().single();
    if (data) set({ stock: [data, ...get().stock] });
  },

  removeIngredient: async (id) => {
    if (isSupabaseConfigured) {
      await supabase.from('fridge_stock').delete().eq('id', id);
    }
    set({ stock: get().stock.filter((s) => s.id !== id) });
  },

  clearStock: async (userId) => {
    if (isSupabaseConfigured) {
      await supabase.from('fridge_stock').delete().eq('user_id', userId);
    }
    set({ stock: [] });
  },

  generateMeal: async (mealType) => {
    const stock = get().stock.map((s) => s.ingredient_name);
    const bioRaw = useUserStore.getState().latestBiometrics;
    const { useDayPlanStore } = await import('./useDayPlanStore');
    const micro: MicroGuidance[] = useDayPlanStore.getState().planBuilt?.microGuidance ?? [];
    const bio: BiometricsInput = {
      weight_kg: Number(bioRaw?.weight_kg ?? 70),
      height_cm: Number(bioRaw?.height_cm ?? 170),
      age: bioRaw?.age ?? 30,
      biological_sex: (bioRaw?.biological_sex as BiometricsInput['biological_sex']) ?? 'male',
      goal: (bioRaw?.goal as BiometricsInput['goal']) ?? 'general_health',
      activity_level: (bioRaw?.activity_level as BiometricsInput['activity_level']) ?? 'moderate',
      training_days: bioRaw?.training_days ?? 3,
      training_type: (bioRaw?.training_type as BiometricsInput['training_type']) ?? 'mixed',
      dietary_style: bioRaw?.dietary_style ?? 'omnivore',
      intolerances: bioRaw?.intolerances ?? [],
      health_conditions: bioRaw?.health_conditions ?? [],
    };
    const moment =
      mealType === 'breakfast'
        ? 'breakfast'
        : mealType === 'snack'
          ? 'post_training'
          : mealType === 'dinner'
            ? 'dinner'
            : 'lunch';
    return pickMealForMoment(moment, bio, stock, micro);
  },
}));
