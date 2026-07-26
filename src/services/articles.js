import { isSupabaseConfigured, supabaseRest, supabaseRestAuth } from '../config/supabase.js';

const PUBLIC_ARTICLE_LIST_SELECT =
  'id,title,slug,summary,reading_time_min,published_at,cover_image_url,file_url,tags,rubrics(title,slug),profiles(full_name,academic_title)';

const PUBLIC_ARTICLE_DETAIL_SELECT =
  'id,title,slug,summary,content,reading_time_min,published_at,cover_image_url,file_url,tags,rubrics(id,title,slug),profiles(full_name,academic_title)';

const ARTICLE_SELECT =
  'id,title,slug,summary,content,cover_image_url,file_url,tags,status,published_at,created_at,updated_at,author_id,rubric_id,rubrics(id,title,slug),profiles(full_name,academic_title,role)';

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
 * Stable slug helper (article paths).
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
 * Parse comma-separated tags input → unique trimmed strings.
 * @param {string} raw
 * @returns {string[]}
 */
export function parseTagsInput(raw) {
  const seen = new Set();
  /** @type {string[]} */
  const out = [];
  for (const part of String(raw ?? '').split(',')) {
    const tag = part.trim().replace(/^#/, '');
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
  }
  return out;
}

/** @deprecated Prefer parseTagsInput — alias for tests / docs */
export const stringToTagsArray = parseTagsInput;

/**
 * PostgREST `tags=cs.{…}` filter (array contains / `.contains('tags', [tag])`).
 * @param {string} tag
 * @returns {string | null}
 */
export function tagsContainsFilter(tag) {
  const value = String(tag ?? '').trim();
  if (!value) return null;
  if (/[",{}\\\s]/.test(value)) {
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `cs.{"${escaped}"}`;
  }
  return `cs.{${value}}`;
}

/**
 * @param {string} tag
 */
export function tagFilterHref(tag) {
  if (!tag) return '/index.html';
  return `/index.html?tag=${encodeURIComponent(tag)}`;
}

/**
 * Normalize `articles.tags` TEXT[] for badges/UI.
 * @param {unknown} raw
 * @returns {{ name: string, slug: string }[]}
 */
export function normalizeTags(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((t) => {
      if (typeof t === 'string') {
        const name = t.trim();
        if (!name) return null;
        return { name, slug: name };
      }
      if (!t || typeof t !== 'object') return null;
      const row = /** @type {{ name?: string, slug?: string }} */ (t);
      const name = String(row.name || row.slug || '').trim();
      if (!name) return null;
      return { name, slug: String(row.slug || name).trim() || name };
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
 * @param {string} raw
 */
function sanitizeSearchTerm(raw) {
  return String(raw ?? '')
    .trim()
    .replace(/[%*(),.\\:]/g, ' ')
    .replace(/"/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

/**
 * @param {string} term
 */
function ilikePattern(term) {
  const pattern = `*${term}*`;
  if (/[\s]/.test(term)) return `"${pattern}"`;
  return pattern;
}

/**
 * @param {string} columnsCsv
 * @param {string} term
 */
function orIlike(columnsCsv, term) {
  const pattern = ilikePattern(term);
  return `(${columnsCsv
    .split(',')
    .map((col) => `${col.trim()}.ilike.${pattern}`)
    .join(',')})`;
}

/**
 * @param {Array} lists
 * @param {number} limit
 */
function mergeArticlesById(lists, limit) {
  /** @type {Map<string, object>} */
  const byId = new Map();
  for (const list of lists) {
    for (const article of list) {
      if (article?.id) byId.set(article.id, article);
    }
  }
  return Array.from(byId.values())
    .sort((a, b) => {
      const ta = a.published_at ? new Date(a.published_at).getTime() : 0;
      const tb = b.published_at ? new Date(b.published_at).getTime() : 0;
      return tb - ta;
    })
    .slice(0, limit);
}

const LIST_SELECT_RUBRICS_INNER =
  'id,title,slug,summary,reading_time_min,published_at,cover_image_url,file_url,tags,rubrics!inner(title,slug),profiles(full_name,academic_title)';

/**
 * @param {URLSearchParams} params
 * @param {string} tag
 */
function applyTagContains(params, tag) {
  const filter = tagsContainsFilter(tag);
  if (filter) params.set('tags', filter);
}

/**
 * Public article search / tag filter.
 * - `tag`: exact membership via `tags=cs.{tag}` (contains)
 * - `q`: ilike on title/summary/content + match in tags TEXT[] + rubrics
 *
 * @param {{ limit?: number, tag?: string, q?: string }} [opts]
 * @returns {Promise<Array>}
 */
export async function searchPublishedArticles({ limit = 24, tag = '', q = '' } = {}) {
  if (!isSupabaseConfigured()) return [];

  const tagFilter = String(tag ?? '').trim();
  const query = sanitizeSearchTerm(q);

  try {
    if (!query) {
      const params = new URLSearchParams({
        select: PUBLIC_ARTICLE_LIST_SELECT,
        status: 'eq.published',
        order: 'published_at.desc',
        limit: String(limit),
      });
      if (tagFilter) applyTagContains(params, tagFilter);

      const data = await supabaseRest(`/rest/v1/articles?${params}`);
      return Array.isArray(data) ? data : [];
    }

    const fetchLimit = String(Math.min(Math.max(limit * 2, limit), 80));
    const qLower = query.toLowerCase();

    const textParams = new URLSearchParams({
      select: PUBLIC_ARTICLE_LIST_SELECT,
      status: 'eq.published',
      order: 'published_at.desc',
      limit: fetchLimit,
      or: orIlike('title,summary,content', query),
    });
    if (tagFilter) applyTagContains(textParams, tagFilter);

    const rubricParams = new URLSearchParams({
      select: LIST_SELECT_RUBRICS_INNER,
      status: 'eq.published',
      order: 'published_at.desc',
      limit: fetchLimit,
    });
    rubricParams.set('rubrics.or', orIlike('title,slug', query));
    if (tagFilter) applyTagContains(rubricParams, tagFilter);

    const exactTagParams = new URLSearchParams({
      select: PUBLIC_ARTICLE_LIST_SELECT,
      status: 'eq.published',
      order: 'published_at.desc',
      limit: fetchLimit,
    });
    // Prefer active tag filter; otherwise match query as exact tag membership
    applyTagContains(exactTagParams, tagFilter || query);

    const tagScanParams = new URLSearchParams({
      select: PUBLIC_ARTICLE_LIST_SELECT,
      status: 'eq.published',
      order: 'published_at.desc',
      limit: '120',
      tags: 'not.is.null',
    });
    if (tagFilter) applyTagContains(tagScanParams, tagFilter);

    const [textHits, rubricHits, exactTagHits, tagScan] = await Promise.all([
      supabaseRest(`/rest/v1/articles?${textParams}`),
      supabaseRest(`/rest/v1/articles?${rubricParams}`),
      supabaseRest(`/rest/v1/articles?${exactTagParams}`).catch(() => []),
      supabaseRest(`/rest/v1/articles?${tagScanParams}`),
    ]);

    const partialTagHits = (Array.isArray(tagScan) ? tagScan : []).filter((article) =>
      (Array.isArray(article.tags) ? article.tags : []).some((t) =>
        String(t).toLowerCase().includes(qLower),
      ),
    );

    return mergeArticlesById(
      [
        Array.isArray(textHits) ? textHits : [],
        Array.isArray(rubricHits) ? rubricHits : [],
        Array.isArray(exactTagHits) ? exactTagHits : [],
        partialTagHits,
      ],
      limit,
    );
  } catch (error) {
    console.error('searchPublishedArticles', error);
    return [];
  }
}

/**
 * @returns {Promise<{ name: string, slug: string, uses: number }[]>}
 */
export async function fetchPublicTags() {
  return fetchPopularTags(100);
}

/**
 * Most-used tags from published articles' `tags` arrays.
 * @param {number} [limit=12]
 * @returns {Promise<{ name: string, slug: string, uses: number }[]>}
 */
export async function fetchPopularTags(limit = 12) {
  if (!isSupabaseConfigured()) return [];

  try {
    const params = new URLSearchParams({
      select: 'tags',
      status: 'eq.published',
      tags: 'not.is.null',
      limit: '200',
    });
    const data = await supabaseRest(`/rest/v1/articles?${params}`);
    if (!Array.isArray(data)) return [];

    /** @type {Map<string, { name: string, uses: number }>} */
    const counts = new Map();
    for (const row of data) {
      for (const raw of Array.isArray(row.tags) ? row.tags : []) {
        const name = String(raw ?? '').trim();
        if (!name) continue;
        const key = name.toLowerCase();
        const prev = counts.get(key);
        if (prev) prev.uses += 1;
        else counts.set(key, { name, uses: 1 });
      }
    }

    return Array.from(counts.values())
      .sort((a, b) => b.uses - a.uses || a.name.localeCompare(b.name, 'bg'))
      .slice(0, limit)
      .map((t) => ({ name: t.name, slug: t.name, uses: t.uses }));
  } catch (error) {
    console.error('fetchPopularTags', error);
    return [];
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

  const found = tags.find(
    (t) => t.slug.toLowerCase() === needle || t.name.toLowerCase() === needle,
  );
  if (found) return found;
  const raw = String(slugOrName ?? '').trim().replace(/^#/, '');
  return raw ? { name: raw, slug: raw } : null;
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
        'id,title,slug,summary,reading_time_min,published_at,cover_image_url,file_url,tags,rubrics!inner(title,slug),profiles(full_name,academic_title)',
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
