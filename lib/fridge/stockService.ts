import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { FridgeStockItem } from '@/types/database.types';

export async function loadFridgeStock(userId: string): Promise<FridgeStockItem[]> {
  if (!isSupabaseConfigured) return [];
  const { data } = await supabase
    .from('fridge_stock')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false });
  return data ?? [];
}

export function fridgeIngredientNames(stock: FridgeStockItem[]): string[] {
  return stock.map((s) => s.ingredient_name);
}
