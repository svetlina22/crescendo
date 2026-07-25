/** Curated editorial photography — Unsplash, optimized sizes */

export const HERO_IMAGE =
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1920&h=1080&q=80';

export const RUBRIC_IMAGES = {
  benefits:
    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&h=600&q=80',
  policies:
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&h=600&q=80',
  practices:
    'https://images.unsplash.com/photo-1514320291840-b9a56c6f3c5a?auto=format&fit=crop&w=800&h=600&q=80',
  'el-sistema':
    'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?auto=format&fit=crop&w=800&h=600&q=80',
  resonance:
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&h=600&q=80',
};

export const EVENT_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&h=500&q=80',
  'https://images.unsplash.com/photo-145974941117576-0971c29cfe4d?auto=format&fit=crop&w=800&h=500&q=80',
  'https://images.unsplash.com/photo-1415201364774-f6f0ff35a28d?auto=format&fit=crop&w=800&h=500&q=80',
];

const DEFAULT_ARTICLE =
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&h=600&q=80';

/**
 * @param {{ cover_image_url?: string | null, rubrics?: { slug?: string } | null }} article
 */
export function getArticleImage(article) {
  if (article?.cover_image_url?.trim()) return article.cover_image_url.trim();
  const slug = article?.rubrics?.slug;
  return (slug && RUBRIC_IMAGES[slug]) || DEFAULT_ARTICLE;
}

/**
 * @param {{ image_url?: string | null }} event
 * @param {number} [index=0]
 */
export function getEventImage(event, index = 0) {
  if (event?.image_url?.trim()) return event.image_url.trim();
  return EVENT_FALLBACK_IMAGES[index % EVENT_FALLBACK_IMAGES.length];
}

/**
 * @param {string} slug
 */
export function getRubricImage(slug) {
  return RUBRIC_IMAGES[slug] || DEFAULT_ARTICLE;
}
