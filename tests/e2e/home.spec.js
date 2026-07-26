import { expect, test } from '@playwright/test';

test('home page loads and hero carousel is present', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('main#page')).toBeVisible();
  await expect(page.locator('#heroCarousel')).toBeVisible();

  await expect(page.locator('#heroCarouselInner .carousel-item').first()).toBeVisible({
    timeout: 20_000,
  });

  const slideCount = await page.locator('#heroCarouselInner .carousel-item').count();
  expect(slideCount).toBeGreaterThan(0);

  if (slideCount > 1) {
    const navBtn = page.locator('#heroRubricNav .hero-rubric-nav__btn').nth(1);
    await expect(navBtn).toBeVisible();
    await navBtn.click();
    await expect(page.locator('#heroCarouselInner .carousel-item.active')).toBeVisible();
  }
});

test('search form filters the articles feed', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('#articleSearchInput')).toBeVisible();
  await expect(page.locator('#articlesFeed')).toBeVisible({ timeout: 20_000 });

  await page.fill('#articleSearchInput', 'музик');
  await page.locator('#articleSearchForm').dispatchEvent('submit');

  await expect(page.locator('#activeFilterWrap')).toContainText('музик', { timeout: 15_000 });
  await expect(page.locator('#articlesFeed')).toBeVisible();
});
