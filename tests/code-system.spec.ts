import test from './baseFixture';
import { expect } from '@playwright/test';

test.describe('CS - ', async () => {

  test('Code System Table', async ({ loggedInPage }) => {
    await loggedInPage.getByRole('link', { name: 'Code System' }).click();
    await expect(loggedInPage.getByRole('table').locator('tbody tr')).not.toHaveCount(0);
  });

  test('Code System Filter', async ({ loggedInPage }) => {
    await loggedInPage.goto('/code-systems');
    await expect(loggedInPage.locator('#codeSystemsListTable > tbody')).toContainText('LOINC');

    await loggedInPage.locator('#codeSystemSearchInput').fill('ICD');
    await loggedInPage.keyboard.press('Enter');
    await expect(loggedInPage.locator('#codeSystemsListTable > tbody')).not.toContainText('LOINC');
  });
});