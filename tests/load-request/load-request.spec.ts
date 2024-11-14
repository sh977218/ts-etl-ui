import test from '../fixture/baseFixture';
import { expect } from '@playwright/test';
import { readFileSync } from 'fs';

import { MatDate } from '../CONSTANT';

test.use({ accountUsername: 'Peter' });
test.describe('LR -', async () => {
  const today = new Date();
  const todayInMatDate: MatDate = {
    year: today.getFullYear(),
    month: today.getMonth(),
    day: today.getDay(),
  };
  const firstCell = 'table tbody tr:first-of-type td:first-of-type';
  const firstRow = 'table tbody tr:first-of-type';

  test('Load Request table', async ({ page, materialPage }) => {
    const matDialog = materialPage.matDialog();

    await expect(page.getByRole('link', { name: 'Load Request' })).toBeVisible();

    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Request' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Download' })).toBeVisible();

    await expect(page.getByRole('table').locator('tbody tr.example-element-row')).not.toHaveCount(0);

    // this api interception is to make network slow, so the spinner can be verified.
    await page.route(/load-request\/list$/, async route => {
      await page.waitForTimeout(2000);
      await route.continue();
    });

    await page.route('**/loadRequest/', async route => {
      await page.waitForTimeout(2000);
      await route.continue();
    });

    let newlyCreatedLoadRequestId = '';

    await page.route(/load-request$/, async route => {
      const response = await route.fetch();
      const body = await response.json();
      newlyCreatedLoadRequestId = body.result.data + '';
      await route.fulfill({
        response,
      });
    });

    await test.step('add load request', async () => {
      await page.getByRole('button', { name: 'Create Request' }).click();
      await matDialog.waitFor();
      /**
       * note: We can use `await page.getByRole('radio', {name: 'Regular'}).check();`
       * but using `matDialog` instead of `page` is it ensures those fields are inside a dialog modal
       */
      await matDialog.getByRole('radio', { name: 'Scheduled' }).check();
      await matDialog.getByRole('button', { name: 'Open calendar' }).click();
      await page.locator(`mat-calendar`).waitFor();
      await page.locator('.mat-calendar-body-cell.mat-calendar-body-active').click();
      await page.locator(`mat-calendar`).waitFor({ state: 'hidden' });
      await matDialog.getByRole('combobox', { name: 'Scheduled time' }).click();
      await page.getByRole('option', { name: '11:30 PM' }).click();
      await matDialog.getByLabel('Code System Name').click();
      /**
       * mat-option is not attached to modal, it appends to end of app root tag, so using page instead of `matDialog`.
       */
      await page.getByRole('option', { name: 'HPO' }).click();
      await matDialog.getByLabel('Request Subject').fill('newly created load request');
      await matDialog.getByLabel('Source File Path').clear();
      await matDialog.getByLabel('Source File Path').fill('this is not valid');
      await page.locator('mat-dialog-container h2').click();
      await expect(page.locator('mat-dialog-container')).toContainText('The path must be subfolder under the base URL');
      await matDialog.getByLabel('Source File Path').clear();
      await matDialog.getByLabel('Source File Path').fill('file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/LOINC/LOINC2020/');
      await page.locator('mat-dialog-container h2').click();
      await matDialog.getByLabel('Notification Email').fill('playwright@example.com');
      await matDialog.getByRole('button', { name: 'Submit' }).click();
      await matDialog.waitFor({ state: 'hidden' });
      await materialPage.checkAndCloseAlert(`Request (ID: ${newlyCreatedLoadRequestId}) created successfully`);
    });

    await test.step('search for newly added load request', async () => {
      await page.getByPlaceholder('Req. ID').fill(newlyCreatedLoadRequestId);
      await page.getByPlaceholder('Any Request date').click();
      await materialPage.matOption().filter({ hasText: `Today's` }).click();
      await page.getByRole('button', { name: 'Search' }).click();
      await materialPage.waitForSpinner();

      await expect(page.locator('td:has-text("Scheduled")')).toBeVisible();
      await expect(page.locator('td:has-text("HPO")')).toBeVisible();
      await expect(page.getByText('newly created load request')).toBeVisible();
    });

    await test.step(`download newly added load request`, async () => {
      const [, downloadFile] = await Promise.all([
        page.getByRole('button', { name: 'Download' }).click(),
        page.waitForEvent('download')],
      );

      await materialPage.checkAndCloseAlert('Export downloaded.');

      const fileContent = readFileSync(await downloadFile.path(), { encoding: 'utf-8' });
      expect(fileContent).toContain('opRequestSeq, codeSystemName, requestSubject, requestStatus, requestType, requestTime, requester, creationTime');
      expect(fileContent).toContain(`"${newlyCreatedLoadRequestId}","HPO","newly created load request","Open","Scheduled"`);
    });

    await test.step(`edit load request`, async () => {
      await page.getByText(newlyCreatedLoadRequestId).click();
      await page.getByRole('button', { name: 'Edit' }).click();
      await matDialog.waitFor();
      await matDialog.getByRole('radio', { name: 'Emergency' }).check();
      await matDialog.getByLabel('Code System Name').click();
      await page.getByRole('option', { name: 'CPT' }).click();
      await matDialog.getByLabel('Request Subject').fill('newly edited load request');
      await matDialog.getByLabel('Source File Path').clear();
      await matDialog.getByLabel('Source File Path').fill('file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/june-26-2024');
      await matDialog.getByLabel('Notification Email').fill('playwright-edit@example.com');
      await matDialog.getByRole('button', { name: 'Submit' }).click();
      await matDialog.waitFor({ state: 'hidden' });
      await materialPage.checkAndCloseAlert(/Request \(ID: \d+\) edited successfully/);
    });

    await test.step('search for newly edited load request', async () => {
      await page.getByRole('link', { name: 'Load Request' }).click();
      await page.getByPlaceholder('Req. ID').fill(newlyCreatedLoadRequestId);
      // next 2 lines might fall, if the test runs first step on Saturday 11:59 PM and this step runs on Sunday 00:00 AM. This week's filter will fail. But this is very unlikely
      await page.getByPlaceholder('Any Request date').click();
      await materialPage.matOption().filter({ hasText: `This week's` }).click();
      await page.getByRole('button', { name: 'Search' }).click();
      await materialPage.waitForSpinner();

      await expect(page.locator('td:has-text("Emergency")')).toBeVisible();
      await expect(page.locator('td:has-text("CPT")')).toBeVisible();
      await expect(page.getByText('newly edited load request')).toBeVisible();
    });

    await test.step(`download newly edited load request`, async () => {
      const [, downloadFile] = await Promise.all([
        page.getByRole('button', { name: 'Download' }).click(),
        page.waitForEvent('download')],
      );

      await materialPage.checkAndCloseAlert('Export downloaded.');

      const fileContent = readFileSync(await downloadFile.path(), { encoding: 'utf-8' });
      expect(fileContent).toContain('opRequestSeq, codeSystemName, requestSubject, requestStatus, requestType, requestTime, requester, creationTime');
      expect(fileContent).toContain(`"${newlyCreatedLoadRequestId}","CPT","newly edited load request","Open","Emergency"`);
    });

    await test.step(`cancel load request`, async () => {
      await page.getByText(newlyCreatedLoadRequestId).click();
      await page.getByRole('button', { name: 'Cancel' }).click();
      await matDialog.waitFor();
      await matDialog.getByRole('button', { name: 'Confirm' }).click();
      await matDialog.waitFor({ state: 'hidden' });
      await materialPage.checkAndCloseAlert(/Request \(ID: \d+\) deleted successfully/);
    });

    await test.step(`search for newly 'Cancelled'/'Emergency' load request`, async () => {
      await page.getByRole('link', { name: 'Load Request' }).click();
      await materialPage.selectMultiOptions(page.locator(`[id="requestStatusFilterSelect"]`), ['Cancelled']);
      await materialPage.selectMultiOptions(page.locator(`[id="requestTypeFilterSelect"]`), ['Emergency']);
      await page.getByRole('button', { name: 'Search' }).click();
      await materialPage.waitForSpinner();
      await expect(page.locator('td:has-text("Emergency")')).toBeVisible();
      await expect(page.locator('td:has-text("CPT")')).toBeVisible();
      await expect(page.locator('td:has-text("Cancelled")')).toBeVisible();
      await expect(page.getByText('newly edited load request')).toBeVisible();
    });

    await test.step(`download newly cancelled load request`, async () => {
      const [, downloadFile] = await Promise.all([
        page.getByRole('button', { name: 'Download' }).click(),
        page.waitForEvent('download')],
      );

      await materialPage.checkAndCloseAlert('Export downloaded.');

      const fileContent = readFileSync(await downloadFile.path(), { encoding: 'utf-8' });
      expect(fileContent).toContain('opRequestSeq, codeSystemName, requestSubject, requestStatus, requestType, requestTime, requester, creationTime');
      expect(fileContent).toContain(`"${newlyCreatedLoadRequestId}","CPT","newly edited load request","Cancelled","Emergency"`);
    });

    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

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
      await materialPage.selectDateRangerPicker(datePicker, { year: 2017, month: 11, day: 1 }, todayInMatDate);
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
      await materialPage.selectDateRangerPicker(datePicker, { year: 2010, month: 1, day: 1 }, todayInMatDate);
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


  test('download csv fail', async ({ page, materialPage }) => {
    await page.route('**/load-request/list', async route => {
      await route.abort();
    });

    await test.step(`download csv failed.`, async () => {
      await page.getByRole('button', { name: 'Download' }).click();

      await materialPage.checkAndCloseAlert('Export download failed.');
    });

  });

});

