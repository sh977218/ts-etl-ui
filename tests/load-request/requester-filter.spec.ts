import { test } from '../fixture/baseFixture';
import { expect } from '@playwright/test';
import { tomorrowInMatDate } from '../CONSTANT';

const newLoadRequest = {
  codeSystemName: 'USP',
  requestSubject: `created load request ${new Date().toISOString()} for requester filter`,
  sourceFilePath: 'file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/USP/USP20220823',
  requestType: 'Scheduled',
  scheduledDate: tomorrowInMatDate(),
  scheduledTime: '11:30 PM',
};
const requester = 'peter huang';
test.use({ accountUsername: 'Peter', createLoadRequest: newLoadRequest });
test.describe('requester filter', async () => {
  test(`input`, async ({ page, materialPage, createLoadRequestPage }) => {
    const totalLoadRequestCountBeforeFilter = await materialPage.matPaginationTotalCount();
    await page.getByPlaceholder('requester...').fill(requester);
    await page.keyboard.press('Enter');
    await materialPage.matDialog().waitFor({ state: 'hidden' });

    const totalLoadRequestCountAfterFilter = await materialPage.matPaginationTotalCount();
    expect(totalLoadRequestCountAfterFilter).toBeLessThan(totalLoadRequestCountBeforeFilter);
  });

  test(`URL`, async ({ page, materialPage, createLoadRequestPage }) => {
    const totalLoadRequestCountBeforeFilter = await materialPage.matPaginationTotalCount();
    await page.goto(`/load-requests?requester=${encodeURIComponent(requester)}`);
    await materialPage.matDialog().waitFor({ state: 'hidden' });
    const totalLoadRequestCountAfterFilter = await materialPage.matPaginationTotalCount();
    expect(totalLoadRequestCountAfterFilter).toBeLessThan(totalLoadRequestCountBeforeFilter);
  });
});