import { supabase, isSupabaseConfigured } from '../config/supabase.js';

/**
 * @param {number} [limit=8]
 * @returns {Promise<Array>}
 */
export async function fetchPublishedArticles(limit = 8) {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('articles')
    .select(
      `
      id,
      title,
      slug,
      summary,
      reading_time_min,
      published_at,
      cover_image_url,
      rubrics ( title, slug ),
      profiles ( full_name, academic_title )
    `,
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('fetchPublishedArticles', error);
    return [];
  }

  return data ?? [];
}
