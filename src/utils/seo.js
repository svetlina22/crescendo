import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  ORGANIZATION,
  SITE_NAME,
  SITE_URL,
} from '../data/site.js';

/**
 * @param {string} path
 */
export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

/**
 * @param {string} name
 * @param {string} content
 * @param {'name' | 'property'} [attr]
 */
function upsertMeta(name, content, attr = 'name') {
  if (content == null || content === '') return;
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * @param {string} rel
 * @param {string} href
 */
function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * @param {string} id
 * @param {object | object[]} data
 */
export function setJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * Apply document title, description, canonical, OG and Twitter tags.
 * @param {{
 *   title: string,
 *   description?: string,
 *   path?: string,
 *   image?: string,
 *   type?: string,
 *   keywords?: string,
 *   robots?: string,
 * }} opts
 */
export function applyPageSeo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  keywords = DEFAULT_KEYWORDS,
  robots = 'index, follow',
}) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  document.title = fullTitle;

  upsertMeta('description', description);
  upsertMeta('keywords', keywords);
  upsertMeta('robots', robots);
  upsertLink('canonical', url);

  upsertMeta('og:site_name', SITE_NAME, 'property');
  upsertMeta('og:locale', 'bg_BG', 'property');
  upsertMeta('og:type', type, 'property');
  upsertMeta('og:title', fullTitle, 'property');
  upsertMeta('og:description', description, 'property');
  upsertMeta('og:url', url, 'property');
  upsertMeta('og:image', imageUrl, 'property');

  upsertMeta('twitter:card', 'summary_large_image');
  upsertMeta('twitter:title', fullTitle);
  upsertMeta('twitter:description', description);
  upsertMeta('twitter:image', imageUrl);
}

/**
 * Organization + WebSite JSON-LD (homepage).
 */
export function setOrganizationJsonLd() {
  setJsonLd('ld-organization', {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: ORGANIZATION.name,
        url: ORGANIZATION.url,
        email: ORGANIZATION.email,
        description: ORGANIZATION.description,
        logo: DEFAULT_OG_IMAGE,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'bg-BG',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/index.html?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  });
}

/**
 * Article / NewsArticle JSON-LD for a published piece.
 * @param {object} article
 * @param {string} [pagePath]
 */
export function setArticleJsonLd(article, pagePath) {
  const title = article?.title || 'Статия';
  const description = article?.summary || DEFAULT_DESCRIPTION;
  const image = article?.cover_image_url || DEFAULT_OG_IMAGE;
  const slug = article?.slug || '';
  const path = pagePath || `/article.html?slug=${encodeURIComponent(slug)}`;
  const authorName = [article?.profiles?.academic_title, article?.profiles?.full_name]
    .filter(Boolean)
    .join(' ');

  setJsonLd('ld-article', {
    '@context': 'https://schema.org',
    '@type': ['NewsArticle', 'Article'],
    mainEntityOfPage: absoluteUrl(path),
    headline: title,
    description,
    image: [absoluteUrl(image)],
    datePublished: article?.published_at || undefined,
    dateModified: article?.updated_at || article?.published_at || undefined,
    author: authorName
      ? { '@type': 'Person', name: authorName }
      : { '@type': 'Organization', name: SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: DEFAULT_OG_IMAGE,
      },
    },
    articleSection: article?.rubrics?.title || undefined,
    keywords: Array.isArray(article?.tags) ? article.tags.join(', ') : undefined,
    inLanguage: 'bg-BG',
  });
}

/**
 * Build static head meta HTML for MPA pages (used when editing HTML files).
 * @param {{
 *   title: string,
 *   description: string,
 *   path: string,
 *   keywords?: string,
 *   image?: string,
 *   robots?: string,
 *   type?: string,
 * }} opts
 */
export function buildStaticHeadTags({
  title,
  description,
  path,
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_OG_IMAGE,
  robots = 'index, follow',
  type = 'website',
}) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);
  return {
    fullTitle,
    description,
    keywords,
    robots,
    url,
    imageUrl,
    type,
  };
}
