import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * Secure storage adapter.
 * Uses AsyncStorage on native; localStorage on web.
 * Session tokens only — never store service-role keys in the client.
 */
const ExpoStorageAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage === 'undefined') return null;
      return localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      return;
    }
    await AsyncStorage.removeItem(key);
  },
};

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      storage: ExpoStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

export function requireSupabaseConfig(): void {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }
}
