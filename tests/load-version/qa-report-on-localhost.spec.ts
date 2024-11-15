import { expect, test } from '@playwright/test';

test.use({ baseURL: 'http://localhost:4200' });
test('QA report on localhost 4200', async ({ page }) => {
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

  await page.goto('http://localhost:4200/load-version-report/0');
  const row = 'app-load-version-report-rule tbody tr:nth-of-type(2)';
  await expect(page.locator(row)).toContainText('Code.DuplicateCode');

  expect(numOfLrApiCalled).toEqual(1);
  expect(numOfLvApiCalled).toEqual(1);
});
