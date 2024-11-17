import { expect } from '@playwright/test';

import { test } from '../fixture/baseFixture';

test.use({ accountUsername: 'Peter' });

test(`Search multi select fields`, async ({ page, materialPage }) => {
  let numOfApiCalled = 0;
  await page.route(/load-request\/list$/, async route => {
    await page.waitForTimeout(2000);
    if (route.request().resourceType() === 'xhr') {
      numOfApiCalled++;
    }
    await route.continue();
  });

  const totalLoadRequestCountBeforeFilter = await materialPage.matPaginationTotalCount();

  await test.step(`select 2 Code System Name`, async () => {
    await materialPage.selectMultiOptions(page.locator(`[id="codeSystemSelect"]`), ['GS', 'MMSL']);
  });
  await test.step(`select 2 Request Status`, async () => {
    await materialPage.selectMultiOptions(page.locator(`[id="requestStatusFilterSelect"]`), ['Incomplete', 'Stopped']);
  });
  await test.step(`select 2 Request Type`, async () => {
    await materialPage.selectMultiOptions(page.locator(`[id="requestTypeFilterSelect"]`), ['Emergency', 'Scheduled']);
  });

  await page.getByRole('button', { name: 'Search' }).click();

  await materialPage.matDialog().waitFor({ state: 'hidden' });
  expect(numOfApiCalled).toEqual(1);
  const totalLoadRequestCountAfterFilter = await materialPage.matPaginationTotalCount();
  expect(totalLoadRequestCountAfterFilter).toBeLessThan(totalLoadRequestCountBeforeFilter);
  await page.unrouteAll({ behavior: 'ignoreErrors' });
});
