import { expect, test } from '@playwright/test';

test('practices rubric loads and shows PDF download when a resource exists', async ({
  page,
}) => {
  await page.goto('/practices.html');
  await expect(page.locator('main#page')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Практики' })).toBeVisible();

  const list = page.locator('#articlesList');
  await expect(list).toBeVisible({ timeout: 20_000 });

  // Wait for feed/empty state (Supabase-backed)
  await page.waitForFunction(() => {
    const el = document.getElementById('articlesList');
    if (!el) return false;
    const text = el.textContent || '';
    return !text.includes('Зареждане на статии');
  }, null, { timeout: 20_000 });

  const download = page.locator('a.resource-download-btn').first();
  if (await download.count()) {
    await expect(download).toBeVisible();
    const href = await download.getAttribute('href');
    expect(href).toBeTruthy();
  } else {
    // Acceptable when no published practice has file_url yet
    await expect(list).toBeVisible();
  }
});
