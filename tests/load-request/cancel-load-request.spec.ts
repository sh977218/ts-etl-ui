import { expect } from '@playwright/test';

import { EU_TIMEZONE, tomorrowInMatDate } from '../CONSTANT';
import { test } from '../fixture/baseFixture';

const newLoadRequest = {
  codeSystemName: 'USP',
  requestSubject: `created load request ${new Date().toISOString()} for cancel load request`,
  sourceFilePath: 'file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/USP/USP20220823',
  requestType: 'Scheduled',
  scheduledDate: tomorrowInMatDate(),
  scheduledTime: '11:30 PM',
};

test.use({ accountUsername: 'Peter', createLoadRequest: newLoadRequest });
test('cancel load request', async ({ page, materialPage, createLoadRequestPage }) => {
  const matDialog = materialPage.matDialog();

  await test.step('search for newly added load request', async () => {
    await page.getByPlaceholder('Subject...').fill(newLoadRequest.requestSubject);
    await page.getByRole('button', { name: 'Search' }).click();
    await materialPage.waitForSpinner();
  });
  const firstRow = page.getByRole('table').locator('tbody').getByRole('row');

  await test.step('search for newly edited load request', async () => {
    await page.getByRole('link', { name: 'Load Request ' }).click();
    await page.getByPlaceholder('Subject...').fill(newLoadRequest.requestSubject);
    await page.getByRole('button', { name: 'Search' }).click();
    await materialPage.waitForSpinner();
  });

  await test.step(`cancel load request`, async () => {
    await firstRow.getByRole('cell').first().getByRole('link').click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await matDialog.waitFor();
    await matDialog.getByRole('button', { name: 'Confirm' }).click();
    await matDialog.waitFor({ state: 'hidden' });
    await materialPage.checkAndCloseAlert(/Request \(ID: \d+\) deleted successfully/);
    await expect(page.getByRole('cell', { name: 'Cancelled' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Edit' })).toBeHidden();
  });

  await test.step('search for newly cancelled load request', async () => {
    await page.getByRole('link', { name: 'Load Request ' }).click();
    await page.getByPlaceholder('Subject...').fill(newLoadRequest.requestSubject);
    await page.getByRole('button', { name: 'Search' }).click();
    await materialPage.waitForSpinner();
  });

  await test.step(`verify load request is cancelled`, async () => {
    await expect(firstRow.getByRole('cell').nth(3)).toHaveText('Cancelled');
  });
});