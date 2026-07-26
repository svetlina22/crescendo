import { fetchPublishedArticleBySlug, normalizeTags } from '../services/articles.js';
import { RUBRICS } from '../data/rubrics.js';
import { getArticleImage } from '../data/visuals.js';
import { renderTagBadges } from '../components/TagBadges.js';
import { applyPageSeo, setArticleJsonLd } from '../utils/seo.js';
import { formatArticleBodyHtml } from '../components/ArticleEditor.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
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

function rubricPath(slug) {
  const match = RUBRICS.find((r) => r.slug === slug);
  return match?.path ?? '/index.html';
}

/** Plain text → paragraphs, or Quill HTML as trusted markup. */
function formatContent(content) {
  return formatArticleBodyHtml(content);
}

function notFoundHtml(slug) {
  return `
    <section class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <h1 class="h3 mb-2">Статията не е намерена</h1>
          <p class="text-secondary mb-4">
            ${
              slug
                ? `Няма публикувана статия с адрес <code>${escapeHtml(slug)}</code>.`
                : 'Липсва параметър за адреса в уеб пътя.'
            }
          </p>
          <a href="/index.html" class="btn btn-crescendo">Към началото</a>
        </div>
      </div>
    </section>
  `;
}

/**
 * @param {{ path?: string }} [_ctx]
 */
export async function renderArticlePage(_ctx = {}) {
  const params = new URLSearchParams(window.location.search);
  const slug = (params.get('slug') || '').trim();

  if (!slug) {
    applyPageSeo({
      title: 'Статията не е намерена',
      description: 'Заявената статия не е намерена в Crescendo.',
      path: '/article.html',
      robots: 'noindex, follow',
    });
    return notFoundHtml('');
  }

  const article = await fetchPublishedArticleBySlug(slug);

  if (!article) {
    applyPageSeo({
      title: 'Статията не е намерена',
      description: 'Заявената статия не е намерена в Crescendo.',
      path: `/article.html?slug=${encodeURIComponent(slug)}`,
      robots: 'noindex, follow',
    });
    return notFoundHtml(slug);
  }

  const pagePath = `/article.html?slug=${encodeURIComponent(article.slug)}`;
  const cover = getArticleImage(article);
  applyPageSeo({
    title: article.title,
    description: article.summary || `${article.title} — статия в Crescendo.`,
    path: pagePath,
    image: cover,
    type: 'article',
    keywords: [
      'музикално образование',
      'Crescendo',
      article.rubrics?.title,
      ...(Array.isArray(article.tags) ? article.tags : []),
    ]
      .filter(Boolean)
      .join(', '),
  });
  setArticleJsonLd(article, pagePath);

  const rubric = article.rubrics;
  const author = article.profiles;
  const authorLabel = [author?.academic_title, author?.full_name]
    .filter(Boolean)
    .join(' ');
  const backHref = rubricPath(rubric?.slug);
  const tags = normalizeTags(article.tags);
  const tagsUnderTitle = renderTagBadges(tags, { className: 'd-flex flex-wrap gap-2 mb-4' });

  return `
    <article class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <nav aria-label="Навигационна пътека" class="mb-3">
            <ol class="breadcrumb mb-0">
              <li class="breadcrumb-item"><a href="/index.html">Начало</a></li>
              ${
                rubric?.title
                  ? `<li class="breadcrumb-item"><a href="${backHref}">${escapeHtml(rubric.title)}</a></li>`
                  : ''
              }
              <li class="breadcrumb-item active" aria-current="page">Статия</li>
            </ol>
          </nav>

          <h1 class="display-6 mb-3">${escapeHtml(article.title)}</h1>

          ${tagsUnderTitle}

          <div class="d-flex flex-wrap gap-3 small text-secondary mb-4">
            ${
              authorLabel
                ? `<span><i class="bi bi-person" aria-hidden="true"></i> ${escapeHtml(authorLabel)}</span>`
                : ''
            }
            ${
              article.published_at
                ? `<span><i class="bi bi-calendar3" aria-hidden="true"></i> ${escapeHtml(formatPublishedAt(article.published_at))}</span>`
                : ''
            }
            ${
              article.reading_time_min
                ? `<span><i class="bi bi-hourglass-split" aria-hidden="true"></i> ${article.reading_time_min} мин четене</span>`
                : ''
            }
          </div>

          ${
            article.summary
              ? `<p class="lead text-secondary border-start border-3 ps-3 mb-4">${escapeHtml(article.summary)}</p>`
              : ''
          }

          ${
            article.file_url
              ? `<div class="mb-4">
                  <a
                    href="${escapeHtml(article.file_url)}"
                    class="btn btn-lg btn-crescendo resource-download-btn w-100 w-md-auto"
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i class="bi bi-download me-2" aria-hidden="true"></i>
                    Изтегли учебния ресурс (PDF)
                  </a>
                </div>`
              : ''
          }

          ${
            article.cover_image_url || getArticleImage(article)
              ? `<img src="${escapeHtml(getArticleImage(article))}" alt="" class="img-fluid rounded mb-4 w-100 article-hero-img" />`
              : ''
          }

          <div class="article-body fs-5 lh-lg">
            ${formatContent(article.content)}
          </div>

          <hr class="my-5" />
          <a href="${backHref}" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
            ${rubric?.title ? `Към „${escapeHtml(rubric.title)}“` : 'Назад'}
          </a>
        </div>
      </div>
    </article>
  `;
}
