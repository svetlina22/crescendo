import { isSupabaseConfigured, supabaseRest, supabaseRestAuth } from '../config/supabase.js';

const ARTICLE_SELECT =
  'id,title,slug,summary,content,status,published_at,created_at,updated_at,author_id,rubric_id,rubrics(id,title,slug),profiles(full_name,academic_title,role)';

/**
 * @param {string} title
 */
export function slugifyTitle(title) {
  const base = String(title ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  const fallback = base || 'article';
  return `${fallback}-${Date.now().toString(36)}`;
}

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
 * Author: own articles only. Admin: all articles.
 * @param {{ userId: string, accessToken: string, isAdmin?: boolean }} opts
 */
export async function fetchPanelArticles({ userId, accessToken, isAdmin = false }) {
  if (!isSupabaseConfigured() || !accessToken || !userId) return [];

  try {
    const params = new URLSearchParams({
      select: ARTICLE_SELECT,
      order: 'updated_at.desc',
    });

    if (!isAdmin) {
      params.set('author_id', `eq.${userId}`);
    }

    const data = await supabaseRestAuth(`/rest/v1/articles?${params}`, accessToken);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('fetchPanelArticles', error);
    return [];
  }
}

/** @deprecated use fetchPanelArticles */
export async function fetchMyArticles(userId, accessToken) {
  return fetchPanelArticles({ userId, accessToken, isAdmin: false });
}

/**
 * @param {string} accessToken
 */
export async function fetchRubrics(accessToken) {
  if (!isSupabaseConfigured() || !accessToken) return [];

  try {
    const params = new URLSearchParams({
      select: 'id,title,slug',
      order: 'title.asc',
    });
    const data = await supabaseRestAuth(`/rest/v1/rubrics?${params}`, accessToken);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('fetchRubrics', error);
    return [];
  }
}

/**
 * @param {string} accessToken
 * @param {object} payload
 */
export async function createArticle(accessToken, payload) {
  const data = await supabaseRestAuth('/rest/v1/articles', accessToken, {
    method: 'POST',
    body: payload,
    prefer: 'return=minimal',
    timeoutMs: 25000,
  });
  return Array.isArray(data) ? data[0] : data;
}

/**
 * @param {string} accessToken
 * @param {string} articleId
 * @param {object} payload
 */
export async function updateArticle(accessToken, articleId, payload) {
  const data = await supabaseRestAuth(
    `/rest/v1/articles?id=eq.${encodeURIComponent(articleId)}`,
    accessToken,
    { method: 'PATCH', body: payload, prefer: 'return=minimal', timeoutMs: 25000 },
  );
  return Array.isArray(data) ? data[0] : data;
}

/**
 * @param {string} accessToken
 * @param {string} articleId
 */
export async function deleteArticle(accessToken, articleId) {
  await supabaseRestAuth(
    `/rest/v1/articles?id=eq.${encodeURIComponent(articleId)}`,
    accessToken,
    { method: 'DELETE', prefer: 'return=minimal', timeoutMs: 25000 },
  );
}

/**
 * @param {string} accessToken
 * @param {string} articleId
 * @param {'published' | 'draft' | 'pending'} status
 */
export async function setArticleStatus(accessToken, articleId, status) {
  /** @type {Record<string, unknown>} */
  const payload = { status };

  if (status === 'published') {
    payload.published_at = new Date().toISOString();
  } else if (status === 'draft' || status === 'pending') {
    payload.published_at = null;
  }

  return updateArticle(accessToken, articleId, payload);
}
