export async function renderDashboardPage() {
  return `
    <section class="container py-5">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 class="h3 mb-1">Dashboard</h1>
          <p class="text-secondary mb-0">Placeholder workspace for authors and admins.</p>
        </div>
        <a href="/games/rhythm-1" class="btn btn-outline-secondary" data-link>
          <i class="bi bi-controller me-1" aria-hidden="true"></i>
          Open sample game
        </a>
      </div>
      <div class="row g-3">
        <div class="col-md-4">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <h2 class="h6 text-secondary">Drafts</h2>
              <p class="display-6 mb-0">0</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <h2 class="h6 text-secondary">Published</h2>
              <p class="display-6 mb-0">0</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <h2 class="h6 text-secondary">Games</h2>
              <p class="display-6 mb-0">—</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
