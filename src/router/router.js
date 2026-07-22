/**
 * Клиентски History API рутер.
 * Поддържа статични пътища и динамични сегменти (:id).
 */

function pathToRegex(path) {
  const keys = [];
  const pattern = path
    .replace(/\//g, '\\/')
    .replace(/:([A-Za-z0-9_]+)/g, (_, key) => {
      keys.push(key);
      return '([^/]+)';
    });

  return {
    keys,
    regex: new RegExp(`^${pattern}$`),
  };
}

function matchRoute(pathname, routes) {
  const normalized = pathname.replace(/\/+$/, '') || '/';

  for (const route of routes) {
    const { keys, regex } = pathToRegex(route.path);
    const match = normalized.match(regex);

    if (!match) continue;

    const params = {};
    keys.forEach((key, index) => {
      params[key] = decodeURIComponent(match[index + 1]);
    });

    return { route, params };
  }

  return null;
}

export function createRouter({ routes, onResolve }) {
  async function resolve() {
    const pathname = window.location.pathname;
    const matched = matchRoute(pathname, routes);

    if (!matched) {
      await onResolve({
        path: pathname,
        params: {},
        route: {
          path: pathname,
          title: 'Страницата не е намерена',
          render: async () => `
            <section class="container py-5">
              <h1 class="h3">Страницата не е намерена</h1>
              <p class="text-secondary">Няма маршрут за <code>${pathname}</code>.</p>
              <a href="/" class="btn btn-crescendo" data-link>Към началото</a>
            </section>
          `,
        },
      });
      return;
    }

    await onResolve({
      path: pathname,
      params: matched.params,
      route: matched.route,
    });
  }

  function navigate(to, { replace = false } = {}) {
    if (replace) {
      window.history.replaceState({}, '', to);
    } else {
      window.history.pushState({}, '', to);
    }
    resolve();
  }

  function handleClick(event) {
    const anchor = event.target.closest('a[data-link]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto:')) return;

    event.preventDefault();
    if (href !== window.location.pathname) {
      navigate(href);
    }
  }

  function start() {
    document.addEventListener('click', handleClick);
    window.addEventListener('popstate', resolve);
    resolve();
  }

  return { start, navigate, resolve };
}
