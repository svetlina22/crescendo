import { getRubricByPage } from '../data/rubrics.js';
import { renderRubricPage } from '../components/RubricPage.js';

export async function renderPracticesPage() {
  const rubric = getRubricByPage('practices');

  return renderRubricPage({
    title: rubric.title,
    icon: rubric.icon,
    description: rubric.description,
    emptyMessage:
      'Тук ще се показват педагогически методи и практически ръководства.',
  });
}
