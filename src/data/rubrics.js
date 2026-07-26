/** Петте основни рубрики на Crescendo (MPA пътища) */
export const RUBRICS = [
  {
    slug: 'benefits',
    path: '/benefits.html',
    page: 'benefits',
    title: 'Ползи',
    icon: 'bi-lightbulb',
    accent: 'inspiration',
    description:
      'Когнитивни, социални и академични ползи от музикалното образование.',
  },
  {
    slug: 'policies',
    path: '/policies.html',
    page: 'policies',
    title: 'Политики',
    icon: 'bi-bank',
    accent: 'policy',
    description:
      'Политики, управление и реформи в музикалното образование.',
  },
  {
    slug: 'practices',
    path: '/practices.html',
    page: 'practices',
    title: 'Практики',
    icon: 'bi-music-note-beamed',
    accent: 'practice',
    description:
      'Педагогически методи, подходи и практически ръководства.',
  },
  {
    slug: 'el-sistema',
    path: '/el-sistema.html',
    page: 'el-sistema',
    title: 'El Sistema',
    icon: 'bi-people',
    accent: 'practice',
    description:
      'Социални музикални програми и методологии на El Sistema.',
  },
  {
    slug: 'resonance',
    path: '/resonance.html',
    page: 'resonance',
    title: 'Резонанс',
    icon: 'bi-broadcast',
    accent: 'event',
    description:
      'Анонси, отзиви и редакционни материали от академичния музикален живот.',
  },
];

export function getRubricByPage(page) {
  return RUBRICS.find((r) => r.page === page) ?? null;
}

export function getRubricByPath(path) {
  return RUBRICS.find((r) => r.path === path) ?? null;
}

export function getRubricBySlug(slug) {
  return RUBRICS.find((r) => r.slug === slug) ?? null;
}

/** @returns {'practice' | 'policy' | 'inspiration' | 'event'} */
export function getRubricAccent(slug) {
  return getRubricBySlug(slug)?.accent ?? 'practice';
}
