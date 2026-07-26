import { tagFilterHref } from '../services/articles.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function renderSearchWidget(q = '') {
  return `
    <aside class="sidebar-panel">
      <h2 class="widget-title">Търсене</h2>
      <form id="articleSearchForm" role="search">
        <label for="articleSearchInput" class="visually-hidden">Търсене</label>
        <div class="input-group">
          <span class="input-group-text border-0 bg-light"><i class="bi bi-search"></i></span>
          <input type="search" class="form-control border-0 bg-light" id="articleSearchInput"
            name="q" value="${escapeHtml(q)}" placeholder="Ключова дума…" autocomplete="off" />
        </div>
      </form>
    </aside>`;
}

export function renderTagCloudWidget(tags = [], activeSlug = '') {
  const body =
    tags.length === 0
      ? `<p class="small text-secondary mb-0">Все още няма теми.</p>`
      : `<div class="d-flex flex-wrap gap-2" id="tagCloud">
          ${tags
            .map((tag) => {
              const label = tag.name || tag.slug;
              const active = activeSlug === tag.slug;
              return `<a href="${tagFilterHref(tag.slug)}" class="badge-tag${active ? ' badge-tag--active' : ''}"
                data-tag-slug="${escapeHtml(tag.slug)}">#${escapeHtml(label)}</a>`;
            })
            .join('')}
        </div>`;

  return `
    <aside class="sidebar-panel">
      <h2 class="widget-title">Популярни теми</h2>
      ${body}
    </aside>`;
}
