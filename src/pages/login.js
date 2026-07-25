export async function renderLoginPage() {
  return `
    <section class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow-sm border-0">
            <div class="card-body p-4">
              <h1 class="h3 mb-2">Вход</h1>
              <p class="text-secondary small mb-4">
                За автори и администратори — достъп до работния панел.
              </p>
              <div id="sessionNotice" class="alert alert-secondary d-none" role="status"></div>
              <div id="loginAlert" class="alert alert-danger d-none" role="alert"></div>
              <form id="loginForm" novalidate>
                <div class="mb-3">
                  <label for="loginEmail" class="form-label">Имейл</label>
                  <input
                    type="email"
                    class="form-control"
                    id="loginEmail"
                    name="email"
                    placeholder="имейл@пример.bg"
                    autocomplete="username"
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
                  />
                </div>
                <button type="submit" class="btn btn-crescendo w-100" id="loginSubmit">
                  Влез
                </button>
              </form>
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
  const sessionNotice = document.getElementById('sessionNotice');

  if (!form || !alertEl || !submitBtn) return;

  const { getSession, signIn, signOut, formatAuthError, getUserProfile } =
    await import('../services/auth.js');

  const existing = await getSession();
  if (existing?.user) {
    const profile = await getUserProfile(existing.user, existing.access_token);
    const label = profile.fullName || existing.user.email || 'потребител';
    const roleLabel = profile.role === 'admin' ? 'админ' : 'автор';

    if (sessionNotice) {
      sessionNotice.classList.remove('d-none');
      sessionNotice.innerHTML = `
        Влезли сте като <strong>${label}</strong> (${roleLabel}).
        <div class="mt-2 d-flex flex-wrap gap-2">
          <a class="btn btn-sm btn-crescendo" href="/dashboard.html">Към панела</a>
          <button type="button" class="btn btn-sm btn-outline-secondary" id="switchAccountBtn">
            Смени акаунт
          </button>
        </div>
      `;

      document.getElementById('switchAccountBtn')?.addEventListener('click', async () => {
        await signOut();
        sessionNotice.classList.add('d-none');
        form.reset();
        document.getElementById('loginEmail')?.focus();
      });
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value;

    if (!email || !password) {
      alertEl.textContent = 'Въведете имейл и парола.';
      alertEl.classList.remove('d-none');
      return;
    }

    alertEl.classList.add('d-none');
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Влизане…';

    try {
      // Local clear only — avoids network "Load failed" on Safari
      await signOut();
      const { session: newSession, error } = await signIn(email, password);

      if (error || !newSession) {
        alertEl.textContent = formatAuthError(error);
        alertEl.classList.remove('d-none');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Влез';
        return;
      }

      window.location.replace('/dashboard.html');
    } catch (error) {
      console.error('login submit', error);
      alertEl.textContent = formatAuthError(error);
      alertEl.classList.remove('d-none');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Влез';
    }
  });
}
