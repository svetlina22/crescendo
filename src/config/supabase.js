/**
 * Supabase клиент (подготовка).
 * Добавете VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env
 * и инсталирайте @supabase/supabase-js преди свързване.
 */
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL ?? '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
};

export function isSupabaseConfigured() {
  return Boolean(supabaseConfig.url && supabaseConfig.anonKey);
}
