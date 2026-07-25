const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim().replace(/\/$/, '');
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}

/**
 * Public REST helper — avoids supabase-js auth locks in the browser.
 * @param {string} path - e.g. /rest/v1/articles?...
 * @param {number} [timeoutMs=8000]
 */
export async function supabaseRest(path, timeoutMs = 8000) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${url}${path}`, {
      method: 'GET',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Supabase ${response.status}: ${body.slice(0, 200)}`);
    }

    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Authenticated REST helper for author/admin requests (uses user JWT).
 * @param {string} path
 * @param {string} accessToken
 * @param {number} [timeoutMs=8000]
 */
export async function supabaseRestAuth(path, accessToken, timeoutMs = 8000) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }
  if (!accessToken) {
    throw new Error('Missing access token');
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${url}${path}`, {
      method: 'GET',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Supabase ${response.status}: ${body.slice(0, 200)}`);
    }

    return response.json();
  } finally {
    clearTimeout(timer);
  }
}
