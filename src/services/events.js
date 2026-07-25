import { isSupabaseConfigured, supabaseRest } from '../config/supabase.js';

/**
 * Upcoming events: start_date >= now, ascending, max 4.
 * @param {number} [limit=4]
 * @returns {Promise<Array>}
 */
export async function fetchUpcomingEvents(limit = 4) {
  if (!isSupabaseConfigured()) return [];

  try {
    const params = new URLSearchParams({
      select:
        'id,title,description,start_date,end_date,location,event_type,registration_link,organizer',
      start_date: `gte.${new Date().toISOString()}`,
      order: 'start_date.asc',
      limit: String(limit),
    });

    const data = await supabaseRest(`/rest/v1/events?${params}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('fetchUpcomingEvents', error);
    return [];
  }
}
