export async function renderLoginPage() {
  return `
    <section class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow-sm border-0">
            <div class="card-body p-4">
              <h1 class="h3 mb-2">Вход</h1>
              <p class="text-secondary small mb-4">
                За автори и администратори — достъп до панела „Моите статии“.
              </p>
              <div id="loginAlert" class="alert alert-danger d-none" role="alert"></div>
              <form id="loginForm" novalidate>
                <div class="mb-3">
                  <label for="loginEmail" class="form-label">Имейл</label>
                  <input
                    type="email"
                    class="form-control"
                    id="loginEmail"
                    name="email"
                    placeholder="admin@crescendo.bg"
                    autocomplete="username"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label for="loginPassword" class="form-label">Парола</label>
                  <input
                    type="password"
                    class="form-control"
                    id="loginPassword"
                    name="password"
                    placeholder="••••••"
                    autocomplete="current-password"
                    required
                  />
                </div>
                <button type="submit" class="btn btn-crescendo w-100" id="loginSubmit">
                  Влез
                </button>
              </form>
              <p class="text-secondary small mt-3 mb-0">
                Demo: <code>admin@crescendo.bg</code> / <code>123123</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export async function initLoginPage() {
  const form = document.getElementById('loginForm');
  const alertEl = document.getElementById('loginAlert');
  const submitBtn = document.getElementById('loginSubmit');

  if (!form || !alertEl || !submitBtn) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const { signIn, formatAuthError } = await import('../services/auth.js');
    const email = form.email.value.trim();
    const password = form.password.value;

    alertEl.classList.add('d-none');
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Влизане…';

    const { session: newSession, error } = await signIn(email, password);

    if (error || !newSession) {
      alertEl.textContent = formatAuthError(error);
      alertEl.classList.remove('d-none');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Влез';
      return;
    }

    window.location.replace('/dashboard.html');
  });

  const { getSession } = await import('../services/auth.js');
  const session = await getSession();
  if (session) {
    window.location.replace('/dashboard.html');
  }
}
