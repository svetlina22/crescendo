import { getRubricByPage } from '../data/rubrics.js';
import { initRubricArticles } from '../components/RubricPage.js';

/**
 * @param {string} pageId - body[data-page] value
 */
export async function initRubricPage(pageId) {
  const rubric = getRubricByPage(pageId);
  if (!rubric) return;

  const emptyEl = document.getElementById('articlesEmptyMessage');
  const emptyMessage =
    emptyEl?.textContent?.trim() ||
    'Тук ще се показват публикувани статии от тази рубрика.';

  await initRubricArticles(rubric.slug, emptyMessage);
}
