import './styles/main.css';
import { mountPage } from './router/router.js';

// CSS се зарежда от <link> в HTML (vite inject) — не блокира JS
// Bootstrap JS — паралелно с mountPage, не преди него
const bootstrapReady = import('bootstrap/dist/js/bootstrap.bundle.min.js');

mountPage()
  .catch((error) => {
    console.error('mountPage failed', error);
    const pageEl = document.querySelector('#page');
    const isStatic = pageEl?.dataset.static === 'true' || (pageEl?.children?.length ?? 0) > 0;
    if (!pageEl) return;

    const alertHtml = `
      <div class="alert alert-danger m-3" role="alert">
        Грешка при зареждане. Стартирайте <code>npm run dev</code> и отворете
        <a href="http://localhost:3000/index.html">http://localhost:3000/index.html</a>.
        <pre class="small mb-0 mt-2">${String(error?.message || error)}</pre>
      </div>`;

    if (isStatic) {
      pageEl.insertAdjacentHTML('afterbegin', alertHtml);
    } else {
      pageEl.innerHTML = `<section class="container py-5">${alertHtml}</section>`;
    }
  })
  .finally(() => {
    bootstrapReady.catch((error) => console.error('bootstrap load', error));
  });
