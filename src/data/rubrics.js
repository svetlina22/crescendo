/** Петте основни рубрики на Crescendo */
export const RUBRICS = [
  {
    slug: 'benefits',
    path: '/benefits',
    title: 'Ползи',
    icon: 'bi-lightbulb',
    description:
      'Когнитивни, социални и академични ползи от музикалното образование.',
  },
  {
    slug: 'policies',
    path: '/policies',
    title: 'Политики',
    icon: 'bi-bank',
    description:
      'Политики, управление и реформи в музикалното образование.',
  },
  {
    slug: 'practices',
    path: '/practices',
    title: 'Практики',
    icon: 'bi-journal-richtext',
    description:
      'Педагогически методи, подходи и практически ръководства.',
  },
  {
    slug: 'el-sistema',
    path: '/el-sistema',
    title: 'Ел Система',
    icon: 'bi-people',
    description:
      'Социални музикални програми и методологии на El Sistema.',
  },
  {
    slug: 'events',
    path: '/events',
    title: 'Актуално / Събития',
    icon: 'bi-calendar-event',
    description:
      'Новини, редакционни материали и календар на събития.',
  },
];

export function getRubricByPath(path) {
  return RUBRICS.find((r) => r.path === path) ?? null;
}
