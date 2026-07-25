import { supabase, isSupabaseConfigured } from '../config/supabase.js';

/**
 * Upcoming events: start_date >= now, ascending, max 4.
 * @param {number} [limit=4]
 * @returns {Promise<Array>}
 */
export async function fetchUpcomingEvents(limit = 4) {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('events')
    .select(
      'id, title, description, start_date, end_date, location, event_type, registration_link, organizer',
    )
    .gte('start_date', new Date().toISOString())
    .order('start_date', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('fetchUpcomingEvents', error);
    return [];
  }

  return data ?? [];
}
