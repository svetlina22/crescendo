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

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    return { session: data.session ?? null, error };
  } catch (error) {
    console.error('signIn', error);
    return { session: null, error };
  }
}

/**
 * Clears session locally (no remote call) to avoid Safari "Load failed".
 */
export async function signOut() {
  const supabase = getSupabase();

  try {
    if (supabase) {
      await supabase.auth.signOut({ scope: 'local' });
    }
  } catch (error) {
    console.warn('signOut', error);
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    // Legacy / alternate keys sometimes left by supabase-js
    Object.keys(localStorage)
      .filter((key) => key.startsWith('sb-') && key.includes('auth'))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // ignore
  }

  return { error: null };
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
  if (
    message.includes('Load failed') ||
    message.includes('Failed to fetch') ||
    message.includes('NetworkError') ||
    message.includes('fetch')
  ) {
    return 'Няма връзка със сървъра. Проверете интернет и опитайте отново.';
  }
  return 'Входът не бе успешен. Опитайте отново.';
}

/**
 * Role from profiles (source of truth), with user_metadata.role fallback.
 * @param {import('@supabase/supabase-js').User | null | undefined} user
 * @param {string} [accessToken]
 * @returns {Promise<'admin' | 'author'>}
 */
export async function getUserRole(user, accessToken) {
  const token = accessToken || (await getSession())?.access_token;
  const userId = user?.id;
  const metaRole = user?.user_metadata?.role;

  if (token && userId && isSupabaseConfigured()) {
    try {
      const { supabaseRestAuth } = await import('../config/supabase.js');
      const params = new URLSearchParams({
        select: 'role',
        id: `eq.${userId}`,
        limit: '1',
      });
      const rows = await supabaseRestAuth(`/rest/v1/profiles?${params}`, token);
      const role = Array.isArray(rows) ? rows[0]?.role : null;
      if (role === 'admin' || role === 'author') return role;
    } catch (error) {
      console.warn('getUserRole profile fetch', error);
    }
  }

  if (metaRole === 'admin' || metaRole === 'author') return metaRole;
  return 'author';
}

/**
 * @param {import('@supabase/supabase-js').User | null | undefined} user
 * @param {string} [accessToken]
 */
export async function getUserProfile(user, accessToken) {
  const token = accessToken || (await getSession())?.access_token;
  const userId = user?.id;

  let role = /** @type {'admin' | 'author'} */ ('author');
  let fullName = user?.user_metadata?.full_name ?? null;
  let academicTitle = null;

  if (token && userId && isSupabaseConfigured()) {
    try {
      const { supabaseRestAuth } = await import('../config/supabase.js');
      const params = new URLSearchParams({
        select: 'role,full_name,academic_title',
        id: `eq.${userId}`,
        limit: '1',
      });
      const rows = await supabaseRestAuth(`/rest/v1/profiles?${params}`, token);
      const profile = Array.isArray(rows) ? rows[0] : null;
      if (profile) {
        if (profile.role === 'admin' || profile.role === 'author') {
          role = profile.role;
        }
        fullName = profile.full_name ?? fullName;
        academicTitle = profile.academic_title ?? null;
      }
    } catch (error) {
      console.warn('getUserProfile', error);
      role = await getUserRole(user, accessToken);
    }
  } else {
    role = await getUserRole(user, accessToken);
  }

  return { role, fullName, academicTitle };
}
