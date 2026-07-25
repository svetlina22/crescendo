import { fetchPublishedArticlesByRubric } from '../services/articles.js';
import { renderArticlesFeed } from './ArticlesFeed.js';

/**
 * Общ скелет за рубрична страница със списък от публикувани статии.
 * @param {{ title: string, icon: string, description: string, emptyMessage: string, slug: string }} opts
 */
export async function renderRubricPage({
  title,
  icon,
  description,
  emptyMessage,
  slug,
}) {
  const articles = await fetchPublishedArticlesByRubric(slug);

  const listHtml =
    articles.length > 0
      ? renderArticlesFeed(articles, {
          heading: 'Статии',
          showRubricBadge: false,
        })
      : `
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="d-flex align-items-start gap-3">
              <i class="bi bi-journal-text fs-3 text-secondary" aria-hidden="true"></i>
              <div>
                <h2 class="h5 mb-2">Статии</h2>
                <p class="text-secondary mb-0">${emptyMessage}</p>
              </div>
            </div>
          </div>
        </div>
      `;

  return `
    <section class="container py-5">
      <div class="mb-4">
        <p class="text-uppercase small fw-semibold text-secondary mb-2">Рубрика</p>
        <h1 class="h2 mb-2">
          <i class="bi ${icon} me-2 text-secondary" aria-hidden="true"></i>
          ${title}
        </h1>
        <p class="lead text-secondary mb-0">${description}</p>
      </div>

      ${listHtml}
    </section>
  `;
}
