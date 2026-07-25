import { fetchPublishedArticlesByRubric } from '../services/articles.js';
import { renderArticlesFeed } from './ArticlesFeed.js';

/**
 * Зарежда статиите в #articlesList (HTML-first рубрични страници).
 * @param {string} slug
 * @param {string} [emptyMessage]
 */
export async function initRubricArticles(slug, emptyMessage) {
  const listEl = document.getElementById('articlesList');
  if (!listEl) return;

  listEl.innerHTML = `
    <div class="text-center text-secondary py-4">
      <div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
      <span class="ms-2">Зареждане на статии…</span>
    </div>
  `;

  try {
    const articles = await fetchPublishedArticlesByRubric(slug);
    listEl.innerHTML =
      articles.length > 0
        ? renderArticlesFeed(articles, {
            heading: 'Статии',
            showRubricBadge: false,
            featured: true,
          })
        : `<p class="text-secondary mb-0">${emptyMessage}</p>`;
  } catch (error) {
    console.error('initRubricArticles', error);
    listEl.innerHTML = `<p class="text-secondary mb-0">Статиите не можаха да се заредят. Опитайте да презаредите страницата.</p>`;
  }
}
