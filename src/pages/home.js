import {
  fetchPopularTags,
  resolveTag,
  searchPublishedArticles,
} from '../services/articles.js';
import { fetchUpcomingEvents } from '../services/events.js';
import { renderArticlesFeed } from '../components/ArticlesFeed.js';
import { renderEventsSidebar } from '../components/EventsSidebar.js';
import { renderTagCloudWidget } from '../components/HomeSidebar.js';
import { initHeroCarousel } from '../components/HeroCarousel.js';

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
  window.history.replaceState({}, '', qs ? `/index.html?${qs}` : '/index.html');
}

function emptyMessageFor({ tag, q, tagLabel }) {
  if (tag) return `Няма намерени статии за този таг${tagLabel ? ` (#${tagLabel})` : ''}.`;
  if (q) return `Няма намерени статии за „${q}“.`;
  return 'Все още няма публикувани материали.';
}

function renderActiveFilter({ tag, q, tagLabel }) {
  if (!tag && !q) return '';
  const parts = [];
  if (tag) parts.push(`таг <strong>#${escapeHtml(tagLabel || tag)}</strong>`);
  if (q) parts.push(`търсене <strong>„${escapeHtml(q)}“</strong>`);
  return `
    <div id="activeFilterBar" class="alert alert-warning d-flex flex-wrap align-items-center justify-content-between gap-2 py-2 mb-3 border-0" role="status">
      <span>Филтрирано: ${parts.join(' · ')}</span>
      <button type="button" class="btn btn-sm btn-outline-secondary" id="clearFilterBtn">Изчисти</button>
    </div>`;
}

function feedHeading({ tag, q, tagLabel }) {
  if (tag) return `#${tagLabel || tag}`;
  if (q) return `„${q}“`;
  return 'Последни публикации';
}

function loadingBlock(label = 'Зареждане…') {
  return `<div class="text-center text-secondary py-5"><div class="spinner-border spinner-border-sm"></div><span class="ms-2">${escapeHtml(label)}</span></div>`;
}

/** Само динамично съдържание — текстовете са в index.html */
export async function initHomePage() {
  const form = document.getElementById('articleSearchForm');
  const input = document.getElementById('articleSearchInput');
  const feedEl = document.getElementById('articlesFeed');
  const filterWrap = document.getElementById('activeFilterWrap');
  const tagCloudWrap = document.getElementById('tagCloudWrap');
  const eventsWrap = document.getElementById('eventsSidebarWrap');
  if (!feedEl) return;

  void initHeroCarousel();

  const initial = readFiltersFromUrl();
  let popularTags = [];
  let debounceTimer = 0;

  async function loadSidebar() {
    try {
      const [events, tags] = await Promise.all([fetchUpcomingEvents(3), fetchPopularTags(12)]);
      popularTags = tags;
      if (eventsWrap) eventsWrap.innerHTML = renderEventsSidebar(events);
      if (tagCloudWrap) tagCloudWrap.innerHTML = renderTagCloudWidget(popularTags, initial.tag);
    } catch (error) {
      console.error('initHomePage sidebar', error);
      if (eventsWrap) {
        eventsWrap.innerHTML = `<aside class="sidebar-panel"><p class="small text-secondary mb-0">Събитията не можаха да се заредят.</p></aside>`;
      }
      if (tagCloudWrap) tagCloudWrap.innerHTML = '';
    }
  }

  async function applyFilters({ tag = '', q = '', pushUrl = true, initial = false } = {}) {
    const matchedTag = resolveTag(tag, popularTags);
    const tagSlug = matchedTag?.slug || tag;
    const tagLabel = matchedTag?.slug || matchedTag?.name || tagSlug;
    if (pushUrl) writeFiltersToUrl({ tag: tagSlug, q });
    if (filterWrap) {
      filterWrap.innerHTML = renderActiveFilter({ tag: tagSlug, q, tagLabel });
      document.getElementById('clearFilterBtn')?.addEventListener('click', async () => {
        if (input) input.value = '';
        await applyFilters({ tag: '', q: '' });
      });
    }
    if (tagCloudWrap && popularTags.length) {
      tagCloudWrap.innerHTML = renderTagCloudWidget(popularTags, tagSlug);
    }
    if (input && input.value !== q) input.value = q;
    if (!initial) {
      feedEl.innerHTML = loadingBlock('Търсене…');
    }
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

  void loadSidebar();

  applyFilters({ tag: initial.tag, q: initial.q, pushUrl: false, initial: true }).catch(
    (error) => {
      console.error('initHomePage articles', error);
      feedEl.innerHTML = `
        <div class="feed-header"><h2>Последни публикации</h2></div>
        <p class="text-secondary">Статистиките не можаха да се заредят. Опитайте да презаредите страницата.</p>`;
    },
  );

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const raw = (input?.value || '').trim();
    const { tag } = readFiltersFromUrl();
    await applyFilters({ tag, q: raw });
  });

  input?.addEventListener('input', () => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(async () => {
      const { tag } = readFiltersFromUrl();
      await applyFilters({ tag, q: (input.value || '').trim() });
    }, 280);
  });

  tagCloudWrap?.addEventListener('click', async (e) => {
    const link = e.target.closest('[data-tag-slug]');
    if (!link) return;
    e.preventDefault();
    const slug = link.getAttribute('data-tag-slug') || '';
    const { tag: current } = readFiltersFromUrl();
    if (input) input.value = '';
    await applyFilters({ tag: current === slug ? '' : slug, q: '' });
  });
}
