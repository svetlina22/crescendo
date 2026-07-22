/** Петте основни рубрики на Crescendo (MPA пътища) */
export const RUBRICS = [
  {
    slug: 'benefits',
    path: '/benefits.html',
    page: 'benefits',
    title: 'Ползи',
    icon: 'bi-lightbulb',
    description:
      'Когнитивни, социални и академични ползи от музикалното образование.',
  },
  {
    slug: 'policies',
    path: '/policies.html',
    page: 'policies',
    title: 'Политики',
    icon: 'bi-bank',
    description:
      'Политики, управление и реформи в музикалното образование.',
  },
  {
    slug: 'practices',
    path: '/practices.html',
    page: 'practices',
    title: 'Практики',
    icon: 'bi-journal-richtext',
    description:
      'Педагогически методи, подходи и практически ръководства.',
  },
  {
    slug: 'el-sistema',
    path: '/el-sistema.html',
    page: 'el-sistema',
    title: 'Ел Система',
    icon: 'bi-people',
    description:
      'Социални музикални програми и методологии на El Sistema.',
  },
  {
    slug: 'events',
    path: '/events.html',
    page: 'events',
    title: 'Актуално / Събития',
    icon: 'bi-calendar-event',
    description:
      'Новини, редакционни материали и календар на събития.',
  },
];

export function getRubricByPage(page) {
  return RUBRICS.find((r) => r.page === page) ?? null;
}

export function getRubricByPath(path) {
  return RUBRICS.find((r) => r.path === path) ?? null;
}
