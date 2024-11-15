import { expect } from '@playwright/test';

import { test } from '../fixture/baseFixture';

test.use({ baseURL: 'http://localhost:4200' });
test('LR detail on localhost 4200', async ({ page }) => {
  let numOfLrApiCalled = 0;
  let numOfLvApiCalled = 0;
  
  await page.goto('/');
  await page.getByRole('button', { name: 'Log In' }).click();
  await page.getByRole('link', { name: 'UTS' }).click();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.locator('[name="ticket"]').selectOption('Peter');
  await page.getByRole('button', { name: 'Ok' }).click();
  await page.waitForURL(/load-requests/);
  await expect(page.getByRole('button', { name: 'Download' })).toBeVisible();

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
