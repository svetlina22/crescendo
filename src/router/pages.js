/**
 * MPA page registry — keyed by body[data-page].
 * Pages with static HTML in #page use htmlFirst: true (text editable in .html files).
 */

/** @type {Record<string, { title: string, path: string, htmlFirst?: boolean, load: Function }>} */
export const pages = {
  home: {
    title: 'Начало',
    path: '/index.html',
    htmlFirst: true,
    load: async () => {
      const m = await import('../pages/home.js');
      return { init: m.initHomePage };
    },
  },
  benefits: {
    title: 'Ползи',
    path: '/benefits.html',
    htmlFirst: true,
    load: async () => {
      const m = await import('../pages/rubricInit.js');
      return { init: () => m.initRubricPage('benefits') };
    },
  },
  policies: {
    title: 'Политики',
    path: '/policies.html',
    htmlFirst: true,
    load: async () => {
      const m = await import('../pages/rubricInit.js');
      return { init: () => m.initRubricPage('policies') };
    },
  },
  practices: {
    title: 'Практики',
    path: '/practices.html',
    htmlFirst: true,
    load: async () => {
      const m = await import('../pages/rubricInit.js');
      return { init: () => m.initRubricPage('practices') };
    },
  },
  'el-sistema': {
    title: 'Ел Система',
    path: '/el-sistema.html',
    htmlFirst: true,
    load: async () => {
      const m = await import('../pages/rubricInit.js');
      return { init: () => m.initRubricPage('el-sistema') };
    },
  },
  resonance: {
    title: 'Резонанс',
    path: '/resonance.html',
    htmlFirst: true,
    load: async () => {
      const m = await import('../pages/rubricInit.js');
      return { init: () => m.initRubricPage('resonance') };
    },
  },
  events: {
    title: 'Събития',
    path: '/events.html',
    htmlFirst: true,
    load: async () => {
      const m = await import('../pages/events.js');
      return { init: m.initEventsPage };
    },
  },
  about: {
    title: 'За нас',
    path: '/about.html',
    htmlFirst: true,
    load: async () => ({}),
  },
  article: {
    title: 'Статия',
    path: '/article.html',
    load: async () => {
      const m = await import('../pages/article.js');
      return { render: m.renderArticlePage };
    },
  },
  login: {
    title: 'Вход',
    path: '/login.html',
    htmlFirst: true,
    load: async () => {
      const m = await import('../pages/login.js');
      return { init: m.initLoginPage };
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

export function getPageMeta(pageId) {
  return pages[pageId] ?? null;
}

export async function loadPage(pageId) {
  const meta = getPageMeta(pageId);
  if (!meta) return null;
  const handlers = await meta.load();
  return { title: meta.title, path: meta.path, htmlFirst: meta.htmlFirst, ...handlers };
}
