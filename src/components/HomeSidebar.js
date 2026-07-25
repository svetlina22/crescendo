import { tagFilterHref } from '../services/articles.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/**
 * @param {string} [q]
 */
export function renderSearchWidget(q = '') {
  return `
    <aside class="card border-0 shadow-sm mb-4">
      <div class="card-body p-3 p-lg-4">
        <h2 class="h5 mb-3">Търсене</h2>
        <form id="articleSearchForm" role="search">
          <label for="articleSearchInput" class="form-label visually-hidden">
            Търсене на статии
          </label>
          <div class="input-group">
            <span class="input-group-text bg-white">
              <i class="bi bi-search" aria-hidden="true"></i>
            </span>
            <input
              type="search"
              class="form-control"
              id="articleSearchInput"
              name="q"
              value="${escapeHtml(q)}"
              placeholder="Ключова дума…"
              autocomplete="off"
            />
          </div>
        </form>
      </div>
    </aside>
  `;
}

/**
 * @param {{ name: string, slug: string, uses?: number }[]} tags
 * @param {string} [activeSlug]
 */
export function renderTagCloudWidget(tags = [], activeSlug = '') {
  const body =
    tags.length === 0
      ? `<p class="small text-secondary mb-0">Все още няма популярни теми.</p>`
      : `
        <div class="d-flex flex-wrap gap-2" id="tagCloud" aria-label="Популярни теми">
          ${tags
            .map((tag) => {
              const label = tag.slug || tag.name;
              const active = activeSlug && activeSlug === tag.slug;
              return `
                <a
                  href="${tagFilterHref(tag.slug)}"
                  class="badge rounded-pill text-decoration-none ${
                    active
                      ? 'text-bg-secondary'
                      : 'text-bg-light border text-body'
                  }"
                  data-tag-slug="${escapeHtml(tag.slug)}"
                >#${escapeHtml(label)}</a>
              `;
            })
            .join('')}
        </div>
      `;

  return `
    <aside class="card border-0 shadow-sm mb-4">
      <div class="card-body p-3 p-lg-4">
        <h2 class="h5 mb-3">Популярни теми</h2>
        ${body}
      </div>
    </aside>
  `;
}
