import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { generateShoppingList, processPantryPhoto } from '@/lib/ai/edgeFunctions';
import { ERROR_AI_GENERIC } from '@/constants/copy-tone';

export type PantryCategory =
  | 'protein'
  | 'vegetable'
  | 'fruit'
  | 'grain'
  | 'dairy'
  | 'fat'
  | 'legume'
  | 'supplement'
  | 'condiment'
  | 'frozen'
  | 'canned'
  | 'spice'
  | 'other';

export interface PantryItem {
  id: string;
  user_id: string;
  name: string;
  category: PantryCategory | null;
  quantity: string | null;
  location: 'fridge' | 'freezer' | 'pantry';
  added_via: string | null;
  low_stock: boolean;
  expires_soon: boolean;
  notes: string | null;
  added_at: string;
}

export interface ShoppingSuggestionItem {
  name: string;
  reason: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

interface PantryStore {
  items: PantryItem[];
  shoppingItems: ShoppingSuggestionItem[];
  budgetEstimate: unknown;
  isLoading: boolean;
  isProcessingPhoto: boolean;
  error: string | null;
  loadItems: (userId: string) => Promise<void>;
  addManual: (userId: string, name: string, category?: PantryCategory) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  processPhoto: (
    userId: string,
    base64: string,
    sourceType?: 'pantry_photo' | 'receipt'
  ) => Promise<number>;
  loadShoppingSuggestions: (userId: string) => Promise<void>;
  regenerateShoppingList: (userId: string) => Promise<void>;
}

const CATEGORY_LABELS: Record<string, string> = {
  protein: 'Proteínas',
  vegetable: 'Verduras',
  fruit: 'Frutas',
  grain: 'Granos',
  dairy: 'Lácteos',
  fat: 'Grasas',
  legume: 'Legumbres',
  supplement: 'Suplementos',
  condiment: 'Condimentos',
  frozen: 'Congelados',
  canned: 'Enlatados',
  spice: 'Especias',
  other: 'Otros',
};

export { CATEGORY_LABELS };

export const usePantryStore = create<PantryStore>((set) => ({
  items: [],
  shoppingItems: [],
  budgetEstimate: null,
  isLoading: false,
  isProcessingPhoto: false,
  error: null,

  loadItems: async (userId) => {
    if (!isSupabaseConfigured) return;
    set({ isLoading: true });
    const { data } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });
    set({ items: (data ?? []) as PantryItem[], isLoading: false });
  },

  addManual: async (userId, name, category = 'other') => {
    if (!isSupabaseConfigured) return;
    const { data } = await supabase
      .from('pantry_items')
      .insert({ user_id: userId, name, category, added_via: 'manual' } as never)
      .select()
      .single();
    if (data) {
      set((s) => ({ items: [data as PantryItem, ...s.items] }));
    }
  },

  removeItem: async (id) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('pantry_items').delete().eq('id', id);
    set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
  },

  processPhoto: async (userId, base64, sourceType = 'pantry_photo') => {
    set({ isProcessingPhoto: true, error: null });
    try {
      await processPantryPhoto({
        userId,
        imageBase64: base64,
        sourceType,
      });
      const { data } = await supabase
        .from('pantry_items')
        .select('*')
        .eq('user_id', userId)
        .order('added_at', { ascending: false });
      const items = (data ?? []) as PantryItem[];
      set({ items, isProcessingPhoto: false });
      return items.length;
    } catch {
      set({ isProcessingPhoto: false, error: ERROR_AI_GENERIC });
      return 0;
    }
  },

  loadShoppingSuggestions: async (userId) => {
    if (!isSupabaseConfigured) return;
    const { data } = await supabase
      .from('shopping_suggestions')
      .select('items, budget_estimate')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      const row = data as { items?: ShoppingSuggestionItem[]; budget_estimate?: unknown };
      set({
        shoppingItems: row.items ?? [],
        budgetEstimate: row.budget_estimate,
      });
    }
  },

  regenerateShoppingList: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await generateShoppingList(userId);
      set({
        shoppingItems: (result.items as ShoppingSuggestionItem[]) ?? [],
        budgetEstimate: result.budget_estimate,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false, error: ERROR_AI_GENERIC });
    }
  },
}));
