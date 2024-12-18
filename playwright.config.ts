import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  testMatch: ['*.spec.ts'],
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
  /* Run tests in files in parallel */
  fullyParallel: true,
  timeout: 90000,
  expect: {
    timeout: 5000,
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  retries: 0,

  workers: process.env.CI ? 3 : parseInt(process.env.PW_WORKERS ?? '1', 10),

  reporter: [
    ['blob'],
    ['html'],
  ],

  use: {
    actionTimeout: 5000,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    headless: !!process.env['CI'],
    launchOptions: {
      slowMo: 500,
    },
    screenshot: 'on',
    video: 'on',
    trace: 'on',
    browserName: 'chromium',
    ignoreHTTPSErrors: true,
    baseURL: process.env['CI'] ? 'http://localhost:3000' : process.env.PW_BASE_URL ?? 'http://localhost:4200',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'debug',
      grep: [/@smoke/, /@debug/],
      use: {
        video: 'on',
        trace: 'on',
        screenshot: 'on',
      },
    },
    {
      name: 'ts-etl-ui',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'load-request',
      testDir: './tests/load-request',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'load-version',
      testDir: './tests/load-version',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'code-system',
      testDir: './tests/code-system',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'load-request-nlm',
      testDir: './tests/load-request',
      use: {
        baseURL: 'https://tsdata-dev.nlm.nih.gov/portal-frontend',
        ...devices['Desktop Chrome'],
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    ...!process.env.NLM ? [
      {
        command: process.env['CI'] ? `npm run start:coverage` : `npm run start`,
        port: 3000,
        reuseExistingServer: true,
      },
      {
        command: 'npm run serve',
        port: 4200,
        reuseExistingServer: true,
      }] : [],
  ],
});
