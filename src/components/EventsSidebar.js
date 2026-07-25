const BG_MONTHS_SHORT = [
  'ЯН',
  'ФЕВ',
  'МАР',
  'АПР',
  'МАЙ',
  'ЮНИ',
  'ЮЛИ',
  'АВГ',
  'СЕП',
  'ОКТ',
  'НОЕ',
  'ДЕК',
];

/** Local placeholder — avoid slow Unsplash fallbacks on the home sidebar */
const EVENT_PLACEHOLDER =
  '<div class="event-card__placeholder d-flex align-items-center justify-content-center bg-light text-secondary rounded" aria-hidden="true"><i class="bi bi-calendar-event fs-3"></i></div>';

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
  const day = date.getDate();
  const month = BG_MONTHS_SHORT[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function locationLabel(event) {
  const place = event.location?.trim();
  if (event.event_type === 'online') {
    return place ? `${place} / Онлайн` : 'Онлайн';
  }
  if (event.event_type === 'hybrid') {
    return place ? `${place} / Хибридно` : 'Хибридно';
  }
  return place || 'Място предстои';
}

function eventHref(event) {
  if (event.registration_link) return escapeHtml(event.registration_link);
  return '/events.html';
}

function eventMedia(event) {
  if (event.image_url) {
    return `
      <img
        src="${escapeHtml(event.image_url)}"
        alt=""
        class="event-card__img w-100"
        loading="lazy"
        decoding="async"
        width="640"
        height="150"
      />
    `;
  }
  return EVENT_PLACEHOLDER;
}

/**
 * @param {Array} events
 */
export function renderEventsSidebar(events = []) {
  const items =
    events.length === 0
      ? `
        <p class="small text-secondary mb-0">
          Няма планирани събития за момента.
        </p>
      `
      : events
          .map((event) => {
            const href = eventHref(event);
            const external = Boolean(event.registration_link);
            return `
              <article class="event-card mb-3">
                <a
                  href="${href}"
                  class="text-decoration-none text-reset d-block"
                  ${external ? 'target="_blank" rel="noopener noreferrer"' : ''}
                >
                  <div class="event-card__media rounded overflow-hidden mb-2">
                    ${eventMedia(event)}
                  </div>
                  <span class="badge text-bg-crescendo-soft mb-2">
                    ${escapeHtml(formatDateBadge(event.date))}
                  </span>
                  <h3 class="h6 mb-1 event-card__title">
                    ${escapeHtml(event.title)}
                  </h3>
                  <p class="small text-secondary mb-0">
                    <i class="bi bi-geo-alt" aria-hidden="true"></i>
                    ${escapeHtml(locationLabel(event))}
                  </p>
                </a>
              </article>
            `;
          })
          .join('');

  return `
    <aside class="card border-0 shadow-sm mb-4">
      <div class="card-body p-3 p-lg-4">
        <h2 class="h5 mb-3">Предстоящи събития</h2>
        ${items}
        <div class="pt-2 border-top">
          <a href="/events.html" class="small fw-semibold text-decoration-none">
            Всички събития
            <i class="bi bi-arrow-right" aria-hidden="true"></i>
          </a>
        </div>
      </div>
    </aside>
  `;
}
