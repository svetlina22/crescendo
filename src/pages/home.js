import { RUBRICS } from '../data/rubrics.js';

export async function renderHomePage() {
  const cards = RUBRICS.map(
    (rubric) => `
      <div class="col-md-6 col-xl-4">
        <a href="${rubric.path}" class="text-decoration-none text-reset h-100 d-block" data-link>
          <div class="card h-100 border-0 shadow-sm rubric-card">
            <div class="card-body p-4">
              <div class="rubric-icon mb-3" aria-hidden="true">
                <i class="bi ${rubric.icon} fs-3"></i>
              </div>
              <h2 class="h5 mb-2">${rubric.title}</h2>
              <p class="text-secondary small mb-0">${rubric.description}</p>
            </div>
          </div>
        </a>
      </div>
    `,
  ).join('');

  return `
    <section class="hero-crescendo py-5">
      <div class="container py-lg-3">
        <div class="row align-items-center g-4">
          <div class="col-lg-8">
            <p class="text-uppercase small fw-semibold text-secondary mb-2">
              Музикално образование
            </p>
            <h1 class="display-5 mb-3">Crescendo</h1>
            <p class="lead text-secondary mb-0">
              Академична платформа за изследвания, политики и практики
              в музикалното образование — включително методологиите на El Sistema.
            </p>
          </div>
          <div class="col-lg-4">
            <div class="d-flex flex-wrap gap-2 justify-content-lg-end">
              <a href="/events" class="btn btn-crescendo btn-lg" data-link>Актуално</a>
              <a href="/login" class="btn btn-outline-secondary btn-lg" data-link>Вход</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="container py-5">
      <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 class="h3 mb-1">Петте рубрики</h2>
          <p class="text-secondary mb-0">Изберете тема, за да разгледате материалите.</p>
        </div>
      </div>
      <div class="row g-3">
        ${cards}
      </div>
    </section>
  `;
}
