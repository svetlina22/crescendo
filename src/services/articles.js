import { isSupabaseConfigured, supabaseRest, supabaseRestAuth } from '../config/supabase.js';

const PUBLIC_ARTICLE_LIST_SELECT =
  'id,title,slug,summary,reading_time_min,published_at,cover_image_url,rubrics(title,slug),profiles(full_name,academic_title),tags(name,slug)';

const PUBLIC_ARTICLE_DETAIL_SELECT =
  'id,title,slug,summary,content,reading_time_min,published_at,cover_image_url,rubrics(id,title,slug),profiles(full_name,academic_title),tags(name,slug)';

const ARTICLE_SELECT =
  'id,title,slug,summary,content,status,published_at,created_at,updated_at,author_id,rubric_id,rubrics(id,title,slug),profiles(full_name,academic_title,role),tags(id,name,slug)';

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
 * Stable slug for tags (no timestamp).
 * @param {string} name
 */
export function slugifyTag(name) {
  const base = String(name ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return base || 'tag';
}

/**
 * @param {string} slug
 */
export function tagFilterHref(slug) {
  if (!slug) return '/index.html';
  return `/index.html?tag=${encodeURIComponent(slug)}`;
}

/**
 * Normalize tags from PostgREST embed (array or nested).
 * @param {unknown} raw
 * @returns {{ id?: string, name: string, slug: string }[]}
 */
export function normalizeTags(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((t) => {
      if (!t || typeof t !== 'object') return null;
      const row = /** @type {{ id?: string, name?: string, slug?: string }} */ (t);
      if (!row.name || !row.slug) return null;
      return { id: row.id, name: row.name, slug: row.slug };
    })
    .filter(Boolean);
}

/**
 * @param {number} [limit=8]
 * @returns {Promise<Array>}
 */
export async function fetchPublishedArticles(limit = 8) {
  return searchPublishedArticles({ limit });
}

/**
 * Public article search / tag filter.
 * Tags live in M2M (`tags` ↔ `article_tags`), so filtering uses an inner embed
 * (PostgREST equivalent of array `.contains` on a tags column).
 *
 * @param {{ limit?: number, tag?: string, q?: string }} [opts]
 * @returns {Promise<Array>}
 */
export async function searchPublishedArticles({ limit = 24, tag = '', q = '' } = {}) {
  if (!isSupabaseConfigured()) return [];

  const tagSlug = String(tag ?? '').trim();
  const query = String(q ?? '').trim();

  try {
    const params = new URLSearchParams({
      status: 'eq.published',
      order: 'published_at.desc',
      limit: String(limit),
    });

    if (tagSlug) {
      params.set(
        'select',
        'id,title,slug,summary,reading_time_min,published_at,cover_image_url,rubrics(title,slug),profiles(full_name,academic_title),tags!inner(name,slug)',
      );
      params.set('tags.slug', `eq.${tagSlug}`);
    } else {
      params.set('select', PUBLIC_ARTICLE_LIST_SELECT);
    }

    if (query) {
      // Title / summary text search
      params.set('or', `(title.ilike.*${query}*,summary.ilike.*${query}*)`);
    }

    const data = await supabaseRest(`/rest/v1/articles?${params}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('searchPublishedArticles', error);
    return [];
  }
}

/**
 * @returns {Promise<{ name: string, slug: string }[]>}
 */
export async function fetchPublicTags() {
  if (!isSupabaseConfigured()) return [];

  try {
    const params = new URLSearchParams({
      select: 'name,slug',
      order: 'name.asc',
    });
    const data = await supabaseRest(`/rest/v1/tags?${params}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('fetchPublicTags', error);
    return [];
  }
}

/**
 * Most-used tags on published articles (for tag cloud).
 * @param {number} [limit=12]
 * @returns {Promise<{ name: string, slug: string, uses: number }[]>}
 */
export async function fetchPopularTags(limit = 12) {
  if (!isSupabaseConfigured()) return [];

  try {
    const params = new URLSearchParams({
      select: 'name,slug,article_tags(count)',
      order: 'name.asc',
    });
    const data = await supabaseRest(`/rest/v1/tags?${params}`);
    if (!Array.isArray(data)) return [];

    return data
      .map((row) => {
        const countRow = Array.isArray(row.article_tags) ? row.article_tags[0] : null;
        const uses = Number(countRow?.count ?? 0);
        return { name: row.name, slug: row.slug, uses };
      })
      .filter((t) => t.slug && t.uses > 0)
      .sort((a, b) => b.uses - a.uses || a.name.localeCompare(b.name, 'bg'))
      .slice(0, limit);
  } catch (error) {
    console.error('fetchPopularTags', error);
    return fetchPublicTags().then((tags) =>
      tags.slice(0, limit).map((t) => ({ ...t, uses: 0 })),
    );
  }
}

/**
 * @param {string} slugOrName
 * @param {{ name: string, slug: string }[]} [tags]
 */
export function resolveTag(slugOrName, tags = []) {
  const needle = String(slugOrName ?? '')
    .trim()
    .toLowerCase()
    .replace(/^#/, '');
  if (!needle) return null;

  return (
    tags.find(
      (t) => t.slug.toLowerCase() === needle || t.name.toLowerCase() === needle,
    ) ?? null
  );
}

/**
 * @param {string} slug
 * @returns {Promise<object | null>}
 */
export async function fetchPublishedArticleBySlug(slug) {
  if (!isSupabaseConfigured() || !slug) return null;

  try {
    const params = new URLSearchParams({
      select: PUBLIC_ARTICLE_DETAIL_SELECT,
      slug: `eq.${slug}`,
      status: 'eq.published',
      limit: '1',
    });

    const data = await supabaseRest(`/rest/v1/articles?${params}`);
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('fetchPublishedArticleBySlug', error);
    return null;
  }
}

/**
 * @param {string} rubricSlug
 * @param {number} [limit=20]
 * @returns {Promise<Array>}
 */
export async function fetchPublishedArticlesByRubric(rubricSlug, limit = 20) {
  if (!isSupabaseConfigured() || !rubricSlug) return [];

  try {
    const params = new URLSearchParams({
      select:
        'id,title,slug,summary,reading_time_min,published_at,cover_image_url,rubrics!inner(title,slug),profiles(full_name,academic_title),tags(name,slug)',
      status: 'eq.published',
      order: 'published_at.desc',
      limit: String(limit),
    });
    params.set('rubrics.slug', `eq.${rubricSlug}`);

    const data = await supabaseRest(`/rest/v1/articles?${params}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('fetchPublishedArticlesByRubric', error);
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
 * All tags for the article editor (id, name, slug).
 * @param {string} accessToken
 * @returns {Promise<{ id: string, name: string, slug: string }[]>}
 */
export async function fetchPanelTags(accessToken) {
  if (!isSupabaseConfigured() || !accessToken) return [];

  try {
    const params = new URLSearchParams({
      select: 'id,name,slug',
      order: 'name.asc',
    });
    const data = await supabaseRestAuth(`/rest/v1/tags?${params}`, accessToken);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('fetchPanelTags', error);
    return [];
  }
}

/**
 * @param {string} accessToken
 * @param {{ name: string, slug: string }} payload
 */
export async function createTag(accessToken, payload) {
  const data = await supabaseRestAuth('/rest/v1/tags', accessToken, {
    method: 'POST',
    body: payload,
    prefer: 'return=representation',
    timeoutMs: 15000,
  });
  return Array.isArray(data) ? data[0] : data;
}

/**
 * Find existing tags by slug/name or create missing ones.
 * @param {string} accessToken
 * @param {{ name: string, slug: string }[]} draftTags
 * @returns {Promise<string[]>} tag ids
 */
export async function resolveOrCreateTagIds(accessToken, draftTags = []) {
  if (!draftTags.length) return [];

  const existing = await fetchPanelTags(accessToken);
  const ids = [];

  for (const draft of draftTags) {
    const name = String(draft.name ?? '').trim();
    const slug = slugifyTag(draft.slug || name);
    if (!name || !slug) continue;

    const found = existing.find(
      (t) =>
        t.slug.toLowerCase() === slug.toLowerCase() ||
        t.name.toLowerCase() === name.toLowerCase(),
    );

    if (found?.id) {
      ids.push(found.id);
      continue;
    }

    try {
      const created = await createTag(accessToken, { name, slug });
      if (created?.id) {
        existing.push(created);
        ids.push(created.id);
      }
    } catch (error) {
      // Race: another request created the same slug — fetch again
      const refreshed = await fetchPanelTags(accessToken);
      const again = refreshed.find((t) => t.slug === slug);
      if (again?.id) {
        existing.push(again);
        ids.push(again.id);
      } else {
        throw error;
      }
    }
  }

  return [...new Set(ids)];
}

/**
 * Replace article ↔ tag links with the given tag ids.
 * @param {string} accessToken
 * @param {string} articleId
 * @param {string[]} tagIds
 */
export async function setArticleTags(accessToken, articleId, tagIds = []) {
  const uniqueIds = [...new Set(tagIds.filter(Boolean))];

  const current = await supabaseRestAuth(
    `/rest/v1/article_tags?article_id=eq.${encodeURIComponent(articleId)}&select=tag_id`,
    accessToken,
  );
  const currentIds = Array.isArray(current)
    ? current.map((row) => row.tag_id).filter(Boolean)
    : [];

  const toAdd = uniqueIds.filter((id) => !currentIds.includes(id));
  const toRemove = currentIds.filter((id) => !uniqueIds.includes(id));

  if (toRemove.length > 0) {
    const inList = toRemove.map(encodeURIComponent).join(',');
    await supabaseRestAuth(
      `/rest/v1/article_tags?article_id=eq.${encodeURIComponent(articleId)}&tag_id=in.(${inList})`,
      accessToken,
      { method: 'DELETE', prefer: 'return=minimal', timeoutMs: 15000 },
    );
  }

  if (toAdd.length > 0) {
    await supabaseRestAuth('/rest/v1/article_tags', accessToken, {
      method: 'POST',
      body: toAdd.map((tag_id) => ({ article_id: articleId, tag_id })),
      prefer: 'return=minimal',
      timeoutMs: 15000,
    });
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
    prefer: 'return=representation',
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
