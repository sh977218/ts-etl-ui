import test from './baseFixture';
import { expect } from '@playwright/test';

test('Code System Tab', async ({ page }) => {
  await page.getByRole('link', { name: 'Code System' }).click();
  await expect(page.getByRole('table').locator('tbody tr')).not.toHaveCount(0);
});