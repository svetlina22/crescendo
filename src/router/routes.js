import { renderHomePage } from '../pages/home.js';
import { renderLoginPage } from '../pages/login.js';
import { renderDashboardPage } from '../pages/dashboard.js';
import { renderGamePage } from '../pages/game.js';

export const routes = [
  {
    path: '/',
    title: 'Home',
    render: renderHomePage,
  },
  {
    path: '/login',
    title: 'Login',
    render: renderLoginPage,
  },
  {
    path: '/dashboard',
    title: 'Dashboard',
    render: renderDashboardPage,
  },
  {
    path: '/games/:id',
    title: 'Game',
    render: renderGamePage,
  },
];
