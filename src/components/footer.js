import { RUBRICS } from '../data/rubrics.js';

export function renderFooter() {
  const year = new Date().getFullYear();

  const categoryLinks = RUBRICS.map(
    (rubric) => `
      <li>
        <a href="${rubric.path}" data-link>${rubric.title}</a>
      </li>
    `,
  ).join('');

  return `
    <footer class="footer-crescendo mt-auto py-5">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-5">
            <h2 class="h6 text-white mb-2">
              <i class="bi bi-music-note-beamed me-1" aria-hidden="true"></i>
              Crescendo
            </h2>
            <p class="small mb-0">
              Академична и професионална платформа за изследвания
              в музикалното образование.
            </p>
          </div>
          <div class="col-md-4">
            <h2 class="h6 text-white mb-2">Рубрики</h2>
            <ul class="list-unstyled small mb-0 d-flex flex-column gap-1">
              ${categoryLinks}
            </ul>
          </div>
          <div class="col-md-3">
            <h2 class="h6 text-white mb-2">Достъп</h2>
            <ul class="list-unstyled small mb-0 d-flex flex-column gap-1">
              <li><a href="/login" data-link>Вход</a></li>
              <li><a href="/dashboard" data-link>Табло</a></li>
            </ul>
          </div>
        </div>
        <hr class="border-secondary opacity-25 my-4" />
        <p class="small mb-0">
          &copy; ${year} Crescendo. Всички права запазени.
        </p>
      </div>
    </footer>
  `;
}
