/**
 * MPA layout bootstrap — Header/Footer + page render or HTML-first init.
 */
import { getPageMeta, loadPage } from './pages.js';
import { renderHeader } from '../components/Header.js';
import { renderFooter } from '../components/Footer.js';

const PROTECTED_PAGES = new Set(['dashboard', 'add-event']);

function showPageError(pageEl, error, htmlFirst) {
  const message = String(error?.message || error);
  const alertHtml = `
    <div class="alert alert-danger ${htmlFirst ? 'm-3' : ''}" role="alert">
      Част от страницата не можа да се зареди.
      <pre class="small mb-0 mt-2">${message}</pre>
    </div>`;

  if (htmlFirst) {
    pageEl.insertAdjacentHTML('afterbegin', alertHtml);
  } else {
    pageEl.innerHTML = `<section class="container py-5">${alertHtml}</section>`;
  }
}

export async function mountPage() {
  const headerEl = document.querySelector('#header');
  const pageEl = document.querySelector('#page');
  const footerEl = document.querySelector('#footer');

  if (!headerEl || !pageEl || !footerEl) {
    console.error('Missing #header, #page or #footer');
    return;
  }

  const pageId = document.body.dataset.page || 'home';
  const meta = getPageMeta(pageId);

  headerEl.innerHTML = renderHeader(meta?.path || '/index.html');
  footerEl.innerHTML = renderFooter(meta?.path || '/index.html');

  if (!meta) {
    document.title = 'Страницата не е намерена · Crescendo';
    pageEl.innerHTML = `
      <section class="container py-5">
        <h1 class="h3">Страницата не е намерена</h1>
        <p class="text-secondary">Неизвестен data-page: <code>${pageId}</code>.</p>
        <a href="/index.html" class="btn btn-crescendo">Към началото</a>
      </section>
    `;
    return;
  }

  document.title = `${meta.title} · Crescendo`;

  const htmlFirst =
    meta.htmlFirst === true || pageEl.dataset.static === 'true' || pageEl.children.length > 0;

  let page;
  try {
    page = await loadPage(pageId);
  } catch (error) {
    console.error('loadPage', error);
    if (!htmlFirst) {
      pageEl.innerHTML = `
        <section class="container py-5">
          <div class="alert alert-danger" role="alert">
            Страницата не можа да се зареди.
            <pre class="small mb-0 mt-2">${String(error?.message || error)}</pre>
          </div>
        </section>
      `;
    }
    return;
  }

  if (!page) return;

  let renderContext = { path: page.path, pageId, page };

  if (PROTECTED_PAGES.has(pageId)) {
    const { getSession, getUserProfile } = await import('../services/auth.js');
    const session = await getSession();
    if (!session) {
      window.location.replace('/login.html');
      return;
    }
    const profile = await getUserProfile(session.user, session.access_token);
    renderContext = {
      ...renderContext,
      user: session.user,
      accessToken: session.access_token,
      role: profile.role,
      profile,
    };
  }

  try {
    if (htmlFirst) {
      // Текстовете остават в HTML — JS зарежда динамични блокове на заден план
      if (page.init) {
        page.init(renderContext).catch((error) => {
          console.error('page init', error);
          showPageError(pageEl, error, true);
        });
      }
    } else {
      pageEl.innerHTML = `
        <div class="container py-5 text-center text-secondary">
          <div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
          <span class="ms-2">Зареждане…</span>
        </div>
      `;
      const html = await page.render(renderContext);
      pageEl.innerHTML = html;
      if (page.init) {
        await page.init(renderContext);
      }
    }
  } catch (error) {
    console.error('mountPage', error);
    showPageError(pageEl, error, htmlFirst);
  }
}
