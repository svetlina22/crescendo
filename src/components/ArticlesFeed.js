import { RUBRICS } from '../data/rubrics.js';
import { renderTagBadges } from './TagBadges.js';
import { normalizeTags } from '../services/articles.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function rubricPath(slug) {
  const match = RUBRICS.find((r) => r.slug === slug);
  return match?.path ?? '/index.html';
}

/**
 * Public article URL. Path shape mirrors /crescendo/{rubric}/{slug}.
 * @param {string} slug
 * @param {string} [rubricSlug]
 */
export function articleHref(slug, rubricSlug = '') {
  if (!slug) return '/index.html';
  const params = new URLSearchParams({ slug });
  if (rubricSlug) params.set('rubric', rubricSlug);
  return `/article.html?${params}`;
}

function formatPublishedAt(isoDate) {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('bg-BG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * @param {Array} articles
 * @param {{ heading?: string, showRubricBadge?: boolean, emptyMessage?: string }} [options]
 */
export function renderArticlesFeed(articles = [], options = {}) {
  const {
    heading = 'Последни статии',
    showRubricBadge = true,
    emptyMessage = 'Все още няма публикувани материали в тази секция.',
  } = options;

  if (articles.length === 0) {
    return `
      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <h2 class="h5 mb-2">${escapeHtml(heading)}</h2>
          <p class="text-secondary mb-0">${escapeHtml(emptyMessage)}</p>
        </div>
      </div>
    `;
  }

  const items = articles
    .map((article) => {
      const rubric = article.rubrics;
      const author = article.profiles;
      const authorLabel = [author?.academic_title, author?.full_name]
        .filter(Boolean)
        .join(' ');
      const href = articleHref(article.slug, rubric?.slug);
      const rubricHref = rubricPath(rubric?.slug);
      const tagsHtml = renderTagBadges(normalizeTags(article.tags), {
        className: 'd-flex flex-wrap gap-2 mt-3',
      });

      return `
        <article class="card border-0 shadow-sm mb-3">
          <div class="card-body p-4">
            ${
              showRubricBadge && rubric?.title
                ? `<a href="${rubricHref}" class="badge text-bg-light text-decoration-none mb-2">${escapeHtml(rubric.title)}</a>`
                : ''
            }
            <h3 class="h5 mb-2">
              <a href="${href}" class="text-decoration-none text-reset">
                ${escapeHtml(article.title)}
              </a>
            </h3>
            ${
              article.summary
                ? `<p class="text-secondary mb-3">${escapeHtml(article.summary)}</p>`
                : ''
            }
            <div class="d-flex flex-wrap gap-3 small text-secondary">
              ${authorLabel ? `<span><i class="bi bi-person" aria-hidden="true"></i> ${escapeHtml(authorLabel)}</span>` : ''}
              ${
                article.published_at
                  ? `<span><i class="bi bi-calendar3" aria-hidden="true"></i> ${escapeHtml(formatPublishedAt(article.published_at))}</span>`
                  : ''
              }
              ${
                article.reading_time_min
                  ? `<span><i class="bi bi-hourglass-split" aria-hidden="true"></i> ${article.reading_time_min} мин</span>`
                  : ''
              }
            </div>
            ${tagsHtml}
          </div>
        </article>
      `;
    })
    .join('');

  return `
    <div class="d-flex justify-content-between align-items-end mb-3">
      <h2 class="h4 mb-0">${escapeHtml(heading)}</h2>
    </div>
    ${items}
  `;
}
