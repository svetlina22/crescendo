import { RUBRICS } from '../data/rubrics.js';

export function renderHeader(activePath = '/index.html') {
  const normalize = (path) => {
    if (!path || path === '/' || path === '/index.html') return '/index.html';
    return path;
  };

  const current = normalize(activePath);
  const isActive = (path) => normalize(path) === current;
  const linkClass = (path) => `nav-link${isActive(path) ? ' active' : ''}`;

  const rubricLinks = RUBRICS.map(
    (r) => `<li class="nav-item"><a class="${linkClass(r.path)}" href="${r.path}">${r.title}</a></li>`,
  ).join('');

  return `
    <header class="site-header">
      <nav class="navbar navbar-expand-lg py-2">
        <div class="container">
          <a class="navbar-brand d-flex align-items-center gap-2" href="/index.html">
            <i class="bi bi-music-note-beamed fs-4" aria-hidden="true"></i>
            <span class="d-flex flex-column">
              <span>Crescendo</span>
              <span class="site-header__tagline d-none d-md-inline">Музикално образование</span>
            </span>
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav"
            aria-controls="mainNav" aria-expanded="false" aria-label="Меню">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="mainNav">
            <ul class="navbar-nav mx-lg-auto align-items-lg-center gap-lg-1 py-3 py-lg-0">
              <li class="nav-item"><a class="${linkClass('/index.html')}" href="/index.html">Начало</a></li>
              ${rubricLinks}
              <li class="nav-item"><a class="${linkClass('/about.html')}" href="/about.html">За нас</a></li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  `;
}
