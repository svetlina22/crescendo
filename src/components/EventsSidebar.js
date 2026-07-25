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

/** Curated academic / concert photos (Unsplash) for event cards */
const EVENT_IMAGES = [
  'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=640&h=360&q=80',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=640&h=360&q=80',
  'https://images.unsplash.com/photo-1514320291840-b9a56c6f3c5a?auto=format&fit=crop&w=640&h=360&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=640&h=360&q=80',
];

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

function eventImage(event, index) {
  if (event.cover_image_url) return escapeHtml(event.cover_image_url);
  return EVENT_IMAGES[index % EVENT_IMAGES.length];
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
          .map((event, index) => {
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
                    <img
                      src="${eventImage(event, index)}"
                      alt=""
                      class="event-card__img w-100"
                      loading="lazy"
                      width="640"
                      height="150"
                    />
                  </div>
                  <span class="badge text-bg-crescendo-soft mb-2">
                    ${escapeHtml(formatDateBadge(event.start_date))}
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
