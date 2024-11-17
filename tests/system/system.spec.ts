import { expect } from '@playwright/test';

import { test } from '../fixture/baseFixture';

test.describe('System testing -', async () => {
  test.use({ byPassLogin: false });
  test('Not Logged in', async ({ page }) => {
    await expect(page.locator('body')).toContainText('This application requires you to log in');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page.locator('mat-dialog-container')).toContainText('Login with Following');
    await page.locator('button', { hasText: 'Close' });
    await expect(page.locator('body')).toContainText('This application requires you to log in');
  });

  test('Invalid User', async ({ page, materialPage }) => {
    await page.goto('/login-cb?ticket=bogusTicket');
    await materialPage.checkAndCloseAlert('Unable to log in');
    await expect(page.locator('body')).toContainText('This application requires you to log in');
  });

  test('Missing Ticket', async ({ page, materialPage }) => {
    await page.goto('/login-cb');
    await materialPage.checkAndCloseAlert('Unable to log in');
  });
  test.describe('JWT fail', async () => {
    test.use({ byPassLogin: false });
    test('Jwt Fail', async ({ page }) => {
      await page.route('**/login', route => {
        route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({}),
        });
      });
      await page.goto('/load-requests');
      await expect(page.locator('body')).toContainText('This application requires you to log in');
    });

    test('Incorrect Jwt', async ({ page, context }) => {
      await context.addCookies([{ name: 'Bearer', value: 'bogusJwt', domain: 'localhost', path: '/' }]);
      await page.goto('/load-requests');
      await expect(page.locator('body')).toContainText('This application requires you to log in');
    });
  });
});

test.describe(`error handler`, async () => {
  test.use({ accountUsername: 'peter' });
  test(`Global api error handler`, async ({ page, materialPage }) => {
    await page.route('**/property/request-types', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Something wrong',
        }),
      });
    });
    await page.goto('/load-requests');
    await materialPage.checkAndCloseAlert('Something wrong');
  });
});

