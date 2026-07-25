const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim().replace(/\/$/, '');
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}

/**
 * Public REST helper — avoids supabase-js auth locks in the browser.
 * @param {string} path - e.g. /rest/v1/articles?...
 * @param {number} [timeoutMs=20000]
 */
export async function supabaseRest(path, timeoutMs = 20000) {
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
    // Stop abort timer before reading the body — aborting mid-read shows "Fetch is aborted"
    clearTimeout(timer);

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Supabase ${response.status}: ${body.slice(0, 200)}`);
    }

    return response.json();
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Заявката отне твърде дълго. Опитайте отново.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Authenticated REST helper (GET/POST/PATCH/DELETE) with user JWT.
 * @param {string} path
 * @param {string} accessToken
 * @param {{ method?: string, body?: unknown, prefer?: string, timeoutMs?: number }} [options]
 */
export async function supabaseRestAuth(path, accessToken, options = {}) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }
  if (!accessToken) {
    throw new Error('Missing access token');
  }

  const {
    method = 'GET',
    body,
    prefer = 'return=representation',
    timeoutMs = 20000,
  } = options;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    /** @type {Record<string, string>} */
    const headers = {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
    if (method !== 'GET' && prefer) {
      headers.Prefer = prefer;
    }

    const response = await fetch(`${url}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    // Clear before body read — otherwise AbortSignal can cancel response.text()
    clearTimeout(timer);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Supabase ${response.status}: ${text.slice(0, 300)}`);
    }

    if (response.status === 204) return null;

    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Заявката отне твърде дълго. Опитайте отново.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
