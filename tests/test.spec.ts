import test from './baseFixture';
import { expect } from '@playwright/test';
import { readFileSync } from 'fs';

test.describe('e2e test', async () => {

  test('Not Logged in', async ({ page }) => {
    await page.goto('/load-requests');
    await page.locator('#userMenu').click();
    await page.locator('#logout').click();
    await expect(page.locator('body')).toContainText('This application requires you to log in');
    await page.goto('/load-requests');
    await expect(page.locator('body')).toContainText('This application requires you to log in');
    await page.locator('#login').click();
    await expect(page.locator('mat-dialog-container')).toContainText('Login with Following');
    await page.locator('button', {hasText : 'Close'});
    await expect(page.locator('body')).toContainText('This application requires you to log in');
  });

  test('Invalid User', async ({ page, materialPo }) => {
    await page.goto('/load-requests');
    await page.locator('#userMenu').click();
    await page.locator('#logout').click();
    await expect(page.locator('body')).toContainText('This application requires you to log in');
    await page.goto('/login-cb?ticket=bogusTicket');
    await materialPo.checkAndCloseAlert('Unable to log in');
    await expect(page.locator('body')).toContainText('This application requires you to log in');
  });

  test('Missing Ticket', async ({ page, materialPo }) => {
    await page.goto('/load-requests');
    await page.goto('/login-cb');
    await materialPo.checkAndCloseAlert('Unable to log in');
  });

  test('Jwt Fail', async ({ page }) => {
    await page.route('**/api/login', route => {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({  }),
      });
    });
    await page.goto('/load-requests');
    await expect(page.locator('body')).toContainText('This application requires you to log in');
  });

  test('Load Request Tab', async ({ page, materialPo }) => {
    const matDialog = materialPo.matDialog();

    await expect(page.getByRole('link', { name: 'Load Request' })).toBeVisible();

    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Request' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Download' })).toBeVisible();

    await expect(page.getByRole('table').locator('tbody tr.example-element-row')).not.toHaveCount(0);

    // this api interception is to make network slow, so the spinner can be verified.
    await page.route('**/load-request/list', async route => {
      await page.waitForTimeout(2000);
      await route.continue();
    });
    await page.route('**/loadRequest/', async route => {
      await page.waitForTimeout(2000);
      await route.continue();
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
      await matDialog.getByPlaceholder('file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/').fill('this is not valid');
      await page.locator('mat-dialog-container h2').click();
      await expect(page.locator('mat-dialog-container')).toContainText('Please select source file from NLM server');
      await matDialog.getByPlaceholder('file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/').clear();
      await matDialog.getByPlaceholder('file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/').fill('file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/LOINC/LOINC2020/');
      await page.locator('mat-dialog-container h2').click();
      await matDialog.getByLabel('Notification Email').fill('playwright@example.com');
      await matDialog.getByRole('button', { name: 'Submit' }).click();
      await matDialog.waitFor({ state: 'hidden' });
      await materialPo.checkAndCloseAlert(/Request \(ID: \d+\) created successfully/);
    });

    await test.step('search for newly added load request', async () => {
      await page.locator('[id="opRequestSeqFilterInput"]').fill('149');
      await page.getByPlaceholder('Any Request date').click();
      await materialPo.matOption().filter({ hasText: `Today's` }).click();
      await page.getByRole('button', { name: 'Search' }).click();
      await materialPo.waitForSpinner();

      await expect(page.locator('td:has-text("Scheduled")')).toBeVisible();
      await expect(page.locator('td:has-text("HPO")')).toBeVisible();
      await expect(page.getByText('newly created load request')).toBeVisible();
    });

    await test.step(`download newly added load request`, async () => {
      const [, downloadFile] = await Promise.all([
        page.getByRole('button', { name: 'Download' }).click(),
        page.waitForEvent('download')],
      );

      await materialPo.checkAndCloseAlert('Export downloaded.');

      const fileContent = readFileSync(await downloadFile.path(), { encoding: 'utf-8' });
      expect(fileContent).toContain('opRequestSeq, codeSystemName, requestSubject, requestStatus, requestType, requestTime, requester, creationTime');
      expect(fileContent).toContain('"149","HPO","newly created load request","Open","Scheduled"');
    });

    await test.step(`edit load request`, async () => {
      await page.getByText('149').click();
      await page.getByRole('button', { name: 'Edit' }).click();
      await matDialog.waitFor();
      await matDialog.getByRole('radio', { name: 'Emergency' }).check();
      await matDialog.getByLabel('Code System Name').click();
      await page.getByRole('option', { name: 'CPT' }).click();
      await matDialog.getByLabel('Request Subject').fill('newly edited load request');
      await matDialog.getByPlaceholder('file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/').fill('file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/june-26-2024');
      await matDialog.getByLabel('Notification Email').fill('playwright-edit@example.com');
      await matDialog.getByRole('button', { name: 'Submit' }).click();
      await matDialog.waitFor({ state: 'hidden' });
      await materialPo.checkAndCloseAlert(/Request \(ID: \d+\) edited successfully/);
    });

    await test.step('search for newly edited load request', async () => {
      await page.getByRole('link', { name: 'Load Request' }).click();
      await page.locator('[id="opRequestSeqFilterInput"]').fill('149');
      // next 2 lines might fall, if the test runs first step on Saturday 11:59 PM and this step runs on Sunday 00:00 AM. This week's filter will fail. But this is very unlikely
      await page.getByPlaceholder('Any Request date').click();
      await materialPo.matOption().filter({ hasText: `This week's` }).click();
      await page.getByRole('button', { name: 'Search' }).click();
      await materialPo.waitForSpinner();

      await expect(page.locator('td:has-text("Emergency")')).toBeVisible();
      await expect(page.locator('td:has-text("CPT")')).toBeVisible();
      await expect(page.getByText('newly edited load request')).toBeVisible();
    });

    await test.step(`download newly edited load request`, async () => {
      const [, downloadFile] = await Promise.all([
        page.getByRole('button', { name: 'Download' }).click(),
        page.waitForEvent('download')],
      );

      await materialPo.checkAndCloseAlert('Export downloaded.');

      const fileContent = readFileSync(await downloadFile.path(), { encoding: 'utf-8' });
      expect(fileContent).toContain('opRequestSeq, codeSystemName, requestSubject, requestStatus, requestType, requestTime, requester, creationTime');
      expect(fileContent).toContain('"149","CPT","newly edited load request","Open","Emergency"');
    });

    await test.step(`cancel load request`, async () => {
      await page.getByText('149').click();
      await page.getByRole('button', { name: 'Cancel' }).click();
      await matDialog.waitFor();
      await matDialog.getByRole('button', { name: 'Confirm' }).click();
      await matDialog.waitFor({ state: 'hidden' });
      await materialPo.checkAndCloseAlert(/Request \(ID: \d+\) deleted successfully/);
    });

    await test.step('search for newly cancelled load request', async () => {
      await page.getByRole('link', { name: 'Load Request' }).click();
      await page.locator('[id="requestStatusInput"]').selectOption('Cancelled'); // this line triggers search
      await materialPo.waitForSpinner();
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

      await materialPo.checkAndCloseAlert('Export downloaded.');

      const fileContent = readFileSync(await downloadFile.path(), { encoding: 'utf-8' });
      expect(fileContent).toContain('opRequestSeq, codeSystemName, requestSubject, requestStatus, requestType, requestTime, requester, creationTime');
      expect(fileContent).toContain('"149","CPT","newly edited load request","Cancelled","Emergency"');
    });

    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

  test('Version QA Tab', async ({ page, materialPo }) => {
    const matDialog = materialPo.matDialog();

    await page.getByRole('link', { name: 'Version QA' }).click();

    await expect(page.getByRole('table').locator('tbody tr')).not.toHaveCount(0);

    await test.step(`Accept version QA`, async () => {
      await page.locator('tbody tr td .fake-link').nth(1).click();
      await page.getByRole('button', { name: 'Accept' }).click();
      await matDialog.waitFor();
      await matDialog.getByPlaceholder('Notes').fill('Accepted by me');
      await matDialog.getByRole('button', { name: 'Save' }).click();
      await matDialog.waitFor({ state: 'hidden' });
      await materialPo.checkAndCloseAlert('Activity added successfully.');
      await expect(page.locator('app-load-version-activity').getByText('Accepted by me')).toBeVisible();
      await expect(page.locator('app-load-version-note').getByText('Accepted by me')).toBeVisible();
    });

    await test.step('Add note', async () => {
      await page.getByRole('button', { name: 'Add Note' }).click();
      for (const [index, tag] of ['Test.Hashtag1', 'Test.Hashtag2', 'New Test Note'].entries()) {
        await page.getByPlaceholder('New Hashtag...').fill(tag);
        await page.keyboard.press('Enter');
        await expect(page.locator('mat-chip-row')).toHaveCount(index + 1);
      }

      await page.locator('mat-dialog-content textarea').fill('New Test Note');
      await page.getByRole('button', { name: 'Save' }).click();
      await materialPo.checkAndCloseAlert('Note added successfully.');
      await expect(page.locator('app-load-version-note').getByText('#Test.Hashtag2')).toBeVisible();
    });

    await test.step(`Open QA Report page`, async () => {
      const [qaReportPage] = await Promise.all([
        page.waitForEvent('popup'),
        page.getByRole('link', { name: 'Go to QA Report' }).click(),
      ]);

      await expect(qaReportPage).toHaveTitle(`Version QA Report`);
    });
  });

  test('Code System Tab', async ({ page }) => {
    await page.getByRole('link', { name: 'Code System' }).click();
    await expect(page.getByRole('table').locator('tbody tr')).not.toHaveCount(0);
  });

  test('Rule Message', async ({ page }) => {
    await page.goto('/load-version-report/0');
    const firstRow = 'app-load-version-report-rule-message tbody tr:first-of-type';
    await expect(page.locator(firstRow)).toContainText('Code.Hierarchy.OrphanCode');
    await expect(page.locator(firstRow)).toContainText('Error');
    await expect(page.locator(firstRow)).toContainText('Code D90012 is not mapped to a term');

    await page.locator('#messageGroupSearch').selectOption('Warning');
    await expect(page.locator(firstRow)).not.toContainText('Code D90012 is not mapped to a term');
  });

  test('QA Rules', async ({ page }) => {
    await page.goto('/load-version-report/0');
    const row = 'app-load-version-report-rule tbody tr:nth-of-type(2)';
    await expect(page.locator(row)).toContainText('Code.DuplicateCode');
    await expect(page.locator(row)).toContainText('No duplicate codes in cs_code table');
    await expect(page.locator(`${row} td:nth-of-type(4)`)).toContainText('5');

    await page.locator('app-load-version-report-rule #nameFilterInput').fill('QaCount');
    await page.keyboard.press('Enter');

    await expect(page.locator(row)).not.toContainText('No duplicate codes in cs_code table');
    await expect(page.locator(row)).toContainText('Raw counts are not present');
  });

  test('Note Filters', async ({ page }) => {
    await page.goto('/load-versions');
    await page.locator('tbody tr td .fake-link', { hasText: '20231012080001' }).click();

    const tbody = 'app-load-version-note tbody';

    await expect(page.locator(tbody)).toContainText('TestTag');
    await expect(page.locator(tbody)).toContainText('Tag.3');

    await page.locator('#hashtagsFilterInput').selectOption('Tag2');
    await expect(page.locator(tbody)).toContainText('Note2');
    await expect(page.locator(tbody)).not.toContainText('TestTag');
    await expect(page.locator(tbody)).not.toContainText('Tag.3');

    await page.locator('#hashtagsFilterInput').selectOption('ALL');
    await expect(page.locator(tbody)).toContainText('TestTag');
    await expect(page.locator(tbody)).toContainText('Tag.3');

    await page.locator('#noteInput').fill('Second');
    await expect(page.locator(tbody)).toContainText('Note2');
    await expect(page.locator(tbody)).not.toContainText('TestTag');
    await expect(page.locator(tbody)).not.toContainText('Tag.3');

    await page.locator('#noteInput').clear();
    await page.locator('#createdBySearchInput').selectOption('ludetc');
    await expect(page.locator(tbody)).toContainText('Note2');
    await expect(page.locator(tbody)).not.toContainText('TestTag');
    await expect(page.locator(tbody)).not.toContainText('Tag.3');

    await page.locator('#createdBySearchInput').selectOption('ALL');
    await expect(page.locator(tbody)).toContainText('TestTag');
    await expect(page.locator(tbody)).toContainText('Tag.3');
  });

  test('Code System Filter', async ({ page }) => {
    await page.goto('/code-systems');
    await expect(page.locator('#codeSystemsListTable > tbody')).toContainText('LOINC');

    await page.locator('#codeSystemSearchInput').fill('ICD');
    await page.keyboard.press('Enter');
    await expect(page.locator('#codeSystemsListTable > tbody')).not.toContainText('LOINC');
  });

  const firstCell = 'table tbody tr:first-of-type td:first-of-type';
  test('LR - URL Search Request Time From', async ({ page }) => {
    await page.goto('/load-requests?requestTimeFrom=2017-11-01&sortBy=requestTime&sortDirection=asc');
    await expect(page.locator(firstCell)).toHaveText('27');
  });

  test('LR - URL Search Request Time To', async ({ page }) => {
    await page.goto('/load-requests?requestTimeFrom=2017-11-01&requestTimeTo=2017-11-30&sortBy=requestTime&sortDirection=desc');
    await expect(page.locator(firstCell)).toHaveText('59');
  });

  test('LR - URL Search Creation Time From', async ({ page }) => {
    await page.goto('/load-requests?creationTimeFrom=2010-01-01&sortBy=creationTime&sortDirection=desc');
    await expect(page.locator(firstCell)).toHaveText('1');
  });

  test('LR - URL Search Creation Time To', async ({ page }) => {
    await page.goto('/load-requests?creationTimeFrom=2010-01-01&creationTimeTo=2013-01-01&sortBy=creationTime&sortDirection=desc');
    await expect(page.locator(firstCell)).toHaveText('27');
  });

  test('LR - URL Subject Filter', async ({ page }) => {
    await page.goto('/load-requests');
    await page.locator('#subjectInput').fill('Great Subject');
    await page.keyboard.press('Enter');
    await expect(page.locator(firstCell)).toHaveText('29');
  });

  test('LR - URL Status Filter', async ({ page }) => {
    await page.goto('/load-requests');
    await page.locator('#requestStatusInput').selectOption('Stopped');
    await expect(page.locator(firstCell)).toHaveText('30');
  });

  test('LR - URL Type Filter', async ({ page }) => {
    await page.goto('/load-requests');
    await page.locator('#requestStatusInput').selectOption('Open');
    await expect(page.locator(firstCell)).toHaveText('4');
    await page.locator('#requestTypeInput').selectOption('Scheduled');
    await expect(page.locator(firstCell)).toHaveText('5');
  });

  test('LR - URL User Filter', async ({ page }) => {
    await page.goto('/load-requests');
    await page.locator('#requesterInput').fill('bernicevega');
    await page.keyboard.press('Enter');
    await expect(page.locator(firstCell)).toHaveText('6');
  });

  test('LR - Search Page Size', async ({ page }) => {
    await page.goto('/load-requests?pageSize=15');
    const rows = await page.locator('table tbody tr');
    await expect(rows).toHaveCount(15);
  });

});
