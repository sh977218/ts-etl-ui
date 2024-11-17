import { test } from '../fixture/baseFixture';
import { expect } from '@playwright/test';
import { todayInMatDate, tomorrowInMatDate } from '../CONSTANT';

const newLoadRequest = {
  codeSystemName: 'USP',
  requestSubject: `created load request ${new Date().toISOString()} for request time filter`,
  sourceFilePath: 'file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/USP/USP20220823',
  requestType: 'Scheduled',
  scheduledDate: tomorrowInMatDate(),
  scheduledTime: '11:30 PM',
};
test.use({ accountUsername: 'Peter', createLoadRequest: newLoadRequest });
test.describe(`request time filter`, async () => {

  test('input', async ({ page, materialPage, createLoadRequestPage }) => {
    const totalLoadRequestCountBeforeFilter = await materialPage.matPaginationTotalCount();
    const datePicker = page.locator(`[id="requestTimeRange"]`);
    await materialPage.selectDateRangerPicker(datePicker, { year: 2017, month: 11, day: 1 }, todayInMatDate());
    await page.getByRole('button', { name: 'Search' }).click();
    await materialPage.matDialog().waitFor({ state: 'hidden' });
    await page.getByRole('columnheader', { name: 'Request Time' }).click();
    const totalLoadRequestCountAfterFilter = await materialPage.matPaginationTotalCount();
    expect(totalLoadRequestCountAfterFilter).toBeLessThan(totalLoadRequestCountBeforeFilter);
  });

  test('URL', async ({ page, materialPage, createLoadRequestPage }) => {
    const totalLoadRequestCountBeforeFilter = await materialPage.matPaginationTotalCount();
    const today = todayInMatDate();
    await page.goto(`/load-requests?requestTimeFrom=2017-11-01&requestTimeTo=${today.year}-${today.month}-${today.day}&sortBy=requestTime&sortDirection=asc`);
    await materialPage.matDialog().waitFor({ state: 'hidden' });
    const totalLoadRequestCountAfterFilter = await materialPage.matPaginationTotalCount();
    expect(totalLoadRequestCountAfterFilter).toBeLessThan(totalLoadRequestCountBeforeFilter);
  });
});