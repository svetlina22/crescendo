import { createEvent, fetchEventById, updateEvent } from '../services/events.js';

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

/**
 * Convert ISO timestamptz → datetime-local value (local wall time).
 * @param {string} isoDate
 */
function isoToLocalDatetime(isoDate) {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export async function renderAddEventPage() {
  return `
    <section class="container py-4 py-md-5" style="max-width: 40rem">
      <div class="mb-4">
        <p class="text-uppercase small fw-semibold text-secondary mb-2">Администратор</p>
        <h1 class="h2 mb-2" id="addEventTitle">Добавяне на събитие</h1>
        <p class="text-secondary mb-0">
          Попълнете формата, за да добавите ново събитие в календара.
        </p>
      </div>

      <div id="addEventAlert" class="alert d-none" role="alert"></div>

      <form id="addEventForm" class="needs-validation" novalidate>
        <input type="hidden" id="eventId" name="id" value="" />
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
          <label for="eventLocation" class="form-label">Място</label>
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
            <option value="call_for_papers">Покана за доклади</option>
            <option value="past">Изминало</option>
          </select>
        </div>

        <div class="mb-3">
          <label for="eventImageUrl" class="form-label">Линк към снимка</label>
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
  const titleEl = document.getElementById('addEventTitle');
  const idInput = document.getElementById('eventId');
  if (!form) return;

  const userId = ctx.user?.id ?? null;
  const isAdmin = ctx.role === 'admin';
  const accessToken = ctx.accessToken;

  const eventId = new URLSearchParams(window.location.search).get('id');

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

  function setSubmitLabel(isEditing) {
    if (!submitBtn) return;
    submitBtn.innerHTML = isEditing
      ? '<i class="bi bi-check-lg me-1" aria-hidden="true"></i>Запази промените'
      : '<i class="bi bi-plus-lg me-1" aria-hidden="true"></i>Добави събитие';
  }

  if (eventId) {
    if (idInput) idInput.value = eventId;
    if (titleEl) titleEl.textContent = 'Редакция на събитие';
    setSubmitLabel(true);

    const existing = await fetchEventById(eventId);
    if (!existing) {
      showAlert('Събитието не бе намерено.', 'danger');
    } else if (!isAdmin && existing.author_id !== userId) {
      showAlert('Нямате права да редактирате това събитие.', 'danger');
      form.querySelectorAll('input, select, textarea, button[type="submit"]').forEach((el) => {
        el.disabled = true;
      });
    } else {
      /** @type {HTMLInputElement} */ (form.elements.namedItem('title')).value =
        existing.title ?? '';
      /** @type {HTMLInputElement} */ (form.elements.namedItem('date')).value = isoToLocalDatetime(
        existing.date,
      );
      /** @type {HTMLInputElement} */ (form.elements.namedItem('location')).value =
        existing.location ?? '';
      /** @type {HTMLSelectElement} */ (form.elements.namedItem('status')).value =
        existing.status ?? 'upcoming';
      /** @type {HTMLInputElement} */ (form.elements.namedItem('image_url')).value =
        existing.image_url ?? '';
      /** @type {HTMLTextAreaElement} */ (form.elements.namedItem('description')).value =
        existing.description ?? '';
    }
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

    const isEditing = Boolean(idInput?.value);

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>${isEditing ? 'Запазване…' : 'Запис…'}`;
    }

    const payload = {
      title,
      date: dateIso,
      location,
      description,
      image_url: imageUrl || null,
      status: /** @type {'upcoming' | 'past' | 'call_for_papers'} */ (status),
    };

    let error = null;
    if (isEditing) {
      try {
        await updateEvent(accessToken, idInput.value, payload);
      } catch (err) {
        error = err;
      }
    } else {
      const result = await createEvent({ ...payload, author_id: userId });
      error = result.error;
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      setSubmitLabel(isEditing);
    }

    if (error) {
      console.error('saveEvent', error);
      showAlert(error.message || 'Записът не бе успешен.', 'danger');
      return;
    }

    if (isEditing) {
      showAlert('Събитието е обновено успешно!', 'success');
    } else {
      form.reset();
      form.classList.remove('was-validated');
      showAlert('Събитието е добавено успешно!', 'success');
    }
  });
}
