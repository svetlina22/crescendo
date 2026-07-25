import { getRubricByPage } from '../data/rubrics.js';
import { renderRubricPage } from '../components/RubricPage.js';

export async function renderResonancePage() {
  const rubric = getRubricByPage('resonance');

  return renderRubricPage({
    title: rubric.title,
    icon: rubric.icon,
    description: rubric.description,
    emptyMessage:
      'Тук ще се показват анонси, отзиви и редакционни материали от рубриката „Резонанс“.',
  });
}
