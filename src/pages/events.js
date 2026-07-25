import { fetchEvents } from '../services/events.js';

const BG_MONTHS = [
  'Януари',
  'Февруари',
  'Март',
  'Април',
  'Май',
  'Юни',
  'Юли',
  'Август',
  'Септември',
  'Октомври',
  'Ноември',
  'Декември',
];

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** e.g. "15 Октомври 2026" */
function formatEventDate(isoDate) {
  if (!isoDate) return '—';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.getDate()} ${BG_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function statusMeta(status) {
  if (status === 'call_for_papers') {
    return { label: 'Call for Papers', className: 'text-bg-info' };
  }
  if (status === 'past') {
    return { label: 'Изминало', className: 'text-bg-secondary' };
  }
  return { label: 'Предстоящо', className: 'text-bg-primary' };
}

function renderEventCard(event) {
  const status = statusMeta(event.status);
  const imageHtml = event.image_url
    ? `<img
         src="${escapeHtml(event.image_url)}"
         class="card-img-top"
         alt=""
         loading="lazy"
         style="height: 14rem; object-fit: cover"
       />`
    : `<div
         class="bg-light d-flex align-items-center justify-content-center text-secondary"
         style="height: 14rem"
         aria-hidden="true"
       >
         <i class="bi bi-calendar-event display-6"></i>
       </div>`;

  return `
    <div class="col-12 col-md-6 col-xl-4">
      <article class="card h-100 border-0 shadow-sm">
        ${imageHtml}
        <div class="card-body d-flex flex-column">
          <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
            <span class="badge text-bg-crescendo-soft">${escapeHtml(formatEventDate(event.date))}</span>
            <span class="badge ${status.className}">${status.label}</span>
          </div>
          <h2 class="h5 card-title">${escapeHtml(event.title)}</h2>
          <p class="small text-secondary mb-3">
            <i class="bi bi-geo-alt" aria-hidden="true"></i>
            ${escapeHtml(event.location || '—')}
          </p>
          <p class="card-text text-secondary mb-0 flex-grow-1" style="white-space: pre-wrap">
            ${escapeHtml(event.description || '')}
          </p>
        </div>
      </article>
    </div>
  `;
}

/** Календар на събитията — данни от Supabase */
export async function renderEventsPage() {
  const events = await fetchEvents();

  const body =
    events.length === 0
      ? `
        <div class="alert alert-light border text-secondary mb-0" role="status">
          Няма намерени събития
        </div>
      `
      : `
        <div class="row g-4">
          ${events.map(renderEventCard).join('')}
        </div>
      `;

  return `
    <section class="container py-5">
      <div class="mb-4">
        <h1 class="h2 mb-2">Събития</h1>
        <p class="lead text-secondary mb-0">
          Дати, локации и описания на предстоящи и минали събития.
        </p>
      </div>
      ${body}
    </section>
  `;
}
