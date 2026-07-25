import { createEvent } from '../services/events.js';

/**
 * Convert datetime-local value (local wall time) to ISO timestamptz string.
 * @param {string} value
 */
function localDatetimeToIso(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export async function renderAddEventPage() {
  return `
    <section class="container py-5" style="max-width: 40rem">
      <div class="mb-4">
        <p class="text-uppercase small fw-semibold text-secondary mb-2">Админ</p>
        <h1 class="h2 mb-2">Добавяне на събитие</h1>
        <p class="text-secondary mb-0">
          Попълнете формата, за да добавите ново събитие в календара.
        </p>
      </div>

      <div id="addEventAlert" class="alert d-none" role="alert"></div>

      <form id="addEventForm" class="needs-validation" novalidate>
        <div class="mb-3">
          <label for="eventTitle" class="form-label">Заглавие на събитието</label>
          <input
            type="text"
            class="form-control"
            id="eventTitle"
            name="title"
            required
            maxlength="300"
            autocomplete="off"
          />
          <div class="invalid-feedback">Въведете заглавие.</div>
        </div>

        <div class="mb-3">
          <label for="eventDate" class="form-label">Дата и час</label>
          <input
            type="datetime-local"
            class="form-control"
            id="eventDate"
            name="date"
            required
          />
          <div class="invalid-feedback">Изберете дата и час.</div>
        </div>

        <div class="mb-3">
          <label for="eventLocation" class="form-label">Място / Локация</label>
          <input
            type="text"
            class="form-control"
            id="eventLocation"
            name="location"
            required
            maxlength="300"
            placeholder="напр. Аула Magna, СУ или Онлайн"
            autocomplete="off"
          />
          <div class="invalid-feedback">Въведете място или локация.</div>
        </div>

        <div class="mb-3">
          <label for="eventStatus" class="form-label">Статус</label>
          <select class="form-select" id="eventStatus" name="status" required>
            <option value="upcoming" selected>Предстоящо</option>
            <option value="call_for_papers">Call for Papers</option>
            <option value="past">Изминало</option>
          </select>
        </div>

        <div class="mb-3">
          <label for="eventImageUrl" class="form-label">Линк към снимка / Image URL</label>
          <input
            type="text"
            class="form-control"
            id="eventImageUrl"
            name="image_url"
            placeholder="https://…"
            autocomplete="off"
          />
          <div class="form-text">Незадължително поле.</div>
        </div>

        <div class="mb-4">
          <label for="eventDescription" class="form-label">Подробно описание</label>
          <textarea
            class="form-control"
            id="eventDescription"
            name="description"
            rows="8"
            required
          ></textarea>
          <div class="invalid-feedback">Въведете описание.</div>
        </div>

        <div class="d-flex flex-wrap gap-2">
          <button type="submit" class="btn btn-crescendo" id="addEventSubmit">
            <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>
            Добави събитие
          </button>
          <a href="/dashboard.html" class="btn btn-outline-secondary">Към панела</a>
          <a href="/events.html" class="btn btn-link">Календар</a>
        </div>
      </form>
    </section>
  `;
}

export async function initAddEventPage(ctx = {}) {
  const form = document.getElementById('addEventForm');
  const alertEl = document.getElementById('addEventAlert');
  const submitBtn = document.getElementById('addEventSubmit');
  if (!form) return;

  const userId = ctx.user?.id ?? null;

  /**
   * @param {string} message
   * @param {'success' | 'danger'} [variant='success']
   */
  function showAlert(message, variant = 'success') {
    if (!alertEl) return;
    alertEl.className = `alert alert-${variant}`;
    alertEl.textContent = message;
    alertEl.classList.remove('d-none');
    alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    form.classList.add('was-validated');

    if (!form.checkValidity()) return;

    const title = /** @type {HTMLInputElement} */ (form.elements.namedItem('title')).value.trim();
    const dateLocal = /** @type {HTMLInputElement} */ (form.elements.namedItem('date')).value;
    const location = /** @type {HTMLInputElement} */ (
      form.elements.namedItem('location')
    ).value.trim();
    const status = /** @type {HTMLSelectElement} */ (form.elements.namedItem('status')).value;
    const imageUrl = /** @type {HTMLInputElement} */ (
      form.elements.namedItem('image_url')
    ).value.trim();
    const description = /** @type {HTMLTextAreaElement} */ (
      form.elements.namedItem('description')
    ).value.trim();

    const dateIso = localDatetimeToIso(dateLocal);
    if (!dateIso) {
      showAlert('Невалидна дата и час.', 'danger');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>Запис…';
    }

    const { error } = await createEvent({
      title,
      date: dateIso,
      location,
      description,
      image_url: imageUrl || null,
      status: /** @type {'upcoming' | 'past' | 'call_for_papers'} */ (status),
      author_id: userId,
    });

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML =
        '<i class="bi bi-plus-lg me-1" aria-hidden="true"></i>Добави събитие';
    }

    if (error) {
      console.error('addEvent', error);
      showAlert(error.message || 'Записът не бе успешен.', 'danger');
      return;
    }

    form.reset();
    form.classList.remove('was-validated');
    showAlert('Събитието е добавено успешно!', 'success');
  });
}
