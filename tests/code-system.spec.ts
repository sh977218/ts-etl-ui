import test from './baseFixture';
import { expect } from '@playwright/test';

test.describe('CS - ', async () => {
  test('Code System Table', async ({ page }) => {
    await page.getByRole('link', { name: 'Code System' }).click();
    await expect(page.getByRole('table').locator('tbody tr')).not.toHaveCount(0);
  });

  test('Code System Filter', async ({ page }) => {
    await page.goto('/code-systems');
    await expect(page.locator('#codeSystemsListTable > tbody')).toContainText('LOINC');

    await page.locator('#codeSystemSearchInput').fill('ICD');
    await page.keyboard.press('Enter');
    await expect(page.locator('#codeSystemsListTable > tbody')).not.toContainText('LOINC');
  });
});