import { EU_TIMEZONE, tomorrowInMatDate } from '../CONSTANT';
import { test } from '../fixture/baseFixture';
import { expect } from '@playwright/test';

const newLoadRequest = {
  codeSystemName: 'USP',
  requestSubject: `created load request ${new Date().toISOString()} for edit load request`,
  sourceFilePath: 'file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/USP/USP20220823',
  requestType: 'Scheduled',
  scheduledDate: tomorrowInMatDate(),
  scheduledTime: '11:30 PM',
};

const updatedLoadRequestType = 'Emergency';

test.use({ accountUsername: 'Peter', createLoadRequest: newLoadRequest });
test.fixme('edit load request, "backend API is not implemented yet."', async ({
                                                                                page,
                                                                                materialPage,
                                                                                createLoadRequestPage,
                                                                              }) => {
  const matDialog = materialPage.matDialog();

  await test.step('search for newly added load request', async () => {
    await page.getByPlaceholder('Subject...').fill(newLoadRequest.requestSubject);
    await page.getByRole('button', { name: 'Search' }).click();
    await materialPage.waitForSpinner();
  });
  const firstRow = page.getByRole('table').locator('tbody').getByRole('row');

  await test.step(`verify load request before edit`, async () => {
    await expect(firstRow.getByRole('cell').nth(1)).toHaveText(newLoadRequest.codeSystemName);
    await expect(firstRow.getByRole('cell').nth(2)).toHaveText(newLoadRequest.requestSubject);
    await expect(firstRow.getByRole('cell').nth(4)).toHaveText(newLoadRequest.requestType);
  });

  await test.step(`edit load request type`, async () => {
    await firstRow.getByRole('cell').first().getByRole('link').click();
    await page.getByRole('button', { name: 'Edit' }).click();
    await matDialog.waitFor();
    await matDialog.getByRole('radio', { name: updatedLoadRequestType }).check();
    await matDialog.getByRole('button', { name: 'Submit' }).click();
    await matDialog.waitFor({ state: 'hidden' });
    await materialPage.checkAndCloseAlert(/Request \(ID: \d+\) edited successfully/);
    await expect(page.getByRole('cell', { name: updatedLoadRequestType })).toBeVisible();
  });

  await test.step('search for newly edited load request', async () => {
    await page.getByRole('link', { name: 'Load Request ' }).click();
    await page.getByPlaceholder('Subject...').fill(newLoadRequest.requestSubject);
    await page.getByRole('button', { name: 'Search' }).click();
    await materialPage.waitForSpinner();
  });

  await test.step(`verify load request before edit`, async () => {
    await expect(firstRow.getByRole('cell').nth(4)).toHaveText(updatedLoadRequestType);
  });
});