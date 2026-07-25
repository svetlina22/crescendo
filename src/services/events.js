import { isSupabaseConfigured, supabaseRest } from '../config/supabase.js';
import { getSupabase } from './auth.js';

const EVENT_SELECT =
  'id,title,description,date,end_date,location,event_type,registration_link,organizer,image_url,status,created_at';

/**
 * Upcoming / CFP events ordered by date ascending.
 * @param {number} [limit=3]
 * @returns {Promise<Array>}
 */
export async function fetchUpcomingEvents(limit = 3) {
  if (!isSupabaseConfigured()) return [];

  try {
    const params = new URLSearchParams({
      select: EVENT_SELECT,
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
 * All events for the calendar page (date ascending).
 * Equivalent to: SELECT * FROM events ORDER BY date ASC
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
    return Array.isArray(data) ? data : [];
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
