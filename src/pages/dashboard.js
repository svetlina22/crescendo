import { fetchMyArticles } from '../services/articles.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function formatDate(isoDate) {
  if (!isoDate) return '—';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('bg-BG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function statusBadge(status) {
  if (status === 'published') {
    return '<span class="badge text-bg-success">Публикувана</span>';
  }
  return '<span class="badge text-bg-secondary">Чернова</span>';
}

function renderArticlesTable(articles = []) {
  if (articles.length === 0) {
    return `
      <div class="card border-0 shadow-sm">
        <div class="card-body p-4 text-center text-secondary">
          <i class="bi bi-journal-text fs-2 d-block mb-2" aria-hidden="true"></i>
          <p class="mb-0">Все още нямате статии. След създаване на материал той ще се появи тук.</p>
        </div>
      </div>
    `;
  }

  const rows = articles
    .map(
      (article) => `
        <tr>
          <td>
            <span class="fw-semibold">${escapeHtml(article.title)}</span>
            ${
              article.summary
                ? `<div class="small text-secondary text-truncate" style="max-width: 20rem">${escapeHtml(article.summary)}</div>`
                : ''
            }
          </td>
          <td>${escapeHtml(article.rubrics?.title ?? '—')}</td>
          <td>${statusBadge(article.status)}</td>
          <td class="small text-secondary">${formatDate(article.updated_at)}</td>
        </tr>
      `,
    )
    .join('');

  return `
    <div class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col">Заглавие</th>
              <th scope="col">Рубрика</th>
              <th scope="col">Статус</th>
              <th scope="col">Обновена</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * @param {{ user?: import('@supabase/supabase-js').User, accessToken?: string }} ctx
 */
export async function renderDashboardPage(ctx = {}) {
  const userId = ctx.user?.id;
  const accessToken = ctx.accessToken;

  let articles = [];
  if (userId && accessToken) {
    articles = await fetchMyArticles(userId, accessToken);
  }

  const draftCount = articles.filter((a) => a.status === 'draft').length;
  const publishedCount = articles.filter((a) => a.status === 'published').length;

  return `
    <section class="container py-5">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 class="h3 mb-1">Моите статии</h1>
          <p class="text-secondary mb-0">
            Управление на вашите материали — чернови и публикувани статии.
          </p>
        </div>
        <button type="button" class="btn btn-outline-secondary btn-sm" id="logoutBtn">
          <i class="bi bi-box-arrow-right me-1" aria-hidden="true"></i>
          Изход
        </button>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <h2 class="h6 text-secondary">Чернови</h2>
              <p class="display-6 mb-0">${draftCount}</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <h2 class="h6 text-secondary">Публикувани</h2>
              <p class="display-6 mb-0">${publishedCount}</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <h2 class="h6 text-secondary">Общо</h2>
              <p class="display-6 mb-0">${articles.length}</p>
            </div>
          </div>
        </div>
      </div>

      ${renderArticlesTable(articles)}
    </section>
  `;
}

export async function initDashboardPage() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', async () => {
    logoutBtn.disabled = true;
    const { signOut } = await import('../services/auth.js');
    await signOut();
    window.location.replace('/index.html');
  });
}
