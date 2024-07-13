import { test, expect, Page, ConsoleMessage } from '@playwright/test';
import { readFileSync } from 'fs';
import { epic, suite } from 'allure-js-commons';

const UNEXPECTED_CONSOLE_LOG: string[] = [];

class MaterialPO {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  matOverlay() {
    return this.page.locator('.cdk-overlay-container');
  }

  matDialog() {
    return this.page.locator('mat-dialog-container');
  }

  matSpinner() {
    return this.page.locator('mat-spinner');
  }

  async waitForSpinner() {
    await this.matSpinner().waitFor();
    await this.matSpinner().waitFor({ state: 'hidden' });
  }

  async checkAndCloseAlert(text: string | RegExp) {
    const snackBarContainer = this.page.locator('mat-snack-bar-container');
    const snackBarLabel = this.page.locator('.mat-mdc-snack-bar-label.mdc-snackbar__label');
    await snackBarContainer.waitFor();
    await expect(snackBarLabel).toHaveText(text);
    await snackBarContainer.getByRole('button').click();
  }

}

test.describe('e2e test', async () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await epic('TS ETL UI');
    page.on('console', (consoleMessage: ConsoleMessage) => {
      if (consoleMessage) {
        UNEXPECTED_CONSOLE_LOG.push(consoleMessage.text());
      }
    });

    await page.goto('/');
    await test.step('has title', async () => {
      await expect(page).toHaveTitle('Please Log In');
    });
    await test.step('has login required message', async () => {
      await expect(page.getByRole('heading').getByText('his application requires you to log in. Please do so before proceeding.')).toBeVisible();
    });

    await test.step('login', async () => {
      await page.getByRole('button', { name: 'Log In' }).click();
      await page.getByRole('button', { name: 'UTS' }).click();
      await page.waitForURL(`${baseURL}/load-requests` || '');
    });
  });

  test('Load Request Tab', async ({ page }) => {
    await suite('Load Request');

    const materialPo = new MaterialPO(page);
    const matDialog = materialPo.matDialog();

    await expect(page.getByRole('link', { name: 'Load Requests' })).toBeVisible();

    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Request' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Download' })).toBeVisible();

    await expect(page.getByRole('table').locator('tbody tr.example-element-row')).not.toHaveCount(0);

    await test.step('add load request', async () => {
      await page.getByRole('button', { name: 'Create Request' }).click();
      await matDialog.waitFor();
      /**
       * note: We can use `await page.getByRole('radio', {name: 'Regular'}).check();`
       * but using `matDialog` instead of `page` is it ensures those fields are inside a dialog modal
       */
      await matDialog.getByRole('radio', { name: 'Regular' }).check();
      await matDialog.getByLabel('Code System Name').click();
      /**
       * mat-option is not attached to modal, it appends to end of app root tag, so using page instead of `matDialog`.
       */
      await page.getByRole('option', { name: 'HPO' }).click();
      await matDialog.getByLabel('Request Subject').fill('newly created load request');
      await matDialog.locator('[id="sourcePathFile"]').setInputFiles('./tests/nlmsombaserver.nlm.nih.gov/dev-ts-data-import/june-26-2024');
      await expect(matDialog.getByLabel('Source File Path')).toHaveValue(/file:\/\/nlmsombaserver\.nlm\.nih\.gov\/dev-ts-data-import\//);
      await matDialog.getByLabel('Notification Email').fill('playwright@example.com');
      await matDialog.getByRole('button', { name: 'Submit' }).click();
      await matDialog.waitFor({ state: 'hidden' });
      await materialPo.checkAndCloseAlert(/Request \(ID: \d+\) created successfully/);
    });

    await test.step('search for newly added load request', async () => {
      await page.route('/api/loadRequests', async route => {
        await page.waitForTimeout(2000);
        await route.continue();
      });

      await page.locator('[id="requestIdFilterInput"]').fill('149');
      await page.getByRole('button', { name: 'Search' }).click();
      await materialPo.waitForSpinner();
      await expect(page.locator('td:has-text("Regular")')).toBeVisible();
      await expect(page.locator('td:has-text("HPO")')).toBeVisible();
      await expect(page.getByText('newly created load request')).toBeVisible();
    });

    await test.step(`download`, async () => {
      const [, downloadFile] = await Promise.all([
        page.getByRole('button', { name: 'Download' }).click(),
        page.waitForEvent('download')],
      );

      await materialPo.checkAndCloseAlert('Export downloaded.');

      const fileContent = readFileSync(await downloadFile.path(), { encoding: 'utf-8' });
      expect(fileContent).toContain('requestId, codeSystemName, requestSubject, requestStatus, requestType, requestTime, requester, creationTime');
      expect(fileContent).toContain('"149","HPO","newly created load request","In Progress","Regular"');
    });
  });

  test('Version QA Tab', async ({ page }) => {
    await suite('Version QA');

    const materialPo = new MaterialPO(page);
    const matDialog = materialPo.matDialog();

    await page.getByRole('link', { name: 'QA Versions' }).click();

    await expect(page.getByRole('table').locator('tbody tr')).not.toHaveCount(0);

    await test.step(`Accept version QA`, async () => {
      await page.locator('tbody tr td .fake-link').nth(1).click();
      await page.getByRole('button', { name: 'Accept' }).click();
      await matDialog.waitFor();
      await matDialog.getByPlaceholder('Notes').fill('Accepted by me');
      await matDialog.getByRole('button', { name: 'Save' }).click();
      await matDialog.waitFor({ state: 'hidden' });
      await materialPo.checkAndCloseAlert('Activity added successfully.');

      const activityHistoryFirstRow = page.locator('table[data-testid=qaActivitiesTable] tbody tr').first();
      await activityHistoryFirstRow.click();
      await expect(page.getByText('Accepted by me')).toBeVisible();
    });
  });

  test('Code System Tab', async ({ page }) => {
    await suite('Code System');

    await page.getByRole('link', { name: 'Code Systems' }).click();
    await expect(page.getByRole('table').locator('tbody tr')).not.toHaveCount(0);
  });

  test.afterAll(async () => {
    if (UNEXPECTED_CONSOLE_LOG.length) {
      throw new Error(`Unexpected console message: ${UNEXPECTED_CONSOLE_LOG.join('\n*****************\n')}`);
    }
  });
});
