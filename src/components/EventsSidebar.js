import { getEventImage } from '../data/visuals.js';

const BG_MONTHS_SHORT = ['ЯН','ФЕВ','МАР','АПР','МАЙ','ЮНИ','ЮЛИ','АВГ','СЕП','ОКТ','НОЕ','ДЕК'];

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function formatDateBadge(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.getDate()} ${BG_MONTHS_SHORT[date.getMonth()]}`;
}

function locationLabel(event) {
  const place = event.location?.trim();
  if (event.event_type === 'online') return place ? `${place} / Онлайн` : 'Онлайн';
  if (event.event_type === 'hybrid') return place ? `${place} / Хибридно` : 'Хибридно';
  return place || 'Място предстои';
}

export function renderEventsSidebar(events = []) {
  const items =
    events.length === 0
      ? `<p class="small text-secondary mb-0">Няма планирани събития.</p>`
      : events
          .map((event, i) => {
            const img = escapeHtml(getEventImage(event, i));
            const href = event.registration_link
              ? escapeHtml(event.registration_link)
              : '/events.html';
            const external = Boolean(event.registration_link);
            return `
              <article class="event-card mb-3">
                <a href="${href}" class="text-decoration-none text-reset d-block"
                  ${external ? 'target="_blank" rel="noopener noreferrer"' : ''}>
                  <div class="event-card__media">
                    <img src="${img}" alt="" class="event-card__img" loading="lazy" decoding="async" />
                  </div>
                  <span class="badge text-bg-crescendo-soft mb-1">${escapeHtml(formatDateBadge(event.date))}</span>
                  <h3 class="h6 event-card__title mb-1">${escapeHtml(event.title)}</h3>
                  <p class="small text-secondary mb-0">
                    <i class="bi bi-geo-alt"></i> ${escapeHtml(locationLabel(event))}
                  </p>
                </a>
              </article>`;
          })
          .join('');

  return `
    <aside class="sidebar-panel">
      <h2 class="widget-title">Предстоящи събития</h2>
      ${items}
      <a href="/events.html" class="small fw-bold text-decoration-none mt-2 d-inline-block">
        Всички събития <i class="bi bi-arrow-right"></i>
      </a>
    </aside>`;
}
