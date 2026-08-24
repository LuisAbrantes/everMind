import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://tahsqymipxryyawqbhwd.supabase.co';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_KEY || 'sb_publishable__fM_lGOie_Zz0PlvDzXQnQ_ZwKel-hz';

if (
  process.env.NODE_ENV !== 'test' &&
  (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_KEY)
) {
  console.warn(
    '[Supabase] Variáveis de ambiente EXPO_PUBLIC_SUPABASE_URL ou EXPO_PUBLIC_SUPABASE_KEY não configuradas.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
