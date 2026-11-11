import { RUBRICS, getRubricAccent } from '../data/rubrics.js';
import { fetchPublishedArticlesByRubric } from '../services/articles.js';
import { getArticleImage, getRubricImage } from '../data/visuals.js';
import { articleHref } from './ArticlesFeed.js';

/** @type {Record<string, { emoji: string, cta: string }>} */
const SLIDE_META = {
  benefits: { emoji: '💡', cta: 'Прочети повече →' },
  policies: { emoji: '🏛️', cta: 'Към анализа →' },
  practices: { emoji: '🎶', cta: 'Виж практиката →' },
  'el-sistema': { emoji: '⚡', cta: 'Научи повече →' },
  resonance: { emoji: '📡', cta: 'Виж материала →' },
};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function truncate(text, max = 140) {
  const s = String(text ?? '').trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max).trim()}…`;
}

function renderSlide({ rubric, article }, isActive) {
  const meta = SLIDE_META[rubric.slug] ?? { emoji: '•', cta: 'Прочети →' };
  const accent = getRubricAccent(rubric.slug);
  const img = escapeHtml(
    article ? getArticleImage(article) : getRubricImage(rubric.slug),
  );
  const href = article
    ? articleHref(article.slug, rubric.slug)
    : rubric.path;
  const title = article?.title ?? rubric.title;
  const summary = truncate(article?.summary || rubric.description, 150);

  return `
    <div class="carousel-item${isActive ? ' active' : ''} hero-carousel__slide" data-rubric="${escapeHtml(rubric.slug)}">
      <div class="hero-carousel__media" style="background-image:url('${img}')"></div>
      <div class="hero-carousel__overlay"></div>
      <div class="container hero-carousel__body">
        <span class="badge-cat badge-cat--${accent} hero-carousel__badge">
          <span aria-hidden="true">${meta.emoji}</span> ${escapeHtml(rubric.title)}
        </span>
        <h2 class="hero-carousel__title">${escapeHtml(title)}</h2>
        <p class="hero-carousel__lead">${escapeHtml(summary)}</p>
        <a href="${href}" class="btn btn-crescendo btn-sm hero-carousel__cta">${escapeHtml(meta.cta)}</a>
      </div>
    </div>`;
}

function renderLoadingSlide() {
  return `
    <div class="carousel-item active hero-carousel__slide hero-carousel__slide--loading">
      <div class="hero-carousel__overlay hero-carousel__overlay--light"></div>
      <div class="container hero-carousel__body">
        <div class="text-secondary d-flex align-items-center gap-2 py-2">
          <div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
          <span>Зареждане на водещи материали…</span>
        </div>
      </div>
    </div>`;
}

/**
 * Компактен hero carousel — 5 рубрики, водеща статия или fallback към рубриката.
 */
export async function initHeroCarousel() {
  const carouselEl = document.getElementById('heroCarousel');
  const innerEl = document.getElementById('heroCarouselInner');
  if (!carouselEl || !innerEl) return;

  innerEl.innerHTML = renderLoadingSlide();

  try {
    const slides = await Promise.all(
      RUBRICS.map(async (rubric) => {
        const articles = await fetchPublishedArticlesByRubric(rubric.slug, 1);
        return { rubric, article: articles[0] ?? null };
      }),
    );

    innerEl.innerHTML = slides
      .map((slide, index) => renderSlide(slide, index === 0))
      .join('');

    const { Carousel } = await import('bootstrap');
    const carousel = Carousel.getOrCreateInstance(carouselEl, {
      interval: 6500,
      ride: false,
      touch: true,
      wrap: true,
    });

    carousel.cycle();
  } catch (error) {
    console.error('initHeroCarousel', error);
    innerEl.innerHTML = `
      <div class="carousel-item active hero-carousel__slide hero-carousel__slide--loading">
        <div class="hero-carousel__overlay hero-carousel__overlay--light"></div>
        <div class="container hero-carousel__body">
          <p class="text-secondary mb-0 small">Водещите материали не можаха да се заредят.</p>
        </div>
      </div>`;
  }
}
