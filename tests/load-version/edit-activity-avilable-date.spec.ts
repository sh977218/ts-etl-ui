import { test } from '../fixture/baseFixture';
import { expect } from '@playwright/test';

const loadNumber = '20231012080001';
test.use({ accountUsername: 'Christophe', loadNumber });

test('Edit Activity Avail Date', async ({ page, materialPage, loadVersionQaPage }) => {
  await page.getByRole('button', { 'name': 'Edit available date' }).click();
  await page.locator('app-load-version-activity input').clear();
  await page.locator('app-load-version-activity input').fill('2025-03-10');
  await page.getByRole('button', { 'name': 'Confirm' }).click();
  await materialPage.checkAndCloseAlert('Available Date Updated');
  await expect(page.locator('app-load-version-activity')).toContainText('2025/03');
});