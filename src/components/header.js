import { RUBRICS } from '../data/rubrics.js';

export function renderHeader(activePath = '/index.html') {
  const normalize = (path) => {
    if (!path || path === '/' || path === '/index.html') return '/index.html';
    return path;
  };

  const current = normalize(activePath);

  const isActive = (path) => normalize(path) === current;

  const linkClass = (path) =>
    `nav-link${isActive(path) ? ' active' : ''}`;

  const rubricLinks = RUBRICS.map(
    (rubric) => `
      <li class="nav-item">
        <a class="${linkClass(rubric.path)}" href="${rubric.path}">
          ${rubric.title}
        </a>
      </li>
    `,
  ).join('');

  return `
    <header>
      <nav class="navbar navbar-expand-lg bg-white border-bottom shadow-sm">
        <div class="container">
          <a class="navbar-brand d-flex align-items-center gap-2" href="/index.html">
            <i class="bi bi-music-note-beamed fs-4" aria-hidden="true"></i>
            <span>Crescendo</span>
          </a>
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
            aria-controls="mainNav"
            aria-expanded="false"
            aria-label="Превключване на навигацията"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="mainNav">
            <ul class="navbar-nav mx-lg-auto align-items-lg-center gap-lg-1">
              <li class="nav-item">
                <a class="${linkClass('/index.html')}" href="/index.html">Начало</a>
              </li>
              ${rubricLinks}
            </ul>
            <div class="d-flex flex-column flex-lg-row gap-2 mt-3 mt-lg-0">
              <a
                class="btn btn-outline-secondary btn-sm px-3${isActive('/login.html') ? ' active' : ''}"
                href="/login.html"
              >
                Вход
              </a>
              <a
                class="btn btn-crescendo btn-sm px-3${isActive('/dashboard.html') ? ' active' : ''}"
                href="/dashboard.html"
              >
                Табло
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  `;
}
