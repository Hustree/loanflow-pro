import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Rules disabled below describe known UI debt that a future a11y-cleanup phase
// should address; we still gate on the rest of the WCAG-AA rule set.
const KNOWN_RULE_DEBT = ['aria-input-field-name', 'aria-required-children', 'color-contrast'];

test.describe('Loan management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('try-demo-button').click();
    await expect(page).toHaveURL(/loan|dashboard|manage/);
  });

  test('seeded loans appear under View Applications', async ({ page }) => {
    await page.goto('/manage');
    await page.getByRole('tab', { name: /view applications/i }).click();
    await expect(page.getByText(/LN-\d{8}-\d{4}/).first()).toBeVisible({ timeout: 10_000 });
  });

  test('manage page has no serious axe violations beyond known UI debt', async ({ page }) => {
    await page.goto('/manage');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(KNOWN_RULE_DEBT)
      .analyze();
    const seriousOrCritical = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(seriousOrCritical).toEqual([]);
  });
});
