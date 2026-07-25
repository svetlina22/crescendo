import { fetchEvents } from '../services/events.js';
import { getEventImage } from '../data/visuals.js';

const BG_MONTHS = [
  'Януари','Февруари','Март','Април','Май','Юни',
  'Юли','Август','Септември','Октомври','Ноември','Декември',
];

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function formatEventDate(isoDate) {
  if (!isoDate) return '—';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.getDate()} ${BG_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function statusMeta(status) {
  if (status === 'call_for_papers') return { label: 'Call for Papers', className: 'badge-cat--policy' };
  if (status === 'past') return { label: 'Изминало', className: 'badge-cat--inspiration' };
  return { label: 'Предстоящо', className: 'badge-cat--event' };
}

function renderEventCard(event, index) {
  const status = statusMeta(event.status);
  const img = escapeHtml(getEventImage(event, index));
  return `
    <div class="col-12 col-md-6 col-xl-4">
      <article class="card event-page-card h-100">
        <img src="${img}" class="card-img-top" alt="" loading="lazy" />
        <div class="card-body d-flex flex-column">
          <div class="d-flex flex-wrap gap-2 mb-2">
            <span class="badge text-bg-crescendo-soft">${escapeHtml(formatEventDate(event.date))}</span>
            <span class="badge-cat ${status.className}">${status.label}</span>
          </div>
          <h2 class="h5 card-title">${escapeHtml(event.title)}</h2>
          <p class="small text-secondary mb-2"><i class="bi bi-geo-alt"></i> ${escapeHtml(event.location || '—')}</p>
          <p class="card-text text-secondary small mb-0 flex-grow-1" style="white-space:pre-wrap">${escapeHtml(event.description || '')}</p>
        </div>
      </article>
    </div>`;
}

/** Зарежда събития в #eventsGrid — текстовете са в events.html */
export async function initEventsPage() {
  const gridEl = document.getElementById('eventsGrid');
  if (!gridEl) return;

  gridEl.innerHTML = `
    <div class="col-12 text-center text-secondary py-4">
      <div class="spinner-border spinner-border-sm"></div>
      <span class="ms-2">Зареждане…</span>
    </div>`;

  const events = await fetchEvents();
  gridEl.innerHTML =
    events.length === 0
      ? `<div class="col-12"><p class="text-secondary mb-0">Няма намерени събития</p></div>`
      : events.map(renderEventCard).join('');
}
