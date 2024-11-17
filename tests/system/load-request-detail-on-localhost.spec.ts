import { expect } from '@playwright/test';

import { test } from '../fixture/baseFixture';

test.use({ accountUsername: 'peter', baseURL: 'http://localhost:4200' });
test('LR detail on localhost 4200', async ({ page }) => {
  let numOfLrApiCalled = 0;
  let numOfLvApiCalled = 0;

  await page.route(/load-request\/\d$/, async route => {
    await page.waitForTimeout(2000);
    if (route.request().resourceType() === 'xhr') {
      numOfLrApiCalled++;
    }
    await route.continue();
  });
  await page.route(/loadVersion\/\d$/, async route => {
    await page.waitForTimeout(2000);
    if (route.request().resourceType() === 'xhr') {
      numOfLvApiCalled++;
    }
    await route.continue();
  });

  await page.goto('/load-request/0');
  const row = 'app-load-component-message tbody tr:nth-of-type(2)';
  await expect(page.locator(row)).toContainText('MISSING_DATA_FILE');

  expect(numOfLrApiCalled).toEqual(1);
  expect(numOfLvApiCalled).toEqual(0);
});
