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
test('download Load Request', async ({ page, materialPage, createLoadRequestPage }) => {
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

  const newlyCreatedLoadRequestId = await firstRow.getByRole('cell').first().getByRole('link').innerText();


  await test.step(`download newly added load request`, async () => {
    const [, downloadFile] = await Promise.all([
      page.getByRole('button', { name: 'Download' }).click(),
      page.waitForEvent('download')],
    );

    await materialPage.checkAndCloseAlert('Export downloaded.');

    const fileContent = readFileSync(await downloadFile.path(), { encoding: 'utf-8' });
    expect(fileContent).toContain('opRequestSeq, codeSystemName, requestSubject, requestStatus, requestType, requestTime, requester, creationTime');
    expect(fileContent).toContain(`"${newlyCreatedLoadRequestId}","${newLoadRequest.codeSystemName}","${newLoadRequest.requestSubject}","Open","${newLoadRequest.requestType}"`);
  });

});