import { test as baseTest, expect, Page, ConsoleMessage, TestInfo, Locator } from '@playwright/test';

import { randomBytes } from 'crypto';
import { writeFileSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT_FOLDER = join(__dirname, '..');
const NYC_OUTPUT_FOLDER = join(PROJECT_ROOT_FOLDER, '.nyc_output');

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

  async selectMultiOptions(selectLocator: Locator, options: string[]) {
    await selectLocator.click();
    for (const option of options) {
      await this.page.getByRole('option', { name: option }).click();
    }
    await this.page.keyboard.press('Escape');
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

class EmptyUserPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
}

class LoggedInPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
}

const test = baseTest.extend<{
  materialPo: MaterialPO,
  loggedInPage: Page,
  emptyUserPage: Page,
}>({
  materialPo: async ({ page }, use) => {
    await use(new MaterialPO(page));
  },
  loggedInPage: async ({ page, baseURL }, use) => {
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
      await expect(page.getByRole('heading').getByText('this application requires you to log in. Please do so before proceeding.')).toBeVisible();
    });

    await test.step('login', async () => {
      await page.getByRole('button', { name: 'Log In' }).click();
      await page.getByRole('button', { name: 'UTS' }).click();
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.locator('[name="ticket"]').selectOption('Peter');
      await page.getByRole('button', { name: 'Ok' }).click();
      await page.waitForURL(`${baseURL}/load-requests` || '');
    });
    await use(page);
  },
  emptyUserPage: async ({ page }, use) => {
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
      await expect(page.getByRole('heading').getByText('this application requires you to log in. Please do so before proceeding.')).toBeVisible();
    });

    await test.step('login with Ghost', async () => {
      await page.getByRole('button', { name: 'Log In' }).click();
      await page.getByRole('button', { name: 'UTS' }).click();
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.locator('[name="ticket"]').selectOption('Ghost');
      await page.getByRole('button', { name: 'Ok' }).click();
      await new MaterialPO(page).checkAndCloseAlert('User does not exists.');
    });

    await use(page);
  },
});

test.afterEach(async ({ page }, testInfo) => {
  await codeCoverage(page, testInfo);
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