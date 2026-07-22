import { renderHomePage } from '../pages/home.js';
import { renderBenefitsPage } from '../pages/benefits.js';
import { renderPoliciesPage } from '../pages/policies.js';
import { renderPracticesPage } from '../pages/practices.js';
import { renderElSistemaPage } from '../pages/elSistema.js';
import { renderEventsPage } from '../pages/events.js';
import { renderLoginPage } from '../pages/login.js';
import { renderDashboardPage } from '../pages/dashboard.js';

export const routes = [
  { path: '/', title: 'Начало', render: renderHomePage },
  { path: '/benefits', title: 'Ползи', render: renderBenefitsPage },
  { path: '/policies', title: 'Политики', render: renderPoliciesPage },
  { path: '/practices', title: 'Практики', render: renderPracticesPage },
  { path: '/el-sistema', title: 'Ел Система', render: renderElSistemaPage },
  { path: '/events', title: 'Актуално / Събития', render: renderEventsPage },
  { path: '/login', title: 'Вход', render: renderLoginPage },
  { path: '/dashboard', title: 'Табло', render: renderDashboardPage },
];
