import { RUBRICS } from '../data/rubrics.js';

export function renderFooter() {
  const year = new Date().getFullYear();

  const categoryLinks = RUBRICS.map(
    (rubric) => `
      <li>
        <a href="${rubric.path}">${rubric.title}</a>
      </li>
    `,
  ).join('');

  return `
    <footer class="footer-crescendo mt-auto py-5">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-7">
            <h2 class="h6 text-white mb-2">
              <i class="bi bi-music-note-beamed me-1" aria-hidden="true"></i>
              Crescendo
            </h2>
            <p class="small mb-0">
              Академична и професионална платформа за изследвания
              в музикалното образование.
            </p>
          </div>
          <div class="col-md-5">
            <h2 class="h6 text-white mb-2">Рубрики</h2>
            <ul class="list-unstyled small mb-0 d-flex flex-column gap-1">
              ${categoryLinks}
            </ul>
          </div>
        </div>
        <hr class="border-secondary opacity-25 my-4" />
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
