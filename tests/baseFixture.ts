import { test as baseTest, expect, Page, ConsoleMessage, TestInfo, Locator } from '@playwright/test';

import { randomBytes } from 'crypto';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { MAT_MONTH_MAP, MatDate } from './CONSTANT';

const PROJECT_ROOT_FOLDER = join(__dirname, '..');
const NYC_OUTPUT_FOLDER = join(PROJECT_ROOT_FOLDER, 'e2e_nyc_output');

async function codeCoverage(page: Page, testInfo: TestInfo) {
  const coverage: string = await page.evaluate(
    'JSON.stringify(window.__coverage__);',
  );
  if (coverage) {
    const name = randomBytes(32).toString('hex');
    const nycOutput = join(NYC_OUTPUT_FOLDER, `${name}`);
    await writeFileSync(nycOutput, coverage);
  } else {
    throw new Error(`No coverage found for ${testInfo.testId}`);
  }
}

const EXPECTED_CONSOLE_LOGS: string[] = ['[webpack-dev-server]'];
const UNEXPECTED_CONSOLE_LOGS: string[] = [];


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

  matOption() {
    return this.page.locator('mat-option');
  }

  /**
   *
   * @param selectLocator the locator where the select button is
   * @param options the options to select the dropdown
   * @param waitForSpinner default true, whether waits for mat spinner or not, if true, there is a need to slow down the api by intercept the request
   */
  async selectMultiOptions(selectLocator: Locator, options: string[], waitForSpinner = false) {
    await selectLocator.click();
    for (const option of options) {
      await this.page.getByRole('option', { name: option }).click();
      if (waitForSpinner) {
        await this.waitForSpinner();
      }
    }
    await this.page.keyboard.press('Escape');
  }

  async selectDateRangerPicker(containerLocator: Locator, from: MatDate, to: MatDate | undefined = undefined) {
    const calendarIcon = containerLocator.locator(`button[aria-label="Open calendar"]`);
    await calendarIcon.click();
    const calendar = this.page.locator(`mat-calendar`);
    await calendar.waitFor();
    await this.selectMatDate(from);
    if (to) {
      await this.selectMatDate(to);
    } else {
      await this.page.keyboard.press('Escape');
    }
    await calendar.waitFor({ state: 'hidden' });
  }

  private async selectMatDate(d: MatDate) {
    const calendar = this.page.locator(`mat-calendar`);
    await calendar.locator(`[aria-label="Choose month and year"]`).click();

    // navigate to year select which desired year in range
    let firstYear = await calendar.getByRole('gridcell').first().innerText();
    while (d.year < Number(firstYear)) {
      await calendar.getByLabel('Previous 24 years').click();
      firstYear = await calendar.getByRole('gridcell').first().innerText();
    }
    let lastYear = await calendar.getByRole('gridcell').last().innerText();
    while (d.year > Number(lastYear)) {
      await calendar.getByLabel('Next 24 years').click();
      lastYear = await calendar.getByRole('gridcell').last().innerText();
    }

    await calendar.getByRole('button', { name: d.year + '', exact: true }).click();
    await calendar.getByLabel(MAT_MONTH_MAP[d.month]).click();
    await calendar.getByLabel(`${MAT_MONTH_MAP[d.month]} ${d.day},`).click();
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

const test = baseTest.extend<{
  materialPo: MaterialPO,
  accountUsername: string
}>({
  materialPo: async ({ page, baseURL }, use) => {
    await use(new MaterialPO(page));
  },
  accountUsername: '',
  page: async ({ page, accountUsername, baseURL }, use, testInfo) => {
    page.on('console', (consoleMessage: ConsoleMessage) => {
      if (consoleMessage) {
        UNEXPECTED_CONSOLE_LOGS.push(consoleMessage.text());
      }
    });

    await page.goto('/');
    await test.step('has title', async () => {
      await expect(page).toHaveTitle('Please Log In');
    });
    await test.step('has login required message', async () => {
      await expect(page.getByRole('heading').getByText('his application requires you to log in. Please do so before proceeding.')).toBeVisible();
    });

    if (accountUsername) {
      const userNameMap: Record<string, string> = {
        'peter': 'Peter',
        'christophe': 'Christophe',
      };
      await test.step('login', async () => {
        await page.getByRole('button', { name: 'Log In' }).click();
        await page.getByRole('link', { name: 'UTS' }).click();
        await page.getByRole('button', { name: 'Sign in' }).click();
        await page.locator('[name="ticket"]').selectOption(userNameMap[accountUsername.toLowerCase()]);
        await page.getByRole('button', { name: 'Ok' }).click();
        await page.waitForURL(`${baseURL}/load-requests`);
      });
    }
    await use(page);
    if (!!process.env['CI'] || process.env['COVERAGE']) {
      await codeCoverage(page, testInfo);
    }
  },
});

test.afterEach(async ({ page }, testInfo) => {
});

test.afterAll(async () => {
  const unexpected_console_logs = UNEXPECTED_CONSOLE_LOGS.filter(UNEXPECTED_CONSOLE_LOG => {
    const expectedConsoleLogs = EXPECTED_CONSOLE_LOGS.filter(EXPECTED_CONSOLE_LOG => EXPECTED_CONSOLE_LOG.indexOf(UNEXPECTED_CONSOLE_LOG) > -1);
    const isExpected = expectedConsoleLogs.length;
    return isExpected;
  });
  if (unexpected_console_logs.length) {
    throw new Error(`Unexpected console message: ${unexpected_console_logs.join('\n*****************\n')}`);
  }
});

export default test;