/** Site-wide SEO / branding constants */

export const SITE_NAME = 'Crescendo';

/** Production origin — override with VITE_SITE_URL in `.env` */
export const SITE_URL = String(
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) ||
    'https://crescendo.bg',
)
  .trim()
  .replace(/\/$/, '');

export const DEFAULT_DESCRIPTION =
  'Crescendo — академична платформа за музикално образование: практики, политики, El Sistema, събития и учебни ресурси.';

export const DEFAULT_KEYWORDS =
  'музикално образование, Crescendo, педагогика, El Sistema, солфеж, хорове, образователни политики, учебни ресурси';

export const DEFAULT_OG_IMAGE =
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&h=630&q=80';

export const ORGANIZATION = {
  name: SITE_NAME,
  url: SITE_URL,
  email: 'redakcia@crescendo.bg',
  description: DEFAULT_DESCRIPTION,
};
