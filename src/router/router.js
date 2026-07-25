/**
 * MPA layout bootstrap — assembles Header, Page View, and Footer
 * for the current HTML entry (body[data-page]).
 */
import { getPage } from './pages.js';
import { renderHeader } from '../components/Header.js';
import { renderFooter } from '../components/Footer.js';

const PROTECTED_PAGES = new Set(['dashboard']);

export async function mountPage() {
  const headerEl = document.querySelector('#header');
  const pageEl = document.querySelector('#page');
  const footerEl = document.querySelector('#footer');

  if (!headerEl || !pageEl || !footerEl) {
    console.error('Missing #header, #page or #footer');
    return;
  }

  const pageId = document.body.dataset.page || 'home';
  const page = getPage(pageId);

  headerEl.innerHTML = renderHeader(page?.path || '/index.html');
  footerEl.innerHTML = renderFooter();

  if (!page) {
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

  document.title = `${page.title} · Crescendo`;
  pageEl.innerHTML = `
    <div class="container py-5 text-center text-secondary">
      <div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
      <span class="ms-2">Зареждане…</span>
    </div>
  `;

  let renderContext = { path: page.path, pageId, page };

  if (PROTECTED_PAGES.has(pageId)) {
    const { getSession } = await import('../services/auth.js');
    const session = await getSession();

    if (!session) {
      window.location.replace('/login.html');
      return;
    }

    renderContext = {
      ...renderContext,
      user: session.user,
      accessToken: session.access_token,
    };
  }

  try {
    const html = await page.render(renderContext);
    pageEl.innerHTML = html;

    if (pageId === 'login' && page.init) {
      await page.init();
    }
    if (pageId === 'dashboard' && page.init) {
      await page.init();
    }
  } catch (error) {
    console.error('mountPage', error);
    pageEl.innerHTML = `
      <section class="container py-5">
        <div class="alert alert-danger" role="alert">
          Страницата не можа да се зареди.
          <pre class="small mb-0 mt-2">${String(error?.message || error)}</pre>
        </div>
      </section>
    `;
  }
}
