import { expect } from '@playwright/test';

import { test } from '../fixture/baseFixture';

test.use({ accountUsername: 'Christophe' });
test('Version QA Report', async ({ page, materialPage }) => {
  await page.getByRole('link', { name: 'Version QA' }).click();

  await expect(page.getByRole('table').locator('tbody tr')).not.toHaveCount(0);

  await page.locator('tbody tr td .fake-link').nth(1).click();

  await test.step(`Open QA Report page`, async () => {
    const [qaReportPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.getByRole('link', { name: 'Go to QA Report' }).click(),
    ]);
    await expect(qaReportPage).toHaveTitle(`Version QA Report`);
  });
});