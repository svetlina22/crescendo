import { RUBRICS } from '../data/rubrics.js';

export function renderHeader(activePath = '/') {
  const isActive = (path) => {
    if (path === '/') return activePath === '/';
    return activePath === path || activePath.startsWith(`${path}/`);
  };

  const linkClass = (path) =>
    `nav-link${isActive(path) ? ' active' : ''}`;

  const rubricLinks = RUBRICS.map(
    (rubric) => `
      <li class="nav-item">
        <a class="${linkClass(rubric.path)}" href="${rubric.path}" data-link>
          ${rubric.title}
        </a>
      </li>
    `,
  ).join('');

  return `
    <header>
      <nav class="navbar navbar-expand-lg bg-white border-bottom shadow-sm">
        <div class="container">
          <a class="navbar-brand d-flex align-items-center gap-2" href="/" data-link>
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
                <a class="${linkClass('/')}" href="/" data-link>Начало</a>
              </li>
              ${rubricLinks}
            </ul>
            <div class="d-flex flex-column flex-lg-row gap-2 mt-3 mt-lg-0">
              <a
                class="btn btn-outline-secondary btn-sm px-3${isActive('/login') ? ' active' : ''}"
                href="/login"
                data-link
              >
                Вход
              </a>
              <a
                class="btn btn-crescendo btn-sm px-3${isActive('/dashboard') ? ' active' : ''}"
                href="/dashboard"
                data-link
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
