import { RUBRICS } from '../data/rubrics.js';

export function renderFooter(activePath = '') {
  const year = new Date().getFullYear();
  const aboutActive = activePath === '/about.html';

  const categoryLinks = RUBRICS.map(
    (rubric) => `
      <li>
        <a href="${rubric.path}">
          <i class="bi ${rubric.icon} me-1" aria-hidden="true"></i>
          ${rubric.title}
        </a>
      </li>
    `,
  ).join('');

  return `
    <footer class="footer-crescendo mt-auto py-5">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-5">
            <p class="footer-brand d-flex align-items-center gap-2 mb-2">
              <i class="bi bi-music-note-beamed" aria-hidden="true"></i>
              Crescendo
            </p>
            <p class="footer-tagline mb-3">
              Място за информация и вдъхновение в музикалното образование.
            </p>
            <p class="small mb-0">
              Независима дигитална платформа в подкрепа на музикалните
              педагози, артисти и образователни лидери — практики,
              иновации и политики за музикалното образование.
            </p>
          </div>
          <div class="col-md-4">
            <h2 class="mb-3">Рубрики</h2>
            <ul class="list-unstyled small mb-0 d-flex flex-column gap-2">
              ${categoryLinks}
            </ul>
          </div>
          <div class="col-md-3">
            <h2 class="mb-3">За изданието</h2>
            <ul class="list-unstyled small mb-3 d-flex flex-column gap-2">
              <li>
                <a
                  href="/about.html"
                  class="${aboutActive ? 'fw-semibold' : ''}"
                  ${aboutActive ? 'aria-current="page" style="color:var(--sunshine)"' : ''}
                >За нас</a>
              </li>
            </ul>
            <h2 class="mb-2">Контакти</h2>
            <p class="small mb-0">
              <a href="mailto:redakcia@crescendo.bg">
                <i class="bi bi-envelope me-1" aria-hidden="true"></i>
                redakcia@crescendo.bg
              </a>
            </p>
          </div>
        </div>
        <hr class="my-4" />
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <p class="small mb-0">
            &copy; ${year} Crescendo. Всички права запазени.
          </p>
          <a href="/login.html" class="footer-login-link small">Вход</a>
        </div>
      </div>
    </footer>
  `;
}
