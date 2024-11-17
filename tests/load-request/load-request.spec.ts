import { expect } from '@playwright/test';

import { test } from '../fixture/baseFixture';
import { EU_TIMEZONE, todayInMatDate, tomorrowInMatDate } from '../CONSTANT';

const newLoadRequest = {
  codeSystemName: 'USP',
  requestSubject: `newly ${EU_TIMEZONE} created load request ${new Date().toISOString()}`,
  sourceFilePath: 'file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/USP/USP20220823',
  requestType: 'Scheduled',
  scheduledDate: tomorrowInMatDate(),
  scheduledTime: '11:30 PM',
};

test.use({ accountUsername: 'Peter', createLoadRequest: newLoadRequest });
test.describe('LR -', async () => {
  const today = new Date();
  const firstCell = 'table tbody tr:first-of-type td:first-of-type';
  const firstRow = 'table tbody tr:first-of-type';

  test(`Search multi select fields`, async ({ page, materialPage }) => {
    let numOfApiCalled = 0;
    await page.route(/load-request\/list$/, async route => {
      await page.waitForTimeout(2000);
      if (route.request().resourceType() === 'xhr') {
        numOfApiCalled++;
      }
      await route.continue();
    });

    await test.step(`select 2 Code System Name`, async () => {
      await materialPage.selectMultiOptions(page.locator(`[id="codeSystemSelect"]`), ['GS', 'MMSL']);
    });
    await test.step(`select 2 Request Status`, async () => {
      await materialPage.selectMultiOptions(page.locator(`[id="requestStatusFilterSelect"]`), ['Incomplete', 'Stopped']);
    });
    await test.step(`select 2 Request Type`, async () => {
      await materialPage.selectMultiOptions(page.locator(`[id="requestTypeFilterSelect"]`), ['Emergency', 'Scheduled']);
    });

    await test.step(`Search and verify result`, async () => {
      await page.getByRole('button', { name: 'Search' }).click();
      await materialPage.waitForSpinner();
      const tableRows = page.locator('tbody[role="rowgroup"]').getByRole('row');
      await expect(tableRows).toHaveCount(2);
      await expect(tableRows.first()).toContainText('MMSL');
      await expect(tableRows.first()).toContainText('Incomplete');
      await expect(tableRows.first()).toContainText('Emergency');
      await expect(tableRows.nth(1)).toContainText('GS');
      await expect(tableRows.nth(1)).toContainText('Stopped');
      await expect(tableRows.nth(1)).toContainText('Scheduled');
    });

    expect(numOfApiCalled).toEqual(1);
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

  test.describe(`Request Time`, async () => {
    test('input', async ({ page, materialPage }) => {
      const datePicker = page.locator(`[id="requestTimeRange"]`);
      await materialPage.selectDateRangerPicker(datePicker, { year: 2017, month: 11, day: 1 }, todayInMatDate());
      await page.getByRole('button', { name: 'Search' }).click();
      await materialPage.matDialog().waitFor({ state: 'hidden' });
      await page.getByRole('columnheader', { name: 'Request Time' }).click();
      await expect(page.locator(firstRow)).toHaveCount(1);
      await expect(page.locator(firstCell)).toHaveText('27');
    });

    test('URL', async ({ page, materialPage }) => {
      await page.goto('/load-requests?requestTimeFrom=2017-11-01&requestTimeTo=2024-10-1&sortBy=requestTime&sortDirection=asc');
      await materialPage.matDialog().waitFor({ state: 'hidden' });
      await expect(page.locator(firstRow)).toHaveCount(1);
      await expect(page.locator(firstCell)).toHaveText('27');
    });
  });

  test.describe(`Creation Time`, async () => {
    test('input', async ({ page, materialPage }) => {
      const datePicker = page.locator(`[id="creationTimeRange"]`);
      await materialPage.selectDateRangerPicker(datePicker, { year: 2010, month: 1, day: 1 }, todayInMatDate());
      await page.getByRole('button', { name: 'Search' }).click();
      await materialPage.matDialog().waitFor({ state: 'hidden' });
      await page.getByRole('columnheader', { name: 'Creation Time' }).click();
      await expect(page.locator(firstRow)).toHaveCount(1);
      await expect(page.locator(firstCell)).toHaveText('27');
    });

    test('URL', async ({ page, materialPage }) => {
      await page.goto('/load-requests?creationTimeFrom=2010-01-01&creationTimeTo=2013-01-01&sortBy=creationTime&sortDirection=desc');
      await materialPage.matDialog().waitFor({ state: 'hidden' });
      await expect(page.locator(firstCell)).toHaveText('27');
    });
  });

  test.describe('Subject Filter', async () => {
    test(`input`, async ({ page, materialPage }) => {
      await page.goto('/load-requests');
      await page.getByPlaceholder('subject...').fill('Great Subject');
      await page.keyboard.press('Enter');
      await materialPage.matDialog().waitFor({ state: 'hidden' });
      await expect(page.locator(firstCell)).toHaveText('29');
    });

    test(`URL`, async ({ page, materialPage }) => {
      await page.goto('/load-requests?requestSubject=Great%20Subject');
      await materialPage.matDialog().waitFor({ state: 'hidden' });
      await expect(page.locator(firstCell)).toHaveText('29');
    });
  });

  test.describe('Status Filter', async () => {
    test(`input`, async ({ page, materialPage }) => {
      await page.goto('/load-requests');
      await materialPage.selectMultiOptions(page.locator(`[id="requestStatusFilterSelect"]`), ['Stopped']);
      await page.getByRole('button', { name: 'Search' }).click();
      await materialPage.matDialog().waitFor({ state: 'hidden' });
      await expect(page.locator(firstCell)).toHaveText('30');
    });

    test(`URL`, async ({ page, materialPage }) => {
      await page.goto('/load-requests?requestStatus=Stopped');
      await materialPage.matDialog().waitFor({ state: 'hidden' });
      await expect(page.locator(firstCell)).toHaveText('30');
    });
  });

  test.describe('User Filter', async () => {
    test(`input`, async ({ page, materialPage }) => {
      await page.goto('/load-requests');
      await page.getByPlaceholder('requester...').fill('bernicevega');
      await page.keyboard.press('Enter');
      await materialPage.matDialog().waitFor({ state: 'hidden' });
      await expect(page.locator(firstCell)).toHaveText('6');
    });

    test(`URL`, async ({ page, materialPage }) => {
      await page.goto('/load-requests?requester=bernicevega');
      await materialPage.matDialog().waitFor({ state: 'hidden' });
      await expect(page.locator(firstCell)).toHaveText('6');
    });
  });

  test('Pagination and Sort', async ({ page, materialPage }) => {
    const rows = page.locator('table tbody tr');

    await test.step(`Go to next page`, async () => {
      await page.getByRole('button', { name: 'Next page' }).click();
      await materialPage.matDialog().waitFor({ state: 'hidden' });
      await expect(rows).toHaveCount(10);

      await expect(page).toHaveURL(/pageNum=2/);
      await expect(page).toHaveURL(/pageSize=10/);
    });

    await test.step(`Change sort`, async () => {
      await page.getByRole('columnheader', { name: 'Request ID' }).click();
      await materialPage.matDialog().waitFor({ state: 'hidden' });
      await expect(rows).toHaveCount(10);

      await test.step('page size remain the same', async () => {
        await expect(page).toHaveURL(/pageSize=10/);
      });
      await test.step('page number reset to 1', async () => {
        await expect(page).toHaveURL(/pageNum=1/);
      });
      await expect(page).toHaveURL(/sortBy=opRequestSeq/);
    });

    await test.step(`Change page size`, async () => {
      await page.getByRole('combobox', { name: '10' }).click();
      await materialPage.matOption().filter({ hasText: `50` }).click();
      await materialPage.matDialog().waitFor({ state: 'hidden' });
      await expect(rows).toHaveCount(50);

      await test.step('sort remain the same', async () => {
        await expect(page).toHaveURL(/sortBy=opRequestSeq/);
      });
      await test.step('page number reset to 1', async () => {
        await expect(page).toHaveURL(/pageNum=1/);
      });
      await expect(page).toHaveURL(/pageSize=50/);
    });
  });

  test('Search Returns empty', async ({ page, materialPage }) => {
    await page.goto('/load-requests?requestStatus=notaStatus');
    await materialPage.matDialog().waitFor({ state: 'hidden' });
    await expect(page.locator('tbody')).toContainText('No results found');
  });

  test('LR View Messages', async ({ page }) => {
    await page.goto('/load-request/0');
    await expect(page.getByRole('row', { name: '# of Messages:' })).toContainText('4');
    await page.getByRole('button', { name: 'Time', exact: true }).click();
    await page.getByRole('button', { name: 'Start Time' }).click();
    await page.getByRole('button', { name: 'Creation Time' }).click();
    await page.getByRole('button', { name: 'Message Type' }).click();

    await page.locator('td:has-text("Error while extracting")');
  });

  test('LR Message Filter', async ({ page }) => {
    await page.goto('/load-request/0');
    await expect(page.locator('app-load-component-message')).toContainText('RAW_TABLE_COUNT');
    await page.getByPlaceholder('Ex. INFO').pressSequentially('inject');
    await page.getByRole('link', { name: 'Load Request' }).focus();
    await expect(page.locator('app-load-component-message')).not.toContainText('RAW_TABLE_COUNT');
  });

  test('LR with no LV', async ({ page }) => {
    await page.goto('/load-request/8');
    await expect(page.locator('body')).toContainText('bensonmcgowan@zilphur.com');
  });


});