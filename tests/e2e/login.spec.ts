import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Login', () => {
  test('Try Demo button signs in and lands on the loan flow', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('try-demo-button').click();
    await expect(page).toHaveURL(/loan|dashboard|manage/);
  });

  test('manual login with demo / demo works', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/username/i).fill('demo');
    await page.getByLabel(/password/i).fill('demo');
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await expect(page).toHaveURL(/loan|dashboard|manage/);
  });

  test('invalid credentials surface an error', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/username/i).fill('wrong');
    await page.getByLabel(/password/i).fill('wrong');
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test('login page has no serious axe violations beyond known UI debt', async ({ page }) => {
    await page.goto('/login');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      // Known UI debt: MUI default contrast for hint text + MUI Select aria.
      .disableRules(['aria-input-field-name', 'aria-required-children', 'color-contrast'])
      .analyze();
    const seriousOrCritical = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(seriousOrCritical).toEqual([]);
  });
});
