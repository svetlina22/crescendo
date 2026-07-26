/**
 * Client-side validation for the article create/edit form (dashboard modal).
 * @param {{
 *   title?: string,
 *   rubricId?: string,
 *   slug?: string,
 *   content?: string,
 * }} fields
 * @returns {{ ok: boolean, errors: { field: string, message: string }[] }}
 */
export function validateArticleForm(fields = {}) {
  /** @type {{ field: string, message: string }[]} */
  const errors = [];

  if (!String(fields.title ?? '').trim()) {
    errors.push({ field: 'title', message: 'Въведете заглавие.' });
  }
  if (!String(fields.rubricId ?? '').trim()) {
    errors.push({ field: 'rubricId', message: 'Изберете рубрика.' });
  }
  if (!String(fields.slug ?? '').trim()) {
    errors.push({ field: 'slug', message: 'Въведете адрес след рубриката.' });
  }

  const contentHtml = String(fields.content ?? '');
  const contentText = contentHtml
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!contentText) {
    errors.push({ field: 'content', message: 'Въведете основен текст.' });
  }

  return { ok: errors.length === 0, errors };
}
