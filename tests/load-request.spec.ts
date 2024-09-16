import test from './baseFixture';
import { expect } from '@playwright/test';
import { readFileSync } from 'fs';

test.describe('LR - ', async () => {
  test('Load Request table', async ({ loggedInPage, materialPo }) => {
    const matDialog = materialPo.matDialog();

    await expect(loggedInPage.getByRole('link', { name: 'Load Request' })).toBeVisible();

    await expect(loggedInPage.getByRole('button', { name: 'Search' })).toBeVisible();
    await expect(loggedInPage.getByRole('button', { name: 'Reset' })).toBeVisible();
    await expect(loggedInPage.getByRole('button', { name: 'Create Request' })).toBeVisible();
    await expect(loggedInPage.getByRole('button', { name: 'Download' })).toBeVisible();

    await expect(loggedInPage.getByRole('table').locator('tbody tr.example-element-row')).not.toHaveCount(0);

    // this api interception is to make network slow, so the spinner can be verified.
    await loggedInPage.route('**/load-request/list', async route => {
      await loggedInPage.waitForTimeout(2000);
      await route.continue();
    });

    await loggedInPage.route('**/loadRequest/', async route => {
      await loggedInPage.waitForTimeout(2000);
      await route.continue();
    });

    await test.step('add load request', async () => {
      await loggedInPage.getByRole('button', { name: 'Create Request' }).click();
      await matDialog.waitFor();
      /**
       * note: We can use `await loggedInPage.getByRole('radio', {name: 'Regular'}).check();`
       * but using `matDialog` instead of `page` is it ensures those fields are inside a dialog modal
       */
      await matDialog.getByRole('radio', { name: 'Scheduled' }).check();
      await matDialog.getByRole('button', { name: 'Open calendar' }).click();
      await loggedInPage.locator(`mat-calendar`).waitFor();
      await loggedInPage.locator('.mat-calendar-body-cell.mat-calendar-body-active').click();
      await loggedInPage.locator(`mat-calendar`).waitFor({ state: 'hidden' });
      await matDialog.getByRole('combobox', { name: 'Scheduled time' }).click();
      await loggedInPage.getByRole('option', { name: '11:30 PM' }).click();
      await matDialog.getByLabel('Code System Name').click();
      /**
       * mat-option is not attached to modal, it appends to end of app root tag, so using page instead of `matDialog`.
       */
      await loggedInPage.getByRole('option', { name: 'HPO' }).click();
      await matDialog.getByLabel('Request Subject').fill('newly created load request');
      await matDialog.getByPlaceholder('file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/').fill('file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/LOINC/LOINC2020/');
      await matDialog.getByLabel('Notification Email').fill('playwright@example.com');
      await matDialog.getByRole('button', { name: 'Submit' }).click();
      await matDialog.waitFor({ state: 'hidden' });
      await materialPo.checkAndCloseAlert(/Request \(ID: \d+\) created successfully/);
    });

    await test.step('search for newly added load request', async () => {
      await loggedInPage.locator('[id="opRequestSeqFilterInput"]').fill('149');
      await loggedInPage.getByPlaceholder('Any Request date').click();
      await materialPo.matOption().filter({ hasText: `Today's` }).click();
      await loggedInPage.getByRole('button', { name: 'Search' }).click();
      await materialPo.waitForSpinner();

      await expect(loggedInPage.locator('td:has-text("Scheduled")')).toBeVisible();
      await expect(loggedInPage.locator('td:has-text("HPO")')).toBeVisible();
      await expect(loggedInPage.getByText('newly created load request')).toBeVisible();
    });

    await test.step(`download newly added load request`, async () => {
      const [, downloadFile] = await Promise.all([
        loggedInPage.getByRole('button', { name: 'Download' }).click(),
        loggedInPage.waitForEvent('download')],
      );

      await materialPo.checkAndCloseAlert('Export downloaded.');

      const fileContent = readFileSync(await downloadFile.path(), { encoding: 'utf-8' });
      expect(fileContent).toContain('opRequestSeq, codeSystemName, requestSubject, requestStatus, requestType, requestTime, requester, creationTime');
      expect(fileContent).toContain('"149","HPO","newly created load request","Open","Scheduled"');
    });

    await test.step(`edit load request`, async () => {
      await loggedInPage.getByText('149').click();
      await loggedInPage.getByRole('button', { name: 'Edit' }).click();
      await matDialog.waitFor();
      await matDialog.getByRole('radio', { name: 'Emergency' }).check();
      await matDialog.getByLabel('Code System Name').click();
      await loggedInPage.getByRole('option', { name: 'CPT' }).click();
      await matDialog.getByLabel('Request Subject').fill('newly edited load request');
      await matDialog.getByPlaceholder('file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/').fill('file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/june-26-2024');
      await matDialog.getByLabel('Notification Email').fill('playwright-edit@example.com');
      await matDialog.getByRole('button', { name: 'Submit' }).click();
      await matDialog.waitFor({ state: 'hidden' });
      await materialPo.checkAndCloseAlert(/Request \(ID: \d+\) edited successfully/);
    });

    await test.step('search for newly edited load request', async () => {
      await loggedInPage.getByRole('link', { name: 'Load Request' }).click();
      await loggedInPage.locator('[id="opRequestSeqFilterInput"]').fill('149');
      // next 2 lines might fall, if the test runs first step on Saturday 11:59 PM and this step runs on Sunday 00:00 AM. This week's filter will fail. But this is very unlikely
      await loggedInPage.getByPlaceholder('Any Request date').click();
      await materialPo.matOption().filter({ hasText: `This week's` }).click();
      await loggedInPage.getByRole('button', { name: 'Search' }).click();
      await materialPo.waitForSpinner();

      await expect(loggedInPage.locator('td:has-text("Emergency")')).toBeVisible();
      await expect(loggedInPage.locator('td:has-text("CPT")')).toBeVisible();
      await expect(loggedInPage.getByText('newly edited load request')).toBeVisible();
    });

    await test.step(`download newly edited load request`, async () => {
      const [, downloadFile] = await Promise.all([
        loggedInPage.getByRole('button', { name: 'Download' }).click(),
        loggedInPage.waitForEvent('download')],
      );

      await materialPo.checkAndCloseAlert('Export downloaded.');

      const fileContent = readFileSync(await downloadFile.path(), { encoding: 'utf-8' });
      expect(fileContent).toContain('opRequestSeq, codeSystemName, requestSubject, requestStatus, requestType, requestTime, requester, creationTime');
      expect(fileContent).toContain('"149","CPT","newly edited load request","Open","Emergency"');
    });

    await test.step(`cancel load request`, async () => {
      await loggedInPage.getByText('149').click();
      await loggedInPage.getByRole('button', { name: 'Cancel' }).click();
      await matDialog.waitFor();
      await matDialog.getByRole('button', { name: 'Confirm' }).click();
      await matDialog.waitFor({ state: 'hidden' });
      await materialPo.checkAndCloseAlert(/Request \(ID: \d+\) deleted successfully/);
    });

    await test.step(`search for newly 'Cancelled'/'Emergency' load request`, async () => {
      await loggedInPage.getByRole('link', { name: 'Load Request' }).click();
      await materialPo.selectMultiOptions(loggedInPage.getByLabel('Request Status'), ['Cancelled']);
      await materialPo.selectMultiOptions(loggedInPage.getByLabel('Request Type'), ['Emergency']);
      await loggedInPage.getByRole('button', { name: 'Search' }).click();
      await materialPo.waitForSpinner();
      await expect(loggedInPage.locator('td:has-text("Emergency")')).toBeVisible();
      await expect(loggedInPage.locator('td:has-text("CPT")')).toBeVisible();
      await expect(loggedInPage.locator('td:has-text("Cancelled")')).toBeVisible();
      await expect(loggedInPage.getByText('newly edited load request')).toBeVisible();
    });

    await test.step(`download newly cancelled load request`, async () => {
      const [, downloadFile] = await Promise.all([
        loggedInPage.getByRole('button', { name: 'Download' }).click(),
        loggedInPage.waitForEvent('download')],
      );

      await materialPo.checkAndCloseAlert('Export downloaded.');

      const fileContent = readFileSync(await downloadFile.path(), { encoding: 'utf-8' });
      expect(fileContent).toContain('opRequestSeq, codeSystemName, requestSubject, requestStatus, requestType, requestTime, requester, creationTime');
      expect(fileContent).toContain('"149","CPT","newly edited load request","Cancelled","Emergency"');
    });

    await loggedInPage.unrouteAll({ behavior: 'ignoreErrors' });
  });

  test(`Search multi select fields`, async ({ loggedInPage, materialPo }) => {
    await test.step(`select 2 Code System Name`, async () => {
      await materialPo.selectMultiOptions(loggedInPage.getByLabel('Code System Name'), ['GS', 'MMSL']);
    });
    await test.step(`select 2 Request Status`, async () => {
      await materialPo.selectMultiOptions(loggedInPage.getByLabel('Request Status'), ['Incomplete', 'Stopped']);
    });
    await test.step(`select 2 Request Type`, async () => {
      await materialPo.selectMultiOptions(loggedInPage.getByLabel('Request Type'), ['Emergency', 'Scheduled']);
    });

    await test.step(`Search and verify result`, async () => {
      await loggedInPage.getByRole('button', { name: 'Search' }).click();
      const tableRows = loggedInPage.locator('tbody[role="rowgroup"]').getByRole('row');
      await expect(tableRows).toHaveCount(2);
      await expect(tableRows.first()).toContainText('MMSL');
      await expect(tableRows.first()).toContainText('Incomplete');
      await expect(tableRows.first()).toContainText('Emergency');
      await expect(tableRows.nth(1)).toContainText('GS');
      await expect(tableRows.nth(1)).toContainText('Stopped');
      await expect(tableRows.nth(1)).toContainText('Scheduled');
    });

  });

  const firstCell = 'table tbody tr:first-of-type td:first-of-type';
  test('URL Search Request Time From', async ({ loggedInPage }) => {
    await loggedInPage.goto('/load-requests?requestTimeFrom=2017-11-01&sortBy=requestTime&sortDirection=desc');
    await expect(loggedInPage.locator(firstCell)).toHaveText('149');
  });

  test('URL Search Request Time To', async ({ loggedInPage }) => {
    await loggedInPage.goto('/load-requests?requestTimeFrom=2017-11-01&requestTimeTo=2017-11-30&sortBy=requestTime&sortDirection=desc');
    await expect(loggedInPage.locator(firstCell)).toHaveText('59');
  });

  test('URL Search Creation Time From', async ({ loggedInPage }) => {
    await loggedInPage.goto('/load-requests?creationTimeFrom=2010-01-01&sortBy=creationTime&sortDirection=desc');
    await expect(loggedInPage.locator(firstCell)).toHaveText('1');
  });

  test('URL Search Creation Time To', async ({ loggedInPage }) => {
    await loggedInPage.goto('/load-requests?creationTimeFrom=2010-01-01&creationTimeTo=2013-01-01&sortBy=creationTime&sortDirection=desc');
    await expect(loggedInPage.locator(firstCell)).toHaveText('27');
  });

  test('URL Subject Filter', async ({ loggedInPage }) => {
    await loggedInPage.goto('/load-requests');
    await loggedInPage.locator('#subjectInput').fill('Great Subject');
    await loggedInPage.keyboard.press('Enter');
    await expect(loggedInPage.locator(firstCell)).toHaveText('29');
  });

  test('URL Status Filter', async ({ loggedInPage, materialPo }) => {
    await loggedInPage.goto('/load-requests');
    await materialPo.selectMultiOptions(loggedInPage.getByLabel('Request Status'), ['Stopped']);
    await loggedInPage.getByRole('button', { name: 'Search' }).click();
    await expect(loggedInPage.locator(firstCell)).toHaveText('30');
  });

  test('URL User Filter', async ({ loggedInPage }) => {
    await loggedInPage.goto('/load-requests');
    await loggedInPage.locator('#requesterInput').fill('bernicevega');
    await loggedInPage.keyboard.press('Enter');
    await expect(loggedInPage.locator(firstCell)).toHaveText('6');
  });

  test('Search Page Size', async ({ loggedInPage }) => {
    await loggedInPage.goto('/load-requests?pageSize=15');
    const rows = await loggedInPage.locator('table tbody tr');
    await expect(rows).toHaveCount(15);
  });
});
