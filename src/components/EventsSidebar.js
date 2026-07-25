const BG_MONTHS_SHORT = [
  'ян',
  'фев',
  'мар',
  'апр',
  'май',
  'юни',
  'юли',
  'авг',
  'сеп',
  'окт',
  'ное',
  'дек',
];

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function formatEventParts(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return { day: '—', month: '', time: '' };
  }

  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: BG_MONTHS_SHORT[date.getMonth()],
    time: date.toLocaleTimeString('bg-BG', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

function locationLabel(event) {
  if (event.event_type === 'online') return 'Онлайн';
  if (event.location?.trim()) return event.location.trim();
  if (event.event_type === 'hybrid') return 'Хибридно';
  return 'Място предстои';
}

function eventHref(event) {
  if (event.registration_link) return escapeHtml(event.registration_link);
  return '/events.html';
}

/**
 * @param {Array} events
 */
export function renderEventsSidebar(events = []) {
  const body =
    events.length === 0
      ? `
        <p class="small text-secondary mb-0 px-1">
          Няма планирани събития за момента.
        </p>
      `
      : `
        <ul class="list-unstyled mb-0 events-sidebar__list">
          ${events
            .map((event) => {
              const { day, month, time } = formatEventParts(event.start_date);
              const href = eventHref(event);
              const external = Boolean(event.registration_link);
              return `
                <li class="events-sidebar__item">
                  <div class="events-sidebar__date" aria-hidden="true">
                    <span class="events-sidebar__day">${day}</span>
                    <span class="events-sidebar__month">${month}</span>
                  </div>
                  <div class="events-sidebar__meta">
                    <a
                      class="events-sidebar__title"
                      href="${href}"
                      ${external ? 'target="_blank" rel="noopener noreferrer"' : ''}
                    >
                      ${escapeHtml(event.title)}
                    </a>
                    <p class="events-sidebar__location mb-0">
                      <i class="bi bi-geo-alt" aria-hidden="true"></i>
                      ${escapeHtml(locationLabel(event))}
                    </p>
                    <p class="events-sidebar__time mb-0">
                      <i class="bi bi-clock" aria-hidden="true"></i>
                      ${escapeHtml(time)}
                    </p>
                  </div>
                </li>
              `;
            })
            .join('')}
        </ul>
      `;

  return `
    <aside class="events-sidebar card border-0 shadow-sm">
      <div class="card-body p-4">
        <h2 class="h5 mb-3 d-flex align-items-center gap-2">
          <i class="bi bi-calendar-event text-secondary" aria-hidden="true"></i>
          Предстоящи събития
        </h2>
        ${body}
        <div class="mt-3 pt-3 border-top">
          <a href="/events.html" class="small link-underline-opacity-0">
            Към календара
            <i class="bi bi-arrow-right" aria-hidden="true"></i>
          </a>
        </div>
      </div>
    </aside>
  `;
}
