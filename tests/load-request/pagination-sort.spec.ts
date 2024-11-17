import { test } from '../fixture/baseFixture';
import { expect } from '@playwright/test';

test.use({ accountUsername: 'peter' });
test('Pagination and Sort', async ({ page, materialPage }) => {
  const rows = page.locator('table tbody tr');

  await test.step(`Go to next page`, async () => {
    await page.getByRole('button', { name: 'Next page' }).click();
    await materialPage.matDialog().waitFor({ state: 'hidden' });
    await expect(rows).toHaveCount(10);

    await expect(page).toHaveURL(/pageNum=2/);
    await expect(page).toHaveURL(/pageSize=10/);
  });

  await test.step(`Change sort`, async () => {
    await page.getByRole('columnheader', { name: 'Request ID' }).click();
    await materialPage.matDialog().waitFor({ state: 'hidden' });
    await expect(rows).toHaveCount(10);

    await test.step('page size remain the same', async () => {
      await expect(page).toHaveURL(/pageSize=10/);
    });
    await test.step('page number reset to 1', async () => {
      await expect(page).toHaveURL(/pageNum=1/);
    });
    await expect(page).toHaveURL(/sortBy=opRequestSeq/);
  });

  await test.step(`Change page size`, async () => {
    await page.getByRole('combobox', { name: '10' }).click();
    await materialPage.matOption().filter({ hasText: `50` }).click();
    await materialPage.matDialog().waitFor({ state: 'hidden' });
    await expect(rows).toHaveCount(50);

    await test.step('sort remain the same', async () => {
      await expect(page).toHaveURL(/sortBy=opRequestSeq/);
    });
    await test.step('page number reset to 1', async () => {
      await expect(page).toHaveURL(/pageNum=1/);
    });
    await expect(page).toHaveURL(/pageSize=50/);
  });
});