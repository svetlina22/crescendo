export async function renderDashboardPage() {
  return `
    <section class="container py-5">
      <div class="mb-4">
        <h1 class="h3 mb-1">Табло</h1>
        <p class="text-secondary mb-0">
          Работно пространство за автори (създаване на чернови) и администратори (публикуване).
        </p>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <h2 class="h6 text-secondary">Чернови</h2>
              <p class="display-6 mb-0">0</p>
              <p class="small text-secondary mb-0">Авторски материали със статус „draft“</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <h2 class="h6 text-secondary">Публикувани</h2>
              <p class="display-6 mb-0">0</p>
              <p class="small text-secondary mb-0">Само администратор може да публикува</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <h2 class="h6 text-secondary">Роля</h2>
              <p class="display-6 mb-0">—</p>
              <p class="small text-secondary mb-0">author | admin</p>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-secondary mb-0" role="status">
        Следваща стъпка: свързване със Supabase Auth и RLS правилата за роли.
      </div>
    </section>
  `;
}
