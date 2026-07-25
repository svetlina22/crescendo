/** Placeholder календарни редове до свързване със Supabase */
const SAMPLE_EVENTS = [
  {
    date: '12.09.2026',
    title: 'Семинар: Ползи от ранното музикално обучение',
    location: 'София · Присъствено',
    status: 'Предстоящо',
    statusClass: 'text-bg-primary',
  },
  {
    date: '03.10.2026',
    title: 'Кръгла маса: Политики за достъп до музикално образование',
    location: 'Онлайн',
    status: 'Отворена регистрация',
    statusClass: 'text-bg-success',
  },
  {
    date: '18.11.2026',
    title: 'Уъркшоп: Практики по модела El Sistema',
    location: 'Пловдив · Хибридно',
    status: 'Чернова',
    statusClass: 'text-bg-secondary',
  },
];

/** Календар на събитията — отделно от рубриката „Резонанс“ */
export async function renderEventsPage() {
  const eventRows = SAMPLE_EVENTS.map(
    (event) => `
      <tr>
        <td class="text-nowrap">${event.date}</td>
        <td>${event.title}</td>
        <td>${event.location}</td>
        <td>
          <span class="badge ${event.statusClass}">${event.status}</span>
        </td>
        <td>
          <button type="button" class="btn btn-sm btn-outline-secondary" disabled>
            Детайли
          </button>
        </td>
      </tr>
    `,
  ).join('');

  return `
    <section class="container py-5">
      <div class="mb-4">
        <p class="text-uppercase small fw-semibold text-secondary mb-2">Календар</p>
        <h1 class="h2 mb-2">
          <i class="bi bi-calendar-event me-2 text-secondary" aria-hidden="true"></i>
          Събития
        </h1>
        <p class="lead text-secondary mb-0">
          Дати, локации и формат на предстоящи и минали събития.
          Анонси и отзиви към тях са в рубриката
          <a href="/resonance.html">Резонанс</a>.
        </p>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th scope="col">Дата</th>
                  <th scope="col">Събитие</th>
                  <th scope="col">Локация/Формат</th>
                  <th scope="col">Статус</th>
                  <th scope="col">Действие</th>
                </tr>
              </thead>
              <tbody>
                ${eventRows}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  `;
}
