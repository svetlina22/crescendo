import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '../config/supabase.js';

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim().replace(/\/$/, '');
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();
const STORAGE_KEY = 'crescendo-auth';

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let client = null;

/**
 * Lazy Supabase client — only created when auth is needed (login / dashboard).
 * Bypasses Web Locks API to avoid browser hangs on getSession().
 */
export function getSupabase() {
  if (!client && isSupabaseConfigured()) {
    client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: STORAGE_KEY,
        lock: async (_name, _acquireTimeout, fn) => fn(),
      },
    });
  }
  return client;
}

/**
 * @returns {import('@supabase/supabase-js').Session | null}
 */
function readSessionFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const session = parsed?.currentSession ?? parsed;
    if (!session?.access_token || !session?.user) return null;

    const expiresAt = session.expires_at;
    if (expiresAt && expiresAt * 1000 < Date.now()) return null;

    return session;
  } catch {
    return null;
  }
}

/**
 * @param {number} [timeoutMs=4000]
 * @returns {Promise<import('@supabase/supabase-js').Session | null>}
 */
export async function getSession(timeoutMs = 4000) {
  const supabase = getSupabase();
  if (!supabase) return readSessionFromStorage();

  try {
    const { data, error } = await Promise.race([
      supabase.auth.getSession(),
      new Promise((_, reject) => {
        window.setTimeout(() => reject(new Error('getSession timeout')), timeoutMs);
      }),
    ]);

    if (error) {
      console.error('getSession', error);
      return readSessionFromStorage();
    }

    return data.session ?? readSessionFromStorage();
  } catch (error) {
    console.warn('getSession fallback', error);
    return readSessionFromStorage();
  }
}

/**
 * @param {string} email
 * @param {string} password
 */
export async function signIn(email, password) {
  const supabase = getSupabase();
  if (!supabase) {
    return { session: null, error: new Error('Supabase не е конфигуриран.') };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (!error && data.session) {
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  }

  return { session: data.session ?? null, error };
}

export async function signOut() {
  const supabase = getSupabase();
  if (!supabase) return { error: null };

  const { error } = await supabase.auth.signOut();
  if (error) console.error('signOut', error);
  return { error };
}

export function formatAuthError(error) {
  if (!error) return 'Входът не бе успешен.';

  const message = String(error.message ?? error);
  if (message.includes('Invalid login credentials')) {
    return 'Грешен имейл или парола.';
  }
  if (message.includes('Email not confirmed')) {
    return 'Имейлът не е потвърден.';
  }
  return message;
}
