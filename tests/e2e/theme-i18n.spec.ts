import { expect, test, type Page } from '@playwright/test';

async function tryDemoLogin(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByTestId('try-demo-button').click();
  await expect(page).toHaveURL(/loan|dashboard|manage/);
}

test.describe('Theme + i18n', () => {
  test('dark mode toggle persists in localStorage and survives reload', async ({ page }) => {
    await tryDemoLogin(page);
    await page.goto('/dashboard');
    const toggle = page.getByTestId('theme-toggle');
    await toggle.waitFor({ state: 'visible', timeout: 15_000 });

    const initialMode = await page.evaluate(() => localStorage.getItem('loanflow.themeMode'));
    await toggle.click();

    // Wait for the localStorage write to settle.
    await expect
      .poll(async () => page.evaluate(() => localStorage.getItem('loanflow.themeMode')), {
        timeout: 3000,
      })
      .not.toBe(initialMode);

    const afterMode = await page.evaluate(() => localStorage.getItem('loanflow.themeMode'));
    expect(afterMode === 'dark' || afterMode === 'light').toBe(true);

    // Reload and confirm the persisted mode survives.
    await page.reload();
    await expect
      .poll(async () => page.evaluate(() => localStorage.getItem('loanflow.themeMode')), {
        timeout: 15_000,
      })
      .toBe(afterMode);
  });

  test('language switch persists the chosen language in localStorage', async ({ page }) => {
    await tryDemoLogin(page);
    await page.goto('/dashboard');

    const switcher = page.getByTestId('language-switcher');
    await switcher.waitFor({ state: 'visible', timeout: 15_000 });
    await switcher.click();
    await page.getByRole('option', { name: /español/i }).click();

    await expect
      .poll(async () => page.evaluate(() => localStorage.getItem('i18nextLng')), {
        timeout: 5000,
      })
      .toBe('es');
  });
});
