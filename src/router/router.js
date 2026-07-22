/**
 * MPA layout bootstrap — assembles Header, Page View, and Footer
 * for the current HTML entry (body[data-page]).
 */
import { getPage } from './pages.js';
import { renderHeader } from '../components/Header.js';
import { renderFooter } from '../components/Footer.js';

export async function mountPage() {
  const headerEl = document.querySelector('#header');
  const pageEl = document.querySelector('#page');
  const footerEl = document.querySelector('#footer');

  const pageId = document.body.dataset.page || 'home';
  const page = getPage(pageId);

  if (!page) {
    document.title = 'Страницата не е намерена · Crescendo';
    headerEl.innerHTML = renderHeader('/');
    footerEl.innerHTML = renderFooter();
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
  headerEl.innerHTML = renderHeader(page.path);
  footerEl.innerHTML = renderFooter();

  pageEl.innerHTML = `
    <div class="container py-5 text-center text-secondary">
      <div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
      <span class="ms-2">Зареждане…</span>
    </div>
  `;

  try {
    pageEl.innerHTML = await page.render({ path: page.path, pageId, page });
  } catch (error) {
    console.error(error);
    pageEl.innerHTML = `
      <section class="container py-5">
        <div class="alert alert-danger" role="alert">
          Страницата не можа да се зареди. Проверете конзолата за подробности.
        </div>
      </section>
    `;
  }
}
