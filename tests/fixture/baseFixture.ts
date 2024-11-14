import { test as baseTest, expect, Page, ConsoleMessage, TestInfo, Locator } from '@playwright/test';
import { randomBytes } from 'crypto';
import { writeFileSync } from 'fs';
import { join } from 'path';
import * as jwt from 'jsonwebtoken';

import { NYC_OUTPUT_FOLDER, User } from '../CONSTANT';
import { MaterialPage } from './material-page';

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


const SECRET_TOKEN = process.env.SECRET_TOKEN || 'some-secret';
const userNameMap: Record<string, User> = {
  'peter': {
    sub: 'peterhuang',
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
    sub: 'ludetc',
    email: 'christophe.ludet@nih.gov',
    role: 'Admin',
  },
};

const test = baseTest.extend<{
  materialPage: MaterialPage,
  accountUsername: string,
  byPassLogin: boolean,
}>({
  materialPage: async ({ page, baseURL }, use) => {
    await use(new MaterialPage(page));
  },
  accountUsername: '',
  byPassLogin: true,
  page: async ({ page, accountUsername, byPassLogin, baseURL }, use, testInfo) => {
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
        url: baseURL,
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
          await page.locator('[name="ticket"]').selectOption(userNameMap[accountUsername.toLowerCase()].sub);
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