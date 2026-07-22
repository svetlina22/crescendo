export function renderHeader(activePath = '/') {
  const isActive = (path) => {
    if (path === '/') return activePath === '/';
    return activePath === path || activePath.startsWith(`${path}/`);
  };

  const linkClass = (path) =>
    `nav-link${isActive(path) ? ' active' : ''}`;

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
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="mainNav">
            <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-1">
              <li class="nav-item">
                <a class="${linkClass('/')}" href="/" data-link>Home</a>
              </li>
              <li class="nav-item">
                <a class="${linkClass('/dashboard')}" href="/dashboard" data-link>Dashboard</a>
              </li>
              <li class="nav-item">
                <a class="${linkClass('/games')}" href="/games/demo" data-link>Sample Game</a>
              </li>
              <li class="nav-item ms-lg-2">
                <a class="btn btn-crescendo btn-sm px-3" href="/login" data-link>Login</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  `;
}
