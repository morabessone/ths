import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Database } from '@/types/database.types';

const isWeb = Platform.OS === 'web';

const authStorage = isWeb
  ? {
      getItem: (key: string) => {
        if (typeof localStorage === 'undefined') return Promise.resolve(null);
        return Promise.resolve(localStorage.getItem(key));
      },
      setItem: (key: string, value: string) => {
        if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
        return Promise.resolve();
      },
    }
  : {
      getItem: (key: string) => SecureStore.getItemAsync(key),
      setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
      removeItem: (key: string) => SecureStore.deleteItemAsync(key),
    };

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const isSupabaseConfigured =
  Boolean(supabaseUrl) && Boolean(supabaseAnonKey);
