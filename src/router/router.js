/**
 * MPA layout bootstrap — assembles Header, Page View, and Footer
 * for the current HTML entry (body[data-page]).
 */
import { getPageMeta, loadPage } from './pages.js';
import { renderHeader } from '../components/Header.js';
import { renderFooter } from '../components/Footer.js';

const PROTECTED_PAGES = new Set(['dashboard', 'add-event']);

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
  pageEl.innerHTML = `
    <div class="container py-5 text-center text-secondary">
      <div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
      <span class="ms-2">Зареждане…</span>
    </div>
  `;

  const page = await loadPage(pageId);
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
    const html = await page.render(renderContext);
    pageEl.innerHTML = html;

    if (page.init) {
      // Do not block paint on init — run in background
      Promise.resolve(page.init(renderContext)).catch((error) => {
        console.error('page.init', error);
      });
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
