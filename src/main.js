import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import './styles/main.css';

import { createRouter } from './router/index.js';
import { routes } from './router/routes.js';
import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';

const headerEl = document.querySelector('#header');
const pageEl = document.querySelector('#page');
const footerEl = document.querySelector('#footer');

async function renderLayout({ path, params, route }) {
  document.title = route.title ? `${route.title} · Crescendo` : 'Crescendo';

  headerEl.innerHTML = renderHeader(path);
  footerEl.innerHTML = renderFooter();

  pageEl.innerHTML = `
    <div class="container py-5 text-center text-secondary">
      <div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
      <span class="ms-2">Loading…</span>
    </div>
  `;

  try {
    pageEl.innerHTML = await route.render({ path, params, route });
  } catch (error) {
    console.error(error);
    pageEl.innerHTML = `
      <section class="container py-5">
        <div class="alert alert-danger" role="alert">
          Failed to render this page. Check the console for details.
        </div>
      </section>
    `;
  }
}

const router = createRouter({
  routes,
  onResolve: renderLayout,
});

router.start();
