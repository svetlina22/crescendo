import { getRubricByPath } from '../data/rubrics.js';
import { renderRubricPage } from '../components/RubricPage.js';

export async function renderPoliciesPage() {
  const rubric = getRubricByPath('/policies');

  return renderRubricPage({
    title: rubric.title,
    icon: rubric.icon,
    description: rubric.description,
    emptyMessage:
      'Тук ще се показват документи за политики, управление и образователни реформи.',
  });
}
