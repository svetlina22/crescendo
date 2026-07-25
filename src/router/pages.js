import { renderHomePage, initHomePage } from '../pages/home.js';
import { renderBenefitsPage } from '../pages/benefits.js';
import { renderPoliciesPage } from '../pages/policies.js';
import { renderPracticesPage } from '../pages/practices.js';
import { renderElSistemaPage } from '../pages/elSistema.js';
import { renderResonancePage } from '../pages/resonance.js';
import { renderEventsPage } from '../pages/events.js';
import { renderLoginPage, initLoginPage } from '../pages/login.js';
import { renderDashboardPage, initDashboardPage } from '../pages/dashboard.js';
import { renderArticlePage } from '../pages/article.js';
import { renderAboutPage } from '../pages/about.js';

/** MPA page registry — keyed by body[data-page] */
export const pages = {
  home: { title: 'Начало', path: '/index.html', render: renderHomePage, init: initHomePage },
  benefits: { title: 'Ползи', path: '/benefits.html', render: renderBenefitsPage },
  policies: { title: 'Политики', path: '/policies.html', render: renderPoliciesPage },
  practices: { title: 'Практики', path: '/practices.html', render: renderPracticesPage },
  'el-sistema': {
    title: 'Ел Система',
    path: '/el-sistema.html',
    render: renderElSistemaPage,
  },
  resonance: {
    title: 'Резонанс',
    path: '/resonance.html',
    render: renderResonancePage,
  },
  events: {
    title: 'Събития',
    path: '/events.html',
    render: renderEventsPage,
  },
  article: {
    title: 'Статия',
    path: '/article.html',
    render: renderArticlePage,
  },
  about: {
    title: 'За нас',
    path: '/about.html',
    render: renderAboutPage,
  },
  login: { title: 'Вход', path: '/login.html', render: renderLoginPage, init: initLoginPage },
  dashboard: {
    title: 'Панел',
    path: '/dashboard.html',
    render: renderDashboardPage,
    init: initDashboardPage,
  },
};

export function getPage(pageId) {
  return pages[pageId] ?? null;
}
