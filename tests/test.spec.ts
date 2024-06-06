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
      await page.getByRole('button', {name: 'UTS'}).click();
    })

    await test.step('Load Request Tab', async () => {
      await expect(page.getByRole('tab', {name: 'Load Request'})).toBeVisible();

      await expect(page.getByRole('button', {name: 'Search'})).toBeVisible();
      await expect(page.getByRole('button', {name: 'Reset'})).toBeVisible();
      await expect(page.getByRole('button', {name: 'Create Request'})).toBeVisible();
      await expect(page.getByRole('button', {name: 'Download'})).toBeVisible();

      await expect(page.getByRole('table').locator('tbody tr.example-element-row')).toHaveCount(10)
      await expect(page.getByRole('table').locator('tbody tr.example-detail-row')).toHaveCount(10)
    })
    await test.step('Version QA Tab', async () => {
      await page.getByRole('tab', {name: 'Version QA'}).click();

      await expect(page.getByRole('button', {name: 'Search'})).toBeHidden();
      await expect(page.getByRole('button', {name: 'Reset'})).toBeHidden();
      await expect(page.getByRole('button', {name: 'Create Request'})).toBeHidden();
      await expect(page.getByRole('button', {name: 'Download'})).toBeHidden();

      await expect(page.getByRole('table').locator('tbody tr')).not.toHaveCount(0)
    })
    await test.step('Code System Tab', async () => {
      await page.getByRole('tab', {name: 'Code System'}).click()

      // @todo be implemented
      await expect(page.getByRole('table').locator('tbody tr')).toHaveCount(0)
    })
  })
});
