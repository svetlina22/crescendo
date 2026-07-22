export async function renderLoginPage() {
  return `
    <section class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow-sm border-0">
            <div class="card-body p-4">
              <h1 class="h3 mb-2">Вход</h1>
              <p class="text-secondary small mb-4">
                Подготвено за автори (чернови) и администратори (публикуване).
              </p>
              <form>
                <div class="mb-3">
                  <label for="email" class="form-label">Имейл</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    placeholder="ime@primer.bg"
                    autocomplete="username"
                  />
                </div>
                <div class="mb-3">
                  <label for="password" class="form-label">Парола</label>
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                    placeholder="••••••••"
                    autocomplete="current-password"
                  />
                </div>
                <button type="button" class="btn btn-crescendo w-100">Влез</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
