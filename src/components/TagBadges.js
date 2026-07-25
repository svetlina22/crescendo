import {
  normalizeTags,
  tagFilterHref,
} from '../services/articles.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/**
 * Clickable Bootstrap tag badges → home filtered by tag.
 * @param {unknown} tagsRaw
 * @param {{ className?: string }} [options]
 */
export function renderTagBadges(tagsRaw, options = {}) {
  const tags = normalizeTags(tagsRaw);
  if (tags.length === 0) return '';

  const className = options.className ?? 'd-flex flex-wrap gap-2';

  const badges = tags
    .map((tag) => {
      const label = tag.slug || tag.name;
      return `
      <a
        href="${tagFilterHref(tag.slug)}"
        class="badge-tag"
        title="Филтрирай по „${escapeHtml(label)}“"
      >#${escapeHtml(label)}</a>
    `;
    })
    .join('');

  return `<div class="${className}" aria-label="Тагове">${badges}</div>`;
}
