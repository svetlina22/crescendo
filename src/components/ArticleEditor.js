import Quill from 'quill';
import 'quill/dist/quill.snow.css';

/**
 * @param {string | null | undefined} html
 */
export function isRichTextEmpty(html) {
  const text = String(html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length === 0;
}

/**
 * Plain text → simple HTML paragraphs (legacy articles without Quill markup).
 * @param {string} content
 */
export function plainTextToHtml(content) {
  const text = String(content ?? '').trim();
  if (!text) return '';
  return text
    .split(/\n{2,}/)
    .map((block) => {
      const lines = String(block)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll('\n', '<br />');
      return `<p>${lines}</p>`;
    })
    .join('');
}

/**
 * Render article body: Quill HTML as-is; legacy plain text escaped.
 * @param {string | null | undefined} content
 */
export function formatArticleBodyHtml(content) {
  const raw = String(content ?? '').trim();
  if (!raw) {
    return '<p class="text-secondary">Няма съдържание.</p>';
  }
  if (/<[a-z][\s\S]*>/i.test(raw)) {
    return raw;
  }
  return plainTextToHtml(raw);
}

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  [{ size: ['small', false, 'large', 'huge'] }],
  ['bold', 'italic', 'underline'],
  ['blockquote'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link'],
  ['clean'],
];

/**
 * @param {HTMLElement} container
 * @returns {import('quill').default}
 */
export function createArticleQuill(container) {
  return new Quill(container, {
    theme: 'snow',
    placeholder: 'Напишете основния текст на статията…',
    modules: {
      toolbar: TOOLBAR,
    },
  });
}

/**
 * @param {import('quill').default} quill
 * @param {string | null | undefined} html
 */
export function setQuillHtml(quill, html) {
  const raw = String(html ?? '').trim();
  const safe = raw && /<[a-z][\s\S]*>/i.test(raw) ? raw : plainTextToHtml(raw);
  quill.setText('');
  if (!safe) {
    quill.setText('');
    return;
  }
  quill.clipboard.dangerouslyPasteHTML(safe);
}

/**
 * @param {import('quill').default} quill
 */
export function getQuillHtml(quill) {
  return quill?.root?.innerHTML ?? '';
}
