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

  retries: 0,
  maxFailures: 3,
  workers: 1,

  reporter: [
    ['html'],
    ['blob'],
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
    baseURL: 'https://tsdata-dev.nlm.nih.gov/portal-frontend',
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
        browserName: 'chromium',
      },
    },
    {
      name: 'ts-etl-ui',
      grep: [/@smoke/, /@debug/],
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
