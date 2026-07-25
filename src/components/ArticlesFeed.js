import { RUBRICS, getRubricAccent } from '../data/rubrics.js';
import { getArticleImage } from '../data/visuals.js';
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
  return RUBRICS.find((r) => r.slug === slug)?.path ?? '/index.html';
}

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
  return date.toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' });
}

function renderFeatured(article) {
  const rubric = article.rubrics;
  const href = articleHref(article.slug, rubric?.slug);
  const img = escapeHtml(getArticleImage(article));
  const accent = getRubricAccent(rubric?.slug);
  const author = article.profiles;
  const authorLabel = [author?.academic_title, author?.full_name].filter(Boolean).join(' ');

  return `
    <a href="${href}" class="article-featured">
      <div class="article-featured__media" style="background-image:url('${img}')"></div>
      <div class="article-featured__body">
        ${rubric?.title ? `<span class="badge-cat badge-cat--${accent} mb-2">${escapeHtml(rubric.title)}</span>` : ''}
        <h3 class="h3 mb-2">${escapeHtml(article.title)}</h3>
        ${article.summary ? `<p class="text-secondary mb-3">${escapeHtml(article.summary)}</p>` : ''}
        <p class="article-card__meta mb-0">
          ${authorLabel ? `${escapeHtml(authorLabel)} · ` : ''}
          ${article.published_at ? escapeHtml(formatPublishedAt(article.published_at)) : ''}
        </p>
      </div>
    </a>`;
}

function renderCard(article, showRubricBadge) {
  const rubric = article.rubrics;
  const href = articleHref(article.slug, rubric?.slug);
  const rubricHref = rubricPath(rubric?.slug);
  const img = escapeHtml(getArticleImage(article));
  const accent = getRubricAccent(rubric?.slug);
  const author = article.profiles;
  const authorLabel = [author?.academic_title, author?.full_name].filter(Boolean).join(' ');
  const tagsHtml = renderTagBadges(normalizeTags(article.tags), {
    className: 'd-flex flex-wrap gap-1 mt-2',
  });

  return `
    <div class="col-md-6">
      <article class="article-card">
        <a href="${href}" class="article-card__media" style="background-image:url('${img}')">
          ${showRubricBadge && rubric?.title
            ? `<span class="article-card__media-badge badge-cat badge-cat--${accent}">${escapeHtml(rubric.title)}</span>`
            : ''}
        </a>
        <div class="article-card__body">
          <h3 class="article-card__title"><a href="${href}">${escapeHtml(article.title)}</a></h3>
          ${article.summary ? `<p class="small text-secondary mb-2">${escapeHtml(article.summary.slice(0, 120))}${article.summary.length > 120 ? '…' : ''}</p>` : ''}
          <p class="article-card__meta mb-0">
            ${authorLabel ? escapeHtml(authorLabel) : ''}
            ${article.reading_time_min ? ` · ${article.reading_time_min} мин` : ''}
          </p>
          ${tagsHtml}
        </div>
      </article>
    </div>`;
}

/**
 * @param {Array} articles
 * @param {{ heading?: string, showRubricBadge?: boolean, emptyMessage?: string, featured?: boolean }} [options]
 */
export function renderArticlesFeed(articles = [], options = {}) {
  const {
    heading = 'Последни публикации',
    showRubricBadge = true,
    emptyMessage = 'Все още няма публикувани материали.',
    featured = true,
  } = options;

  if (articles.length === 0) {
    return `
      <div class="feed-header"><h2>${escapeHtml(heading)}</h2></div>
      <p class="text-secondary">${escapeHtml(emptyMessage)}</p>`;
  }

  const [first, ...rest] = articles;
  const featuredHtml = featured && rest.length >= 0 ? renderFeatured(first) : '';
  const gridArticles = featured && rest.length > 0 ? rest : featured ? [] : articles;
  const gridHtml =
    gridArticles.length > 0
      ? `<div class="row g-3">${gridArticles.map((a) => renderCard(a, showRubricBadge)).join('')}</div>`
      : '';

  return `
    <div class="feed-header"><h2>${escapeHtml(heading)}</h2></div>
    ${featuredHtml}
    ${gridHtml}`;
}
