import { getRubricByPage } from '../data/rubrics.js';
import { renderRubricPage } from '../components/RubricPage.js';

export async function renderElSistemaPage() {
  const rubric = getRubricByPage('el-sistema');

  return renderRubricPage({
    title: rubric.title,
    icon: rubric.icon,
    description: rubric.description,
    slug: rubric.slug,
    emptyMessage:
      'Тук ще се показват материали за социални музикални програми и методологиите на El Sistema.',
  });
}
