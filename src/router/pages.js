/**
 * MPA page registry — keyed by body[data-page].
 * Each page is loaded on demand to keep the initial JS bundle small.
 */

/** @typedef {{ title: string, path: string, load: () => Promise<{ render: Function, init?: Function }> }} PageMeta */

/** @type {Record<string, PageMeta>} */
export const pages = {
  home: {
    title: 'Начало',
    path: '/index.html',
    load: async () => {
      const m = await import('../pages/home.js');
      return { render: m.renderHomePage, init: m.initHomePage };
    },
  },
  benefits: {
    title: 'Ползи',
    path: '/benefits.html',
    load: async () => {
      const m = await import('../pages/benefits.js');
      return { render: m.renderBenefitsPage };
    },
  },
  policies: {
    title: 'Политики',
    path: '/policies.html',
    load: async () => {
      const m = await import('../pages/policies.js');
      return { render: m.renderPoliciesPage };
    },
  },
  practices: {
    title: 'Практики',
    path: '/practices.html',
    load: async () => {
      const m = await import('../pages/practices.js');
      return { render: m.renderPracticesPage };
    },
  },
  'el-sistema': {
    title: 'Ел Система',
    path: '/el-sistema.html',
    load: async () => {
      const m = await import('../pages/elSistema.js');
      return { render: m.renderElSistemaPage };
    },
  },
  resonance: {
    title: 'Резонанс',
    path: '/resonance.html',
    load: async () => {
      const m = await import('../pages/resonance.js');
      return { render: m.renderResonancePage };
    },
  },
  events: {
    title: 'Събития',
    path: '/events.html',
    load: async () => {
      const m = await import('../pages/events.js');
      return { render: m.renderEventsPage };
    },
  },
  article: {
    title: 'Статия',
    path: '/article.html',
    load: async () => {
      const m = await import('../pages/article.js');
      return { render: m.renderArticlePage };
    },
  },
  about: {
    title: 'За нас',
    path: '/about.html',
    load: async () => {
      const m = await import('../pages/about.js');
      return { render: m.renderAboutPage };
    },
  },
  login: {
    title: 'Вход',
    path: '/login.html',
    load: async () => {
      const m = await import('../pages/login.js');
      return { render: m.renderLoginPage, init: m.initLoginPage };
    },
  },
  dashboard: {
    title: 'Панел',
    path: '/dashboard.html',
    load: async () => {
      const m = await import('../pages/dashboard.js');
      return { render: m.renderDashboardPage, init: m.initDashboardPage };
    },
  },
  'add-event': {
    title: 'Добавяне на събитие',
    path: '/add-event.html',
    load: async () => {
      const m = await import('../pages/addEvent.js');
      return { render: m.renderAddEventPage, init: m.initAddEventPage };
    },
  },
};

/**
 * @param {string} pageId
 * @returns {PageMeta | null}
 */
export function getPageMeta(pageId) {
  return pages[pageId] ?? null;
}

/**
 * @param {string} pageId
 * @returns {Promise<{ title: string, path: string, render: Function, init?: Function } | null>}
 */
export async function loadPage(pageId) {
  const meta = getPageMeta(pageId);
  if (!meta) return null;
  const handlers = await meta.load();
  return { title: meta.title, path: meta.path, ...handlers };
}
