/**
 * Pure helpers for article keyword matching (unit-tested; used by search UX docs).
 */

/**
 * @param {object} article
 * @param {string} keyword
 */
export function articleMatchesKeyword(article, keyword) {
  const q = String(keyword ?? '')
    .trim()
    .toLowerCase();
  if (!q) return true;

  const fields = [article?.title, article?.summary, article?.content];
  if (fields.some((f) => String(f ?? '').toLowerCase().includes(q))) return true;

  const tags = Array.isArray(article?.tags) ? article.tags : [];
  if (tags.some((t) => String(t).toLowerCase().includes(q))) return true;

  const rubric = article?.rubrics;
  if (
    String(rubric?.title ?? '')
      .toLowerCase()
      .includes(q) ||
    String(rubric?.slug ?? '')
      .toLowerCase()
      .includes(q)
  ) {
    return true;
  }

  return false;
}

/**
 * @param {object[]} articles
 * @param {string} keyword
 */
export function filterArticlesByKeyword(articles = [], keyword = '') {
  if (!Array.isArray(articles)) return [];
  return articles.filter((a) => articleMatchesKeyword(a, keyword));
}
