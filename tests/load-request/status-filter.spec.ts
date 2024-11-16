import { test } from '../fixture/baseFixture';
import { expect } from '@playwright/test';
import { tomorrowInMatDate } from '../CONSTANT';

const newLoadRequest = {
  codeSystemName: 'USP',
  requestSubject: `Request status filter - created load request ${new Date().toISOString()}`,
  sourceFilePath: 'file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/USP/USP20220823',
  requestType: 'Scheduled',
  scheduledDate: tomorrowInMatDate(),
  scheduledTime: '11:30 PM',
};
test.use({ accountUsername: 'Peter', createLoadRequest: newLoadRequest });
test.describe('Status Filter', async () => {
  test(`input`, async ({ page, materialPage, createLoadRequestPage }) => {
    const totalLoadRequestCountBeforeFilter = await materialPage.matPaginationTotalCount();
    await materialPage.selectMultiOptions(page.locator(`[id="requestStatusFilterSelect"]`), ['Stopped']);
    await page.getByRole('button', { name: 'Search' }).click();
    await materialPage.matDialog().waitFor({ state: 'hidden' });
    const totalLoadRequestCountAfterFilter = await materialPage.matPaginationTotalCount();
    expect(totalLoadRequestCountAfterFilter).toBeLessThan(totalLoadRequestCountBeforeFilter);
  });

  test(`URL`, async ({ page, materialPage, createLoadRequestPage }) => {
    const totalLoadRequestCountBeforeFilter = await materialPage.matPaginationTotalCount();
    await page.goto('/load-requests?requestStatus=Stopped');
    await materialPage.matDialog().waitFor({ state: 'hidden' });
    const totalLoadRequestCountAfterFilter = await materialPage.matPaginationTotalCount();
    expect(totalLoadRequestCountAfterFilter).toBeLessThan(totalLoadRequestCountBeforeFilter);
  });
});
