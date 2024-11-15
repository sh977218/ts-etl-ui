import { test as baseTest, expect, Page, ConsoleMessage, TestInfo, Locator } from '@playwright/test';
import { randomBytes } from 'crypto';
import { writeFileSync } from 'fs';
import { join } from 'path';
import * as jwt from 'jsonwebtoken';

import { CreateLoadRequest, EU_TIMEZONE, MAT_MONTH_MAP, MatDate, NYC_OUTPUT_FOLDER, User } from '../CONSTANT';
import { MaterialPage } from './material-page';
import { CreateLoadRequestPage } from './create-load-request-page';

async function codeCoverage(page: Page, testInfo: TestInfo) {
  const coverage: string = await page.evaluate(
    'JSON.stringify(window.__coverage__);',
  );
  if (coverage) {
    const name = randomBytes(32).toString('hex');
    const nycOutputFileName = join(NYC_OUTPUT_FOLDER, `${name}`);
    await writeFileSync(nycOutputFileName, coverage);
  } else {
    throw new Error(`No coverage found for ${testInfo.testId}`);
  }
}

const EXPECTED_CONSOLE_LOGS: string[] = ['[webpack-dev-server]'];
const UNEXPECTED_CONSOLE_LOGS: string[] = [];

const SECRET_TOKEN = process.env.SECRET_TOKEN || 'some-secret';
const userNameMap: Record<string, User> = {
  'peter': {
    username: 'peterhuang',
    userId: 5,
    firstName: 'Peter',
    lastName: 'Huang',
    email: 'shi.huang@nih.gov',
    role: 'Admin',
  },
  'christophe': {
    userId: 6,
    firstName: 'Christophe',
    lastName: 'Ludet',
    username: 'ludetc',
    email: 'christophe.ludet@nih.gov',
    role: 'Admin',
  },
};

export const test = baseTest.extend<{
  materialPage: MaterialPage,
  accountUsername: string,
  byPassLogin: boolean,
  createLoadRequest: CreateLoadRequest | null,
  createLoadRequestPage: CreateLoadRequestPage
}>({
  page: async ({ page, accountUsername, byPassLogin, createLoadRequest, baseURL }, use, testInfo) => {
    page.on('console', (consoleMessage: ConsoleMessage) => {
      if (consoleMessage) {
        UNEXPECTED_CONSOLE_LOGS.push(consoleMessage.text());
      }
    });
    if (byPassLogin) {
      const payload = userNameMap[accountUsername.toLowerCase()];
      const cookies = [{
        name: 'Bearer',
        value: jwt.sign(payload, SECRET_TOKEN),
        path: '/',
        domain: 'localhost',
      }];
      await page.context().addCookies(cookies);
    }
    await page.goto('/');
    if (!byPassLogin) {
      await test.step('has title', async () => {
        await expect(page).toHaveTitle('Please Log In');
      });
      await test.step('has login required message', async () => {
        await expect(page.getByRole('heading').getByText('his application requires you to log in. Please do so before proceeding.')).toBeVisible();
      });
      if (accountUsername) {
        await test.step('login', async () => {
          await page.getByRole('button', { name: 'Log In' }).click();
          await page.getByRole('link', { name: 'UTS' }).click();
          await page.getByRole('button', { name: 'Sign in' }).click();
          await page.locator('[name="ticket"]').selectOption(userNameMap[accountUsername.toLowerCase()].firstName);
          await page.getByRole('button', { name: 'Ok' }).click();
          await page.waitForURL(`${baseURL}/load-requests`);
        });
      }
    }
    await use(page);
    if (!!process.env['CI'] || process.env['COVERAGE']) {
      await codeCoverage(page, testInfo);
    }
  },
  materialPage: async ({ page, baseURL }, use) => {
    await use(new MaterialPage(page));
  },
  accountUsername: '',
  byPassLogin: true,
  createLoadRequest: null,
  createLoadRequestPage: async ({ page, materialPage, createLoadRequest }, use) => {
    if (createLoadRequest) {
      const matDialog = materialPage.matDialog();

      await page.getByRole('button', { name: 'Create Request' }).click();
      await matDialog.waitFor();
      await matDialog.getByLabel('Code System Name').click();
      /**
       * mat-option is not attached to modal, it appends to end of app root tag, so using page instead of `matDialog`.
       */
      await page.getByRole('option', { name: createLoadRequest.codeSystemName }).click();
      await matDialog.getByLabel('Request Subject').fill(createLoadRequest.requestSubject);
      await matDialog.getByLabel('Source File Path').fill(createLoadRequest.sourceFilePath);

      await matDialog.getByRole('radio', { name: createLoadRequest.requestType }).check();
      if (createLoadRequest.requestType === 'Scheduled') {
        await matDialog.getByRole('button', { name: 'Open calendar' }).click();
        await page.locator(`mat-calendar`).waitFor();
        if (createLoadRequest.scheduledDate === 'today') {
          await page.locator('.mat-calendar-body-cell.mat-calendar-body-active').click();
        } else {
          await materialPage.selectMatDate(createLoadRequest.scheduledDate as MatDate);
        }
        await page.locator(`mat-calendar`).waitFor({ state: 'hidden' });
        await matDialog.getByRole('combobox', { name: 'Scheduled time' }).click();
        await page.getByRole('option', { name: createLoadRequest.scheduledTime }).click();
      }
      if (createLoadRequest.notificationEmail) {
        await matDialog.getByLabel('Notification Email').fill(createLoadRequest.notificationEmail);
      }
      await matDialog.getByRole('button', { name: 'Submit' }).click();
      await matDialog.waitFor({ state: 'hidden' });
      await materialPage.checkAndCloseAlert(/Request \(ID: \d+\) created successfully/);
    }
    await use(new CreateLoadRequestPage(page));
  },

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
