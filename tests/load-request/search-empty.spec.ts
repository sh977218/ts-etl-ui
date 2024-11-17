import { test } from '../fixture/baseFixture';
import { expect } from '@playwright/test';

test.use({ accountUsername: 'peter' });
test.describe('Search Returns empty', async () => {
  test.describe('status', async () => {
    test('URL', async ({ page, materialPage }) => {
      await page.goto('/load-requests?requestStatus=notaStatus');
      await materialPage.matDialog().waitFor({ state: 'hidden' });
      await expect(page.locator('tbody')).toContainText('No results found');
    });
  });
});