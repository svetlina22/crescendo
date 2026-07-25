import { getRubricByPage } from '../data/rubrics.js';
import { renderRubricPage } from '../components/RubricPage.js';

export async function renderBenefitsPage() {
  const rubric = getRubricByPage('benefits');

  return renderRubricPage({
    title: rubric.title,
    icon: rubric.icon,
    description: rubric.description,
    slug: rubric.slug,
    emptyMessage:
      'Тук ще се показват статии за когнитивните и социалните ползи от музикалното образование.',
  });
}
