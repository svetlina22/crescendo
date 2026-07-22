export function renderFooter() {
  const year = new Date().getFullYear();

  return `
    <footer class="footer-crescendo mt-auto py-4">
      <div class="container d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
        <p class="mb-0 small">&copy; ${year} Crescendo — music education research</p>
        <nav class="d-flex gap-3 small">
          <a href="/" data-link>Home</a>
          <a href="/dashboard" data-link>Dashboard</a>
          <a href="/login" data-link>Login</a>
        </nav>
      </div>
    </footer>
  `;
}
