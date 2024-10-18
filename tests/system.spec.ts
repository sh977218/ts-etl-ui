import test from './baseFixture';
import { expect } from '@playwright/test';

test.describe('System testing -', async () => {

  test('Not Logged in', async ({ page }) => {
    await page.goto('/load-requests');
    await page.getByLabel('user menu').click();
    await page.getByRole('menuitem', { name: 'Log Out' }).click();
    await expect(page.locator('body')).toContainText('This application requires you to log in');
    await page.goto('/load-requests');
    await expect(page.locator('body')).toContainText('This application requires you to log in');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page.locator('mat-dialog-container')).toContainText('Login with Following');
    await page.locator('button', { hasText: 'Close' });
    await expect(page.locator('body')).toContainText('This application requires you to log in');
  });

  test('Invalid User', async ({ page, materialPo }) => {
    await page.goto('/load-requests');
    await page.getByLabel('user menu').click();
    await page.getByRole('menuitem', { name: 'Log Out' }).click();
    await expect(page.locator('body')).toContainText('This application requires you to log in');
    await page.goto('/login-cb?ticket=bogusTicket');
    await materialPo.checkAndCloseAlert('Unable to log in');
    await expect(page.locator('body')).toContainText('This application requires you to log in');
  });

  test('Missing Ticket', async ({ page, materialPo }) => {
    await page.goto('/load-requests');
    await page.goto('/login-cb');
    await materialPo.checkAndCloseAlert('Unable to log in');
  });

  test(`Global api error handler @smoke`, async ({ page, materialPo }) => {
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
    await materialPo.checkAndCloseAlert('Something wrong');
  });

  test.describe('JWT fail', async () => {
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