export async function renderHomePage() {
  return `
    <section class="hero-crescendo py-5">
      <div class="container py-lg-4">
        <div class="row align-items-center g-4">
          <div class="col-lg-7">
            <p class="text-uppercase small fw-semibold text-secondary mb-2">Crescendo</p>
            <h1 class="display-5 mb-3">Hello world!</h1>
            <p class="lead text-secondary mb-4">
              Academic platform scaffold for music education research — Vanilla JS, Bootstrap 5, and Vite.
            </p>
            <div class="d-flex flex-wrap gap-2">
              <a href="/dashboard" class="btn btn-crescendo btn-lg" data-link>
                Open dashboard
              </a>
              <a href="/games/intro" class="btn btn-outline-secondary btn-lg" data-link>
                Try a game
              </a>
            </div>
          </div>
          <div class="col-lg-5">
            <div class="card border-0 shadow-sm">
              <div class="card-body p-4">
                <h2 class="h5 mb-3">
                  <i class="bi bi-compass me-2 text-secondary" aria-hidden="true"></i>
                  Quick links
                </h2>
                <ul class="list-group list-group-flush">
                  <li class="list-group-item px-0">
                    <a href="/login" data-link class="link-underline-opacity-0">Login</a>
                  </li>
                  <li class="list-group-item px-0">
                    <a href="/dashboard" data-link class="link-underline-opacity-0">Dashboard</a>
                  </li>
                  <li class="list-group-item px-0">
                    <a href="/games/demo" data-link class="link-underline-opacity-0">Game: demo</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
