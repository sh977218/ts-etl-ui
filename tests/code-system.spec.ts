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

    await page.locator('#codeSystemSearchInput').fill('ICD10CM');
    await page.keyboard.press('Enter');
    await expect(page.locator('#codeSystemsListTable > tbody')).not.toContainText('LOINC');
    await page.locator('table tbody tr:first-of-type').first().click();
    await page.getByLabel('Ex. Draft').fill('HPO2021_10_10');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Rejected')).not.toHaveCount(0);

    await page.getByLabel('Ex. PT').fill('1007412');
    await page.keyboard.press('Enter');
    await expect(page.getByText('ambroxol / doxycycline')).not.toHaveCount(0);
  });
});