import { EU_TIMEZONE } from '../CONSTANT';
import { test } from '../fixture/baseFixture';
import { expect } from '@playwright/test';
import { readFileSync } from 'fs';

const newLoadRequest = {
  codeSystemName: 'USP',
  requestSubject: `newly ${EU_TIMEZONE} created load request ${new Date().toISOString()}`,
  sourceFilePath: 'file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/USP/USP20220823',
  requestType: 'Scheduled',
  scheduledDate: 'today',
  scheduledTime: '11:30 PM',
};

test.use({ accountUsername: 'Peter', createLoadRequest: newLoadRequest });
test('cancel Load Request', async ({ page, materialPage, createLoadRequestPage }) => {
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