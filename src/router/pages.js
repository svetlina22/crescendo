import { renderHomePage } from '../pages/home.js';
import { renderBenefitsPage } from '../pages/benefits.js';
import { renderPoliciesPage } from '../pages/policies.js';
import { renderPracticesPage } from '../pages/practices.js';
import { renderElSistemaPage } from '../pages/elSistema.js';
import { renderEventsPage } from '../pages/events.js';
import { renderLoginPage } from '../pages/login.js';
import { renderDashboardPage } from '../pages/dashboard.js';

/** MPA page registry — keyed by body[data-page] */
export const pages = {
  home: { title: 'Начало', path: '/index.html', render: renderHomePage },
  benefits: { title: 'Ползи', path: '/benefits.html', render: renderBenefitsPage },
  policies: { title: 'Политики', path: '/policies.html', render: renderPoliciesPage },
  practices: { title: 'Практики', path: '/practices.html', render: renderPracticesPage },
  'el-sistema': {
    title: 'Ел Система',
    path: '/el-sistema.html',
    render: renderElSistemaPage,
  },
  events: {
    title: 'Актуално / Събития',
    path: '/events.html',
    render: renderEventsPage,
  },
  login: { title: 'Вход', path: '/login.html', render: renderLoginPage },
  dashboard: { title: 'Табло', path: '/dashboard.html', render: renderDashboardPage },
};

export function getPage(pageId) {
  return pages[pageId] ?? null;
}
