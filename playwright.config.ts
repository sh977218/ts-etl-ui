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
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 3 : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

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
    baseURL: process.env['CI'] ? 'http://localhost:3000' : 'http://localhost:4200',
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
      name: 'load-request',
      testMatch: ['load-request.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'load-version',
      testMatch: ['load-version.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'code-system',
      testMatch: ['code-system.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'ts-etl-ui',
      use: {
        ...devices['Desktop Chrome'],
      },
      dependencies: ['load-request', 'load-version', 'code-system'],
    },
    {
      name: 'ts-etl-ui',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: process.env['CI'] ? 'npm run start:coverage' : 'npm run serve:coverage',
    port: process.env['CI'] ? 3000 : 4200,
    reuseExistingServer: true,
  },
});
