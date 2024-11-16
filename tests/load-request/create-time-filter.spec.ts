import { test } from '../fixture/baseFixture';
import { expect } from '@playwright/test';
import { EU_TIMEZONE, todayInMatDate, tomorrowInMatDate } from '../CONSTANT';

const newLoadRequest = {
  codeSystemName: 'USP',
  requestSubject: `created load request ${new Date().toISOString()} for creation time filter`,
  sourceFilePath: 'file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/USP/USP20220823',
  requestType: 'Scheduled',
  scheduledDate: tomorrowInMatDate(),
  scheduledTime: '11:30 PM',
};
test.use({ accountUsername: 'Peter', createLoadRequest: newLoadRequest });
test.describe(`creation time filter`, async () => {
  test('input', async ({ page, materialPage }) => {
    const totalLoadRequestCountBeforeFilter = await materialPage.matPaginationTotalCount();
    const datePicker = page.locator(`[id="creationTimeRange"]`);
    await materialPage.selectDateRangerPicker(datePicker, { year: 2010, month: 1, day: 1 }, todayInMatDate());
    await page.getByRole('button', { name: 'Search' }).click();
    await materialPage.matDialog().waitFor({ state: 'hidden' });
    await page.getByRole('columnheader', { name: 'Creation Time' }).click();
    const totalLoadRequestCountAfterFilter = await materialPage.matPaginationTotalCount();
    expect(totalLoadRequestCountAfterFilter).toBeLessThan(totalLoadRequestCountBeforeFilter);
  });

  test('URL', async ({ page, materialPage }) => {
    const totalLoadRequestCountBeforeFilter = await materialPage.matPaginationTotalCount();
    const today = todayInMatDate();
    await page.goto(`/load-requests?creationTimeFrom=2010-01-01&creationTimeTo=${today.year}-${today.month}-${today.day}&sortBy=creationTime&sortDirection=desc`);
    await materialPage.matDialog().waitFor({ state: 'hidden' });
    const totalLoadRequestCountAfterFilter = await materialPage.matPaginationTotalCount();
    expect(totalLoadRequestCountAfterFilter).toBeLessThan(totalLoadRequestCountBeforeFilter);
  });
});
