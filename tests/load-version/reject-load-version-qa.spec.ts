import { expect } from '@playwright/test';

import { test } from '../fixture/baseFixture';

const loadNumber = '20230912080001';

test.use({ accountUsername: 'Christophe', loadNumber });
test('reject load version qa', async ({ page, materialPage, loadVersionQaPage }) => {
  const matDialog = materialPage.matDialog();

  await test.step(`Reject version QA`, async () => {
    await page.getByRole('button', { name: 'Reject' }).click();
    await matDialog.waitFor();
    await matDialog.getByPlaceholder('Notes').fill('Rejected by me');
    await matDialog.getByRole('button', { name: 'Save' }).click();
    await matDialog.waitFor({ state: 'hidden' });
    await materialPage.checkAndCloseAlert('Activity added successfully.');
    await expect(page.locator('app-load-version-activity table tbody tr').last().locator('td').nth(1)).toHaveText('Reject');
  });
});
