import { getRubricByPath } from '../data/rubrics.js';
import { renderRubricPage } from '../components/RubricPage.js';

export async function renderElSistemaPage() {
  const rubric = getRubricByPath('/el-sistema');

  return renderRubricPage({
    title: rubric.title,
    icon: rubric.icon,
    description: rubric.description,
    emptyMessage:
      'Тук ще се показват материали за социални музикални програми и методологиите на El Sistema.',
  });
}
