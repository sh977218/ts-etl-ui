import {test, expect} from '@playwright/test';

test.describe('e2e test', async () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/');
  })

  test('check flow', async ({page}) => {
    // Expect a title "to contain" a substring.
    await test.step('has title', async () => {
      await expect(page).toHaveTitle('TS ETL UI');
    })
    await test.step('has login required message', async () => {
      await expect(page.getByRole('heading').getByText('his application requires you to log in. Please do so before proceeding.')).toBeVisible()
    })

    await test.step('login', async () => {
      await page.getByRole('button', {name: 'Log In'}).click();
      await page.getByRole('link', {name: 'UTS'}).click();

      await expect(page.getByRole('tab', {name: 'Load Request'})).toBeVisible();
      await expect(page.getByRole('tab', {name: 'Version QA'})).toBeVisible();
      await expect(page.getByRole('tab', {name: 'Code System'})).toBeVisible();

      await expect(page.getByRole('button', {name: 'Search'})).toBeVisible();
      await expect(page.getByRole('button', {name: 'Reset'})).toBeVisible();
      await expect(page.getByRole('button', {name: 'Create Request'})).toBeVisible();
      await expect(page.getByRole('button', {name: 'Download'})).toBeVisible();
    })
  })
});
