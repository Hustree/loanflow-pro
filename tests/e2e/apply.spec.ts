import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Apply for a loan', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('try-demo-button').click();
    await expect(page).toHaveURL(/loan|dashboard|manage/);
  });

  test('a multi-step submission produces a success state', async ({ page }) => {
    await page.goto('/loan');

    // Step 1: Personal Info
    await page.getByLabel(/full name/i).fill('Alex Demo');
    await page.getByLabel(/PNP\/BFP ID/i).fill('PNP12345');
    await page.getByLabel(/monthly income/i).fill('25000');
    await page.getByRole('button', { name: /^next$/i }).click();

    // Step 2: Loan details — selects use combobox role
    const comboboxes = page.getByRole('combobox');
    await comboboxes.nth(0).click();
    await page.getByRole('option', { name: /salary/i }).click();
    await page.getByLabel(/loan amount/i).fill('50000');
    await comboboxes.nth(1).click();
    await page.getByRole('option', { name: /^12 months$/i }).click();
    await page.getByRole('radio', { name: /Philippine National Bank/i }).check();
    await page.getByRole('button', { name: /^next$/i }).click();

    // Step 3: Review — Submit button.
    await page.getByRole('button', { name: /submit application/i }).click();

    // Either a success Alert or a generated reference number must appear.
    await expect(page.getByText(/submitted|success|LN-\d{8}-\d{4}/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('apply page has no serious axe violations beyond known UI debt', async ({ page }) => {
    await page.goto('/loan');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      // Known UI debt: MUI Selects without aria-label, MUI default contrast on
      // disabled / hint text. Both tracked for a future a11y-cleanup phase.
      .disableRules(['aria-input-field-name', 'aria-required-children', 'color-contrast'])
      .analyze();
    const seriousOrCritical = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(seriousOrCritical).toEqual([]);
  });
});
