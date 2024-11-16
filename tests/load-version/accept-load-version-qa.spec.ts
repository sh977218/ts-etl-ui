import { expect } from '@playwright/test';

import { test } from '../fixture/baseFixture';

const loadNumber = '20231012080001';
test.use({ accountUsername: 'Christophe', loadNumber });

test('accept load version qa', async ({ page, materialPage, loadVersionQaPage }) => {
  const matDialog = materialPage.matDialog();

  await test.step(`Accept version QA`, async () => {
    await page.getByRole('button', { name: 'Accept' }).click();
    await matDialog.waitFor();
    await matDialog.getByPlaceholder('Notes').fill('Accepted by me');
    await matDialog.getByRole('button', { name: 'Save' }).click();
    await matDialog.waitFor({ state: 'hidden' });
    await materialPage.checkAndCloseAlert('Activity added successfully.');
    await expect(page.locator('app-load-version-activity table tbody tr').last().locator('td').nth(1)).toHaveText('Accept');
  });
});
