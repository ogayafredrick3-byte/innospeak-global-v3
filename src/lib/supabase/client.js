import { createClient } from '@supabase/supabase-js';

/**
 * supabaseClient — singleton Supabase client for the admissions system.
 *
 * Reads env vars populated by the Bolt environment. In local/dev setups
 * where those vars are missing, the app should still render and show a
 * friendly message instead of crashing.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function isSupabaseConfiguredFlag() {
  return isSupabaseConfigured;
}
