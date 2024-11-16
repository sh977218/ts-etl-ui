import { test } from '../fixture/baseFixture';
import { expect } from '@playwright/test';
import { tomorrowInMatDate } from '../CONSTANT';

const newLoadRequest = {
  codeSystemName: 'USP',
  requestSubject: `created load request ${new Date().toISOString()} for request subject Filter`,
  sourceFilePath: 'file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/USP/USP20220823',
  requestType: 'Scheduled',
  scheduledDate: tomorrowInMatDate(),
  scheduledTime: '11:30 PM',
};
test.use({ accountUsername: 'Peter', createLoadRequest: newLoadRequest });
test.describe('request subject Filter', async () => {
  test(`input`, async ({ page, materialPage, createLoadRequestPage }) => {
    const totalLoadRequestCountBeforeFilter = await materialPage.matPaginationTotalCount();
    await page.getByPlaceholder('subject...').fill(newLoadRequest.requestSubject);
    await page.keyboard.press('Enter');
    await materialPage.matDialog().waitFor({ state: 'hidden' });
    const totalLoadRequestCountAfterFilter = await materialPage.matPaginationTotalCount();
    expect(totalLoadRequestCountAfterFilter).toBeLessThan(totalLoadRequestCountBeforeFilter);
  });

  test(`URL`, async ({ page, materialPage, createLoadRequestPage }) => {
    const totalLoadRequestCountBeforeFilter = await materialPage.matPaginationTotalCount();
    await page.goto(`/load-requests?requestSubject=${encodeURIComponent(newLoadRequest.requestSubject)}`);
    await materialPage.matDialog().waitFor({ state: 'hidden' });
    const totalLoadRequestCountAfterFilter = await materialPage.matPaginationTotalCount();
    expect(totalLoadRequestCountAfterFilter).toBeLessThan(totalLoadRequestCountBeforeFilter);
  });
});
