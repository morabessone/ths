import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { FridgeStockItem } from '@/types/database.types';
import type { Meal, MealType } from '@/types/nutrition.types';
import { SAMPLE_MEALS } from '@/constants/foods';

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
    const { data } = await supabase
      .from('fridge_stock')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });
    set({ stock: data ?? [], isLoading: false });
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
    const stockNames = new Set(get().stock.map((s) => s.ingredient_name.toLowerCase()));
    const base =
      mealType === 'breakfast'
        ? SAMPLE_MEALS.breakfast_training
        : mealType === 'snack'
          ? SAMPLE_MEALS.snack_post
          : mealType === 'dinner'
            ? SAMPLE_MEALS.dinner_rest
            : SAMPLE_MEALS.lunch_default;

    return {
      ...base,
      ingredients: base.ingredients.map((ing) => ({
        ...ing,
        available: stockNames.has(ing.name.toLowerCase()) || ing.available,
      })),
    };
  },
}));
