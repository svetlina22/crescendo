import { isSupabaseConfigured, supabaseRest, supabaseRestAuth } from '../config/supabase.js';
import { getSupabase } from './auth.js';

const EVENT_SIDEBAR_SELECT =
  'id,title,date,location,event_type,registration_link,image_url,status';

const EVENT_PANEL_SELECT =
  'id,title,date,location,event_type,registration_link,image_url,status,description,author_id,created_at';

/**
 * Upcoming / CFP events ordered by date ascending.
 * @param {number} [limit=3]
 * @returns {Promise<Array>}
 */
export async function fetchUpcomingEvents(limit = 3) {
  if (!isSupabaseConfigured()) return [];

  try {
    const params = new URLSearchParams({
      select: EVENT_SIDEBAR_SELECT,
      status: 'in.(upcoming,call_for_papers)',
      order: 'date.asc',
      limit: String(limit),
    });

    const data = await supabaseRest(`/rest/v1/events?${params}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('fetchUpcomingEvents', error);
    return [];
  }
}

/**
 * Upcoming / CFP first (soonest date first), then past (most recent first).
 * @param {Array} events
 * @returns {Array}
 */
function sortEventsUpcomingToPast(events) {
  const now = Date.now();

  const isPast = (event) => {
    if (event.status === 'past') return true;
    if (event.status === 'upcoming' || event.status === 'call_for_papers') return false;
    const time = new Date(event.date).getTime();
    return Number.isFinite(time) && time < now;
  };

  return [...events].sort((a, b) => {
    const aPast = isPast(a);
    const bPast = isPast(b);
    if (aPast !== bPast) return aPast ? 1 : -1;

    const ta = new Date(a.date).getTime() || 0;
    const tb = new Date(b.date).getTime() || 0;
    // Upcoming: soonest first; past: most recent first
    return aPast ? tb - ta : ta - tb;
  });
}

/**
 * All events for the calendar page.
 * Order: upcoming → past; soonest upcoming first.
 * @returns {Promise<Array>}
 */
export async function fetchEvents() {
  if (!isSupabaseConfigured()) return [];

  try {
    const params = new URLSearchParams({
      select: '*',
      order: 'date.asc',
    });

    const data = await supabaseRest(`/rest/v1/events?${params}`);
    return sortEventsUpcomingToPast(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('fetchEvents', error);
    return [];
  }
}

/**
 * Create an event via Supabase JS SDK (authenticated session required).
 * @param {{
 *   title: string,
 *   date: string,
 *   location: string,
 *   description: string,
 *   image_url?: string | null,
 *   status?: 'upcoming' | 'past' | 'call_for_papers',
 *   author_id?: string | null,
 * }} payload
 * @returns {Promise<{ data: object | null, error: Error | null }>}
 */
export async function createEvent(payload) {
  const supabase = getSupabase();
  if (!supabase) {
    return { data: null, error: new Error('Supabase не е конфигуриран.') };
  }

  const row = {
    title: payload.title,
    date: payload.date,
    location: payload.location,
    description: payload.description,
    image_url: payload.image_url || null,
    status: payload.status || 'upcoming',
    author_id: payload.author_id || null,
  };

  try {
    const { data, error } = await supabase.from('events').insert(row).select().single();
    if (error) return { data: null, error };
    return { data, error: null };
  } catch (error) {
    console.error('createEvent', error);
    return { data: null, error };
  }
}

/**
 * Author: own events only. Admin: all events.
 * @param {{ userId: string, accessToken: string, isAdmin?: boolean }} opts
 * @returns {Promise<Array>}
 */
export async function fetchPanelEvents({ userId, accessToken, isAdmin = false }) {
  if (!isSupabaseConfigured() || !accessToken || !userId) return [];

  try {
    const params = new URLSearchParams({
      select: EVENT_PANEL_SELECT,
      order: 'date.desc',
    });

    if (!isAdmin) {
      params.set('author_id', `eq.${userId}`);
    }

    const data = await supabaseRestAuth(`/rest/v1/events?${params}`, accessToken);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('fetchPanelEvents', error);
    return [];
  }
}

/**
 * @param {string} eventId
 * @returns {Promise<object | null>}
 */
export async function fetchEventById(eventId) {
  if (!isSupabaseConfigured() || !eventId) return null;

  try {
    const params = new URLSearchParams({
      select: '*',
      id: `eq.${eventId}`,
      limit: '1',
    });
    const data = await supabaseRest(`/rest/v1/events?${params}`);
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('fetchEventById', error);
    return null;
  }
}

/**
 * @param {string} accessToken
 * @param {string} eventId
 * @param {object} payload
 */
export async function updateEvent(accessToken, eventId, payload) {
  const data = await supabaseRestAuth(
    `/rest/v1/events?id=eq.${encodeURIComponent(eventId)}`,
    accessToken,
    { method: 'PATCH', body: payload, prefer: 'return=minimal', timeoutMs: 25000 },
  );
  return Array.isArray(data) ? data[0] : data;
}

/**
 * @param {string} accessToken
 * @param {string} eventId
 */
export async function deleteEvent(accessToken, eventId) {
  await supabaseRestAuth(
    `/rest/v1/events?id=eq.${encodeURIComponent(eventId)}`,
    accessToken,
    { method: 'DELETE', prefer: 'return=minimal', timeoutMs: 25000 },
  );
}
