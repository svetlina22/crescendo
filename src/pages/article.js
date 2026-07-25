import { fetchPublishedArticleBySlug, normalizeTags } from '../services/articles.js';
import { RUBRICS } from '../data/rubrics.js';
import { renderTagBadges } from '../components/TagBadges.js';

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

/** Plain text → paragraphs (escape + split on blank lines). */
function formatContent(content) {
  const text = String(content ?? '').trim();
  if (!text) {
    return '<p class="text-secondary">Няма съдържание.</p>';
  }

  return text
    .split(/\n{2,}/)
    .map((block) => {
      const lines = escapeHtml(block).replaceAll('\n', '<br />');
      return `<p class="mb-4">${lines}</p>`;
    })
    .join('');
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
                ? `Няма публикувана статия със слуг <code>${escapeHtml(slug)}</code>.`
                : 'Липсва параметър <code>slug</code> в адреса.'
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
    document.title = 'Статията не е намерена · Crescendo';
    return notFoundHtml('');
  }

  const article = await fetchPublishedArticleBySlug(slug);

  if (!article) {
    document.title = 'Статията не е намерена · Crescendo';
    return notFoundHtml(slug);
  }

  document.title = `${article.title} · Crescendo`;

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
          <nav aria-label="breadcrumb" class="mb-3">
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

          ${
            rubric?.title
              ? `<a href="${backHref}" class="badge text-bg-light text-decoration-none mb-3">${escapeHtml(rubric.title)}</a>`
              : ''
          }

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
            article.cover_image_url
              ? `<img src="${escapeHtml(article.cover_image_url)}" alt="" class="img-fluid rounded mb-4 w-100" style="max-height: 28rem; object-fit: cover" />`
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
