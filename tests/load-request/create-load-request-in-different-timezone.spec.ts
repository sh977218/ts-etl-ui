import { expect } from '@playwright/test';

import { test } from '../fixture/baseFixture';
import { EU_TIMEZONE } from '../CONSTANT';

const newLoadRequest = {
  codeSystemName: 'USP',
  requestSubject: `newly ${EU_TIMEZONE} created load request ${new Date().toISOString()}`,
  sourceFilePath: 'file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/USP/USP20220823',
  requestType: 'Scheduled',
  scheduledDate: 'today',
  scheduledTime: '11:30 PM',
};
test.use({ accountUsername: 'peter', timezoneId: EU_TIMEZONE, createLoadRequest: newLoadRequest });
test('Create Load Request in different timezone - EU', async ({ page, materialPage, createLoadRequestPage }) => {
  await test.step(`verify load request created in ${EU_TIMEZONE}`, async () => {
    await page.getByPlaceholder('subject...').fill(newLoadRequest.requestSubject);
    await page.getByRole('button', { name: 'Search' }).click();
    await materialPage.waitForSpinner();
    const tableRows = page.locator('tbody[role="rowgroup"]').getByRole('row');
    await expect(tableRows.first().locator('td').nth(5)).toContainText(/(EDT|EST)/);
  });
  await page.unrouteAll({ behavior: 'ignoreErrors' });
});
