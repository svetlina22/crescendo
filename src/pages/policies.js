import { getRubricByPage } from '../data/rubrics.js';
import { renderRubricPage } from '../components/RubricPage.js';

export async function renderPoliciesPage() {
  const rubric = getRubricByPage('policies');

  return renderRubricPage({
    title: rubric.title,
    icon: rubric.icon,
    description: rubric.description,
    slug: rubric.slug,
    emptyMessage:
      'Тук ще се показват документи за политики, управление и образователни реформи.',
  });
}
