import {
  createArticle,
  deleteArticle,
  fetchPanelArticles,
  fetchRubrics,
  setArticleStatus,
  slugifyTitle,
  updateArticle,
} from '../services/articles.js';

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

function authorLabel(article) {
  const profile = article.profiles;
  return [profile?.academic_title, profile?.full_name].filter(Boolean).join(' ') || '—';
}

function statusBadge(status) {
  if (status === 'published') {
    return '<span class="badge text-bg-success">Публикувана</span>';
  }
  if (status === 'pending') {
    return '<span class="badge text-bg-warning text-dark">За преглед</span>';
  }
  return '<span class="badge text-bg-secondary">Чернова</span>';
}

function statusOptionsHtml(isAdmin, selected = 'draft') {
  const options = [
    { value: 'draft', label: 'Чернова' },
    { value: 'pending', label: 'За преглед' },
  ];
  if (isAdmin) {
    options.push({ value: 'published', label: 'Публикувана' });
  }

  return options
    .map(
      (opt) =>
        `<option value="${opt.value}"${opt.value === selected ? ' selected' : ''}>${opt.label}</option>`,
    )
    .join('');
}

function rubricOptionsHtml(rubrics = [], selectedId = '') {
  const items = rubrics
    .map(
      (r) =>
        `<option value="${escapeHtml(r.id)}"${r.id === selectedId ? ' selected' : ''}>${escapeHtml(r.title)}</option>`,
    )
    .join('');
  return `<option value="">Изберете рубрика…</option>${items}`;
}

function renderStats(articles, isAdmin) {
  const draftCount = articles.filter((a) => a.status === 'draft').length;
  const pendingCount = articles.filter((a) => a.status === 'pending').length;
  const publishedCount = articles.filter((a) => a.status === 'published').length;

  return `
    <div class="row g-3 mb-4" id="panelStats">
      <div class="col-md-3">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <h2 class="h6 text-secondary">Чернови</h2>
            <p class="display-6 mb-0">${draftCount}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <h2 class="h6 text-secondary">За преглед</h2>
            <p class="display-6 mb-0">${pendingCount}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <h2 class="h6 text-secondary">Публикувани</h2>
            <p class="display-6 mb-0">${publishedCount}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <h2 class="h6 text-secondary">${isAdmin ? 'Всички' : 'Общо'}</h2>
            <p class="display-6 mb-0">${articles.length}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderArticlesTable(articles = [], isAdmin = false) {
  if (articles.length === 0) {
    return `
      <div class="card border-0 shadow-sm">
        <div class="card-body p-4 text-center text-secondary">
          <i class="bi bi-journal-text fs-2 d-block mb-2" aria-hidden="true"></i>
          <p class="mb-0">Няма статии за показване. Създайте нова с бутона „+ Нова статия“.</p>
        </div>
      </div>
    `;
  }

  const rows = articles
    .map((article) => {
      const canAuthorDelete =
        !isAdmin && (article.status === 'draft' || article.status === 'pending');
      const canDelete = isAdmin || canAuthorDelete;
      const canEdit = isAdmin || article.status !== 'published';

      const actionButtons = [];

      if (isAdmin) {
        if (article.status === 'published') {
          actionButtons.push(`
            <button type="button" class="btn btn-sm btn-outline-warning" data-action="unpublish" data-id="${escapeHtml(article.id)}">
              Свали
            </button>
          `);
        } else {
          actionButtons.push(`
            <button type="button" class="btn btn-sm btn-success" data-action="publish" data-id="${escapeHtml(article.id)}">
              Публикувай
            </button>
          `);
        }
      }

      if (canEdit) {
        actionButtons.push(`
          <button type="button" class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${escapeHtml(article.id)}">
            Редактирай
          </button>
        `);
      }

      if (canDelete) {
        actionButtons.push(`
          <button type="button" class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${escapeHtml(article.id)}">
            Изтрий
          </button>
        `);
      }

      return `
        <tr data-article-id="${escapeHtml(article.id)}">
          <td>
            <span class="fw-semibold">${escapeHtml(article.title)}</span>
            ${
              article.summary
                ? `<div class="small text-secondary text-truncate" style="max-width: 22rem">${escapeHtml(article.summary)}</div>`
                : ''
            }
          </td>
          ${
            isAdmin
              ? `<td class="small">${escapeHtml(authorLabel(article))}</td>`
              : ''
          }
          <td class="small text-secondary">${formatDate(article.created_at)}</td>
          <td>${statusBadge(article.status)}</td>
          <td>
            <div class="d-flex flex-wrap gap-1 justify-content-end">
              ${actionButtons.join('') || '<span class="text-secondary">—</span>'}
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  return `
    <div class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col">Заглавие</th>
              ${isAdmin ? '<th scope="col">Автор</th>' : ''}
              <th scope="col">Създадена</th>
              <th scope="col">Статус</th>
              <th scope="col" class="text-end">Действия</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function toastHtml() {
  return `
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1100">
      <div id="panelToast" class="toast align-items-center border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body" id="panelToastBody"></div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Затвори"></button>
        </div>
      </div>
    </div>
  `;
}

function modalHtml(isAdmin, rubrics = []) {
  return `
    <div class="modal fade" id="articleModal" tabindex="-1" aria-labelledby="articleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <form class="modal-content" id="articleForm" novalidate>
          <div class="modal-header">
            <h2 class="modal-title h5" id="articleModalLabel">Нова статия</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Затвори"></button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="articleId" name="id" value="" />
            <div id="articleFormAlert" class="alert alert-danger d-none" role="alert"></div>
            <div class="mb-3">
              <label for="articleTitle" class="form-label">Заглавие <span class="text-danger">*</span></label>
              <input type="text" class="form-control" id="articleTitle" name="title" maxlength="200" />
            </div>
            <div class="mb-3">
              <label for="articleRubric" class="form-label">Рубрика <span class="text-danger">*</span></label>
              <select class="form-select" id="articleRubric" name="rubric_id">
                ${rubricOptionsHtml(rubrics)}
              </select>
            </div>
            <div class="mb-3">
              <label for="articleSummary" class="form-label">Резюме / Abstract</label>
              <textarea class="form-control" id="articleSummary" name="summary" rows="3"></textarea>
            </div>
            <div class="mb-3">
              <label for="articleContent" class="form-label">Основен текст <span class="text-danger">*</span></label>
              <textarea class="form-control" id="articleContent" name="content" rows="8"></textarea>
            </div>
            <div class="mb-0">
              <label for="articleStatus" class="form-label">Статус</label>
              <select class="form-select" id="articleStatus" name="status">
                ${statusOptionsHtml(isAdmin, 'draft')}
              </select>
              ${
                isAdmin
                  ? ''
                  : '<div class="form-text">Авторите могат да запазват като „Чернова“ или „За преглед“. Публикуването е само от администратор.</div>'
              }
            </div>
          </div>
          <div class="modal-footer bg-white border-top">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Отказ</button>
            <button type="submit" class="btn btn-crescendo px-4" id="articleSaveBtn">
              Запази
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

/**
 * @param {{ user?: import('@supabase/supabase-js').User, accessToken?: string, role?: string, profile?: object }} ctx
 */
export async function renderDashboardPage(ctx = {}) {
  const userId = ctx.user?.id;
  const accessToken = ctx.accessToken;
  const isAdmin = ctx.role === 'admin';
  const title = isAdmin ? 'Редакторски / Админ панел' : 'Авторски панел';
  const subtitle = isAdmin
    ? 'Преглед и управление на всички статии в системата.'
    : 'Управление на вашите материали — чернови и статии за преглед.';

  let articles = [];
  let rubrics = [];

  if (userId && accessToken) {
    [articles, rubrics] = await Promise.all([
      fetchPanelArticles({ userId, accessToken, isAdmin }),
      fetchRubrics(accessToken),
    ]);
  }

  return `
    <section class="container py-5" id="dashboardRoot"
      data-role="${isAdmin ? 'admin' : 'author'}"
      data-user-id="${escapeHtml(userId ?? '')}">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 class="h3 mb-1">${title}</h1>
          <p class="text-secondary mb-0">${subtitle}</p>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <button type="button" class="btn btn-crescendo btn-sm" id="newArticleBtn">
            <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>
            Нова статия
          </button>
          <button type="button" class="btn btn-outline-secondary btn-sm" id="logoutBtn">
            <i class="bi bi-box-arrow-right me-1" aria-hidden="true"></i>
            Изход
          </button>
        </div>
      </div>

      <div id="statsWrap">${renderStats(articles, isAdmin)}</div>
      <div id="articlesWrap">${renderArticlesTable(articles, isAdmin)}</div>
    </section>

    ${modalHtml(isAdmin, rubrics)}
    ${toastHtml()}
  `;
}

export async function initDashboardPage(ctx = {}) {
  const { Modal, Toast } = await import('bootstrap');
  const { getSession, signOut, getUserRole } = await import('../services/auth.js');

  const session = await getSession();
  if (!session) {
    window.location.replace('/login.html');
    return;
  }

  const accessToken = session.access_token;
  const user = session.user;
  const role = ctx.role || (await getUserRole(user, accessToken));
  const isAdmin = role === 'admin';
  const userId = user.id;

  let articles = await fetchPanelArticles({ userId, accessToken, isAdmin });
  let rubrics = await fetchRubrics(accessToken);

  const modalEl = document.getElementById('articleModal');
  const form = document.getElementById('articleForm');
  const formAlert = document.getElementById('articleFormAlert');
  const saveBtn = document.getElementById('articleSaveBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const newArticleBtn = document.getElementById('newArticleBtn');
  const articlesWrap = document.getElementById('articlesWrap');
  const statsWrap = document.getElementById('statsWrap');
  const toastEl = document.getElementById('panelToast');
  const toastBody = document.getElementById('panelToastBody');
  const titleInput = document.getElementById('articleTitle');
  const summaryInput = document.getElementById('articleSummary');
  const contentInput = document.getElementById('articleContent');
  const rubricSelect = document.getElementById('articleRubric');
  const statusSelect = document.getElementById('articleStatus');
  const idInput = document.getElementById('articleId');
  const modalLabel = document.getElementById('articleModalLabel');

  if (!modalEl || !form || !articlesWrap || !idInput) return;

  const modal = Modal.getOrCreateInstance(modalEl);
  const toast = toastEl ? Toast.getOrCreateInstance(toastEl, { delay: 3500 }) : null;

  function showToast(message, variant = 'success') {
    if (!toastEl || !toastBody || !toast) return;
    toastEl.classList.remove('text-bg-success', 'text-bg-danger', 'text-bg-secondary');
    toastEl.classList.add(
      variant === 'danger'
        ? 'text-bg-danger'
        : variant === 'secondary'
          ? 'text-bg-secondary'
          : 'text-bg-success',
    );
    toastBody.textContent = message;
    toast.show();
  }

  function refreshList() {
    if (statsWrap) statsWrap.innerHTML = renderStats(articles, isAdmin);
    articlesWrap.innerHTML = renderArticlesTable(articles, isAdmin);
  }

  async function reloadArticles() {
    articles = await fetchPanelArticles({ userId, accessToken, isAdmin });
    refreshList();
  }

  function showFormError(message) {
    if (!formAlert) return;
    formAlert.textContent = message;
    formAlert.classList.remove('d-none');
    formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearFormError() {
    formAlert?.classList.add('d-none');
  }

  async function ensureRubrics() {
    if (rubrics.length === 0) {
      rubrics = await fetchRubrics(accessToken);
    }
    return rubrics;
  }

  function openCreateModal() {
    form.reset();
    idInput.value = '';
    if (modalLabel) modalLabel.textContent = 'Нова статия';
    ensureRubrics().then((list) => {
      if (rubricSelect) rubricSelect.innerHTML = rubricOptionsHtml(list);
      if (list.length === 0) {
        showFormError('Няма налични рубрики. Опитайте отново след презареждане.');
      } else {
        clearFormError();
      }
    });
    if (statusSelect) statusSelect.innerHTML = statusOptionsHtml(isAdmin, 'draft');
    clearFormError();
    modal.show();
  }

  function openEditModal(article) {
    form.reset();
    idInput.value = article.id;
    if (modalLabel) modalLabel.textContent = 'Редакция на статия';
    if (titleInput) titleInput.value = article.title ?? '';
    if (summaryInput) summaryInput.value = article.summary ?? '';
    if (contentInput) contentInput.value = article.content ?? '';
    ensureRubrics().then((list) => {
      if (rubricSelect) {
        rubricSelect.innerHTML = rubricOptionsHtml(
          list,
          article.rubric_id || article.rubrics?.id || '',
        );
      }
    });

    const selectedStatus =
      !isAdmin && article.status === 'published' ? 'pending' : article.status || 'draft';
    if (statusSelect) {
      statusSelect.innerHTML = statusOptionsHtml(isAdmin, selectedStatus);
    }

    clearFormError();
    modal.show();
  }

  let isSaving = false;

  async function saveArticle() {
    if (isSaving) return;
    clearFormError();

    const id = idInput.value.trim();
    const title = titleInput?.value.trim() ?? '';
    const summary = summaryInput?.value.trim() ?? '';
    const content = contentInput?.value.trim() ?? '';
    const rubricId = rubricSelect?.value ?? '';
    let status = statusSelect?.value ?? 'draft';

    if (!title) {
      showFormError('Въведете заглавие.');
      titleInput?.focus();
      return;
    }
    if (!rubricId) {
      showFormError('Изберете рубрика.');
      rubricSelect?.focus();
      return;
    }
    if (!content) {
      showFormError('Въведете основен текст.');
      contentInput?.focus();
      return;
    }

    if (!isAdmin && status === 'published') {
      status = 'pending';
    }

    /** @type {Record<string, unknown>} */
    const payload = {
      title,
      summary: summary || null,
      content,
      rubric_id: rubricId,
      status,
    };

    if (isAdmin && status === 'published') {
      payload.published_at = new Date().toISOString();
    }

    isSaving = true;
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Запазване…';
    }

    try {
      if (id) {
        if (!isAdmin) {
          const existing = articles.find((a) => a.id === id);
          if (existing?.status === 'published') {
            throw new Error(
              'Не можете да редактирате публикувана статия. Свържете се с администратор.',
            );
          }
          payload.status = status === 'published' ? 'pending' : status;
        }
        await updateArticle(accessToken, id, payload);
        showToast('Статията е обновена.');
      } else {
        payload.author_id = userId;
        payload.slug = slugifyTitle(title);
        if (!isAdmin) {
          payload.status = status === 'published' ? 'pending' : status;
        }
        await createArticle(accessToken, payload);
        showToast('Статията е създадена.');
      }

      modal.hide();
      await reloadArticles();
    } catch (error) {
      console.error('save article', error);
      showFormError(String(error?.message || error));
    } finally {
      isSaving = false;
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Запази';
      }
    }
  }

  logoutBtn?.addEventListener('click', async () => {
    logoutBtn.disabled = true;
    await signOut();
    window.location.replace('/index.html');
  });

  newArticleBtn?.addEventListener('click', () => {
    openCreateModal();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    saveArticle();
  });

  articlesWrap.addEventListener('click', async (event) => {
    const btn = event.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;
    const article = articles.find((a) => a.id === id);
    if (!article) return;

    try {
      if (action === 'edit') {
        openEditModal(article);
        return;
      }

      if (action === 'delete') {
        const ok = window.confirm(
          `Изтриване на „${article.title}“? Това действие е необратимо.`,
        );
        if (!ok) return;
        btn.disabled = true;
        await deleteArticle(accessToken, id);
        showToast('Статията е изтрита.');
        await reloadArticles();
        return;
      }

      if (action === 'publish' && isAdmin) {
        btn.disabled = true;
        await setArticleStatus(accessToken, id, 'published');
        showToast('Статията е публикувана.');
        await reloadArticles();
        return;
      }

      if (action === 'unpublish' && isAdmin) {
        btn.disabled = true;
        await setArticleStatus(accessToken, id, 'draft');
        showToast('Статията е свалена от публикация.', 'secondary');
        await reloadArticles();
      }
    } catch (error) {
      console.error(action, error);
      showToast(String(error?.message || error), 'danger');
      btn.disabled = false;
    }
  });

  await ensureRubrics();
  refreshList();
}
