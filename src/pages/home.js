import { RUBRICS } from '../data/rubrics.js';
import {
  fetchPopularTags,
  fetchPublicTags,
  resolveTag,
  searchPublishedArticles,
} from '../services/articles.js';
import { fetchUpcomingEvents } from '../services/events.js';
import { renderArticlesFeed } from '../components/ArticlesFeed.js';
import { renderEventsSidebar } from '../components/EventsSidebar.js';
import {
  renderSearchWidget,
  renderTagCloudWidget,
} from '../components/HomeSidebar.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function readFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    tag: (params.get('tag') || '').trim(),
    q: (params.get('q') || '').trim(),
  };
}

function writeFiltersToUrl({ tag = '', q = '' }) {
  const params = new URLSearchParams();
  if (tag) params.set('tag', tag);
  if (q) params.set('q', q);
  const qs = params.toString();
  const next = qs ? `/index.html?${qs}` : '/index.html';
  window.history.replaceState({}, '', next);
}

function emptyMessageFor({ tag, q, tagLabel }) {
  if (tag) {
    return `Няма намерени статии за този таг${tagLabel ? ` (#${tagLabel})` : ''}.`;
  }
  if (q) {
    return `Няма намерени статии за „${q}“.`;
  }
  return 'Все още няма публикувани материали в тази секция.';
}

function renderActiveFilter({ tag, q, tagLabel }) {
  if (!tag && !q) return '';

  const parts = [];
  if (tag) {
    parts.push(`таг <strong>#${escapeHtml(tagLabel || tag)}</strong>`);
  }
  if (q) {
    parts.push(`търсене <strong>„${escapeHtml(q)}“</strong>`);
  }

  return `
    <div id="activeFilterBar" class="alert alert-secondary d-flex flex-wrap align-items-center justify-content-between gap-2 py-2 mb-3" role="status">
      <span>Филтрирано по: ${parts.join(' · ')}</span>
      <button type="button" class="btn btn-sm btn-outline-secondary" id="clearFilterBtn" aria-label="Изчисти филтъра">
        <i class="bi bi-x-lg" aria-hidden="true"></i> Изчисти
      </button>
    </div>
  `;
}

function feedHeading({ tag, q, tagLabel }) {
  if (tag) return `Статии с таг #${tagLabel || tag}`;
  if (q) return `Резултати за „${q}“`;
  return 'Последни статии';
}

/**
 * @param {{ path?: string }} [_ctx]
 */
export async function renderHomePage(_ctx = {}) {
  const { tag, q } = readFiltersFromUrl();

  let articles = [];
  let events = [];
  let popularTags = [];

  try {
    [articles, events, popularTags] = await Promise.all([
      searchPublishedArticles({ limit: tag || q ? 40 : 8, tag, q }),
      fetchUpcomingEvents(3),
      fetchPopularTags(12),
    ]);
  } catch (error) {
    console.error('renderHomePage fetch failed', error);
  }

  const matchedTag = resolveTag(tag, popularTags);
  const tagLabel = matchedTag?.slug || matchedTag?.name || tag;

  const rubricStrip = RUBRICS.map(
    (rubric) => `
      <a href="${rubric.path}" class="badge rounded-pill text-bg-light text-decoration-none px-3 py-2">
        <i class="bi ${rubric.icon} me-1" aria-hidden="true"></i>
        ${rubric.title}
      </a>
    `,
  ).join('');

  return `
    <section class="hero-crescendo py-4 py-lg-5">
      <div class="container">
        <div class="row align-items-center g-3">
          <div class="col-lg-8">
            <p class="text-uppercase small fw-semibold text-secondary mb-2">
              Музикално образование
            </p>
            <h1 class="display-5 mb-2">Crescendo</h1>
            <p class="lead text-secondary mb-0">
              Академична платформа за изследвания, политики и практики
              в музикалното образование.
            </p>
          </div>
          <div class="col-lg-4">
            <div class="d-flex flex-wrap gap-2 justify-content-lg-end">
              ${rubricStrip}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="container py-5">
      <div class="row g-4 align-items-start">
        <div class="col-lg-8">
          <div id="activeFilterWrap">
            ${renderActiveFilter({ tag, q, tagLabel })}
          </div>
          <div id="articlesFeed">
            ${renderArticlesFeed(articles, {
              heading: feedHeading({ tag, q, tagLabel }),
              emptyMessage: emptyMessageFor({ tag, q, tagLabel }),
            })}
          </div>
        </div>
        <div class="col-lg-4">
          <div class="home-sidebar-sticky">
            ${renderSearchWidget(q)}
            ${renderEventsSidebar(events)}
            <div id="tagCloudWrap">
              ${renderTagCloudWidget(popularTags, tag)}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export async function initHomePage() {
  const form = document.getElementById('articleSearchForm');
  const input = document.getElementById('articleSearchInput');
  const feedEl = document.getElementById('articlesFeed');
  const filterWrap = document.getElementById('activeFilterWrap');
  const tagCloudWrap = document.getElementById('tagCloudWrap');

  if (!feedEl) return;

  let tags = await fetchPublicTags();
  let popularTags = await fetchPopularTags(12);
  let debounceTimer = 0;

  async function applyFilters({ tag = '', q = '', pushUrl = true } = {}) {
    const matchedTag = resolveTag(tag, tags.length ? tags : popularTags);
    const tagSlug = matchedTag?.slug || tag;
    const tagLabel = matchedTag?.slug || matchedTag?.name || tagSlug;

    if (pushUrl) {
      writeFiltersToUrl({ tag: tagSlug, q });
    }

    if (filterWrap) {
      filterWrap.innerHTML = renderActiveFilter({ tag: tagSlug, q, tagLabel });
      bindClearButton();
    }

    if (tagCloudWrap) {
      tagCloudWrap.innerHTML = renderTagCloudWidget(popularTags, tagSlug);
    }

    if (input && input.value !== q) {
      input.value = q;
    }

    feedEl.innerHTML = `
      <div class="text-center text-secondary py-4">
        <div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
        <span class="ms-2">Търсене…</span>
      </div>
    `;

    const articles = await searchPublishedArticles({
      limit: tagSlug || q ? 40 : 8,
      tag: tagSlug,
      q,
    });

    feedEl.innerHTML = renderArticlesFeed(articles, {
      heading: feedHeading({ tag: tagSlug, q, tagLabel }),
      emptyMessage: emptyMessageFor({ tag: tagSlug, q, tagLabel }),
    });
  }

  function bindClearButton() {
    document.getElementById('clearFilterBtn')?.addEventListener('click', async () => {
      if (input) input.value = '';
      await applyFilters({ tag: '', q: '' });
    });
  }

  bindClearButton();

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const raw = (input?.value || '').trim();
    if (!raw) {
      const { tag } = readFiltersFromUrl();
      await applyFilters({ tag, q: '' });
      return;
    }
    const { tag } = readFiltersFromUrl();
    await applyFilters({ tag, q: raw });
  });

  input?.addEventListener('input', () => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(async () => {
      const raw = (input.value || '').trim();
      const { tag } = readFiltersFromUrl();
      await applyFilters({ tag, q: raw });
    }, 280);
  });

  tagCloudWrap?.addEventListener('click', async (event) => {
    const link = event.target.closest('[data-tag-slug]');
    if (!link) return;
    event.preventDefault();
    const slug = link.getAttribute('data-tag-slug') || '';
    const { tag: current } = readFiltersFromUrl();
    const nextTag = current === slug ? '' : slug;
    if (input) input.value = '';
    await applyFilters({ tag: nextTag, q: '' });
  });
}
