import test from '../fixture/baseFixture';
import { expect } from '@playwright/test';

// byPassLogin set to false to do login so code coverage is met.
test.use({ accountUsername: 'peter', byPassLogin: false });
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
    await page.getByPlaceholder('Ex. Draft').fill('HPO2021_10_10');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Rejected')).not.toHaveCount(0);

    await page.getByText('HPO2021_10_10').first().click();
    await page.getByPlaceholder('Ex. PT').first().fill('1007412');
    await page.keyboard.press('Enter');
    await expect(page.getByText('ambroxol / doxycycline')).not.toHaveCount(0);
  });
});