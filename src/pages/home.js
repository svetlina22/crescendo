import { RUBRICS } from '../data/rubrics.js';
import { fetchPublishedArticles } from '../services/articles.js';
import { fetchUpcomingEvents } from '../services/events.js';
import { renderArticlesFeed } from '../components/ArticlesFeed.js';
import { renderEventsSidebar } from '../components/EventsSidebar.js';

export async function renderHomePage() {
  let articles = [];
  let events = [];

  try {
    [articles, events] = await Promise.all([
      fetchPublishedArticles(8),
      fetchUpcomingEvents(4),
    ]);
  } catch (error) {
    console.error('renderHomePage fetch failed', error);
  }

  const rubricStrip = RUBRICS.map(
    (rubric) => `
      <a href="${rubric.path}" class="badge rounded-pill text-bg-light text-decoration-none px-3 py-2">
        <i class="bi ${rubric.icon} me-1" aria-hidden="true"></i>
        ${rubric.title}
      </a>
    `,
  ).join('');

  return `
    <section class="hero-crescendo py-4 py-lg-5">
      <div class="container">
        <div class="row align-items-center g-3">
          <div class="col-lg-8">
            <p class="text-uppercase small fw-semibold text-secondary mb-2">
              Музикално образование
            </p>
            <h1 class="display-5 mb-2">Crescendo</h1>
            <p class="lead text-secondary mb-0">
              Академична платформа за изследвания, политики и практики
              в музикалното образование.
            </p>
          </div>
          <div class="col-lg-4">
            <div class="d-flex flex-wrap gap-2 justify-content-lg-end">
              ${rubricStrip}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="container py-5">
      <div class="row g-4 align-items-start">
        <div class="col-lg-8">
          ${renderArticlesFeed(articles)}
        </div>
        <div class="col-lg-4">
          <div class="events-sidebar-sticky">
            ${renderEventsSidebar(events)}
          </div>
        </div>
      </div>
    </section>
  `;
}
