import { isSupabaseConfigured, supabaseRest, supabaseRestAuth } from '../config/supabase.js';

/**
 * @param {number} [limit=8]
 * @returns {Promise<Array>}
 */
export async function fetchPublishedArticles(limit = 8) {
  if (!isSupabaseConfigured()) return [];

  try {
    const params = new URLSearchParams({
      select:
        'id,title,slug,summary,reading_time_min,published_at,cover_image_url,rubrics(title,slug),profiles(full_name,academic_title)',
      status: 'eq.published',
      order: 'published_at.desc',
      limit: String(limit),
    });

    const data = await supabaseRest(`/rest/v1/articles?${params}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('fetchPublishedArticles', error);
    return [];
  }
}

/**
 * @param {string} userId
 * @param {string} accessToken
 * @returns {Promise<Array>}
 */
export async function fetchMyArticles(userId, accessToken) {
  if (!isSupabaseConfigured() || !userId || !accessToken) return [];

  try {
    const params = new URLSearchParams({
      select:
        'id,title,slug,summary,status,published_at,updated_at,rubrics(title,slug)',
      author_id: `eq.${userId}`,
      order: 'updated_at.desc',
    });

    const data = await supabaseRestAuth(`/rest/v1/articles?${params}`, accessToken);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('fetchMyArticles', error);
    return [];
  }
}
