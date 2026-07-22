export async function renderGamePage({ params }) {
  const gameId = params.id ?? 'unknown';

  return `
    <section class="container py-5">
      <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="/" data-link>Home</a></li>
          <li class="breadcrumb-item"><a href="/dashboard" data-link>Dashboard</a></li>
          <li class="breadcrumb-item active" aria-current="page">Game</li>
        </ol>
      </nav>
      <div class="card border-0 shadow-sm">
        <div class="card-body p-4 p-lg-5 text-center">
          <i class="bi bi-music-note-list display-4 text-secondary d-block mb-3" aria-hidden="true"></i>
          <h1 class="h3">Interactive music game</h1>
          <p class="text-secondary mb-1">Dynamic route placeholder</p>
          <p class="fs-5 mb-4">
            Game ID: <code class="user-select-all">${gameId}</code>
          </p>
          <a href="/games/another-demo" class="btn btn-outline-secondary me-2" data-link>
            Another game
          </a>
          <a href="/" class="btn btn-crescendo" data-link>Back home</a>
        </div>
      </div>
    </section>
  `;
}
